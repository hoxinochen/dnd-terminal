export const CHARACTER_SHEET_SCHEMA_VERSION = '0.3.0-m1-s6';

export const M1_S5_RULES = {
  rogueMastery: 'local-markdown-anchor:Lore_01_核心玩家规则.md#游荡者-武器精通',
  weaponTable: 'local-markdown-anchor:Lore_01_核心玩家规则.md#武器表',
  masteryProperties: 'local-markdown-anchor:Lore_01_核心玩家规则.md#精通词条-Nick-Vex',
};

export const M1_S5_WEAPON_MASTERY_CATALOG = Object.freeze({
  '匕首': Object.freeze({
    weaponId: 'phb2024:dagger', masteryPropertyId: 'phb2024:nick', masteryTerm: '迅击', englishName: 'Nick',
    effect: '轻型词条提供的额外攻击可以并入攻击动作，而不占用附赠动作；每回合仍只能进行一次该额外攻击。',
    automation: '仅常驻显示规则提示；Terminal 不自动改变动作经济或生成额外攻击。',
  }),
  '短弓': Object.freeze({
    weaponId: 'phb2024:shortbow', masteryPropertyId: 'phb2024:vex', masteryTerm: '侵扰', englishName: 'Vex',
    effect: '命中一个生物并造成伤害后，直到你的下一回合结束前，你对该生物的下一次攻击检定具有优势。',
    automation: 'DM 确认命中并造成伤害后生成候选；应用后只提醒优势，不自动掷骰、选择后续攻击或结算优势。',
  }),
});

const copy = value => globalThis.structuredClone ? globalThis.structuredClone(value) : JSON.parse(JSON.stringify(value));
const integer = (value, fallback = 0) => Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : Math.trunc(Number(fallback) || 0);
const nonNegative = (value, fallback = 0) => Math.max(0, integer(value, fallback));
const optionalText = value => String(value || '').trim();
const ABILITY_KEYS = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

const revivalBasisLabel = value => ({'verified-entry':'已核验条目','dm-ruling':'DM 明确裁定','unverified':'待核验记录'})[value] || '未标注';
const revivalSoulLabel = value => ({confirmed:'已确认返回','not-applicable':'不适用'})[value] || '未标注';
const revivalConditionLabel = value => ({preserve:'保留既有状态（仅移除 unconscious）',clear:'清空全部条件'})[value] || '未标注';
const revivalMapLabel = value => ({'restore-original-token':'保留棋子并恢复原实例'})[value] || value || '未标注';
const revivalInitiativeLabel = value => ({'restore-original-slot':'恢复原先攻槽位；已越过则下一轮'})[value] || value || '未标注';

export function revivalNoteAppendText(resolution = {}) {
  const resolutionId = optionalText(resolution.resolutionId);
  const complete = resolution.type === 'pc-return-to-life'
    && resolutionId
    && Number.isInteger(resolution.hp) && resolution.hp > 0
    && ['verified-entry','dm-ruling','unverified'].includes(resolution.basisStatus)
    && optionalText(resolution.basisLabel)
    && ['confirmed','not-applicable'].includes(resolution.soulReturn)
    && optionalText(resolution.effectDisposition)
    && ['preserve','clear'].includes(resolution.conditionHandling)
    && resolution.mapOutcome === 'restore-original-token'
    && resolution.initiativeOutcome === 'restore-original-slot'
    && optionalText(resolution.reason);
  if (!complete) throw new Error('复活备注候选缺少完整、有效的 S1 resolution。');
  return `[v0.5.0 S1 复活记录 / ${resolutionId}] 第 ${resolution.round ?? '—'} 轮；依据：${revivalBasisLabel(resolution.basisStatus)} / ${optionalText(resolution.basisLabel) || '未标注'}；灵魂：${revivalSoulLabel(resolution.soulReturn)}；复活后 HP：${resolution.hp ?? '—'}；状态处理：${revivalConditionLabel(resolution.conditionHandling)}；状态、疾病、诅咒与力竭：${optionalText(resolution.effectDisposition) || '未标注'}；地图：${revivalMapLabel(resolution.mapOutcome)}；先攻：${revivalInitiativeLabel(resolution.initiativeOutcome)}；DM 原因：${optionalText(resolution.reason) || '未标注'}`;
}

function requireText(value, label) {
  const normalized = optionalText(value);
  if (!normalized) throw new Error(`${label}不能为空。`);
  return normalized;
}

function normalizeTextList(values = []) {
  const list = Array.isArray(values) ? values : String(values || '').split(/[，,;；\n]/);
  return [...new Set(list.map(optionalText).filter(Boolean))];
}

function normalizeResources(resources = {}) {
  return Object.fromEntries(Object.entries(resources || {}).map(([rawName, rawPool]) => {
    const name = requireText(rawName, '资源名称');
    const pool = typeof rawPool === 'number' ? { current: rawPool, max: rawPool } : (rawPool || {});
    const max = nonNegative(pool.max, pool.current);
    return [name, {
      current: Math.min(max, nonNegative(pool.current, max)), max,
      recovery: optionalText(pool.recovery) || 'manual', note: optionalText(pool.note),
      sourceStatus: optionalText(pool.sourceStatus) || 'dm-authored',
    }];
  }));
}

export function createAuditedValue(input = {}) {
  const calculated = input.calculatedValue === null || input.calculatedValue === undefined || input.calculatedValue === '' ? null : integer(input.calculatedValue);
  const override = input.overrideValue === null || input.overrideValue === undefined || input.overrideValue === '' ? null : integer(input.overrideValue);
  const reason = optionalText(input.overrideReason);
  if (override !== null && !reason) throw new Error('派生值手工覆写必须填写原因。');
  return {
    status: optionalText(input.status) || (calculated === null ? 'needs-review' : 'calculated'),
    inputs: Array.isArray(input.inputs) ? copy(input.inputs) : [], calculatedValue: calculated,
    overrideValue: override, effectiveValue: override ?? calculated, overrideReason: reason,
  };
}

function manualAudit(value, label, existing) {
  const normalized = integer(value, 0);
  if (existing?.effectiveValue !== undefined && integer(existing.effectiveValue) === normalized) return createAuditedValue(existing);
  return createAuditedValue({
    status: 'needs-review', inputs: [{ kind: 'dm-manual', label, value: normalized }],
    calculatedValue: null, overrideValue: normalized,
    overrideReason: 'DM 手工录入；当前没有足够的已准入规则输入用于自动计算',
  });
}

function normalizeAbilities(abilities = {}) {
  return Object.fromEntries(ABILITY_KEYS.map(key => {
    const raw = abilities?.[key];
    const score = nonNegative(typeof raw === 'object' ? raw.score : raw, 10);
    const audit = typeof raw === 'object' ? raw.modifier : null;
    return [key, { score, modifier: audit?.effectiveValue !== undefined ? createAuditedValue(audit) : createAuditedValue({ status: 'needs-review', inputs: [{ kind: 'ability-score', key, value: score }], calculatedValue: null }) }];
  }));
}

function normalizeClasses(classes = [], totalLevel = 0) {
  return (Array.isArray(classes) ? classes : []).map((item, index) => ({
    id: optionalText(item?.id) || `class-${index + 1}`, name: requireText(item?.name, '职业名称'),
    subclass: optionalText(item?.subclass), level: Math.max(1, nonNegative(item?.level, totalLevel || 1)),
    sourceStatus: optionalText(item?.sourceStatus) || 'dm-authored',
  }));
}

function normalizeAttackProfiles(attacks = []) {
  return (Array.isArray(attacks) ? attacks : []).map((attack, index) => ({
    id: optionalText(attack?.id) || `attack-${index + 1}`, name: requireText(attack?.name, '攻击名称'),
    inventoryItemId: optionalText(attack?.inventoryItemId), weaponKind: optionalText(attack?.weaponKind || attack?.name),
    proficient: attack?.proficient === true, ability: optionalText(attack?.ability) || 'unknown',
    attackBonus: attack?.attackBonus === null || attack?.attackBonus === undefined || attack?.attackBonus === '' ? null : integer(attack.attackBonus),
    damage: optionalText(attack?.damage), damageType: optionalText(attack?.damageType) || 'unknown',
    reach: optionalText(attack?.reach), range: optionalText(attack?.range), ammunition: optionalText(attack?.ammunition),
    resourceLink: optionalText(attack?.resourceLink), weaponId: optionalText(attack?.weaponId),
    masteryPropertyId: optionalText(attack?.masteryPropertyId), masteryTerm: optionalText(attack?.masteryTerm),
    masteryEnabled: attack?.masteryEnabled === true, sourceStatus: optionalText(attack?.sourceStatus) || 'dm-authored', note: optionalText(attack?.note),
  }));
}

function normalizeProficiencies(items = []) {
  return (Array.isArray(items) ? items : []).map((item, index) => {
    const requestedRank = optionalText(item?.proficiencyRank);
    const proficiencyRank = ['none', 'proficient', 'expertise', 'unknown'].includes(requestedRank) ? requestedRank : (item?.proficient === true ? 'proficient' : 'none');
    return {
      id: optionalText(item?.id) || `proficiency-${index + 1}`, name: requireText(item?.name, '熟练项名称'),
      proficiencyRank, proficient: ['proficient', 'expertise'].includes(proficiencyRank), bonus: item?.bonus === null || item?.bonus === undefined || item?.bonus === '' ? null : integer(item.bonus),
      sourceMark: optionalText(item?.sourceMark), status: optionalText(item?.status) || 'needs-review', sourceRef: optionalText(item?.sourceRef),
    };
  });
}

function normalizeFeatures(features = []) {
  return (Array.isArray(features) ? features : []).map((feature, index) => ({
    id: optionalText(feature?.id) || `feature-${index + 1}`, category: optionalText(feature?.category) || 'special',
    name: requireText(feature?.name, '特性名称'), level: feature?.level === null || feature?.level === undefined || feature?.level === '' ? null : nonNegative(feature.level),
    description: optionalText(feature?.description), sourceStatus: optionalText(feature?.sourceStatus) || 'needs-review',
    sourceRef: optionalText(feature?.sourceRef), rulesEntryId: optionalText(feature?.rulesEntryId), automationStatus: optionalText(feature?.automationStatus) || 'display-only',
  }));
}

function normalizeActions(actions = []) {
  return (Array.isArray(actions) ? actions : []).map((action, index) => ({
    id: optionalText(action?.id) || `action-${index + 1}`, name: requireText(action?.name, '动作名称'),
    economy: optionalText(action?.economy) || 'action', resourceLink: optionalText(action?.resourceLink),
    description: optionalText(action?.description), sourceStatus: optionalText(action?.sourceStatus) || 'dm-authored',
  }));
}

function normalizeEquipment(items = []) {
  return (Array.isArray(items) ? items : []).map((item, index) => ({
    id: optionalText(item?.id) || `item-${index + 1}`, name: requireText(item?.name, '装备名称'), quantity: nonNegative(item?.quantity, 1),
    equipped: item?.equipped === true, attuned: item?.attuned === true, attunementMark: optionalText(item?.attunementMark), container: optionalText(item?.container) || '随身',
    consumable: item?.consumable === true, ammunitionOrResourceLink: optionalText(item?.ammunitionOrResourceLink),
    itemKind: optionalText(item?.itemKind) || 'gear', rarity: optionalText(item?.rarity), description: optionalText(item?.description),
    weight: item?.weight === null || item?.weight === undefined || item?.weight === '' ? null : Number(item.weight),
    weaponProficiencyRank: optionalText(item?.weaponProficiencyRank), masteryTerm: optionalText(item?.masteryTerm), sourceRef: optionalText(item?.sourceRef),
    note: optionalText(item?.note), sourceStatus: optionalText(item?.sourceStatus) || 'dm-authored',
  }));
}

function normalizeInventoryContainers(containers = []) {
  const normalized = (Array.isArray(containers) ? containers : []).map((container, index) => ({
    id: optionalText(container?.id) || `container-${index + 1}`, name: requireText(container?.name, '容器名称'),
    parentId: optionalText(container?.parentId) || null, kind: optionalText(container?.kind) || 'container', sourceRef: optionalText(container?.sourceRef),
  }));
  return normalized.length ? normalized : [{ id: 'container-carried', name: '随身', parentId: null, kind: 'carried', sourceRef: '' }];
}

function normalizeLinkedEntities(entities = []) {
  return (Array.isArray(entities) ? entities : []).map((entity, index) => ({
    id: optionalText(entity?.id) || `linked-${index + 1}`, name: requireText(entity?.name, '关联单位名称'),
    kind: optionalText(entity?.kind) || 'ally', relation: optionalText(entity?.relation) || 'ally', note: optionalText(entity?.note),
    sourceStatus: optionalText(entity?.sourceStatus) || 'dm-authored',
    templateRef: entity?.templateRef?.templateId ? { templateId: optionalText(entity.templateRef.templateId), templateRevision: integer(entity.templateRef.templateRevision, 1) } : null,
    combatMaterializationStatus: optionalText(entity?.combatMaterializationStatus) || 'available-in-m1-s5',
  }));
}

const CONTROLLED_ENTITY_STATUSES = new Set(['controlled', 'expired-uncontrolled', 'released', 'control-lost', 'permanent-controlled']);
const CONTROL_DURATION_KINDS = new Set(['one-long-rest', 'permanent', 'custom']);
const CONTROL_DURATION_UNITS = new Set(['rounds', 'encounters', 'long-rests']);

function normalizeControlledDuration(raw = {}) {
  const kind = CONTROL_DURATION_KINDS.has(optionalText(raw?.kind)) ? optionalText(raw.kind) : 'one-long-rest';
  if (kind === 'permanent') return { kind: 'permanent', unit: null, remaining: null, initial: null };
  if (kind === 'one-long-rest') return { kind: 'one-long-rest', unit: 'long-rests', remaining: Math.max(0, nonNegative(raw?.remaining, 1)), initial: 1 };
  const unit = CONTROL_DURATION_UNITS.has(optionalText(raw?.unit)) ? optionalText(raw.unit) : 'rounds';
  const remaining = Math.max(1, nonNegative(raw?.remaining, 1));
  return { kind: 'custom', unit, remaining, initial: Math.max(remaining, nonNegative(raw?.initial, remaining)) };
}

export function normalizeControlledEntities(entities = []) {
  const ids = new Set();
  return (Array.isArray(entities) ? entities : []).map((entity, index) => {
    const id = optionalText(entity?.id) || `controlled-${index + 1}`;
    if (ids.has(id)) throw new Error(`受控生物 ID 重复：“${id}”。`); ids.add(id);
    const status = CONTROLLED_ENTITY_STATUSES.has(optionalText(entity?.status)) ? optionalText(entity.status) : 'controlled';
    const duration = normalizeControlledDuration(entity?.duration);
    return {
      id, name: requireText(entity?.name, '受控生物名称'),
      templateRef: entity?.templateRef?.templateId ? { templateId: optionalText(entity.templateRef.templateId), templateRevision: integer(entity.templateRef.templateRevision, 1) } : null,
      status: duration.kind === 'permanent' && status === 'controlled' ? 'permanent-controlled' : status,
      commandRangeFeet: Math.max(0, nonNegative(entity?.commandRangeFeet, 0)),
      duration, effectLabel: optionalText(entity?.effectLabel), sourceStatus: optionalText(entity?.sourceStatus) || 'dm-confirmed',
      createdEventId: optionalText(entity?.createdEventId), sourceCombatantId: optionalText(entity?.sourceCombatantId), activeCombatantId: optionalText(entity?.activeCombatantId) || null,
      history: Array.isArray(entity?.history) ? entity.history.map(item => ({
        eventId: optionalText(item?.eventId), type: optionalText(item?.type) || 'dm-recorded', at: optionalText(item?.at), round: Number.isInteger(item?.round) ? item.round : null,
        status: CONTROLLED_ENTITY_STATUSES.has(optionalText(item?.status)) ? optionalText(item.status) : status, reason: optionalText(item?.reason),
      })) : [],
    };
  });
}

const SPELL_SOURCE_KINDS = new Set(['class', 'subclass', 'species', 'background-feat', 'item', 'custom']);
const SPELL_POOL_KINDS = new Set(['shared-slots', 'special-slots', 'free-cast', 'item-charge', 'custom']);

function optionalInteger(value) {
  return value === null || value === undefined || value === '' ? null : integer(value);
}

function normalizeSpellMetric(value, label) {
  const raw = typeof value === 'object' && value !== null ? value : { value };
  const numeric = optionalInteger(raw.value);
  return {
    value: numeric,
    status: optionalText(raw.status) || (numeric === null ? 'needs-review' : 'dm-authored'),
    overrideReason: optionalText(raw.overrideReason),
    inputs: Array.isArray(raw.inputs) ? copy(raw.inputs) : [],
    label,
  };
}

function normalizeSpellcastingProfiles(profiles = []) {
  const ids = new Set();
  return (Array.isArray(profiles) ? profiles : []).map((profile, index) => {
    const id = optionalText(profile?.id) || `spell-profile-${index + 1}`;
    if (ids.has(id)) throw new Error(`施法来源 ID 重复：“${id}”。`); ids.add(id);
    const sourceKind = optionalText(profile?.sourceKind) || 'custom';
    return {
      id, sourceKind: SPELL_SOURCE_KINDS.has(sourceKind) ? sourceKind : 'custom',
      sourceName: requireText(profile?.sourceName, '施法来源名称'), classId: optionalText(profile?.classId),
      ability: ABILITY_KEYS.includes(optionalText(profile?.ability)) ? optionalText(profile?.ability) : 'unknown',
      spellAttack: normalizeSpellMetric(profile?.spellAttack, '法术攻击调整值'),
      saveDc: normalizeSpellMetric(profile?.saveDc, '法术豁免 DC'),
      acquisitionMode: optionalText(profile?.acquisitionMode) || 'unknown',
      preparationMode: optionalText(profile?.preparationMode) || 'unknown',
      preparedCount: normalizeSpellMetric(profile?.preparedCount, '准备法术数量'),
      resourcePoolIds: normalizeTextList(profile?.resourcePoolIds),
      ruleVersion: optionalText(profile?.ruleVersion) || 'unknown', rulesEntryId: optionalText(profile?.rulesEntryId),
      sourceRef: optionalText(profile?.sourceRef), sourceStatus: optionalText(profile?.sourceStatus) || 'needs-review',
      overrideReason: optionalText(profile?.overrideReason), note: optionalText(profile?.note),
    };
  });
}

function normalizeSpellBalances(balances = []) {
  const values = Array.isArray(balances) ? balances : Object.entries(balances || {}).map(([id, value]) => ({ id, ...(typeof value === 'object' ? value : { current: value, max: value }) }));
  const ids = new Set();
  return values.map((balance, index) => {
    const id = optionalText(balance?.id) || `balance-${index + 1}`;
    if (ids.has(id)) throw new Error(`施法资源余额 ID 重复：“${id}”。`); ids.add(id);
    const max = nonNegative(balance?.max, balance?.current);
    return { id, label: optionalText(balance?.label) || id, current: Math.min(max, nonNegative(balance?.current, max)), max };
  });
}

function normalizeSpellResourcePools(pools = []) {
  const ids = new Set();
  return (Array.isArray(pools) ? pools : []).map((pool, index) => {
    const id = optionalText(pool?.id) || `spell-pool-${index + 1}`;
    if (ids.has(id)) throw new Error(`施法资源池 ID 重复：“${id}”。`); ids.add(id);
    const kind = optionalText(pool?.kind) || 'custom';
    return {
      id, kind: SPELL_POOL_KINDS.has(kind) ? kind : 'custom', label: requireText(pool?.label, '施法资源池名称'),
      balances: normalizeSpellBalances(pool?.balances), recovery: optionalText(pool?.recovery) || 'manual',
      ruleVersion: optionalText(pool?.ruleVersion) || 'unknown', rulesEntryId: optionalText(pool?.rulesEntryId),
      sourceStatus: optionalText(pool?.sourceStatus) || 'needs-review', overrideReason: optionalText(pool?.overrideReason), note: optionalText(pool?.note),
    };
  });
}

function normalizeSpellAvailability(value = {}) {
  const raw = typeof value === 'object' && value !== null ? value : {};
  return {
    inSpellbook: raw.inSpellbook === true, known: raw.known === true, prepared: raw.prepared === true,
    alwaysPrepared: raw.alwaysPrepared === true, availableThisEncounter: raw.availableThisEncounter === true,
    status: optionalText(raw.status) || 'needs-review',
  };
}

function normalizeSpells(spells = [], profiles = [], pools = []) {
  const profileIds = new Set(profiles.map(profile => profile.id)), poolIds = new Set(pools.map(pool => pool.id)), ids = new Set();
  return (Array.isArray(spells) ? spells : []).map((spell, index) => {
    const id = optionalText(spell?.id) || `spell-${index + 1}`;
    if (ids.has(id)) throw new Error(`法术 ID 重复：“${id}”。`); ids.add(id);
    const optionIds = new Set();
    const castingOptions = (Array.isArray(spell?.castingOptions) ? spell.castingOptions : []).map((option, optionIndex) => {
      const optionId = optionalText(option?.id) || `${id}-option-${optionIndex + 1}`;
      if (optionIds.has(optionId)) throw new Error(`施放方式 ID 重复：“${optionId}”。`); optionIds.add(optionId);
      const profileId = requireText(option?.profileId, '施放方式的施法来源 ID');
      if (!profileIds.has(profileId)) throw new Error(`施放方式引用了不存在的施法来源：“${profileId}”。`);
      const resourcePoolId = optionalText(option?.resourcePoolId);
      if (resourcePoolId && !poolIds.has(resourcePoolId)) throw new Error(`施放方式引用了不存在的施法资源池：“${resourcePoolId}”。`);
      return {
        id: optionId, profileId, resourcePoolId, balanceId: optionalText(option?.balanceId),
        castAtLevel: optionalInteger(option?.castAtLevel), freeUses: normalizeSpellBalances(option?.freeUses),
        rulesEntryId: optionalText(option?.rulesEntryId), sourceStatus: optionalText(option?.sourceStatus) || 'needs-review', note: optionalText(option?.note),
      };
    });
    return {
      id, stableSpellId: optionalText(spell?.stableSpellId), name: requireText(spell?.name, '法术名称'),
      ruleVersion: optionalText(spell?.ruleVersion) || 'unknown', availability: normalizeSpellAvailability(spell?.availability),
      sourceStatus: optionalText(spell?.sourceStatus) || 'needs-review', rulesEntryId: optionalText(spell?.rulesEntryId), note: optionalText(spell?.note), castingOptions,
    };
  });
}

export function normalizeCharacterSheet(rawSheet = {}) {
  const sheet = copy(rawSheet || {});
  const maxHp = Math.max(1, nonNegative(sheet?.hp?.max, sheet?.maxHp || 1));
  const totalLevel = nonNegative(sheet.totalLevel, 0);
  const armorClass = nonNegative(sheet.armorClass, 0);
  const initiativeModifier = integer(sheet.initiativeModifier, 0);
  const proficiencyBonus = integer(sheet.proficiencyBonus?.effectiveValue ?? sheet.proficiencyBonus, 0);
  const passivePerception = integer(sheet.passivePerception?.effectiveValue ?? sheet.passivePerception, 0);
  return {
    ...sheet, schemaVersion: CHARACTER_SHEET_SCHEMA_VERSION, name: requireText(sheet.name, '角色名称'), kind: 'character', relation: 'ally',
    ruleVersion: optionalText(sheet.ruleVersion) || 'unknown', ownerHint: optionalText(sheet.ownerHint), totalLevel,
    classes: normalizeClasses(sheet.classes || [], totalLevel),
    origin: { species: optionalText(sheet.origin?.species || sheet.species), background: optionalText(sheet.origin?.background || sheet.background), history: optionalText(sheet.origin?.history) },
    abilities: normalizeAbilities(sheet.abilities), armorClass,
    hp: { current: Math.min(maxHp, nonNegative(sheet?.hp?.current, maxHp)), max: maxHp },
    speed: nonNegative(sheet.speed, 30), initiativeModifier, proficiencyBonus, passivePerception,
    derivedValues: {
      armorClass: manualAudit(armorClass, 'AC', sheet.derivedValues?.armorClass),
      initiativeModifier: manualAudit(initiativeModifier, '先攻调整值', sheet.derivedValues?.initiativeModifier),
      proficiencyBonus: manualAudit(proficiencyBonus, '熟练加值', sheet.derivedValues?.proficiencyBonus),
      passivePerception: manualAudit(passivePerception, '被动察觉', sheet.derivedValues?.passivePerception),
    },
    saves: normalizeProficiencies(sheet.saves), skills: normalizeProficiencies(sheet.skills),
    senses: normalizeTextList(sheet.senses), languages: normalizeTextList(sheet.languages),
    footprint: { widthCells: Math.max(1, nonNegative(sheet.footprint?.widthCells, 1)), heightCells: Math.max(1, nonNegative(sheet.footprint?.heightCells, 1)) },
    combatState: {
      tempHp: nonNegative(sheet.combatState?.tempHp, 0), hitDice: optionalText(sheet.combatState?.hitDice),
      heroicInspiration: sheet.combatState?.heroicInspiration === true, conditions: normalizeTextList(sheet.combatState?.conditions),
      concentration: optionalText(sheet.combatState?.concentration) || 'none',
    },
    resources: normalizeResources(sheet.resources), attackProfiles: normalizeAttackProfiles(sheet.attackProfiles), actions: normalizeActions(sheet.actions),
    traits: Array.isArray(sheet.traits) ? copy(sheet.traits) : [], features: normalizeFeatures(sheet.features), equipment: normalizeEquipment(sheet.equipment),
    inventoryContainers: normalizeInventoryContainers(sheet.inventoryContainers),
    linkedEntities: normalizeLinkedEntities(sheet.linkedEntities),
    controlledEntities: normalizeControlledEntities(sheet.controlledEntities),
    weaponMastery: {
      status: optionalText(sheet.weaponMastery?.status) || 'unknown',
      grants: Array.isArray(sheet.weaponMastery?.grants) ? copy(sheet.weaponMastery.grants) : [],
      selections: Array.isArray(sheet.weaponMastery?.selections) ? copy(sheet.weaponMastery.selections) : [],
      selectionLimit: nonNegative(sheet.weaponMastery?.selectionLimit, 0), changeTiming: optionalText(sheet.weaponMastery?.changeTiming) || 'unknown',
      note: optionalText(sheet.weaponMastery?.note) || '不依据职业名称自动授予武器精通。',
      confirmedAt: optionalText(sheet.weaponMastery?.confirmedAt), selectionReason: optionalText(sheet.weaponMastery?.selectionReason),
    },
    spellcastingProfiles: normalizeSpellcastingProfiles(sheet.spellcastingProfiles),
    spellResourcePools: normalizeSpellResourcePools(sheet.spellResourcePools),
    spells: normalizeSpells(sheet.spells, sheet.spellcastingProfiles || [], sheet.spellResourcePools || []),
    note: optionalText(sheet.note),
    source: {
      kind: optionalText(sheet.source?.kind) || 'manual', status: optionalText(sheet.source?.status) || 'dm-authored',
      entryIds: Array.isArray(sheet.source?.entryIds) ? copy(sheet.source.entryIds) : [], note: optionalText(sheet.source?.note),
      importerId: optionalText(sheet.source?.importerId), sourceVersion: optionalText(sheet.source?.sourceVersion), fileName: optionalText(sheet.source?.fileName),
      fileSha256: optionalText(sheet.source?.fileSha256), mappings: Array.isArray(sheet.source?.mappings) ? copy(sheet.source.mappings) : [],
    },
  };
}

export function createCharacterSheet(input, { id, timestamp } = {}) {
  if (typeof id !== 'function' || typeof timestamp !== 'function') throw new Error('创建角色卡需要 ID 与时间提供器。');
  return normalizeCharacterSheet({ ...copy(input || {}), characterId: id(), revision: 1, previousRevision: null, createdAt: timestamp(), revisedAt: null });
}

export function createCharacterRecord(sheet) {
  const snapshot = normalizeCharacterSheet(sheet);
  return {
    characterId: snapshot.characterId,
    currentRevision: snapshot.revision,
    revisions: [copy(snapshot)],
    status: 'active',
    archivedAt: null,
    archivedReason: null,
  };
}

export const S2_SUCCESSOR_INHERITANCE_GROUPS = Object.freeze([
  'identity', 'combat', 'abilities', 'proficiencies', 'capabilities', 'equipment', 'resources', 'notes',
]);

// S2 deliberately creates a fresh, ordinary CharacterSheet instead of adding a
// predecessor/successor schema relation.  The caller stores the event-specific
// human-readable trace in both cards' existing note fields.
export function createIndependentSuccessorRecord(record, {
  id, timestamp, name, hp, maxHp, inheritGroups = [], note = '', sourceNote = '',
} = {}) {
  if (typeof id !== 'function' || typeof timestamp !== 'function') throw new Error('创建独立后继角色卡需要 ID 与时间提供器。');
  const source = currentCharacterSheet(record);
  const groups = new Set((Array.isArray(inheritGroups) ? inheritGroups : []).map(optionalText));
  const invalid = [...groups].filter(group => !S2_SUCCESSOR_INHERITANCE_GROUPS.includes(group));
  if (invalid.length) throw new Error(`独立后继角色卡包含未知继承组：${invalid.join('、')}。`);
  const nextMaxHp = Math.max(1, nonNegative(maxHp, groups.has('combat') ? source.hp.max : 1));
  const nextHp = Math.min(nextMaxHp, Math.max(1, nonNegative(hp, nextMaxHp)));
  const include = group => groups.has(group);
  const draft = {
    name: requireText(name, '新角色卡名称'), ruleVersion: source.ruleVersion,
    ownerHint: include('identity') ? source.ownerHint : '',
    totalLevel: include('identity') ? source.totalLevel : 0,
    classes: include('identity') ? copy(source.classes) : [],
    origin: include('identity') ? copy(source.origin) : { species:'', background:'', history:'' },
    armorClass: include('combat') ? source.armorClass : 0,
    hp: { current: nextHp, max: nextMaxHp }, speed: include('combat') ? source.speed : 30,
    initiativeModifier: include('combat') ? source.initiativeModifier : 0,
    proficiencyBonus: include('combat') ? source.proficiencyBonus : 0,
    passivePerception: include('combat') ? source.passivePerception : 0,
    footprint: include('combat') ? copy(source.footprint) : { widthCells:1, heightCells:1 },
    combatState: include('combat') ? { ...copy(source.combatState), tempHp:0, conditions:[], concentration:'none' } : { tempHp:0, hitDice:'', heroicInspiration:false, conditions:[], concentration:'none' },
    abilities: include('abilities') ? copy(source.abilities) : undefined,
    saves: include('proficiencies') ? copy(source.saves) : [], skills: include('proficiencies') ? copy(source.skills) : [],
    senses: include('proficiencies') ? copy(source.senses) : [], languages: include('proficiencies') ? copy(source.languages) : [],
    attackProfiles: include('capabilities') ? copy(source.attackProfiles) : [], actions: include('capabilities') ? copy(source.actions) : [],
    traits: include('capabilities') ? copy(source.traits) : [], features: include('capabilities') ? copy(source.features) : [],
    spellcastingProfiles: include('capabilities') ? copy(source.spellcastingProfiles) : [], spellResourcePools: include('capabilities') ? copy(source.spellResourcePools) : [], spells: include('capabilities') ? copy(source.spells) : [],
    equipment: include('equipment') ? copy(source.equipment) : [], inventoryContainers: include('equipment') ? copy(source.inventoryContainers) : [],
    linkedEntities: include('equipment') ? copy(source.linkedEntities) : [], controlledEntities: [], weaponMastery: include('capabilities') ? copy(source.weaponMastery) : undefined,
    resources: include('resources') ? copy(source.resources) : {},
    note: [include('notes') ? optionalText(source.note) : '', optionalText(note)].filter(Boolean).join('\n\n'),
    source: { kind:'manual', status:'dm-confirmed-s2-independent-card', entryIds:[], note:optionalText(sourceNote), mappings:[] },
  };
  return createCharacterRecord(createCharacterSheet(draft, { id, timestamp }));
}

export function normalizeCharacterRecord(record) {
  const normalized = copy(record);
  normalized.revisions = (normalized.revisions || []).map(normalizeCharacterSheet);
  if (!normalized.revisions.length) throw new Error('长期角色卡记录没有任何修订。');
  normalized.characterId = normalized.characterId || normalized.revisions[0].characterId;
  normalized.currentRevision = Number.isInteger(normalized.currentRevision) ? normalized.currentRevision : Math.max(...normalized.revisions.map(sheet => sheet.revision));
  if (!normalized.revisions.some(sheet => sheet.revision === normalized.currentRevision)) throw new Error('长期角色卡记录缺少当前修订。');
  normalized.status = normalized.status === 'archived' ? 'archived' : 'active';
  normalized.archivedAt = normalized.status === 'archived' ? (optionalText(normalized.archivedAt) || null) : null;
  normalized.archivedReason = normalized.status === 'archived' ? optionalText(normalized.archivedReason) : null;
  return normalized;
}

export function archiveCharacterRecord(record, { timestamp, reason = '' } = {}) {
  if (typeof timestamp !== 'function') throw new Error('归档角色卡需要时间提供器。');
  const normalized = normalizeCharacterRecord(record);
  if (normalized.status === 'archived') return normalized;
  normalized.status = 'archived';
  normalized.archivedAt = timestamp();
  normalized.archivedReason = optionalText(reason) || null;
  return normalized;
}

export function restoreCharacterRecord(record) {
  const normalized = normalizeCharacterRecord(record);
  normalized.status = 'active';
  normalized.archivedAt = null;
  normalized.archivedReason = null;
  return normalized;
}

export function canPermanentlyDeleteCharacterRecord(record, { activeReferences = 0, pendingDiffs = 0 } = {}) {
  const normalized = normalizeCharacterRecord(record);
  return normalized.status === 'archived' && activeReferences === 0 && pendingDiffs === 0;
}

export function currentCharacterSheet(record) {
  const normalized = normalizeCharacterRecord(record);
  return copy(normalized.revisions.find(candidate => candidate.revision === normalized.currentRevision));
}

export function reviseCharacterRecord(record, input, { timestamp } = {}) {
  if (typeof timestamp !== 'function') throw new Error('修订角色卡需要时间提供器。');
  const normalizedRecord = normalizeCharacterRecord(record);
  const current = currentCharacterSheet(normalizedRecord);
  const next = normalizeCharacterSheet({
    ...current, ...copy(input || {}), characterId: current.characterId, revision: current.revision + 1,
    previousRevision: current.revision, createdAt: current.createdAt, revisedAt: timestamp(),
  });
  normalizedRecord.revisions.push(copy(next)); normalizedRecord.currentRevision = next.revision;
  return { record: normalizedRecord, revision: copy(next) };
}

export function settleControlledEntitiesAfterLongRest(record, { timestamp, eventId, reason = '', renewedEntityIds = [] } = {}) {
  if (typeof timestamp !== 'function') throw new Error('登记受控生物长休需要时间提供器。');
  const normalized = normalizeCharacterRecord(record);
  if (normalized.status === 'archived') throw new Error('已归档角色不能登记受控生物的长休结算。');
  const current = currentCharacterSheet(normalized), at = timestamp(), id = optionalText(eventId) || `long-rest:${at}`;
  const changes = [], renewed = new Set((renewedEntityIds || []).map(optionalText).filter(Boolean));
  const controlledEntities = (current.controlledEntities || []).map(entity => {
    const duration = entity.duration || normalizeControlledDuration();
    const consumesRest = entity.status === 'controlled' && (duration.kind === 'one-long-rest' || (duration.kind === 'custom' && duration.unit === 'long-rests'));
    if (!consumesRest) return entity;
    const renews = renewed.has(entity.id) && duration.kind === 'one-long-rest';
    const remaining = renews ? Math.max(1, duration.initial || 1) : Math.max(0, (duration.remaining || 1) - 1);
    const expired = remaining === 0;
    const next = {
      ...entity,
      status: expired ? 'expired-uncontrolled' : entity.status,
      duration: { ...duration, remaining },
      history: [...(entity.history || []), { eventId:id, type:renews ? 'control-renewed' : 'long-rest-settled', at, round:null, status:expired ? 'expired-uncontrolled' : entity.status, reason:optionalText(reason) || (renews ? 'DM 确认：已在到期前续控一次' : 'DM 登记控制者完成一次长休') }],
    };
    changes.push({ id:entity.id, fromStatus:entity.status, toStatus:next.status, remaining, action:renews ? 'renewed' : (expired ? 'expired' : 'settled') });
    return next;
  });
  if (!changes.length) throw new Error('当前没有需要以长休结算的有效受控生物。');
  const result = reviseCharacterRecord(normalized, { ...current, controlledEntities }, { timestamp: () => at });
  return { ...result, changes, settledAt:at };
}

export function recordControlledEntityRenewalRequested(record, controlledEntityId, { timestamp, eventId, reason = '' } = {}) {
  if (typeof timestamp !== 'function') throw new Error('记录续控意图需要时间提供器。');
  const normalized = normalizeCharacterRecord(record);
  if (normalized.status === 'archived') throw new Error('已归档角色不能记录续控意图。');
  const current = currentCharacterSheet(normalized), id = optionalText(controlledEntityId), at = timestamp();
  const entity = (current.controlledEntities || []).find(candidate => candidate.id === id);
  if (!entity) throw new Error('找不到受控生物关系。');
  if (entity.status !== 'expired-uncontrolled') throw new Error('只有已到期失控的受控生物可以记录续控意图。');
  const controlledEntities = current.controlledEntities.map(candidate => candidate.id !== id ? candidate : ({
    ...candidate, history:[...(candidate.history || []), { eventId:optionalText(eventId) || `renewal-requested:${at}`, type:'renewal-requested', at, round:null, status:candidate.status, reason:optionalText(reason) || 'DM 记录：尝试通过未来获准法术续控' }],
  }));
  return reviseCharacterRecord(normalized, { ...current, controlledEntities }, { timestamp: () => at });
}

export function weaponMasteryEligibleAttacks(rawSheet) {
  const sheet = normalizeCharacterSheet(rawSheet);
  return sheet.attackProfiles.flatMap(attack => {
    const admitted = M1_S5_WEAPON_MASTERY_CATALOG[attack.weaponKind || attack.name];
    if (!attack.proficient || !admitted) return [];
    return [{ ...attack, ...admitted }];
  });
}

export function reviseWeaponMasterySelections(record, requestedWeaponIds, { timestamp, reason = '' } = {}) {
  if (typeof timestamp !== 'function') throw new Error('武器精通长休选择需要时间提供器。');
  const normalizedRecord = normalizeCharacterRecord(record);
  if (normalizedRecord.status === 'archived') throw new Error('已归档角色不能更改武器精通选择。');
  const current = currentCharacterSheet(normalizedRecord), mastery = current.weaponMastery;
  if (!(mastery.grants || []).length) throw new Error('该角色没有已记录的武器精通资格。');
  if (mastery.changeTiming !== 'finish-long-rest') throw new Error('当前资料没有确认武器精通可在长休结束时更换。');
  const explanation = optionalText(reason);
  if (!explanation) throw new Error('长休结束后的武器精通选择必须填写 DM 确认说明。');
  const eligible = weaponMasteryEligibleAttacks(current), eligibleById = new Map(eligible.map(attack => [attack.weaponId, attack]));
  const weaponIds = [...new Set((Array.isArray(requestedWeaponIds) ? requestedWeaponIds : []).map(optionalText).filter(Boolean))];
  if (!weaponIds.length) throw new Error('请至少选择一种合资格武器。');
  const limit = nonNegative(mastery.selectionLimit, 0);
  if (!limit || weaponIds.length > limit) throw new Error(`武器精通最多选择 ${limit || 0} 种武器。`);
  const invalid = weaponIds.filter(weaponId => !eligibleById.has(weaponId));
  if (invalid.length) throw new Error(`武器精通选择不在已准入且熟练的武器候选中：${invalid.join('、')}。`);
  const previousByWeaponId = new Map((mastery.selections || []).map(selection => [selection.weaponId, selection]));
  const selections = weaponIds.map(weaponId => {
    const attack = eligibleById.get(weaponId), previous = previousByWeaponId.get(weaponId);
    return {
      id: previous?.id || `mastery-selection:${weaponId}`, weaponKind: attack.weaponKind || attack.name, weaponId,
      masteryPropertyId: attack.masteryPropertyId, masteryTerm: attack.masteryTerm,
      status: 'dm-confirmed', sourceStatus: 'dm-confirmed-after-long-rest', rulesReference: M1_S5_RULES.masteryProperties,
    };
  });
  const confirmedAt = timestamp();
  const selected = new Set(weaponIds);
  const attackProfiles = current.attackProfiles.map(attack => {
    const admitted = M1_S5_WEAPON_MASTERY_CATALOG[attack.weaponKind || attack.name];
    if (!admitted || !attack.proficient) return { ...attack, masteryEnabled: false };
    return { ...attack, ...admitted, masteryEnabled: selected.has(admitted.weaponId) };
  });
  return reviseCharacterRecord(normalizedRecord, {
    ...current, attackProfiles,
    weaponMastery: { ...mastery, status: 'dm-confirmed', selections, note: explanation, selectionReason: explanation, confirmedAt },
  }, { timestamp: () => confirmedAt });
}

function flatten(value, prefix = '', output = {}) {
  if (Array.isArray(value)) { output[prefix] = JSON.stringify(value); return output; }
  if (value && typeof value === 'object') { Object.entries(value).forEach(([key, child]) => flatten(child, prefix ? `${prefix}.${key}` : key, output)); return output; }
  output[prefix] = value; return output;
}

export function diffCharacterRevisions(before, after) {
  const ignored = new Set(['schemaVersion', 'characterId', 'revision', 'previousRevision', 'createdAt', 'revisedAt']);
  const left = flatten(normalizeCharacterSheet(before)); const right = flatten(normalizeCharacterSheet(after));
  return [...new Set([...Object.keys(left), ...Object.keys(right)])]
    .filter(path => !ignored.has(path) && !path.startsWith('derivedValues.') && left[path] !== right[path])
    .map(path => ({ path, before: left[path] ?? null, after: right[path] ?? null }));
}

export function createCombatProjection(sheet, { id, timestamp } = {}) {
  if (typeof id !== 'function' || typeof timestamp !== 'function') throw new Error('创建战斗投影需要 ID 与时间提供器。');
  const snapshot = normalizeCharacterSheet(sheet);
  return {
    schemaVersion: CHARACTER_SHEET_SCHEMA_VERSION, projectionId: id(), createdAt: timestamp(),
    characterId: snapshot.characterId, characterRevision: snapshot.revision, sheetSnapshot: copy(snapshot), name: snapshot.name,
    armorClass: snapshot.armorClass, hp: copy(snapshot.hp), speed: snapshot.speed, initiativeModifier: snapshot.initiativeModifier,
    footprint: copy(snapshot.footprint),
    resources: Object.fromEntries(Object.entries(snapshot.resources).map(([name, pool]) => [name, pool.current])),
    resourceMax: Object.fromEntries(Object.entries(snapshot.resources).map(([name, pool]) => [name, pool.max])),
    attackProfiles: copy(snapshot.attackProfiles), actions: copy(snapshot.actions), equipment: copy(snapshot.equipment),
    weaponMastery: copy(snapshot.weaponMastery), linkedEntities: copy(snapshot.linkedEntities), controlledEntities: copy(snapshot.controlledEntities),
    spellcastingProfiles: copy(snapshot.spellcastingProfiles), spellResourcePools: copy(snapshot.spellResourcePools), spells: copy(snapshot.spells),
    inventoryBalances: snapshot.equipment.filter(item => item.consumable || item.itemKind === 'item-charge').map(item => ({
      id: `inventory:${item.id}`, itemId: item.id, kind: item.itemKind === 'item-charge' ? 'item-charge' : (item.ammunitionOrResourceLink ? 'ammunition' : 'consumable'),
      label: item.name, current: item.quantity, max: item.quantity, sourceStatus: item.sourceStatus,
    })),
  };
}

export function createEncounterMemberFromProjection(projection, { id, position = { x: 0, y: 0 } } = {}) {
  if (typeof id !== 'function') throw new Error('创建遭遇成员需要 ID 提供器。');
  const projectionSnapshot = copy(projection);
  const templateSnapshot = {
    id: `character:${projection.characterId}`, revision: projection.characterRevision, sourceType: 'character-sheet', name: projection.name,
    kind: 'character', relation: 'ally', armorClass: projection.armorClass, maxHp: projection.hp.max, speed: projection.speed,
    initiativeModifier: projection.initiativeModifier, footprint: [projection.footprint.widthCells, projection.footprint.heightCells],
    resources: copy(projection.resources), attackProfiles: copy(projection.attackProfiles || []), actions: copy(projection.actions || []),
    equipment: copy(projection.equipment || []), weaponMastery: copy(projection.weaponMastery || { status: 'unknown', grants: [], selections: [] }),
    linkedEntities: copy(projection.linkedEntities || []), controlledEntities: copy(projection.controlledEntities || []), spellcastingProfiles: copy(projection.spellcastingProfiles || []),
    spellResourcePools: copy(projection.spellResourcePools || []), spells: copy(projection.spells || []), inventoryBalances: copy(projection.inventoryBalances || []), sourceStatus: 'dm-authored-character-revision',
  };
  return {
    id: id(), templateId: templateSnapshot.id, templateRevision: templateSnapshot.revision, templateSnapshot,
    combatProjectionId: projection.projectionId, combatProjectionSnapshot: projectionSnapshot,
    characterSheetRef: { characterId: projection.characterId, revision: projection.characterRevision },
    name: projection.name, shortLabel: '', color: '#67b999', kind: 'character', relation: 'ally',
    hp: projection.hp.current, maxHp: projection.hp.max, tempHp: 0, speed: projection.speed, initiativeModifier: projection.initiativeModifier,
    legendaryActionMax: 0, resources: copy(projection.resources), resourceMax: copy(projection.resourceMax), slots: {}, slotsMax: {}, conditions: [],
    attackProfiles: copy(projection.attackProfiles || []), actions: copy(projection.actions || []), equipment: copy(projection.equipment || []),
    weaponMastery: copy(projection.weaponMastery || { status: 'unknown', grants: [], selections: [] }), linkedEntities: copy(projection.linkedEntities || []), controlledEntities: copy(projection.controlledEntities || []),
    spellcastingProfiles: copy(projection.spellcastingProfiles || []), spellResourcePools: copy(projection.spellResourcePools || []), spells: copy(projection.spells || []), inventoryBalances: copy(projection.inventoryBalances || []),
    position: copy(position), footprint: copy(projection.footprint), facing: 'north', facingPort: null, elevationFeet: 0,
    deployment: 'field', deployedCombatantId: null,
  };
}

export function applyCombatResourceChange(combatant, key, amount) {
  if (!Object.hasOwn(combatant?.resources || {}, key)) throw new Error(`参战实例不存在资源“${key}”。`);
  const before = nonNegative(combatant.resources[key]); const maximum = nonNegative(combatant.resourceMax?.[key], before);
  const after = Math.max(0, Math.min(maximum, before + integer(amount))); combatant.resources[key] = after;
  return { combatantId: combatant.id, key, amount: integer(amount), before, after };
}

export function compensateCombatResourceChange(combatant, eventPayload) {
  if (combatant?.id !== eventPayload?.combatantId) throw new Error('补偿事件与参战实例不匹配。');
  if (!Object.hasOwn(combatant.resources || {}, eventPayload.key)) throw new Error('补偿事件引用了不存在的资源。');
  combatant.resources[eventPayload.key] = nonNegative(eventPayload.before); return combatant.resources[eventPayload.key];
}

export function applyCombatSpellResourceChange(combatant, poolId, balanceId, amount) {
  const pool = (combatant?.spellResourcePools || []).find(candidate => candidate.id === poolId);
  if (!pool) throw new Error(`参战实例不存在施法资源池“${poolId}”。`);
  const balance = (pool.balances || []).find(candidate => candidate.id === balanceId);
  if (!balance) throw new Error(`施法资源池“${pool.label}”不存在余额“${balanceId}”。`);
  const before = nonNegative(balance.current), maximum = nonNegative(balance.max, before), delta = integer(amount);
  const after = Math.max(0, Math.min(maximum, before + delta)); balance.current = after;
  return { combatantId: combatant.id, poolId, balanceId, amount: delta, before, after };
}

export function applyCombatInventoryBalanceChange(combatant, balanceId, amount) {
  const balance = (combatant?.inventoryBalances || []).find(candidate => candidate.id === balanceId);
  if (!balance) throw new Error(`参战实例不存在库存余额“${balanceId}”。`);
  const before = nonNegative(balance.current), maximum = nonNegative(balance.max, before), delta = integer(amount);
  const after = Math.max(0, Math.min(maximum, before + delta)); balance.current = after;
  return { combatantId: combatant.id, balanceId, itemId: balance.itemId, amount: delta, before, after };
}

export function createLinkedEntityProjection(projection, linkedEntity, template, { id, timestamp } = {}) {
  if (typeof id !== 'function' || typeof timestamp !== 'function') throw new Error('物化关联单位需要 ID 与时间提供器。');
  if (!projection?.projectionId || !linkedEntity?.id || !template?.id) throw new Error('关联单位物化缺少投影、关系或模板。');
  return {
    projectionId: id(), createdAt: timestamp(), sourceCombatProjectionId: projection.projectionId,
    sourceCharacterRef: { characterId: projection.characterId, revision: projection.characterRevision },
    linkedEntityRef: { id: linkedEntity.id, name: linkedEntity.name, relation: linkedEntity.relation },
    unitTemplateRef: { templateId: template.id, templateRevision: template.revision || 1 }, unitTemplateSnapshot: copy(template),
  };
}

export function buildPostCombatDiff(projection, combatant, { id, timestamp, sourceSessionId = null, sourceEventSequence = 0 } = {}) {
  if (typeof id !== 'function' || typeof timestamp !== 'function') throw new Error('生成战后差异需要 ID 与时间提供器。');
  if (combatant?.combatProjectionId !== projection?.projectionId) throw new Error('参战实例与战斗投影不匹配。');
  const entries = [];
  if (combatant.hp !== projection.hp.current) entries.push({ id: 'hp.current', kind: 'hp-current', label: '当前 HP', before: projection.hp.current, after: combatant.hp, delta: combatant.hp - projection.hp.current, status: 'pending' });
  Object.entries(projection.resources).forEach(([name, before]) => {
    const after = nonNegative(combatant.resources?.[name], before);
    if (after !== before) entries.push({ id: `resource:${name}`, kind: 'resource', resourceName: name, label: `资源：${name}`, before, after, delta: after - before, status: 'pending' });
  });
  (projection.spellResourcePools || []).forEach(pool => (pool.balances || []).forEach(balance => {
    const currentPool = (combatant.spellResourcePools || []).find(candidate => candidate.id === pool.id);
    const currentBalance = (currentPool?.balances || []).find(candidate => candidate.id === balance.id);
    const after = nonNegative(currentBalance?.current, balance.current);
    if (after !== balance.current) entries.push({ id: `spell-resource:${pool.id}:${balance.id}`, kind: 'spell-resource', poolId: pool.id, balanceId: balance.id, label: `施法资源：${pool.label} / ${balance.label}`, before: balance.current, after, delta: after - balance.current, status: 'pending' });
  }));
  (projection.inventoryBalances || []).forEach(balance => {
    const current = (combatant.inventoryBalances || []).find(candidate => candidate.id === balance.id);
    const after = nonNegative(current?.current, balance.current);
    if (after !== balance.current) entries.push({ id: `inventory:${balance.id}`, kind: 'inventory', balanceId: balance.id, itemId: balance.itemId, label: `库存：${balance.label}`, before: balance.current, after, delta: after - balance.current, status: 'pending' });
  });
  (combatant.deathRecord?.resolutions || []).filter(resolution => resolution?.type === 'pc-return-to-life').forEach(resolution => {
    let appendText;
    try { appendText = revivalNoteAppendText(resolution); }
    catch { return; }
    entries.push({
      id: `note-append:pc-return-to-life:${resolution.resolutionId}`, kind: 'note-append', label: 'DM 备注：追加复活记录',
      before: optionalText(projection.sheetSnapshot?.note), after: appendText, appendText,
      resolutionId: resolution.resolutionId, resolutionRound: resolution.round ?? null, status: 'pending',
    });
  });
  return {
    schemaVersion: CHARACTER_SHEET_SCHEMA_VERSION, diffId: id(), createdAt: timestamp(), sourceSessionId, sourceEventSequence,
    combatantId: combatant.id, combatProjectionId: projection.projectionId, characterId: projection.characterId,
    characterRevision: projection.characterRevision, characterName: projection.name, status: 'pending', entries, decisionEvent: null,
  };
}

export function abandonPostCombatDiff(diff, { timestamp, reason } = {}) {
  if (typeof timestamp !== 'function') throw new Error('废除战后差异需要时间提供器。');
  const snapshot = copy(diff);
  if (!snapshot?.diffId || snapshot.status !== 'pending') throw new Error('只能废除仍待审核的战后候选差异。');
  const abandonmentReason = optionalText(reason);
  if (!abandonmentReason) throw new Error('废除战后候选差异必须记录原因。');
  snapshot.status = 'abandoned';
  snapshot.decidedAt = timestamp();
  snapshot.abandonmentReason = abandonmentReason;
  snapshot.entries = (snapshot.entries || []).map(entry => ({ ...entry, status: 'abandoned' }));
  return snapshot;
}

export function applyPostCombatDiff(record, diff, acceptedEntryIds, { timestamp } = {}) {
  if (typeof timestamp !== 'function') throw new Error('应用战后差异需要时间提供器。');
  const recordSnapshot = normalizeCharacterRecord(record); const accepted = new Set(acceptedEntryIds || []);
  if (recordSnapshot.characterId !== diff?.characterId) throw new Error('差异与长期角色卡不匹配。');
  if (recordSnapshot.currentRevision !== diff.characterRevision) throw new Error('长期角色卡已有更新：该战后差异已过期，需要重新审核。');
  const knownEntries = new Map((diff.entries || []).map(entry => [entry.id, entry]));
  for (const entryId of accepted) if (!knownEntries.has(entryId)) throw new Error(`差异包含未知字段“${entryId}”。`);
  if (!accepted.size) return { record: recordSnapshot, revision: null, acceptedEntryIds: [] };
  const nextInput = currentCharacterSheet(recordSnapshot);
  for (const entryId of accepted) {
    const entry = knownEntries.get(entryId);
    if (entry.kind === 'hp-current') nextInput.hp.current = Math.max(0, Math.min(nextInput.hp.max, nonNegative(entry.after)));
    else if (entry.kind === 'resource' && Object.hasOwn(nextInput.resources, entry.resourceName)) nextInput.resources[entry.resourceName].current = Math.max(0, Math.min(nextInput.resources[entry.resourceName].max, nonNegative(entry.after)));
    else if (entry.kind === 'spell-resource') {
      const pool = nextInput.spellResourcePools.find(candidate => candidate.id === entry.poolId);
      const balance = pool?.balances.find(candidate => candidate.id === entry.balanceId);
      if (!balance) throw new Error(`施法资源差异引用了不存在的长期余额“${entry.poolId}/${entry.balanceId}”。`);
      balance.current = Math.max(0, Math.min(balance.max, nonNegative(entry.after)));
    }
    else if (entry.kind === 'inventory') {
      const item = nextInput.equipment.find(candidate => candidate.id === entry.itemId);
      if (!item) throw new Error(`库存差异引用了不存在的长期物品“${entry.itemId}”。`);
      item.quantity = Math.max(0, nonNegative(entry.after));
    }
    else if (entry.kind === 'note-append') {
      const appendText = optionalText(entry.appendText || entry.after);
      if (!appendText) throw new Error(`备注差异“${entry.id}”缺少可追加文本。`);
      nextInput.note = [optionalText(nextInput.note), appendText].filter(Boolean).join('\n\n');
    }
    else if (entry.kind === 'controlled-entity') {
      const entity = normalizeControlledEntities([entry.controlledEntity])[0];
      if ((nextInput.controlledEntities || []).some(candidate => candidate.id === entity.id)) throw new Error(`受控生物关系“${entity.name}”已经写入长期角色卡。`);
      nextInput.controlledEntities = [...(nextInput.controlledEntities || []), entity];
    }
    else throw new Error(`差异字段“${entryId}”不能安全写入当前角色卡。`);
  }
  return { ...reviseCharacterRecord(recordSnapshot, nextInput, { timestamp }), acceptedEntryIds: [...accepted] };
}

export function applyPostCombatDecisions(record, diff, decisions, { timestamp } = {}) {
  const normalized = (decisions || []).map(item => ({ entryId: optionalText(item?.entryId), action: optionalText(item?.action), correctedValue: item?.correctedValue, reason: optionalText(item?.reason) }));
  const entries = new Map((diff?.entries || []).map(entry => [entry.id, entry]));
  if (normalized.length !== entries.size) throw new Error('每个战后差异都必须有一项决定。');
  const accepted = [], overrides = new Map();
  for (const decision of normalized) {
    const entry = entries.get(decision.entryId);
    if (!entry || !['accept', 'reject', 'correct'].includes(decision.action)) throw new Error('战后决定无效。');
    if (decision.action === 'correct') {
      if (entry.kind === 'note-append' || entry.kind === 'controlled-entity') throw new Error('备注或受控生物候选只能接受或拒绝，不能数值更正。');
      if (decision.correctedValue === '' || decision.correctedValue === null || decision.correctedValue === undefined || !decision.reason) throw new Error('修正必须填写数值和原因。');
      overrides.set(entry.id, nonNegative(decision.correctedValue)); accepted.push(entry.id);
    } else if (decision.action === 'accept') accepted.push(entry.id);
  }
  const altered = { ...diff, entries: (diff.entries || []).map(entry => overrides.has(entry.id) ? { ...entry, after: overrides.get(entry.id) } : entry) };
  return { ...applyPostCombatDiff(record, altered, accepted, { timestamp }), decisions: normalized };
}
