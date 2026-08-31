# DND Terminal

- **项目名称（Project Name）：** DND Terminal
- **项目 ID：** `dnd-terminal`
- **当前产品版本：** `v0.6.0` DM 裁定驱动的复活、转生与受控不死生物关联
- **当前状态：** v0.5.0 与 v0.6.0 Archived — Local Private
- **当前交付：** `v0.6.0 — DM 裁定驱动的复活、转生与受控不死生物关联`（Archived — Local Private）
- **当前门禁：** Archived — Local Private；Awaiting Technical Sync Authorization
- **Release / Technical Sync：** v0.6.0 已获 User 授权并完成 Local Private Release 与 Lightweight Archive；当前 Workspace `HEAD` 为 `86424c6`，v0.6.0 实现、发布包和活文档改动尚未 Commit/Push；部署或公开发布仍未授权
- **文档 Authority：** `/Users/chenzehao/Vaults/obsidian/obisidian/理工学习相关/DND Terminal`
- **产品 Workspace：** `/Users/chenzehao/Projects/DND Terminal`
- **数据来源区：** `/Users/chenzehao/Antigravity Source/lorebuddy-规则书/NotebookLM_Version`

## 项目目的

本项目面向 DM，长期目标是在同一个网页工具中整合角色卡、怪物与 NPC、行动轮、二维战术地图、棋子、范围技能、战斗状态、资源消耗与事件日志。

`v0.1.0` 只验证数据和操作能否形成一致、可恢复、可复盘的战斗闭环。它不是完整 VTT，也不追求全量 D&D 自动结算。

## 当前交付

`v0.3.0` 已完成长期角色卡修订、受控 Excel 导入、角色战斗投影、多施法来源与资源池、关联单位独立物化、DM 确认的武器精通候选、战后逐项审核回写与角色归档生命周期。`v0.3.1` 在不改变这些能力、Schema 或存储键的前提下，明确版本身份、保持导入导出兼容并修复 Chrome 模块缓存失配；两者均已本地私有归档。

User 于 `2026-08-25` 通过并随后明确批准冻结 v0.4.0 ABC：候选版本只使用一个 `v0.4.0-S1`，以 PC `0 HP`、死亡豁免、稳定与死亡的垂直闭环为主体；最低迁移保护、针对性测试及不阻塞的展示修复在同一次 Implementation 中处理，不拆成四个独立 Slice。原 S1 与 Amendment 01 均已获 User Human Acceptance；User 已批准 Review、Local Private Release 与 Archive。v0.4.0 的 Lightweight Archive 八项 Gate 均为 Pass，正式状态为 `Archived — Local Private`。

`v0.5.0` 在 v0.4.0 的冻结基线上完成 PC 死亡后的 DM 复活、独立承接角色与受控亡灵窄流程；其 Local Private Release、34 文件冻结快照和 Lightweight Archive 八项 Gate 已完成，正式状态为 `Archived — Local Private`。完整规则法术执行、材料、资格和续控仍保持 Backlog 身份，需新的 ABC 才能进入实施。

User 于 `2026-08-31` 正式命名并批准冻结 `v0.6.0` ABC，随后明确授权 Implementation 与 Amendment 01。该交付已把 v0.5.0 的四张死亡后结果卡收敛为“恢复原身体”“以新身体或新形态继续冒险”“制造受控不死生物”三张卡；八个中文法术使用可扩展的结构化裁定资料、简报、分段选择与预览，DM 裁定仍为最终 Authority。自动测试、浏览器完成流程、User Human Acceptance、Review、Local Private Release 与 Lightweight Archive 均已完成；37 文件冻结快照和八项 Gate 结论见归档摘要。

- [项目 Authority](docs/extensions/project-authority.md)
- [产品需求基线](docs/extensions/product-requirements.md)
- [D&D 规则基线](docs/extensions/rules-baseline.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Backlog](docs/BACKLOG.md)
- [v0.1.0 ABC](version-work/v0.1.0/ABC.md)
- [v0.1.0 Testing](version-work/v0.1.0/TESTING.md)
- [v0.1.0 Implementation](version-work/v0.1.0/IMPLEMENTATION.md)
- [v0.1.0 Independent Review](version-work/v0.1.0/REVIEW.md)
- [v0.1.0 Release Notes](version-work/v0.1.0/RELEASE_NOTES.md)
- [v0.1.0 Archive Summary](version-work/v0.1.0/ARCHIVE_SUMMARY.md)
- [v0.2.0 ABC](version-work/v0.2.0/ABC.md)
- [v0.2.0 Implementation](version-work/v0.2.0/IMPLEMENTATION.md)
- [v0.2.0 Independent Review](version-work/v0.2.0/REVIEW.md)
- [v0.2.0 Release Notes](version-work/v0.2.0/RELEASE_NOTES.md)
- [v0.3.0 / M1 Approved ABC](version-work/v0.3.0/ABC.md)
- [v0.3.0 / M1 Implementation](version-work/v0.3.0/IMPLEMENTATION.md)
- [v0.3.0 / M1 Testing](version-work/v0.3.0/TESTING.md)
- [v0.3.0 / M1 Independent Review](version-work/v0.3.0/REVIEW.md)
- [v0.3.0 Release Notes](version-work/v0.3.0/RELEASE_NOTES.md)
- [v0.3.0 Archive Summary](version-work/v0.3.0/archive/ARCHIVE_SUMMARY.md)
- [v0.3.1 Approved ABC](version-work/v0.3.1/ABC.md)
- [v0.3.1 Implementation Plan](version-work/v0.3.1/IMPLEMENTATION_PLAN.md)
- [v0.3.1 Implementation](version-work/v0.3.1/IMPLEMENTATION.md)
- [v0.3.1 Testing](version-work/v0.3.1/TESTING.md)
- [v0.3.1 Independent Review](version-work/v0.3.1/REVIEW.md)
- [v0.3.1 Release Notes](version-work/v0.3.1/RELEASE_NOTES.md)
- [v0.3.1 Archive Summary](version-work/v0.3.1/archive/ARCHIVE_SUMMARY.md)
- [v0.4.0 Approved ABC](version-work/v0.4.0/ABC.md)
- [v0.4.0 Implementation](version-work/v0.4.0/IMPLEMENTATION.md)
- [v0.4.0 Testing](version-work/v0.4.0/TESTING.md)
- [v0.4.0 Independent Review](version-work/v0.4.0/REVIEW.md)
- [v0.4.0 Release Notes](version-work/v0.4.0/RELEASE_NOTES.md)
- [v0.4.0 Archive Summary](version-work/v0.4.0/archive/ARCHIVE_SUMMARY.md)
- [v0.5.0 ABC](version-work/v0.5.0/ABC.md)
- [v0.5.0 Implementation](version-work/v0.5.0/IMPLEMENTATION.md)
- [v0.5.0 Testing](version-work/v0.5.0/TESTING.md)
- [v0.5.0 Independent Review](version-work/v0.5.0/REVIEW.md)
- [v0.5.0 Release Notes](version-work/v0.5.0/RELEASE_NOTES.md)
- [v0.5.0 Archive Summary](version-work/v0.5.0/archive/ARCHIVE_SUMMARY.md)
- [v0.6.0 Approved ABC](version-work/v0.6.0/ABC.md)
- [v0.6.0 Amendment 01](version-work/v0.6.0/AMENDMENT_01.md)
- [v0.6.0 Implementation](version-work/v0.6.0/IMPLEMENTATION.md)
- [v0.6.0 Testing](version-work/v0.6.0/TESTING.md)
- [v0.6.0 Independent Review](version-work/v0.6.0/REVIEW.md)
- [v0.6.0 Release Notes](version-work/v0.6.0/RELEASE_NOTES.md)
- [v0.6.0 Archive Summary](version-work/v0.6.0/archive/ARCHIVE_SUMMARY.md)

全部项目文档的 canonical Authority 只在 Obsidian；Workspace 的 `authority-mirror/` 与根 README 是单向技术投影。v0.5.0 产品实现为 `370b92a`，Authority 镜像为 `2f897a6`，活文档治理同步为 `ab82faf`；这些历史技术同步不改变冻结的 Local Private Release/Archive 身份。当前 Workspace `HEAD` 为 `86424c6`，本次 v0.6.0 代码和活文档改动尚未 Commit/Push，部署与公开发布仍未授权。

## ESG 活采纳矩阵

`v0.1.0` 的冻结采纳事实保持在其版本记录中。以下为当前项目活采纳摘要；用户于 `2026-08-14` 因 `M1 ↔ v0.3.0` 已形成多 Slice、跨 Slice Exit Gate 和人工验收事实，选择启用 Milestone Documentation Profile，并于 `2026-08-17` 批准 v0.3.0 ABC。该 Profile 的适用范围只覆盖 M1/v0.3.0，不自动延伸到后续单 Slice 交付。ABC 批准不授予产品 Implementation。

| Artifact | Version | SHA-256 | Current Scope | Audit Result |
|---|---|---|---|---|
| Minimal Governance Framework | `schema-v0.2.0` | `84b0fbbe1dd5703acfcda63b297a115e725c79629647d807ae3664a55c4aa727` | 全项目治理生命周期 | Keep Current |
| Downstream Documentation Schema | `schema-v0.3.0` | `4a95a932eba5e549fa96449c178ce18ecc049513a3697b041b08dbd8736f4f4d` | 项目文档与版本交付记录 | Keep Current |
| Milestone Documentation Profile | `schema-v0.3.0` | `48311b2f51600e25df249162414478f96963d194e4c59d2b663355ae4e39b22a` | `M1 ↔ v0.3.0` 的 `M1-S1` 至 `M1-S5`、人工验收与跨 Slice Exit Gate | Adopted for M1；`Not Applicable` for v0.4.0、v0.5.0、v0.6.0 |
| Archive Contract | `schema-v0.1.1` | `7817687601b2bad7cc8f87015d5b8f6b8ae4fe504cd68abb30b8255b531133df` | `v0.3.0`、`v0.3.1`、`v0.4.0`、`v0.5.0` 与 `v0.6.0` 本地私有 Archive；各自八项 Gate | Adopted / Passed；最新为 `2026-08-31` |
| Lightweight Archive Profile | `schema-v0.1.2` | `7fc38398b5c131bddf16805e15f14382c0e4424be4bcf63ef115b0865643cb1e` | 上述五个交付的归档叙述合并；不减免证据/Gate | Selected / Executed；最新为 `2026-08-31` |

M1 Profile 选择日期为 `2026-08-14`；Selecting Authority 为 User。其历史适用性判定为 `Core + Required Profiles`，详细触发事实、双轴身份和等价路径登记在 `version-work/v0.3.0/ABC.md`。

对于已归档的 `v0.4.0`、`v0.5.0` 与 `v0.6.0`：均继续采用 Downstream Documentation Schema Core `schema-v0.3.0`，兼容 Minimal Governance Framework `schema-v0.2.0`；因各自只有一个主实施 Slice、没有跨 Slice Exit Gate，Milestone Documentation Profile 均为 `Not Applicable`。v0.6.0 的 Archive Contract/Profile 已在 Archive 授权后独立选择、执行；历史 Archive 选择仍不得自动继承。

## 规则资料

当前规则数据来源区为受限本地 NotebookLM Markdown：`/Users/chenzehao/Antigravity Source/lorebuddy-规则书/NotebookLM_Version`。此前 LoreBuddy GPT Export 的 Entry 与摘要仅保留为历史核验收据，尚未整体重新映射到当前资料；未逐项准入的怪物、NPC、角色和法术具体数值仍为 `unknown`。v0.6.0 的八个法术及遗体防腐已按 `rules-baseline.md` 的本地锚点和文件 hash 准入为非阻塞提示，不构成完整规则正确性或合法性结论。资料仅用于本地私有验证，翻译和再分发授权仍为 `unknown`。

## 下一门禁

`v0.1.0` 已完成本地私有 Release 与 Archive，保持历史冻结。`v0.2.0` 已完成本地私有 Release，等待用户决定是否进入 Archive。`v0.3.0` 已完成 M1 Implementation、User Human Acceptance、Independent Review、Local Private Release 与 Local Private Archive；21 文件快照、全部哈希、Archive Readiness Review 和八项 Gate 结论见 `version-work/v0.3.0/archive/ARCHIVE_SUMMARY.md`。

User 于 `2026-08-24` 将维护交付命名为 `v0.3.1`，明确批准冻结其 ABC、Implementation，并确认人工验收通过；随后明确授权完成 Review、Release 与 Archive。v0.3.1 的 25 文件快照、发布包、全部哈希、Archive Readiness Review 和八项 Gate 结论见 `version-work/v0.3.1/archive/ARCHIVE_SUMMARY.md`。

v0.4.0、v0.5.0 与 v0.6.0 均已完成其获授权的 Review、Local Private Release 和 Lightweight Archive。v0.6.0 的 37 文件快照、校验清单、Archive Readiness Review 和八项 Gate 结论见 `version-work/v0.6.0/archive/ARCHIVE_SUMMARY.md`；下一门禁仅为技术同步授权。Commit、Push、部署、公开发布或再分发仍未获授权。
