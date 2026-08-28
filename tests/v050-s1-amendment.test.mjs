import assert from 'node:assert/strict';
import { materializeCombatant } from '../src/encounter.js';
import {
  applyPostCombatDecisions,
  buildPostCombatDiff,
  createCharacterRecord,
  createCharacterSheet,
  createCombatProjection,
  createEncounterMemberFromProjection,
  currentCharacterSheet,
  revivalNoteAppendText,
} from '../src/characters.js';

let sequence=0;
const id=()=>`amendment-${++sequence}`;
const timestamp=()=> '2026-08-27T00:00:00.000Z';
const resolution={
  resolutionId:'revival-event-1', type:'pc-return-to-life', round:4, basisStatus:'dm-ruling', basisLabel:'战役内裁定',
  soulReturn:'confirmed', hp:7, conditionHandling:'preserve', effectDisposition:'保留诅咒；力竭由 DM 处理。',
  mapOutcome:'restore-original-token', initiativeOutcome:'restore-original-slot', reason:'角色返回战斗。',
};

const sheet=createCharacterSheet({name:'复活备注验证',note:'既有 DM 备注。',hp:{current:20,max:20},resources:{}},{id,timestamp});
const record=createCharacterRecord(sheet),projection=createCombatProjection(sheet,{id,timestamp});
const member=createEncounterMemberFromProjection(projection,{id,position:{x:0,y:0}}),combatant=materializeCombatant(member,id);
combatant.deathRecord={resolutions:[resolution]};

const diff=buildPostCombatDiff(projection,combatant,{id,timestamp,sourceSessionId:'session',sourceEventSequence:8});
assert.equal(diff.entries.length,1,'a revival record alone produces a candidate diff');
const entry=diff.entries[0];
assert.equal(entry.kind,'note-append');
assert.equal(entry.resolutionId,resolution.resolutionId);
assert.match(entry.appendText,/v0\.5\.0 S1 复活记录/);
assert.match(revivalNoteAppendText(resolution),/DM 原因：角色返回战斗/);
assert.throws(()=>revivalNoteAppendText({...resolution,mapOutcome:'unknown'}),/完整、有效/);

const declined=applyPostCombatDecisions(record,diff,[{entryId:entry.id,action:'reject'}],{timestamp});
assert.equal(declined.revision,null,'default rejection never changes the long-term card');
assert.equal(currentCharacterSheet(declined.record).note,'既有 DM 备注。');

const accepted=applyPostCombatDecisions(record,diff,[{entryId:entry.id,action:'accept'}],{timestamp});
assert.equal(accepted.record.currentRevision,2,'accepting the note candidate creates a new revision');
assert.equal(currentCharacterSheet(record).note,'既有 DM 备注。','the prior revision remains immutable');
assert.match(currentCharacterSheet(accepted.record).note,/既有 DM 备注。\n\n\[v0\.5\.0 S1 复活记录 \/ revival-event-1\]/,'the record is appended, not overwritten');
assert.throws(()=>applyPostCombatDecisions(record,diff,[{entryId:entry.id,action:'correct',correctedValue:1,reason:'不适用'}],{timestamp}),/只能接受或拒绝/);

console.log('v050-s1-amendment.test.mjs: pass');
