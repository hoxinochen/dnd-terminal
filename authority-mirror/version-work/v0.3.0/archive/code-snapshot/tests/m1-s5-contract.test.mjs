import assert from 'node:assert/strict';
import { createEncounterMember, legacyNpcPresets, materializeCombatant } from '../src/encounter.js';
import {
  abandonPostCombatDiff,
  applyCombatInventoryBalanceChange,
  applyPostCombatDecisions,
  buildPostCombatDiff,
  createCharacterRecord,
  createCharacterSheet,
  createCombatProjection,
  createEncounterMemberFromProjection,
  createLinkedEntityProjection,
  currentCharacterSheet,
  M1_S5_RULES,
  M1_S5_WEAPON_MASTERY_CATALOG,
  reviseWeaponMasterySelections,
  weaponMasteryEligibleAttacks,
} from '../src/characters.js';

let sequence = 0;
const id = () => `m1-s5-${++sequence}`;
const timestamp = () => '2026-08-21T12:00:00.000Z';

const sheet = createCharacterSheet({
  name:'莉亚 M1-S5 合同验证', ruleVersion:'2024', hp:{current:20,max:20}, speed:30,
  equipment:[{id:'arrows',name:'箭矢',quantity:20,consumable:true,itemKind:'gear',sourceStatus:'imported-needs-review'}],
  attackProfiles:[
    {id:'shortbow',name:'短弓',weaponKind:'短弓',weaponId:'phb2024:shortbow',masteryPropertyId:'phb2024:vex',masteryEnabled:true,proficient:true,sourceStatus:'dm-confirmed'},
    {id:'dagger',name:'匕首',weaponKind:'匕首',masteryEnabled:false,proficient:true,sourceStatus:'dm-confirmed'},
  ],
  weaponMastery:{status:'dm-confirmed',grants:[{id:'rogue-mastery'}],selectionLimit:2,changeTiming:'finish-long-rest',selections:[{id:'lia-shortbow',weaponKind:'短弓',weaponId:'phb2024:shortbow',masteryPropertyId:'phb2024:vex'}],note:'DM confirmed'},
  linkedEntities:[{id:'familiar',name:'验证魔宠',kind:'familiar',relation:'ally',templateRef:{templateId:'preset-scout',templateRevision:1}}],
}, {id,timestamp});
assert.equal(sheet.schemaVersion, '0.3.0-m1-s5');
assert.equal(sheet.attackProfiles[0].masteryPropertyId, 'phb2024:vex');
assert.equal(sheet.linkedEntities[0].templateRef.templateId, 'preset-scout');
assert.equal(M1_S5_WEAPON_MASTERY_CATALOG['短弓'].effect.includes('下一次攻击检定具有优势'),true,'Vex 的关键收益必须进入常驻展示合同');
assert.deepEqual(weaponMasteryEligibleAttacks(sheet).map(attack=>attack.weaponId),['phb2024:shortbow','phb2024:dagger']);

const restRecord=createCharacterRecord(sheet);
const restRevision=reviseWeaponMasterySelections(restRecord,['phb2024:dagger'],{timestamp,reason:'长休结束后由玩家选择匕首，DM 确认。'});
const restSheet=currentCharacterSheet(restRevision.record);
assert.equal(restSheet.revision,2);
assert.deepEqual(restSheet.weaponMastery.selections.map(selection=>[selection.weaponId,selection.masteryPropertyId]),[['phb2024:dagger','phb2024:nick']]);
assert.equal(restSheet.attackProfiles.find(attack=>attack.weaponKind==='匕首').masteryEnabled,true);
assert.equal(restSheet.attackProfiles.find(attack=>attack.weaponKind==='短弓').masteryEnabled,false);
assert.equal(currentCharacterSheet(restRecord).weaponMastery.selections[0].weaponId,'phb2024:shortbow','长休选择不能原地覆盖历史修订');
assert.throws(()=>reviseWeaponMasterySelections(restRecord,[],{timestamp,reason:'DM 确认'}),/至少选择一种/);
assert.throws(()=>reviseWeaponMasterySelections(restRecord,['phb2024:dagger'],{timestamp,reason:''}),/必须填写 DM 确认说明/);

const projection = createCombatProjection(sheet,{id,timestamp});
assert.deepEqual(projection.inventoryBalances.map(item=>[item.itemId,item.current]), [['arrows',20]]);
const member = createEncounterMemberFromProjection(projection,{id});
const combatant = materializeCombatant(member,id());
const changed = applyCombatInventoryBalanceChange(combatant,'inventory:arrows',-3);
assert.deepEqual({before:changed.before,after:changed.after},{before:20,after:17});
assert.equal(projection.inventoryBalances[0].current,20,'combat inventory is isolated from the projection');

const diff = buildPostCombatDiff(projection,combatant,{id,timestamp});
assert.equal(diff.entries[0].kind,'inventory');
const abandoned = abandonPostCombatDiff(diff,{timestamp,reason:'同一长期角色已有另一份候选先完成写回'});
assert.equal(abandoned.status,'abandoned');
assert.equal(abandoned.entries[0].status,'abandoned');
assert.equal(diff.status,'pending','废除返回独立副本，不改写原候选');
assert.throws(()=>abandonPostCombatDiff(abandoned,{timestamp,reason:'重复废除'}),/只能废除仍待审核/);
const record = createCharacterRecord(sheet);
const written = applyPostCombatDecisions(record,diff,[{entryId:diff.entries[0].id,action:'correct',correctedValue:18,reason:'DM recovered two arrows'}],{timestamp});
assert.equal(currentCharacterSheet(written.record).equipment[0].quantity,18);
assert.equal(currentCharacterSheet(record).equipment[0].quantity,20,'old revision is immutable');
assert.throws(()=>applyPostCombatDecisions(record,diff,[{entryId:diff.entries[0].id,action:'correct',correctedValue:18,reason:''}],{timestamp}),/修正必须填写/);

const linkedTemplate = legacyNpcPresets.find(template=>template.id==='preset-scout');
assert.ok(linkedTemplate, '运行时单位库必须提供可引用的斥候模板');
const linked = createLinkedEntityProjection(projection,sheet.linkedEntities[0],linkedTemplate,{id,timestamp});
assert.equal(linked.sourceCombatProjectionId,projection.projectionId);
assert.equal(linked.linkedEntityRef.id,'familiar');
assert.equal(linked.unitTemplateRef.templateId,'preset-scout');
const linkedMember = createEncounterMember(linkedTemplate,id(),{x:1,y:1});
linkedMember.linkedEntityProjection = linked;
assert.equal(typeof linkedMember.id,'string');
assert.doesNotThrow(()=>structuredClone({encounter:{members:[linkedMember]},linkedEntityProjections:[linked]}));
assert.equal(M1_S5_RULES.masteryProperties,'local-markdown-anchor:Lore_01_核心玩家规则.md#精通词条-Nick-Vex');
console.log('m1-s5-contract.test.mjs: pass');
