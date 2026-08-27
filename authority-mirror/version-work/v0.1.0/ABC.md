# ABC：v0.1.0 基础战斗闭环验证

- **Delivery ID：** `v0.1.0`
- **Status：** Approved/Frozen Contract; v0.1.0 Released / Archived — Local Private
- **Draft Date：** `2026-07-30`
- **Approving Authority：** User
- **Approval Date：** `2026-07-30`
- **Implementation Authorization：** Granted by User
- **Current Stage：** Implementation
- **Documentation Authority：** `/Users/chenzehao/Vaults/obsidian/obisidian/理工学习相关/DND Terminal`
- **Product Workspace：** `/Users/chenzehao/Projects/DND Terminal`

本 ABC 是待批准的施工合同。它不授权产品代码、依赖安装、网页实现、Independent Review、Release 或 Archive。

## 1. Goal

验证模板、长期角色卡、战斗实例、行动轮、二维地图、范围模板、状态、资源、事件、保存恢复与选择性回写能否组成单一、一致、可撤销、可复盘的闭环。

## 2. ESG 适用性审计

### 拟采纳

- `schema-v0.2.0` Minimal Governance Framework；
- `schema-v0.3.0` Downstream Documentation Schema Core。

触发事实：项目持续演进；有 `v0.1.0` 交付身份；需要批准、Implementation、专门测试、真实 DM 验收、Independent Review 与可能的 Release。

### Milestone Documentation Profile

`Not Applicable`。当前只使用语义化 Implementation Phase，没有 Milestone 管理多个 Slice、跨 Slice Exit Gate、Milestone/Product Version 双轴、当前长期 Profile 裁剪或规范簇事实。

若未来出现任一触发事实，必须在下一交付前重新审计；不得继续用 Implementation Phase 规避 Profile。

### Archive

初始批准时不声明 `Archived`，因此未采纳 Archive Contract 或 Lightweight Profile。该初始决定已由本文 `2026-08-04 用户批准：本地私有 Release 与 Archive` 修订覆盖；本地私有归档证据见 `ARCHIVE_SUMMARY.md`。

### Provisional Local Extensions

| Extension ID | Path | Unique Role | Owner | Review Point | Proposed Disposition |
|---|---|---|---|---|---|
| `local.project-authority` | `docs/extensions/project-authority.md` | 项目级权威与门禁 | User | v0.1.0 Review | Stable Local Extension |
| `local.product-requirements` | `docs/extensions/product-requirements.md` | 长期产品需求 | User | v0.1.0 Review | Stable Local Extension |
| `local.dnd-rules-baseline` | `docs/extensions/rules-baseline.md` | 外部规则证据、冲突与选择 | User | v0.1.0 Review | Stable Local Extension |

## 3. A — Implementation Scope

用户批准后，只允许：

### A-1 工程骨架

- 只在产品 Workspace 中选择最小前端与测试技术栈；
- 只在产品 Workspace 中建立可本地运行的单页网页；
- 不安装或实现任何未为 v0.1.0 验收直接使用的基础设施。

技术栈选择属于 Implementation 细节，但必须记录理由、替代方案、版本锁定、迁移与回滚。

### A-2 数据模型

实现未来可迁移的：

- `UnitTemplate`、`CharacterSheet`、`CombatantInstance`；
- `CombatSession`、`TurnState`、`MapState`、`EffectInstance`；
- `CombatEvent`、Snapshot、导入导出 Envelope；
- 稳定 ID、Schema Version 与模板 Revision。

### A-3 标签页与共享状态

实现战斗、地图、角色、单位库、日志、掷骰与设置标签；标签可隐藏但全部操作同一个权威战斗会话。

### A-4 战斗闭环

- 模板创建独立实例；
- 先攻、平局、先攻组、轮次与回合推进；
- 动作、附赠动作、反应、移动力重置与消耗；
- HP、临时 HP、资源、法术位、状态、专注与持续时间；
- DM 人工修改。

### A-5 二维地图

- 可配置空白方格地图；
- 鼠标与触屏棋子选中、拖动和当前行动者高亮；
- 1×1、2×2、3×3、4×4 占位；
- 路径、计算距离、实际移动消耗与高度字段；
- 不做墙体、视线、掩护、碰撞或三维判定。

### A-6 范围与批量结算

- Circle、Cone、Line、Square 与 Self/Free placement；
- 实时覆盖格与候选单位；
- 松开后保留预览；
- DM 增删边缘目标；
- 确认后批量伤害、治疗、Buff 或状态；
- 保存计算目标、人工覆盖与最终目标。

### A-7 事件、保存与回写

- 自动保存、新建、手动保存、读取、刷新恢复；
- 完整 JSON 导出/导入；
- 一键重置验证数据；
- 撤销上一步有效操作，使用补偿事件；
- 人工修正事件；
- 战斗结束差异审查与逐角色、逐字段选择性回写。

### A-8 骰子

- `NdM±K`、d20 优势/劣势、公骰/暗骰、常用公式；
- 自动先攻；
- 随机结果事件化；
- 不自动判断能力合法性，不实现完整攻击/豁免/抗性规则引擎。

### A-9 验证数据与固定遭遇

只录入 Rules Baseline 的 3 个怪物、3 个 NPC 和 2 个 15 级验证角色。执行 `TESTING.md` 的固定遭遇。

### A-10 生命周期记录

Implementation 开始时创建 `IMPLEMENTATION.md`；专门测试事实追加到现有 `TESTING.md`；Implementation 完成后停止并请求 Independent Review，不自行创建 Review verdict。

## 4. B — Protected Boundaries

不得：

1. 修改 LoreBuddy、其 GPT Export、其他 Obsidian 项目或任意规则 Source；
2. 在产品 Workspace 中创建项目文档或第二套 Authority；
3. 在用户批准前编写产品代码或安装依赖；
4. 把旧版、第三方或模型常识静默混入规则基线；
5. 把规则资料的目录名写成已验证官方授权；
6. 合并模板、长期角色卡和战斗实例；
7. 让标签页各自保存可互相覆盖的战斗副本；
8. 在战斗期间直接修改角色卡；
9. 删除或无痕改写事件；
10. 让未确认范围预览产生状态变更；
11. 自动断言墙体、视线、掩护、碰撞、垂直空间或所有技能合法性；
12. 扩大 Validator 或实现完整规则引擎；
13. 初始化 Git、配置远端、部署、Release 或 Archive；
14. 使用 `M0`、`M1`、`M2` 表示本项目开发阶段；
15. 将 Draft、Planned、测试计划或 Implementation 自述写成 Approved/Passed/Released。

## 5. C — Explicitly Deferred

本 ABC 明确延期 Product Requirements 与 Backlog 中的全量内容库、完整职业/规则引擎、规则搜索、六角格、3D、美术/复杂地图、墙体/视线/掩护、多人、账户/房间、NAS、公平性骰子、复杂动画、完整召唤控制、公共发布和 Archive。

## 6. Expected File Changes

批准后预期新增：

- 产品 Workspace：应用源码、样式、测试源码、固定 Fixture、依赖锁与构建配置；
- 文档 Authority：`version-work/v0.1.0/IMPLEMENTATION.md`。

具体实现路径由技术栈决定并记录在文档 Authority 的 Implementation。不得在产品 Workspace 生成项目文档；不得预先创建空 `REVIEW.md`、`RELEASE_NOTES.md`、`CHANGELOG.md` 或 Archive 文件。

## 7. 阻塞用户决定

| ID | Decision | Recommendation | Effect |
|---|---|---|---|
| D-001 | v0.1.0 默认斜向移动 | PHB 2024 `five-feet`；设置允许 DMG 2024 `five-ten-alternating` | 改变路径消耗 |
| D-002 | 范围压格算法 | DMG 2024：交叠面积至少 50%；零面积边线不算 | 改变自动候选目标 |
| D-003 | Ruleset | PHB 2024 + DMG 2024 + MM 2025 | 决定单位与规则版本 |
| D-005 | 规则资料使用边界 | 仅本地私有验证；公开发布前完成权利审计 | 避免推导未知再分发权 |

`D-001` 与 `D-002` 已决定，可冻结固定遭遇的距离与边缘目标 Expected Result。

已由用户在 `2026-07-30` 明确决定：

- Project Name：`DND Terminal`；
- Documentation Authority：`/Users/chenzehao/Vaults/obsidian/obisidian/理工学习相关/DND Terminal`；
- Product Workspace：`/Users/chenzehao/Projects/DND Terminal`；
- 全部项目生成文档只建立在 Documentation Authority。

已由用户在 `2026-07-30` 明确批准：

- D-001：默认 `five-feet`，设置提供 `five-ten-alternating`；
- D-002：连续面积交叠至少为单格面积 50%，零面积边线/顶点接触不覆盖；
- D-003：`PHB 2024 + DMG 2024 + MM 2025`；
- D-005：规则资料仅用于本地私有验证；翻译与再分发授权保持 `unknown`。

## 8. Acceptance Criteria

Implementation 进入 Independent Review 前必须：

1. A 类全部能力有实际证据，未实现项明确失败或阻塞；
2. 同一模板的多个实例状态隔离；
3. 七个标签页共享同一状态，隐藏标签不丢数据；
4. 先攻、平局、回合、行动经济与移动重置可复现；
5. 多格占位、普通/斜向路径与高度记录正确；
6. 四种范围、目标预览、人工增删与确认后批量结算通过；
7. HP、临时 HP、资源、法术位、专注与跨回合状态通过；
8. 每个有效操作、撤销与人工修正都有顺序事件；
9. 自动保存、刷新、JSON 导出/导入恢复同一战斗状态和日志；
10. 战斗结束只回写 DM 确认字段；
11. 自动、浏览器、触屏、规则人工核对与真实 DM 验收均有真实结果；
12. 固定遭遇完整执行并能从日志还原顺序；
13. 没有修改 Protected Boundaries；
14. Architecture 只保留实际实施事实，并记录与本 Candidate 的偏差；
15. 未进入 Release 或 Archive。

## 9. Compatibility and Migration

`v0.1.0` 是首个产品验证版，没有前序数据迁移。导出必须携带 `schemaVersion`；不支持的版本必须安全拒绝，不得部分导入。未来字段变更必须保留显式迁移与回滚。

## 10. Rollback

- 在 Implementation 前：只移除未批准的 DND Terminal 文档 Draft；不得删除整个 Obsidian 上级目录或产品 Workspace。
- 在 Implementation 中：保留文档 Authority、治理记录与用户数据，只回退产品 Workspace 中候选源码到最近已验证身份；不得删除失败证据。
- 数据迁移失败：保留原导出，拒绝覆盖现有战斗，记录机器可读错误。

## 11. Approval

批准记录：

```text
Governance Draft: Complete
ABC: Approved/Frozen
User Approval: Granted on 2026-07-30
Implementation: Authorized
```

本合同已冻结。范围或 Protected Boundary 的变更需要先修订 ABC 并重新获得用户批准。

## 2026-07-31 用户批准修订：地图撤销、朝向与中文范围标签

用户明确批准在 v0.1.0 实施以下补充：地图页复用补偿撤销并支持连续回溯；范围按钮采用简体中文“圆形、锥形、直线、方形”；战斗实例保存四向朝向和正面边上的可选发射口。当前行动者在自己的回合内可调整朝向与发射口，下一回合后锁定；非当前单位只能经 DM 修正事件改变朝向。所有由棋子自身引导的当前或未来效果复用该发射口；指定地图点生成的效果不使用它。

本修订明确取消本轮加入 `Sphere` / `Cylinder` 二维投影的候选，不改变现有四种范围范围。

## 2026-08-04 用户批准修订：范围收口与正式延期

用户已接受 `v0.1.0` 的框架工作流，并批准将下列未完成或未重新核验的项目移出本交付的 Implementation 完成门槛。此修订不把延期项写成已实现、已通过或规则正确；不启动 Independent Review、Release 或 Archive。

| ID | 项目 | v0.1.0 状态 | 延期后的处理边界 |
|---|---|---|---|
| `DEF-001` | 规则数值、来源映射与逐字段人工核对 | `deferred` | 当前 NotebookLM 数据来源与历史 Export 收据尚未重新映射；不得据此宣称怪物、NPC、角色或法术数值正确。 |
| `DEF-002` | 战斗结束后的逐角色、逐字段完整差异回写 | `deferred` | 现有战斗闭环不以完整回写能力为通过条件；未来实现仍须 DM 审核、逐字段确认，并不得直接改写长期角色卡。 |
| `DEF-003` | 妖精召唤术等受控召唤实例的完整表达与控制 | `deferred` | 不扩展完整召唤控制；未来仅能在明确实例模型、控制权与事件边界后另行批准。 |
| `DEF-004` | 独立玩家端及真实 `dm-only` 访问隔离 | `deferred` | 当前 `visibility` 只记录 DM 端语义标签，不构成玩家端隐藏或权限控制。 |
| `DEF-005` | 未建立的完整自动回归套件与未逐步执行的固定遭遇步骤 | `deferred` | 已有通过证据继续有效；未运行计划保留为未来回归清单，不再作为本次框架工作流接受的阻塞项。 |

`D-002` 的连续面积 50% 阈值已由 `src/geometry.js` 与 `tests/geometry.test.mjs` 落实并记录为通过；Circle/Cone 的曲线边界仍采用确定性多边形近似，不宣称无限精度解析几何。

本修订仅替代第 3 节 A-7 的“完整选择性回写”、A-9 的“完整固定遭遇”及第 8 节中与上述 `DEF-*` 对应的完成门槛；其余 Protected Boundaries、已接受框架范围及 `D-001`～`D-005` 决定保持不变。未获新 ABC 与用户批准前，不继续实施任何 `DEF-*` 项。

## 2026-08-04 用户授权：Independent Review 启动

用户授权启动 `v0.1.0` 的 Independent Review，并允许在没有需要用户单独查看的事项时按后续门禁推进。`REVIEW.md` 只能由非实现者给出 `approved` 或 `rejected` 结论；实现侧建立证据包不构成独立结论。

Release 与 Archive 仍以 Independent Review 的 `approved` 结论为前置条件。若 Reviewer 发现范围、证据、延期分类或实现身份问题，应停止后续门禁并记录问题，不得以本授权绕过它们。

## 2026-08-04 用户批准：本地私有 Release 与 Archive

用户作为非实现者 Reviewer 批准 `REVIEW.md` 的审阅范围后，授权完成 `v0.1.0` 的本地私有 Release 与 Archive。发布包、内容清单与 SHA-256 记录于 `RELEASE_NOTES.md`；Archive Gate 与归档身份记录于 `ARCHIVE_SUMMARY.md`。

该结论不构成公开发布授权，且不改变 `DEF-001`～`DEF-005` 的延期状态。任何后续功能、公开发行或规则资料再分发都需要新的交付身份与明确授权。
