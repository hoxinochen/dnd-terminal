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
    currentWorkspace = 'battle',
    esc = s => String(s ?? ''),
  } = options;

  const formulaStr = esc(latestRoll?.formula || latestRoll?.formulaCanonical || '1d20');
  const totalStr = esc(latestRoll?.total ?? '—');
  const resultBadge = latestRoll
    ? `<span class="wb-dice-result-badge has-result" title="最新掷骰：${totalStr} (${formulaStr})"><span class="wb-badge-label">[最新]</span> <b>${totalStr} (${formulaStr})</b>${latestRoll.rolls?.length ? ` <small>[${latestRoll.rolls.join(',')}]</small>` : ''}</span>`
    : '<span class="wb-dice-idle-badge">尚未掷骰</span>';

  const chips = DICE_PRESETS.map(preset =>
    `<button type="button" class="wb-dice-preset-chip" data-dice-preset="${preset}">${preset === '1d20' ? 'd20' : preset}</button>`
  ).join('');

  return `
    <section class="wb-dice-dock compact horizontal-strip" data-wb-dice-dock aria-label="战时速查掷骰坞">
      <div class="wb-dice-preset-chips" role="group" aria-label="快捷面数">
        ${chips}
      </div>

      <form class="wb-dice-form horizontal-form" data-wb-dice-form onsubmit="return false;">
        <input type="text" class="wb-dice-formula-input" data-wb-dice-formula placeholder="1d20" value="1d20" />
        <select class="wb-dice-mode-select" data-wb-dice-mode aria-label="优势劣势模式">
          <option value="normal">普通</option>
          <option value="advantage">优势</option>
          <option value="disadvantage">劣势</option>
        </select>
        <button type="button" class="wb-dice-roll-btn" data-wb-dice-roll title="执行掷骰">投</button>
        <label class="wb-dice-dark-label" title="暗投 (仅 DM 可见)">
          <input type="checkbox" data-wb-dark-roll /> 暗投
        </label>
      </form>

      ${resultBadge}

      <button type="button" class="wb-dice-complex-btn ${currentWorkspace === 'dice' ? 'active' : ''}" data-workspace="dice" title="切换到完整独立掷骰与历史页面 (100条历史、高级公式、详细骰池)">复杂掷骰与历史 ↗</button>

      <button type="button" class="wb-dice-return-btn ${currentWorkspace === 'battle' ? 'in-battle' : 'primary'}" data-workspace="battle" title="返回战斗工作台">返回战斗</button>
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
