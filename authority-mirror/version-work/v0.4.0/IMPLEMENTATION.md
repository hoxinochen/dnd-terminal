# v0.4.0 Implementation

- **交付：** `v0.4.0 — PC 0 HP、死亡豁免与稳定状态`
- **Slice：** `v0.4.0-S1`（唯一 Slice）
- **状态：** `Original S1 Complete and Accepted / Amendment 01 Implementation Complete and Accepted / Review Completed — Awaiting User Approval`
- **授权：** User / `2026-08-25` / “同意版本实施”
- **技术起点：** `main@444cdce1248ab4173bbfd904b91a0cebb0000d38`
- **合同：** `version-work/v0.4.0/ABC.md`（Approved / Frozen）

## 实施边界

本次一次性实现冻结 ABC 内的 PC `0 HP` 生命周期、Session Envelope Schema `0.3.0` copy-on-write 迁移、回合与行动约束、顺序事件和当前页面内补偿撤销、刷新恢复、战后长期卡隔离、针对性测试，以及不阻塞的施法属性中文显示/footer 身份修复。

不创建分支，不 Commit，不 Push，不进入 Independent Review、Release、Archive、部署或公开发布；不修改规则来源、用户数据、v0.3.1 冻结归档或发布包。

## 启动证据

- Rules Baseline 文件 `Lore_01_核心玩家规则.md` 在 Implementation 开始时重新计算 SHA-256：`b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8`，与 Approved ABC 一致。
- 产品工作树在实施开始时为 `main...origin/main`，无未提交产品变更。
- v0.3.1 技术起点与冻结代码快照保持独立；本次只在当前工作树新增未提交 v0.4.0 变更。

## 实施记录

### 1. 产品文件

| 文件 | 实际变更 | SHA-256 |
|---|---|---|
| `index.html` | 候选版本标题与 app cache revision | `ef7f067552646ed1446a213e8248eb0d6532be3d01555e37c6f86bac4eb874f9` |
| `src/life-cycle-v040.js` | 新增 PC 生命状态纯领域模块、Schema `0.3.0`、copy-on-write 启动选择与迁移校验 | `26807754a68b8b3cbb1ef315a53bd23a8c7c9eec2109d69df4a6564aa1752b9c` |
| `src/app.js` | 接入 0 HP/死亡豁免/稳定 UI、命令事件、行动约束、迁移保护、导入导出和展示修复 | `7a96fe51a24382d99fe901125782a76d5df84237a73d80eb268f212746cfddd0` |
| `src/encounter.js` | 让昏迷 PC 保留先攻处理位置，同时继续跳过 stable/dead/transformed/needs-review | `7eafd12bb2e4ee12566b96348b70ab1c18f4b5065aa8309b82ad49fb07b46409` |

测试新增 `tests/life-cycle-v040.test.mjs` 与 `tests/v040-ui-contract.test.mjs`；既有 `tests/version-compatibility-v031.test.mjs` 和 `tests/spellcasting-ui-m1-s4.test.mjs` 更新为 v0.4.0 候选身份与向后兼容断言。其余既有测试未修改。

### 2. 生命状态与事件

- PC 单场权威状态为 `alive | unconscious | stable | dead | needs-review`；怪物/NPC 原有 `dead | transformed` 路径保持。
- 正 HP 伤害、临时 HP 吸收、即时死亡、0 HP 受伤、重击失败数、死亡豁免自然 1/20、三次成功/失败、医疗稳定、正 HP 治疗与 DM 修正均由一个领域模块处理。
- 死亡豁免轨迹保存当前计数、每次最终骰值或伤害/稳定输入、结果、轮次与来源；计数归零不删除轨迹或顺序事件。
- 新增 `pc.damage.resolved`、`pc.healing.resolved`、`pc.death-save.resolved`、`pc.medical-stabilization.resolved`、`pc.life-state.corrected`；均接入当前页面内补偿撤销。
- `unconscious` 保留先攻位置；其回合强制先处理死亡豁免。普通行动、附赠动作、反应、移动、攻击、法术、资源、库存与手工效果由 UI 与命令层共同阻断。`stable/dead/needs-review` 不取得普通回合。
- PC 死亡不显示怪物/NPC 的特许复起或特殊转化入口。DM 修正明确只修正记录，不自动证明复活合法性。

### 3. 会话与兼容

- Session Envelope Schema 提升为 `0.3.0`，导出同时携带 `deliveryVersion: "0.4.0"`；CharacterSheet Schema 保持 `0.3.0-m1-s5`。
- 浏览器会话只写 `dnd-terminal.v0.4.0.session.current`；`dnd-terminal.v0.3.0-m1-s5.session.current` 与 `dnd-terminal.v0.2.0.session.current` 只读。
- 缺少新 key 时，按顺序读取旧 key 副本；只有解析、版本迁移、规范化和校验全部成功才写新 key。旧 `HP = 0` 且无证明的 PC 进入 `needs-review`，不补造历史。
- 新 key 损坏时保留原始值、阻断自动保存且不静默回退旧 key；用户只能明确导入有效 JSON 或新建空会话后解除阻断。
- 导入接受 v0.1/v0.2/v0.3 Session Schema，未来版本安全拒绝且不替换当前会话。模板与 CharacterSheet 存储键未改变。
- 持久化保留生命状态、轨迹和可读事件，但继续移除完整事件 `before` 检查点；刷新后旧事件明确不可撤销。

### 4. 战后与展示

- 既有 PostCombatDiff 仍只处理批准的 HP/资源/法术资源/库存余额等候选；PC 单场生命状态、死亡豁免与轨迹不写入 CharacterSheet。
- 施法属性稳定内部 ID 仍保存英文枚举，展示层映射为力量/敏捷/体质/智力/感知/魅力/待确认。
- footer 改为 v0.4.0 的 CharacterSheet → CombatProjection → CombatantInstance → CombatEvent → PostCombatDiff 边界，不再把冻结 M1-S5 写成当前候选。

### 5. 回退

产品回退目标仍为 `main@444cdce1248ab4173bbfd904b91a0cebb0000d38`。因为旧 key 未修改，v0.3.1 回退后读取实施前旧会话视图；v0.4.0 新 key 保留且不由旧代码读取。回退不需要、也不得修改 v0.3.1 Archive、发布包或 Authority 冻结历史。

### 6. 当前工作树身份

当前仍在 `main...origin/main`，存在上述未提交的产品与测试变更；未创建分支、Commit 或 Push。Local Private Release 的版本身份将以独立发布 ZIP、内容清单与校验和建立，不以该工作树或 Git 提交冒充发布身份。

## 当前停止点

原 S1 已获 User Human Acceptance。User 于 `2026-08-25` 批准 `AMENDMENT_01.md` 并授权其实施；已完成 d20 投骰、PC 生命阶段与昏迷/倒地分离、自然 20/治疗后保留倒地、以及消耗速度一半起立。User 随后确认 Amendment 01 测试通过、批准 Review，且 Local Private Release 已按授权完成。PC 死亡后的复活与转化明确留给未来 `v0.4.1`。Archive、分支、Commit、Push 与部署仍未授权。
