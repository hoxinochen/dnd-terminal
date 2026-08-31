import assert from 'node:assert/strict';
import {
  V060_DELIVERY_VERSION,
  V060_SESSION_SCHEMA_VERSION,
  V060_STORAGE_KEY,
  V060_SPELLS,
  V060_RULING_MODES,
  chooseV060StartupSession,
  createV060Envelope,
  normalizeV060Session,
  spellForV060,
  spellsForV060,
  validateV060Envelope,
} from '../src/life-cycle-v060.js';
import { V050_STORAGE_KEY } from '../src/life-cycle-v050.js';

const session={schemaVersion:'0.4.1',sessionId:'v060',events:[{id:'event-1'}],settings:{width:24,height:18},encounter:{phase:'preparation',members:[]},combatants:[],turn:{round:0,index:-1,order:[],started:false},ui:{}};

assert.equal(V060_SESSION_SCHEMA_VERSION,'0.5.0');
assert.equal(V060_DELIVERY_VERSION,'0.6.0');
assert.notEqual(V060_STORAGE_KEY,V050_STORAGE_KEY);
assert.equal(V060_SPELLS.length,8);
assert.equal(V060_RULING_MODES.standard.length,4);
assert.equal(V060_RULING_MODES.material.length,4);
assert.deepEqual(spellsForV060('restore').map(item=>item.name),['回生术','死者复活','复生术','完全复生术']);
assert.deepEqual(spellsForV060('successor').map(item=>item.name),['完全复生术','转生术','克隆术']);
assert.deepEqual(spellsForV060('controlled').map(item=>item.name),['活化死尸','唤起亡灵']);
assert.equal(spellForV060('controlled','animate-dead').name,'活化死尸');
assert.deepEqual(spellForV060('restore','revivify').rulingFields.map(field=>field.id),['death-window','material','old-age','body-repair']);
assert.equal(spellForV060('controlled','create-undead').meta,'6 环｜1 分钟｜10 尺');
assert.equal(spellForV060('successor','custom').name,'自定义依据');
assert.throws(()=>spellForV060('restore','clone'),/不适用于/);

const envelope=createV060Envelope(normalizeV060Session(session),{exportedAt:'2026-08-31T00:00:00.000Z'});
assert.equal(envelope.schemaVersion,V060_SESSION_SCHEMA_VERSION);
assert.equal(envelope.deliveryVersion,V060_DELIVERY_VERSION);
assert.equal(validateV060Envelope(envelope,()=> 'id',()=> 'time').session.schemaVersion,V060_SESSION_SCHEMA_VERSION);
assert.throws(()=>validateV060Envelope({...envelope,session:{...envelope.session,events:[{id:'same'},{id:'same'}]}},()=> 'id',()=> 'time'),/事件 ID 重复/);

function storage(entries={}){const values=new Map(Object.entries(entries));return {getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,value),values};}
const legacy=JSON.stringify({schemaVersion:'0.4.1',appVersion:'0.4.1',deliveryVersion:'0.5.0',session});
const migrated=chooseV060StartupSession(storage({[V050_STORAGE_KEY]:legacy}),()=> 'id',()=> 'time');
assert.equal(migrated.kind,'migrated-legacy-copy');
assert.equal(migrated.sourceKey,V050_STORAGE_KEY);
assert.equal(migrated.session.schemaVersion,V060_SESSION_SCHEMA_VERSION);

console.log('life-cycle-v060.test.mjs: pass');
