# Independent Review：v0.3.0 / M1

- **状态：** `Review Approved — User`
- **评审启动授权：** User / `2026-08-24`
- **评审范围：** 已冻结的 `v0.3.0 / M1`、`M1-S1` 至 `M1-S5`，以及 Amendment 1、Amendment 2 与 2026-08-24 武器精通追补；不含明确延期项。
- **评审结论权限：** 本记录整理独立复核结果并提出建议；User 已于 `2026-08-24` 采纳建议并批准本评审。
- **发布 / 归档授权：** User 同日授权 Local Private Release；Archive 仍未授予。

## 1. 评审独立性与证据边界

本记录在产品 Implementation 已结束、User Human Acceptance 已通过后创建。评审只复核当前 Workspace、已冻结 ABC、Rules Baseline、Implementation/Testing 记录和实际命令输出；不修改产品代码、规则来源、原始 Excel、部署或发布身份。

证据分级：

- **自动化：** 本轮实际执行 Node 语法检查和 12 个 `tests/*.test.mjs`，全部通过。
- **人工验收：** User 于 `2026-08-24` 明确确认 Amendment 2 与武器精通追补的人工检查通过；此前 `M1-S1` 至 `M1-S5` 已各自记录通过。
- **浏览器：** 采用 `TESTING.md` 已记录的实际浏览器证据及 User 人工验收；本次独立复核未把静态检查或源码阅读冒充为新的浏览器运行。
- **规则：** 仅核对 Rules Baseline 锚点及对应本地 Markdown SHA-256；翻译、出版身份、许可与再分发权继续为 `unknown`。

## 2. Workspace 身份与可复现检查

- **Workspace：** `/Users/chenzehao/Projects/DND Terminal`
- **Git identity：** 不适用；Workspace 未初始化 Git。
- **身份方式：** `2026-08-24` 重新计算 SHA-256；与 Amendment 2 Artifact Identity 一致。

| 文件 | SHA-256 |
|---|---|
| `index.html` | `5211ae6c6074625a75343785679f173e8940d704d85d9db01477ed8b07dfb072` |
| `src/app.js` | `578975da6374a9774152a5d0f72846409a632cc4607a47eb9d90c3f2cb5df7cf` |
| `src/styles.css` | `1bc9496555f6c407a674ecf59826c9bb0b1e115f16d979a54ef0274eb1beb377` |
| `src/characters.js` | `93b25ab450e3870a49ee1346f7245b27aa7c0a7f0e48806d144a7e6d1edbb3a6` |
| `src/character-import.js` | `1d0a41d576e8fbd47f75f87dcf9ee21e860ae2223c01de668871cecdabedebb` |
| `src/session-persistence.js` | `8219798b0a322e13b6feeffefe7355557fc5aa756dcbc49689863d64624668ac` |
| `tests/m1-s5-contract.test.mjs` | `cd4fff15fcd2de7cdc0bcf5789616f5977ef074bf6fe8eb0c0e0f8c18596898e` |
| `tests/m1-s5-stabilization-ui.test.mjs` | `01c596a7a39a044591a4ef252e0e6e76ee1696cc6af2cd0f320e67a4f0f036ef` |
| `tests/character-lifecycle-m1-s5.test.mjs` | `314cf113cabfc4bd2615ece3392e8a0f192588ae29fb9bb21699a0601b4cd2bf` |
| `tests/persistence-m1-s5.test.mjs` | `03f27eeb2566b4943cb0d540d7fa4e5099d55a612be1f3b20dcce3e1ababdc91` |
| `tests/character-ui-m1-s3.test.mjs` | `336997882b98b0073302e028bcd1826ee34af6b66a41482f42073a96cf9613dd` |

实际执行：

```text
node --check src/app.js        → pass
node --check src/characters.js → pass
for f in tests/*.test.mjs; do node "$f"; done → 12 / 12 pass
```

## 3. 范围与关键不变量复核

| 能力域 | 独立复核结果 |
|---|---|
| 长期卡、修订与投影隔离 | 通过。`CharacterSheet → CombatProjection → CombatantInstance` 采用复制边界；角色修订、资源/库存差异、战后审核和 `revision N+1` 均有领域测试。 |
| 受控 Excel 导入 | 通过既有 Profile、拒绝路径和导入测试证据复核。导入仍限定 `beiling-dnd55e-character-sheet@1.0.15`，不执行公式、宏、外链或内置规则数据库。 |
| 多施法来源 | 通过。Profile、资源池、法术状态与 `CastingOption` 维持分离；测试覆盖多来源消费与候选回写，未知规则保持 `unknown / needs-review`。 |
| 武器精通 | 通过已准入边界复核。仅短弓 `Vex` 在 DM 确认后生成候选；`Nick` 和其余词条不自动执行。当前长休配置、效果说明、来源/目标/到期和长休 revision N+1 受合同测试覆盖。 |
| 关联单位与生命周期 | 通过。关联单位经 `LinkedEntityProjection → EncounterMember → CombatantInstance` 独立物化；归档、恢复、删除和投影/候选引用阻断均有测试。 |
| 战后差异与重复投影 | 通过。逐项 `accept / reject / correct`、字段级错误、过期阻断和 `abandoned` 终态不改写其他候选或长期卡。 |
| 兼容与持久化 | 通过。旧会话/角色兼容、会话压缩/保存失败保护及既有几何、遭遇测试均纳入全量回归。 |

## 4. 规则、数据与发布边界复核

- M1-S5 只消费三项已记录锚点：游荡者武器精通资格/更换时点、匕首/短弓映射、Nick/Vex 词条。
- 对应本地规则源 `Lore_01_核心玩家规则.md` 的 SHA-256 为 `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8`，与 Rules Baseline 一致。
- 未发现产品代码、测试或文档把规则资料全文、原始 Excel、LoreBuddy 运行状态或未筛选数据集纳入交付。
- 未发现 Git 初始化、部署、公开发布、Release Notes 或 Archive Summary；本评审也不授予这些动作。

## 5. 评审发现与保留风险

### R-001 非阻塞：武器精通覆盖是刻意受限的

当前稳定目录只允许已准入的匕首/Nick 和短弓/Vex 进入图形化长休选择；这符合 Amendment 1/2 的窄范围，并非宣称游荡者的所有熟练武器都已获得自动化支持。未来扩大映射或自动化前，仍需 Rules Baseline 与 ABC 新授权。

### R-002 非阻塞：浏览器事实按已记录证据分级

本次没有重新运行用户 Chrome 的完整四角色流程，也没有把 2026-08-24 的用户人工确认改写成自动化证据。`TESTING.md` 已保留先前浏览器观察、未覆盖项与当前 User Human Acceptance；若未来需要发布级验收，可另建可重复的浏览器自动化门禁。

### R-003 非阻塞：以 SHA-256 而非 Git 提交标识 Workspace

Workspace 仍未初始化 Git；本次评审采用实际 SHA-256 和全量测试输出作为可复核身份。该方式适合当前本地私有门禁，但不替代未来发布流程所需的发布身份决定。

## 6. 评审建议与用户决策项

**建议：Approve M1 Independent Review。** 当前范围、自动测试、Artifact Identity、规则/数据边界和已记录的 User Human Acceptance 没有发现阻塞性不一致。

User 已于 `2026-08-24` 批准本评审，并明确授权 v0.3.0 Local Private Release；该发布身份与包校验值见 `RELEASE_NOTES.md`。Archive、部署和公开发布均不由本结论或 Release 自动获得授权。
