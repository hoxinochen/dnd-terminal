import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CHARACTER_SHEET_SCHEMA_VERSION } from '../src/characters.js';
import { createSessionEnvelope, V020_SCHEMA_VERSION, validateImportedEnvelope } from '../src/encounter.js';
import { createV040Envelope, V040_SESSION_SCHEMA_VERSION, validateV040Envelope } from '../src/life-cycle-v040.js';

const [appSource, indexSource, v020BrowserFixture, v031BrowserFixture] = await Promise.all([
  readFile(new URL('../src/app.js', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('./fixtures/v020-browser-compat.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('./fixtures/v031-browser-compat.json', import.meta.url), 'utf8').then(JSON.parse),
]);
const session = {
  schemaVersion: V020_SCHEMA_VERSION,
  sessionId: 'v031-fixture',
  events: [{ id: 'event-1' }],
  combatants: [],
  settings: {},
  encounter: { phase: 'preparation', members: [] },
};

const exported = createSessionEnvelope(session, {
  exportedAt: '2026-08-24T00:00:00.000Z',
  deliveryVersion: '0.3.1',
});
assert.equal(exported.schemaVersion, '0.2.0', 'v0.3.1 keeps the stable Session Envelope Schema');
assert.equal(exported.appVersion, '0.2.0', 'legacy appVersion remains an Envelope compatibility field');
assert.equal(exported.deliveryVersion, '0.3.1', 'new exports identify their delivery without changing Schema');
assert.equal(exported.checksum, 'events:1', 'export checksum remains derived from the existing event contract');

const storageEnvelope = createSessionEnvelope(session, { exportedAt: '2026-08-24T00:00:00.000Z' });
assert.equal('deliveryVersion' in storageEnvelope, false, 'browser persistence keeps the existing Envelope shape');

const legacy = validateImportedEnvelope({
  schemaVersion: V020_SCHEMA_VERSION,
  appVersion: V020_SCHEMA_VERSION,
  session,
}, () => 'unused', () => 'unused');
assert.equal('deliveryVersion' in legacy, false, 'exports without delivery metadata remain valid');

const current = validateImportedEnvelope(exported, () => 'unused', () => 'unused');
assert.equal(current.deliveryVersion, '0.3.1', 'optional delivery metadata is preserved but does not drive validation');
assert.equal(current.session.schemaVersion, V020_SCHEMA_VERSION, 'v0.3.1 export preserves the session data shape');

assert.equal(validateImportedEnvelope(v020BrowserFixture, () => 'unused', () => 'unused').session.name, 'v0.2 浏览器兼容夹具', 'the isolated legacy browser fixture remains importable');
assert.equal(validateImportedEnvelope(v031BrowserFixture, () => 'unused', () => 'unused').deliveryVersion, '0.3.1', 'the isolated current browser fixture remains importable');

assert.throws(
  () => validateImportedEnvelope({ schemaVersion: '0.3.1', session }, () => 'unused', () => 'unused'),
  /Session Envelope Schema/,
  'a product release label is not accepted as a made-up Session Schema',
);

const v040Export = createV040Envelope(session, { exportedAt:'2026-08-25T00:00:00.000Z' });
assert.equal(v040Export.schemaVersion, V040_SESSION_SCHEMA_VERSION, 'v0.4.0 advances only the Session Envelope Schema');
assert.equal(v040Export.deliveryVersion, '0.4.0', 'v0.4.0 export identifies the delivery separately');
assert.equal(validateV040Envelope(v031BrowserFixture, ()=>'migrated', ()=>'2026-08-25').session.schemaVersion, '0.3.0', 'v0.3.1 exports migrate as read-only copies');

assert.match(appSource, /const SESSION_ENVELOPE_SCHEMA_VERSION = V040_SESSION_SCHEMA_VERSION;/);
assert.match(appSource, /const DELIVERY_VERSION = V040_DELIVERY_VERSION;/);
assert.match(appSource, /from '\.\/encounter\.js\?v=20260825-3';/, 'the Amendment 01 encounter module receives a fresh cache revision');
assert.match(indexSource, /<title>DND Terminal v0\.4\.0 — Local Private Candidate<\/title>/, 'the browser tab identity matches the candidate delivery');
assert.match(indexSource, /src="src\/app\.js\?v=20260825-2"/, 'the HTML entry revision invalidates the Amendment 01 app module cache');
assert.match(appSource, /const STORAGE_KEY = V040_STORAGE_KEY;/);
assert.match(appSource, /const LEGACY_STORAGE_KEY = V031_STORAGE_KEY;/);
assert.match(appSource, /const TEMPLATE_STORAGE_KEY = 'dnd-terminal\.v0\.2\.0\.templates';/);
assert.match(appSource, /const CHARACTER_STORAGE_KEY = 'dnd-terminal\.v0\.3\.0-m1-s5\.character-records';/);
assert.match(appSource, /const LEGACY_CHARACTER_STORAGE_KEY = 'dnd-terminal\.v0\.3\.0\.character-records';/);
assert.match(appSource, /createV040Envelope\(stored,\{exportedAt:now\(\)\}\)/);
assert.match(appSource, /createV040Envelope\(state,\{exportedAt:now\(\)\}\)/);
assert.match(appSource, /会话 Schema \$\{SESSION_ENVELOPE_SCHEMA_VERSION\}/);
assert.match(appSource, /已生成 v0\.4\.0 \/ Session Schema 0\.3\.0 JSON 导出/);
assert.doesNotMatch(appSource, /const APP_VERSION =/);
assert.equal(CHARACTER_SHEET_SCHEMA_VERSION, '0.3.0-m1-s5', 'the CharacterSheet contract remains unchanged');

console.log('version-compatibility-v031.test.mjs: pass');
