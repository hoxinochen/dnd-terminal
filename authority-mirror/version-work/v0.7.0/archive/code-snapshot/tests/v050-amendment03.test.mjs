import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CHARACTER_SHEET_SCHEMA_VERSION } from '../src/characters.js';
import { V050_PRE_AMENDMENT_STORAGE_KEY, V050_SESSION_SCHEMA_VERSION, V050_STORAGE_KEY } from '../src/life-cycle-v050.js';

const [app, index, domain] = await Promise.all([
  readFile(new URL('../src/app.js', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../src/life-cycle-v050.js', import.meta.url), 'utf8'),
]);

assert.equal(CHARACTER_SHEET_SCHEMA_VERSION, '0.3.0-m1-s6');
assert.equal(V050_SESSION_SCHEMA_VERSION, '0.4.1');
assert.notEqual(V050_STORAGE_KEY, V050_PRE_AMENDMENT_STORAGE_KEY, 'Amendment 03 session persistence is copy-on-write');
assert.match(domain, /controlledEntityProjections/);
assert.match(domain, /V050_PRE_AMENDMENT_STORAGE_KEY/);

for (const marker of [
  '恢复原身体', '以新身体或新形态继续冒险', '制造受控不死生物', '普通新身体',
  '拖动半透明预览棋子到空格；可反复调整', '确认摆放并生成', '已有棋子、尸体棋子或越界都会阻止生成', '取消不会创建实例、控制关系或事件',
  'controlled-entity', '受控生物', '登记一次长休', 'DM 确认：已在到期前续控一次', '记录尝试续控意图',
  'expired-uncontrolled', 'decrementControlledDurations', 'controlled-command.issued',
]) assert(app.includes(marker), `Amendment 03 contract includes ${marker}`);

assert(app.includes('const candidates=[...mapTokenOccupants(),...pendingPlacementCombatants()]'), 'placement checks all map tokens, including corpse tokens');
assert.match(app, /data-s2-placement-token/, 'S2 placement renders a distinct draft token');
assert.match(app, /kind:'s2-placement'/, 'S2 draft token supports a dedicated drag gesture');
assert.match(app, /data-s2-placement-confirm/, 'S2 placement has an explicit durable confirmation action');
assert.match(app, /function cancelS2Placement\(\).*未创建事件、战斗实例、角色卡修订或长期关联/s, 'cancelling the visual placement leaves no durable writes');
assert.match(app, /kind:'controlled-entity'/, 'post-combat writeback has a structured controlled entity entry');
assert.match(app, /controlledEntity:entity/, 'the pending candidate preserves a structured controlled relationship');
assert.match(app, /duration\?\.kind!=='custom'\|\|duration\.unit!==unit/, 'round and encounter duration logic is explicit');
assert.match(app, /function materializeControlledEntity/, 'controlled entities reuse the preparation-stage materialization path');
assert.match(app, /data-controlled-materialize/, 'eligible controlled entities can be added to a new encounter');
assert.match(app, /CONTROLLED_ASSOCIATED_TOKEN_COLOR='#c69bf7'/, 'controlled associated creatures have a dedicated violet token color');
assert.match(app, /controlled-associated/, 'controlled creature token styling is distinct from its monster template relation');
assert.match(index, /src="src\/app\.js\?v=20260902-5"/);

console.log('v050-amendment03.test.mjs: pass');
