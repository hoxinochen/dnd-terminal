export const V020_SCHEMA_VERSION = '0.2.0';

const copy = value => globalThis.structuredClone ? globalThis.structuredClone(value) : JSON.parse(JSON.stringify(value));

export function normalizeInitiativeModifier(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : Math.trunc(Number(fallback) || 0);
}

// 现场投骰保存原始 d20、可编辑调整值与最终值；手填模式把输入视为最终先攻。
export function resolveInitiative({ mode = 'unconfigured', modifier = 0, roll = null, manualTotal = null } = {}) {
  const initiativeModifier = normalizeInitiativeModifier(modifier);
  if (mode === 'manual') {
    if (manualTotal === null || manualTotal === undefined || String(manualTotal).trim() === '') return { configured: false, mode: 'unconfigured', roll: null, modifier: initiativeModifier, total: null };
    const total = Number(manualTotal);
    return Number.isFinite(total)
      ? { configured: true, mode, roll: null, modifier: initiativeModifier, total: Math.trunc(total) }
      : { configured: false, mode: 'unconfigured', roll: null, modifier: initiativeModifier, total: null };
  }
  if (mode === 'roll') {
    const d20 = Number(roll);
    if (!Number.isFinite(d20) || d20 < 1 || d20 > 20) return { configured: false, mode: 'unconfigured', roll: null, modifier: initiativeModifier, total: null };
    const normalizedRoll = Math.trunc(d20);
    return { configured: true, mode, roll: normalizedRoll, modifier: initiativeModifier, total: normalizedRoll + initiativeModifier };
  }
  return { configured: false, mode: 'unconfigured', roll: null, modifier: initiativeModifier, total: null };
}

// 占位检测只处理二维地图的格子矩形；它不推导墙体、视线、掩护或规则上的移动合法性。
export function footprintFits(position, footprint, settings) {
  return position.x >= 0 && position.y >= 0
    && position.x + footprint.widthCells <= settings.width
    && position.y + footprint.heightCells <= settings.height;
}

export function footprintsOverlap(first, second) {
  return first.position.x < second.position.x + second.footprint.widthCells
    && first.position.x + first.footprint.widthCells > second.position.x
    && first.position.y < second.position.y + second.footprint.heightCells
    && first.position.y + first.footprint.heightCells > second.position.y;
}

export function firstFreeFootprintPosition(footprint, occupied, settings) {
  for (let y = 0; y <= settings.height - footprint.heightCells; y += 1) {
    for (let x = 0; x <= settings.width - footprint.widthCells; x += 1) {
      const candidate = { position: { x, y }, footprint };
      if (!occupied.some(other => footprintsOverlap(candidate, other))) return candidate.position;
    }
  }
  return null;
}

export function combatantCanAct(combatant, round) {
  return !!combatant
    && combatant.hp > 0
    && combatant.lifeStatus !== 'dead'
    && combatant.lifeStatus !== 'transformed'
    && combatant.presenceStatus === 'on-field'
    && combatant.participationStatus === 'active'
    && !combatant.cleanupRemoved
    && (combatant.eligibleFromRound ?? 1) <= round;
}

// 先攻推进只关心可行动资格；调用方负责在跨轮时处理效果到期和行动经济重置。
export function nextEligibleTurn(order, currentIndex, combatants, round) {
  const byId = new Map((combatants || []).map(combatant => [combatant.id, combatant]));
  if (!order?.length || !order.some(id => combatantCanAct(byId.get(id), round))) return { index: -1, round, waiting: true };
  let index = currentIndex;
  let nextRound = round;
  let steps = 0;
  do {
    index += 1;
    if (index >= order.length) { index = 0; nextRound += 1; }
    steps += 1;
  } while (steps <= order.length && !combatantCanAct(byId.get(order[index]), nextRound));
  return combatantCanAct(byId.get(order[index]), nextRound)
    ? { index, round: nextRound, waiting: false }
    : { index: -1, round: nextRound, waiting: true };
}

// 临时离场是一次明确的单场状态清理：当前 HP、资源、法术位和实例身份保留；
// 临时 HP、手工状态、目标身上的 Buff/Debuff，以及该单位维持的专注效果被移除。
export function clearTemporaryCombatState(session, combatantId) {
  const combatant = session.combatants.find(item => item.id === combatantId);
  if (!combatant) return { tempHp: 0, conditions: [], effects: [] };
  const cleared = {
    tempHp: combatant.tempHp || 0,
    conditions: [...(combatant.conditions || [])],
    effects: [],
  };
  combatant.tempHp = 0;
  combatant.conditions = [];
  session.effects = (session.effects || []).flatMap(effect => {
    const maintainedConcentration = effect.concentration && effect.sourceCombatantId === combatantId;
    const targeted = effect.targetIds?.includes(combatantId);
    if (!maintainedConcentration && !targeted) return [effect];
    if (!cleared.effects.includes(effect.name)) cleared.effects.push(effect.name);
    if (maintainedConcentration) return [];
    const targetIds = effect.targetIds.filter(id => id !== combatantId);
    return targetIds.length ? [{ ...effect, targetIds }] : [];
  });
  return cleared;
}

// 怪物/NPC 的死亡仅是本地 DM 记录：不实现角色死亡豁免、即时死亡或法术自动裁定。
export function declareCombatantDead(session, combatantId, detail = {}) {
  const combatant = session.combatants.find(item => item.id === combatantId);
  if (!combatant || combatant.lifeStatus === 'dead' || combatant.lifeStatus === 'transformed') return null;
  const cleared = clearTemporaryCombatState(session, combatantId);
  combatant.hp = 0;
  combatant.lifeStatus = 'dead';
  combatant.deathRecord = {
    atRound: detail.atRound ?? null,
    reason: detail.reason || 'HP 降至 0；DM 判定死亡',
    clearedTemporaryState: cleared,
    transformedIntoId: null,
  };
  return { combatant, cleared };
}

export const referenceTemplateSeeds = [
  { id:'ref-zombie', revision:1, sourceType:'reference', name:'丧尸', kind:'monster', relation:'enemy', alignment:'中立邪恶', size:'中型', armorClass:8, maxHp:15, speed:20, footprint:[1,1], actions:[{name:'猛击',category:'action'}], referenceActions:[{name:'猛击',category:'action',detail:'近战攻击：+3，触及5尺。命中：5（1d8+1）钝击伤害。'}], traits:[{name:'不死坚韧',detail:'当丧尸因非光耀、非重击伤害降至 0 HP 时，进行一次体质豁免，DC = 5 + 本次所受伤害；成功则改为降至 1 HP。',sourceType:'reference'}], resources:{}, note:'', sourceEntryId:'urn:uuid:c7b1265c-ee02-5eff-9cab-a44c896ce124', sourcePath:'怪物图鉴2025/亡灵/丧尸/丧尸.htm', sourceStatus:'local-private verified field evidence' },
  { id:'ref-skeleton', revision:1, sourceType:'reference', name:'骷髅', kind:'monster', relation:'enemy', alignment:'守序邪恶', size:'中型', armorClass:14, maxHp:13, speed:30, footprint:[1,1], actions:[{name:'短剑',category:'action'},{name:'短弓',category:'action'}], referenceActions:[{name:'短剑',category:'action',detail:'近战攻击：+5，触及5尺。命中：6（1d6+3）穿刺伤害。'},{name:'短弓',category:'action',detail:'远程攻击：+5，射程80/320尺。命中：6（1d6+3）穿刺伤害。'}], traits:[], resources:{}, note:'', sourceEntryId:'urn:uuid:d02b4d03-f7a4-5870-86c7-310a8b74e8dd', sourcePath:'怪物图鉴2025/亡灵/骷髅/骷髅.htm', sourceStatus:'local-private verified field evidence' },
  { id:'ref-goblin-minion', revision:1, sourceType:'reference', name:'地精喽啰', kind:'monster', relation:'enemy', alignment:'混乱中立', size:'小型', armorClass:12, maxHp:7, speed:30, footprint:[1,1], actions:[{name:'匕首',category:'action'},{name:'迅捷逃逸',category:'bonus'}], referenceActions:[{name:'匕首',category:'action',detail:'近战或远程攻击：+4，触及5尺或射程20/60尺。命中：4（1d4+2）穿刺伤害。'},{name:'迅捷逃逸',category:'bonus',detail:'附赠动作：执行撤离或躲藏。'}], traits:[], resources:{}, note:'', sourceEntryId:'urn:uuid:0644da66-e1cd-5385-b061-4616ea495cf9', sourcePath:'怪物图鉴2025/妖精/地精/地精喽啰.htm', sourceStatus:'local-private verified field evidence' },
  { id:'ref-ogre', revision:1, sourceType:'reference', name:'食人魔', kind:'monster', relation:'enemy', alignment:'混乱邪恶', size:'大型', armorClass:11, maxHp:68, speed:40, footprint:[2,2], actions:[{name:'巨棒',category:'action'},{name:'标枪',category:'action'}], referenceActions:[{name:'巨棒',category:'action',detail:'近战攻击：+6，触及5尺。命中：13（2d8+4）钝击伤害。'},{name:'标枪',category:'action',detail:'近战或远程攻击：+6，触及5尺或射程30/120尺。命中：11（2d6+4）穿刺伤害。'}], traits:[], resources:{}, note:'', sourceEntryId:'urn:uuid:724b8fba-6bd2-5dcb-b8a8-93bd9b07cc0c', sourcePath:'怪物图鉴2025/巨人/食人魔/食人魔.htm', sourceStatus:'local-private verified field evidence' },
  { id:'ref-wolf', revision:1, sourceType:'reference', name:'狼', kind:'monster', relation:'enemy', alignment:'无阵营', size:'中型', armorClass:12, maxHp:11, speed:40, footprint:[1,1], actions:[{name:'啃咬',category:'action'}], referenceActions:[{name:'啃咬',category:'action',detail:'近战攻击：+4，触及5尺。命中：5（1d6+2）穿刺伤害；目标为中型或更小体型时倒地。'}], traits:[{name:'集群战术',detail:'如果攻击目标 5 尺内存在至少一名未失能的狼的盟友，狼对该目标的攻击检定具有优势。',sourceType:'reference'}], resources:{}, note:'', sourceEntryId:'urn:uuid:eab9fff0-5d70-5274-8ba8-467fadcdba56', sourcePath:'怪物图鉴2025/附录A/狼.htm', sourceStatus:'local-private verified field evidence' },
  { id:'ref-fire-giant', revision:1, sourceType:'reference', name:'火巨人', kind:'monster', relation:'enemy', alignment:'守序邪恶', size:'巨型', armorClass:18, maxHp:162, speed:30, footprint:[3,3], actions:[{name:'多重攻击',category:'action'},{name:'火焰之剑',category:'action'},{name:'投掷炎锤',category:'action'}], referenceActions:[{name:'多重攻击',category:'action',detail:'进行两次攻击，可选火焰之剑或投掷炎锤。'},{name:'火焰之剑',category:'action',detail:'近战攻击：+11，触及10尺。命中：21（4d6+7）挥砍伤害外加10（3d6）火焰伤害。'},{name:'投掷炎锤',category:'action',detail:'远程攻击：+11，射程60/240尺。命中：23（3d10+7）钝击伤害外加4（1d8）火焰伤害；可推离至多15尺，目标下次攻击劣势至其下回合结束。'}], traits:[], resources:{}, note:'', sourceEntryId:'urn:uuid:89061a89-389d-5eb3-ac14-e3c539feeba5', sourcePath:'怪物图鉴2025/巨人/序位巨人/火巨人.htm', sourceStatus:'local-private verified field evidence; v0.2 D2-008-A1' },
  { id:'ref-beholder', revision:1, sourceType:'reference', name:'眼魔', kind:'monster', relation:'enemy', alignment:'守序邪恶', size:'大型', armorClass:18, maxHp:190, speed:40, speedModes:{walkFeet:5,flyFeet:40,hover:true}, footprint:[2,2], actions:[{name:'多重攻击',category:'action'},{name:'啃咬',category:'action'},{name:'眼波射线',category:'action'},{name:'反魔法锥域',category:'bonus'},{name:'切齿',category:'legendary'},{name:'怒视',category:'legendary'}], referenceActions:[{name:'多重攻击',category:'action',detail:'使用三次眼波射线。'},{name:'啃咬',category:'action',detail:'近战攻击：+8，触及5尺。命中：13（3d6+3）穿刺伤害。'},{name:'眼波射线',category:'action',detail:'120尺；掷1d10随机选择一条本回合尚未使用的射线。',options:[{roll:1,name:'魅惑射线',detail:'感知豁免 DC 16。失败：受到 13（3d8）心灵伤害，并被魅惑 1 小时或直至受到伤害；成功：伤害减半。'},{roll:2,name:'麻痹射线',detail:'体质豁免 DC 16。失败：陷入麻痹；目标在其每个回合结束时重复豁免，1 分钟后自动成功。'},{roll:3,name:'恐惧射线',detail:'感知豁免 DC 16。失败：受到 14（4d6）心灵伤害，并陷入恐慌直到目标下回合结束；成功：伤害减半。'},{roll:4,name:'缓慢射线',detail:'体质豁免 DC 16。失败：受到 18（4d8）黯蚀伤害；速度减半、不能执行反应，且只能执行动作或附赠动作之一，直到目标下回合结束；成功：伤害减半。'},{roll:5,name:'汲能射线',detail:'体质豁免 DC 16。失败：受到 13（3d8）毒素伤害，并中毒且不能恢复生命值，直到目标下回合结束；成功：伤害减半。'},{roll:6,name:'念力射线',detail:'力量豁免 DC 16（超巨型生物自动成功）。失败：眼魔可将目标向任意方向移动至多 30 尺；目标被束缚，直到眼魔下回合开始或眼魔失能。也可精细操控物体。'},{roll:7,name:'睡眠射线',detail:'感知豁免 DC 16（构装生物或亡灵自动成功）。失败：昏迷 1 分钟；受到伤害，或 5 尺内生物用动作唤醒时结束。'},{roll:8,name:'石化射线',detail:'体质豁免 DC 16。首次失败：被束缚，并在目标下回合结束时再次豁免；再次失败：石化取代束缚。'},{roll:9,name:'解离射线',detail:'敏捷豁免 DC 16。失败：受到 36（8d8）力场伤害；生命值降至 0 的生物解离。物体或魔法力场的 10 尺立方区域也会解离；成功：伤害减半。'},{roll:10,name:'死亡射线',detail:'敏捷豁免 DC 16。失败：受到 55（10d10）黯蚀伤害；生命值降至 0 时死亡；成功：伤害减半。'}]},{name:'反魔法锥域',category:'bonus',detail:'150尺锥状；如同反魔法场并反制眼魔自己的眼波射线，持续至其下回合开始。'},{name:'切齿',category:'legendary',detail:'传奇动作，消耗1次：发动两次啃咬攻击。'},{name:'怒视',category:'legendary',detail:'传奇动作，消耗1次：使用眼波射线。'}], traits:[{name:'传奇抗性'}], resources:{'传奇抗性':3}, resourceDetails:{'传奇抗性':'豁免失败时，可将该次豁免改为成功。'}, resourceSources:{'传奇抗性':'reference'}, legendaryActionMax:3, note:'', sourceEntryId:'urn:uuid:5752e02e-5174-5805-bf1a-e96a3f8a6f23', sourcePath:'怪物图鉴2025/多类型/眼魔/眼魔.htm', sourceStatus:'local-private verified field evidence; v0.2 D2-008-A1' },
];

// 2025 怪物条目的显式“先攻”调整值优先于从敏捷反推；这些值仍会在 DM 表单中保持可编辑。
const admittedInitiativeModifiers = {
  'ref-zombie': -2,
  'ref-skeleton': 3,
  'ref-goblin-minion': 2,
  'ref-ogre': -1,
  'ref-wolf': 2,
  'ref-fire-giant': 3,
  'ref-beholder': 12,
};
referenceTemplateSeeds.forEach(template => { template.initiativeModifier = admittedInitiativeModifiers[template.id] ?? 0; });

// 既有 v0.1 本地验证参战者；它们不是本版本新增的规则资料准入，也不是完整角色构筑。
// 角色预设保持在“角色”入口，NPC 预设仍是可加入遭遇的单位模板。
export const legacyCharacterPresets = [
  { id:'preset-pc-monk', revision:1, sourceType:'custom', preset:true, name:'15级散打武者', kind:'character', relation:'ally', alignment:'', size:'中型', armorClass:0, maxHp:112, speed:55, footprint:[1,1], actions:[], traits:[], resources:{'功力':15}, slots:{}, note:'v0.1 本地私有验证角色预设；能力合法性由 DM 裁定。', originLabel:'v0.1 local-private fixture' },
  { id:'preset-pc-wizard', revision:1, sourceType:'custom', preset:true, name:'15级塑能师', kind:'character', relation:'ally', alignment:'', size:'中型', armorClass:0, maxHp:77, speed:30, footprint:[1,1], actions:[], traits:[], resources:{}, slots:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1}, note:'v0.1 本地私有验证角色预设；能力合法性由 DM 裁定。', originLabel:'v0.1 local-private fixture' },
];

export const legacyNpcPresets = [
  { id:'preset-scout', revision:1, sourceType:'custom', preset:true, name:'斥候', kind:'npc', relation:'ally', alignment:'', size:'中型', armorClass:0, maxHp:16, speed:30, footprint:[1,1], actions:[], traits:[], resources:{'多重攻击':1}, note:'v0.1 本地私有验证 NPC 预设。', originLabel:'v0.1 local-private fixture' },
  { id:'preset-priest', revision:1, sourceType:'custom', preset:true, name:'祭司', kind:'npc', relation:'ally', alignment:'', size:'中型', armorClass:0, maxHp:27, speed:25, footprint:[1,1], actions:[], traits:[], resources:{'治疗祷言':2}, note:'v0.1 本地私有验证 NPC 预设。', originLabel:'v0.1 local-private fixture' },
  { id:'preset-mage', revision:1, sourceType:'custom', preset:true, name:'魔法师', kind:'npc', relation:'neutral', alignment:'', size:'中型', armorClass:0, maxHp:40, speed:30, footprint:[1,1], actions:[], traits:[], resources:{'法术次数':3,'反应':1}, note:'v0.1 本地私有验证 NPC 预设。', originLabel:'v0.1 local-private fixture' },
];

// 兼容既有测试/内部调用；UI 不再把角色预设并入单位库。
export const legacyEncounterPresets = [...legacyCharacterPresets, ...legacyNpcPresets];

const legacyPresetInitiativeModifiers = {
  'preset-pc-monk': 4,
  'preset-pc-wizard': 2,
  'preset-scout': 2,
  'preset-priest': 0,
  'preset-mage': 2,
};
legacyEncounterPresets.forEach(template => { template.initiativeModifier = legacyPresetInitiativeModifiers[template.id] ?? 0; });

export function createEncounterMember(template, id, position = { x: 0, y: 0 }) {
  const snapshot = copy(template);
  return {
    id,
    templateId: template.id,
    templateRevision: template.revision || 1,
    templateSnapshot: snapshot,
    name: template.name,
    shortLabel: template.shortLabel || '',
    color: template.colorMode === 'relation'
      ? ({ enemy: '#cf6370', ally: '#67b999', neutral: '#8e9ae5' }[template.relation] || '#65748a')
      : (template.color || ({ enemy: '#cf6370', ally: '#67b999', neutral: '#8e9ae5' }[template.relation] || '#65748a')),
    kind: template.kind || 'monster',
    relation: template.relation || 'unknown',
    hp: template.maxHp,
    maxHp: template.maxHp,
    tempHp: 0,
    speed: template.speed,
    initiativeModifier: normalizeInitiativeModifier(template.initiativeModifier),
    legendaryActionMax: template.legendaryActionMax || 0,
    resources: copy(template.resources || {}),
    resourceMax: copy(template.resources || {}),
    slots: copy(template.slots || {}),
    slotsMax: copy(template.slots || {}),
    conditions: [],
    position: copy(position),
    footprint: { widthCells: template.footprint?.[0] || 1, heightCells: template.footprint?.[1] || 1 },
    facing: 'north',
    facingPort: null,
    elevationFeet: 0,
    deployment: 'field',
    deployedCombatantId: null,
  };
}

export function materializeCombatant(member, id) {
  return {
    ...copy(member),
    id,
    sourceEncounterMemberId: member.id,
    actionAvailable: true,
    bonusActionAvailable: true,
    reactionAvailable: true,
    movementRemaining: member.speed,
    slots: copy(member.slots || {}),
    slotsMax: copy(member.slotsMax || member.slots || {}),
    legendaryActions: member.legendaryActionMax || 0,
    legendaryActionMax: member.legendaryActionMax || 0,
    initiative: null,
    initiativeRoll: null,
    initiativeMode: 'unconfigured',
    initiativeGroupId: null,
    presenceStatus: 'on-field',
    participationStatus: 'active',
    lifeStatus: 'alive',
    deathRecord: null,
    transformationOrigin: null,
    eligibleFromRound: 1,
    cleanupRemoved: false,
  };
}

export function migrateV010Session(session, id, timestamp) {
  if (session?.encounter) return session;
  return {
    ...copy(session),
    schemaVersion: V020_SCHEMA_VERSION,
    encounter: {
      id: id(),
      phase: 'confirmed',
      members: [],
      preparationSnapshot: null,
      confirmedAt: session.updatedAt || timestamp(),
      migratedFrom: '0.1.0',
    },
  };
}

// 导入在写入当前会话之前完成结构与版本边界检查；调用方保留原始文件，
// 并仅在本函数返回成功后替换内存中的会话。
export function validateImportedEnvelope(data, id, timestamp) {
  if (!data || !data.session || !Array.isArray(data.session.events)) throw new Error('导入失败：缺少完整的会话 Envelope 或事件日志。');
  if (data.schemaVersion === '0.1.0' || data.session.schemaVersion === '0.1.0') {
    const session = migrateV010Session(data.session, id, timestamp);
    return { ...data, schemaVersion: V020_SCHEMA_VERSION, appVersion: V020_SCHEMA_VERSION, session: normalizeV020Lifecycle(session) };
  }
  if (data.schemaVersion !== V020_SCHEMA_VERSION) throw new Error('导入失败：仅接受 v0.1.0 或 v0.2.0 导出 Envelope。');
  if (!Array.isArray(data.session.combatants) || !data.session.settings) throw new Error('导入失败：缺少战斗状态。');
  if (!data.session.encounter) throw new Error('导入失败：v0.2.0 会话缺少遭遇状态。');
  return { ...data, session: normalizeV020Lifecycle(data.session) };
}

// 结束战斗统一关闭所有已参战实例，保留战后只读清理所需的地图记录；
// 未投入预备与未确认草稿不能伪造为参战历史。
export function finalizeCombatSession(session, { timestamp, clearBattlefield = false } = {}) {
  const next = copy(session);
  next.combatants = (next.combatants || []).map(combatant => ({
    ...combatant,
    participationStatus: combatant.participationStatus === 'active' ? 'ended' : combatant.participationStatus,
  }));
  next.encounter = { ...(next.encounter || {}), phase: 'ended', endedAt: timestamp || null };
  next.encounter.members = (next.encounter.members || []).map(member => (
    member.deployment === 'reserve' && !member.deployedCombatantId ? { ...member, deployment: 'unused-reserve' } : member
  ));
  next.turn = { ...(next.turn || {}), started: false, index: -1, ended: true, pendingTieGroups: [] };
  next.ui = {
    ...(next.ui || {}), range: null, entryDraft: null, entryPlacement: null,
    reentryDraft: null, deathResolution: null, postCombatCleanup: !clearBattlefield,
  };
  return next;
}

export function normalizeV020Lifecycle(session) {
  const next = copy(session);
  next.combatProjections = Array.isArray(next.combatProjections) ? next.combatProjections : [];
  next.postCombatDiffs = Array.isArray(next.postCombatDiffs) ? next.postCombatDiffs : [];
  next.encounter = next.encounter || { id: null, phase: 'confirmed', members: [] };
  next.encounter.members = (next.encounter.members || []).map(member => ({
    ...member,
    deployment: member.deployment || 'field',
    deployedCombatantId: member.deployedCombatantId || null,
  }));
  next.combatants = (next.combatants || []).map(combatant => ({
    ...combatant,
    initiativeModifier: normalizeInitiativeModifier(combatant.initiativeModifier, combatant.templateSnapshot?.initiativeModifier),
    initiativeRoll: Number.isFinite(combatant.initiativeRoll) ? combatant.initiativeRoll : null,
    initiativeMode: combatant.initiativeMode || (Number.isFinite(combatant.initiative) ? 'legacy-total' : 'unconfigured'),
    presenceStatus: combatant.presenceStatus || 'on-field',
    participationStatus: combatant.participationStatus || (next.encounter.phase === 'ended' ? 'ended' : 'active'),
    lifeStatus: combatant.lifeStatus || 'alive',
    deathRecord: combatant.deathRecord || null,
    transformationOrigin: combatant.transformationOrigin || null,
    eligibleFromRound: Number.isFinite(combatant.eligibleFromRound) ? combatant.eligibleFromRound : 1,
    cleanupRemoved: !!combatant.cleanupRemoved,
  }));
  const legacyPlacement = next.ui?.entryPlacement;
  const entryPlacement = legacyPlacement?.combatant
    ? { items: [{ combatant: legacyPlacement.combatant, reserveMemberId: legacyPlacement.reserveMemberId || null, tiePlacement: legacyPlacement.tiePlacement || 'after' }] }
    : legacyPlacement?.items?.length ? legacyPlacement : null;
  if (entryPlacement?.items) entryPlacement.items = entryPlacement.items.map(item => {
    if (item.kind !== 'join' || (item.initiativeConfigured ?? Number.isFinite(item.combatant?.initiative))) return item;
    const modifier = normalizeInitiativeModifier(item.initiativeModifier, item.combatant?.initiativeModifier);
    return { ...item, initiativeMode: 'roll', initiativeModifier: modifier, initiativeRoll: null, initiativeConfigured: false, combatant: { ...item.combatant, initiative: null, initiativeRoll: null, initiativeMode: 'roll', initiativeModifier: modifier } };
  });
  next.ui = { ...(next.ui || {}), entryDraft: next.ui?.entryDraft || null, entryPlacement, reentryDraft: next.ui?.reentryDraft || null, deathResolution: next.ui?.deathResolution || null, postCombatCleanup: !!next.ui?.postCombatCleanup };
  return next;
}
