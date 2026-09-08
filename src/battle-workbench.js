/**
 * Unified Battle Map Workbench (EXP-UX-GEMINI-001)
 * Clean Segmented Controls (No brackets), Upright Chinese Mini-Docks, Decoupled Architecture
 * Strictly Zero Emojis
 */

import { diceDockMarkup, bindDiceDock } from './dice-dock.js';
import { journalDrawerMarkup, bindJournalDrawer } from './journal-stub.js';
import { bindMapController, calculateNextZoom } from './map-controller.js';

export const WORKBENCH_SUBMODES = Object.freeze(['full', 'combat', 'map']);
export const WORKBENCH_THEMES = Object.freeze(['dark', 'light', 'parchment']);

/**
 * Calculates 2D tactical distance between two grid cells in feet
 */
export function calculateGridDistanceFeet(from, to, cellFeet = 5, diagonalRule = 'five-feet') {
  if (!from || !to) return null;
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);

  if (diagonalRule === 'five-ten-alternating') {
    const diagonals = Math.min(dx, dy);
    const straights = Math.max(dx, dy) - diagonals;
    const diagDist = Math.floor(diagonals / 2) * 15 + (diagonals % 2) * 5;
    return diagDist + straights * cellFeet;
  }

  // Standard D&D 5e: 5-5-5 distance (Chebyshev metric)
  return Math.max(dx, dy) * cellFeet;
}

/**
 * Renders the topbar with clean segmented buttons and tactical status
 */
function renderWorkbenchTopbar(options = {}) {
  const {
    subMode = 'full',
    theme = 'dark',
    round = 1,
    activeName = '',
    selectedName = '',
    tacticalDistanceFeet = null,
    turnStarted = false,
  } = options;

  const roundBadge = turnStarted
    ? `<span class="wb-status-pill wb-status-round">第 ${round} 轮</span>`
    : '<span class="wb-status-pill wb-status-idle">未开始先攻</span>';

  const actorBadge = activeName
    ? `<span class="wb-status-pill wb-status-actor">当前行动：${activeName}</span>`
    : '';

  const distanceBadge = tacticalDistanceFeet !== null
    ? `<span class="wb-status-pill wb-status-distance">战术距离: <b>${tacticalDistanceFeet} 尺</b></span>`
    : '';

  return `
    <header class="wb-topbar" aria-label="统一工作台控制栏">
      <!-- 模式切换：现代分段器设计，绝无生硬方括号 -->
      <div class="wb-segmented-group" role="group" aria-label="工作台显示模式">
        <button type="button" class="wb-mode-btn ${subMode === 'full' ? 'active' : ''}" data-wb-mode="full" title="全量三栏布局">全量</button>
        <button type="button" class="wb-mode-btn ${subMode === 'combat' ? 'active' : ''}" data-wb-mode="combat" title="战斗聚焦（收起地图，两栏对开）">战斗</button>
        <button type="button" class="wb-mode-btn ${subMode === 'map' ? 'active' : ''}" data-wb-mode="map" title="纯净地图（收起双侧，全屏沙盘）">地图</button>
      </div>

      <!-- 战术即时态势指示 -->
      <div class="wb-topbar-status">
        ${roundBadge}
        ${actorBadge}
        ${distanceBadge}
      </div>

      <!-- 右侧工具：团务速记与美学方案分段器 -->
      <div class="wb-topbar-actions">
        <button type="button" class="wb-journal-btn" data-wb-journal-toggle data-wb-tool="journal" title="打开团务速记抽屉">团务速记</button>

        <div class="wb-segmented-group wb-theme-segmented" role="group" aria-label="美学主题切换">
          <button type="button" class="wb-theme-btn ${theme === 'light' ? 'active' : ''}" data-wb-theme="light" title="浅色方案 · 轻量高对比">浅色</button>
          <button type="button" class="wb-theme-btn ${theme === 'dark' ? 'active' : ''}" data-wb-theme="dark" title="深色方案 · 专注控制台">深色</button>
          <button type="button" class="wb-theme-btn ${theme === 'parchment' ? 'active' : ''}" data-wb-theme="parchment" title="羊皮纸方案 · 沉浸古卷轴">羊皮纸</button>
        </div>
      </div>
    </header>
  `;
}

/**
 * Main Markup Generator for Unified Battle Map Workbench
 */
export function battleWorkbenchMarkup(data = {}) {
  const {
    state,
    activeCombatant,
    selectedCombatant,
    subMode = 'full',
    theme = 'dark',
    leftCollapsed = false,
    rightCollapsed = false,
    diceDockOpen = false,
    journalOpen = false,
    journalNotes = [],
    zoomLevel = 1.0,
    esc = s => String(s ?? ''),
    rosterMarkup = '',
    turnMarkup = '',
    actionMarkup = '',
    inspectorMarkup = '',
    rangeMarkup = '',
    mapGridMarkup = '',
    recentResultMarkup = '',
  } = data;

  const w = state?.settings?.width || 24;
  const h = state?.settings?.height || 18;
  const cellFeet = state?.settings?.cellFeet || 5;
  const diagRule = state?.settings?.diagonalRule || 'five-feet';
  const round = state?.turn?.round || 1;
  const turnStarted = Boolean(state?.turn?.started);

  const activeName = activeCombatant ? esc(activeCombatant.name) : '';
  const selectedName = selectedCombatant ? esc(selectedCombatant.name) : '';
  const onFieldCount = (state?.combatants || []).filter(c => c.presenceStatus === 'on-field' && !c.cleanupRemoved).length;

  // 2D Tactical Distance
  const tacticalDist = (activeCombatant?.position && selectedCombatant?.position && activeCombatant.id !== selectedCombatant.id)
    ? calculateGridDistanceFeet(activeCombatant.position, selectedCombatant.position, cellFeet, diagRule)
    : null;

  // Dice Dock (Scheme A)
  const latestDiceEvent = (state?.events || []).slice().reverse().find(e => e.type === 'dice.rolled');
  const diceHistory = (state?.events || []).filter(e => e.type === 'dice.rolled').slice().reverse();
  const diceMarkup = diceDockMarkup({
    latestRoll: latestDiceEvent?.payload,
    diceDockOpen,
    history: diceHistory,
    esc,
  });

  // BL-030 Quick Journal Drawer
  const journalDrawer = journalDrawerMarkup({
    isOpen: journalOpen,
    currentRound: round,
    notes: journalNotes,
    esc,
  });

  const topbar = renderWorkbenchTopbar({
    subMode,
    theme,
    round,
    activeName,
    selectedName,
    tacticalDistanceFeet: tacticalDist,
    turnStarted,
  });

  // Initiative Ribbon (inspired by modern Baldur's Gate / Foundry DM consoles)
  const onFieldCombatants = (state?.combatants || [])
    .filter(c => c.presenceStatus === 'on-field' && !c.cleanupRemoved);

  let sortedCombatants = [...onFieldCombatants];
  if (state?.turn?.order && Array.isArray(state.turn.order) && state.turn.order.length > 0) {
    const orderMap = new Map(state.turn.order.map((id, index) => [id, index]));
    sortedCombatants.sort((a, b) => {
      const idxA = orderMap.has(a.id) ? orderMap.get(a.id) : 999;
      const idxB = orderMap.has(b.id) ? orderMap.get(b.id) : 999;
      return idxA - idxB;
    });
  } else {
    sortedCombatants.sort((a, b) => (b.initiative ?? 0) - (a.initiative ?? 0));
  }

  const ribbonItems = sortedCombatants.map(c => {
    const isActive = activeCombatant?.id === c.id;
    const isSelected = selectedCombatant?.id === c.id;
    const roleKind = c.kind === 'character' ? 'pc' : c.kind === 'monster' ? 'monster' : 'npc';
    const initial = (c.shortLabel || c.name || '?').slice(0, 1).toUpperCase();
    const acted = Boolean(c.turnCompletedRound && c.turnCompletedRound === round);
    const statusText = isActive ? '动作中' : acted ? '已行动' : '待命';

    return `
      <div class="wb-ribbon-item ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''} kind-${roleKind}"
           data-combatant-id="${esc(c.id)}"
           data-select-card="${esc(c.id)}"
           tabindex="0"
           title="${esc(c.name)} · 先攻 ${c.initiative ?? '—'} · ${statusText}">
        <span class="wb-ribbon-token kind-${roleKind}">${esc(initial)}</span>
        <div class="wb-ribbon-info">
          <span class="wb-ribbon-name">${esc(c.name)}</span>
          <span class="wb-ribbon-sub">先攻 ${c.initiative ?? '—'} · ${statusText}</span>
        </div>
      </div>
    `;
  }).join('');

  const initiativeRibbon = `
    <nav class="wb-initiative-ribbon ${turnStarted ? 'is-active' : 'is-idle'}" aria-label="战时先攻轮次导轨">
      <div class="wb-ribbon-round">
        <span class="wb-ribbon-round-label">ROUND</span>
        <b class="wb-ribbon-round-val">${round < 10 ? '0' + round : round}</b>
      </div>
      <div class="wb-ribbon-track" role="list">
        ${turnStarted && ribbonItems ? ribbonItems : '<div class="wb-ribbon-empty-text">遭遇准备中 · 尚未开始先攻</div>'}
      </div>
      <div class="wb-ribbon-action">
        ${turnStarted
          ? '<button type="button" class="wb-ribbon-next-btn" data-action="next" title="推进至下一行动单位">下一轮次 ▶</button>'
          : '<button type="button" class="wb-ribbon-start-btn" data-action="initiative" title="掷先攻进入战斗">掷先攻 ▶</button>'
        }
      </div>
    </nav>
  `;

  // Short labels for glanceable mini-docks (upright Chinese!)
  const shortActive = activeCombatant ? (activeCombatant.shortLabel || activeCombatant.name).slice(0, 2) : '无';
  const shortSelected = selectedCombatant ? (selectedCombatant.shortLabel || selectedCombatant.name).slice(0, 2) : '无';
  const selectedHp = selectedCombatant ? `${selectedCombatant.hp} HP` : '—';

  return `
    <div class="battle-workbench-root theme-${theme} mode-${subMode} ${leftCollapsed ? 'left-collapsed' : ''} ${rightCollapsed ? 'right-collapsed' : ''}"
         data-battle-workbench
         data-theme="${theme}"
         data-submode="${subMode}">

      ${topbar}
      ${initiativeRibbon}

      <div class="wb-layout-container">
        <!-- 左栏：行动轮与单位态势 -->
        <aside class="wb-column wb-col-left" aria-label="行动轮与全场态势">
          <div class="wb-column-header">
            <span class="wb-col-title">行动轮与态势</span>
            <button type="button" class="wb-collapse-btn" data-wb-collapse="left" title="收起行动轮面板" aria-label="收起左侧面板">◀</button>
          </div>
          <div class="wb-column-content">
            ${turnMarkup}
            ${rosterMarkup}
          </div>
        </aside>

        <!-- 左侧微型战况停靠带 (Glanceable Mini-Dock · 汉字正向正立) -->
        <div class="wb-dock-strip wb-dock-left" data-wb-expand="left" title="展开行动轮与态势 (点击展开)">
          <div class="wb-mini-dock-content">
            <span class="wb-mini-badge wb-mini-round">R${round}</span>
            <span class="wb-mini-tag">${esc(shortActive)}</span>
            <span class="wb-mini-sub">${onFieldCount}体</span>
            <div class="wb-mini-divider"></div>
            <span class="wb-dock-label">▶ 行动轮</span>
          </div>
        </div>

        <!-- 中栏：纯净战术地图沙盘 -->
        <main class="wb-column wb-col-center" aria-label="战术地图沙盘">
          <div class="wb-map-floating-bar" aria-label="地图视口控制">
            <div class="wb-map-spec">
              <span>${w}×${h} · 每格 ${cellFeet} 尺</span>
            </div>
            <div class="wb-map-zoom-group">
              <button type="button" class="wb-map-btn" data-map-zoom="out" title="缩小地图 (直接滑动滚轮或手势捏合)">-</button>
              <span class="wb-zoom-label" data-map-zoom-label>${Math.round(zoomLevel * 100)}%</span>
              <button type="button" class="wb-map-btn" data-map-zoom="in" title="放大地图 (直接滑动滚轮或手势捏合)">+</button>
              <button type="button" class="wb-map-btn" data-map-zoom="reset" title="重置 100%">重置</button>
              <button type="button" class="wb-map-btn" data-map-zoom="fit" title="自适应视口">自适应</button>
              <button type="button" class="wb-map-btn" data-map-focus="origin" title="回原点 (0,0)">原点</button>
              <button type="button" class="wb-map-btn" data-map-focus="active" title="聚焦当前行动者">行动者</button>
            </div>
          </div>

          <div class="wb-map-viewport" data-map-viewport style="--map-scale: ${zoomLevel};">
            <div class="wb-map-canvas" data-map-canvas>
              ${mapGridMarkup}
            </div>
          </div>
        </main>

        <!-- 右侧微型检视停靠带 (Glanceable Mini-Dock · 汉字正向正立) -->
        <div class="wb-dock-strip wb-dock-right" data-wb-expand="right" title="展开操作与检视 (点击展开)">
          <div class="wb-mini-dock-content">
            <span class="wb-mini-badge wb-mini-target">${esc(shortSelected)}</span>
            <span class="wb-mini-tag">${esc(selectedHp)}</span>
            <div class="wb-mini-divider"></div>
            <span class="wb-dock-label">◀ 检视</span>
          </div>
        </div>

        <!-- 右栏：战时掷骰坞 + 当前选中者检视 -->
        <aside class="wb-column wb-col-right" aria-label="操作检视与掷骰">
          <div class="wb-column-header">
            <button type="button" class="wb-collapse-btn" data-wb-collapse="right" title="收起检视面板" aria-label="收起右侧面板">▶</button>
            <span class="wb-col-title">操作与检视</span>
          </div>
          <div class="wb-column-content">
            ${diceMarkup}
            ${inspectorMarkup}
            ${actionMarkup}
            ${rangeMarkup ? `<div class="wb-range-wrap">${rangeMarkup}</div>` : ''}
          </div>
        </aside>
      </div>

      ${journalDrawer}
    </div>
  `;
}

/**
 * Binds DOM interactions for the Unified Battle Workbench
 */
export function bindBattleWorkbenchInteractions(shell, callbacks = {}) {
  if (!shell) return;

  const {
    onSubModeChange = null,
    onThemeChange = null,
    onCollapseChange = null,
    onDiceRoll = null,
    onDiceDockToggle = null,
    onJournalToggle = null,
    onJournalAddNote = null,
    onZoomChange = null,
  } = callbacks;

  // 1. SubMode Switcher (Clean segmented controls)
  shell.querySelectorAll('[data-wb-mode]').forEach(btn => {
    btn.onclick = () => onSubModeChange?.(btn.dataset.wbMode);
  });

  // 2. Theme Switcher (Clean segmented controls)
  shell.querySelectorAll('[data-wb-theme]').forEach(btn => {
    btn.onclick = () => onThemeChange?.(btn.dataset.wbTheme);
  });

  // 3. Sidebars Independent Collapse / Expand
  shell.querySelectorAll('[data-wb-collapse]').forEach(btn => {
    btn.onclick = () => onCollapseChange?.(btn.dataset.wbCollapse, true);
  });

  shell.querySelectorAll('[data-wb-expand]').forEach(btn => {
    btn.onclick = () => onCollapseChange?.(btn.dataset.wbExpand, false);
  });

  // 4. Map Controller (Natural Wheel zoom without Ctrl, pinch zoom, zoom buttons)
  const viewport = shell.querySelector('[data-map-viewport]');
  const canvas = shell.querySelector('[data-map-canvas]');
  const label = shell.querySelector('[data-map-zoom-label]');

  if (viewport && canvas) {
    bindMapController(viewport, canvas, {
      initialZoom: parseFloat(viewport.style.getPropertyValue('--map-scale')) || 1.0,
      labelElement: label,
      onZoomChange: (newZoom) => onZoomChange?.('direct', newZoom),
    });

    shell.querySelectorAll('[data-map-zoom]').forEach(btn => {
      btn.onclick = () => {
        const action = btn.dataset.mapZoom;
        onZoomChange?.(action);
      };
    });

    shell.querySelectorAll('[data-map-focus]').forEach(btn => {
      btn.onclick = () => {
        const focusType = btn.dataset.mapFocus;
        if (focusType === 'origin') {
          viewport.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
        } else if (focusType === 'active') {
          const activeToken = viewport.querySelector('.token.active');
          if (activeToken) {
            activeToken.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          }
        }
      };
    });
  }

  // 5. Embedded Dice Dock (Scheme A)
  const diceContainer = shell.querySelector('.wb-dice-dock');
  if (diceContainer) {
    bindDiceDock(diceContainer, {
      onDiceRoll,
      onToggleHistory: onDiceDockToggle,
    });
  }

  // 6. Quick Journal Drawer (BL-030)
  shell.querySelectorAll('[data-wb-journal-toggle]').forEach(btn => {
    btn.onclick = () => onJournalToggle?.();
  });

  const journalOverlay = shell.querySelector('[data-journal-overlay]');
  if (journalOverlay) {
    bindJournalDrawer(journalOverlay, {
      onAddNote: onJournalAddNote,
      onClose: onJournalToggle,
    });
  }
}
