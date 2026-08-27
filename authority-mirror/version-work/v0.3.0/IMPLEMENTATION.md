# Implementation：v0.3.0 / M1

- **状态：** `M1 Implementation Complete — Review Approved；v0.3.0 Released — Local Private`
- **产品版本映射：** `M1 ↔ v0.3.0`
- **当前门禁：** `v0.3.0` Released — Local Private
- **授权日期 / Authority：** `2026-08-21` / User（Amendment 2 Implementation）；`2026-08-24` / User（Human Acceptance、Review Approved 与 Local Private Release）
- **后续门禁：** Archive、部署和公开发布仍须单独授权
- **产品 Workspace：** `/Users/chenzehao/Projects/DND Terminal`
- **Git Identity：** 不适用；Workspace 未初始化 Git

本记录按时间顺序累计各 Slice 的实际实施事实。`M1-S1` 至 `M1-S5` 已完成并通过人工验收；`M1-S5-STAB-1` 与 `M1-S5-STAB-2` 已在 Amendment 2 下完成技术实施，并于 `2026-08-24` 获 User 明确人工通过。Independent Review 已获 User 批准，且 User 同日授权 Local Private Release。Slice 完成、人工验收、M1 完成、Independent Review、Release 与 Archive 是彼此独立的状态。

## M1-S1——最薄长期卡—战斗—回写闭环

| 字段 | 当前记录 |
|---|---|
| Goal | 用一个手工非施法角色证明 `CharacterSheet → CombatProjection → CombatantInstance → CombatEvent → PostCombatDiff → CharacterSheet revision N+1` 最薄闭环 |
| Approved Scope Reference | `version-work/v0.3.0/ABC.md` 第 11 节 `M1-S1` |
| Actual Changes | 已建立独立长期卡存储、最小修订模型、战斗投影、角色来源遭遇成员/参战实例、资源变化事件、补偿撤销、战后候选差异和逐项确认写入 |
| Verification | 3 组自动测试通过；真实浏览器最小闭环通过；详见 `TESTING.md` |
| Human Gate | Passed；User；`2026-08-17`；附非阻塞 UX 观察 `M1-S1-O1` |
| Implementation State | Complete / Human Accepted |
| Review State | Review Approved；纳入已完成的 M1 Independent Review |
| Commit or Artifact Identity | 产品 Workspace 无 Git；使用下列文件 SHA-256 |
| Contribution to M1 Exit | M1-S1 已满足技术退出与 User Human Gate；M1 总体仍需 M1-S2 至 M1-S5 |

### 实施边界

- 只实现手工非施法角色所需的最小长期卡、投影、实例资源、事件和战后候选差异。
- 不实现 Excel、完整八区角色详情、多职业施法、法术资源池、武器精通自动化或关联单位。
- 不修改规则数据来源区、LoreBuddy、未筛选数据集、原始 Excel、v0.1.0/v0.2.0 发布包或冻结记录。

### 实际变更

1. 新增 `src/characters.js`：
   - 最小 `CharacterSheet` revision 与长期 `CharacterRecord`；
   - `CombatProjection` 和带角色修订引用的遭遇成员；
   - 实例资源消费与补偿；
   - `PostCombatDiff` 生成、过期修订拒绝、字段白名单和 revision `N+1` 写入。
2. 更新 `src/app.js`：
   - 长期角色卡使用独立的 `dnd-terminal.v0.3.0.character-records` localStorage，不接管 v0.2.0 会话存储；
   - 手工非施法角色最小 UI；
   - 当前遭遇准备和已开始战斗均可从冻结修订生成投影；
   - 投影、遭遇成员与 `CombatantInstance` 保留独立快照和可审计 ID；
   - `combatant.resource.changed` 记录 `before / after`，并进入补偿撤销白名单；
   - 战斗结束生成候选差异；待审核时阻止清场、新建会话和重置验证数据；
   - DM 逐项勾选后追加 `character.writeback.confirmed` 事件，仅接受字段形成新修订；全部拒绝时不创建修订。
3. 更新 `src/encounter.js`：旧 v0.2.0 会话只补空的 `combatProjections[]` 和 `postCombatDiffs[]`，不伪造长期卡或回写历史。
4. 更新 `index.html` 与 `src/styles.css`：标识 `v0.3.0 M1-S1` 候选并提供最小角色卡/差异审核布局；会话 Envelope 继续保持 v0.2.0 兼容层。
5. 新增 `tests/characters-m1-s1.test.mjs`，并扩充 `tests/encounter-v020.test.mjs` 的非伪造兼容断言。
6. 修复 `start-dnd-terminal.command` 的重复启动故障：若 `4174` 已是 DND Terminal，则复用服务并明确用 Chrome 打开；若被其他程序占用则安全报错，不静默换端口，避免长期角色卡 localStorage 因 origin 改变而分裂。

### 失败保护与不变量

- `CharacterSheet`、`CombatProjection`、遭遇成员和 `CombatantInstance` 均通过深复制隔离；战斗消费不会触达长期卡。
- 候选差异默认未勾选；零接受字段不创建修订。
- 差异引用的长期修订不是当前修订时，整次写入在修改前失败；未知字段和不存在资源也在修改前失败。
- 长期卡与战斗会话是两个本地存储提交面；写入时先计算候选结果，失败则尝试恢复内存与长期卡存储快照并显示错误。
- 战斗结束后，只要仍有 `pending` 差异，就不能清场、新建会话或重置验证数据。

### Artifact Identity（SHA-256）

| 文件 | SHA-256 |
|---|---|
| `index.html` | `95e634648e87e3251c1aa25edf98477f0d82340af9ce735885854f9dc627e073` |
| `src/app.js` | `44dcb4accf8bbe2007e8f07eea9639f0a0be90d67574108cab2b2a0a4a9bdc00` |
| `src/characters.js` | `95235b43da7823ff4a70f2d4d997c8b41e88dad7b985ae5225ad4691313b5692` |
| `src/encounter.js` | `025d807c8266111915da938d555b4b878a830ed78909ba03e033807b9e07b223` |
| `src/styles.css` | `ec1f185b570eb6f25ed5c77aeebfafb9dc339d82567a7477ed4097b1f38f7f08` |
| `tests/characters-m1-s1.test.mjs` | `50d5be8ee1dff1329856c41c27af1d7d5608601c185f96d3c2a5196fd6b81a9e` |
| `tests/encounter-v020.test.mjs` | `d0a588b4b70da227ec1240e0b048e3ecb7b49ac8b779a4dc07e1b6f69807b57e` |
| `start-dnd-terminal.command` | `ca34657892c9cd52447a12833a0442e21b217667e976dc997f80a2e2792a016f` |

未修改的兼容证据：`src/geometry.js` 与 `tests/geometry.test.mjs` 的 SHA-256 仍分别为 `a9f55d…`、`2d5199…`，与 v0.2.0 Review 记录一致。启动器因本次验收阻塞缺陷修复而获得新 identity。

### 明确未实施

- 未读取或处理 Excel 样本，未修改任何规则来源区或 LoreBuddy。
- 未建设完整八区角色详情、攻击资料、装备、`LinkedEntity`、武器精通、施法、多职业或导入。
- 未初始化 Git、安装依赖、部署、公开发布或进入 Independent Review。

## M1-S2——长期角色卡与非施法角色详情

| 字段 | 当前记录 |
|---|---|
| Goal | 扩展长期角色卡 Schema 与完整角色详情页，用散打武者验证非施法角色的查看、编辑、结构化攻击、装备、资源、投影、回写和修订差异 |
| Approved Scope Reference | `version-work/v0.3.0/ABC.md` 第 11 节 `M1-S2` |
| Authorization | User；`2026-08-17`；在明确切换至 M1-S2 的上下文中回复“切换完成，执行” |
| Actual Changes | 已完成 M1-S1 安全迁移、八区详情、战斗快捷条、派生值审计、结构化攻击/动作/资源、轻量装备、LinkedEntity 长期关系、修订差异和攻击快照投影 |
| Verification | 4 组自动测试与语法检查通过；真实浏览器非施法端到端通过；详见 `TESTING.md` |
| Human Gate | Passed；User；`2026-08-17` |
| Implementation State | Complete / Human Accepted |
| Review State | Review Approved；纳入已完成的 M1 Independent Review |
| Commit or Artifact Identity | 产品 Workspace 无 Git；使用下列文件 SHA-256 |
| Contribution to M1 Exit | 技术退出与 User Human Gate 已满足；之后仍需 M1-S3 至 M1-S5 |

### 当前实施边界

- 实现八个动态信息区域、战斗快捷条、派生值审计、`AttackProfile`、动作/资源、轻量装备、`LinkedEntity` 数据与修订差异。
- 修复 `M1-S1-O1`：创建按钮改为面向用户的创建文案，初始 revision 机制放入辅助说明。
- 使用散打武者验证非施法端到端流程；规则来源不足时保持 `unknown / needs-review`，不得虚构武器精通。
- `LinkedEntity` 在本 Slice 建立长期关系数据与角色页入口；其独立战斗物化属于 `M1-S5`，不得提前实现。
- 不读取 Excel，不实现施法/多职业骨架或武器精通战斗自动化，不进入 `M1-S3` 及以后范围。

### 实际变更

1. `src/characters.js` 的 Schema 升至 `0.3.0-m1-s2`：
   - 对 M1-S1 长期卡执行加载时加法迁移，不丢失原字段或修订历史；
   - 增加身份/起源、`classes[]` 基础构成、六项属性、豁免/技能手工结果、战斗快捷条、`AttackProfile[]`、动作、资源、轻量装备、`LinkedEntity[]` 与显式武器精通状态；
   - 增加派生值审计对象、revision N+1 写入与人类可读修订差异；
   - 攻击、动作、装备、武器精通状态与关联关系随投影、遭遇成员、参战实例深复制。
2. `src/app.js`、`index.html` 与 `src/styles.css`：
   - 建立长期角色侧栏与独立完整详情页；八区按角色能力动态呈现，非施法角色隐藏法术区；
   - 战斗快捷条保持高频信息，派生值可展开查看输入、计算值、覆写、有效值和理由；
   - 手工表单可创建与编辑身份、属性、豁免、技能、攻击、动作、资源、装备、关联单位和备注；编辑创建新修订；
   - 战斗 Tab 显示投影中的只读攻击快照与动作，不自动掷骰、命中或伤害；
   - 修复 `M1-S1-O1`：主按钮改为“创建长期角色卡”，初始修订语义移到辅助说明。
3. 新增 `tests/characters-m1-s2.test.mjs`，覆盖旧卡迁移、审计覆写理由、显式 unknown、投影隔离、修订不可变、修订差异、八区声明和 UX 文案。
4. `docs/ARCHITECTURE.md` 仅按已实施事实补充 M1-S2 长期角色边界；未修改规则 Authority 或数据来源。

### 失败保护与不变量

- 手工输入的 AC、先攻、熟练与被动察觉以 `needs-review` 覆写保存；没有已准入计算输入时不自动推导六项属性调整值。
- 武器精通固定为 `unknown`、空 Grant/Selection；不会因为职业名称是武僧而自动授予。
- 修改长期卡标量时同步重建对应审计值，避免快捷条与审计详情不一致；浏览器首次发现并修复了 AC `17` / 审计 `16` 的回归。
- `LinkedEntity` 当前只保存关系并标记 `deferred-to-m1-s5`；没有战斗物化入口，不共享角色 HP 或行动轮。
- 战斗消费、候选默认不勾选、逐项确认与 stale diff 保护继续沿用 M1-S1 不变量。

### Artifact Identity（SHA-256）

| 文件 | SHA-256 |
|---|---|
| `index.html` | `e75a01fe8bfe74c44ec472314815c26a66e7c3106c3f1df8a0c172fc35d166d5` |
| `src/app.js` | `e6272237f4f236136f4e6b66f3218a3e11b88682f8d37f6ea4c7ad152a94030f` |
| `src/characters.js` | `47975f25e0c0df7f253e0a1e49e66c1dd44c7640e374e60932cfcb8467d16e32` |
| `src/styles.css` | `feacfe4e53bfd009a20c6bd1b97fff196c692325cf50cddb7a88e330d7d353fb` |
| `tests/characters-m1-s2.test.mjs` | `c2f8febd9a728d76c01b78563b1b320d81df9cda61345d5139e049c4f823200c` |

未修改的兼容文件 SHA-256：`src/encounter.js` 为 `025d807c…`，`tests/characters-m1-s1.test.mjs` 为 `50d5be8e…`，`tests/encounter-v020.test.mjs` 为 `d0a588b4…`，`tests/geometry.test.mjs` 为 `2d5199f2…`，启动器为 `ca346578…`。

### 明确未实施

- 未读取 Excel，未创建 `CharacterDraft`，未实现施法 Profile、多职业资源池或同名法术多个 CastingOption。
- 未实现武器精通 Grant/Selection、触发、效果或补偿；未实现 LinkedEntity 战斗物化。
- 未安装依赖、初始化 Git、部署、公开发布、进入 Independent Review、Release 或 Archive。

## M1-S5——最小战斗接入（Amendment 1）

| 字段 | 当前记录 |
|---|---|
| Goal | 在不成为全量规则引擎的前提下，贯通武器精通候选、关联单位独立物化、施法/库存事件与战后逐项决定 |
| Approved Scope Reference | `ABC.md` 第 13 节 `M1-S5 Amendment 1` |
| Authorization | User；`2026-08-21`；批准 Amendment 1 并明确授权实施 |
| Implementation State | Complete / Human Accepted；User / `2026-08-21` |
| Review State | Review Approved；纳入已完成的 M1 Independent Review |

### 实际变更与边界

1. `src/characters.js` 升级 Schema 至 `0.3.0-m1-s5`：投影/实例加入独立 `inventoryBalances`；新增库存变更、关联单位投影和逐项 `accept / reject / correct` 的战后原子修订。旧修订及旧 localStorage 键不会被覆盖。
2. `src/app.js` 只从 `M1-S4` localStorage 兼容读取，后续保存写入新的 `dnd-terminal.v0.3.0-m1-s5.*` 键。DM 确认攻击结果后才写 `attack.outcome.confirmed`；只有显式 DM 选择、`phb2024:vex`、命中且造成伤害时才生成候选。应用/跳过均为独立事件；侵扰效果在来源下一回合结束到期，可补偿撤销。
3. 规则接入仅使用 `rules-baseline.md` 的本地 Markdown 锚点：游荡者精通资格、武器表、Nick/Vex。Nick 保持 DM 手动；其余未准入词条不自动化。导入仅在 DM 明确选择的 `匕首`/`短弓` 上写入稳定 ID，不以职业名称或未选择武器推断资格。
4. 关联单位只能在第 0 回合从 `LinkedEntity.templateRef` 的显式 UnitTemplate 绑定物化；每个 `(CombatProjection, LinkedEntity)` 仅一次，生成独立快照、棋子、HP 与行动轮。确认遭遇事件保留映射；不按名称猜测模板。
5. 正式施法确认、库存余额变化和战后差异都只改实例；长期卡仍经逐项决定生成 N+1 修订。更正要求数值和原因，拒绝字段不写入。
6. 修复 `M1-S4-O1` 的页面版本/页脚表述；不修改规则来源、原始 Excel、Release、Archive 或部署。
7. `2026-08-21` Chrome 投影实战缺陷修复：事件在页面内仍保留可补偿撤销的完整检查点，但写入 `localStorage` 前会剔除该瞬态 `before / after` 快照，避免每个事件重复保存 `CharacterSheet / CombatProjection` 而耗尽浏览器配额。保存失败改为保留当前内存状态、显示可见错误并继续渲染，因而不会在结束战斗的收口事件后卡住界面。结束确认改为页内面板；刷新后的历史事件没有检查点，撤销会安全提示而不会恢复不完整状态。
8. `2026-08-21` 关联单位模板 ID 缺陷修复：此前示例误写为运行时不存在的 `scout`；实际旧验证斥候模板 ID 为 `preset-scout`。单位库现在显示每个实际 `UnitTemplate ID`，空表单提示改用有效 ID，错误提示回显填入值并要求从单位库复制。既有角色修订保持不变；修正绑定必须由 DM 另存为新修订。
9. `2026-08-21` 投影容量缺陷修复：每个角色投影的完整 `sheetSnapshot` 和其在 `EncounterMember / CombatantInstance` 中的重复 `combatProjectionSnapshot` 都不再写入持久化会话；投影的战斗字段、角色修订引用、HP、资源、法术、装备和战后差异基线仍会保存。上述审计快照仅在当前页面内存中保留，刷新后不再可恢复，换取多角色投影和关联单位可持续保存。
10. `2026-08-21` Chrome 缓存复查：主入口已加载 `app.js?v=20260821-4`，但其压缩依赖仍使用无版本 URL，不能证明 Chrome 执行了最新压缩器。依赖与入口统一升级为 `v=20260821-5`；配额错误同时显示压缩后会话大小，便于区分会话结构过大和同源其他持久数据占满配额。
11. `2026-08-21` 保存错误分类修复：现场 `v=20260821-5` 错误未显示已序列化 KB，证明异常发生在写入之前，不能继续归类为 `QuotaExceededError`。`persist()` 现按压缩、序列化、写入三个阶段标记；只有写入阶段的真实 `QuotaExceededError` 才显示配额提示，其余错误回显阶段、异常名称和消息。入口与压缩依赖统一升级为 `v=20260821-6`。
12. `2026-08-21` 关联单位函数泄漏修复：现场真实异常为 `DataCloneError`，原因是 `materializeLinkedEntity()` 把 ID 生成器 `uid` 本身传给 `createEncounterMember()`，使关联成员的 `id` 字段成为函数。调用修正为 `uid()`；运行时合同测试确认关联成员 ID 为字符串，关联投影与遭遇成员整体可被 `structuredClone`。入口与依赖统一升级为 `v=20260821-7`。

### Artifact Identity（SHA-256）

| 文件 | SHA-256 |
|---|---|
| `index.html` | `4b195cf8041fb3b30cbd98f53bfa3a3ba1a9e426b1222175c579858d314cc8e5` |
| `src/app.js` | `e718c38b1935c96b0859472235119e7b23823f902d872ff0430497c3a80feb2c` |
| `src/session-persistence.js` | `8219798b0a322e13b6feeffefe7355557fc5aa756dcbc49689863d64624668ac` |
| `src/characters.js` | `5631d853e66ca2fe78d536666a9a0597220200389e842b6227a741d9ceb12eed` |
| `src/character-import.js` | `1d0a41d576e8f8bd47f75f87dcf9ee21e860ae2223c01de668871cecdabedebb` |

## M1-S5 Amendment 2——验收后稳定化实施

| 字段 | 当前记录 |
|---|---|
| Approved Scope Reference | `ABC.md` 第 14 节 `M1-S5 Amendment 2` |
| Authorization | User；`2026-08-21`；批准 Amendment 2 并明确“新增后可直接执行” |
| Implementation State | Complete；`M1-S5-STAB-1` / `M1-S5-STAB-2` |
| Human Acceptance | Passed；User / `2026-08-24` |
| Review State | Review Approved；User 已批准 Independent Review |
| Rules Baseline Change | 无；未新增规则 Entry、未修改来源或原始 Excel |

### STAB-1 实际变更

1. 战后候选差异加入字段级校验：更正值必须为非负数，更正原因必须非空；错误字段添加红色状态、`aria-invalid` 和行内提示，自动聚焦首个错误并阻止写回。
2. 关联单位编辑从文本行升级为可增删卡片：名称、类型、关系、备注和 UnitTemplate 选择器均图形化；旧文本格式只作为兼容解析路径保留。
3. 角色详情“关联单位”页签直接提供本场模板选择和“生成棋子并加入遭遇”；本场模板选择不回写角色卡。内部 `LinkedEntityProjection`、去重和遭遇确认映射保持不变。
4. 用户可见“物化”用词改为“生成棋子”；修复武器精通效果来源误显示为“地图范围”的问题，并显示候选状态、目标、来源、到期和不自动结算边界。

### STAB-2 实际变更

1. `src/characters.js` 为角色记录增加 `status`、`archivedAt`、`archivedReason`；旧记录加载时兼容为 `active`。
2. `src/app.js` 增加归档、恢复和永久删除入口；归档角色不出现在活动列表且不可生成新投影；永久删除要求角色名称确认，并阻止当前投影/待审核差异引用下的删除。
3. 角色记录采用 copy-on-write；删除失败不修改长期修订、会话投影、事件或模板库。

### Amendment 2 用户复测缺陷修复（2026-08-21）

1. 武器精通状态从攻击参考区移到战斗 Tab 的“当前选中者状态”内，使用独立“武器精通”标题；Vex 从来源单位与承受目标两个视角都可看到来源/目标、到期和人工结算边界。
2. 新增 `characterArchiveBlockers()` 双层防呆：当前战斗仍有角色投影，或战后仍有 `pending` 候选时，归档按钮禁用且命令层再次拒绝；已存在的归档异常数据在候选区显示恢复/废除提示。
3. 每份 `PostCombatDiff` 显示战斗实例短 ID。首份候选写回 revision N+1 后，其他基于 revision N 的候选显示过期原因并禁用写回；新增“废除本份战斗候选差异”，领域函数返回独立 `abandoned` 副本，UI 追加 `character.writeback.abandoned` 事件，长期角色卡和其他候选不变。

### Amendment 2 武器精通可读性与长休配置追补（2026-08-24）

1. `src/characters.js` 增加冻结的 `M1_S5_WEAPON_MASTERY_CATALOG`，只覆盖已准入的匕首/Nick 与短弓/Vex。目录同时保存稳定武器/词条 ID、玩家可读效果和自动化边界；没有新增或修改 Rules Baseline Entry。
2. 战斗 Tab 的独立“武器精通”区拆成“当前长休配置”和“本场候选与生效状态”。当前配置随 `CharacterSheet → CombatProjection → CombatantInstance` 深复制并在触发前常驻显示；Vex 生效后另行显示其优势收益、来源、目标和到期。
3. 角色“动作与能力”页增加图形化长休选择。`weaponMasteryEligibleAttacks()` 只返回已熟练且命中冻结目录的攻击；`reviseWeaponMasterySelections()` 校验资格、更换时点、至少一项、上限、稳定 ID 与必填 DM 说明，再以 revision N+1 保存选择并同步 `AttackProfile.masteryEnabled`。
4. 当前战斗投影或 `pending` 战后候选仍引用角色时，UI 与命令入口都阻止长休重选；成功重选不会原地覆盖历史修订，也不会污染既有战斗投影。
5. Vex 仍是唯一自动生成候选的词条；Nick 只显示效果说明，不自动改变动作经济、生成额外攻击或写战斗事件。

### 变更文件

- `index.html`
- `src/app.js`
- `src/characters.js`
- `src/styles.css`
- `tests/m1-s5-contract.test.mjs`
- `tests/persistence-m1-s5.test.mjs`
- `tests/m1-s5-stabilization-ui.test.mjs`
- `tests/character-lifecycle-m1-s5.test.mjs`
- `tests/character-ui-m1-s3.test.mjs`

### Artifact Identity（SHA-256，Amendment 2）

| 文件 | SHA-256 |
|---|---|
| `index.html` | `5211ae6c6074625a75343785679f173e8940d704d85d9db01477ed8b07dfb072` |
| `src/app.js` | `578975da6374a9774152a5d0f72846409a632cc4607a47eb9d90c3f2cb5df7cf` |
| `src/styles.css` | `1bc9496555f6c407a674ecf59826c9bb0b1e115f16d979a54ef0274eb1beb377` |
| `src/characters.js` | `93b25ab450e3870a49ee1346f7245b27aa7c0a7f0e48806d144a7e6d1edbb3a6` |
| `tests/m1-s5-contract.test.mjs` | `cd4fff15fcd2de7cdc0bcf5789616f5977ef074bf6fe8eb0c0e0f8c18596898e` |
| `tests/m1-s5-stabilization-ui.test.mjs` | `01c596a7a39a044591a4ef252e0e6e76ee1696cc6af2cd0f320e67a4f0f036ef` |
| `tests/character-lifecycle-m1-s5.test.mjs` | `314cf113cabfc4bd2615ece3392e8a0f192588ae29fb9bb21699a0601b4cd2bf` |
| `tests/persistence-m1-s5.test.mjs` | `03f27eeb2566b4943cb0d540d7fa4e5099d55a612be1f3b20dcce3e1ababdc91` |
| `tests/character-ui-m1-s3.test.mjs` | `336997882b98b0073302e028bcd1826ee34af6b66a41482f42073a96cf9613dd` |

### 明确未实施

- 不自动掷骰、判定命中/伤害、选择目标、执行 Nick 或其余六项精通，也不建立全量规则合法性引擎。
- 未取得原始莉亚 Excel 时，不声称其真实文件端到端回归通过；冻结输入身份仍只作验证向量。
- 本节实施阶段未自行进入 User Human Acceptance、Independent Review、Release、Archive、部署、公开发布或 Git 操作；后续 User 已于 `2026-08-24` 完成人工通过并授权 Independent Review。

## M1-S4——施法、多职业与多资源池骨架

| 字段 | 当前记录 |
|---|---|
| Goal | 让多个施法来源、资源池、同名法术的多种施放方式安全贯穿长期卡、投影、实例、事件和战后候选差异 |
| Approved Scope Reference | `version-work/v0.3.0/ABC.md` 第 11 节 `M1-S4` |
| Authorization | User；`2026-08-18`；明确“授权实施m1s4” |
| Implementation State | Complete / Human Accepted；User / `2026-08-18` |
| Review State | Review Approved；纳入已完成的 M1 Independent Review |
| Verification | 语法检查与 8 个自动测试脚本通过；Chrome 本机浏览器验证三类受控夹具通过；详见 `TESTING.md` |
| Contribution to M1 Exit | 建立复杂施法数据链和隔离消费；M1 仍需未授权的 M1-S5 |

### 实际变更

1. `src/characters.js` 将长期角色 Schema 加法升级为 `0.3.0-m1-s4`：新增 `SpellcastingProfile[]`、`SpellResourcePool[]`、法术状态和每个法术的 `CastingOption[]`；旧卡迁移为空集合，不猜测施法来源或规则资格。
2. `CharacterSheet → CombatProjection → EncounterMember → CombatantInstance` 深复制上述施法集合。`applyCombatSpellResourceChange()` 只改当前实例余额；产生 `combatant.spell-resource.changed`，可经既有补偿撤销恢复。
3. 战后差异新增 `spell-resource` 候选。默认不接受；DM 逐项接受后才以 revision N+1 写入长期卡，战斗不会直接写回长期卡。
4. 角色详情新增法术页：来源、属性/攻击/DC 状态、资源池、法术书/已知/准备/始终准备/本场可用，以及可见的“N 种施放方式”。无明确准入与版本的字段保持 `unknown / needs-review`。
5. 受控夹具覆盖：15 级塑能师（法术书、准备、法术位）、法师 5/牧师 3（双 Profile、双属性、共享待核验资源池、无高环自动取得）、莉亚混合来源（种族与背景/专长两条 Profile、两份免费次数、同名占位法术的两种 CastingOption）。Excel 导入的高等精灵仅生成待确认 skeleton，不从工作簿公式或规则文本推断法术。
6. 新增 `tests/spellcasting-m1-s4.test.mjs`、`tests/spellcasting-ui-m1-s4.test.mjs`，并更新既有迁移、导入和 UI 回归断言。`index.html` 入口版本参数更新为 `20260818-3`。

### 失败保护与明确未实施

- 多职业施法贡献、法术攻击/DC、法术取得资格和“有高环法术位即自动拥有高环法术”均不自动计算或推断。
- 不执行法术效果、目标、伤害、条件、玩家端骰点触发或特效；这些不因夹具展示而成为规则引擎。
- 不实现 M1-S5 的武器精通战斗触发、关联单位战斗物化、四角色汇总验收，也不进入 Independent Review、Release、Archive、部署、公开发布或 Git 操作。

### Artifact Identity（SHA-256）

| 文件 | SHA-256 |
|---|---|
| `index.html` | `83949647b189586e23880df85aec46cea3257e2f93d55f339773a64eae7d4b61` |
| `src/app.js` | `d14bce02fd6330cb7b3c0b550ddc9f4d9aae951a75eb0dc013de609cf3b04828` |
| `src/characters.js` | `4ff2b01c02c3bb0a0df28f928bb9af906081bb49bd54b8690dc3ba2eab2b8cc5` |
| `src/character-import.js` | `1d0a41d576e8f8bd47f75f87dcf9ee21e860ae2223c01de668871cecdabedebb` |
| `tests/spellcasting-m1-s4.test.mjs` | `3c287f16f7b72b6619f24cf53eff8552665b12add834c5f378250806f15715d5` |
| `tests/spellcasting-ui-m1-s4.test.mjs` | `7831cdc0d1af07e44f09f0b80191e9368f38581197e582372337f8e189f3004b` |
| `tests/character-import-m1-s3.test.mjs` | `9891c571ca803b68c7efa47587487cac3f76c31b54ce8c862ffc375536edff4a` |
| `tests/character-ui-m1-s3.test.mjs` | `ea16b2e9971b3ac8b67983a17868c3858063eece7a25e156e31c10fee139236f` |
| `tests/characters-m1-s2.test.mjs` | `e604160db7bd3ff5596bba9218a8c317b9b87e142e55ea117ed901caf74e6f76` |

## M1-S3——受控 Excel Profile 与莉亚导入

| 字段 | 当前记录 |
|---|---|
| Goal | 仅以冻结的悲灵 DND 5.5E 人物卡 `1.0.15` Profile，将莉亚 `.xlsx` 的允许输出单元格读为 `CharacterDraft`，经 DM 确认才创建或修订长期卡 |
| Approved Scope Reference | `version-work/v0.3.0/ABC.md` 第 11 节 `M1-S3` |
| Authorization | User；`2026-08-17`；明确要求“实施s3” |
| Implementation State | Complete / Human Accepted；User / `2026-08-18` |
| Review State | Review Approved；纳入已完成的 M1 Independent Review |
| Input identity | SHA-256 `939d43cb1a33ec7c77ef4f2e96cef83c711dda31f2d7004d91418ac61bdc8711`；大小 `1,748,788` bytes；仅本地私有验证输入，不复制到产品内容 |

### 实际变更

1. 新增 `src/character-import.js`，仅支持 `beiling-dnd55e-character-sheet@1.0.15`：
   - 浏览器内直接读取本地文件，限制大小为 `1 byte` 至 `8 MiB`，计算 SHA-256；未向网络发送文件；
   - 只解析 XLSX ZIP 中必要 XML，严格要求 18 个工作表、指定工作表及结构标记；
   - 显式拒绝加密 ZIP、`vbaProject.bin`、`xl/externalLinks/` 和任意 `TargetMode="External"` 关系；不执行或重算公式、宏、脚本、外链、嵌入代码或工作簿内置规则数据库；
   - 只允许读取冻结输出区：身份/属性/战斗快捷值、`主要` 的豁免与技能标识、特性/专长板块、武器/装备板块，以及 `背包` 的三个物品容器；所有公式缓存值带位置与警告，财务账本继续排除。
2. `src/app.js` 与 `index.html` 增加受控 Excel 入口：
   - 文件首先成为内存中的 `CharacterDraft`；页面显示映射、缺失、默认值、公式缓存警告、冲突与未映射范围；确认前不创建或覆盖 `CharacterSheet`；
   - 莉亚导入的明确 `武器精通` 职业特性会使当前选择由 DM 从已熟练武器候选中确认（最多两种）并写入补充说明；没有该导入特性的角色不要求补充、不会创建 Grant。高等精灵施法来源冲突必须由 DM 写入暂行处理。导入器不自动选择武器、规则效果、施法属性或施法 Profile；
   - 首次确认创建 revision 1；同 SHA-256 重导入只显示候选差异，并只能经“创建新修订”进入 revision N+1；安全拒绝不会改动现有角色库；
   - 处理 `M1-S2-O1`：攻击卡片改为“攻击加值：待填写 · 伤害：待填写”。
3. 用户验收期间补齐冻结 Profile 的可见角色内容：
   - 豁免与技能把 `X/黑色`、`O/蓝色`、`🅞/紫色` 分别保存为 `none`、`proficient`、`expertise`，同时保留结果值、原始标识和来源位置；
   - 导入职业/子职、种族、专长、战斗风格与特殊能力板块；它们作为 `imported-needs-review` 的展示事实，不执行其中规则文本；
   - `主要` 武器/装备与 `背包` 物品进入轻量装备和容器模型；莉亚样本当前识别 4 条武器、15 件装备/物品与 2 个实际容器；原表“同调”标识只保留原值，不自动解释为已同调；
   - 武器固有精通词条与角色当前选择分离；Profile 保存“最多两种、完成长休时可重选”的待复核资格骨架，当前选择只有 DM 确认后才启用；
   - Excel 来源角色以后通过简化表单创建新修订时，未暴露在表单里的特性、容器、精通选择和来源回执会被保留，避免静默数据丢失。
4. `src/characters.js` Schema 版本升至 `0.3.0-m1-s3`，在既有 `source` 中保留 `importerId`、Profile 版本、文件名、文件 SHA-256 和受限映射回执；修订差异忽略稳定 `characterId`，避免同源导入预览误报身份变化。
5. 新增 `tests/character-import-m1-s3.test.mjs`，并更新 M1-S2 迁移预期以覆盖 M1-S3 Schema。
6. 用户于 `2026-08-18` 明确授权本 Slice 的角色详情 UI 验收整改：
   - 以用户提供的莉亚角色页作为视觉与信息架构参考，重做为真实可切换的档案页签；战斗概览、检定与熟练、动作与能力、装备、起源与经历、关联单位、导入与修订均可切换，非施法卡继续动态隐藏法术页签；
   - 详情页改为紧凑的角色头部、属性/常用战斗信息、攻击展开卡、分组装备和来源/修订视图；豁免、技能、特性、武器精通与容器仍只显示结构化导入或手工事实；
   - 明确标注“展示事实，不自动触发”：警觉、偷袭、暗杀等导入特性不被合并到攻击伤害，也不生成自动先攻、命中、伤害或条件触发；法术计算仍留在 M1-S4，武器精通战斗效果仍留在 M1-S5；
   - 新增 `tests/character-ui-m1-s3.test.mjs`，覆盖页签、边界文案、容器分组与视觉样式钩子。该 UI 改动不改变 `CharacterSheet`、`CombatProjection`、`CombatantInstance` 或 `CombatEvent` 的数据边界。
7. 用户于 `2026-08-18` 授权修复跨角色武器精通泛化缺陷：
   - `mappedWeaponMastery()` 只检查受控导入的 `class-feature / 武器精通`；删除此前从角色类别隐含出的资格来源，不根据职业名称、武器固有 `masteryTerm` 或非特性字段创建 Grant；
   - 明确特性仍产生待 DM 确认的两格资格骨架，保持莉亚流程；无该特性的角色保存为 `not-applicable`，没有缺失项、确认表单或详情页的伪精通提示；
   - 新增非精通夹具并验证其状态会持久化到 `CharacterSheet`，同时增加详情页无资格显示断言。既有本地 revision 不被静默改写；须经同一 Excel 重新导入并由用户确认，才可能形成新修订。

### 失败保护与不变量

- Profile 不匹配、损坏文件、宏、外链或加密输入均返回 `CharacterDraft: rejected`；不会触及长期卡、遭遇或原始 Excel。
- 导入器只读允许单元格；不保存完整工作簿、图片、外链目标、嵌入代码或资料表内容到 Draft、角色卡或产品发布物。
- 输入 SHA 一致只代表验证向量，不代表规则 Authority；非验证向量即使结构匹配也显示人工核对警告。
- 导入数值来源为 `imported-needs-review` 或带 `formula-cache` 回执；无已准入规则输入时仍不自动计算武器精通效果、施法 Profile、攻击、装备或法术资源。

### Artifact Identity（SHA-256）

| 文件 | SHA-256 |
|---|---|
| `index.html` | `2bd40b2af5d9c477bafe3f66d531b47e543bfa8f1a887cbef6b3c0273e5cf989` |
| `src/app.js` | `ee839c4954819657530aa2c3fd2637629c084cc7afe6884253c11638f7f4089c` |
| `src/styles.css` | `0686a1d23f0a43dbf37e329f5a504552afd6aa95975323d4683215705ab0192a` |
| `src/characters.js` | `b025ec1e17c3c32fe61919400ead306ccbeabef9cc7eaac76a03e47b1d7e1846` |
| `src/character-import.js` | `6b540276e883187f699977e385b02b1e32a8310882033124949aa8a0ad8c653e` |
| `tests/character-import-m1-s3.test.mjs` | `731d8b89ccc78484aef147497520117325488ca10c742840884c65abf85fe945` |
| `tests/characters-m1-s2.test.mjs` | `32db06a4f9c9d09a41ae6fe726d229b9be8eb515a543b5cf6b93a304914acba7` |
| `tests/character-ui-m1-s3.test.mjs` | `f452150f95b18721e7ead0f42a4cc24dd75ce6790c0cdc326e9910758e0e8ee3` |

### 明确未实施

- 未实现 M1-S4 的 `SpellcastingProfile`、`SpellResourcePool`、多职业计算、法术取得/准备状态或 `CastingOption`；莉亚的施法歧义仅显示为 DM 必填的暂行处理。
- 未实现 M1-S5 的规则准入精通 Grant、攻击触发、战斗效果、事件/撤销、关联单位战斗物化或四角色汇总验收；M1-S3 只有导入待复核资格与 DM 当前选择。
- 未安装依赖、初始化 Git、部署、公开发布、进入 Independent Review、Release 或 Archive。
