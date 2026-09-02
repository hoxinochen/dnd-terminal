# v0.7.0 Lightweight Archive Summary

# Project

DND Terminal

# Version

`v0.7.0`

# Version Name

高密度 DM 工作台、状态投影与统一视觉系统

# Archive Date

`2026-09-02`

# Stable Baseline

`v0.7.0 Released — Local Private`，发布包为 `releases/v0.7.0/dnd-terminal-v0.7.0-local-private.zip`。本归档只冻结该本地私有身份，不创建部署、公开发布、远端或再分发身份。`v0.6.0 Archived — Local Private` 是历史技术与治理基线，其冻结材料未被修改。

# Adopted Contract and Profile Version

- Archive Contract：`schema-v0.1.1`，SHA-256 `7817687601b2bad7cc8f87015d5b8f6b8ae4fe504cd68abb30b8255b531133df`。
- Lightweight Archive Profile：`schema-v0.1.2`，SHA-256 `7fc38398b5c131bddf16805e15f14382c0e4424be4bcf63ef115b0865643cb1e`。
- Per-delivery selection record：`version-work/v0.7.0/ARCHIVE_PROFILE_SELECTION.md`，SHA-256 `2d694c46d8f07f7a4fe680e0735fae5bd8529a7f4503dfa19e1e3f37f4b14eba`。

# Lifecycle Evidence Map

| Evidence Role | Actual Project-Relative Path | Final Status | SHA-256 |
|---|---|---|---|
| Approved scope | `version-work/v0.7.0/ABC.md` | Approved / Frozen | `74aa973377c607b76e6276affe3e9ce8b086897458a549b09bfb2d806dddea41` |
| Approved amendment | `version-work/v0.7.0/AMENDMENT_01.md` | Approved / Frozen | `652f98b34108534a92c5db533f29b40d5daf222e4926505d077eb1a950ab1b62` |
| Profile selection | `version-work/v0.7.0/ARCHIVE_PROFILE_SELECTION.md` | Final / Lightweight | `2d694c46d8f07f7a4fe680e0735fae5bd8529a7f4503dfa19e1e3f37f4b14eba` |
| Implementation trace | `version-work/v0.7.0/IMPLEMENTATION.md` | Final implementation record | `f91dca043fc1021e6001a614cecdf6863a7e53ebc2b0258e1b6193e9d65dca7b` |
| Testing | `version-work/v0.7.0/TESTING.md` | Final for Release / Archive | `9f1ca53c597e87d8b62c010b5b0b7592a6290480c9bf1ee6b23fe8f7153017e1` |
| Independent Review | `version-work/v0.7.0/REVIEW.md` | Review Complete | `2e38ca57279638d82cb07e1d621b9f5b39a7784b4f1d552ce5e4b28fe09af2c8` |
| Release identity | `version-work/v0.7.0/RELEASE_NOTES.md` | Released — Local Private | `ed8bd6895bf8ea45fddb8d3c63dc347847eb7ab21c7c1ce1d08cdfc761bba6b4` |
| Archive readiness review | `version-work/v0.7.0/archive/ARCHIVE_READINESS_REVIEW.md` | Final — Approved for Archive Finalization | `acd871b47cb2572cc741b2127b88265a66685f2cea27b775a6a2fb04b21047a2` |
| Archive test execution | `version-work/v0.7.0/archive/TEST_EXECUTION_LOG.md` | Final | `41ba7e9991d511b4fdaaf5915deb3e872b0092d157d3a6616f95f3edfed77638` |
| Snapshot manifest | `version-work/v0.7.0/archive/CODE_SNAPSHOT_MANIFEST.sha256` | Final | `bdf228ea83a22366a7a8b7c812892d6e0fbe60163a9507d94f1f5b73d466ed89` |

# Implementation Trace Summary

- **Implementation Goal：** 在不改变 v0.6.0 Domain/Event Log 语义的前提下，建立高密度 DM 工作台、只读状态投影、统一视觉系统、受控布局和可回退的 v0.7.0 工作区。
- **Amendment Goal：** 收口地图视口、骰点历史与复合骰式、角色创建任务流和设置开发验证工具；Review 后补齐固定开发验证场景兼容覆盖。
- **Actual Change Scope：** 完整冻结在 `archive/code-snapshot/` 的 42 个发布文件；包含入口 HTML、启动器、12 个 JavaScript 源文件、样式表、24 个 Node 测试和 3 个合成浏览器夹具。
- **Key Decisions：** Domain 与 Projection 分离；UI 偏好独立存储；旧 v0.6 key 只读并以 copy-on-write 迁移；地图图片/动态边界/负坐标/热扩展与单位库搜索筛选保持后续 Backlog 身份。
- **Post-Review Correction：** 固定验证场景恢复 9 个单位、2 条角色基线、地精同组先攻及当前模板 ID 的确定性映射；该修正仅作用于开发验证路径。
- **Deviations from Approved Scope：** 无。R70-001 为 Review 后获授权的非阻塞兼容修正，未扩张产品能力范围。
- **Record Nature：** Evidence Synthesis。

# Code Evidence and Tested-Source Identity

- **Primary Mode：** Full Archive Snapshot。
- **Release ZIP SHA-256：** `00e48a82d4d2d62a3ccf0c84ab7e8bfe3b4927ec0c3f9ebf2723b2bb0af3e4d1`。
- **Release content manifest SHA-256：** `d32fdcd82e0988b9088c9bc84ef7d4e219a934c14ebe5b5cd851fda51b5b6914`。
- **Snapshot identity：** `archive/code-snapshot/` 由上述 Release ZIP 解包生成；42 个文件逐项匹配 `CODE_SNAPSHOT_MANIFEST.sha256` 与 Release 内容清单。
- **Snapshot manifest：** `CODE_SNAPSHOT_MANIFEST.sha256` 列出全部 42 个文件的 SHA-256；归档 Summary 不记录自身哈希。

# Configuration

**Status：Not Applicable。** 本版本是零依赖本地静态网页，不读取运行时配置文件、账户、凭据或外部服务。

# Runbook

- **Applicable Version：** `v0.7.0`；运行 `releases/v0.7.0/dnd-terminal-v0.7.0-local-private.zip` 中的 `start-dnd-terminal.command`，或以 Python 在 `127.0.0.1` 提供静态页面。
- **Dependencies：** Node.js 用于验证；Python 3 用于本地静态服务；产品不安装包依赖。
- **Stop / Limits：** 终止本地服务即停止；真实用户数据迁移、触屏与公开环境未验证。

# Testing Finalization

- **Results：** Release 内容清单 `42 / 42`；快照清单 `42 / 42`；JavaScript 语法 `12 / 12`；自动化测试 `24 / 24` 通过；Release ZIP `unzip -t` 通过；秘密扫描无命中。
- **Browser / Human Acceptance：** 隔离浏览器复验与 User Human Acceptance 事实记录于 `version-work/v0.7.0/TESTING.md` 与 `REVIEW.md`。
- **Unexecuted：** 真实用户数据迁移、DM 长时会话、压力测试、浏览器下载落盘检查、触屏验证、额外规则人工核对与公开环境验证未执行。

# Review and Archive Readiness

- **Independent Review：** `version-work/v0.7.0/REVIEW.md`，Review Complete；R70-001 已修复并完成回归验证。
- **Archive Readiness Review：** `archive/ARCHIVE_READINESS_REVIEW.md`，Final — Approved for Archive Finalization。
- **Authorization：** User 已授权先后执行 Local Private Release 与 Archive；本 Summary 只确认 Local Private Archive，不授予 Commit、Push、部署、公开发布或再分发。

# Archived Artifact and Hash List

| Artifact | Archive Relative Path | SHA-256 |
|---|---|---|
| Archive readiness review | `archive/ARCHIVE_READINESS_REVIEW.md` | `acd871b47cb2572cc741b2127b88265a66685f2cea27b775a6a2fb04b21047a2` |
| Test execution log | `archive/TEST_EXECUTION_LOG.md` | `41ba7e9991d511b4fdaaf5915deb3e872b0092d157d3a6616f95f3edfed77638` |
| Snapshot manifest | `archive/CODE_SNAPSHOT_MANIFEST.sha256` | `bdf228ea83a22366a7a8b7c812892d6e0fbe60163a9507d94f1f5b73d466ed89` |
| Snapshot files | `archive/code-snapshot/` | All 42 file hashes are listed in `CODE_SNAPSHOT_MANIFEST.sha256` and match the Release content manifest. |

`ARCHIVE_SUMMARY.md` 是最终冻结文件，按 Contract/Profile 不记录自身 SHA-256。

# Known Limitations

- 不实现完整规则引擎、自动行动、多人协作、云同步、部署、公开发布或公开再分发。
- 地图图片导入、动态边界、负坐标、四向热扩展和单位库搜索筛选继续属于 BL-007 / BL-029 后续方向。
- 规则资料仅作本地私有验证输入；翻译、出版身份、许可与再分发授权继续为 `unknown`。
- 本机静态服务随本地进程停止；真实用户数据迁移、触屏和公开环境未验证。

# Exceptions / Waivers

无。没有对任何 Archive Gate、源身份、测试、秘密安全或生命周期条件作出豁免。

# Next Version Status

BL-007 地图导入/动态边界/负坐标/热扩展与 BL-029 单位库搜索筛选保持 Backlog 身份；尚未创建新的 ABC、Implementation、Review、Release、Archive、部署或公开发布授权。任何后续变更必须使用新交付身份；本 v0.7.0 快照、发布包和归档记录不得修改。

# Archive Gate Results

| Gate | Result | Evidence |
|---|---|---|
| 1 — Required Artifacts | Pass | Summary、完整非 Git 代码快照、快照清单、测试执行日志、Review、Release Notes 与生命周期证据均存在；配置记录为 Not Applicable。 |
| 2 — Paths, Naming, and Profile Selection | Pass | v0.7.0 在 `ARCHIVE_PROFILE_SELECTION.md` 明确选择 Lightweight；归档根为 `version-work/v0.7.0/archive/`。 |
| 3 — Integrity and Hashes | Pass | 42 个快照文件逐项匹配 Release 内容清单；ZIP、清单、快照、测试形成单向身份链。 |
| 4 — Review Approval | Pass | Independent Review 已完成，R70-001 修正后聚焦合同与完整回归通过；Archive Readiness Review 已批准最终化。 |
| 5 — Testing Finalization | Pass | 快照清单 `42 / 42`、JavaScript 语法 `12 / 12`、测试 `24 / 24` 通过；未执行项明确保留。 |
| 6 — Secret Safety | Pass | 快照入口、启动器、源码与测试扫描未发现可用秘密或用户会话数据。 |
| 7 — Summary Completeness | Pass | Lightweight Summary 的身份链、归档文件、限制、八项 Gate、Readiness Review 与最终结论均已记录；未记录自身哈希。 |
| 8 — Lifecycle Consistency | Pass | ABC → Amendment → Implementation → Testing → Review → Release → Profile Selection → Readiness Review → Summary 顺序一致；后续能力未获授权。 |

# Final Verdict

Pass。八项 Archive Gate 均为 Pass。

# Final Archive Status

Archived — Local Private
