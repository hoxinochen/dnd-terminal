import assert from 'node:assert/strict';
import { materializeCombatant } from '../src/encounter.js';
import {
  applyCombatResourceChange,
  applyPostCombatDiff,
  buildPostCombatDiff,
  compensateCombatResourceChange,
  createCharacterRecord,
  createCharacterSheet,
  createCombatProjection,
  createEncounterMemberFromProjection,
  currentCharacterSheet,
} from '../src/characters.js';

let sequence = 0;
const id = () => `id-${++sequence}`;
const timestamp = () => '2026-08-17T10:00:00.000Z';

const sheet = createCharacterSheet({
  name: 'M1-S1 武者',
  armorClass: 17,
  hp: { current: 38, max: 42 },
  speed: 40,
  initiativeModifier: 4,
  resources: { '功力': { current: 5, max: 5 } },
}, { id, timestamp });
const record = createCharacterRecord(sheet);
const projection = createCombatProjection(sheet, { id, timestamp });
const member = createEncounterMemberFromProjection(projection, { id, position: { x: 2, y: 3 } });
const combatant = materializeCombatant(member, 'combatant-1');

assert.notStrictEqual(record.revisions[0], sheet, 'long-term history stores an isolated revision snapshot');
assert.notStrictEqual(projection.sheetSnapshot, sheet, 'projection stores an isolated CharacterSheet snapshot');
assert.notStrictEqual(member.combatProjectionSnapshot, projection, 'encounter member stores an isolated projection snapshot');
assert.notStrictEqual(combatant.resources, member.resources, 'CombatantInstance resources are isolated from encounter state');
assert.equal(combatant.combatProjectionId, projection.projectionId, 'CombatantInstance retains an auditable projection identity');
assert.deepEqual(combatant.characterSheetRef, { characterId: projection.characterId, revision: 1 }, 'CombatantInstance retains the frozen CharacterSheet revision reference');

sheet.hp.current = 1;
sheet.resources['功力'].current = 1;
assert.equal(projection.hp.current, 38, 'later CharacterSheet edits cannot mutate an existing projection');
assert.equal(member.hp, 38, 'later source edits cannot mutate an encounter member');

const eventPayload = applyCombatResourceChange(combatant, '功力', -1);
assert.deepEqual(eventPayload, { combatantId: 'combatant-1', key: '功力', amount: -1, before: 5, after: 4 });
assert.equal(combatant.resources['功力'], 4, 'combat resource consumption changes only the instance');
assert.equal(member.resources['功力'], 5, 'combat consumption cannot write into the encounter member');
assert.equal(projection.resources['功力'], 5, 'combat consumption cannot write into the projection');
assert.equal(currentCharacterSheet(record).resources['功力'].current, 5, 'combat consumption cannot write into the long-term card');

compensateCombatResourceChange(combatant, eventPayload);
assert.equal(combatant.resources['功力'], 5, 'compensation restores the instance balance');
applyCombatResourceChange(combatant, '功力', -1);
combatant.hp = 31;
const diff = buildPostCombatDiff(projection, combatant, { id, timestamp, sourceSessionId: 'session-1', sourceEventSequence: 7 });
assert.deepEqual(diff.entries.map(entry => entry.id), ['hp.current', 'resource:功力']);
assert.equal(diff.status, 'pending', 'a generated diff starts pending DM review');

const declined = applyPostCombatDiff(record, diff, [], { timestamp });
assert.equal(declined.revision, null, 'default-unchecked review creates no revision');
assert.equal(declined.record.currentRevision, 1, 'declining every field preserves the current revision');

const applied = applyPostCombatDiff(record, diff, ['resource:功力'], { timestamp });
assert.equal(applied.record.currentRevision, 2, 'accepted fields create a new revision');
assert.equal(applied.record.revisions[0].resources['功力'].current, 5, 'revision 1 remains immutable');
assert.equal(applied.revision.resources['功力'].current, 4, 'accepted resource balance reaches revision 2');
assert.equal(applied.revision.hp.current, 38, 'unaccepted HP does not write back');

const staleRecordBefore = structuredClone(applied.record);
assert.throws(
  () => applyPostCombatDiff(applied.record, diff, ['hp.current'], { timestamp }),
  /差异已过期/,
  'a diff cannot apply after the long-term card has advanced',
);
assert.deepEqual(applied.record, staleRecordBefore, 'failed stale writeback leaves the caller record unchanged');
assert.throws(
  () => applyPostCombatDiff(record, diff, ['unknown-field'], { timestamp }),
  /未知字段/,
  'unknown writeback fields are rejected before mutation',
);

console.log('characters-m1-s1.test.mjs: pass');
