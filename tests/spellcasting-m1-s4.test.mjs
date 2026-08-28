import assert from 'node:assert/strict';
import { materializeCombatant } from '../src/encounter.js';
import {
  applyCombatSpellResourceChange,
  applyPostCombatDiff,
  buildPostCombatDiff,
  createCharacterRecord,
  createCharacterSheet,
  createCombatProjection,
  createEncounterMemberFromProjection,
  currentCharacterSheet,
  normalizeCharacterRecord,
} from '../src/characters.js';

let sequence = 0;
const id = () => `m1-s4-${++sequence}`;
const timestamp = () => '2026-08-18T12:00:00.000Z';

const base = {
  name: '15级塑能师', ruleVersion: '2024', totalLevel: 15,
  classes: [{ id: 'wizard', name: '法师', subclass: '塑能师', level: 15, sourceStatus: 'rules-baseline-limited' }],
  abilities: { intelligence: { score: 18 } }, armorClass: 12, hp: { current: 77, max: 77 }, speed: 30, initiativeModifier: 2,
  spellcastingProfiles: [{
    id: 'wizard', sourceKind: 'class', sourceName: '法师（塑能师）', classId: 'wizard', ability: 'intelligence',
    spellAttack: { value: null, status: 'needs-review' }, saveDc: { value: null, status: 'needs-review' },
    acquisitionMode: 'spellbook', preparationMode: 'prepared', preparedCount: { value: 19, status: 'needs-review' },
    resourcePoolIds: ['wizard-slots'], ruleVersion: '2024', rulesEntryId: 'urn:uuid:340db2c0-1bca-56a5-ab30-90c81437becd', sourceStatus: 'rules-baseline-limited',
  }],
  spellResourcePools: [{
    id: 'wizard-slots', kind: 'shared-slots', label: '法师常规法术位', recovery: 'long-rest', ruleVersion: '2024',
    rulesEntryId: 'urn:uuid:92e6162f-1b04-5dee-b2fe-99e68c95cd31', sourceStatus: 'rules-baseline-limited',
    balances: [{ id: 'slot-1', label: '1环', current: 4, max: 4 }, { id: 'slot-3', label: '3环', current: 3, max: 3 }],
  }],
  spells: [{
    id: 'fireball-2024', stableSpellId: 'urn:uuid:5909de48-eb19-58e3-b6ae-98cbe7e58c88#fireball', name: '火球术', ruleVersion: '2024',
    availability: { inSpellbook: true, known: true, prepared: true, alwaysPrepared: false, availableThisEncounter: true, status: 'rules-baseline-limited' },
    sourceStatus: 'rules-baseline-limited', rulesEntryId: 'urn:uuid:5909de48-eb19-58e3-b6ae-98cbe7e58c88',
    castingOptions: [{ id: 'fireball-wizard', profileId: 'wizard', resourcePoolId: 'wizard-slots', balanceId: 'slot-3', castAtLevel: 3, sourceStatus: 'rules-baseline-limited' }],
  }],
};

const sheet = createCharacterSheet(base, { id, timestamp });
assert.equal(sheet.schemaVersion, '0.3.0-m1-s6');
assert.equal(sheet.spellcastingProfiles[0].preparedCount.value, 19);
assert.equal(sheet.spellcastingProfiles[0].spellAttack.status, 'needs-review', 'no attack value is invented without admitted inputs');
assert.equal(sheet.spells[0].availability.prepared, true);
assert.equal(sheet.spellResourcePools[0].balances[1].current, 3);

const multiclass = createCharacterSheet({ ...base, name: '法师/牧师验证卡', totalLevel: 8,
  classes: [{ id: 'wizard', name: '法师', level: 5 }, { id: 'cleric', name: '牧师', level: 3 }],
  spellcastingProfiles: [
    { ...base.spellcastingProfiles[0], sourceName: '法师', preparedCount: { value: null, status: 'needs-review' }, resourcePoolIds: ['mixed-slots'] },
    { id: 'cleric', sourceKind: 'class', sourceName: '牧师', classId: 'cleric', ability: 'wisdom', spellAttack: { value: null }, saveDc: { value: null }, acquisitionMode: 'prepared', preparationMode: 'prepared', preparedCount: { value: null }, resourcePoolIds: ['mixed-slots'], sourceStatus: 'needs-review' },
  ],
  spellResourcePools: [{ id: 'mixed-slots', kind: 'shared-slots', label: '多职业常规位（待核验）', balances: [{ id: 'slot-1', label: '1环', current: 4, max: 4 }], sourceStatus: 'needs-review' }],
  spells: [
    { ...base.spells[0], castingOptions: [{ id: 'fireball-wizard', profileId: 'wizard', resourcePoolId: 'mixed-slots', balanceId: 'slot-1', castAtLevel: 3, sourceStatus: 'needs-review' }] },
    { id: 'bless', name: '祝福术', availability: { inSpellbook: false, known: true, prepared: true, alwaysPrepared: false, availableThisEncounter: true }, sourceStatus: 'needs-review', castingOptions: [{ id: 'bless-cleric', profileId: 'cleric', resourcePoolId: 'mixed-slots', balanceId: 'slot-1', castAtLevel: 1, sourceStatus: 'needs-review' }] },
  ],
}, { id, timestamp });
assert.equal(multiclass.classes.length, 2);
assert.equal(multiclass.spellcastingProfiles.length, 2);
assert.equal(multiclass.spells.some(spell => spell.name === '火球术' && spell.availability.prepared), true, 'explicit spell state is retained');
assert.equal(multiclass.spells.some(spell => spell.name === '9环法术'), false, 'a resource pool never invents high-level spell access');

const lia = createCharacterSheet({ ...base, name: '莉亚施法来源结构验证', totalLevel: 3,
  classes: [{ id: 'rogue', name: '游荡者', subclass: '刺客', level: 3 }],
  spellcastingProfiles: [
    { id: 'high-elf', sourceKind: 'species', sourceName: '高等精灵来源（属性待确认）', ability: 'unknown', spellAttack: { value: null }, saveDc: { value: null }, acquisitionMode: 'granted', preparationMode: 'always-prepared', resourcePoolIds: ['elf-free'], sourceStatus: 'needs-review' },
    { id: 'background-feat', sourceKind: 'background-feat', sourceName: '背景/专长来源（待确认）', ability: 'unknown', spellAttack: { value: null }, saveDc: { value: null }, acquisitionMode: 'granted', preparationMode: 'always-prepared', resourcePoolIds: ['feat-free'], sourceStatus: 'needs-review' },
  ],
  spellResourcePools: [
    { id: 'elf-free', kind: 'free-cast', label: '高等精灵免费次数（待确认）', balances: [{ id: 'use', label: '免费次数', current: 1, max: 1 }], sourceStatus: 'needs-review' },
    { id: 'feat-free', kind: 'free-cast', label: '背景/专长免费次数（待确认）', balances: [{ id: 'use', label: '免费次数', current: 1, max: 1 }], sourceStatus: 'needs-review' },
  ],
  spells: [{ id: 'same-name-structure', name: '导入法术（名称待确认）', availability: { inSpellbook: false, known: false, prepared: false, alwaysPrepared: false, availableThisEncounter: false }, sourceStatus: 'needs-review', castingOptions: [
    { id: 'elf-option', profileId: 'high-elf', resourcePoolId: 'elf-free', balanceId: 'use', sourceStatus: 'needs-review' },
    { id: 'feat-option', profileId: 'background-feat', resourcePoolId: 'feat-free', balanceId: 'use', sourceStatus: 'needs-review' },
  ] }],
}, { id, timestamp });
assert.equal(lia.spells[0].castingOptions.length, 2, 'same display spell keeps multiple source-specific casting options');
assert.notEqual(lia.spells[0].castingOptions[0].resourcePoolId, lia.spells[0].castingOptions[1].resourcePoolId);

const projection = createCombatProjection(sheet, { id, timestamp });
const member = createEncounterMemberFromProjection(projection, { id });
const combatant = materializeCombatant(member, id());
assert.notStrictEqual(combatant.spellResourcePools, projection.spellResourcePools, 'instance pool state is isolated from projection');
const change = applyCombatSpellResourceChange(combatant, 'wizard-slots', 'slot-3', -1);
assert.deepEqual({ before: change.before, after: change.after }, { before: 3, after: 2 });
assert.equal(projection.spellResourcePools[0].balances[1].current, 3, 'instance consumption never writes back to projection');
const diff = buildPostCombatDiff(projection, combatant, { id, timestamp });
assert.equal(diff.entries[0].kind, 'spell-resource');
const record = createCharacterRecord(sheet);
const applied = applyPostCombatDiff(record, diff, [diff.entries[0].id], { timestamp });
assert.equal(currentCharacterSheet(applied.record).spellResourcePools[0].balances[1].current, 2, 'DM-approved diff creates a new long-term revision');
assert.equal(currentCharacterSheet(record).spellResourcePools[0].balances[1].current, 3, 'old long-term revision remains unchanged');

const migrated = normalizeCharacterRecord({ characterId: 'm1-s3-caster', currentRevision: 1, revisions: [{ name: '旧卡', characterId: 'm1-s3-caster', revision: 1, hp: { current: 1, max: 1 } }] });
assert.deepEqual(currentCharacterSheet(migrated).spellcastingProfiles, []);
assert.deepEqual(currentCharacterSheet(migrated).spellResourcePools, []);
assert.deepEqual(currentCharacterSheet(migrated).spells, []);

assert.throws(() => createCharacterSheet({ ...base, spells: [{ ...base.spells[0], castingOptions: [{ id: 'bad', profileId: 'missing', resourcePoolId: 'wizard-slots' }] }] }, { id, timestamp }), /不存在的施法来源/);
console.log('spellcasting-m1-s4.test.mjs: pass');
