import assert from 'node:assert/strict';
import {
  createCharacterRecord,
  createCharacterSheet,
  createIndependentSuccessorRecord,
  currentCharacterSheet,
  applyPostCombatDecisions,
  recordControlledEntityRenewalRequested,
  settleControlledEntitiesAfterLongRest,
  S2_SUCCESSOR_INHERITANCE_GROUPS,
} from '../src/characters.js';

let sequence=0;
const id=()=>`s2-${++sequence}`;
const timestamp=()=> '2026-08-27T00:00:00.000Z';
const sourceSheet=createCharacterSheet({
  name:'旧角色',ownerHint:'玩家甲',totalLevel:5,classes:[{name:'法师',level:5}],hp:{current:22,max:30},armorClass:14,speed:30,
  resources:{'法术点':{current:3,max:5}},attackProfiles:[{name:'法杖'}],actions:[{name:'奥术恢复'}],equipment:[{name:'法器',quantity:1}],note:'旧卡 DM 备注。',
},{id,timestamp});
const source=createCharacterRecord(sourceSheet);

assert.deepEqual(S2_SUCCESSOR_INHERITANCE_GROUPS,['identity','combat','abilities','proficiencies','capabilities','equipment','resources','notes']);
const successor=createIndependentSuccessorRecord(source,{id,timestamp,name:'新角色',hp:8,maxHp:24,inheritGroups:['identity','combat','resources','notes'],note:'S2 人工承接说明。',sourceNote:'DM 明确确认。'});
const sheet=currentCharacterSheet(successor);
assert.notEqual(successor.characterId,source.characterId,'S2 always creates a fresh independent CharacterSheet ID');
assert.equal(sheet.revision,1,'the new card starts at revision 1');
assert.equal(sheet.name,'新角色');
assert.deepEqual(sheet.hp,{current:8,max:24});
assert.equal(sheet.resources['法术点'].current,3,'selected groups copy only at creation');
assert.equal(sheet.attackProfiles.length,0,'unselected capabilities are not inferred');
assert.equal(sheet.equipment.length,0,'unselected equipment is not inferred');
assert.match(sheet.note,/旧卡 DM 备注。/,'selected existing note is copied as ordinary text');
assert.match(sheet.note,/S2 人工承接说明。/,'caller can append a human-readable relationship note');
assert.throws(()=>createIndependentSuccessorRecord(source,{id,timestamp,name:'坏卡',hp:1,maxHp:1,inheritGroups:['unknown']}),/未知继承组/);

const controlledEntity={
  id:'controlled-zombie',name:'受控僵尸',templateRef:{templateId:'zombie',templateRevision:1},status:'controlled',commandRangeFeet:60,
  duration:{kind:'one-long-rest',unit:'long-rests',remaining:1,initial:1},effectLabel:'DM 确认的控制效果',sourceStatus:'dm-confirmed',createdEventId:'event-create',sourceCombatantId:'dead-pc',activeCombatantId:'zombie-instance',history:[],
};
const controlledDiff={
  characterId:source.characterId,characterRevision:source.currentRevision,
  entries:[{id:'controlled-entity:controlled-zombie',kind:'controlled-entity',controlledEntity}],
};
const accepted=applyPostCombatDecisions(source,controlledDiff,[{entryId:'controlled-entity:controlled-zombie',action:'accept',reason:''}],{timestamp});
assert.equal(accepted.record.currentRevision,2,'DM acceptance creates a new CharacterSheet revision');
assert.equal(currentCharacterSheet(accepted.record).controlledEntities[0].status,'controlled');
assert.throws(()=>applyPostCombatDecisions(source,controlledDiff,[{entryId:'controlled-entity:controlled-zombie',action:'correct',correctedValue:1,reason:'不适用'}],{timestamp}),/只能接受或拒绝/,'a structured controlled relationship cannot be numeric-corrected');
const settled=settleControlledEntitiesAfterLongRest(accepted.record,{timestamp,eventId:'rest-1'});
assert.equal(currentCharacterSheet(settled.record).controlledEntities[0].status,'expired-uncontrolled','one-long-rest control expires into uncontrolled rather than being deleted');
assert.equal(currentCharacterSheet(settled.record).controlledEntities[0].duration.remaining,0);
const renewal=recordControlledEntityRenewalRequested(settled.record,'controlled-zombie',{timestamp,eventId:'renewal-1'});
assert.equal(currentCharacterSheet(renewal.record).controlledEntities[0].status,'expired-uncontrolled','a renewal request remains only an audit record');
assert.equal(currentCharacterSheet(renewal.record).controlledEntities[0].history.at(-1).type,'renewal-requested');

const refreshed=settleControlledEntitiesAfterLongRest(accepted.record,{timestamp,eventId:'rest-renewed',renewedEntityIds:['controlled-zombie'],reason:'DM 确认在到期前续控'});
const refreshedEntity=currentCharacterSheet(refreshed.record).controlledEntities[0];
assert.equal(refreshedEntity.status,'controlled','a DM-confirmed renewal preserves control without asserting spell validation');
assert.equal(refreshedEntity.duration.remaining,1,'one-long-rest renewal refreshes the next long-rest counter');
assert.equal(refreshedEntity.history.at(-1).type,'control-renewed');
assert.equal(refreshed.changes[0].action,'renewed');

console.log('v050-s2.test.mjs: pass');
