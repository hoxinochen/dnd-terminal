# DND Terminal 工程协作规范

- **文档状态（Status）：** v0.3.0 / M1、v0.3.1 与 v0.4.0 Archived — Local Private
- **适用范围（Scope）：** DND Terminal 文档 Authority 与产品 Workspace
- **文档 Authority：** `/Users/chenzehao/Vaults/obsidian/obisidian/理工学习相关/DND Terminal`
- **产品 Workspace：** `/Users/chenzehao/Projects/DND Terminal`
- **数据来源区：** `/Users/chenzehao/Antigravity Source/lorebuddy-规则书/NotebookLM_Version`
- **当前交付（Current Delivery）：** `v0.4.0 — PC 0 HP、死亡豁免与稳定状态`（Archived — Local Private）
- **当前门禁（Current Gate）：** No Active Delivery Authorization
- **ESG Core：** Downstream Documentation Schema `schema-v0.3.0`（与 Minimal Governance Framework `schema-v0.2.0` 兼容）
- **v0.4.0 Profile 适用性：** Milestone Documentation Profile `Not Applicable`；Archive Contract `schema-v0.1.1` 与 Lightweight Archive Profile `schema-v0.1.2` 已选择并执行
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
6. 仅在规划或范围核对时读取 Roadmap 与 Backlog。

规则结论必须回到 `rules-baseline.md` 固定的实际 Entry。不得用模型常识、聊天记忆或未提供的网络资料补齐规则。

## 5. 当前批准门禁

v0.1.0 已 Released / Archived — Local Private，保持历史冻结。v0.2.0 已完成 User 授权的 Local Private Release，尚未 Archive。v0.3.0 的 `M1-S1` 至 `M1-S5`、`M1-S5-STAB-1` 与 `M1-S5-STAB-2` 均已完成并通过 User Human Acceptance；Independent Review、Local Private Release 与 Archive 均已获 User 批准。`schema-v0.1.1` Archive Contract 与 `schema-v0.1.2` Lightweight Archive Profile 的八项 Gate 全部通过，最终证据见 `version-work/v0.3.0/archive/ARCHIVE_SUMMARY.md`。部署、公开发布和再分发仍未授权。以下仍不自动获批：

User 于 `2026-08-24` 将归档后的兼容性维护交付正式命名为 `v0.3.1`，随后明确批准并冻结 `version-work/v0.3.1/ABC.md`，并独立授权 Implementation。实施完成后，User 于同日明确确认“人工验收通过 v0.3.1”，并明确授权完成 Review、Local Private Release 与 Archive。八项 Archive Gate 均已通过，最终证据见 `version-work/v0.3.1/archive/ARCHIVE_SUMMARY.md`；分支、Commit、Push、部署和公开发布仍未授权。

User 于 `2026-08-25` 确认 v0.4.0 采用“一份 ABC、一个主 Slice、一次 Implementation、一次综合验收”的范围方向，主能力为 PC `0 HP`、死亡豁免与稳定状态；最低迁移保护、针对性测试和两项不阻塞展示修复合入同一 Slice，不再建立原讨论中的四个独立 Step。原 S1 与 User 同日批准的 `version-work/v0.4.0/AMENDMENT_01.md` 均已获 User Human Acceptance；后者实现 d20 面板以及 PC 生命阶段与昏迷/倒地分离。User 已批准 Review、Local Private Release 与 Archive；v0.4.0 的 Lightweight Archive 八项 Gate 已通过，最终证据见 `version-work/v0.4.0/archive/ARCHIVE_SUMMARY.md`。PC 死亡后的复活/转化留待独立 v0.4.1。尚未授权分支、Commit、Push、部署、公开发布或再分发。

- 为 v0.4.0 创建/切换分支、Commit、Push、部署或公开发布；
- 创建归档材料或将 v0.2.0 写成 Archived；
- 对现有 Released 身份之外的部署、公开发布或再分发作出主张。

`M1-S2` 技术实施、自动测试、浏览器验证与 User Human Acceptance 已于 `2026-08-17` 完成。用户确认徒手打击缺失数据保持 `unknown / needs-review` 的原因可理解，并同意将重复 `unknown` 的显示文案作为非阻塞优化留待下一获授权切片处理。用户随后于 `2026-08-17` 明确要求“实施s3”，并在验收期授权补充莉亚的三级熟练、特性、主要装备/背包和 DM 武器精通选择；又于 `2026-08-18` 明确授权 M1-S3 的角色详情 UI 验收整改，以及“仅 Excel 明确导入 `武器精通` 职业特性时才请求 DM 选择”的泛化缺陷修复。用户于同日明确确认“M1-S3 人工验收通过”；`M1-S3` 已完成受控 Excel Profile、莉亚验证、`M1-S2-O1` 文案优化、页签式角色详情和资格泛化修复。导入特性只展示、不自动执行。用户随后明确“授权实施m1s4”；该 Slice 的多施法来源、多职业与多资源池骨架、测试和累计 Implementation/Testing 记录已完成，且用户已人工验收通过。`M1-S4-O1` 留待下一获授权实施；“仍不授权 M1-S5”的历史表述已被 2026-08-21 的 Amendment 1 取代，随后 Review 与 Local Private Release 已于 `2026-08-24` 获 User 依次批准；Archive、部署与公开发布仍未授权。

## 6. 规则与数据边界

- 同名规则存在版本、译名或效力冲突时，记录冲突并停止自动选择。
- 未核验的出版身份、翻译授权、许可或映射必须标记为 `unknown`、`claimed` 或 `inferred`。
- 角色卡长期状态、单位模板、战斗实例、地图表现、行动轮与事件日志不得合并成一个可互相覆盖的数据对象。
- 战斗期间不得直接修改角色卡长期状态；结束战斗时只能通过 DM 审核的差异回写。
- 撤销必须追加补偿事件，不得删除或改写旧事件。
- 隐藏标签页只改变 UI，不得删除数据或停止战斗状态与日志维护。

## 7. 文档职责

- `README.md`：人类入口、当前状态、导航与拟采纳摘要。
- `docs/extensions/project-authority.md`：项目级 Authority、采纳、权限与决策边界。
- `docs/extensions/product-requirements.md`：长期产品需求与 v0.1.0 需求基线。
- `docs/extensions/rules-baseline.md`：规则来源、版本、Entry、冲突与规则决定。
- `docs/ARCHITECTURE.md`：批准后实施的组件、数据 Authority 与状态边界；Draft 内容不得冒充实施事实。
- `docs/ROADMAP.md`：跨交付方向；永不构成批准。
- `docs/BACKLOG.md`：延期意图；永不构成批准。
- `version-work/v0.1.0/ABC.md`：v0.1.0 批准范围合同。
- `version-work/v0.1.0/TESTING.md`：测试计划、执行事实与固定遭遇。

不得创建内容重复的状态文件、决策文件或一功能一文档。

## 8. 验证与报告

- 计划、未执行、通过、失败、阻塞和跳过必须明确区分。
- 测试必须区分自动测试、浏览器交互、触屏、规则人工核对与真实 DM 验收。
- 自动检查不能替代真实 DM 验收；人工验收不能抹去自动失败。
- 报告必须列出实际路径、执行结果、未验证项和已知限制。
