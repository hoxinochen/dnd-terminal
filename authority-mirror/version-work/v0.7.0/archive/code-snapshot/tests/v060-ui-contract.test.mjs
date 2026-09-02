import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [app,index,domain]=await Promise.all([
  readFile(new URL('../src/app.js',import.meta.url),'utf8'),
  readFile(new URL('../index.html',import.meta.url),'utf8'),
  readFile(new URL('../src/life-cycle-v060.js',import.meta.url),'utf8'),
]);

for(const marker of ['恢复原身体','以新身体或新形态继续冒险','制造受控不死生物','普通新身体','不死生物形态','其他自定义形态','法术 / 依据','裁定资料','裁定预览','data-v060-ruling-mode','自定义依据','查看详细参考','DM 管理（不自动计时）','一次长休不等于 24 小时','遗体防腐记录','不追踪长期控制者','data-v060-shape','pc.successor.confirmed','v060OptionalRecord','requireDuplicateSourceConfirmation','预览：恢复原实例'])assert(app.includes(marker),`v0.6 UI contains ${marker}`);
for(const spell of ['回生术','死者复活','复生术','完全复生术','转生术','克隆术','活化死尸','唤起亡灵'])assert(domain.includes(spell),`v0.6 spell catalog includes ${spell}`);
assert.doesNotMatch(app,/\['undead-pc','以亡灵身份继续冒险'/,'v0.6 has no fourth top-level undead PC card');
assert.match(app,/const SESSION_ENVELOPE_SCHEMA_VERSION = V070_SESSION_SCHEMA_VERSION;/);
assert.match(app,/const STORAGE_KEY = V070_STORAGE_KEY;/);
assert.match(domain,/V060_SESSION_SCHEMA_VERSION = '0\.5\.0'/);
assert.match(index,/DND Terminal v0\.7\.0 — DM Workbench/);
assert.match(index,/src\/app\.js\?v=20260902-5/);

console.log('v060-ui-contract.test.mjs: pass');
