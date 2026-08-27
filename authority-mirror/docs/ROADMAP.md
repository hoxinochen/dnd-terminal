# Roadmap

- **Status：** Active Direction / Not Implementation Approval
- **Naming Rule：** 产品交付使用 SemVer；自 v0.3.0 起，内部治理可在 ESG Milestone Documentation Profile 适用时使用独立 Milestone/Slice 身份。当前映射为 `M1 ↔ v0.3.0`、`M1-S1` 至 `M1-S5`；Milestone/Slice 不等于产品版本或 Release。

## 当前候选交付：v0.4.0

- **主题：** PC `0 HP`、死亡豁免与稳定状态；
- **结构：** 一份 ABC、一个 `v0.4.0-S1`、一次 Implementation、一次综合验收；
- **状态：** Implementation Complete / User Human Acceptance Pending；
- **候选退出条件：** PC 的昏迷、死亡豁免、稳定、死亡、治疗恢复、0 HP 受伤、回合位置、刷新恢复、事件日志和战后隔离形成一致闭环；旧会话迁移失败不得覆盖旧数据；自动测试、隔离浏览器验证和 User Human Acceptance 均完成。

本候选不包含跨刷新历史撤销、完整 Recovery Mode、密码学完整性协议、大型 E2E 平台、复活/击晕完整规则、法术/攻击/伤害引擎或其他 Backlog。User 已另行授权本次 Implementation；唯一范围合同仍见 `version-work/v0.4.0/ABC.md`，Roadmap 本身不授予额外权限。

## 项目基线

退出条件：

- Authority、产品需求、规则基线、Architecture、ABC、Testing 与 Backlog 职责清楚；
- ESG 采纳与 Profile 适用性由用户批准；
- 阻塞规则分支有明确决定；
- `v0.1.0` ABC 获得或未获得明确结论。

## 战斗闭环

方向：

- 模板与实例；
- 先攻、回合、行动经济；
- HP、资源、法术位、状态；
- 单一权威战斗会话。

退出条件：不依赖地图也能完成可保存、可撤销、可复盘的基本战斗。

## 地图与范围

方向：

- 空白方格地图、棋子、多格占位、高度；
- 路径与距离；
- Circle/Cone/Line/Square 范围预览与 DM 目标确认。

退出条件：固定遭遇中的全部几何与批量目标用例通过。

## 事件与恢复

方向：

- 自动保存、刷新恢复、完整 JSON 导入导出；
- 补偿式撤销与人工修正；
- 结束战斗差异与选择性角色卡回写。

退出条件：Event Log 与 Snapshot 一致，恢复与重放不产生意外差异。

## 固定遭遇验收

方向：

- 完成自动测试、浏览器、触屏、规则核对；
- 由真实 DM 执行固定遭遇；
- 独立 Review 对照 Approved ABC 给出结论。

退出条件：所有阻塞验收项通过，或失败/延期被如实记录并重新批准。

## 后续方向

完整规则引擎、全量内容库、复杂地图、墙体/视线/掩护、多用户、账户、房间、NAS、3D、AI 地图与公平性服务器骰子都只能从 Backlog 经新的 ABC 进入未来交付。
