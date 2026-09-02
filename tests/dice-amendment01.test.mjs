import assert from 'node:assert/strict';
import { parseDiceFormula, parseDiceShortcut, rollDiceFormula } from '../src/dice.js';

const parsed = parseDiceFormula(' 2D6 + 2d4 + 1 ');
assert.equal(parsed.ok, true);
assert.equal(parsed.canonical, '2d6+2d4+1');
assert.equal(parsed.modifier, 1);
assert.equal(parsed.diceTerms.length, 2);
assert.equal(parseDiceFormula('2d6+2d4+1').ok, true);
assert.equal(parseDiceFormula('1d1').ok, false);
assert.equal(parseDiceFormula('1d20*(2)').ok, false);
assert.equal(parseDiceFormula('201d6').ok, false);
assert.equal(parseDiceFormula('1d20+100001').ok, false);

const shortcut = parseDiceShortcut('110284');
assert.equal(shortcut.ok, true);
assert(shortcut.candidates.includes('1d10+2d8+4'), 'documented quick shortcut remains selectable');

const rolled = rollDiceFormula(parsed, 'normal', () => 0);
assert.deepEqual(rolled.dice, [1, 1, 1, 1]);
assert.equal(rolled.total, 5);
assert.equal(rolled.formulaRaw, ' 2D6 + 2d4 + 1 ');
assert.equal(rolled.formulaCanonical, '2d6+2d4+1');
assert.deepEqual(rolled.terms.map(term => term.subtotal), [2, 2, 1]);
assert.throws(() => rollDiceFormula(parsed, 'advantage', () => 0), /优势\/劣势/);
const advantage = rollDiceFormula(parseDiceFormula('1d20-2'), 'advantage', (() => { const values = [0, .9]; return () => values.shift(); })());
assert.equal(advantage.kept, 19);
assert.equal(advantage.total, 17);

console.log('dice-amendment01.test.mjs: pass');
