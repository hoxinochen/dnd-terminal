# Implementation：v0.5.0 S1 / S2 / Amendment 03 死亡后结果

- **Slice：** `v0.5.0-S1`、`v0.5.0-S2A`、`v0.5.0-S2B`、`v0.5.0-S2C`
- **状态：** `S1 + S2 + Amendment 03/04 Implemented — Archived — Local Private`
- **授权：** User 于 `2026-08-27` 明确确认“s1执行完毕”，并授权执行 S2（S2A、S2B、S2C）。
- **范围 Authority：** [ABC](ABC.md) §A-3 至 §A-8、§5；[S1 Amendment 01](AMENDMENT_01.md)、[S1 Amendment 02](AMENDMENT_02.md)、[Amendment 03](AMENDMENT_03.md)、[Amendment 04](AMENDMENT_04.md)
- **正式产品基线：** `v0.4.0 Archived — Local Private`；该冻结版本及其 Archive 工件未修改。
- **技术起点复核：** `main@431db95894a0aa99a4e85cb464f56e584ad2a8d6`；实施开始前工作树干净。
- **Rules Baseline 复核：** `Lore_01_核心玩家规则.md`，SHA-256 `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8`；S1 仅以既有死亡规则定位作为审计参考，不自动裁定复活合法性。
- **未获授权：** Branch、Commit、Push、Deployment、Public Release。

## 实现结果

S1 为战斗未结束、`kind: character`、`lifePhase: dead`、HP 为 `0` 的 PC 增加了专属的 **DM 确认复活**表单和 `pc.return-to-life.confirmed` 事件。它始终复用原 `CombatantInstance`，不创建新身体；点击复活时不直接创建或修改 `CharacterSheet`，也不触及长期角色卡的 archive 或承接关系。备注候选的受控战后写回见下方 Amendment 01。

事件必须记录：依据状态与标签、灵魂确认、正 HP、状态/疾病/诅咒/力竭处理说明、战斗状态处理、地图/尸体处理、先攻处理、DM 原因和独立 resolution ID。S1 固定的实例结果为：

- `mapOutcome: restore-original-token`：原尸体棋子恢复为原实例；不新建棋子或替代实例；
- `initiativeOutcome: restore-original-slot`：复用既有先攻恢复算法；若本轮位置已越过，则下一轮才可正常行动；
- `lifePhase: active` 与兼容镜像 `lifeStatus: alive`；临时 HP 清零；
- 选择“保留”时仅移除 `unconscious`，保留 `prone` 和其他现有条件；选择“清空”时移除所有条件；
- 历史死亡豁免轨迹与死亡记录保留，并在 `deathRecord.resolutions` 追加本次结果。

系统明确提示：它只记录 DM 已确认的结果；不会验证法术资格、材料、灵魂、战役时间、永久死亡或其他规则条件。

## 入口、命令与隔离

- PC 渲染层移除通用怪物/NPC 的 `data-death-resolve` 入口。
- `openDeathResolution`、`applyTransformation` 和 `submitTransformation` 都在命令层拒绝 PC，避免直接调用绕过 UI。
- S1 事件加入现有本页补偿撤销表；撤销恢复事件前 checkpoint，并追加 compensation event，不删除原事件。
- 刷新后恢复最终会话状态与事件；刷新前 checkpoint 仍不承诺可撤销。
- `CharacterSheet` Schema 保持 `0.3.0-m1-s5`；长期卡默认仍不被战斗事件直接修改。

## Amendment 01：复活记录可见性与受控备注写回

已按 [Amendment 01](AMENDMENT_01.md) 实施两层补充：

- 战斗 Tab 的“PC 生命状态”在复活后显示**最近复活记录**：依据、灵魂、HP、状态/疾病/诅咒/力竭处理、地图/尸体、先攻、DM 原因、轮次和 Resolution/Event ID。
- `resolutionId` 现在同时用作 `pc.return-to-life.confirmed` 的 Event ID，使摘要、`deathRecord.resolutions` 与顺序事件可直接对应。
- 结束战斗时，拥有对应 `CombatProjection` 的复活 PC 会得到 `note-append` 战后候选。默认拒绝；DM 接受后才把稳定摘要**追加**到当前 CharacterSheet `note` 并创建下一修订。
- 备注候选不允许数值“更正后写入”；无投影、已归档、修订过期或不完整 resolution 一律不能写回。拒绝和废除均不改动角色卡。
- 此能力不触及 S2A/S2B/S2C，不改变 CharacterSheet Schema，也不建立自动同步、归档或强继承关系。

## Amendment 02：长期角色卡 DM 备注显示

已按 [Amendment 02](AMENDMENT_02.md) 增加角色档案的独立“DM 备注”页签：它显示当前 CharacterSheet 修订的完整 `note` 和修订号，且保留多行内容。战后复活候选未被 DM 接受前仍不是长期卡事实；接受后，原有 `note-append` 机制创建新修订，该模块与“导入与修订”的 `note` 差异会一同反映结果。此为纯读取 UI，不改变任何 Schema、事件或裁定。

同时提升 `app.js` 的入口 cache revision，使 Chrome 重新取得本轮的完整前端模块，而不会把更新后的战斗页与旧角色页脚本混用。

## S2：新实例、受控亡灵与独立角色卡

S2 以三条不能互相混用的命令路径实现：

- **S2A `pc.replacement.confirmed`：** 仅处理有匹配当前 CharacterSheet 修订之 CombatProjection 的死亡 PC。DM 必填新身体说明、依据状态/标签、灵魂确认、玩家控制确认、地图/尸体、先攻、原因、原卡处置记录和创建时字段继承清单。系统保留原死亡 CombatantInstance，建立新的 PC CombatantInstance、CombatProjection 及新 CharacterSheet（新 `characterId`、修订 1）。
- **S2B `combatant.controlled-undead.created`：** 仅处理死亡 PC/NPC，且必须选择明确的 monster/NPC Template 与在场控制者。新实例保存 `controllerLink`（控制者、效果/规则定位、命令范围、控制到期/续控记录和历史）；它不是 PC 复活，也不会写回原 CharacterSheet。DM 可用 `combatant.controller-link.updated` 明确续控或失控；失控时它成为 DM 管理的未受控 NPC，不沿用原 PC 玩家控制权。
- **S2C `pc.undead-successor.confirmed`：** 建立新的普通 PC CharacterSheet 和独立 PC CombatantInstance；DM 明确输入新亡灵角色资料、控制归属、字段继承清单及其余审计事实。它不是 S2B 的默认结果。

S2A/S2C 创建时只复制 DM 勾选的字段组；未勾选的组以普通角色卡的空/默认资料开始。双方角色卡分别以既有 `note` 留下人类可读的事件 ID、名称/ID、原因与“以后完全独立”的说明；没有 schema 级 predecessor/successor、自动同步、唯一继承、强制归档或禁止并存。原卡只记录 `keep-active | coexist | archive-later` 的 DM 决定，系统不自动归档。

地图可明确选择移除旧尸体棋子或保留尸体并把新实例放至其他格。先攻沿用既有插入与“本轮已越过则下一轮”算法。旧死亡 PC 在 S2 之后被标记为不产生战后长期写回候选；新 PC 只通过自己的 CombatProjection 在战后生成自身的候选。S2 创建事件仅在其后没有其他事件时可补偿撤销；S2A/S2C 的补偿同时恢复原角色卡修订并移除新卡。

## Session Schema 与兼容（Amendment 03 前的 S1/S2 记录）

- Delivery Version：`0.5.0`；Session Envelope Schema：`0.4.0`。
- 新 key：`dnd-terminal.v0.5.0.session.current`。
- 启动时按新 key → v0.4.0 → v0.3.1 → v0.2.0 的顺序只读选择；旧 key 只在完整校验后复制迁移，永不就地改写。
- 损坏的 v0.5.0 key 阻断恢复，不静默回退并覆盖旧 key。
- 导入和保存都使用 v0.5.0 Envelope；`active` PC 必须正 HP，其余 0 HP 生命周期阶段必须为 HP 0。

## Amendment 03：可视摆放、正式受控生物与期限结算

已按 [Amendment 03](AMENDMENT_03.md) 实施以下补充；该节取代上文 S2 中关于 S2B 仅保存文字性 `controllerLink`、Session Schema 为 `0.4.0` 及 CharacterSheet 不升级的旧描述。

- 死亡 PC 的 UI 先显示四个无技术代号的选项：**恢复原身体**、**获得新身体继续冒险**、**制造受控亡灵**、**以亡灵身份继续冒险**。默认不选；只渲染已选路径的表单。S1 保持原实例复活，三条新实例路径均改为“前往地图摆放”。
- S2A/S2B/S2C 在点击地图空格前只保留内存草稿；取消不创建事件、CombatantInstance、先攻位置、战后候选或 CharacterSheet 修订。确认和提交前都使用包含尸体棋子的地图占用检查，完整 footprint、越界或任何棋子占用都会拒绝。
- S2B 建立带稳定 ID 的 `controlledEntities` 结构化关系。战斗中的独立实例保存 `controllerLink`；只有控制者有匹配的 CharacterSheet/CombatProjection 时，才建立默认拒绝的 `controlled-entity` 战后候选，且只可由控制者角色卡接受写入，绝不写回尸体来源 PC。
- “关联单位”页签内新增与普通关联单位并列的“受控生物”模块：展示模板、状态、命令距离、期限、最近实例与完整控制历史。命令必须由在场、未死亡、处于当前回合且在命令距离内的控制者提交 `controlled-command.issued`；内容仍由 DM 结算。
- S2B 期限为无默认值的三选一：24 小时（以一次登记长休结算）、永久、或自定义 N 回合/N 场战斗/N 次长休。回合与战斗计数记录在顺序事件 payload 中；长休在控制者角色卡模块中显式登记。计数到期统一变为 `expired-uncontrolled`：关闭命令但保留生物、棋子、先攻与审计历史，不自动删除、敌对化或宣称重施法术。
- 到期后可记录 `renewal-requested`；该操作只追加 DM 意图，不恢复控制、不消耗资源，也不验证任何法术。具体法术续控继续留在 `BL-026`。
- CharacterSheet Schema 升至 `0.3.0-m1-s6`，缺失 `controlledEntities` 按空集合兼容；仅接受战后候选时创建控制者的新修订，未批量改写旧卡。Session Envelope Schema 升至 `0.4.1`，新 key 为 `dnd-terminal.v0.5.0.controlled-entities.session.current`。启动按该 key → 原 `dnd-terminal.v0.5.0.session.current` → v0.4.0 → 更早 key 只读选择，迁移只写新 key。

## Amendment 03 仍未实施

- 对 Animate Dead、Create Undead 或其他具体法术的资格、材料、尸体限制、目标数量、法术位、重施、24 小时精确计时或规则合法性验证；
- 已到期受控生物的自动敌对、自动消失、行动 AI 或跨战斗自动物化；
- 对角色卡长期关联写入、长休结算或续控意图的补偿撤销。战斗内创建及 `controllerLink` 更新仍适用既有 checkpoint compensation 边界；长期角色卡修订作为不可覆写的审计历史保留。

## Amendment 04：再投入、预览摆放与 DM 续控记录

- `controlled` / `permanent-controlled` 的已接受受控生物，现在在第 0 回合可从控制者的“关联单位 → 受控生物”模块加入新的遭遇。它复用普通关联单位的**显式 Template → 独立本场实例**物化机制；新战斗实例重新获得 `controllerLink`，但不会复用、搬运或覆盖上一场 CombatantInstance。`expired-uncontrolled`、`released`、`control-lost` 不显示可用的再投入入口；历史仍留在卡上，DM 可从单位库独立加入同模板。
- S2A、S2B、S2C 的地图阶段改为临时预览棋子：可无限次拖动，确认按钮才执行既有占格复核和原子创建；取消仍为零持久化写入。预览与普通待入场棋子隔离，不获得先攻、行动或事件。
- 死亡后四个结果选项固定在对应面板之前；原身体复活不再通过泛用 `<details>` 查询重排，从而与其他三条路径保持一致的阅读顺序。
- 长休结算允许 DM 对 `one-long-rest` 项逐个确认“已在到期前续控一次”。确认项写入 `control-renewed` 并重置下一次长休计数；未确认项照常变为 `expired-uncontrolled`。该记录不声称施放了任何法术，也不验证法术位、材料、目标数、时机或资格。
- 已核验的“某些召唤物紧随施法者行动”等具体法术时序仍未实现。本交付维持 S2 新实例默认的既有先攻/下轮资格合同；逐法术时序必须经后续规则准入和独立授权。
- 受控关联生物的棋子使用专属淡紫色 `#C69BF7`，并在 `controllerLink.status` 为 `controlled` 或 `permanent-controlled` 时覆盖 monster/NPC Template 的关系默认色。到期、解除或失控后恢复其普通关系色；颜色只表达已建立的关联状态，不表达阵营、玩家控制权或任何法术合法性。

## 变更清单

| 路径 | 作用 |
| --- | --- |
| `/Users/chenzehao/Projects/DND Terminal/src/life-cycle-v050.js` | S1 复活状态/事件数据合同、v0.5.0 Envelope、copy-on-write 启动迁移与校验。 |
| `/Users/chenzehao/Projects/DND Terminal/src/app.js` | DM 复活表单、战斗内复活摘要、事件提交、PC guard、受控 note-append 审核 UI、长期卡 DM 备注展示、撤销接入、v0.5.0 persistence。 |
| `/Users/chenzehao/Projects/DND Terminal/src/characters.js` | `note-append` 战后候选、仅在 DM 接受后的 CharacterSheet 备注追加，以及 S2 创建时复制的独立 CharacterSheet 工厂与受限继承字段组。 |
| `/Users/chenzehao/Projects/DND Terminal/index.html` | S1 实施中的产品标识与模块 cache revision。 |
| `/Users/chenzehao/Projects/DND Terminal/tests/life-cycle-v050.test.mjs` | S1 领域、拒绝路径和存储迁移测试。 |
| `/Users/chenzehao/Projects/DND Terminal/tests/v050-s1-ui-contract.test.mjs` | PC UI/命令 guard 与 v0.5.0 标识合同测试。 |
| `/Users/chenzehao/Projects/DND Terminal/tests/v050-s1-amendment.test.mjs` | 复活摘要备注候选、默认拒绝、显式接受追加、修订隔离与非法 resolution 拒绝测试。 |
| `/Users/chenzehao/Projects/DND Terminal/tests/v050-s2.test.mjs` | S2 独立角色卡 ID、修订 1、受控字段复制、非复制组默认化与备注边界测试。 |
| `/Users/chenzehao/Projects/DND Terminal/tests/v050-amendment03.test.mjs` | 四选一 UI、可视摆放、尸体占格、防呆、受控关系、期限、Schema/key 升级的 Amendment 03 合同测试。 |
| 现有兼容/UI 测试 | 适配当前 v0.5.0 S1 入口与 Session Schema，同时保留 v0.4.0 兼容验证。 |

## 本 Slice 明确未做

- 法术、材料、灵魂、战役时间或永久死亡的自动规则裁定；
- 自动归档、继承强链接或长期角色卡同步；
- Review、Release、Archive、提交、推送、部署或公开发布。

下一步仅等待 User 对 S1 的 Human Acceptance；不得由本记录推导任何后续授权。
