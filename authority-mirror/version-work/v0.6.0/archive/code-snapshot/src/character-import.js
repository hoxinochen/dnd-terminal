export const BEILING_PROFILE = Object.freeze({
  importerId: 'beiling-dnd55e-character-sheet', version: '1.0.15',
  sampleSha256: '939d43cb1a33ec7c77ef4f2e96cef83c711dda31f2d7004d91418ac61bdc8711',
  requiredSheets: ['起源', '主要', '背包', '盟友与魔宠', '法术书'],
});

const text = value => String(value ?? '').trim();
const numberOrNull = value => {
  const normalized = text(value);
  return normalized !== '' && Number.isFinite(Number(normalized)) ? Math.trunc(Number(normalized)) : null;
};
const abilityRows = Object.freeze([['strength', 13], ['dexterity', 14], ['constitution', 15], ['intelligence', 16], ['wisdom', 17], ['charisma', 18]]);
const skillRows = Object.freeze([41, 43, 44, 45, 47, 48, 49, 50, 51, 53, 54, 55, 56, 57, 59, 60, 61, 62]);
const featureBlocks = Object.freeze([
  { category: 'class-feature', rows: [17, 18, 19, 20, 21, 22, 23, 24, 25], levelColumn: 'AW', nameColumn: 'AX', descriptionColumn: 'BC' },
  { category: 'species-feature', rows: [3, 4, 5, 6, 7, 8, 9, 10, 11], nameColumn: 'BT', descriptionColumn: 'BZ' },
  { category: 'feat', rows: [19, 20, 21, 22, 23, 24, 25, 26], levelColumn: 'BT', nameColumn: 'BU', descriptionColumn: 'BZ' },
  { category: 'fighting-style', rows: [33, 34, 35, 36, 37], nameColumn: 'BT', descriptionColumn: 'BZ' },
  { category: 'special', rows: [40, 41, 42, 43, 44, 45], nameColumn: 'BT', descriptionColumn: 'BZ' },
]);

function cell(workbook, sheet, ref) { return workbook?.sheets?.[sheet]?.cells?.[ref] || { value: '', formula: '' }; }
function cellValue(workbook, sheet, ref) { return text(cell(workbook, sheet, ref).value); }

function profileCheck(workbook) {
  const names = Object.keys(workbook?.sheets || {});
  const missingSheets = BEILING_PROFILE.requiredSheets.filter(name => !names.includes(name));
  const markers = [
    ['主要', 'A1', value => value.includes('DND') && value.includes('人物卡')],
    ['主要', 'C13', value => value === '力量'],
    ['主要', 'C14', value => value === '敏捷'],
    ['主要', 'E3', value => value !== ''],
    ['起源', 'A1', value => value.includes('人物背景')],
  ];
  const failedMarkers = markers.filter(([sheet, ref, matches]) => !matches(cellValue(workbook, sheet, ref))).map(([sheet, ref]) => `${sheet}!${ref}`);
  const sheetCountMatches = names.length === 18;
  return { supported: !missingSheets.length && !failedMarkers.length && sheetCountMatches, missingSheets, failedMarkers, sheetCount: names.length, sheetCountMatches };
}

function sourceCell(workbook, sheet, ref) {
  const raw = cell(workbook, sheet, ref);
  return { sheet, ref, value: text(raw.value), formulaCached: Boolean(text(raw.formula)), formula: text(raw.formula) || null };
}

function mappedField(mappings, workbook, path, sheet, ref, transform = value => value, options = {}) {
  const source = sourceCell(workbook, sheet, ref);
  const value = transform(source.value);
  const status = source.value === '' ? 'missing' : (source.formulaCached ? 'formula-cache' : 'mapped');
  mappings.push({ path, status, source, value, required: options.required === true });
  return value;
}

function mappedSkills(mappings, workbook) {
  return skillRows.map(row => {
    const name = mappedField(mappings, workbook, `skills.${row}.name`, '主要', `C${row}`);
    const sourceMark = mappedField(mappings, workbook, `skills.${row}.sourceMark`, '主要', `B${row}`);
    const bonus = mappedField(mappings, workbook, `skills.${row}.bonus`, '主要', `I${row}`, numberOrNull);
    const proficiencyRank = proficiencyRankFromMark(sourceMark);
    return name ? { id: `skill-${row}`, name, proficiencyRank, proficient: ['proficient', 'expertise'].includes(proficiencyRank), sourceMark, bonus, status: proficiencyRank === 'unknown' ? 'needs-review' : 'imported-needs-review', sourceRef: `主要!B${row}:I${row}` } : null;
  }).filter(Boolean);
}

function proficiencyRankFromMark(value) {
  const mark = text(value).replace(/\s+/g, '');
  if (['🅞', '◎', '◉', '⊙'].includes(mark)) return 'expertise';
  if (['O', '○', '◯'].includes(mark.toUpperCase())) return 'proficient';
  if (['X', '×', '✕'].includes(mark.toUpperCase())) return 'none';
  return 'unknown';
}

function mappedSaves(mappings, workbook) {
  return abilityRows.map(([, row]) => {
    const name = mappedField(mappings, workbook, `saves.${row}.name`, '主要', `C${row}`);
    const sourceMark = mappedField(mappings, workbook, `saves.${row}.sourceMark`, '主要', `B${row}`);
    const bonus = mappedField(mappings, workbook, `saves.${row}.bonus`, '主要', `T${row}`, numberOrNull);
    const proficiencyRank = proficiencyRankFromMark(sourceMark);
    return { id: `save-${row}`, name, proficiencyRank, proficient: ['proficient', 'expertise'].includes(proficiencyRank), sourceMark, bonus, status: proficiencyRank === 'unknown' ? 'needs-review' : 'imported-needs-review', sourceRef: `主要!B${row}:T${row}` };
  });
}

function mappedFeatures(mappings, workbook) {
  const features = [];
  for (const block of featureBlocks) for (const row of block.rows) {
    const nameRef = `${block.nameColumn}${row}`;
    if (!cellValue(workbook, '主要', nameRef)) continue;
    const name = mappedField(mappings, workbook, `features.${nameRef}.name`, '主要', nameRef);
    const descriptionRef = `${block.descriptionColumn}${row}`;
    const description = mappedField(mappings, workbook, `features.${nameRef}.description`, '主要', descriptionRef);
    const level = block.levelColumn ? mappedField(mappings, workbook, `features.${nameRef}.level`, '主要', `${block.levelColumn}${row}`, numberOrNull) : null;
    features.push({ id: `feature-${nameRef.toLowerCase()}`, category: block.category, name, level, description, sourceStatus: 'imported-needs-review', sourceRef: `主要!${nameRef}:${descriptionRef}`, rulesEntryId: '', automationStatus: 'display-only' });
  }
  return features;
}

function mappedWeaponMastery(features) {
  const feature = features.find(item => item.category === 'class-feature' && text(item.name) === '武器精通');
  if (!feature) return {
    status: 'not-applicable', selectionLimit: 0, changeTiming: 'unknown', grants: [], selections: [],
    note: '受控导入未识别到“武器精通”职业特性；不要求 DM 选择武器精通。',
  };
  return {
    status: 'needs-review', selectionLimit: 2, changeTiming: 'finish-long-rest', selections: [],
    grants: [{
      id: 'imported-weapon-mastery', sourceKind: 'class-feature', sourceName: feature.name, capacity: 2,
      eligibility: '角色熟练的两种武器', changeTiming: 'finish-long-rest', sourceStatus: 'imported-needs-review', sourceRef: feature.sourceRef,
    }],
    note: 'Excel 显示“武器精通”职业特性，但未可靠标出当前选择；等待 DM 确认。',
  };
}

function mappedWeapons(mappings, workbook) {
  const attackProfiles = [], equipment = [];
  for (const row of [32, 33, 34, 35, 36]) {
    const name = cellValue(workbook, '主要', `B${row}`); if (!name) continue;
    const itemId = `main-weapon-${row}`;
    mappedField(mappings, workbook, `equipment.${itemId}.name`, '主要', `B${row}`);
    const attunementMark = mappedField(mappings, workbook, `equipment.${itemId}.attunementMark`, '主要', `F${row}`);
    const properties = mappedField(mappings, workbook, `attackProfiles.${itemId}.properties`, '主要', `M${row}`);
    const proficiencyMark = mappedField(mappings, workbook, `attackProfiles.${itemId}.proficiencyMark`, '主要', `W${row}`);
    const attackBonus = mappedField(mappings, workbook, `attackProfiles.${itemId}.attackBonus`, '主要', `Z${row}`, numberOrNull);
    const damageDie = mappedField(mappings, workbook, `attackProfiles.${itemId}.damageDie`, '主要', `AB${row}`);
    const damageModifier = mappedField(mappings, workbook, `attackProfiles.${itemId}.damageModifier`, '主要', `AD${row}`);
    const damageType = mappedField(mappings, workbook, `attackProfiles.${itemId}.damageType`, '主要', `AF${row}`);
    const masteryTerm = mappedField(mappings, workbook, `attackProfiles.${itemId}.masteryTerm`, '主要', `AN${row}`);
    const masteryDescription = mappedField(mappings, workbook, `attackProfiles.${itemId}.masteryDescription`, '主要', `AP${row}`);
    const weaponProficiencyRank = proficiencyRankFromMark(proficiencyMark);
    equipment.push({ id: itemId, name, quantity: 1, equipped: true, attuned: false, attunementMark, container: '随身', consumable: false, itemKind: 'weapon', weaponProficiencyRank, masteryTerm, description: properties, sourceRef: `主要!B${row}:AP${row}`, sourceStatus: 'imported-needs-review', note: `${masteryDescription}${attunementMark?`；原表“同调”标识=${attunementMark}，未自动解释。`:''}` });
    attackProfiles.push({ id: `attack-main-${row}`, inventoryItemId: itemId, weaponKind: name, name, proficient: weaponProficiencyRank !== 'none', ability: 'unknown', attackBonus, damage: `${damageDie}${damageModifier}`.trim(), damageType, reach: properties, resourceLink: '', masteryTerm, masteryEnabled: false, sourceStatus: 'imported-needs-review', note: masteryDescription });
  }
  const armorName = cellValue(workbook, '主要', 'R40') || cellValue(workbook, '主要', 'L40');
  if (armorName) {
    mappedField(mappings, workbook, 'equipment.main-armor-40.name', '主要', cellValue(workbook, '主要', 'R40') ? 'R40' : 'L40');
    equipment.push({ id: 'main-armor-40', name: armorName, quantity: 1, equipped: true, attuned: false, container: '已装备', consumable: false, itemKind: 'armor', sourceRef: '主要!L40:V40', sourceStatus: 'imported-needs-review', note: '来自主要 Sheet 装备区；未执行护甲计算。' });
  }
  return { attackProfiles, equipment };
}

function mappedBackpack(mappings, workbook) {
  const equipment = [], inventoryContainers = [{ id: 'container-carried', name: '随身', parentId: null, kind: 'carried', sourceRef: '主要!B30:AS62' }];
  const blocks = [
    { id: 'container-backpack-1', name: '背包1', rows: [5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], columns: { name: 'Y', rarity: 'AC', description: 'AE', weight: 'AP', quantity: 'AS' } },
    { id: 'container-backpack-2', name: '背包2', rows: [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49], columns: { name: 'B', rarity: 'F', description: 'H', weight: 'S', quantity: 'V' } },
    { id: 'container-bag-of-holding', name: '次元袋', rows: [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49], columns: { name: 'Y', rarity: 'AC', description: 'AE', weight: 'AP', quantity: 'AS' } },
  ];
  for (const block of blocks) {
    let count = 0;
    for (const row of block.rows) {
      const nameRef = `${block.columns.name}${row}`, name = cellValue(workbook, '背包', nameRef); if (!name) continue;
      const itemId = `backpack-${block.id.replace('container-', '')}-${row}`;
      mappedField(mappings, workbook, `equipment.${itemId}.name`, '背包', nameRef);
      const rarity = mappedField(mappings, workbook, `equipment.${itemId}.rarity`, '背包', `${block.columns.rarity}${row}`);
      const description = mappedField(mappings, workbook, `equipment.${itemId}.description`, '背包', `${block.columns.description}${row}`);
      const weight = mappedField(mappings, workbook, `equipment.${itemId}.weight`, '背包', `${block.columns.weight}${row}`, value => value === '' ? null : Number(value));
      const quantity = mappedField(mappings, workbook, `equipment.${itemId}.quantity`, '背包', `${block.columns.quantity}${row}`, numberOrNull);
      equipment.push({ id: itemId, name, quantity: quantity ?? 1, equipped: false, attuned: false, container: block.name, consumable: name.includes('箭矢'), itemKind: 'gear', rarity, description, weight: Number.isFinite(weight) ? weight : null, sourceRef: `背包!${nameRef}:${block.columns.quantity}${row}`, sourceStatus: 'imported-needs-review', note: '' }); count += 1;
    }
    if (count) inventoryContainers.push({ id: block.id, name: block.name, parentId: null, kind: 'inventory', sourceRef: block.name === '背包1' ? '背包!Y3:AS25' : `${block.name === '背包2' ? '背包!B27:V49' : '背包!Y27:AS49'}` });
  }
  return { equipment, inventoryContainers };
}

function formulaWarnings(mappings) {
  return mappings.filter(item => item.status === 'formula-cache').map(item => `“${item.path}”使用 ${item.source.sheet}!${item.source.ref} 的公式缓存值；DND Terminal 没有执行或重算公式。`);
}

export function createRejectedDraft({ fileName = '', fileSha256 = null, reason, diagnostics = [] } = {}) {
  return {
    kind: 'CharacterDraft', status: 'rejected', importer: { ...BEILING_PROFILE }, fileName: text(fileName), fileSha256,
    reason: text(reason) || '未知导入错误。', diagnostics: [...diagnostics], mappings: [], missing: [], defaults: [], conflicts: [], warnings: [], unmapped: [], input: null,
  };
}

export function buildBeilingCharacterDraft({ fileName = '', fileSha256 = null, workbook } = {}) {
  const profile = profileCheck(workbook);
  if (!profile.supported) return createRejectedDraft({ fileName, fileSha256, reason: '工作簿不符合 beiling-dnd55e-character-sheet@1.0.15 的冻结结构指纹。', diagnostics: [
    profile.missingSheets.length ? `缺少工作表：${profile.missingSheets.join('、')}` : '',
    profile.failedMarkers.length ? `关键标记不匹配：${profile.failedMarkers.join('、')}` : '',
    !profile.sheetCountMatches ? `工作表数量不匹配：预期 18，实际 ${profile.sheetCount}` : '',
  ].filter(Boolean) });

  const mappings = [];
  const name = mappedField(mappings, workbook, 'name', '主要', 'E3', value => value, { required: true });
  const ownerHint = mappedField(mappings, workbook, 'ownerHint', '主要', 'E4');
  const className = mappedField(mappings, workbook, 'classes.0.name', '主要', 'E6');
  const subclass = mappedField(mappings, workbook, 'classes.0.subclass', '主要', 'I6');
  const classLevel = mappedField(mappings, workbook, 'classes.0.level', '主要', 'O6', numberOrNull);
  const species = [mappedField(mappings, workbook, 'origin.species.primary', '主要', 'T6'), mappedField(mappings, workbook, 'origin.species.subspecies', '主要', 'T7')].filter(Boolean).join(' / ');
  const background = mappedField(mappings, workbook, 'origin.background', '起源', 'E6');
  const history = mappedField(mappings, workbook, 'origin.history', '起源', 'S17');
  const abilities = Object.fromEntries(abilityRows.map(([key, row]) => [key, { score: mappedField(mappings, workbook, `abilities.${key}.score`, '主要', `F${row}`, numberOrNull) }]));
  const hpCurrent = mappedField(mappings, workbook, 'hp.current', '主要', 'R22', numberOrNull, { required: true });
  const hpMax = mappedField(mappings, workbook, 'hp.max', '主要', 'V22', numberOrNull, { required: true });
  const armorClass = mappedField(mappings, workbook, 'armorClass', '主要', 'D23', numberOrNull, { required: true });
  const speed = mappedField(mappings, workbook, 'speed', '主要', 'AR24', numberOrNull, { required: true });
  const initiativeModifier = mappedField(mappings, workbook, 'initiativeModifier', '主要', 'D22', numberOrNull);
  const proficiencyBonus = mappedField(mappings, workbook, 'proficiencyBonus', '主要', 'S3', numberOrNull);
  const passivePerception = mappedField(mappings, workbook, 'passivePerception', '主要', 'L23', numberOrNull);
  const skills = mappedSkills(mappings, workbook);
  const saves = mappedSaves(mappings, workbook);
  const features = mappedFeatures(mappings, workbook), weaponMastery = mappedWeaponMastery(features);
  const mainItems = mappedWeapons(mappings, workbook), backpackItems = mappedBackpack(mappings, workbook);
  const defaults = [{ path: 'ruleVersion', value: '2024', reason: '固定 Profile 标题标明（2024）；未执行或核验其内置规则逻辑。' }];
  const missing = weaponMastery.grants.length ? [
    { path: 'weaponMastery.selections', reason: '主要表明确显示“武器精通”职业特性，但没有可靠标出当前选择；请由 DM 确认或保持 needs-review。' },
  ] : [];
  const highElfSpellSkeleton = species.includes('高等精灵') ? {
    spellcastingProfiles: [{ id: 'imported-high-elf', sourceKind: 'species', sourceName: '高等精灵施法来源（导入候选）', ability: 'unknown', spellAttack: { value: null, status: 'needs-review' }, saveDc: { value: null, status: 'needs-review' }, acquisitionMode: 'granted', preparationMode: 'unknown', preparedCount: { value: null, status: 'needs-review' }, resourcePoolIds: ['imported-high-elf-free'], ruleVersion: '2024', sourceStatus: 'imported-needs-review', sourceRef: '主要!T6:T7', note: 'Excel Profile 未稳定映射法术名称、施法属性或免费次数；等待 DM 确认。' }],
    spellResourcePools: [{ id: 'imported-high-elf-free', kind: 'free-cast', label: '高等精灵免费施放次数（待确认）', balances: [{ id: 'use', label: '免费次数', current: 0, max: 0 }], recovery: 'unknown', ruleVersion: '2024', sourceStatus: 'needs-review', note: '导入器不从工作簿公式或资料表推断次数。' }],
  } : { spellcastingProfiles: [], spellResourcePools: [] };
  const conflicts = species.includes('高等精灵') ? [{ path: 'spellcastingProfiles', reason: '高等精灵施法来源已建立待确认骨架，但施法属性、法术身份和免费次数存在多个或未知候选；必须由 DM 确认，不能自动选择。' }] : [];
  const warnings = [
    ...formulaWarnings(mappings),
    fileSha256 === BEILING_PROFILE.sampleSha256 ? '文件 SHA-256 与莉亚本地验证向量一致。' : '文件结构匹配 Profile，但 SHA-256 不等于莉亚验证向量；请在确认前人工核对。',
  ];
  const unmapped = [
    { area: '主要!B64:AO91', reason: '法术位、法术与内置规则计算未作为本 Profile 的稳定自动写入；施法骨架属于 M1-S4。' },
    { area: '背包!AV3:BL49', reason: '财务账本与收支不属于 M1-S3 角色装备模型。' },
    { area: '职业、装备、种族、背景、法术大全、数据表等内部/资料表', reason: '不读取工作簿内置规则数据库、资料库、导出逻辑、绘图或表现层资源。' },
  ];
  return {
    kind: 'CharacterDraft', status: 'needs-confirmation', importer: { ...BEILING_PROFILE }, fileName: text(fileName), fileSha256,
    mappings, missing, defaults, conflicts, warnings, unmapped,
    input: {
      name, ownerHint, ruleVersion: '2024', totalLevel: classLevel || 0,
      classes: className ? [{ name: className, subclass, level: classLevel || 1, sourceStatus: 'imported-needs-review' }] : [],
      origin: { species, background, history }, abilities, armorClass: armorClass ?? 0,
      hp: { current: hpCurrent ?? 0, max: hpMax ?? 1 }, speed: speed ?? 0, initiativeModifier: initiativeModifier ?? 0,
      proficiencyBonus: proficiencyBonus ?? 0, passivePerception: passivePerception ?? 0, skills, saves,
      senses: [], languages: [], resources: {}, attackProfiles: mainItems.attackProfiles, actions: [], features,
      equipment: [...mainItems.equipment, ...backpackItems.equipment], inventoryContainers: backpackItems.inventoryContainers, linkedEntities: [],
      spellcastingProfiles: highElfSpellSkeleton.spellcastingProfiles, spellResourcePools: highElfSpellSkeleton.spellResourcePools, spells: [],
      weaponMastery,
      source: { kind: 'excel-profile', status: 'imported-needs-review', entryIds: [], importerId: BEILING_PROFILE.importerId, sourceVersion: BEILING_PROFILE.version, fileName: text(fileName), fileSha256, mappings, note: '只读 Profile 导入；已映射字段可能包含公式缓存值，未经规则自动计算。' },
    },
  };
}

function findEndOfCentralDirectory(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65557); offset -= 1) if (view.getUint32(offset, true) === 0x06054b50) return offset;
  throw new Error('不是可识别的 ZIP/XLSX 文件。');
}

async function unzipXmlEntries(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer), view = new DataView(arrayBuffer), eocd = findEndOfCentralDirectory(bytes);
  const count = view.getUint16(eocd + 10, true), directoryOffset = view.getUint32(eocd + 16, true), decoder = new TextDecoder();
  const entries = new Map(); let cursor = directoryOffset;
  for (let index = 0; index < count; index += 1) {
    if (view.getUint32(cursor, true) !== 0x02014b50) throw new Error('XLSX 中央目录损坏。');
    const flags = view.getUint16(cursor + 8, true), method = view.getUint16(cursor + 10, true), compressedSize = view.getUint32(cursor + 20, true), uncompressedSize = view.getUint32(cursor + 24, true), nameLength = view.getUint16(cursor + 28, true), extraLength = view.getUint16(cursor + 30, true), commentLength = view.getUint16(cursor + 32, true), localOffset = view.getUint32(cursor + 42, true);
    const name = decoder.decode(bytes.slice(cursor + 46, cursor + 46 + nameLength));
    if (flags & 1) throw new Error('加密工作簿不受此本地 Profile 支持。');
    if (uncompressedSize > 8 * 1024 * 1024) throw new Error(`工作簿条目过大：${name}`);
    entries.set(name, { method, compressedSize, uncompressedSize, localOffset }); cursor += 46 + nameLength + extraLength + commentLength;
  }
  const readEntry = async name => {
    const entry = entries.get(name); if (!entry) throw new Error(`工作簿缺少必要条目：${name}`);
    if (view.getUint32(entry.localOffset, true) !== 0x04034b50) throw new Error(`工作簿局部条目损坏：${name}`);
    const nameLength = view.getUint16(entry.localOffset + 26, true), extraLength = view.getUint16(entry.localOffset + 28, true), start = entry.localOffset + 30 + nameLength + extraLength, compressed = bytes.slice(start, start + entry.compressedSize);
    if (entry.method === 0) return decoder.decode(compressed);
    if (entry.method !== 8 || !globalThis.DecompressionStream) throw new Error(`当前浏览器不能安全读取压缩条目：${name}`);
    const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return decoder.decode(new Uint8Array(await new Response(stream).arrayBuffer()));
  };
  return { entries, readEntry };
}

function xmlDocument(xml, label) {
  const document = new DOMParser().parseFromString(xml, 'application/xml');
  if (document.getElementsByTagName('parsererror').length) throw new Error(`工作簿 XML 无法读取：${label}`);
  return document;
}

function parseSharedStrings(xml) { return [...xmlDocument(xml, 'sharedStrings').getElementsByTagName('si')].map(node => node.textContent || ''); }
function parseRelationships(xml) { return [...xmlDocument(xml, 'relationships').getElementsByTagName('Relationship')].map(node => ({ id: node.getAttribute('Id'), target: node.getAttribute('Target'), targetMode: node.getAttribute('TargetMode') })); }

function mainAllowedRef(ref) {
  if (new Set(['A1', 'E3', 'E4', 'E6', 'I6', 'O6', 'T6', 'T7', 'S3', 'R22', 'V22', 'D23', 'AR24', 'D22', 'L23', 'C13', 'C14', 'B66', 'G66', 'K66', 'P66', 'Q66', 'B67', 'G67', 'K67', 'Q67', 'B68', 'G68', 'K68']).has(ref)) return true;
  if (/^[BCFT]1[3-8]$/.test(ref)) return true;
  if (skillRows.some(row => ref === `B${row}` || ref === `C${row}` || ref === `I${row}`)) return true;
  if (featureBlocks.some(block => block.rows.some(row => ref === `${block.nameColumn}${row}` || ref === `${block.descriptionColumn}${row}` || (block.levelColumn && ref === `${block.levelColumn}${row}`)))) return true;
  if (/^(B|F|M|W|Z|AB|AD|AF|AN|AP)3[2-6]$/.test(ref)) return true;
  return ['L40', 'R40', 'V40'].includes(ref);
}
function originAllowedRef(ref) { return new Set(['A1', 'E3', 'E4', 'E6', 'S17']).has(ref); }
function backpackAllowedRef(ref) {
  if (/^(Y|AC|AE|AP|AS)([5-9]|1[0-3]|1[6-9]|2[0-5])$/.test(ref)) return true;
  if (/^(B|F|H|S|V|Y|AC|AE|AP|AS)(2[9]|3[0-8]|4[0-9])$/.test(ref)) return true;
  return ['A1', 'Y3', 'B27', 'Y27', 'AS27'].includes(ref);
}
function parseCells(xml, sharedStrings, allowRef) {
  const cells = {};
  for (const node of xmlDocument(xml, 'worksheet').getElementsByTagName('c')) {
    const ref = node.getAttribute('r'); if (!ref || !allowRef(ref)) continue;
    const type = node.getAttribute('t'), raw = node.getElementsByTagName('v')[0]?.textContent || '', formula = node.getElementsByTagName('f')[0]?.textContent || '';
    const value = type === 's' ? (sharedStrings[Number(raw)] || '') : (type === 'inlineStr' ? (node.getElementsByTagName('is')[0]?.textContent || '') : raw);
    cells[ref] = { value, formula };
  }
  return cells;
}

export async function parseBeilingXlsxFile(file) {
  if (!(file instanceof File)) return createRejectedDraft({ reason: '请选择本地 .xlsx 文件。' });
  if (file.size <= 0 || file.size > 8 * 1024 * 1024) return createRejectedDraft({ fileName: file.name, reason: '文件大小不在允许范围内（1 字节至 8 MiB）。' });
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer), fileSha256 = [...new Uint8Array(hashBuffer)].map(byte => byte.toString(16).padStart(2, '0')).join('');
    const zip = await unzipXmlEntries(buffer);
    if ([...zip.entries.keys()].some(name => /vbaProject\.bin$/i.test(name))) return createRejectedDraft({ fileName: file.name, fileSha256, reason: '工作簿含 VBA 宏，已安全拒绝。' });
    if ([...zip.entries.keys()].some(name => /^xl\/externalLinks\//i.test(name))) return createRejectedDraft({ fileName: file.name, fileSha256, reason: '工作簿含外部链接部件，已安全拒绝。' });
    for (const name of [...zip.entries.keys()].filter(item => item.endsWith('.rels'))) if (/TargetMode="External"/i.test(await zip.readEntry(name))) return createRejectedDraft({ fileName: file.name, fileSha256, reason: '工作簿含外部关系，已安全拒绝。' });
    const workbookXml = await zip.readEntry('xl/workbook.xml'), relationships = parseRelationships(await zip.readEntry('xl/_rels/workbook.xml.rels')), relationshipMap = new Map(relationships.map(item => [item.id, item.target]));
    const workbookDocument = xmlDocument(workbookXml, 'workbook'), sheetTargets = {};
    for (const sheet of workbookDocument.getElementsByTagName('sheet')) { const name = sheet.getAttribute('name'), target = relationshipMap.get(sheet.getAttribute('r:id')); if (name && target) sheetTargets[name] = `xl/${target.replace(/^\/+/, '')}`; }
    const sharedStrings = parseSharedStrings(await zip.readEntry('xl/sharedStrings.xml'));
    const requiredTargets = ['主要', '起源', '背包'].map(name => [name, sheetTargets[name]]);
    const sheets = Object.fromEntries(Object.keys(sheetTargets).map(name => [name, { cells: {} }]));
    for (const [name, target] of requiredTargets) if (target) sheets[name] = { cells: parseCells(await zip.readEntry(target), sharedStrings, name === '主要' ? mainAllowedRef : (name === '背包' ? backpackAllowedRef : originAllowedRef)) };
    return buildBeilingCharacterDraft({ fileName: file.name, fileSha256, workbook: { sheets } });
  } catch (error) { return createRejectedDraft({ fileName: file?.name, reason: error?.message || '工作簿读取失败。' }); }
}
