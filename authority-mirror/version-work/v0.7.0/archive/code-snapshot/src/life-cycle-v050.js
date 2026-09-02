import {
  V020_STORAGE_KEY,
  V031_STORAGE_KEY,
  V040_RULE_REFERENCES,
  V040_STORAGE_KEY,
  normalizeDeathSaveState,
  normalizeV040Session,
  pcLifePhase,
  validateV040Envelope,
} from './life-cycle-v040.js';

export const V050_SESSION_SCHEMA_VERSION = '0.4.1';
export const V050_DELIVERY_VERSION = '0.5.0';
// Amendment 03 introduces cross-battle control timing.  It deliberately writes
// to a successor key so an existing v0.5.0 session remains an untouched source
// for copy-on-write recovery.
export const V050_PRE_AMENDMENT_STORAGE_KEY = 'dnd-terminal.v0.5.0.session.current';
export const V050_STORAGE_KEY = 'dnd-terminal.v0.5.0.controlled-entities.session.current';

const copy = value => globalThis.structuredClone ? globalThis.structuredClone(value) : JSON.parse(JSON.stringify(value));
const conditionList = value => [...new Set((Array.isArray(value) ? value : []).filter(item => typeof item === 'string' && item.trim()).map(item => item.trim()))];

function capture(combatant) {
  return {
    hp: combatant.hp,
    tempHp: combatant.tempHp || 0,
    lifePhase: pcLifePhase(combatant),
    lifeStatus: combatant.lifeStatus,
    conditions: conditionList(combatant.conditions),
    deathSaves: normalizeDeathSaveState(combatant.deathSaves),
    deathRecord: copy(combatant.deathRecord || null),
  };
}

export function normalizeV050Session(session, { legacy = false } = {}) {
  const next = normalizeV040Session(session, { legacy });
  next.schemaVersion = V050_SESSION_SCHEMA_VERSION;
  next.ui = { ...(next.ui || {}), startupRecoveryRequired: false };
  next.controlledEntityProjections = Array.isArray(next.controlledEntityProjections) ? next.controlledEntityProjections : [];
  return next;
}

export function createV050Envelope(session, { exportedAt } = {}) {
  const normalized = normalizeV050Session(session);
  return {
    schemaVersion: V050_SESSION_SCHEMA_VERSION,
    appVersion: V050_SESSION_SCHEMA_VERSION,
    deliveryVersion: V050_DELIVERY_VERSION,
    exportedAt,
    session: normalized,
    checksum: `events:${Array.isArray(normalized.events) ? normalized.events.length : 0}`,
  };
}

export function validateV050Envelope(data, id, timestamp) {
  if (!data || !data.session || !Array.isArray(data.session.events)) throw new Error('导入失败：缺少完整的会话 Envelope 或事件日志。');
  const schema = data.schemaVersion || data.session.schemaVersion;
  if (schema === V050_SESSION_SCHEMA_VERSION || schema === '0.4.0') {
    if (!Array.isArray(data.session.combatants) || !data.session.settings || !data.session.encounter) throw new Error('导入失败：当前会话缺少战斗或遭遇状态。');
    for (const combatant of data.session.combatants.filter(item => item?.kind === 'character')) {
      const phase = pcLifePhase(combatant);
      if (phase === 'active' && !(combatant.hp > 0)) throw new Error('导入失败：active PC 必须具有正 HP。');
      if (['dying','stable','dead','needs-review'].includes(phase) && combatant.hp !== 0) throw new Error('导入失败：0 HP 生命周期阶段与 HP 不一致。');
    }
    return {
      ...data,
      schemaVersion: V050_SESSION_SCHEMA_VERSION,
      appVersion: V050_SESSION_SCHEMA_VERSION,
      deliveryVersion: data.deliveryVersion || V050_DELIVERY_VERSION,
      ...(schema === V050_SESSION_SCHEMA_VERSION ? {} : { migratedFromSchemaVersion:schema }),
      session: normalizeV050Session(data.session),
    };
  }
  const prior = validateV040Envelope(data, id, timestamp);
  return {
    ...prior,
    schemaVersion: V050_SESSION_SCHEMA_VERSION,
    appVersion: V050_SESSION_SCHEMA_VERSION,
    deliveryVersion: V050_DELIVERY_VERSION,
    migratedFromSchemaVersion: schema,
    session: normalizeV050Session(prior.session, { legacy: schema !== '0.3.0' }),
  };
}

export function chooseV050StartupSession(storage, id, timestamp) {
  const currentRaw = storage.getItem(V050_STORAGE_KEY);
  if (currentRaw !== null) {
    try { return { kind:'current', session:validateV050Envelope(JSON.parse(currentRaw), id, timestamp).session, shouldPersist:false }; }
    catch (error) { return { kind:'blocked-corrupt-current', error, raw:currentRaw, session:null, shouldPersist:false }; }
  }
  for (const key of [V050_PRE_AMENDMENT_STORAGE_KEY, V040_STORAGE_KEY, V031_STORAGE_KEY, V020_STORAGE_KEY]) {
    const raw = storage.getItem(key);
    if (raw === null) continue;
    try { return { kind:'migrated-legacy-copy', sourceKey:key, session:validateV050Envelope(JSON.parse(raw), id, timestamp).session, shouldPersist:true }; }
    catch (error) { return { kind:'blocked-corrupt-legacy', sourceKey:key, error, raw, session:null, shouldPersist:false }; }
  }
  return { kind:'empty', session:null, shouldPersist:false };
}

export function returnPcToLife(combatant, {
  hp,
  basisStatus,
  basisLabel,
  soulReturn,
  effectDisposition,
  conditionHandling,
  mapOutcome,
  initiativeOutcome,
  reason,
  resolutionId,
  round = null,
} = {}) {
  if (combatant?.kind !== 'character' || pcLifePhase(combatant) !== 'dead' || combatant.hp !== 0) throw new Error('只有已死亡的 0 HP PC 可以记录复活。');
  if (!['verified-entry', 'dm-ruling', 'unverified'].includes(basisStatus)) throw new Error('必须记录复活依据状态。');
  if (!String(basisLabel || '').trim()) throw new Error('必须记录复活依据标签。');
  if (!['confirmed', 'not-applicable'].includes(soulReturn)) throw new Error('必须确认灵魂返回，或明确标记为不适用。');
  if (!String(effectDisposition || '').trim()) throw new Error('必须记录状态、疾病、诅咒与力竭的 DM 处理结果。');
  if (!['preserve', 'clear'].includes(conditionHandling)) throw new Error('必须选择当前战斗状态的处理方式。');
  if (mapOutcome !== 'restore-original-token') throw new Error('S1 只能记录保留并恢复原尸体棋子为原实例。');
  if (initiativeOutcome !== 'restore-original-slot') throw new Error('S1 只能记录恢复原实例的先攻槽位。');
  if (!String(reason || '').trim()) throw new Error('必须记录 DM 复活原因。');
  if (!String(resolutionId || '').trim()) throw new Error('必须记录复活裁定 ID。');
  const nextHp = Math.floor(Number(hp));
  if (!Number.isInteger(nextHp) || nextHp < 1 || nextHp > combatant.maxHp) throw new Error('复活后的 HP 必须为 1 至最大 HP 的整数。');

  const before = capture(combatant);
  combatant.hp = nextHp;
  combatant.tempHp = 0;
  combatant.lifePhase = 'active';
  combatant.lifeStatus = 'alive';
  combatant.deathSaves = { successes:0, failures:0, history:[...(normalizeDeathSaveState(combatant.deathSaves).history || [])] };
  const preserved = conditionList(combatant.conditions).filter(condition => condition !== 'unconscious');
  combatant.conditions = conditionHandling === 'clear' ? [] : preserved;
  const priorDeath = copy(combatant.deathRecord || {});
  const resolution = {
    resolutionId: String(resolutionId),
    type: 'pc-return-to-life',
    round,
    basisStatus,
    basisLabel: String(basisLabel).trim(),
    soulReturn,
    effectDisposition: String(effectDisposition).trim(),
    conditionHandling,
    reason: String(reason).trim(),
    hp: nextHp,
    mapOutcome,
    initiativeOutcome,
  };
  combatant.deathRecord = { ...priorDeath, resolutions:[...(priorDeath.resolutions || []), resolution], latestResolutionId:resolution.resolutionId };
  return {
    before,
    after: capture(combatant),
    input: resolution,
    outcome: 'returned-to-life',
    rulesReference: [V040_RULE_REFERENCES.deathSaves],
  };
}
