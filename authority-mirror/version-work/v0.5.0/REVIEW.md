# Independent Review：DND Terminal v0.5.0

- **状态：** `Review Approved — User`
- **启动授权：** User / `2026-08-28` / “进入review”。
- **评审批准与发布授权：** User / `2026-08-28` / “进入release”。
- **评审范围：** 已冻结的 [ABC](ABC.md)、Amendment 01–04、当前产品候选代码、自动测试与 v0.5.0 Authority 记录。
- **独立性说明：** 本记录复核实施证据，不修改 Rules Baseline、用户数据、`authority-mirror/`、v0.4.0 冻结材料、发布包或 Git 历史；不声称存在外部第三方评审者。

## 1. 证据分级

| 证据 | 复核结果 |
|---|---|
| 自动化 | `node --check src/app.js`、`src/characters.js`、`src/life-cycle-v050.js` 通过；20/20 `tests/*.test.mjs` 通过；`git diff --check` 通过。 |
| 浏览器 / 人工验收 | `TESTING.md` 明确记录未使用真实 Chrome localStorage 做夹具。User 本轮授权开始 Review，但没有显式作出“v0.5.0 Human Acceptance Passed”结论；本评审不把“暂无更多意见”改写为该结论。 |
| 规则 | 只复核已冻结 ABC 的本地 Rules Baseline 证据；`Lore_01_核心玩家规则.md` 的 SHA-256 实测为 `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8`，与 ABC 一致。 |
| 静态安全 | 对 `index.html`、`src/` 与 `tests/` 的 API key、secret、password、Bearer、private key 模式扫描无命中。 |

## 2. 候选身份与冻结边界

- **技术基线：** `main@431db95894a0aa99a4e85cb464f56e584ad2a8d6`；本交付仍为未提交的工作树候选。
- **候选变更：** `index.html`、`src/app.js`、`src/characters.js`、`src/styles.css`、新增 `src/life-cycle-v050.js`，以及相关回归测试。没有 Release、Archive、用户数据、Rules Baseline 或 `authority-mirror/` 写入。
- **v0.4.0 保护：** 本评审仅列举并定位了 v0.4.0 冻结 Authority 工件；未修改其 ABC、Amendment、Implementation、Testing、Review、Release、Archive Summary 或归档材料。
- **不授予：** 本评审完成不授予 Release、Archive、Branch、Commit、Push、Deployment 或 Public Release。

| 受本交付影响的关键文件 | SHA-256 |
|---|---|
| `index.html` | `38d23400de0e9acb3bc920a7312d6cefaff5ae009bd887da8826eda94c69e267` |
| `src/app.js` | `c650d819277d515d336baa0c73ceb31f204307e323c538d1497ec17ffcb13e70` |
| `src/characters.js` | `da00a614468dfeb40cfde7cf69e3d9b0ed104254afc7a85dccceaa6b3d033e4a` |
| `src/life-cycle-v050.js` | `80e11f5891c37fd3e6295f51c67a8ea9f67f4cb953d779cf9cefae6a303f2d5b` |
| `src/styles.css` | `01d24901899698719c87464934c76b4fad58b217ea89c64b2541bfed1dbf3081` |
| `tests/v050-s2.test.mjs` | `0e940ce017b6784de6b335a44d5d83b0e45dd4866c7e24efbfda309838b9c1df` |
| `tests/v050-amendment03.test.mjs` | `858801e6a4aa9c3699dd2aec6e1e0a0a14d474a7a0cf60668d391b004f178774` |

## 3. 合同与边界复核

| 合同 | 复核结论 |
|---|---|
| PC 与怪物/NPC 隔离 | 通过。PC 复活使用原实例或独立新 PC 卡；S2B 建立 monster/NPC 实例与 `controllerLink`，不恢复原 PC，也不写回其 CharacterSheet。 |
| 独立角色卡 | 通过。S2A/S2C 在创建时复制已勾选字段；旧卡和新卡以普通 `note` 追溯，之后可独立并存，没有 schema 强耦合或自动归档。 |
| 地图、先攻、撤销 | 通过。新实例路径有临时预览、完整 footprint/尸体占格 guard、确认后原子提交；取消不写入。创建事件仍受既有补偿撤销及后续依赖 guard 约束。 |
| 控制关系与期限 | 通过。`controlledEntities` 与普通关联单位分离；有效控制可在新遭遇生成新的独立实例；失控关系不提供再投入入口。长休续控只记录 DM 确认并刷新计数，不校验或执行法术。 |
| 可读性 | 通过。四种死亡结果无内部 Slice 代号；S2 预览可调整后确认；有效受控关联生物采用淡紫色 `#C69BF7`，不误用亡灵模板的敌对红色。 |
| 规则准入 | 通过。没有自动裁定复活、材料、灵魂、资格、精确战役时间或具体法术行动时序；这些能力仍为后续逐法术准入项。 |
| 兼容与回退 | 通过。v0.5.0 使用后继 Session key 与 copy-on-write 迁移；旧 key 不就地改写，回退不降级写回。CharacterSheet 缺失 `controlledEntities` 按空集合兼容。 |

## 4. 发现与保留风险

- **R50-001 非阻塞：** 尚无隔离 Chrome origin 的端到端人工验收，尤其应确认死亡后四选一、S2 预览的多次拖动/取消、受控生物再投入、混合长休续控和刷新恢复体验。
- **R50-002 非阻塞：** `one-long-rest` 续控是 DM 审计记录，不是法术引擎；仍不验证 Animate Dead、Create Undead 或其他法术的资格、材料、目标数、时机和精确计时。
- **R50-003 非阻塞：** 长期关系在战斗中继续通过现有战后审核边界写入；不建立跨战斗自动敌对、自动消失或自动行动 AI。
- **无阻塞发现。**

## 5. 评审结论与停止点

评审已完成，未发现范围冻结、实例/角色卡隔离、规则准入、兼容/回退、自动测试或敏感信息方面的阻塞性不一致。

User 已批准本评审结论并授权进入 Local Private Release。Archive、Branch、Commit、Push、Deployment 与 Public Release 继续未获授权。
