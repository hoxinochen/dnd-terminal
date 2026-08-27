import assert from 'node:assert/strict';
import {
  archiveCharacterRecord,
  canPermanentlyDeleteCharacterRecord,
  createCharacterRecord,
  createCharacterSheet,
  currentCharacterSheet,
  normalizeCharacterRecord,
  restoreCharacterRecord,
} from '../src/characters.js';

let sequence = 0;
const id = () => `lifecycle-${++sequence}`;
const timestamp = () => '2026-08-21T18:00:00.000Z';
const sheet = createCharacterSheet({name:'生命周期验证角色',hp:{current:10,max:10},resources:{功力:{current:2,max:2}}},{id,timestamp});
const record = createCharacterRecord(sheet);

assert.equal(record.status,'active');
assert.equal(normalizeCharacterRecord({...record,revisions:record.revisions}).status,'active','legacy records migrate to active');
const archived = archiveCharacterRecord(record,{timestamp,reason:'测试归档'});
assert.equal(archived.status,'archived');
assert.equal(archived.archivedAt,timestamp());
assert.equal(archived.archivedReason,'测试归档');
assert.equal(currentCharacterSheet(archived).name,'生命周期验证角色');
assert.equal(canPermanentlyDeleteCharacterRecord(archived),true);
assert.equal(canPermanentlyDeleteCharacterRecord(archived,{activeReferences:1}),false);
assert.equal(canPermanentlyDeleteCharacterRecord(record),false,'active records require archive first');
const restored = restoreCharacterRecord(archived);
assert.equal(restored.status,'active');
assert.equal(restored.archivedAt,null);
assert.equal(restored.archivedReason,null);
console.log('character-lifecycle-m1-s5.test.mjs: pass');
