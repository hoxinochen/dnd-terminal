/**
 * Token Semantic Recognition Renderer
 * EXP-UX-GEMINI-001 Candidate Decoupled Module
 * Strictly Zero Emojis
 */

/**
 * Computes semantic CSS classes and tactical role badge for a combatant token
 */
export function getTokenClassification(combatant) {
  if (!combatant) return { typeClass: 'token-unknown', roleBadge: '', isControlled: false };

  const kind = combatant.kind || 'monster';
  const relation = combatant.relation || 'enemy';
  const isControlled = Boolean(
    combatant.controlledBy ||
    combatant.isControlledEntity ||
    combatant.associationKind === 'controlled' ||
    combatant.templateSnapshot?.sourceType === 'controlled'
  );

  let typeClass = 'token-monster';
  let roleBadge = '';

  if (kind === 'character') {
    typeClass = 'token-pc';
    roleBadge = 'PC';
  } else if (kind === 'npc') {
    typeClass = 'token-npc';
    roleBadge = combatant.displayRole || 'NPC';
  } else {
    typeClass = relation === 'enemy' ? 'token-enemy' : relation === 'ally' ? 'token-ally' : 'token-neutral';
    roleBadge = '◆'; // Geometric diamond marker for monsters/NPCs
  }

  if (isControlled) {
    typeClass += ' token-controlled';
  }

  return { typeClass, roleBadge, isControlled };
}

/**
 * Generates token HTML markup with semantic classes, size and badges
 */
export function renderSemanticToken(combatant, options = {}) {
  const {
    isActive = false,
    isSelected = false,
    isDead = false,
    isPending = false,
    esc = s => String(s ?? ''),
  } = options;

  if (!combatant) return '';

  const { typeClass, roleBadge, isControlled } = getTokenClassification(combatant);
  const widthCells = combatant.footprint?.widthCells || 1;
  const heightCells = combatant.footprint?.heightCells || 1;
  const isLarge = widthCells > 1 || heightCells > 1;

  const shortName = (combatant.shortLabel || combatant.name || '?').slice(0, 2);

  const classes = [
    'token',
    'wb-token',
    typeClass,
    `relation-${combatant.relation || 'enemy'}`,
    isActive ? 'token-active active' : '',
    isSelected ? 'token-selected selected' : '',
    isDead ? 'token-dead dead' : '',
    isPending ? 'token-pending pending' : '',
    isLarge ? 'token-large' : '',
  ].filter(Boolean).join(' ');

  return `
    <div class="${classes}"
         data-token="${esc(combatant.id)}"
         data-token-kind="${esc(combatant.kind || 'monster')}"
         data-token-relation="${esc(combatant.relation || 'enemy')}"
         data-token-controlled="${isControlled ? 'true' : 'false'}"
         tabindex="0"
         role="button"
         aria-label="${esc(combatant.name)} (${esc(combatant.kind)})"
         style="--token-w: ${widthCells}; --token-h: ${heightCells};">
      <span class="token-name">${esc(shortName)}</span>
      ${roleBadge ? `<span class="token-badge" aria-hidden="true">${esc(roleBadge)}</span>` : ''}
    </div>
  `;
}
