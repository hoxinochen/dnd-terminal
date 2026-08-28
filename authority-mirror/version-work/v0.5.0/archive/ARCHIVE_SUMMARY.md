# Profile Selection

- **Selected Profile：** `Lightweight`。
- **Selection Authority / Date：** User / `2026-08-28`。
- **Decision Record：** `version-work/v0.5.0/ARCHIVE_PROFILE_SELECTION.md`，SHA-256 `247f4e55ae7051e3ef3a3f3cc78efdfdd293d39c2760abf09d37fd0125e53f0e`。
- **Reason：** v0.5.0 的 ABC、Implementation、Testing、Review、Release Notes、发布包和内容清单均完整可核验。Lightweight 仅合并归档叙述，不减免任何证据、安全、测试、Review 或八项 Gate。

# Project

DND Terminal

# Version

`v0.5.0`

# Version Name

PC 死亡后复活、独立承接角色与受控亡灵

# Archive Date

`2026-08-28`

# Stable Baseline

`v0.5.0 Released — Local Private`，发布包为 `releases/v0.5.0/dnd-terminal-v0.5.0-local-private.zip`。本归档只冻结该本地私有身份，不创建部署、公开发布、远端或再分发身份。`v0.4.0 Archived — Local Private` 是历史技术与治理基线，其冻结材料未被修改。

# Adopted Contract and Profile Version

- Archive Contract：`schema-v0.1.1`，SHA-256 `7817687601b2bad7cc8f87015d5b8f6b8ae4fe504cd68abb30b8255b531133df`。
- Lightweight Archive Profile：`schema-v0.1.2`，SHA-256 `7fc38398b5c131bddf16805e15f14382c0e4424be4bcf63ef115b0865643cb1e`。

# Lifecycle Evidence Map

| Evidence Role | Actual Project-Relative Path | Final Status | SHA-256 |
|---|---|---|---|
| Approved scope | `version-work/v0.5.0/ABC.md` | Approved / Frozen | `a945d7b5d4d0d8a487cbf3687f447cc7c50153c8760c9389e7ac22b59bc77e12` |
| Profile selection | `version-work/v0.5.0/ARCHIVE_PROFILE_SELECTION.md` | Approved / Frozen for Archive Implementation | `247f4e55ae7051e3ef3a3f3cc78efdfdd293d39c2760abf09d37fd0125e53f0e` |
| Implementation trace | `version-work/v0.5.0/IMPLEMENTATION.md` | Final implementation record | `af143c0fe118979d66d7eda250efdd9897802e033ab8c99da71ed6aa8682a1e1` |
| Testing | `version-work/v0.5.0/TESTING.md` | Final for Release / Archive | `60ab34c5e54d7aafd1151df962b46b5d9b62fceb0118df120b06afb2a3884658` |
| Test execution | `version-work/v0.5.0/archive/TEST_EXECUTION_LOG.md` | Final | `7e9aee376196117697939caae0b734623882407cfbb7e6df817f3a8dc4d6a8b7` |
| Independent Review | `version-work/v0.5.0/REVIEW.md` | Review Approved — User | `3bf74cde32da504f79d008f3811d9caa89df637075993a4aa81465ed34fe98f9` |
| Release identity | `version-work/v0.5.0/RELEASE_NOTES.md` | Released — Local Private | `923f62d7db1f00c0e424392b1c4383600ffc177c4159bd296ab27c284f0bcaf6` |
| Archive readiness review | `version-work/v0.5.0/archive/ARCHIVE_READINESS_REVIEW.md` | Final — Approved for Archive Finalization | `36e452b44fed6172ba176ea3bc437cf47b4ebe4085c78229ed49fe0210f7bf27` |

# Implementation Trace Summary

- **Implementation Goal：** 为死亡 PC 建立不混淆的原实例复活、独立新身体、受控亡灵和剧情性亡灵 PC 生命周期。
- **Actual Change Scope：** 完整冻结在 `archive/code-snapshot/` 的 34 个发布文件；包含 S1、S2A/S2B/S2C、四选一 UI、可调整地图预览、受控关系/期限、长休续控审计和淡紫色受控棋子。
- **Key Decisions：** PC `lifePhase` 保持权威；S2A/S2C 创建独立角色卡；S2B 是 monster/NPC 控制关系而不是原 PC 复活；具体法术和战役时间不自动裁定。
- **Deviations from Approved Scope：** 无；Amendment 01–04 均为已批准范围补正。
- **Explicit Non-Implemented Boundaries：** 不执行具体法术合法性、材料、资源、精确时间、自动行动时序、完整规则引擎、多人、云同步、部署或公开发布。
- **Record Nature：** Evidence Synthesis。

# Code Evidence and Tested-Source Identity

- **Primary Mode：** Full Archive Snapshot。
- **Identity Chain：** Release Notes 固定 ZIP SHA-256 `6c51367227fb5ab763605b597e46541f05514a9c0e0f1f68985e3278ae3920b1` 和内容清单 SHA-256 `8d7e0ffe9a8a3f2ae5804be7b213f5a98c917932a85d1da57af390debe1a8941`；快照逐项匹配该清单 `34 / 34`，随后在同一快照内通过 `8 / 8` 语法检查和 `20 / 20` 自动化测试。

# Configuration

**Status：Not Applicable。** 本版本是零依赖本地静态网页，不读取运行时配置文件、账户、凭据或外部服务。

# Runbook

- **Applicable Version：** `v0.5.0`；运行 `start-dnd-terminal.command`，或以 Python 在 `127.0.0.1` 提供静态页面。
- **Dependencies：** Node.js 用于验证；Python 3 用于本地静态服务；产品不安装包依赖。
- **Stop / Limits：** 终止本地服务即停止；非 macOS、公开托管和真实用户数据归档复测未验证。

# Testing Finalization

- **Results：** Snapshot 内容清单 `34 / 34`；Node 语法检查 `8 / 8`；自动化测试 `20 / 20`；无自动测试失败。
- **Unexecuted：** 真实用户数据迁移、DM 长时会话、隔离 origin 浏览器端到端、跨对话持续性、压力测试和浏览器下载落盘检查未在归档阶段执行。

# Review Approval

- **Independent Review：** `version-work/v0.5.0/REVIEW.md`，`Review Approved — User`，SHA-256 `3bf74cde32da504f79d008f3811d9caa89df637075993a4aa81465ed34fe98f9`。
- **Archive Readiness Review：** `archive/ARCHIVE_READINESS_REVIEW.md`，`Final — Approved for Archive Finalization`，SHA-256 `36e452b44fed6172ba176ea3bc437cf47b4ebe4085c78229ed49fe0210f7bf27`。

# Archived Artifact and Hash List

| Artifact | Archive Relative Path | SHA-256 |
|---|---|---|
| Archive readiness review | `archive/ARCHIVE_READINESS_REVIEW.md` | `36e452b44fed6172ba176ea3bc437cf47b4ebe4085c78229ed49fe0210f7bf27` |
| Test execution log | `archive/TEST_EXECUTION_LOG.md` | `7e9aee376196117697939caae0b734623882407cfbb7e6df817f3a8dc4d6a8b7` |
| Snapshot files | `archive/code-snapshot/` | All 34 hashes match `releases/v0.5.0/checksums.sha256` SHA-256 `8d7e0ffe9a8a3f2ae5804be7b213f5a98c917932a85d1da57af390debe1a8941` |
| Entry HTML | `archive/code-snapshot/index.html` | `38d23400de0e9acb3bc920a7312d6cefaff5ae009bd887da8826eda94c69e267` |
| Launcher | `archive/code-snapshot/start-dnd-terminal.command` | `ca34657892c9cd52447a12833a0442e21b217667e976dc997f80a2e2792a016f` |
| App source | `archive/code-snapshot/src/app.js` | `c650d819277d515d336baa0c73ceb31f204307e323c538d1497ec17ffcb13e70` |
| Import source | `archive/code-snapshot/src/character-import.js` | `1d0a41d576e8f8bd47f75f87dcf9ee21e860ae2223c01de668871cecdabedebb` |
| Character source | `archive/code-snapshot/src/characters.js` | `da00a614468dfeb40cfde7cf69e3d9b0ed104254afc7a85dccceaa6b3d033e4a` |
| Encounter source | `archive/code-snapshot/src/encounter.js` | `1edb8eec900e543a18188ccbe751e97230b319cdfbdcd3141fae2a8e50317023` |
| Geometry source | `archive/code-snapshot/src/geometry.js` | `a9f55df766a7951ef21970f44ad999370261bf4f2b97edb0b8e234c06206dbfe` |
| v0.4 lifecycle source | `archive/code-snapshot/src/life-cycle-v040.js` | `0650a97308b8e15e9ad33b32f5008b3f214362227af16bc58891b4eeaf0608ab` |
| v0.5 lifecycle source | `archive/code-snapshot/src/life-cycle-v050.js` | `80e11f5891c37fd3e6295f51c67a8ea9f67f4cb953d779cf9cefae6a303f2d5b` |
| Persistence source | `archive/code-snapshot/src/session-persistence.js` | `8219798b0a322e13b6feeffefe7355557fc5aa756dcbc49689863d64624668ac` |
| Stylesheet | `archive/code-snapshot/src/styles.css` | `01d24901899698719c87464934c76b4fad58b217ea89c64b2541bfed1dbf3081` |
| Tests: character import / lifecycle / UI | `archive/code-snapshot/tests/character-import-m1-s3.test.mjs`; `character-lifecycle-m1-s5.test.mjs`; `character-ui-m1-s3.test.mjs` | `9891c571ca803b68c7efa47587487cac3f76c31b54ce8c862ffc375536edff4a`; `314cf113cabfc4bd2615ece3392e8a0f192588ae29fb9bb21699a0601b4cd2bf`; `336997882b98b0073302e028bcd1826ee34af6b66a41482f42073a96cf9613dd` |
| Tests: character M1 | `archive/code-snapshot/tests/characters-m1-s1.test.mjs`; `characters-m1-s2.test.mjs` | `50d5be8ee1dff1329856c41c27af1d7d5608601c185f96d3c2a5196fd6b81a9e`; `022dcee3c54bb9b8a97a7e6aa9891042647adb667e2cf6e87790b6495de0ce62` |
| Tests: encounter / geometry / v0.4 lifecycle / M1 contract | `archive/code-snapshot/tests/encounter-v020.test.mjs`; `geometry.test.mjs`; `life-cycle-v040.test.mjs`; `m1-s5-contract.test.mjs` | `d0a588b4b70da227ec1240e0b048e3ecb7b49ac8b779a4dc07e1b6f69807b57e`; `2d5199f24e557c3f44e20b96f1d640b3c7b26a684166edbc01dd94d821cc3b2a`; `a11da4b4687ebd39f032081d41811131602612fbbdd9d2a90228236a88690788`; `fbfcf9c9c72eb83ff455b14a0c681000d8f38a8cd3595f25b1db187b4b7287b7` |
| Tests: stabilization / persistence / spellcasting | `archive/code-snapshot/tests/m1-s5-stabilization-ui.test.mjs`; `persistence-m1-s5.test.mjs`; `spellcasting-m1-s4.test.mjs`; `spellcasting-ui-m1-s4.test.mjs` | `01c596a7a39a044591a4ef252e0e6e76ee1696cc6af2cd0f320e67a4f0f036ef`; `03f27eeb2566b4943cb0d540d7fa4e5099d55a612be1f3b20dcce3e1ababdc91`; `c97d500ade1f51995607d739d0530b90d63c18f7d216de5eef4561e7e9d9037c`; `ffa3c94c4cf861fc65cee5509fc36312c5b12b5398a7d00b6a5d3f7fa8700350` |
| Tests: v0.4 UI / v0.5 | `archive/code-snapshot/tests/v040-ui-contract.test.mjs`; `v050-amendment03.test.mjs`; `v050-s1-amendment.test.mjs`; `v050-s1-ui-contract.test.mjs`; `v050-s2.test.mjs` | `5de117f82ba0feadfadd2c7fd851aacf19559921d6cae964c65033a1e1d9d47d`; `858801e6a4aa9c3699dd2aec6e1e0a0a14d474a7a0cf60668d391b004f178774`; `33e66073efcc78995e4071f89d1a006fbd3d08786437728103505206b832f7ae`; `1e71febaa1c48cef9f7acb6e9144e127228c9e8d5492bf807ed86a84c68979d2`; `0e940ce017b6784de6b335a44d5d83b0e45dd4866c7e24efbfda309838b9c1df` |
| Compatibility test and fixtures | `archive/code-snapshot/tests/version-compatibility-v031.test.mjs`; `tests/fixtures/future-schema-browser-rejection.json`; `v020-browser-compat.json`; `v031-browser-compat.json` | `771da4407e1f2eab6215668a56fc78af01e1edbfada14739a1dad35d9cfc46ce`; `4a91d6103691f48914bca931483165fe232c46105bc3b3dbfadfefd0b99c95f3`; `1430f2576ab024f0992f13244015dd74dff0cd8272e5134473016562510ac72e`; `35a9ed91fc08641ef5f326ce54c0d96e4e2e1b8aeb11f6b4dbb02800b81a7f23` |

`ARCHIVE_SUMMARY.md` 是最终冻结文件，按 Contract/Profile 不记录自身 SHA-256。

# Known Limitations

- 不实现完整规则引擎、具体法术资格/材料/时间裁定、自动召唤物行动、多人协作、公开部署或公开发布。
- 规则资料仅作本地私有验证输入；翻译、出版身份、许可与再分发授权继续为 `unknown`。
- 本机静态服务随本地进程停止；非 macOS 与公开环境未验证。

# Historical Reconstruction

**Record Nature：Evidence Synthesis。** 本归档在 v0.5.0 Local Private Release 后创建，依据已冻结生命周期证据、发布 ZIP、内容清单、快照复测和 Archive Readiness Review 生成；不追溯改写原始实施、测试或用户反馈时间线。

# Exceptions / Waivers

无。没有对任何 Archive Gate、源身份、测试、秘密安全或生命周期条件作出豁免。

# Next Version Status

具体法术条件、材料、长期角色变更和法术专属行动时序仍为未来逐项准入方向；尚未创建新的 ABC、Implementation、Review、Release、Archive、部署或公开发布授权。任何后续变更必须使用新交付身份；本 v0.5.0 快照、发布包和归档记录不得修改。

# Archive Gate Results

| Gate | Result | Evidence |
|---|---|---|
| 1 — Required Artifacts | Pass | Summary、完整非 Git 代码快照、测试执行日志、Review 与生命周期证据均存在；配置具体记录为 Not Applicable。 |
| 2 — Paths, Naming, and Profile Selection | Pass | User 在 `ARCHIVE_PROFILE_SELECTION.md` 于归档实施前选择 Lightweight；归档根为 `version-work/v0.5.0/archive/`。 |
| 3 — Integrity and Hashes | Pass | 34 个快照文件逐项匹配发布清单；基础证据和 Readiness Review 有 SHA-256；发布 ZIP / 清单 / 快照 / 测试形成单向身份链。 |
| 4 — Review Approval | Pass | Independent Review 已获 User 批准；Archive Readiness Review 在 Summary 前完成并批准最终化。 |
| 5 — Testing Finalization | Pass | 快照内清单 `34 / 34`、语法 `8 / 8`、测试 `20 / 20` 通过；未执行项明确保留。 |
| 6 — Secret Safety | Pass | 无运行时配置或凭据；快照扫描未发现可用秘密或用户会话数据。 |
| 7 — Summary Completeness | Pass | 22 个必需标题、归档文件、身份链、八项 Gate 与最终结论均在冻结前记录；未记录自身哈希。 |
| 8 — Lifecycle Consistency | Pass | ABC → Implementation → Testing → Review → Release → Profile selection → Readiness Review → Summary 的顺序一致；后续能力未获授权。 |

# Final Verdict

Pass。八项 Archive Gate 均为 Pass。

# Final Archive Status

Archived — Local Private
