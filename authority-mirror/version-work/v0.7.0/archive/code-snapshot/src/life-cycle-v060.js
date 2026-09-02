import {
  V050_STORAGE_KEY,
  chooseV050StartupSession,
  normalizeV050Session,
  validateV050Envelope,
} from './life-cycle-v050.js';

export const V060_SESSION_SCHEMA_VERSION = '0.5.0';
export const V060_DELIVERY_VERSION = '0.6.0';
export const V060_STORAGE_KEY = 'dnd-terminal.v0.6.0.death-outcomes.session.current';

const field = (id, label, suggested, modes='standard') => ({ id, label, suggested, modes });
export const V060_RULING_MODES = Object.freeze({
  standard:Object.freeze([
    { id:'adopt', label:'采用建议' }, { id:'override', label:'DM 改判', needsValue:true },
    { id:'untracked', label:'不追踪' }, { id:'unknown', label:'未知' },
  ]),
  material:Object.freeze([
    { id:'adopt', label:'采用建议' }, { id:'dm-confirmed', label:'DM 确认已消耗' },
    { id:'untracked', label:'不追踪' }, { id:'custom', label:'自定义处理', needsValue:true },
  ]),
});

export const V060_SPELLS = Object.freeze([
  { id:'revivify', name:'回生术', outcomes:['restore'], meta:'3 环｜动作｜触碰', summary:'死亡未超过 1 分钟；消耗 300GP 钻石；以 1 HP 回生。', rulingFields:[field('death-window','死亡时间','1 分钟内'),field('material','材料','300GP 钻石，消耗','material'),field('old-age','老死','不能复活老死者'),field('body-repair','身体部位','不恢复缺失部位')] },
  { id:'raise-dead', name:'死者复活', outcomes:['restore'], meta:'5 环｜1 小时｜触碰', summary:'死亡未超过 10 日；消耗 500GP 钻石；以 1 HP 回生。', rulingFields:[field('death-window','死亡时间','10 日内'),field('material','材料','500GP 钻石，消耗','material'),field('undead-at-death','死亡时是否不死生物','不是不死生物'),field('body-parts','关键身体部位','未缺失生存所必需部位'),field('aftereffect','复活后影响','D20 -4；每次长休由 DM 记录变化')] },
  { id:'resurrection', name:'复生术', outcomes:['restore'], meta:'7 环｜1 小时｜触碰', summary:'死亡未超过 100 年；消耗 1000GP 钻石；以满 HP 回生。', rulingFields:[field('death-window','死亡时间','100 年内'),field('material','材料','1000GP 钻石，消耗','material'),field('old-age','老死','不是老死'),field('undead-at-death','死亡时是否不死生物','不是不死生物'),field('aftereffect','复活后影响','D20 -4；每次长休由 DM 记录变化')] },
  { id:'true-resurrection', name:'完全复生术', outcomes:['restore','successor'], meta:'9 环｜1 小时｜触碰', summary:'死亡未超过 200 年；消耗 25000GP 钻石；以满 HP 回生。', rulingFields:[field('death-window','死亡时间','200 年内'),field('material','材料','25000GP 钻石，消耗','material'),field('old-age','老死','不是老死'),field('body-repair','伤口与身体部位','恢复所有伤口、器官和肢体'),field('cleanse','毒素、魔法疫病与诅咒','中和或移除')] },
  { id:'reincarnate', name:'转生术', outcomes:['successor'], meta:'5 环｜1 小时｜触碰', summary:'类人生物遗体或部分；死亡未超过 10 日；创造新成年身体。', rulingFields:[field('corpse','遗体条件','类人生物遗体或部分'),field('death-window','死亡时间','10 日内'),field('material','材料','1000GP 珍稀油，消耗','material'),field('new-ancestry','新种族','DM 指定、手动骰表结果或不记录'),field('traits','种族特质','以新种族特质替换')] },
  { id:'clone', name:'克隆术', outcomes:['successor'], meta:'8 环｜1 小时｜触碰', summary:'DM 确认克隆体可用；不追踪 120 日准备。', rulingFields:[field('clone-ready','克隆体可用性','DM 确认现在可用'),field('material','材料','1000GP 钻石与 2000GP 容器','material'),field('age-version','年龄版本','与原本相同或更年轻'),field('soul','灵魂','自由且愿意归来'),field('equipment','装备','不继承原本随身装备')] },
  { id:'animate-dead', name:'活化死尸', outcomes:['controlled'], meta:'3 环｜1 分钟｜10 尺', summary:'中小型类人遗骨或遗体；建议骷髅或丧尸；命令距离 60 尺。', rulingFields:[field('remains','遗骨或遗体','遗骨为骷髅；遗体为丧尸'),field('material','材料','血、肉与骨灰','material'),field('template','Template','骷髅或丧尸'),field('count','数量与升环','DM 确认数量/升环'),field('command','命令与期限','60 尺；DM 管理，不自动计时')] },
  { id:'create-undead', name:'唤起亡灵', outcomes:['controlled'], meta:'6 环｜1 分钟｜10 尺', summary:'夜晚；至多三具中小型类人尸体；建议食尸鬼；命令距离 120 尺。', rulingFields:[field('night','施法时机','夜晚'),field('corpses','尸体与数量','至多三具中小型类人尸体'),field('material','材料','每具尸体 150GP 缟玛瑙','material'),field('template','Template 与升环','食尸鬼；DM 确认升环选择'),field('command','命令与期限','120 尺；DM 管理，不自动计时')] },
]);

export const V060_GENTLE_REPOSE = Object.freeze({ id:'gentle-repose', name:'遗体防腐', meta:'2 环｜动作或仪式｜触碰', summary:'辅助尸体记录；建议 10 日，不自动计算期限，不阻止 DM 裁定。', rulingFields:[field('duration','生效区间','10 日'),field('undead-block','不死生物转化','持续期间不能转化'),field('resurrection-window','复活期限','受术时间不计入相关期限')] });

const copy = value => globalThis.structuredClone ? globalThis.structuredClone(value) : JSON.parse(JSON.stringify(value));

export function spellForV060(outcome, id) {
  if (id === 'custom') return { id:'custom', name:'自定义依据', outcomes:[outcome], meta:'DM 裁定', summary:'DM 自定义依据；不表示规则合法性。', rulingFields:[] };
  const spell = V060_SPELLS.find(item => item.id === id);
  if (!spell || !spell.outcomes.includes(outcome)) throw new Error('所选法术不适用于当前死亡后结果。');
  return spell;
}

export function spellsForV060(outcome) {
  return V060_SPELLS.filter(spell => spell.outcomes.includes(outcome));
}

export function normalizeV060Session(session, { legacy = false } = {}) {
  const next = normalizeV050Session(session, { legacy });
  next.schemaVersion = V060_SESSION_SCHEMA_VERSION;
  next.ui = { ...(next.ui || {}), startupRecoveryRequired:false };
  return next;
}

export function createV060Envelope(session, { exportedAt } = {}) {
  const normalized = normalizeV060Session(session);
  return {
    schemaVersion: V060_SESSION_SCHEMA_VERSION,
    appVersion: V060_SESSION_SCHEMA_VERSION,
    deliveryVersion: V060_DELIVERY_VERSION,
    exportedAt,
    session: normalized,
    checksum: `events:${Array.isArray(normalized.events) ? normalized.events.length : 0}`,
  };
}

export function validateV060Envelope(data, id, timestamp) {
  if (data?.schemaVersion === V060_SESSION_SCHEMA_VERSION || data?.session?.schemaVersion === V060_SESSION_SCHEMA_VERSION) {
    if (!data?.session || !Array.isArray(data.session.events)) throw new Error('导入失败：缺少完整的 v0.6.0 会话 Envelope 或事件日志。');
    const eventIds = data.session.events.map(event => event?.id).filter(Boolean);
    if (new Set(eventIds).size !== eventIds.length) throw new Error('导入失败：事件 ID 重复，不能安全恢复。');
    validateV050Envelope({ ...copy(data), schemaVersion:'0.4.1', appVersion:'0.4.1', deliveryVersion:'0.5.0', session:{ ...copy(data.session), schemaVersion:'0.4.1' } }, id, timestamp);
    return { ...copy(data), schemaVersion:V060_SESSION_SCHEMA_VERSION, appVersion:V060_SESSION_SCHEMA_VERSION, deliveryVersion:data.deliveryVersion || V060_DELIVERY_VERSION, session:normalizeV060Session(data.session) };
  }
  const prior = validateV050Envelope(data, id, timestamp);
  return {
    ...prior,
    schemaVersion:V060_SESSION_SCHEMA_VERSION,
    appVersion:V060_SESSION_SCHEMA_VERSION,
    deliveryVersion:V060_DELIVERY_VERSION,
    migratedFromSchemaVersion:prior.schemaVersion,
    session:normalizeV060Session(prior.session, { legacy:true }),
  };
}

export function chooseV060StartupSession(storage, id, timestamp) {
  const currentRaw = storage.getItem(V060_STORAGE_KEY);
  if (currentRaw !== null) {
    try { return { kind:'current', session:validateV060Envelope(JSON.parse(currentRaw), id, timestamp).session, shouldPersist:false }; }
    catch (error) { return { kind:'blocked-corrupt-current', error, raw:currentRaw, session:null, shouldPersist:false }; }
  }
  const prior = chooseV050StartupSession(storage, id, timestamp);
  if (!prior.session) return prior;
  return { ...prior, kind:'migrated-legacy-copy', sourceKey:prior.sourceKey || V050_STORAGE_KEY, session:normalizeV060Session(prior.session, { legacy:true }), shouldPersist:true };
}
