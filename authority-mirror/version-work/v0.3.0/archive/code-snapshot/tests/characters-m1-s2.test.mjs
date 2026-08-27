import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { materializeCombatant } from '../src/encounter.js';
import {
  createAuditedValue,
  createCharacterRecord,
  createCharacterSheet,
  createCombatProjection,
  createEncounterMemberFromProjection,
  currentCharacterSheet,
  diffCharacterRevisions,
  normalizeCharacterRecord,
  reviseCharacterRecord,
} from '../src/characters.js';

let sequence = 0;
const id = () => `m1-s2-${++sequence}`;
const timestamp = () => '2026-08-17T12:00:00.000Z';

assert.throws(
  () => createAuditedValue({ calculatedValue: 2, overrideValue: 3 }),
  /必须填写原因/,
  'manual derived-value overrides require an audit reason',
);
assert.deepEqual(
  createAuditedValue({ inputs: [{ key: 'level', value: 15 }], calculatedValue: 5 }),
  { status: 'calculated', inputs: [{ key: 'level', value: 15 }], calculatedValue: 5, overrideValue: null, effectiveValue: 5, overrideReason: '' },
  'an admitted calculation retains inputs, calculated and effective values',
);

const legacyRecord = normalizeCharacterRecord({
  characterId: 'legacy-character',
  currentRevision: 1,
  revisions: [{
    schemaVersion: '0.3.0-m1-s1', characterId: 'legacy-character', revision: 1, previousRevision: null,
    createdAt: timestamp(), revisedAt: null, name: '旧武者', armorClass: 16,
    hp: { current: 20, max: 20 }, speed: 30, initiativeModifier: 2,
    resources: { 功力: { current: 3, max: 3 } }, note: '旧数据', source: { kind: 'manual', status: 'dm-authored' },
  }],
});
const migrated = currentCharacterSheet(legacyRecord);
assert.equal(migrated.schemaVersion, '0.3.0-m1-s5');
assert.equal(migrated.hp.current, 20, 'M1-S1 HP survives additive migration');
assert.equal(migrated.resources.功力.current, 3, 'M1-S1 resources survive additive migration');
assert.equal(migrated.weaponMastery.status, 'unknown', 'migration does not invent weapon mastery');
assert.deepEqual(migrated.attackProfiles, [], 'missing structured attacks remain empty rather than inferred');

const sheet = createCharacterSheet({
  name: '15级散打武者', ownerHint: '本地验证', ruleVersion: '2024', totalLevel: 15,
  classes: [{ name: '武僧', subclass: '散打宗', level: 15, sourceStatus: 'dm-authored' }],
  origin: { species: 'DM 手工项', background: 'DM 手工项', history: '仅验证结构' },
  abilities: { strength: 10, dexterity: 18, constitution: 14, intelligence: 10, wisdom: 16, charisma: 10 },
  armorClass: 17, hp: { current: 112, max: 112 }, speed: 55, initiativeModifier: 4,
  proficiencyBonus: 5, passivePerception: 16,
  saves: [{ name: '敏捷', proficient: true, bonus: 9, status: 'needs-review' }],
  skills: [{ name: '杂技', proficient: true, bonus: 9, status: 'needs-review' }],
  combatState: { hitDice: '15d8', heroicInspiration: false, conditions: [], concentration: 'none' },
  resources: { 功力: { current: 15, max: 15, recovery: 'manual', sourceStatus: 'dm-authored' } },
  attackProfiles: [{ name: '徒手打击', proficient: true, ability: 'dexterity', attackBonus: null, damage: '待 DM 填写', damageType: 'unknown', reach: '5尺', sourceStatus: 'dm-authored' }],
  actions: [{ name: '疾风连击', economy: 'bonus', resourceLink: '功力', description: '规则效果待核验', sourceStatus: 'dm-authored' }],
  equipment: [{ name: '旅行装备', quantity: 1, equipped: true, attuned: false, container: '随身', consumable: false, sourceStatus: 'dm-authored' }],
  linkedEntities: [{ name: '验证盟友', kind: 'ally', relation: 'ally', note: 'M1-S5 前不物化', sourceStatus: 'dm-authored' }],
  weaponMastery: { status: 'unknown', grants: [], selections: [], note: '无准入来源' },
}, { id, timestamp });
const record = createCharacterRecord(sheet);

assert.equal(sheet.derivedValues.armorClass.effectiveValue, 17);
assert.equal(sheet.derivedValues.armorClass.status, 'needs-review', 'DM-entered derived values do not masquerade as admitted calculations');
assert.equal(sheet.abilities.dexterity.modifier.effectiveValue, null, 'ability modifiers remain unknown without admitted calculation inputs');
assert.equal(sheet.linkedEntities[0].combatMaterializationStatus, 'available-in-m1-s5');
assert.equal(sheet.weaponMastery.status, 'unknown');
assert.equal(sheet.spellcastingProfiles.length, 0, 'noncaster spell regions remain structurally empty');

const projection = createCombatProjection(sheet, { id, timestamp });
const member = createEncounterMemberFromProjection(projection, { id, position: { x: 1, y: 1 } });
const combatant = materializeCombatant(member, 'combatant-m1-s2');
assert.notStrictEqual(projection.attackProfiles, sheet.attackProfiles);
assert.notStrictEqual(member.equipment, projection.equipment);
assert.notStrictEqual(combatant.linkedEntities, member.linkedEntities);
sheet.attackProfiles[0].name = '污染尝试';
sheet.equipment[0].quantity = 99;
sheet.linkedEntities[0].name = '污染尝试';
assert.equal(projection.attackProfiles[0].name, '徒手打击', 'frozen projection attacks resist later long-term edits');
assert.equal(member.equipment[0].quantity, 1, 'encounter equipment snapshot is isolated');
assert.equal(combatant.linkedEntities[0].name, '验证盟友', 'instance relation snapshot is isolated');
assert.equal(member.weaponMastery.status, 'unknown', 'projection retains the explicit mastery uncertainty');

const revisionInput = currentCharacterSheet(record);
revisionInput.armorClass = 18;
revisionInput.note = '第二修订';
revisionInput.equipment = [{ ...revisionInput.equipment[0], quantity: 2 }];
const revised = reviseCharacterRecord(record, revisionInput, { timestamp });
assert.equal(revised.record.currentRevision, 2);
assert.equal(revised.record.revisions[0].armorClass, 17, 'revision 1 remains immutable');
assert.equal(revised.revision.armorClass, 18);
assert.equal(revised.revision.derivedValues.armorClass.effectiveValue, 18, 'derived-value audit follows the revised scalar value');
assert.equal(revised.revision.previousRevision, 1);
const changes = diffCharacterRevisions(revised.record.revisions[0], revised.revision);
assert(changes.some(change => change.path === 'armorClass' && change.before === 17 && change.after === 18));
assert(changes.some(change => change.path === 'equipment'), 'array-level equipment revision diff remains visible');

const appSource = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
for (const region of ['combat', 'checks', 'actions', 'spells', 'equipment', 'origin', 'linked', 'revisions']) {
  assert(appSource.includes(`data-character-region=\"${region}\"`), `character detail declares ${region} region`);
}
assert(appSource.includes('创建长期角色卡'), 'M1-S1-O1 button wording is replaced');
assert(!appSource.includes('保存长期角色卡修订 1'), 'internal revision 1 terminology is not the primary create action');

console.log('characters-m1-s2.test.mjs: pass');
