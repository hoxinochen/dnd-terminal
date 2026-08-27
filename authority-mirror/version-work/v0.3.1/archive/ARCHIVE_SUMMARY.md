# Profile Selection

- **Selected Profile：** `Lightweight`。
- **Selection Authority / Date：** User / `2026-08-24`。
- **Decision Record：** `version-work/v0.3.1/ABC.md` §8，SHA-256 `60142a9a5a07f04823123165111f3b94b84f00202275e1f538e26dd07ad6f8da`。
- **Reason：** v0.3.1 的 ABC、Implementation、Final Testing、Review、Release Notes、发布包和哈希身份均完整可核验。Lightweight 仅合并归档叙述，不减免任何证据、安全、测试、Review 或八项 Gate。

# Project

DND Terminal

# Version

`v0.3.1`

# Version Name

版本身份与兼容性补丁

# Archive Date

`2026-08-24`

# Stable Baseline

`v0.3.1 Released — Local Private`，发布包为 `releases/v0.3.1/dnd-terminal-v0.3.1-local-private.zip`。本归档只冻结该本地私有身份，不创建部署、公开发布、远端或再分发身份。

# Adopted Contract and Profile Version

- Archive Contract：`schema-v0.1.1`，SHA-256 `7817687601b2bad7cc8f87015d5b8f6b8ae4fe504cd68abb30b8255b531133df`。
- Lightweight Archive Profile：`schema-v0.1.2`，SHA-256 `7fc38398b5c131bddf16805e15f14382c0e4424be4bcf63ef115b0865643cb1e`。

# Lifecycle Evidence Map

| Evidence Role | Actual Project-Relative Path | Final Status | SHA-256 | Contribution |
|---|---|---|---|---|
| Approved scope and Profile selection | `version-work/v0.3.1/ABC.md` | Frozen; Archive selection recorded | `60142a9a5a07f04823123165111f3b94b84f00202275e1f538e26dd07ad6f8da` | Scope, protected boundaries, User authorization and Lightweight selection. |
| Implementation trace / Changelog equivalent | `version-work/v0.3.1/IMPLEMENTATION.md` | Final implementation record | `a34c560196292d524de73db9503161012df95417c7837062db92aacd5aa0984d` | Actual version identity, Envelope and Chrome cache repair facts. |
| Testing | `version-work/v0.3.1/TESTING.md` | Final for Release / Archive | `a3708e3c63722272bff13657dcfb67e592c3c9d43dbb29cc548817635626f690` | Automated, browser and User Human Acceptance evidence with limits retained. |
| Test execution | `version-work/v0.3.1/archive/TEST_EXECUTION_LOG.md` | Final | `75cb93033ff8c4db9c519fed4eb5848c85e0457918e051c9e1bd2febce0c8339` | Snapshot identity check, syntax and 13 / 13 execution results. |
| Independent Review | `version-work/v0.3.1/REVIEW.md` | Review Approved — User | `3c147160ba74c18862ba943c775c388de33332590335c547b271cfa2ba8f838e` | Scope, contract, safety and release readiness review. |
| Release identity | `version-work/v0.3.1/RELEASE_NOTES.md` | Released — Local Private | `79788b1e68adcaafc4df03cb1df66b837264b61fefc87d6cbab0c0ca02f0ef64` | ZIP, 25-file manifest and local-private distribution identity. |
| Archive readiness review | `version-work/v0.3.1/archive/ARCHIVE_READINESS_REVIEW.md` | Final — Approved for Archive Finalization | `803806f93bfd59ac31e73a66d1abc616ea02c522d2e262763905f0133a571f6f` | Frozen-base review and Summary readiness. |

# Implementation Trace Summary

- **Implementation Goal：** 在不增加玩法、不提升数据 Schema 且不迁移用户数据的前提下，澄清产品交付、Session Envelope、CharacterSheet 与浏览器存储的版本身份。
- **Actual Change Scope：** `index.html`、`src/app.js`、`src/encounter.js`、一项版本兼容测试和三项脱敏浏览器夹具；手动导出增加可选 `deliveryVersion`，Chrome 模块缓存失配得到修复。
- **Files or Components Actually Changed：** 完整冻结于 `archive/code-snapshot/` 的 25 个发布文件；本归档没有把 Rules Baseline、原始 Excel、用户数据或 Authority 文档打入快照。
- **Key Decisions：** Delivery `0.3.1` 与 Session Schema `0.2.0` 分离；CharacterSheet Schema 保持 `0.3.0-m1-s5`；所有既有存储键不变；可选导出元数据不参与 Schema 校验；模块修订标记防止旧缓存搭配新入口。
- **Deviations from Approved Scope：** 无。验收期缓存修复属于 ABC A-2/A-4 内的技术交付完整性修复。
- **Explicit Non-Implemented Boundaries：** 不实现新规则准入、角色死亡状态机、法术/伤害执行、全量武器精通、数据迁移、多人、云同步、部署、公开发布或再分发。
- **Testing References：** `TESTING.md`、`REVIEW.md`、本归档 `TEST_EXECUTION_LOG.md`。
- **Known Issues：** 无阻塞性已知缺陷；手动下载文件的实际落盘位置继续由用户浏览器决定，真实用户数据流程未在归档阶段重跑。
- **Record Nature：** Evidence Synthesis。

# Code Evidence and Tested-Source Identity

- **Primary Mode：** Full Archive Snapshot。
- **Snapshot：** `archive/code-snapshot/` 包含发布 ZIP 的全部 25 个文件。
- **Identity Chain：** Release Notes 固定 ZIP SHA-256 `633a429c2dcd43754f5bf0aeac58c4b320e72cad4f86687d773e553be73f70f1` 和内容清单 SHA-256 `a0c227e7978a8b1b6e4e010bdbaeb353296f118baaf630c65cd86abdd06e62c0`；快照在归档测试前逐项匹配该清单 25 / 25，并在同一快照内通过 6 / 6 语法检查和 13 / 13 测试。
- **Test Source Identity Evidence：** `archive/TEST_EXECUTION_LOG.md` 记录清单先行核验与后续测试；`REVIEW.md` 记录实施期的受影响文件 SHA-256。归档没有只以路径、文件名或归档后视觉检查作为身份事实。

# Configuration

**Status：Not Applicable。** 本版本是零依赖本地静态网页，不读取运行时配置文件、账户、凭据或外部服务；因此没有可归档的配置结构或需要脱敏的配置样例。

# Runbook

- **Applicable Version：** `v0.3.1`。
- **Verified Environment：** Node.js `v26.7.0` 用于语法检查和测试；macOS 系统 Python 静态服务用于本地浏览器运行。
- **Required Dependencies：** Node.js 用于测试；Python 3 用于本地静态服务；产品本身不安装包依赖。
- **Configuration Preparation：** Not Applicable；不需要密钥、账户或配置文件。
- **Start Procedure：** 在产品 Workspace 运行 `start-dnd-terminal.command`，或以 Python 在 `127.0.0.1` 提供静态页面。
- **Stop Procedure：** 终止本地静态服务进程；该进程退出后本地地址不再可用。
- **Minimum Verification / Test Entry Point：** 对 6 个 `src/*.js` 执行 `node --check`，然后运行 `tests/*.test.mjs`。
- **Known Limitations：** 非 macOS、公开托管、多人和远端环境未验证；浏览器下载保存位置不由产品控制。
- **Unverified Environments or Steps：** 未验证部署/公开环境，未以真实用户数据重跑归档阶段测试。

# Testing Finalization

- **Testing Path / Status：** `version-work/v0.3.1/TESTING.md` / Final for Release / Archive，SHA-256 `a3708e3c63722272bff13657dcfb67e592c3c9d43dbb29cc548817635626f690`。
- **Execution Evidence / Status：** `version-work/v0.3.1/archive/TEST_EXECUTION_LOG.md` / Final，SHA-256 `75cb93033ff8c4db9c519fed4eb5848c85e0457918e051c9e1bd2febce0c8339`。
- **Results：** Snapshot 内容清单 25 / 25；Node 语法检查 6 / 6；自动化测试 13 / 13。
- **Unexecuted Items / Failures：** 真实用户数据导入、下载实际文件落盘和额外规则人工核对未在归档阶段执行，均明确保留；无自动测试失败。
- **Review Acceptance：** `REVIEW.md` 已获 User 批准，Archive Readiness Review 确认测试事实与冻结快照一致。

# Review Approval

- **Independent Review：** `version-work/v0.3.1/REVIEW.md`，`Review Approved — User`，SHA-256 `3c147160ba74c18862ba943c775c388de33332590335c547b271cfa2ba8f838e`。
- **Archive Readiness Review：** `version-work/v0.3.1/archive/ARCHIVE_READINESS_REVIEW.md`，`Final — Approved for Archive Finalization`，SHA-256 `803806f93bfd59ac31e73a66d1abc616ea02c522d2e262763905f0133a571f6f`。

# Archived Artifact and Hash List

| Requiredness | Artifact | Archive Relative Path or Git Reference | Provenance | SHA-256 | Status |
|---|---|---|---|---|---|
| Required | Archive readiness review | `archive/ARCHIVE_READINESS_REVIEW.md` | Frozen review of base artifacts and Summary readiness | `803806f93bfd59ac31e73a66d1abc616ea02c522d2e262763905f0133a571f6f` | Frozen |
| Required | Test execution log | `archive/TEST_EXECUTION_LOG.md` | Archive snapshot test execution | `75cb93033ff8c4db9c519fed4eb5848c85e0457918e051c9e1bd2febce0c8339` | Frozen |
| Required | Entry HTML | `archive/code-snapshot/index.html` | Released ZIP member | `40d11618adae0f0405e9c21b97656eeb863f8bb51867c61d0e66fbcf30351ae5` | Frozen |
| Required | Local launcher | `archive/code-snapshot/start-dnd-terminal.command` | Released ZIP member | `ca34657892c9cd52447a12833a0442e21b217667e976dc997f80a2e2792a016f` | Frozen |
| Required | App source | `archive/code-snapshot/src/app.js` | Released ZIP member | `69e2669aa1ec739228480a9ce2b212a2d57e8d2c40cb454af751741dc0be3e12` | Frozen |
| Required | Import source | `archive/code-snapshot/src/character-import.js` | Released ZIP member | `1d0a41d576e8f8bd47f75f87dcf9ee21e860ae2223c01de668871cecdabedebb` | Frozen |
| Required | Character source | `archive/code-snapshot/src/characters.js` | Released ZIP member | `93b25ab450e3870a49ee1346f7245b27aa7c0a7f0e48806d144a7e6d1edbb3a6` | Frozen |
| Required | Envelope source | `archive/code-snapshot/src/encounter.js` | Released ZIP member | `38cbd0a6fbb28e193313aaa47d7a0a951a7ac8bf807e9fb1ff19059439db6c54` | Frozen |
| Required | Geometry source | `archive/code-snapshot/src/geometry.js` | Released ZIP member | `a9f55df766a7951ef21970f44ad999370261bf4f2b97edb0b8e234c06206dbfe` | Frozen |
| Required | Persistence source | `archive/code-snapshot/src/session-persistence.js` | Released ZIP member | `8219798b0a322e13b6feeffefe7355557fc5aa756dcbc49689863d64624668ac` | Frozen |
| Required | Stylesheet | `archive/code-snapshot/src/styles.css` | Released ZIP member | `1bc9496555f6c407a674ecf59826c9bb0b1e115f16d979a54ef0274eb1beb377` | Frozen |
| Required | Import test | `archive/code-snapshot/tests/character-import-m1-s3.test.mjs` | Released ZIP member | `9891c571ca803b68c7efa47587487cac3f76c31b54ce8c862ffc375536edff4a` | Frozen |
| Required | Lifecycle test | `archive/code-snapshot/tests/character-lifecycle-m1-s5.test.mjs` | Released ZIP member | `314cf113cabfc4bd2615ece3392e8a0f192588ae29fb9bb21699a0601b4cd2bf` | Frozen |
| Required | Character UI test | `archive/code-snapshot/tests/character-ui-m1-s3.test.mjs` | Released ZIP member | `336997882b98b0073302e028bcd1826ee34af6b66a41482f42073a96cf9613dd` | Frozen |
| Required | Character M1-S1 test | `archive/code-snapshot/tests/characters-m1-s1.test.mjs` | Released ZIP member | `50d5be8ee1dff1329856c41c27af1d7d5608601c185f96d3c2a5196fd6b81a9e` | Frozen |
| Required | Character M1-S2 test | `archive/code-snapshot/tests/characters-m1-s2.test.mjs` | Released ZIP member | `50f771a6b9d191b2b5ead5761a686251469d0ed3b17dd6fd564e39e3c7896829` | Frozen |
| Required | Encounter test | `archive/code-snapshot/tests/encounter-v020.test.mjs` | Released ZIP member | `d0a588b4b70da227ec1240e0b048e3ecb7b49ac8b779a4dc07e1b6f69807b57e` | Frozen |
| Required | Geometry test | `archive/code-snapshot/tests/geometry.test.mjs` | Released ZIP member | `2d5199f24e557c3f44e20b96f1d640b3c7b26a684166edbc01dd94d821cc3b2a` | Frozen |
| Required | M1-S5 contract test | `archive/code-snapshot/tests/m1-s5-contract.test.mjs` | Released ZIP member | `cd4fff15fcd2de7cdc0bcf5789616f5977ef074bf6fe8eb0c0e0f8c18596898e` | Frozen |
| Required | Stabilization UI test | `archive/code-snapshot/tests/m1-s5-stabilization-ui.test.mjs` | Released ZIP member | `01c596a7a39a044591a4ef252e0e6e76ee1696cc6af2cd0f320e67a4f0f036ef` | Frozen |
| Required | Persistence test | `archive/code-snapshot/tests/persistence-m1-s5.test.mjs` | Released ZIP member | `03f27eeb2566b4943cb0d540d7fa4e5099d55a612be1f3b20dcce3e1ababdc91` | Frozen |
| Required | Spellcasting test | `archive/code-snapshot/tests/spellcasting-m1-s4.test.mjs` | Released ZIP member | `28e8b111582a79ad62cb4121d097b744276c10f6bf1b0963cb46064499ebc641` | Frozen |
| Required | Spellcasting UI test | `archive/code-snapshot/tests/spellcasting-ui-m1-s4.test.mjs` | Released ZIP member | `b915dc53362e518d739badd285d70b8e5997d9c76fd29991cf2be2a37c202bf4` | Frozen |
| Required | v0.3.1 compatibility test | `archive/code-snapshot/tests/version-compatibility-v031.test.mjs` | Released ZIP member | `77499f130eb8687ab5b9f5238c3568f60d798ae5db092dd95dcd809dd20a5040` | Frozen |
| Required | Future Schema rejection fixture | `archive/code-snapshot/tests/fixtures/future-schema-browser-rejection.json` | Released ZIP member; synthetic | `4a91d6103691f48914bca931483165fe232c46105bc3b3dbfadfefd0b99c95f3` | Frozen |
| Required | v0.2 compatibility fixture | `archive/code-snapshot/tests/fixtures/v020-browser-compat.json` | Released ZIP member; synthetic | `1430f2576ab024f0992f13244015dd74dff0cd8272e5134473016562510ac72e` | Frozen |
| Required | v0.3.1 compatibility fixture | `archive/code-snapshot/tests/fixtures/v031-browser-compat.json` | Released ZIP member; synthetic | `35a9ed91fc08641ef5f326ce54c0d96e4e2e1b8aeb11f6b4dbb02800b81a7f23` | Frozen |

`ARCHIVE_SUMMARY.md` 是最终冻结文件，按 Contract/Profile 不记录自身 SHA-256。

# Known Limitations

- 产品仍不实现完整规则引擎、全量职业/法术/武器精通合法性、自动掷骰/命中/伤害、完整 PC 死亡规则、多人协作、公开部署或公开发布。
- `deliveryVersion` 是可选导出来源元数据，不是新 Schema；会话 Schema 仍为 `0.2.0`。
- 规则资料仅作本地私有验证输入；翻译、出版身份、许可与再分发授权继续为 `unknown`。
- 本机静态服务随其本地进程停止而停止；非 macOS 与公开环境未验证。

# Historical Reconstruction

**Record Nature：Evidence Synthesis。** 本归档在 v0.3.1 Local Private Release 后创建，依据已冻结的 ABC、Implementation、Testing、Review、Release Notes、发布 ZIP、内容清单、快照复测和 Archive Readiness Review 生成。新增 Test Execution Log 与 Archive Readiness Review 明确标记为归档期证据；它们不追溯改写原始实施、测试或人工验收时间线。未重新执行的浏览器或真实用户数据步骤保持为既有边界。

# Exceptions / Waivers

无。没有对任何 Archive Gate、源身份、测试、秘密安全或生命周期条件作出豁免。

# Next Version Status

没有新的产品版本、实施切片、部署或公开发布获批准。后续变更必须使用新的交付身份与新的 ABC/门禁；本 v0.3.1 快照、发布包和归档记录不得修改。

# Archive Gate Results

| Gate | Result | Evidence |
|---|---|---|
| 1 — Required Artifacts | Pass | Summary、完整非 Git 代码快照、测试执行日志、Review 与所有生命周期证据均存在；配置按具体静态零配置事实记录 Not Applicable。 |
| 2 — Paths, Naming, and Profile Selection | Pass | User 在 `ABC.md` §8 选择 Lightweight；归档根为 `version-work/v0.3.1/archive/`，命名符合 Profile。 |
| 3 — Integrity and Hashes | Pass | 25 个快照文件逐项匹配发布清单；全部归档基础文件和 Readiness Review 均有 SHA-256；发布 ZIP / 清单 / 快照 / 测试形成单向身份链。 |
| 4 — Review Approval | Pass | Independent Review 已获 User 批准；Archive Readiness Review 在 Summary 前完成并批准归档最终化。 |
| 5 — Testing Finalization | Pass | Testing 与执行日志均为 Final；快照内清单 25 / 25、语法 6 / 6、测试 13 / 13 通过；未执行项明确保留。 |
| 6 — Secret Safety | Pass | 无运行时配置或凭据；冻结 archive 文件扫描未发现可用秘密或用户会话数据。 |
| 7 — Summary Completeness | Pass | 22 个必需标题、所有实际归档文件、可验证路径/哈希、八项 Gate 与最终结论均在 Summary 冻结前写入；未记录自身哈希。 |
| 8 — Lifecycle Consistency | Pass | ABC → Implementation → Testing → Human Acceptance → Review → Release → Profile selection → frozen base evidence → Archive Readiness Review → Summary 的顺序与状态一致；未批准下一版本。 |

# Final Verdict

Pass。八项 Archive Gate 均为 Pass。

# Final Archive Status

Archived — Local Private
