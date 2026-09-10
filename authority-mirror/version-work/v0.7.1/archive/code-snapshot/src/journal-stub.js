/**
 * BL-030 Quick Journal (团务速记) Stub Interface & Drawer
 * EXP-UX-GEMINI-001 Candidate Decoupled Module
 * Strictly Zero Emojis
 */

export const JOURNAL_STORAGE_KEY = 'dnd-terminal.candidate.journal';

/**
 * Loads stored journal notes for the session
 */
export function loadJournalNotes(sessionId) {
  try {
    const raw = localStorage.getItem(`${JOURNAL_STORAGE_KEY}.${sessionId || 'default'}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves journal notes for the session
 */
export function saveJournalNotes(sessionId, notes) {
  try {
    localStorage.setItem(`${JOURNAL_STORAGE_KEY}.${sessionId || 'default'}`, JSON.stringify(notes || []));
  } catch {
    // Ignore storage quota errors in candidate
  }
}

/**
 * Renders Quick Journal Drawer markup
 */
export function journalDrawerMarkup(options = {}) {
  const {
    isOpen = false,
    currentRound = 1,
    notes = [],
    esc = s => String(s ?? ''),
  } = options;

  const noteList = (notes || []).map((n, i) => `
    <article class="wb-journal-card">
      <div class="wb-journal-card-header">
        <b>第 ${esc(n.round ?? '—')} 轮</b>
        <small>${esc(n.time || '')}</small>
      </div>
      <p>${esc(n.text || '')}</p>
    </article>
  `).join('') || '<p class="wb-empty-muted">暂无速记。输入文字后按回车或点击添加。</p>';

  return `
    <div class="wb-journal-overlay ${isOpen ? 'is-open' : ''}" data-journal-overlay style="${isOpen ? '' : 'display: none;'}">
      <aside class="wb-journal-drawer ${isOpen ? 'is-open' : ''}" data-wb-journal-drawer aria-label="团务速记面板">
        <div class="wb-journal-header">
          <div class="wb-journal-title-group">
            <span class="wb-journal-title">团务速记</span>
            <span class="wb-journal-badge">BL-030 · 第 ${currentRound} 轮锚点</span>
          </div>
          <button type="button" class="wb-journal-close-btn" data-journal-close data-wb-tool="journal-close" title="关闭速记抽屉">✕</button>
        </div>

        <form class="wb-journal-form" data-journal-form onsubmit="return false;">
          <textarea class="wb-journal-textarea" data-journal-input placeholder="记录当前战场突发裁定、环境变化或伏笔..."></textarea>
          <div class="wb-journal-actions">
            <small class="wb-journal-hint">保存为本次测试速记，不破坏正式事件日志</small>
            <button type="button" class="primary" data-journal-add>记录条目</button>
          </div>
        </form>

        <div class="wb-journal-feed">
          <div class="wb-journal-feed-header">
            <span>战役备忘流</span>
            <small>${notes.length} 条</small>
          </div>
          <div class="wb-journal-feed-list">
            ${noteList}
          </div>
        </div>
      </aside>
    </div>
  `;
}

/**
 * Binds events for journal drawer
 */
export function bindJournalDrawer(container, options = {}) {
  if (!container) return;

  const {
    onAddNote = null,
    onClose = null,
  } = options;

  container.querySelector('[data-journal-close]')?.addEventListener('click', () => onClose?.());
  container.querySelector('[data-journal-overlay]')?.addEventListener('click', (e) => {
    if (e.target.matches('[data-journal-overlay]')) {
      onClose?.();
    }
  });

  const input = container.querySelector('[data-journal-input]');
  const addBtn = container.querySelector('[data-journal-add]');

  const submitNote = () => {
    const text = input?.value?.trim();
    if (text) {
      onAddNote?.(text);
      if (input) input.value = '';
    }
  };

  addBtn?.addEventListener('click', submitNote);
  input?.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      submitNote();
    }
  });
}
