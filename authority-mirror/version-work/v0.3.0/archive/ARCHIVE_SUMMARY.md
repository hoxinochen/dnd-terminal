# Profile Selection

- **Selected Profile：** Lightweight
- **Selection Authority / Date：** User / `2026-08-24`，明确指令“执行archive”。
- **Decision Record：** `version-work/v0.3.0/ABC.md` §15，SHA-256 `7bf98a16422b0efa8ef923ce187c8e57c40288582bc4bc0611030d131b4fbc61`。
- **Reason：** 已有完整的 ABC、Implementation、Testing、Review、Release 与非 Git 发布身份；Lightweight 只合并叙述文档，不减免快照、哈希、测试、评审、秘密安全或八项 Gate。

# Project

DND Terminal

# Version

`v0.3.0`

# Version Name

长期角色卡、受控导入与战斗投影

# Archive Date

`2026-08-24`

# Stable Baseline

`v0.3.0 Released — Local Private`，发布包为 `releases/v0.3.0/dnd-terminal-v0.3.0-local-private.zip`；本归档只冻结该本地私有身份，不创建部署、公开发布、远端或再分发身份。

# Adopted Contract and Profile Version

- Archive Contract：`schema-v0.1.1`，SHA-256 `7817687601b2bad7cc8f87015d5b8f6b8ae4fe504cd68abb30b8255b531133df`。
- Lightweight Archive Profile：`schema-v0.1.2`，SHA-256 `7fc38398b5c131bddf16805e15f14382c0e4424be4bcf63ef115b0865643cb1e`。

# Lifecycle Evidence Map

| Evidence Role | Actual Project-Relative Path | Final Status | SHA-256 | Contribution |
|---|---|---|---|---|
| Approved scope and Profile selection | `version-work/v0.3.0/ABC.md` | Frozen; Archive selection recorded | `7bf98a16422b0efa8ef923ce187c8e57c40288582bc4bc0611030d131b4fbc61` | M1 scope、User Archive authorization、Contract/Profile selection and archive path |
| Implementation trace / Changelog equivalent | `version-work/v0.3.0/IMPLEMENTATION.md` | Final implementation record | `aa613faf6a591fc5c0026b9e81657e8ef4e55758bae64e2b01825fc40a3f82f7` | Chronological M1 change history and implementation boundaries |
| Testing | `version-work/v0.3.0/TESTING.md` | Final for Release / Archive | `eacab8531a233aa941151fcf34d172cf8bb46df1d95657b43a7d8cb6a3e01384` | Test plans, prior browser evidence, User Human Acceptance and release recheck |
| Test execution | `version-work/v0.3.0/archive/TEST_EXECUTION_LOG.md` | Final | `650527bfffbaf39490ada4489d0b84f562228c0f720758797078851c844e1f50` | Commands, 12 / 12 results, source identity chain and snapshot recheck |
| M1 Independent Review | `version-work/v0.3.0/REVIEW.md` | Review Approved — User | `e8f2206ff39338f3fda5af52a3450972e6dcebf2dc32c72e964a458f26f6f6a6` | Approved scope, code/test/rule-boundary review |
| Release identity | `version-work/v0.3.0/RELEASE_NOTES.md` | Released — Local Private | `cdaa1a771b0f04fd77243455bc87a71f313a1d036c6d11f15b7d0ea61df4a7e7` | Package and content-manifest identity |
| Archive readiness review | `version-work/v0.3.0/archive/ARCHIVE_READINESS_REVIEW.md` | Final — Approved for Archive Finalization | `eefd03fddf160994953a8160bb6f121a6a4aa5cd2b70deffc8c121cef6d04093` | Frozen-base review and Summary readiness |

# Implementation Trace Summary

- **Implementation Goal：** 将 DND Terminal 扩展为长期角色卡、受控导入、战斗投影、受限武器精通、关联单位和受审计战后回写的本地私有闭环。
- **Actual Change Scope：** `CharacterSheet` 修订、Excel `CharacterDraft`、八区详情、多施法来源/资源池、关联单位独立物化、短弓 Vex 提醒、逐项候选差异、角色归档和保存失败保护。
- **Files or Components Actually Changed：** 入口 HTML、`src/app.js`、`characters.js`、`character-import.js`、`encounter.js`、`geometry.js`、`session-persistence.js`、样式、本机启动器和 12 个测试，完整冻结于 `archive/code-snapshot/`。
- **Key Decisions：** 长期卡、投影和实例隔离；规则自动化限定为已准入的 DM 确认 Vex；战后回写默认候选；关联单位独立实例；无 Git 时以发布包、SHA-256 与快照建立身份。
- **Deviations from Approved Scope：** 无已记录的越界实施；Amendment 1/2 和 2026-08-24 武器精通追补均在 User 授权范围内。
- **Explicit Non-Implemented Boundaries：** 不实现完整规则引擎、全量职业/法术/精通合法性、自动掷骰/命中/伤害/行动经济、完整 PC 死亡规则、多人协作、部署、公开发布或再分发。
- **Testing References：** `TESTING.md`、`REVIEW.md`、本归档 `TEST_EXECUTION_LOG.md`。
- **Known Issues：** 不存在阻塞性已知缺陷；浏览器验收继续按既有记录分级，未在 Archive 中冒充重新运行。
- **Record Nature：** Evidence Synthesis。

# Code Evidence and Tested-Source Identity

- **Primary Mode：** Full Archive Snapshot（Workspace 未初始化 Git）。
- **Snapshot：** `archive/code-snapshot/` 包含发布 ZIP 的完整 21 个源/测试/启动文件。
- **Identity Chain：** Release Notes 固定 ZIP SHA-256 `bbb689aa2e2ee8cb3a55effc6186c274c4710f48310ece13376d791b87f6aa36` 和内容清单 SHA-256 `01cbc5f86ef9a665e08e470d1f8893dd47494558a311dfd7086bab8a61c99aa2`；每个快照文件均与该发布清单逐项一致，且在快照中复跑语法检查和 12 个测试通过。
- **Pre-existing Test Source Identity Evidence：** `REVIEW.md` 的发布前逐文件 SHA-256 与 Release 的内容清单；Archive 没有把仅 Archive 时生成的哈希作为唯一测试身份。

# Configuration

**Status：Not Applicable。** 本版本是零依赖本地静态浏览器单页，不读取运行时配置文件、凭据、账户或外部服务。`start-dnd-terminal.command` 的 `127.0.0.1` 固定回环绑定是本地启动行为，不是可用凭据或内部网络配置。

# Runbook

- **Applicable Version：** `v0.3.0`。
- **Verified Environment：** 本地 Node.js `v26.7.0` 用于语法检查和测试；macOS 本机启动器使用系统 Python 静态服务。
- **Required Dependencies：** Node.js 用于测试；Python 3 用于启动器；产品本身不安装包依赖。
- **Configuration Preparation：** Not Applicable；不需要密钥、账户或配置文件。
- **Start Procedure：** 在产品 Workspace 运行 `start-dnd-terminal.command`，启动器以 Python 在回环地址提供静态页面。
- **Stop Procedure：** 终止由启动器创建或复用的本地静态服务；此步骤未在本 Archive 中重新执行。
- **Minimum Verification / Test Entry Point：** `node --check` 四个关键源文件，然后运行 `tests/*.test.mjs`。
- **Known Limitations：** 浏览器人工验收记录存在，但 Archive 不重新运行浏览器流程；产品边界见“Known Limitations”。
- **Unverified Environments or Steps：** 非 macOS 环境、公开托管环境和多人/远端运行均未验证。

# Testing Finalization

- **Testing Path / Status：** `version-work/v0.3.0/TESTING.md` / Final for Release and Archive。
- **Execution Evidence / Status：** `version-work/v0.3.0/archive/TEST_EXECUTION_LOG.md` / Final。
- **Results：** 四项 Node 语法检查与 12 / 12 测试通过；归档快照逐项匹配发布清单（21 / 21）。
- **Unexecuted Items / Failures：** Archive 未重新执行浏览器流程；原有浏览器和 User Human Acceptance 证据保留。未记录自动测试失败。
- **Review Acceptance：** M1 Independent Review 已批准测试事实；Archive Readiness Review 确认其与冻结快照一致。

# Review Approval

- **M1 Independent Review：** `version-work/v0.3.0/REVIEW.md`，`Review Approved — User`，SHA-256 `e8f2206ff39338f3fda5af52a3450972e6dcebf2dc32c72e964a458f26f6f6a6`。
- **Archive Readiness Review：** `version-work/v0.3.0/archive/ARCHIVE_READINESS_REVIEW.md`，`Final — Approved for Archive Finalization`，SHA-256 `eefd03fddf160994953a8160bb6f121a6a4aa5cd2b70deffc8c121cef6d04093`。

# Archived Artifact and Hash List

| Requiredness | Artifact | Archive Relative Path or Git Reference | Provenance | SHA-256 | Status |
|---|---|---|---|---|---|
| Required | Test execution log | `archive/TEST_EXECUTION_LOG.md` | Archive evidence extraction from Testing/Review/Release | `650527bfffbaf39490ada4489d0b84f562228c0f720758797078851c844e1f50` | Frozen |
| Required | Archive readiness review | `archive/ARCHIVE_READINESS_REVIEW.md` | Formal review of frozen base artifacts | `eefd03fddf160994953a8160bb6f121a6a4aa5cd2b70deffc8c121cef6d04093` | Frozen |
| Required | Entry HTML | `archive/code-snapshot/index.html` | Released ZIP member | `5211ae6c6074625a75343785679f173e8940d704d85d9db01477ed8b07dfb072` | Frozen |
| Required | App source | `archive/code-snapshot/src/app.js` | Released ZIP member | `578975da6374a9774152a5d0f72846409a632cc4607a47eb9d90c3f2cb5df7cf` | Frozen |
| Required | Import source | `archive/code-snapshot/src/character-import.js` | Released ZIP member | `1d0a41d576e8f8bd47f75f87dcf9ee21e860ae2223c01de668871cecdabedebb` | Frozen |
| Required | Character source | `archive/code-snapshot/src/characters.js` | Released ZIP member | `93b25ab450e3870a49ee1346f7245b27aa7c0a7f0e48806d144a7e6d1edbb3a6` | Frozen |
| Required | Encounter source | `archive/code-snapshot/src/encounter.js` | Released ZIP member | `025d807c8266111915da938d555b4b878a830ed78909ba03e033807b9e07b223` | Frozen |
| Required | Geometry source | `archive/code-snapshot/src/geometry.js` | Released ZIP member | `a9f55df766a7951ef21970f44ad999370261bf4f2b97edb0b8e234c06206dbfe` | Frozen |
| Required | Persistence source | `archive/code-snapshot/src/session-persistence.js` | Released ZIP member | `8219798b0a322e13b6feeffefe7355557fc5aa756dcbc49689863d64624668ac` | Frozen |
| Required | Stylesheet | `archive/code-snapshot/src/styles.css` | Released ZIP member | `1bc9496555f6c407a674ecf59826c9bb0b1e115f16d979a54ef0274eb1beb377` | Frozen |
| Required | Local launcher | `archive/code-snapshot/start-dnd-terminal.command` | Released ZIP member | `ca34657892c9cd52447a12833a0442e21b217667e976dc997f80a2e2792a016f` | Frozen |
| Required | Import test | `archive/code-snapshot/tests/character-import-m1-s3.test.mjs` | Released ZIP member | `9891c571ca803b68c7efa47587487cac3f76c31b54ce8c862ffc375536edff4a` | Frozen |
| Required | Lifecycle test | `archive/code-snapshot/tests/character-lifecycle-m1-s5.test.mjs` | Released ZIP member | `314cf113cabfc4bd2615ece3392e8a0f192588ae29fb9bb21699a0601b4cd2bf` | Frozen |
| Required | Character UI test | `archive/code-snapshot/tests/character-ui-m1-s3.test.mjs` | Released ZIP member | `336997882b98b0073302e028bcd1826ee34af6b66a41482f42073a96cf9613dd` | Frozen |
| Required | M1-S1 test | `archive/code-snapshot/tests/characters-m1-s1.test.mjs` | Released ZIP member | `50d5be8ee1dff1329856c41c27af1d7d5608601c185f96d3c2a5196fd6b81a9e` | Frozen |
| Required | M1-S2 test | `archive/code-snapshot/tests/characters-m1-s2.test.mjs` | Released ZIP member | `50f771a6b9d191b2b5ead5761a686251469d0ed3b17dd6fd564e39e3c7896829` | Frozen |
| Required | Encounter test | `archive/code-snapshot/tests/encounter-v020.test.mjs` | Released ZIP member | `d0a588b4b70da227ec1240e0b048e3ecb7b49ac8b779a4dc07e1b6f69807b57e` | Frozen |
| Required | Geometry test | `archive/code-snapshot/tests/geometry.test.mjs` | Released ZIP member | `2d5199f24e557c3f44e20b96f1d640b3c7b26a684166edbc01dd94d821cc3b2a` | Frozen |
| Required | M1-S5 contract test | `archive/code-snapshot/tests/m1-s5-contract.test.mjs` | Released ZIP member | `cd4fff15fcd2de7cdc0bcf5789616f5977ef074bf6fe8eb0c0e0f8c18596898e` | Frozen |
| Required | Stabilization UI test | `archive/code-snapshot/tests/m1-s5-stabilization-ui.test.mjs` | Released ZIP member | `01c596a7a39a044591a4ef252e0e6e76ee1696cc6af2cd0f320e67a4f0f036ef` | Frozen |
| Required | Persistence test | `archive/code-snapshot/tests/persistence-m1-s5.test.mjs` | Released ZIP member | `03f27eeb2566b4943cb0d540d7fa4e5099d55a612be1f3b20dcce3e1ababdc91` | Frozen |
| Required | Spellcasting test | `archive/code-snapshot/tests/spellcasting-m1-s4.test.mjs` | Released ZIP member | `28e8b111582a79ad62cb4121d097b744276c10f6bf1b0963cb46064499ebc641` | Frozen |
| Required | Spellcasting UI test | `archive/code-snapshot/tests/spellcasting-ui-m1-s4.test.mjs` | Released ZIP member | `b915dc53362e518d739badd285d70b8e5997d9c76fd29991cf2be2a37c202bf4` | Frozen |

`ARCHIVE_SUMMARY.md` 是最终冻结文件，按 Contract/Profile 不记录自身 SHA-256。

# Known Limitations

- 仅已准入的匕首/Nick 与短弓/Vex 可选择；仅 Vex 产生 DM 确认后的优势提醒，不自动掷骰、命中、伤害、移动或行动经济。
- 完整规则引擎、全量职业/法术/精通合法性、完整 PC 死亡规则、多人协作、公开部署与公开发布均不在本版本范围。
- 规则资料仅供本地私有验证；翻译、出版身份、许可与再分发授权继续为 `unknown`。
- Workspace 没有 Git identity；本归档以已发布 ZIP、内容清单和完整快照建立可验证身份。

# Historical Reconstruction

**Record Nature：Evidence Synthesis。** 本归档在 Release 后创建，依据已冻结 ABC、Implementation、Testing、Review、Release Notes、发布 ZIP 和清单生成。新增的 Test Execution Log 与 Archive Readiness Review 明确标记为归档证据；不追溯改写原始实施、测试或人工验收时间线。未复跑浏览器流程保持为已记录边界，不以推断补齐。

# Exceptions / Waivers

无。未对任何 Archive Gate、源身份、测试、秘密安全或生命周期条件作豁免。

# Next Version Status

无新的产品版本、实施切片、部署或公开发布已获批准。未来变更必须使用新的交付身份与新的 ABC/门禁；`v0.3.0` 归档快照不得修改。

# Archive Gate Results

| Gate | Result | Evidence |
|---|---|---|
| 1 — Required Artifacts | Pass | Summary、完整非 Git 代码快照、测试执行日志、Review、生命周期证据均存在；配置以具体静态零配置事实记录 Not Applicable。 |
| 2 — Paths, Naming, and Profile Selection | Pass | User 选择 Lightweight；根目录为 `version-work/v0.3.0/archive/`，文件命名符合 Profile。 |
| 3 — Integrity and Hashes | Pass | 21 个快照文件逐项匹配发布清单；全部归档基础文件和 Review 均有 SHA-256；身份链来自发布前/发布时记录。 |
| 4 — Review Approval | Pass | M1 Review 已获 User 批准；Archive Readiness Review 在 Summary 前完成并批准归档最终化。 |
| 5 — Testing Finalization | Pass | Testing/执行日志 Final；快照内语法检查和 12 / 12 测试通过；未执行浏览器项明确保留。 |
| 6 — Secret Safety | Pass | 无运行时配置或凭据；快照检查未发现秘密模式，固定回环绑定已说明。 |
| 7 — Summary Completeness | Pass | 22 个必需标题、可验证路径/哈希、所有实际归档文件、八项 Gate 与最终结论均已在本 Summary 冻结前写入；未记录自身哈希。 |
| 8 — Lifecycle Consistency | Pass | ABC→Implementation→Testing→Review→Release→Profile selection→冻结基础证据→Archive Readiness Review→Summary 的顺序与状态一致；未批准下一版本。 |

# Final Verdict

Pass。八项 Archive Gate 均为 Pass。

# Final Archive Status

Archived — Local Private
