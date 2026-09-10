import assert from 'node:assert/strict';
import {
  V050_SESSION_SCHEMA_VERSION,
  V050_PRE_AMENDMENT_STORAGE_KEY,
  V050_STORAGE_KEY,
  chooseV050StartupSession,
  createV050Envelope,
  normalizeV050Session,
  returnPcToLife,
  validateV050Envelope,
} from '../src/life-cycle-v050.js';
import { V040_STORAGE_KEY } from '../src/life-cycle-v040.js';

const pc = overrides => ({
  id:'pc', kind:'character', name:'Aria', hp:0, maxHp:20, tempHp:4,
  lifePhase:'dead', lifeStatus:'dead', conditions:['unconscious','prone','cursed'],
  deathSaves:{successes:0,failures:3,history:[{kind:'failure',round:2,result:'third-failure-death'}]},
  deathRecord:{atRound:2,reason:'failed saves'},
  presenceStatus:'on-field', participationStatus:'active', eligibleFromRound:1,
  resources:{}, resourceMax:{}, slots:{}, slotsMax:{}, speed:30, movementRemaining:0,
  ...overrides,
});

{
  const target=pc();
  const result=returnPcToLife(target,{
    hp:7, basisStatus:'dm-ruling', basisLabel:'战役内 DM 裁定', soulReturn:'confirmed',
    effectDisposition:'保留诅咒；疾病与力竭由 DM 在桌面记录。', conditionHandling:'preserve', mapOutcome:'restore-original-token', initiativeOutcome:'restore-original-slot',
    reason:'DM 已确认角色返回战斗。', resolutionId:'resolution-1', round:3,
  });
  assert.equal(result.outcome,'returned-to-life');
  assert.equal(target.hp,7);
  assert.equal(target.tempHp,0);
  assert.equal(target.lifePhase,'active');
  assert.equal(target.lifeStatus,'alive','lifeStatus remains the compatibility mirror');
  assert.deepEqual(target.conditions,['prone','cursed'],'preserve removes only unconscious');
  assert.equal(target.deathSaves.history.length,1,'death-save history is retained');
  assert.equal(target.deathRecord.latestResolutionId,'resolution-1');
  assert.equal(target.deathRecord.resolutions.at(-1).mapOutcome,'restore-original-token');
  assert.equal(target.deathRecord.resolutions.at(-1).initiativeOutcome,'restore-original-slot');
}

{
  const target=pc({conditions:['unconscious','prone','cursed']});
  returnPcToLife(target,{
    hp:1, basisStatus:'verified-entry', basisLabel:'DM 已核验的适用条目', soulReturn:'not-applicable',
    effectDisposition:'全部清空由 DM 明示。', conditionHandling:'clear', mapOutcome:'restore-original-token', initiativeOutcome:'restore-original-slot', reason:'测试清空条件。', resolutionId:'resolution-2',
  });
  assert.deepEqual(target.conditions,[]);
}

{
  assert.throws(()=>returnPcToLife(pc({kind:'npc'}),{}),/只有已死亡/);
  assert.throws(()=>returnPcToLife(pc(),{
    hp:1, basisStatus:'dm-ruling', basisLabel:'裁定', soulReturn:'unknown', effectDisposition:'DM 处理', conditionHandling:'preserve', mapOutcome:'restore-original-token', initiativeOutcome:'restore-original-slot', reason:'测试', resolutionId:'r',
  }),/灵魂/);
  assert.throws(()=>returnPcToLife(pc(),{
    hp:0, basisStatus:'dm-ruling', basisLabel:'裁定', soulReturn:'confirmed', effectDisposition:'DM 处理', conditionHandling:'preserve', mapOutcome:'restore-original-token', initiativeOutcome:'restore-original-slot', reason:'测试', resolutionId:'r',
  }),/HP/);
}

const session={
  schemaVersion:V050_SESSION_SCHEMA_VERSION, sessionId:'session', name:'S1', events:[], settings:{width:24,height:18},
  encounter:{phase:'confirmed',members:[]}, effects:[], combatants:[pc()], turn:{round:2,index:0,order:['pc'],started:true}, ui:{},
};

{
  const envelope=createV050Envelope(normalizeV050Session(session),{exportedAt:'2026-08-27T00:00:00.000Z'});
  assert.equal(envelope.schemaVersion,'0.4.1');
  assert.equal(envelope.deliveryVersion,'0.5.0');
  assert.equal(validateV050Envelope(envelope,()=> 'unused',()=> 'unused').session.schemaVersion,'0.4.1');
  assert.throws(()=>validateV050Envelope({...envelope,session:{...envelope.session,combatants:[pc({lifePhase:'active',hp:0})]}},()=> 'unused',()=> 'unused'),/active PC/);
}

function storage(entries={}){
  const values=new Map(Object.entries(entries));
  return {getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,value),values};
}
{
  const priorV050={schemaVersion:'0.4.0',appVersion:'0.4.0',session:{...session,schemaVersion:'0.4.0'}};
  const priorRaw=JSON.stringify(priorV050),store=storage({[V050_PRE_AMENDMENT_STORAGE_KEY]:priorRaw});
  const choice=chooseV050StartupSession(store,()=> 'id',()=> 'time');
  assert.equal(choice.kind,'migrated-legacy-copy');
  assert.equal(choice.sourceKey,V050_PRE_AMENDMENT_STORAGE_KEY);
  assert.equal(choice.session.schemaVersion,V050_SESSION_SCHEMA_VERSION);
  assert.equal(store.getItem(V050_PRE_AMENDMENT_STORAGE_KEY),priorRaw,'pre-Amendment 03 storage remains an untouched source');
}
{
  const legacyEnvelope={schemaVersion:'0.3.0',appVersion:'0.3.0',session:{...session,schemaVersion:'0.3.0'}};
  const oldRaw=JSON.stringify(legacyEnvelope),store=storage({[V040_STORAGE_KEY]:oldRaw});
  const choice=chooseV050StartupSession(store,()=> 'id',()=> 'time');
  assert.equal(choice.kind,'migrated-legacy-copy');
  assert.equal(choice.sourceKey,V040_STORAGE_KEY);
  assert.equal(choice.shouldPersist,true);
  assert.equal(store.getItem(V040_STORAGE_KEY),oldRaw,'startup selection never mutates the archived-era key');
  assert.equal(store.getItem(V050_STORAGE_KEY),null,'selection alone does not write the new key');
}
{
  const corrupt='{not json',store=storage({[V050_STORAGE_KEY]:corrupt,[V040_STORAGE_KEY]:JSON.stringify({})});
  const choice=chooseV050StartupSession(store,()=> 'id',()=> 'time');
  assert.equal(choice.kind,'blocked-corrupt-current');
  assert.equal(choice.raw,corrupt);
  assert.equal(choice.session,null,'a corrupt v0.5 key cannot silently fall back to an older key');
}

console.log('life-cycle-v050.test.mjs: pass');
