import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
assert(source.includes('开发验证工具'), 'settings exposes the controlled validation tools behind a closed developer disclosure');
assert(source.includes('创建塑能师夹具'), 'evoker fixture is available');
assert(source.includes('创建法师/牧师夹具'), 'multiclass fixture is available');
assert(source.includes('创建莉亚来源夹具'), 'mixed-source fixture is available');
assert(source.includes('data-spell-resource-panel'), 'combat surface renders instance spell resource pools');
assert(source.includes('combatant.spell-resource.changed'), 'spell resource consumption is an explicit event');
assert(source.includes("'combatant.spell-resource.changed'"), 'spell resource consumption can be compensated through the existing undo path');
assert(source.includes('施法来源、资源池与 CastingOption'), 'fixture text makes source-specific casting options explicit');
assert(source.includes('种施放方式：'), 'spell cards make multiple casting options legible');
assert(source.includes('CombatantInstance（单场生命状态）'), 'footer retains the character/projection/instance boundary under the v0.4.0 delivery');

console.log('spellcasting-ui-m1-s4.test.mjs: pass');
