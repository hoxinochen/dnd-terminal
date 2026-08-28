import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [app,index,domain]=await Promise.all([
  readFile(new URL('../src/app.js',import.meta.url),'utf8'),
  readFile(new URL('../index.html',import.meta.url),'utf8'),
  readFile(new URL('../src/life-cycle-v050.js',import.meta.url),'utf8'),
]);

for(const marker of ['data-pc-return-to-life-form','DM 确认复活','basisStatus','basisLabel','soulReturn','effectDisposition','conditionHandling','mapOutcome','initiativeOutcome','resolutionId','最近复活记录','Resolution / Event ID','eventId:payload.resolutionId','note-append','接受并追加备注','unlinkedRevivedPcs','不会生成角色卡备注候选','DM Notes','当前长期角色卡备注','data-character-region="notes"','战后“复活记录”候选在 DM 接受前不会写入'])assert(app.includes(marker),`S1 UI captures ${marker}`);
for(const marker of ['恢复原身体','获得新身体继续冒险','制造受控亡灵','以亡灵身份继续冒险','前往地图摆放','createIndependentSuccessorRecord','controllerLink','postCombatWritebackDisabled','pc.replacement.confirmed','pc.undead-successor.confirmed','combatant.controlled-undead.created'])assert(app.includes(marker),`S2 UI captures ${marker}`);
assert(app.includes('pc.return-to-life.confirmed'),'S1 event contract includes the return-to-life event');
for(const outcome of ['restore-original-token','restore-original-slot'])assert(domain.includes(outcome),`S1 lifecycle contract includes ${outcome}`);
assert.match(app,/function openDeathResolution\(id,mode='menu'\)\{const c=getCombatant\(id\);if\(!isDead\(c\)\|\|isPc\(c\)\|\|combatEnded\(\)\)return;/,'PCs cannot enter the Monster/NPC death-resolution menu');
assert.match(app,/function applyTransformation\(item,\{staged=false\}=\{\}\)\{const source=getCombatant\(item\.sourceCombatantId\),c=item\.combatant;if\(!source\|\|isPc\(source\)\|\|!isDead\(source\)\|\|combatEnded\(\)\)return false;/,'PCs cannot invoke the Monster/NPC transformation command');
assert.match(app,/host\.querySelectorAll\('\[data-death-resolve\]'\)/,'PC UI removes the generic Monster/NPC entry point');
assert.match(app,/const SESSION_ENVELOPE_SCHEMA_VERSION = V050_SESSION_SCHEMA_VERSION;/);
assert.match(app,/const STORAGE_KEY = V050_STORAGE_KEY;/);
assert.match(index,/DND Terminal v0\.5\.0 — Local Private Implementation/);
assert.match(index,/src\/app\.js\?v=20260828-3/,'Chrome must load the current app bundle after the controlled-creature color update');
assert.match(domain,/V050_SESSION_SCHEMA_VERSION = '0\.4\.1'/,'Amendment 03 promotes the Session Schema while preserving delivery/schema distinction');

console.log('v050-s1-ui-contract.test.mjs: pass');
