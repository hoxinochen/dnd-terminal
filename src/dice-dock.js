/**
 * Scheme A Embedded Dice Dock
 * EXP-UX-GEMINI-001 Candidate Decoupled Module
 * Strictly Zero Emojis
 */

export const DICE_PRESETS = Object.freeze(['1d20', 'd4', 'd6', 'd8', 'd10', 'd12', '1d100']);

/**
 * Renders Scheme A Embedded Dice Dock markup
 */
export function diceDockMarkup(options = {}) {
  const {
    latestRoll = null,
    diceDockOpen = false,
    history = [],
    esc = s => String(s ?? ''),
  } = options;

  const resultBadge = latestRoll
    ? `<span class="wb-dice-result-badge" title="最新掷骰结果">${esc(latestRoll.total)} (${esc(latestRoll.formula || latestRoll.formulaCanonical)})</span>`
    : '<span class="wb-dice-idle-badge">尚未掷骰</span>';

  const historyItems = (history || []).slice(0, 30).map((item, idx) => {
    const payload = item.payload || {};
    const formula = payload.formulaCanonical || payload.formula || '1d20';
    const total = payload.total ?? '—';
    const rolls = (payload.rolls || []).join(', ');
    return `<div class="wb-dice-history-row">
      <span class="wb-history-index">#${idx + 1}</span>
      <span class="wb-history-formula">${esc(formula)}</span>
      <span class="wb-history-detail">[${esc(rolls)}]</span>
      <b class="wb-history-total">${esc(total)}</b>
    </div>`;
  }).join('') || '<p class="wb-empty-muted">暂无本次会话掷骰记录</p>';

  const chips = DICE_PRESETS.map(preset =>
    `<button type="button" class="wb-dice-preset-chip" data-dice-preset="${preset}">${preset === '1d20' ? 'd20' : preset}</button>`
  ).join('');

  return `
    <section class="wb-dice-dock" data-wb-dice-dock aria-label="战时速查掷骰坞">
      <div class="wb-dice-dock-header">
        <div class="wb-dice-title-group">
          <span class="wb-dice-title">战时掷骰</span>
          ${resultBadge}
        </div>
        <button type="button" class="wb-dice-toggle-btn ${diceDockOpen ? 'active' : ''}" data-wb-dice-toggle data-dice-dock-toggle title="展开/收起掷骰历史">
          历史 ${diceDockOpen ? '▲' : '▼'}
        </button>
      </div>

      <div class="wb-dice-preset-chips" role="group" aria-label="快捷面数">
        ${chips}
      </div>

      <form class="wb-dice-form" data-wb-dice-form onsubmit="return false;">
        <div class="wb-dice-input-row">
          <input type="text" class="wb-dice-formula-input" data-wb-dice-formula placeholder="例如 1d20+5, 2d6+3" value="1d20" />
          <select class="wb-dice-mode-select" data-wb-dice-mode aria-label="优势劣势模式">
            <option value="normal">普通</option>
            <option value="advantage">优势 (取高)</option>
            <option value="disadvantage">劣势 (取低)</option>
          </select>
          <button type="button" class="wb-dice-roll-btn" data-wb-dice-roll>投</button>
        </div>
        <label class="wb-dice-dark-label">
          <input type="checkbox" data-wb-dark-roll /> 暗投 (仅 DM 可见)
        </label>
      </form>

      <!-- 醒目掷骰结果展示区 (借鉴优秀桌面质感，大字号高对比呈现) -->
      <div class="wb-dice-showcase">
        <div class="wb-dice-showcase-meta">
          <span class="wb-dice-showcase-title">${latestRoll ? `最新结果：${esc(latestRoll.formula || latestRoll.formulaCanonical)}` : '战时掷骰准备就绪'}</span>
          <span class="wb-dice-showcase-detail">${latestRoll && latestRoll.rolls?.length ? `[${latestRoll.rolls.join(', ')}]` : '点击上方骰子或输入自定义骰式'}</span>
        </div>
        <div class="wb-dice-showcase-total" title="最新投骰最终值">
          ${latestRoll ? esc(latestRoll.total) : '20'}
        </div>
      </div>

      ${diceDockOpen ? `
        <div class="wb-dice-history-drawer" data-wb-dice-history>
          <div class="wb-history-header">
            <span>最近掷骰记录</span>
            <small>${history.length} 次</small>
          </div>
          <div class="wb-history-scroll-list">
            ${historyItems}
          </div>
        </div>
      ` : ''}
    </section>
  `;
}

/**
 * Binds events for Dice Dock: chip presets, enter roll, action text autofill
 */
export function bindDiceDock(container, options = {}) {
  if (!container) return;

  const {
    onDiceRoll = null,
    onToggleHistory = null,
  } = options;

  const formulaInput = container.querySelector('[data-wb-dice-formula]');
  const modeSelect = container.querySelector('[data-wb-dice-mode]');
  const darkCheck = container.querySelector('[data-wb-dark-roll]');

  // 1. Preset chip click
  container.querySelectorAll('[data-dice-preset]').forEach(chip => {
    chip.onclick = () => {
      if (formulaInput) {
        formulaInput.value = chip.dataset.dicePreset;
        formulaInput.focus();
      }
    };
  });

  // 2. Roll execution
  const doRoll = () => {
    const formula = formulaInput?.value?.trim() || '1d20';
    const mode = modeSelect?.value || 'normal';
    const dark = !!darkCheck?.checked;
    onDiceRoll?.(formula, mode, dark);
  };

  container.querySelectorAll('[data-wb-dice-roll]').forEach(btn => btn.onclick = doRoll);
  formulaInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doRoll();
    }
  });

  // 3. Toggle History
  container.querySelectorAll('[data-wb-dice-toggle]').forEach(btn => {
    btn.onclick = () => onToggleHistory?.();
  });

  // 4. Action Damage Autofill联动 (Click damage like 2d6+3 in action section to autofill!)
  container.ownerDocument.querySelectorAll('.reference-section, .combatant, [data-panel-id="current-action"]').forEach(panel => {
    panel.addEventListener('click', e => {
      const text = e.target.textContent || '';
      const match = text.match(/\b(\d+d\d+(?:[+-]\d+)?)\b/i);
      if (match && formulaInput) {
        formulaInput.value = match[1];
        formulaInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        formulaInput.focus();
      }
    });
  });
}
