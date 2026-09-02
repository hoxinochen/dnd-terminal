# Roadmap

- **Status：** Active Direction / v0.7.0 Archived — Local Private
- **Naming Rule：** 产品交付使用 SemVer；自 v0.3.0 起，内部治理可在 ESG Milestone Documentation Profile 适用时使用独立 Milestone/Slice 身份。当前映射为 `M1 ↔ v0.3.0`、`M1-S1` 至 `M1-S5`；Milestone/Slice 不等于产品版本或 Release。

## 当前交付状态

`v0.4.0`、`v0.5.0`、`v0.6.0` 与 `v0.7.0` 均已完成 Local Private Archive。v0.6.0 的自动测试、浏览器完成流程、User Human Acceptance 与八项 Archive Gate 均已通过，冻结及本地技术同步基线为 `3464d17`。User 于 `2026-09-01` 授权生成、批准并冻结 `v0.7.0` ABC，随后独立授权并完成 Implementation、自动测试和浏览器烟雾验证。实施后复核形成 `v0.7.0 Amendment 01`，User 已批准冻结并授权 Implementation；Amendment 实施、自动测试和浏览器复验已完成。User 已确认人工审核通过并授权 Review；Review 已完成。User 随后授权先后执行 Local Private Release 与 Archive；Release 与 Lightweight Archive 均已完成。

## 当前批准方向：v0.7.0 高密度 DM 工作台、状态投影与统一视觉系统

当前 Approved/Frozen 合同为 `version-work/v0.7.0/ABC.md`。方向是保留现有分离 Domain 与 Event Log Authority，建立只读、可重建的 Status/Workspace Projection；用稳定 Shell 承载战斗、地图、角色、单位库、日志、掷骰与设置七个工作区；同时建立高密度信息层级、统一视觉 Token/组件和战斗、地图、角色的受控布局偏好。

本交付使用一个主 Slice 和五个内部风险阶段，不拆成 v0.7.1/v0.7.2 或 M3 Slice。它不新增 D&D 规则、玩法、外部 UI 框架、多人服务或部署；以 v0.6.0 冻结身份、copy-on-write 和 Legacy 对照作为回退保护。Implementation、User Human Acceptance、Review、Local Private Release 与 Archive 已完成。

`version-work/v0.7.0/AMENDMENT_01.md` 已 Approved / Frozen 且完成 Implementation、Review、Local Private Release 与 Archive，收口地图视口越界、100 条骰史、复合骰式与快捷输入、角色创建任务流和设置开发验证工具。地图图片导入、`baseBounds / workingBounds` 与有符号四向热扩展强化为 BL-007 后续方向，不进入该 Amendment。

## 已完成的基础方向（历史）

以下“项目基线、战斗闭环、地图与范围、事件与恢复、固定遭遇验收”记录 v0.1.0 至 v0.3.0 已建立并逐步扩展的基础方向，不是 v0.7.0 的待办或当前 Exit Gate。v0.7.0 后续实施只能受已批准/冻结 ABC 约束。

### 项目基线

退出条件：

- Authority、产品需求、规则基线、Architecture、ABC、Testing 与 Backlog 职责清楚；
- ESG 采纳与 Profile 适用性由用户批准；
- 阻塞规则分支有明确决定；
- `v0.1.0` ABC 获得或未获得明确结论。

### 战斗闭环

方向：

- 模板与实例；
- 先攻、回合、行动经济；
- HP、资源、法术位、状态；
- 单一权威战斗会话。

退出条件：不依赖地图也能完成可保存、可撤销、可复盘的基本战斗。

### 地图与范围

方向：

- 空白方格地图、棋子、多格占位、高度；
- 路径与距离；
- Circle/Cone/Line/Square 范围预览与 DM 目标确认。

退出条件：固定遭遇中的全部几何与批量目标用例通过。

### 事件与恢复

方向：

- 自动保存、刷新恢复、完整 JSON 导入导出；
- 补偿式撤销与人工修正；
- 结束战斗差异与选择性角色卡回写。

退出条件：Event Log 与 Snapshot 一致，恢复与重放不产生意外差异。

### 固定遭遇验收

方向：

- 完成自动测试、浏览器、触屏、规则核对；
- 由真实 DM 执行固定遭遇；
- 独立 Review 对照 Approved ABC 给出结论。

退出条件：所有阻塞验收项通过，或失败/延期被如实记录并重新批准。

## 后续方向

完整规则引擎、全量内容库、复杂地图、墙体/视线/掩护、多用户、账户、房间、NAS、3D、AI 地图与公平性服务器骰子都只能从 Backlog 经新的 ABC 进入未来交付。
