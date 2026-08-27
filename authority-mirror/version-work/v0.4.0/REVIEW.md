# Independent Review：DND Terminal v0.4.0

- **状态：** `Review Approved — User`
- **启动授权：** User / `2026-08-25` / “测试通过，可以标注implementation完成，并开始review”
- **评审批准与发布授权：** User / `2026-08-25` / “批准实施review、release，两个都批准，可以按顺序执行”
- **评审范围：** 已冻结的 v0.4.0-S1、`AMENDMENT_01.md`、相应产品代码、测试与 Authority 记录。
- **独立性说明：** 本记录进行与实施分离的证据复核；不修改规则来源、用户数据、v0.3.1 冻结材料、发布包或归档；不声称存在外部第三方评审者。

## 1. 证据分级

| 证据 | 复核结果 |
|---|---|
| 自动化 | `node --check src/app.js`、`src/encounter.js`、`src/life-cycle-v040.js` 通过；`node --test` 为 `15 passed / 0 failed / 0 skipped`。 |
| 人工验收 | 原 S1 的旧数据可用性验收与 Amendment 01 的“测试通过”均由 User 明确确认。 |
| 浏览器 | `TESTING.md` 记录隔离合成会话内的 0 HP、d20、自然 20、倒地保留与起立流程；本评审不把静态阅读冒充为新的用户浏览器验收。 |
| 规则 | `Lore_01_核心玩家规则.md` SHA-256 实测为 `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8`，与 ABC/Amendment 一致。 |

## 2. 冻结边界与工作区身份

- **技术基线：** `main@444cdce1248ab4173bbfd904b91a0cebb0000d38`；仅是 v0.4.0 技术起点，不改变 v0.3.1 的 Release/Archive 身份。
- **当前候选差异：** `index.html`、`src/app.js`、`src/encounter.js`、新增 `src/life-cycle-v040.js`，以及 4 个相关测试文件；无 Release、Archive、用户数据或 Rules Baseline 写入。
- **格式检查：** `git diff --check` 通过。
- **v0.3.1 保护复核：** 发布 ZIP SHA-256 为 `633a429c2dcd43754f5bf0aeac58c4b320e72cad4f86687d773e553be73f70f1`；内容清单 SHA-256 为 `a0c227e7978a8b1b6e4e010bdbaeb353296f118baaf630c65cd86abdd06e62c0`；`unzip -t` 通过，冻结快照对清单为 `25 / 25` 通过。
- **敏感信息：** 对 `index.html`、`src/` 与 `tests/` 的 API key、secret、password、Bearer、private key 模式扫描无命中。

| 受本交付影响的文件 | SHA-256 |
|---|---|
| `index.html` | `7a4f512778013714c6f158bde57b7a239dbbeb638f18d533495b21b203bbc37e` |
| `src/app.js` | `6ad5fe691b12ed9f82ecae1cfc342509d34b82c260b3957be670d60773f052f2` |
| `src/encounter.js` | `1edb8eec900e543a18188ccbe751e97230b319cdfbdcd3141fae2a8e50317023` |
| `src/life-cycle-v040.js` | `0650a97308b8e15e9ad33b32f5008b3f214362227af16bc58891b4eeaf0608ab` |
| `tests/life-cycle-v040.test.mjs` | `a11da4b4687ebd39f032081d41811131602612fbbdd9d2a90228236a88690788` |
| `tests/v040-ui-contract.test.mjs` | `70e9bac2f05de598a321c7311bce7741ab2009cea9a5dc7e71f92e4b0eff6078` |
| `tests/version-compatibility-v031.test.mjs` | `312ae6a247e5515145f617d81df617fb7739dde109db4f412b12ebbe48ac9703` |
| `tests/spellcasting-ui-m1-s4.test.mjs` | `ffa3c94c4cf861fc65cee5509fc36312c5b12b5398a7d00b6a5d3f7fa8700350` |

## 3. 合同与范围复核

| 合同 | 复核结果 |
|---|---|
| 规则边界 | 通过。只使用已定位的 0 HP、死亡豁免、稳定、昏迷与倒地规则；未自动处理完整昏迷效果、战役时间、复活或转化。 |
| 生命周期与条件分离 | 通过。PC 以 `lifePhase` 为权威；`lifeStatus` 仅为旧代码/旧会话兼容镜像。`unconscious` 与 `prone` 为独立条件；自然 20 与有效治疗只移除昏迷。 |
| 回合与事件 | 通过。`dying` PC 保留死亡豁免回合；d20 来源、起立和所有生命变化均进入顺序事件；撤销仍为补偿事件。 |
| 存储与回退 | 通过。Schema 仍为 `0.3.0`，新 key copy-on-write；旧 key 不改写。回退继续指向 v0.3.1 的未修改旧 key。 |
| 长期角色隔离 | 通过。生命阶段、死亡豁免和条件仅属于 `CombatantInstance`，未写入 CharacterSheet。 |
| 延期范围 | 通过。PC 死亡复活/转化、真实 DM 长时会话、跨对话持续性与压力测试均未被误写为已实现或已验证。 |

## 4. 评审发现与保留风险

- **R40-001 非阻塞：** `lifeStatus` 继续作为兼容镜像存在；后续代码必须以 `lifePhase` 为 PC 权威，不能将该镜像重新当作第二事实源。
- **R40-002 非阻塞：** 真实 DM 长时会话、跨多次对话和压力测试仍未执行，按 User 已决定的后续时点处理。
- **无阻塞发现。**

## 5. 评审结论

评审检查完成，未发现冻结边界、规则准入、状态机、兼容/回退、测试证据或敏感信息方面的阻塞性不一致。

User 已批准本评审结论，并单独授权按顺序执行 Local Private Release。本结论不授权 Archive、分支、Commit、Push、部署或公开发布；也不声称存在外部第三方评审者。
