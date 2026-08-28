# ABC：v0.5.0 PC 死亡后复活、独立承接角色与受控亡灵

- **交付 ID：** `v0.5.0`
- **交付类型：** Major / Local Private Candidate
- **内部 Slice：** `v0.5.0-S1`、`v0.5.0-S2A`、`v0.5.0-S2B`、`v0.5.0-S2C`
- **状态：** `Approved / Frozen — Archived — Local Private`
- **Implementation 授权：** `Granted for S1 / S2A / S2B / S2C — User / 2026-08-27`
- **Review / Release / Archive / Branch / Commit / Push / Deployment / Public Release 授权：** `Review Approved / Released / Archived — Local Private — User / 2026-08-28; Branch / Commit / Push / Deployment / Public Release Not Granted`
- **正式产品基线：** `v0.4.0 Archived — Local Private`
- **冻结发布身份：** v0.4.0 local-private ZIP SHA-256 `774cc4ed1317c8b061be690725a3450bf58fdf316bd06d583343141c98a055d2`；manifest SHA-256 `4bf308905b05eeea7143abe6bda229fbf16979c8bb296720d91149e8e34c3979`
- **当前技术起点：** Git `main@431db95894a0aa99a4e85cb464f56e584ad2a8d6`；该技术基线不替代 v0.4.0 冻结发布身份。
- **批准权：** User
- **草案 / 冻结日期：** `2026-08-27`
- **文档 Authority：** `/Users/chenzehao/Vaults/obsidian/obisidian/理工学习相关/DND Terminal`
- **产品 Workspace：** `/Users/chenzehao/Projects/DND Terminal`
- **规则来源区：** `/Users/chenzehao/Antigravity Source/lorebuddy-规则书/NotebookLM_Version`（只读）

User 已确认本交付正式命名为 `v0.5.0`，并批准本文范围：PC 死亡后原实例复活、独立新身体承接、受控亡灵以及剧情性亡灵 PC 承接。本文作为范围与数据合同本身不推导 Implementation 或后续生命周期门禁；S1 的独立 User 实施授权已如页首记录，其余 Slice 仍必须分别获得授权。

## 0. ESG 适用性与版本结构

### 0.1 Core 与 Milestone Profile

| 字段                                   | 冻结决定                                                                                                                    |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Downstream Documentation Schema Core | `schema-v0.3.0`，SHA-256 `4a95a932eba5e549fa96449c178ce18ecc049513a3697b041b08dbd8736f4f4d`                              |
| Compatible Governance Baseline       | Minimal Governance Framework `schema-v0.2.0`，SHA-256 `84b0fbbe1dd5703acfcda63b297a115e725c79629647d807ae3664a55c4aa727` |
| Milestone Documentation Profile      | `Applicable`；本交付有四个可独立授权的 Slice，且需要跨 Slice 的数据、回归与 Human Acceptance 汇总。                                                 |
| Archive Contract/Profile             | `Not Selected / Not Applicable at Current Gate`；历史版本的 Archive 选择不自动继承。                                                  |

### 0.2 Slice 与授权边界

| Slice | 能力 | 单独授权要求 |
|---|---|---|
| `S1` | 死亡 PC 的 DM 确认原实例复活；同时封堵 PC 误入怪物/NPC 死亡处理入口 | 必须先获 User Implementation 授权 |
| `S2A` | 新身体但同一 PC 连续性：`Reincarnate` / `Clone` 型独立新角色卡 | 同上 |
| `S2B` | 尸体被制造为受施法者控制的亡灵怪物/NPC：`Animate Dead` / `Create Undead` 型 | 同上 |
| `S2C` | 剧情性亡灵 PC 延续：从旧卡复制创建独立新 PC 角色卡 | 同上；还必须取得 DM 与相关玩家的明确确认输入 |

任一 Slice 完成、测试通过或 Human Acceptance 通过，都不自动授予后续 Slice、Review、Release 或 Archive 权限。

## 1. A——目标与实施范围

### A-1 版本目标

`v0.4.0` 已完成 PC `0 HP`、死亡豁免、稳定、死亡、`lifePhase` 与 `unconscious`/`prone` 分离，但 PC 死亡后的复活与转化被明确延期。`v0.5.0` 的目标是：在本地 DM 战斗工具中，让死亡后的不同结果拥有不混淆的状态、实例、先攻、地图、事件、保存和长期角色卡边界。

本交付仍不是完整 D&D 规则引擎。系统可以严格执行 DM 已确认的结果与受限规则合同；它不得自行裁定法术资格、材料所有权、灵魂意愿、战役时间、永久死亡或角色叙事身份。

### A-2 统一术语与状态边界

- `lifePhase` 是 PC 单场生命阶段的唯一权威：`active | dying | stable | dead | needs-review`。`lifeStatus` 只能作为兼容镜像；PC 不得以 `lifeStatus: transformed` 覆盖或取代 `lifePhase`。
- `dead` 是死亡事实，不等同于 `temporarily-away` 或 `participation-ended`。
- `temporarily-away` 表示仍可在本场战斗按条件重新入场；`participation-ended` 表示该实例本场参与结束。
- 尸体棋子是地图表现，不等同于仍可行动的 CombatantInstance。新实例出现、旧尸体是否保留或移除，必须由该事件的 `mapOutcome` 明确记录。
- `transformed` 是现有怪物/NPC 原实例的窄流程状态；它不是 PC 生命阶段，也不是角色卡承接的通用语义。

### A-3 S1：原实例复活

S1 对应“此角色重拾生命”的结果，包括 DM 裁定的复活，以及可被后续独立规则切片具体化的 `Revivify`、`Raise Dead`、`Resurrection`、`True Resurrection` 型结果。

- 仅允许 `kind: character`、`lifePhase: dead`、战斗未结束的原 PC CombatantInstance。
- 事件建议为 `pc.return-to-life.confirmed`，不得伪装为 `combatant.revived.dm-exception`。
- DM 必填：依据状态（`verified-entry | dm-ruling | unverified`）、依据标签、原因、灵魂返回确认（适用时）、结果 HP、状态/疾病/诅咒/力竭的处理结果、尸体/地图处理和先攻恢复方式。
- 成功后：原实例以正 HP 回到 `lifePhase: active`，兼容镜像为 `lifeStatus: alive`；死亡记录保留，并补充 resolution event link。
- 复用现有先攻恢复算法，但以 PC 专属事件与 guard 保护；不得在本轮重复行动。
- 必须同时修复 UI 与命令层：死亡 PC 不显示且不得直接调用怪物/NPC 的“特许 1 HP 复起”或“特殊转化”入口。

### A-4 S2A：新身体、同一 PC 连续性

S2A 处理 `Reincarnate`、`Clone` 等“原死亡实例不复活，但角色以新身体继续”的结果。

- 原死亡 CombatantInstance 保留为死亡历史；新建 CombatantInstance 进入地图和先攻。
- 新实例仍是 PC，不是怪物/NPC；其玩家控制权必须由 DM 明确确认。
- 长期层面，从原 CharacterSheet 的**当前修订快照**创建一张全新、独立的 CharacterSheet；新卡获得新 `characterId`、修订从 `1` 开始。
- 继承只在创建时发生。DM/玩家在创建表单中确认哪些字段复制、哪些字段重填；以后两张角色卡互不读取、同步、覆盖或阻塞。
- 两张卡各自在 `note` 中写入人类可读的转化/承接说明、对方名称或 ID、以及本次事件 ID。该备注是追溯线索，不构成 schema 级 predecessor/successor 强耦合。
- 原卡默认不自动归档；DM 可以独立选择归档、保留或日后重新启用。原卡与新卡可在剧情许可下同时 `active`。

### A-5 S2B：受控亡灵，不是 PC 复活

S2B 处理尸体被制造为骷髅、丧尸、食尸鬼及经授权的其他亡灵资料卡的结果。

- 原 PC 或 NPC 的死亡事实不被撤销，原 CharacterSheet 不恢复，也不产生玩家角色连续性。
- 新实例采用明确选择的 monster/NPC Template，拥有独立 HP、行动、先攻、地图表现和事件历史。
- 新实例保存 `controllerLink`：施法者 Combatant ID、来源效果/规则定位、DM 确认的命令范围、控制状态及其到期/续控记录。
- 控制权属于施法者，不自动属于原 PC 玩家。控制失效后，新实例转为 DM 管理的未受控 NPC；不得静默继续算作施法者盟友。
- 当前产品没有 Campaign Time Authority；因此 S2B 只记录 DM 明确确认的控制到期或续控事实，不自动按 24 小时推进或裁定失控。
- S2B 不将新亡灵写回原 CharacterSheet；`originCharacterRef` 只可作为审计来源说明，不建立长期同步。

### A-6 S2C：剧情性亡灵 PC 延续

S2C 不是 `Animate Dead` 或 `Create Undead` 的默认结果。它只处理 DM 与相关玩家明确决定“死亡角色以新亡灵角色继续”的剧情选择。

- 从旧 CharacterSheet 的当前修订创建一张新、独立的 CharacterSheet，并按确认继承清单复制数据；不可原地把旧卡改造成亡灵卡。
- 原卡、新卡均是普通、彼此独立的长期角色记录。两卡仅在各自 `note` 中保留剧情说明、对方名称/ID 与转化事件 ID；没有自动归档、双向锁定、唯一继承人或自动反向关闭规则。
- 新卡是否为 `active`、由谁控制、使用何种 PC 资料以及哪些属性/能力/装备保留，均由 DM 与玩家明确输入。系统不得从原卡或怪物模板自动推断。
- 原卡可保持 active、可归档、可在以后重新启用；新旧角色卡可以在同一剧情中并存。重新启用旧卡不会自动删除、归档或修改新卡。
- 战斗中，新卡只通过自己的 CombatProjection 加入战斗；原死亡实例、原卡和新卡之间不得发生自动 HP、资源、条件或战后差异回写。

### A-7 事件、撤销、先攻、地图与战后合同

- 所有死亡后结果均为顺序 CombatEvent；事件记录来源实例、结果实例（如有）、DM 输入、规则依据状态、地图结果、先攻决定、轮次和原因。
- 同页撤销必须追加补偿事件，不删除旧事件。复活或创建新实例的撤销仅在没有后续依赖事件时可用；应恢复原先攻、地图、尸体和状态。
- 保存时既有 checkpoint 压缩合同保持有效：刷新可恢复最终状态和事件记录，但不承诺恢复刷新前的撤销检查点。
- 新实例插入先攻时，必须处理当前回合位置、同值顺序、等待入场和“本轮已越过该位置”的情况；后者默认下一轮才可正常行动。
- `PostCombatDiff` 只可以写回与其自身 CombatProjection 匹配的 CharacterSheet。S1 的原实例可沿用既有 HP 审核路径；S2A/S2C 新卡只接受新实例自己的审核候选；S2B 永不回写原角色卡。

### A-8 存储、Schema 与兼容

- Delivery Version 提升为 `0.5.0`。
- 死亡后 resolution、replacement、controllerLink 与事件关联是持久化业务语义。Session Envelope Schema 目标提升为 `0.4.0`，并使用新的 copy-on-write key `dnd-terminal.v0.5.0.session.current`。
- `v0.4.0` 及更早 Session key 只读保留；迁移只能读取副本，完整校验成功后才写 v0.5.0 新 key。旧死亡 PC 不得被自动推断为已复活、转化或创建了后继角色。
- 当前 CharacterSheet Schema `0.3.0-m1-s5` 的普通新卡创建、`note`、修订和可选 archive 状态足以表达“创建时复制、后续独立”。本 ABC 不要求为 predecessor/successor 强耦合升级 CharacterSheet Schema。
- 若实施发现必须新增结构化继承字段、强制唯一性、自动同步或批量迁移，必须先走 Amendment；不得以实现便利替代本 ABC 的独立角色卡决定。
- 未知未来 Schema、损坏新 key 或不完整 replacement/controllerLink 必须安全拒绝且不覆盖任何旧 key 或用户数据。

## 2. B——规则准入与 DM 边界

### B-1 可定位的本地候选事实

下列事实来自 `Lore_01_核心玩家规则.md`，当前文件 SHA-256 为 `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8`。文件同时包含 2014 与 2024 内容；本交付只可按明确标注的 PHB 2024 段落使用，不得按法术名称混用版本。

| 主题 | 本地 2024 定位 | 可用于的候选事实 |
|---|---|---|
| 死亡 | 第 35886–35890 行 | 死者不能恢复 HP；复活需魂魄返回且魂魄可拒绝；回生效果决定 HP；未特别处理的持续状态、魔法疫病与诅咒通常延续；力竭减少 1；同调结束。 |
| 回生术 `Revivify` | 第 23937–23945 行 | 一分钟内、1 HP、300+ GP 钻石耗材、非老死、不能恢复失去身体部位。 |
| 死者复活 `Raise Dead` | 第 25633–25648 行 | 十日内、死亡时非亡灵、1 HP、500+ GP 钻石、指定毒素/致命伤与减值后果。 |
| 复生术 `Resurrection` | 第 23380–23390 行 | 百年内、非老死、死亡时非亡灵、满 HP、1000+ GP 钻石、身体恢复和减值后果。 |
| 完全复生术 `True Resurrection` | 第 24357–24366 行 | 两百年内、非老死、满 HP、25000+ GP 钻石、可恢复亡灵前形态或再造身体。 |
| 转生术 `Reincarnate` | 第 25657–25665 行 | 类人生物遗体/部分、十日内、新成年身体、灵魂召回、1000+ GP 油与 DM/骰表决定种族。 |
| 克隆术 `Clone` | 第 25954–25963 行 | 成熟需 120 日；自由且愿意的灵魂进入克隆体；保留个性/记忆/能力，原遗体不能再复活。 |
| 活化死尸 `Animate Dead` | 第 23494–23502 行 | 类人遗骨/遗体成为骷髅/丧尸；施法者精神命令控制。 |
| 唤起亡灵 `Create Undead` | 第 26198–26208 行 | 夜晚、类人生物尸体成为受施法者控制的食尸鬼；高环可产生其他指定亡灵。 |

这些是可核验的候选事实，不自动等于完整规则引擎、角色卡字段映射或实施授权。Implementation 前必须重新核对文件 hash；不一致或定位/版本冲突时停止相应自动化，记录冲突，并要求 Amendment 或 User 决定。

### B-2 DM 必须明确输入或确认的事项

- 使用的效果、规则版本和依据状态；施法者资格、法术位、材料拥有与消耗；
- 死亡经过时间、尸体/身体条件、老死、死亡时是否亡灵；
- 灵魂是否自由、愿意或拒绝；战役永久死亡与剧情例外；
- 复生后的 HP、状态、疾病、诅咒、力竭、装备与地图处理；
- 新身体/亡灵形态、种族或 Template、玩家控制权、关联阵营与先攻；
- S2A/S2C 的字段继承清单，以及原角色卡是否归档、保留或与新卡并存；
- S2B 的控制到期、续控和失控；系统不具备战役时间 Authority 时不得自动推进。

## 3. C——受保护边界与明确非目标

本交付不得：

1. 修改 v0.4.0 或更早版本的 ABC、Amendment、Implementation、Testing、Review、Release、Archive、发布包、代码快照、manifest 或校验记录；
2. 修改 Rules Baseline 原始文件、用户角色卡、现有会话 key 或用户导出；
3. 把怪物/NPC 的既有 DM 窄流程当作 PC 规则合法性结论；
4. 自动裁定法术资格、目标资格、材料、灵魂、时间、永久死亡、规则冲突或剧情身份；
5. 自动创建唯一后继关系、自动同步两张角色卡、自动归档/删除原卡，或阻止两卡同时 active；
6. 把 S2B 亡灵默认交给原 PC 玩家，或把它写回原 CharacterSheet；
7. 建设完整 Campaign Time、法术资源/材料库存、全量法术规则、完整 VTT、跨刷新撤销、通用事件重放引擎、部署或公开发布；
8. 因本文冻结自动开始 Implementation、创建分支、Commit、Push、Review、Release 或 Archive。

## 4. D——冻结决定

| ID | 决策 | 冻结结论 |
|---|---|---|
| D50-000 | 版本身份 | 以 `v0.5.0` 作为死亡后复活、承接与受控亡灵的 Major 交付。 |
| D50-001 | 治理结构 | Core + Milestone Profile；S1、S2A、S2B、S2C 分别授权、分别记录，最终综合验收。 |
| D50-002 | PC 状态 | `lifePhase` 为 PC 权威；`lifeStatus` 仅兼容镜像；PC 不使用 `transformed` 取代生命阶段。 |
| D50-003 | S1 | 原实例、DM 确认、PC 专属 event、先攻恢复、尸体/地图明确结果；封堵 PC 误入怪物/NPC 入口。 |
| D50-004 | S2A | 新身体创建新 PC 实例和新 CharacterSheet；创建时快照继承，之后完全独立。 |
| D50-005 | S2B | 造亡灵不是复活；新单位使用 monster/NPC Template，受施法者控制，不是原玩家 PC。 |
| D50-006 | S2C | 剧情性亡灵 PC 是新的独立角色卡；仅通过 `note` 保留人类可读追溯，不建硬耦合。 |
| D50-007 | 两卡自由度 | 不默认归档、唯一继承或排他性；原卡与新卡可同时 active，均按普通角色卡规则继续。 |
| D50-008 | 规则自动化 | 只执行已固定、已确认的窄事实；未确认条件一律 DM 输入/裁定。 |
| D50-009 | Session/Character Schema | Session target `0.4.0` + 新 key；CharacterSheet 保持 `0.3.0-m1-s5`，不引入继承强耦合。 |
| D50-010 | 战后隔离 | 只向对应 CombatProjection 的角色卡产生审核候选；亡灵不回写原卡，独立新卡不回写旧卡。 |
| D50-011 | 回退 | 保留 v0.4.0 锁定发布身份和旧 key；v0.5.0 只写新 key，回退不降级写回。 |
| D50-012 | 门禁 | 本 ABC 已冻结，但 Implementation 及每一后续 Gate 均未授权。 |

任何实质改变——特别是自动规则裁定、强耦合角色卡关系、CharacterSheet Schema 变更、自动归档、时间引擎或跨刷新撤销——都必须先创建 Amendment 并重新获得 User 批准。

## 5. 测试与回退合同

### 自动测试

至少覆盖：

- PC 死亡入口 guard：UI 与直接命令均拒绝怪物/NPC 的特许复起和特殊转化；
- S1 的正/拒绝路径、生命阶段与兼容镜像、条件处理、尸体、地图、先攻、事件及因果受限补偿撤销；
- S2A 新身体 PC 的新实例、新卡、创建时字段复制、随后独立编辑、两卡并存和战后写回隔离；
- S2B 骷髅/丧尸/食尸鬼等 Template 实例、caster controllerLink、控制到期/续控 DM 记录、失控 NPC 化与原卡零写回；
- S2C 新 PC 卡创建、备注追溯、无 schema 强链接、原卡不自动归档、两张 active 卡可独立投影；
- 刷新恢复、未知/损坏 Schema 安全拒绝、copy-on-write 旧 key 不变、重复提交幂等；
- 全部 v0.4.0 既有自动测试回归。

### 浏览器与 Human Acceptance

使用隔离 origin 与合成夹具；不得读取或破坏用户真实 localStorage。User/DM 至少确认：四个 Slice 的状态语义、先攻与地图结果、事件可读性、两卡独立性、原卡与新卡可并存、受控亡灵并非玩家角色、刷新后状态一致，以及战后没有错误写回。

### 回退

- 产品回退锚点是 v0.4.0 冻结 ZIP、manifest、Authority 代码快照与当前技术基线；它们均不得被修改。
- v0.5.0 仅使用新 Session key；回退不删除 v0.5.0 key，也不将其降级写回旧 key。
- 若需保留 v0.5.0 会话，应先由 v0.5.0 导出；旧版本不承诺读取未来 Schema。
- 回退后的角色卡保持独立记录，不自动合并、删除、归档或反向写回。

## 6. Exit Gate 与当前停止点

### ABC Gate

- **状态：** `Passed / Approved-Frozen / User / 2026-08-27`；
- User 已批准本文的版本名、S1/S2A/S2B/S2C、独立角色卡、规则/DM 边界、兼容、测试与回退合同；
- 本文最初不自动授予 Implementation；User 已于 `2026-08-27` 独立授予 `v0.5.0-S1` 实施授权。该授权不扩展至 S2A、S2B、S2C 或任何后续生命周期门禁。

### 当前停止点

- **状态：** `v0.5.0-S1 implemented / automated checks passed / awaiting User Human Acceptance`；
- S1 的实施与测试已单独记录；User Human Acceptance 仍待完成。S2A、S2B、S2C 继续分别等待独立授权；
- Review、Release、Archive、分支、Commit、Push、部署和公开发布均继续等待单独授权。
