# Profile Selection

- **Selected Profile：** `Lightweight`。
- **Archive Authorization：** User / `2026-08-31` / “执行archive”。
- **Decision Record：** `version-work/v0.6.0/ARCHIVE_PROFILE_SELECTION.md`，SHA-256 `4e607836df8f3db4cc32cb8d3af0845484b169bc22d75532506efafa1a555aec`。
- **Reason：** v0.6.0 的单一主 Slice 已具备完整生命周期证据、37 文件发布 ZIP、清单、代码快照、归档复测和八项 Gate。Lightweight 只合并叙述性归档记录，不减免任何证据或 Gate。

# Project

DND Terminal

# Version

`v0.6.0`

# Version Name

DM 裁定驱动的复活、转生与受控不死生物关联

# Archive Date

`2026-08-31`

# Stable Baseline

`v0.6.0 Released — Local Private`，发布包为 `releases/v0.6.0/dnd-terminal-v0.6.0-local-private.zip`。本归档只冻结该本地私有身份，不创建部署、公开发布、远端或再分发身份。`v0.5.0 Archived — Local Private` 是历史技术与治理基线，其冻结材料未被修改。

# Adopted Contract and Profile Version

- Archive Contract：`schema-v0.1.1`，SHA-256 `7817687601b2bad7cc8f87015d5b8f6b8ae4fe504cd68abb30b8255b531133df`。
- Lightweight Archive Profile：`schema-v0.1.2`，SHA-256 `7fc38398b5c131bddf16805e15f14382c0e4424be4bcf63ef115b0865643cb1e`。

# Lifecycle Evidence Map

| Evidence Role | Actual Project-Relative Path | Final Status | SHA-256 |
|---|---|---|---|
| Approved scope | `version-work/v0.6.0/ABC.md` | Approved / Frozen | `a15acb754986b598475a751e77230ec456decac95a89baa77df8f3e0997c6fde` |
| Approved amendment | `version-work/v0.6.0/AMENDMENT_01.md` | Approved / Frozen | `b1f854a2df504d4efd63c62799554e3e566b68ed61ebea430d10b74d3fc2b3e7` |
| Profile selection | `version-work/v0.6.0/ARCHIVE_PROFILE_SELECTION.md` | Final | `4e607836df8f3db4cc32cb8d3af0845484b169bc22d75532506efafa1a555aec` |
| Implementation trace | `version-work/v0.6.0/IMPLEMENTATION.md` | Final implementation record | `e43cb74f5e3ff6724f0eeedf5c9bc5dd6d6bb921a673e9e8523e52e62f9a3b55` |
| Testing | `version-work/v0.6.0/TESTING.md` | Final for Release / Archive | `64a68d31a0d4f485205f47a51fed0d33057e5fb6186fff4700c578554c2382a2` |
| Test execution | `version-work/v0.6.0/archive/TEST_EXECUTION_LOG.md` | Final | `3e1ef6fd99c83a5737e36529a54bfe93b3f6d6d24f765b237ef7c8c619cb2842` |
| Independent Review | `version-work/v0.6.0/REVIEW.md` | Review Approved — User | `a9945fc30dba750bf66da521b7afb247edb0c6723b4f80f28cfffde10b0e8199` |
| Release identity | `version-work/v0.6.0/RELEASE_NOTES.md` | Released — Local Private | `70d3464411e5545d495d2ae38d61b49e1d7574b9bbbb8e80c3340e7e92e1006f` |
| Archive readiness review | `version-work/v0.6.0/archive/ARCHIVE_READINESS_REVIEW.md` | Final — Approved for Archive Finalization | `6624f6a20cf57848abc64cba1fdab2d3bd375eb228377c7fc7e1012e9a369479` |

# Implementation Trace Summary

- **Implementation Goal：** 将死亡后 DM 处理统一为三种结果，并以非阻塞的八法术裁定工作台辅助跑团记录。
- **Actual Change Scope：** 完整冻结在 `archive/code-snapshot/` 的 37 个发布文件；包含三结果卡、三个后继形态、八个中文法术 Profile、结构化裁定资料、预览、资源记录、旧 S2C 兼容和 copy-on-write 迁移。
- **Key Decisions：** 规则提示服务 DM 裁定；新身体建立独立角色卡/投影/实例；受控不死生物是独立 monster/NPC；克隆准备、材料、资格、灵魂与战役时间不自动裁定。
- **Deviations from Approved Scope：** 无；Amendment 01 为已批准范围补正。
- **Explicit Non-Implemented Boundaries：** 不执行完整法术引擎、合法性/材料库存/时间计算、自动行动、多人、云同步、部署或公开发布。
- **Record Nature：** Evidence Synthesis。

# Code Evidence and Tested-Source Identity

- **Primary Mode：** Full Archive Snapshot。
- **Identity Chain：** Release Notes 固定 ZIP SHA-256 `366d1d126bde7779f04da5d554b3189116ed1b0e4f5f86850bd14e6850be7448` 和内容清单 SHA-256 `5a89d8f333b4a6d334fd0e97ed03b75ea34aad3e7c3db8cb2f013590cf513f84`；37 个快照文件逐项匹配发布清单，并在同一快照内通过 `9 / 9` 语法检查和 `22 / 22` 自动化测试。

# Configuration

**Status：Not Applicable。** 本版本是零依赖本地静态网页，不读取运行时配置文件、账户、凭据或外部服务。

# Runbook

- **Applicable Version：** `v0.6.0`；运行 `start-dnd-terminal.command`，或以 Python 在 `127.0.0.1` 提供静态页面。
- **Dependencies：** Node.js 用于验证；Python 3 用于本地静态服务；产品不安装包依赖。
- **Stop / Limits：** 终止本地服务即停止；触屏、非 macOS、公开托管和真实用户数据归档复测未验证。

# Testing Finalization

- **Results：** Snapshot 内容清单 `37 / 37`；Node 语法 `9 / 9`；自动化测试 `22 / 22` 通过；发布前 User 已明确确认浏览器完成流程与 Human Acceptance 通过。
- **Unexecuted：** 真实用户数据迁移、DM 长时会话、归档阶段隔离 origin 的逐步浏览器记录、跨对话持续性、压力测试、浏览器下载落盘检查、触屏验证和额外规则人工核对未执行。

# Review Approval

- **Independent Review：** `version-work/v0.6.0/REVIEW.md`，`Review Approved — User`，SHA-256 `a9945fc30dba750bf66da521b7afb247edb0c6723b4f80f28cfffde10b0e8199`。
- **Archive Readiness Review：** `archive/ARCHIVE_READINESS_REVIEW.md`，`Final — Approved for Archive Finalization`，SHA-256 `6624f6a20cf57848abc64cba1fdab2d3bd375eb228377c7fc7e1012e9a369479`。

# Archived Artifact and Hash List

| Artifact | Archive Relative Path | SHA-256 |
|---|---|---|
| Archive readiness review | `archive/ARCHIVE_READINESS_REVIEW.md` | `6624f6a20cf57848abc64cba1fdab2d3bd375eb228377c7fc7e1012e9a369479` |
| Test execution log | `archive/TEST_EXECUTION_LOG.md` | `3e1ef6fd99c83a5737e36529a54bfe93b3f6d6d24f765b237ef7c8c619cb2842` |
| Snapshot manifest | `archive/CODE_SNAPSHOT_MANIFEST.sha256` | `8b7c536e627943dfadb5798830eed1c6e82c29800341546f34f32eb922fe9c36` |
| Snapshot files | `archive/code-snapshot/` | All 37 file hashes are listed in `CODE_SNAPSHOT_MANIFEST.sha256` and match the release contents manifest `5a89d8f333b4a6d334fd0e97ed03b75ea34aad3e7c3db8cb2f013590cf513f84`. |
| Entry HTML | `archive/code-snapshot/index.html` | `ef8b54ed7ad0938992e3bdf001cd44895bde56307bf8402e4b58cb7edd492924` |
| Launcher | `archive/code-snapshot/start-dnd-terminal.command` | `ca34657892c9cd52447a12833a0442e21b217667e976dc997f80a2e2792a016f` |
| App source | `archive/code-snapshot/src/app.js` | `d2bc8f06b09afee840831e05fbd80dcd1abfaeffd2b1cbe3b0b79a9ac0766714` |
| v0.6 lifecycle source | `archive/code-snapshot/src/life-cycle-v060.js` | `e916dc07fd9c5dabd7047f0643e9d5bb39d98296a1a0a960b55bd8bf65c75043` |
| Stylesheet | `archive/code-snapshot/src/styles.css` | `d258b68f6a55f218f89da9163cbff3fcf3ef50248bc6138f1c256758a7cb5756` |

`ARCHIVE_SUMMARY.md` 是最终冻结文件，按 Contract/Profile 不记录自身 SHA-256。

# Known Limitations

- 不实现完整规则引擎、具体法术资格/材料/时间裁定、自动召唤物行动、多人协作、公开部署或公开发布。
- 规则资料仅作本地私有验证输入；翻译、出版身份、许可与再分发授权继续为 `unknown`。
- 本机静态服务随本地进程停止；触屏、非 macOS 与公开环境未验证。

# Historical Reconstruction

**Record Nature：Evidence Synthesis。** 本归档在 v0.6.0 Local Private Release 后创建，依据已冻结生命周期证据、发布 ZIP、内容清单、快照复测和 Archive Readiness Review 生成；不追溯改写原始实施、测试或用户反馈时间线。

# Exceptions / Waivers

无。没有对任何 Archive Gate、源身份、测试、秘密安全或生命周期条件作出豁免。

# Next Version Status

全量法术执行与复杂法术、关联单位与受控生物战斗中投入、整体 UI 工作台重构与可配置布局均保持 Backlog 身份；尚未创建新的 ABC、Implementation、Review、Release、Archive、部署或公开发布授权。任何后续变更必须使用新交付身份；本 v0.6.0 快照、发布包和归档记录不得修改。

# Archive Gate Results

| Gate | Result | Evidence |
|---|---|---|
| 1 — Required Artifacts | Pass | Summary、完整非 Git 代码快照、快照清单、测试执行日志、Review 与生命周期证据均存在；配置具体记录为 Not Applicable。 |
| 2 — Paths, Naming, and Profile Selection | Pass | v0.6.0 在 `ARCHIVE_PROFILE_SELECTION.md` 明确选择 Lightweight；归档根为 `version-work/v0.6.0/archive/`。 |
| 3 — Integrity and Hashes | Pass | 37 个快照文件逐项匹配发布清单；基础证据、Readiness Review 和归档清单均有 SHA-256；发布 ZIP / 清单 / 快照 / 测试形成单向身份链。 |
| 4 — Review Approval | Pass | Independent Review 已获 User 批准；Archive Readiness Review 在 Summary 前完成并批准最终化。 |
| 5 — Testing Finalization | Pass | 快照内清单 `37 / 37`、语法 `9 / 9`、测试 `22 / 22` 通过；未执行项明确保留。 |
| 6 — Secret Safety | Pass | 无运行时配置或凭据；快照扫描未发现可用秘密或用户会话数据。 |
| 7 — Summary Completeness | Pass | Lightweight Summary 的必需身份链、归档文件、限制、八项 Gate 与最终结论均在冻结前记录；未记录自身哈希。 |
| 8 — Lifecycle Consistency | Pass | ABC → Amendment → Implementation → Testing → Review → Release → Profile selection → Readiness Review → Summary 的顺序一致；后续能力未获授权。 |

# Final Verdict

Pass。八项 Archive Gate 均为 Pass。

# Final Archive Status

Archived — Local Private
