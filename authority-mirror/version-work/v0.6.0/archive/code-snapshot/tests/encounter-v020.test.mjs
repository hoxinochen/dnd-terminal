import assert from 'node:assert/strict';
import { createEncounterMember, materializeCombatant, migrateV010Session, normalizeV020Lifecycle, validateImportedEnvelope, finalizeCombatSession, referenceTemplateSeeds, legacyCharacterPresets, legacyNpcPresets, legacyEncounterPresets, V020_SCHEMA_VERSION, footprintFits, footprintsOverlap, firstFreeFootprintPosition, combatantCanAct, nextEligibleTurn, clearTemporaryCombatState, declareCombatantDead, resolveInitiative } from '../src/encounter.js';

const zombie = { ...referenceTemplateSeeds.find(template => template.id === 'ref-zombie'), shortLabel: '尸', color: '#123456' };
const first = createEncounterMember(zombie, 'member-a', { x: 1, y: 2 });
const second = createEncounterMember(zombie, 'member-b', { x: 4, y: 5 });
first.hp = 4;
first.resources.changed = 1;

assert.equal(second.hp, 15, 'members created from one template must isolate HP');
assert.equal(second.resources.changed, undefined, 'members must not share resource objects');
assert.equal(first.templateSnapshot.maxHp, 15, 'member keeps immutable creation snapshot');
assert.equal(first.shortLabel, '尸', 'member keeps its display abbreviation');
assert.equal(first.color, '#123456', 'member keeps its display color');
assert.equal(first.initiativeModifier, -2, 'member snapshots the admitted initiative modifier');

zombie.maxHp = 99;
assert.equal(first.templateSnapshot.maxHp, 15, 'later template edits cannot change the prepared member snapshot');

const combatant = materializeCombatant(first, 'combatant-a');
combatant.hp = 1;
assert.equal(first.hp, 4, 'combatant state must not write back into encounter member state');
assert.equal(combatant.sourceEncounterMemberId, 'member-a');
assert.equal(combatant.actionAvailable, true);
assert.equal(combatant.color, '#123456', 'combatant keeps the prepared display color');
assert.equal(combatant.presenceStatus, 'on-field', 'new combatant starts on the battlefield');
assert.equal(combatant.participationStatus, 'active', 'new combatant starts as an active participant');
assert.equal(combatant.lifeStatus, 'alive', 'new combatant starts alive');
assert.equal(combatant.eligibleFromRound, 1, 'new combatant has explicit initiative eligibility');
assert.equal(combatant.initiativeMode, 'unconfigured', 'new combatant does not roll initiative before confirmation');

first.deployment = 'reserve';
assert.equal(first.deployment, 'reserve', 'prepared member can remain a reserve without becoming a combatant');

const fireGiant = referenceTemplateSeeds.find(template => template.id === 'ref-fire-giant');
const beholder = referenceTemplateSeeds.find(template => template.id === 'ref-beholder');
assert.equal(fireGiant.armorClass, 18, 'fire giant uses the admitted field evidence');
assert.deepEqual(fireGiant.footprint, [3, 3]);
assert.equal(beholder.armorClass, 18, 'beholder uses the admitted field evidence');
assert.equal(beholder.speedModes.flyFeet, 40);
assert.equal(fireGiant.initiativeModifier, 3, 'explicit monster initiative takes priority over deriving from Dexterity');
assert.equal(beholder.initiativeModifier, 12, 'beholder keeps its explicit MM 2025 initiative modifier');
assert.deepEqual(Object.fromEntries(referenceTemplateSeeds.map(template => [template.id, template.initiativeModifier])), {'ref-zombie':-2,'ref-skeleton':3,'ref-goblin-minion':2,'ref-ogre':-1,'ref-wolf':2,'ref-fire-giant':3,'ref-beholder':12});
const preparedBeholder = createEncounterMember(beholder, 'member-beholder');
assert.equal(materializeCombatant(preparedBeholder, 'combatant-beholder').legendaryActionMax, 3, 'verified legendary action pool survives confirmation');
assert.equal(referenceTemplateSeeds.every(template => template.referenceActions?.every(action => action.detail)), true, 'all admitted reference actions expose verified compact details');
assert.equal(referenceTemplateSeeds.find(template => template.id === 'ref-zombie').referenceActions[0].detail.includes('1d8+1'), true, 'original five samples expose numeric action evidence');
assert.equal(referenceTemplateSeeds.find(template => template.id === 'ref-beholder').referenceActions.find(action => action.name === '切齿').detail.includes('两次啃咬'), true, 'beholder legendary action detail remains available');
const eyeRays = referenceTemplateSeeds.find(template => template.id === 'ref-beholder').referenceActions.find(action => action.name === '眼波射线').options;
assert.equal(eyeRays.length, 10, 'beholder eye rays expose all ten admitted references');
assert.deepEqual(eyeRays.map(ray => ray.roll), [1,2,3,4,5,6,7,8,9,10], 'eye ray references retain the full 1d10 table');
assert.deepEqual(eyeRays.map(ray => ray.name), ['魅惑射线','麻痹射线','恐惧射线','缓慢射线','汲能射线','念力射线','睡眠射线','石化射线','解离射线','死亡射线'], 'eye ray names remain stable');
assert.equal(eyeRays.every(ray => ray.detail.includes('DC 16')), true, 'every eye ray exposes its verified saving throw DC');
assert.equal(legacyCharacterPresets.every(template => template.kind === 'character'), true, 'player presets remain a separate character collection');
assert.equal(legacyNpcPresets.every(template => template.kind === 'npc'), true, 'NPC presets remain unit templates');
assert.equal(legacyEncounterPresets.filter(template => template.relation === 'ally').length >= 4, true, 'legacy player/NPC presets remain available for encounter preparation');

const wizard = legacyCharacterPresets.find(template => template.id === 'preset-pc-wizard');
const preparedWizard = createEncounterMember(wizard, 'member-wizard');
const combatWizard = materializeCombatant(preparedWizard, 'combatant-wizard');
assert.equal(combatWizard.slots[8], 1, 'character spell slots survive preparation and confirmation snapshots');

const migrated = migrateV010Session({ schemaVersion: '0.1.0', sessionId: 'old', updatedAt: '2026-08-04T00:00:00.000Z' }, () => 'encounter-old', () => 'now');
assert.equal(migrated.schemaVersion, V020_SCHEMA_VERSION);
assert.equal(migrated.encounter.phase, 'confirmed', 'legacy battle must not invent a preparation round');
assert.equal(migrated.encounter.migratedFrom, '0.1.0');

const lifecycleMigrated = normalizeV020Lifecycle({
  schemaVersion: V020_SCHEMA_VERSION,
  encounter: { phase: 'ended', members: [{ id: 'reserve-old' }] },
  combatants: [{ id: 'old-combatant', hp: 0 }],
  ui: {},
});
assert.equal(lifecycleMigrated.combatants[0].presenceStatus, 'on-field', 'older v0.2 combatants migrate to explicit field presence');
assert.equal(lifecycleMigrated.combatants[0].participationStatus, 'ended', 'older ended sessions migrate to closed participation');
assert.equal(lifecycleMigrated.combatants[0].lifeStatus, 'alive', 'legacy 0 HP data must safely default alive instead of inventing a death record');
assert.equal(lifecycleMigrated.encounter.members[0].deployment, 'field', 'older encounter members retain a safe field default');
assert.equal(lifecycleMigrated.ui.entryDraft, null, 'missing join drafts migrate as empty drafts');
assert.equal(lifecycleMigrated.ui.entryPlacement, null, 'missing placement drafts migrate as empty drafts');
assert.equal(lifecycleMigrated.combatants[0].initiativeModifier, 0, 'older combatants receive a safe editable initiative modifier default');
assert.deepEqual(lifecycleMigrated.combatProjections, [], 'older v0.2 sessions gain an empty projection collection without invented character data');
assert.deepEqual(lifecycleMigrated.postCombatDiffs, [], 'older v0.2 sessions gain an empty diff collection without invented writeback history');

assert.deepEqual(resolveInitiative({ mode:'unconfigured', modifier:3 }), { configured:false, mode:'unconfigured', roll:null, modifier:3, total:null }, 'quick-stage drafts do not roll initiative');
assert.deepEqual(resolveInitiative({ mode:'roll', roll:12, modifier:3 }), { configured:true, mode:'roll', roll:12, modifier:3, total:15 }, 'initiative uses d20 plus the editable modifier');
assert.equal(resolveInitiative({ mode:'roll', roll:10, modifier:-2 }).total, 8, 'negative initiative modifiers are supported');
assert.deepEqual(resolveInitiative({ mode:'manual', modifier:12, manualTotal:-1 }), { configured:true, mode:'manual', roll:null, modifier:12, total:-1 }, 'manual mode stores the DM final total without adding the modifier again');

const mapSettings = { width: 8, height: 8 };
const giant = { position: { x: 2, y: 2 }, footprint: { widthCells: 3, heightCells: 3 } };
const skeleton = { position: { x: 4, y: 4 }, footprint: { widthCells: 1, heightCells: 1 } };
assert.equal(footprintsOverlap(giant, skeleton), true, 'a cell inside a 3x3 footprint must block placement');
assert.equal(footprintFits({ x: 5, y: 5 }, giant.footprint, mapSettings), true, 'a whole large footprint fits when every cell remains in bounds');
assert.equal(footprintFits({ x: 6, y: 5 }, giant.footprint, mapSettings), false, 'large footprint may not extend past the map edge');
assert.deepEqual(firstFreeFootprintPosition({ widthCells: 2, heightCells: 2 }, [giant], mapSettings), { x: 0, y: 0 }, 'automatic preparation placement scans for a non-overlapping whole footprint');

const leavingSession = {
  combatants: [
    { id: 'leaving', hp: 7, tempHp: 4, resources: { charge: 1 }, slots: { 1: 0 }, conditions: ['中毒'], presenceStatus: 'on-field', participationStatus: 'active', eligibleFromRound: 1 },
    { id: 'ally', hp: 9, tempHp: 0, resources: {}, slots: {}, conditions: [], presenceStatus: 'on-field', participationStatus: 'active', eligibleFromRound: 1 },
  ],
  effects: [
    { id: 'target-buff', name: '祝福', targetIds: ['leaving', 'ally'], concentration: false },
    { id: 'source-concentration', name: '专注法术', targetIds: ['ally'], concentration: true, sourceCombatantId: 'leaving' },
  ],
};
const cleared = clearTemporaryCombatState(leavingSession, 'leaving');
assert.equal(leavingSession.combatants[0].hp, 7, 'temporary leave preserves current HP');
assert.deepEqual(leavingSession.combatants[0].resources, { charge: 1 }, 'temporary leave preserves consumed resources');
assert.deepEqual(leavingSession.combatants[0].slots, { 1: 0 }, 'temporary leave preserves spell slots');
assert.equal(leavingSession.combatants[0].tempHp, 0, 'temporary leave clears temporary HP');
assert.deepEqual(leavingSession.combatants[0].conditions, [], 'temporary leave clears manual conditions');
assert.deepEqual(cleared.effects.sort(), ['专注法术', '祝福'], 'temporary leave reports cleared buffs, debuffs, and concentration');
assert.deepEqual(leavingSession.effects, [{ id: 'target-buff', name: '祝福', targetIds: ['ally'], concentration: false }], 'shared effects keep other targets while concentration maintained by the leaving unit ends');
assert.equal(combatantCanAct({ hp: 0, presenceStatus: 'on-field', participationStatus: 'active', eligibleFromRound: 1 }, 1), false, '0 HP combatants cannot regain normal action eligibility');
assert.equal(combatantCanAct({ hp: 1, presenceStatus: 'on-field', participationStatus: 'active', eligibleFromRound: 1 }, 1), true, 'positive-HP active on-field combatants remain eligible');
assert.equal(combatantCanAct({ hp: 1, lifeStatus: 'dead', presenceStatus: 'on-field', participationStatus: 'active', eligibleFromRound: 1 }, 1), false, 'dead combatants never regain action eligibility');
const defeatedTurn = nextEligibleTurn(['defeated', 'next'], 0, [
  { id: 'defeated', hp: 0, presenceStatus: 'on-field', participationStatus: 'active', eligibleFromRound: 1 },
  { id: 'next', hp: 8, presenceStatus: 'on-field', participationStatus: 'active', eligibleFromRound: 1 },
], 1);
assert.deepEqual(defeatedTurn, { index: 1, round: 1, waiting: false }, 'a defeated current combatant advances directly to the next eligible combatant');
const defeatedLastTurn = nextEligibleTurn(['next', 'defeated'], 1, [
  { id: 'next', hp: 8, presenceStatus: 'on-field', participationStatus: 'active', eligibleFromRound: 1 },
  { id: 'defeated', hp: 0, presenceStatus: 'on-field', participationStatus: 'active', eligibleFromRound: 1 },
], 1);
assert.deepEqual(defeatedLastTurn, { index: 0, round: 2, waiting: false }, 'a defeated final combatant safely advances into the next round');

const deathSession = {
  combatants: [{ id: 'dead-npc', hp: 0, tempHp: 3, resources: { spell: 1 }, slots: {}, conditions: ['中毒'], lifeStatus: 'alive', presenceStatus: 'on-field', participationStatus: 'active' }],
  effects: [{ id: 'death-buff', name: '祝福', targetIds: ['dead-npc'], concentration: false }],
};
const death = declareCombatantDead(deathSession, 'dead-npc', { atRound: 2, reason: '范围伤害' });
assert.equal(deathSession.combatants[0].lifeStatus, 'dead', 'monster/NPC death is explicit and separate from temporary leave');
assert.equal(deathSession.combatants[0].hp, 0, 'death retains 0 HP');
assert.equal(deathSession.combatants[0].tempHp, 0, 'death clears temporary HP');
assert.deepEqual(deathSession.combatants[0].conditions, [], 'death clears manual temporary conditions');
assert.deepEqual(deathSession.effects, [], 'death removes temporary effects from the corpse');
assert.equal(death.combatant.deathRecord.reason, '范围伤害', 'death keeps an auditable reason');

const waitingTurn = nextEligibleTurn(['away', 'ended'], 0, [
  { id: 'away', hp: 8, presenceStatus: 'temporarily-away', participationStatus: 'active', eligibleFromRound: 1 },
  { id: 'ended', hp: 8, presenceStatus: 'on-field', participationStatus: 'ended', eligibleFromRound: 1 },
], 3);
assert.deepEqual(waitingTurn, { index: -1, round: 3, waiting: true }, 'when every participant is unavailable, combat waits for reinforcements without advancing a round');

const importedV010 = validateImportedEnvelope({ schemaVersion: '0.1.0', session: { schemaVersion: '0.1.0', events: [], updatedAt: '2026-08-01T00:00:00.000Z' } }, () => 'imported-legacy', () => '2026-08-13T00:00:00.000Z');
assert.equal(importedV010.session.encounter.phase, 'confirmed', 'a valid v0.1 envelope migrates into an already-confirmed session');
assert.throws(() => validateImportedEnvelope(null, () => 'unused', () => 'unused'), /完整的会话 Envelope/, 'a damaged import is rejected before it can replace the active session');
assert.throws(() => validateImportedEnvelope({ schemaVersion: '0.3.0', session: { events: [] } }, () => 'unused', () => 'unused'), /仅接受 v0.1.0 或 v0.2.0/, 'an unsupported schema is safely rejected');
assert.throws(() => validateImportedEnvelope({ schemaVersion: V020_SCHEMA_VERSION, session: { events: [], combatants: [], settings: {} } }, () => 'unused', () => 'unused'), /缺少遭遇状态/, 'a v0.2 envelope missing encounter state is safely rejected');

const finalizationSource = {
  encounter: { phase: 'confirmed', members: [{ id: 'field-member', deployment: 'field', deployedCombatantId: 'field' }, { id: 'reserve-member', deployment: 'reserve', deployedCombatantId: null }] },
  combatants: [{ id: 'field', participationStatus: 'active', presenceStatus: 'on-field' }, { id: 'away', participationStatus: 'active', presenceStatus: 'temporarily-away' }, { id: 'old', participationStatus: 'ended', presenceStatus: 'temporarily-away' }],
  turn: { round: 4, index: 1, started: true, pendingTieGroups: [{ id: 'tie' }] },
  ui: { range: { shape: 'circle' }, entryDraft: { id: 'draft' }, entryPlacement: { items: [{ id: 'pending' }] }, reentryDraft: { id: 'reentry' }, deathResolution: { id: 'death' } },
};
const finalized = finalizeCombatSession(finalizationSource, { timestamp: '2026-08-13T01:00:00.000Z' });
assert.equal(finalized.encounter.phase, 'ended', 'ending combat marks the encounter closed');
assert.equal(finalized.encounter.endedAt, '2026-08-13T01:00:00.000Z', 'ending combat records a deterministic close time');
assert.deepEqual(finalized.combatants.map(c => c.participationStatus), ['ended', 'ended', 'ended'], 'on-field and temporarily-away active participants are both closed');
assert.equal(finalized.encounter.members[1].deployment, 'unused-reserve', 'an undeployed reserve is recorded as unused rather than as a participant');
assert.deepEqual(finalized.turn, { round: 4, index: -1, started: false, pendingTieGroups: [], ended: true }, 'ending combat stops initiative without inventing another round');
assert.equal(finalized.ui.entryDraft, null, 'unconfirmed join drafts are discarded on combat end');
assert.equal(finalized.ui.entryPlacement, null, 'unconfirmed batch entries are discarded on combat end');
assert.equal(finalized.ui.reentryDraft, null, 'unconfirmed reentry drafts are discarded on combat end');
assert.equal(finalized.ui.postCombatCleanup, true, 'retaining the map opens read-only cleanup mode');
assert.equal(finalizationSource.encounter.phase, 'confirmed', 'finalization returns a copy and does not mutate the source session');
const clearedFinalization = finalizeCombatSession(finalizationSource, { clearBattlefield: true });
assert.equal(clearedFinalization.ui.postCombatCleanup, false, 'clearing the battlefield skips post-combat cleanup mode');

console.log('encounter-v020.test.mjs: pass');
