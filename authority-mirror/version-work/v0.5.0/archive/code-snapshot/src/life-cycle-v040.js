import { normalizeV020Lifecycle, validateImportedEnvelope } from './encounter.js';

export const V040_SESSION_SCHEMA_VERSION = '0.3.0';
export const V040_DELIVERY_VERSION = '0.4.0';
export const V040_STORAGE_KEY = 'dnd-terminal.v0.4.0.session.current';
export const V031_STORAGE_KEY = 'dnd-terminal.v0.3.0-m1-s5.session.current';
export const V020_STORAGE_KEY = 'dnd-terminal.v0.2.0.session.current';

export const V040_RULE_REFERENCES = Object.freeze({
  zeroHp: 'PHB2024-local:Lore_01:21263-21317',
  deathSaves: 'PHB2024-local:Lore_01:35886-35895',
  stable: 'PHB2024-local:Lore_01:36218-36221',
  unconscious: 'PHB2024-local:Lore_01:36774-36783',
  prone: 'PHB2024-local:Lore_01:36751-36756',
});

const copy = value => globalThis.structuredClone ? globalThis.structuredClone(value) : JSON.parse(JSON.stringify(value));
const LIFE_PHASES = new Set(['active', 'dying', 'stable', 'dead', 'needs-review']);
const LEGACY_LIFE_PHASE = Object.freeze({ alive:'active', unconscious:'dying', stable:'stable', dead:'dead', 'needs-review':'needs-review' });
const PHASE_LEGACY_STATUS = Object.freeze({ active:'alive', dying:'unconscious', stable:'stable', dead:'dead', 'needs-review':'needs-review' });
const conditionList = value => [...new Set((Array.isArray(value) ? value : []).filter(item => typeof item === 'string' && item.trim()).map(item => item.trim()))];

export function pcLifePhase(combatant) {
  return combatant?.lifePhase || LEGACY_LIFE_PHASE[combatant?.lifeStatus] || (combatant?.hp > 0 ? 'active' : 'needs-review');
}

export function hasCondition(combatant, condition) {
  return conditionList(combatant?.conditions).includes(condition);
}

function addCondition(combatant, condition) {
  combatant.conditions = conditionList([...(combatant.conditions || []), condition]);
}

function removeCondition(combatant, condition) {
  combatant.conditions = conditionList(combatant.conditions).filter(item => item !== condition);
}

function makeUnconscious(combatant) {
  addCondition(combatant, 'unconscious');
  addCondition(combatant, 'prone');
}

function wakePc(combatant) {
  removeCondition(combatant, 'unconscious');
}

function setLifePhase(combatant, phase) {
  combatant.lifePhase = phase;
  combatant.lifeStatus = PHASE_LEGACY_STATUS[phase];
}

export function emptyDeathSaveState() {
  return { successes: 0, failures: 0, history: [] };
}

export function normalizeDeathSaveState(value) {
  return {
    successes: Math.max(0, Math.min(2, Math.trunc(Number(value?.successes) || 0))),
    failures: Math.max(0, Math.min(2, Math.trunc(Number(value?.failures) || 0))),
    history: Array.isArray(value?.history) ? copy(value.history) : [],
  };
}

function hasExplicitLifeEvidence(combatant) {
  return Object.prototype.hasOwnProperty.call(combatant || {}, 'deathSaves')
    || LIFE_PHASES.has(combatant?.lifePhase)
    || ['unconscious', 'stable', 'dead', 'needs-review'].includes(combatant?.lifeStatus);
}

export function normalizeV040Combatant(combatant, { legacy = false } = {}) {
  const next = copy(combatant);
  if (next.kind !== 'character') return next;
  const explicit = hasExplicitLifeEvidence(combatant);
  next.deathSaves = normalizeDeathSaveState(next.deathSaves);
  next.conditions = conditionList(next.conditions);
  if (legacy && next.hp === 0 && !explicit) setLifePhase(next, 'needs-review');
  else if (next.hp > 0 && pcLifePhase(next) !== 'dead') setLifePhase(next, 'active');
  else if (!LIFE_PHASES.has(pcLifePhase(next))) setLifePhase(next, next.hp === 0 ? 'needs-review' : 'active');
  else setLifePhase(next, pcLifePhase(next));
  if (['dying', 'stable'].includes(next.lifePhase)) makeUnconscious(next);
  if (next.lifePhase === 'active') wakePc(next);
  return next;
}

export function normalizeV040Session(session, { legacy = false } = {}) {
  const next = normalizeV020Lifecycle(session);
  next.schemaVersion = V040_SESSION_SCHEMA_VERSION;
  next.combatants = (next.combatants || []).map(combatant => normalizeV040Combatant(combatant, { legacy }));
  next.ui = { ...(next.ui || {}), startupRecoveryRequired: false };
  return next;
}

export function createV040Envelope(session, { exportedAt } = {}) {
  const normalized = normalizeV040Session(session);
  return {
    schemaVersion: V040_SESSION_SCHEMA_VERSION,
    appVersion: V040_SESSION_SCHEMA_VERSION,
    deliveryVersion: V040_DELIVERY_VERSION,
    exportedAt,
    session: normalized,
    checksum: `events:${Array.isArray(normalized.events) ? normalized.events.length : 0}`,
  };
}

export function validateV040Envelope(data, id, timestamp) {
  if (!data || !data.session || !Array.isArray(data.session.events)) throw new Error('导入失败：缺少完整的会话 Envelope 或事件日志。');
  const schema = data.schemaVersion || data.session.schemaVersion;
  if (schema === V040_SESSION_SCHEMA_VERSION) {
    if (!Array.isArray(data.session.combatants) || !data.session.settings || !data.session.encounter) throw new Error('导入失败：v0.3.0 会话缺少战斗或遭遇状态。');
    for (const combatant of data.session.combatants.filter(item => item?.kind === 'character')) {
      const phase = pcLifePhase(combatant);
      if (!LIFE_PHASES.has(phase) || !combatant.deathSaves || !Array.isArray(combatant.deathSaves.history)) throw new Error('导入失败：v0.3.0 PC 缺少有效生命阶段或死亡豁免轨迹。');
      if (phase === 'active' && !(combatant.hp > 0)) throw new Error('导入失败：active PC 必须具有正 HP。');
      if (['dying','stable','dead','needs-review'].includes(phase) && combatant.hp !== 0) throw new Error('导入失败：0 HP 生命周期阶段与 HP 不一致。');
    }
    return { ...data, schemaVersion:V040_SESSION_SCHEMA_VERSION, appVersion:V040_SESSION_SCHEMA_VERSION, deliveryVersion:data.deliveryVersion || V040_DELIVERY_VERSION, session:normalizeV040Session(data.session) };
  }
  if (schema !== '0.1.0' && schema !== '0.2.0') throw new Error('导入失败：仅接受 v0.1.0、v0.2.0 或 v0.3.0 Session Envelope Schema。');
  const legacyEnvelope = validateImportedEnvelope(data, id, timestamp);
  return {
    ...legacyEnvelope,
    schemaVersion: V040_SESSION_SCHEMA_VERSION,
    appVersion: V040_SESSION_SCHEMA_VERSION,
    deliveryVersion: V040_DELIVERY_VERSION,
    migratedFromSchemaVersion: schema,
    session: normalizeV040Session(legacyEnvelope.session, { legacy:true }),
  };
}

export function chooseStartupSession(storage, id, timestamp) {
  const currentRaw = storage.getItem(V040_STORAGE_KEY);
  if (currentRaw !== null) {
    try { return { kind:'current', session:validateV040Envelope(JSON.parse(currentRaw), id, timestamp).session, shouldPersist:false }; }
    catch (error) { return { kind:'blocked-corrupt-current', error, raw:currentRaw, session:null, shouldPersist:false }; }
  }
  for (const key of [V031_STORAGE_KEY, V020_STORAGE_KEY]) {
    const raw = storage.getItem(key);
    if (raw === null) continue;
    try { return { kind:'migrated-legacy-copy', sourceKey:key, session:validateV040Envelope(JSON.parse(raw), id, timestamp).session, shouldPersist:true }; }
    catch (error) { return { kind:'blocked-corrupt-legacy', sourceKey:key, error, raw, session:null, shouldPersist:false }; }
  }
  return { kind:'empty', session:null, shouldPersist:false };
}

export function turnDisposition(combatant, round) {
  const present = !!combatant
    && combatant.presenceStatus === 'on-field'
    && combatant.participationStatus === 'active'
    && !combatant.cleanupRemoved
    && (combatant.eligibleFromRound ?? 1) <= round;
  if (!present) return 'skip';
  if (combatant.kind === 'character') {
    const phase = pcLifePhase(combatant);
    if (['dead', 'stable', 'needs-review'].includes(phase)) return 'skip';
    if (phase === 'dying' && combatant.hp === 0) return 'death-save';
    if (phase === 'active' && combatant.hp > 0 && !hasCondition(combatant, 'unconscious')) return 'act';
    return 'skip';
  }
  const status = combatant?.lifeStatus || 'alive';
  if (['dead', 'transformed'].includes(status)) return 'skip';
  return combatant.hp > 0 && status === 'alive' ? 'act' : 'skip';
}

export function combatantHasTurnSlot(combatant, round) {
  return turnDisposition(combatant, round) !== 'skip';
}

function capture(combatant) {
  return { hp:combatant.hp, tempHp:combatant.tempHp || 0, lifePhase:pcLifePhase(combatant), conditions:conditionList(combatant.conditions), deathSaves:normalizeDeathSaveState(combatant.deathSaves), deathRecord:copy(combatant.deathRecord || null) };
}

function appendTrajectory(combatant, entry) {
  combatant.deathSaves = normalizeDeathSaveState(combatant.deathSaves);
  combatant.deathSaves.history.push(copy({ source:entry.source || 'dm-ui', eventId:entry.eventId || null, ...entry }));
}

export function applyPcDamage(combatant, amount, { critical = false, round = null, eventId = null } = {}) {
  if (combatant?.kind !== 'character') throw new Error('PC 0 HP 规则只适用于玩家角色。');
  if (['dead', 'needs-review'].includes(pcLifePhase(combatant))) throw new Error('当前生命阶段不能通过普通伤害流程修改。');
  const damage = Math.max(0, Math.floor(Number(amount) || 0));
  if (!damage) throw new Error('伤害必须为正整数。');
  const before = capture(combatant);
  const absorbed = Math.min(combatant.tempHp || 0, damage);
  combatant.tempHp = Math.max(0, (combatant.tempHp || 0) - absorbed);
  const hpDamage = damage - absorbed;
  let outcome = 'damaged';
  if (combatant.hp > 0) {
    const previousHp = combatant.hp;
    combatant.hp = Math.max(0, combatant.hp - hpDamage);
    const overflow = Math.max(0, hpDamage - previousHp);
    if (combatant.hp === 0 && overflow >= combatant.maxHp) {
      setLifePhase(combatant, 'dead'); outcome = 'massive-damage-death';
      combatant.deathRecord = { atRound:round, reason:'降至 0 HP 后剩余伤害达到 HP 上限', massiveDamage:overflow };
    } else if (combatant.hp === 0) {
      setLifePhase(combatant, 'dying'); makeUnconscious(combatant); combatant.deathSaves = emptyDeathSaveState(); outcome = 'fell-unconscious';
    }
  } else if (hpDamage > 0 && ['dying', 'stable'].includes(pcLifePhase(combatant))) {
    if (hpDamage >= combatant.maxHp) {
      setLifePhase(combatant, 'dead'); outcome = 'massive-damage-death';
      combatant.deathRecord = { atRound:round, reason:'0 HP 时单次伤害达到 HP 上限', massiveDamage:hpDamage };
    } else {
      setLifePhase(combatant, 'dying'); makeUnconscious(combatant);
      combatant.deathSaves = normalizeDeathSaveState(combatant.deathSaves);
      const failuresAdded = critical ? 2 : 1;
      const resultingFailures = combatant.deathSaves.failures + failuresAdded;
      appendTrajectory(combatant, { kind:'damage-at-zero', amount:hpDamage, critical:!!critical, failuresAdded, round, eventId, result:resultingFailures >= 3 ? 'dead' : 'unconscious' });
      if (resultingFailures >= 3) {
        setLifePhase(combatant, 'dead'); combatant.deathSaves.failures = 0; combatant.deathSaves.successes = 0; outcome = 'third-failure-death';
        combatant.deathRecord = { atRound:round, reason:'0 HP 受伤累计三次死亡豁免失败' };
      } else { combatant.deathSaves.failures = resultingFailures; outcome = critical ? 'two-failures' : 'one-failure'; }
    }
  }
  return { before, after:capture(combatant), input:{amount:damage,critical:!!critical,absorbed,hpDamage}, outcome, rulesReference:[V040_RULE_REFERENCES.zeroHp,V040_RULE_REFERENCES.deathSaves] };
}

export function recordDeathSave(combatant, roll, { round = null, eventId = null, source = 'dm-manual' } = {}) {
  if (combatant?.kind !== 'character' || pcLifePhase(combatant) !== 'dying' || combatant.hp !== 0 || !hasCondition(combatant, 'unconscious')) throw new Error('只有 0 HP 且昏迷的 PC 可以进行死亡豁免。');
  const d20 = Math.trunc(Number(roll));
  if (!Number.isInteger(d20) || d20 < 1 || d20 > 20) throw new Error('死亡豁免结果必须是 1 至 20 的最终 d20 点数。');
  const before = capture(combatant);
  combatant.deathSaves = normalizeDeathSaveState(combatant.deathSaves);
  let outcome;
  if (d20 === 20) { combatant.hp = 1; setLifePhase(combatant, 'active'); wakePc(combatant); outcome = 'natural-20-revive'; }
  else if (d20 === 1) { combatant.deathSaves.failures += 2; outcome = 'natural-1-two-failures'; }
  else if (d20 >= 10) { combatant.deathSaves.successes += 1; outcome = 'success'; }
  else { combatant.deathSaves.failures += 1; outcome = 'failure'; }
  if (combatant.deathSaves.failures >= 3) { setLifePhase(combatant, 'dead'); combatant.deathRecord = { atRound:round, reason:'第三次死亡豁免失败' }; outcome = 'third-failure-death'; }
  else if (combatant.deathSaves.successes >= 3) { setLifePhase(combatant, 'stable'); makeUnconscious(combatant); outcome = 'third-success-stable'; }
  const resolved = { successes:combatant.deathSaves.successes, failures:combatant.deathSaves.failures };
  appendTrajectory(combatant, { kind:'death-save', roll:d20, round, eventId, source, result:outcome, resulting:resolved });
  if (['active','stable','dead'].includes(pcLifePhase(combatant))) { combatant.deathSaves.successes = 0; combatant.deathSaves.failures = 0; }
  return { before, after:capture(combatant), input:{roll:d20,source}, outcome, rulesReference:[V040_RULE_REFERENCES.deathSaves,V040_RULE_REFERENCES.stable] };
}

export function medicallyStabilizePc(combatant, { helperId, checkTotal, actionSpent, round = null, eventId = null } = {}) {
  if (combatant?.kind !== 'character' || pcLifePhase(combatant) !== 'dying' || combatant.hp !== 0) throw new Error('只有 0 HP 且昏迷的 PC 可以接受医疗稳定。');
  if (!helperId) throw new Error('医疗稳定必须记录施救者。');
  if (!Number.isFinite(Number(checkTotal))) throw new Error('医疗稳定必须记录最终 Medicine 检定值。');
  if (actionSpent !== true) throw new Error('正常战斗内医疗稳定必须消耗施救者动作；越权请使用 DM 修正。');
  const before = capture(combatant);
  const success = Number(checkTotal) >= 10;
  appendTrajectory(combatant, { kind:'medical-stabilization', helperId, checkTotal:Number(checkTotal), actionSpent:true, round, eventId, result:success?'stable':'failed' });
  if (success) { setLifePhase(combatant, 'stable'); makeUnconscious(combatant); combatant.deathSaves.successes = 0; combatant.deathSaves.failures = 0; }
  return { before, after:capture(combatant), input:{helperId,checkTotal:Number(checkTotal),actionSpent:true}, outcome:success?'stable':'failed', rulesReference:[V040_RULE_REFERENCES.stable] };
}

export function healPc(combatant, amount, { round = null, eventId = null } = {}) {
  if (combatant?.kind !== 'character') throw new Error('PC 治疗流程只适用于玩家角色。');
  if (['dead', 'needs-review'].includes(pcLifePhase(combatant))) throw new Error('当前生命阶段不能通过普通治疗恢复。');
  const healing = Math.max(0, Math.floor(Number(amount) || 0));
  if (!healing) throw new Error('治疗量必须为正整数。');
  const before = capture(combatant);
  combatant.hp = Math.min(combatant.maxHp, combatant.hp + healing);
  if (combatant.hp > 0) { setLifePhase(combatant, 'active'); wakePc(combatant); }
  combatant.deathSaves = normalizeDeathSaveState(combatant.deathSaves);
  appendTrajectory(combatant, { kind:'positive-healing', amount:healing, round, eventId, result:'alive' });
  combatant.deathSaves.successes = 0; combatant.deathSaves.failures = 0;
  return { before, after:capture(combatant), input:{amount:healing}, outcome:'alive', rulesReference:[V040_RULE_REFERENCES.zeroHp] };
}

export function correctPcLifeState(combatant, { lifePhase, hp, reason, round = null, eventId = null } = {}) {
  if (combatant?.kind !== 'character') throw new Error('PC 生命状态修正只适用于玩家角色。');
  if (!reason?.trim()) throw new Error('DM 修正必须记录原因。');
  if (!LIFE_PHASES.has(lifePhase)) throw new Error('不支持该 PC 生命阶段修正。');
  const nextHp = Math.max(0, Math.min(combatant.maxHp, Math.floor(Number(hp) || 0)));
  if (lifePhase === 'active' && nextHp === 0) throw new Error('active 阶段必须具有正 HP。');
  if (['dying','stable','dead','needs-review'].includes(lifePhase) && nextHp !== 0) throw new Error('该阶段必须保持 0 HP。');
  const before = capture(combatant);
  combatant.hp = nextHp; setLifePhase(combatant, lifePhase); combatant.deathSaves = normalizeDeathSaveState(combatant.deathSaves);
  if (['dying','stable'].includes(lifePhase)) makeUnconscious(combatant);
  if (lifePhase === 'active') wakePc(combatant);
  if (['active','stable','dead'].includes(lifePhase)) { combatant.deathSaves.successes=0; combatant.deathSaves.failures=0; }
  appendTrajectory(combatant, { kind:'dm-correction', lifePhase, hp:nextHp, reason:reason.trim(), round, eventId, result:lifePhase });
  if (lifePhase === 'dead') combatant.deathRecord = { atRound:round, reason:`DM 修正：${reason.trim()}` };
  return { before, after:capture(combatant), input:{lifePhase,hp:nextHp,reason:reason.trim()}, outcome:lifePhase, rulesReference:[] };
}

export function standPcUp(combatant, { round = null, eventId = null } = {}) {
  if (combatant?.kind !== 'character' || pcLifePhase(combatant) !== 'active' || combatant.hp <= 0 || !hasCondition(combatant, 'prone')) throw new Error('只有正 HP 且倒地的 PC 可以起立。');
  const requiredMovement = Math.floor(Number(combatant.speed) / 2);
  if ((Number(combatant.movementRemaining) || 0) < requiredMovement) throw new Error('剩余移动力不足以起立。');
  const before = capture(combatant);
  combatant.movementRemaining -= requiredMovement;
  removeCondition(combatant, 'prone');
  return { before, after:capture(combatant), input:{requiredMovement}, outcome:'stood-up', rulesReference:[V040_RULE_REFERENCES.prone] };
}
