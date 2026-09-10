import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { sessionForStorage } from '../src/session-persistence.js';

const source = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
const session = {
  name: '投影测试',
  ui: { tab: '地图', selectedId: 'combatant-1', message: '仅显示', messageKind: 'warn', startupRecoveryRequired: false, entryPlacement: { items: [{ id: 'draft-1' }] } },
  combatProjections: [{ projectionId: 'projection-1', hp: { current: 20, max: 20 }, sheetSnapshot: { large: 'p'.repeat(30_000) } }],
  combatants: [{ id: 'combatant-1', hp: 20, combatProjectionSnapshot: { large: 'c'.repeat(30_000) } }],
  encounter: { id: 'encounter-1', members: [{ id: 'member-1', combatProjectionSnapshot: { large: 'm'.repeat(30_000) } }], phase: 'preparation' },
  events: [{
    id: 'event-1', type: 'combatant.hp.changed', payload: { id: 'projection-1', amount: -3 },
    before: { characters: [{ characterId: 'lia', revisions: [{ large: 'x'.repeat(30_000) }] }] },
    after: { combatProjections: [{ projectionId: 'projection-1', large: 'y'.repeat(30_000) }] },
  }],
};
const stored = sessionForStorage(session, structuredClone);

assert.equal(stored.events[0].id, 'event-1');
assert.equal('before' in stored.events[0], false);
assert.equal('after' in stored.events[0], false);
assert.equal(JSON.stringify(stored).includes('x'.repeat(100)), false);
assert.equal(JSON.stringify(stored).includes('y'.repeat(100)), false);
assert.equal('sheetSnapshot' in stored.combatProjections[0], false);
assert.equal('combatProjectionSnapshot' in stored.combatants[0], false);
assert.equal('combatProjectionSnapshot' in stored.encounter.members[0], false);
assert.equal(JSON.stringify(stored).includes('p'.repeat(100)), false);
assert.equal(JSON.stringify(stored).includes('c'.repeat(100)), false);
assert.equal(JSON.stringify(stored).includes('m'.repeat(100)), false);
assert.ok(session.events[0].before, 'in-memory undo checkpoint remains available');
assert.ok(session.combatProjections[0].sheetSnapshot, 'in-memory projection audit snapshot remains available');
assert.equal('tab' in stored.ui, false, 'workspace navigation belongs to UiPreferences');
assert.equal('selectedId' in stored.ui, false, 'selection is presentation state');
assert.equal('message' in stored.ui, false, 'notices are not exported as business facts');
assert.deepEqual(stored.ui.entryPlacement, session.ui.entryPlacement, 'recovery-sensitive placement drafts remain resumable');

assert.match(source, /session-persistence\.js\?v=20260821-7/);
assert.match(source, /sessionForStorage\(state,clone\)/);
assert.match(source, /phase='序列化会话'/);
assert.match(source, /phase='写入浏览器存储'/);
assert.match(source, /战斗保存失败（\$\{phase\}）：\$\{detail\}/);
assert.match(source, /浏览器存储空间不足；本次压缩会话约 \$\{serializedKilobytes\(serialized\)\} KB/);
assert.match(source, /return false; \}/);
assert.match(source, /function requestEndCombat\(\)/);
assert.match(source, /function confirmEndCombat\(save=false\)/);
assert.match(source, /data-end-combat-confirm="save"/);
assert.match(source, /injectEndCombatPanel\(\);/);
assert.match(source, /UnitTemplate ID: \$\{t\.id\}/);
assert.match(source, /requestedTemplateId\}”不存在或已归档/);
assert.match(source, /preset-scout；实际 ID 请从单位库复制/);
assert.match(source, /createEncounterMember\(template,uid\(\),position\)/);
assert.doesNotMatch(source, /createEncounterMember\(template,uid,position\)/);

console.log('persistence-m1-s5.test.mjs: pass');
