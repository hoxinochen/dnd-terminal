import { coveredCellsForRange } from './geometry.js';
import { createEncounterMember, materializeCombatant, normalizeV020Lifecycle, finalizeCombatSession, referenceTemplateSeeds, legacyCharacterPresets, legacyNpcPresets, footprintFits, footprintsOverlap, firstFreeFootprintPosition, combatantCanAct, nextEligibleTurn, clearTemporaryCombatState, declareCombatantDead, normalizeInitiativeModifier, resolveInitiative } from './encounter.js?v=20260825-3';
import { abandonPostCombatDiff, applyCombatInventoryBalanceChange, applyCombatResourceChange, applyCombatSpellResourceChange, applyPostCombatDecisions, archiveCharacterRecord, buildPostCombatDiff, canPermanentlyDeleteCharacterRecord, createCharacterRecord, createCharacterSheet, createCombatProjection, createEncounterMemberFromProjection, createIndependentSuccessorRecord, createLinkedEntityProjection, currentCharacterSheet, diffCharacterRevisions, M1_S5_RULES, M1_S5_WEAPON_MASTERY_CATALOG, normalizeCharacterRecord, recordControlledEntityRenewalRequested, restoreCharacterRecord, reviseCharacterRecord, reviseWeaponMasterySelections, settleControlledEntitiesAfterLongRest, S2_SUCCESSOR_INHERITANCE_GROUPS, weaponMasteryEligibleAttacks } from './characters.js?v=20260828-1';
import { BEILING_PROFILE, parseBeilingXlsxFile } from './character-import.js';
import { sessionForStorage } from './session-persistence.js?v=20260821-7';
import { V040_RULE_REFERENCES, applyPcDamage, correctPcLifeState, hasCondition, healPc, medicallyStabilizePc, pcLifePhase, recordDeathSave, standPcUp, turnDisposition } from './life-cycle-v040.js?v=20260825-3';
import { returnPcToLife } from './life-cycle-v050.js?v=20260828-1';
import { V060_GENTLE_REPOSE, V060_RULING_MODES, spellForV060, spellsForV060 } from './life-cycle-v060.js?v=20260831-2';
import { V070_DELIVERY_VERSION, V070_SESSION_SCHEMA_VERSION, V070_STORAGE_KEY, chooseV070StartupSession, createV070Envelope, normalizeV070Session, validateV070Envelope } from './life-cycle-v070.js?v=20260901-1';
import { PANEL_REGISTRY, WORKSPACES, domainTabForWorkspace, loadUiPreferences, movePanelPreference, panelsForWorkspace, projectWorkspaceStatus, resetAllUiPreferences, resetWorkspacePreferences, saveUiPreferences, updatePanelPreference, workspaceForDomainTab, workspaceFromHash } from './workbench-v070.js?v=20260901-2';
import { parseDiceFormula, parseDiceShortcut, rollDiceFormula } from './dice.js?v=20260902-1';
import { battleWorkbenchMarkup, bindBattleWorkbenchInteractions } from './battle-workbench.js';

const SESSION_ENVELOPE_SCHEMA_VERSION = V070_SESSION_SCHEMA_VERSION;
const DELIVERY_VERSION = V070_DELIVERY_VERSION;
const STORAGE_KEY = V070_STORAGE_KEY;
const TEMPLATE_STORAGE_KEY = 'dnd-terminal.v0.2.0.templates';
const CHARACTER_STORAGE_KEY = 'dnd-terminal.v0.3.0-m1-s5.character-records';
const LEGACY_CHARACTER_STORAGE_KEY = 'dnd-terminal.v0.3.0.character-records';
// This narrow table is the admitted 2024 weapon-table evidence used only after
// the DM explicitly selects the matching imported weapon in the confirmation UI.
const ADMITTED_WEAPON_MASTERY = M1_S5_WEAPON_MASTERY_CATALOG;
const TABS = ['战斗', '地图', '角色', '单位库', '日志', '掷骰', '设置'];
// 局域网 HTTP 触控测试不是安全上下文：Safari 可能不暴露 crypto.randomUUID / structuredClone。
// 此回退只生成本地会话 ID，不承担安全令牌或多人身份认证职责。
const uid = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
const clone = value => globalThis.structuredClone ? globalThis.structuredClone(value) : JSON.parse(JSON.stringify(value));
const now = () => new Date().toISOString();

const templates = [
  { id:'goblin-warrior', name:'地精武者', kind:'monster', relation:'enemy', maxHp:14, speed:30, footprint:[1,1], initiative:2, resources:{'附赠动作':1}, sourceEntryId:'urn:uuid:59e8ff3d-cddd-5452-ae67-1181b18beed8', note:'MM 2025 验证模板；可创建多个独立实例。' },
  { id:'fire-giant', name:'火巨人', kind:'monster', relation:'enemy', maxHp:162, speed:30, footprint:[3,3], initiative:0, resources:{}, referenceActions:[{name:'火焰之剑',category:'action'},{name:'投掷炎锤',category:'action'}], sourceEntryId:'urn:uuid:89061a89-389d-5eb3-ac14-e3c539feeba5', note:'MM 2025 本地 Entry 已核对：巨型 3×3；动作名称仅供核对，不是次数资源。' },
  { id:'beholder', name:'眼魔', kind:'monster', relation:'enemy', maxHp:190, speed:40, footprint:[2,2], initiative:2, elevation:0, resources:{}, referenceActions:[{name:'眼波射线',category:'action'},{name:'反魔法锥域',category:'bonus'},{name:'切齿',category:'legendary'},{name:'怒视',category:'legendary'}], legendaryActionMax:3, sourceEntryId:'urn:uuid:5752e02e-5174-5805-bf1a-e96a3f8a6f23', note:'MM 2025 本地 Entry 已核对：大型 2×2；二维移动采用飞行 40 尺投影。眼波射线不是次数资源；传奇动作默认 3 次。' },
  { id:'scout', name:'斥候', kind:'npc', relation:'ally', maxHp:16, speed:30, footprint:[1,1], initiative:2, resources:{'多重攻击':1}, sourceEntryId:'urn:uuid:3d41b593-6297-5a65-9c47-18d9e34e768c', note:'友方 NPC。' },
  { id:'priest', name:'祭司', kind:'npc', relation:'ally', maxHp:27, speed:25, footprint:[1,1], initiative:0, resources:{'治疗祷言':2}, sourceEntryId:'urn:uuid:6de197a8-985f-51ad-bca0-10908e6b15b0', note:'友方 NPC；效果与专注由 DM 确认。' },
  { id:'mage', name:'魔法师', kind:'npc', relation:'neutral', maxHp:40, speed:30, footprint:[1,1], initiative:2, resources:{'法术次数':3,'反应':1}, sourceEntryId:'urn:uuid:6bd7fbe8-f5cd-50ce-a8f9-bad87a385644', note:'中立 NPC；不是玩家法术位。' },
  { id:'pc-monk', name:'15级散打武者', kind:'character', relation:'ally', maxHp:112, speed:55, footprint:[1,1], initiative:4, resources:{'功力':15}, slots:{}, sourceEntryId:'urn:uuid:5c3f3b49-bb2e-5c54-bb97-560f185396a6', note:'本地私有验证角色；具体能力合法性由 DM 裁定。' },
  { id:'pc-wizard', name:'15级塑能师', kind:'character', relation:'ally', maxHp:77, speed:30, footprint:[1,1], initiative:2, resources:{}, slots:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1}, sourceEntryId:'urn:uuid:340db2c0-1bca-56a5-ab30-90c81437becd', note:'本地私有验证角色；19 个准备法术不在此自动判定。' },
];

function emptySession() {
  return { schemaVersion:SESSION_ENVELOPE_SCHEMA_VERSION, sessionId:uid(), name:'未命名遭遇', createdAt:now(), updatedAt:now(),
    settings:{ width:24, height:18, cellFeet:5, diagonalRule:'five-feet', visibleTabs:TABS, darkRolls:true, mapMode:'fit' },
    characters:[], combatProjections:[], linkedEntityProjections:[], controlledEntityProjections:[], postCombatDiffs:[], masteryCandidates:[], combatants:[], turn:{round:0, index:-1, order:[], started:false}, effects:[], events:[], snapshotSequence:0,
    encounter:{ id:uid(), phase:'preparation', members:[], preparationSnapshot:null, confirmedAt:null, migratedFrom:null },
    ui:{ selectedId:null, range:null, message:'已创建空白战斗会话。', startupRecoveryRequired:false } };
}
function ensureM1S5State(){
  if(!Array.isArray(state.masteryCandidates))state.masteryCandidates=[];
  if(!Array.isArray(state.linkedEntityProjections))state.linkedEntityProjections=[];
  if(!Array.isArray(state.controlledEntityProjections))state.controlledEntityProjections=[];
  state.combatants?.forEach(combatant=>{if(!Number.isInteger(combatant.turnsStarted))combatant.turnsStarted=0;});
}
let storageBlocked = false;
const startup = load();
let state = normalizeV070Session(startup.session || emptySession());
if (startup.error) {
  storageBlocked = true;
  state.ui.startupRecoveryRequired = true;
  state.ui.messageKind = 'error';
  state.ui.message = `启动恢复已阻断：${startup.error.message} 原始存储值保持不变；请在“日志”中导入有效 JSON，或明确选择新建空会话。`;
} else if (startup.kind === 'migrated-legacy-copy') {
  state.ui.message = `已从只读旧会话副本迁移到 Session Schema ${SESSION_ENVELOPE_SCHEMA_VERSION}；旧存储键 ${startup.sourceKey} 未修改。`;
}
const loadedUiPreferences = loadUiPreferences(localStorage);
let uiPreferences = loadedUiPreferences.preferences;
const routedWorkspace = workspaceFromHash(globalThis.location?.hash);
let activeWorkspaceId = routedWorkspace || uiPreferences.lastWorkspace || 'battle';
if (loadedUiPreferences.recovered && !state.ui.message) state.ui.message = '工作台布局偏好已损坏并恢复为默认值；战斗会话未受影响。';
ensureM1S5State();
state.combatants.forEach(ensureFacing);
state.encounter?.members?.forEach(ensureFacing);
ensureDisplayOrdinals(state.combatants);
ensureDisplayOrdinals(state.encounter?.members || []);
let templateLibrary = loadTemplateLibrary();
templateLibrary=templateLibrary.map(template=>template.colorMode?template:{...template,colorMode:template.color?'custom':'relation'});
let characterRecords = loadCharacterRecords();
let selectedCharacterId = characterRecords[0]?.characterId || null;
let characterEditorId = null;
let masteryEditorCharacterId = null;
let characterImportDraft = null;
let characterCreateMode = null;
let characterCreatePendingMode = null;
let characterCreateDiscardMode = null;
let characterManualDraft = null;
let fixtureLoadConfirmation = false;
let characterDetailTab = uiPreferences.characterDetailTab;
let showArchivedCharacters = uiPreferences.showArchivedCharacters;
let templateEditorId = null;
let templateEditorNew = false;
let mapGesture = null;
let deathOutcomeChoice = null;
let s2PlacementDraft = null;
let renderedStatusProjection = null;

function load() { const result=chooseV070StartupSession(localStorage,uid,now);return result.session?result:{...result,session:null,error:result.error||null}; }
function serializedKilobytes(text){const bytes=globalThis.TextEncoder?new TextEncoder().encode(text).length:text.length*2;return Math.max(1,Math.ceil(bytes/1024));}
function persist() {
  if(storageBlocked){state.ui.messageKind='error';state.ui.message='当前新会话存储已阻断；原始值未覆盖。请导入有效 JSON，或明确新建空会话。';return false;}
  state.updatedAt=now();
  let serialized='',phase='压缩会话';
  try { const stored=sessionForStorage(state,clone);phase='序列化会话';serialized=JSON.stringify(createV070Envelope(stored,{exportedAt:now()}));phase='写入浏览器存储';localStorage.setItem(STORAGE_KEY,serialized); return true; }
  catch(error) { const detail=`${error?.name||'Error'}${error?.message?`：${error.message}`:''}`;if(phase==='写入浏览器存储'&&error?.name==='QuotaExceededError'){state.ui.message=`浏览器存储空间不足；本次压缩会话约 ${serializedKilobytes(serialized)} KB。当前战斗仍保留在本页内存，请先导出；刷新会回到最后一次成功保存的状态。`;}else state.ui.message=`战斗保存失败（${phase}）：${detail}。当前战斗仍保留在本页内存，请先导出，不要刷新。`;state.ui.messageKind='error'; console.error(error); return false; }
}
if(startup.shouldPersist&&!storageBlocked)persist();
function validateEnvelope(data) { return validateV070Envelope(data, uid, now); }
function persistUiPreferences() { try { saveUiPreferences(localStorage,uiPreferences); return true; } catch { state.ui.message='工作台布局偏好保存失败；战斗会话未受影响。'; state.ui.messageKind='warn'; return false; } }
function isLegacyCharacterPreset(template){return legacyCharacterPresets.some(preset=>preset.id===template?.id);}
function loadTemplateLibrary(){const seeds=[...referenceTemplateSeeds,...legacyNpcPresets];try{const raw=localStorage.getItem(TEMPLATE_STORAGE_KEY),stored=raw?JSON.parse(raw):[];if(!Array.isArray(stored))return clone(seeds);const storedById=new Map(stored.map(template=>[template.id,template]));const mergedSeeds=seeds.map(seed=>{const saved=storedById.get(seed.id);if(!saved)return clone(seed);const merged={...clone(seed),...saved};if(seed.sourceType==='reference'){merged.referenceActions=clone(seed.referenceActions||[]);merged.traits=clone(seed.traits||[]);merged.resourceDetails={...(saved.resourceDetails||{}),...(clone(seed.resourceDetails||{}))};merged.resourceSources={...(saved.resourceSources||{}),...(clone(seed.resourceSources||{}))};}return merged;});const extras=stored.filter(template=>!seeds.some(seed=>seed.id===template.id)&&!isLegacyCharacterPreset(template)).map(template=>{const admitted=referenceTemplateSeeds.find(seed=>seed.sourceEntryId&&seed.sourceEntryId===template.sourceEntryId);return admitted?{...template,referenceActions:clone(admitted.referenceActions||[]),traits:clone(admitted.traits||[]),resourceDetails:{...(template.resourceDetails||{}),...(clone(admitted.resourceDetails||{}))},resourceSources:{...(template.resourceSources||{}),...(clone(admitted.resourceSources||{}))}}:template;});return [...mergedSeeds,...extras];}catch{return clone(seeds);}}
function persistTemplateLibrary(){localStorage.setItem(TEMPLATE_STORAGE_KEY,JSON.stringify(templateLibrary));}
function loadCharacterRecords(){try{const parsed=JSON.parse(localStorage.getItem(CHARACTER_STORAGE_KEY)||localStorage.getItem(LEGACY_CHARACTER_STORAGE_KEY)||'[]');return Array.isArray(parsed)?parsed.filter(record=>record?.characterId&&Number.isInteger(record.currentRevision)&&Array.isArray(record.revisions)).map(normalizeCharacterRecord):[];}catch{return [];}}
function persistCharacterRecords(records=characterRecords){localStorage.setItem(CHARACTER_STORAGE_KEY,JSON.stringify(records));}
function roster(){return state.encounter?.phase==='preparation'?(state.encounter.members||[]):state.combatants;}
function isDead(c){return isPc(c)?pcLifePhase(c)==='dead':c?.lifeStatus==='dead';}
function isTransformed(c){return c?.lifeStatus==='transformed';}
function isPc(c){return c?.kind==='character';}
function ordinaryActionsAllowed(c){return !!c&&turnDisposition(c,state.turn.round)==='act';}
function deathSaveRequired(c){return !!c&&turnDisposition(c,state.turn.round)==='death-save';}
function lifeStatusLabel(c){const value=isPc(c)?pcLifePhase(c):c?.lifeStatus;return ({active:'正常',dying:'濒死',stable:'稳定',dead:'死亡',transformed:'已转化','needs-review':'待 DM 复核'}[value]||value||'未知');}
function conditionLabel(condition){return ({unconscious:'昏迷',prone:'倒地'}[condition]||condition);}
function revivalFieldLabel(value,labels){return labels[value]||value||'未标注';}
function revivalSummaryMarkup(resolution){if(!resolution||resolution.type!=='pc-return-to-life')return '';const basis=revivalFieldLabel(resolution.basisStatus,{'verified-entry':'已核验条目','dm-ruling':'DM 明确裁定',unverified:'待核验记录'}),soul=revivalFieldLabel(resolution.soulReturn,{confirmed:'已确认返回','not-applicable':'不适用'}),conditions=revivalFieldLabel(resolution.conditionHandling,{preserve:'保留（仅移除 unconscious）',clear:'清空全部条件'}),map=revivalFieldLabel(resolution.mapOutcome,{'restore-original-token':'保留棋子并恢复原实例'}),initiative=revivalFieldLabel(resolution.initiativeOutcome,{'restore-original-slot':'恢复原先攻槽位；已越过则下一轮'});return `<details class="pc-revival-summary" open><summary>最近复活记录 · 第 ${esc(resolution.round??'—')} 轮</summary><dl><dt>依据</dt><dd>${esc(basis)} / ${esc(resolution.basisLabel||'未标注')}</dd><dt>灵魂</dt><dd>${esc(soul)}</dd><dt>复活后 HP</dt><dd>${esc(resolution.hp??'—')}</dd><dt>状态处理</dt><dd>${esc(conditions)}；${esc(resolution.effectDisposition||'未标注')}</dd><dt>地图 / 尸体</dt><dd>${esc(map)}</dd><dt>先攻</dt><dd>${esc(initiative)}</dd><dt>DM 原因</dt><dd>${esc(resolution.reason||'未标注')}</dd><dt>Resolution / Event ID</dt><dd><code>${esc(resolution.resolutionId||'未标注')}</code></dd></dl></details>`;}
function onFieldTokens(excludedIds=[]){return state.combatants.filter(c=>c.presenceStatus==='on-field'&&c.participationStatus==='active'&&!c.cleanupRemoved&&c.corpseTokenVisible!==false&&!excludedIds.includes(c.id));}
function onFieldCombatants(){return onFieldTokens().filter(c=>!isDead(c));}
function mapTokenOccupants(excludedIds=[]){return onFieldTokens(excludedIds);}
function entryPlacementItems(){return state.ui.entryPlacement?.items||[];}
function placementCombatant(item){return item?.kind==='reentry'?{...item.combatant,position:clone(item.position)}:item?.combatant;}
function pendingPlacementCombatants(){return entryPlacementItems().map(placementCombatant).filter(Boolean);}
function labelPool(){return [...roster(),...entryPlacementItems().filter(item=>item.kind!=='reentry').map(item=>item.combatant).filter(c=>!roster().some(other=>other.id===c.id))];}
function ensureDisplayOrdinals(items){
  const byName=new Map();
  items.forEach(item=>{const group=byName.get(item.name)||[];group.push(item);byName.set(item.name,group);});
  byName.forEach(group=>{
    let next=1;
    group.forEach(item=>{if(Number.isInteger(item.displayOrdinal)&&item.displayOrdinal>0)next=Math.max(next,item.displayOrdinal+1);});
    group.forEach(item=>{if(!Number.isInteger(item.displayOrdinal)||item.displayOrdinal<1)item.displayOrdinal=next++;});
  });
}
function nextDisplayOrdinal(name, items){return Math.max(0,...items.filter(item=>item.name===name).map(item=>item.displayOrdinal||0))+1;}
function displayName(c){
  if(!c)return '—';
  const same=labelPool().filter(other=>other.name===c.name);
  return same.length>1?`${c.name} ${c.displayOrdinal||1}`:c.name;
}
function placementCandidates(exceptId=null){return onFieldCombatants().filter(c=>c.id!==exceptId);}
function placementPlan(c,to,candidates=placementCandidates(c.id)){
  const probe={...c,position:to};
  const fits=footprintFits(to,c.footprint,state.settings);
  const overlapWith=candidates.find(other=>footprintsOverlap(probe,other));
  return {fits,overlapWith,valid:fits&&!overlapWith,reasons:[!fits?'整块占位超出地图边界':null,overlapWith?`与 ${displayName(overlapWith)} 的占位重叠`:null].filter(Boolean)};
}
function isTurnEligible(c){return combatantCanAct(c,state.turn.round);}
function checkpoint() {
  const copy=clone(state);
  copy.events=[];
  copy.snapshotSequence=state.snapshotSequence;
  copy.ui={selectedId:state.ui.selectedId,range:null,message:null};
  return copy;
}
function combatEnded(){return state.encounter?.phase==='ended';}
function active() { const c=state.combatants.find(c=>c.id===state.turn.order[state.turn.index]); return state.encounter?.phase==='preparation'||combatEnded()||!isTurnEligible(c)?null:c; }
function getCombatant(id) { return roster().find(c=>c.id===id); }
function defaultFacingPort(c, facing=c.facing||'north'){const w=c.footprint.widthCells,h=c.footprint.heightCells,mid=n=>n%2?Math.floor(n/2):null;if(facing==='north')return {x:mid(w)??w-1,y:0};if(facing==='east')return {x:w-1,y:mid(h)??h-1};if(facing==='south')return {x:mid(w)??0,y:h-1};return {x:0,y:mid(h)??0};}
function ensureFacing(c){if(!c)return;c.facing=c.facing||'north';const p=c.facingPort;if(!p||p.x<0||p.y<0||p.x>=c.footprint.widthCells||p.y>=c.footprint.heightCells)c.facingPort=defaultFacingPort(c,c.facing);}
function frontPortCells(c){ensureFacing(c);const out=[],w=c.footprint.widthCells,h=c.footprint.heightCells;if(c.facing==='north')for(let x=0;x<w;x++)out.push({x,y:0});if(c.facing==='east')for(let y=0;y<h;y++)out.push({x:w-1,y});if(c.facing==='south')for(let x=0;x<w;x++)out.push({x,y:h-1});if(c.facing==='west')for(let y=0;y<h;y++)out.push({x:0,y});return out;}
function facingOrigin(c){ensureFacing(c);return {x:c.position.x+c.facingPort.x,y:c.position.y+c.facingPort.y};}
function canAdjustFacing(c){return !combatEnded()&&(state.encounter?.phase==='preparation'||ordinaryActionsAllowed(c))&&(!state.turn.started||active()?.id===c?.id);}
function syncFacingRange(c){const r=state.ui.range;if(r?.originMode==='caster-facing-port'&&active()?.id===c.id)r.origin=facingOrigin(c);}
function setFacingDraft(id,facing){const c=getCombatant(id);if(!c||!canAdjustFacing(c))return message('只有当前行动者可调整朝向；例外请使用 DM 修正。','warn');c.facing=facing;c.facingPort=defaultFacingPort(c,facing);syncFacingRange(c);persist();render();}
function setFacingPortDraft(id,x,y){const c=getCombatant(id);if(!c||!canAdjustFacing(c))return message('只有当前行动者可调整发射口。','warn');if(!frontPortCells(c).some(p=>p.x===x&&p.y===y))return;c.facingPort={x,y};syncFacingRange(c);persist();render();}
function correctFacing(id,facing){if(combatEnded())return message('本场战斗已结束，地图状态只读。','warn');const c=getCombatant(id);if(!c)return;command('combatant.facing.corrected',{id,facing},()=>{c.facing=facing;c.facingPort=defaultFacingPort(c,facing);},{manual:true,reason:'DM 强制修正朝向'});}
function emit(type, payload={}, options={}) {
  const event={ id:options.eventId||uid(), sequence:state.events.length+1, type, occurredAt:now(), round:state.turn.round, turn:state.turn.index+1,
    activeCombatantId:active()?.id||null, source:{kind:options.manual?'dm-manual':'ui',actorId:options.actorId||null}, payload:clone(payload),
    before:options.before?clone(options.before):undefined, after:options.after?clone(options.after):undefined, reason:options.reason||null,
    rulesReference:options.rulesReference||[], undoOfEventId:options.undoOfEventId||null, manualCorrection:!!options.manual };
  state.events.push(event); state.snapshotSequence=event.sequence; return event;
}
function command(type, payload, apply, options={}) { const before=checkpoint(); apply(); emit(type,payload,{...options,before,after:undefined}); persist(); render(); }
function recordNonReversibleEvent(type, payload, options={}) { emit(type,payload,options); persist(); render(); }
function message(text, kind='') { state.ui.message=text; state.ui.messageKind=kind; persist(); render(); }
function addCombatant(template, position={x:0,y:0}) {
  command('combatant.created',{templateId:template.id,position},()=>{
    const c={ id:uid(), templateId:template.id, templateRevision:1, templateSnapshot:clone(template), name:template.name, kind:template.kind, relation:template.relation,
      hp:template.maxHp, maxHp:template.maxHp, tempHp:0, speed:template.speed, movementRemaining:template.speed, actionAvailable:true, bonusActionAvailable:true, reactionAvailable:true,
      resources:clone(template.resources||{}), resourceMax:clone(template.resources||{}), slots:clone(template.slots||{}), slotsMax:clone(template.slots||{}), legendaryActions:template.legendaryActionMax||0, legendaryActionMax:template.legendaryActionMax||0, conditions:[],
      position:{...position}, footprint:{widthCells:template.footprint[0],heightCells:template.footprint[1]}, facing:'north', facingPort:null, elevationFeet:template.elevation||0, initiativeModifier:normalizeInitiativeModifier(template.initiativeModifier,template.initiative), initiative:null, initiativeRoll:null, initiativeMode:'unconfigured', initiativeGroupId:null, presenceStatus:'on-field', participationStatus:'active', ...(template.kind==='character'?{lifePhase:'active'}:{lifeStatus:'alive'}), deathRecord:null, transformationOrigin:null, eligibleFromRound:1, cleanupRemoved:false }; ensureFacing(c);
    state.combatants.push(c); if(c.kind==='character') state.characters.push({id:uid(),combatantId:c.id,name:c.name, baseline:{hp:c.hp,resources:clone(c.resources),slots:clone(c.slots)}});
  },{rulesReference:['local-rules-baseline:instance-isolation']});
}
function templateById(id){return templateLibrary.find(template=>template.id===id);}
function encounterTemplateById(id){return templateById(id)||legacyCharacterPresets.find(template=>template.id===id);}
const RELATION_COLORS={enemy:'#cf6370',ally:'#67b999',neutral:'#8e9ae5'};
const CONTROLLED_ASSOCIATED_TOKEN_COLOR='#c69bf7';
function relationColor(relation){return RELATION_COLORS[relation]||'#65748a';}
function templateColor(template){return template?.colorMode==='custom'&&template.color?template.color:relationColor(template?.relation);}
function defaultCustomTemplate(){return {id:uid(),revision:1,sourceType:'custom',archived:false,name:'新单位',shortLabel:'',kind:'monster',relation:'enemy',alignment:'',size:'中型',armorClass:10,maxHp:1,speed:30,initiativeModifier:0,footprint:[1,1],actions:[],traits:[],resources:{},resourceDetails:{},note:'',color:relationColor('enemy'),colorMode:'relation',sourceEntryId:null,sourcePath:null,sourceStatus:'dm-authored'};}
function parseResources(value){return String(value||'').split(/[，,;；\n]/).map(part=>part.trim()).filter(Boolean).reduce((out,part)=>{const [name,amount]=part.split(/[:：]/).map(text=>text.trim());if(name)out[name]=Math.max(0,Math.floor(Number(amount)||0));return out;},{});}
function actionDetail(action){return String(action?.description||action?.detail||'').trim();}
function referenceActionNames(template){return new Set((template?.referenceActions||[]).map(action=>action.name));}
function customActionsFor(template){const names=referenceActionNames(template);return (template?.actions||[]).filter(action=>!names.has(typeof action==='string'?action:action.name));}
function referenceResourceNames(template){return new Set(Object.entries(template?.resourceSources||{}).filter(([,source])=>source==='reference').map(([name])=>name));}
function customResourcesFor(template){const names=referenceResourceNames(template),resources={};Object.entries(template?.resources||{}).forEach(([name,amount])=>{if(!names.has(name))resources[name]=amount;});return resources;}
function parseActionDefinitions(value){return String(value||'').split(/[，,;；\n]/).map(part=>part.trim()).filter(Boolean).map(part=>{const [name,...rest]=part.split('|').map(text=>text.trim());return {name,category:'action',description:rest.join(' | ')};}).filter(action=>action.name);}
function serializeActionDefinitions(actions){return (actions||[]).map(action=>{const normalized=typeof action==='string'?{name:action}:action;const detail=actionDetail(normalized);return detail?`${normalized.name} | ${detail}`:normalized.name;}).join('\n');}
function parseResourceDefinitions(value){const resources={},resourceDetails={};String(value||'').split(/[，,;；\n]/).map(part=>part.trim()).filter(Boolean).forEach(part=>{const pieces=part.split('|').map(text=>text.trim());let name='',amount='',description='';if(pieces.length>1){const [parsedName,parsedAmount,...rest]=pieces;name=parsedName;amount=parsedAmount;description=rest.join(' | ');}else [name,amount]=part.split(/[:：]/).map(text=>text.trim());if(!name)return;resources[name]=Math.max(0,Math.floor(Number(amount)||0));if(description)resourceDetails[name]=description;});return {resources,resourceDetails};}
function serializeResourceDefinitions(resources,details={}){return Object.entries(resources||{}).map(([name,amount])=>details?.[name]?`${name} | ${amount} | ${details[name]}`:`${name} | ${amount}`).join('\n');}
function resourcePurpose(combatant,name){const admitted=referenceTemplateSeeds.find(template=>template.sourceEntryId&&template.sourceEntryId===combatant?.templateSnapshot?.sourceEntryId);return combatant?.templateSnapshot?.resourceDetails?.[name]||admitted?.resourceDetails?.[name]||combatant?.resourceDetails?.[name]||'用途未标注，请由 DM 补充。';}
function saveTemplate(form){const values=new FormData(form),existing=templateEditorId?templateById(templateEditorId):null;const template=existing?clone(existing):defaultCustomTemplate(),customActionDefinitions=parseActionDefinitions(values.get('actions')),customResourceDefinition=parseResourceDefinitions(values.get('resources')),ruleActionNames=referenceActionNames(template),ruleResourceNames=referenceResourceNames(template),ruleActions=(template.actions||[]).filter(action=>ruleActionNames.has(typeof action==='string'?action:action.name)),ruleResources={},ruleResourceDetails={};ruleResourceNames.forEach(name=>{if(Object.hasOwn(template.resources||{},name))ruleResources[name]=template.resources[name];if(template.resourceDetails?.[name])ruleResourceDetails[name]=template.resourceDetails[name];});template.name=String(values.get('name')||'新单位').trim()||'新单位';template.shortLabel=String(values.get('shortLabel')||'').trim();template.kind=values.get('kind')==='npc'?'npc':'monster';template.relation=values.get('relation')||'enemy';template.alignment=String(values.get('alignment')||'').trim();template.size=String(values.get('size')||'中型').trim();template.armorClass=Math.max(0,Math.floor(Number(values.get('armorClass'))||0));template.maxHp=Math.max(1,Math.floor(Number(values.get('maxHp'))||1));template.speed=Math.max(0,Math.floor(Number(values.get('speed'))||0));template.initiativeModifier=normalizeInitiativeModifier(values.get('initiativeModifier'));template.footprint=[Math.max(1,Math.floor(Number(values.get('footprintW'))||1)),Math.max(1,Math.floor(Number(values.get('footprintH'))||1))];template.actions=[...ruleActions,...customActionDefinitions];template.resources={...ruleResources,...customResourceDefinition.resources};template.resourceDetails={...ruleResourceDetails,...customResourceDefinition.resourceDetails};template.resourceSources={...Object.fromEntries([...ruleResourceNames].map(name=>[name,'reference'])),...Object.fromEntries(Object.keys(customResourceDefinition.resources).map(name=>[name,'custom']))};template.note=String(values.get('note')||'').trim();template.colorMode=values.get('colorMode')==='custom'?'custom':'relation';template.color=template.colorMode==='custom'?String(values.get('color')||relationColor(template.relation)):relationColor(template.relation);template.archived=false;if(existing){template.revision=(existing.revision||1)+1;templateLibrary=templateLibrary.map(item=>item.id===template.id?template:item);}else templateLibrary.push(template);persistTemplateLibrary();templateEditorId=null;templateEditorNew=false;message(`已保存${template.sourceType==='variant'?'变体':'自定义'}模板；已准备单位和已开始战斗不会随之改变。`);}
function duplicateAsVariant(id){const base=templateById(id);if(!base)return;const variant={...clone(base),id:uid(),revision:1,sourceType:'variant',archived:false,name:`${base.name} 变体`,baseTemplateId:base.id,baseTemplateRevision:base.revision||1,sourceStatus:'dm-variant'};templateLibrary.push(variant);persistTemplateLibrary();templateEditorNew=false;templateEditorId=variant.id;render();}
function setTemplateArchived(id, archived){const template=templateById(id);if(!template)return;template.archived=archived;template.revision=(template.revision||1)+1;persistTemplateLibrary();render();}
function addEncounterMember(templateId){
  if(state.encounter?.phase!=='preparation')return message('遭遇已确认；不能再加入准备单位。','warn');
  const template=encounterTemplateById(templateId);if(!template||template.archived)return;
  const footprint={widthCells:template.footprint?.[0]||1,heightCells:template.footprint?.[1]||1};
  const position=firstFreeFootprintPosition(footprint,state.encounter.members.filter(member=>member.deployment!=='reserve'),state.settings);
  const member=createEncounterMember(template,uid(),position||{x:0,y:0});
  member.displayOrdinal=nextDisplayOrdinal(member.name,state.encounter.members);
  if(!position)member.deployment='reserve';
  ensureFacing(member);state.encounter.members.push(member);state.ui.selectedId=member.id;
  message(position?`已添加 ${displayName(member)} 到遭遇。`:`已添加 ${displayName(member)}；地图没有足够空位，已设为场外预备。`,'');
}
function updatePreparationMember(id, field, value){
  if(state.encounter?.phase!=='preparation')return;const member=getCombatant(id);if(!member)return;
  if(field==='name')member.name=String(value).trim()||member.name;
  if(field==='relation'&&['ally','enemy','neutral'].includes(value))member.relation=value;
  if(field==='hp')member.hp=Math.max(0,Math.min(member.maxHp,Math.floor(Number(value)||0)));
  if(field==='conditions')member.conditions=String(value).split(/[，,;；]/).map(text=>text.trim()).filter(Boolean);
  if(field==='resources'){member.resources=parseResources(value);member.resourceMax=clone(member.resources);}
  if(field==='deployment'){
    const requested=value==='reserve'?'reserve':'field';
    const plan=placementPlan(member,member.position,state.encounter.members.filter(other=>other.id!==member.id&&other.deployment!=='reserve'));
    if(requested==='field'&&!plan.valid)return message(`无法投入战场：${plan.reasons.join('；')}。请先在地图摆放。`,'warn');
    member.deployment=requested;
  }
  ensureDisplayOrdinals(state.encounter.members);persist();render();
}
function removePreparationMember(id){if(state.encounter?.phase!=='preparation')return;const removed=state.encounter.members.find(member=>member.id===id);state.encounter.members=state.encounter.members.filter(member=>member.id!==id);if(removed?.combatProjectionId)state.combatProjections=state.combatProjections.filter(projection=>projection.projectionId!==removed.combatProjectionId);if(state.ui.selectedId===id)state.ui.selectedId=null;persist();render();}
function rows(value){return String(value||'').split(/\n/).map(line=>line.trim()).filter(Boolean).map(line=>line.split('|').map(part=>part.trim()));}
function boolText(value){return ['是','true','yes','1','已装备','熟练'].includes(String(value||'').toLowerCase());}
function resourcesFromText(value){const resources={};rows(value).forEach(([name,current,max,recovery,note])=>{if(!name)return;resources[name]={current:Number(current)||0,max:Number(max)||0,recovery:recovery||'manual',note:note||'',sourceStatus:'dm-authored'};});return resources;}
function attacksFromText(value){return rows(value).map(([name,ability,attackBonus,damage,damageType,reachOrRange,proficient,resourceLink])=>({name,ability:ability||'unknown',attackBonus:attackBonus===''?null:Number(attackBonus),damage,damageType:damageType||'unknown',reach:reachOrRange,proficient:boolText(proficient),resourceLink,sourceStatus:'dm-authored',masteryTerm:'',masteryEnabled:false})).filter(item=>item.name);}
function actionsFromText(value){return rows(value).map(([name,economy,resourceLink,description])=>({name,economy:economy||'action',resourceLink,description,sourceStatus:'dm-authored'})).filter(item=>item.name);}
function proficiencyRank(value){const normalized=String(value||'').trim().toLowerCase();if(['专精','精通','expertise','🅞','◎'].includes(normalized))return 'expertise';if(['熟练','proficient','是','true','yes','1','o','○'].includes(normalized))return 'proficient';if(['未知','unknown'].includes(normalized))return 'unknown';return 'none';}
function proficiencyLabel(rank){return ({none:'不熟练',proficient:'熟练',expertise:'专精',unknown:'待确认'})[rank]||'待确认';}
function proficienciesFromText(value){return rows(value).map(([name,rank,bonus,status])=>{const proficiencyRankValue=proficiencyRank(rank);return {name,proficiencyRank:proficiencyRankValue,proficient:['proficient','expertise'].includes(proficiencyRankValue),bonus:bonus===''?null:Number(bonus),status:status||'needs-review'};}).filter(item=>item.name);}
function equipmentFromText(value){return rows(value).map(([name,quantity,equipped,attuned,container,consumable,resourceLink,note])=>({name,quantity:Number(quantity)||0,equipped:boolText(equipped),attuned:boolText(attuned),container:container||'随身',consumable:boolText(consumable),ammunitionOrResourceLink:resourceLink,note,sourceStatus:'dm-authored'})).filter(item=>item.name);}
function linkedFromText(value){return rows(value).map(([name,kind,relation,note,templateId])=>({name,kind:kind||'ally',relation:relation||'ally',note,templateRef:templateId?{templateId,templateRevision:1}:null,sourceStatus:'dm-authored'})).filter(item=>item.name);}
const LINKED_KIND_LABELS={familiar:'魔宠',mount:'坐骑',retainer:'侍从',companion:'伙伴',summoned:'召唤物',ally:'盟友',other:'其他'};
const LINKED_RELATION_LABELS={ally:'友方',neutral:'中立',enemy:'敌对'};
function linkedTemplateOptions(selected=''){
  const available=templateLibrary.filter(template=>!template.archived);
  return `<option value="">${selected?'已绑定模板不可用':'本场选择模板 / 未绑定'}</option>${available.map(template=>`<option value="${esc(template.id)}" ${template.id===selected?'selected':''}>${esc(template.name)} · ${esc(template.kind||'unit')} · HP ${esc(template.maxHp??'?')}（${esc(template.id)}）</option>`).join('')}`;
}
function linkedEntityRowMarkup(entity={}, index=0){
  const id=entity.id||`linked-${index+1}`;
  return `<div class="linked-editor-row" data-linked-row data-linked-id="${esc(id)}"><div class="form-grid"><label>名称<input data-linked-name value="${esc(entity.name||'')}" placeholder="例如：小羽" required/></label><label>类型<select data-linked-kind>${Object.entries(LINKED_KIND_LABELS).map(([value,label])=>`<option value="${value}" ${entity.kind===value?'selected':''}>${label}</option>`).join('')}</select></label><label>关系<select data-linked-relation>${Object.entries(LINKED_RELATION_LABELS).map(([value,label])=>`<option value="${value}" ${entity.relation===value?'selected':''}>${label}</option>`).join('')}</select></label></div><label>备注<input data-linked-note value="${esc(entity.note||'')}" placeholder="DM 备注（可选）"/></label><label>UnitTemplate<select data-linked-template>${linkedTemplateOptions(entity.templateRef?.templateId||'')}</select></label><button type="button" data-linked-remove>移除关联单位</button></div>`;
}
function linkedEntitiesFromForm(form){
  return [...form.querySelectorAll('[data-linked-row]')].map((row,index)=>{
    const name=row.querySelector('[data-linked-name]')?.value.trim();
    if(!name)return null;
    const templateId=row.querySelector('[data-linked-template]')?.value.trim();
    return {id:row.dataset.linkedId||`linked-${index+1}`,name,kind:row.querySelector('[data-linked-kind]')?.value||'ally',relation:row.querySelector('[data-linked-relation]')?.value||'ally',note:row.querySelector('[data-linked-note]')?.value.trim()||'',templateRef:templateId?{templateId,templateRevision:1}:null,sourceStatus:'dm-authored'};
  }).filter(Boolean);
}
function upgradeLinkedEditors(){
  document.querySelectorAll('textarea[name="linkedEntities"]').forEach(textarea=>{
    if(textarea.closest('[data-linked-editor]'))return;
    const entities=linkedFromText(textarea.value);
    const host=document.createElement('div');
    host.className='linked-editor'; host.dataset.linkedEditor='';
    host.innerHTML=`<p class="muted">关联单位使用图形化设置。模板可以绑定到长期卡，也可以仅在本场加入遭遇时选择。</p>${entities.map((entity,index)=>linkedEntityRowMarkup(entity,index)).join('')}<button type="button" data-linked-add>新增关联单位</button>`;
    textarea.closest('label')?.replaceWith(host);
  });
}
function jsonArrayFromForm(value,label){const text=String(value||'').trim();if(!text)return [];try{const parsed=JSON.parse(text);if(!Array.isArray(parsed))throw new Error('不是数组');return parsed;}catch{throw new Error(`${label}必须是 JSON 数组。`);}}
function spellcastingProfilesFromForm(values){return jsonArrayFromForm(values.get('spellcastingProfilesJson'),'施法来源');}
function spellResourcePoolsFromForm(values){return jsonArrayFromForm(values.get('spellResourcePoolsJson'),'施法资源池');}
function spellsFromForm(values){return jsonArrayFromForm(values.get('spellsJson'),'法术');}
function classesFromForm(values,totalLevel,className){const supplied=jsonArrayFromForm(values.get('classesJson'),'职业构成');return supplied.length?supplied:(className?[{name:className,subclass:values.get('subclass'),level:totalLevel||1,sourceStatus:'dm-authored'}]:[]);}
function characterInputFromForm(form){
  const values=new FormData(form),score=key=>Number(values.get(key))||10,totalLevel=Math.max(0,Number(values.get('totalLevel'))||0),className=String(values.get('className')||'').trim();
  return {
    name:values.get('name'),ownerHint:values.get('ownerHint'),ruleVersion:values.get('ruleVersion')||'unknown',totalLevel,
    classes:classesFromForm(values,totalLevel,className),
    origin:{species:values.get('species'),background:values.get('background'),history:values.get('history')},
    abilities:{strength:{score:score('strength')},dexterity:{score:score('dexterity')},constitution:{score:score('constitution')},intelligence:{score:score('intelligence')},wisdom:{score:score('wisdom')},charisma:{score:score('charisma')}},
    armorClass:values.get('armorClass'),hp:{current:values.get('currentHp'),max:values.get('maxHp')},speed:values.get('speed'),initiativeModifier:values.get('initiativeModifier'),
    proficiencyBonus:values.get('proficiencyBonus'),passivePerception:values.get('passivePerception'),
    combatState:{tempHp:0,hitDice:values.get('hitDice'),heroicInspiration:values.get('heroicInspiration')==='on',conditions:String(values.get('conditions')||'').split(/[，,;；]/).map(text=>text.trim()).filter(Boolean),concentration:'none'},
    senses:String(values.get('senses')||'').split(/[，,;；]/),languages:String(values.get('languages')||'').split(/[，,;；]/),
    saves:proficienciesFromText(values.get('saves')),skills:proficienciesFromText(values.get('skills')),
    attackProfiles:attacksFromText(values.get('attacks')),actions:actionsFromText(values.get('actions')),resources:resourcesFromText(values.get('resources')),
    equipment:equipmentFromText(values.get('equipment')),linkedEntities:linkedEntitiesFromForm(form),
    spellcastingProfiles:spellcastingProfilesFromForm(values),spellResourcePools:spellResourcePoolsFromForm(values),spells:spellsFromForm(values),
    weaponMastery:{status:'unknown',grants:[],selections:[],note:'M1-S2 未发现可用于该角色自动授予武器精通的冻结来源；等待 DM 或后续准入。'},
    note:values.get('note'),source:{kind:'manual',status:'dm-authored',entryIds:[],note:'数值由 DM 手工输入；未通过规则合法性引擎自动计算。'},
  };
}
function preserveImportedCharacterMetadata(current,input){
  if(!current||current.source?.kind!=='excel-profile')return input;
  const mergeNamed=(nextItems,currentItems)=>nextItems.map(item=>{
    const previous=currentItems.find(candidate=>candidate.name===item.name);
    return previous?{...previous,...item}:item;
  });
  const mergeEquipment=(nextItems,currentItems)=>nextItems.map(item=>{
    const previous=currentItems.find(candidate=>candidate.name===item.name&&candidate.container===item.container);
    return previous?{...previous,...item,id:previous.id||item.id}:item;
  });
  const preserved={
    ...input,
    saves:mergeNamed(input.saves||[],current.saves||[]),skills:mergeNamed(input.skills||[],current.skills||[]),
    attackProfiles:mergeNamed(input.attackProfiles||[],current.attackProfiles||[]),
    equipment:mergeEquipment(input.equipment||[],current.equipment||[]),
    features:clone(current.features||[]),inventoryContainers:clone(current.inventoryContainers||[]),
    spellcastingProfiles:(input.spellcastingProfiles||[]).length?input.spellcastingProfiles:clone(current.spellcastingProfiles||[]),
    spellResourcePools:(input.spellResourcePools||[]).length?input.spellResourcePools:clone(current.spellResourcePools||[]),
    spells:(input.spells||[]).length?input.spells:clone(current.spells||[]),
    weaponMastery:clone(current.weaponMastery||input.weaponMastery),
    source:{...clone(current.source),note:`${current.source?.note||''}${current.source?.note?'；':''}本修订包含 DM 手工修改。`},
  };
  return preserved;
}
function preserveSpellcastingData(current,input){
  if(!current)return input;
  return {
    ...input,
    classes:(current.classes||[]).length>1?clone(current.classes||[]):input.classes,
    spellcastingProfiles:(input.spellcastingProfiles||[]).length?input.spellcastingProfiles:clone(current.spellcastingProfiles||[]),
    spellResourcePools:(input.spellResourcePools||[]).length?input.spellResourcePools:clone(current.spellResourcePools||[]),
    spells:(input.spells||[]).length?input.spells:clone(current.spells||[]),
    source:current.source?.kind==='m1-s4-fixture'?clone(current.source):input.source,
  };
}
const M1_S4_RULES={wizard:'urn:uuid:340db2c0-1bca-56a5-ab30-90c81437becd',evoker:'urn:uuid:ec770dfd-4025-5e5f-8e17-42ddacad7a6c',slots:'urn:uuid:92e6162f-1b04-5dee-b2fe-99e68c95cd31',one:'urn:uuid:23faa68f-588b-5b14-a6fb-7e0df89dcf8a',three:'urn:uuid:5909de48-eb19-58e3-b6ae-98cbe7e58c88',five:'urn:uuid:e2f3f7c0-0fd2-569c-b264-08db06c4c19d'};
function m1s4FixtureInput(kind){
  const core={ownerHint:'M1-S4 本地私有结构验证',ruleVersion:'2024',armorClass:12,hp:{current:50,max:50},speed:30,initiativeModifier:2,abilities:{intelligence:{score:18},wisdom:{score:14}},source:{kind:'m1-s4-fixture',status:'rules-baseline-limited',entryIds:[M1_S4_RULES.wizard,M1_S4_RULES.slots],note:'只验证施法来源、资源池、CastingOption 与隔离；不构成完整角色构筑或法术效果裁定。'}};
  if(kind==='evoker')return {...core,name:'M1-S4 验证·15级塑能师',totalLevel:15,classes:[{id:'wizard',name:'法师',subclass:'塑能师',level:15,sourceStatus:'rules-baseline-limited'}],spellcastingProfiles:[{id:'wizard',sourceKind:'class',sourceName:'法师（塑能师）',classId:'wizard',ability:'intelligence',spellAttack:{value:null,status:'needs-review'},saveDc:{value:null,status:'needs-review'},acquisitionMode:'spellbook',preparationMode:'prepared',preparedCount:{value:19,status:'needs-review'},resourcePoolIds:['wizard-slots'],ruleVersion:'2024',rulesEntryId:M1_S4_RULES.wizard,sourceStatus:'rules-baseline-limited',note:'19 个准备法术为本地验证声明；攻击调整值与 DC 未自动计算。'}],spellResourcePools:[{id:'wizard-slots',kind:'shared-slots',label:'法师常规法术位',balances:[{id:'slot-1',label:'1环',current:4,max:4},{id:'slot-3',label:'3环',current:3,max:3},{id:'slot-5',label:'5环',current:2,max:2}],recovery:'long-rest',ruleVersion:'2024',rulesEntryId:M1_S4_RULES.slots,sourceStatus:'rules-baseline-limited'}],spells:[{id:'grease',stableSpellId:`${M1_S4_RULES.one}#grease`,name:'油腻术',ruleVersion:'2024',availability:{inSpellbook:true,known:true,prepared:true,alwaysPrepared:false,availableThisEncounter:true,status:'rules-baseline-limited'},rulesEntryId:M1_S4_RULES.one,sourceStatus:'rules-baseline-limited',castingOptions:[{id:'grease-wizard',profileId:'wizard',resourcePoolId:'wizard-slots',balanceId:'slot-1',castAtLevel:1,sourceStatus:'rules-baseline-limited'}]},{id:'fireball',stableSpellId:`${M1_S4_RULES.three}#fireball`,name:'火球术',ruleVersion:'2024',availability:{inSpellbook:true,known:true,prepared:true,alwaysPrepared:false,availableThisEncounter:true,status:'rules-baseline-limited'},rulesEntryId:M1_S4_RULES.three,sourceStatus:'rules-baseline-limited',castingOptions:[{id:'fireball-wizard',profileId:'wizard',resourcePoolId:'wizard-slots',balanceId:'slot-3',castAtLevel:3,sourceStatus:'rules-baseline-limited'}]},{id:'cone-of-cold',stableSpellId:`${M1_S4_RULES.five}#cone-of-cold`,name:'寒冰锥',ruleVersion:'2024',availability:{inSpellbook:true,known:true,prepared:true,alwaysPrepared:false,availableThisEncounter:true,status:'rules-baseline-limited'},rulesEntryId:M1_S4_RULES.five,sourceStatus:'rules-baseline-limited',castingOptions:[{id:'cone-wizard',profileId:'wizard',resourcePoolId:'wizard-slots',balanceId:'slot-5',castAtLevel:5,sourceStatus:'rules-baseline-limited'}]}]};
  if(kind==='multiclass')return {...core,name:'M1-S4 验证·法师牧师',totalLevel:8,classes:[{id:'wizard',name:'法师',level:5,sourceStatus:'needs-review'},{id:'cleric',name:'牧师',level:3,sourceStatus:'needs-review'}],spellcastingProfiles:[{id:'wizard',sourceKind:'class',sourceName:'法师',classId:'wizard',ability:'intelligence',spellAttack:{value:null},saveDc:{value:null},acquisitionMode:'spellbook',preparationMode:'prepared',resourcePoolIds:['mixed-slots'],sourceStatus:'needs-review'},{id:'cleric',sourceKind:'class',sourceName:'牧师',classId:'cleric',ability:'wisdom',spellAttack:{value:null},saveDc:{value:null},acquisitionMode:'prepared',preparationMode:'prepared',resourcePoolIds:['mixed-slots'],sourceStatus:'needs-review'}],spellResourcePools:[{id:'mixed-slots',kind:'shared-slots',label:'多职业常规法术位（待核验）',balances:[{id:'slot-1',label:'1环',current:4,max:4}],recovery:'long-rest',sourceStatus:'needs-review',note:'M1-S4 不自动计算多职业贡献或高环取得权限。'}],spells:[{id:'fireball',name:'火球术',availability:{inSpellbook:true,known:true,prepared:true,alwaysPrepared:false,availableThisEncounter:true,status:'needs-review'},sourceStatus:'needs-review',castingOptions:[{id:'fireball-wizard',profileId:'wizard',resourcePoolId:'mixed-slots',balanceId:'slot-1',castAtLevel:3,sourceStatus:'needs-review'}]},{id:'bless',name:'祝福术',availability:{inSpellbook:false,known:true,prepared:true,alwaysPrepared:false,availableThisEncounter:true,status:'needs-review'},sourceStatus:'needs-review',castingOptions:[{id:'bless-cleric',profileId:'cleric',resourcePoolId:'mixed-slots',balanceId:'slot-1',castAtLevel:1,sourceStatus:'needs-review'}]}]};
  return {...core,name:'M1-S4 验证·莉亚混合来源',totalLevel:3,classes:[{id:'rogue',name:'游荡者',subclass:'刺客',level:3,sourceStatus:'imported-needs-review'}],origin:{species:'高等精灵',background:'导入背景待确认'},spellcastingProfiles:[{id:'high-elf',sourceKind:'species',sourceName:'高等精灵来源（属性待确认）',ability:'unknown',spellAttack:{value:null},saveDc:{value:null},acquisitionMode:'granted',preparationMode:'always-prepared',resourcePoolIds:['elf-free'],sourceStatus:'needs-review'},{id:'background-feat',sourceKind:'background-feat',sourceName:'背景/专长来源（待确认）',ability:'unknown',spellAttack:{value:null},saveDc:{value:null},acquisitionMode:'granted',preparationMode:'always-prepared',resourcePoolIds:['feat-free'],sourceStatus:'needs-review'}],spellResourcePools:[{id:'elf-free',kind:'free-cast',label:'高等精灵免费次数（待确认）',balances:[{id:'use',label:'免费次数',current:1,max:1}],recovery:'unknown',sourceStatus:'needs-review'},{id:'feat-free',kind:'free-cast',label:'背景/专长免费次数（待确认）',balances:[{id:'use',label:'免费次数',current:1,max:1}],recovery:'unknown',sourceStatus:'needs-review'}],spells:[{id:'imported-spell',name:'导入法术（名称待确认）',availability:{inSpellbook:false,known:false,prepared:false,alwaysPrepared:false,availableThisEncounter:false,status:'needs-review'},sourceStatus:'needs-review',castingOptions:[{id:'elf-option',profileId:'high-elf',resourcePoolId:'elf-free',balanceId:'use',sourceStatus:'needs-review'},{id:'feat-option',profileId:'background-feat',resourcePoolId:'feat-free',balanceId:'use',sourceStatus:'needs-review'}]}]};
}
function createM1S4Fixture(kind){
  const input=m1s4FixtureInput(kind);if(characterRecords.some(record=>currentCharacterSheet(record).name===input.name))return message(`${input.name} 已存在；不创建重复验证角色。`,'warn');
  try{const sheet=createCharacterSheet(input,{id:uid,timestamp:now}),candidate=[...characterRecords,createCharacterRecord(sheet)];persistCharacterRecords(candidate);characterRecords=candidate;selectedCharacterId=sheet.characterId;characterDetailTab='spells';message(`已创建 ${sheet.name} revision 1；数据仅用于 M1-S4 本地结构验证。`);}catch(error){message(`验证角色未创建：${error.message}`,'error');}
}
function legacyPresetActionMarkup(preset, preparing, joining){
  if(preparing)return `<button data-v2-action="add-member" data-template-id="${esc(preset.id)}">兼容加入</button>`;
  if(joining)return `<button data-v2-action="stage-entry" data-template-id="${esc(preset.id)}">兼容待入场</button>`;
  return `<button disabled title="仅能在遭遇准备或进行中的战斗中加入">当前阶段不可加入</button>`;
}
function developerValidationToolsMarkup(){
  const preparing=state.encounter?.phase==='preparation',joining=state.turn.started&&!combatEnded();
  return `<section class="workbench-panel developer-validation-tools"><span class="eyebrow">DEVELOPMENT</span><h2>开发与验证</h2><details><summary>开发验证工具</summary><p class="notice warn">仅用于本地开发与兼容验证。它们不属于正常角色创建流程；载入固定战斗验证场景会替换当前战斗会话。</p><h3>M1-S4 本地验证角色</h3><p class="muted">创建受控结构夹具，验证施法来源、资源池与 CastingOption；未知字段不会自动补齐。</p><div class="row"><button data-m1-s4-fixture="evoker">创建塑能师夹具</button><button data-m1-s4-fixture="multiclass">创建法师/牧师夹具</button><button data-m1-s4-fixture="lia">创建莉亚来源夹具</button></div><h3>旧版本地验证预设</h3><p class="muted">仅保留 v0.2.0 兼容入口，不会生成长期角色卡或战后写回。</p>${legacyCharacterPresets.map(preset=>`<div class="row"><span>${esc(preset.name)} · HP ${preset.maxHp}</span>${legacyPresetActionMarkup(preset,preparing,joining)}</div>`).join('')}<h3>固定战斗验证场景</h3>${fixtureLoadConfirmation?`<div class="notice warn"><p>将替换当前 CombatSession。请先导出，或确认直接载入；有待审核战后差异时不可执行。</p><div class="row"><button class="primary" data-load-fixtures-confirm="export">先导出当前会话并载入</button><button data-load-fixtures-confirm="direct">确认直接载入</button><button data-load-fixtures-cancel>取消</button></div></div>`:`<button data-load-fixtures-request>载入 v0.1 固定战斗验证场景</button>`}</details></section>`;
}
function v010FixtureSession(){
  const fresh=emptySession();
  const fixtures=[
    ...legacyCharacterPresets,
    ...legacyNpcPresets,
    referenceTemplateSeeds.find(template=>template.id==='ref-fire-giant'),
    referenceTemplateSeeds.find(template=>template.id==='ref-beholder'),
    referenceTemplateSeeds.find(template=>template.id==='ref-goblin-minion'),
    referenceTemplateSeeds.find(template=>template.id==='ref-goblin-minion'),
  ];
  const positions=[{x:2,y:13},{x:4,y:14},{x:5,y:13},{x:3,y:15},{x:11,y:8},{x:17,y:3},{x:16,y:11},{x:12,y:4},{x:13,y:5}];
  const members=fixtures.map((template,index)=>createEncounterMember(template,uid(),positions[index]));
  fresh.name='v0.1 固定战斗验证场景';
  fresh.encounter={...fresh.encounter,phase:'confirmed',migratedFrom:'v0.1.0-fixture',members};
  fresh.combatants=members.map(member=>{const combatant=materializeCombatant(member,uid());member.deployedCombatantId=combatant.id;return combatant;});
  fresh.combatants.filter(combatant=>combatant.templateId==='ref-goblin-minion').forEach(combatant=>{combatant.initiativeGroupId='goblin-group';});
  fresh.characters=fresh.combatants.filter(combatant=>combatant.kind==='character').map(combatant=>({id:uid(),combatantId:combatant.id,name:combatant.name,baseline:{hp:combatant.hp,resources:clone(combatant.resources),slots:clone(combatant.slots)}}));
  fresh.combatants.forEach(ensureFacing);
  ensureDisplayOrdinals(fresh.combatants);
  return fresh;
}
function requestFixtureLoad(){
  if(pendingPostCombatDiffs().length)return message('仍有待审核的战后候选差异；请先逐项处理，避免替换会话时失去审核上下文。','warn');
  fixtureLoadConfirmation=true;render();
}
function loadFixtureSession(exportFirst=false){
  if(pendingPostCombatDiffs().length)return message('仍有待审核的战后候选差异；固定验证场景未载入。','warn');
  if(exportFirst&&!exportJson())return;
  const before=checkpoint();
  state=normalizeV070Session(v010FixtureSession());
  fixtureLoadConfirmation=false;
  emit('session.fixture.loaded',{fixture:'v0.1.0-fixed-combat',exportedBefore:exportFirst},{before,reason:'DM 明确载入本地固定战斗验证场景；替换当前 CombatSession。'});
  persist();render();
  message('已载入 v0.1 固定战斗验证场景；请在战斗页确认并开始先攻。','warn');
}
function injectSpellResourcePanel(){
  if(!['战斗','地图'].includes(currentDomainTab())||document.querySelector('[data-spell-resource-panel]'))return;
  const focus=getCombatant(state.ui.selectedId)||active(),pools=focus?.spellResourcePools||[];if(!focus||!pools.length)return;
  const canOperate=active()?.id===focus.id&&!combatEnded()&&ordinaryActionsAllowed(focus);
  const spells=focus.spells||focus.templateSnapshot?.spells||[];
  const markup=`<section class="card" data-spell-resource-panel><h2>施法来源与资源</h2><p class="notice warn">法术位/资源变化必须由 DM 在下方“确认施放”记录；不会自动判断法术效果、施放资格、目标或跨来源支付。</p>${pools.map(pool=>`<article class="character-fact-card"><b>${esc(pool.label)}</b><span class="pill">${esc(pool.kind)}</span><p>${(pool.balances||[]).map(balance=>`${esc(balance.label)} ${esc(balance.current)}/${esc(balance.max)}`).join(' · ')||'无余额'}</p><div class="row">${(pool.balances||[]).map(balance=>`<button data-spell-resource="${esc(pool.id)}" data-spell-balance="${esc(balance.id)}" data-spell-amount="-1" ${canOperate?'':'disabled'}>手动消耗 ${esc(balance.label)}</button><button data-spell-resource="${esc(pool.id)}" data-spell-balance="${esc(balance.id)}" data-spell-amount="1" ${canOperate?'':'disabled'}>恢复</button>`).join('')}</div><small>${esc(pool.sourceStatus)} · ${esc(pool.note||'无备注')}</small></article>`).join('')}${spells.length?`<h3>确认施放</h3><div class="row">${spells.map(spell=>`<button data-spell-cast="${esc(spell.id||spell.name)}" data-spell-name="${esc(spell.name)}" ${canOperate?'':'disabled'}>确认施放 ${esc(spell.name)}</button>`).join('')}</div>`:'<p class="muted">当前投影没有可确认的法术清单；仍可由 DM 手动记录资源变化。</p>'}</section>`;
  const host=document.querySelector('.panel.two')||document.querySelector('[data-panel-id="current-action"]')?.closest('.wb-column-content')||document.querySelector('.wb-col-right .wb-column-content');if(!host)return;host.insertAdjacentHTML('beforeend',markup);
  document.querySelectorAll('[data-spell-resource]').forEach(button=>button.onclick=()=>{const combatant=active(),poolId=button.dataset.spellResource,balanceId=button.dataset.spellBalance,amount=Number(button.dataset.spellAmount);if(!combatant||!ordinaryActionsAllowed(combatant))return message('当前生命状态不能使用或恢复施法资源。','warn');const payload={id:combatant.id,poolId,balanceId,amount};command('combatant.spell-resource.changed',payload,()=>Object.assign(payload,applyCombatSpellResourceChange(combatant,poolId,balanceId,amount)),{reason:'战斗实例施法资源变化；不直接改写长期角色卡'});});
  document.querySelectorAll('[data-spell-cast]').forEach(button=>button.onclick=()=>{const combatant=active(),spell=(combatant?.spells||combatant?.templateSnapshot?.spells||[]).find(item=>(item.id||item.name)===button.dataset.spellCast);if(!combatant||!spell||!ordinaryActionsAllowed(combatant))return message('当前生命状态不能确认施放法术。','warn');const option=(spell.castingOptions||[]).find(item=>item.resourcePoolId&&item.balanceId);if(!option)return message(`${spell.name} 没有已结构化的资源支付选项；请使用手动资源变化并由 DM 说明。`,'warn');const payload={id:combatant.id,spellId:spell.id||spell.name,spellName:spell.name,poolId:option.resourcePoolId,balanceId:option.balanceId,amount:-1,targetIds:[],paymentOptionId:option.id};command('spell.cast.confirmed',payload,()=>Object.assign(payload,applyCombatSpellResourceChange(combatant,payload.poolId,payload.balanceId,payload.amount)),{manual:true,rulesReference:[],reason:'DM 确认施放与资源支付；效果、目标及合法性不自动结算'});});
}
function injectInventoryBalancePanel(){
  if(!['战斗','地图'].includes(currentDomainTab())||document.querySelector('[data-inventory-balance-panel]'))return;
  const focus=getCombatant(state.ui.selectedId)||active(),balances=focus?.inventoryBalances||[];if(!focus||!balances.length)return;
  const canOperate=active()?.id===focus.id&&!combatEnded()&&ordinaryActionsAllowed(focus);
  const markup=`<section class="card" data-inventory-balance-panel><h2>战斗库存余额</h2><p class="notice warn">只记录 DM 确认的箭矢、消耗品或物品充能变化；候选差异默认不回写长期角色卡。</p>${balances.map(balance=>`<div class="row"><span>${esc(balance.label)} ${balance.current}/${balance.max} <small>${esc(balance.kind)}</small></span><button data-inventory-balance="${esc(balance.id)}" data-inventory-amount="-1" ${canOperate?'':'disabled'}>消耗</button><button data-inventory-balance="${esc(balance.id)}" data-inventory-amount="1" ${canOperate?'':'disabled'}>恢复</button></div>`).join('')}</section>`;
  const host=document.querySelector('.panel.two')||document.querySelector('[data-panel-id="current-action"]')?.closest('.wb-column-content')||document.querySelector('.wb-col-right .wb-column-content');if(!host)return;host.insertAdjacentHTML('beforeend',markup);
  document.querySelectorAll('[data-inventory-balance]').forEach(button=>button.onclick=()=>{const combatant=active(),balanceId=button.dataset.inventoryBalance,amount=Number(button.dataset.inventoryAmount);if(!combatant||!ordinaryActionsAllowed(combatant))return message('当前生命状态不能使用或恢复战斗库存。','warn');const payload={id:combatant.id,balanceId,amount};command('combatant.inventory-balance.changed',payload,()=>Object.assign(payload,applyCombatInventoryBalanceChange(combatant,balanceId,amount)),{manual:true,reason:'DM 确认战斗库存余额变化；不直接改写长期角色卡'});});
}

function applyM1S4PresentationLabels(){
  document.querySelector('.footer')?.replaceChildren(document.createTextNode(`CharacterSheet（长期只读）→ CombatProjection → CombatantInstance（单场生命状态）→ CombatEvent → PostCombatDiff · v${DELIVERY_VERSION}`));
  const abilityLabels={strength:'力量',dexterity:'敏捷',constitution:'体质',intelligence:'智力',wisdom:'感知',charisma:'魅力',unknown:'待确认'};
  document.querySelectorAll('[data-character-region="spells"] .character-fact-card p').forEach(detail=>{for(const [id,label] of Object.entries(abilityLabels))detail.childNodes.forEach(node=>{if(node.nodeType===Node.TEXT_NODE)node.textContent=node.textContent.replace(`属性：${id}`,`属性：${label}`);});});
  document.querySelectorAll('[data-character-region="spells"] .character-fact-card small').forEach(detail=>{
    const text=detail.textContent||'';
    if(!text.includes('→')||text.includes('种施放方式'))return;
    const options=text.split(' · ')[0].split('；').filter(option=>option.includes('→')).length;
    detail.textContent=`${options} 种施放方式：${text}`;
  });
}
function applyLinkedEntityTemplateHint(){
  const field=document.querySelector('textarea[name="linkedEntities"]');
  if(field&&!field.value)field.placeholder='示例盟友|ally|ally|第0回合生成棋子|preset-scout；实际 ID 请从单位库复制';
  const selected=characterRecords.find(record=>record.characterId===selectedCharacterId),region=document.querySelector('[data-character-region="linked"]');
  if(selected&&region&&!region.querySelector('.linked-encounter-actions'))region.insertAdjacentHTML('beforeend',linkedMaterializationPanel(selected,state.encounter?.phase==='preparation'));
}
function characterArchiveBlockers(characterId){
  const battleOpen=state.encounter?.phase!=='ended';
  const battleProjectionCount=battleOpen?state.combatProjections.filter(projection=>projection.characterId===characterId).length:0;
  const pendingDiffCount=(state.postCombatDiffs||[]).filter(diff=>diff.characterId===characterId&&diff.status==='pending').length;
  return {battleProjectionCount,pendingDiffCount,blocked:battleProjectionCount>0||pendingDiffCount>0};
}
function archiveCharacter(characterId){
  const index=characterRecords.findIndex(record=>record.characterId===characterId);if(index<0)return;
  const blockers=characterArchiveBlockers(characterId);
  if(blockers.blocked){const reasons=[];if(blockers.battleProjectionCount)reasons.push(`当前战斗有 ${blockers.battleProjectionCount} 个投影`);if(blockers.pendingDiffCount)reasons.push(`有 ${blockers.pendingDiffCount} 份待审核候选差异`);return message(`暂不能归档：${reasons.join('，')}。请先结束战斗并完成或废除候选差异。`,'warn');}
  const candidate=clone(characterRecords);candidate[index]=archiveCharacterRecord(candidate[index],{timestamp:now,reason:'DM 归档；保留历史修订与战斗引用'});persistCharacterRecords(candidate);characterRecords=candidate;if(selectedCharacterId===characterId)selectedCharacterId=characterRecords.find(record=>record.status!=='archived')?.characterId||null;message('角色卡已归档；历史修订和既有战斗引用仍保留。');
}
function restoreCharacter(characterId){
  const index=characterRecords.findIndex(record=>record.characterId===characterId);if(index<0)return;
  const candidate=clone(characterRecords);candidate[index]=restoreCharacterRecord(candidate[index]);persistCharacterRecords(candidate);characterRecords=candidate;selectedCharacterId=characterId;message('角色卡已恢复为活动状态。');
}
function saveWeaponMasteryRestSelection(form){
  try{
    const characterId=form.dataset.masteryRestForm,index=characterRecords.findIndex(record=>record.characterId===characterId);if(index<0)throw new Error('长期角色卡不存在。');
    const blockers=characterArchiveBlockers(characterId);if(blockers.blocked)throw new Error('当前战斗投影或待审核候选差异仍引用该角色；为保持修订与战斗快照隔离，暂不能更换。');
    const values=new FormData(form),weaponIds=values.getAll('masteryWeaponId').map(String),reason=String(values.get('masterySelectionReason')||'').trim();
    const result=reviseWeaponMasterySelections(characterRecords[index],weaponIds,{timestamp:now,reason}),candidate=clone(characterRecords);candidate[index]=result.record;
    persistCharacterRecords(candidate);characterRecords=candidate;selectedCharacterId=characterId;masteryEditorCharacterId=null;characterDetailTab='actions';
    message(`长休结束后的武器精通选择已写入修订 ${result.revision.revision}；既有战斗投影与历史修订保持不变。`);
  }catch(error){message(`武器精通选择未保存：${error.message}`,'error');}
}
function deleteCharacter(characterId){
  const record=characterRecords.find(candidate=>candidate.characterId===characterId);if(!record)return;
  const activeReferences=state.combatProjections.filter(projection=>projection.characterId===characterId).length;
  const pendingDiffs=(state.postCombatDiffs||[]).filter(diff=>diff.characterId===characterId&&diff.status==='pending').length;
  if(!canPermanentlyDeleteCharacterRecord(record,{activeReferences,pendingDiffs}))return message(activeReferences||pendingDiffs?'该角色仍被当前投影或待审核差异引用；请先完成战斗审核或仅归档。':'永久删除前必须先归档角色卡。','warn');
  const name=currentCharacterSheet(record).name;if(prompt(`永久删除不可恢复。请输入角色名称“${name}”以确认：`)!==name)return message('永久删除已取消。','warn');
  const candidate=characterRecords.filter(item=>item.characterId!==characterId);persistCharacterRecords(candidate);characterRecords=candidate;if(selectedCharacterId===characterId)selectedCharacterId=characterRecords[0]?.characterId||null;message(`已永久删除角色卡“${name}”及其长期修订；当前战斗历史快照不受影响。`);
}
function saveManualCharacter(form){
  try{
    let input=characterInputFromForm(form);
    if(characterEditorId){
      const index=characterRecords.findIndex(record=>record.characterId===characterEditorId);if(index<0)throw new Error('找不到要修订的长期角色卡。');
      if(characterRecords[index].status==='archived')throw new Error('已归档角色卡不能直接编辑；请先恢复角色。');
      input=preserveSpellcastingData(currentCharacterSheet(characterRecords[index]),input);
      input=preserveImportedCharacterMetadata(currentCharacterSheet(characterRecords[index]),input);
      const result=reviseCharacterRecord(characterRecords[index],input,{timestamp:now}),candidate=clone(characterRecords);candidate[index]=result.record;
      persistCharacterRecords(candidate);characterRecords=candidate;selectedCharacterId=result.revision.characterId;characterEditorId=null;
      message(`已创建 ${result.revision.name} 修订 ${result.revision.revision}；旧修订保持不变。`);return;
    }
    const sheet=createCharacterSheet(input,{id:uid,timestamp:now}),candidate=[...characterRecords,createCharacterRecord(sheet)];
    persistCharacterRecords(candidate);characterRecords=candidate;selectedCharacterId=sheet.characterId;characterManualDraft=null;characterCreateMode=null;
    message(`已创建 ${sheet.name}。初始历史从修订 1 开始；战斗不会直接修改它。`);
  }catch(error){message(`角色卡未保存：${error.message}`,'error');}
}
function importedCharacterInput(form, draft){
  const values=new FormData(form),base=clone(draft.input),number=(key,fallback)=>{const value=Number(values.get(key));return Number.isFinite(value)?Math.trunc(value):fallback;};
  base.name=String(values.get('name')||'').trim();base.ownerHint=String(values.get('ownerHint')||'').trim();base.totalLevel=Math.max(0,number('totalLevel',base.totalLevel));
  const className=String(values.get('className')||'').trim(),subclass=String(values.get('subclass')||'').trim();base.classes=className?[{name:className,subclass,level:Math.max(1,base.totalLevel||1),sourceStatus:'imported-needs-review'}]:[];
  base.origin={...base.origin,species:String(values.get('species')||'').trim(),background:String(values.get('background')||'').trim()};
  for(const key of ['strength','dexterity','constitution','intelligence','wisdom','charisma'])base.abilities[key]={score:Math.max(0,number(key,base.abilities[key]?.score??10))};
  base.armorClass=Math.max(0,number('armorClass',base.armorClass));base.hp={current:Math.max(0,number('currentHp',base.hp.current)),max:Math.max(1,number('maxHp',base.hp.max))};base.hp.current=Math.min(base.hp.current,base.hp.max);base.speed=Math.max(0,number('speed',base.speed));base.initiativeModifier=number('initiativeModifier',base.initiativeModifier);base.proficiencyBonus=number('proficiencyBonus',base.proficiencyBonus);base.passivePerception=number('passivePerception',base.passivePerception);
  const masteryRelevant=(base.weaponMastery.grants||[]).length>0,masteryNote=String(values.get('weaponMasteryNote')||'').trim(),spellConflictNote=String(values.get('spellConflictNote')||'').trim();
  const requestedSelections=[...new Set(String(values.get('weaponMasterySelections')||'').split(/[，,;；]/).map(item=>item.trim()).filter(Boolean))],eligible=[...new Set(base.attackProfiles.filter(item=>item.proficient&&ADMITTED_WEAPON_MASTERY[item.weaponKind||item.name]).map(item=>item.weaponKind||item.name))];
  if(masteryRelevant&&requestedSelections.length>(base.weaponMastery.selectionLimit||2))throw new Error(`武器精通最多选择 ${base.weaponMastery.selectionLimit||2} 种武器。`);
  const invalid=masteryRelevant?requestedSelections.filter(name=>!eligible.includes(name)):[];if(invalid.length)throw new Error(`武器精通选择不在本次已熟练武器候选中：${invalid.join('、')}。`);
  const selections=masteryRelevant?requestedSelections.map((weaponKind,index)=>{const admitted=ADMITTED_WEAPON_MASTERY[weaponKind];return {id:`mastery-selection-${index+1}`,weaponKind,weaponId:admitted?.weaponId||null,masteryPropertyId:admitted?.masteryPropertyId||null,masteryTerm:admitted?.masteryTerm||'',status:'dm-confirmed',sourceStatus:'dm-confirmed-from-import-preview',rulesReference:M1_S5_RULES.masteryProperties};}):[];
  base.attackProfiles=base.attackProfiles.map(attack=>{const selected=masteryRelevant&&requestedSelections.includes(attack.weaponKind||attack.name),admitted=ADMITTED_WEAPON_MASTERY[attack.weaponKind||attack.name];return {...attack,masteryEnabled:selected,weaponId:admitted?.weaponId||attack.weaponId||null,masteryPropertyId:admitted?.masteryPropertyId||attack.masteryPropertyId||null,masteryTerm:admitted?.masteryTerm||attack.masteryTerm||''};});
  base.weaponMastery=masteryRelevant?{...base.weaponMastery,status:selections.length?'dm-confirmed':'needs-review',selections,note:masteryNote,selectionReason:masteryNote,confirmedAt:selections.length?now():''}:{...base.weaponMastery,status:'not-applicable',selections:[],note:base.weaponMastery.note||'受控导入未识别到“武器精通”职业特性；不要求 DM 选择武器精通。'};base.source={...base.source,note:`只读 Profile 导入${masteryRelevant?`；DM 补充：武器精通=${masteryNote}${requestedSelections.length?`；当前选择=${requestedSelections.join('、')}`:''}`:'；未识别到武器精通职业特性，不要求 DM 选择'}${spellConflictNote?`；施法来源冲突=${spellConflictNote}`:''}`};return base;
}
function recordForDuplicateImport(draft){return characterRecords.find(record=>{const source=currentCharacterSheet(record).source||{};return draft?.fileSha256&&source.fileSha256===draft.fileSha256;})||null;}
function saveImportedCharacter(form, mode){
  try{
    const draft=characterImportDraft;if(!draft||draft.status!=='needs-confirmation')throw new Error('没有可确认的 Excel 导入草稿。');
    if(draft.conflicts.length&&!String(new FormData(form).get('spellConflictNote')||'').trim())throw new Error('存在施法来源冲突；请填写 DM 的暂行处理说明后再确认。');
    const input=importedCharacterInput(form,draft),duplicate=recordForDuplicateImport(draft);
    if(duplicate){
      if(mode!=='update')throw new Error('同一来源文件已存在；请使用“创建新修订”确认更新预览。');
      const index=characterRecords.findIndex(record=>record.characterId===duplicate.characterId),result=reviseCharacterRecord(duplicate,input,{timestamp:now}),candidate=clone(characterRecords);candidate[index]=result.record;persistCharacterRecords(candidate);characterRecords=candidate;selectedCharacterId=result.revision.characterId;message(`已确认 Excel 更新：${result.revision.name} 写入修订 ${result.revision.revision}；旧修订保持不变。`);
    }else{
      const sheet=createCharacterSheet(input,{id:uid,timestamp:now}),candidate=[...characterRecords,createCharacterRecord(sheet)];persistCharacterRecords(candidate);characterRecords=candidate;selectedCharacterId=sheet.characterId;message(`已确认 Excel 导入：${sheet.name} 已创建为长期角色卡修订 1。`);
    }
    characterImportDraft=null;characterCreateMode=null;render();
  }catch(error){message(`Excel 草稿未写入：${error.message}`,'error');}
}
function importMappingRows(draft){return draft.mappings.map(item=>`<li><code>${esc(item.path)}</code> ← ${esc(item.source.sheet)}!${esc(item.source.ref)}：<b>${esc(item.value||'空')}</b> <span class="pill">${esc(item.status)}</span></li>`).join('');}
function importDraftPanel(){
  const draft=characterImportDraft;if(!draft)return `<section class="card import-panel"><h2>受控 Excel 导入</h2><p>仅支持 <code>${BEILING_PROFILE.importerId}@${BEILING_PROFILE.version}</code>。先生成草稿并预览，确认前不会创建或覆盖长期角色卡。</p><button class="primary" data-character-import-open>选择莉亚 Excel</button><p class="muted">不执行公式、宏、脚本、外链或工作簿内置规则数据库。</p></section>`;
  if(draft.status==='rejected')return `<section class="card import-panel"><h2>Excel 导入已安全拒绝</h2><p class="notice error">${esc(draft.reason)}</p><ul>${(draft.diagnostics||[]).map(item=>`<li>${esc(item)}</li>`).join('')}</ul><button data-character-import-clear>清除草稿</button> <button class="primary" data-character-import-open>换一个文件</button></section>`;
  const input=draft.input,duplicate=recordForDuplicateImport(draft),diff=duplicate?diffCharacterRevisions(currentCharacterSheet(duplicate),input):[];
  const masteryRelevant=(input.weaponMastery.grants||[]).length>0,masteryCandidates=[...new Set((input.attackProfiles||[]).filter(item=>item.proficient&&ADMITTED_WEAPON_MASTERY[item.weaponKind||item.name]).map(item=>item.weaponKind||item.name))];
  const contentSummary=`<details open><summary>已识别角色内容</summary><p>豁免 ${input.saves.length} 项 · 技能 ${input.skills.length} 项 · 特性 ${(input.features||[]).length} 项 · 武器 ${(input.attackProfiles||[]).length} 条 · 装备 ${(input.equipment||[]).length} 件 · 容器 ${(input.inventoryContainers||[]).length} 个。</p>${masteryRelevant?`<p class="muted">武器精通候选：${esc(masteryCandidates.join('、')||'无')}；最多选择 ${input.weaponMastery.selectionLimit||2} 种，完成长休时可重新选择。固有精通词条不等于当前已选择。</p>`:'<p class="muted">未识别到“武器精通”职业特性；本次不要求 DM 补充当前选择。</p>'}</details>`;
  return `<section class="card import-panel"><div class="row"><h2>CharacterDraft 预览</h2><button data-character-import-clear>放弃草稿</button></div><p class="notice warn">${esc(draft.fileName)} · SHA-256 ${esc(draft.fileSha256||'unknown')}。确认前只存在于当前页面内存。</p>${contentSummary}<details open><summary>字段映射（${draft.mappings.length}）</summary><ul class="import-list">${importMappingRows(draft)}</ul></details><details><summary>缺失与手工补充（${draft.missing.length}）</summary><ul>${draft.missing.map(item=>`<li><code>${esc(item.path)}</code>：${esc(item.reason)}</li>`).join('')}</ul></details><details><summary>默认值、警告、冲突与未映射内容</summary><ul>${draft.defaults.map(item=>`<li>默认值 ${esc(item.path)}=${esc(item.value)}：${esc(item.reason)}</li>`).join('')}${draft.warnings.map(item=>`<li class="warn-text">${esc(item)}</li>`).join('')}${draft.conflicts.map(item=>`<li class="warn-text">冲突 ${esc(item.path)}：${esc(item.reason)}</li>`).join('')}${draft.unmapped.map(item=>`<li>未映射 ${esc(item.area)}：${esc(item.reason)}</li>`).join('')}</ul></details>${duplicate?`<p class="notice warn">检测到同一 SHA-256 已导入为“${esc(currentCharacterSheet(duplicate).name)}”修订 ${currentCharacterSheet(duplicate).revision}。以下是候选更新差异：${diff.length?esc(diff.slice(0,12).map(item=>`${revisionFieldLabel(item.path)} ${revisionValue(item.path,item.before)} → ${revisionValue(item.path,item.after)}`).join('；')):'没有业务字段变化'}。</p>`:'<p class="notice">未检测到同一来源 SHA-256 的现有角色卡；确认后将创建修订 1。</p>'}<form data-character-import-form class="character-form"><fieldset><legend>确认前修订</legend><div class="form-grid"><label>角色名称<input name="name" value="${esc(input.name)}" required/></label><label>所有者<input name="ownerHint" value="${esc(input.ownerHint)}"/></label><label>总等级<input name="totalLevel" type="number" min="0" value="${input.totalLevel}"/></label><label>职业<input name="className" value="${esc(input.classes[0]?.name||'')}"/></label><label>子职<input name="subclass" value="${esc(input.classes[0]?.subclass||'')}"/></label><label>种族<input name="species" value="${esc(input.origin.species)}"/></label><label>背景<input name="background" value="${esc(input.origin.background)}"/></label><label>AC<input name="armorClass" type="number" min="0" value="${input.armorClass}"/></label><label>当前 HP<input name="currentHp" type="number" min="0" value="${input.hp.current}"/></label><label>最大 HP<input name="maxHp" type="number" min="1" value="${input.hp.max}"/></label><label>速度<input name="speed" type="number" min="0" value="${input.speed}"/></label><label>先攻调整值<input name="initiativeModifier" type="number" value="${input.initiativeModifier}"/></label><label>熟练加值<input name="proficiencyBonus" type="number" value="${input.proficiencyBonus}"/></label><label>被动察觉<input name="passivePerception" type="number" value="${input.passivePerception}"/></label>${[['strength','力量'],['dexterity','敏捷'],['constitution','体质'],['intelligence','智力'],['wisdom','感知'],['charisma','魅力']].map(([key,label])=>`<label>${label}<input name="${key}" type="number" min="0" value="${input.abilities[key]?.score??10}"/></label>`).join('')}</div>${masteryRelevant?`<label>当前武器精通选择（最多 ${input.weaponMastery.selectionLimit||2} 种；逗号分隔，可留空）<input name="weaponMasterySelections" placeholder="候选：${esc(masteryCandidates.join('、'))}"/></label><label>武器精通补充（必填）<textarea name="weaponMasteryNote" required>请确认当前选择；完成长休时可以重新选择合资格武器。</textarea></label>`:''}${draft.conflicts.length?'<label>施法来源冲突的 DM 暂行处理（必填；不等于自动选择）<textarea name="spellConflictNote" required placeholder="例如：保留原始来源，M1-S4 前不生成施法 Profile。"></textarea></label>':''}</fieldset><button class="primary" type="submit" name="importMode" value="${duplicate?'update':'create'}">${duplicate?'确认并创建新修订':'确认并创建长期角色卡'}</button></form></section>`;
}
function addCharacterProjection(characterId){
  const record=characterRecords.find(candidate=>candidate.characterId===characterId);
  if(!record)return message('找不到该长期角色卡。','error');
  if(record.status==='archived')return message('已归档角色卡不能生成新投影；请先恢复角色。','warn');
  const preparing=state.encounter?.phase==='preparation',joining=state.turn.started&&!combatEnded();
  if(!preparing&&!joining)return message('当前只能在遭遇准备阶段，或已开始且未结束的战斗中建立投影。','warn');
  try{
    const projection=createCombatProjection(currentCharacterSheet(record),{id:uid,timestamp:now});
    const footprint=projection.footprint;
    const occupied=preparing?state.encounter.members.filter(member=>member.deployment!=='reserve'):[...onFieldCombatants(),...pendingPlacementCombatants()];
    const position=firstFreeFootprintPosition(footprint,occupied,state.settings);
    if(!position)return message('地图没有可容纳该角色占位的空位；未创建投影或实例。','warn');
    const member=createEncounterMemberFromProjection(projection,{id:uid,position});member.displayOrdinal=nextDisplayOrdinal(member.name,preparing?state.encounter.members:labelPool());ensureFacing(member);
    state.combatProjections.push(projection);
    if(preparing){state.encounter.members.push(member);state.ui.selectedId=member.id;message(`已从 ${projection.name} 修订 ${projection.characterRevision} 生成隔离投影，并加入当前遭遇。`);return;}
    const combatant=materializeCombatant(member,uid());ensureFacing(combatant);const item={kind:'join',combatant,reserveMemberId:null,tiePlacement:'after',initiativeMode:'roll',initiativeModifier:combatant.initiativeModifier,initiativeRoll:null,initiativeConfigured:false};stageEntryItem(item,{destination:'keep',notice:`已从 ${projection.name} 修订 ${projection.characterRevision} 生成隔离投影，并加入待入场批次。`});
  }catch(error){message(`投影未创建：${error.message}`,'error');}
}
function materializeLinkedEntity(characterId,linkedEntityId,templateChoice=''){
  if(state.encounter?.phase!=='preparation')return message('关联单位只能在第 0 回合生成棋子；战斗中加入需后续单独授权。','warn');
  const record=characterRecords.find(candidate=>candidate.characterId===characterId),sheet=record&&currentCharacterSheet(record),entity=(sheet?.linkedEntities||[]).find(item=>item.id===linkedEntityId),projection=state.combatProjections.find(item=>item.characterId===characterId&&item.characterRevision===sheet?.revision);
  if(!entity||!projection)return message('请先将该角色当前修订生成投影并加入遭遇。','warn');
  const requestedTemplateId=templateChoice||entity.templateRef?.templateId;
  if(!requestedTemplateId)return message(`${entity.name} 尚未选择 UnitTemplate；请在本卡片选择本场模板。`,'warn');
  const template=templateById(requestedTemplateId);if(!template||template.archived)return message(`关联单位绑定的模板“${requestedTemplateId}”不存在或已归档。请在本卡片选择未归档模板。`,'warn');
  const duplicate=state.encounter.members.some(member=>member.linkedEntityProjection?.sourceCombatProjectionId===projection.projectionId&&member.linkedEntityProjection?.linkedEntityRef?.id===entity.id);if(duplicate)return message('该角色投影中的关联单位已经生成棋子，不能重复加入。','warn');
  const position=firstFreeFootprintPosition({widthCells:template.footprint?.[0]||1,heightCells:template.footprint?.[1]||1},state.encounter.members.filter(member=>member.deployment!=='reserve'),state.settings);if(!position)return message('地图没有可容纳关联单位的空位。','warn');
  try{const linkedProjection=createLinkedEntityProjection(projection,entity,template,{id:uid,timestamp:now}),member=createEncounterMember(template,uid(),position);member.name=entity.name;member.relation=entity.relation;member.displayOrdinal=nextDisplayOrdinal(member.name,state.encounter.members);member.linkedEntityProjection=linkedProjection;member.sourceCombatProjectionId=projection.projectionId;member.sourceLinkedEntityId=entity.id;ensureFacing(member);state.linkedEntityProjections.push(linkedProjection);state.encounter.members.push(member);message(`${entity.name} 已生成独立棋子并加入第 0 回合；其 HP、行动轮与原角色分离。`);}catch(error){message(`关联单位未加入遭遇：${error.message}`,'error');}
}
function materializeControlledEntity(characterId,controlledEntityId){
  if(state.encounter?.phase!=='preparation')return message('受控生物只能在第 0 回合加入新遭遇；战斗中加入仍需使用既有临时投入流程。','warn');
  const record=characterRecords.find(candidate=>candidate.characterId===characterId),sheet=record&&currentCharacterSheet(record),entity=(sheet?.controlledEntities||[]).find(item=>item.id===controlledEntityId),projection=state.combatProjections.find(item=>item.characterId===characterId&&item.characterRevision===sheet?.revision);
  if(!entity||!projection)return message('请先将控制者当前修订生成投影并加入遭遇。','warn');
  if(!['controlled','permanent-controlled'].includes(entity.status))return message('该受控关系已到期、解除或失控，不能从控制者卡再次投入；DM 可从单位库独立加入对应模板。','warn');
  const template=templateById(entity.templateRef?.templateId);if(!template||template.archived)return message('该受控生物绑定的 UnitTemplate 不存在或已归档。','warn');
  const duplicate=state.encounter.members.some(member=>member.controlledEntityProjection?.sourceCombatProjectionId===projection.projectionId&&member.controlledEntityProjection?.controlledEntityId===entity.id);if(duplicate)return message('该受控生物已加入本次遭遇，不能重复生成。','warn');
  const position=firstFreeFootprintPosition({widthCells:template.footprint?.[0]||1,heightCells:template.footprint?.[1]||1},state.encounter.members.filter(member=>member.deployment!=='reserve'),state.settings);if(!position)return message('地图没有可容纳该受控生物的空位。','warn');
  try{const linkedProjection=createLinkedEntityProjection(projection,{id:entity.id,name:entity.name,relation:'ally'},template,{id:uid,timestamp:now}),member=createEncounterMember(template,uid(),position);linkedProjection.associationKind='controlled';linkedProjection.controlledEntityId=entity.id;member.name=entity.name;member.relation='ally';member.displayOrdinal=nextDisplayOrdinal(member.name,state.encounter.members);member.controlledEntityProjection={projectionId:linkedProjection.projectionId,sourceCombatProjectionId:projection.projectionId,controlledEntityId:entity.id,controllerCharacterRef:clone(projection.characterId?{characterId:projection.characterId,revision:projection.characterRevision}:null),status:entity.status,duration:clone(entity.duration),commandRangeFeet:entity.commandRangeFeet,effectLabel:entity.effectLabel};ensureFacing(member);state.linkedEntityProjections.push(linkedProjection);state.controlledEntityProjections.push(clone(member.controlledEntityProjection));state.encounter.members.push(member);message(`${entity.name} 已作为受控关联生物加入第 0 回合；本场会创建新的独立战斗实例。`);}catch(error){message(`受控生物未加入遭遇：${error.message}`,'error');}
}
function linkedMaterializationPanel(record,preparing){const sheet=record&&currentCharacterSheet(record),entities=sheet?.linkedEntities||[];if(!record||!entities.length)return '';const projection=state.combatProjections.find(item=>item.characterId===sheet.characterId&&item.characterRevision===sheet.revision);return `<section class="linked-encounter-actions"><p class="muted">仅从显式 UnitTemplate 建立独立快照；本场选择模板不会回写长期角色卡。</p>${entities.map(entity=>{const duplicate=state.encounter.members.some(member=>member.linkedEntityProjection?.sourceCombatProjectionId===projection?.projectionId&&member.linkedEntityProjection?.linkedEntityRef?.id===entity.id);return `<article class="character-fact-card linked-card" data-linked-card><div class="card-heading"><b>${esc(entity.name)}</b><span class="pill">${esc(LINKED_KIND_LABELS[entity.kind]||entity.kind)} / ${esc(LINKED_RELATION_LABELS[entity.relation]||entity.relation)}</span></div><p>${esc(entity.note||'无备注')}</p><label>本场 UnitTemplate<select data-linked-template-choice ${duplicate||!preparing||!projection?'disabled':''}>${linkedTemplateOptions(entity.templateRef?.templateId||'')}</select></label><small>${entity.templateRef?.templateId?`长期绑定：${esc(entity.templateRef.templateId)}`:'未长期绑定；请选择本场模板'}</small><button class="primary" data-linked-materialize="${esc(entity.id)}" data-linked-character="${sheet.characterId}" ${duplicate||!preparing||!projection?'disabled':''}>${duplicate?'已加入本次遭遇':'生成棋子并加入遭遇'}</button></article>`;}).join('')}</section>`;}
function generatePostCombatDiffs(){
  const existing=new Set((state.postCombatDiffs||[]).map(diff=>`${diff.combatProjectionId}:${diff.combatantId}`));let created=0;
  state.combatants.filter(combatant=>combatant.combatProjectionId&&!combatant.postCombatWritebackDisabled).forEach(combatant=>{
    const key=`${combatant.combatProjectionId}:${combatant.id}`;if(existing.has(key))return;
    const projection=state.combatProjections.find(candidate=>candidate.projectionId===combatant.combatProjectionId);if(!projection)return;
    const diff=buildPostCombatDiff(projection,combatant,{id:uid,timestamp:now,sourceSessionId:state.sessionId,sourceEventSequence:state.events.length+1});
    if(diff.entries.length){state.postCombatDiffs.push(diff);created+=1;}
  });return created;
}
function pendingPostCombatDiffs(){return (state.postCombatDiffs||[]).filter(diff=>diff.status==='pending');}
function unlinkedRevivedPcs(){return state.combatants.filter(combatant=>isPc(combatant)&&!combatant.combatProjectionId&&(combatant.deathRecord?.resolutions||[]).some(resolution=>resolution?.type==='pc-return-to-life'));}
function clearPostCombatDiffError(entry){
  entry.querySelectorAll('.field-error').forEach(field=>{field.classList.remove('field-error');field.removeAttribute('aria-invalid');});
  const note=entry.querySelector('[data-post-diff-error]');if(note)note.textContent='';
}
function validatePostCombatDiffCard(card){
  let firstInvalid=null;
  card.querySelectorAll('[data-post-diff-decision]').forEach(select=>{
    const entry=select.closest('[data-post-diff-entry]');if(!entry)return;
    clearPostCombatDiffError(entry);
    if(select.value!=='correct')return;
    const corrected=entry.querySelector('[data-post-diff-corrected]'),reason=entry.querySelector('[data-post-diff-reason]'),errors=[];
    const numeric=corrected?.value.trim();
    if(numeric===''||!Number.isFinite(Number(numeric))||Number(numeric)<0){corrected?.classList.add('field-error');corrected?.setAttribute('aria-invalid','true');errors.push('请输入非负更正值。');firstInvalid=firstInvalid||corrected;}
    if(!reason?.value.trim()){reason?.classList.add('field-error');reason?.setAttribute('aria-invalid','true');errors.push('更正必须填写原因。');firstInvalid=firstInvalid||reason;}
    const note=entry.querySelector('[data-post-diff-error]');if(note)note.textContent=errors.join(' ');
  });
  if(firstInvalid){firstInvalid.focus();firstInvalid.scrollIntoView?.({behavior:'smooth',block:'center'});return false;}
  return true;
}
function reviewPostCombatDiff(diffId,decisions){
  const diff=state.postCombatDiffs.find(candidate=>candidate.diffId===diffId&&candidate.status==='pending');
  const recordIndex=characterRecords.findIndex(record=>record.characterId===diff?.characterId);
  if(!diff||recordIndex<0)return message('候选差异或对应长期角色卡已不存在。','error');
  const record=characterRecords[recordIndex];
  if(record.status==='archived')return message('该长期角色卡已归档；请先恢复角色，或废除本份候选差异。','warn');
  if(record.currentRevision!==diff.characterRevision)return message(`该候选基于修订 ${diff.characterRevision}，长期角色当前为修订 ${record.currentRevision}；不能覆盖较新修订，请废除本份候选差异。`,'warn');
  const recordsBefore=clone(characterRecords),stateBefore=clone(state);
  try{
    const result=applyPostCombatDecisions(characterRecords[recordIndex],diff,decisions,{timestamp:now});
    const candidateRecords=clone(characterRecords);candidateRecords[recordIndex]=result.record;persistCharacterRecords(candidateRecords);characterRecords=candidateRecords;
    const correctedEntryIds=decisions.filter(item=>item.action==='correct').map(item=>item.entryId);
    diff.entries=diff.entries.map(entry=>({...entry,status:result.acceptedEntryIds.includes(entry.id)?(correctedEntryIds.includes(entry.id)?'corrected':'accepted'):'rejected'}));diff.status=result.revision?'applied':'declined';diff.decidedAt=now();
    const event=emit('character.writeback.confirmed',{diffId:diff.diffId,characterId:diff.characterId,fromRevision:diff.characterRevision,toRevision:result.revision?.revision||diff.characterRevision,decisions:clone(decisions),acceptedEntryIds:result.acceptedEntryIds,correctedEntryIds,rejectedEntryIds:diff.entries.filter(entry=>entry.status==='rejected').map(entry=>entry.id)},{manual:true,reason:'DM 逐项审核、拒绝或更正战后候选差异'});diff.decisionEventId=event.id;state.ui.message=result.revision?`已按 DM 决定建立 ${diff.characterName} 修订 ${result.revision.revision}；拒绝字段未写入。`:`已确认全部候选字段不写入；${diff.characterName} 仍保持修订 ${diff.characterRevision}。`;state.ui.messageKind='';persist();render();
  }catch(error){characterRecords=recordsBefore;state=stateBefore;try{persistCharacterRecords(recordsBefore);}catch{}state.ui.message=`战后差异未写入：${error.message}`;state.ui.messageKind='error';try{persist();}catch{}render();}
}
function abandonPostCombatDiffReview(diffId){
  const index=state.postCombatDiffs.findIndex(candidate=>candidate.diffId===diffId&&candidate.status==='pending');
  if(index<0)return message('候选差异已不存在或已经处理。','warn');
  const diff=state.postCombatDiffs[index];
  if(!confirm(`废除 ${diff.characterName} 的这份战后候选差异？本操作不会修改长期角色卡，且不能撤回为待审核状态。`))return;
  const reason='DM 废除本份战后候选差异；不修改长期角色卡或既有战斗日志';
  const stateBefore=clone(state),before=checkpoint();
  try{
    state.postCombatDiffs[index]=abandonPostCombatDiff(diff,{timestamp:now,reason});
    const event=emit('character.writeback.abandoned',{diffId:diff.diffId,characterId:diff.characterId,combatantId:diff.combatantId,fromRevision:diff.characterRevision,currentRevision:characterRecords.find(record=>record.characterId===diff.characterId)?.currentRevision||null,entryIds:diff.entries.map(entry=>entry.id)},{manual:true,before,reason});
    state.postCombatDiffs[index].decisionEventId=event.id;
    state.ui.message=`已废除 ${diff.characterName} 的本份战后候选差异；长期角色卡未修改。`;state.ui.messageKind='warn';persist();render();
  }catch(error){state=stateBefore;state.ui.message=`候选差异未废除：${error.message}`;state.ui.messageKind='error';persist();render();}
}
function confirmEncounter(){
  if(state.encounter?.phase!=='preparation')return;if(!state.encounter.members.length)return message('请先从单位库或角色页加入至少一个单位。','warn');
  const deployed=state.encounter.members.filter(member=>member.deployment!=='reserve');if(!deployed.length)return message('请至少安排一名单位在开战时投入战场；其余可标为场外预备。','warn');
  const invalid=deployed.map(member=>({member,plan:placementPlan(member,member.position,deployed.filter(other=>other.id!==member.id))})).find(item=>!item.plan.valid);
  if(invalid)return message(`无法确认遭遇：${displayName(invalid.member)} ${invalid.plan.reasons.join('；')}。请先完成第 0 回合摆放。`,'warn');
  command('encounter.confirmed',{encounterId:state.encounter.id,memberIds:state.encounter.members.map(member=>member.id),reserveIds:state.encounter.members.filter(member=>member.deployment==='reserve').map(member=>member.id),linkedEntityMappings:state.encounter.members.filter(member=>member.linkedEntityProjection).map(member=>({memberId:member.id,linkedEntityProjectionId:member.linkedEntityProjection.projectionId,sourceCombatProjectionId:member.linkedEntityProjection.sourceCombatProjectionId,linkedEntityId:member.linkedEntityProjection.linkedEntityRef.id,templateId:member.linkedEntityProjection.unitTemplateRef.templateId})),controlledEntityMappings:state.encounter.members.filter(member=>member.controlledEntityProjection).map(member=>({memberId:member.id,...member.controlledEntityProjection}))},()=>{state.encounter.preparationSnapshot=clone(state.encounter.members);state.combatants=deployed.map(member=>{const combatant=materializeCombatant(member,uid());member.deployedCombatantId=combatant.id;ensureFacing(combatant);return combatant;});for(const member of deployed.filter(item=>item.controlledEntityProjection)){const combatant=state.combatants.find(item=>item.id===member.deployedCombatantId),controller=state.combatants.find(item=>item.combatProjectionId===member.controlledEntityProjection.sourceCombatProjectionId);if(combatant&&controller)combatant.controllerLink={controlledEntityId:member.controlledEntityProjection.controlledEntityId,controllerCombatantId:controller.id,controllerCharacterRef:clone(member.controlledEntityProjection.controllerCharacterRef),controllerName:controller.name,effectLabel:member.controlledEntityProjection.effectLabel,commandRangeFeet:member.controlledEntityProjection.commandRangeFeet,duration:clone(member.controlledEntityProjection.duration),status:member.controlledEntityProjection.status,history:[{eventId:member.controlledEntityProjection.projectionId,type:'re-materialized',at:now(),round:0,status:member.controlledEntityProjection.status,reason:'从控制者 CharacterSheet 的正式受控关系创建本场独立实例'}]};}state.characters=state.combatants.filter(combatant=>combatant.kind==='character').map(combatant=>({id:uid(),combatantId:combatant.id,name:combatant.name,baseline:{hp:combatant.hp,resources:clone(combatant.resources),slots:clone(combatant.slots)}}));state.turn={round:0,index:-1,order:[],started:false};state.encounter.phase='confirmed';state.encounter.confirmedAt=now();state.ui.selectedId=state.combatants[0]?.id||null;state.ui.range=null;},{reason:'DM 确认遭遇；第 0 回合准备结束'});
}
function abandonPreparation(){if(state.encounter?.phase!=='preparation')return;if(!confirm('放弃当前未确认的遭遇准备？这不会影响任何已确认战斗。'))return;const removedProjectionIds=new Set(state.encounter.members.map(member=>member.combatProjectionId).filter(Boolean));state.combatProjections=state.combatProjections.filter(projection=>!removedProjectionIds.has(projection.projectionId));state.encounter.members=[];state.ui.selectedId=null;persist();render();}
function requestEndCombat(){
  if(combatEnded())return message('这场战斗已经结束；记录仍可在日志页查看或导出。','warn');
  if(state.turn.round<1)return message('请先完成先攻并正式开始战斗。','warn');
  state.ui.endCombatConfirm={onField:onFieldTokens().length,away:state.combatants.filter(c=>c.presenceStatus==='temporarily-away'&&c.participationStatus==='active').length,reserves:state.encounter.members.filter(member=>member.deployment==='reserve'&&!member.deployedCombatantId).length,draft:(state.ui.entryDraft?1:0)+(state.ui.reentryDraft?1:0)+entryPlacementItems().length,hasLinkedCharacters:state.combatants.some(combatant=>combatant.combatProjectionId)};
  persist();render();
}
function confirmEndCombat(save=false){
  const ending=state.ui.endCombatConfirm;if(!ending||combatEnded())return;
  let diffCount=0;
  const payload={encounterId:state.encounter.id,round:state.turn.round,onField:ending.onField,away:ending.away,reserves:ending.reserves,discardedEntryDrafts:ending.draft,saved:save,clearBattlefield:false,linkedCharacterReviewRequired:ending.hasLinkedCharacters};
  command('combat.ended',payload,()=>{payload.controlledDurationChanges=decrementControlledDurations('encounters');state=finalizeCombatSession(state,{timestamp:now(),clearBattlefield:false});diffCount=generatePostCombatDiffs();state.ui.endCombatConfirm=null;state.ui.postCombatCleanup=true;},{reason:'DM 在页面内确认结束战斗；统一收口参战对象'});
  if(save)exportJson();
  message(diffCount?`战斗已结束；已生成 ${diffCount} 份候选差异。请在“角色”页逐项审核，审核前不会改写长期角色卡。`:'战斗已结束；当前为只读战后清理，可撤下棋子或开始新遭遇。');
}
function entryTemplateById(id){return encounterTemplateById(id);}
function entryDraftFor(template, reserveMemberId=null, stagedItem=null){
  const member=reserveMemberId?state.encounter.members.find(item=>item.id===reserveMemberId):null,c=stagedItem?.combatant;
  const footprint={widthCells:(c?.footprint?.widthCells||template.footprint?.[0]||1),heightCells:(c?.footprint?.heightCells||template.footprint?.[1]||1)};
  const occupied=[...onFieldCombatants(),...entryPlacementItems().filter(item=>item!==stagedItem).map(placementCombatant)],position=clone(c?.position||firstFreeFootprintPosition(footprint,occupied,state.settings)||{x:0,y:0});
  return {id:uid(),templateId:template.id,templateSnapshot:clone(c?.templateSnapshot||member?.templateSnapshot||template),reserveMemberId:reserveMemberId||stagedItem?.reserveMemberId||null,stagedItemId:stagedItem?.combatant.id||null,stagedItem:stagedItem?clone(stagedItem):null,name:c?.name||member?.name||template.name,displayOrdinal:c?.displayOrdinal||null,relation:c?.relation||member?.relation||template.relation,hp:c?.hp??member?.hp??template.maxHp,resources:clone(c?.resources||member?.resources||template.resources||{}),slots:clone(c?.slots||member?.slots||template.slots||{}),conditions:[...(c?.conditions||member?.conditions||[])],position,initiativeMode:stagedItem?.initiativeMode||'roll',initiativeModifier:normalizeInitiativeModifier(stagedItem?.initiativeModifier??c?.initiativeModifier??member?.initiativeModifier??template.initiativeModifier,template.initiative),initiativeRoll:stagedItem?.initiativeRoll??c?.initiativeRoll??null,initiative:c?.initiative??'',tiePlacement:stagedItem?.tiePlacement||'after'};
}
function draftEntryFromTemplate(template, reserveMemberId=null){if(!template||combatEnded()||!state.turn.started)return message('只有已开始且未结束的战斗可临时加入单位。','warn');if(state.ui.entryDraft)return message('请先确认或放弃当前正在编辑的加入草稿。','warn');state.ui.entryDraft=entryDraftFor(template,reserveMemberId);selectWorkspaceForDomain('战斗');persist();render();}
function draftReserveEntry(memberId){const member=state.encounter.members.find(item=>item.id===memberId);if(!member||member.deployment!=='reserve'||member.deployedCombatantId)return;draftEntryFromTemplate(member.templateSnapshot,memberId);}
function initiativeOrderWith(candidate, tiePlacement='after',excludedIds=[]){const currentId=active()?.id||null,prior=new Map(state.turn.order.map((id,index)=>[id,index]));const all=[...state.combatants.filter(c=>c.id!==candidate.id&&!excludedIds.includes(c.id)),candidate];const order=all.sort((a,b)=>b.initiative-a.initiative||((a.id===candidate.id?tiePlacement==='before'?-1:1:prior.get(a.id)??999)-(b.id===candidate.id?tiePlacement==='before'?-1:1:prior.get(b.id)??999))||a.name.localeCompare(b.name)).map(c=>c.id);const currentIndex=currentId?order.indexOf(currentId):-1;return {order,currentId,currentIndex,candidateIndex:order.indexOf(candidate.id)};}
function entryItemFromDraft(draft, values=null){
  const read=name=>values?values.get(name):draft[name],position=values?{x:Math.max(0,Math.floor(Number(read('x'))||0)),y:Math.max(0,Math.floor(Number(read('y'))||0))}:clone(draft.position),template=clone(draft.templateSnapshot),member=createEncounterMember(template,uid(),position),pendingCombatants=entryPlacementItems().map(item=>item.combatant),numbered=[...state.combatants,...pendingCombatants];
  ensureDisplayOrdinals(numbered);member.name=String(read('name')||draft.name).trim()||draft.name;member.displayOrdinal=draft.displayOrdinal||nextDisplayOrdinal(member.name,numbered);member.relation=read('relation')||draft.relation;member.hp=Math.max(0,Math.min(member.maxHp,Math.floor(Number(read('hp'))||draft.hp)));member.resources=values?parseResources(read('resources')):clone(draft.resources);member.resourceMax=clone(member.resources);member.slots=clone(draft.slots||{});member.slotsMax=clone(draft.slots||{});member.conditions=values?String(read('conditions')||'').split(/[，,;；]/).map(text=>text.trim()).filter(Boolean):[...(draft.conditions||[])];
  const combatant=materializeCombatant(member,uid());ensureFacing(combatant);const initiativeMode=read('initiativeMode')||'roll',pending=!values&&initiativeMode==='roll',resolved=pending?{configured:false,mode:'roll',roll:null,modifier:normalizeInitiativeModifier(read('initiativeModifier')),total:null}:resolveInitiative({mode:initiativeMode,modifier:read('initiativeModifier'),roll:initiativeMode==='roll'?Math.floor(Math.random()*20)+1:null,manualTotal:read('initiative')});combatant.initiativeModifier=resolved.modifier;combatant.initiativeRoll=resolved.roll;combatant.initiativeMode=resolved.mode;combatant.initiative=resolved.total;
  return {kind:'join',combatant,reserveMemberId:draft.reserveMemberId||null,tiePlacement:read('tiePlacement')==='before'?'before':'after',initiativeMode:resolved.mode,initiativeModifier:resolved.modifier,initiativeRoll:resolved.roll,initiativeConfigured:resolved.configured};
}
function stageEntryItem(item,{destination='battle',notice}={}){const plan=placementPlan(item.combatant,item.combatant.position,[...onFieldCombatants(),...pendingPlacementCombatants()]);if(!plan.valid)return message(`不能准备投入：${plan.reasons.join('；')}。请修改坐标后再确认。`,'warn');state.ui.entryPlacement={items:[...entryPlacementItems(),item]};state.ui.entryDraft=null;state.ui.selectedId=null;if(destination==='map')selectWorkspaceForDomain('地图');else if(destination==='battle')selectWorkspaceForDomain('战斗');const resolvedNotice=typeof notice==='function'?notice():notice;message(resolvedNotice||`已暂存 ${displayName(item.combatant)}，当前待入场 ${entryPlacementItems().length} 个。`);}
function stageTemplateEntry(template){if(!template||combatEnded()||!state.turn.started)return message('只有已开始且未结束的战斗可临时加入单位。','warn');if(state.ui.entryDraft)return message('请先确认或放弃当前正在编辑的加入草稿。','warn');const item=entryItemFromDraft(entryDraftFor(template));stageEntryItem(item,{destination:'keep',notice:()=>`已添加 ${displayName(item.combatant)}，当前待入场 ${entryPlacementItems().length} 个。`});}
function editStagedEntry(id){const stagedItem=entryPlacementItems().find(item=>item.combatant.id===id);if(!stagedItem)return;state.ui.entryPlacement={items:entryPlacementItems().filter(item=>item!==stagedItem)};if(!state.ui.entryPlacement.items.length)state.ui.entryPlacement=null;state.ui.entryDraft=entryDraftFor(stagedItem.combatant.templateSnapshot,stagedItem.reserveMemberId,stagedItem);selectWorkspaceForDomain('战斗');persist();render();}
function editStagedReentry(id){const item=entryPlacementItems().find(entry=>entry.kind==='reentry'&&entry.combatant.id===id);if(!item)return;state.ui.entryPlacement={items:entryPlacementItems().filter(entry=>entry!==item)};if(!state.ui.entryPlacement.items.length)state.ui.entryPlacement=null;state.ui.reentryDraft={combatantId:id,position:clone(item.position),initiativeMode:item.initiativeMode||'keep',initiativeModifier:normalizeInitiativeModifier(item.initiativeModifier,item.combatant.initiativeModifier),initiative:item.initiative??item.combatant.initiative??0,tiePlacement:item.tiePlacement||'after'};selectWorkspaceForDomain('战斗');persist();render();}
function confirmEntryDraft(form,destination='map'){
  const draft=state.ui.entryDraft;if(!draft||combatEnded()||!state.turn.started)return;
  const item=entryItemFromDraft(draft,new FormData(form));stageEntryItem(item,{destination,notice:()=>destination==='map'?`已暂存 ${displayName(item.combatant)}，已进入地图摆放。`:`已暂存 ${displayName(item.combatant)}，当前待入场 ${entryPlacementItems().length} 个。`});
}
function updateEntryPlacementPosition(id,position){
  const item=entryPlacementItems().find(entry=>entry.combatant.id===id),c=placementCombatant(item);if(!item||!c)return;
  const candidates=[...onFieldCombatants(),...entryPlacementItems().filter(entry=>entry.combatant.id!==id).map(placementCombatant)];
  const plan=placementPlan(c,position,candidates);
  if(!plan.valid)return message(`摆放未提交：${plan.reasons.join('；')}。`,'warn');
  if(item.kind==='reentry')item.position=position;else item.combatant.position=position;persist();render();
}
function initiativePlanForEntryBatch(items){
  const currentId=active()?.id||null,prior=new Map(state.turn.order.map((id,index)=>[id,index])),batchRank=new Map(items.map((item,index)=>[item.combatant.id,index]));
  const transformedSourceIds=new Set(items.filter(item=>item.kind==='transformation').map(item=>item.sourceCombatantId));
  const candidates=items.filter(item=>item.kind!=='reentry').map(item=>item.combatant),all=[...state.combatants.filter(c=>!transformedSourceIds.has(c.id)),...candidates];
  const itemById=new Map(items.map(item=>[item.combatant.id,item]));
  const order=all.sort((a,b)=>{
    const initiativeFor=combatant=>itemById.get(combatant.id)?.initiative??combatant.initiative;
    if(initiativeFor(b)!==initiativeFor(a))return initiativeFor(b)-initiativeFor(a);
    const rankFor=combatant=>{const item=itemById.get(combatant.id);return item?(item.tiePlacement==='before'?-1000:1000)+(batchRank.get(combatant.id)||0):(prior.get(combatant.id)??0);};
    return rankFor(a)-rankFor(b)||a.name.localeCompare(b.name);
  }).map(c=>c.id);
  const currentIndex=currentId?order.indexOf(currentId):-1;
  items.forEach(item=>{const index=order.indexOf(item.combatant.id),eligibleFromRound=index>currentIndex?state.turn.round:state.turn.round+1;item.eligibleFromRound=eligibleFromRound;if(item.kind!=='reentry')item.combatant.eligibleFromRound=eligibleFromRound;});
  return {order,currentId};
}
function rollPendingEntryInitiatives({silent=false}={}){
  const pending=entryPlacementItems().filter(item=>item.kind==='join'&&item.initiativeMode==='roll'&&!item.initiativeConfigured);
  pending.forEach(item=>{const roll=Math.floor(Math.random()*20)+1,resolved=resolveInitiative({mode:'roll',modifier:item.initiativeModifier,roll});item.initiativeConfigured=true;item.initiativeRoll=resolved.roll;item.initiativeModifier=resolved.modifier;item.combatant.initiativeRoll=resolved.roll;item.combatant.initiativeModifier=resolved.modifier;item.combatant.initiativeMode='roll';item.combatant.initiative=resolved.total;});
  if(!pending.length)return 0;
  persist();if(!silent)message(`已为 ${pending.map(item=>displayName(item.combatant)).join('、')} 投先攻。`);return pending.length;
}
function confirmEntryPlacement(){
  const items=entryPlacementItems();if(!items.length||combatEnded()||!state.turn.started)return;
  const pendingInitiative=items.filter(item=>item.kind==='join'&&item.initiativeMode==='roll'&&!item.initiativeConfigured);if(pendingInitiative.length){if(!confirm(`本批还有 ${pendingInitiative.length} 个单位待投先攻。现在为它们批量投 1d20 + 调整值并继续确认？`))return;rollPendingEntryInitiatives({silent:true});return confirmEntryPlacement();}
  const invalid=items.map(item=>{const c=placementCombatant(item);return {item,plan:placementPlan(c,c.position,[...onFieldCombatants(),...items.filter(other=>other!==item).map(placementCombatant)])};}).find(result=>!result.plan.valid);
  if(invalid)return message(`无法投入 ${displayName(invalid.item.combatant)}：${invalid.plan.reasons.join('；')}。`,'warn');
  const initiativePlan=initiativePlanForEntryBatch(items),names=items.map(item=>displayName(item.combatant)),joined=items.filter(item=>item.kind==='join'),reentered=items.filter(item=>item.kind==='reentry'),transformed=items.filter(item=>item.kind==='transformation');
  command('combatant.batch-deployed',{batch:true,joined:joined.map(item=>({id:item.combatant.id,templateId:item.combatant.templateId,reserveMemberId:item.reserveMemberId,initiative:item.combatant.initiative,tiePlacement:item.tiePlacement,eligibleFromRound:item.eligibleFromRound,position:item.combatant.position})),reentered:reentered.map(item=>({id:item.combatant.id,initiative:item.initiative,initiativeMode:item.initiativeMode,tiePlacement:item.tiePlacement,eligibleFromRound:item.eligibleFromRound,position:item.position})),transformed:transformed.map(item=>({sourceCombatantId:item.sourceCombatantId,replacementId:item.combatant.id,templateId:item.combatant.templateId,initiative:item.combatant.initiative,tiePlacement:item.tiePlacement,eligibleFromRound:item.eligibleFromRound,position:item.combatant.position}))},()=>{
    joined.forEach(item=>{const c=item.combatant;state.combatants.push(c);if(item.reserveMemberId){const reserve=state.encounter.members.find(member=>member.id===item.reserveMemberId);if(reserve){reserve.deployedCombatantId=c.id;reserve.deployment='deployed';}}if(c.kind==='character')state.characters.push({id:uid(),combatantId:c.id,name:c.name,baseline:{hp:c.hp,resources:clone(c.resources),slots:clone(c.slots)}});});
    reentered.forEach(item=>{const c=item.combatant;c.position=clone(item.position);c.initiative=item.initiative;c.initiativeModifier=item.initiativeModifier;c.initiativeRoll=item.initiativeRoll;c.initiativeMode=item.initiativeMode;c.eligibleFromRound=item.eligibleFromRound;c.presenceStatus='on-field';});
    transformed.forEach(item=>{const source=getCombatant(item.sourceCombatantId),c=item.combatant;if(source){source.lifeStatus='transformed';source.participationStatus='ended';source.presenceStatus='temporarily-away';source.deathRecord={...(source.deathRecord||{}),transformedIntoId:c.id};}c.transformationOrigin={combatantId:item.sourceCombatantId,name:source?.name||'未知遗骸'};state.combatants.push(c);});
    state.turn.order=initiativePlan.order;state.turn.index=initiativePlan.currentId?initiativePlan.order.indexOf(initiativePlan.currentId):initiativePlan.order.findIndex(id=>isTurnEligible(state.combatants.find(c=>c.id===id)));state.ui.entryPlacement=null;state.ui.selectedId=items[0].combatant.id;
  },{reason:`DM 确认本批 ${items.length} 个单位投入/再次入场`});
  message(`已批量确认：${names.join('、')}。`);
}
function advanceTurnInternal(){const result=nextEligibleTurn(state.turn.order,state.turn.index,state.combatants,state.turn.round),controlledDurationChanges=[];if(result.round>state.turn.round){state.turn.round=result.round;expireEffects();controlledDurationChanges.push(...decrementControlledDurations('rounds'));}if(result.waiting){state.turn.index=-1;state.turn.started=true;state.ui.selectedId=null;state.ui.message='当前没有可行动的在场单位；战斗处于等待增援状态，可投入预备单位、临时加载单位或结束战斗。';return {controlledDurationChanges};}state.turn.index=result.index;const next=active();if(next){resetTurn(next);state.ui.selectedId=next.id;state.ui.referenceAction=null;}else{state.turn.index=-1;state.turn.started=true;state.ui.selectedId=null;state.ui.message='当前没有可行动的在场单位；战斗处于等待增援状态，可投入预备单位、临时加载单位或结束战斗。';}return {controlledDurationChanges};}
function advanceAfterActiveDefeat(activeId){if(!activeId||state.turn.order[state.turn.index]!==activeId||getCombatant(activeId)?.hp>0)return false;state.turn.index=Math.max(-1,state.turn.index-1);advanceTurnInternal();return true;}
function temporarilyLeave(id){const c=getCombatant(id);if(!c||combatEnded()||c.participationStatus!=='active'||c.presenceStatus!=='on-field')return;const current=active()?.id===id,clearedPreview={tempHp:c.tempHp||0,conditions:[...(c.conditions||[])],effects:[...new Set(state.effects.filter(effect=>effect.targetIds?.includes(id)||(effect.concentration&&effect.sourceCombatantId===id)).map(effect=>effect.name))]};command('combatant.left-temporarily',{id,clearedTemporaryState:clearedPreview,preserved:{hp:c.hp,resources:clone(c.resources),slots:clone(c.slots)}},()=>{clearTemporaryCombatState(state,id);c.presenceStatus='temporarily-away';state.ui.selectedId=null;if(current){state.turn.index=Math.max(-1,state.turn.index-1);advanceTurnInternal();}},{reason:'DM 确认单位暂时离场；清除临时 HP、状态、Buff、Debuff 与专注，保留当前 HP、资源和法术位'});}
function endParticipation(id){const c=getCombatant(id);if(!c||combatEnded()||c.participationStatus!=='active')return;const current=active()?.id===id;command('combatant.participation.ended',{id},()=>{c.participationStatus='ended';c.presenceStatus='temporarily-away';state.ui.selectedId=null;if(current){state.turn.index=Math.max(-1,state.turn.index-1);advanceTurnInternal();}},{reason:'DM 结束该单位本场参战'});}
function draftReentry(id){const c=getCombatant(id);if(!c||combatEnded()||c.presenceStatus!=='temporarily-away'||c.participationStatus!=='active')return;if(c.hp<=0)return message(`${displayName(c)} 当前 HP 为 0，不能恢复正常行动；请先由 DM 明确处理 HP。`,'warn');if(state.ui.entryDraft||state.ui.reentryDraft)return message('请先确认或放弃当前正在编辑的投入草稿。','warn');if(entryPlacementItems().some(item=>item.kind==='reentry'&&item.combatant.id===id))return message(`${displayName(c)} 已在待投入批次中，可前往地图摆放。`,'warn');const occupied=[...onFieldCombatants(),...pendingPlacementCombatants()],position=firstFreeFootprintPosition(c.footprint,occupied,state.settings)||clone(c.position);state.ui.reentryDraft={combatantId:id,position,initiativeMode:'keep',initiativeModifier:normalizeInitiativeModifier(c.initiativeModifier,c.templateSnapshot?.initiativeModifier),initiative:c.initiative??0,tiePlacement:'after'};selectWorkspaceForDomain('战斗');persist();render();}
function stageReentryDraft(form,destination='map'){const draft=state.ui.reentryDraft,c=getCombatant(draft?.combatantId);if(!draft||!c||combatEnded()||c.participationStatus!=='active'||c.presenceStatus!=='temporarily-away')return;if(c.hp<=0)return message(`${displayName(c)} 当前 HP 为 0，不能再次入场并获得行动资格。`,'warn');const values=new FormData(form),position={x:Math.max(0,Math.floor(Number(values.get('x'))||0)),y:Math.max(0,Math.floor(Number(values.get('y'))||0))},initiativeMode=values.get('initiativeMode')||'keep',initiativeModifier=normalizeInitiativeModifier(values.get('initiativeModifier'),c.initiativeModifier),initiativeRoll=initiativeMode==='reroll'?Math.floor(Math.random()*20)+1:null,initiative=initiativeMode==='reroll'?initiativeRoll+initiativeModifier:initiativeMode==='manual'?Math.trunc(Number(values.get('initiative'))||0):c.initiative??0,item={kind:'reentry',combatant:c,position,initiativeMode,initiativeModifier,initiativeRoll,initiative,tiePlacement:values.get('tiePlacement')==='before'?'before':'after'};const plan=placementPlan(placementCombatant(item),position,[...onFieldCombatants(),...pendingPlacementCombatants()]);if(!plan.valid)return message(`不能准备再次入场：${plan.reasons.join('；')}。请修改坐标后再确认。`,'warn');state.ui.entryPlacement={items:[...entryPlacementItems(),item]};state.ui.reentryDraft=null;state.ui.selectedId=null;selectWorkspaceForDomain(destination==='map'?'地图':'战斗');message(`已暂存 ${displayName(c)} 再入场，当前待投入 ${entryPlacementItems().length} 个。`);}
function cleanupToken(id){if(!combatEnded()||!state.ui.postCombatCleanup)return;const c=getCombatant(id);if(!c||c.cleanupRemoved)return;command('battlefield.token.removed',{id},()=>{c.cleanupRemoved=true;if(state.ui.selectedId===id)state.ui.selectedId=null;},{reason:'战后清理：DM 撤下棋子'});}
function cleanupEnemies(){if(!combatEnded()||!state.ui.postCombatCleanup)return;const ids=state.combatants.filter(c=>c.relation==='enemy'&&!c.cleanupRemoved).map(c=>c.id);if(!ids.length)return message('没有仍在地图上的敌对单位。','warn');command('battlefield.enemies.removed',{ids},()=>{state.combatants.forEach(c=>{if(ids.includes(c.id))c.cleanupRemoved=true;});},{reason:'战后清理：撤下全部敌对单位'});}
/* superseded initiative implementation
function startInitiative() { if(state.encounter?.phase!=='confirmed')return message('请先在第 0 回合确认遭遇。','warn'); command('initiative.rolled',{mode:'deterministic-fixture'},()=>{ state.combatants.forEach(c=>{const score={ 'pc-monk':18,'pc-wizard':18,beholder:16,scout:14,priest:13,mage:12,'goblin-warrior':12,'fire-giant':10 }[c.templateId]??10;c.initiative=score;}); const pcs=state.combatants.filter(c=>c.kind==='character').map(c=>c.id),mage=state.combatants.filter(c=>c.templateId==='mage').map(c=>c.id),goblins=state.combatants.filter(c=>c.initiativeGroupId==='goblin-group').map(c=>c.id);const pendingTieGroups=[{id:'pc-tie',label:'两名 PC 同值：由玩家决定顺序（DM 代录）',authority:'玩家决定',ids:pcs},{id:'dm-tie',label:'魔法师与地精组同值：由 DM 决定顺序',authority:'DM 决定',ids:[...mage,...goblins]}];state.ui.tieOrders=Object.fromEntries(pendingTieGroups.map(group=>[group.id,[...group.ids]]));state.turn={round:0,index:-1,order:[],started:false,pendingTieGroups}; },{rulesReference:['PHB2024:combat-initiative']}); }
function startInitiative(){if(state.encounter?.phase!=='confirmed')return message('请先在第 0 回合确认遭遇。','warn');const fixture=state.encounter?.migratedFrom==='v0.1.0-fixture';command('initiative.rolled',{mode:fixture?'deterministic-fixture':'dm-local-d20'},()=>{state.combatants.forEach(c=>{const fixed={'pc-monk':18,'pc-wizard':18,beholder:16,scout:14,priest:13,mage:12,'goblin-warrior':12,'fire-giant':10}[c.templateId];c.initiative=fixture?(fixed??10):Math.floor(Math.random()*20)+1;});const byScore=Object.groupBy?Object.groupBy(state.combatants,c=>c.initiative):state.combatants.reduce((groups,c)=>{(groups[c.initiative]??=[]).push(c);return groups;},{});const pendingTieGroups=Object.entries(byScore).filter(([,items])=>items.length>1).map(([score,items])=>({id:`initiative-${score}`,label:`先攻 ${score} 同值：由 DM 决定顺序`,authority:'DM 决定',ids:items.map(c=>c.id)}));state.ui.tieOrders=Object.fromEntries(pendingTieGroups.map(group=>[group.id,[...group.ids]]));if(pendingTieGroups.length){state.turn={round:0,index:-1,order:[],started:false,pendingTieGroups};return;}state.turn.order=[...state.combatants].sort((a,b)=>b.initiative-a.initiative||a.name.localeCompare(b.name)).map(c=>c.id);state.turn={round:1,index:0,order:state.turn.order,started:true,pendingTieGroups:[]};resetTurn(active());state.ui.selectedId=active()?.id||null;},{rulesReference:['PHB2024:combat-initiative']});}
*/
function startInitiative(){if(state.encounter?.phase!=='confirmed')return message('请先在第 0 回合确认遭遇。','warn');const fixture=state.encounter?.migratedFrom==='v0.1.0-fixture',payload={mode:fixture?'deterministic-fixture':'dm-local-d20-plus-modifier',results:[]};command('initiative.rolled',payload,()=>{state.combatants.forEach(c=>{const fixed={'pc-monk':18,'preset-pc-monk':18,'pc-wizard':18,'preset-pc-wizard':18,beholder:16,'ref-beholder':16,scout:14,'preset-scout':14,priest:13,'preset-priest':13,mage:12,'preset-mage':12,'goblin-warrior':12,'ref-goblin-minion':12,'fire-giant':10,'ref-fire-giant':10}[c.templateId],modifier=normalizeInitiativeModifier(c.initiativeModifier,c.templateSnapshot?.initiativeModifier??c.templateSnapshot?.initiative),roll=fixture?null:Math.floor(Math.random()*20)+1,total=fixture?(fixed??10):roll+modifier;c.initiativeModifier=modifier;c.initiativeRoll=roll;c.initiativeMode=fixture?'deterministic-fixture':'roll';c.initiative=total;payload.results.push({id:c.id,roll,modifier,total});});const groups=state.combatants.reduce((all,c)=>{(all[c.initiative]??=[]).push(c);return all;},{});const pendingTieGroups=Object.entries(groups).filter(([,items])=>items.length>1).map(([score,items])=>({id:`initiative-${score}`,label:`先攻 ${score} 同值：由 DM 决定顺序`,authority:'DM 决定',ids:items.map(c=>c.id)}));state.ui.tieOrders=Object.fromEntries(pendingTieGroups.map(group=>[group.id,[...group.ids]]));if(pendingTieGroups.length){state.turn={round:0,index:-1,order:[],started:false,pendingTieGroups};return;}const order=[...state.combatants].sort((a,b)=>b.initiative-a.initiative||a.name.localeCompare(b.name)).map(c=>c.id);state.turn={round:1,index:0,order,started:true,pendingTieGroups:[]};resetTurn(active());state.ui.selectedId=active()?.id||null;},{rulesReference:['PHB2024:combat-initiative','MM2025:initiative-modifier']});}
function moveTieItem(groupId,id,direction){const order=state.ui.tieOrders?.[groupId];if(!order)return;const index=order.indexOf(id),next=index+direction;if(index<0||next<0||next>=order.length)return;[order[index],order[next]]=[order[next],order[index]];persist();render();}
function confirmInitiative(){if(state.encounter?.phase!=='confirmed')return message('本场战斗已结束，不能再确认先攻。','warn');const groups=state.turn.pendingTieGroups||[];if(!groups.length)return message('当前没有待裁定的平局。','warn');const tieOrderById=Object.fromEntries(groups.flatMap(group=>(state.ui.tieOrders?.[group.id]||group.ids).map((id,index)=>[id,index])));command('initiative.tiebreak.resolved',{groups:groups.map(group=>({id:group.id,authority:group.authority,order:state.ui.tieOrders?.[group.id]||group.ids}))},()=>{state.turn.order=[...state.combatants].sort((a,b)=>b.initiative-a.initiative||(tieOrderById[a.id]??999)-(tieOrderById[b.id]??999)||a.name.localeCompare(b.name)).map(c=>c.id);state.turn={round:1,index:0,order:state.turn.order,started:true,pendingTieGroups:[]};state.ui.tieOrders={};resetTurn(active());state.ui.selectedId=active()?.id||null;state.ui.referenceAction=null;},{rulesReference:['PHB2024:combat-initiative'],reason:'固定先攻平局裁定'});}
function legendaryMax(c){ return c?.legendaryActionMax||templates.find(template=>template.id===c?.templateId)?.legendaryActionMax||0; }
function resetTurn(c) { if(!c)return; c.turnsStarted=(c.turnsStarted||0)+1;c.actionAvailable=true;c.bonusActionAvailable=true;c.reactionAvailable=true;c.movementRemaining=c.speed;const max=legendaryMax(c);if(max){c.legendaryActionMax=max;c.legendaryActions=max;} }
function expireSourceTurnEffects(sourceId){const source=getCombatant(sourceId),ordinal=source?.turnsStarted||0,expired=state.effects.filter(effect=>effect.expires?.anchor==='source-next-turn-end'&&effect.expires.sourceCombatantId===sourceId&&ordinal>=effect.expires.sourceTurnOrdinal);if(!expired.length)return;state.effects=state.effects.filter(effect=>!expired.includes(effect));state.ui.message=`${expired.map(effect=>effect.name).join('、')} 已在来源下一回合结束时到期。`;}
function nextTurn(){if(combatEnded())return message('本场战斗已结束。','warn');if(s2PlacementDraft||state.ui.entryPlacement||state.ui.entryDraft||state.ui.reentryDraft||state.ui.deathResolution||state.ui.endCombatConfirm)return message('请先完成或取消当前投入、地图摆放、再入场、死亡处理或结束确认，再推进回合。','warn');if(!state.turn.started)return message('请先掷先攻。','warn');if(!active()){const payload={skippedIneligible:true};return command('turn.advanced',payload,()=>Object.assign(payload,advanceTurnInternal()),{reason:'跳过 stable、dead、transformed、needs-review 或不在场单位；保留其状态记录'});}if(deathSaveRequired(active()))return message(`${displayName(active())} 的回合开始时必须先记录死亡豁免；该回合不能执行其他动作、附赠动作、反应或移动。`,'warn');const payload={};command('turn.advanced',payload,()=>{expireSourceTurnEffects(active()?.id);Object.assign(payload,advanceTurnInternal());});}
function deathEligible(c){return !!c&&c.hp===0&&c.kind!=='character'&&!isDead(c)&&!isTransformed(c);}
function declareDeathIfNeeded(id,reason){const c=getCombatant(id);if(!deathEligible(c))return false;let result;command('combatant.died',{id,reason,atRound:state.turn.round},()=>{result=declareCombatantDead(state,id,{atRound:state.turn.round,reason});},{reason:`DM 记录 ${displayName(c)} 死亡；仅适用于怪物/NPC，角色死亡豁免未自动实现`});message(`${displayName(c)} 已死亡，已退出行动轮。可在“当前选中者状态”处理复起或特殊转化。`,'warn');return !!result;}
function changeHp(id, delta, reason='DM 修改', manual=true, critical=false) {if(combatEnded())return message('本场战斗已结束，单位状态只读。','warn');const c=getCombatant(id);if(!c)return;if(isPc(c)){try{let result;const activeId=active()?.id,payload={id,delta,critical:!!critical,turnAdvancedAfterDefeat:false};command(delta<0?'pc.damage.resolved':'pc.healing.resolved',payload,()=>{result=delta<0?applyPcDamage(c,-delta,{critical,round:state.turn.round}):healPc(c,delta,{round:state.turn.round});Object.assign(payload,{outcome:result.outcome,input:result.input,before:result.before,after:result.after});if(delta<0&&result.outcome!=='damaged')payload.turnAdvancedAfterDefeat=advanceAfterActiveDefeat(activeId);},{manual,reason,rulesReference:delta<0?[V040_RULE_REFERENCES.zeroHp,V040_RULE_REFERENCES.deathSaves]:[V040_RULE_REFERENCES.zeroHp]});message(`${displayName(c)}：${lifeStatusLabel(c)} · HP ${c.hp}/${c.maxHp}。`);return;}catch(error){return message(error.message,'error');}}if(isDead(c)||isTransformed(c))return message('死亡或已转化单位不能通过普通治疗/伤害修改；请使用“处理死亡”。','warn');const before={hp:c.hp,tempHp:c.tempHp},activeId=active()?.id,payload={id,delta,turnAdvancedAfterDefeat:false};command(manual?'combatant.corrected':'combatant.hp.changed',payload,()=>{if(delta<0){let damage=-delta;const absorbed=Math.min(c.tempHp,damage);c.tempHp-=absorbed;damage-=absorbed;c.hp=Math.max(0,c.hp-damage);}else c.hp=Math.min(c.maxHp,c.hp+delta);payload.turnAdvancedAfterDefeat=advanceAfterActiveDefeat(activeId);},{manual,reason,before,after:{hp:c.hp,tempHp:c.tempHp}});declareDeathIfNeeded(id,reason);}
function submitDeathSave(id,roll,source='dm-manual'){const c=getCombatant(id);if(c?.id!==active()?.id||!deathSaveRequired(c))return message('只有当前回合的 0 HP 昏迷 PC 可以记录死亡豁免。','warn');try{let result;const payload={id,roll:Number(roll),source};command('pc.death-save.resolved',payload,()=>{result=recordDeathSave(c,roll,{round:state.turn.round,source});Object.assign(payload,{outcome:result.outcome,input:result.input,before:result.before,after:result.after});if(pcLifePhase(c)!=='active')advanceTurnInternal();},{rulesReference:[V040_RULE_REFERENCES.deathSaves,V040_RULE_REFERENCES.stable],reason:source==='terminal-d20'?'DM 使用 Terminal 投 d20 并记录死亡豁免':'DM 记录玩家角色回合开始时的手动最终 d20 死亡豁免结果'});message(`${displayName(c)} 死亡豁免：${result.outcome}；当前 ${lifeStatusLabel(c)}。`);}catch(error){message(error.message,'error');}}
function rollDeathSave(id){submitDeathSave(id,Math.floor(Math.random()*20)+1,'terminal-d20');}
function submitMedicalStabilization(targetId,checkTotal){const target=getCombatant(targetId),helper=active();if(!target||!helper||helper.id===target.id||!ordinaryActionsAllowed(helper)||!helper.actionAvailable)return message('医疗稳定需要由当前可行动且动作未消耗的其他单位施救。','warn');try{let result;const payload={targetId,helperId:helper.id,checkTotal:Number(checkTotal),actionSpent:true};command('pc.medical-stabilization.resolved',payload,()=>{result=medicallyStabilizePc(target,{helperId:helper.id,checkTotal:Number(checkTotal),actionSpent:true,round:state.turn.round});helper.actionAvailable=false;Object.assign(payload,{outcome:result.outcome,before:result.before,after:result.after});},{rulesReference:[V040_RULE_REFERENCES.stable],reason:'当前行动者消耗普通动作，DM 记录最终 Medicine 检定值'});message(`${displayName(helper)} 对 ${displayName(target)} 的医疗稳定${result.outcome==='stable'?'成功':'失败'}。`);}catch(error){message(error.message,'error');}}
function submitLifeCorrection(id,form){const c=getCombatant(id),values=new FormData(form);if(!c)return;try{const input={lifePhase:values.get('lifePhase'),hp:Number(values.get('hp')),reason:String(values.get('reason')||'')},wasCurrent=state.turn.order[state.turn.index]===id;command('pc.life-state.corrected',{id,...input},()=>{correctPcLifeState(c,{...input,round:state.turn.round});if(wasCurrent&&turnDisposition(c,state.turn.round)==='skip'){state.turn.index=Math.max(-1,state.turn.index-1);advanceTurnInternal();}},{manual:true,reason:input.reason});message(`${displayName(c)} 已由 DM 修正为${lifeStatusLabel(c)}，HP ${c.hp}/${c.maxHp}。该事件只修正记录，不自动证明复活或其他规则合法性。`);}catch(error){message(error.message,'error');}}
function standSelectedPc(id){const c=getCombatant(id);if(!c||!ordinaryActionsAllowed(c))return message('当前单位不能起立。','warn');try{let result;const payload={id};command('pc.prone.stood',payload,()=>{result=standPcUp(c,{round:state.turn.round});Object.assign(payload,{outcome:result.outcome,input:result.input,before:result.before,after:result.after});},{rulesReference:[V040_RULE_REFERENCES.prone],reason:'当前 PC 消耗速度一半起立，移除倒地状态'});message(`${displayName(c)} 已起立，消耗 ${result.input.requiredMovement} 尺移动力。`);}catch(error){message(error.message,'error');}}
function setTempHp(id, value, reason='DM 设置临时 HP') {if(combatEnded())return message('本场战斗已结束，单位状态只读。','warn');const c=getCombatant(id);if(!c)return;if(isDead(c)||isTransformed(c))return message('死亡或已转化单位不能设置临时 HP。','warn');const next=Math.max(0,Math.floor(Number(value)||0)),before={hp:c.hp,tempHp:c.tempHp};command('combatant.temp-hp.corrected',{id,from:c.tempHp,to:next},()=>{c.tempHp=next;},{manual:true,reason,before,after:{hp:c.hp,tempHp:next}}); }
function openDeathResolution(id,mode='menu'){const c=getCombatant(id);if(!isDead(c)||isPc(c)||combatEnded())return;state.ui.deathResolution={combatantId:id,mode};state.ui.selectedId=id;persist();render();}
function closeDeathResolution(){state.ui.deathResolution=null;persist();render();}
function eligibilityAfterRestoration(c,excludedIds=[]){const proposed=initiativeOrderWith(c,'after',excludedIds);c.eligibleFromRound=proposed.currentId&&proposed.candidateIndex<=proposed.currentIndex?state.turn.round+1:state.turn.round;state.turn.order=proposed.order;state.turn.index=proposed.currentId?proposed.order.indexOf(proposed.currentId):proposed.order.indexOf(c.id);if(!proposed.currentId)resetTurn(c);}
function dmExceptionRevive(id){const c=getCombatant(id);if(!isDead(c)||isPc(c)||combatEnded())return;if(!confirm(`以 1 HP 特许复起 ${displayName(c)}？\n\n这只适用于 DM 明确批准的极端叙事例外；不会恢复资源、法术位、临时 HP、状态或效果。`))return;command('combatant.revived.dm-exception',{id,hp:1,mode:'dm-exception'},()=>{c.lifeStatus='alive';c.hp=1;c.tempHp=0;c.conditions=[];c.deathRecord={...(c.deathRecord||{}),revivedBy:'dm-exception',revivedAtRound:state.turn.round};eligibilityAfterRestoration(c);state.ui.deathResolution=null;state.ui.selectedId=c.id;},{reason:'DM 特许复起：极端叙事例外，以 1 HP 恢复原实例；不自动裁定复活规则'});message(`${displayName(c)} 已以 1 HP 特许复起；是否能在本轮行动仍按先攻位置处理。`,'warn');}
function v060SpellContext(values,outcome){
  const spellId=String(values.get('spellId')||'');if(!spellId)throw new Error('请先选择法术或自定义依据。');
  const spell=spellForV060(outcome,spellId);
  const customBasis=String(values.get('customBasis')||'').trim();
  if(spell.id==='custom'&&!customBasis)throw new Error('使用自定义依据时必须填写 DM 依据。');
  const rulings=(spell.rulingFields||[]).map(field=>{
    const mode=String(values.get(`ruling:${field.id}:mode`)||''),definition=(V060_RULING_MODES[field.modes]||[]).find(item=>item.id===mode),value=String(values.get(`ruling:${field.id}:value`)||'').trim();
    if(!definition)throw new Error(`请完成“${field.label}”的裁定选择。`);
    if(definition.needsValue&&!value)throw new Error(`“${field.label}”选择${definition.label}时必须填写最终记录。`);
    return {id:field.id,label:field.label,suggested:field.suggested,mode,modeLabel:definition.label,value:definition.needsValue?value:field.suggested};
  });
  return {spellId:spell.id,spellName:spell.name,basisLabel:spell.id==='custom'?customBasis:spell.name,guidance:spell.summary,meta:spell.meta,rulings};
}
function v060OptionalRecord(values){
  return {casterCombatantId:String(values.get('casterCombatantId')||''),resourceHandling:String(values.get('resourceHandling')||'not-tracked'),resourceName:String(values.get('resourceName')||'').trim(),resourceAmount:Math.max(0,Math.floor(Number(values.get('resourceAmount'))||0)),materialHandling:String(values.get('materialHandling')||'not-tracked'),gentleReposeNote:String(values.get('gentleReposeNote')||'').trim(),timeNote:String(values.get('timeNote')||'').trim(),soulNote:String(values.get('soulNote')||'').trim(),rulesNote:String(values.get('rulesNote')||'').trim()};
}
function prepareV060OptionalResource(record){
  if(record.resourceHandling!=='sync')return null;
  const caster=getCombatant(record.casterCombatantId),pool=caster?.resources?.[record.resourceName];
  if(!caster||!record.resourceName||!Number.isInteger(pool)||record.resourceAmount<1||pool<record.resourceAmount)throw new Error('同步扣除资源需要选择在场单位、已追踪资源名称与足够数量。');
  return {caster,resourceName:record.resourceName,amount:record.resourceAmount};
}
function applyV060OptionalResource(record,prepared=prepareV060OptionalResource(record)){
  if(!prepared)return null;
  const {caster,resourceName,amount}=prepared;
  caster.resources[resourceName]-=amount;
  return {combatantId:caster.id,resourceName,amount};
}
function hasDeathReplacement(source){return Array.isArray(source?.deathRecord?.replacements)&&source.deathRecord.replacements.length>0;}
function requireDuplicateSourceConfirmation(source,values){if(hasDeathReplacement(source)&&values.get('duplicateSource')!=='confirmed')throw new Error('该遗体已有后继记录；如 DM 要覆盖，请勾选重复来源确认并填写原因。');}
function confirmPcReturnToLife(id,form){
  const c=getCombatant(id),values=new FormData(form);
  if(!c||!isPc(c)||!isDead(c)||combatEnded())return message('只有战斗未结束的死亡 PC 可以记录复活。','warn');
  try{
    const spell=v060SpellContext(values,'restore'),optional=v060OptionalRecord(values),reason=String(values.get('reason')||'').trim();
    if(!reason)throw new Error('必须填写 DM 原因。');
    const resourcePlan=prepareV060OptionalResource(optional);
    const payload={id,resolutionId:uid(),spell,optional,hp:Number(values.get('hp')),basisStatus:'dm-ruling',basisLabel:spell.basisLabel,soulReturn:'not-applicable',effectDisposition:String(values.get('effectDisposition')||'DM 未追踪').trim()||'DM 未追踪',conditionHandling:String(values.get('conditionHandling')||'preserve'),mapOutcome:'restore-original-token',initiativeOutcome:'restore-original-slot',reason};
    if(!confirm(`预览：恢复原实例“${displayName(c)}”\nHP：0 → ${payload.hp}\n地图：保留原棋子\n先攻：恢复原槽位；已越过则下轮\n依据：${spell.basisLabel}\n资源：${resourcePlan?`${resourcePlan.resourceName} -${resourcePlan.amount}`:'不变'}\n\n确认由 DM 提交？`))return;
    let result;command('pc.return-to-life.confirmed',payload,()=>{const resourceChange=applyV060OptionalResource(optional,resourcePlan);result=returnPcToLife(c,{...payload,round:state.turn.round});Object.assign(payload,{result:result.outcome,resourceChange,mapOutcome:result.input.mapOutcome,initiativeOutcome:result.input.initiativeOutcome,after:result.after});c.deathRecord.latestResolutionId=payload.resolutionId;c.deathRecord.v060Latest={outcome:'restore',spell,optional};eligibilityAfterRestoration(c);state.ui.selectedId=c.id;},{eventId:payload.resolutionId,manual:true,reason:payload.reason,rulesReference:[V040_RULE_REFERENCES.deathSaves]});message(`${displayName(c)} 已按 DM 确认恢复为 ${payload.hp} HP；${spell.spellName}仅作提示。`,'warn');
  }catch(error){message(error.message,'error');}
}
const S2_INHERITANCE_LABELS={identity:'身份、职业与起源',combat:'战斗基础',abilities:'六项属性',proficiencies:'豁免、技能、感官与语言',capabilities:'攻击、动作、特性与法术',equipment:'装备、容器与关联单位',resources:'次数资源',notes:'既有 DM 备注'};
function currentCharacterRecordForCombatant(combatant){
  const ref=combatant?.characterSheetRef;
  if(!ref?.characterId)return null;
  const record=characterRecords.find(item=>item.characterId===ref.characterId);
  if(!record||record.currentRevision!==ref.revision)return null;
  return record;
}
function s2Position(source){return clone(source.position);}
function s2Initiative(combatant,source,values){
  const mode=String(values.get('initiativeMode')||'keep'),modifier=normalizeInitiativeModifier(values.get('initiativeModifier'),combatant.initiativeModifier),roll=mode==='reroll'?Math.floor(Math.random()*20)+1:null;
  return { mode, modifier, roll, total:mode==='manual'?Math.trunc(Number(values.get('initiative'))||0):mode==='reroll'?roll+modifier:source.initiative??0, tiePlacement:values.get('tiePlacement')==='before'?'before':'after' };
}
function replacementPlacement(source,replacement){
  const candidates=[...mapTokenOccupants(),...pendingPlacementCombatants()];
  return placementPlan(replacement,replacement.position,candidates.filter(item=>item.id!==replacement.id));
}
function relationshipNote({slice,eventId,otherName,otherCharacterId,reason,disposition}){return `[v0.6.0 ${slice} / ${eventId}] ${reason}；关联角色：${otherName} (${otherCharacterId})；原卡处置：${disposition}。两张角色卡仅以本备注追溯，后续完全独立，不自动同步或互相归档。`;}
function formJson(values,key,fallback={}){try{return JSON.parse(String(values.get(key)||''));}catch{return fallback;}}
function createS2SuccessorCandidate(source,values,slice){
  if(!isPc(source)||!isDead(source)||combatEnded())throw new Error('S2A/S2C 仅可处理战斗未结束的死亡 PC。');
  const sourceRecord=currentCharacterRecordForCombatant(source);
  if(!sourceRecord)throw new Error('该死亡 PC 没有与当前长期角色卡修订匹配的 CombatProjection，不能猜测复制来源。请从长期角色卡重新生成投影后再进行 S2。');
  const name=String(values.get('name')||'').trim(),reason=String(values.get('reason')||'').trim(),bodyDescription=String(values.get('bodyDescription')||'').trim();
  const basisStatus=String(values.get('basisStatus')||''),basisLabel=String(values.get('basisLabel')||''),soulReturn=String(values.get('soulReturn')||'');
  if(!name||!reason||!bodyDescription||!basisLabel||!['verified-entry','dm-ruling','unverified'].includes(basisStatus)||!['confirmed','not-applicable'].includes(soulReturn))throw new Error('请完整记录新角色卡名称、身体/资料说明、依据、灵魂、原因与裁定状态。');
  if(slice==='S2A'&&values.get('playerControl')!=='confirmed')throw new Error('S2A 必须由 DM 明确确认新 PC 的玩家控制权。');
  const inheritance=values.getAll('inheritGroups').map(String),eventId=uid(),disposition=String(values.get('originalDisposition')||'keep-active'),mapOutcome=String(values.get('mapOutcome')||'');
  if(!['remove-corpse-token','retain-corpse-token'].includes(mapOutcome))throw new Error('必须明确记录旧尸体棋子的地图处理。');
  const v060={spell:formJson(values,'_v060Spell'),optional:formJson(values,'_v060Optional'),shape:String(values.get('_v060Shape')||'normal')};
  const preliminaryNote=`[v0.6.0 ${v060.shape} / ${eventId}] 从 ${source.name} 的死亡战斗实例创建。${bodyDescription}；DM 原因：${reason}。`;
  const successor=createIndependentSuccessorRecord(sourceRecord,{id:uid,timestamp:now,name,hp:Number(values.get('hp')),maxHp:Number(values.get('maxHp')),inheritGroups:inheritance,note:preliminaryNote,sourceNote:`DM 确认 ${slice} 的独立角色卡；继承组：${inheritance.join('、')||'无'}。`});
  const successorSheet=currentCharacterSheet(successor),successorNote=relationshipNote({slice,eventId,otherName:source.name,otherCharacterId:sourceRecord.characterId,reason,disposition});
  successor.revisions[0].note=[successor.revisions[0].note,successorNote].filter(Boolean).join('\n\n');
  const sourceSheet=currentCharacterSheet(sourceRecord),sourceNote=relationshipNote({slice,eventId,otherName:successorSheet.name,otherCharacterId:successor.characterId,reason,disposition});
  const revisedSource=reviseCharacterRecord(sourceRecord,{...sourceSheet,note:[sourceSheet.note,sourceNote].filter(Boolean).join('\n\n')},{timestamp:now}).record;
  const projection=createCombatProjection(currentCharacterSheet(successor),{id:uid,timestamp:now}),member=createEncounterMemberFromProjection(projection,{id:uid,position:s2Position(source)}),combatant=materializeCombatant(member,uid());
  combatant.name=successorSheet.name;combatant.displayOrdinal=nextDisplayOrdinal(combatant.name,[...state.combatants,...pendingPlacementCombatants()]);combatant.relation=String(values.get('relation')||'ally');combatant.lifePhase='active';combatant.lifeStatus='alive';combatant.deathReplacement={slice,eventId,sourceCombatantId:source.id,sourceCharacterId:sourceRecord.characterId,bodyDescription,basisStatus,basisLabel,soulReturn,reason,mapOutcome,originalDisposition:disposition,v060};ensureFacing(combatant);
  const initiative=s2Initiative(combatant,source,values);combatant.initiative=initiative.total;combatant.initiativeModifier=initiative.modifier;combatant.initiativeRoll=initiative.roll;combatant.initiativeMode=initiative.mode;
  return {source,sourceRecord,revisedSource,successor,projection,combatant,eventId,reason,initiative,mapOutcome:combatant.deathReplacement.mapOutcome,inheritance,bodyDescription,basisStatus,basisLabel,soulReturn,disposition,v060};
}
function beginS2SuccessorPlacement(id,form,slice){
  try{
    if(s2PlacementDraft)throw new Error('请先完成或取消当前的新躯体地图摆放。');
    const values=new FormData(form),source=getCombatant(id),spell=v060SpellContext(values,'successor'),optional=v060OptionalRecord(values),shape=String(values.get('shape')||'normal');
    requireDuplicateSourceConfirmation(source,values);
    values.set('basisStatus','dm-ruling');values.set('basisLabel',spell.basisLabel);values.set('soulReturn','not-applicable');values.set('playerControl','confirmed');values.set('bodyDescription',String(values.get('bodyDescription')||`${spell.spellName}：DM 裁定的${shape==='undead'?'不死生物形态':shape==='custom'?'其他自定义形态':'新身体'}`));values.set('_v060Spell',JSON.stringify(spell));values.set('_v060Optional',JSON.stringify(optional));values.set('_v060Shape',shape);
    const item=createS2SuccessorCandidate(source,values,slice),position=firstFreeFootprintPosition(item.combatant.footprint,[...mapTokenOccupants(),...pendingPlacementCombatants()],state.settings);if(!position)throw new Error('地图没有可容纳新实例的空位。');item.combatant.position=position;
    s2PlacementDraft={kind:'successor',item};deathOutcomeChoice=null;selectWorkspaceForDomain('地图');
    message(`请在地图中为“${item.combatant.name}”选择一个没有任何棋子的空格；取消不会创建角色卡、实例或事件。`,'warn');
  }catch(error){message(`无法进入地图摆放：${error.message}`,'error');}
}
function commitS2Successor(item){
  const source=item.source,plan=replacementPlacement(source,item.combatant);
  if(!plan.valid)throw new Error(`该格不能生成新躯体：${plan.reasons.join('；')}。请选择没有任何棋子的空格。`);
  const proposed=initiativeOrderWith(item.combatant,item.initiative.tiePlacement,[source.id]);
  const recordsBefore=clone(characterRecords),nextRecords=characterRecords.map(record=>record.characterId===item.revisedSource.characterId?item.revisedSource:record).concat(item.successor);
  const resourcePlan=prepareV060OptionalResource(item.v060.optional);
  command('pc.successor.confirmed',{eventId:item.eventId,sourceCombatantId:source.id,replacementCombatantId:item.combatant.id,newCharacterId:item.successor.characterId,sourceCharacterId:item.sourceRecord.characterId,basisStatus:item.basisStatus,basisLabel:item.basisLabel,soulReturn:item.soulReturn,bodyDescription:item.bodyDescription,inheritance:item.inheritance,mapOutcome:item.mapOutcome,initiative:{mode:item.initiative.mode,total:item.initiative.total,eligibleFromRound:null},reason:item.reason,v060:item.v060,longTermUndo:{sourceRecord:recordsBefore.find(record=>record.characterId===item.sourceRecord.characterId),newCharacterId:item.successor.characterId}},()=>{
    const resourceChange=applyV060OptionalResource(item.v060.optional,resourcePlan);persistCharacterRecords(nextRecords);characterRecords=nextRecords;source.postCombatWritebackDisabled=true;source.deathRecord={...(source.deathRecord||{}),replacements:[...((source.deathRecord||{}).replacements||[]),{eventId:item.eventId,type:'pc-successor',shape:item.v060.shape,spell:item.v060.spell,optional:item.v060.optional,replacementCombatantId:item.combatant.id,newCharacterId:item.successor.characterId,mapOutcome:item.mapOutcome,resourceChange}]};
    if(item.mapOutcome==='remove-corpse-token')source.corpseTokenVisible=false;
    item.combatant.eligibleFromRound=proposed.currentId&&proposed.candidateIndex<=proposed.currentIndex?state.turn.round+1:state.turn.round;
    state.combatProjections.push(item.projection);state.combatants.push(item.combatant);state.turn.order=proposed.order;state.turn.index=proposed.currentId?proposed.order.indexOf(proposed.currentId):proposed.order.indexOf(item.combatant.id);if(!proposed.currentId)resetTurn(item.combatant);state.ui.selectedId=item.combatant.id;
  },{eventId:item.eventId,manual:true,reason:item.reason});
  message(`${source.name} 已以“${item.combatant.name}”继续冒险；新角色卡独立，原卡未自动归档。`,'warn');
}
function controllerCandidates(source){return state.combatants.filter(candidate=>candidate.id!==source?.id&&!isDead(candidate)&&candidate.presenceStatus==='on-field'&&candidate.participationStatus==='active');}
function controlledDurationFromValues(values){
  const kind=String(values.get('durationKind')||'');
  if(kind==='dm-managed')return {kind:'dm-managed',unit:null,remaining:null,initial:null};
  if(kind==='one-long-rest')return {kind:'one-long-rest',unit:'long-rests',remaining:1,initial:1};
  if(kind==='permanent')return {kind:'permanent',unit:null,remaining:null,initial:null};
  if(kind!=='custom')throw new Error('必须选择控制期限。');
  const unit=String(values.get('customDurationUnit')||''),remaining=Math.floor(Number(values.get('customDurationAmount')));
  if(!['rounds','encounters','long-rests'].includes(unit)||!Number.isInteger(remaining)||remaining<1)throw new Error('自定义控制期限必须选择单位并填写正整数。');
  return {kind:'custom',unit,remaining,initial:remaining};
}
function controlledDurationLabel(duration){
  if(duration?.kind==='dm-managed')return 'DM 管理（不自动计时）';
  if(duration?.kind==='one-long-rest')return '24 小时（按一次长休结算）';
  if(duration?.kind==='permanent')return '永久（DM 裁定）';
  const labels={rounds:'回合',encounters:'场战斗', 'long-rests':'次长休'};return `自定义：${duration?.remaining ?? '?'} ${labels[duration?.unit]||duration?.unit||''}`;
}
function createS2ControlledUndeadCandidate(source,values){
  if(!source||!isDead(source)||combatEnded()||!['character','npc'].includes(source.kind))throw new Error('制造受控亡灵仅可处理战斗未结束的死亡 PC 或 NPC。');
  const template=templateById(String(values.get('templateId')||'')),controller=getCombatant(String(values.get('controllerCombatantId')||''));
  const effectLabel=String(values.get('effectLabel')||'').trim(),reason=String(values.get('reason')||'').trim(),commandRangeFeet=Math.floor(Number(values.get('commandRangeFeet')));
  if(!template||!['monster','npc'].includes(template.kind)||(controller&&isDead(controller))||!effectLabel||!reason||!Number.isInteger(commandRangeFeet)||commandRangeFeet<0)throw new Error('请选定不死生物模板，并填写效果、非负命令距离与 DM 原因。');
  const duration=controlledDurationFromValues(values),eventId=uid(),member=createEncounterMember(template,uid(),s2Position(source)),combatant=materializeCombatant(member,uid()),mapOutcome=String(values.get('mapOutcome')||'');
  if(!['remove-corpse-token','retain-corpse-token'].includes(mapOutcome))throw new Error('必须明确记录旧尸体棋子的地图处理。');
  combatant.name=String(values.get('name')||template.name).trim()||template.name;combatant.displayOrdinal=nextDisplayOrdinal(combatant.name,[...state.combatants,...pendingPlacementCombatants()]);combatant.relation=String(values.get('relation')||'ally');
  const v060={spell:formJson(values,'_v060Spell'),optional:formJson(values,'_v060Optional')},controllerRecord=controller?currentCharacterRecordForCombatant(controller):null,controlledEntityId=uid();
  const controlledEntity={id:controlledEntityId,name:combatant.name,templateRef:{templateId:template.id,templateRevision:template.revision||1},status:duration.kind==='permanent'?'permanent-controlled':'controlled',commandRangeFeet,duration,effectLabel,sourceStatus:'dm-confirmed',createdEventId:eventId,sourceCombatantId:source.id,activeCombatantId:combatant.id,history:[{eventId,type:'created',at:now(),round:state.turn.round,status:duration.kind==='permanent'?'permanent-controlled':'controlled',reason}]};
  if(controller)combatant.controllerLink={controlledEntityId,controllerCombatantId:controller.id,controllerCharacterRef:controllerRecord?clone(controller.characterSheetRef):null,controllerName:controller.name,effectLabel,commandRangeFeet,duration:clone(duration),status:controlledEntity.status,history:clone(controlledEntity.history)};
  combatant.originCharacterRef=source.characterSheetRef?clone(source.characterSheetRef):null;combatant.deathReplacement={slice:'S2B',eventId,sourceCombatantId:source.id,reason,mapOutcome,v060,controllerTracked:!!controller};ensureFacing(combatant);
  const initiative=s2Initiative(combatant,source,values);combatant.initiative=initiative.total;combatant.initiativeModifier=initiative.modifier;combatant.initiativeRoll=initiative.roll;combatant.initiativeMode=initiative.mode;
  return {source,template,controller,controllerRecord,controlledEntity,combatant,eventId,mapOutcome,initiative,reason,v060};
}
function queueControlledEntityCandidate(item){
  const projection=item.controllerRecord&&state.combatProjections.find(candidate=>candidate.characterId===item.controllerRecord.characterId&&candidate.characterRevision===item.controllerRecord.currentRevision);
  if(!projection)return false;
  const entity=clone(item.controlledEntity),existing=(state.postCombatDiffs||[]).some(diff=>diff.combatantId===item.combatant.id&&diff.characterId===projection.characterId&&diff.status==='pending');
  if(existing)return true;
  state.postCombatDiffs.push({schemaVersion:'0.3.0-m1-s6',diffId:uid(),createdAt:now(),sourceSessionId:state.sessionId,sourceEventSequence:state.events.length+1,combatantId:item.combatant.id,combatProjectionId:projection.projectionId,characterId:projection.characterId,characterRevision:projection.characterRevision,characterName:projection.name,status:'pending',entries:[{id:`controlled-entity:${entity.id}`,kind:'controlled-entity',label:`受控生物：${entity.name}`,before:'无长期关联',after:controlledDurationLabel(entity.duration),controlledEntity:entity,status:'pending'}]});
  return true;
}
function syncControlledEntityCandidate(combatant){
  const link=combatant?.controllerLink;if(!link?.controlledEntityId)return;
  for(const diff of state.postCombatDiffs||[]){
    if(diff.status!=='pending'||diff.combatantId!==combatant.id)continue;
    for(const entry of diff.entries||[]){
      if(entry.kind!=='controlled-entity'||entry.controlledEntity?.id!==link.controlledEntityId)continue;
      entry.controlledEntity={...entry.controlledEntity,status:link.status,duration:clone(link.duration),history:clone(link.history||[]),activeCombatantId:combatant.id};
      entry.after=controlledDurationLabel(link.duration);
    }
  }
}
function decrementControlledDurations(unit){
  const changes=[];
  for(const combatant of state.combatants){
    const link=combatant.controllerLink,duration=link?.duration;
    if(!link||link.status!=='controlled'||duration?.kind!=='custom'||duration.unit!==unit)continue;
    const remaining=Math.max(0,Number(duration.remaining||0)-1),expired=remaining===0,eventId=uid();
    link.duration={...duration,remaining};link.status=expired?'expired-uncontrolled':'controlled';link.history=[...(link.history||[]),{eventId,type:`${unit}-settled`,round:unit==='rounds'?state.turn.round:null,status:link.status,reason:unit==='rounds'?'回合期限结算':'战斗期限结算'}];
    syncControlledEntityCandidate(combatant);changes.push({combatantId:combatant.id,controlledEntityId:link.controlledEntityId,unit,remaining,status:link.status,eventId});
  }
  return changes;
}
function beginS2ControlledUndeadPlacement(id,form){
  try{
    if(s2PlacementDraft)throw new Error('请先完成或取消当前的新躯体地图摆放。');
    const values=new FormData(form),source=getCombatant(id),spell=v060SpellContext(values,'controlled'),optional=v060OptionalRecord(values);
    requireDuplicateSourceConfirmation(source,values);
    values.set('effectLabel',String(values.get('effectLabel')||spell.basisLabel));values.set('_v060Spell',JSON.stringify(spell));values.set('_v060Optional',JSON.stringify(optional));
    const item=createS2ControlledUndeadCandidate(source,values),position=firstFreeFootprintPosition(item.combatant.footprint,[...mapTokenOccupants(),...pendingPlacementCombatants()],state.settings);if(!position)throw new Error('地图没有可容纳受控生物的空位。');item.combatant.position=position;s2PlacementDraft={kind:'controlled-undead',item};deathOutcomeChoice=null;selectWorkspaceForDomain('地图');
    message(`请在地图中为受控生物“${item.combatant.name}”选择一个没有任何棋子的空格；取消不会创建实例、控制关系或事件。`,'warn');
  }catch(error){message(`无法进入地图摆放：${error.message}`,'error');}
}
function commitS2ControlledUndead(item){
  const {source,combatant,controller}=item,plan=replacementPlacement(source,combatant);
  if(!plan.valid)throw new Error(`该格不能生成受控生物：${plan.reasons.join('；')}。请选择没有任何棋子的空格。`);
  const proposed=initiativeOrderWith(combatant,item.initiative.tiePlacement,[source.id]);
  const resourcePlan=prepareV060OptionalResource(item.v060.optional);
  command('combatant.controlled-undead.created',{eventId:item.eventId,sourceCombatantId:source.id,replacementCombatantId:combatant.id,templateId:item.template.id,originCharacterRef:combatant.originCharacterRef,controllerLink:clone(combatant.controllerLink||null),mapOutcome:item.mapOutcome,initiative:{mode:item.initiative.mode,total:item.initiative.total,eligibleFromRound:null},reason:item.reason,v060:item.v060},()=>{
    const resourceChange=applyV060OptionalResource(item.v060.optional,resourcePlan);
    if(isPc(source))source.postCombatWritebackDisabled=true;source.deathRecord={...(source.deathRecord||{}),replacements:[...((source.deathRecord||{}).replacements||[]),{eventId:item.eventId,type:'controlled-undead',spell:item.v060.spell,optional:item.v060.optional,replacementCombatantId:combatant.id,mapOutcome:item.mapOutcome,resourceChange}]};
    if(item.mapOutcome==='remove-corpse-token')source.corpseTokenVisible=false;
    combatant.eligibleFromRound=proposed.currentId&&proposed.candidateIndex<=proposed.currentIndex?state.turn.round+1:state.turn.round;state.combatants.push(combatant);state.turn.order=proposed.order;state.turn.index=proposed.currentId?proposed.order.indexOf(proposed.currentId):proposed.order.indexOf(combatant.id);if(!proposed.currentId)resetTurn(combatant);state.ui.selectedId=combatant.id;queueControlledEntityCandidate(item);
  },{eventId:item.eventId,manual:true,reason:item.reason});
  message(`${source.name} 的遗骸已成为${controller?`由 ${controller.name} 控制的 `:'DM 仅本场记录的 '}${combatant.name}。${item.controllerRecord?'战后会向控制者角色卡生成默认拒绝的受控生物候选。':'不写入长期控制关系。'}`,'warn');
}
function confirmS2PlacementAt(position){
  const draft=s2PlacementDraft;if(!draft)return;
  const item=draft.item;item.combatant.position=clone(position);
  const plan=replacementPlacement(item.source,item.combatant);
  if(!plan.valid)return message(`此处不可摆放：${plan.reasons.join('；')}。已有棋子、尸体棋子或越界都会阻止生成。`,'warn');
  s2PlacementDraft=null;
  try{
    if(draft.kind==='successor')commitS2Successor(item);else commitS2ControlledUndead(item);
  }catch(error){s2PlacementDraft=draft;message(`新躯体未创建：${error.message}`,'error');}
}
function cancelS2Placement(){
  if(!s2PlacementDraft)return;
  const name=s2PlacementDraft.item.combatant.name;s2PlacementDraft=null;selectWorkspaceForDomain('战斗');
  message(`已取消“${name}”的地图摆放；未创建事件、战斗实例、角色卡修订或长期关联。`,'warn');
}
function controllerDistanceFeet(controller,combatant){
  if(!controller?.position||!combatant?.position)return null;
  return Math.max(Math.abs(controller.position.x-combatant.position.x),Math.abs(controller.position.y-combatant.position.y))*state.settings.cellFeet;
}
function commandStatusFor(combatant){
  const link=combatant?.controllerLink,controller=getCombatant(link?.controllerCombatantId);
  if(!link||!controller||controller.presenceStatus!=='on-field'||isDead(controller))return {status:'control-lost',controller,distance:null,canCommand:false};
  if(!['controlled','permanent-controlled'].includes(link.status))return {status:link.status,controller,distance:null,canCommand:false};
  const distance=controllerDistanceFeet(controller,combatant),within=distance!==null&&distance<=Number(link.commandRangeFeet);
  return {status:within?link.status:'out-of-command-range',controller,distance,canCommand:within};
}
function updateS2ControllerLink(id,form){
  const combatant=getCombatant(id),values=new FormData(form);
  try{
    if(!combatant?.controllerLink||combatEnded())throw new Error('当前单位没有可更新的受控生物记录。');
    const status=String(values.get('status')||''),reason=String(values.get('reason')||'').trim();
    if(!['controlled','permanent-controlled','released','control-lost'].includes(status)||!reason)throw new Error('必须选择有效控制状态并填写 DM 原因。');
    command('combatant.controller-link.updated',{combatantId:id,status,reason},()=>{
      combatant.controllerLink.status=status;combatant.controllerLink.history=[...(combatant.controllerLink.history||[]),{eventId:uid(),type:'dm-status-updated',round:state.turn.round,status,reason}];
      if(['released','control-lost'].includes(status))combatant.relation=String(values.get('relation')||'neutral');
      syncControlledEntityCandidate(combatant);
    },{manual:true,reason});
    message(['released','control-lost'].includes(status)?`${combatant.name} 已失去原控制者控制，后续由 DM 管理。`:`${combatant.name} 的控制状态已更新。`,'warn');
  }catch(error){message(error.message,'error');}
}
function issueControlledCommand(id,form){
  const combatant=getCombatant(id),directive=String(new FormData(form).get('directive')||'').trim(),status=commandStatusFor(combatant);
  try{
    if(!directive)throw new Error('必须填写要记录的下次行动指令。');
    if(!status.canCommand)throw new Error(status.status==='out-of-command-range'?'控制者不在命令距离内，不能下达新命令。':'该受控生物当前不能接受原控制者的命令。');
    if(active()?.id!==status.controller.id)throw new Error('只能在控制者的当前回合记录命令。');
    command('controlled-command.issued',{combatantId:id,controlledEntityId:combatant.controllerLink.controlledEntityId,controllerCombatantId:status.controller.id,directive,distanceFeet:status.distance,commandRangeFeet:combatant.controllerLink.commandRangeFeet},()=>{
      combatant.controllerLink.lastCommand={eventId:uid(),round:state.turn.round,directive,distanceFeet:status.distance};
      combatant.controllerLink.history=[...(combatant.controllerLink.history||[]),{eventId:combatant.controllerLink.lastCommand.eventId,type:'command-issued',round:state.turn.round,status:combatant.controllerLink.status,reason:directive}];
      syncControlledEntityCandidate(combatant);
    },{manual:true,reason:`DM 记录 ${status.controller.name} 对 ${combatant.name} 的受控生物命令`});
    message(`已记录 ${status.controller.name} 对 ${combatant.name} 的命令；具体动作结算仍由 DM 处理。`);
  }catch(error){message(error.message,'error');}
}
function s2InheritanceControls(){return `<fieldset><legend>创建时复制字段（未勾选的组以空/默认值建立，之后两卡完全独立）</legend><div class="form-grid">${S2_SUCCESSOR_INHERITANCE_GROUPS.map(group=>`<label><input type="checkbox" name="inheritGroups" value="${group}" checked/> ${esc(S2_INHERITANCE_LABELS[group])}</label>`).join('')}</div></fieldset>`;}
function duplicateSourceMarkup(source){return hasDeathReplacement(source)?'<p class="notice warn"><label><input type="checkbox" name="duplicateSource" value="confirmed"/> DM 确认：该遗体已有后继记录，仍要创建本次结果。</label></p>':'';}
function v060SpellOptions(outcome){return `<option value="">请选择法术或自定义依据</option>${spellsForV060(outcome).map(spell=>`<option value="${spell.id}">${esc(spell.name)}</option>`).join('')}<option value="custom">自定义依据</option>`;}
function v060RulingState(workspace){const spellId=workspace.querySelector('[data-v060-spell-select]')?.value||'',outcome=workspace.dataset.v060Outcome,spell=spellId?spellForV060(outcome,spellId):null,fields={};(spell?.rulingFields||[]).forEach(field=>{fields[field.id]={mode:workspace.querySelector(`[name="ruling:${field.id}:mode"]`)?.value||'',value:workspace.querySelector(`[name="ruling:${field.id}:value"]`)?.value||''};});return {spellId,spell,outcome,form:workspace.closest('form'),fields,customBasis:workspace.querySelector('[name="customBasis"]')?.value||''};}
function v060OutcomePreview(state){const values=new FormData(state.form||document.createElement('form'));if(state.outcome==='restore')return `<li><b>结果</b>：恢复原 PC 实例；最终 HP ${esc(values.get('hp')||'待填写')}；保留原棋子与先攻槽位。</li>`;if(state.outcome==='successor')return `<li><b>结果</b>：创建独立新角色卡与 PC 实例；下一步进入地图预览并确认先攻。</li>`;return `<li><b>结果</b>：保留原死亡事实，创建独立 ${esc(values.get('templateId')||'Template 待确认')} 实例；下一步进入地图预览并确认控制关系。</li>`;}
function v060RulingPreview(state){if(!state.spell)return '<p class="muted">选择法术后显示裁定进度与预览。</p>';if(state.spell.id==='custom')return state.customBasis.trim()?`<ul><li>依据：${esc(state.customBasis)}</li>${v060OutcomePreview(state)}</ul>`:'<p class="muted">填写自定义依据后生成预览。</p>';const rows=state.spell.rulingFields.map(field=>{const current=state.fields[field.id]||{},definition=(V060_RULING_MODES[field.modes]||[]).find(item=>item.id===current.mode);if(!definition)return null;if(definition.needsValue&&!String(current.value).trim())return null;const finalValue=definition.needsValue?current.value:field.suggested;return `<li><b>${esc(field.label)}</b>：${esc(definition.label)} · ${esc(finalValue)}</li>`;});if(rows.some(item=>!item))return `<p class="muted">已完成 ${rows.filter(Boolean).length}/${rows.length} 项裁定；完成后生成预览。</p>`;return `<ul>${rows.join('')}${v060OutcomePreview(state)}</ul>`;}
function v060PreviewMarkup(state){return `${state.spell&&state.spell.id!=='custom'?'<h5>裁定预览</h5>':''}${v060RulingPreview(state)}`;}
function v060RulingContent(outcome,state){const spell=state.spell;if(!spell)return '<p class="muted">只显示当前结果适用的法术。选择后才展开简报与裁定资料。</p>';if(spell.id==='custom')return `<label>自定义依据<input name="customBasis" required value="${esc(state.customBasis)}" placeholder="例如：以某法术为基础的 DM 裁定"/></label><p class="muted">自定义依据不伪造法术字段；结果卡必要操作仍由 DM 填写。</p><aside class="spell-ruling-preview" data-v060-ruling-preview>${v060PreviewMarkup(state)}</aside>`;return `<section class="spell-brief"><div><b>${esc(spell.name)}</b><span>${esc(spell.meta)}</span></div><p>${esc(spell.summary)}</p><small>系统只记录 DM 裁定，不自动核验条件。</small><details><summary>查看详细参考</summary><p>${esc(spell.summary)}</p><p>${esc(V060_GENTLE_REPOSE.name)}：${esc(V060_GENTLE_REPOSE.summary)}</p></details></section><section class="spell-ruling-list"><h5>裁定资料</h5>${spell.rulingFields.map(field=>{const current=state.fields[field.id]||{},modes=V060_RULING_MODES[field.modes]||[],definition=modes.find(item=>item.id===current.mode);return `<article class="spell-ruling-card ${current.mode?'complete':''}"><div><b>${esc(field.label)}</b><small>建议：${esc(field.suggested)}</small></div><input type="hidden" name="ruling:${field.id}:mode" value="${esc(current.mode)}"/> <div class="ruling-mode-group">${modes.map(mode=>`<button type="button" class="${current.mode===mode.id?'active':''}" data-v060-ruling-mode="${mode.id}" data-v060-ruling-field="${field.id}">${esc(mode.label)}</button>`).join('')}</div>${definition?.needsValue?`<label class="ruling-override">最终记录<input name="ruling:${field.id}:value" required value="${esc(current.value)}" placeholder="填写 DM 最终裁定"/></label>`:''}</article>`;}).join('')}</section><aside class="spell-ruling-preview" data-v060-ruling-preview>${v060PreviewMarkup(state)}</aside>`;}
function v060GuidanceMarkup(outcome){return `<section class="spell-ruling-workspace" data-v060-ruling-workspace data-v060-outcome="${outcome}"><div class="spell-ruling-select"><label>法术 / 依据<select name="spellId" required data-v060-spell-select>${v060SpellOptions(outcome)}</select></label><small>先选结果，再选依据；不会自动裁定。</small></div><div data-v060-ruling-content>${v060RulingContent(outcome,{spell:null,fields:{},customBasis:''})}</div></section>`;}
function v060OptionalMarkup(){const casters=state.combatants.filter(candidate=>!isDead(candidate)&&candidate.presenceStatus==='on-field');return `<details><summary>可选记录：施法者、资源、时间、灵魂与规则</summary><div class="row"><label>施法者/记录单位<select name="casterCombatantId"><option value="">不追踪</option>${casters.map(c=>`<option value="${esc(c.id)}">${esc(displayName(c))}</option>`).join('')}</select></label><label>资源处理<select name="resourceHandling"><option value="not-tracked">不追踪</option><option value="dm-confirmed">DM 确认已消耗</option><option value="sync">同步扣除当前资源</option><option value="custom">自定义处理</option></select></label><label>资源名称<input name="resourceName" placeholder="仅同步扣除时需要"/></label><label>数量<input name="resourceAmount" type="number" min="1" value="1"/></label></div><div class="row"><label>遗体防腐记录<textarea name="gentleReposeNote" placeholder="可留空；不自动计算期限"></textarea></label><label>时间/期限<textarea name="timeNote" placeholder="可留空；不自动计时"></textarea></label><label>灵魂/剧情<textarea name="soulNote" placeholder="可留空"></textarea></label><label>规则符合情况<textarea name="rulesNote" placeholder="可留空；不构成合法性 Gate"></textarea></label></div></details>`;}
function v060RestorePanel(source){return `<section class="death-resolution"><h4>恢复原身体</h4><form data-pc-return-to-life-form="${source.id}"><p class="notice warn">先选法术或自定义依据。缺少材料、时间、灵魂或资格记录仍可由 DM 提交。</p><div class="row"><label>最终 HP<input name="hp" type="number" min="1" max="${source.maxHp}" required value="1"/></label><label>战斗状态<select name="conditionHandling"><option value="preserve">保留既有状态（移除 unconscious）</option><option value="clear">清空全部条件</option></select></label><label>状态/疾病/诅咒/力竭<textarea name="effectDisposition" placeholder="可留空：DM 未追踪"></textarea></label></div>${v060GuidanceMarkup('restore')}${v060OptionalMarkup()}<label>DM 原因<textarea name="reason" required></textarea></label><button class="primary" type="submit">确认恢复原实例</button></form></section>`;}
function s2SuccessorPanel(source,slice,shape='normal'){
  const record=currentCharacterRecordForCombatant(source),shapeLabel={normal:'普通新身体',undead:'不死生物形态',custom:'其他自定义形态'}[shape]||'新身体',defaultName=`${source.name}（${shapeLabel}）`;
  if(!record)return `<section class="death-resolution"><p class="notice warn">此死亡 PC 没有匹配当前长期角色卡修订的 CombatProjection。为避免猜测复制来源，不能创建独立新角色卡；请使用从长期角色卡投影加入遭遇的角色。</p></section>`;
  return `<section class="death-resolution"><h4>以新身体或新形态继续冒险：${shapeLabel}</h4><form data-s2-successor-form="${source.id}" data-s2-slice="${slice}"><input type="hidden" name="shape" value="${shape}"/><p class="notice warn">创建独立 CharacterSheet 与 PC 实例。旧死亡实例及旧卡保留，不自动归档、同步或建立硬关联。</p><div class="row"><label>新角色卡名称<input name="name" required value="${esc(defaultName)}"/></label><label>新实例 HP<input name="hp" type="number" min="1" required value="1"/></label><label>新实例最大 HP<input name="maxHp" type="number" min="1" required value="${esc(source.maxHp)}"/></label><label>关系<select name="relation"><option value="ally" selected>友方</option><option value="neutral">中立</option><option value="enemy">敌对</option></select></label></div>${v060GuidanceMarkup('successor')}<label>形态/身体说明<textarea name="bodyDescription" placeholder="可留空；由 DM 裁定"></textarea></label>${s2InheritanceControls()}<div class="row"><label>原卡处置记录<select name="originalDisposition"><option value="keep-active">保留 active</option><option value="coexist">允许新旧卡剧情并存</option><option value="archive-later">DM 将在战后独立决定是否归档</option></select></label><label>尸体处理<select name="mapOutcome"><option value="remove-corpse-token">移除旧尸体棋子</option><option value="retain-corpse-token">保留旧尸体棋子</option></select></label></div><div class="row"><label>先攻<select name="initiativeMode"><option value="keep">沿用原死亡实例先攻</option><option value="reroll">重新投 1d20</option><option value="manual">DM 手动填写</option></select></label><label>先攻调整值<input name="initiativeModifier" type="number" value="${source.initiativeModifier??0}"/></label><label>手动先攻<input name="initiative" type="number" value="${source.initiative??0}"/></label><label>同值顺序<select name="tiePlacement"><option value="after">同值单位之后</option><option value="before">同值单位之前</option></select></label></div>${v060OptionalMarkup()}${duplicateSourceMarkup(source)}<label>DM 原因<textarea name="reason" required></textarea></label><button class="primary" type="submit">前往地图摆放</button></form></section>`;
}
function s2ControlledUndeadPanel(source){
  const templates=transformationTemplates(),controllers=controllerCandidates(source);if(!templates.length)return '';
  return `<section class="death-resolution"><h4>制造受控不死生物</h4><form data-s2-undead-form="${source.id}"><p class="notice warn">原死亡事实和原角色卡不会恢复。未选择控制者时，只记录本场 DM 裁定，不猜测玩家控制权或长期关联。</p><p class="muted">一次长休不等于 24 小时；Terminal 不换算或自动推进控制时间。</p><div class="row"><label>不死生物模板<select name="templateId" required>${templates.map(template=>`<option value="${esc(template.id)}">${esc(template.name)} · ${esc(template.kind)}</option>`).join('')}</select></label><label>显示名<input name="name" value="" placeholder="默认模板名称"/></label><label>关系<select name="relation"><option value="ally" selected>友方</option><option value="neutral">中立</option><option value="enemy">敌对</option></select></label><label>控制者<select name="controllerCombatantId"><option value="">不追踪长期控制者</option>${controllers.map(controller=>`<option value="${controller.id}">${esc(controller.name)} · ${esc(controller.kind)}</option>`).join('')}</select></label></div>${v060GuidanceMarkup('controlled')}<div class="row"><label>效果/规则定位<input name="effectLabel" placeholder="默认使用所选法术/依据"/></label><label>命令距离（尺）<input name="commandRangeFeet" type="number" min="0" required value="60"/></label><label>控制期限<select name="durationKind" required><option value="dm-managed" selected>DM 管理（不自动计时）</option><option value="permanent">永久</option><option value="custom">自定义</option></select></label><label>自定义数量<input name="customDurationAmount" type="number" min="1" value="1"/></label><label>自定义单位<select name="customDurationUnit"><option value="rounds">回合</option><option value="encounters">场战斗</option><option value="long-rests">次长休</option></select></label></div><div class="row"><label>尸体处理<select name="mapOutcome"><option value="remove-corpse-token">移除旧尸体棋子</option><option value="retain-corpse-token">保留旧尸体棋子</option></select></label><label>先攻<select name="initiativeMode"><option value="keep">沿用原死亡实例先攻</option><option value="reroll">重新投 1d20</option><option value="manual">DM 手动填写</option></select></label><label>先攻调整值<input name="initiativeModifier" type="number" value="0"/></label><label>手动先攻<input name="initiative" type="number" value="${source.initiative??0}"/></label><label>同值顺序<select name="tiePlacement"><option value="after">同值单位之后</option><option value="before">同值单位之前</option></select></label></div>${v060OptionalMarkup()}${duplicateSourceMarkup(source)}<label>DM 原因<textarea name="reason" required></textarea></label><button class="primary" type="submit">前往地图摆放</button></form></section>`;
}
function controllerLinkPanel(combatant){
  const link=combatant?.controllerLink;if(!link)return '';
  const command=commandStatusFor(combatant),label={controlled:'受控', 'permanent-controlled':'永久受控', 'out-of-command-range':'超出命令距离', 'expired-uncontrolled':'已到期失控', released:'已解除控制', 'control-lost':'已失去控制'}[command.status]||command.status;
  const commandDetails=command.distance===null?'距离不可用':`${command.distance} 尺 / 上限 ${link.commandRangeFeet} 尺`;
  return `<section class="controller-link"><h3>受控生物记录</h3><p><b>控制状态：</b>${esc(label)}　<b>控制者：</b>${esc(link.controllerName||link.controllerCombatantId)}　<b>效果：</b>${esc(link.effectLabel)}</p><p><b>命令距离：</b>${esc(commandDetails)}　<b>控制期限：</b>${esc(controlledDurationLabel(link.duration))}</p>${link.lastCommand?`<p><b>最近命令：</b>${esc(link.lastCommand.directive)}（第 ${esc(link.lastCommand.round)} 轮）</p>`:''}<details><summary>控制记录（${(link.history||[]).length}）</summary>${(link.history||[]).map(item=>`<p>第 ${esc(item.round??'—')} 轮 · ${esc(item.type||'记录')} · ${esc(item.status)} · ${esc(item.reason)}</p>`).join('')||'<p class="muted">无额外记录。</p>'}</details>${combatEnded()?'':`${command.canCommand?`<form data-controlled-command-form="${combatant.id}"><label>下次行动指令<textarea name="directive" required placeholder="例如：守住入口；具体动作仍由 DM 结算"></textarea></label><button type="submit" ${active()?.id===command.controller?.id?'':'disabled'}>${active()?.id===command.controller?.id?'记录命令':'仅控制者当前回合可下令'}</button></form>`:`<p class="notice warn">${command.status==='out-of-command-range'?'控制仍有效，但控制者不在命令距离内。':'当前控制状态不允许下达命令。'}</p>`}<form data-controller-link-form="${combatant.id}"><div class="row"><label>DM 状态<select name="status"><option value="controlled" ${link.status==='controlled'?'selected':''}>受控</option><option value="permanent-controlled" ${link.status==='permanent-controlled'?'selected':''}>永久受控</option><option value="released">解除控制</option><option value="control-lost">失去控制</option></select></label><label>失控后的关系<select name="relation"><option value="neutral">中立</option><option value="enemy">敌对</option><option value="ally">友方</option></select></label><label>DM 原因<input name="reason" required/></label><button type="submit">记录控制状态</button></div></form>`}</section>`;
}
function transformationTemplates(){return templateLibrary.filter(template=>!template.archived&&['monster','npc'].includes(template.kind));}
function transformationCandidate(source, values){const template=templateById(values.get('templateId'));if(!template)return null;const member=createEncounterMember(template,uid(),clone(source.position));const c=materializeCombatant(member,uid()),initiativeMode=values.get('initiativeMode')||'keep',initiativeModifier=normalizeInitiativeModifier(values.get('initiativeModifier'),template.initiativeModifier),initiativeRoll=initiativeMode==='reroll'?Math.floor(Math.random()*20)+1:null,suggestedName=`${template.name}化${source.name}`;c.name=String(values.get('name')||suggestedName).trim()||suggestedName;c.displayOrdinal=nextDisplayOrdinal(c.name,[...state.combatants,...pendingPlacementCombatants()]);c.relation=values.get('relation')||source.relation;c.hp=Math.max(1,Math.min(c.maxHp,Math.floor(Number(values.get('hp'))||c.maxHp)));c.initiativeModifier=initiativeModifier;c.initiativeRoll=initiativeRoll;c.initiativeMode=initiativeMode;c.initiative=initiativeMode==='manual'?Math.trunc(Number(values.get('initiative'))||0):initiativeMode==='reroll'?initiativeRoll+initiativeModifier:source.initiative??0;c.lifeStatus='alive';c.transformationOrigin={combatantId:source.id,name:source.name};ensureFacing(c);return {combatant:c,sourceCombatantId:source.id,tiePlacement:values.get('tiePlacement')==='before'?'before':'after',initiativeMode,initiativeModifier,initiativeRoll};}
function applyTransformation(item,{staged=false}={}){const source=getCombatant(item.sourceCombatantId),c=item.combatant;if(!source||isPc(source)||!isDead(source)||combatEnded())return false;const candidates=[...onFieldCombatants().filter(other=>other.id!==source.id),...pendingPlacementCombatants()];const plan=placementPlan(c,c.position,candidates);if(!plan.valid){if(staged)return false;message(`不能在原位置完成转化：${plan.reasons.join('；')}。可选择“进入地图重新摆放”。`,'warn');return false;}const proposed=initiativeOrderWith(c,item.tiePlacement,[source.id]);command('combatant.transformed',{sourceCombatantId:source.id,replacement:{id:c.id,templateId:c.templateId,name:c.name,relation:c.relation,hp:c.hp,initiative:c.initiative,position:c.position},mode:'dm-special'},()=>{source.lifeStatus='transformed';source.participationStatus='ended';source.presenceStatus='temporarily-away';source.deathRecord={...(source.deathRecord||{}),transformedIntoId:c.id};c.eligibleFromRound=proposed.currentId&&proposed.candidateIndex<=proposed.currentIndex?state.turn.round+1:state.turn.round;c.transformationOrigin={combatantId:source.id,name:source.name};state.combatants.push(c);state.turn.order=proposed.order;state.turn.index=proposed.currentId?proposed.order.indexOf(proposed.currentId):proposed.order.indexOf(c.id);if(!proposed.currentId)resetTurn(c);state.ui.deathResolution=null;state.ui.selectedId=c.id;},{reason:'DM 特殊复苏/转化：以新的战斗实例替换死亡实例；不自动裁定法术、材料或规则合法性'});message(`${displayName(source)} 已转化为 ${displayName(c)}。`);return true;}
function submitTransformation(form, destination='direct'){const source=getCombatant(state.ui.deathResolution?.combatantId);if(!source||isPc(source)||!isDead(source)||combatEnded())return;const item=transformationCandidate(source,new FormData(form));if(!item)return message('请选择用于转化的单位模板。','warn');if(destination==='direct'){applyTransformation(item);return;}const candidates=[...onFieldCombatants().filter(other=>other.id!==source.id),...pendingPlacementCombatants()];let plan=placementPlan(item.combatant,item.combatant.position,candidates);if(!plan.valid){const free=firstFreeFootprintPosition(item.combatant.footprint,candidates,state.settings);if(!free)return message('地图上没有可容纳该转化单位的空位。','warn');item.combatant.position=free;plan=placementPlan(item.combatant,free,candidates);}state.ui.entryPlacement={items:[...entryPlacementItems(),{...item,kind:'transformation'}]};state.ui.deathResolution=null;state.ui.selectedId=null;selectWorkspaceForDomain('地图');message(`已暂存 ${displayName(item.combatant)} 的特殊转化；请在地图确认位置后批量投入。`);}
function movementPlan(c, to) {
  const from=c.position,dx=Math.abs(to.x-from.x),dy=Math.abs(to.y-from.y),diagonal=Math.min(dx,dy),straight=Math.max(dx,dy)-diagonal;
  const feet=(state.settings.diagonalRule==='five-ten-alternating'?straight*5+Array.from({length:diagonal},(_,i)=>i%2?10:5).reduce((a,b)=>a+b,0):(straight+diagonal)*state.settings.cellFeet);
  const candidates=state.encounter?.phase==='preparation'?state.encounter.members.filter(member=>member.deployment!=='reserve'&&member.id!==c.id):placementCandidates(c.id);
  const placement=placementPlan(c,to,candidates);
  const exceeds=state.encounter?.phase!=='preparation'&&feet>c.movementRemaining;
  return {from,to,feet,fits:placement.fits,overlaps:!!placement.overlapWith,blocked:!placement.valid,pending:exceeds,reasons:[...placement.reasons,exceeds?'超过剩余移动力':null].filter(Boolean)};
}
function move(id, to) {
  if(combatEnded())return message('本场战斗已结束，地图状态只读。','warn');const c=getCombatant(id);if(!c)return;if(!ordinaryActionsAllowed(c))return message('该生命状态不能移动；昏迷 PC 仍保留先攻位置，但本回合只能处理死亡豁免。','warn');
  const plan=movementPlan(c,to);if(plan.blocked)return message(`移动未提交：${plan.reasons.join('；')}。`,'warn');
  if(state.encounter?.phase==='preparation'){c.position=to;persist();render();return;}
  command('combatant.moved',{id,from:plan.from,to,path:[plan.from,to],computedFeet:plan.feet,actualFeet:plan.feet,elevationFeet:c.elevationFeet,pendingReasons:plan.reasons},()=>{c.position=to;c.movementRemaining=Math.max(0,c.movementRemaining-plan.feet);},{rulesReference:['PHB2024:movement','DMG2024:diagonal'],reason:plan.pending?`DM 超出移动力确认：${plan.reasons.join('；')}`:'二维距离建议'});
}
function useEconomy(field) { const c=active(); if(!c||!ordinaryActionsAllowed(c))return message('当前生命状态不能使用动作、附赠动作或反应。','warn'); if(!c[field])return message('该行动资源当前不可用。','warn'); command('turn.economy.used',{id:c.id,field},()=>{c[field]=false;}); }
function restoreEconomy(id,field){
  const c=getCombatant(id),labels={actionAvailable:'动作',bonusActionAvailable:'附赠动作',reactionAvailable:'反应'};
  if(!c||combatEnded()||!ordinaryActionsAllowed(c)||c.presenceStatus!=='on-field'||c.participationStatus!=='active')return message('该单位当前不能恢复行动经济。','warn');
  if(c[field])return message(`${displayName(c)} 的${labels[field]||'行动资源'}当前已经可用。`,'warn');
  command('turn.economy.restored',{id:c.id,field,label:labels[field]||field},()=>{c[field]=true;},{manual:true,reason:'DM 根据能力或特殊裁定恢复行动经济'});
}
function useLegendaryAction(id,name){if(combatEnded())return message('本场战斗已结束。','warn');const c=getCombatant(id),max=legendaryMax(c);if(!c||!max)return;if((c.legendaryActions??max)<=0)return message('该单位本轮传奇动作已用尽。','warn');command('combatant.legendary-action.used',{id,name,cost:1,remaining:(c.legendaryActions??max)-1},()=>{c.legendaryActionMax=max;c.legendaryActions=(c.legendaryActions??max)-1;},{reason:'DM 确认的传奇动作；时机由 DM 裁定'}); }
function undoLast() {if(combatEnded())return message('本场战斗已结束，历史记录不可再撤销。','warn');const undone=new Set(state.events.filter(e=>e.undoOfEventId).map(e=>e.undoOfEventId));const reversible=['combatant.moved','combatant.hp.changed','combatant.corrected','combatant.temp-hp.corrected','combatant.resource.changed','combatant.spell-resource.changed','spell.cast.confirmed','combatant.inventory-balance.changed','weapon-mastery.candidate.applied','range.applied','turn.economy.used','turn.economy.restored','combatant.facing.corrected','combatant.joined','combatant.batch-deployed','combatant.left-temporarily','combatant.participation.ended','combatant.reentered','pc.damage.resolved','pc.healing.resolved','pc.death-save.resolved','pc.medical-stabilization.resolved','pc.life-state.corrected','pc.prone.stood','pc.return-to-life.confirmed','pc.replacement.confirmed','pc.undead-successor.confirmed','pc.successor.confirmed','combatant.controlled-undead.created','combatant.controller-link.updated'];const original=[...state.events].reverse().find(e=>!e.undoOfEventId&&!undone.has(e.id)&&reversible.includes(e.type)); if(!original)return message('没有可补偿撤销的有效操作。','warn'); const s2Creation=['pc.replacement.confirmed','pc.undead-successor.confirmed','pc.successor.confirmed','combatant.controlled-undead.created'].includes(original.type);if(s2Creation&&state.events.some(event=>event.sequence>original.sequence&&!event.undoOfEventId))return message('该后继创建事件之后已有其他事件；为避免撤销存在依赖的新实例或控制记录，当前不能补偿撤销。','warn');const before=checkpoint(); const snap=original.before; if(!snap)return message('此事件没有可恢复检查点；刷新前检查点不会被伪造。','warn'); const preserved=state.events; const restored=normalizeV070Session(clone(snap)); state=restored; ensureM1S5State(); state.combatants.forEach(ensureFacing);state.events=preserved;if(original.type==='weapon-mastery.candidate.applied'){const candidate=state.masteryCandidates.find(item=>item.candidateId===original.payload.candidateId);if(candidate)candidate.status='compensated';}if(['pc.replacement.confirmed','pc.undead-successor.confirmed','pc.successor.confirmed'].includes(original.type)){const undo=original.payload?.longTermUndo;if(!undo?.sourceRecord||!undo?.newCharacterId)return message('后继角色卡事件缺少长期角色卡补偿资料，未执行撤销。','error');const restoredRecords=characterRecords.filter(record=>record.characterId!==undo.sourceRecord.characterId&&record.characterId!==undo.newCharacterId).concat(undo.sourceRecord);persistCharacterRecords(restoredRecords);characterRecords=restoredRecords;} emit('event.compensated',{restoredFromSequence:original.sequence},{undoOfEventId:original.id,before,reason:'DM 撤销；原事件以补偿标记保留'}); persist();render(); }
function effectSource(effect){ return effect.sourceKind==='manual'?'战斗手动':effect.sourceKind==='weapon-mastery'?'武器精通':'地图范围'; }
function effectEnds(effect){ return effect.expires?.anchor==='source-next-turn-end'?'至来源下一回合结束':effect.expiresRound ? `至第${effect.expiresRound}轮` : '持续时间未记录'; }
function effectLabel(effect){ return `${effect.name}${effect.concentration?'（专注）':''} · ${effectSource(effect)} · ${effectEnds(effect)}`; }
function effectsFor(id){ return state.effects.filter(effect=>effect.targetIds.includes(id)); }
function effectSummary(id){ const effects=effectsFor(id); return effects.length?effects.map(effect=>`${effect.name}（${effectEnds(effect)}）`).join('；'):'—'; }
function addOrRefreshEffect({kind,name,targetIds,duration,concentration,sourceKind,sourceCombatantId}){ const startedRound=state.turn.round; const expiresRound=startedRound+duration; const sameTargets=(a,b)=>a.length===b.length&&a.every(id=>b.includes(id)); const existing=state.effects.find(effect=>effect.kind===kind&&effect.name===name&&effect.sourceKind===sourceKind&&sameTargets(effect.targetIds,targetIds)); if(existing){ existing.startedRound=startedRound; existing.expiresRound=expiresRound; existing.concentration=concentration; existing.sourceCombatantId=sourceCombatantId; return {effect:existing,refreshed:true}; } const effect={id:uid(),kind,name,targetIds:[...targetIds],sourceKind,sourceCombatantId,startedRound,expiresRound,concentration}; state.effects.push(effect); return {effect,refreshed:false}; }
function expireEffects(){ const expired=state.effects.filter(effect=>effect.expiresRound && effect.expiresRound<state.turn.round); state.effects=state.effects.filter(effect=>!expired.includes(effect)); if(expired.length) state.ui.message=`${expired.map(effect=>effect.name).join('、')} 已到期。`; }
const rangeLabels={circle:'圆形',cone:'锥形',line:'直线',square:'方形'};
function rangeLabel(shape){return rangeLabels[shape]||shape;}
function setRange(shape) {if(combatEnded())return message('本场战斗已结束，范围结算已锁定。','warn');const source=active();if(source&&!ordinaryActionsAllowed(source))return message('当前生命状态不能发起范围操作。','warn');const originMode=['line','cone'].includes(shape)?'caster-facing-port':'map-point';state.ui.range={shape,origin:originMode==='caster-facing-port'&&source?facingOrigin(source):source?.position||{x:0,y:0},originMode,direction:{x:1,y:0},size:shape==='circle'?20:shape==='square'?20:30,phase:'armed',manualAdd:[],manualRemove:[]}; persist();render(); }
function coveredCells(r) { return coveredCellsForRange(r, state.settings); }
function rangeTargets(cells) { return (state.encounter?.phase==='preparation'?state.encounter.members.filter(member=>member.deployment!=='reserve'):onFieldCombatants()).filter(c=>{const occupied=[];for(let y=0;y<c.footprint.heightCells;y++)for(let x=0;x<c.footprint.widthCells;x++)occupied.push(`${c.position.x+x},${c.position.y+y}`);return occupied.some(cell=>cells.includes(cell));}); }
function applyRange() {if(combatEnded())return message('本场战斗已结束，范围结算已锁定。','warn');const r=state.ui.range;if(!r||r.phase!=='preview')return message('请先在地图按住并拖动范围，松开后再确认。','warn'); const cells=coveredCells(r);let ids=rangeTargets(cells).map(c=>c.id);ids=[...new Set([...ids,...r.manualAdd])].filter(id=>!r.manualRemove.includes(id)); const mode=document.querySelector('#range-mode')?.value||'damage'; const amount=Number(document.querySelector('#range-amount')?.value); const effectName=document.querySelector('#effect-name')?.value.trim(); const duration=Math.max(1,Number(document.querySelector('#effect-duration')?.value)||1); const concentration=!!document.querySelector('#effect-concentration')?.checked;
  if((mode==='damage'||mode==='healing')&&(!Number.isFinite(amount)||amount<=0))return message('伤害或治疗需要输入正数数值。','warn'); if((mode==='buff'||mode==='condition')&&!effectName)return message('Buff 或状态需要填写名称。','warn');
  const targets=ids.map(getCombatant).filter(Boolean);if((mode==='damage'||mode==='healing')&&targets.some(c=>isPc(c)&&['dead','needs-review'].includes(pcLifePhase(c))))return message('目标中有死亡或待复核 PC；范围 HP 结算已整体取消，请先由 DM 明确其生命阶段。','warn');const activeId=active()?.id,payload={shape:r.shape,origin:r.origin,direction:r.direction,size:r.size,coveredCells:cells,computedTargetIds:rangeTargets(cells).map(c=>c.id),manuallyAddedTargetIds:r.manualAdd,manuallyRemovedTargetIds:r.manualRemove,confirmedTargetIds:ids,operation:mode,amount:mode==='healing'?amount:mode==='damage'?-amount:0,effectName,duration,concentration,lifeOutcomes:[],turnAdvancedAfterDefeat:false};let appliedEffect=null;command('range.applied',payload,()=>{if(mode==='damage'||mode==='healing'){targets.forEach(c=>{if(isPc(c)){const result=mode==='damage'?applyPcDamage(c,amount,{round:state.turn.round}):healPc(c,amount,{round:state.turn.round});payload.lifeOutcomes.push({id:c.id,outcome:result.outcome,before:result.before,after:result.after});}else if(mode==='damage'){let d=amount;const a=Math.min(c.tempHp,d);c.tempHp-=a;d-=a;c.hp=Math.max(0,c.hp-d);}else c.hp=Math.min(c.maxHp,c.hp+amount);});if(mode==='damage')payload.turnAdvancedAfterDefeat=advanceAfterActiveDefeat(activeId);}else appliedEffect=addOrRefreshEffect({kind:mode,name:effectName,targetIds:ids,duration,concentration,sourceKind:'range',sourceCombatantId:activeId||null});state.ui.range=null;},{rulesReference:['DMG2024:half-cell','PHB2024:area-of-effect',...(mode==='damage'||mode==='healing'?[V040_RULE_REFERENCES.zeroHp]:[])]});if(mode==='damage')ids.forEach(id=>declareDeathIfNeeded(id,'范围伤害'));if(appliedEffect)message(`${appliedEffect.refreshed?'已更新':'已对'} ${ids.map(id=>getCombatant(id)?.name).join('、')||'无单位'} ${appliedEffect.refreshed?'的':'施加'} ${effectName}，${effectEnds(appliedEffect.effect)}。`);}

function gridCell(event, grid){ const first=grid.querySelector('[data-cell]'); if(!first)return {x:-1,y:-1}; const rect=first.getBoundingClientRect(); const cellWidth=rect.width,cellHeight=rect.height; return {x:Math.floor((event.clientX-rect.left)/cellWidth),y:Math.floor((event.clientY-rect.top)/cellHeight)}; }
function updateRangeGeometry(range, start, cell){ if(range.shape==='circle'||range.shape==='square'){range.origin=start;range.size=Math.max(state.settings.cellFeet,Math.max(Math.abs(cell.x-start.x),Math.abs(cell.y-start.y))*state.settings.cellFeet);}else {const origin=range.origin||start;range.direction={x:cell.x-origin.x,y:cell.y-origin.y};range.size=Math.max(state.settings.cellFeet,Math.hypot(cell.x-origin.x,cell.y-origin.y)*state.settings.cellFeet);} }
function updateMapPreview(grid, cell, plan){ grid.querySelectorAll('.move-preview,.move-pending').forEach(node=>node.classList.remove('move-preview','move-pending')); const target=grid.querySelector(`[data-cell="${cell.x},${cell.y}"]`); if(target)target.classList.add('move-preview',...((plan?.blocked||plan?.pending)?['move-pending']:[])); const box=document.querySelector('#movement-preview'); if(box&&plan) {box.className=`notice ${(plan.blocked||plan.pending)?'warn':''}`;const result=plan.blocked?`不可提交：${plan.reasons.join('；')}`:plan.pending?`超过移动力，DM 可确认：${plan.reasons.join('；')}`:'可采用（未自动判断墙体、视线或掩护）';box.textContent=`路径：(${plan.from.x},${plan.from.y}) → (${cell.x},${cell.y})；计算距离 ${plan.feet} 尺；${result}`;} }
function updateRangePreview(grid, range){ const cells=coveredCells(range); grid.querySelectorAll('.preview').forEach(node=>node.classList.remove('preview')); cells.forEach(key=>grid.querySelector(`[data-cell="${key}"]`)?.classList.add('preview')); const targets=rangeTargets(cells).map(c=>c.name).join('、')||'无'; const live=document.querySelector('#range-live'); if(live)live.textContent=`${rangeLabel(range.shape)}实时预览：${cells.length} 格；自动候选：${targets}`; }
function roll() {
  const formula=document.querySelector('#dice-formula')?.value?.trim()||'1d20',mode=document.querySelector('#dice-mode')?.value||'normal';
  const parsed=parseDiceFormula(formula);
  if(!parsed.ok)return message(parsed.error,'error');
  try {
    const result=rollDiceFormula(parsed,mode);
    recordNonReversibleEvent('dice.rolled',{...result,visibility:state.settings.darkRolls?'dm-only':'public'},{reason:'随机骰果不可由撤销重演；事件仅保留已产生的结果。'});
    message(`${mode==='advantage'?'优势':mode==='disadvantage'?'劣势':'普通'} · ${result.canonical} = [${result.dice.join(', ')}]${result.modifier?` ${result.modifier>0?'+':''}${result.modifier}`:''} = ${result.total}`);
  } catch(error) { message(error.message,'warn'); }
}
function rollWorkbenchDice(formula='1d20',mode='normal',darkRoll=false){
  const parsed=parseDiceFormula(formula);
  if(!parsed.ok)return message(parsed.error,'error');
  try{
    const result=rollDiceFormula(parsed,mode);
    recordNonReversibleEvent('dice.rolled',{...result,visibility:darkRoll?'dm-only':'public'},{reason:'随机骰果不可由撤销重演；事件仅保留已产生的结果。'});
    message(`${mode==='advantage'?'优势':mode==='disadvantage'?'劣势':'普通'} · ${result.canonical} = [${result.dice.join(', ')}]${result.modifier?` ${result.modifier>0?'+':''}${result.modifier}`:''} = ${result.total}`);
    persist();
    render();
  }catch(error){message(error.message,'warn');}
}
function exportJson(){try{const exportSession=sessionForStorage(state,clone),blob=new Blob([JSON.stringify(createV070Envelope(exportSession,{exportedAt:now()}),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`dnd-terminal-v0.7.0-${state.sessionId}.json`;a.click();URL.revokeObjectURL(a.href);message(`已生成 v0.7.0 / Session Schema ${SESSION_ENVELOPE_SCHEMA_VERSION} JSON 导出；UI 偏好未进入文件。`);return true;}catch(error){message(`导出失败：${error.message}`,'error');return false;}}
function writeback(){message('M1-S2 只允许在战斗结束后，由 DM 从候选差异中逐项确认 HP 与既有资源余额。装备消费扩展、永久损伤、奖励、诅咒与祝福仍不自动回写。','warn');}

function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
function currentWorkspaceId(){return activeWorkspaceId;}
function currentDomainTab(){return domainTabForWorkspace(activeWorkspaceId);}
function workspaceNavButton(workspace){return `<button class="${currentWorkspaceId()===workspace.id?'active':''}" data-workspace="${workspace.id}" aria-current="${currentWorkspaceId()===workspace.id?'page':'false'}">${workspace.label}</button>`;}
function selectWorkspaceForDomain(domainTab,{updateHash=true}={}){
  const workspaceId=workspaceForDomainTab(domainTab);activeWorkspaceId=workspaceId;
  uiPreferences={...uiPreferences,lastWorkspace:workspaceId};persistUiPreferences();
  if(updateHash&&globalThis.location?.hash!==`#${workspaceId}`)globalThis.location.hash=workspaceId;
}
function setWorkspace(workspaceId,{updateHash=true}={}){
  const next=WORKSPACES.find(workspace=>workspace.id===workspaceId);if(!next)return;
  selectWorkspaceForDomain(next.domainTab,{updateHash});
  render();
}
function layoutControlsMarkup(workspaceId){
  const workspace=WORKSPACES.find(item=>item.id===workspaceId);if(!workspace?.configurable)return `<div class="workspace-kicker" aria-label="固定布局"><span>固定布局</span></div>`;
  const panels=panelsForWorkspace(workspaceId,uiPreferences);
  return `<details class="layout-controls" ${uiPreferences.layoutEditing?'open':''}><summary>布局与密度 <span>仅改变显示</span></summary><div class="layout-controls-body"><label>信息密度<select data-ui-density><option value="standard" ${uiPreferences.density==='standard'?'selected':''}>标准</option><option value="compact" ${uiPreferences.density==='compact'?'selected':''}>紧凑</option></select></label><div class="layout-panel-list">${panels.map((panel,index)=>{const preference=panel.preference;return `<div class="layout-panel-control"><div><b>${esc(panel.title)}</b><small>${esc(panel.responsibility)}</small></div><label><input type="checkbox" data-panel-visible="${panel.id}" ${preference.visible?'checked':''} ${panel.canHide?'':'disabled'}/> 显示</label><label>宽度<select data-panel-width="${panel.id}">${[['narrow','窄'],['standard','标准'],['full','全宽']].map(([width,label])=>`<option value="${width}" ${preference.width===width?'selected':''}>${label}</option>`).join('')}</select></label><div class="layout-order"><button type="button" data-panel-move="${panel.id}" data-direction="-1" ${index===0?'disabled':''} aria-label="上移 ${esc(panel.title)}">上移</button><button type="button" data-panel-move="${panel.id}" data-direction="1" ${index===panels.length-1?'disabled':''} aria-label="下移 ${esc(panel.title)}">下移</button></div></div>`;}).join('')}</div><div class="row"><button type="button" data-layout-reset="${workspaceId}">恢复本工作区默认</button><button type="button" data-layout-reset-all>恢复全部工作区默认</button></div></div></details>`;
}
function phaseLabel(value){return ({preparation:'准备',active:'进行中',ended:'已结束',cleanup:'清理'}[value]||'待确认');}
function actionLabel(value){return ({available:'可行动',spent:'普通动作已用','death-save-only':'仅死亡豁免',blocked:'不可行动'}[value]||'待确认');}
function currentStatusProjection(){return renderedStatusProjection||projectWorkspaceStatus(state);}
function projectionStatusMarkup(projected){
  if(!projected)return '';
  const confidence=projected.facets.confidence;
  if(confidence.value==='needs-review'||confidence.value==='unknown')return `<span class="projection-status needs-review" title="${esc(confidence.reasons.join('；')||'来源未记录')}">待复核 · ${esc(projected.facets.life.raw)}</span>`;
  return `<span class="projection-status priority-${projected.priority}">${esc(projected.compact.status)}</span>`;
}
function characterProjectionStatusMarkup(characterId){
  const projectionIds=new Set(state.combatProjections.filter(item=>item.characterId===characterId).map(item=>item.projectionId));
  const statuses=state.combatants.filter(item=>projectionIds.has(item.combatProjectionId)).map(item=>currentStatusProjection().byId[item.id]).filter(Boolean);
  if(!statuses.length)return '';
  return `<div class="character-projection-status"><span class="eyebrow">CURRENT COMBAT PROJECTION</span>${statuses.map(status=>`<span><b>${esc(status.identity.name)}</b>${projectionStatusMarkup(status)}</span>`).join('')}</div>`;
}
function battleSituationMarkup(status){
  const battle=status.workspaces.battle,current=battle.current,latest=battle.recentEvents[0],alerts=status.urgent.filter(item=>item.id!==current?.id),decision=battle.decisions[0];
  return `<section class="situation-grid" data-panel-id="recent-result" aria-label="战斗态势五问"><article><span>当前轮次</span><b>第 ${status.encounter.round||0} 轮</b><small>${phaseLabel(status.encounter.phase)}</small></article><article><span>当前行动</span><b>${current?esc(current.identity.name):'暂无行动者'}</b><small>${current?actionLabel(current.facets.action.value):'等待先攻或增援'}</small></article><article class="${alerts.length?'attention':''}"><span>重要异常</span><b>${alerts.length} 项</b><small>${alerts[0]?`${esc(alerts[0].identity.name)} · ${esc(alerts[0].compact.status)}`:'当前无高优先级异常'}</small></article><article><span>最近结果</span><b>${latest?`#${latest.sequence??'—'}`:'尚无事件'}</b><small>${latest?esc(latest.type):'操作结果将在此出现'}</small></article><article class="${decision?'attention':''}"><span>待 DM 决定</span><b>${battle.decisions.length} 项</b><small>${decision?`${esc(decision.combatantName)} · ${esc(decision.label)}`:'当前无待裁定事项'}</small></article></section>`;
}
function workspaceChromeMarkup(workspaceId, content){
  const status=currentStatusProjection(),workspace=WORKSPACES.find(item=>item.id===workspaceId),active=status.byId[status.encounter.activeId],blocker=status.blockers[0];
  return `<section class="workspace workspace-${workspaceId}" data-workspace-density="${uiPreferences.density}"><header class="workspace-heading"><div><span class="eyebrow">${esc(workspace?.label||'工作区')}</span><h2>${esc(workspace?.description||'')}</h2></div><div class="workspace-status"><span>${phaseLabel(status.encounter.phase)}</span><span>第 ${status.encounter.round||0} 轮</span><span>${active?`当前：${esc(active.identity.name)}`:'暂无当前行动者'}</span>${blocker?`<span class="status-blocker">待处理：${esc(blocker.identity.name)}</span>`:''}</div></header>${workspaceId==='battle'?battleSituationMarkup(status):''}${layoutControlsMarkup(workspaceId)}<div class="workspace-content" data-workbench-content>${content}</div></section>`;
}
function shortLabel(c){
  const pool=labelPool();
  const baseFor=item=>{
    if(item.shortLabel)return item.shortLabel;
    let length=Math.min(2,item.name.length);
    while(length<item.name.length&&pool.some(other=>other.id!==item.id&&other.name!==item.name&&other.name.slice(0,length)===item.name.slice(0,length)))length+=1;
    return item.name.slice(0,length);
  };
  const base=baseFor(c),collisions=pool.filter(other=>baseFor(other)===base);
  if(collisions.length<=1)return base;
  if(collisions.every(other=>other.name===c.name))return `${base} ${c.displayOrdinal||1}`;
  return `${base} ${Math.max(1,collisions.findIndex(other=>other.id===c.id)+1)}`;
}
function combatantRow(c){
  const effects=effectsFor(c.id),isActive=active()?.id===c.id,isSelected=state.ui.selectedId===c.id,ended=combatEnded(),dead=isDead(c),transformed=isTransformed(c),away=c.presenceStatus==='temporarily-away',finished=c.participationStatus==='ended';
  const locked=ended||away||finished||dead||transformed?'disabled':'';
  const saves=c.deathSaves||{successes:0,failures:0};
  const status=transformed?`已转化为 ${esc(getCombatant(c.deathRecord?.transformedIntoId)?.name||'其他单位')}`:isPc(c)?`${lifeStatusLabel(c)}${pcLifePhase(c)==='dying'?` · 成功 ${saves.successes}/3 · 失败 ${saves.failures}/3`:''}${(c.conditions||[]).length?` · ${esc((c.conditions||[]).map(conditionLabel).join('、'))}`:''}`:dead?'死亡（DM 判定）':finished?'本场已结束参战':away?'临时离场':'在场参战';
  const lifecycle=!ended&&!finished&&!dead&&!transformed&&(!isPc(c)||ordinaryActionsAllowed(c))?(away&&c.hp>0?`<button data-lifecycle-reenter="${c.id}">再入场</button>`:away?'':`<button data-lifecycle-leave="${c.id}">暂时离场</button><button class="danger" data-lifecycle-end="${c.id}">结束参战</button>`):ended&&state.ui.postCombatCleanup&&!c.cleanupRemoved?`<button data-cleanup-token="${c.id}">撤下棋子</button>`:'';
  const critical=isPc(c)&&c.hp===0?`<label><input type="checkbox" data-hp-critical="${c.id}"/> 本次为重击（仅用于 0 HP 受伤失败数）</label>`:'';
  const hpControls=away||finished||dead||transformed?'':`<label class="compact-input">伤害/治疗<input type="number" min="1" step="1" value="5" data-hp-input="${c.id}" inputmode="numeric" ${locked}/></label>${critical}<button data-hp-damage="${c.id}" ${locked}>伤害</button><button data-hp-heal="${c.id}" ${locked}>治疗</button><label class="compact-input">临时 HP<input type="number" min="0" step="1" value="${c.tempHp}" data-temp-hp-input="${c.id}" inputmode="numeric" ${locked}/></label><button data-temp-hp="${c.id}" ${locked}>设定</button>`;
  const effectNames=effects.length?`${effects.length} 项效果：${esc(effects.map(effect=>effect.name).join('、'))}`:'无效果';
  const effectCount=effects.length?`${effects.length} 项效果`:'无效果';
  return `<article class="combatant ${c.relation} ${isActive?'active':''} ${isSelected?'selected':''} ${away?'away':''} ${finished?'finished':''} ${dead?'dead':''} ${transformed?'transformed':''}" data-select-card="${c.id}" tabindex="0" aria-label="选择 ${esc(displayName(c))}"><div class="combatant-summary"><span class="name">${esc(displayName(c))}</span><span class="pill">${c.relation}</span><span class="pill ${dead?'death-pill':''}">${status}</span>${projectionStatusMarkup(currentStatusProjection().byId[c.id])}<span>HP ${c.hp}/${c.maxHp}${c.tempHp?` +${c.tempHp}临时`:''}</span><span>先攻 ${c.initiative??'—'}</span><span>移动 ${c.movementRemaining}/${c.speed}</span><span class="effect-compact density-standard-only">${effectNames}</span><span class="effect-compact density-compact-only">${effectCount}</span></div><div class="combatant-actions">${hpControls}${lifecycle}</div></article>`;
}
function effectCards(id){const effects=effectsFor(id),combatant=getCombatant(id),legacy=(combatant?.conditions||[]).filter(condition=>!(isPc(combatant)&&['unconscious','prone'].includes(condition)));return effects.map(effect=>`<div class="effect-card"><b>${esc(effect.name)}</b><small>${esc(effectSource(effect))} · ${esc(effectEnds(effect))}${effect.concentration?' · 专注':''}</small></div>`).join('')+(legacy.length?`<div class="effect-card legacy"><b>${esc(legacy.join('、'))}</b><small>旧版未跟踪状态：无来源与轮次</small></div>`:'')||'<span class="muted">无状态或 Buff</span>';}
function referenceActionsFor(c){const normalize=action=>typeof action==='string'?{name:action,category:'action'}:action,entryId=c?.templateSnapshot?.sourceEntryId,admitted=referenceTemplateSeeds.find(template=>template.sourceEntryId===entryId),approved=(admitted?.referenceActions||[]).map(normalize),snapshot=(c?.templateSnapshot?.referenceActions||[]).map(normalize);if(snapshot.length)return snapshot.map(action=>{const evidence=approved.find(item=>item.name===action.name);return {...evidence,...action,detail:action.detail||evidence?.detail};});return approved;}
function customActionsForCombatant(c){const referenceNames=new Set(referenceActionsFor(c).map(action=>action.name));return (c?.templateSnapshot?.actions||[]).map(action=>typeof action==='string'?{name:action,category:'action'}:action).filter(action=>!referenceNames.has(action.name)).map(action=>({...action,sourceType:'custom',detail:actionDetail(action)||'DM 尚未填写说明。'}));}
function referenceTraitsFor(c){const normalize=trait=>typeof trait==='string'?{name:trait}:trait,entryId=c?.templateSnapshot?.sourceEntryId,admitted=referenceTemplateSeeds.find(template=>template.sourceEntryId===entryId),approved=(admitted?.traits||[]).map(normalize),snapshot=(c?.templateSnapshot?.traits||[]).map(normalize),countedResourceNames=new Set([...referenceResourceNames(admitted),...referenceResourceNames(c?.templateSnapshot)]),traits=snapshot.length?snapshot.map(trait=>{const evidence=approved.find(item=>item.name===trait.name);return {...evidence,...trait,detail:trait.detail||evidence?.detail,sourceType:'reference'};}):approved.map(trait=>({...trait,sourceType:'reference'}));return traits.filter(trait=>!countedResourceNames.has(trait.name));}
function masteryCatalogEntry(masteryPropertyId,weaponKind=''){
  return Object.values(ADMITTED_WEAPON_MASTERY).find(entry=>entry.masteryPropertyId===masteryPropertyId)||ADMITTED_WEAPON_MASTERY[weaponKind]||null;
}
function masteryConfigurationDetails(source){
  const mastery=source?.weaponMastery||source?.templateSnapshot?.weaponMastery||{},attacks=source?.attackProfiles||source?.templateSnapshot?.attackProfiles||[];
  return (mastery.selections||[]).map(selection=>{
    const attack=attacks.find(item=>item.weaponId===selection.weaponId||(selection.weaponKind&&(item.weaponKind||item.name)===selection.weaponKind));
    const entry=masteryCatalogEntry(selection.masteryPropertyId||attack?.masteryPropertyId,selection.weaponKind||attack?.weaponKind||attack?.name);
    return {selection,attack,entry,weaponKind:selection.weaponKind||attack?.weaponKind||attack?.name||'未知武器'};
  });
}
function masteryConfigurationMarkup(source,{empty=true}={}){
  const mastery=source?.weaponMastery||source?.templateSnapshot?.weaponMastery||{},details=masteryConfigurationDetails(source);
  if(!details.length)return empty&&((mastery.grants||[]).length?'<p class="notice warn">当前长休配置尚未确认；不会生成武器精通候选。</p>':'')||'';
  return `<div class="mastery-configuration-list">${details.map(({entry,weaponKind})=>entry?`<article class="effect-card mastery-configuration"><div class="card-heading"><b>${esc(weaponKind)} · ${esc(entry.masteryTerm)}（${esc(entry.englishName)}）</b><span class="pill">当前长休配置</span></div><p><b>效果：</b>${esc(entry.effect)}</p><small><b>自动化边界：</b>${esc(entry.automation)}</small></article>`:`<article class="effect-card mastery-configuration"><b>${esc(weaponKind)} · 精通词条待核验</b><p class="muted">没有匹配到已准入的稳定词条 ID；仅保留选择事实，不自动执行。</p></article>`).join('')}</div>`;
}
function masterySelectionFor(combatant,attack){return (combatant.weaponMastery?.selections||combatant.templateSnapshot?.weaponMastery?.selections||[]).find(selection=>selection.weaponId===attack.weaponId||selection.weaponKind===(attack.weaponKind||attack.name));}
function recordAttackOutcome(combatantId,attackId,result,targetId){
  const combatant=getCombatant(combatantId),attack=(combatant?.attackProfiles||combatant?.templateSnapshot?.attackProfiles||[]).find(item=>item.id===attackId);
  if(!combatant||!attack||active()?.id!==combatantId||combatEnded()||!ordinaryActionsAllowed(combatant))return message('只能由当前具有普通行动资格的行动者记录已选攻击结果。','warn');
  const payload={outcomeId:uid(),combatantId,attackId,weaponId:attack.weaponId||null,selectionId:masterySelectionFor(combatant,attack)?.id||null,masteryPropertyId:attack.masteryPropertyId||null,result,targetId:targetId||null,dealtDamage:result==='hit'};
  command('attack.outcome.confirmed',payload,()=>{}, {manual:true,rulesReference:[],reason:'DM 已确认攻击结果；Terminal 不掷骰、不判 AC 或伤害'});
  if(payload.result!=='hit'||!payload.dealtDamage||payload.masteryPropertyId!=='phb2024:vex'||!payload.selectionId||!payload.targetId)return;
  const key=`${payload.outcomeId}:${payload.selectionId}:${payload.masteryPropertyId}`;
  if(state.masteryCandidates.some(candidate=>candidate.dedupeKey===key))return;
  const candidate={candidateId:uid(),dedupeKey:key,status:'pending',outcomeId:payload.outcomeId,selectionId:payload.selectionId,masteryPropertyId:payload.masteryPropertyId,sourceCombatantId:combatantId,targetId:payload.targetId,createdAt:now()};
  command('weapon-mastery.candidate.generated',candidate,()=>state.masteryCandidates.push(candidate),{rulesReference:[M1_S5_RULES.masteryProperties,M1_S5_RULES.weaponTable],reason:'命中且造成伤害后生成侵扰候选；DM 必须另行决定是否应用'});
}
function decideMasteryCandidate(candidateId,decision){
  const candidate=state.masteryCandidates.find(item=>item.candidateId===candidateId&&item.status==='pending'),source=getCombatant(candidate?.sourceCombatantId),target=getCombatant(candidate?.targetId);if(!candidate||!source)return message('精通候选已不存在或已经处理。','warn');
  if(decision==='skip')return command('weapon-mastery.candidate.skipped',{candidateId,outcomeId:candidate.outcomeId,selectionId:candidate.selectionId,masteryPropertyId:candidate.masteryPropertyId},()=>{candidate.status='skipped';candidate.decidedAt=now();},{manual:true,reason:'DM 决定不应用本次武器精通候选'});
  if(!target)return message('目标已经不在本场战斗，不能应用该候选。','warn');
  command('weapon-mastery.candidate.applied',{candidateId,outcomeId:candidate.outcomeId,selectionId:candidate.selectionId,masteryPropertyId:candidate.masteryPropertyId,targetId:target.id},()=>{candidate.status='applied';candidate.decidedAt=now();state.effects.push({id:uid(),kind:'weapon-mastery',name:'侵扰（Vex）',targetIds:[target.id],sourceKind:'weapon-mastery',sourceCombatantId:source.id,startedRound:state.turn.round,concentration:false,expires:{anchor:'source-next-turn-end',sourceCombatantId:source.id,sourceTurnOrdinal:(source.turnsStarted||1)+1},provenance:{outcomeId:candidate.outcomeId,selectionId:candidate.selectionId,masteryPropertyId:candidate.masteryPropertyId}});},{manual:true,rulesReference:[M1_S5_RULES.masteryProperties],reason:'DM 应用侵扰候选；不自动掷骰、命中或选择后续攻击'});
}
function masteryCandidatePanel(c){const candidates=state.masteryCandidates.filter(candidate=>candidate.sourceCombatantId===c?.id&&candidate.status==='pending');if(!candidates.length)return '';return `<section class="reference-group"><h4>待 DM 决定的武器精通</h4>${candidates.map(candidate=>`<div class="row"><span>侵扰候选 → ${esc(displayName(getCombatant(candidate.targetId)))}</span><button class="primary" data-mastery-apply="${candidate.candidateId}">应用</button><button data-mastery-skip="${candidate.candidateId}">跳过</button></div>`).join('')}</section>`;}
function masteryStatusPanel(c){
  const mastery=c?.weaponMastery||c?.templateSnapshot?.weaponMastery||{},candidates=state.masteryCandidates.filter(candidate=>candidate.sourceCombatantId===c?.id),effects=state.effects.filter(effect=>effect.sourceKind==='weapon-mastery'&&(effect.sourceCombatantId===c?.id||effect.targetIds?.includes(c?.id))),hasConfiguration=(mastery.grants||[]).length>0||(mastery.selections||[]).length>0;
  if(!hasConfiguration&&!candidates.length&&!effects.length)return '';
  const candidateRows=candidates.map(candidate=>`<div class="row mastery-status-row"><span>侵扰候选 → ${esc(displayName(getCombatant(candidate.targetId)))}</span><span class="pill">${candidate.status==='pending'?'待 DM 决定':candidate.status==='applied'?'已应用':candidate.status==='skipped'?'已跳过':'已补偿撤销'}</span></div>`).join('');
  const effectRows=effects.map(effect=>{const source=displayName(getCombatant(effect.sourceCombatantId))||'未知来源',targets=effect.targetIds.map(id=>displayName(getCombatant(id))).join('、')||'—',perspective=effect.sourceCombatantId===c?.id?`由当前单位施加 · 目标：${targets}`:`作用于当前单位 · 来源：${source}`,entry=masteryCatalogEntry(effect.provenance?.masteryPropertyId);return `<div class="effect-card mastery-effect"><b>${esc(effect.name)}</b>${entry?`<p><b>效果：</b>${esc(entry.effect)}</p>`:''}<small>${esc(perspective)} · ${esc(effectEnds(effect))}</small><small>${esc(entry?.automation||'仅提醒，不自动掷骰或结算。')}</small></div>`;}).join('');
  const runtime=(candidateRows||effectRows)?`<h4>本场候选与生效状态</h4>${candidateRows}${effectRows}`:'<h4>本场候选与生效状态</h4><p class="muted">尚未产生候选或生效效果；当前配置仍可直接查阅。</p>';
  const configuration=hasConfiguration?`<h4>当前长休配置</h4>${masteryConfigurationMarkup(c)}`:'';
  return `<section class="reference-group mastery-panel" id="combat-mastery-status" aria-label="当前选中者的武器精通状态"><h3>武器精通</h3><p class="muted">已选择的长休配置常驻显示；来源、目标与到期时间只属于本场实际触发状态。</p>${configuration}${runtime}</section>`;
}
function referenceActionPanel(c){
  if(!c)return '<span class="muted">选择单位后显示动作与能力。</span>';
  const attackProfiles=c.attackProfiles||c.templateSnapshot?.attackProfiles||[],canRecord=active()?.id===c.id&&!combatEnded()&&!isDead(c),attackMarkup=attackProfiles.length?`<div class="reference-group"><h4>角色卡攻击快照</h4><div class="info-grid">${attackProfiles.map(attack=>`<article class="info-item"><b>${esc(attack.name)}</b><span>攻击加值：${attack.attackBonus??'待填写'} · 伤害：${esc(attack.damage||'待填写')} ${esc(attack.damageType==='unknown'?'':' '+attack.damageType)}</span><small>${esc(attack.ability||'unknown')} · ${esc(attack.reach||attack.range||'触及/射程待填')} · ${attack.masteryEnabled&&attack.masteryPropertyId?'精通已选':'不触发精通'} · 不自动掷骰或结算</small>${canRecord?`<label>目标<select data-attack-target="${esc(attack.id)}">${state.combatants.filter(target=>target.id!==c.id&&target.presenceStatus==='on-field'&&!isDead(target)).map(target=>`<option value="${target.id}">${esc(displayName(target))}</option>`).join('')}</select></label><div class="row"><button data-attack-outcome="hit" data-attack-id="${esc(attack.id)}" data-attack-combatant="${c.id}">DM 记录命中并造成伤害</button><button data-attack-outcome="miss" data-attack-id="${esc(attack.id)}" data-attack-combatant="${c.id}">DM 记录未命中/无伤害</button></div>`:''}</article>`).join('')}</div></div>${masteryCandidatePanel(c)}`:'';
  const actions=referenceActionsFor(c).map(action=>({...action,sourceType:'reference'})),customActions=customActionsForCombatant(c),traits=referenceTraitsFor(c),items=[...actions,...customActions,...traits.map(trait=>({...trait,category:'trait'}))];
  if(!items.length)return `<h3>动作与能力 <small>（投影快照，不自动结算）</small></h3>${attackMarkup||'<span class="muted">该单位尚无已录入的攻击、动作或能力详情。</span>'}`;
  const requested=state.ui.referenceAction?.combatantId===c.id?state.ui.referenceAction:null;
  const selectedItem=items.find(item=>item.name===requested?.name&&item.sourceType===(requested?.kind||'reference'))||items[0];
  const selection=selectedItem.name,selectionKind=selectedItem.sourceType;
  const detail=selectedItem.detail||(selectionKind==='custom'?'DM 尚未填写说明。':'该规则条目仅有名称核验，本地尚未准入详情。');
  const options=Array.isArray(selectedItem.options)?selectedItem.options:[];
  const groups=[['action','动作'],['bonus','附赠动作'],['legendary','传奇动作']];
  const grouped=groups.map(([category,label])=>{
    const items=actions.filter(action=>action.category===category);
    if(!items.length)return '';
    const budget=category==='legendary'?` <span class="pill">${c.legendaryActions??legendaryMax(c)}/${legendaryMax(c)}</span>`:'';
    return `<div class="reference-group"><h4>规则书${label}${budget}</h4><div class="row reference-actions">${items.map(action=>`<span class="reference-action"><button class="${selection===action.name&&selectionKind==='reference'?'active':''}" data-reference-action="${c.id}" data-reference-kind="reference" data-reference-name="${esc(action.name)}">${label} · ${esc(action.name)}</button>${category==='legendary'?`<button class="legendary-use" data-legendary-action="${c.id}" data-legendary-name="${esc(action.name)}" ${(c.legendaryActions??legendaryMax(c))<=0||combatEnded()?'disabled':''}>消耗 1</button>`:''}<span class="reference-hover">${esc(action.detail||'该规则动作仅有名称核验，本地尚未准入详情。')}</span></span>`).join('')}</div></div>`;
  }).join('');
  const customGroup=customActions.length?`<div class="reference-group"><h4>DM 自定义动作</h4><div class="row reference-actions">${customActions.map(action=>`<span class="reference-action"><button class="${selection===action.name&&selectionKind==='custom'?'active':''}" data-reference-action="${c.id}" data-reference-kind="custom" data-reference-name="${esc(action.name)}">自定义 · ${esc(action.name)}</button><span class="reference-hover">${esc(action.detail)}</span></span>`).join('')}</div></div>`:'';
  const traitGroup=traits.length?`<div class="reference-group"><h4>规则书特性</h4><div class="row reference-actions">${traits.map(trait=>`<span class="reference-action"><button class="${selection===trait.name&&selectionKind==='reference'?'active':''}" data-reference-action="${c.id}" data-reference-kind="reference" data-reference-name="${esc(trait.name)}">特性 · ${esc(trait.name)}</button><span class="reference-hover">${esc(trait.detail||'该规则特性仅有名称核验，本地尚未准入详情。')}</span></span>`).join('')}</div></div>`:'';
  const optionReferences=options.length?`<section class="reference-options"><h4>1d10 射线参考（${options.length} 项）</h4>${options.map(option=>`<details><summary>${esc(option.roll)} · ${esc(option.name)}</summary><p>${esc(option.detail)}</p></details>`).join('')}</section>`:'';
  const sourceLabel=selectionKind==='custom'?'DM 自定义 · 随模板快照保存':`来源：${esc(c.templateSnapshot?.sourceEntryId||c.templateId)} · 仅本地私有验证`;
  return `<h3>动作与能力 <small>（查阅辅助，不自动结算）</small></h3><p class="muted">角色攻击、规则书内容与 DM 自定义内容分层显示；已开始战斗使用实例中的投影快照。</p>${attackMarkup}${grouped}${customGroup}${traitGroup}<article class="action-detail"><b>${esc(selection)}</b><p>${esc(detail).replace(/\n/g,'<br/>')}</p>${optionReferences}<small>${sourceLabel}</small></article>`;
}
function initiativeResolver(){const groups=state.turn.pendingTieGroups||[];if(!groups.length)return '';return `<section class="card tie-resolver"><h2>先攻平局裁定</h2><p class="notice warn">固定骰序已生成同值；拖动前先确认顺序。单 DM 端由 DM 代录玩家决定，不会重新掷骰。</p>${groups.map(group=>`<div class="tie-group"><h3>${esc(group.label)}</h3><p class="muted">${esc(group.authority)}</p>${(state.ui.tieOrders?.[group.id]||group.ids).map((id,index)=>{const c=getCombatant(id);return `<div class="row tie-item"><b>${index+1}. ${esc(c?.name||id)}</b><button data-tie-up="${group.id}" data-tie-id="${id}" ${index===0?'disabled':''}>上移</button><button data-tie-down="${group.id}" data-tie-id="${id}" ${index===group.ids.length-1?'disabled':''}>下移</button></div>`;}).join('')}</div>`).join('')}<button class="primary" data-action="confirm-initiative">确认顺序并开始第 1 轮</button></section>`;}
function initiativeTimeline(){if(!state.turn.started)return '';return `<section class="card initiative-timeline"><div><h2>行动轮 · 第 ${state.turn.round} 轮</h2><p class="muted">灰色为本轮已行动；临时离场和结束参战单位不在有效先攻条内。</p></div><div class="timeline-scroll"><div class="timeline-track">${state.turn.order.filter(id=>isTurnEligible(getCombatant(id))).map(id=>{const index=state.turn.order.indexOf(id),c=getCombatant(id),phase=index<state.turn.index?'done':index===state.turn.index?'current':'upcoming';return `<button class="timeline-node ${phase}" data-select="${id}"><span>${esc(shortLabel(c))}</span><small>先攻 ${c?.initiative??'—'}</small></button>`;}).join('')||'<span class="muted">当前没有在场参战单位。</span>'}</div></div></section>`;}
function entryDraftPanel(){
  const d=state.ui.entryDraft;if(!d)return '';
  return `<section class="card"><h2>${d.stagedItemId?'编辑待入场单位':d.reserveMemberId?'投入场外预备单位':'战斗中临时加入'}</h2><p class="notice warn">暂存前不会创建参战实例、写入先攻或进入统计。默认以 <code>1d20 + 调整值</code> 待投；可在本页直接改为 DM 手填最终值。</p><form data-entry-draft-form><div class="row"><label>显示名<input name="name" value="${esc(d.name)}" required/></label><label>关系<select name="relation"><option value="enemy" ${d.relation==='enemy'?'selected':''}>敌对</option><option value="ally" ${d.relation==='ally'?'selected':''}>友方</option><option value="neutral" ${d.relation==='neutral'?'selected':''}>中立</option></select></label><label>当前 HP<input name="hp" type="number" min="0" max="${d.templateSnapshot.maxHp}" value="${d.hp}"/></label></div><div class="row"><label>先攻方式<select name="initiativeMode" data-entry-initiative-mode><option value="roll" ${d.initiativeMode==='roll'?'selected':''}>现场投 1d20 + 调整值</option><option value="manual" ${d.initiativeMode==='manual'?'selected':''}>DM 手动填写最终值</option></select></label><label>先攻调整值<input name="initiativeModifier" type="number" step="1" value="${normalizeInitiativeModifier(d.initiativeModifier)}"/></label><label>手动最终先攻<input name="initiative" type="number" step="1" value="${esc(d.initiative)}" ${d.initiativeMode==='manual'?'':'disabled'} /></label><label>同值顺序<select name="tiePlacement"><option value="after" ${d.tiePlacement==='after'?'selected':''}>同值单位之后</option><option value="before" ${d.tiePlacement==='before'?'selected':''}>同值单位之前</option></select></label></div><details><summary>详细配置（资源、状态与精确坐标）</summary><div class="row"><label>资源<input name="resources" value="${esc(Object.entries(d.resources||{}).map(([name,value])=>`${name}:${value}`).join('，'))}" placeholder="名称:数量"/></label><label>状态<input name="conditions" value="${esc((d.conditions||[]).join('，'))}" placeholder="例如：隐形，中毒"/></label><label>地图 X<input name="x" type="number" min="0" value="${d.position.x}"/></label><label>地图 Y<input name="y" type="number" min="0" value="${d.position.y}"/></label></div></details><p class="muted">选择现场投骰后，在提交本表时才掷 1d20；调整值来自模板默认值，但 DM 可在此修改。地图摆放以拖拽为主，坐标仅用于精确定位。</p><div class="row"><button class="primary" type="submit" data-entry-draft-action="map">确认资料并进入摆放</button><button type="submit" data-entry-draft-action="stage">暂存等待批量摆放</button><button type="button" data-action="cancel-entry-draft">放弃草稿</button></div></form></section>`;
}
function initiativeSummary(item,c){const total=item.kind==='reentry'?item.initiative:c.initiative,roll=item.initiativeRoll??c.initiativeRoll,modifier=item.initiativeModifier??c.initiativeModifier??0,mode=item.initiativeMode||c.initiativeMode;if(item.kind==='join'&&mode==='roll'&&!item.initiativeConfigured)return `d20 ${modifier>=0?'+':''}${modifier} · 待投`;if(mode==='roll'||mode==='reroll')return `先攻 ${total} = d20(${roll}) ${modifier>=0?'+':''}${modifier}`;if(mode==='manual')return `先攻 ${total} · DM 手填`;return `先攻 ${total??'—'}`;}
function entryPlacementPanel(){
  const items=entryPlacementItems();if(!items.length)return '';
  const joins=items.filter(item=>item.kind==='join').length,reentries=items.filter(item=>item.kind==='reentry').length,transformations=items.filter(item=>item.kind==='transformation').length;
  const pendingRolls=items.filter(item=>item.kind==='join'&&item.initiativeMode==='roll'&&!item.initiativeConfigured).length;
  return `<section class="card"><h2>本次投入批次：${items.length} 个单位</h2><p class="notice warn">新加入 ${joins} 个，再次入场 ${reentries} 个，特殊转化 ${transformations} 个。地图以拖拽摆放为主；先攻可单独或批量投骰。${pendingRolls?`当前 ${pendingRolls} 个单位待投先攻。`:''}</p>${items.map(item=>{const c=placementCombatant(item),isReentry=item.kind==='reentry',isTransformation=item.kind==='transformation',source=getCombatant(item.sourceCombatantId),pending=item.kind==='join'&&item.initiativeMode==='roll'&&!item.initiativeConfigured;const label=isTransformation?`特殊转化 · 来自 ${esc(displayName(source)||'死亡单位')}`:isReentry?'再次入场 · 原实例':'新加入';return `<form data-entry-placement-form data-placement-id="${c.id}" class="entry-placement-item"><b>${esc(displayName(c))}</b><div class="row"><span class="pill">${label}</span><span class="pill">占位 ${c.footprint.widthCells}×${c.footprint.heightCells}</span><span class="pill">${initiativeSummary(item,c)}</span>${pending?`<button type="button" data-roll-entry-initiative="${c.id}">投先攻</button>`:''}${isReentry?`<button type="button" data-edit-reentry-placement="${c.id}">编辑再入场</button>`:isTransformation?'':`<button type="button" data-edit-entry-placement="${c.id}">编辑资料</button>`}<button type="button" data-remove-entry-placement="${c.id}">移出本批</button></div><details><summary>详细配置（精确坐标）</summary><div class="row"><label>地图 X<input name="x" type="number" min="0" value="${c.position.x}"/></label><label>地图 Y<input name="y" type="number" min="0" value="${c.position.y}"/></label><button type="submit">更新坐标</button></div></details></form>`;}).join('')}<div class="row">${pendingRolls?`<button data-action="roll-pending-entry-initiatives">为待投单位批量骰先攻</button>`:''}<button data-action="entry-placement-map">跳转至地图批量摆放</button><button class="primary" data-action="confirm-entry-placement">确认本批全部投入</button><button data-action="cancel-entry-placement">取消整批投入</button></div></section>`;
}
function reentryDraftPanel(){
  const d=state.ui.reentryDraft,c=getCombatant(d?.combatantId);if(!d||!c)return '';
  return `<section class="card"><h2>${esc(c.name)}：准备再次入场</h2><p class="notice warn">与战斗中加入单位相同：可直接进入地图摆放，或先暂存等待批量摆放。临时 HP、手工状态、Buff、Debuff 与专注已在离场时清除；再次入场保留当前 HP、已消耗资源、法术位和实例身份。</p><form data-reentry-draft-form><div class="row"><label>先攻<select name="initiativeMode" data-reentry-initiative-mode><option value="keep" ${d.initiativeMode==='keep'?'selected':''}>沿用 ${c.initiative??'—'}</option><option value="reroll" ${d.initiativeMode==='reroll'?'selected':''}>重新投 1d20 + 调整值</option><option value="manual" ${d.initiativeMode==='manual'?'selected':''}>DM 手动填写最终值</option></select></label><label>先攻调整值<input name="initiativeModifier" type="number" step="1" value="${normalizeInitiativeModifier(d.initiativeModifier,c.initiativeModifier)}"/></label><label>手动最终先攻<input name="initiative" type="number" step="1" value="${d.initiative??c.initiative??0}" ${d.initiativeMode==='manual'?'':'disabled'}/></label><label>同值顺序<select name="tiePlacement"><option value="after" ${d.tiePlacement==='after'?'selected':''}>同值单位之后</option><option value="before" ${d.tiePlacement==='before'?'selected':''}>同值单位之前</option></select></label></div><details><summary>详细配置（精确坐标）</summary><div class="row"><label>地图 X<input name="x" type="number" min="0" value="${d.position.x}"/></label><label>地图 Y<input name="y" type="number" min="0" value="${d.position.y}"/></label></div></details><p class="muted">地图摆放以拖拽为主；坐标仅用于精确定位。</p><div class="row"><button class="primary" type="submit" data-reentry-draft-action="map">确认资料并进入摆放</button><button type="submit" data-reentry-draft-action="stage">暂存等待批量摆放</button><button type="button" data-action="cancel-reentry-draft">放弃草稿</button></div></form></section>`;
}
function reservesPanel(){const pendingReserveIds=new Set(entryPlacementItems().map(item=>item.reserveMemberId).filter(Boolean)),reserves=state.encounter.members.filter(member=>member.deployment==='reserve'&&!member.deployedCombatantId&&!pendingReserveIds.has(member.id));if(!reserves.length||combatEnded())return '';return `<section class="card"><h2>场外预备</h2><p class="muted">预备单位尚未获得先攻位置；投入时由 DM 设置位置与先攻。</p><div class="row">${reserves.map(member=>`<button data-reserve-deploy="${member.id}">投入 ${esc(member.name)}</button>`).join('')}</div></section>`;}
function deathResolutionPanel(){const resolution=state.ui.deathResolution,c=getCombatant(resolution?.combatantId);if(!resolution||!isDead(c)||isPc(c)||combatEnded())return '';if(resolution.mode!=='transform')return `<section class="card death-resolution"><h2>处理死亡：${esc(displayName(c))}</h2><p class="notice warn">该怪物 / NPC 已记录为死亡，已退出先攻与再入场。以下均为 DM 手动事件，不自动裁定法术、材料、即时死亡或复活规则。</p><div class="row"><button class="primary" data-death-dm-revive="${c.id}">DM 特许复起</button><button data-death-special="${c.id}">特殊复苏 / 转化</button><button data-death-close>取消</button></div><p class="death-help">DM 指定极端特殊情况，以 1 HP 复起；不恢复资源、法术位、临时 HP、状态或效果。</p>${c.kind==='npc'?s2ControlledUndeadPanel(c):''}</section>`;const templates=transformationTemplates(),suggestedName=templates.length?`${templates[0].name}化${c.name}`:'';return `<section class="card death-resolution"><h2>特殊复苏 / 转化：${esc(displayName(c))}</h2><p class="notice warn">选择一个怪物或 NPC 模板，系统会保留原死亡实例，并创建新的参战实例。请由 DM 裁定其叙事与规则来源。</p>${templates.length?`<form data-death-transform-form><div class="row"><label>转化模板<select name="templateId" required data-transform-template data-source-name="${esc(c.name)}">${templates.map(template=>`<option value="${template.id}" data-template-name="${esc(template.name)}">${esc(template.name)} · ${esc(template.sourceType||'custom')}</option>`).join('')}</select></label><label>显示名<input name="name" data-transform-name data-suggested-name="${esc(suggestedName)}" value="${esc(suggestedName)}" placeholder="可由 DM 自行修订"/></label><label>关系<select name="relation"><option value="enemy" ${c.relation==='enemy'?'selected':''}>敌对</option><option value="ally" ${c.relation==='ally'?'selected':''}>友方</option><option value="neutral" ${c.relation==='neutral'?'selected':''}>中立</option></select></label><label>当前 HP<input name="hp" type="number" min="1" value="" placeholder="默认最大 HP"/></label></div><div class="row"><label>先攻<select name="initiativeMode"><option value="keep">沿用死亡单位先攻</option><option value="reroll">重新投 1d20</option><option value="manual">DM 手动填写</option></select></label><label>手动先攻<input name="initiative" type="number" min="0" value="${c.initiative??0}"/></label><label>同值顺序<select name="tiePlacement"><option value="after">同值单位之后</option><option value="before">同值单位之前</option></select></label></div><div class="row"><button class="primary" type="submit" data-transform-action="direct">确认并在原位置转化</button><button type="submit" data-transform-action="map">进入地图批量摆放</button><button type="button" data-death-close>取消</button></div></form>`:'<p class="notice warn">单位库中没有可用于特殊转化的怪物或 NPC 模板。</p>'}</section>`;}
function endCombatPanel(){const ending=state.ui.endCombatConfirm;if(!ending||combatEnded())return '';return `<section class="card end-combat-confirm"><h2>确认结束战斗</h2><p class="notice warn">在场 ${ending.onField} · 临时离场 ${ending.away} · 未投入预备 ${ending.reserves} · 未确认草稿 ${ending.draft}。确认后会结束所有已参战实例并放弃未确认草稿；长期角色只生成待审核候选，不会直接回写。</p>${ending.hasLinkedCharacters?'<p class="muted">本场含角色投影：将进入只读战后清理，完成候选审核后才能新建遭遇。</p>':'<p class="muted">将进入只读战后清理；可随后清空战场并新建遭遇。</p>'}<div class="row"><button class="primary" data-end-combat-confirm="save">结束并导出 JSON</button><button data-end-combat-confirm="nosave">结束但不导出</button><button data-end-combat-cancel>继续战斗</button></div></section>`;}
function injectEndCombatPanel(){const markup=endCombatPanel(),host=document.querySelector('.panel.two')||document.querySelector('[data-panel-id="turn"]')?.closest('.wb-column-content')||document.querySelector('.wb-col-left .wb-column-content');if(markup&&host&&!document.querySelector('.end-combat-confirm'))host.insertAdjacentHTML('beforebegin',markup);}
function actionEconomyMarkup(focus,canOperate,canRestoreEconomy){
  const items=[['actionAvailable','动作'],['bonusActionAvailable','附赠动作'],['reactionAvailable','反应']];
  const canSpend=canOperate&&ordinaryActionsAllowed(focus);
  return `<section class="economy-panel" aria-label="行动经济"><div class="economy-grid">${items.map(([field,label])=>{const available=!!focus[field];return `<article class="economy-column ${available?'is-available':'is-spent'}"><div class="economy-status"><span>${label}</span><b>${available?'可用':'已用'}</b></div><button data-economy="${field}" ${canSpend&&available?'':'disabled'}>使用${label}</button><button class="economy-restore" data-economy-restore="${focus.id}" data-economy-field="${field}" ${canRestoreEconomy&&!available?'':'disabled'}>恢复${label}</button></article>`;}).join('')}</div><p class="muted density-standard-only">每列依次对应当前状态、使用操作和 DM 手动恢复。恢复只记录 DM 已确认的特殊裁定，不自动判断能力条件或消耗。</p><p class="muted density-compact-only">状态／使用／DM 恢复上下对应。</p></section>`;
}
function manualEffectMarkup(){
  return `<div class="effect-entry-form"><label class="effect-field effect-name-field"><span>效果名称</span><input id="effect-manual-name" placeholder="例如：祝福"/></label><label class="effect-field"><span>持续轮数</span><input id="effect-manual-duration" type="number" min="1" value="1"/></label><label class="effect-field"><span>专注</span><span class="checkbox-field"><input id="effect-manual-concentration" type="checkbox"/>需要专注</span></label><span class="effect-field effect-submit-field"><span aria-hidden="true">操作</span><button data-action="manual-effect">添加 Buff/状态</button></span></div>`;
}
function combatView(){
  const a=active(),focus=getCombatant(state.ui.selectedId)||a,ended=combatEnded(),cleanup=!!state.ui.postCombatCleanup,hasSelected=!!getCombatant(state.ui.selectedId),canOperate=!!focus&&focus.id===a?.id&&!ended&&!isDead(focus),canRestoreEconomy=!!focus&&!ended&&!isDead(focus)&&focus.presenceStatus==='on-field'&&focus.participationStatus==='active';
  const status=ended?(cleanup?'本场战斗已结束；当前为只读战后清理，可撤下棋子但不能行动、进入先攻或再入场。':`本场战斗已结束于第 ${state.turn.round} 轮；记录已封存为只读。`):state.turn.started?(a?`第 ${state.turn.round} 轮 · 当前：${esc(displayName(a))}`:`第 ${state.turn.round} 轮 · 等待增援，可投入单位或结束战斗`):'尚未开始：确认遭遇后可掷先攻。';
  return `${initiativeTimeline()}${initiativeResolver()}${entryDraftPanel()}${entryPlacementPanel()}${reentryDraftPanel()}${reservesPanel()}${deathResolutionPanel()}<section class="panel two"><div class="card"><h2>战斗控制</h2><div class="notice ${state.turn.started?'':'warn'}">${status}</div><div class="row">${ended?(cleanup?`<button data-action="cleanup-enemies">撤下全部敌对单位</button><button class="danger" data-action="finish-cleanup">清空战场并新建遭遇</button>`:''):`<button class="primary" data-action="initiative">掷先攻</button><button data-action="next">下一回合</button><button data-action="undo">撤销上一步</button><button class="danger" data-action="end-combat">结束战斗</button>`}</div><h3>单位</h3><div class="combatants ${state.ui.selectedId?'has-selection':''}">${state.combatants.filter(c=>!c.cleanupRemoved).map(combatantRow).join('')||'<span class="muted">暂无仍在战场上的单位。</span>'}</div></div><div class="card"><h2>当前选中者状态</h2><p class="muted density-standard-only">${hasSelected?`正在查看：${esc(displayName(focus))}`:'未手动选择，默认显示当前行动者。'}</p>${focus?`${actionEconomyMarkup(focus,canOperate,canRestoreEconomy)}${canOperate?'':`<p class="notice warn">${ended?'战斗已结束，状态只读。':isDead(focus)?'该单位已死亡，不能行动、治疗、再入场或以普通方式修改状态。':'当前查看单位不是行动者；行动、资源与手动效果操作仅对当前行动者开放。'}</p>`}${isDead(focus)&&!ended?`<section class="death-controls"><h3>死亡处理</h3><p class="muted">尸体棋子保留在地图；可由 DM 决定特许复起或特殊复苏 / 转化。</p><button class="primary" data-death-resolve="${focus.id}">处理死亡</button></section>`:''}<h3>资源</h3>${Object.entries(focus.resources).map(([k,v])=>`<div class="row"><span>${esc(k)} ${v}/${focus.resourceMax[k]??v}</span><button data-resource="${k}" data-amount="-1" ${canOperate?'':'disabled'}>消耗</button><button data-resource="${k}" data-amount="1" ${canOperate?'':'disabled'}>恢复</button></div>`).join('')||'<span class="muted">无次数资源</span>'}<h3>法术位</h3>${Object.entries(focus.slots).map(([k,v])=>`<span class="pill">${k}环 ${v}/${focus.slotsMax[k]}</span>`).join(' ')||'<span class="muted">非玩家法术位模型或未配置</span>'}<h3>状态、Buff 与专注</h3><div class="effect-list">${effectCards(focus.id)}</div>${masteryStatusPanel(focus)}${canOperate?manualEffectMarkup():''}`:ended?'<span class="muted">战斗内 HP、资源与状态没有自动回写长期角色卡；长期结算仍延期。</span>':'<span class="muted">选择单位后显示操作。</span>'}<section class="reference-section">${referenceActionPanel(focus)}</section></div></section>`;
}
function mapInspector(){const c=getCombatant(state.ui.selectedId);if(!c)return '<div class="map-inspector"><h3>选中单位状态</h3><span class="muted">点选棋子后在此查看 Buff、状态、来源、朝向与发射口。</span></div>';if(isDead(c)){const nextStep=isPc(c)?'请在战斗页的“当前选中者状态”记录 DM 确认复活。':'请在战斗页的“当前选中者状态”处理复起或特殊转化。';return `<div class="map-inspector dead-inspector"><h3>选中单位状态</h3><b>${esc(c.name)}</b><small>☠ 死亡（DM 判定）· HP 0/${c.maxHp}</small>${projectionStatusMarkup(currentStatusProjection().byId[c.id])}<p class="muted">尸体棋子保留在地图，但不可移动、转向、加入范围候选或再入场。${nextStep}</p><button data-select="">取消选择</button></div>`;}ensureFacing(c);const editable=canAdjustFacing(c),port=facingOrigin(c),dirs=[['north','北'],['east','东'],['south','南'],['west','西']];return `<div class="map-inspector"><h3>选中单位状态</h3><b>${esc(c.name)}</b><small>${esc(shortLabel(c))} · HP ${c.hp}/${c.maxHp}</small>${projectionStatusMarkup(currentStatusProjection().byId[c.id])}<div class="effect-list">${effectCards(c.id)}</div><section class="facing-controls"><h4>朝向与发射口</h4><div class="row">${dirs.map(([dir,label])=>`<button data-facing="${c.id}" data-facing-value="${dir}" class="${c.facing===dir?'active':''}" ${editable?'':'disabled'}>${label}</button>`).join('')}</div><small>正面：${c.facing==='north'?'北':c.facing==='east'?'东':c.facing==='south'?'南':'西'}；发射口（地图格）：${port.x+1}, ${port.y+1}</small><div class="row">${frontPortCells(c).map(p=>`<button data-facing-port="${c.id}" data-port-x="${p.x}" data-port-y="${p.y}" class="${c.facingPort.x===p.x&&c.facingPort.y===p.y?'active':''}" ${editable?'':'disabled'}>发射口 ${c.position.x+p.x+1},${c.position.y+p.y+1}</button>`).join('')}</div>${combatEnded()?'<small>战斗已结束；朝向、发射口与位置均为只读记录。</small>':editable?'<small>当前行动者可不限次数调整；“下一回合”后锁定。</small>':`<small>该单位回合已结束；如为强制转向，可由 DM 修正。</small><div class="row">${dirs.map(([dir,label])=>`<button data-facing-correct="${c.id}" data-facing-value="${dir}">DM 修正为${label}</button>`).join('')}</div>`}</section><button data-select="">取消选择</button></div>`;}
function mapView(){const r=state.ui.range,cells=r&&r.phase==='preview'?coveredCells(r):[];const w=state.settings.width,h=state.settings.height,mode=state.settings.mapMode||'fit';let grid='';for(let y=0;y<h;y++)for(let x=0;x<w;x++){const token=state.combatants.find(c=>c.position.x===x&&c.position.y===y);const fx=token?.footprint.widthCells||1,fy=token?.footprint.heightCells||1;grid+=`<div class="cell ${cells.includes(`${x},${y}`)?'preview':''}" data-cell="${x},${y}">${token?`<div class="token ${token.relation} ${active()?.id===token.id?'active':''} ${state.ui.selectedId===token.id?'selected':''}" data-token="${token.id}" title="${esc(token.name)}" style="width:calc(${fx*100}% + ${fx-1}px);height:calc(${fy*100}% + ${fy-1}px)">${esc(shortLabel(token))}</div>`:''}</div>`;} const candidates=r&&r.phase==='preview'?rangeTargets(cells):[];return `<section class="panel"><div class="map-layout"><div class="card map-wrap"><h2>二维战术地图 <small>${w}×${h} / 每格 ${state.settings.cellFeet} 尺</small></h2><div class="row map-mode"><span>显示：</span><button data-map-mode="fit" class="${mode==='fit'?'active':''}">适应屏幕</button><button data-map-mode="tactical" class="${mode==='tactical'?'active':''}">战术操作</button></div><div id="movement-preview" class="notice warn">按住棋子并拖动；松开后才记录移动。黄色提示表示待 DM 裁定。</div><div class="grid ${mode}" data-map-grid style="--grid-cols:${w};grid-template-columns:repeat(${w},var(--cell-size))">${grid}</div><p class="muted">地图不叠加 Buff 图标；点选棋子查看单位状态卡。</p></div><aside class="card map-inspector-panel">${mapInspector()}</aside><aside class="card"><h2>地图与范围</h2><p class="muted">棋子：按住拖动、松开提交。范围：选择形状后在地图按住拖动；预览本身不写入事件。</p><div class="row"><button data-range="circle">Circle</button><button data-range="cone">Cone</button><button data-range="line">Line</button><button data-range="square">Square</button></div>${r?`<div id="range-live" class="notice ${r.phase==='armed'?'warn':''}">${r.phase==='armed'?'已选择形状：请在地图按住并拖动。':`${r.shape} 预览：${cells.length} 格；候选 ${candidates.length} 个。松开后可编辑。`}</div>${r.phase==='preview'?`<div class="row"><label>尺寸（尺）<input id="range-size" type="number" min="5" step="5" value="${r.size}" /></label><label>结算<select id="range-mode"><option value="damage">伤害</option><option value="healing">治疗</option><option value="buff">Buff</option><option value="condition">状态</option></select></label><label>数值<input id="range-amount" type="number" min="1" value="8" /></label></div><div class="row"><label>效果名称<input id="effect-name" placeholder="例如：祝福 / 中毒" /></label><label>持续轮数<input id="effect-duration" type="number" min="1" value="1" /></label><label><input id="effect-concentration" type="checkbox"/> 专注</label></div><h3>候选与 DM 覆写</h3>${state.combatants.map(c=>`<div class="row"><label><input type="checkbox" data-target="${c.id}" ${([...candidates.map(x=>x.id),...r.manualAdd].includes(c.id)&&!r.manualRemove.includes(c.id))?'checked':''}/> ${esc(c.name)}</label></div>`).join('')}<div class="row"><button class="primary" data-action="apply-range">确认并批量结算</button><button data-action="cancel-range">取消预览</button></div>`:''}`:'<div class="notice warn">选择形状后，在地图按住并拖动：Circle/Square 决定中心和大小，Cone/Line 以当前行动者为源点决定朝向和长度。</div>'}</aside></div></section>`;}
function referenceActionPreview(action){const options=action.options?.length?`<ol>${action.options.map(option=>`<li><b>${esc(option.roll)} · ${esc(option.name)}</b>：${esc(option.detail)}</li>`).join('')}</ol>`:'';return `<li><b>${esc(action.name)}</b>：${esc(action.detail||'规则内容未准入')}${options}</li>`;}
function templatePreviewMarkup(template){const referenceActions=template.referenceActions||[],referenceTraits=template.traits||[],customActions=customActionsFor(template),referenceNames=referenceResourceNames(template),referenceResources=Object.entries(template.resources||{}).filter(([name])=>referenceNames.has(name)),customResources=Object.entries(template.resources||{}).filter(([name])=>!referenceNames.has(name)),color=templateColor(template);return `<h2>模板提示</h2><p><span class="color-swatch" style="background:${esc(color)}"></span>${template.colorMode==='custom'?'自选颜色':'随关系默认颜色'} · ${esc(template.relation==='enemy'?'敌对':template.relation==='ally'?'友方':'中立')}</p>${referenceActions.length?`<h3>规则书动作</h3><ul>${referenceActions.map(referenceActionPreview).join('')}</ul>`:''}${referenceTraits.length?`<h3>规则书特性</h3><ul>${referenceTraits.map(trait=>`<li><b>${esc(trait.name)}</b>：${esc(trait.detail||'规则内容未准入')}</li>`).join('')}</ul>`:''}<h3>自定义动作</h3>${customActions.length?`<ul>${customActions.map(action=>{const normalized=typeof action==='string'?{name:action}:action;return `<li><b>${esc(normalized.name)}</b>${actionDetail(normalized)?`：${esc(actionDetail(normalized))}`:' <small>用途未标注</small>'}</li>`;}).join('')}</ul>`:'<p class="muted">尚未配置自定义动作。</p>'}${referenceResources.length?`<h3>规则书资源</h3><ul>${referenceResources.map(([name,amount])=>`<li><b>${esc(name)}</b> ${amount} 次：${esc(template.resourceDetails?.[name]||'规则内容未准入')}</li>`).join('')}</ul>`:''}<h3>自定义资源</h3>${customResources.length?`<ul>${customResources.map(([name,amount])=>`<li><b>${esc(name)}</b> ${amount} 次${template.resourceDetails?.[name]?`：${esc(template.resourceDetails[name])}`:' <small>用途未标注</small>'}</li>`).join('')}</ul>`:'<p class="muted">尚未配置自定义资源。</p>'}<p class="muted">规则书条目显示已核验内容且不可在此改写；自定义条目由 DM 标注。系统不会自动裁定命中、伤害或规则效果。</p>`;}
function updateTemplatePreview(form){const preview=document.querySelector('[data-template-preview]');if(!preview)return;const field=name=>form.querySelector(`[name="${name}"]`),base=templateEditorId?templateById(templateEditorId):defaultCustomTemplate(),relation=field('relation')?.value||'enemy',colorMode=field('colorMode')?.value==='custom'?'custom':'relation',customResourceDefinition=parseResourceDefinitions(field('resources')?.value),ruleNames=referenceResourceNames(base),ruleResources={},ruleDetails={};ruleNames.forEach(name=>{if(Object.hasOwn(base.resources||{},name))ruleResources[name]=base.resources[name];if(base.resourceDetails?.[name])ruleDetails[name]=base.resourceDetails[name];});preview.innerHTML=templatePreviewMarkup({...base,relation,colorMode,color:String(field('color')?.value||relationColor(relation)),actions:[...(base.actions||[]).filter(action=>referenceActionNames(base).has(typeof action==='string'?action:action.name)),...parseActionDefinitions(field('actions')?.value)],resources:{...ruleResources,...customResourceDefinition.resources},resourceDetails:{...ruleDetails,...customResourceDefinition.resourceDetails}});}
function templateForm(template){const t=template||defaultCustomTemplate(),colorMode=t.colorMode==='custom'?'custom':'relation',customResources=customResourcesFor(t),customDetails=Object.fromEntries(Object.entries(t.resourceDetails||{}).filter(([name])=>!referenceResourceNames(t).has(name)));return `<div class="template-editor"><form data-v2-template-form class="template-form"><h2>${template?'编辑单位模板':'新建自定义单位'}</h2><div class="row"><label>名称<input name="name" value="${esc(t.name)}" required/></label><label>棋子简称<input name="shortLabel" value="${esc(t.shortLabel||'')}"/></label><label>类型<select name="kind"><option value="monster" ${t.kind==='monster'?'selected':''}>怪物</option><option value="npc" ${t.kind==='npc'?'selected':''}>NPC</option></select></label><label>关系<select name="relation" data-template-relation><option value="enemy" ${t.relation==='enemy'?'selected':''}>敌对</option><option value="ally" ${t.relation==='ally'?'selected':''}>友方</option><option value="neutral" ${t.relation==='neutral'?'selected':''}>中立</option></select></label></div><div class="row"><label>阵营<input name="alignment" value="${esc(t.alignment||'')}"/></label><label>体型<input name="size" value="${esc(t.size||'中型')}"/></label><label>AC<input name="armorClass" type="number" min="0" value="${t.armorClass??10}"/></label><label>HP<input name="maxHp" type="number" min="1" value="${t.maxHp??1}"/></label><label>速度<input name="speed" type="number" min="0" value="${t.speed??30}"/></label><label>先攻调整值<input name="initiativeModifier" type="number" step="1" value="${normalizeInitiativeModifier(t.initiativeModifier,t.initiative)}"/></label></div><div class="row"><label>占位宽<input name="footprintW" type="number" min="1" value="${t.footprint?.[0]||1}"/></label><label>占位高<input name="footprintH" type="number" min="1" value="${t.footprint?.[1]||1}"/></label><label>颜色<select name="colorMode" data-template-color-mode><option value="relation" ${colorMode==='relation'?'selected':''}>随关系默认</option><option value="custom" ${colorMode==='custom'?'selected':''}>DM 自选</option></select></label><label>自选颜色<input name="color" data-template-color type="color" value="${esc(templateColor(t))}" ${colorMode==='custom'?'':'disabled'}/></label><button type="button" data-v2-action="reset-template-color" ${colorMode==='relation'?'disabled':''}>恢复关系默认</button></div>${t.referenceActions?.length?'<p class="notice">继承的规则书动作已在右侧按核验内容展示，不在自定义输入框中改写。</p>':''}<label>自定义动作<textarea name="actions" data-template-preview-input rows="4" placeholder="每行“名称 | 用途说明”；仅写名称也可；逗号可分隔多项">${esc(serializeActionDefinitions(customActionsFor(t)))}</textarea></label>${referenceResourceNames(t).size?'<p class="notice">继承的规则书资源已在右侧按核验内容展示，不在自定义输入框中改写。</p>':''}<label>自定义资源<textarea name="resources" data-template-preview-input rows="4" placeholder="每行“名称 | 最大次数 | 用途说明”；旧格式“名称:次数”也可；逗号可分隔多项">${esc(serializeResourceDefinitions(customResources,customDetails))}</textarea></label><label>备注<textarea name="note">${esc(t.note||'')}</textarea></label><div class="row"><button class="primary" type="submit">保存模板</button><button type="button" data-v2-action="cancel-template">取消</button></div></form><aside class="template-preview" data-template-preview>${templatePreviewMarkup(t)}</aside></div>`;}
function entryBatchStatus(){const count=entryPlacementItems().length;return `<div class="row entry-batch-status"><span class="pill">待投入：${count} 个</span>${count?`<button data-action="entry-placement-battle">前往战斗页编辑</button><button data-action="entry-placement-map">前往地图批量摆放</button><button data-action="remove-last-entry-placement">撤销刚才添加</button>`:'<span class="muted">可连续加入或暂存再入场，确认投入前不会写入先攻或事件。</span>'}</div>`;}
function libraryView(){const editing=templateEditorId?templateById(templateEditorId):null,preparing=state.encounter?.phase==='preparation',joining=state.turn.started&&!combatEnded();if(templateEditorId&&!editing)templateEditorId=null;return `<section class="panel two"><div class="card">${templateEditorId?templateForm(editing):`<div class="row"><h2>单位模板库</h2><button class="primary" data-v2-action="new-template">新建自定义单位</button></div><p class="muted">这里仅放怪物、NPC 和 DM 自定义/变体单位；15 级角色预设已回到“角色”页。战斗中可连续加入待入场批次，之后再统一编辑和摆放。</p>${joining?entryBatchStatus():''}<table class="table"><thead><tr><th>模板</th><th>字段</th><th>来源 / 状态</th><th>操作</th></tr></thead><tbody>${templateLibrary.map(t=>`<tr class="${t.archived?'archived':''}"><td><b>${esc(t.name)}</b> <span class="pill">${t.sourceType==='reference'?'参考':t.sourceType==='variant'?'变体':'自定义'}</span><br/><small>${esc(t.kind)} · ${esc(t.alignment||'未标注')}</small></td><td>AC ${t.armorClass} · HP ${t.maxHp} · 速度 ${t.speed}<br/>${t.footprint.join('×')} 占位 · 动作 ${esc((t.actions||[]).map(a=>typeof a==='string'?a:a.name).join('、')||'—')}</td><td><small>${esc(t.sourceType==='reference'?(t.sourcePath||'本地私有证据'):t.sourceType==='variant'?`基于 ${t.baseTemplateId||'模板'}`:'DM 自定义')}</small>${t.archived?'<br/><span class="pill">已归档</span>':''}</td><td><div class="row">${!t.archived&&preparing?`<button data-v2-action="add-member" data-template-id="${t.id}">加入遭遇</button>`:''}${!t.archived&&joining?`<button class="primary" data-v2-action="stage-entry" data-template-id="${t.id}">加入待入场</button>`:''}${t.sourceType==='reference'?`<button data-v2-action="variant-template" data-template-id="${t.id}">复制为变体</button>`:`<button data-v2-action="edit-template" data-template-id="${t.id}">编辑</button>`}<button data-v2-action="archive-template" data-template-id="${t.id}" data-archived="${t.archived?'false':'true'}">${t.archived?'恢复':'归档'}</button></div></td></tr>`).join('')}</tbody></table>`}</div><div class="card"><h2>边界</h2><p>单位库是长期 UnitTemplate 数据；第 0 回合成员与 CombatantInstance 都保留创建时的模板快照。战斗内 HP、状态、资源不会回写模板。</p><p class="muted">参考字段仅限本地私有验证，翻译、出版身份与再分发授权未知。</p></div></section>`;}
function serializeResourcesForCharacter(resources){return Object.entries(resources||{}).map(([name,pool])=>`${name}|${pool.current}|${pool.max}|${pool.recovery||'manual'}|${pool.note||''}`).join('\n');}
function serializeAttacks(attacks){return (attacks||[]).map(item=>`${item.name}|${item.ability||'unknown'}|${item.attackBonus??''}|${item.damage||''}|${item.damageType||'unknown'}|${item.reach||item.range||''}|${item.proficient?'是':'否'}|${item.resourceLink||''}`).join('\n');}
function serializeCharacterActions(actions){return (actions||[]).map(item=>`${item.name}|${item.economy||'action'}|${item.resourceLink||''}|${item.description||''}`).join('\n');}
function serializeProficiencies(items){return (items||[]).map(item=>`${item.name}|${proficiencyLabel(item.proficiencyRank||(item.proficient?'proficient':'none'))}|${item.bonus??''}|${item.status||'needs-review'}`).join('\n');}
function serializeEquipment(items){return (items||[]).map(item=>`${item.name}|${item.quantity}|${item.equipped?'是':'否'}|${item.attuned?'是':'否'}|${item.container||'随身'}|${item.consumable?'是':'否'}|${item.ammunitionOrResourceLink||''}|${item.note||''}`).join('\n');}
function serializeLinked(entities){return (entities||[]).map(item=>`${item.name}|${item.kind||'ally'}|${item.relation||'ally'}|${item.note||''}|${item.templateRef?.templateId||''}`).join('\n');}
function characterList(canProject){
  const visible=characterRecords.filter(record=>showArchivedCharacters||record.status!=='archived');
  if(!visible.length)return `<p class="muted">${showArchivedCharacters?'还没有长期角色卡。':'没有活动角色卡；勾选“显示已归档角色”可查看归档内容。'}</p>`;
  return `<div class="character-list">${visible.map(record=>{try{const sheet=currentCharacterSheet(record),selected=sheet.characterId===selectedCharacterId,archived=record.status==='archived';return `<article class="character-list-item ${selected?'selected':''} ${archived?'archived':''}"><button class="character-select" data-character-select="${sheet.characterId}"><b>${esc(sheet.name)} ${archived?'<span class="pill">已归档</span>':''}</b><small>${sheet.totalLevel?`${sheet.totalLevel} 级 · `:''}修订 ${sheet.revision} · HP ${sheet.hp.current}/${sheet.hp.max}</small></button><div class="row">${!archived&&canProject?`<button class="primary" data-character-project="${sheet.characterId}">生成投影并加入</button>`:archived?'<span class="muted">已归档，不可加入遭遇</span>':'<span class="muted">当前不可加入</span>'}</div></article>`;}catch(error){return `<p class="notice error">损坏的本地角色记录：${esc(error.message)}</p>`;}}).join('')}</div>`;
}
function characterForm(sheet=null){
  const editing=!!sheet,abilities=sheet?.abilities||{},score=key=>abilities[key]?.score??10,firstClass=sheet?.classes?.[0]||{};
  return `<form data-character-sheet-form class="character-form"><div class="row"><h2>${editing?`编辑 ${esc(sheet.name)} 为新修订`:'创建长期角色卡'}</h2>${editing?'<button type="button" data-character-edit-cancel>取消编辑</button>':''}</div><p class="notice warn">M1-S2 只保存 DM 手工事实，不把角色名称或职业名称当作规则证明。派生值保持 <code>needs-review</code>，武器精通保持 <code>unknown</code>。</p><fieldset><legend>身份与起源</legend><div class="form-grid"><label>角色名称<input name="name" value="${esc(sheet?.name||'15级散打武者')}" required/></label><label>玩家 / 所有者提示<input name="ownerHint" value="${esc(sheet?.ownerHint||'')}"/></label><label>规则版本<input name="ruleVersion" value="${esc(sheet?.ruleVersion||'2024')}"/></label><label>总等级<input name="totalLevel" type="number" min="0" value="${sheet?.totalLevel??15}"/></label><label>职业<input name="className" value="${esc(firstClass.name||'武僧')}"/></label><label>子职<input name="subclass" value="${esc(firstClass.subclass||'散打宗')}"/></label><label>种族<input name="species" value="${esc(sheet?.origin?.species||'')}"/></label><label>背景<input name="background" value="${esc(sheet?.origin?.background||'')}"/></label></div></fieldset><fieldset><legend>战斗快捷条与六项属性</legend><div class="form-grid"><label>AC<input name="armorClass" type="number" min="0" value="${sheet?.armorClass??16}"/></label><label>当前 HP<input name="currentHp" type="number" min="0" value="${sheet?.hp?.current??112}"/></label><label>最大 HP<input name="maxHp" type="number" min="1" value="${sheet?.hp?.max??112}"/></label><label>速度（尺）<input name="speed" type="number" min="0" value="${sheet?.speed??55}"/></label><label>先攻调整值<input name="initiativeModifier" type="number" value="${sheet?.initiativeModifier??4}"/></label><label>熟练加值<input name="proficiencyBonus" type="number" value="${sheet?.proficiencyBonus??0}"/></label><label>被动察觉<input name="passivePerception" type="number" value="${sheet?.passivePerception??0}"/></label><label>生命骰<input name="hitDice" value="${esc(sheet?.combatState?.hitDice||'')}" placeholder="例如 15d8；由 DM 确认"/></label>${[['strength','力量'],['dexterity','敏捷'],['constitution','intelligence'],['intelligence','智力'],['wisdom','感知'],['charisma','魅力']].map(([key,label])=>`<label>${label}<input name="${key}" type="number" min="0" value="${score(key)}"/></label>`).join('')}<label><input name="heroicInspiration" type="checkbox" ${sheet?.combatState?.heroicInspiration?'checked':''}/> 英雄激励</label></div><label>豁免（每行：名称 | 不熟练/熟练/专精 | 最终加值 | 状态）<textarea name="saves" rows="3">${esc(serializeProficiencies(sheet?.saves))}</textarea></label><label>技能（每行：名称 | 不熟练/熟练/专精 | 最终加值 | 状态）<textarea name="skills" rows="3">${esc(serializeProficiencies(sheet?.skills))}</textarea></label></fieldset><fieldset><legend>结构化战斗资料</legend><label>攻击（每行：名称 | 属性 | 攻击加值 | 伤害 | 类型 | 触及/射程 | 熟练是/否 | 资源关联）<textarea name="attacks" rows="4" placeholder="徒手打击|敏捷||待 DM 填写|unknown|5尺|是|">${esc(serializeAttacks(sheet?.attackProfiles)||(!editing?'徒手打击|敏捷||待 DM 填写|unknown|5尺|是|':''))}</textarea></label><label>动作与能力（每行：名称 | action/bonus/reaction | 资源关联 | 说明）<textarea name="actions" rows="4">${esc(serializeCharacterActions(sheet?.actions)||(!editing?'疾风连击|bonus|功力|DM 手工记录；规则效果待核验':''))}</textarea></label><label>资源（每行：名称 | 当前 | 最大 | 恢复方式 | 备注）<textarea name="resources" rows="4">${esc(serializeResourcesForCharacter(sheet?.resources)||(!editing?'功力|15|15|manual|本地验证余额；具体规则待核验':''))}</textarea></label></fieldset><fieldset><legend>装备与关联单位</legend><label>装备（每行：名称 | 数量 | 已装备 | 已同调 | 容器 | 消耗品 | 弹药/资源关联 | 备注）<textarea name="equipment" rows="4">${esc(serializeEquipment(sheet?.equipment)||(!editing?'旅行装备|1|是|否|随身|否||DM 手工验证项':''))}</textarea></label><label>关联单位（每行：名称 | 类型 | 关系 | 备注 | UnitTemplate ID）<textarea name="linkedEntities" rows="3" placeholder="示例盟友|ally|ally|第0回合物化|scout">${esc(serializeLinked(sheet?.linkedEntities))}</textarea></label></fieldset><fieldset><legend>补充资料</legend><div class="form-grid"><label>感官<input name="senses" value="${esc((sheet?.senses||[]).join('，'))}"/></label><label>语言<input name="languages" value="${esc((sheet?.languages||[]).join('，'))}"/></label><label>当前状态<input name="conditions" value="${esc((sheet?.combatState?.conditions||[]).join('，'))}"/></label></div><label>经历<textarea name="history">${esc(sheet?.origin?.history||'')}</textarea></label><label>DM 备注<textarea name="note">${esc(sheet?.note||'')}</textarea></label></fieldset><button class="primary" type="submit">${editing?'保存为新修订':'创建长期角色卡'}</button><p class="muted">新角色创建后从修订 1 开始；编辑会生成修订 N+1，不会原地覆盖历史。</p></form>`;
}
function masteryLongRestPanel(record,sheet){
  const mastery=sheet.weaponMastery||{},relevant=(mastery.grants||[]).length>0,terms=(sheet.attackProfiles||[]).filter(attack=>attack.masteryTerm).map(attack=>attack.masteryTerm);
  if(!relevant)return terms.length?`<p class="notice warn">武器含固有精通词条：${esc([...new Set(terms)].join('、'))}；未识别到角色武器精通资格，不要求 DM 选择或触发效果。</p>`:'';
  const eligible=weaponMasteryEligibleAttacks(sheet),selectedIds=new Set((mastery.selections||[]).map(selection=>selection.weaponId)),editing=masteryEditorCharacterId===sheet.characterId,blockers=characterArchiveBlockers(sheet.characterId),blocked=record.status==='archived'||blockers.blocked;
  const blockedReason=record.status==='archived'?'角色已归档':blockers.battleProjectionCount?`当前战斗有 ${blockers.battleProjectionCount} 个投影引用该修订`:blockers.pendingDiffCount?`仍有 ${blockers.pendingDiffCount} 份待审核候选差异`:'';
  const editor=editing?`<form class="mastery-rest-editor" data-mastery-rest-form="${esc(sheet.characterId)}"><fieldset><legend>长休结束后重新选择</legend><p class="muted">只列出已熟练且具有已准入稳定武器与词条 ID 的候选；至少选择 1 种，最多 ${esc(mastery.selectionLimit||0)} 种。</p><div class="mastery-choice-list">${eligible.map(attack=>{const entry=masteryCatalogEntry(attack.masteryPropertyId,attack.weaponKind);return `<label class="mastery-choice"><input type="checkbox" name="masteryWeaponId" value="${esc(attack.weaponId)}" ${selectedIds.has(attack.weaponId)?'checked':''}/><span><b>${esc(attack.weaponKind||attack.name)} · ${esc(entry?.masteryTerm||attack.masteryTerm)}（${esc(entry?.englishName||'ID 已记录')}）</b><small>${esc(entry?.effect||'效果待核验')}</small></span></label>`;}).join('')||'<p class="notice warn">没有合资格且已准入的武器候选，不能保存。</p>'}</div><label>DM 确认说明（必填）<textarea name="masterySelectionReason" required placeholder="例如：本次长休结束后，玩家选择短弓与匕首。"></textarea></label><div class="row"><button class="primary" type="submit" ${eligible.length?'':'disabled'}>确认并创建新修订</button><button type="button" data-mastery-rest-cancel>取消</button></div></fieldset></form>`:'';
  return `<section class="mastery-long-rest"><div class="row"><h4>武器精通 · 当前长休配置</h4><button type="button" data-mastery-rest-edit="${esc(sheet.characterId)}" ${blocked?'disabled':''}>长休结束后重新选择</button></div>${masteryConfigurationMarkup(sheet)}<p class="muted">状态：${esc(mastery.status)} · 最多 ${esc(mastery.selectionLimit||0)} 种 · ${mastery.confirmedAt?`确认于 ${esc(mastery.confirmedAt)} · `:''}${esc(mastery.note||'无说明')}</p>${blocked?`<p class="notice warn">${esc(blockedReason)}，暂不能更换；请先结束相关流程。</p>`:''}${editor}</section>`;
}
function auditMarkup(label,audit){if(!audit)return '';const value=audit.effectiveValue??'unknown';return `<details class="audit"><summary>${esc(label)}：${esc(value)} <span class="pill">${esc(audit.status)}</span></summary><dl><dt>计算输入</dt><dd>${esc(JSON.stringify(audit.inputs||[]))}</dd><dt>计算值</dt><dd>${esc(audit.calculatedValue??'unknown')}</dd><dt>手工覆写</dt><dd>${esc(audit.overrideValue??'无')}</dd><dt>有效值</dt><dd>${esc(value)}</dd><dt>覆写原因</dt><dd>${esc(audit.overrideReason||'无')}</dd></dl></details>`;}
function controlledEntityStatusLabel(status){return ({controlled:'受控','permanent-controlled':'永久受控','expired-uncontrolled':'已到期失控',released:'已解除控制','control-lost':'已失去控制'}[status]||status||'未知');}
function controlledEntityCardMarkup(record,sheet){
  const entities=sheet.controlledEntities||[];
  const preparing=state.encounter?.phase==='preparation',projection=state.combatProjections.find(item=>item.characterId===sheet.characterId&&item.characterRevision===sheet.revision);
  const cards=entities.map(entity=>{const reusable=['controlled','permanent-controlled'].includes(entity.status),duplicate=state.encounter.members.some(member=>member.controlledEntityProjection?.sourceCombatProjectionId===projection?.projectionId&&member.controlledEntityProjection?.controlledEntityId===entity.id);return `<article class="character-fact-card"><div class="card-heading"><b>${esc(entity.name)}</b><span class="pill">${esc(controlledEntityStatusLabel(entity.status))}</span></div><p>效果：${esc(entity.effectLabel||'DM 未标注')} · 命令距离：${esc(entity.commandRangeFeet??'—')} 尺</p><p>期限：${esc(controlledDurationLabel(entity.duration))}</p><small>模板：${esc(entity.templateRef?.templateId||'未标注')} · 最近战斗实例：${esc(entity.activeCombatantId||'无')}</small><details><summary>控制记录（${(entity.history||[]).length}）</summary>${(entity.history||[]).map(item=>`<p>${esc(item.at||'时间未知')} · ${esc(item.type||'记录')} · ${esc(controlledEntityStatusLabel(item.status))} · ${esc(item.reason||'无原因')}</p>`).join('')||'<p class="muted">无额外记录。</p>'}</details>${reusable?`<button class="primary" data-controlled-materialize="${esc(entity.id)}" data-controlled-character="${esc(sheet.characterId)}" ${duplicate||!preparing||!projection?'disabled':''}>${duplicate?'已加入本次遭遇':'加入新遭遇'}</button><small>${preparing&&projection?'本场将创建新的独立实例。':'先在第 0 回合加入控制者当前角色投影。'}</small>`:`<small>失控关系不再从控制者卡投入；DM 仍可从单位库独立加入模板。</small>`}${entity.status==='expired-uncontrolled'?`<button data-controlled-renewal-request="${esc(entity.id)}" data-controlled-character="${esc(sheet.characterId)}">记录尝试续控意图</button>`:''}</article>`;}).join('')||'<p class="muted">无受控生物关系。</p>';
  const maySettle=entities.some(entity=>entity.status==='controlled'&&(entity.duration?.kind==='one-long-rest'||(entity.duration?.kind==='custom'&&entity.duration?.unit==='long-rests')));
  const renewable=entities.filter(entity=>entity.status==='controlled'&&entity.duration?.kind==='one-long-rest');
  return `<section class="linked-controlled-module"><div class="region-heading"><div><span class="eyebrow">Controlled entities</span><h4>受控生物</h4></div><span class="pill">与关联单位并列</span></div><div class="character-card-grid">${cards}</div>${maySettle?`<form data-controlled-long-rest-form="${esc(sheet.characterId)}" class="character-form"><fieldset><legend>登记一次长休</legend>${renewable.length?`<p class="muted">若 DM 已确认在到期前完成续控，可勾选对应项目；本操作不验证法术、材料、资源或规则资格。</p>${renewable.map(entity=>`<label><input type="checkbox" name="renewedEntityId" value="${esc(entity.id)}"/> DM 确认：已在到期前续控一次“${esc(entity.name)}”</label>`).join('')}`:'<p class="muted">本次只结算自定义长休期限，没有可刷新的一次长休控制。</p>'}<label>DM 记录说明<input name="reason" required placeholder="例如：本次长休前已由 DM 确认续控"/></label><button class="primary" type="submit">确认并结算本次长休</button></fieldset></form>`:''}<p class="notice warn">“24 小时”在本地产品中按一次长休结算。到期只会标记为失控，不删除生物、不自动改为敌对；本次 DM 确认续控只刷新计数，不执行或验证具体法术。</p></section>`;
}
function settleCharacterControlledEntities(characterId,form){
  const index=characterRecords.findIndex(record=>record.characterId===characterId),record=characterRecords[index];if(index<0)return message('找不到需要结算的长期角色卡。','error');
  const recordsBefore=clone(characterRecords),actionId=uid();
  try{const values=form?new FormData(form):null,renewedEntityIds=values?values.getAll('renewedEntityId').map(String):[],reason=String(values?.get('reason')||'DM 在角色卡中登记一次长休').trim(),result=settleControlledEntitiesAfterLongRest(record,{timestamp:now,eventId:actionId,reason,renewedEntityIds}),nextRecords=clone(characterRecords);nextRecords[index]=result.record;persistCharacterRecords(nextRecords);characterRecords=nextRecords;command('character.controlled-entities.long-rest.settled',{characterId,actionId,changes:clone(result.changes)},()=>{for(const change of result.changes){const combatant=state.combatants.find(candidate=>candidate.controllerLink?.controlledEntityId===change.id);if(combatant){combatant.controllerLink.status=change.toStatus;combatant.controllerLink.duration={...combatant.controllerLink.duration,remaining:change.remaining};combatant.controllerLink.history=[...(combatant.controllerLink.history||[]),{eventId:actionId,type:change.action==='renewed'?'control-renewed':'long-rest-settled',round:null,status:change.toStatus,reason}];}}},{manual:true,reason:'DM 登记长休与已确认续控；不验证或施放任何具体法术'});const renewed=result.changes.filter(change=>change.action==='renewed').length,expired=result.changes.filter(change=>change.action==='expired').length;message(`已结算 ${result.changes.length} 个受控生物：续控刷新 ${renewed} 个，到期失控 ${expired} 个。`,'warn');}
  catch(error){characterRecords=recordsBefore;try{persistCharacterRecords(recordsBefore);}catch{}message(`长休结算未写入：${error.message}`,'error');}
}
function requestControlledEntityRenewal(characterId,controlledEntityId){
  const index=characterRecords.findIndex(record=>record.characterId===characterId),record=characterRecords[index];if(index<0)return message('找不到对应长期角色卡。','error');
  const recordsBefore=clone(characterRecords),actionId=uid();
  try{const result=recordControlledEntityRenewalRequested(record,controlledEntityId,{timestamp:now,eventId:actionId,reason:'DM 记录：尝试通过后续获准法术续控'}),nextRecords=clone(characterRecords);nextRecords[index]=result.record;persistCharacterRecords(nextRecords);characterRecords=nextRecords;command('character.controlled-entity.renewal-requested',{characterId,controlledEntityId,actionId},()=>{},{manual:true,reason:'仅记录 DM 的续控意图；不会验证法术或恢复控制'});message('已记录续控意图；该生物仍是已到期失控状态，未自动恢复控制。','warn');}
  catch(error){characterRecords=recordsBefore;try{persistCharacterRecords(recordsBefore);}catch{}message(`续控意图未写入：${error.message}`,'error');}
}
function revisionFieldLabel(path){const resource=path.match(/^resources\.(.+)\.current$/);if(resource)return `资源：${resource[1]}`;return ({armorClass:'AC',equipment:'装备',linkedEntities:'关联单位',controlledEntities:'受控生物',attackProfiles:'结构化攻击',actions:'动作与能力',classes:'职业构成',note:'DM 备注'}[path]||path);}
function revisionValue(path,value){if(value===null||value===undefined||value==='')return '未设置';if(['equipment','linkedEntities','attackProfiles','actions','classes'].includes(path)){try{const items=typeof value==='string'?JSON.parse(value):value;return items.length?items.map(item=>`${item.name||'未命名'}${path==='equipment'?` ×${item.quantity}`:''}`).join('、'):'无';}catch{return String(value);}}return String(value);}
function revisionHistory(record){return [...record.revisions].sort((a,b)=>b.revision-a.revision).map((revision,index)=>{const previous=record.revisions.find(item=>item.revision===revision.previousRevision),changes=previous?diffCharacterRevisions(previous,revision):[];return `<details ${index===0?'open':''}><summary>修订 ${revision.revision} · ${esc(revision.revisedAt||revision.createdAt||'时间未知')} · ${changes.length} 项变化</summary>${previous?(changes.length?`<ul class="revision-diff">${changes.slice(0,30).map(change=>`<li><code>${esc(revisionFieldLabel(change.path))}</code>：${esc(revisionValue(change.path,change.before))} → ${esc(revisionValue(change.path,change.after))}</li>`).join('')}</ul>`:'<p class="muted">规范化后没有业务字段变化。</p>'):'<p class="muted">初始修订。</p>'}</details>`;}).join('');}
function characterDetail(record,canProject){
  if(!record)return '<section class="card empty-detail"><h2>选择角色</h2><p class="muted">从左侧选择长期角色卡，查看完整详情与修订历史。</p></section>';
  const sheet=currentCharacterSheet(record),resources=Object.entries(sheet.resources||{}),hasSpells=(sheet.spellcastingProfiles||[]).length||(sheet.spells||[]).length;
  const attacks=(sheet.attackProfiles||[]).map(attack=>`<article class="info-item"><b>${esc(attack.name)}</b><span class="pill">${esc(attack.ability)}</span><span>攻击加值：${attack.attackBonus??'待填写'} · 伤害：${esc(attack.damage||'待填写')}${attack.damageType&&attack.damageType!=='unknown'?` ${esc(attack.damageType)}`:''}</span><small>${attack.proficient?'熟练':'未标熟练'} · ${esc(attack.reach||attack.range||'触及/射程待填')} · ${attack.masteryTerm?`精通 ${esc(attack.masteryTerm)}（${attack.masteryEnabled?'已选择':'未选择'}） · `:''}${esc(attack.sourceStatus)}</small></article>`).join('')||'<p class="muted">尚未配置结构化攻击。</p>';
  return `<article class="character-detail"><header class="character-detail-header"><div><span class="eyebrow">长期 CharacterSheet · 修订 ${sheet.revision}</span><h2>${esc(sheet.name)}</h2><p class="muted">${esc(sheet.ownerHint||'未标注所有者')} · ${sheet.totalLevel?`${sheet.totalLevel} 级 · `:''}${esc(sheet.classes.map(item=>`${item.name}${item.subclass?`（${item.subclass}）`:''} ${item.level}`).join(' / ')||'职业待补充')} · 规则 ${esc(sheet.ruleVersion)}</p></div><div class="row"><button data-character-edit="${sheet.characterId}">编辑为新修订</button>${canProject?`<button class="primary" data-character-project="${sheet.characterId}">生成投影并加入</button>`:''}</div></header><nav class="detail-nav"><a href="#region-combat">战斗概览</a><a href="#region-checks">检定与熟练</a><a href="#region-actions">动作与能力</a>${hasSpells?'<a href="#region-spells">法术</a>':'<span>法术区已隐藏（非施法）</span>'}<a href="#region-equipment">装备</a><a href="#region-origin">起源与经历</a><a href="#region-linked">关联单位</a><a href="#region-revisions">导入与修订</a></nav><section id="region-combat" class="character-region" data-character-region="combat"><h3>战斗概览</h3><div class="quickbar"><span class="stat">HP<b>${sheet.hp.current}/${sheet.hp.max}</b></span><span class="stat">临时 HP<b>${sheet.combatState.tempHp}</b></span><span class="stat">AC<b>${sheet.armorClass}</b></span><span class="stat">先攻<b>${sheet.initiativeModifier>=0?'+':''}${sheet.initiativeModifier}</b></span><span class="stat">速度<b>${sheet.speed} 尺</b></span><span class="stat">熟练<b>${sheet.proficiencyBonus||'unknown'}</b></span><span class="stat">被动察觉<b>${sheet.passivePerception||'unknown'}</b></span><span class="stat">生命骰<b>${esc(sheet.combatState.hitDice||'未配置')}</b></span><span class="stat">英雄激励<b>${sheet.combatState.heroicInspiration?'有':'无'}</b></span><span class="stat">状态<b>${esc(sheet.combatState.conditions.join('、')||'无')}</b></span><span class="stat">专注<b>${esc(sheet.combatState.concentration)}</b></span></div><div class="audit-grid">${auditMarkup('AC',sheet.derivedValues.armorClass)}${auditMarkup('先攻调整值',sheet.derivedValues.initiativeModifier)}${auditMarkup('熟练加值',sheet.derivedValues.proficiencyBonus)}${auditMarkup('被动察觉',sheet.derivedValues.passivePerception)}</div><h4>资源</h4><div class="info-grid">${resources.map(([name,pool])=>`<article class="info-item"><b>${esc(name)} ${pool.current}/${pool.max}</b><small>${esc(pool.recovery)} · ${esc(pool.note||'无备注')} · ${esc(pool.sourceStatus)}</small></article>`).join('')||'<p class="muted">无次数资源。</p>'}</div></section><section id="region-checks" class="character-region" data-character-region="checks"><h3>检定与熟练</h3><div class="ability-grid">${Object.entries(sheet.abilities).map(([key,value])=>`<div class="ability"><span>${esc({strength:'力量',dexterity:'敏捷',constitution:'体质',intelligence:'智力',wisdom:'感知',charisma:'魅力'}[key])}</span><b>${value.score}</b><small>${value.modifier.effectiveValue??'unknown'} · ${esc(value.modifier.status)}</small></div>`).join('')}</div><div class="info-grid"><article class="info-item"><b>豁免</b>${(sheet.saves||[]).map(item=>`<span>${esc(item.name)}：${item.bonus??'unknown'} · ${item.proficient?'熟练':'未标熟练'} · ${esc(item.status)}</span>`).join('')||'<span class="muted">未配置</span>'}</article><article class="info-item"><b>技能</b>${(sheet.skills||[]).map(item=>`<span>${esc(item.name)}：${item.bonus??'unknown'} · ${item.proficient?'熟练':'未标熟练'} · ${esc(item.status)}</span>`).join('')||'<span class="muted">未配置</span>'}</article></div><p><b>感官：</b>${esc(sheet.senses.join('、')||'未配置')}　<b>语言：</b>${esc(sheet.languages.join('、')||'未配置')}</p><p class="muted">空值保持未配置，不按属性分数推断。</p></section><section id="region-actions" class="character-region" data-character-region="actions"><h3>动作与能力</h3><h4>结构化攻击</h4><div class="info-grid">${attacks}</div><h4>独立动作 / 能力</h4><div class="info-grid">${(sheet.actions||[]).map(action=>`<article class="info-item"><b>${esc(action.name)}</b><span class="pill">${esc(action.economy)}</span><p>${esc(action.description||'无说明')}</p><small>${action.resourceLink?`资源：${esc(action.resourceLink)} · `:''}${esc(action.sourceStatus)}</small></article>`).join('')||'<p class="muted">尚未配置动作。</p>'}</div><p class="notice warn">武器精通：<b>${esc(sheet.weaponMastery.status)}</b>。${esc(sheet.weaponMastery.note)} 当前不会生成精通触发或效果。</p></section><section id="region-spells" class="character-region ${hasSpells?'':'hidden'}" data-character-region="spells"><h3>法术</h3><p class="notice warn">施法、多职业与多资源池骨架属于 M1-S4；M1-S3 只保留导入冲突与来源提示。</p></section><section id="region-equipment" class="character-region" data-character-region="equipment"><h3>装备</h3><div class="info-grid">${(sheet.equipment||[]).map(item=>`<article class="info-item"><b>${esc(item.name)} ×${item.quantity}</b><span class="pill">${item.equipped?'已装备':'未装备'}</span>${item.attuned?'<span class="pill">已同调</span>':''}${item.consumable?'<span class="pill">消耗品</span>':''}<small>${esc(item.container)}${item.ammunitionOrResourceLink?` · 关联 ${esc(item.ammunitionOrResourceLink)}`:''} · ${esc(item.note||'无备注')}</small></article>`).join('')||'<p class="muted">无装备记录。</p>'}</div></section><section id="region-origin" class="character-region" data-character-region="origin"><h3>起源与经历</h3><p><b>种族：</b>${esc(sheet.origin.species||'未配置')}　<b>背景：</b>${esc(sheet.origin.background||'未配置')}</p><p>${esc(sheet.origin.history||'尚无经历。')}</p><p class="muted">${esc(sheet.note||'无 DM 备注')}</p></section><section id="region-linked" class="character-region" data-character-region="linked"><h3>关联单位</h3><div class="info-grid">${(sheet.linkedEntities||[]).map(entity=>`<article class="info-item"><b>${esc(entity.name)}</b><span class="pill">${esc(entity.kind)} / ${esc(entity.relation)}</span><p>${esc(entity.note||'无备注')}</p><small>战斗物化：M1-S5</small></article>`).join('')||'<p class="muted">无魔宠、盟友或其他关联单位。</p>'}</div><p class="notice warn">M1-S2 只保存关系；“加入战斗后成为独立棋子、HP 与行动轮”留在 M1-S5，当前不会把关系对象塞进角色本体或战斗。</p></section><section id="region-revisions" class="character-region" data-character-region="revisions"><h3>导入与修订</h3><p><b>来源：</b>${esc(sheet.source.kind)} / ${esc(sheet.source.status)}。${esc(sheet.source.note||'')}</p>${sheet.source.fileSha256?`<p class="muted">${esc(sheet.source.importerId||'importer')}@${esc(sheet.source.sourceVersion||'unknown')} · ${esc(sheet.source.fileName||'文件名未知')} · SHA-256 ${esc(sheet.source.fileSha256)}</p>`:'<p class="muted">本角色由手工入口建立。</p>'}<div class="revision-history">${revisionHistory(record)}</div></section></article>`;
}
function characterDetailV2(record,canProject){
  if(!record)return '<section class="card empty-detail"><h2>选择角色</h2><p class="muted">从左侧选择长期角色卡，查看完整详情与修订历史。</p></section>';
  const sheet=currentCharacterSheet(record),hasSpells=(sheet.spellcastingProfiles||[]).length||(sheet.spellResourcePools||[]).length||(sheet.spells||[]).length;
  const tabs=[['combat','战斗概览'],['checks','检定与熟练'],['actions','动作与能力'],...(hasSpells?[['spells','法术']]:[]),['equipment','装备'],['origin','起源与经历'],['linked','关联单位'],['notes','DM 备注'],['revisions','导入与修订']];
  if(!tabs.some(([id])=>id===characterDetailTab))characterDetailTab='combat';
  const abilityLabels={strength:'力量',dexterity:'敏捷',constitution:'体质',intelligence:'智力',wisdom:'感知',charisma:'魅力'};
  const categoryLabels={'class-feature':'职业特性','species-feature':'种族特性',feat:'专长','fighting-style':'战斗风格专长',special:'特殊能力'};
  const signed=value=>value===null||value===undefined||value==='unknown'?'unknown':`${Number(value)>=0?'+':''}${value}`;
  const features=sheet.features||[],resources=Object.entries(sheet.resources||{}),attacks=sheet.attackProfiles||[],spellProfiles=sheet.spellcastingProfiles||[],spellPools=sheet.spellResourcePools||[],spellEntries=sheet.spells||[];
  const masteryNotice=masteryLongRestPanel(record,sheet);
  const featureCard=feature=>`<article class="character-fact-card"><div class="card-heading"><b>${esc(feature.name)}</b><span class="pill">${esc(categoryLabels[feature.category]||feature.category||'其他')}</span>${feature.level!==null&&feature.level!==undefined?`<span class="pill">${esc(feature.level)} 级</span>`:''}</div><p>${esc(feature.description||'无说明')}</p><small>导入事实 · ${esc(feature.sourceStatus||'needs-review')}</small>${feature.sourceRef?`<details><summary>查看来源位置</summary><p>${esc(feature.sourceRef)}</p></details>`:''}</article>`;
  const featureGroup=(title,items)=>items.length?`<section class="fact-group"><h4>${title}</h4><div class="character-card-grid">${items.map(featureCard).join('')}</div></section>`:'';
  const attackCards=attacks.map(attack=>`<details class="attack-card"><summary><b>${esc(attack.name)}</b><span>${esc(attack.ability||'属性待确认')} · 攻击 ${esc(attack.attackBonus??'unknown')}</span></summary><div class="attack-facts"><span>伤害：${esc(attack.damage||'待 DM 填写')}${attack.damageType&&attack.damageType!=='unknown'?` ${esc(attack.damageType)}`:''}</span><span>距离：${esc(attack.reach||attack.range||'待填写')}</span><span>${attack.proficient?'熟练':'未标熟练'} · ${esc(attack.sourceStatus||'needs-review')}</span>${attack.ammunitionOrResourceLink?`<span>关联：${esc(attack.ammunitionOrResourceLink)}</span>`:''}${attack.masteryTerm?`<span>固有精通：${esc(attack.masteryTerm)}（${attack.masteryEnabled?'DM 已选择':'未选择'}）</span>`:''}</div><p class="muted">攻击伤害保持独立；条件特性不会合并进此数值。</p></details>`).join('')||'<p class="muted">尚未配置结构化攻击。</p>';
  const proficiencyTable=(items,kind)=>items.length?`<table class="character-table"><thead><tr><th>${kind}</th><th>等级</th><th>最终值</th><th>状态</th></tr></thead><tbody>${items.map(item=>`<tr><td>${esc(item.name)}</td><td>${esc(proficiencyLabel(item.proficiencyRank||(item.proficient?'proficient':'none')))}</td><td>${esc(item.bonus??'unknown')}</td><td>${esc(item.status||'needs-review')}</td></tr>`).join('')}</tbody></table>`:'<p class="muted">未配置。</p>';
  const equipmentByContainer=(sheet.equipment||[]).reduce((groups,item)=>{const name=item.container||'随身';(groups[name]||=[]).push(item);return groups;},{});
  const equipmentMarkup=Object.entries(equipmentByContainer).map(([container,items])=>`<section class="equipment-group"><h4>${esc(container)}</h4><div class="character-card-grid">${items.map(item=>`<article class="character-fact-card"><div class="card-heading"><b>${esc(item.name)} ×${esc(item.quantity)}</b><span class="pill">${esc(item.itemKind||'gear')}</span></div><div class="pill-row">${item.equipped?'<span class="pill">已装备</span>':''}${item.attuned?'<span class="pill">已同调</span>':''}${item.consumable?'<span class="pill">消耗品</span>':''}</div><p>${esc(item.description||item.note||'无说明')}</p><small>${item.weight!==null&&item.weight!==undefined?`${esc(item.weight)} lb · `:''}${item.weaponProficiencyRank?`武器${esc(proficiencyLabel(item.weaponProficiencyRank))} · `:''}${item.masteryTerm?`固有精通 ${esc(item.masteryTerm)} · `:''}${esc(item.sourceStatus||'needs-review')}</small></article>`).join('')}</div></section>`).join('')||'<p class="muted">无装备记录。</p>';
  const tabButtons=tabs.map(([id,label])=>`<button type="button" id="character-tab-${id}" role="tab" aria-selected="${characterDetailTab===id}" class="${characterDetailTab===id?'active':''}" data-character-detail-tab="${id}">${label}</button>`).join('');
  const regions={
    combat:`<section class="character-region character-region-modern" data-character-region="combat" aria-labelledby="character-tab-combat"><div class="region-heading"><div><span class="eyebrow">Combat Snapshot</span><h3>战斗概览</h3></div><span class="pill">长期卡只读展示</span></div><div class="ability-grid modern-ability-grid">${Object.entries(sheet.abilities||{}).map(([key,value])=>`<div class="ability"><span>${esc(abilityLabels[key]||key)}</span><b>${esc(value.score??'unknown')}</b><small>${signed(value.modifier?.effectiveValue)} · ${esc(value.modifier?.status||'needs-review')}</small></div>`).join('')}</div><h4>常用战斗信息</h4><div class="character-quick-grid"><article><span>HP</span><b>${esc(sheet.hp.current)}/${esc(sheet.hp.max)}</b><small>临时 HP ${esc(sheet.combatState.tempHp)}</small></article><article><span>AC</span><b>${esc(sheet.armorClass??'unknown')}</b><small>${esc(sheet.derivedValues.armorClass?.status||'needs-review')}</small></article><article><span>先攻</span><b>${signed(sheet.initiativeModifier)}</b><small>${esc(sheet.derivedValues.initiativeModifier?.status||'needs-review')}</small></article><article><span>速度</span><b>${esc(sheet.speed)} 尺</b><small>手工或导入事实</small></article><article><span>熟练</span><b>${esc(sheet.proficiencyBonus||'unknown')}</b><small>${esc(sheet.derivedValues.proficiencyBonus?.status||'needs-review')}</small></article><article><span>状态</span><b>${esc((sheet.combatState.conditions||[]).join('、')||'无')}</b><small>专注：${esc(sheet.combatState.concentration||'无')}</small></article></div><div class="audit-grid">${auditMarkup('AC',sheet.derivedValues.armorClass)}${auditMarkup('先攻调整值',sheet.derivedValues.initiativeModifier)}${auditMarkup('熟练加值',sheet.derivedValues.proficiencyBonus)}${auditMarkup('被动察觉',sheet.derivedValues.passivePerception)}</div><h4>结构化攻击</h4><div class="attack-list">${attackCards}</div><h4>资源</h4><div class="character-card-grid">${resources.map(([name,pool])=>`<article class="character-fact-card"><b>${esc(name)} ${esc(pool.current)}/${esc(pool.max)}</b><small>${esc(pool.recovery)} · ${esc(pool.note||'无备注')} · ${esc(pool.sourceStatus)}</small></article>`).join('')||'<p class="muted">无次数资源。</p>'}</div></section>`,
    checks:`<section class="character-region character-region-modern" data-character-region="checks" aria-labelledby="character-tab-checks"><div class="region-heading"><div><span class="eyebrow">Checks</span><h3>检定与熟练</h3></div></div><h4>豁免</h4>${proficiencyTable(sheet.saves||[],'豁免')}<h4>已标记技能</h4>${proficiencyTable((sheet.skills||[]).filter(item=>(item.proficiencyRank||(item.proficient?'proficient':'none'))!=='none'),'技能')}<details class="remaining-checks"><summary>其余技能（${(sheet.skills||[]).filter(item=>(item.proficiencyRank||(item.proficient?'proficient':'none'))==='none').length} 项）</summary>${proficiencyTable((sheet.skills||[]).filter(item=>(item.proficiencyRank||(item.proficient?'proficient':'none'))==='none'),'技能')}</details><div class="origin-facts"><span><b>感官：</b>${esc((sheet.senses||[]).join('、')||'未配置')}</span><span><b>语言：</b>${esc((sheet.languages||[]).join('、')||'未配置')}</span></div><p class="muted">熟练与专精仅展示导入标记；没有标记的字段不会从属性或职业名称反推。</p></section>`,
    actions:`<section class="character-region character-region-modern" data-character-region="actions" aria-labelledby="character-tab-actions"><div class="region-heading"><div><span class="eyebrow">Actions & Features</span><h3>动作与能力</h3></div><span class="pill">展示事实，不自动触发</span></div><h4>独立动作</h4><div class="character-card-grid">${(sheet.actions||[]).map(action=>`<article class="character-fact-card"><div class="card-heading"><b>${esc(action.name)}</b><span class="pill">${esc(action.economy||'待确认')}</span></div><p>${esc(action.description||'无说明')}</p><small>${action.resourceLink?`资源：${esc(action.resourceLink)} · `:''}${esc(action.sourceStatus||'needs-review')}</small></article>`).join('')||'<p class="muted">尚未配置动作。</p>'}</div>${featureGroup('职业特性',features.filter(feature=>feature.category==='class-feature'))}${featureGroup('起源、专长与其他特性',features.filter(feature=>feature.category!=='class-feature'))}${masteryNotice}</section>`,
    spells:`<section class="character-region character-region-modern" data-character-region="spells" aria-labelledby="character-tab-spells"><div class="region-heading"><div><span class="eyebrow">Spellcasting</span><h3>法术</h3></div><span class="pill">M1-S4 骨架</span></div><p class="notice warn">来源、资源与施放方式分开保存；没有已准入且版本明确的输入时，攻击调整值、DC、取得资格与可支付性保持 <code>needs-review</code>，不执行法术效果。</p><h4>施法来源</h4><div class="character-card-grid">${spellProfiles.map(profile=>`<article class="character-fact-card"><b>${esc(profile.sourceName)}</b><span class="pill">${esc(profile.sourceKind)}</span><p>属性：${esc(profile.ability)} · 攻击 ${esc(profile.spellAttack?.value??'unknown')} · DC ${esc(profile.saveDc?.value??'unknown')}</p><small>${esc(profile.acquisitionMode)} / ${esc(profile.preparationMode)} · 资源池 ${esc((profile.resourcePoolIds||[]).join('、')||'未指定')} · ${esc(profile.sourceStatus)}</small></article>`).join('')||'<p class="muted">尚无施法来源。</p>'}</div><h4>施法资源池</h4><div class="character-card-grid">${spellPools.map(pool=>`<article class="character-fact-card"><b>${esc(pool.label)}</b><span class="pill">${esc(pool.kind)}</span><p>${(pool.balances||[]).map(balance=>`${esc(balance.label)} ${esc(balance.current)}/${esc(balance.max)}`).join(' · ')||'无已确认余额'}</p><small>${esc(pool.recovery)} · ${esc(pool.sourceStatus)}</small></article>`).join('')||'<p class="muted">尚无施法资源池。</p>'}</div><h4>法术与施放方式</h4><div class="character-card-grid">${spellEntries.map(spell=>`<article class="character-fact-card"><b>${esc(spell.name)}</b><p>法术书 ${spell.availability?.inSpellbook?'是':'否'} · 已知 ${spell.availability?.known?'是':'否'} · 已准备 ${spell.availability?.prepared?'是':'否'} · 始终准备 ${spell.availability?.alwaysPrepared?'是':'否'} · 本场可用 ${spell.availability?.availableThisEncounter?'是':'否'}</p><small>${(spell.castingOptions||[]).map(option=>`${esc(option.profileId)} → ${esc(option.resourcePoolId||'无需资源')} / ${esc(option.balanceId||'待确认')}`).join('；')||'尚无施放方式'} · ${esc(spell.sourceStatus)}</small></article>`).join('')||'<p class="muted">尚无法术记录。</p>'}</div></section>`,
    equipment:`<section class="character-region character-region-modern" data-character-region="equipment" aria-labelledby="character-tab-equipment"><div class="region-heading"><div><span class="eyebrow">Inventory</span><h3>装备与背包</h3></div></div>${equipmentMarkup}<p class="muted">主要 Sheet 提供武器/穿戴装备，背包 Sheet 提供容器内物品；财务账本不进入装备列表。数量、容器和同调标记均保持导入事实。</p></section>`,
    origin:`<section class="character-region character-region-modern" data-character-region="origin" aria-labelledby="character-tab-origin"><div class="region-heading"><div><span class="eyebrow">Origin</span><h3>起源与经历</h3></div></div><div class="origin-facts"><span><b>种族：</b>${esc(sheet.origin.species||'未配置')}</span><span><b>背景：</b>${esc(sheet.origin.background||'未配置')}</span></div><article class="character-narrative"><h4>经历</h4><p>${esc(sheet.origin.history||'尚无经历。')}</p><small>DM 备注：${esc(sheet.note||'无')}</small></article></section>`,
    linked:`<section class="character-region character-region-modern" data-character-region="linked" aria-labelledby="character-tab-linked"><div class="region-heading"><div><span class="eyebrow">Linked entities</span><h3>关联单位</h3></div><span class="pill">M1-S5 独立棋子</span></div><div class="character-card-grid">${(sheet.linkedEntities||[]).map(entity=>`<article class="character-fact-card"><b>${esc(entity.name)}</b><span class="pill">${esc(entity.kind)} / ${esc(entity.relation)}</span><p>${esc(entity.note||'无备注')}</p><small>${entity.templateRef?.templateId?`绑定模板：${esc(entity.templateRef.templateId)}`:'未绑定模板；加入遭遇时可选择本场模板'}</small></article>`).join('')||'<p class="muted">无魔宠、盟友或其他关联单位。</p>'}</div><p class="notice warn">第 0 回合可从显式 templateRef 生成独立棋子、HP 与行动轮；不按名称猜测，也不会塞进角色本体。</p>${controlledEntityCardMarkup(record,sheet)}</section>`,
    notes:`<section class="character-region character-region-modern" data-character-region="notes" aria-labelledby="character-tab-notes"><div class="region-heading"><div><span class="eyebrow">DM Notes</span><h3>DM 备注</h3></div><span class="pill">修订 ${esc(sheet.revision)}</span></div><article class="character-narrative dm-note-display"><h4>当前长期角色卡备注</h4><p>${esc(sheet.note||'尚无 DM 备注。')}</p></article><p class="notice warn">这里仅显示当前 CharacterSheet 修订中已保存的备注。战后“复活记录”候选在 DM 接受前不会写入；接受后会追加到此处，并在“导入与修订”留下新的修订差异。</p></section>`,
    revisions:`<section class="character-region character-region-modern" data-character-region="revisions" aria-labelledby="character-tab-revisions"><div class="region-heading"><div><span class="eyebrow">Source & revisions</span><h3>导入与修订</h3></div></div><article class="source-summary"><b>来源状态：${esc(sheet.source.kind)} / ${esc(sheet.source.status)}</b><p>${esc(sheet.source.note||'无来源备注')}</p>${sheet.source.fileSha256?`<small>${esc(sheet.source.importerId||'importer')}@${esc(sheet.source.sourceVersion||'unknown')} · ${esc(sheet.source.fileName||'文件名未知')}<br/>SHA-256 ${esc(sheet.source.fileSha256)}</small>`:'<small>本角色由手工入口建立。</small>'}</article><div class="revision-history">${revisionHistory(record)}</div></section>`
  };
  const archiveBlockers=characterArchiveBlockers(sheet.characterId),archiveReason=archiveBlockers.battleProjectionCount?`当前战斗引用中（${archiveBlockers.battleProjectionCount} 个投影）`:archiveBlockers.pendingDiffCount?`仍有 ${archiveBlockers.pendingDiffCount} 份待审核候选差异`:'';
  const lifecycleActions=record.status==='archived'?`<span class="pill">已归档</span><button data-character-restore="${sheet.characterId}">恢复角色</button><button class="danger" data-character-delete="${sheet.characterId}">永久删除</button>`:`<button class="danger" data-character-archive="${sheet.characterId}" ${archiveBlockers.blocked?'disabled':''}>归档角色</button>${archiveBlockers.blocked?`<small class="muted">${esc(archiveReason)}，完成或废除战后候选后才能归档。</small>`:''}`;
  return `<article class="character-detail character-detail-modern"><header class="character-detail-header character-hero"><div class="character-avatar" aria-hidden="true">${esc((sheet.name||'?').slice(0,1))}</div><div class="character-title"><span class="eyebrow">长期 CharacterSheet · 修订 ${esc(sheet.revision)}</span><h2>${esc(sheet.name)}</h2><p class="muted">${esc(sheet.ownerHint||'未标注所有者')} · ${sheet.totalLevel?`${sheet.totalLevel} 级 · `:''}${esc((sheet.classes||[]).map(item=>`${item.name}${item.subclass?`（${item.subclass}）`:''} ${item.level}`).join(' / ')||'职业待补充')} · 规则 ${esc(sheet.ruleVersion)}</p></div><div class="row character-hero-actions"><button data-character-edit="${sheet.characterId}" ${record.status==='archived'?'disabled':''}>编辑为新修订</button>${record.status!=='archived'&&canProject?`<button class="primary" data-character-project="${sheet.characterId}">生成投影并加入</button>`:''}${lifecycleActions}</div></header>${characterProjectionStatusMarkup(sheet.characterId)}<nav class="character-detail-tabs" role="tablist" aria-label="角色档案栏目">${tabButtons}</nav>${regions[characterDetailTab]}</article>`;
}
function postCombatDiffEntryMarkup(diff,entry){
  const noteAppend=entry.kind==='note-append';
  const value=noteAppend?`<details class="diff-note-append"><summary>将追加到当前角色卡的 DM 备注</summary><p>${esc(entry.appendText||entry.after||'未提供摘要')}</p></details>`:`<b>${esc(entry.before)} → ${esc(entry.after)}</b>`;
  const pending=noteAppend
    ? `<label>决定<select data-post-diff-decision="${esc(entry.id)}"><option value="reject">拒绝（默认）</option><option value="accept">接受并追加备注</option></select></label><small>接受后才创建新角色卡修订；不会覆盖既有备注。</small>`
    : `<label>决定<select data-post-diff-decision="${esc(entry.id)}"><option value="reject">拒绝（默认）</option><option value="accept">接受原值</option><option value="correct">更正后写入</option></select></label><label>更正值<input data-post-diff-corrected="${esc(entry.id)}" type="number" min="0" disabled aria-required="true"/></label><label>原因<input data-post-diff-reason="${esc(entry.id)}" disabled placeholder="更正时必填" aria-required="true"/></label><small class="field-error-message" data-post-diff-error="${esc(entry.id)}"></small>`;
  const result=entry.status==='accepted'?(noteAppend?'已接受并追加备注':'已接受'):entry.status==='corrected'?'已更正':entry.status==='abandoned'?'已随本份候选废除':'已拒绝';
  return `<div class="diff-entry ${noteAppend?'note-append':''}" data-post-diff-entry="${esc(entry.id)}"><span>${esc(entry.label)}</span>${value}${diff.status==='pending'?pending:`<small>${result}</small>`}</div>`;
}
function postCombatDiffPanels(){
  const diffs=state.postCombatDiffs||[];
  if(!diffs.length)return '<p class="muted">本次会话尚无战后候选差异。</p>';
  return diffs.map(diff=>{
    const record=characterRecords.find(candidate=>candidate.characterId===diff.characterId),currentRevision=record?.currentRevision??null;
    const blockedReason=!record?'对应长期角色卡已不存在':record.status==='archived'?'对应长期角色卡已归档；请先恢复角色':currentRevision!==diff.characterRevision?`长期角色已从修订 ${diff.characterRevision} 更新为修订 ${currentRevision}；本份候选已过期`:'';
    const instanceLabel=String(diff.combatantId||'unknown').slice(-8);
    const statusLabel=diff.status==='pending'?'待 DM 审核':diff.status==='applied'?'已建立新修订':diff.status==='abandoned'?'已废除，不写入':'已审核，不写入';
    const entries=diff.entries.map(entry=>postCombatDiffEntryMarkup(diff,entry)).join('');
    const controls=diff.status==='pending'?`${blockedReason?`<p class="notice warn" data-post-diff-guard>${esc(blockedReason)}。不能写回；可以废除本份候选差异。</p>`:'<p class="muted">所有条目均须明确决定；“更正后写入”必须填写非负数值与原因。提交为同一原子修订。</p>'}<div class="row"><button class="primary" data-review-post-diff ${blockedReason?'disabled':''}>确认本份审核</button><button class="danger" data-abandon-post-diff>废除本份战斗候选差异</button></div>`:`<p class="muted">决定事件：${esc(diff.decisionEventId||'未记录')}${diff.abandonmentReason?` · ${esc(diff.abandonmentReason)}`:''}</p>`;
    return `<article class="post-combat-diff" data-post-diff-card="${diff.diffId}"><div class="row"><h3>${esc(diff.characterName)} · 实例 ${esc(instanceLabel)} · 基于修订 ${diff.characterRevision}</h3><span class="pill">${statusLabel}</span></div>${entries}${controls}</article>`;
  }).join('');
}
function captureManualCharacterDraft(form=document.querySelector('[data-character-sheet-form]')){
  if(!form||characterEditorId)return;
  characterManualDraft=Object.fromEntries([...form.elements].filter(field=>field.name).map(field=>[field.name,field.type==='checkbox'?field.checked:field.value]));
}
function restoreManualCharacterDraft(form){
  if(!form||!characterManualDraft)return;
  for(const field of [...form.elements]){
    if(!field.name||!(field.name in characterManualDraft))continue;
    if(field.type==='checkbox')field.checked=characterManualDraft[field.name]===true;
    else field.value=characterManualDraft[field.name];
  }
}
function hasCreateDraft(){return !!characterImportDraft||!!Object.values(characterManualDraft||{}).some(value=>value!==''&&value!==false);}
function characterCreationPanel(){
  if(!characterCreateMode)return '';
  if(characterCreateMode==='close-confirm')return `<section class="card character-create-panel" data-panel-id="character-manual"><h2>关闭创建入口？</h2><p class="notice warn">当前草稿尚未写入长期角色卡。请选择保留还是放弃。</p><div class="row"><button class="primary" data-character-create-close="keep">保留草稿并关闭</button><button class="danger" data-character-create-close="discard">放弃草稿并关闭</button><button data-character-create-continue>继续编辑</button></div></section>`;
  if(characterCreateMode==='switch-confirm')return `<section class="card character-create-panel" data-panel-id="character-manual"><h2>切换创建方式？</h2><p class="notice warn">当前草稿尚未写入长期角色卡。可保留它以便返回继续处理，或明确放弃。</p><div class="row"><button class="primary" data-character-create-switch="keep">保留草稿并切换</button><button class="danger" data-character-create-switch="discard">放弃草稿并切换</button><button data-character-create-continue>继续编辑</button></div></section>`;
  if(characterCreateMode==='chooser')return `<section class="card character-create-panel character-create-chooser" data-panel-id="character-manual"><div class="row"><h2>创建角色</h2><button data-character-create-close-request>关闭</button></div><p class="muted">先选择建立方式；两种方式的草稿独立保存于本页内存，确认前不会创建 CharacterSheet。</p><div class="character-create-options"><button class="primary" data-character-create-mode="import"><b>受控 Excel 导入</b><small>读取受控 Profile，先生成 CharacterDraft 并逐项确认。</small></button><button data-character-create-mode="manual"><b>手工创建入口</b><small>由 DM 填写长期角色事实，保存时创建修订 1。</small></button></div></section>`;
  const importing=characterCreateMode==='import';
  return `<section class="card character-create-panel" data-panel-id="${importing?'character-import':'character-manual'}"><div class="row"><h2>${importing?'受控 Excel 导入':'手工创建入口'}</h2><button data-character-create-switch-request="${importing?'manual':'import'}">切换为${importing?'手工创建':'受控 Excel 导入'}</button><button data-character-create-back>返回创建方式</button><button data-character-create-close-request>关闭</button></div>${importing?importDraftPanel():characterForm()}</section>`;
}
function characterView(){
  const preparing=state.encounter?.phase==='preparation',joining=state.turn.started&&!combatEnded(),canProject=preparing||joining;
  const selectedCandidate=characterRecords.find(record=>record.characterId===selectedCharacterId),selected=(selectedCandidate?.status!=='archived'||showArchivedCharacters?selectedCandidate:null)||characterRecords.find(record=>record.status!=='archived')||(showArchivedCharacters?characterRecords[0]:null);if(selected&&!selectedCharacterId)selectedCharacterId=selected.characterId;
  const editing=characterEditorId?characterRecords.find(record=>record.characterId===characterEditorId):null;
  if(characterEditorId&&!editing)characterEditorId=null;
  const unlinked=unlinkedRevivedPcs();
  const unlinkedNotice=unlinked.length?`<p class="notice warn">${esc(unlinked.map(displayName).join('、'))} 的复活记录来自旧兼容单位或未关联长期角色卡的实例：仅保留在战斗记录中，不会生成角色卡备注候选。若要获得战后候选，须从“长期角色”生成 CombatProjection 后加入遭遇。</p>`:'';
  return `<section class="character-panel-grid"><aside class="card character-sidebar" data-panel-id="character-list"><div class="row"><h2>长期角色</h2><button class="primary" data-character-new>创建角色</button></div><label class="row"><input type="checkbox" data-character-show-archived ${showArchivedCharacters?'checked':''}/> 显示已归档角色</label><p class="muted density-standard-only">选择角色查看完整详情。投影冻结当前修订，不会被后续编辑污染。</p>${joining?entryBatchStatus():''}${characterList(canProject)}</aside><main class="character-main" data-panel-id="character">${characterEditorId?`<section class="card">${characterForm(currentCharacterSheet(editing))}</section>`:characterDetailV2(selected,canProject)}</main>${characterCreationPanel()}<section class="card post-combat-panel" data-panel-id="post-combat"><h2>战后候选差异</h2><p class="notice warn">候选默认全部不写入。DM 必须逐项勾选；接受字段才创建下一修订。</p>${unlinkedNotice}${postCombatDiffPanels()}</section></section>`;
}
function logView(){const groups=new Map();[...state.events].reverse().forEach(event=>{const key=`第 ${event.round??'—'} 轮`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(event);});const events=[...groups].map(([label,items])=>`<section class="event-group"><h3>${label}</h3>${items.map(event=>`<article class="event"><div class="event-summary"><b>#${event.sequence} ${esc(event.type)}</b><span>${event.manualCorrection?'DM 修正':''}${event.undoOfEventId?'补偿撤销':''}</span><time>${esc(event.occurredAt)}</time></div><details><summary>技术详情</summary><dl><dt>Event ID</dt><dd><code>${esc(event.id||'未记录')}</code></dd><dt>Payload</dt><dd><pre>${esc(JSON.stringify(event.payload,null,2))}</pre></dd></dl></details></article>`).join('')}</section>`).join('');return `<section class="workspace-fixed-grid"><div class="workbench-panel"><div class="section-heading"><div><span class="eyebrow">AUDIT TRAIL</span><h2>顺序事件日志</h2></div><span class="metric">${state.events.length} events</span></div><div class="log">${events||'<div class="empty-state"><b>尚无事件</b><span>范围预览和工作区切换不会写入日志。</span></div>'}</div></div><aside class="workbench-panel"><h2>数据与恢复</h2><p>自动保存已启用。导入先验证 Schema，失败不会覆盖当前内存状态。</p><div class="action-stack"><button data-action="save">手动保存</button><button data-action="export">导出 v0.7 JSON</button><button data-action="import">导入 JSON</button><button class="danger" data-action="new">新建空会话</button></div><dl class="compact-details"><dt>Snapshot 序号</dt><dd>${state.snapshotSequence}</dd><dt>存储键</dt><dd><code>${STORAGE_KEY}</code></dd></dl></aside></section>`;}
function diceView(){
  const history=[...state.events].reverse().filter(event=>event.type==='dice.rolled').slice(0,100);
  return `<section class="workspace-fixed-grid dice-workspace"><div class="workbench-panel dice-console"><div><span class="eyebrow">DICE CONSOLE</span><h2>掷骰</h2></div><div class="dice-controls"><label>骰式<input id="dice-formula" value="1d20+2" aria-label="骰式" inputmode="text"/></label><label>模式<select id="dice-mode"><option value="normal">普通</option><option value="advantage">优势</option><option value="disadvantage">劣势</option></select></label><button class="primary" data-action="roll">掷骰</button></div><div class="dice-shortcut"><label>快捷数字<input id="dice-shortcut" aria-label="快捷数字骰式" inputmode="numeric" placeholder="例如 110284"/></label><button data-dice-shortcut-preview>识别快捷骰式</button><div id="dice-shortcut-result" class="muted">标准面数 d4/d6/d8/d10/d12/d20/d100；有歧义时必须选择候选。</div></div><label class="toggle-line"><input type="checkbox" id="dark-rolls" ${state.settings.darkRolls?'checked':''}/> 暗骰，仅在事件中标记为 DM 可见</label><p class="muted">支持多个 NdM 与常数的加减：<code>2d6+2d4+1</code>。大小写与空格会规范化；优势/劣势仅接受正向 <code>1d20±K</code>。结果写入事件，恢复时不会重掷。</p></div><aside class="workbench-panel"><div class="section-heading"><div><span class="eyebrow">ROLL HISTORY</span><h2>结果历史</h2></div><span class="metric">最近 ${history.length}/100</span></div><button data-dice-history-top>回到最新</button><div class="dice-history" aria-label="最近一百次骰果" tabindex="0">${history.map(event=>{const payload=event.payload||{};const termSummary=(payload.terms||[]).map(term=>term.kind==='dice'?`${term.sign<0?'-':'+'}${term.count}d${term.sides} [${(term.dice||[]).join(',')}] = ${term.subtotal}`:`${term.sign<0?'-':'+'}${term.amount} = ${term.subtotal}`).join(' · ')||'未记录分项';const context=event.activeCombatantId?(getCombatant(event.activeCombatantId)?.name||event.activeCombatantId):'无当前行动者';return `<article><b>${esc(payload.total??'—')}</b><span>${esc(payload.mode||'normal')} · ${esc(payload.formulaCanonical||payload.canonical||payload.formula||'unknown')} · ${payload.visibility==='dm-only'?'暗骰':'公开'}</span><small>${esc(payload.formulaRaw||payload.raw||payload.formula||'unknown')} · ${esc(termSummary)} · 常数 ${esc(payload.modifier??0)} · 第 ${event.round??'—'} 轮 · ${esc(context)} · ${esc(event.occurredAt||'时间未知')}</small></article>`;}).join('')||'<div class="empty-state"><b>尚无掷骰</b><span>第一条结果会保留在这里；事件日志会保留全部历史。</span></div>'}</div></aside></section>`;
}
function settingsView(){return `<section class="settings-grid"><section class="workbench-panel"><div class="section-heading"><div><span class="eyebrow">SESSION</span><h2>会话与地图</h2></div></div><div class="form-grid"><label>会话名称<input id="session-name" value="${esc(state.name)}"/></label><label>地图宽<input id="map-w" type="number" min="5" max="40" value="${state.settings.width}"/></label><label>地图高<input id="map-h" type="number" min="5" max="40" value="${state.settings.height}"/></label><label>斜向规则<select id="diagonal"><option value="five-feet" ${state.settings.diagonalRule==='five-feet'?'selected':''}>每斜格 5 尺</option><option value="five-ten-alternating" ${state.settings.diagonalRule==='five-ten-alternating'?'selected':''}>5/10 尺交替</option></select></label></div><button class="primary" data-action="settings">保存会话设置</button></section><section class="workbench-panel"><span class="eyebrow">DISPLAY</span><h2>显示与布局</h2><p>当前密度：<b>${uiPreferences.density==='compact'?'紧凑':'标准'}</b>。战斗、地图和角色的面板配置位于各自工作区顶部。</p><button data-layout-reset-all>恢复全部工作区默认</button></section><section class="workbench-panel"><span class="eyebrow">DATA SAFETY</span><h2>保存、导入与恢复</h2><div class="action-stack"><button data-action="save">手动保存</button><button data-action="export">导出 JSON</button><button data-action="import">导入 JSON</button><button class="danger" data-action="new">新建空会话</button></div><p class="muted">v0.7 只写新键；v0.6 及更早键保持只读。</p></section><section class="workbench-panel"><span class="eyebrow">RUNTIME</span><h2>版本与边界</h2><dl class="compact-details"><dt>Delivery</dt><dd>${DELIVERY_VERSION}</dd><dt>Session Schema</dt><dd>${SESSION_ENVELOPE_SCHEMA_VERSION}</dd><dt>会话存储</dt><dd><code>${STORAGE_KEY}</code></dd><dt>UI 偏好</dt><dd><code>dnd-terminal.v0.7.0.ui-preferences</code></dd></dl><p class="muted">墙体、视线、掩护、碰撞和三维命中仍由 DM 裁定。</p></section>${developerValidationToolsMarkup()}</section>`;}
function preparationView(){const members=state.encounter.members;return `<section class="panel two"><div class="card"><h2>第 0 回合：遭遇准备</h2><p class="notice warn">尚未投先攻。可把增援标为“场外预备”：其数据会保存，但不摆上地图也不进入先攻，战斗中再投入。</p><div class="row"><button class="primary" data-v2-action="open-library">从单位库加入</button><button data-v2-action="open-prep-map">摆放棋子</button><button class="danger" data-v2-action="abandon-preparation">放弃准备</button></div><div class="combatants">${members.map(member=>`<article class="combatant ${member.relation}"><div class="combatant-summary"><b>${esc(member.name)}</b><span class="pill">${member.deployment==='reserve'?'场外预备':esc(member.templateSnapshot?.sourceType||'template')}</span><span>${member.deployment==='reserve'?'未摆放':`${member.footprint.widthCells}×${member.footprint.heightCells} · ${member.position.x+1},${member.position.y+1}`}</span></div><div class="row"><label>显示名<input data-v2-member-id="${member.id}" data-v2-member-field="name" value="${esc(member.name)}"/></label><label>初始 HP<input type="number" min="0" max="${member.maxHp}" data-v2-member-id="${member.id}" data-v2-member-field="hp" value="${member.hp}"/></label><label>关系<select data-v2-member-id="${member.id}" data-v2-member-field="relation"><option value="enemy" ${member.relation==='enemy'?'selected':''}>敌对</option><option value="ally" ${member.relation==='ally'?'selected':''}>友方</option><option value="neutral" ${member.relation==='neutral'?'selected':''}>中立</option></select></label><label>开战部署<select data-v2-member-id="${member.id}" data-v2-member-field="deployment"><option value="field" ${member.deployment!=='reserve'?'selected':''}>投入战场</option><option value="reserve" ${member.deployment==='reserve'?'selected':''}>场外预备</option></select></label><label>资源<input data-v2-member-id="${member.id}" data-v2-member-field="resources" value="${esc(Object.entries(member.resources||{}).map(([name,amount])=>`${name}:${amount}`).join('，'))}" placeholder="名称:数量"/></label><label>状态<input data-v2-member-id="${member.id}" data-v2-member-field="conditions" value="${esc(member.conditions.join('，'))}" placeholder="例如：隐形，中毒"/></label><button class="danger" data-v2-action="remove-member" data-member-id="${member.id}">移出遭遇</button></div></article>`).join('')||'<p class="muted">尚未加入单位。请先从单位库选取参考、自定义或变体模板。</p>'}</div><div class="row"><button class="primary" data-v2-action="confirm-encounter" ${members.length?'':'disabled'}>确认遭遇，进入先攻</button></div></div><div class="card"><h2>准备边界</h2><ul><li>此阶段可改名称、初始 HP、关系、资源、状态、棋子位置、朝向和发射口。</li><li>场外预备不占地图、不提前获得先攻。</li><li>确认会复制投入单位为独立 CombatantInstance；之后的战斗变化不会回写成员或模板。</li></ul></div></section>`;}
function preparationMapView(){const w=state.settings.width,h=state.settings.height,mode=state.settings.mapMode||'fit',deployed=roster().filter(member=>member.deployment!=='reserve');let grid='';for(let y=0;y<h;y++)for(let x=0;x<w;x++){const token=deployed.find(c=>c.position.x===x&&c.position.y===y);grid+=`<div class="cell" data-cell="${x},${y}">${token?tokenMarkup(token):''}</div>`;}return `<section class="panel"><div class="map-layout"><div class="card map-wrap"><h2>第 0 回合地图 <small>${w}×${h} / 每格 ${state.settings.cellFeet} 尺</small></h2><div class="row map-mode"><button data-map-mode="fit" class="${mode==='fit'?'active':''}">适应屏幕</button><button data-map-mode="tactical" class="${mode==='tactical'?'active':''}">战术操作</button><button data-map-focus="origin">回到原点</button><button data-v2-action="open-preparation">返回准备清单</button></div><div id="movement-preview" class="notice">拖动棋子摆放；场外预备不占地图。第 0 回合不消耗移动力，也不记录战斗事件；重叠或越界不可提交。</div><div class="map-viewport" data-map-viewport><div class="map-canvas"><div class="grid ${mode}" data-map-grid style="--grid-cols:${w};grid-template-columns:repeat(${w},var(--cell-size))">${grid}</div></div></div></div><aside class="card map-inspector-panel">${mapInspector()}</aside><aside class="card"><h2>摆放说明</h2><p class="muted">每个单位的整块占位都必须在地图内且不与其他单位重叠；大型单位按全部占位格检查。</p></aside></div></section>`;}
function isControlledAssociatedToken(token){return ['controlled','permanent-controlled'].includes(token?.controllerLink?.status);}
function tokenMarkup(token,{pending=false,s2Draft=false}={}){const fx=token.footprint.widthCells||1,fy=token.footprint.heightCells||1;ensureFacing(token);const data=s2Draft?`data-s2-placement-token="${token.id}"`:pending?`data-entry-placement-token="${token.id}"`:`data-token="${token.id}"`;const dead=isDead(token),controlled=isControlledAssociatedToken(token),kindClass=`kind-${token.kind||'monster'}`;return `<div class="token ${token.relation} ${kindClass} ${controlled?'controlled-associated':''} facing-${token.facing} ${pending||s2Draft?'pending-placement':''} ${dead?'dead-token':''} ${active()?.id===token.id?'active':''} ${state.ui.selectedId===token.id?'selected':''}" ${data} title="${esc(s2Draft?`${displayName(token)} · 临时摆放预览`:dead?`${displayName(token)} · 死亡`:controlled?`${displayName(token)} · 受控关联生物`:displayName(token))}" style="${token.colorMode==='custom'&&token.color?`background-color:${esc(token.color)};`:''}width:calc(${fx*100}% + ${fx-1}px);height:calc(${fy*100}% + ${fy-1}px)">${dead?'☠':esc(shortLabel(token))}</div>`;}
function mapViewV2(){
  const r=state.ui.range,cells=r&&r.phase==='preview'?coveredCells(r):[],w=state.settings.width,h=state.settings.height,mode=state.settings.mapMode||'fit';
  const s2Draft=s2PlacementDraft;
  const pendingTransformSources=new Set(entryPlacementItems().filter(item=>item.kind==='transformation').map(item=>item.sourceCombatantId));
  const mapCombatants=(combatEnded()?state.combatants.filter(c=>c.presenceStatus==='on-field'&&!c.cleanupRemoved&&c.corpseTokenVisible!==false):onFieldTokens()).filter(c=>!pendingTransformSources.has(c.id));
  const pendingPlacements=pendingPlacementCombatants();
  let grid='';
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const token=mapCombatants.find(c=>c.position.x===x&&c.position.y===y),pending=pendingPlacements.find(c=>c.position.x===x&&c.position.y===y),draftToken=s2Draft?.item.combatant.position.x===x&&s2Draft?.item.combatant.position.y===y?s2Draft.item.combatant:null;grid+=`<div class="cell ${cells.includes(`${x},${y}`)?'preview':''}" data-cell="${x},${y}">${token?tokenMarkup(token):pending?tokenMarkup(pending,{pending:true}):draftToken?tokenMarkup(draftToken,{s2Draft:true}):''}</div>`;}
  const candidates=r&&r.phase==='preview'?rangeTargets(cells):[];
  const preview=r?`<div id="range-live" class="notice ${r.phase==='armed'?'warn':''}">${r.phase==='armed'?`已选择${rangeLabel(r.shape)}：请在地图按住并拖动。`:`${rangeLabel(r.shape)}预览：${cells.length} 格；候选 ${candidates.length} 个。松开后可编辑。`}</div>${r.phase==='preview'?`<div class="row"><label>尺寸（尺）<input id="range-size" type="number" min="5" step="5" value="${r.size}" /></label><label>结算<select id="range-mode"><option value="damage">伤害</option><option value="healing">治疗</option><option value="buff">Buff</option><option value="condition">状态</option></select></label><label>数值<input id="range-amount" type="number" min="1" value="8" /></label></div><div class="row"><label>效果名称<input id="effect-name" placeholder="例如：祝福 / 中毒" /></label><label>持续轮数<input id="effect-duration" type="number" min="1" value="1" /></label><label><input id="effect-concentration" type="checkbox"/> 专注</label></div><h3>候选与 DM 覆写</h3>${state.combatants.map(c=>`<div class="row"><label><input type="checkbox" data-target="${c.id}" ${([...candidates.map(x=>x.id),...r.manualAdd].includes(c.id)&&!r.manualRemove.includes(c.id))?'checked':''}/> ${esc(c.name)}</label></div>`).join('')}<div class="row"><button class="primary" data-action="apply-range">确认并批量结算</button><button data-action="cancel-range">取消预览</button></div>`:''}`:'';
  const sidebar=s2Draft
    ? `<h3>摆放新躯体</h3><p class="notice warn">正在为“${esc(s2Draft.item.combatant.name)}”摆放。拖动半透明预览棋子到空格；可反复调整。确认前不会创建任何实例。</p><p class="muted">已有棋子（含尸体）、完整 footprint 越界或重叠都会拒绝确认。</p><div class="row"><button class="primary" data-s2-placement-confirm>确认摆放并生成</button><button data-s2-placement-cancel>取消摆放</button></div>`
    : pendingPlacements.length
    ? `<p>正在一次性摆放本批 ${pendingPlacements.length} 个单位。每个单位的整块占位必须落在空格内，且本批单位之间也不能重叠；再次入场单位在确认前仍不会进入先攻。</p><div class="entry-placement-list">${pendingPlacements.map(c=>`<span class="pill">${esc(displayName(c))} · ${c.position.x+1},${c.position.y+1}</span>`).join('')}</div><div class="row"><button class="primary" data-action="confirm-entry-placement">确认本批全部投入</button><button data-action="cancel-entry-placement">取消整批投入</button></div>`
    : `<p class="muted">棋子：按住拖动、松开提交。范围：选择形状后在地图按住并拖动；预览本身不写入事件。</p><div class="row"><button data-range="circle">圆形</button><button data-range="cone">锥形</button><button data-range="line">直线</button><button data-range="square">方形</button><button data-action="undo">撤销上一步</button></div>${preview||'<div class="notice warn">选择形状后，在地图按住并拖动：圆形/方形决定中心和大小，锥形/直线以当前行动者已选发射口为源点决定朝向和长度。</div>'}`;
  return `<section class="panel"><div class="map-layout"><div class="card map-wrap"><h2>二维战术地图 <small>${w}×${h} / 每格 ${state.settings.cellFeet} 尺</small></h2><div class="row map-mode"><span>显示：</span><button data-map-mode="fit" class="${mode==='fit'?'active':''}">适应屏幕</button><button data-map-mode="tactical" class="${mode==='tactical'?'active':''}">战术操作</button><button data-map-focus="origin">回到原点</button><button data-map-focus="active" ${active()?'':'disabled'}>定位当前行动者</button></div><div id="movement-preview" class="notice ${s2Draft||pendingPlacements.length?'warn':''}">${s2Draft?`正在摆放 ${esc(s2Draft.item.combatant.name)}：拖动预览棋子可无限调整；确认后才会生成。`:pendingPlacements.length?`正在摆放本批 ${pendingPlacements.length} 个单位：逐个拖动后一次性确认投入；未确认前不会加入先攻或写入事件。`:'按住棋子并拖动；松开后才记录移动。黄色提示表示超过移动力，重叠和越界不可提交。'}</div><div class="map-viewport" data-map-viewport><div class="map-canvas"><div class="grid ${mode}" data-map-grid style="--grid-cols:${w};grid-template-columns:repeat(${w},var(--cell-size))">${grid}</div></div></div><p class="muted">棋子正面边以金色标示；点选棋子可设置朝向和发射口。</p></div><aside class="card map-inspector-panel">${mapInspector()}</aside><aside class="card"><h2>地图与范围</h2>${sidebar}</aside></div></section>`;
}
function unifiedWorkbenchView(){
  const a=active(),focus=getCombatant(state.ui.selectedId)||a,ended=combatEnded(),cleanup=!!state.ui.postCombatCleanup,hasSelected=!!getCombatant(state.ui.selectedId),canOperate=!!focus&&focus.id===a?.id&&!ended&&!isDead(focus),canRestoreEconomy=!!focus&&!ended&&!isDead(focus)&&focus.presenceStatus==='on-field'&&focus.participationStatus==='active';
  const status=ended?(cleanup?'本场战斗已结束；当前为只读战后清理，可撤下棋子但不能行动、进入先攻或再入场。':`本场战斗已结束于第 ${state.turn.round} 轮；记录已封存为只读。`):state.turn.started?(a?`第 ${state.turn.round} 轮 · 当前：${esc(displayName(a))}`:`第 ${state.turn.round} 轮 · 等待增援，可投入单位或结束战斗`):'尚未开始：确认遭遇后可掷先攻。';
  const overlays=`${initiativeTimeline()}${initiativeResolver()}${entryDraftPanel()}${entryPlacementPanel()}${reentryDraftPanel()}${reservesPanel()}${deathResolutionPanel()}`;
  const combatControls=ended?(cleanup?`<button data-action="cleanup-enemies">撤下全部敌对单位</button><button class="danger" data-action="finish-cleanup">清空战场并新建遭遇</button>`:''):`<button class="primary" data-action="initiative">掷先攻</button><button data-action="next">下一回合</button><button data-action="undo">撤销上一步</button><button class="danger" data-action="end-combat">结束战斗</button>`;
  const prepMarkup = state.encounter?.phase === 'preparation' ? `
    <div class="card" data-panel-id="prep-controls">
      <h2>遭遇准备阶段</h2>
      ${fixtureLoadConfirmation ? `
        <div class="notice warn">
          <p>将载入固定战斗验证场景并替换当前 CombatSession。请选择：</p>
          <div class="row">
            <button class="primary" data-load-fixtures-confirm="nosave">直接载入（不导出）</button>
            <button data-load-fixtures-confirm="export">导出后载入</button>
            <button data-load-fixtures-cancel>取消</button>
          </div>
        </div>
      ` : `
        <p class="notice warn">尚未开始战斗。可从单位库加入单位，或一键载入测试场景；确认后进入先攻。</p>
        <div class="row">
          <button class="primary" data-v2-action="open-library">从单位库加入单位</button>
          <button data-load-fixtures-request>一键载入演示遭遇</button>
          <button class="primary" data-v2-action="confirm-encounter" ${state.encounter?.members?.length ? '' : 'disabled'}>确认遭遇，进入先攻</button>
        </div>
      `}
      ${state.encounter?.members?.length ? `<div class="combatants">${state.encounter.members.map(member=>`<article class="combatant ${member.relation}"><div class="combatant-summary"><b>${esc(member.name)}</b><span class="pill">${member.deployment==='reserve'?'场外预备':'准备投入'}</span></div></article>`).join('')}</div>` : ''}
    </div>
  ` : '';
  const turnMarkup=`${overlays}${prepMarkup}<div class="card" data-panel-id="turn"><h2>战斗控制</h2><div class="notice ${state.turn.started?'':'warn'}">${status}</div><div class="row">${combatControls}</div></div>`;
  const rosterMarkup=`<div class="card" data-panel-id="roster"><h3>单位态势</h3><div class="combatants ${state.ui.selectedId?'has-selection':''}">${state.combatants.filter(c=>!c.cleanupRemoved).map(combatantRow).join('')||'<span class="muted">暂无仍在战场上的单位。</span>'}</div></div>`;
  const recentResultMarkup=`<div class="situation-grid" data-panel-id="recent-result">${battleSituationMarkup(currentStatusProjection())}</div>`;
  const r=state.ui.range,cells=r&&r.phase==='preview'?coveredCells(r):[],w=state.settings.width,h=state.settings.height,mode=state.settings.mapMode||'fit',s2Draft=s2PlacementDraft;
  const pendingTransformSources=new Set(entryPlacementItems().filter(item=>item.kind==='transformation').map(item=>item.sourceCombatantId));
  const mapCombatants=(ended?state.combatants.filter(c=>c.presenceStatus==='on-field'&&!c.cleanupRemoved&&c.corpseTokenVisible!==false):onFieldTokens()).filter(c=>!pendingTransformSources.has(c.id));
  const pendingPlacements=pendingPlacementCombatants();
  let grid='';
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const token=mapCombatants.find(c=>c.position.x===x&&c.position.y===y),pending=pendingPlacements.find(c=>c.position.x===x&&c.position.y===y),draftToken=s2Draft?.item.combatant.position.x===x&&s2Draft?.item.combatant.position.y===y?s2Draft.item.combatant:null;grid+=`<div class="cell ${cells.includes(`${x},${y}`)?'preview':''}" data-cell="${x},${y}">${token?tokenMarkup(token):pending?tokenMarkup(pending,{pending:true}):draftToken?tokenMarkup(draftToken,{s2Draft:true}):''}</div>`;}
  const movementNotice=`<div id="movement-preview" class="notice ${s2Draft||pendingPlacements.length?'warn':''}">${s2Draft?`正在摆放 ${esc(s2Draft.item.combatant.name)}：拖动预览棋子可无限调整；确认后才会生成。`:pendingPlacements.length?`正在摆放本批 ${pendingPlacements.length} 个单位：逐个拖动后一次性确认投入；未确认前不会加入先攻或写入事件。`:'按住棋子并拖动；松开后才记录移动。黄色提示表示超过移动力，重叠和越界不可提交。'}</div>`;
  const mapGridMarkup=`${movementNotice}<div class="grid ${mode}" data-map-grid style="--grid-cols:${w};grid-template-columns:repeat(${w},var(--cell-size))">${grid}</div>`;
  const actionMarkup=`<div class="card" data-panel-id="current-action"><h2>当前选中者状态</h2><p class="muted density-standard-only">${hasSelected?`正在查看：${esc(displayName(focus))}`:'未手动选择，默认显示当前行动者。'}</p>${focus?`${actionEconomyMarkup(focus,canOperate,canRestoreEconomy)}${canOperate?'':`<p class="notice warn">${ended?'战斗已结束，状态只读。':isDead(focus)?'该单位已死亡，不能行动、治疗、再入场或以普通方式修改状态。':'当前查看单位不是行动者；行动、资源与手动效果操作仅对当前行动者开放。'}</p>`}${isDead(focus)&&!ended?`<section class="death-controls"><h3>死亡处理</h3><p class="muted">尸体棋子保留在地图；可由 DM 决定特许复起或特殊复苏 / 转化。</p><button class="primary" data-death-resolve="${focus.id}">处理死亡</button></section>`:''}<h3>资源</h3>${Object.entries(focus.resources).map(([k,v])=>`<div class="row"><span>${esc(k)} ${v}/${focus.resourceMax[k]??v}</span><button data-resource="${k}" data-amount="-1" ${canOperate?'':'disabled'}>消耗</button><button data-resource="${k}" data-amount="1" ${canOperate?'':'disabled'}>恢复</button></div>`).join('')||'<span class="muted">无次数资源</span>'}<h3>法术位</h3>${Object.entries(focus.slots).map(([k,v])=>`<span class="pill">${k}环 ${v}/${focus.slotsMax[k]}</span>`).join(' ')||'<span class="muted">非玩家法术位模型或未配置</span>'}<h3>状态、Buff 与专注</h3><div class="effect-list">${effectCards(focus.id)}</div>${masteryStatusPanel(focus)}${canOperate?manualEffectMarkup():''}`:ended?'<span class="muted">战斗内 HP、资源与状态没有自动回写长期角色卡；长期结算仍延期。</span>':'<span class="muted">选择单位后显示操作。</span>'}<section class="reference-section">${referenceActionPanel(focus)}</section></div>`;
  const inspectorMarkup=`<aside class="card map-inspector-panel" data-panel-id="map-inspector">${mapInspector()}</aside>`;
  const candidates=r&&r.phase==='preview'?rangeTargets(cells):[];
  const preview=r?`<div id="range-live" class="notice ${r.phase==='armed'?'warn':''}">${r.phase==='armed'?`已选择${rangeLabel(r.shape)}：请在地图按住并拖动。`:`${rangeLabel(r.shape)}预览：${cells.length} 格；候选 ${candidates.length} 个。松开后可编辑。`}</div>${r.phase==='preview'?`<div class="row"><label>尺寸（尺）<input id="range-size" type="number" min="5" step="5" value="${r.size}" /></label><label>结算<select id="range-mode"><option value="damage">伤害</option><option value="healing">治疗</option><option value="buff">Buff</option><option value="condition">状态</option></select></label><label>数值<input id="range-amount" type="number" min="1" value="8" /></label></div><div class="row"><label>效果名称<input id="effect-name" placeholder="例如：祝福 / 中毒" /></label><label>持续轮数<input id="effect-duration" type="number" min="1" value="1" /></label><label><input id="effect-concentration" type="checkbox"/> 专注</label></div><h3>候选与 DM 覆写</h3>${state.combatants.map(c=>`<div class="row"><label><input type="checkbox" data-target="${c.id}" ${([...candidates.map(x=>x.id),...r.manualAdd].includes(c.id)&&!r.manualRemove.includes(c.id))?'checked':''}/> ${esc(c.name)}</label></div>`).join('')}<div class="row"><button class="primary" data-action="apply-range">确认并批量结算</button><button data-action="cancel-range">取消预览</button></div>`:''}`:'';
  const sidebar=s2Draft
    ? `<h3>摆放新躯体</h3><p class="notice warn">正在为“${esc(s2Draft.item.combatant.name)}”摆放。拖动半透明预览棋子到空格；可反复调整。确认前不会创建任何实例。</p><p class="muted">已有棋子（含尸体）、完整 footprint 越界或重叠都会拒绝确认。</p><div class="row"><button class="primary" data-s2-placement-confirm>确认摆放并生成</button><button data-s2-placement-cancel>取消摆放</button></div>`
    : pendingPlacements.length
    ? `<p>正在一次性摆放本批 ${pendingPlacements.length} 个单位。每个单位的整块占位必须落在空格内，且本批单位之间也不能重叠；再次入场单位在确认前仍不会进入先攻。</p><div class="entry-placement-list">${pendingPlacements.map(c=>`<span class="pill">${esc(displayName(c))} · ${c.position.x+1},${c.position.y+1}</span>`).join('')}</div><div class="row"><button class="primary" data-action="confirm-entry-placement">确认本批全部投入</button><button data-action="cancel-entry-placement">取消整批投入</button></div>`
    : `<p class="muted">棋子：按住拖动、松开提交。范围：选择形状后在地图按住并拖动；预览本身不写入事件。</p><div class="row"><button data-range="circle">圆形</button><button data-range="cone">锥形</button><button data-range="line">直线</button><button data-range="square">方形</button><button data-action="undo">撤销上一步</button></div>${preview||'<div class="notice warn">选择形状后，在地图按住并拖动：圆形/方形决定中心和大小，锥形/直线以当前行动者已选发射口为源点决定朝向和长度。</div>'}`;
  const rangeMarkup=`<aside class="card" data-panel-id="range"><h2>地图与范围</h2>${sidebar}</aside>`;
  return battleWorkbenchMarkup({
    state,
    activeCombatant: a,
    selectedCombatant: focus,
    subMode: uiPreferences.workbenchSubMode||'full',
    theme: uiPreferences.theme||'dark',
    leftCollapsed: !!uiPreferences.workbenchLeftCollapsed,
    rightCollapsed: !!uiPreferences.workbenchRightCollapsed,
    diceDockOpen: !!uiPreferences.workbenchDiceDockOpen,
    zoomLevel: uiPreferences.workbenchZoom||1.0,
    esc,
    rosterMarkup,
    turnMarkup,
    actionMarkup,
    inspectorMarkup,
    rangeMarkup,
    mapGridMarkup,
    recentResultMarkup,
  });
}
function view(){
  const workspaceId=currentWorkspaceId();
  const domainTab=currentDomainTab();
  const content=['战斗','地图'].includes(domainTab)
    ?unifiedWorkbenchView()
    :({'角色':characterView,'单位库':libraryViewV2,'日志':logView,'掷骰':diceView,'设置':settingsView}[domainTab]||combatView)();
  return workspaceChromeMarkup(workspaceId,content);
}
function injectPcLifePanel(){
  if(!['战斗','地图'].includes(currentDomainTab())||state.encounter?.phase==='preparation')return;
  const heading=[...document.querySelectorAll('h2')].find(node=>node.textContent==='当前选中者状态'),host=heading?.closest('.card'),focus=getCombatant(state.ui.selectedId)||active();
  if(!host||!isPc(focus))return;
  host.querySelectorAll('[data-death-resolve]').forEach(button=>button.closest('.death-controls')?.remove());
  const saves=focus.deathSaves||{successes:0,failures:0,history:[]},history=(saves.history||[]).slice(-8).reverse();
  const required=focus.id===active()?.id&&deathSaveRequired(focus);
  const phase=pcLifePhase(focus),conditions=(focus.conditions||[]).map(conditionLabel),helper=active(),canStabilize=phase==='dying'&&helper&&helper.id!==focus.id&&ordinaryActionsAllowed(helper)&&helper.actionAvailable&&!combatEnded(),canStand=phase==='active'&&hasCondition(focus,'prone')&&ordinaryActionsAllowed(focus)&&!combatEnded();
  const section=document.createElement('section');section.className='pc-life-panel';
  section.innerHTML=`<h3>PC 生命状态</h3><div class="row"><span class="stat">生命阶段<b>${esc(lifeStatusLabel(focus))}</b></span><span class="stat">状态<b>${esc(conditions.join('、')||'无')}</b></span><span class="stat">成功<b>${saves.successes||0}/3</b></span><span class="stat">失败<b>${saves.failures||0}/3</b></span></div>${required?`<form data-death-save-form="${focus.id}"><p class="notice warn">本回合必须先记录死亡豁免；除自然 20 恢复 1 HP 外，本回合不会获得普通行动。</p><div class="row"><button class="primary" type="button" data-death-save-roll="${focus.id}">投 d20 并记录</button><label>手动最终 d20<input name="roll" type="number" min="1" max="20" required value="10"/></label><button type="submit">记录手动结果</button></div></form>`:''}${canStand?`<div class="notice warn">已恢复正 HP，但仍倒地；昏迷结束不会自动站起。</div><button data-pc-stand="${focus.id}">消耗 ${Math.floor(focus.speed/2)} 尺移动力起立</button>`:''}${canStabilize?`<form data-medical-stabilize-form="${focus.id}"><p class="muted">施救者：${esc(displayName(helper))}；提交会消耗其普通动作。DC 10，Terminal 只记录最终 Medicine 检定值。</p><div class="row"><label>最终检定值<input name="checkTotal" type="number" required value="10"/></label><button type="submit">医疗稳定</button></div></form>`:''}<details ${phase==='needs-review'?'open':''}><summary>DM 生命阶段修正</summary><form data-life-correction-form="${focus.id}"><div class="row"><label>阶段<select name="lifePhase"><option value="active" ${phase==='active'?'selected':''}>正常</option><option value="dying" ${phase==='dying'?'selected':''}>濒死</option><option value="stable" ${phase==='stable'?'selected':''}>稳定</option><option value="dead" ${phase==='dead'?'selected':''}>死亡</option><option value="needs-review" ${phase==='needs-review'?'selected':''}>待复核</option></select></label><label>HP<input name="hp" type="number" min="0" max="${focus.maxHp}" value="${focus.hp}"/></label><label>原因<input name="reason" required placeholder="必须记录修正原因"/></label><button type="submit">追加 DM 修正事件</button></div></form></details><details><summary>死亡豁免轨迹（${(saves.history||[]).length}）</summary>${history.map(item=>`<p><b>${esc(item.kind)}</b> · 第 ${esc(item.round??'—')} 轮 · ${esc(item.result)}${item.roll?` · d20 ${item.roll}`:''}${item.source?` · ${esc(item.source)}`:''}${item.amount?` · 伤害 ${item.amount}`:''}</p>`).join('')||'<p class="muted">尚无轨迹；迁移不会补造历史。</p>'}</details>`;
  const latestRevival=(focus.deathRecord?.resolutions||[]).filter(resolution=>resolution?.type==='pc-return-to-life').at(-1),revivalMarkup=revivalSummaryMarkup(latestRevival);
  if(revivalMarkup)section.querySelector('h3')?.insertAdjacentHTML('afterend',revivalMarkup);
  if(phase==='dead'&&!combatEnded()){
    const choice=deathOutcomeChoice?.combatantId===focus.id?deathOutcomeChoice.kind:null,shape=deathOutcomeChoice?.combatantId===focus.id?deathOutcomeChoice.shape:null;
    const choices=[['restore','恢复原身体','恢复原 PC 战斗实例。'],['successor','以新身体或新形态继续冒险','创建独立新角色卡与新 PC 实例。'],['controlled','制造受控不死生物','创建独立 monster/NPC 实例；控制记录可只限本场。']];
    section.insertAdjacentHTML('beforeend',`<section class="death-outcome-choice"><h4>死亡后处理方式</h4><p class="muted">首次选择决定对象拓扑。法术只在对应结果内显示；提示不阻塞 DM 裁定。</p><div class="row">${choices.map(([kind,label])=>`<button type="button" data-death-outcome="${kind}" data-death-outcome-source="${focus.id}" class="${choice===kind?'active':''}">${label}</button>`).join('')}</div>${choice?`<p class="notice warn">${esc(choices.find(item=>item[0]===choice)?.[2]||'')}</p>`:''}</section>`);
    if(choice==='restore')section.insertAdjacentHTML('beforeend',v060RestorePanel(focus));
    else if(choice==='successor'){
      const shapes=[['normal','普通新身体'],['undead','不死生物形态'],['custom','其他自定义形态']];
      section.insertAdjacentHTML('beforeend',`<section class="death-resolution"><h4>选择新身体/新形态</h4><div class="row">${shapes.map(([id,label])=>`<button type="button" data-v060-shape="${id}" data-v060-shape-source="${focus.id}" class="${shape===id?'active':''}">${label}</button>`).join('')}</div></section>`);
      if(shape)section.insertAdjacentHTML('beforeend',s2SuccessorPanel(focus,shape==='undead'?'S2C':'S2A',shape));
    } else if(choice==='controlled')section.insertAdjacentHTML('beforeend',s2ControlledUndeadPanel(focus));
  }
  const controllerMarkup=controllerLinkPanel(focus);if(controllerMarkup)section.insertAdjacentHTML('beforeend',controllerMarkup);
  host.append(section);
  if(!ordinaryActionsAllowed(focus)){host.querySelectorAll('[data-resource],[data-economy],[data-economy-restore],[data-action="manual-effect"]').forEach(control=>{control.disabled=true;});}
  if(active()&&!ordinaryActionsAllowed(active()))document.querySelectorAll('[data-economy]').forEach(control=>{control.disabled=true;});
}
function ensureWorkbenchShell(){
  const app=document.querySelector('#app');
  if(app.querySelector('[data-workbench-shell]'))return app;
  app.innerHTML=`<div class="shell workbench-shell" data-workbench-shell><div class="workbench-layout"><aside class="workbench-rail"><div class="rail-brand"><span class="brand-mark">DT</span><div><p class="eyebrow">DM WORKBENCH</p><b>DND Terminal</b></div></div><nav class="workbench-nav" aria-label="工作区导航" data-workbench-nav></nav><div class="rail-meta"><small data-workbench-version></small><span>本地私有</span></div></aside><div class="workbench-main"><header class="topbar workbench-topbar"><div><p class="eyebrow">CURRENT SESSION</p><h1 data-workbench-session></h1></div><div class="workbench-session"><b data-workbench-phase></b><small data-workbench-summary></small></div></header><details class="mobile-workspace-nav"><summary>切换工作区</summary><nav class="workbench-nav" aria-label="窄屏工作区导航" data-workbench-nav></nav></details><div class="global-notice" data-workbench-notice></div><main data-workbench-view></main><footer class="footer">CharacterSheet（长期只读） · CombatProjection · CombatantInstance · CombatEvent · PostCombatDiff</footer></div></div></div>`;
  return app;
}
function applyPanelPreferences(root){
  const preferences=uiPreferences.panels;
  const applyPreference=(node,id)=>{
    const preference=preferences[id];if(!preference)return;
    node.hidden=!preference.visible;
    node.dataset.panelId=id;
    node.dataset.panelWidth=preference.width;
    node.style.order=String(preference.order);
  };
  const selectors={
    turn:['.initiative-timeline','.tie-resolver'],
    'current-action':['.workspace-content > .panel.two > .card:nth-child(2)','[data-spell-resource-panel]','[data-inventory-balance-panel]'],
    roster:['.workspace-content > .panel.two > .card:first-child'],
    'recent-result':['.situation-grid'],
    map:['.map-wrap'],
    'map-inspector':['.map-layout > .map-inspector-panel'],
    range:['.map-layout > aside:last-child'],
  };
  Object.entries(selectors).forEach(([id,targets])=>targets.forEach(selector=>root.querySelectorAll(selector).forEach(node=>applyPreference(node,id))));
  root.querySelectorAll('[data-panel-id]').forEach(node=>applyPreference(node,node.dataset.panelId));
}
function bindWorkbenchShell(shell){
  shell.querySelectorAll('[data-workspace]').forEach(button=>button.onclick=()=>setWorkspace(button.dataset.workspace));
  shell.querySelectorAll('.layout-controls,.mobile-workspace-nav').forEach(details=>details.onkeydown=event=>{if(event.key==='Escape'&&details.open){details.open=false;event.preventDefault();event.stopPropagation();}});
  shell.querySelector('[data-ui-density]')?.addEventListener('change',event=>{uiPreferences={...uiPreferences,density:event.currentTarget.value==='compact'?'compact':'standard',layoutEditing:true};persistUiPreferences();render();});
  shell.querySelectorAll('[data-panel-visible]').forEach(input=>input.onchange=()=>{uiPreferences=updatePanelPreference(uiPreferences,input.dataset.panelVisible,{visible:input.checked});persistUiPreferences();render();});
  shell.querySelectorAll('[data-panel-width]').forEach(select=>select.onchange=()=>{uiPreferences=updatePanelPreference(uiPreferences,select.dataset.panelWidth,{width:select.value});persistUiPreferences();render();});
  shell.querySelectorAll('[data-panel-move]').forEach(button=>button.onclick=()=>{uiPreferences=movePanelPreference(uiPreferences,button.dataset.panelMove,Number(button.dataset.direction));uiPreferences.layoutEditing=true;persistUiPreferences();render();});
  shell.querySelectorAll('[data-layout-reset]').forEach(button=>button.onclick=()=>{uiPreferences=resetWorkspacePreferences(uiPreferences,button.dataset.layoutReset);persistUiPreferences();render();});
  shell.querySelector('[data-layout-reset-all]')?.addEventListener('click',()=>{uiPreferences=resetAllUiPreferences(uiPreferences);persistUiPreferences();render();});
  shell.querySelector('.layout-controls')?.addEventListener('toggle',event=>{uiPreferences={...uiPreferences,layoutEditing:event.currentTarget.open};persistUiPreferences();});
}
function render(){
  const app=ensureWorkbenchShell(),shell=app.querySelector('[data-workbench-shell]');
  renderedStatusProjection=projectWorkspaceStatus(state);
  shell.querySelector('[data-workbench-version]').textContent=`v${DELIVERY_VERSION} · 会话 Schema ${SESSION_ENVELOPE_SCHEMA_VERSION} · 本地私有`;
  shell.querySelector('[data-workbench-session]').textContent=state.name;
  shell.querySelector('[data-workbench-phase]').textContent=`v${DELIVERY_VERSION} · ${phaseLabel(state.encounter?.phase)} · 第 ${state.turn?.round||0} 轮`;
  shell.querySelector('[data-workbench-summary]').textContent=`${state.events.length} events · ${state.encounter?.phase||'未知阶段'}`;
  shell.querySelectorAll('[data-workbench-nav]').forEach(nav=>nav.innerHTML=WORKSPACES.map(workspaceNavButton).join(''));
  shell.querySelector('[data-workbench-notice]').innerHTML=state.ui.message?`<p class="notice ${state.ui.messageKind||''}">${esc(state.ui.message)}</p>`:'';
  const viewRoot=shell.querySelector('[data-workbench-view]');viewRoot.innerHTML=view();
  bindWorkbenchShell(shell);upgradeLinkedEditors();bind();applyPanelPreferences(shell.querySelector('.workspace'));
}
function bindMapInteractions(){
  const grid=document.querySelector('[data-map-grid]');if(!grid)return;
  const within=cell=>cell.x>=0&&cell.y>=0&&cell.x<state.settings.width&&cell.y<state.settings.height;
  const gestureCombatant=gesture=>gesture.kind==='entry-placement'?placementCombatant(entryPlacementItems().find(item=>item.combatant.id===gesture.id)):gesture.kind==='s2-placement'?s2PlacementDraft?.item.combatant:getCombatant(gesture.id);
  grid.onpointerdown=event=>{
    const cell=gridCell(event,grid);if(!within(cell))return;
    const pendingToken=event.target.closest('[data-entry-placement-token]'),s2Token=event.target.closest('[data-s2-placement-token]'),token=event.target.closest('[data-token]');
    if(s2PlacementDraft){if(!s2Token)return;const c=s2PlacementDraft.item.combatant;mapGesture={kind:'s2-placement',pointerId:event.pointerId,id:c.id,start:clone(c.position),current:clone(c.position),moved:false};grid.setPointerCapture?.(event.pointerId);s2Token.classList.add('dragging');event.preventDefault();return;}
    if(combatEnded()){if(token){state.ui.selectedId=token.dataset.token;persist();render();}return;}
    if(state.ui.range){const range=state.ui.range;range.phase='dragging';const start=(range.shape==='circle'||range.shape==='square')?cell:(active()?.position||cell);updateRangeGeometry(range,start,cell);mapGesture={kind:'range',pointerId:event.pointerId,start};grid.setPointerCapture?.(event.pointerId);updateRangePreview(grid,range);event.preventDefault();return;}
    if(!pendingToken&&!token)return;
    const c=pendingToken?entryPlacementItems().find(item=>item.combatant.id===pendingToken.dataset.entryPlacementToken)?.combatant:getCombatant(token.dataset.token);if(!c)return;
    if(!pendingToken)state.ui.selectedId=c.id;
    if(!pendingToken&&(isDead(c)||isTransformed(c))){persist();render();return;}
    mapGesture={kind:pendingToken?'entry-placement':'move',pointerId:event.pointerId,id:c.id,start:clone(c.position),current:clone(c.position),moved:false};
    grid.setPointerCapture?.(event.pointerId);(pendingToken||token).classList.add('dragging');event.preventDefault();
  };
  grid.onpointermove=event=>{
    if(!mapGesture||mapGesture.pointerId!==event.pointerId)return;const cell=gridCell(event,grid);if(!within(cell))return;
    if(mapGesture.kind==='range'){updateRangeGeometry(state.ui.range,mapGesture.start,cell);updateRangePreview(grid,state.ui.range);return;}
    const c=gestureCombatant(mapGesture);if(!c)return;mapGesture.current=cell;mapGesture.moved=mapGesture.moved||cell.x!==mapGesture.start.x||cell.y!==mapGesture.start.y;
    const placement=['entry-placement','s2-placement'].includes(mapGesture.kind)?placementPlan(c,cell,[...mapTokenOccupants(),...pendingPlacementCombatants()].filter(item=>item.id!==c.id)):null;
    const plan=placement?{from:c.position,to:cell,feet:0,pending:false,...placement,blocked:!placement.valid}:movementPlan(c,cell);
    updateMapPreview(grid,cell,plan);
  };
  grid.onpointerup=event=>{
    if(!mapGesture||mapGesture.pointerId!==event.pointerId)return;const gesture=mapGesture;mapGesture=null;grid.releasePointerCapture?.(event.pointerId);
    if(gesture.kind==='range'){if(state.ui.range){state.ui.range.phase='preview';persist();render();}return;}
    const c=gestureCombatant(gesture);if(!c)return;if(!gesture.moved){if(gesture.kind!=='entry-placement'){state.ui.selectedId=c.id;persist();render();}return;}
    if(gesture.kind==='entry-placement')updateEntryPlacementPosition(c.id,gesture.current);else if(gesture.kind==='s2-placement'){const plan=replacementPlacement(s2PlacementDraft.item.source,{...c,position:gesture.current});if(!plan.valid)return message(`预览未移动：${plan.reasons.join('；')}。`,'warn');c.position=clone(gesture.current);render();}else move(c.id,gesture.current);
  };
  grid.onpointercancel=()=>{if(!mapGesture)return;mapGesture=null;if(state.ui.range?.phase==='dragging')state.ui.range.phase='armed';render();};
}
function bind(){
  injectPcLifePanel();
  injectEndCombatPanel();
  injectSpellResourcePanel();
  injectInventoryBalancePanel();
  applyM1S4PresentationLabels();
  applyLinkedEntityTemplateHint();
  document.querySelectorAll('[data-token],[data-entry-placement-token],[data-s2-placement-token]').forEach(token=>{const combatant=token.dataset.token?getCombatant(token.dataset.token):token.dataset.entryPlacementToken?placementCombatant(entryPlacementItems().find(item=>item.combatant.id===token.dataset.entryPlacementToken)):s2PlacementDraft?.item.combatant;if(!combatant)return;token.style.background=isControlledAssociatedToken(combatant)?CONTROLLED_ASSOCIATED_TOKEN_COLOR:(combatant.color||'');});
  document.querySelector('[data-character-sheet-form]')?.addEventListener('submit',event=>{event.preventDefault();saveManualCharacter(event.currentTarget);});
  restoreManualCharacterDraft(document.querySelector('[data-character-sheet-form]'));
  document.querySelectorAll('[data-character-sheet-form] input,[data-character-sheet-form] select,[data-character-sheet-form] textarea').forEach(field=>field.addEventListener('input',()=>captureManualCharacterDraft()));
  document.querySelector('[data-mastery-rest-form]')?.addEventListener('submit',event=>{event.preventDefault();saveWeaponMasteryRestSelection(event.currentTarget);});
  document.querySelector('[data-character-import-form]')?.addEventListener('submit',event=>{event.preventDefault();saveImportedCharacter(event.currentTarget,event.submitter?.value);});
  document.querySelectorAll('[data-character-import-open]').forEach(button=>button.onclick=()=>document.querySelector('#character-import-file')?.click());
  document.querySelectorAll('[data-character-import-clear]').forEach(button=>button.onclick=()=>{characterImportDraft=null;render();});
  document.querySelectorAll('[data-character-select]').forEach(button=>button.onclick=()=>{selectedCharacterId=button.dataset.characterSelect;characterEditorId=null;masteryEditorCharacterId=null;characterDetailTab='combat';uiPreferences={...uiPreferences,characterDetailTab};persistUiPreferences();render();});
  document.querySelectorAll('[data-character-detail-tab]').forEach(button=>button.onclick=()=>{characterDetailTab=button.dataset.characterDetailTab;uiPreferences={...uiPreferences,characterDetailTab};persistUiPreferences();render();});
  document.querySelectorAll('[data-character-edit]').forEach(button=>button.onclick=()=>{selectedCharacterId=button.dataset.characterEdit;characterEditorId=button.dataset.characterEdit;masteryEditorCharacterId=null;render();});
  document.querySelector('[data-character-edit-cancel]')?.addEventListener('click',()=>{characterEditorId=null;render();});
  document.querySelectorAll('[data-mastery-rest-edit]').forEach(button=>button.onclick=()=>{masteryEditorCharacterId=button.dataset.masteryRestEdit;characterDetailTab='actions';uiPreferences={...uiPreferences,characterDetailTab};persistUiPreferences();render();});
  document.querySelector('[data-mastery-rest-cancel]')?.addEventListener('click',()=>{masteryEditorCharacterId=null;render();});
  document.querySelector('[data-character-new]')?.addEventListener('click',()=>{captureManualCharacterDraft();characterEditorId=null;characterCreateMode='chooser';render();});
  document.querySelectorAll('[data-character-create-mode]').forEach(button=>button.onclick=()=>{captureManualCharacterDraft();const next=button.dataset.characterCreateMode;if(hasCreateDraft()&&(characterCreateMode==='import'||characterCreateMode==='manual')&&next!==characterCreateMode){characterCreatePendingMode=next;characterCreateDiscardMode=characterCreateMode;characterCreateMode='switch-confirm';}else characterCreateMode=next;render();});
  document.querySelectorAll('[data-character-create-switch-request]').forEach(button=>button.onclick=()=>{captureManualCharacterDraft();const next=button.dataset.characterCreateSwitchRequest;if(hasCreateDraft()){characterCreatePendingMode=next;characterCreateDiscardMode=characterCreateMode;characterCreateMode='switch-confirm';}else characterCreateMode=next;render();});
  document.querySelector('[data-character-create-back]')?.addEventListener('click',()=>{captureManualCharacterDraft();characterCreateMode='chooser';render();});
  document.querySelectorAll('[data-character-create-close-request]').forEach(button=>button.onclick=()=>{captureManualCharacterDraft();if(hasCreateDraft())characterCreateMode='close-confirm';else characterCreateMode=null;render();});
  document.querySelectorAll('[data-character-create-close]').forEach(button=>button.onclick=()=>{if(button.dataset.characterCreateClose==='discard'){characterImportDraft=null;characterManualDraft=null;}characterCreateMode=null;characterCreatePendingMode=null;characterCreateDiscardMode=null;render();});
  document.querySelectorAll('[data-character-create-switch]').forEach(button=>button.onclick=()=>{if(button.dataset.characterCreateSwitch==='discard'){if(characterCreateDiscardMode==='import')characterImportDraft=null;else characterManualDraft=null;}characterCreateMode=characterCreatePendingMode||'chooser';characterCreatePendingMode=null;characterCreateDiscardMode=null;render();});
  document.querySelectorAll('[data-character-create-continue]').forEach(button=>button.onclick=()=>{characterCreateMode=characterCreateDiscardMode||characterCreatePendingMode||'chooser';characterCreatePendingMode=null;characterCreateDiscardMode=null;render();});
  document.querySelectorAll('[data-m1-s4-fixture]').forEach(button=>button.onclick=()=>createM1S4Fixture(button.dataset.m1S4Fixture));
  document.querySelectorAll('[data-load-fixtures-request]').forEach(button=>button.onclick=requestFixtureLoad);
  document.querySelectorAll('[data-load-fixtures-confirm]').forEach(button=>button.onclick=()=>loadFixtureSession(button.dataset.loadFixturesConfirm==='export'));
  document.querySelectorAll('[data-load-fixtures-cancel]').forEach(button=>button.onclick=()=>{fixtureLoadConfirmation=false;render();});
  document.querySelectorAll('[data-character-project]').forEach(button=>button.onclick=()=>addCharacterProjection(button.dataset.characterProject));
  document.querySelectorAll('[data-linked-add]').forEach(button=>button.onclick=()=>{const editor=button.closest('[data-linked-editor]');button.insertAdjacentHTML('beforebegin',linkedEntityRowMarkup({},editor?.querySelectorAll('[data-linked-row]').length||0));});
  document.querySelectorAll('[data-linked-remove]').forEach(button=>button.onclick=()=>{const row=button.closest('[data-linked-row]');row?.remove();});
  document.querySelectorAll('[data-linked-materialize]').forEach(button=>button.onclick=()=>{const card=button.closest('[data-linked-card]');const choice=card?.querySelector('[data-linked-template-choice]')?.value||'';materializeLinkedEntity(button.dataset.linkedCharacter,button.dataset.linkedMaterialize,choice);});
  document.querySelectorAll('[data-controlled-materialize]').forEach(button=>button.onclick=()=>materializeControlledEntity(button.dataset.controlledCharacter,button.dataset.controlledMaterialize));
  document.querySelectorAll('[data-controlled-long-rest-form]').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();settleCharacterControlledEntities(event.currentTarget.dataset.controlledLongRestForm,event.currentTarget);}));
  document.querySelectorAll('[data-controlled-renewal-request]').forEach(button=>button.onclick=()=>requestControlledEntityRenewal(button.dataset.controlledCharacter,button.dataset.controlledRenewalRequest));
  document.querySelectorAll('[data-character-archive]').forEach(button=>button.onclick=()=>archiveCharacter(button.dataset.characterArchive));
  document.querySelectorAll('[data-character-restore]').forEach(button=>button.onclick=()=>restoreCharacter(button.dataset.characterRestore));
  document.querySelectorAll('[data-character-delete]').forEach(button=>button.onclick=()=>deleteCharacter(button.dataset.characterDelete));
  document.querySelector('[data-character-show-archived]')?.addEventListener('change',event=>{showArchivedCharacters=event.currentTarget.checked;uiPreferences={...uiPreferences,showArchivedCharacters};persistUiPreferences();render();});
  document.querySelectorAll('[data-post-diff-decision]').forEach(select=>select.onchange=()=>{const card=select.closest('[data-post-diff-card]'),id=select.dataset.postDiffDecision,entry=select.closest('[data-post-diff-entry]'),corrected=card.querySelector(`[data-post-diff-corrected="${id}"]`),reason=card.querySelector(`[data-post-diff-reason="${id}"]`),enabled=select.value==='correct';corrected.disabled=!enabled;reason.disabled=!enabled;clearPostCombatDiffError(entry);if(enabled)corrected.focus();});
  document.querySelectorAll('[data-post-diff-corrected],[data-post-diff-reason]').forEach(field=>field.addEventListener('input',()=>clearPostCombatDiffError(field.closest('[data-post-diff-entry]'))));
  document.querySelectorAll('[data-review-post-diff]').forEach(button=>button.onclick=()=>{const card=button.closest('[data-post-diff-card]');if(!validatePostCombatDiffCard(card))return;const decisions=[...card.querySelectorAll('[data-post-diff-decision]')].map(select=>({entryId:select.dataset.postDiffDecision,action:select.value,correctedValue:select.value==='correct'?Number(card.querySelector(`[data-post-diff-corrected="${select.dataset.postDiffDecision}"]`).value):undefined,reason:select.value==='correct'?card.querySelector(`[data-post-diff-reason="${select.dataset.postDiffDecision}"]`).value:''}));reviewPostCombatDiff(card.dataset.postDiffCard,decisions);});
  document.querySelectorAll('[data-abandon-post-diff]').forEach(button=>button.onclick=()=>abandonPostCombatDiffReview(button.closest('[data-post-diff-card]')?.dataset.postDiffCard));
  document.querySelector('[data-transform-template]')?.addEventListener('change',event=>{const select=event.currentTarget,input=select.form?.querySelector('[data-transform-name]'),next=`${select.selectedOptions[0]?.dataset.templateName||''}化${select.dataset.sourceName||''}`;if(!input)return;if(!input.value||input.value===input.dataset.suggestedName)input.value=next;input.dataset.suggestedName=next;});
  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{selectWorkspaceForDomain(b.dataset.tab);render();});
  document.querySelector('[data-v2-template-form]')?.addEventListener('submit',event=>{event.preventDefault();saveTemplate(event.currentTarget);});
  document.querySelectorAll('[data-v2-member-field]').forEach(field=>field.onchange=()=>updatePreparationMember(field.dataset.v2MemberId,field.dataset.v2MemberField,field.value));
  document.querySelectorAll('[data-v2-action]').forEach(button=>button.onclick=()=>{const action=button.dataset.v2Action,id=button.dataset.templateId||button.dataset.memberId;if(action==='new-template'){templateEditorId=null;selectWorkspaceForDomain('单位库');render();}if(action==='cancel-template'){templateEditorId=null;render();}if(action==='edit-template'){templateEditorId=id;render();}if(action==='variant-template')duplicateAsVariant(id);if(action==='archive-template')setTemplateArchived(id,button.dataset.archived==='true');if(action==='add-member')addEncounterMember(id);if(action==='remove-member')removePreparationMember(id);if(action==='draft-entry')draftEntryFromTemplate(entryTemplateById(id));if(action==='stage-entry')stageTemplateEntry(entryTemplateById(id));if(action==='open-library'){selectWorkspaceForDomain('单位库');persist();render();}if(action==='open-prep-map'){selectWorkspaceForDomain('地图');persist();render();}if(action==='open-preparation'){selectWorkspaceForDomain('战斗');persist();render();}if(action==='confirm-encounter')confirmEncounter();if(action==='abandon-preparation')abandonPreparation();});
  document.querySelectorAll('[data-v2-action="new-template"],[data-v2-action="cancel-template"],[data-v2-action="reset-template-color"]').forEach(button=>button.onclick=()=>{const form=document.querySelector('[data-v2-template-form]');if(button.dataset.v2Action==='new-template'){templateEditorId=null;templateEditorNew=true;selectWorkspaceForDomain('单位库');render();}if(button.dataset.v2Action==='cancel-template'){templateEditorId=null;templateEditorNew=false;render();}if(button.dataset.v2Action==='reset-template-color'&&form){const relation=form.querySelector('[name="relation"]'),mode=form.querySelector('[name="colorMode"]'),color=form.querySelector('[name="color"]');mode.value='relation';color.value=relationColor(relation.value);color.disabled=true;updateTemplatePreview(form);}});
  const editorForm=document.querySelector('[data-v2-template-form]');
  editorForm?.addEventListener('input',()=>updateTemplatePreview(editorForm));
  editorForm?.querySelector('[data-template-relation]')?.addEventListener('change',event=>{const mode=editorForm.querySelector('[name="colorMode"]'),color=editorForm.querySelector('[name="color"]');if(mode.value!=='custom')color.value=relationColor(event.currentTarget.value);updateTemplatePreview(editorForm);});
  editorForm?.querySelector('[data-template-color-mode]')?.addEventListener('change',event=>{const custom=event.currentTarget.value==='custom',color=editorForm.querySelector('[name="color"]');color.disabled=!custom;if(!custom)color.value=relationColor(editorForm.querySelector('[name="relation"]').value);updateTemplatePreview(editorForm);});
  document.querySelector('[data-entry-draft-form]')?.addEventListener('submit',event=>{event.preventDefault();confirmEntryDraft(event.currentTarget,event.submitter?.dataset.entryDraftAction==='stage'?'battle':'map');});
  document.querySelectorAll('[data-entry-placement-form]').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();const values=new FormData(event.currentTarget);updateEntryPlacementPosition(event.currentTarget.dataset.placementId,{x:Math.max(0,Math.floor(Number(values.get('x'))||0)),y:Math.max(0,Math.floor(Number(values.get('y'))||0))});}));
  document.querySelectorAll('[data-remove-entry-placement]').forEach(button=>button.onclick=()=>{const id=button.dataset.removeEntryPlacement,item=entryPlacementItems().find(entry=>entry.combatant.id===id);state.ui.entryPlacement.items=entryPlacementItems().filter(entry=>entry.combatant.id!==id);if(!state.ui.entryPlacement.items.length)state.ui.entryPlacement=null;message(item?.kind==='reentry'?'已从本次投入批次移除该再入场单位；原实例仍保持临时离场。':'已从本次投入批次移除该单位；未创建参战实例或事件。','warn');});
  document.querySelectorAll('[data-edit-entry-placement]').forEach(button=>button.onclick=()=>editStagedEntry(button.dataset.editEntryPlacement));
  document.querySelectorAll('[data-edit-reentry-placement]').forEach(button=>button.onclick=()=>editStagedReentry(button.dataset.editReentryPlacement));
  document.querySelectorAll('[data-roll-entry-initiative]').forEach(button=>button.onclick=()=>{const item=entryPlacementItems().find(entry=>entry.combatant.id===button.dataset.rollEntryInitiative);if(!item)return;const roll=Math.floor(Math.random()*20)+1,resolved=resolveInitiative({mode:'roll',modifier:item.initiativeModifier,roll});item.initiativeConfigured=true;item.initiativeRoll=resolved.roll;item.initiativeModifier=resolved.modifier;item.combatant.initiativeRoll=resolved.roll;item.combatant.initiativeModifier=resolved.modifier;item.combatant.initiativeMode='roll';item.combatant.initiative=resolved.total;message(`${displayName(item.combatant)} 的先攻为 ${resolved.total} = d20(${resolved.roll}) ${resolved.modifier>=0?'+':''}${resolved.modifier}。`);});
  document.querySelector('[data-entry-initiative-mode]')?.addEventListener('change',event=>{const input=event.currentTarget.form?.elements.initiative;if(input)input.disabled=event.currentTarget.value!=='manual';});
  document.querySelector('[data-reentry-draft-form]')?.addEventListener('submit',event=>{event.preventDefault();stageReentryDraft(event.currentTarget,event.submitter?.dataset.reentryDraftAction==='stage'?'battle':'map');});
  document.querySelector('[data-reentry-initiative-mode]')?.addEventListener('change',event=>{const input=event.currentTarget.form?.elements.initiative;if(input)input.disabled=event.currentTarget.value!=='manual';});
  document.querySelectorAll('[data-reserve-deploy]').forEach(button=>button.onclick=()=>draftReserveEntry(button.dataset.reserveDeploy));
  document.querySelectorAll('[data-lifecycle-leave]').forEach(button=>button.onclick=()=>temporarilyLeave(button.dataset.lifecycleLeave));
  document.querySelectorAll('[data-lifecycle-end]').forEach(button=>button.onclick=()=>endParticipation(button.dataset.lifecycleEnd));
  document.querySelectorAll('[data-lifecycle-reenter]').forEach(button=>button.onclick=()=>draftReentry(button.dataset.lifecycleReenter));
  document.querySelectorAll('[data-death-resolve]').forEach(button=>button.onclick=()=>openDeathResolution(button.dataset.deathResolve));
  document.querySelectorAll('[data-death-dm-revive]').forEach(button=>button.onclick=()=>dmExceptionRevive(button.dataset.deathDmRevive));
  document.querySelectorAll('[data-death-special]').forEach(button=>button.onclick=()=>openDeathResolution(button.dataset.deathSpecial,'transform'));
  document.querySelectorAll('[data-death-close]').forEach(button=>button.onclick=()=>closeDeathResolution());
  document.querySelector('[data-death-transform-form]')?.addEventListener('submit',event=>{event.preventDefault();submitTransformation(event.currentTarget,event.submitter?.dataset.transformAction==='map'?'map':'direct');});
  document.querySelectorAll('[data-v060-ruling-workspace]').forEach(workspace=>{
    const redraw=state=>{workspace.querySelector('[data-v060-ruling-content]').innerHTML=v060RulingContent(workspace.dataset.v060Outcome,state);};
    workspace.querySelector('[data-v060-spell-select]')?.addEventListener('change',()=>redraw(v060RulingState(workspace)));
    workspace.addEventListener('click',event=>{const button=event.target.closest('[data-v060-ruling-mode]');if(!button)return;const snapshot=v060RulingState(workspace);if(!snapshot.spell)return;snapshot.fields[button.dataset.v060RulingField]={...(snapshot.fields[button.dataset.v060RulingField]||{}),mode:button.dataset.v060RulingMode};redraw(snapshot);});
    workspace.addEventListener('input',()=>{const preview=workspace.querySelector('[data-v060-ruling-preview]');if(preview)preview.innerHTML=v060PreviewMarkup(v060RulingState(workspace));});
  });
  document.querySelectorAll('[data-pc-return-to-life-form]').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();confirmPcReturnToLife(event.currentTarget.dataset.pcReturnToLifeForm,event.currentTarget);}));
  document.querySelectorAll('[data-death-outcome]').forEach(button=>button.onclick=()=>{deathOutcomeChoice={combatantId:button.dataset.deathOutcomeSource,kind:button.dataset.deathOutcome,shape:null};render();});
  document.querySelectorAll('[data-v060-shape]').forEach(button=>button.onclick=()=>{deathOutcomeChoice={combatantId:button.dataset.v060ShapeSource,kind:'successor',shape:button.dataset.v060Shape};render();});
  document.querySelectorAll('[data-s2-successor-form]').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();beginS2SuccessorPlacement(event.currentTarget.dataset.s2SuccessorForm,event.currentTarget,event.currentTarget.dataset.s2Slice);}));
  document.querySelectorAll('[data-s2-undead-form]').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();beginS2ControlledUndeadPlacement(event.currentTarget.dataset.s2UndeadForm,event.currentTarget);}));
  document.querySelector('[data-s2-placement-confirm]')?.addEventListener('click',()=>confirmS2PlacementAt(s2PlacementDraft?.item.combatant.position));
  document.querySelectorAll('[data-controller-link-form]').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();updateS2ControllerLink(event.currentTarget.dataset.controllerLinkForm,event.currentTarget);}));
  document.querySelectorAll('[data-controlled-command-form]').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();issueControlledCommand(event.currentTarget.dataset.controlledCommandForm,event.currentTarget);}));
  document.querySelector('[data-s2-placement-cancel]')?.addEventListener('click',cancelS2Placement);
  document.querySelectorAll('[data-cleanup-token]').forEach(button=>button.onclick=()=>cleanupToken(button.dataset.cleanupToken));
  document.querySelectorAll('[data-create]').forEach(b=>b.onclick=()=>addCombatant(templates.find(t=>t.id===b.dataset.create),{x:Math.min(2,state.combatants.length),y:Math.min(2,state.combatants.length)}));
  document.querySelectorAll('[data-select]').forEach(b=>b.onclick=()=>{state.ui.selectedId=b.dataset.select;persist();render();});
  document.querySelectorAll('[data-select-card]').forEach(card=>{const select=()=>{state.ui.selectedId=card.dataset.selectCard;persist();render();};card.onclick=event=>{if(event.target.closest('button,input,label'))return;select();};card.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select();}};});
  document.querySelectorAll('[data-facing]').forEach(b=>b.onclick=()=>setFacingDraft(b.dataset.facing,b.dataset.facingValue));
  document.querySelectorAll('[data-facing-port]').forEach(b=>b.onclick=()=>setFacingPortDraft(b.dataset.facingPort,Number(b.dataset.portX),Number(b.dataset.portY)));
  document.querySelectorAll('[data-facing-correct]').forEach(b=>b.onclick=()=>correctFacing(b.dataset.facingCorrect,b.dataset.facingValue));
  document.querySelectorAll('[data-reference-action]').forEach(b=>b.onclick=()=>{state.ui.selectedId=b.dataset.referenceAction;state.ui.referenceAction={combatantId:b.dataset.referenceAction,name:b.dataset.referenceName,kind:b.dataset.referenceKind||'reference'};persist();render();});
  document.querySelectorAll('[data-legendary-action]').forEach(b=>b.onclick=()=>useLegendaryAction(b.dataset.legendaryAction,b.dataset.legendaryName));
  document.querySelectorAll('[data-tie-up]').forEach(b=>b.onclick=()=>moveTieItem(b.dataset.tieUp,b.dataset.tieId,-1));
  document.querySelectorAll('[data-tie-down]').forEach(b=>b.onclick=()=>moveTieItem(b.dataset.tieDown,b.dataset.tieId,1));
  document.querySelectorAll('[data-map-mode]').forEach(b=>b.onclick=()=>{state.settings.mapMode=b.dataset.mapMode;persist();render();});
  document.querySelectorAll('[data-map-focus]').forEach(button=>button.onclick=()=>{const viewport=document.querySelector('[data-map-viewport]');if(!viewport)return;if(button.dataset.mapFocus==='origin'){viewport.scrollTo({left:0,top:0,behavior:'smooth'});return;}const token=document.querySelector(`[data-token="${active()?.id}"]`);token?.scrollIntoView({block:'center',inline:'center',behavior:'smooth'});});
  document.querySelectorAll('[data-hp-damage]').forEach(b=>b.onclick=()=>{const amount=Number(document.querySelector(`[data-hp-input="${b.dataset.hpDamage}"]`)?.value),critical=!!document.querySelector(`[data-hp-critical="${b.dataset.hpDamage}"]`)?.checked;if(amount>0)changeHp(b.dataset.hpDamage,-amount,'DM 输入伤害',true,critical);else message('请输入正数伤害。','warn');});
  document.querySelectorAll('[data-hp-heal]').forEach(b=>b.onclick=()=>{const amount=Number(document.querySelector(`[data-hp-input="${b.dataset.hpHeal}"]`)?.value);if(amount>0)changeHp(b.dataset.hpHeal,amount,'DM 输入治疗');else message('请输入正数治疗。','warn');});
  document.querySelectorAll('[data-temp-hp]').forEach(b=>b.onclick=()=>setTempHp(b.dataset.tempHp,document.querySelector(`[data-temp-hp-input="${b.dataset.tempHp}"]`)?.value));
  document.querySelectorAll('[data-economy]').forEach(b=>b.onclick=()=>useEconomy(b.dataset.economy));
  document.querySelectorAll('[data-economy-restore]').forEach(b=>b.onclick=()=>restoreEconomy(b.dataset.economyRestore,b.dataset.economyField));
  document.querySelectorAll('[data-resource]').forEach(b=>b.onclick=()=>{const c=active(),key=b.dataset.resource,amount=Number(b.dataset.amount),payload={id:c?.id,key,amount};if(!c||!ordinaryActionsAllowed(c))return message('当前生命状态不能使用或恢复战斗资源。','warn');command('combatant.resource.changed',payload,()=>Object.assign(payload,applyCombatResourceChange(c,key,amount)),{reason:'战斗实例资源变化；不直接改写长期角色卡'});});
  document.querySelectorAll('[data-death-save-form]').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();submitDeathSave(form.dataset.deathSaveForm,new FormData(form).get('roll'));}));
  document.querySelectorAll('[data-death-save-roll]').forEach(button=>button.onclick=()=>rollDeathSave(button.dataset.deathSaveRoll));
  document.querySelectorAll('[data-medical-stabilize-form]').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();submitMedicalStabilization(form.dataset.medicalStabilizeForm,new FormData(form).get('checkTotal'));}));
  document.querySelectorAll('[data-life-correction-form]').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();submitLifeCorrection(form.dataset.lifeCorrectionForm,form);}));
  document.querySelectorAll('[data-pc-stand]').forEach(button=>button.onclick=()=>standSelectedPc(button.dataset.pcStand));
  document.querySelectorAll('[data-attack-outcome]').forEach(button=>button.onclick=()=>{const target=document.querySelector(`[data-attack-target="${button.dataset.attackId}"]`)?.value;recordAttackOutcome(button.dataset.attackCombatant,button.dataset.attackId,button.dataset.attackOutcome,target);});
  document.querySelectorAll('[data-mastery-apply]').forEach(button=>button.onclick=()=>decideMasteryCandidate(button.dataset.masteryApply,'apply'));
  document.querySelectorAll('[data-mastery-skip]').forEach(button=>button.onclick=()=>decideMasteryCandidate(button.dataset.masterySkip,'skip'));
  document.querySelectorAll('[data-resource]').forEach(button=>{const row=button.closest('.row'),focus=getCombatant(state.ui.selectedId)||active();if(!row||!focus||row.dataset.resourcePurpose)return;row.dataset.resourcePurpose='shown';const note=document.createElement('small');note.className='resource-purpose';note.textContent=`用途：${resourcePurpose(focus,button.dataset.resource)}`;row.append(note);});
  document.querySelectorAll('[data-range]').forEach(b=>b.onclick=()=>setRange(b.dataset.range));
  bindMapInteractions();
  document.querySelectorAll('[data-target]').forEach(box=>box.onchange=()=>{const r=state.ui.range;if(!r)return;const id=box.dataset.target;if(box.checked){r.manualRemove=r.manualRemove.filter(x=>x!==id);if(!rangeTargets(coveredCells(r)).some(c=>c.id===id)&&!r.manualAdd.includes(id))r.manualAdd.push(id);}else{r.manualAdd=r.manualAdd.filter(x=>x!==id);if(rangeTargets(coveredCells(r)).some(c=>c.id===id)&&!r.manualRemove.includes(id))r.manualRemove.push(id);}persist();render();});
  document.querySelector('#range-size')?.addEventListener('change',e=>{state.ui.range.size=Math.max(5,Number(e.target.value)||5);persist();render();});
  document.querySelector('#dark-rolls')?.addEventListener('change',e=>{state.settings.darkRolls=e.target.checked;persist();});
  document.querySelector('[data-dice-shortcut-preview]')?.addEventListener('click',()=>{
    const input=document.querySelector('#dice-shortcut'),output=document.querySelector('#dice-shortcut-result'),result=parseDiceShortcut(input?.value);
    if(!output)return;
    if(!result.ok){output.textContent=result.error;return;}
    output.innerHTML=`${result.ambiguous?'存在多个可能，请选择：':'识别结果：'} ${result.candidates.map(candidate=>`<button type="button" data-dice-shortcut-choice="${esc(candidate)}">${esc(candidate)}</button>`).join(' ')}`;
    output.querySelectorAll('[data-dice-shortcut-choice]').forEach(button=>button.onclick=()=>{const formula=document.querySelector('#dice-formula');if(formula)formula.value=button.dataset.diceShortcutChoice;output.textContent=`已写入骰式：${button.dataset.diceShortcutChoice}`;});
  });
  document.querySelector('[data-dice-history-top]')?.addEventListener('click',()=>document.querySelector('.dice-history')?.scrollTo({top:0,behavior:'smooth'}));
  document.querySelectorAll('[data-action]').forEach(button=>button.onclick=()=>{
    const action=button.dataset.action;
    if(action==='initiative')startInitiative();
    if(action==='confirm-initiative')confirmInitiative();
    if(action==='next')nextTurn();
    if(action==='end-combat')requestEndCombat();
    if(action==='undo')undoLast();
    if(action==='entry-placement-map'){selectWorkspaceForDomain('地图');persist();render();}
    if(action==='entry-placement-battle'){selectWorkspaceForDomain('战斗');persist();render();}
    if(action==='roll-pending-entry-initiatives')rollPendingEntryInitiatives();
    if(action==='remove-last-entry-placement'){const items=entryPlacementItems();if(!items.length)return;const removed=items[items.length-1];state.ui.entryPlacement={items:items.slice(0,-1)};if(!state.ui.entryPlacement.items.length)state.ui.entryPlacement=null;message(`已撤销暂存 ${displayName(removed.combatant)}；未创建参战实例或事件。`,'warn');}
    if(action==='confirm-entry-placement')confirmEntryPlacement();
    if(action==='cancel-entry-placement'){state.ui.entryPlacement=null;state.ui.selectedId=null;selectWorkspaceForDomain('战斗');message('已取消本次投入；新单位未创建参战实例，暂存再入场单位保持临时离场。','warn');}
    if(action==='condition'){const value=document.querySelector('#condition')?.value.trim(),c=active();if(value&&c)command('combatant.condition.added',{id:c.id,condition:value},()=>c.conditions.push(value));}
    if(action==='manual-effect'){
      const name=document.querySelector('#effect-manual-name')?.value.trim(),duration=Math.max(1,Number(document.querySelector('#effect-manual-duration')?.value)||1),concentration=!!document.querySelector('#effect-manual-concentration')?.checked,c=active();
      if(!name||!c)return message('请填写效果名称并确认当前行动者。','warn');
      if(!ordinaryActionsAllowed(c))return message('当前生命状态不能添加手动战斗效果。','warn');
      let result;
      command('effect.applied.manual',{targetId:c.id,name,duration,concentration},()=>{result=addOrRefreshEffect({kind:'buff',name,targetIds:[c.id],duration,concentration,sourceKind:'manual',sourceCombatantId:c.id});});
      message(`${result.refreshed?'已更新':'已添加'} ${name}，${effectEnds(result.effect)}。`);
    }
    if(action==='apply-range')applyRange();
    if(action==='cancel-range'){state.ui.range=null;persist();render();}
    if(action==='writeback')writeback();
    if(action==='save'){persist();message('已手动保存至此浏览器 localStorage。');}
    if(action==='export')exportJson();
    if(action==='import')document.querySelector('#import-file').click();
    if(action==='new'){if(pendingPostCombatDiffs().length)return message('仍有待审核的战后候选差异；完成审核后才能新建会话。','warn');if(confirm('新建会话会明确替换 v0.7.0 工作台当前存储值，但不会修改 v0.6.0 或更早存储键。继续？')){storageBlocked=false;state=normalizeV070Session(emptySession());persist();render();}}
    if(action==='roll')roll();
    if(action==='settings')command('settings.changed',{},()=>{state.name=document.querySelector('#session-name').value||'未命名遭遇';state.settings.width=Math.max(5,Math.min(40,Number(document.querySelector('#map-w').value)||24));state.settings.height=Math.max(5,Math.min(40,Number(document.querySelector('#map-h').value)||18));state.settings.diagonalRule=document.querySelector('#diagonal').value;});
  });
  document.querySelectorAll('[data-end-combat-confirm]').forEach(button=>button.onclick=()=>confirmEndCombat(button.dataset.endCombatConfirm==='save'));
  document.querySelectorAll('[data-end-combat-cancel]').forEach(button=>button.onclick=()=>{state.ui.endCombatConfirm=null;persist();render();});
  document.querySelectorAll('[data-action="cancel-entry-draft"]').forEach(button=>button.onclick=()=>{const draft=state.ui.entryDraft;if(draft?.stagedItem)state.ui.entryPlacement={items:[...entryPlacementItems(),draft.stagedItem]};state.ui.entryDraft=null;message(draft?.stagedItem?'已保留原待入场单位；未应用本次编辑。':'已放弃当前加入草稿。','warn');});
  document.querySelectorAll('[data-action="cancel-reentry-draft"]').forEach(button=>button.onclick=()=>{state.ui.reentryDraft=null;persist();render();});
  document.querySelectorAll('[data-action="initiative"]').forEach(button=>button.onclick=()=>{if(state.turn.started)message('先攻已经开始；中途加入请使用单位库、角色栏或场外预备入口。','warn');else startInitiative();});
  document.querySelectorAll('[data-action="cleanup-enemies"]').forEach(button=>button.onclick=()=>cleanupEnemies());
  document.querySelectorAll('[data-action="finish-cleanup"]').forEach(button=>button.onclick=()=>{if(pendingPostCombatDiffs().length)return message('仍有待审核的战后候选差异；请先在角色页逐项确认或全部拒绝。','warn');state=emptySession();persist();render();});
  document.querySelector('#import-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const candidate=validateEnvelope(JSON.parse(await file.text()));state=normalizeV070Session(candidate.session);storageBlocked=false;persist();message('导入成功：已恢复会话、PC 生命状态与事件日志；仅写入 v0.7.0 工作台新键。');}catch(err){message(err.message,'error');}e.target.value='';};
  document.querySelector('#character-import-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;message('正在以受控 Profile 读取 Excel；不会执行公式、宏、脚本或外链。');characterImportDraft=await parseBeilingXlsxFile(file);e.target.value='';render();};
  bindBattleWorkbench();
}
function bindBattleWorkbench(shell = document){
  const wb = shell.querySelector?.('[data-battle-workbench]');
  if (!wb) return;
  document.documentElement.dataset.theme = uiPreferences.theme || 'dark';
  bindBattleWorkbenchInteractions(shell, {
    onSubModeChange: nextMode => {
      uiPreferences = { ...uiPreferences, workbenchSubMode: nextMode };
      persistUiPreferences();
      render();
    },
    onThemeChange: nextTheme => {
      uiPreferences = { ...uiPreferences, theme: nextTheme };
      document.documentElement.dataset.theme = nextTheme;
      persistUiPreferences();
      render();
    },
    onCollapseChange: (side, collapsed) => {
      if (side === 'left') uiPreferences = { ...uiPreferences, workbenchLeftCollapsed: collapsed };
      if (side === 'right') uiPreferences = { ...uiPreferences, workbenchRightCollapsed: collapsed };
      persistUiPreferences();
      render();
    },
    onDiceDockToggle: () => {
      uiPreferences = { ...uiPreferences, workbenchDiceDockOpen: !uiPreferences.workbenchDiceDockOpen };
      persistUiPreferences();
      render();
    },
    onDiceRoll: (formula, mode, darkRoll) => {
      rollWorkbenchDice(formula, mode, darkRoll);
    },
    onZoomChange: (action, value) => {
      let current = uiPreferences.workbenchZoom || 1.0;
      if (action === 'in') current = Math.min(2.5, current + 0.15);
      else if (action === 'out') current = Math.max(0.5, current - 0.15);
      else if (action === 'reset') current = 1.0;
      else if (action === 'fit') {
        state.settings.mapMode = 'fit';
        current = 1.0;
        persist();
      }
      else if (action === 'delta') current = Math.max(0.5, Math.min(2.5, current + value));
      uiPreferences = { ...uiPreferences, workbenchZoom: Math.round(current * 100) / 100 };
      persistUiPreferences();
      const vp = document.querySelector('[data-map-viewport]');
      if (vp) vp.style.setProperty('--map-scale', uiPreferences.workbenchZoom);
      const label = document.querySelector('[data-map-zoom-label]');
      if (label) label.textContent = `${Math.round(uiPreferences.workbenchZoom * 100)}%`;
    }
  });
}
function libraryViewV2(){
  const editing=templateEditorId?templateById(templateEditorId):null;
  if(templateEditorId&&!editing){templateEditorId=null;templateEditorNew=false;}
  const preparing=state.encounter?.phase==='preparation',joining=state.turn.started&&!combatEnded();
  if(templateEditorId||templateEditorNew)return `<section class="panel"><div class="card">${templateForm(editing)}</div></section>`;
  const rows=templateLibrary.map(t=>{
    const type=t.sourceType==='reference'?'参考':t.sourceType==='variant'?'变体':'自定义';
    const source=`${t.sourceType==='reference'?(t.sourcePath||'本地私有证据'):t.sourceType==='variant'?`基于 ${t.baseTemplateId||'模板'}`:'DM 自定义'} · UnitTemplate ID: ${t.id}`;
    const actions=(t.actions||[]).map(a=>typeof a==='string'?a:a.name).join('、')||'—';
    return `<tr class="${t.archived?'archived':''}"><td><span class="color-swatch" style="background:${esc(templateColor(t))}"></span><b>${esc(t.name)}</b> <span class="pill">${type}</span><br/><small>${esc(t.kind)} · ${esc(t.alignment||'未标注')}</small></td><td>AC ${t.armorClass} · HP ${t.maxHp} · 速度 ${t.speed}<br/>${t.footprint.join('×')} 占位 · 动作 ${esc(actions)}</td><td><small>${esc(source)}</small>${t.archived?'<br/><span class="pill">已归档</span>':''}</td><td><div class="row">${!t.archived&&preparing?`<button data-v2-action="add-member" data-template-id="${t.id}">加入遭遇</button>`:''}${!t.archived&&joining?`<button class="primary" data-v2-action="stage-entry" data-template-id="${t.id}">加入待入场</button>`:''}${!t.archived?`<button data-v2-action="variant-template" data-template-id="${t.id}">复制为变体</button>`:''}${t.sourceType!=='reference'?`<button data-v2-action="edit-template" data-template-id="${t.id}">编辑</button>`:''}<button data-v2-action="archive-template" data-template-id="${t.id}" data-archived="${t.archived?'false':'true'}">${t.archived?'恢复':'归档'}</button></div></td></tr>`;
  }).join('');
  return `<section class="panel two"><div class="card"><div class="row"><h2>单位模板库</h2><button class="primary" data-v2-action="new-template">新建自定义单位</button></div><p class="muted density-standard-only">这里仅放怪物、NPC 和 DM 自定义/变体单位；15 级角色预设已回到“角色”页。战斗中可连续加入待入场批次，之后再统一编辑和摆放。</p><p class="muted density-compact-only">怪物、NPC 与 DM 自定义／变体模板。</p>${joining?entryBatchStatus():''}<table class="table"><thead><tr><th>模板</th><th>字段</th><th>来源 / 状态</th><th>操作</th></tr></thead><tbody>${rows}</tbody></table></div><div class="card"><h2>边界</h2><p>单位库是长期 UnitTemplate 数据；第 0 回合成员与 CombatantInstance 都保留创建时的模板快照。战斗内 HP、状态、资源不会回写模板。</p><p class="muted density-standard-only">参考字段仅限本地私有验证，翻译、出版身份与再分发授权未知。</p></div></section>`;
}
globalThis.addEventListener?.('hashchange',()=>{
  const workspace=workspaceFromHash(globalThis.location?.hash);
  if(workspace&&workspace!==currentWorkspaceId())setWorkspace(workspace,{updateHash:false});
});
render();
