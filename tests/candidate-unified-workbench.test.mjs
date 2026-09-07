import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  WORKBENCH_THEMES,
  WORKBENCH_SUBMODES,
  calculateGridDistanceFeet,
  battleWorkbenchMarkup,
} from '../src/battle-workbench.js';
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
  assert.equal(prefs.workbenchLeftCollapsed, false);
  assert.equal(prefs.workbenchRightCollapsed, false);
  assert.equal(prefs.workbenchDiceDockOpen, false);
  assert.equal(prefs.workbenchZoom, 1.0);

  const norm = normalizeUiPreferences({
    theme: 'parchment',
    workbenchSubMode: 'combat',
    workbenchLeftCollapsed: true,
    workbenchRightCollapsed: true,
    workbenchDiceDockOpen: true,
    workbenchZoom: 1.4,
  });
  assert.equal(norm.theme, 'parchment');
  assert.equal(norm.workbenchSubMode, 'combat');
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

  // Dice Dock (Scheme A)
  assert.match(markup, /data-wb-dice-dock/);
  assert.match(markup, /data-wb-dice-formula/);
  assert.match(markup, /data-wb-dice-mode/);
  assert.match(markup, /data-wb-dice-roll/);
  assert.match(markup, /data-dice-preset="1d20"/);
  assert.match(markup, /data-dice-dock-toggle/);
  assert.match(markup, /17 \(1d20\+3\)/, 'displays recent roll summary');

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
  assert.match(css, /\.mode-combat \.wb-layout-container/);
  assert.match(css, /\.mode-map \.wb-layout-container/);
  assert.match(css, /\.left-collapsed/);
  assert.match(css, /\.right-collapsed/);
  assert.match(css, /\.theme-parchment/);
  assert.match(css, /\.theme-light/);
  assert.match(css, /\.token\.kind-character/);
  assert.match(css, /\.token\.kind-npc::after/);
  assert.match(css, /\.token\.controlled-associated/);
}

console.log('candidate-unified-workbench.test.mjs: pass');
