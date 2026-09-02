export function sessionForStorage(session, clone) {
  const { events, combatProjections, combatants, encounter, ui, ...sessionFields } = session;
  const {
    tab,
    selectedId,
    message,
    messageKind,
    startupRecoveryRequired,
    ...resumableUi
  } = ui || {};
  const stored = clone({
    ...sessionFields,
    // Presentation state belongs to the versioned UiPreferences store. Only
    // resumable command drafts stay with the session for recovery safety.
    ui: resumableUi,
    events: [],
    combatProjections: [],
    combatants: [],
    encounter: encounter ? { ...encounter, members: [] } : encounter,
  });
  // Undo checkpoints are intentionally in-memory only. A full session snapshot
  // per event duplicates CharacterSheet/CombatProjection data and can exceed
  // browser storage before the DM can close a projection-backed encounter.
  stored.events = (events || []).map(event => {
    const { before, after, ...history } = event;
    return clone(history);
  });
  // A projection keeps its combat-operational fields directly. The full
  // CharacterSheet snapshot and its duplicated member copy are audit payloads
  // only; persisting both for each projected character exhausts browser quota.
  stored.combatProjections = (combatProjections || []).map(projection => {
    const { sheetSnapshot, ...persistedProjection } = projection;
    return clone(persistedProjection);
  });
  const compactMember = member => {
    const { combatProjectionSnapshot, ...persistedMember } = member;
    return clone(persistedMember);
  };
  stored.combatants = (combatants || []).map(compactMember);
  if (encounter) stored.encounter.members = (encounter.members || []).map(compactMember);
  return stored;
}
