import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  V070_DELIVERY_VERSION,
  V070_SESSION_SCHEMA_VERSION,
  V070_STORAGE_KEY,
  chooseV070StartupSession,
  createV070Envelope,
  validateV070Envelope,
} from '../src/life-cycle-v070.js';
import { V060_STORAGE_KEY, createV060Envelope } from '../src/life-cycle-v060.js';
import { sessionForStorage } from '../src/session-persistence.js';
import {
  PANEL_REGISTRY,
  UI_PREFERENCES_STORAGE_KEY,
  WORKSPACES,
  defaultUiPreferences,
  loadUiPreferences,
  movePanelPreference,
  normalizeUiPreferences,
  panelsForWorkspace,
  projectWorkspaceStatus,
  resetAllUiPreferences,
  resetWorkspacePreferences,
  updatePanelPreference,
  workspaceFromHash,
} from '../src/workbench-v070.js';

function storage(entries = {}) {
  const values = new Map(Object.entries(entries));
  return { getItem: key => values.has(key) ? values.get(key) : null, setItem: (key, value) => values.set(key, value), values };
}

const session = {
  schemaVersion: '0.5.0', sessionId: 'v070-fixture', name: 'v0.7 migration', settings: { width: 24, height: 18 },
  encounter: { phase: 'active', members: [] },
  effects: [{ id: 'bless', name: '祝福', targetIds: ['aria'], sourceCombatantId: 'aria', concentration: true, startedRound: 2, expiresRound: 4 }],
  combatants: [
    { id: 'aria', name: 'Aria', kind: 'character', hp: 0, maxHp: 20, lifePhase: 'dying', presenceStatus: 'on-field', participationStatus: 'active', actionAvailable: false },
    { id: 'odd', name: 'Odd', kind: 'monster', hp: 8, maxHp: 8, lifePhase: 'homebrew-state', presenceStatus: 'on-field', participationStatus: 'active' },
  ],
  postCombatDiffs: [{ diffId: 'diff-1', combatantId: 'aria', status: 'pending' }],
  events: [{ id: 'event-1', sequence: 1, type: 'combatant.hp.changed', round: 3, occurredAt: '2026-09-01T00:00:00.000Z' }],
  turn: { round: 3, index: 0, order: ['aria', 'odd'], started: true },
  ui: { tab: '地图', selectedId: 'aria', message: 'presentation', range: { phase: 'armed', shape: 'circle' } },
};

assert.equal(V070_DELIVERY_VERSION, '0.7.0');
assert.equal(V070_SESSION_SCHEMA_VERSION, '0.5.0', 'projection delivery does not change the Domain schema');
assert.notEqual(V070_STORAGE_KEY, V060_STORAGE_KEY, 'v0.7 keeps a separate copy-on-write session key');

const exported = createV070Envelope(session, { exportedAt: '2026-09-01T00:00:00.000Z' });
assert.equal(exported.deliveryVersion, V070_DELIVERY_VERSION);
assert.equal(exported.schemaVersion, '0.5.0');
assert.equal(validateV070Envelope(exported, () => 'id', () => 'time').session.sessionId, 'v070-fixture');
assert.throws(() => validateV070Envelope({ schemaVersion: '9.0.0', session: { events: [] } }, () => 'id', () => 'time'), /仅接受/, 'future Session schemas fail closed');

{
  const v060Raw = JSON.stringify(createV060Envelope(session, { exportedAt: '2026-08-31T00:00:00.000Z' }));
  const store = storage({ [V060_STORAGE_KEY]: v060Raw });
  const startup = chooseV070StartupSession(store, () => 'id', () => 'time');
  assert.equal(startup.kind, 'migrated-legacy-copy');
  assert.equal(startup.sourceKey, V060_STORAGE_KEY);
  assert.equal(store.getItem(V060_STORAGE_KEY), v060Raw, 'the v0.6 source remains byte-for-byte untouched');
  assert.equal(store.getItem(V070_STORAGE_KEY), null, 'selection does not write the new key before persistence');
}
{
  const raw = JSON.stringify(exported);
  const store = storage({ [V070_STORAGE_KEY]: raw });
  const first = chooseV070StartupSession(store, () => 'id', () => 'time');
  const second = chooseV070StartupSession(store, () => 'id', () => 'time');
  assert.equal(first.kind, 'current');
  assert.deepEqual(second.session, first.session, 'current startup normalization is idempotent');
  assert.equal(store.getItem(V070_STORAGE_KEY), raw, 'readback never rewrites the current envelope');
}
{
  const raw = '{broken';
  const store = storage({ [V070_STORAGE_KEY]: raw, [V060_STORAGE_KEY]: JSON.stringify(createV060Envelope(session)) });
  const startup = chooseV070StartupSession(store, () => 'id', () => 'time');
  assert.equal(startup.kind, 'blocked-corrupt-current');
  assert.equal(startup.session, null, 'a corrupt v0.7 key must not silently overwrite itself from v0.6');
  assert.equal(store.getItem(V070_STORAGE_KEY), raw, 'corrupt current data remains available for recovery');
}

assert.deepEqual(WORKSPACES.map(item => item.id), ['battle', 'map', 'characters', 'library', 'log', 'dice', 'settings']);
for (const panel of PANEL_REGISTRY) {
  for (const field of ['id', 'workspace', 'title', 'responsibility', 'core', 'canHide', 'order', 'width', 'projection', 'command', 'states']) assert.ok(field in panel, `${panel.id} declares ${field}`);
  assert.ok(WORKSPACES.some(workspace => workspace.id === panel.workspace));
}
assert.equal(workspaceFromHash('#/map'), 'map');
assert.equal(workspaceFromHash('#unknown'), null);
assert.equal(defaultUiPreferences().lastWorkspace, 'battle');
const normalized = normalizeUiPreferences({ density: 'compact', lastWorkspace: 'map', characterDetailTab: 'spells', showArchivedCharacters: true, panels: { 'map-inspector': { visible: false, width: 'narrow', order: 10 }, range: { order: 10 } } });
assert.equal(normalized.panels['map-inspector'].visible, false);
assert.equal(normalized.characterDetailTab, 'spells');
assert.equal(normalized.showArchivedCharacters, true);
assert.equal(new Set(panelsForWorkspace('map', normalized).map(panel => panel.preference.order)).size, 3, 'corrupt duplicate orders are normalized');
assert.equal(updatePanelPreference(defaultUiPreferences(), 'turn', { visible: false }).panels.turn.visible, true, 'core panels cannot be hidden');
const moved = movePanelPreference(defaultUiPreferences(), 'roster', -1);
assert.deepEqual(panelsForWorkspace('battle', moved).map(item => item.id), ['recent-result', 'turn', 'roster', 'current-action']);
const resetBattle = resetWorkspacePreferences(moved, 'battle');
for (const panel of PANEL_REGISTRY.filter(item => item.workspace === 'battle')) assert.deepEqual(resetBattle.panels[panel.id], defaultUiPreferences().panels[panel.id]);
const customized = { ...moved, density: 'compact', lastWorkspace: 'characters', characterDetailTab: 'story', showArchivedCharacters: true };
const resetAll = resetAllUiPreferences(customized);
assert.equal(resetAll.density, 'standard');
assert.equal(resetAll.lastWorkspace, 'characters', 'reset preserves navigation continuity');
assert.equal(resetAll.characterDetailTab, 'story');
assert.equal(resetAll.showArchivedCharacters, true);
assert.equal(loadUiPreferences(storage({ [UI_PREFERENCES_STORAGE_KEY]: '{broken' })).recovered, true, 'bad UI preference data falls back without touching the session');

const projection = projectWorkspaceStatus(session);
assert.equal(projection.encounter.activeId, 'aria');
assert.equal(projection.combatants[0].facets.life.value, 'dying');
assert.equal(projection.combatants[0].facets.action.value, 'death-save-only');
assert.equal(projection.combatants[0].facets.effects.items[0].sourceCombatantId, 'aria');
assert.equal(projection.combatants[0].facets.effects.items[0].expiresRound, 4);
assert.equal(projection.combatants[0].facets.pending.items.some(item => item.kind === 'writeback'), true);
assert.equal(projection.byId.odd.facets.life.value, 'unknown');
assert.equal(projection.byId.odd.facets.life.raw, 'homebrew-state', 'unknown values preserve their raw evidence');
assert.match(projection.byId.odd.facets.life.reason, /未识别状态/);
assert.strictEqual(projection.workspaces.battle.combatants[0], projection.workspaces.map.combatants[0], 'workspaces share the same immutable projection object');
assert.strictEqual(projection.workspaces.battle.combatants[0], projection.workspaces.log.combatants[0], 'log shares the same status conclusion');
assert.equal(Object.isFrozen(projection), true);
assert.equal(Object.isFrozen(projection.byId.aria.facets.effects.items), true);
assert.equal(projection.urgent[0].compact.hp, '0/20');

const stored = sessionForStorage(session, structuredClone);
assert.equal('tab' in stored.ui, false);
assert.equal('selectedId' in stored.ui, false);
assert.equal('message' in stored.ui, false);
assert.deepEqual(stored.ui.range, session.ui.range, 'recovery-sensitive command drafts remain in the session');
assert.equal(session.ui.tab, '地图', 'storage/export compaction does not mutate live state');

const appSource = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
const styleSource = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');
assert.doesNotMatch(appSource, /state\.ui\.tab/);
assert.match(appSource, /data-panel-move=/);
assert.match(appSource, /data-layout-reset-all/);
assert.match(appSource, /event\.key==='Escape'/);
assert.match(appSource, /战斗态势五问/);
assert.match(appSource, /projectionStatusMarkup\(currentStatusProjection\(\)\.byId\[c\.id\]\)/);
assert.match(appSource, /const exportSession=sessionForStorage\(state,clone\)/);
assert.match(appSource, /<details><summary>技术详情<\/summary>/);
assert.match(appSource, /class="character-main" data-panel-id="character"/);
assert.match(appSource, /class="card character-sidebar" data-panel-id="character-list"/);
assert.match(appSource, /class="card post-combat-panel" data-panel-id="post-combat"/);
assert.doesNotMatch(appSource, /\.character-workspace \+ \.panel\.two/, 'character panels no longer depend on a nested sibling selector');
assert.doesNotMatch(appSource, /重置验证数据|data-action="fixtures"|session\.fixtures\.reset/, 'production UI no longer exposes destructive validation fixtures');
assert.match(appSource, /ref-fire-giant/);
assert.match(appSource, /ref-beholder/);
assert.match(appSource, /ref-goblin-minion/);
assert.match(appSource, /fresh\.characters=fresh\.combatants\.filter\(combatant=>combatant\.kind==='character'\)/, 'the fixed validation scene restores character baseline rows');
assert.match(appSource, /class="economy-grid"/);
assert.match(appSource, /data-economy="\$\{field\}"/);
assert.match(appSource, /class="effect-entry-form"/);
assert.match(appSource, /density-standard-only/);
assert.match(appSource, /density-compact-only/);
assert.match(appSource, /aria-label="固定布局"/);
assert.doesNotMatch(appSource, /信息按任务优先级组织；不写入战斗事实/, 'fixed-layout implementation detail is no longer primary content');
assert.match(styleSource, /--wb-space-1:/);
assert.match(styleSource, /@media \(max-width:620px\)/);
assert.match(styleSource, /:focus-visible/);
assert.match(styleSource, /\.character-panel-grid \{ display:grid; grid-template-columns:repeat\(12/);
assert.doesNotMatch(styleSource, /\.character-sidebar \{ position:sticky/, 'configurable character panels cannot visually escape their grid row');
assert.match(styleSource, /\.effect-entry-form \{ display:grid; grid-template-columns:minmax\(220px,2fr\)/);
assert.match(styleSource, /label:has\(> input\[data-target\]\).*flex:1 1 100%.*grid-template-columns:22px minmax\(0,1fr\).*max-width:420px/, 'range target rows align a fixed-size selector with its label at wide and narrow widths');
assert.match(styleSource, /\.workspace\.workspace-map input\[data-target\] \{ width:22px; height:22px; min-width:22px; min-height:22px;/, 'range target checkboxes cannot stretch with combatant names or workspace density');
assert.match(styleSource, /\.workspace-map \.map-layout > \[data-panel-id\] \{ grid-column:1\/-1; \}/, 'map panels span the responsive grid instead of collapsing to one track');
assert.match(styleSource, /\[data-workspace-density="compact"\] \.density-standard-only \{ display:none/);
assert.match(styleSource, /\[data-workspace-density="compact"\] \.density-compact-only \{ display:revert/);

console.log('workbench-v070.test.mjs: pass');
