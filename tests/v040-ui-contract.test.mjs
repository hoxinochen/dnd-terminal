import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [app,domain,index]=await Promise.all([
  readFile(new URL('../src/app.js',import.meta.url),'utf8'),
  readFile(new URL('../src/life-cycle-v040.js',import.meta.url),'utf8'),
  readFile(new URL('../index.html',import.meta.url),'utf8'),
]);

for(const marker of ['data-death-save-form','data-death-save-roll','data-pc-stand','data-medical-stabilize-form','data-life-correction-form','死亡豁免轨迹','本次为重击'])assert(app.includes(marker),`UI contract includes ${marker}`);
for(const event of ['pc.damage.resolved','pc.healing.resolved','pc.death-save.resolved','pc.medical-stabilization.resolved','pc.life-state.corrected','pc.prone.stood'])assert(app.includes(event),`event contract includes ${event}`);
assert(app.includes('storageBlocked'));
assert(app.includes('旧存储键'));
assert(app.includes('CharacterSheet（长期只读）'));
assert(app.includes("unknown:'待确认'"),'spellcasting ability presentation localizes stable internal IDs');
assert(domain.includes("'needs-review'"));
assert(domain.includes("'dying'"));
assert(domain.includes("'prone'"));
assert(domain.includes('blocked-corrupt-current'));
assert(index.includes('DND Terminal v0.4.0'));

console.log('v040-ui-contract.test.mjs: pass');
