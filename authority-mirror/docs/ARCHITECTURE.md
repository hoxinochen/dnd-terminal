# Architecture

- **Status：** v0.3.0 Archived — Local Private；v0.3.1 Archived — Local Private；v0.4.0 Archived — Local Private
- **Applies To：** 当前 Workspace；v0.4.0 原 S1 与 Amendment 01 已通过 User Human Acceptance，Review、Local Private Release 与 Lightweight Archive 已获 User 批准并完成；历史冻结事实按各版本记录保留
- **Authority：** Approved ABC after user approval; implementation facts after Implementation and Review
- **Documentation Root：** `/Users/chenzehao/Vaults/obsidian/obisidian/理工学习相关/DND Terminal`
- **Implementation Root：** `/Users/chenzehao/Projects/DND Terminal`

当前已在 Workspace 实现零依赖浏览器单页：单一内存 `CombatSession`、`localStorage` Envelope、顺序事件、紧凑恢复检查点、固定验证库、行动轮、二维方格、范围预览、DM 目标覆写、JSON 导入导出，以及长期角色卡、修订、受控 Excel `CharacterDraft`、多施法来源、资源池、战斗投影、关联单位独立棋子、DM 确认的 Vex 候选/效果和战后逐项审核回写。Amendment 2 进一步加入角色归档生命周期、字段级防呆、过期候选阻断与可审计废除终态。上述实现已通过相应测试、User Human Acceptance、Independent Review 与 User 授权的 Local Private Release；规则、发布和 Archive 边界仍按各 Authority 记录严格限制。

文档与实现使用双根目录：治理与交付文档只在 Documentation Root；源码、测试源码、依赖与构建配置只在 Implementation Root。两者通过版本身份、Workspace 相对路径和哈希建立证据引用，不复制内容。

### v0.3.1 版本身份与 Envelope 兼容事实

- `Delivery Version` 为 `0.3.1`，与稳定的 `Session Envelope Schema = 0.2.0`、`CharacterSheet Schema = 0.3.0-m1-s5` 分开表达。
- 手动 JSON 导出以既有 `schemaVersion`/`appVersion` 保持 Session 兼容，并附加可选 `deliveryVersion` 作为来源元数据；导入仍只按 Session Schema 校验，未知未来 Schema 安全拒绝。
- 浏览器自动保存继续使用既有 Envelope 形状和现有 localStorage key，不写入 `deliveryVersion`，不迁移、复制或删除用户数据。

### v0.4.0 已实施架构（Released — Local Private）

User 于 `2026-08-25` 已批准 PC `0 HP`、死亡豁免与稳定状态 ABC；交付采用一个 `v0.4.0-S1`，最低迁移保护、针对性测试和不阻塞的展示修复不再拆成独立 Slice。唯一 Approved/Frozen 合同见 `version-work/v0.4.0/ABC.md`。

实现新增纯领域模块 `src/life-cycle-v040.js`，由它统一负责 PC `active | dying | stable | dead | needs-review` 生命阶段、独立的 `unconscious`/`prone` 条件、死亡豁免计数与轨迹、`0 HP` 受伤、医疗稳定、正 HP 治疗、DM 修正、Session Schema `0.3.0` 校验和旧会话迁移。`CombatantInstance` 仍是单场生命状态 Authority；长期 `CharacterSheet` Schema 保持 `0.3.0-m1-s5`，战后差异不会写入死亡豁免或单场生命状态。

浏览器自动保存只写 `dnd-terminal.v0.4.0.session.current`。首次缺少新 key 时从 v0.3.1/v0.2 旧 key 读取副本，完整校验后才写新 key；旧 key 不移动、不删除、不覆盖。损坏的新 key 会阻断自动保存和旧键回退，页面要求用户明确导入或新建。导出使用 `schemaVersion/appVersion = 0.3.0` 与 `deliveryVersion = 0.4.0`。

`unconscious` PC 保留先攻位置并在回合开始显示强制死亡豁免；普通动作、附赠动作、反应、移动、攻击、法术、资源和手工效果均被命令层阻断。`stable/dead/needs-review` 不取得普通回合。所有 v0.4.0 生命变化追加顺序事件并接入当前页面补偿撤销；持久化压缩仍删除完整 `before` 检查点，因此刷新后 UI 明确提示旧事件不可撤销，不伪造状态。

## 设计理由

核心设计采用“命令产生事件、事件归并状态、Snapshot 加速恢复”的单会话模型，因为它同时满足跨标签页同步、撤销、人工修正、刷新恢复与完整复盘。

替代方案：

- 各页面各自保存副本：容易互相覆盖，拒绝。
- 只保存最终 Snapshot：无法解释人工修正与撤销，拒绝。
- 纯 Event Sourcing 且不保存 Snapshot：可重建但首版恢复与迁移成本更高，暂不采用。

## Authority 分层

```text
Template / Character Sheet Authority
        ↓ create or snapshot
Combat Session Initial State
        ↓ validated command
Append-only Event Log
        ↓ deterministic reducer
Combat Session Snapshot
        ↓ selectors
Tabs / Map / Readable Log
        ↓ end-of-combat diff
DM-approved Character Writeback Event
```

### 模板与长期状态

- `UnitTemplate`：怪物/NPC/角色创建模板；可版本化，不能承载单场 HP、位置或资源消耗。
- `CharacterSheet`：玩家角色长期状态；战斗期间只读。
- 创建战斗实例时，把必要规则与长期值复制为 `templateSnapshot`，避免模板后来改变导致旧战斗不可恢复。

### M1-S2 至 M1-S5 长期角色卡、导入、施法与战斗接入事实

- 长期角色库使用独立的 `dnd-terminal.v0.3.0.character-records` localStorage 提交面，不接管 v0.2.0 `CombatSession` Envelope；载入旧 M1-S1 卡时只追加缺失结构，原 HP、AC、速度、先攻、资源、备注和修订历史保持。
- `CharacterSheet` 当前包含身份/起源、`classes[]`、六项属性、豁免/技能结果、特性、战斗快捷条、资源、`AttackProfile[]`、独立动作、轻量装备/容器、`LinkedEntity[]`、显式武器精通状态，以及 `SpellcastingProfile[]`、`SpellResourcePool[]`、法术状态和 `CastingOption[]`。多职业计算、法术取得资格与规则合法性仍不自动推导。
- 豁免与技能使用 `proficiencyRank = none | proficient | expertise | unknown`，并可保留导入标识、结果值、来源位置和审核状态；技能 Expertise 与 Weapon Mastery 是两个独立概念。
- Excel 可见特性按 class/subclass、species、feat、fighting-style、special 分类保存为展示事实；描述文本不直接成为自动规则。装备统一保留物品类型、数量、容器和受限来源，背包财务账本不进入角色装备模型。
- AC、先攻调整值、熟练加值和被动察觉使用 `inputs → calculatedValue → overrideValue → effectiveValue → overrideReason` 审计对象。当前手工入口没有足够的已准入规则输入，因此用户输入保存为带理由的 `needs-review` 覆写，不伪装为自动计算。
- 编辑通过 `reviseCharacterRecord()` 创建 revision N+1；旧修订保留。修订差异按业务字段显示，派生审计内部变化不重复污染人类摘要，但完整审计仍保存在每个修订中。
- 角色详情以本地 UI 状态切换八个区域：战斗概览、检定与熟练、动作与能力、法术、装备、起源与经历、关联单位、导入与修订；非施法角色动态隐藏法术页签，但不删除底层空集合。该页只展示长期卡事实和审计，不以 UI 切换写入战斗事件或改变投影/实例边界。
- `AttackProfile`、动作、装备、武器精通显式状态和关联关系随 `CombatProjection → EncounterMember → CombatantInstance` 深复制；战斗页显示攻击快照并由 DM 确认攻击结果。只有已准入且已选择的 Vex 可生成待决定候选；应用后建立有来源与到期条件的提醒效果，不自动掷骰、裁定命中/伤害或结算优势。
- `LinkedEntity` 可由长期卡显式绑定或由 DM 为本场选择 UnitTemplate；进入第 0 回合后形成独立 `LinkedEntityProjection → EncounterMember → CombatantInstance`、棋子、HP 与行动轮，不得把关联单位的战斗状态嵌回角色本体。
- 战斗消费仍只改变 `CombatantInstance` 并追加事件；战后对 HP、职业资源、施法资源与库存余额生成默认未确认候选。每个战斗实例拥有独立 `PostCombatDiff`；若同一长期修订被多个实例引用，首份成功写回产生 revision N+1 后，其余基于旧修订的候选必须标记为过期并阻止写回，DM 可用 `character.writeback.abandoned` 将单份候选置为 `abandoned`，不修改长期角色卡或既有战斗日志。
- `CharacterDraft` 是 Excel 与长期卡之间的隔离层：目前只接受 `beiling-dnd55e-character-sheet@1.0.15` 的固定 18 表结构和允许单元格。浏览器端只读 ZIP/XML，拒绝加密、宏、外链和外部关系，不执行或重算公式、宏、脚本、外链、嵌入代码或工作簿资料表。
- Draft 以单元格回执表示映射及公式缓存；只在页面内存中存在。确认前不写入角色库；只有导入特性中明确存在 `class-feature / 武器精通` 时，才由 DM 从已熟练武器候选中补齐当前精通选择；高等精灵施法来源冲突仍需记录暂行处理，才创建 revision 1。相同文件 SHA-256 重导入只能生成差异预览，确认后才形成 revision N+1。
- 武器表中的固有 `masteryTerm`、角色资格 `grants[]` 与 DM 确认的 `selections[]` 分开保存；当前 Profile 不从职业名称、武器词条或其他字段推断资格，而仅为明确导入的 `武器精通` 职业特性保留待复核的“最多两种、完成长休可重选”骨架。无该特性的角色为 `not-applicable`，不显示 DM 选择请求。已确认选择会在长期角色和战斗投影的“武器精通”区常驻显示武器、词条、效果与自动化边界；来源、目标和到期仍是实际触发后的 `EffectInstance` 状态。长休重新选择只接受已熟练且具有已准入稳定武器/词条 ID 的候选，以 revision N+1 保存；当前投影或待审核候选存在时阻止更换，旧修订和既有投影不变。Vex 只在 DM 确认命中并造成伤害后生成候选，Nick 与其余词条保持人工。Excel 来源卡使用简化编辑表单创建后续修订时，未在表单展示的特性、容器、精通选择和来源证据继续保留。
- 导入来源在 `CharacterSheet.source` 中受限保存 importer ID、Profile 版本、文件名、SHA-256 与映射回执；不保存完整工作簿、图片、外链、嵌入代码或内置规则数据库。导入数值依旧是 `imported-needs-review`，不取代 Rules Baseline 的准入证据。
- M1-S3 解决受控导入闭环、攻击缺失文案和角色详情 UI 验收整改；M1-S4 建立 `SpellcastingProfile`、法术资源池、法术准备/可用状态与多个 `CastingOption` 的隔离结构；M1-S5 完成最小武器精通、关联单位独立棋子、库存余额和战后差异接入。Profile、资源池和法术随 `CharacterSheet → CombatProjection → EncounterMember → CombatantInstance` 深复制；实例中的法术资源变化仅追加 `combatant.spell-resource.changed` 事件，战后形成默认未确认的 `spell-resource` 候选差异，DM 接受后才写入 revision N+1。未明确准入的多职业组合、攻击/DC 与取得权限保持 `unknown / needs-review`；不执行法术效果、自动目标选择或玩家端自动触发。

### 单场战斗

- `CombatantInstance`：单场独立 HP、临时 HP、资源、法术位、状态、专注、行动经济、先攻与坐标。
- `MapState`：地图大小、网格设置、棋子投影与已确认范围效果。
- `TurnState`：轮数、回合序号、先攻顺序、当前行动者与行动经济。
- `EffectInstance`：持续 Buff、Debuff、状态来源、专注、范围与到期条件。
- `CombatEvent`：所有有效变更的顺序事实。

## 身份与引用

所有持久实体使用不可复用的稳定 ID。最低引用链：

```text
templateId
→ templateRevision
→ combatantInstanceId
→ eventId / effectInstanceId
```

同一模板创建多个实例时，`templateId` 相同，`combatantInstanceId`、HP、资源、位置和状态必须不同。

## 事件与撤销

事件最少包含：

```text
eventId
sequence
eventType
occurredAt
source.kind
source.actorId
round
turn
activeCombatantId
targets[]
before
after
reason
rulesReference[]
undoOfEventId
manualCorrection
```

- 已提交事件不可编辑或删除。
- 撤销追加一个补偿事件，并引用 `undoOfEventId`。
- 人工修正追加 `manualCorrection` 事件。
- 拖动预览、标签开关、悬停与未确认范围不进入 Domain Event。
- 掷骰结果进入事件，恢复时重用结果，不重新随机。

## 可重建状态

必须可从初始事件与后续事件重建：

- 战斗实例的 HP、临时 HP、资源、法术位、状态、专注；
- 行动轮、当前行动者、轮次、行动经济；
- 已提交坐标、高度、移动消耗；
- 已确认范围、目标与批量结算；
- 撤销和人工修正后的当前战斗状态。

必须单独保存且不依赖战斗日志重建：

- 模板库与长期角色卡；
- UI 标签显示偏好；
- 未提交的拖动/范围预览；
- 应用级设置默认值。

导出包必须包含完整初始会话、Event Log、当前 Snapshot、Schema Version 与校验信息；Snapshot 记录 `lastAppliedSequence`。

## 坐标与占位

- 原点为地图左上角。
- 方格坐标使用零基整数 `{x, y}`。
- 棋子锚点为占位矩形左上角。
- `footprint = {widthCells, heightCells}`；默认映射：Small/Medium 1×1、Large 2×2、Huge 3×3、Gargantuan 4×4 或明确覆盖值。
- `elevationFeet` 是相对地图基准面的数值，不参与二维覆盖断言。
- 路径保存有序格序列；规则距离与 DM 实际扣除移动力分别保存。

## 距离与移动

`GridSettings` 至少包含：

```text
gridType: square
cellDistanceFeet: 5
diagonalRule: five-feet | five-ten-alternating
```

路径算法只提供建议成本。DM 可以确认不同成本，事件必须同时记录计算值、实际值与原因。v0.1.0 不做墙体、碰撞、机会攻击或垂直距离自动裁定。

## 范围几何

每个能力保存规则定义与二维投影：

```text
rulesShape
projectionShape
placementMode
origin
direction
lengthFeet
widthFeet
radiusFeet
sizeFeet
casterId
```

- Circle：中心 + 半径。
- Cone：源点 + 方向 + 长度，截面宽度随距离增长。
- Line：源点 + 方向 + 长度 + 宽度。
- Square：中心/锚点由能力 `placementMode` 决定；固定测试的油腻术使用中心。
- Self：源头随单位位置。

候选覆盖算法使用连续二维几何与方格交叠面积；达到半格才将格子列为自动覆盖。边线或顶点的零面积接触不算。大型单位任一占位格覆盖即成为候选，并保存命中格清单。

自动候选与 DM 最终目标必须分别保存：

```text
computedTargetIds
manuallyAddedTargetIds
manuallyRemovedTargetIds
confirmedTargetIds
```

当前实现用 UI 临时状态表达 `armed`、`dragging` 与 `preview`；只有范围确认才追加 `range.applied`。拖动过程及松开后的未确认预览不属于 Domain Event。范围确认的 `operation` 可为 `damage`、`healing`、`buff` 或 `condition`；后两者生成最小 `EffectInstance`，保存来源、目标、开始/到期轮次与专注标记，但不自动判定规则合法性、抗性、豁免或复杂专注中断。

`EffectInstance` 使用独立 ID 与 `sourceKind: manual | range` 区分战斗页手动施加和地图范围施加。不同来源的同名效果保持独立实例；同来源、同名、同目标的再次施加刷新同一实例的持续时间。地图、战斗和角色页均以该实例集合为状态事实源；旧 `conditions[]` 仅作为未记录来源与轮次的兼容显示，不参与新的效果到期删除。

## 地图显示与触控

地图坐标保持零基格坐标，显示缩放不参与战斗状态。`适应屏幕` 依据视口与地图列数缩放视觉格；`战术操作` 使用较大视觉格与可滚动地图容器。指针命中以实际渲染格子的 `getBoundingClientRect()` 尺寸换算，不能使用固定像素常量。

棋子仅显示战斗内唯一短名称，不显示 Buff、状态图标或效果计数。短名称由同场单位名称计算最短可区分前缀并保留实例后缀；完整名称仍为实例、日志和状态卡的事实名称。地图点选棋子后在状态卡显示效果名称、来源、结束轮和专注；战斗追踪器显示紧凑摘要并在当前行动者处展开详情。

## 跨标签页同步

所有标签页只通过统一 Command API 读取/修改同一个 `CombatSessionStore`。页面只持有选择状态、视图状态和未提交草稿；不得持有第二份可保存的战斗副本。

## 固定先攻与战斗呈现

固定验收先攻可以先生成同值分组而不立即开始回合。`pendingTieGroups` 与 UI 中的可排序 `tieOrders` 保存待确认顺序；确认时追加 `initiative.tiebreak.resolved`，才生成最终 `TurnState.order` 和第 1 轮。单 DM 端中“玩家决定”由 DM 代录，DM 裁定组由 DM 直接排序；不会为解决平局重新掷骰。

行动轮横条是 `TurnState.order` 的只读投影：当前索引前为本轮已行动、当前索引为当前行动者、其后为未行动。点击横条只改变 UI 选择，不改变回合。HP 和临时 HP 由不同命令维护；设置临时 HP 是明确 DM 修正，伤害优先扣减临时 HP，治疗不恢复临时 HP。

战斗页的单位卡片和参考动作详情均是 UI 投影，不是 `CombatSession` 的第二份事实。推进回合和确认先攻会把选择焦点切换到当前行动者并清除固定动作详情；卡片的手工点选仅用于当前回合内查阅，不改变 `TurnState`。

Combatant 的 `facing` 与 `facingPort` 是战斗实例事实，不写回角色长期卡。`facing` 表示占位矩形的一整条正面边；`facingPort` 是该边上一个具体占位格，供由棋子自身引导的效果作为 Origin。指定地图点的范围保持独立的 `placementMode` 与 Origin，不受朝向影响。

## 角色卡回写

战斗结束时：

1. 计算实例与开战时 `CharacterSheet` Snapshot 的差异；
2. 展示 HP、资源、法术位、状态等候选变化；
3. DM 对每名角色选择确认、放弃或人工修正；
4. 确认审核产生独立 `character.writeback.confirmed` 事件；废除单份候选产生 `character.writeback.abandoned`，将该 `PostCombatDiff` 置为不可重新提交的 `abandoned`；
5. 只有确认字段写入长期角色卡；基于旧 revision、对应卡已归档或已不存在的候选不得写回。

位置、行动轮、临时战斗效果和敌对状态默认不回写。回写失败不得破坏已结束战斗的日志与 Snapshot。

长期角色卡在当前战斗仍有投影，或仍有 `pending` 战后候选时不得归档；UI 禁用入口，命令层再次校验。该限制只保护当前战斗/回写闭环，不改变投影和实例的独立行动能力。战斗结束且候选均已确认、拒绝或废除后，角色可正常归档。

## 版本与迁移

- 每个手动导出包含 `schemaVersion`、`appVersion` 与可选的 `deliveryVersion`；浏览器自动保存保持既有 Envelope 形状，不写入 Delivery 元数据。
- 导入先验证版本与完整性，再执行显式迁移；不支持的未来版本必须拒绝并保留原文件。
- 事件类型与字段只能兼容扩展；破坏性变更需要迁移与回滚。
- v0.1.0 不承诺公开数据库兼容，但验证数据不得硬编码在 UI 组件中。
