# Profile Selection

- **Selected Profile：** `Lightweight`。
- **Selection Authority / Date：** User / `2026-08-25`。
- **Decision Record：** `version-work/v0.4.0/ARCHIVE_PROFILE_SELECTION.md`，SHA-256 `5bea91ef8494bc8e7814097ce58e66ed3f3849622790bb134bb2b985ced50388`。
- **Reason：** v0.4.0 的 ABC、Implementation、Testing、Review、Release Notes、发布包和内容清单均完整可核验。Lightweight 仅合并归档叙述，不减免任何证据、安全、测试、Review 或八项 Gate。

# Project

DND Terminal

# Version

`v0.4.0`

# Version Name

PC 0 HP、死亡豁免与稳定状态

# Archive Date

`2026-08-25`

# Stable Baseline

`v0.4.0 Released — Local Private`，发布包为 `releases/v0.4.0/dnd-terminal-v0.4.0-local-private.zip`。本归档只冻结该本地私有身份，不创建部署、公开发布、远端或再分发身份。`v0.3.1 Archived — Local Private` 是历史技术与治理基线，其冻结材料未被修改。

# Adopted Contract and Profile Version

- Archive Contract：`schema-v0.1.1`，SHA-256 `7817687601b2bad7cc8f87015d5b8f6b8ae4fe504cd68abb30b8255b531133df`。
- Lightweight Archive Profile：`schema-v0.1.2`，SHA-256 `7fc38398b5c131bddf16805e15f14382c0e4424be4bcf63ef115b0865643cb1e`。

# Lifecycle Evidence Map

| Evidence Role | Actual Project-Relative Path | Final Status | SHA-256 | Contribution |
|---|---|---|---|---|
| Approved scope | `version-work/v0.4.0/ABC.md` | Approved / Frozen | `81c6d87f4622a155da23114b16ecb076cf5cbc8b12af81d2df16fbdc19fc2aa1` | Scope, protected boundaries, compatibility and rollback contract. |
| Profile selection | `version-work/v0.4.0/ARCHIVE_PROFILE_SELECTION.md` | Approved / Frozen for Archive Implementation | `5bea91ef8494bc8e7814097ce58e66ed3f3849622790bb134bb2b985ced50388` | User selection of Lightweight before archive implementation. |
| Implementation trace | `version-work/v0.4.0/IMPLEMENTATION.md` | Final implementation record | `9ee49b2fe6ead9c25abb3ae0db169d7a80fff6eece22d969142b84ed8f242b8d` | Actual PC lifecycle, d20 and condition-separation implementation facts. |
| Testing | `version-work/v0.4.0/TESTING.md` | Final for Release / Archive | `7202ec1f18140bf29fb5025c686c48c58a09c281ffef22ed84208970d84f73a1` | Automated, browser and User Human Acceptance evidence with deferred validation retained. |
| Test execution | `version-work/v0.4.0/archive/TEST_EXECUTION_LOG.md` | Final | `24828cb7256e17194e1d61ce191fa31e88ab0c20af5b9b3a080d5f628a18cc8b` | Snapshot identity check, syntax and 15 / 15 execution results. |
| Independent Review | `version-work/v0.4.0/REVIEW.md` | Review Approved — User | `e16744a4fbf760e2f8d3ffd7ae07e55403b35e1a3b5910be0a672649be1795e2` | Scope, rules, safety, compatibility and release-readiness review. |
| Release identity | `version-work/v0.4.0/RELEASE_NOTES.md` | Released — Local Private | `f3db51db8656cc0dcc3249065dc10499446d96949aba4ff5931969f288f3ce99` | ZIP, 28-file manifest and local-private distribution identity. |
| Archive readiness review | `version-work/v0.4.0/archive/ARCHIVE_READINESS_REVIEW.md` | Final — Approved for Archive Finalization | `72c7484c1b6d23592af0493e84ca17840dce064f33ca6077e3289f98c55cdce8` | Frozen-base review and Summary readiness. |

# Implementation Trace Summary

- **Implementation Goal：** 在本地单人战斗会话中建立 PC 从正 HP 到 `0 HP`、死亡豁免、稳定、死亡、治疗恢复与 DM 修正的可恢复、可审计闭环。
- **Actual Change Scope：** `index.html`、`src/app.js`、`src/encounter.js`、新增 `src/life-cycle-v040.js`，以及四项相关测试；Amendment 01 增加 d20 面板、生命阶段与昏迷/倒地分离、治疗后保留倒地与起立消耗速度一半。
- **Files or Components Actually Changed：** 完整冻结于 `archive/code-snapshot/` 的 28 个发布文件；本归档没有把 Rules Baseline、用户数据、浏览器 `localStorage`、Authority 文档或历史发布/归档材料打入快照。
- **Key Decisions：** PC 以 `lifePhase = active | dying | stable | dead | needs-review` 为权威；`unconscious` 与 `prone` 是独立条件；Terminal d20 与手动最终 d20 均进入顺序事件；Session Schema 为 `0.3.0`，新 key copy-on-write，旧 key 不改写。
- **Deviations from Approved Scope：** 无。Amendment 01 是已获 User 批准的唯一范围补正。
- **Explicit Non-Implemented Boundaries：** 不实现 PC 死亡后的复活或转化、完整昏迷外围效果、完整伤害/法术引擎、多人、云同步、部署、公开发布或再分发。
- **Testing References：** `TESTING.md`、`REVIEW.md`、本归档 `TEST_EXECUTION_LOG.md`。
- **Known Issues：** 无阻塞性已知缺陷；真实 DM 长时会话、跨多次对话持续性与压力测试尚未执行，按 User 决定延期。
- **Record Nature：** Evidence Synthesis。

# Code Evidence and Tested-Source Identity

- **Primary Mode：** Full Archive Snapshot。
- **Snapshot：** `archive/code-snapshot/` 包含发布 ZIP 的全部 28 个文件。
- **Identity Chain：** Release Notes 固定 ZIP SHA-256 `774cc4ed1317c8b061be690725a3450bf58fdf316bd06d583343141c98a055d2` 和内容清单 SHA-256 `4bf308905b05eeea7143abe6bda229fbf16979c8bb296720d91149e8e34c3979`；该内容清单在 Local Private Release 期间建立，并由 Release Notes 记录其发布前 15 / 15 测试结果。归档开始前，快照逐项匹配该清单 `28 / 28`，随后在同一快照内通过 `7 / 7` 语法检查和 `15 / 15` 自动化测试。
- **Test Source Identity Evidence：** `archive/TEST_EXECUTION_LOG.md` 记录发布内容清单先行核验与后续快照测试；`RELEASE_NOTES.md` 记录该清单、ZIP 与发布前回归结果；`REVIEW.md` 记录受影响文件 SHA-256。归档没有只以路径、文件名或归档后视觉检查作为身份事实。

# Configuration

**Status：Not Applicable。** 本版本是零依赖本地静态网页，不读取运行时配置文件、账户、凭据或外部服务；因此没有可归档的配置结构或需要脱敏的配置样例。

# Runbook

- **Applicable Version：** `v0.4.0`。
- **Verified Environment：** Node.js `v26.7.0` 用于语法检查和测试；macOS 系统 Python 静态服务用于已记录的本地浏览器运行。
- **Required Dependencies：** Node.js 用于测试；Python 3 用于本地静态服务；产品本身不安装包依赖。
- **Configuration Preparation：** Not Applicable；不需要密钥、账户或配置文件。
- **Start Procedure：** 在产品 Workspace 运行 `start-dnd-terminal.command`，或以 Python 在 `127.0.0.1` 提供静态页面。
- **Stop Procedure：** 终止本地静态服务进程；该进程退出后本地地址不再可用。
- **Minimum Verification / Test Entry Point：** 对 7 个 `src/*.js` 执行 `node --check`，然后运行 `node --test`。
- **Known Limitations：** 非 macOS、公开托管、多人和远端环境未验证；浏览器下载保存位置不由产品控制。
- **Unverified Environments or Steps：** 未验证部署/公开环境，未以真实用户数据重跑归档阶段测试。

# Testing Finalization

- **Testing Path / Status：** `version-work/v0.4.0/TESTING.md` / Final for Release / Archive，SHA-256 `7202ec1f18140bf29fb5025c686c48c58a09c281ffef22ed84208970d84f73a1`。
- **Execution Evidence / Status：** `version-work/v0.4.0/archive/TEST_EXECUTION_LOG.md` / Final，SHA-256 `24828cb7256e17194e1d61ce191fa31e88ab0c20af5b9b3a080d5f628a18cc8b`。
- **Results：** Snapshot 内容清单 `28 / 28`；Node 语法检查 `7 / 7`；自动化测试 `15 / 15`。
- **Unexecuted Items / Failures：** 真实用户数据迁移、真实 DM 长时会话、跨多次对话持续性、压力测试、浏览器下载实际落盘和额外规则人工核对未在归档阶段执行，均明确保留；无自动测试失败。
- **Review Acceptance：** `REVIEW.md` 已获 User 批准，Archive Readiness Review 确认测试事实与冻结快照一致。

# Review Approval

- **Independent Review：** `version-work/v0.4.0/REVIEW.md`，`Review Approved — User`，SHA-256 `e16744a4fbf760e2f8d3ffd7ae07e55403b35e1a3b5910be0a672649be1795e2`。
- **Archive Readiness Review：** `version-work/v0.4.0/archive/ARCHIVE_READINESS_REVIEW.md`，`Final — Approved for Archive Finalization`，SHA-256 `72c7484c1b6d23592af0493e84ca17840dce064f33ca6077e3289f98c55cdce8`。

# Archived Artifact and Hash List

| Requiredness | Artifact | Archive Relative Path or Git Reference | Provenance | SHA-256 | Status |
|---|---|---|---|---|---|
| Required | Archive readiness review | `archive/ARCHIVE_READINESS_REVIEW.md` | Frozen review of base artifacts and Summary readiness | `72c7484c1b6d23592af0493e84ca17840dce064f33ca6077e3289f98c55cdce8` | Frozen |
| Required | Test execution log | `archive/TEST_EXECUTION_LOG.md` | Archive snapshot test execution | `24828cb7256e17194e1d61ce191fa31e88ab0c20af5b9b3a080d5f628a18cc8b` | Frozen |
| Required | Entry HTML | `archive/code-snapshot/index.html` | Released ZIP member | `7a4f512778013714c6f158bde57b7a239dbbeb638f18d533495b21b203bbc37e` | Frozen |
| Required | Local launcher | `archive/code-snapshot/start-dnd-terminal.command` | Released ZIP member | `ca34657892c9cd52447a12833a0442e21b217667e976dc997f80a2e2792a016f` | Frozen |
| Required | App source | `archive/code-snapshot/src/app.js` | Released ZIP member | `6ad5fe691b12ed9f82ecae1cfc342509d34b82c260b3957be670d60773f052f2` | Frozen |
| Required | Import source | `archive/code-snapshot/src/character-import.js` | Released ZIP member | `1d0a41d576e8f8bd47f75f87dcf9ee21e860ae2223c01de668871cecdabedebb` | Frozen |
| Required | Character source | `archive/code-snapshot/src/characters.js` | Released ZIP member | `93b25ab450e3870a49ee1346f7245b27aa7c0a7f0e48806d144a7e6d1edbb3a6` | Frozen |
| Required | Encounter source | `archive/code-snapshot/src/encounter.js` | Released ZIP member | `1edb8eec900e543a18188ccbe751e97230b319cdfbdcd3141fae2a8e50317023` | Frozen |
| Required | Geometry source | `archive/code-snapshot/src/geometry.js` | Released ZIP member | `a9f55df766a7951ef21970f44ad999370261bf4f2b97edb0b8e234c06206dbfe` | Frozen |
| Required | PC lifecycle source | `archive/code-snapshot/src/life-cycle-v040.js` | Released ZIP member | `0650a97308b8e15e9ad33b32f5008b3f214362227af16bc58891b4eeaf0608ab` | Frozen |
| Required | Persistence source | `archive/code-snapshot/src/session-persistence.js` | Released ZIP member | `8219798b0a322e13b6feeffefe7355557fc5aa756dcbc49689863d64624668ac` | Frozen |
| Required | Stylesheet | `archive/code-snapshot/src/styles.css` | Released ZIP member | `1bc9496555f6c407a674ecf59826c9bb0b1e115f16d979a54ef0274eb1beb377` | Frozen |
| Required | Import test | `archive/code-snapshot/tests/character-import-m1-s3.test.mjs` | Released ZIP member | `9891c571ca803b68c7efa47587487cac3f76c31b54ce8c862ffc375536edff4a` | Frozen |
| Required | Character lifecycle test | `archive/code-snapshot/tests/character-lifecycle-m1-s5.test.mjs` | Released ZIP member | `314cf113cabfc4bd2615ece3392e8a0f192588ae29fb9bb21699a0601b4cd2bf` | Frozen |
| Required | Character UI test | `archive/code-snapshot/tests/character-ui-m1-s3.test.mjs` | Released ZIP member | `336997882b98b0073302e028bcd1826ee34af6b66a41482f42073a96cf9613dd` | Frozen |
| Required | Character M1-S1 test | `archive/code-snapshot/tests/characters-m1-s1.test.mjs` | Released ZIP member | `50d5be8ee1dff1329856c41c27af1d7d5608601c185f96d3c2a5196fd6b81a9e` | Frozen |
| Required | Character M1-S2 test | `archive/code-snapshot/tests/characters-m1-s2.test.mjs` | Released ZIP member | `50f771a6b9d191b2b5ead5761a686251469d0ed3b17dd6fd564e39e3c7896829` | Frozen |
| Required | Encounter test | `archive/code-snapshot/tests/encounter-v020.test.mjs` | Released ZIP member | `d0a588b4b70da227ec1240e0b048e3ecb7b49ac8b779a4dc07e1b6f69807b57e` | Frozen |
| Required | Geometry test | `archive/code-snapshot/tests/geometry.test.mjs` | Released ZIP member | `2d5199f24e557c3f44e20b96f1d640b3c7b26a684166edbc01dd94d821cc3b2a` | Frozen |
| Required | v0.4 lifecycle test | `archive/code-snapshot/tests/life-cycle-v040.test.mjs` | Released ZIP member | `a11da4b4687ebd39f032081d41811131602612fbbdd9d2a90228236a88690788` | Frozen |
| Required | M1-S5 contract test | `archive/code-snapshot/tests/m1-s5-contract.test.mjs` | Released ZIP member | `cd4fff15fcd2de7cdc0bcf5789616f5977ef074bf6fe8eb0c0e0f8c18596898e` | Frozen |
| Required | Stabilization UI test | `archive/code-snapshot/tests/m1-s5-stabilization-ui.test.mjs` | Released ZIP member | `01c596a7a39a044591a4ef252e0e6e76ee1696cc6af2cd0f320e67a4f0f036ef` | Frozen |
| Required | Persistence test | `archive/code-snapshot/tests/persistence-m1-s5.test.mjs` | Released ZIP member | `03f27eeb2566b4943cb0d540d7fa4e5099d55a612be1f3b20dcce3e1ababdc91` | Frozen |
| Required | Spellcasting test | `archive/code-snapshot/tests/spellcasting-m1-s4.test.mjs` | Released ZIP member | `28e8b111582a79ad62cb4121d097b744276c10f6bf1b0963cb46064499ebc641` | Frozen |
| Required | Spellcasting UI test | `archive/code-snapshot/tests/spellcasting-ui-m1-s4.test.mjs` | Released ZIP member | `ffa3c94c4cf861fc65cee5509fc36312c5b12b5398a7d00b6a5d3f7fa8700350` | Frozen |
| Required | v0.4 UI contract test | `archive/code-snapshot/tests/v040-ui-contract.test.mjs` | Released ZIP member | `70e9bac2f05de598a321c7311bce7741ab2009cea9a5dc7e71f92e4b0eff6078` | Frozen |
| Required | v0.3.1 compatibility test | `archive/code-snapshot/tests/version-compatibility-v031.test.mjs` | Released ZIP member | `312ae6a247e5515145f617d81df617fb7739dde109db4f412b12ebbe48ac9703` | Frozen |
| Required | Future Schema rejection fixture | `archive/code-snapshot/tests/fixtures/future-schema-browser-rejection.json` | Released ZIP member; synthetic | `4a91d6103691f48914bca931483165fe232c46105bc3b3dbfadfefd0b99c95f3` | Frozen |
| Required | v0.2 compatibility fixture | `archive/code-snapshot/tests/fixtures/v020-browser-compat.json` | Released ZIP member; synthetic | `1430f2576ab024f0992f13244015dd74dff0cd8272e5134473016562510ac72e` | Frozen |
| Required | v0.3.1 compatibility fixture | `archive/code-snapshot/tests/fixtures/v031-browser-compat.json` | Released ZIP member; synthetic | `35a9ed91fc08641ef5f326ce54c0d96e4e2e1b8aeb11f6b4dbb02800b81a7f23` | Frozen |

`ARCHIVE_SUMMARY.md` 是最终冻结文件，按 Contract/Profile 不记录自身 SHA-256。

# Known Limitations

- 产品仍不实现完整规则引擎、PC 死亡后的复活/转化、全量职业/法术/武器精通合法性、自动命中/伤害、多人协作、公开部署或公开发布。
- `lifeStatus` 仍仅作为旧会话/旧代码兼容镜像；PC 权威事实为 `lifePhase`，后续实现不得将镜像重新作为第二事实源。
- 规则资料仅作本地私有验证输入；翻译、出版身份、许可与再分发授权继续为 `unknown`。
- 本机静态服务随其本地进程停止而停止；非 macOS 与公开环境未验证。

# Historical Reconstruction

**Record Nature：Evidence Synthesis。** 本归档在 v0.4.0 Local Private Release 后创建，依据已冻结的 ABC、Profile Selection、Implementation、Testing、Review、Release Notes、发布 ZIP、内容清单、快照复测和 Archive Readiness Review 生成。新增 Test Execution Log 与 Archive Readiness Review 明确标记为归档期证据；它们不追溯改写原始实施、测试或人工验收时间线。未重新执行的浏览器、真实用户数据或长期会话步骤保持为既有边界。

# Exceptions / Waivers

无。没有对任何 Archive Gate、源身份、测试、秘密安全或生命周期条件作出豁免。

# Next Version Status

PC 死亡后的复活和转化已明确留待未来 `v0.4.1`，但尚未创建 ABC、Implementation、Review、Release、Archive、部署或公开发布授权。任何后续变更必须使用新的交付身份与新的 ABC/门禁；本 v0.4.0 快照、发布包和归档记录不得修改。

# Archive Gate Results

| Gate | Result | Evidence |
|---|---|---|
| 1 — Required Artifacts | Pass | Summary、完整非 Git 代码快照、测试执行日志、Review 与所有生命周期证据均存在；配置按具体静态零配置事实记录 Not Applicable。 |
| 2 — Paths, Naming, and Profile Selection | Pass | User 在 `ARCHIVE_PROFILE_SELECTION.md` 于归档实施前选择 Lightweight；归档根为 `version-work/v0.4.0/archive/`，命名符合 Profile。 |
| 3 — Integrity and Hashes | Pass | 28 个快照文件逐项匹配发布清单；全部归档基础文件和 Readiness Review 均有 SHA-256；发布 ZIP / 清单 / 快照 / 测试形成单向身份链。 |
| 4 — Review Approval | Pass | Independent Review 已获 User 批准；Archive Readiness Review 在 Summary 前完成并批准归档最终化。 |
| 5 — Testing Finalization | Pass | Testing 与执行日志均为 Final；快照内清单 28 / 28、语法 7 / 7、测试 15 / 15 通过；未执行项明确保留。 |
| 6 — Secret Safety | Pass | 无运行时配置或凭据；冻结 archive 文件的凭据模式扫描未发现可用秘密或用户会话数据。 |
| 7 — Summary Completeness | Pass | 22 个必需标题、所有实际归档文件、可验证路径/哈希、八项 Gate 与最终结论均在 Summary 冻结前写入；未记录自身哈希。 |
| 8 — Lifecycle Consistency | Pass | ABC → Implementation → Testing → Human Acceptance → Review → Release → Profile selection → frozen base evidence → Archive Readiness Review → Summary 的顺序与状态一致；v0.4.1 未获授权。 |

# Final Verdict

Pass。八项 Archive Gate 均为 Pass。

# Final Archive Status

Archived — Local Private
