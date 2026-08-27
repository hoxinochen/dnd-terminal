import assert from 'node:assert/strict';
import { BEILING_PROFILE, buildBeilingCharacterDraft } from '../src/character-import.js';
import { createCharacterSheet, diffCharacterRevisions } from '../src/characters.js';

const cell = (value, formula = '') => ({ value: String(value ?? ''), formula });
const main = {
  A1: cell('DND 5.5E 人物卡<悲灵ver.>（2024）'), E3: cell('莉亚'), E4: cell('Ariane'), E6: cell('游荡者'), I6: cell('刺客'), O6: cell(3),
  T6: cell('精灵'), T7: cell('高等精灵'), S3: cell(2, 'IFERROR(...)'), R22: cell(24, 'V22'), V22: cell(24, 'BF7'), D23: cell(15, 'SUM(...)'), AR24: cell(30, '职业!CZ15'), D22: cell(6, 'SUM(...)'), L23: cell(14, 'SUM(...)'),
  F13: cell(10), F14: cell(18), F15: cell(15), F16: cell(10), F17: cell(14), F18: cell(12),
  B13: cell('X'), C13: cell('力量'), T13: cell(0), B14: cell('O'), C14: cell('敏捷'), T14: cell(6), B15: cell('X'), C15: cell('体质'), T15: cell(2), B16: cell('O'), C16: cell('智力'), T16: cell(2), B17: cell('X'), C17: cell('感知'), T17: cell(2), B18: cell('X'), C18: cell('魅力'), T18: cell(1),
  B41: cell('🅞'), C41: cell('运动'), I41: cell(4, 'SUM(...)'), B43: cell('X'), C43: cell('特技'), I43: cell(4, 'SUM(...)'),
  AW17: cell(1), AX17: cell('偷袭'), BC17: cell('每回合一次的额外伤害。'), BT3: cell('生物种类'), BZ3: cell('类人'), BT19: cell(1), BU19: cell('警戒'), BZ19: cell('起源专长。'), AW20: cell(1), AX20: cell('武器精通'), BC20: cell('选择两种熟练武器；完成长休时可以改变。'),
  B32: cell('匕首'), F32: cell('O'), M32: cell('灵巧，轻型'), W32: cell('O'), Z32: cell('+6'), AB32: cell('1d4'), AD32: cell('+4'), AF32: cell('穿刺'), AN32: cell('迅击'), AP32: cell('轻型额外攻击可并入攻击动作。'),
  B33: cell('短弓'), W33: cell('O'), Z33: cell('+6'), AB33: cell('1d6'), AD33: cell('+4'), AF33: cell('穿刺'), AN33: cell('侵扰'), AP33: cell('命中后下一次攻击具有优势。'), L40: cell('皮甲'),
};
const workbook = { sheets: { 起源: { cells: { A1: cell('人物背景 Background'), E6: cell('寻宝者变体-赏金客', '背景!D14'), S17: cell('不喜欢引人注目。') } }, 主要: { cells: main }, 背包: { cells: { A1: cell('背包 Inventory'), Y5: cell('箭矢'), AP5: cell(1), AS5: cell(20), Y6: cell('箭袋'), AP6: cell(1), AS6: cell(1) } }, '盟友与魔宠': { cells: {} }, 法术书: { cells: {} }, 职业: { cells: {} }, 装备: { cells: {} }, 种族: { cells: {} }, 背景: { cells: {} }, 法术大全: { cells: {} }, 数据表: { cells: {} }, 附录1: { cells: {} }, 附录2: { cells: {} }, 附录3: { cells: {} }, 附录4: { cells: {} }, 附录5: { cells: {} }, 附录6: { cells: {} }, 附录7: { cells: {} } } };

const draft = buildBeilingCharacterDraft({ fileName: '莉亚.xlsx', fileSha256: BEILING_PROFILE.sampleSha256, workbook });
assert.equal(draft.kind, 'CharacterDraft');
assert.equal(draft.status, 'needs-confirmation');
assert.equal(draft.input.name, '莉亚');
assert.equal(draft.input.classes[0].name, '游荡者');
assert.equal(draft.input.abilities.dexterity.score, 18);
assert.equal(draft.input.hp.max, 24);
assert.equal(draft.input.armorClass, 15);
assert.equal(draft.input.weaponMastery.status, 'needs-review');
assert.equal(draft.input.saves.find(item => item.name === '敏捷').proficiencyRank, 'proficient');
assert.equal(draft.input.skills.find(item => item.name === '运动').proficiencyRank, 'expertise');
assert.ok(draft.input.features.some(item => item.name === '偷袭' && item.category === 'class-feature'));
assert.ok(draft.input.features.some(item => item.name === '警戒' && item.category === 'feat'));
assert.equal(draft.input.spellcastingProfiles[0].id, 'imported-high-elf', 'high-elf import creates only a needs-review spellcasting skeleton');
assert.equal(draft.input.spellcastingProfiles[0].ability, 'unknown');
assert.equal(draft.input.spellResourcePools[0].balances[0].max, 0, 'importer does not invent free-cast uses');
assert.deepEqual(draft.input.spells, [], 'importer does not infer spell identities from the workbook database');
assert.ok(draft.input.attackProfiles.some(item => item.name === '匕首' && item.masteryTerm === '迅击' && item.masteryEnabled === false));
assert.ok(draft.input.equipment.some(item => item.name === '匕首' && item.attuned === false && item.attunementMark === 'O'));
assert.ok(draft.input.equipment.some(item => item.name === '箭矢' && item.quantity === 20 && item.container === '背包1'));
assert.equal(draft.input.weaponMastery.selectionLimit, 2);
assert.equal(draft.input.weaponMastery.changeTiming, 'finish-long-rest');
assert.equal(draft.input.weaponMastery.grants[0].id, 'imported-weapon-mastery', 'explicit imported feature creates the only mastery grant');
assert.ok(draft.warnings.some(item => item.includes('公式缓存值')));
assert.ok(draft.conflicts.some(item => item.path === 'spellcastingProfiles'));
assert.ok(draft.missing.some(item => item.path === 'weaponMastery.selections'));

const nonMasteryWorkbook = structuredClone(workbook);
nonMasteryWorkbook.sheets.主要.cells.E3 = cell('拉拉维娜');
nonMasteryWorkbook.sheets.主要.cells.E6 = cell('吟游诗人');
nonMasteryWorkbook.sheets.主要.cells.I6 = cell('魅心学院');
nonMasteryWorkbook.sheets.主要.cells.AX20 = cell('');
nonMasteryWorkbook.sheets.主要.cells.AN32 = cell('');
nonMasteryWorkbook.sheets.主要.cells.AN33 = cell('');
const nonMasteryDraft = buildBeilingCharacterDraft({ fileName: '拉拉维娜.xlsx', fileSha256: '5d40157eaf8fb670cff61ac6d822a5d941a1cb3c89678be03291764a517d0bf8', workbook: nonMasteryWorkbook });
assert.equal(nonMasteryDraft.status, 'needs-confirmation');
assert.equal(nonMasteryDraft.input.weaponMastery.status, 'not-applicable', 'no explicit feature must not invent a mastery grant');
assert.deepEqual(nonMasteryDraft.input.weaponMastery.grants, []);
assert.deepEqual(nonMasteryDraft.input.weaponMastery.selections, []);
assert.equal(nonMasteryDraft.input.weaponMastery.selectionLimit, 0);
assert.equal(nonMasteryDraft.input.weaponMastery.changeTiming, 'unknown');
assert.equal(nonMasteryDraft.missing.some(item => item.path === 'weaponMastery.selections'), false, 'no invented selection confirmation for non-mastery character');
const nonMasteryImported = createCharacterSheet(nonMasteryDraft.input, { id: () => 'character-non-mastery', timestamp: () => '2026-08-18T00:00:00.000Z' });
assert.equal(nonMasteryImported.weaponMastery.status, 'not-applicable', 'non-mastery status persists into the long-term sheet');
assert.deepEqual(nonMasteryImported.weaponMastery.grants, [], 'long-term sheet retains no invented mastery grant');

const imported = createCharacterSheet(draft.input, { id: () => 'character-1', timestamp: () => '2026-08-17T00:00:00.000Z' });
assert.equal(imported.source.importerId, BEILING_PROFILE.importerId);
assert.equal(imported.source.fileSha256, BEILING_PROFILE.sampleSha256);
assert.equal(imported.source.mappings.length, draft.mappings.length);
assert.ok(!diffCharacterRevisions(imported, draft.input).some(item => item.path === 'characterId'));

const rejected = buildBeilingCharacterDraft({ fileName: 'unknown.xlsx', workbook: { sheets: { 主要: { cells: main }, 起源: { cells: {} } } } });
assert.equal(rejected.status, 'rejected');
assert.ok(rejected.diagnostics.some(item => item.includes('缺少工作表')));

console.log('character-import-m1-s3.test.mjs: pass');
