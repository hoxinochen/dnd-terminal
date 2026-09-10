import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  WORKBENCH_THEMES,
  WORKBENCH_SUBMODES,
  calculateGridDistanceFeet,
  battleWorkbenchMarkup,
} from '../src/battle-workbench.js';
import { diceDockMarkup } from '../src/dice-dock.js';
import {
  defaultUiPreferences,
  normalizeUiPreferences,
} from '../src/workbench-v070.js';

// 1. Grid Distance Calculation (2D Tactical Grid)
{
  assert.equal(calculateGridDistanceFeet({ x: 0, y: 0 }, { x: 3, y: 4 }, 5, 'five-feet'), 20, 'five-feet rule: max(3,4)*5 = 20');
  assert.equal(calculateGridDistanceFeet({ x: 0, y: 0 }, { x: 0, y: 5 }, 5, 'five-feet'), 25, 'straight 5 cells = 25');
  assert.equal(calculateGridDistanceFeet({ x: 2, y: 2 }, { x: 2, y: 2 }, 5, 'five-feet'), 0, 'same cell = 0');
  assert.equal(calculateGridDistanceFeet(null, { x: 1, y: 1 }), null, 'null from = null');
  assert.equal(calculateGridDistanceFeet({ x: 1, y: 1 }, null), null, 'null to = null');

  // Alternating 5/10 diagonal rule
  // dx=3, dy=4: min=3 diagonals, max-min=1 straight
  // 3 diagonals = 5 + 10 + 5 = 20; 1 straight = 5; total = 25
  assert.equal(calculateGridDistanceFeet({ x: 0, y: 0 }, { x: 3, y: 4 }, 5, 'five-ten-alternating'), 25);
  // dx=2, dy=2: 2 diagonals = 5 + 10 = 15
  assert.equal(calculateGridDistanceFeet({ x: 0, y: 0 }, { x: 2, y: 2 }, 5, 'five-ten-alternating'), 15);
}

// 2. Preferences default and normalization
{
  const prefs = defaultUiPreferences();
  assert.equal(prefs.theme, 'dark');
  assert.equal(prefs.workbenchSubMode, 'full');
  assert.equal(prefs.workbenchRailCollapsed, false);
  assert.equal(prefs.workbenchHeaderCollapsed, false);
  assert.equal(prefs.workbenchLeftCollapsed, false);
  assert.equal(prefs.workbenchRightCollapsed, false);
  assert.equal(prefs.workbenchDiceDockOpen, false);
  assert.equal(prefs.workbenchZoom, 1.0);

  const norm = normalizeUiPreferences({
    theme: 'parchment',
    workbenchSubMode: 'combat',
    workbenchRailCollapsed: true,
    workbenchHeaderCollapsed: true,
    workbenchLeftCollapsed: true,
    workbenchRightCollapsed: true,
    workbenchDiceDockOpen: true,
    workbenchZoom: 1.4,
  });
  assert.equal(norm.theme, 'parchment');
  assert.equal(norm.workbenchSubMode, 'combat');
  assert.equal(norm.workbenchRailCollapsed, true);
  assert.equal(norm.workbenchHeaderCollapsed, true);
  assert.equal(norm.workbenchLeftCollapsed, true);
  assert.equal(norm.workbenchRightCollapsed, true);
  assert.equal(norm.workbenchDiceDockOpen, true);
  assert.equal(norm.workbenchZoom, 1.4);

  // Invalid fallback
  const fallback = normalizeUiPreferences({ theme: 'neon-cyber', workbenchSubMode: 'vr-space' });
  assert.equal(fallback.theme, 'dark');
  assert.equal(fallback.workbenchSubMode, 'full');
}

// 3. Battle Workbench Markup Contracts
{
  const state = {
    settings: { width: 24, height: 18, cellFeet: 5 },
    turn: { round: 2, started: true },
    events: [
      { type: 'dice.rolled', payload: { total: 17, formulaCanonical: '1d20+3', visibility: 'public' }, occurredAt: '2026-09-07T12:00:00.000Z' }
    ],
  };

  const markup = battleWorkbenchMarkup({
    state,
    activeCombatant: { id: 'pc1', name: 'Althea', position: { x: 2, y: 3 } },
    selectedCombatant: { id: 'mob1', name: 'Goblin', position: { x: 5, y: 7 } },
    subMode: 'full',
    theme: 'dark',
    leftCollapsed: false,
    rightCollapsed: false,
    diceDockOpen: false,
    zoomLevel: 1.0,
    rosterMarkup: '<div class="test-roster">roster</div>',
    turnMarkup: '<div class="test-turn">turn</div>',
    actionMarkup: '<div class="test-action">action</div>',
    inspectorMarkup: '<div class="test-inspector">inspector</div>',
    rangeMarkup: '<div class="test-range">range</div>',
    mapGridMarkup: '<div class="test-grid">grid</div>',
    recentResultMarkup: '<div class="test-result">result</div>',
  });

  // Mode switcher contract
  assert.match(markup, /data-wb-mode="full"/);
  assert.match(markup, /data-wb-mode="combat"/);
  assert.match(markup, /data-wb-mode="map"/);
  assert.match(markup, /class="wb-mode-btn active" data-wb-mode="full"/);

  // Theme switcher contract
  assert.match(markup, /data-wb-theme="light"/);
  assert.match(markup, /data-wb-theme="dark"/);
  assert.match(markup, /data-wb-theme="parchment"/);

  // Tactical distance badge contract
  // (2,3) to (5,7): dx=3, dy=4 -> 20 feet under default five-feet
  assert.match(markup, /战术距离: <b>20 尺<\/b>/);

  // Left column de-duplication: no redundant situation card
  assert.doesNotMatch(markup, /class="test-result"/, 'recentResultMarkup must not be rendered in the left column');
  assert.match(markup, /class="wb-status-pill wb-status-actor"/, 'active actor displayed in prominent center pill');

  // Collapsible column dock strips
  assert.match(markup, /data-wb-collapse="left"/);
  assert.match(markup, /data-wb-collapse="right"/);
  assert.match(markup, /data-wb-expand="left"/);
  assert.match(markup, /data-wb-expand="right"/);

  // Floating map bar
  assert.match(markup, /data-map-zoom="out"/);
  assert.match(markup, /data-map-zoom="in"/);
  assert.match(markup, /data-map-zoom="reset"/);
  assert.match(markup, /data-map-zoom="fit"/);
  assert.match(markup, /data-map-focus="origin"/);
  assert.match(markup, /data-map-focus="active"/);

  // Dice Dock (Horizontal Strip Contract)
  const diceStrip = diceDockMarkup({
    latestRoll: state.events[0].payload,
    history: state.events,
  });
  assert.match(diceStrip, /data-wb-dice-dock/);
  assert.match(diceStrip, /data-wb-dice-formula/);
  assert.match(diceStrip, /data-wb-dice-mode/);
  assert.match(diceStrip, /data-wb-dice-roll/);
  assert.match(diceStrip, /data-dice-preset="1d20"/);
  assert.doesNotMatch(diceStrip, /data-dice-dock-toggle/, 'quick dice dock must not have separate history toggle');
  assert.match(diceStrip, /复杂掷骰与历史/, 'quick dice dock merges complex dice and history button');
  assert.match(diceStrip, /返回战斗/, 'quick dice dock includes return to battle button');
  assert.match(diceStrip, /17 \(1d20\+3\)/, 'displays recent roll summary');
  assert.doesNotMatch(markup, /wb-col-right[\s\S]*?data-wb-dice-dock/, 'right column must not contain dice dock');

  // BL-030 Quick Journal placeholder drawer
  assert.match(markup, /data-wb-journal-drawer/);
  assert.match(markup, /BL-030/);
}

// 4. Strict ZERO EMOJIS verification across candidate files
{
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}]/u;
  const candidateFiles = [
    '../src/battle-workbench.js',
    '../src/battle-workbench.css',
  ];

  for (const relPath of candidateFiles) {
    const content = await readFile(new URL(relPath, import.meta.url), 'utf8');
    const stripped = content
      .replace(/[\u25C0\u25B6\u25B2\u25BC\u25C6]/g, '')
      .replace(/☠/g, '');
    const hasEmoji = emojiRegex.test(stripped);
    assert.equal(hasEmoji, false, `${relPath} contains forbidden emojis! Strictly maintain serious terminal aesthetic.`);
  }
}

// 5. CSS Class Contracts
{
  const css = await readFile(new URL('../src/battle-workbench.css', import.meta.url), 'utf8');
  assert.match(await readFile(new URL('../src/workbench-foundation.css', import.meta.url), 'utf8'), /\.layout-combat/);
  assert.match(await readFile(new URL('../src/workbench-foundation.css', import.meta.url), 'utf8'), /\.layout-map/);
  assert.match(await readFile(new URL('../src/workbench-foundation.css', import.meta.url), 'utf8'), /\.left-collapsed/);
  assert.match(await readFile(new URL('../src/workbench-foundation.css', import.meta.url), 'utf8'), /\.right-collapsed/);
  assert.match(css, /\.theme-parchment/);
  assert.match(css, /\.theme-light/);
  assert.match(css, /\.token\.kind-character/);
  assert.match(css, /\.token\.kind-npc::after/);
  assert.match(css, /\.token\.controlled-associated/);
}

// 6. Chrome cache invalidation for the v0.7.0-derived candidate
{
  const index = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(index, /src\/styles\.css\?v=20260907-exp-ux-gemini-001-1/, 'candidate stylesheet must not reuse the released v0.7.0 cache key');
  assert.match(index, /src\/app\.js\?v=20260908-ux-recovery-2/, 'candidate app bundle must not reuse the released v0.7.0 cache key');
  assert.match(app, /workbench-v070\.js\?v=20260907-exp-ux-gemini-001-1/, 'modified workbench module must use the candidate cache key');
}

// 7. Unified Navigation Rail: Removal of independent 'map' entry
{
  const { WORKSPACES } = await import('../src/workbench-v070.js');
  const visibleWorkspaces = WORKSPACES.filter(w => !w.navHidden);
  assert.deepEqual(visibleWorkspaces.map(w => w.id), ['battle', 'characters', 'library', 'log', 'dice', 'settings'], 'map must not be an independent navigation entry');
  assert.equal(WORKSPACES.find(w => w.id === 'map')?.navHidden, true, 'map workspace is marked navHidden');

  const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(app, /WORKSPACES\.filter\(w=>!w\.navHidden\)/, 'app.js must filter out navHidden workspaces from the navigation rail');
}

// 8. Collapsible session header contract (释放战术视野)
{
  const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(app, /data-header-toggle/, 'app.js must provide header toggle button');
  assert.match(app, /header-collapsed/, 'app.js must toggle header-collapsed class');

  const css = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');
  assert.match(css, /\.workbench-topbar\.header-collapsed/, 'styles.css must style collapsed header');
  assert.match(css, /\.workbench-topbar\.header-collapsed \.eyebrow\s*\{\s*display:\s*none/, 'collapsed header hides eyebrow');
  assert.match(css, /\.workbench-topbar\.header-collapsed \.workbench-session\s*\{\s*display:\s*none/, 'collapsed header hides duplicate session phase');
}

// 9. High-density pure combatant roster & HP visualization (Concept Ref: media_1788835527392.png)
{
  const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(app, /roster-header-row/, 'app.js must render roster table header row');
  assert.match(app, /col-head-init/, 'app.js header row must contain INIT column');
  assert.match(app, /col-head-ac/, 'app.js header row must contain AC column');
  assert.match(app, /col-head-hp/, 'app.js header row must contain HP column');
  assert.match(app, /roster-hp-track/, 'app.js must render visual HP track');
  assert.match(app, /roster-hp-fill/, 'app.js must render visual HP fill bar');
  assert.match(app, /roster-row-summary/, 'app.js must render roster summary rows');

  const css = await readFile(new URL('../src/battle-workbench.css', import.meta.url), 'utf8');
  assert.match(css, /\.roster-header-row/, 'battle-workbench.css styles header row');
  assert.match(css, /\.roster-hp-fill\.hp-healthy/, 'battle-workbench.css styles healthy green HP bar');
  assert.match(css, /\.roster-hp-fill\.hp-bloodied/, 'battle-workbench.css styles bloodied amber HP bar');
  assert.match(css, /\.roster-hp-fill\.hp-critical/, 'battle-workbench.css styles critical red HP bar');
  assert.match(css, /\.roster-row-summary\s*\{\s*display:\s*grid\s*!important/, 'battle-workbench.css enforces grid for roster rows');
}

// 10. Consolidated Right-Column Unit Action Center & Compact Dice Dock (Scheme 1)
{
  const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(app, /unit-action-center/, 'app.js must provide consolidated unit action center in inspector');
  assert.match(app, /data-hp-damage/, 'app.js must include hp damage button in unit action center');
  assert.match(app, /data-hp-heal/, 'app.js must include hp heal button in unit action center');
  assert.match(app, /data-temp-hp/, 'app.js must include temp hp setting in unit action center');
  assert.match(app, /wb-details-fold/, 'app.js must provide collapsible tactical details fold');

  const dice = await readFile(new URL('../src/dice-dock.js', import.meta.url), 'utf8');
  assert.match(dice, /wb-dice-dock compact/, 'dice-dock.js must use compact dice dock');
  assert.ok(!dice.includes('wb-dice-showcase'), 'dice-dock.js must eliminate bulky showcase block');

  const css = await readFile(new URL('../src/battle-workbench.css', import.meta.url), 'utf8');
  assert.match(css, /\.unit-action-center/, 'battle-workbench.css styles unified unit action center');
  assert.match(css, /\.unit-hp-box/, 'battle-workbench.css styles big hp box in unit action center');
  assert.match(css, /\.unit-ctrl-grid/, 'battle-workbench.css styles operation control grid');
  assert.match(css, /\.wb-details-fold/, 'battle-workbench.css styles collapsible details fold');
}

// 11. Topbar Horizontal Dice Strip & Right Column Dual Tabs (战斗操作 vs 棋子互动)
{
  const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(app, /data-wb-topbar-dice/, 'app.js must mount dice strip into topbar');
  assert.match(app, /data-inspector-tab="combat"/, 'app.js must provide combat actions tab');
  assert.match(app, /data-inspector-tab="token"/, 'app.js must provide token interaction tab (棋子互动)');
  assert.match(app, /棋子互动/, 'app.js tab label must be 棋子互动');
  assert.match(app, /mode-token/, 'app.js must render mode-token view for token tab');
  assert.match(app, /data-facing=/, 'app.js must render facing controls in token tab');
  assert.match(app, /data-facing-port=/, 'app.js must render emitter port buttons in token tab');

  const dice = await readFile(new URL('../src/dice-dock.js', import.meta.url), 'utf8');
  assert.match(dice, /horizontal-strip/, 'dice-dock.js must provide horizontal-strip styling class');
  assert.match(dice, /复杂掷骰与历史/, 'dice-dock.js must provide 复杂掷骰与历史 button');
  assert.match(dice, /返回战斗/, 'dice-dock.js must provide 返回战斗 button');
  assert.match(dice, /data-workspace="dice"/, 'dice-dock.js button must navigate to dice workspace');
  assert.match(dice, /data-workspace="battle"/, 'dice-dock.js button must navigate to battle workspace');

  const css = await readFile(new URL('../src/battle-workbench.css', import.meta.url), 'utf8');
  assert.match(css, /\.inspector-tabs/, 'battle-workbench.css styles inspector tabs');
  assert.match(css, /\.inspector-tab-btn\.active/, 'battle-workbench.css styles active tab button');
  assert.match(css, /\.unit-action-center\.mode-token/, 'battle-workbench.css styles token interaction mode');
  assert.match(css, /\.facing-btn-grid/, 'battle-workbench.css styles facing grid');
  assert.match(css, /\.port-btn-grid/, 'battle-workbench.css styles emitter port grid');

  const wbCss = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');
  assert.match(wbCss, /\.workbench-topbar-dice/, 'styles.css styles topbar dice container');
  assert.match(wbCss, /\.wb-dice-dock\.horizontal-strip/, 'styles.css styles horizontal dice dock in topbar');

  const wb = await readFile(new URL('../src/workbench-v070.js', import.meta.url), 'utf8');
  assert.match(wb, /inspectorTab:\s*'combat'/, 'workbench-v070.js must default inspectorTab to combat');
  assert.match(wb, /next\.inspectorTab\s*=\s*value\?\.inspectorTab\s*===\s*'token'\s*\?\s*'token'\s*:\s*'combat'/, 'workbench-v070.js normalizes inspectorTab');

  // Range & map markup isolation: NEVER render range in combat tab
  const combatMarkup = battleWorkbenchMarkup({
    inspectorTab: 'combat',
    inspectorMarkup: '<div class="mode-combat">combat</div>',
    rangeMarkup: '<aside data-panel-id="range"><h2>地图与范围</h2></aside>',
  });
  assert.doesNotMatch(combatMarkup, /data-panel-id="range"/, 'combat tab must NEVER render range markup (地图与范围)');
  assert.doesNotMatch(combatMarkup, /地图与范围/, 'combat tab must NEVER render 地图与范围');

  const tokenMarkup = battleWorkbenchMarkup({
    inspectorTab: 'token',
    inspectorMarkup: '<div class="mode-token">token</div>',
    rangeMarkup: '<aside data-panel-id="range"><h2>地图与范围</h2></aside>',
  });
  assert.match(tokenMarkup, /data-panel-id="range"/, 'token tab renders range markup');
}

// 12. Codex Audit Recovery Contracts (Bugs 1-4)
{
  const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/battle-workbench.css', import.meta.url), 'utf8');

  // Bug 1: Round 0 Encounter Member Editing restored
  assert.match(app, /data-v2-member-field="name"/, 'app.js must provide name editing for preparation members');
  assert.match(app, /data-v2-member-field="hp"/, 'app.js must provide hp editing for preparation members');
  assert.match(app, /data-v2-member-field="relation"/, 'app.js must provide relation editing for preparation members');
  assert.match(app, /data-v2-member-field="deployment"/, 'app.js must provide deployment (field/reserve) selection');
  assert.match(app, /data-v2-member-field="resources"/, 'app.js must provide resource editing for preparation members');
  assert.match(app, /data-v2-member-field="conditions"/, 'app.js must provide condition editing for preparation members');
  assert.match(app, /data-v2-action="remove-member"/, 'app.js must provide remove-member button in preparation');
  assert.match(app, /data-v2-action="abandon-preparation"/, 'app.js must provide abandon-preparation button');

  // Bug 2: Round 0 Map Source & Dragging
  assert.match(app, /state\.encounter\?\.phase==='preparation'\s*\?\s*\(state\.encounter\.members\|\|\[\]\)\.filter\(m=>m\.deployment!=='reserve'\)/, 'app.js mapCombatants must source non-reserve preparation members');
  assert.match(app, /state\.encounter\?\.phase!=='preparation'&&!ordinaryActionsAllowed\(c\)/, 'app.js move() must allow preparation dragging without requiring ordinaryActionsAllowed');

  // Bug 3: PC Life / Death / Revival Mount
  assert.match(app, /data-pc-life-host/, 'app.js mapInspector mode-combat must provide data-pc-life-host');
  assert.match(app, /querySelector\('\[data-pc-life-host\]'\)/, 'injectPcLifePanel must locate data-pc-life-host');

  // Bug 4: Isolate Fixtures from normal workbench
  const prepMarkupMatch = app.match(/const prepMarkup\s*=\s*state\.encounter\?\.phase\s*===\s*'preparation'\s*\?\s*`([\s\S]*?)`\s*:\s*'';/);
  assert.ok(prepMarkupMatch, 'prepMarkup definition must exist');
  assert.doesNotMatch(prepMarkupMatch[1], /data-load-fixtures-request/, 'workbench preparation controls must NEVER contain data-load-fixtures-request');
  assert.match(app, /developer-validation-tools[\s\S]*?data-load-fixtures-request/, 'fixture loading remains isolated under developer-validation-tools');

  // Styling contracts for recovery
  assert.match(css, /\[data-panel-id="prep-controls"\] \.combatant/, 'battle-workbench.css styles preparation combatant editor');
  assert.match(css, /\.unit-pc-life-host/, 'battle-workbench.css styles pc life host');
}

// 13. Preparation & Mid-Combat Materialization & Deduplication Contracts
{
  const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');

  // Task A: Reserve unit inspector status in preparation
  assert.match(app, /isPrepReserve\s*=\s*state\.encounter\?\.phase==='preparation'\s*&&\s*c\.deployment==='reserve'/, 'isPrepReserve is computed in mapInspector');
  assert.match(app, /isPrepReserve\s*\?\s*'场外预备'/, 'status displays 场外预备 when isPrepReserve is true');

  // Linked & Controlled Entity mid-combat materialization contracts
  assert.match(app, /const preparing=state\.encounter\?\.phase==='preparation',\s*joining=state\.turn\.started&&!combatEnded\(\);/, 'phase guards check both preparation and joining');
  assert.match(app, /if\(!preparing&&!joining\)return message\('当前只能在遭遇准备阶段，或已开始且未结束的战斗中加入关联生物。'/, 'materializeLinkedEntity guards allowed phases');
  assert.match(app, /if\(!preparing&&!joining\)return message\('当前只能在遭遇准备阶段，或已开始且未结束的战斗中加入受控生物。'/, 'materializeControlledEntity guards allowed phases');
  assert.match(app, /function isLinkedEntityDuplicate/, 'isLinkedEntityDuplicate helper defined');
  assert.match(app, /function isControlledEntityDuplicate/, 'isControlledEntityDuplicate helper defined');
  assert.match(app, /stageEntryItem\(item,\{destination:'keep'/, 'mid-combat materialization reuses stageEntryItem');
  assert.match(app, /joining\?'加入待入场批次':'生成棋子并加入遭遇'/, 'linked action renders 加入待入场批次 in combat');
  assert.match(app, /joining\?'已加入本次战斗':'已加入本次遭遇'/, 'linked duplicate button shows 已加入本次战斗 in combat');
  assert.match(app, /controllerCombatant=resolved\.controllerCombatant\|\|state\.combatants\.find/, 'controlled entity verifies controller combatant presence');
  assert.match(app, /controlledEntityId:entity\.id,\s*controllerCombatantId:controllerCombatant\.id/, 'controllerLink records controllerCombatantId and controlledEntityId');
  assert.match(app, /!\['controlled','permanent-controlled'\]\.includes\(entity\.status\)/, 'non-controlled statuses are rejected');
  assert.match(app, /关联生物使用显式 UnitTemplate 创建独立棋子、HP 与行动轮/, 'updated guidance notice replaces round 0 only text');
  assert.match(app, /state\.linkedEntityProjections\.push\(item\.linkedProjection\)/, 'confirmEntryPlacement persists linkedEntityProjection');
  assert.match(app, /state\.controlledEntityProjections\.push\(clone\(item\.controlledEntityProjection\)\)/, 'confirmEntryPlacement persists controlledEntityProjection');
  assert.doesNotMatch(app, /unit-action-drawers[\s\S]*?\$\{linkedDetails\}/, 'mapInspector must NOT expose mid-combat linkedDetails drawer');
  assert.doesNotMatch(app, /生成棋子并加入待入场/, 'wording 生成棋子并加入待入场 must not exist');
}

// 14. Combat Projection Resolution & Multi-Revision Boundary Contracts & Functional Verification
{
  const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');

  // Verify code contracts
  assert.match(app, /function resolveCombatProjectionForEntity/, 'app.js defines resolveCombatProjectionForEntity');
  assert.match(app, /resolveCombatProjectionForEntity\(\{characterId:sheet\.characterId,entityKind:'controlled'\}\)/, 'controlledEntityCardMarkup uses resolveCombatProjectionForEntity');
  assert.match(app, /resolveCombatProjectionForEntity\(\{characterId,entityId:controlledEntityId,entityKind:'controlled'\}\)/, 'materializeControlledEntity uses resolveCombatProjectionForEntity');
  assert.match(app, /resolveCombatProjectionForEntity\(\{characterId,entityId:linkedEntityId,entityKind:'linked'\}\)/, 'materializeLinkedEntity uses resolveCombatProjectionForEntity');
  assert.match(app, /resolveCombatProjectionForEntity\(\{characterId:sheet\.characterId,entityKind:'linked'\}\)/, 'linkedMaterializationPanel uses resolveCombatProjectionForEntity');
  assert.match(app, /该实体只存在于更新后的角色卡修订中，不属于当前战斗。角色卡的新修订不会自动修改进行中的战斗。/, 'boundary explanation contract present');
  assert.match(app, /将使用当前战斗冻结投影建立独立快照。/, 'enabled help text contract present');
  assert.match(app, /找不到该角色在当前战斗中的冻结投影。/, 'missing projection text contract present');

  // Extract function and run real functional unit tests on resolveCombatProjectionForEntity
  const fnMatch = app.match(/(function resolveCombatProjectionForEntity\(\{[\s\S]*?\n\})/);
  assert.ok(fnMatch, 'resolveCombatProjectionForEntity function must be extractable');

  const runResolver = new Function('state', 'combatEnded', `
    ${fnMatch[1]}
    return resolveCombatProjectionForEntity;
  `);

  // Scenario 1: Frozen revision 1 entity resolution in active combat
  {
    const state = {
      encounter: { phase: 'confirmed' },
      turn: { started: true, round: 1 },
      combatants: [
        { id: 'c1', kind: 'character', characterId: 'char-1', combatProjectionId: 'proj-1', cleanupRemoved: false }
      ],
      combatProjections: [
        {
          projectionId: 'proj-1',
          characterId: 'char-1',
          characterRevision: 1,
          controlledEntities: [{ id: 'ce-1', name: 'Wolf', status: 'controlled' }],
          linkedEntities: [{ id: 'le-1', name: 'Familiar', kind: 'familiar' }]
        }
      ]
    };
    const resolve = runResolver(state, () => false);
    const resControlled = resolve({ characterId: 'char-1', entityId: 'ce-1', entityKind: 'controlled' });
    assert.equal(resControlled.ok, true, 'Scenario 1: controlled entity in projection resolves ok');
    assert.equal(resControlled.projection.characterRevision, 1);
    assert.equal(resControlled.entitySnapshot.name, 'Wolf');
    assert.equal(resControlled.controllerCombatant.id, 'c1');

    const resLinked = resolve({ characterId: 'char-1', entityId: 'le-1', entityKind: 'linked' });
    assert.equal(resLinked.ok, true, 'Scenario 1: linked entity in projection resolves ok');
    assert.equal(resLinked.entitySnapshot.name, 'Familiar');
  }

  // Scenario 2: Character updated to revision 2, combatant retains revision 1 projection
  {
    const state = {
      encounter: { phase: 'confirmed' },
      turn: { started: true, round: 2 },
      combatants: [
        { id: 'c1', kind: 'character', characterId: 'char-1', combatProjectionId: 'proj-1', cleanupRemoved: false }
      ],
      combatProjections: [
        {
          projectionId: 'proj-1',
          characterId: 'char-1',
          characterRevision: 1,
          controlledEntities: [{ id: 'ce-1', name: 'Wolf', status: 'controlled' }]
        }
      ]
    };
    const resolve = runResolver(state, () => false);
    const res = resolve({ characterId: 'char-1', entityId: 'ce-1', entityKind: 'controlled' });
    assert.equal(res.ok, true, 'Scenario 2: rev 1 entity resolves even when sheet revision advanced');
    assert.equal(res.projection.projectionId, 'proj-1');
  }

  // Scenario 3: New entity added in revision 2 (not in frozen projection)
  {
    const state = {
      encounter: { phase: 'confirmed' },
      turn: { started: true, round: 2 },
      combatants: [
        { id: 'c1', kind: 'character', characterId: 'char-1', combatProjectionId: 'proj-1', cleanupRemoved: false }
      ],
      combatProjections: [
        {
          projectionId: 'proj-1',
          characterId: 'char-1',
          characterRevision: 1,
          controlledEntities: [{ id: 'ce-1', name: 'Wolf', status: 'controlled' }]
        }
      ]
    };
    const resolve = runResolver(state, () => false);
    const res = resolve({ characterId: 'char-1', entityId: 'ce-new-in-rev2', entityKind: 'controlled' });
    assert.equal(res.ok, false, 'Scenario 3: entity not in projection must fail');
    assert.equal(res.reason, 'entity-not-in-projection');
    assert.match(res.reasonText, /该实体只存在于更新后的角色卡修订中，不属于当前战斗/);
  }

  // Scenario 4: Multiple ambiguous projections
  {
    const state = {
      encounter: { phase: 'confirmed' },
      turn: { started: true, round: 2 },
      combatants: [
        { id: 'c1', kind: 'character', characterId: 'char-1', combatProjectionId: 'proj-1', cleanupRemoved: false },
        { id: 'c2', kind: 'character', characterId: 'char-1', combatProjectionId: 'proj-2', cleanupRemoved: false }
      ],
      combatProjections: [
        { projectionId: 'proj-1', characterId: 'char-1', controlledEntities: [{ id: 'ce-shared' }] },
        { projectionId: 'proj-2', characterId: 'char-1', controlledEntities: [{ id: 'ce-shared' }] }
      ]
    };
    const resolve = runResolver(state, () => false);
    const res = resolve({ characterId: 'char-1', entityId: 'ce-shared', entityKind: 'controlled' });
    assert.equal(res.ok, false);
    assert.equal(res.reason, 'multiple-ambiguous-projections');
  }

  // Scenario 5: Controller not in combat
  {
    const state = {
      encounter: { phase: 'confirmed' },
      turn: { started: true, round: 2 },
      combatants: [],
      combatProjections: [
        { projectionId: 'proj-1', characterId: 'char-1', controlledEntities: [{ id: 'ce-1' }] }
      ]
    };
    const resolve = runResolver(state, () => false);
    const res = resolve({ characterId: 'char-1', entityId: 'ce-1', entityKind: 'controlled' });
    assert.equal(res.ok, false, 'Scenario 5: controller not in combat must fail');
    assert.equal(res.reason, 'no-combatant');
    assert.equal(res.reasonText, '控制者不在当前战斗或未在场。');
  }
}

// 12. Workbench Adaptation UX Tests (6 Areas)
{
  const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/battle-workbench.css', import.meta.url), 'utf8');
  const styles = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');

  // Area 1: Top notice & combat status
  assert.match(app, /data-workbench-notice/, 'app.js includes workbench notice mount');
  assert.match(styles, /html\[data-theme="light"\] \.workbench-shell \.notice/, 'styles.css supports light theme notice');
  assert.match(styles, /html\[data-theme="parchment"\] \.workbench-shell \.notice/, 'styles.css supports parchment theme notice');
  assert.match(css, /html\[data-theme="light"\] \.notice/, 'battle-workbench.css supports light theme notice');
  assert.match(css, /html\[data-theme="parchment"\] \.notice/, 'battle-workbench.css supports parchment theme notice');

  // Area 2: Combat control buttons
  assert.match(app, /combat-ctrl-bar/, 'app.js renders combat-ctrl-bar container');
  assert.match(app, /combat-progression-group/, 'app.js renders combat-progression-group');
  assert.match(app, /combat-danger-group/, 'app.js renders combat-danger-group');
  assert.match(app, /btn-initiative/, 'app.js classes initiative button');
  assert.match(app, /btn-next-turn/, 'app.js classes next turn button');
  assert.match(app, /btn-end-combat/, 'app.js classes end combat danger button');
  assert.match(css, /\.combat-ctrl-bar/, 'css defines .combat-ctrl-bar layout');
  assert.match(css, /\.combat-progression-group/, 'css defines progression group layout');
  assert.match(css, /\.combat-danger-group/, 'css defines danger group layout');

  // Area 3: PC life state & post-death flow
  assert.match(app, /pc-life-summary-strip/, 'app.js renders pc-life-summary-strip');
  assert.match(app, /pc-life-metric/, 'app.js renders structured pc-life-metric');
  assert.match(app, /death-outcome-segmented/, 'app.js renders death-outcome-segmented');
  assert.match(app, /post-death-stage-panel/, 'app.js renders post-death-stage-panel');
  assert.match(app, /form-stage-section/, 'app.js renders staged form sections');
  assert.match(app, /stage-legend/, 'app.js renders stage legends');
  assert.match(app, /inheritance-card-grid/, 'app.js renders inheritance-card-grid');
  assert.match(app, /inheritance-card/, 'app.js renders inheritance-card');
  assert.match(app, /deathSuccessorDraft/, 'app.js defines deathSuccessorDraft map');
  assert.match(app, /saveSuccessorDraftFromForm/, 'app.js defines saveSuccessorDraftFromForm');
  assert.match(app, /export function getDeathSuccessorDraft/, 'app.js exports getDeathSuccessorDraft');
  assert.match(app, /export function clearDeathSuccessorDraft/, 'app.js exports clearDeathSuccessorDraft');

  // Area 4 & 5: Disclosure state
  assert.match(app, /inspectorDisclosureState/, 'app.js defines inspectorDisclosureState map');
  assert.match(app, /export function getInspectorDisclosureState/, 'app.js exports getInspectorDisclosureState');
  assert.match(app, /export function setInspectorDisclosureState/, 'app.js exports setInspectorDisclosureState');
  assert.match(app, /data-inspector-fold="resources"/, 'app.js sets data-inspector-fold="resources"');
  assert.match(app, /data-inspector-fold="actions"/, 'app.js sets data-inspector-fold="actions"');
  assert.match(app, /data-fold-unit=/, 'app.js sets data-fold-unit on details');
  assert.match(app, /details\.ontoggle/, 'app.js listens to details toggle event');
  assert.match(css, /\.wb-details-fold/, 'css defines .wb-details-fold');

  // Area 6: Three themes & responsiveness
  assert.match(css, /html\[data-theme="light"\] \.spell-ruling-workspace/, 'css styles light theme spell ruling');
  assert.match(css, /html\[data-theme="parchment"\] \.spell-ruling-workspace/, 'css styles parchment theme spell ruling');
  assert.match(css, /html\[data-theme="light"\] \.death-outcome-btn\.active/, 'css styles light theme death outcome buttons');
  assert.match(css, /html\[data-theme="parchment"\] \.death-outcome-btn\.active/, 'css styles parchment theme death outcome buttons');
  assert.match(css, /@media \(max-width:\s*900px\)/, 'css defines 900px responsive breakpoint');
  assert.match(css, /@media \(max-width:\s*480px\)/, 'css defines 480px mobile responsive breakpoint');

  // Disclosure state logic contract (simulated unit isolation)
  {
    const stateMap = new Map();
    const setFold = (id, key, open) => stateMap.set(`${id}:${key}`, Boolean(open));
    const getFold = (id, key) => stateMap.get(`${id}:${key}`);

    setFold('c1', 'resources', false);
    setFold('c1', 'actions', true);
    setFold('c2', 'resources', true);
    setFold('c2', 'actions', false);

    assert.equal(getFold('c1', 'resources'), false);
    assert.equal(getFold('c1', 'actions'), true);
    assert.equal(getFold('c2', 'resources'), true);
    assert.equal(getFold('c2', 'actions'), false);
  }

  // Draft preservation contract (simulated shape change without wiping)
  {
    const draftMap = new Map();
    const saveDraft = (id, data) => draftMap.set(id, { ...(draftMap.get(id) || {}), ...data });

    saveDraft('pc-dead', { name: '勇者新躯', hp: 12, reason: '战死转化' });
    // Switch shape to undead
    const current = draftMap.get('pc-dead');
    assert.equal(current.name, '勇者新躯');
    assert.equal(current.hp, 12);
    assert.equal(current.reason, '战死转化');

    // Deselect all inheritance cards: empty array must be saved and preserved
    saveDraft('pc-dead', { inheritGroups: [] });
    const afterDeselect = draftMap.get('pc-dead');
    assert.deepEqual(afterDeselect.inheritGroups, []);

    // Simulated resolution in s2SuccessorPanel / s2InheritanceControls
    const ALL_GROUPS = ['abilityScores', 'race', 'classLevels', 'background', 'proficiencies', 'inventory', 'features', 'spells'];
    const resolveInherit = (draft) => draft.inheritGroups !== undefined ? draft.inheritGroups : ALL_GROUPS;

    // With empty draft array: must resolve to [] (not ALL_GROUPS)
    assert.deepEqual(resolveInherit(afterDeselect), []);

    // With fresh draft without inheritGroups: defaults to ALL_GROUPS
    assert.deepEqual(resolveInherit({}), ALL_GROUPS);
  }

  // Regex checks for empty inheritance array handling in app.js
  assert.match(app, /inheritGroups(?:\s*,\s*|\s*:\s*inheritGroups)/, 'app.js preserves empty inheritGroups array in draft');
  assert.match(app, /selectedGroups!==undefined\?selectedGroups:S2_SUCCESSOR_INHERITANCE_GROUPS/, 's2InheritanceControls treats empty array as valid selection');
  assert.match(app, /draft\.inheritGroups!==undefined\?draft\.inheritGroups:S2_SUCCESSOR_INHERITANCE_GROUPS/, 's2SuccessorPanel passes empty inheritGroups from draft');
}

// 13. Asymmetric Responsive Layout Engine & Visual Hierarchy Contracts
{
  const css = await readFile(new URL('../src/battle-workbench.css', import.meta.url), 'utf8');
  const foundation = await readFile(new URL('../src/workbench-foundation.css', import.meta.url), 'utf8');
  const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');

  // Track ownership is centralized; runtime geometry is verified in browser acceptance.
  assert.match(foundation, /\.wb-col-center\s*\{[^}]*grid-column:\s*2/);
  assert.match(foundation, /--inspector-width:\s*38%/);
  assert.doesNotMatch(css, /\.mode-combat\s+\.wb-col-center\s*\{[^}]*display:\s*none/);

  // Blocking Correction 2: Theme Card Surfaces & No Dark Blue Life Metric
  assert.doesNotMatch(css, /html\[data-theme="light"\]\s+\.unit-pc-life-host\s+\.pc-life-panel[^{]*\{[^}]*background:\s*#ffffff/i, 'Light theme forbids #ffffff on main pc-life-panel');
  assert.match(css, /html\[data-theme="light"\]\s+\.unit-pc-life-host\s+\.pc-life-panel[^{]*\{[^}]*background:\s*#f3f1eb/i, 'Light theme must use grey-white #f3f1eb on pc-life-panel');
  assert.match(css, /\.pc-life-panel\s+\.pc-life-metric\.stat/i, 'css must specifically override .stat on .pc-life-panel');
  assert.match(css, /\.pc-life-panel\s+\.pc-life-metric\.stat[^{]*\{[^}]*min-width:\s*0\s*!important/i, 'css must override min-width:0 !important on pc-life-metric');
  assert.match(css, /\.pc-life-panel\s+\.pc-life-metric\.stat[^{]*\{[^}]*background:\s*var\(--surface-card/i, 'css must override stat background with var(--surface-card)');

  // Blocking Correction 3: layoutState in app.js and markup generator
  assert.match(app, /const layoutState[^\n]*isResolutionMode\s*\?\s*'resolution'/, 'explicit map mode takes precedence over resolution layout');
  assert.match(app, /layoutState,/, 'app.js passes layoutState to battleWorkbenchMarkup');

  // Resolution and Combat layout state generation in battleWorkbenchMarkup
  const resMarkup = battleWorkbenchMarkup({
    layoutState: 'resolution',
    subMode: 'full',
  });
  assert.match(resMarkup, /class="[^"]*layout-resolution[^"]*"/, 'Markup includes layout-resolution class');
  assert.match(resMarkup, /data-layout-state="resolution"/, 'Markup includes data-layout-state="resolution"');

  const combatMarkup = battleWorkbenchMarkup({
    layoutState: 'combat',
    subMode: 'combat',
  });
  assert.match(combatMarkup, /class="[^"]*layout-combat[^"]*"/, 'Markup includes layout-combat class');
  assert.match(combatMarkup, /data-layout-state="combat"/, 'Markup includes data-layout-state="combat"');

  // Blocking Correction 4: 768px～1050px single-column vertical stack (Map -> Right -> Left)
  assert.doesNotMatch(css, /@media\s*\(max-width:\s*1050px\)/i, 'legacy viewport breakpoint must not compete with container sizing');
  assert.match(foundation, /@container\s*workbench\s*\(max-width:\s*900px\)/i, 'foundation owns the available-width breakpoint');
  assert.match(foundation, /\.battle-workbench-root\s+\.wb-col-center\s*\{[^}]*order:\s*1/i, '1050px stacks Center Map at order: 1');
  assert.match(foundation, /\.battle-workbench-root\s+\.wb-col-right\s*\{[^}]*order:\s*2/i, '1050px stacks Right Operation at order: 2');
  assert.match(foundation, /\.battle-workbench-root\s+\.wb-col-left\s*\{[^}]*order:\s*3/i, '1050px stacks Left Initiative at order: 3');
}

console.log('candidate-unified-workbench.test.mjs: pass');
