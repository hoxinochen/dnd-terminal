// Unified Battle Map Workbench (EXP-UX-GEMINI-001)
// Pure UI orchestration layer for Desktop WebUI and responsive integration.
// Strictly adheres to CANDIDATE_CONTRACT.md: Zero Domain Mutation, Zero Emojis.

import { parseDiceFormula, rollDiceFormula, parseDiceShortcut } from './dice.js';

export const WORKBENCH_THEMES = Object.freeze(['dark', 'light', 'parchment']);
export const WORKBENCH_SUBMODES = Object.freeze(['full', 'combat', 'map']);

/**
 * Calculates straight-line grid distance in feet between two grid points.
 * Explicitly read-only 2D Euclidean / Chebyshev grid suggestion.
 */
export function calculateGridDistanceFeet(from, to, cellFeet = 5, diagonalRule = 'five-feet') {
  if (!from || !to || !Number.isFinite(from.x) || !Number.isFinite(from.y) || !Number.isFinite(to.x) || !Number.isFinite(to.y)) {
    return null;
  }
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  if (diagonalRule === 'five-ten-alternating') {
    const diagonals = Math.min(dx, dy);
    const straights = Math.max(dx, dy) - diagonals;
    const diagFeet = Math.floor(diagonals / 2) * 15 + (diagonals % 2) * 5;
    return (straights * cellFeet) + diagFeet;
  }
  // Standard 5e optional / five-feet Chebyshev distance
  return Math.max(dx, dy) * cellFeet;
}

export function battleWorkbenchMarkup(ctx) {
  const {
    state,
    activeCombatant,
    selectedCombatant,
    subMode = 'full', // 'full' | 'combat' | 'map'
    theme = 'dark',   // 'dark' | 'light' | 'parchment'
    leftCollapsed = false,
    rightCollapsed = false,
    diceDockOpen = false,
    journalOpen = false,
    zoomLevel = 1.0,
    esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])),
    rosterMarkup = '',
    turnMarkup = '',
    actionMarkup = '',
    inspectorMarkup = '',
    rangeMarkup = '',
    mapGridMarkup = '',
    recentResultMarkup = '',
  } = ctx;

  const w = state?.settings?.width ?? 24;
  const h = state?.settings?.height ?? 18;
  const cellFeet = state?.settings?.cellFeet ?? 5;
  const round = state?.turn?.round ?? 0;
  const turnStarted = state?.turn?.started ?? false;

  // Read-only tactical distance calculation
  let distanceBadge = '';
  if (activeCombatant && selectedCombatant && activeCombatant.id !== selectedCombatant.id) {
    const dist = calculateGridDistanceFeet(activeCombatant.position, selectedCombatant.position, cellFeet, state.settings?.diagonalRule);
    if (dist !== null) {
      distanceBadge = `<span class="wb-tactical-dist" title="二维平面网格直线参考距离；掩护、视线与实际移动由 DM 裁定">战术距离: <b>${dist} 尺</b></span>`;
    }
  }

  // Recent dice roll summary from state.events
  const recentRoll = [...(state?.events || [])].reverse().find(e => e.type === 'dice.rolled');
  const recentRollText = recentRoll
    ? `${recentRoll.payload?.total ?? '—'} (${recentRoll.payload?.formulaCanonical || recentRoll.payload?.formula || '1d20'})`
    : '尚未掷骰';

  return `
<div class="battle-workbench-root mode-${subMode} theme-${theme} ${leftCollapsed ? 'left-collapsed' : ''} ${rightCollapsed ? 'right-collapsed' : ''}" data-battle-workbench data-theme="${theme}">
  <!-- 工作台顶栏控制器与状态指示 -->
  <header class="wb-topbar" aria-label="统一战斗台控制栏">
    <div class="wb-topbar-left">
      <div class="wb-mode-switcher" role="group" aria-label="工作台显示模式">
        <button type="button" class="wb-mode-btn ${subMode === 'full' ? 'active' : ''}" data-wb-mode="full" aria-pressed="${subMode === 'full'}">
          [全量]
        </button>
        <button type="button" class="wb-mode-btn ${subMode === 'combat' ? 'active' : ''}" data-wb-mode="combat" aria-pressed="${subMode === 'combat'}">
          [战斗]
        </button>
        <button type="button" class="wb-mode-btn ${subMode === 'map' ? 'active' : ''}" data-wb-mode="map" aria-pressed="${subMode === 'map'}">
          [地图]
        </button>
      </div>
      <div class="wb-round-indicator">
        <span class="wb-round-chip">第 ${round} 轮</span>
        <span class="wb-active-chip">${turnStarted ? (activeCombatant ? `当前: ${esc(activeCombatant.name)}` : '等待中') : '未开始先攻'}</span>
        ${distanceBadge}
      </div>
    </div>

    <div class="wb-topbar-right">
      <button type="button" class="wb-tool-btn ${journalOpen ? 'active' : ''}" data-wb-tool="journal" title="查看团务速记蓝图（BL-030 规划中）">
        [团务速记]
      </button>
      <div class="wb-theme-switcher" role="group" aria-label="美学主题切换">
        <button type="button" class="wb-theme-btn ${theme === 'light' ? 'active' : ''}" data-wb-theme="light" title="浅色方案 · 轻量高对比">浅色</button>
        <button type="button" class="wb-theme-btn ${theme === 'dark' ? 'active' : ''}" data-wb-theme="dark" title="深色方案 · 专注控制台">深色</button>
        <button type="button" class="wb-theme-btn ${theme === 'parchment' ? 'active' : ''}" data-wb-theme="parchment" title="羊皮纸方案 · 沉浸卷轴">羊皮纸</button>
      </div>
    </div>
  </header>

  <!-- 工作台三栏主体布局 -->
  <div class="wb-layout-container">
    <!-- 左栏：行动轮与单位态势 -->
    <aside class="wb-column wb-col-left" aria-label="行动轮与全场单位态势">
      <div class="wb-column-header">
        <span class="wb-col-title">行动轮与态势</span>
        <button type="button" class="wb-collapse-btn" data-wb-collapse="left" title="收起左侧面板" aria-label="收起左侧面板">◀</button>
      </div>
      <div class="wb-column-content">
        ${turnMarkup}
        ${rosterMarkup}
        ${recentResultMarkup}
      </div>
    </aside>

    <!-- 左侧收折停靠带 (Dock Strip) -->
    <div class="wb-dock-strip wb-dock-left" data-wb-expand="left" title="展开行动轮与态势 (点击展开)">
      <span class="wb-dock-label">▶ 行动轮与态势</span>
    </div>

    <!-- 中栏：战术地图沙盘 -->
    <main class="wb-column wb-col-center" aria-label="战术地图沙盘">
      <div class="wb-map-floating-bar" aria-label="地图控制条">
        <div class="wb-map-spec">
          <span>${w}×${h} · 每格 ${cellFeet} 尺</span>
        </div>
        <div class="wb-map-zoom-group">
          <button type="button" class="wb-map-btn" data-map-zoom="out" title="缩小地图 (或按住 Ctrl 滚动滚轮)">-</button>
          <span class="wb-zoom-label" data-map-zoom-label>${Math.round(zoomLevel * 100)}%</span>
          <button type="button" class="wb-map-btn" data-map-zoom="in" title="放大地图 (或按住 Ctrl 滚动滚轮)">+</button>
          <button type="button" class="wb-map-btn" data-map-zoom="reset" title="重置 100%">重置</button>
          <button type="button" class="wb-map-btn" data-map-zoom="fit" title="自适应视口">自适应</button>
        </div>
        <div class="wb-map-focus-group">
          <button type="button" class="wb-map-btn" data-map-focus="origin" title="视口平移至原点 (0,0)">原点</button>
          <button type="button" class="wb-map-btn" data-map-focus="active" ${activeCombatant ? '' : 'disabled'} title="居中聚焦当前行动者">行动者</button>
        </div>
      </div>

      <div class="map-viewport wb-map-viewport" data-map-viewport style="--map-scale: ${zoomLevel};">
        <div class="map-canvas wb-map-canvas">
          ${mapGridMarkup}
        </div>
      </div>

      ${rangeMarkup ? `<div class="wb-range-strip">${rangeMarkup}</div>` : ''}
    </main>

    <!-- 右侧收折停靠带 (Dock Strip) -->
    <div class="wb-dock-strip wb-dock-right" data-wb-expand="right" title="展开操作与检视 (点击展开)">
      <span class="wb-dock-label">◀ 操作与检视</span>
    </div>

    <!-- 右栏：当前操作、Inspector 与战时投骰 -->
    <aside class="wb-column wb-col-right" aria-label="当前操作与目标检视">
      <div class="wb-column-header">
        <span class="wb-col-title">操作与检视</span>
        <button type="button" class="wb-collapse-btn" data-wb-collapse="right" title="收起右侧面板" aria-label="收起右侧面板">▶</button>
      </div>
      <div class="wb-column-content">
        ${actionMarkup}
        ${inspectorMarkup}

        <!-- 战时内嵌投骰盒 (Dice Dock - 方案 A) -->
        <section class="card wb-dice-dock ${diceDockOpen ? 'is-open' : 'is-collapsed'}" data-wb-dice-dock>
          <div class="wb-dice-dock-header">
            <span class="wb-dice-dock-title">战时掷骰</span>
            <span class="wb-dice-recent-pill" title="最近一次掷骰结果">${esc(recentRollText)}</span>
            <button type="button" class="wb-dice-toggle-btn" data-dice-dock-toggle aria-label="切换掷骰详细面板">
              ${diceDockOpen ? '收起 ▲' : '历史 ▼'}
            </button>
          </div>
          <div class="wb-dice-dock-controls">
            <div class="wb-dice-input-row">
              <input type="text" class="wb-dice-formula-input" data-wb-dice-formula placeholder="1d20+2" value="1d20+2" aria-label="战时骰式" />
              <select class="wb-dice-mode-select" data-wb-dice-mode aria-label="掷骰模式">
                <option value="normal">普通</option>
                <option value="advantage">优势</option>
                <option value="disadvantage">劣势</option>
              </select>
              <button type="button" class="primary wb-dice-roll-btn" data-wb-dice-roll>投</button>
            </div>
            <div class="wb-dice-presets-row">
              <button type="button" class="wb-dice-chip" data-dice-preset="1d20">d20</button>
              <button type="button" class="wb-dice-chip" data-dice-preset="1d4">d4</button>
              <button type="button" class="wb-dice-chip" data-dice-preset="1d6">d6</button>
              <button type="button" class="wb-dice-chip" data-dice-preset="1d8">d8</button>
              <button type="button" class="wb-dice-chip" data-dice-preset="1d10">d10</button>
              <button type="button" class="wb-dice-chip" data-dice-preset="1d12">d12</button>
              <button type="button" class="wb-dice-chip" data-dice-preset="1d100">d100</button>
            </div>
            <label class="wb-dark-roll-label">
              <input type="checkbox" data-wb-dark-roll ${state.settings?.darkRolls ? 'checked' : ''} />
              <span>暗骰 (仅 DM 可见)</span>
            </label>
          </div>

          <!-- 展开的历史记录流水 -->
          <div class="wb-dice-history-drawer">
            <div class="wb-dice-history-list">
              ${((state?.events || []).filter(e => e.type === 'dice.rolled').slice(-6).reverse().map(e => {
                const p = e.payload || {};
                return `<div class="wb-dice-history-item">
                  <b>${esc(p.total ?? '—')}</b>
                  <span>${esc(p.mode !== 'normal' ? p.mode : '')} ${esc(p.formulaCanonical || p.formula || '')}</span>
                  <small>${p.visibility === 'dm-only' ? '[暗]' : '[公]'} ${esc(e.occurredAt ? e.occurredAt.slice(11,19) : '')}</small>
                </div>`;
              }).join('')) || '<span class="muted">尚无本场掷骰记录</span>'}
            </div>
          </div>
        </section>
      </div>
    </aside>
  </div>

  <!-- 团务速记蓝图抽屉 (BL-030 占位) -->
  <div class="wb-journal-drawer ${journalOpen ? 'is-open' : ''}" data-wb-journal-drawer>
    <div class="wb-journal-drawer-header">
      <h3>团务速记 · 规划中特性 (BL-030)</h3>
      <button type="button" class="wb-journal-close-btn" data-wb-tool="journal-close">关闭</button>
    </div>
    <div class="wb-journal-drawer-body">
      <p class="notice warn">本面板为 BL-030 团务记录架构的版式蓝图展示。候选版本严禁伪造保存，所有持久化将在后续正式版本中实现。</p>
      <div class="wb-journal-mockup-fields">
        <label>
          <span>战时突发备忘 / 临时裁定</span>
          <textarea readonly placeholder="[示例] 西南石壁坍塌，判定为困难地形；酸液抗性仅对直接接触生效..."></textarea>
        </label>
        <label>
          <span>剧情线索与 NPC 承诺</span>
          <textarea readonly placeholder="[示例] 俘虏的熊地精供出地牢暗道密码；玩家答应带出幼犬..."></textarea>
        </label>
        <label>
          <span>战利品与消耗草稿</span>
          <input type="text" readonly placeholder="[示例] 缴获短剑 3 把，消耗治疗药水 1 瓶..." />
        </label>
      </div>
      <p class="muted">后续版本将打通与事件日志提取、AI 总结（BL-031）和战后 Canonical Journal 归档通道。</p>
    </div>
  </div>
</div>
`;
}

export function bindBattleWorkbenchInteractions(shell, handlers = {}) {
  const {
    onSubModeChange,
    onThemeChange,
    onCollapseChange,
    onDiceDockToggle,
    onDiceRoll,
    onZoomChange,
  } = handlers;

  // Mode switcher: [全量], [战斗], [地图]
  shell.querySelectorAll('[data-wb-mode]').forEach(btn => {
    btn.onclick = () => onSubModeChange?.(btn.dataset.wbMode);
  });

  // Theme switcher: 浅色, 深色, 羊皮纸
  shell.querySelectorAll('[data-wb-theme]').forEach(btn => {
    btn.onclick = () => onThemeChange?.(btn.dataset.wbTheme);
  });

  // Collapse buttons: ◀ / ▶
  shell.querySelectorAll('[data-wb-collapse]').forEach(btn => {
    btn.onclick = () => onCollapseChange?.(btn.dataset.wbCollapse, true);
  });

  // Expand buttons on dock strips: ▶ / ◀
  shell.querySelectorAll('[data-wb-expand]').forEach(strip => {
    strip.onclick = () => onCollapseChange?.(strip.dataset.wbExpand, false);
  });

  // Journal Drawer: [团务速记]
  const drawer = shell.querySelector('[data-wb-journal-drawer]');
  shell.querySelectorAll('[data-wb-tool="journal"]').forEach(btn => {
    btn.onclick = () => drawer?.classList.toggle('is-open');
  });
  shell.querySelectorAll('[data-wb-tool="journal-close"]').forEach(btn => {
    btn.onclick = () => drawer?.classList.remove('is-open');
  });

  // Dice Dock: Toggle history
  shell.querySelectorAll('[data-dice-dock-toggle]').forEach(btn => {
    btn.onclick = () => onDiceDockToggle?.();
  });

  // Dice Preset Chips: d4, d6, d8, d10, d12, d20, d100
  shell.querySelectorAll('[data-dice-preset]').forEach(chip => {
    chip.onclick = () => {
      const input = shell.querySelector('[data-wb-dice-formula]');
      if (input) {
        input.value = chip.dataset.dicePreset;
        input.focus();
      }
    };
  });

  // Dice Dock: Roll button and Enter key
  const rollInput = shell.querySelector('[data-wb-dice-formula]');
  const doRoll = () => {
    const formula = shell.querySelector('[data-wb-dice-formula]')?.value?.trim() || '1d20';
    const mode = shell.querySelector('[data-wb-dice-mode]')?.value || 'normal';
    const darkRoll = !!shell.querySelector('[data-wb-dark-roll]')?.checked;
    onDiceRoll?.(formula, mode, darkRoll);
  };
  shell.querySelectorAll('[data-wb-dice-roll]').forEach(btn => btn.onclick = doRoll);
  rollInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doRoll();
    }
  });

  // Zoom controls
  shell.querySelectorAll('[data-map-zoom]').forEach(btn => {
    btn.onclick = () => onZoomChange?.(btn.dataset.mapZoom);
  });

  // Wheel Zoom on Map Viewport
  const viewport = shell.querySelector('.wb-map-viewport');
  const canvas = shell.querySelector('.wb-map-canvas');
  if (viewport && canvas) {
    viewport.onwheel = event => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        const delta = event.deltaY < 0 ? 0.1 : -0.1;
        onZoomChange?.('delta', delta);
      }
    };
  }

  // Touch Pinch-to-zoom on Canvas
  if (canvas) {
    let initialDist = 0;
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 2) {
        initialDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', e => {
      if (e.touches.length === 2 && initialDist > 0) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const ratio = currentDist / initialDist;
        if (Math.abs(ratio - 1.0) > 0.08) {
          const delta = ratio > 1.0 ? 0.05 : -0.05;
          onZoomChange?.('delta', delta);
          initialDist = currentDist;
        }
      }
    }, { passive: true });

    canvas.addEventListener('touchend', e => {
      if (e.touches.length < 2) initialDist = 0;
    }, { passive: true });
  }

  // Click on action damage text (e.g. 2d6+3) to autofill dice formula!
  shell.querySelectorAll('.reference-section, .combatant, [data-panel-id="current-action"]').forEach(container => {
    container.addEventListener('click', e => {
      const text = e.target.textContent || '';
      const match = text.match(/\b(\d+d\d+(?:[+-]\d+)?)\b/i);
      if (match && rollInput) {
        rollInput.value = match[1];
        rollInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });
}

