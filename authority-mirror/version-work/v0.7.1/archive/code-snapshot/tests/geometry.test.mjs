import assert from 'node:assert/strict';
import { coverageRatio, coveredCellsForRange } from '../src/geometry.js';

const settings = { width: 3, height: 2, cellFeet: 5 };
const line = size => ({ shape: 'line', origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 }, size });

assert.ok(coverageRatio(line(4.999), 1, 0, 5) < 0.5, '49.99% line overlap must not cover');
assert.equal(coverageRatio(line(5), 1, 0, 5), 0.5, '50% line overlap must be exact');
assert.ok(coverageRatio(line(5.001), 1, 0, 5) > 0.5, 'over 50% line overlap must cover');
assert.equal(coveredCellsForRange(line(4.999), settings).includes('1,0'), false);
assert.equal(coveredCellsForRange(line(5), settings).includes('1,0'), true);
assert.equal(coveredCellsForRange(line(5.001), settings).includes('1,0'), true);

const edgeTouchSquare = { shape: 'square', origin: { x: 0, y: 0 }, size: 5 };
assert.equal(coverageRatio(edgeTouchSquare, 1, 0, 5), 0, 'edge-only contact must have zero area');
assert.equal(coveredCellsForRange(edgeTouchSquare, settings).includes('1,0'), false);

const edgeTouchCircle = { shape: 'circle', origin: { x: 0, y: 0 }, size: 2.5 };
assert.equal(coveredCellsForRange(edgeTouchCircle, settings).includes('1,0'), false, 'circle tangent must not cover');

console.log('geometry.test.mjs: pass');
