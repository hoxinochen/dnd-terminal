# Independent Review：DND Terminal v0.7.0

- **状态：** `Review Complete — Awaiting User Local Private Release Authorization`
- **启动授权：** User / `2026-09-02` / “人工审核通过，执行review”。
- **评审范围：** 已冻结的 [ABC](ABC.md)、[Amendment 01](AMENDMENT_01.md)、[Implementation](IMPLEMENTATION.md)、[Testing](TESTING.md)、当前 Workspace 候选代码、相关自动测试与 Authority 记录。
- **独立性说明：** 本记录对已实施候选作范围独立的证据复核；不声称存在外部第三方评审者。不修改 Rules Baseline、用户数据、v0.6.0 冻结材料、发布包或 Git 历史。

## 1. 证据分级

| 证据 | 复核结果 |
|---|---|
| 自动化 | `node --check src/app.js`、`src/dice.js`、`src/workbench-v070.js`、`src/life-cycle-v070.js` 通过；`node --test tests/*.test.mjs` 为 `24/24`；`git diff --check` 通过。 |
| 浏览器 / 人工 | `TESTING.md` 已记录隔离 localhost 浏览器对地图视口、角色单一创建入口、设置开发工具、骰点历史、密度、窄屏、键盘焦点及候选选择区的复验；User 已明确人工审核通过。本 Review 不把静态阅读冒充新的浏览器验收。 |
| 兼容 / 回退 | `v0.7.0` 继续复用 v0.6.0 Session Schema，通过独立 v0.7 storage key 与 copy-on-write 读取；旧 key 不就地改写。Authority → `authority-mirror/` 的 `rsync -ain` 无差异。 |
| 静态安全 | 对 `index.html`、`src/` 与 `tests/` 扫描 API key、secret、password、Bearer、private key 模式，无命中。 |

## 2. 候选身份与冻结边界

- **技术基线：** `main@3464d173779d6b14be4fe66c7b4444223f6a7779`；当前交付仍是未提交的工作树候选。
- **候选范围：** v0.7.0 主 Slice 与 Amendment 01 的地图视口、状态投影/工作台、视觉系统、受控布局、骰点历史/复合骰式、角色创建任务流、设置开发验证工具及相关测试。
- **明确延期：** BL-007 的地图图片/动态边界/负坐标与四向热扩展、BL-029 单位库搜索筛选均未混入本次实现。
- **不授予：** 本 Review 不授予 Local Private Release、Archive、Branch、Commit、Push、Deployment 或 Public Release。

## 3. 合同与边界复核

| 合同 | 复核结论 |
|---|---|
| Domain 与 Projection 隔离 | 通过。`CombatSession`、`CharacterSheet`、`UnitTemplate`、`CombatantInstance`、`CombatEvent` 与 `UiPreferences` 继续分离；Projection 只读、可重算，不成为第二份 Authority。 |
| 工作台与面板 | 通过。七工作区和 Panel Registry 保持稳定 ID、核心面板保护、宽度/顺序/密度控制；角色选择、当前角色、战后审核为直接平级节点，不再依赖覆盖性相邻结构。 |
| 地图 | 通过。`MapViewport` 承载背景和滚动，`MapCanvas` 承载网格与棋子；fit/tactical、坐标与范围事实未改变，延期地图导入/动态边界未实现。 |
| 骰点 | 通过。复合有符号骰式、快捷输入歧义确认、100 条最新历史、结构化逐骰/分组结果及非可逆 `dice.rolled` 事件均有实现和测试；Event Log 不截断、不重掷。 |
| 角色创建 | 通过。正常角色页只保留“创建角色”入口；Excel/手工方式互斥展开，草稿保留/放弃有明确操作，CharacterSheet 仅在确认后写入。 |
| 开发验证工具 | 通过。M1-S4、旧版角色预设和固定战斗入口移至设置默认折叠区域；固定场景替换有二次确认、导出选项及待审核 PostCombatDiff 阻断。 |
| 兼容与回退 | 通过。v0.6.0 Schema/旧 key/冻结归档不被改写；新 UI 偏好独立存储，导出不携带呈现状态，恢复敏感草稿仍保留。 |

## 4. 发现与保留风险

- **R70-001（已修复，原非阻塞）：** 初审在 `src/app.js:L364-L380` 的 `v010FixtureSession()` 发现只载入 5 个旧角色/NPC 预设，并使 `fresh.characters` 保持空集合。User 随后授权直接修复；现已恢复 v0.6.0 原有 9 个单位、角色基线行、地精同组标识及当前模板 ID 的确定性先攻映射。聚焦合同与完整回归均通过；该项不再保留为未决风险。
- **无阻塞发现。**

## 5. 评审结论与停止点

本 Review 未发现与冻结 ABC/Amendment 01、Domain/Projection 隔离、兼容回退、自动测试或生产 UI 边界冲突的阻塞性问题。R70-001 已在 Review 后由 User 授权修复并完成回归验证；Review 结论保持 `Review Complete`。

下一门禁为 User 明确授权的 `Local Private Release`。在该授权前，不执行 Release、Archive、Branch、Commit、Push、部署或公开发布。
