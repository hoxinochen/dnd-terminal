import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [appSource, styleSource] = await Promise.all([
  readFile(new URL('../src/app.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
]);

for (const tab of ['combat', 'checks', 'actions', 'equipment', 'origin', 'linked', 'revisions']) {
  assert(appSource.includes(`['${tab}',`), `detail view declares ${tab} tab`);
}
assert(appSource.includes('role="tablist"'), 'detail view has a semantic tab list');
assert(appSource.includes("document.querySelectorAll('[data-character-detail-tab]')"), 'detail tabs have a click binding');
assert(appSource.includes('攻击伤害保持独立；条件特性不会合并进此数值。'), 'conditional features remain separate from attacks');
assert(appSource.includes('展示事实，不自动触发'), 'feature display does not claim automatic execution');
assert(appSource.includes("payload.masteryPropertyId!=='phb2024:vex'"), 'only the admitted Vex candidate flow is automated');
assert(appSource.includes('不执行法术效果'), 'spell automation remains outside the M1-S4 data skeleton');
assert(appSource.includes('equipmentByContainer'), 'equipment is grouped by imported container');
assert(appSource.includes('未识别到“武器精通”职业特性；本次不要求 DM 补充当前选择。'), 'import preview does not request a mastery choice without an imported grant');
assert(appSource.includes("const masteryRelevant=(input.weaponMastery.grants||[]).length>0"), 'mastery confirmation is conditional on explicit imported grants');
assert(appSource.includes('未识别到角色武器精通资格，不要求 DM 选择或触发效果。'), 'detail view suppresses the mastery request without an imported grant');
assert(styleSource.includes('.character-detail-tabs'), 'detail tab visual treatment exists');
assert(styleSource.includes('.character-quick-grid'), 'compact quick-info visual treatment exists');

console.log('character-ui-m1-s3.test.mjs: pass');
