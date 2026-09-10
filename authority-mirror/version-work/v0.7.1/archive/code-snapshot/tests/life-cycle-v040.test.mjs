import assert from 'node:assert/strict';
import {
  V020_STORAGE_KEY,
  V031_STORAGE_KEY,
  V040_STORAGE_KEY,
  applyPcDamage,
  chooseStartupSession,
  correctPcLifeState,
  createV040Envelope,
  hasCondition,
  healPc,
  medicallyStabilizePc,
  normalizeV040Session,
  pcLifePhase,
  recordDeathSave,
  standPcUp,
  turnDisposition,
  validateV040Envelope,
} from '../src/life-cycle-v040.js';
import { nextEligibleTurn } from '../src/encounter.js';

const pc = overrides => ({
  id:'pc', kind:'character', hp:20, maxHp:20, tempHp:0, lifePhase:'active', conditions:[], speed:30, movementRemaining:30,
  presenceStatus:'on-field', participationStatus:'active', eligibleFromRound:1,
  ...overrides,
});

{
  const target=pc({hp:5,tempHp:3});
  const result=applyPcDamage(target,8,{round:1});
  assert.equal(result.input.absorbed,3);
  assert.equal(target.hp,0);
  assert.equal(pcLifePhase(target),'dying');
  assert.equal(hasCondition(target,'unconscious'),true);
  assert.equal(hasCondition(target,'prone'),true);
  assert.deepEqual(target.deathSaves,{successes:0,failures:0,history:[]});
  assert.equal(turnDisposition(target,1),'death-save');
}

{
  const dying=pc({id:'dying',hp:0,lifePhase:'dying',conditions:['unconscious','prone']}), ally=pc({id:'ally'});
  assert.equal(nextEligibleTurn(['ally','dying'],0,[ally,dying],1).index,1,'a dying PC remains in initiative for the required death save');
}

{
  const target=pc({hp:5,maxHp:20});
  assert.equal(applyPcDamage(target,25,{round:1}).outcome,'massive-damage-death');
  assert.equal(pcLifePhase(target),'dead');
}

{
  const target=pc({hp:0,lifePhase:'dying',conditions:['unconscious','prone']});
  assert.equal(applyPcDamage(target,1,{critical:true,round:2}).outcome,'two-failures');
  assert.equal(target.deathSaves.failures,2);
  assert.equal(applyPcDamage(target,1,{round:2}).outcome,'third-failure-death');
  assert.equal(pcLifePhase(target),'dead');
  assert.equal(target.deathSaves.history.length,2,'0 HP damage trajectory is retained');
}

{
  const target=pc({hp:0,lifePhase:'dying',conditions:['unconscious','prone']});
  assert.equal(recordDeathSave(target,1,{round:1}).outcome,'natural-1-two-failures');
  assert.equal(target.deathSaves.failures,2);
  assert.equal(recordDeathSave(target,10,{round:2}).outcome,'success');
  assert.equal(recordDeathSave(target,10,{round:3}).outcome,'success');
  assert.equal(recordDeathSave(target,10,{round:4}).outcome,'third-success-stable');
  assert.equal(pcLifePhase(target),'stable');
  assert.equal(hasCondition(target,'unconscious'),true);
  assert.equal(hasCondition(target,'prone'),true);
  assert.equal(target.deathSaves.successes,0);
  assert.equal(target.deathSaves.history.length,4);
}

{
  const target=pc({hp:0,lifePhase:'dying',conditions:['unconscious','prone']});
  assert.equal(recordDeathSave(target,20,{round:1}).outcome,'natural-20-revive');
  assert.equal(target.hp,1);
  assert.equal(pcLifePhase(target),'active');
  assert.equal(hasCondition(target,'unconscious'),false);
  assert.equal(hasCondition(target,'prone'),true,'natural 20 restores HP but does not stand the PC');
  assert.equal(standPcUp(target,{round:1}).outcome,'stood-up');
  assert.equal(target.movementRemaining,15);
  assert.equal(hasCondition(target,'prone'),false);
}

{
  const target=pc({hp:0,lifePhase:'dying',conditions:['unconscious','prone']});
  recordDeathSave(target,10,{round:1,source:'terminal-d20'});
  assert.equal(target.deathSaves.history.at(-1).source,'terminal-d20','Terminal d20 rolls retain their source for audit');
}

{
  const target=pc({hp:0,lifePhase:'dying',conditions:['unconscious','prone']});
  assert.throws(()=>medicallyStabilizePc(target,{helperId:'ally',checkTotal:12,actionSpent:false}),/消耗施救者动作/);
  assert.equal(medicallyStabilizePc(target,{helperId:'ally',checkTotal:9,actionSpent:true,round:1}).outcome,'failed');
  assert.equal(pcLifePhase(target),'dying');
  assert.equal(medicallyStabilizePc(target,{helperId:'ally',checkTotal:10,actionSpent:true,round:1}).outcome,'stable');
  assert.equal(pcLifePhase(target),'stable');
  assert.equal(healPc(target,5,{round:2}).outcome,'alive');
  assert.equal(target.hp,5);
  assert.equal(target.deathSaves.history.at(-1).kind,'positive-healing');
  assert.equal(hasCondition(target,'unconscious'),false);
  assert.equal(hasCondition(target,'prone'),true,'healing does not silently stand the PC');
}

{
  const target=pc({hp:0,lifePhase:'needs-review'});
  assert.throws(()=>healPc(target,1),/不能通过普通治疗/);
  assert.throws(()=>correctPcLifeState(target,{lifeStatus:'alive',hp:1,reason:''}),/必须记录原因/);
  correctPcLifeState(target,{lifePhase:'dying',hp:0,reason:'DM 根据桌面记录确认',round:1});
  assert.equal(pcLifePhase(target),'dying');
  assert.equal(target.deathSaves.history.at(-1).kind,'dm-correction');
}

const legacySession={
  schemaVersion:'0.2.0',sessionId:'legacy',events:[],settings:{},encounter:{phase:'confirmed',members:[]},effects:[],
  combatants:[pc({id:'positive',hp:2,lifePhase:undefined,lifeStatus:undefined}),pc({id:'zero',hp:0,lifePhase:undefined,lifeStatus:undefined})],ui:{},
};
const legacyEnvelope={schemaVersion:'0.2.0',appVersion:'0.2.0',session:legacySession};
const migrated=validateV040Envelope(legacyEnvelope,()=> 'id',()=> 'time');
assert.equal(migrated.session.schemaVersion,'0.3.0');
assert.equal(pcLifePhase(migrated.session.combatants[0]),'active');
assert.equal(pcLifePhase(migrated.session.combatants[1]),'needs-review','legacy 0 HP PC is not assigned invented history');
assert.equal(migrated.session.combatants[1].deathSaves.history.length,0);

const v010=validateV040Envelope({schemaVersion:'0.1.0',session:{...legacySession,schemaVersion:'0.1.0',encounter:undefined}},()=> 'migrated-encounter',()=> 'time');
assert.equal(v010.session.schemaVersion,'0.3.0');
assert.equal(v010.session.encounter.migratedFrom,'0.1.0','v0.1 envelopes use the established encounter migration before v0.4 normalization');

const current=createV040Envelope(normalizeV040Session(legacySession,{legacy:true}),{exportedAt:'time'});
assert.equal(current.schemaVersion,'0.3.0');
assert.equal(current.deliveryVersion,'0.4.0');
assert.equal(pcLifePhase(validateV040Envelope(current,()=> 'id',()=> 'time').session.combatants[1]),'needs-review');
assert.throws(()=>validateV040Envelope({...current,schemaVersion:'0.4.0'},()=> 'id',()=> 'time'),/仅接受/);

function storage(entries={}){
  const values=new Map(Object.entries(entries));
  return {getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,value),values};
}
{
  const oldRaw=JSON.stringify(legacyEnvelope),store=storage({[V031_STORAGE_KEY]:oldRaw});
  const choice=chooseStartupSession(store,()=> 'id',()=> 'time');
  assert.equal(choice.kind,'migrated-legacy-copy');
  assert.equal(choice.shouldPersist,true);
  assert.equal(store.getItem(V031_STORAGE_KEY),oldRaw,'startup selection never mutates the old key');
  assert.equal(store.getItem(V040_STORAGE_KEY),null,'selection alone does not write before validation returns');
}
{
  const corrupt='{not json',store=storage({[V040_STORAGE_KEY]:corrupt,[V031_STORAGE_KEY]:JSON.stringify(legacyEnvelope)});
  const choice=chooseStartupSession(store,()=> 'id',()=> 'time');
  assert.equal(choice.kind,'blocked-corrupt-current');
  assert.equal(choice.raw,corrupt);
  assert.equal(store.getItem(V040_STORAGE_KEY),corrupt);
  assert.equal(choice.session,null,'a corrupt new key cannot silently fall back to legacy data');
}
{
  const store=storage({[V020_STORAGE_KEY]:JSON.stringify({...legacyEnvelope,schemaVersion:'9.0.0'})});
  assert.equal(chooseStartupSession(store,()=> 'id',()=> 'time').kind,'blocked-corrupt-legacy');
}

console.log('life-cycle-v040.test.mjs: pass');
