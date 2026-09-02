# DND Terminal 工程协作规范

- **文档状态（Status）：** v0.3.0 / M1、v0.3.1、v0.4.0、v0.5.0、v0.6.0 与 v0.7.0 Archived — Local Private
- **适用范围（Scope）：** DND Terminal 文档 Authority 与产品 Workspace
- **文档 Authority：** `/Users/chenzehao/Vaults/obsidian/obisidian/理工学习相关/DND Terminal`
- **产品 Workspace：** `/Users/chenzehao/Projects/DND Terminal`
- **数据来源区：** `/Users/chenzehao/Antigravity Source/lorebuddy-规则书/NotebookLM_Version`
- **当前交付（Current Delivery）：** `v0.7.0 — 高密度 DM 工作台、状态投影与统一视觉系统`（Implemented）
- **当前门禁（Current Gate）：** v0.7.0 Archived — Local Private；下一交付尚未授权
- **ESG Core：** Downstream Documentation Schema `schema-v0.3.0`（与 Minimal Governance Framework `schema-v0.2.0` 兼容）
- **v0.7.0 Profile 适用性：** 一个主 Slice、五个内部 Implementation Phase 与一次综合验收；Milestone Documentation Profile `Not Applicable`；Archive Contract `schema-v0.1.1` / Lightweight Archive Profile `schema-v0.1.2` 已选择并完成
- **主要语言（Primary Language）：** 简体中文

## 1. 项目定位

`DND Terminal` 是面向地下城主（Dungeon Master，DM）的独立 D&D 跑团战斗辅助网页工具。它验证角色卡、单位模板、战斗实例、行动轮、二维战术地图、范围模板、战斗状态、资源与事件日志能否形成一致、可恢复、可复盘的闭环。

本项目不是 LoreBuddy 的 Package、Publisher 或 Runtime，不得修改或依赖 LoreBuddy 的隐式运行状态。当前配置的数据来源区仅作为受限的本地规则证据来源。

本项目不是完整虚拟桌面（Virtual Tabletop，VTT），也不是完整 D&D 规则引擎。

## 2. 双根目录边界

- 文档 Authority 保存 `AGENTS.md`、`README.md`、`docs/` 与 `version-work/`，是项目治理、需求、规则、架构、Testing、Review 与 Release 文档的唯一落点。
- 产品 Workspace 只保存获批后的产品源码、测试源码、依赖锁、静态资源与本地构建配置；唯一的文档例外是本节定义的生成式 GitHub 镜像。
- `authority-mirror/` 是从本 Authority 根目录单向生成的完整技术镜像，供私有 GitHub 浏览、备份和技术同步使用；它不是 Authority，不得在其中编辑、裁定、批准或补写项目事实。
- 产品 Workspace 根 `README.md` 是 Authority `README.md` 的单向 GitHub 主页投影；可为 GitHub 链接重写相对路径，但不得成为独立权威文本。完整原件始终为 `authority-mirror/README.md` 与 Obsidian Authority `README.md`。
- 镜像只能由 Obsidian Authority → Workspace 生成，禁止反向同步。首次或后续同步必须排除 `.git` 与系统元数据，并在 Commit 前检查差异；不允许把用户数据、Rules Baseline 原件、发布包或产品运行时数据打入镜像。
- 镜像完成后的 Commit/Push 是 post-archive 技术同步，不改变任何版本的 Release 或 Archive 身份。冻结的 ABC、Release Notes、Archive Summary 与代码快照只能被复制并校验，不得在镜像过程中改写。
- 除上述 `authority-mirror/` 和根 `README.md` 外，本项目新生成的 Markdown 或其他工程文档不得写入产品 Workspace。
- 产品 Workspace 中的代码、测试输出或构建产物不会仅因存在而成为文档 Authority；文档只能按实际身份引用它们。
- 在产品 Workspace 工作的 Agent 必须显式读取本文档 Authority 中的 `AGENTS.md` 和当前 Approved ABC，不得因目录继承关系缺失而跳过门禁。

## 3. Authority 顺序

发生冲突时按以下顺序处理：

1. 用户在当前任务中的明确指令；
2. `docs/extensions/project-authority.md`；
3. 本 `AGENTS.md`；
4. 当前交付已获用户批准并冻结的 `version-work/<delivery-id>/ABC.md`；
5. `docs/extensions/rules-baseline.md` 中已确认的规则来源、版本与决定；
6. `docs/extensions/product-requirements.md`；
7. `docs/ARCHITECTURE.md` 中已批准且已实施的事实；
8. `version-work/<delivery-id>/IMPLEMENTATION.md`、`TESTING.md` 与 `REVIEW.md` 各自职责内的事实；
9. `README.md` 的当前状态与导航；
10. `docs/ROADMAP.md` 与 `docs/BACKLOG.md` 中的未来方向和意图。

Roadmap、Backlog、Draft、Candidate、测试计划或聊天记忆都不授予 Implementation 权限。

## 4. Bootstrap

开始工作时按任务需要重新读取：

1. `AGENTS.md`；
2. `README.md`；
3. `docs/extensions/project-authority.md`；
4. 当前交付的 `ABC.md`；
5. 与任务直接相关的 Rules Baseline、Product Requirements、Architecture 与 Testing；
6. 仅在规划或范围核对时读取 Roadmap 与 Backlog；每次版本开始前审计还必须复核 `BL-027` 的 UI 技术债信号，并明确报告是否建议将其列为候选交付。

规则结论必须回到 `rules-baseline.md` 固定的实际 Entry。不得用模型常识、聊天记忆或未提供的网络资料补齐规则。

## 5. 活文档治理与交付收口

活文档用于陈述项目的**当前**版本、门禁、权限、导航和延期意图；它们不是冻结交付原件，也不能取代 User 批准。每次发生范围、生命周期、权限或技术同步事实变化时，必须按以下顺序收口，不能只更新其中一处：

1. **先固化事实源。** 先写入与事实相符的交付记录（获批 ABC、Implementation、Testing、Review、Release 或 Archive）；没有 User 授权不得创建、升级或伪造该事实。已冻结的 ABC、Release Notes、Archive Summary 和代码快照不得为“更新状态”而改写。
2. **再核对并更新全部活文档。** 依次检查 `AGENTS.md`（当前交付、门禁、权限）、Authority `README.md`（入口、状态、导航、下一门禁）、`docs/extensions/project-authority.md`（Authority 与技术同步边界）、`docs/ROADMAP.md`（当前/下一候选方向）和 `docs/BACKLOG.md`（已完成、延期与依赖）。内容受影响则更新；不受影响也必须在收口检查中明确列为“已核对、无变更”。
3. **最后生成技术投影。** Authority 活文档确认后，才可从 Obsidian Authority 单向同步 `authority-mirror/`，并从 Authority `README.md` 生成根 `README.md`；根投影仅可重写 GitHub 相对链接。禁止从 Workspace、镜像、聊天或 Git 历史反向补写 Authority。
4. **把同步作为可验证的收口门禁。** 在任何获授权的技术同步 Commit 或 Push 前，必须验证：镜像与 Authority（排除 `.git`、`.DS_Store`）一致；根 README 的当前版本/状态和全部文档链接正确；`git diff --check` 通过；镜像未带入用户数据、Rules Baseline 原件、发布包或运行时数据。最终报告必须列出活文档更新项、已核对但无变更项、镜像校验和是否已 Commit/Push。

任一项缺失时，交付可以保留其已有 Release/Archive 身份，但“活文档与 GitHub 技术同步完成”的结论不得成立。产品代码 Commit、技术同步 Commit 和 Push 仍分别需要用户授权；技术同步不得反向改变冻结交付身份。

## 6. 当前批准门禁

v0.1.0 已 Released / Archived — Local Private，保持历史冻结。v0.2.0 已完成 User 授权的 Local Private Release，尚未 Archive。v0.3.0 的 `M1-S1` 至 `M1-S5`、`M1-S5-STAB-1` 与 `M1-S5-STAB-2` 均已完成并通过 User Human Acceptance；Independent Review、Local Private Release 与 Archive 均已获 User 批准。`schema-v0.1.1` Archive Contract 与 `schema-v0.1.2` Lightweight Archive Profile 的八项 Gate 全部通过，最终证据见 `version-work/v0.3.0/archive/ARCHIVE_SUMMARY.md`。部署、公开发布和再分发仍未授权。

User 于 `2026-08-24` 将归档后的兼容性维护交付正式命名为 `v0.3.1`，随后明确批准并冻结 `version-work/v0.3.1/ABC.md`，并独立授权 Implementation。实施完成后，User 于同日明确确认“人工验收通过 v0.3.1”，并明确授权完成 Review、Local Private Release 与 Archive。八项 Archive Gate 均已通过，最终证据见 `version-work/v0.3.1/archive/ARCHIVE_SUMMARY.md`；其技术提交 `444cdce` 当前可由 `main` 与 `origin/main` 追溯，部署、公开发布和再分发仍未授权。

User 于 `2026-08-25` 确认 v0.4.0 采用“一份 ABC、一个主 Slice、一次 Implementation、一次综合验收”的范围方向，主能力为 PC `0 HP`、死亡豁免与稳定状态；最低迁移保护、针对性测试和两项不阻塞展示修复合入同一 Slice，不再建立原讨论中的四个独立 Step。原 S1 与 User 同日批准的 `version-work/v0.4.0/AMENDMENT_01.md` 均已获 User Human Acceptance；后者实现 d20 面板以及 PC 生命阶段与昏迷/倒地分离。User 已批准 Review、Local Private Release 与 Archive；v0.4.0 的 Lightweight Archive 八项 Gate 已通过，最终证据见 `version-work/v0.4.0/archive/ARCHIVE_SUMMARY.md`。当时延期的 PC 死亡后复活/转化已由独立 v0.5.0 完成并归档。尚未授权部署、公开发布或再分发。

User 于 `2026-08-28` 明确批准 v0.5.0 的 Review、Local Private Release 与 Lightweight Archive。v0.5.0 的发布身份、34 文件快照、测试执行、Archive Readiness Review 和八项 Gate 结论见 `version-work/v0.5.0/archive/ARCHIVE_SUMMARY.md`。产品提交 `370b92a`、Authority 镜像提交 `2f897a6` 与活文档治理提交 `ab82faf` 当前均已进入 `main` 与 `origin/main`；这些技术同步不改变归档身份，部署、公开发布或再分发仍未授权。

User 于 `2026-08-31` 正式命名并批准冻结 `v0.6.0` ABC，并随后明确授权 Implementation 与 `version-work/v0.6.0/AMENDMENT_01.md`。三个顶层死亡后结果、八个中文法术的结构化裁定工作台、新身体/新形态三个子选项、旧 v0.5.0 S2C 兼容和 DM 最终裁定边界均已实现；自动测试、浏览器完成流程、User Human Acceptance 与 Review 均已通过。User 随后授权 Local Private Release 与 Archive；Archive Contract `schema-v0.1.1`、Lightweight Archive Profile `schema-v0.1.2` 的八项 Gate 均为 Pass，冻结证据见 `version-work/v0.6.0/archive/ARCHIVE_SUMMARY.md`。分支、Commit、Push、部署、公开发布或再分发仍未授权。

User 于 `2026-09-01` 明确授权生成、批准并冻结 `version-work/v0.7.0/ABC.md`。该 ABC 是 v0.7.0 唯一实施范围合同：一个主 Slice 完成只读状态投影、七工作区 Shell、高密度信息架构、统一视觉系统、受控布局、copy-on-write 兼容及 v0.6.0 回退证明；不加入 BL-028、规则引擎或其他玩法能力。User 随后以“实施implementation”和“完成欠缺的部分”独立授权实施；实施、24/24 自动测试和隔离浏览器综合验证事实见 `version-work/v0.7.0/IMPLEMENTATION.md` 与 `version-work/v0.7.0/TESTING.md`。User 已确认人工审核通过并授权 Review；Review 已完成。User 于 `2026-09-02` 明确授权先后执行 Local Private Release 与 Archive；Release 已完成，Archive 正在 Finalization，分支、Commit、Push、部署与公开发布仍未授权。

User 于 `2026-09-02` 先授权生成 `version-work/v0.7.0/AMENDMENT_01.md` 与更新 Backlog，随后明确“批准冻结amendment01，并且授权执行implementation，顺序执行两个操作”。Amendment 01 已 Approved / Frozen，地图视口、100 条骰史、复合骰式/快捷输入、单一角色创建任务流与设置开发工具已完成 Implementation；地图图片和有符号四向热扩展继续属于 BL-007，不能混入本次施工。User 已确认人工审核通过并授权 Review；Review 已完成。User 随后授权先后执行 Local Private Release 与 Archive；Release 已完成，Archive 正在 Finalization，分支、Commit、Push、部署与公开发布仍未授权。

状态收口更正（`2026-09-02`）：上述授权的 Local Private Release 与 Lightweight Archive 均已完成；分支、Commit、Push、部署与公开发布仍未授权。

当前以下行为仍不自动获批：

- 不经单独授权就从当前 v0.7.0 Review 结论进入 Local Private Release、Archive、分支、Commit、Push、部署或公开发布；
- 将 Amendment 01 范围扩张到 BL-007 地图导入/动态边界、BL-029 搜索筛选或其他未冻结能力；
- 改写 v0.6.0 冻结 ABC、Release、Archive、代码快照、发布包、校验记录或旧存储值；
- 将 v0.2.0 写成 Archived；
- 对现有 Released 身份之外的部署、公开发布或再分发作出主张。

`M1-S2` 至 `M1-S5` 的技术实施、自动测试、浏览器验证与 User Human Acceptance 均已完成；M1/v0.3.0 后续 Review、Local Private Release 与 Archive 也已获批并完成。导入特性只展示、不自动执行，未准入规则继续保持 `unknown / needs-review`；部署、公开发布与再分发仍未授权。

## 7. 规则与数据边界

- 同名规则存在版本、译名或效力冲突时，记录冲突并停止自动选择。
- 未核验的出版身份、翻译授权、许可或映射必须标记为 `unknown`、`claimed` 或 `inferred`。
- 角色卡长期状态、单位模板、战斗实例、地图表现、行动轮与事件日志不得合并成一个可互相覆盖的数据对象。
- 战斗期间不得直接修改角色卡长期状态；结束战斗时只能通过 DM 审核的差异回写。
- 撤销必须追加补偿事件，不得删除或改写旧事件。
- 隐藏标签页只改变 UI，不得删除数据或停止战斗状态与日志维护。

## 8. 文档职责

- `README.md`：人类入口、当前状态、导航与拟采纳摘要。
- `docs/extensions/project-authority.md`：项目级 Authority、采纳、权限与决策边界。
- `docs/extensions/product-requirements.md`：长期产品需求与 v0.1.0 需求基线。
- `docs/extensions/rules-baseline.md`：规则来源、版本、Entry、冲突与规则决定。
- `docs/ARCHITECTURE.md`：批准后实施的组件、数据 Authority 与状态边界；Draft 内容不得冒充实施事实。
- `docs/ROADMAP.md`：跨交付方向；永不构成批准。
- `docs/BACKLOG.md`：延期意图；永不构成批准。
- `version-work/<delivery-id>/ABC.md`：对应交付的范围合同；当前 Approved/Frozen 合同为 `version-work/v0.7.0/ABC.md`。
- `version-work/<delivery-id>/TESTING.md`：仅在该交付 ABC 获批且另行获得 Implementation 授权后记录测试计划与执行事实；v0.7.0 的执行事实见 `version-work/v0.7.0/TESTING.md`。

不得创建内容重复的状态文件、决策文件或一功能一文档。

## 9. 验证与报告

- 计划、未执行、通过、失败、阻塞和跳过必须明确区分。
- 测试必须区分自动测试、浏览器交互、触屏、规则人工核对与真实 DM 验收。
- 自动检查不能替代真实 DM 验收；人工验收不能抹去自动失败。
- 报告必须列出实际路径、执行结果、未验证项和已知限制。
