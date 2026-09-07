export const UI_PREFERENCES_STORAGE_KEY = 'dnd-terminal.v0.7.0.ui-preferences';
export const UI_PREFERENCES_VERSION = 1;

export const WORKSPACES = Object.freeze([
  { id: 'battle', label: '战斗', domainTab: '战斗', configurable: true, description: '轮次、行动、异常与待裁定事项' },
  { id: 'map', label: '地图', domainTab: '地图', configurable: true, description: '位置、范围、朝向与投入确认' },
  { id: 'characters', label: '角色', domainTab: '角色', configurable: true, description: '长期角色、修订、投影与战后回写' },
  { id: 'library', label: '单位库', domainTab: '单位库', configurable: false, description: '模板来源、归档、编辑与投入' },
  { id: 'log', label: '日志', domainTab: '日志', configurable: false, description: '顺序事件、补偿与 DM 修正' },
  { id: 'dice', label: '掷骰', domainTab: '掷骰', configurable: false, description: '骰式、模式、结果与最近历史' },
  { id: 'settings', label: '设置', domainTab: '设置', configurable: false, description: '会话、显示、数据安全与版本' },
]);

const states = Object.freeze({ empty: '显示明确空状态', error: '显示错误且不覆盖数据', unknown: '显示原始值与待复核原因' });
export const PANEL_REGISTRY = Object.freeze([
  { id: 'turn', workspace: 'battle', title: '行动轮', responsibility: '轮次、先攻与当前行动者', core: true, canHide: false, order: 10, width: 'full', projection: 'battle.turn', command: 'initiative/turn commands', states },
  { id: 'current-action', workspace: 'battle', title: '当前行动', responsibility: '当前单位可行动能力与强制流程', core: true, canHide: false, order: 20, width: 'standard', projection: 'battle.current', command: 'combat commands', states },
  { id: 'roster', workspace: 'battle', title: '单位态势', responsibility: '全场单位、异常与生命状态', core: false, canHide: true, order: 30, width: 'full', projection: 'battle.combatants', command: 'selection and combat commands', states },
  { id: 'recent-result', workspace: 'battle', title: '持续态势', responsibility: '轮次、行动者、异常、最近结果与待裁定事项', core: false, canHide: true, order: 5, width: 'full', projection: 'battle.recentEvents', command: 'none', states },
  { id: 'map', workspace: 'map', title: '战术地图', responsibility: '空间位置与棋子交互', core: true, canHide: false, order: 10, width: 'full', projection: 'map.combatants', command: 'map commands', states },
  { id: 'map-inspector', workspace: 'map', title: '地图 Inspector', responsibility: '选中单位的状态与来源', core: false, canHide: true, order: 20, width: 'standard', projection: 'map.selected', command: 'selection/facing commands', states },
  { id: 'range', workspace: 'map', title: '范围与投入', responsibility: '范围预览和待投入确认', core: false, canHide: true, order: 30, width: 'standard', projection: 'map.pending', command: 'range/deployment commands', states },
  { id: 'character-list', workspace: 'characters', title: '角色选择', responsibility: '角色选择、归档过滤与创建入口', core: true, canHide: false, order: 10, width: 'narrow', projection: 'characters.list', command: 'character selection', states },
  { id: 'character', workspace: 'characters', title: '当前角色', responsibility: '当前修订、可投入性与完整详情', core: true, canHide: false, order: 20, width: 'full', projection: 'characters.selected', command: 'character commands', states },
  { id: 'post-combat', workspace: 'characters', title: '战后审核', responsibility: '候选差异与逐项回写', core: false, canHide: true, order: 30, width: 'full', projection: 'characters.pendingWriteback', command: 'writeback commands', states },
  { id: 'character-import', workspace: 'characters', title: '受控 Excel 导入', responsibility: '受控文件导入草稿与确认', core: false, canHide: false, order: 40, width: 'full', projection: 'characters.importDraft', command: 'character import', states },
  { id: 'character-manual', workspace: 'characters', title: '手工创建', responsibility: '手工角色草稿与确认', core: false, canHide: false, order: 41, width: 'full', projection: 'characters.manualDraft', command: 'character creation', states },
]);

const workspaceById = id => WORKSPACES.find(workspace => workspace.id === id);
const panelById = id => PANEL_REGISTRY.find(panel => panel.id === id);
const validWidths = new Set(['narrow', 'standard', 'full']);
const characterTabs = new Set(['combat', 'proficiencies', 'actions', 'spells', 'equipment', 'story', 'linked', 'revisions']);

export function panelsForWorkspace(workspaceId, preferences = defaultUiPreferences()) {
  const normalized = normalizeUiPreferences(preferences);
  return PANEL_REGISTRY.filter(panel => panel.workspace === workspaceId)
    .map(panel => ({ ...panel, preference: normalized.panels[panel.id] }))
    .sort((left, right) => left.preference.order - right.preference.order);
}

export function defaultUiPreferences() {
  return {
    version: UI_PREFERENCES_VERSION,
    density: 'standard',
    lastWorkspace: 'battle',
    characterDetailTab: 'combat',
    showArchivedCharacters: false,
    layoutEditing: false,
    theme: 'dark',
    workbenchSubMode: 'full',
    workbenchLeftCollapsed: false,
    workbenchRightCollapsed: false,
    workbenchDiceDockOpen: false,
    workbenchZoom: 1.0,
    panels: Object.fromEntries(PANEL_REGISTRY.map(panel => [panel.id, { visible: true, width: panel.width, order: panel.order }])),
  };
}

const validThemes = new Set(['dark', 'light', 'parchment']);
const validSubModes = new Set(['full', 'combat', 'map']);

export function normalizeUiPreferences(value) {
  const defaults = defaultUiPreferences();
  const next = { ...defaults, ...(value && typeof value === 'object' ? value : {}), panels: { ...defaults.panels } };
  next.version = UI_PREFERENCES_VERSION;
  next.density = next.density === 'compact' ? 'compact' : 'standard';
  next.lastWorkspace = workspaceById(next.lastWorkspace) ? next.lastWorkspace : defaults.lastWorkspace;
  next.characterDetailTab = characterTabs.has(next.characterDetailTab) ? next.characterDetailTab : 'combat';
  next.showArchivedCharacters = next.showArchivedCharacters === true;
  next.layoutEditing = next.layoutEditing === true;
  next.theme = validThemes.has(value?.theme) ? value.theme : 'dark';
  next.workbenchSubMode = validSubModes.has(value?.workbenchSubMode) ? value.workbenchSubMode : 'full';
  next.workbenchLeftCollapsed = value?.workbenchLeftCollapsed === true;
  next.workbenchRightCollapsed = value?.workbenchRightCollapsed === true;
  next.workbenchDiceDockOpen = value?.workbenchDiceDockOpen === true;
  next.workbenchZoom = Number.isFinite(value?.workbenchZoom) && value.workbenchZoom >= 0.4 && value.workbenchZoom <= 2.5 ? value.workbenchZoom : 1.0;
  for (const workspace of WORKSPACES) {
    const panels = PANEL_REGISTRY.filter(panel => panel.workspace === workspace.id);
    const claimedOrders = new Set();
    for (const panel of panels) {
      const candidate = value?.panels?.[panel.id] || {};
      const requestedOrder = Number.isFinite(candidate.order) ? candidate.order : panel.order;
      let order = requestedOrder;
      while (claimedOrders.has(order)) order += 1;
      claimedOrders.add(order);
      next.panels[panel.id] = {
        visible: panel.core || !panel.canHide ? true : candidate.visible !== false,
        width: validWidths.has(candidate.width) ? candidate.width : panel.width,
        order,
      };
    }
  }
  return next;
}

export function loadUiPreferences(storage) {
  try {
    const raw = storage.getItem(UI_PREFERENCES_STORAGE_KEY);
    return { preferences: normalizeUiPreferences(raw ? JSON.parse(raw) : null), recovered: false };
  } catch {
    return { preferences: defaultUiPreferences(), recovered: true };
  }
}

export function saveUiPreferences(storage, preferences) {
  storage.setItem(UI_PREFERENCES_STORAGE_KEY, JSON.stringify(normalizeUiPreferences(preferences)));
}

export function workspaceFromHash(hash) {
  const id = String(hash || '').replace(/^#\/?/, '').split(/[/?#]/, 1)[0];
  return workspaceById(id)?.id || null;
}

export function workspaceForDomainTab(tab) {
  return WORKSPACES.find(workspace => workspace.domainTab === tab)?.id || 'battle';
}

export function domainTabForWorkspace(id) {
  return workspaceById(id)?.domainTab || '战斗';
}

export function updatePanelPreference(preferences, panelId, update) {
  const panel = panelById(panelId);
  if (!panel) return normalizeUiPreferences(preferences);
  const next = normalizeUiPreferences(preferences);
  next.panels[panelId] = { ...next.panels[panelId], ...update, visible: panel.core || !panel.canHide ? true : update.visible ?? next.panels[panelId].visible };
  if (!validWidths.has(next.panels[panelId].width)) next.panels[panelId].width = panel.width;
  if (!Number.isFinite(next.panels[panelId].order)) next.panels[panelId].order = panel.order;
  return normalizeUiPreferences(next);
}

export function movePanelPreference(preferences, panelId, direction) {
  const panel = panelById(panelId);
  if (!panel || ![-1, 1].includes(direction)) return normalizeUiPreferences(preferences);
  const next = normalizeUiPreferences(preferences);
  const ordered = panelsForWorkspace(panel.workspace, next);
  const index = ordered.findIndex(item => item.id === panelId);
  const swap = ordered[index + direction];
  if (!swap) return next;
  const currentOrder = next.panels[panelId].order;
  next.panels[panelId].order = next.panels[swap.id].order;
  next.panels[swap.id].order = currentOrder;
  return normalizeUiPreferences(next);
}

export function resetWorkspacePreferences(preferences, workspaceId) {
  const next = normalizeUiPreferences(preferences);
  for (const panel of PANEL_REGISTRY.filter(panel => panel.workspace === workspaceId)) next.panels[panel.id] = { visible: true, width: panel.width, order: panel.order };
  return normalizeUiPreferences(next);
}

export function resetAllUiPreferences(preferences) {
  const next = defaultUiPreferences();
  const current = normalizeUiPreferences(preferences);
  next.lastWorkspace = current.lastWorkspace;
  next.characterDetailTab = current.characterDetailTab;
  next.showArchivedCharacters = current.showArchivedCharacters;
  return next;
}

const knownLife = new Set(['active', 'alive', 'dying', 'stable', 'dead', 'transformed', 'needs-review']);
const knownPresence = new Set(['on-field', 'temporarily-away', 'reserve', 'pending', 'unknown']);
const knownParticipation = new Set(['active', 'ended', 'not-started', 'unknown']);
const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
};
const rawFacet = (value, known, fallback = 'unknown') => {
  const raw = value ?? fallback;
  return known.has(raw)
    ? { value: raw, raw, confidence: raw === 'unknown' ? 'unknown' : 'recorded', reason: raw === 'unknown' ? '来源未记录' : null }
    : { value: 'unknown', raw, confidence: 'needs-review', reason: `未识别状态：${String(raw)}` };
};

export function projectCombatantStatus(combatant, context = {}) {
  const { activeId = null, round = 0, encounterPhase = 'unknown', effects = [], pendingIds = new Set(), pendingWritebackIds = new Set() } = context;
  const life = rawFacet(combatant?.lifePhase || combatant?.lifeStatus, knownLife);
  const presence = rawFacet(combatant?.presenceStatus, knownPresence);
  const participation = rawFacet(combatant?.participationStatus, knownParticipation);
  const relatedEffects = effects.filter(effect => effect?.targetIds?.includes(combatant?.id) || (effect?.concentration && effect?.sourceCombatantId === combatant?.id));
  const pending = [];
  if (life.value === 'needs-review' || life.confidence === 'needs-review') pending.push({ kind: 'dm-review', label: '待 DM 复核' });
  if (presence.value === 'temporarily-away') pending.push({ kind: 'presence', label: '临时离场' });
  if (participation.value === 'ended') pending.push({ kind: 'participation', label: '本场结束参战' });
  if (pendingIds.has(combatant?.id)) pending.push({ kind: 'placement', label: '待摆放确认' });
  if (pendingWritebackIds.has(combatant?.id)) pending.push({ kind: 'writeback', label: '待战后回写' });
  const isCurrent = combatant?.id === activeId;
  const forcedDeathSave = isCurrent && life.value === 'dying';
  const action = forcedDeathSave ? 'death-save-only'
    : ['dead', 'transformed'].includes(life.value) || presence.value !== 'on-field' || participation.value !== 'active' ? 'blocked'
      : combatant?.actionAvailable === false ? 'spent' : 'available';
  const danger = ['dying', 'dead'].includes(life.value);
  const blocker = pending.some(item => item.kind === 'dm-review') || [life, presence, participation].some(item => item.confidence === 'needs-review');
  const priority = blocker ? 'blocking' : forcedDeathSave ? 'forced' : danger ? 'danger' : presence.value !== 'on-field' || participation.value !== 'active' ? 'presence' : isCurrent ? 'current' : relatedEffects.length ? 'effect' : 'normal';
  return freeze({
    id: combatant?.id || null,
    identity: { name: combatant?.name || '未识别单位', kind: combatant?.kind || 'unknown' },
    facets: {
      encounter: { value: combatant?.cleanupRemoved ? 'cleanup-removed' : encounterPhase, raw: encounterPhase },
      participation,
      presence,
      life: { ...life, hp: combatant?.hp ?? null, maxHp: combatant?.maxHp ?? null },
      turn: { value: isCurrent ? 'current' : combatant?.turnCompletedRound === round ? 'acted' : 'not-current', round, eligibleFromRound: combatant?.eligibleFromRound ?? null },
      action: { value: action, normal: combatant?.actionAvailable !== false, bonus: combatant?.bonusActionAvailable !== false, reaction: combatant?.reactionAvailable !== false },
      effects: { count: relatedEffects.length, items: relatedEffects.map(effect => ({ id: effect.id || null, name: effect.name || '未识别效果', sourceCombatantId: effect.sourceCombatantId || null, concentration: effect.concentration === true, startedRound: effect.startedRound ?? null, expiresRound: effect.expiresRound ?? null, expires: effect.expires || null })) },
      control: { controllerId: combatant?.controllerLink?.controllerCombatantId || combatant?.controllerId || combatant?.controlledBy || null, status: combatant?.controllerLink?.status || 'not-applicable' },
      pending: { items: pending },
      confidence: { value: blocker ? 'needs-review' : [life, presence, participation].some(item => item.confidence === 'unknown') ? 'unknown' : 'recorded', reasons: [life, presence, participation].map(item => item.reason).filter(Boolean) },
    },
    priority,
    compact: { hp: combatant?.hp == null ? 'HP 未知' : `${combatant.hp}/${combatant.maxHp ?? '—'}`, status: pending[0]?.label || (forcedDeathSave ? '仅死亡豁免' : life.value), todo: pending[0]?.label || null },
  });
}

export function projectWorkspaceStatus(session) {
  const encounterPhase = session?.encounter?.phase || 'unknown';
  const round = session?.turn?.round || 0;
  const activeId = session?.turn?.order?.[session?.turn?.index] || null;
  const combatants = Array.isArray(session?.combatants) ? session.combatants : [];
  const effects = Array.isArray(session?.effects) ? session.effects : [];
  const pendingIds = new Set((session?.ui?.entryPlacement?.items || []).map(item => item?.combatant?.id).filter(Boolean));
  const pendingWritebackIds = new Set((session?.postCombatDiffs || []).filter(item => !['applied', 'abandoned'].includes(item?.status)).map(item => item?.combatantId).filter(Boolean));
  const projected = combatants.map(combatant => projectCombatantStatus(combatant, { activeId, round, encounterPhase, effects, pendingIds, pendingWritebackIds }));
  const byId = Object.fromEntries(projected.map(item => [item.id, item]));
  const recentEvents = [...(session?.events || [])].slice(-5).reverse().map(event => ({ id: event.id || null, sequence: event.sequence ?? null, type: event.type || 'unknown', round: event.round ?? null, occurredAt: event.occurredAt || null, manualCorrection: event.manualCorrection === true, undoOfEventId: event.undoOfEventId || null }));
  const blockers = projected.filter(item => item.priority === 'blocking');
  const decisions = projected.filter(item => item.facets.pending.items.length).flatMap(item => item.facets.pending.items.map(pending => ({ combatantId: item.id, combatantName: item.identity.name, ...pending })));
  return freeze({
    encounter: { phase: encounterPhase, round, activeId, started: session?.turn?.started === true },
    blockers,
    urgent: projected.filter(item => ['blocking', 'forced', 'danger', 'current'].includes(item.priority)),
    decisions,
    recentEvents,
    combatants: projected,
    byId,
    workspaces: {
      battle: { current: byId[activeId] || null, combatants: projected, blockers, decisions, recentEvents },
      map: { combatants: projected.filter(item => item.facets.presence.value === 'on-field'), blockers, decisions },
      characters: { combatants: projected.filter(item => item.identity.kind === 'character'), blockers, decisions },
      log: { combatants: projected, recentEvents, blockers, decisions },
    },
  });
}
