# Testing：v0.1.0 基础战斗闭环验证

- **Status：** Framework Workflow Accepted by User — Remaining Scope Deferred
- **Delivery ID：** `v0.1.0`
- **Plan Date：** `2026-07-30`
- **Execution Authorization：** Requires Approved ABC and Implementation Candidate
- **Human Acceptance：** Required

除下方已明确列出的 Implementation Smoke Execution 外，所有计划用例当前仍为 `not-run`，不得把冒烟结果表述为完整通过。

## 2026-08-04 用户批准：v0.1.0 延期分类

用户已接受当前战斗辅助框架工作流，并批准将以下项目正式延期。此分类优先于本文较早的“Blocking”与 `not-run` 计划性标签：计划项不会因此变为 `pass`，但也不再阻止本次已接受框架范围的收口。

| Scope | Status | 已知事实与未来入口 |
|---|---|---|
| 规则数值、来源映射、逐字段核对 | `deferred` | 新 NotebookLM 资料未与历史 Entry 收据重新映射；规则数值正确性仍为 `unknown`，未来作为规则数据审计单独执行。 |
| 完整战斗结束差异回写 | `deferred` | 不以现有 UI 或计划用例推导完整回写已实现；未来需要逐角色、逐字段、DM 审核的测试。 |
| 受控召唤实例 | `deferred` | 不扩展完整召唤控制；现有 Effect 表达不等同于受控实体。 |
| 独立玩家端与 `dm-only` 隔离 | `deferred` | 当前仅有日志可见性标签，没有玩家端或权限边界。 |
| 未建立的自动回归项与未逐项执行的固定遭遇步骤 | `deferred` | 保留为后续回归清单；不得把本表解释为这些测试已经通过。 |

仍有效的本次接受证据包括：User 的真实触屏与 JSON 导入导出验收、行动轮/地图/效果/撤销/朝向与发射口工作流，以及 `AUTO-AOE-002` 的 50% 面积边界回归。Independent Review、Release 与 Archive 均未开始。

## 2026-07-30 Implementation Smoke Execution

- **Executor：** Implementation Agent
- **Product Workspace：** `/Users/chenzehao/Projects/DND Terminal`
- **Runtime：** 浏览器加载本地 `python3 -m http.server` 静态服务；当前环境未提供 Node.js。
- **Evidence scope：** 仅实现冒烟验证；不是完整固定遭遇、规则人工核对、触屏测试或真实 DM 验收。

| Check | Result | Actual evidence / limitation |
|---|---|---|
| `SMOKE-001` 本地页面加载 | pass | 浏览器显示七个标签和空白会话。 |
| `SMOKE-002` 固定验证数据 | pass | 点击“重置验证数据”后创建九个 Combatant Instance，含两个状态隔离的地精实例。 |
| `SMOKE-003` 固定先攻与回合推进 | pass | 产生先攻事件并由当前行动者推进到下一回合。 |
| `SMOKE-004` 范围预览 | pass | Circle 预览显示 49 格、候选 1 个；预览前事件数量未增加。 |
| `SMOKE-005` 范围确认 | pass | 输入 `-8` 后确认结算，事件从 3 增至 4，预览退出。 |
| `SMOKE-006` 刷新恢复 | pass | 刷新后仍显示固定遭遇和 4 个事件。 |
| `BUG-001` 递归事件快照超出 localStorage 配额 | fixed in implementation | 首轮测试复现；改为不嵌入旧 Event Log 的紧凑检查点后重新执行 `SMOKE-002` 至 `SMOKE-006`。 |
| `BUG-002` 手机局域网 HTTP 只显示深色背景 | fixed in implementation | 非安全上下文缺少 `crypto.randomUUID()`，导致首次渲染前脚本失败；加入 UUID 与深拷贝回退后，以 `http://192.168.130.152:4173` 复验显示七标签与可操作空会话。真实触屏操作仍为 `not-run`。 |
| `BROWSER-003` 棋子拖动 | pass (desktop smoke + User touch acceptance) | Pointer Events 下拖动棋子并松开后，事件数由 15 增至 16；拖动过程不写事件。User 已确认真实触屏复验通过。 |
| `BROWSER-004` 范围按下、拖动、松开预览 | pass (desktop smoke + User touch acceptance) | Circle 拖动后进入可编辑预览，显示覆盖格、候选列表、目标覆写与确认控件；拖动前后未新增事件。User 已确认真实触屏复验通过。 |
| `BROWSER-005` 批量 Buff / 状态跨标签 | pass (desktop smoke) | Circle 预览确认 `祝福` Buff 后，事件数由 16 增至 17；角色页显示武僧的 `祝福`，法师显示 1～8 环法术位。完整跨回合/触屏流程待 User。 |
| `R6` 体型→占位 | partial pass | User 已人工抽查：火巨人巨型→3×3、眼魔大型→2×2、地精武者小型→1×1。火巨人、眼魔纠正后的网页显示已由 User 复验通过；其他模板的 HP、速度、动作、次数资源和来源字段仍待逐项核对。 |
| `R7` 角色资源与法术位可核对性 | implemented / not-run | 角色页现显示武僧功力及法师 1～8 环法术位、来源 Entry ID；数值正确性仍需授权规则人工核对。 |
| `R8` 自动化边界提示 | pass (User) | 地图提示明确不判定墙体、视线、掩护或高度。 |
| `TOUCH-005` 目标覆写与确认 | pass (User) | User 完成移除自动候选、手动添加火巨人、`-8` 结算与 `range.applied` 目标数组核对。 |
| 自动测试、触屏、规则人工核对、完整固定遭遇、真实 DM 验收 | not-run | 仍为 Blocking；不得从本次冒烟结果推导通过。 |

## 2026-07-31 P2 Implementation Smoke Execution

- **Executor：** Implementation Agent
- **Scope：** 桌面浏览器与 390 × 844 视口模拟；不替代真实手机触控验收。

| Check | Result | Actual evidence / limitation |
|---|---|---|
| `P2-SMOKE-001` 页面加载 | pass | 修复短名称正则语法后，页面显示七标签、固定遭遇与角色页效果来源/结束轮。初次浏览器加载曾捕获语法错误，已修正并重载验证。 |
| `P2-SMOKE-002` 手动 Buff | pass (desktop smoke) | 当前行动者眼魔手动添加 `祝福` 后，事件数从 17 增至 18；战斗页显示“战斗手动 · 至第2轮”，并显示确认提示。 |
| `P2-SMOKE-003` 地图状态卡与同名并存 | pass (desktop smoke) | 地图棋子不显示效果覆盖；点选眼魔后状态卡显示手动 `祝福`。再以 Circle 对同一眼魔施加同名范围 `祝福`，事件增至 19，状态卡同时显示“战斗手动 · 至第2轮”与“地图范围 · 至第2轮”。不同持续轮次下的自然到期隔离待补充。 |
| `P2-SMOKE-004` 短名称 | pass (desktop smoke) | 固定遭遇地图显示 `地精 A`、`地精 B`，完整名称保留为 `地精武者 A/B`。普通地精与地精武者的冲突组合仍待用户在实际战斗创建后复验。 |
| `P2-SMOKE-005` 移动端适应屏幕 | pass (simulation + User acceptance) | `24×18` 适应屏幕地图：实际格宽 14.25px、网格宽 340px、视口 390px，页面无横向溢出；User 已确认真实手机浏览器验收通过。 |
| `P2-SMOKE-006` 战术操作模式 | pass (simulation + User acceptance) | 切换后视觉格为 27px，地图容器可横向平移；User 已确认真实触屏滚动与棋子拖动不冲突。 |
| `TOUCH-001`～`TOUCH-004` P2 重测 | pass (User) | User 确认真实设备上的落点、拖动、多格棋子选择与滚动手势全部验收完成。 |

## 2026-07-31 BUG-RULE-001 复核

| Check | Result | Actual evidence / limitation |
|---|---|---|
| `BUG-RULE-001-A` 火巨人模板 | pass (User browser acceptance) | 受限本地 Entry `urn:uuid:89061a89-389d-5eb3-ac14-e3c539feeba5` 明确为“火焰之剑、投掷炎锤”。移除错误的“岩块投掷 2”资源；HP 162、速度 30 与 3×3 保留；User 已复验网页显示。 |
| `BUG-RULE-001-B` 眼魔模板 | pass (User browser acceptance) | 受限本地 Entry `urn:uuid:5752e02e-5174-5805-bf1a-e96a3f8a6f23` 明确为 HP 190、速度 5 尺/飞行 40 尺（悬浮）、“眼波射线、反魔法锥域”。二维投影使用飞行 40；移除错误的“眼棱 3”资源；User 已复验网页显示。 |
| `BUG-RULE-001-C` 其余模板字段 | not-run | 不因本轮两项更正推导其余怪物、NPC 或角色字段正确；仍需逐 Entry 人工核对。 |
| `BROWSER-009` 本地参考动作详情卡 | partial pass (User interaction) | User 已确认火巨人、眼魔的桌面悬停、点击固定展开和真实触控点按展开均可用；“详情不出现在导出 JSON”仍需随完整导出/导入用例核对。 |
| `BUG-UI-003` 单位库显示 `[object Object]` | pass (User) | `referenceActions` 显式读取动作对象的 `name`；User 已确认单位库正常显示“眼波射线；反魔法锥域；切齿；怒视”。 |

## 2026-07-31 先攻与 HP Implementation Smoke Execution

| Check | Result | Actual evidence / limitation |
|---|---|---|
| `BROWSER-010` 固定先攻平局裁定 | pass (desktop smoke) | 重置固定遭遇后：两名 PC 均为 18；魔法师、地精 A、地精 B 均为 12。页面先显示两组带上移/下移的裁定控件，确认后事件数从 2 增至 3 并开始第 1 轮。真实 DM 的顺序裁定流程待 User。 |
| `BROWSER-011` 行动轮横条 | pass (desktop smoke) | 确认先攻后显示完整横条；推进一次后，第一个节点 class 为 `done`，第二个为 `current`，第三个为 `upcoming`。真实触控横向滚动待 User。 |
| `BROWSER-012` 自定义 HP 与临时 HP | pass (desktop smoke) | 武僧临时 HP 设为 8 后输入伤害 5：HP 保持 112/112，临时 HP 显示为 3；事件数从 3 增至 5。临时 HP 的规则来源、覆盖来源与真实 DM 验收待 User。 |
| `BUG-TURN-001` Fixture 先攻与平局裁定 | fixed in implementation | 旧 Fixture 未制造 PC 同值，且地精 A/B 只按名称排序。现改为确定性同值及显式排序确认。 |
| `BUG-HP-001` 临时 HP 缺少 UI 入口 | fixed in implementation | 新增临时 HP 指定值与补偿撤销支持；没有自动判断能力是否合法或临时 HP 来源覆盖关系。 |
| `BROWSER-013` 地图连续补偿撤销 | pass (User) | User 已确认地图页可连续执行补偿撤销，已补偿事件不会被再次选择。 |
| `BROWSER-014` 朝向与正面发射口 | pass (desktop smoke + User acceptance) | 2×2 眼魔与 3×3 火巨人的朝向、正面发射口选择、回合结束锁定及 DM 修正入口均由 User 验收通过。 |
| `BROWSER-015` 中文范围标签 | pass (desktop smoke) | 地图范围按钮显示“圆形、锥形、直线、方形”，且地图页存在“撤销上一步”入口。 |
| `USER-IO-001` 完整 JSON 导出与导入 | pass (User) | User 确认完整 JSON 导出、新建空状态后重新导入及会话恢复验收完成。该人工结论不替代尚未建立的 `AUTO-IO-001` 自动回归。 |
| `BUG-FACING-001` 发射口变更后范围 Origin 未同步 | pass (User) | User 已确认对 `originMode: caster-facing-port` 的已武装或预览范围，改朝向或发射口会立即更新 Origin，无须重选锥形或直线。 |
| `BUG-UI-004` 回合推进后参考动作滞后 | pass (desktop smoke) | 点选眼魔卡片后，推进回合至眼魔时选择焦点与参考动作均为眼魔；再推进至斥候时，焦点随当前行动者变为斥候，参考动作区显示“该单位尚无已核验的参考动作详情”。 |
| `UX-COMBAT-002` 单位列表卡片化 | pass (desktop smoke + User acceptance) | 无“选择”按钮；点击卡片可选择单位，其他卡片降灰，当前行动者保留高亮；User 已确认真实触控视觉与操作验收通过。 |

## 测试层级

## 2026-07-31 补充浏览器冒烟执行

- **Executor：** Implementation Agent
- **Scope：** 独立本地浏览器会话；不替代规则人工核对、真实触屏或最终 DM 验收。

| Check | Result | Actual evidence / limitation |
|---|---|---|
| `BROWSER-002-R1` 行动轮与地图高亮同步 | pass (desktop smoke) | 战斗页当前行动者为“15级散打武者”，切换地图后 `.token.active` 同为“15级散打武者”。 |
| `BROWSER-006-R1` 刷新恢复当前视图与行动者 | pass (desktop smoke) | 在地图页刷新后仍停留地图页，当前高亮仍为“15级散打武者”。 |
| `SMOKE-TURN-001` 行动经济整轮重置 | pass (desktop smoke) | 武僧动作、附赠动作、反应由“可用”变为“已用”；推进完整 9 个行动者回到武僧时三项均恢复“可用”。 |
| `SMOKE-RESOURCE-001` 功力独立消耗 | pass (desktop smoke) | 功力由 `15/15` 降至 `14/15`，经过完整一轮后仍为 `14/15`，未被回合重置。 |
| `SMOKE-EFFECT-001` 持续时间与专注显示 | pass (desktop smoke) | 添加持续 1 轮的“烟测专注”后显示“战斗手动 · 至第3轮 · 专注”；推进至到期轮后效果卡消失。不同来源同名效果的独立自然到期仍需单独回归。 |

以下计划项不能由上述冒烟推导通过：完整字段回写、召唤受控实例、规则数值正确性、真实触屏和最终真实 DM 验收。

| Layer | Executor | Evidence | Gate |
|---|---|---|---|
| 自动测试 | Implementation Agent / test runner | 机器输出、版本、退出码 | Blocking |
| 浏览器交互 | Implementation Agent | 浏览器、视口、步骤、截图/日志 | Blocking |
| 触屏测试 | Human or real touch environment | 设备/模拟限制、实际操作结果 | Blocking |
| 规则人工核对 | Human reviewer | Entry ID、字段对照、差异 | Blocking |
| 真实 DM 验收 | User-designated DM | 完整固定遭遇记录与结论 | Blocking |

## 自动测试骨架

### 数据与事件

- `AUTO-DATA-001`：同模板创建两个实例，ID、HP、资源、坐标、状态隔离。
- `AUTO-DATA-002`：模板修改不改变已创建实例的 `templateSnapshot`。
- `AUTO-EVENT-001`：相同初始状态与事件序列产生字节稳定的规范 Snapshot。
- `AUTO-EVENT-002`：撤销追加补偿事件，旧事件保持不变。
- `AUTO-EVENT-003`：人工修正保留 before/after、原因、轮次和行动者。
- `AUTO-IO-001`：导出→导入保持 Domain State、事件顺序与骰子结果。
- `AUTO-IO-002`：损坏、不支持版本和不完整 JSON 安全拒绝且不覆盖现状。

### 战斗

- `AUTO-TURN-001`：先攻降序、两类平局、相同怪物先攻组。
- `AUTO-TURN-002`：回合开始重置动作、附赠动作、反应和移动力。
- `AUTO-TURN-003`：反应使用后到下个自身回合开始前不可用。
- `AUTO-HP-001`：临时 HP 先承受伤害，治疗不恢复临时 HP。
- `AUTO-RESOURCE-001`：功力、次数资源和 1～8 环法术位独立扣除与恢复边界。
- `AUTO-EFFECT-001`：状态与专注跨回合、到期、来源与同名独立持续时间。

### 地图与范围

- `AUTO-MAP-001`：1×1、2×2、3×3、4×4 占位与越界检查。
- `AUTO-MAP-002`：直线与斜线的选定算法得到固定成本。
- `AUTO-MAP-003`：路径计算值与 DM 实际扣除值分别保存。
- `AUTO-AOE-001`：Circle、Cone、Line、Square 覆盖格。
- `AUTO-AOE-002`：49.999%、50%、大于 50% 与零面积边线接触边界。
- `AUTO-AOE-003`：多格单位任一占位格覆盖即进入候选并保存命中格。
- `AUTO-AOE-004`：人工 added/removed 与 confirmed targets 可复现。
- `AUTO-AOE-005`：预览不产生 Domain Event，确认只产生一次结算。

### 回写

- `AUTO-WRITEBACK-001`：战斗不直接改变长期角色卡。
- `AUTO-WRITEBACK-002`：确认、放弃、人工修正可逐角色逐字段执行。
- `AUTO-WRITEBACK-003`：位置、行动经济与临时效果默认不回写。

## 浏览器交互骨架

- `BROWSER-001`：七标签切换、隐藏和重开不丢战斗数据。
- `BROWSER-002`：行动轮切换同步地图高亮。
- `BROWSER-003`：地图拖动显示路径、距离和合法/待裁定提示。
- `BROWSER-004`：范围按下、拖动、实时列表、松开预览、人工编辑、确认。
- `BROWSER-005`：批量伤害、治疗、Buff、状态跨页面同步。
- `BROWSER-006`：自动保存后刷新恢复。
- `BROWSER-007`：误拖撤销与人工修正日志可读。
- `BROWSER-008`：暗骰对玩家视图隐藏但 DM 日志保留；若 v0.1.0 无独立玩家视图，则记录为限制而不得伪造。

## 触屏测试骨架

- `TOUCH-001`：单指选择与拖动棋子，无幽灵重复事件。
- `TOUCH-002`：范围按下、拖动、松开预览可完成。
- `TOUCH-003`：滚动/平移与棋子拖动手势不冲突。
- `TOUCH-004`：多格单位与小目标可可靠选中。
- `TOUCH-005`：DM 目标增删与确认按钮在目标设备可操作。

触屏模拟器不能替代至少一次真实触屏环境；若没有真实设备，最终状态为 `blocked`。

## 规则人工核对骨架

- `RULE-001`：PHB 2024 方格、体型与占位。
- `RULE-002`：已批准的斜向算法与设置显示。
- `RULE-003`：DMG 2024 范围半格算法与边线。
- `RULE-004`：先攻平局、相同怪物先攻组。
- `RULE-005`：动作、附赠动作、反应、临时 HP、状态与专注。
- `RULE-006`：3 怪物、3 NPC 数据逐字段对应实际 Entry。
- `RULE-007`：两名 15 级角色的等级、资源、法术位、职业能力与准备法术。
- `RULE-008`：产品二维投影未冒充墙体、掩护、视线或三维规则。

## 固定验收战斗

### 地图与单位

地图：`24 × 18` 方格；每格 5 尺；原点左上；默认高度 0。

| Instance | Template | Relation | Start `(x,y)` | Footprint | Elevation |
|---|---|---|---|---|---:|
| `pc-monk` | 15 级散打武者 | ally | `(2,13)` | 1×1 | 0 |
| `pc-wizard` | 15 级塑能师 | ally | `(4,14)` | 1×1 | 0 |
| `npc-scout` | 斥候 | ally | `(5,13)` | 1×1 | 0 |
| `npc-priest` | 祭司 | ally | `(3,15)` | 1×1 | 0 |
| `npc-mage` | 魔法师 | neutral | `(11,8)` | 1×1 | 0 |
| `monster-fire-giant` | 火巨人 | enemy | `(17,3)` | 3×3 | 0 |
| `monster-beholder` | 眼魔 | enemy | `(16,11)` | 2×2 | 0 |
| `monster-goblin-a` | 地精武者 | enemy | `(12,4)` | 1×1 | 0 |
| `monster-goblin-b` | 地精武者 | enemy | `(13,5)` | 1×1 | 0 |

两只地精使用相同模板和同一 `initiativeGroupId`，但必须有独立 HP、坐标、状态和日志目标。

### 可重放先攻输入

固定骰序列应制造：

- 两名 PC 同值，由玩家决定顺序；
- 中立魔法师与地精组同值，由 DM 决定顺序；
- 地精组共用一次先攻；
- 手动调整一次先攻并保留事件。

具体骰面与最终顺序在 D-001/D-002 无关，可由 Fixture 固定；禁止运行时重掷改变验收脚本。

### 场景步骤

1. 重置验证数据，新建战斗，从同一地精武者模板创建两个实例。
2. 验证玩家、NPC、怪物和 `ally/enemy/neutral`；验证火巨人 3×3 与眼魔 2×2。
3. 自动投先攻，处理两组平局，手动调整一次并开始第一轮。
4. 普通移动与斜向移动各一次；记录路径、计算距离、实际消耗与高度提示。
5. 故意误拖一个地精，执行撤销；确认旧事件仍在且补偿事件恢复坐标。
6. 武僧执行攻击动作、疾风连击、消耗功力、使用移动与一次反应；进入下个自身回合后验证重置。
7. 武僧使用能产生临时 HP 的能力；受到伤害后验证临时 HP 优先消耗。
8. 祭司施加祝福或持续 Buff，跨回合跟踪专注；执行一次治疗或人工批量治疗。
9. 法师或魔法师依次验证：
   - 油腻术：Square；
   - 火球术：Circle；
   - 闪电束：Line；
   - 寒冰锥或眼魔锥域：Cone；
   - 飞行术/加速术：Buff 与专注；
   - 妖精召唤术：只验证 Effect 与受控实例表达，不扩展完整召唤控制。
10. 每种范围实时显示覆盖格与候选单位；至少一次手动移除边缘候选并添加一个 DM 裁定目标。
11. 确认后执行批量伤害、Buff 或状态；验证大单位任一占位格命中。
12. 眼魔施加一个跨回合状态并消耗一次次数资源；在正确时点结束。
13. 人工修正一名单位 HP、一个资源、一个状态和一个坐标，填写原因。
14. 等待自动保存，刷新页面，确认行动者、轮数、位置、资源、状态、范围效果与日志一致。
15. 导出完整 JSON，新建空状态后重新导入，比较 Domain State 与 Event Log。
16. 结束战斗，展示两个玩家角色的差异：
    - 对武僧确认部分回写；
    - 对法师放弃或人工修正后回写；
    - 验证战斗位置、临时效果和行动经济不进入长期卡。
17. 从日志按 sequence 还原完整操作顺序，核对撤销、人工修正、骰子与回写。

### 固定遭遇通过条件

- 上述每一步有 `pass/fail/blocked/skipped`；
- 任一阻塞项失败即整场遭遇 `fail`；
- 规则歧义不得由测试执行者临时决定；
- 最终真实 DM 必须回答：该工具是否足以在不丢失裁定权的情况下完成并复盘本遭遇。

## 最终人工验收

```text
Acceptance Question:
DM 能否在同一会话中完成固定遭遇、恢复与选择性回写，
同时理解系统自动计算与 DM 最终裁定的边界？

Executor / Approving Authority:
User-designated real DM

Pass:
固定遭遇全部阻塞步骤通过，且 DM 明确接受工作流。

Block:
任何状态丢失、页面互相覆盖、范围误结算无法修正、
撤销改写历史、恢复不一致、无审核回写或 DM 不接受工作流。
```

### 2026-07-31 User Acceptance Result

- **Executor / Approving Authority：** User-designated real DM
- **Framework Workflow：** `pass`
- **User conclusion：** 除具体规则数值仍需后续逐步核对外，当前系统已基本满足用户对战斗辅助框架的需要，作为 `v0.1.0` 足够。
- **Accepted scope：** 单一会话中的行动轮、地图、棋子、范围预览与 DM 覆写、HP、临时 HP、Buff/状态、资源、日志、自动保存、JSON 导入导出、补偿撤销、朝向与发射口，以及真实触屏工作流。
- **Non-claims：** 本结论不表示怪物、NPC、角色或法术的全部具体数值已经核对正确；不表示完整字段回写、召唤受控实例或独立玩家端已经实现；不构成 Independent Review、Released 或 Archived。

### 2026-08-03 收口修正 1：范围面积边界回归

| Check | Result | Actual evidence / limitation |
|---|---|---|
| `AUTO-AOE-002` 连续面积 50% 边界 | pass (Node) | 在 `/Users/chenzehao/Projects/DND Terminal` 执行 `node tests/geometry.test.mjs` 通过：4.999 尺直线宽度不覆盖目标格，5 尺恰好覆盖，5.001 尺覆盖；方形仅接触边线与圆形相切均不覆盖。 |
| `SMOKE-AOE-001` 页面加载与范围控件 | pass (desktop smoke) | 本地浏览器加载地图页，范围按钮“圆形”可选择，控制台 error 日志为空。此项只验证模块接入与控件可用，不替代 Circle/Cone 的完整规则人工核对。 |

`src/geometry.js` 以连续二维交叠面积代替格心点判定。方形和直线为精确矩形；圆形和锥形采用固定 720 段圆弧多边形的确定性近似。因此本条证明已落实 `D-002` 的 50% 阈值与零面积接触边界，不把它表述为所有曲线范围的无限精度解析几何证明。
