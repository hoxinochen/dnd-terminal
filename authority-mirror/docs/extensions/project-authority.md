# 项目 Authority（Project Authority）

- **Extension ID：** `local.project-authority`
- **Status：** Stable Local Extension；v0.6.0 与 v0.7.0 Archived — Local Private；v0.7.1 Approved / Frozen for Integration
- **Owner / Selecting Authority：** User
- **Created In Delivery：** `v0.1.0`
- **Core Relationship：** Stable Local Extension under adopted Downstream Documentation Schema Core `schema-v0.3.0`
- **Compatible Governance Baseline：** Minimal Governance Framework `schema-v0.2.0`
- **Provisional Period：** Closed at v0.1.0 Independent Review
- **Disposition：** Stable Local Extension

## 唯一职责

本文件回答“谁有权决定本项目的产品、规则、数据、交付与实施状态”。它不复制产品需求、规则正文、架构或测试用例。

README 不能承担该职责，因为 README 是简明入口且会持续更新；ABC 不能承担该职责，因为 ABC 只冻结单次交付范围。

## ESG 关系

- 项目文档与交付记录采用 Downstream Documentation Schema Core `schema-v0.3.0`，Core SHA-256 为 `4a95a932eba5e549fa96449c178ce18ecc049513a3697b041b08dbd8736f4f4d`。
- 项目治理生命周期继续兼容 Minimal Governance Framework `schema-v0.2.0`，SHA-256 为 `84b0fbbe1dd5703acfcda63b297a115e725c79629647d807ae3664a55c4aa727`。
- Milestone Documentation Profile `schema-v0.3.0` 曾为 `M1 ↔ v0.3.0` 的多 Slice 与跨 Slice Exit Gate 采纳；其适用范围不自动延伸到后续交付。
- `v0.4.0`、`v0.5.0` 与 `v0.6.0` 均只有一个主 Slice，无跨 Slice 汇总或双轴 Milestone 退出门禁，因此适用性均为 `Core Only / Milestone Profile Not Applicable`；v0.6.0 已完成 User 授权的 Local Private Release 与 Lightweight Archive。
- `v0.7.0` 冻结 ABC 使用一个主 Slice 和五个内部 Implementation Phase，适用性为 `Core Only / Milestone Profile Not Applicable`。
- `v0.7.0 Amendment 01` 于 `2026-09-02` 获 User 批准/冻结及 Implementation 授权，现已完成实施；User 已确认人工审核通过并授权 Review，Review 已完成。User 随后授权先后执行 Local Private Release 与 Archive；Release 与 Lightweight Archive 均已完成。它不改写原 ABC、Profile 适用性或已实施事实，也不自动授权 Commit、Push、部署或公开发布。
- `v0.7.1` 于 `2026-09-10` 获 User 批准版本身份、范围文档和主线 merge。它是 v0.7.0 归档后的独立 UX 适配交付，候选 commit 为 `58ebd92`；ABC、Implementation、Testing、Review 与 Gemini/AG/Codex 协作记录已建立。它不改写 v0.7.0 冻结材料；Release、Archive、Push、部署和公开发布仍未授权。
- Archive Contract/Profile 只能在具体交付获得 Archive 方向授权并完成适用性选择后采用；历史版本的选择不得自动继承。
- 当前进行中的交付为 `v0.7.1 — 统一战斗工作台 UX 适配`；`v0.7.0` 仍是最近归档事实和技术基线。
- Backlog v2、归档后活文档收口门禁与新交付立项前方向审查均为 DND Terminal 本地试行实践，尚不是 ESG Released Profile，也未改变当前 ESG 采纳矩阵。

## 项目边界

本项目是独立工程项目：

- 项目名称为 `DND Terminal`；
- 文档 Authority 固定为 `/Users/chenzehao/Vaults/obsidian/obisidian/理工学习相关/DND Terminal`；
- 产品 Workspace 固定为 `/Users/chenzehao/Projects/DND Terminal`；
- 数据来源区固定为 `/Users/chenzehao/Antigravity Source/lorebuddy-规则书/NotebookLM_Version`；
- 所有项目生成文档只写入文档 Authority；产品 Workspace 不保存第二套 README、AGENTS、需求、Architecture、计划、Testing、Review 或 Release 文档；
- 不属于 LoreBuddy 产品生命周期；
- 不修改 LoreBuddy Source、Library、Metadata、Index、Publisher、GPT Export 或 LoreBuddy 使用的 Vault；
- 配置的数据来源区只作为受限、只读、本地 D&D 规则证据；
- 不从 LoreBuddy 的隐式文件、Vault 或运行状态读取数据；
- 未经单独决定，不共享 LoreBuddy 的版本号、Milestone、Package、Schema 或 Release 身份。

## Authority 分工

| Authority Object | Canonical Owner | Canonical Record |
|---|---|---|
| 当前用户指令与批准 | User | 当前明确指令；批准后冻结到 ABC |
| 项目治理、采纳与门禁 | User | 本文件、`AGENTS.md`、Approved ABC |
| 长期产品需求 | User | `product-requirements.md` |
| D&D 规则结论 | 提供的规则资料；冲突由 User 决定 | `rules-baseline.md` |
| 当前交付范围 | User | Approved/Frozen `ABC.md`；Draft 候选在明确批准前不是实施 Authority |
| Backlog 优先级与交付方向选择 | User | `docs/BACKLOG.md` 保存优先级及来源；`docs/ROADMAP.md` 保存跨交付方向；两者均不授予实施权限 |
| 已实施架构事实 | Implementation + Review | `docs/ARCHITECTURE.md` |
| 战斗运行状态 | 战斗会话状态机 | 会话 Snapshot + 顺序 Event Log |
| 测试事实 | 实际执行者 | `TESTING.md` 与引用证据 |
| 独立评审结论 | Independent Reviewer | `REVIEW.md`，评审开始后创建 |
| 产品 Release | User after approving Review | `RELEASE_NOTES.md`，触发时创建 |

产品 Workspace 中的代码与测试证据必须由文档 Authority 以 Workspace 相对路径、不可变 Git identity 或实际 SHA-256 引用。私有绝对路径可以用于当前本地定位，但不得直接进入未来公开 Release 产物。

## 活文档治理

交付记录证明某一历史事实；活文档负责让人能够正确理解**现在**的项目状态。两者缺一不可，且不得互相替代。

- Authority 中的 `AGENTS.md`、`README.md`、`docs/ROADMAP.md`、`docs/BACKLOG.md` 与本文件构成活文档集合；每次交付范围、生命周期、授权、当前门禁、延期依赖或技术同步发生变化时，必须由事实源驱动逐项核对。
- Archive 完成后，`AGENTS.md` 中的 Post-Archive Active-Document Closure Gate 自动触发受限活文档更新与单向技术投影；该长期授权不包括冻结记录、产品代码、下一版本、Commit、Push、部署或公开发布。
- `docs/ARCHITECTURE.md` 与 `docs/extensions/rules-baseline.md` 是持续维护的当前参考文档：前者只随已实施并复核的架构事实更新，后者随规则 Entry 准入更新。`docs/extensions/product-requirements.md` 保持冻结的 v0.1.0 长期需求基线，不为显示当前版本而改写。
- 运行顺序固定为：交付事实源 → 活文档核对/更新 → `authority-mirror/` 单向生成 → 根 README 链接投影 → 差异与链接验证 → 经用户授权的技术同步 Commit/Push。不得跳过活文档而直接镜像或提交。
- 每次收口报告必须说明：哪些活文档已更新、哪些已核对但不受影响、镜像是否与 Authority 一致、根 README 是否已投影、以及 Commit/Push 是否已执行。缺少任一项时，不得宣称“活文档同步完成”。
- 该流程是治理和可见性要求，不会自动授予 ABC、Implementation、Review、Release、Archive、Commit 或 Push 权限，也不会允许改写冻结原件。

## 规则效力

1. 规则结论只来自 `rules-baseline.md` 固定的实际 Entry。
2. 相同主题若存在版本、译名或效力冲突，状态为 `Unresolved`，不得由实现者自行选择。
3. 产品可明确选择“仅提示、由 DM 裁定”，但不得把产品简化表述为 D&D 规则本身。
4. 翻译权威、出版身份、许可与再分发权在未核验前保持 `unknown`。当前资料仅授权作本地验证输入，不推导公开发布权。

## 状态语义

| State | Meaning |
|---|---|
| `Draft` | 可修改提案；不授权实施 |
| `Approved/Frozen for Implementation` | 用户明确批准的施工合同 |
| `Implemented` | 实际变更已完成；不是 Review 或 Release |
| `Review Approved` | 独立评审允许进入下一门禁 |
| `Released` | 用户授权且正式身份已记录 |
| `Archived` | 仅在单独采纳 Archive Contract/Profile 并通过全部 Gate 后成立 |

不得互相推导这些状态。

## v0.4.0 归档结论

- User 于 `2026-08-25` 已通过 v0.4.0 的范围讨论，决定只建立一个 `v0.4.0-S1`，不把支撑工作拆成四个独立 Slice。
- canonical delivery record 为 `version-work/v0.4.0/ABC.md`，原 S1 与 Amendment 01 的 User Human Acceptance 均已通过。
- User 已批准 Independent Review；`version-work/v0.4.0/REVIEW.md` 已完成证据复核并获 User 批准。
- v0.4.0 Local Private Release 与 Lightweight Archive 已按 User 授权完成；八项 Archive Gate 均为 Pass。技术提交 `d9c31b3` 当前可由 `main` 与 `origin/main` 追溯，不改变冻结归档身份；部署、公开发布与再分发仍未授权。

## v0.5.0 归档结论

- User 于 `2026-08-28` 批准 v0.5.0 Review、Local Private Release 与独立选择的 Lightweight Archive；`version-work/v0.5.0/archive/ARCHIVE_SUMMARY.md` 记录发布身份、完整快照、测试执行与八项 Gate。
- v0.5.0 已归档为 Local Private；产品提交 `370b92a`、Authority 镜像提交 `2f897a6` 与后续活文档治理提交 `ab82faf` 当前均可由 `main` 与 `origin/main` 追溯。技术同步不改变归档身份；部署、公开发布或再分发仍未授权。

## v0.6.0 归档结论

- User 于 `2026-08-31` 正式命名并批准冻结 `version-work/v0.6.0/ABC.md`。
- 本交付采用一个主 Slice；三个顶层结果、八个中文法术的非阻塞提示与结构化裁定资料、DM 最终裁定、旧 v0.5.0 S2C 兼容及测试/回退边界已冻结；增补见 `version-work/v0.6.0/AMENDMENT_01.md`。
- Rules Baseline 中相应 Entry 只授权本地提示和来源展示，不授权完整规则自动裁定或公开再分发。
- User 已明确授权并完成 Implementation；实施、自动测试、浏览器与 Human Acceptance 事实见 `version-work/v0.6.0/IMPLEMENTATION.md` 和 `version-work/v0.6.0/TESTING.md`。
- `version-work/v0.6.0/REVIEW.md` 已获 User 批准，`version-work/v0.6.0/RELEASE_NOTES.md` 已记录 User 授权的 Local Private Release；User 随后授权 Archive，独立选择的 Lightweight Profile 已通过八项 Gate，冻结证据见 `version-work/v0.6.0/archive/ARCHIVE_SUMMARY.md`。本地技术同步基线为 `3464d17`；部署与公开发布仍未授权。

## 最近归档交付：v0.7.0

- User 于 `2026-09-01` 正式授权生成、批准并冻结 `version-work/v0.7.0/ABC.md`；该文件是 v0.7.0 的历史 Approved/Frozen 实施范围合同，不是当前交付。
- 冻结范围以一个主 Slice 收敛只读 Status/Workspace Projection、七个工作区、高密度信息架构、统一视觉系统、战斗/地图/角色的受控布局配置，以及从 v0.6.0 冻结基线开始的 copy-on-write 与回退保护。
- 冻结范围不新增 D&D 规则 Entry、玩法、外部 UI 框架、多人服务或部署；DM 最终裁定、Domain Authority、Event Log、补偿撤销和战后审核回写边界不得被 UI 重构改变。
- User 后续独立授权 v0.7.0 施工；Implementation、自动测试和浏览器验证均已完成，证据见 `version-work/v0.7.0/IMPLEMENTATION.md` 与 `version-work/v0.7.0/TESTING.md`。User 已确认人工审核通过并授权 Review；Review、Local Private Release 与 Lightweight Archive 均已完成。
- User 于 `2026-09-02` 授权生成 `version-work/v0.7.0/AMENDMENT_01.md` 并更新 Backlog，随后明确批准冻结并授权 Implementation。Amendment 自动测试、浏览器验证、Review、Local Private Release 与 Archive 已完成；Commit、Push、部署与公开发布仍未授权。

## 当前交付：v0.7.1

- User 于 `2026-09-10` 批准 `v0.7.1` 作为 v0.7.0 归档后的独立 UX 适配交付，并授权生成对应 ESG 文档与 merge。
- `version-work/v0.7.1/ABC.md`、`IMPLEMENTATION.md`、`TESTING.md`、`REVIEW.md` 与 `COLLABORATION_RECORD.md` 已建立；候选冻结 commit 为 `58ebd92`。
- 当前范围只包含统一工作台布局、三主题可读性、骰子栏 containment、地图平移/空白导航及既有死亡/投入流程的表现层适配；不改变 Domain、Event Log、Session Schema 或 v0.7.0 冻结材料。
- 当前门禁为 Main Integration；主线回归需在 merge 后执行。Push、Local Private Release、Archive、部署和公开发布仍未授权。

当前下一门禁是 v0.7.1 主线合并后的回归与集成状态记录。Backlog 的 P1、AI 推进建议和 Roadmap 方向不得扩张当前 v0.7.1 范围。

## 决策与变更

- 任何改变 Authority、D&D 规则基线、角色卡回写边界、事件历史语义或固定遭遇通过标准的变更，都必须先修订 ABC 并重新获得用户批准。
- 纯实现细节可以在 Approved ABC 内由 Implementation 记录，但不得扩大范围。
- 本文件已在 v0.1.0 Review 后作为 `Stable Local Extension` 延续使用。后续交付仍以各自 Approved/Frozen ABC 为唯一实施合同。
