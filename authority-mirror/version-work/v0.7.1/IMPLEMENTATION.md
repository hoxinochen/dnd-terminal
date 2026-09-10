# Implementation：v0.7.1 统一战斗工作台 UX 适配

- **交付 ID：** `v0.7.1`
- **状态：** `Implemented — Candidate Frozen; Integration Authorized`
- **候选 commit：** `58ebd929255d157973ec7587d73d6b0fecf05f93`
- **实现分支：** `gemini/v0.7.0-unified-battle-map-ux-candidate`
- **技术基线：** `main@a07332f`；v0.7.0 已 Archived — Local Private

## 1. 实现摘要

本交付接收 Gemini 的统一工作台候选和 AG/Antigravity 的 prompt 驱动修复，再由 Codex 进行独立审查、窄范围重构和最终冻结。实现集中在表现层与地图视口交互；Domain、Event Log、Session Schema 和角色长期状态边界保持原状。

## 2. 实现落点

| 责任面 | 文件 | 结果 |
|---|---|---|
| 工作台编排 | `src/app.js`、`src/battle-workbench.js`、`src/workbench-v070.js` | 三种非对称布局状态、死亡处理临时展开、地图返回来源记录、视口状态保留 |
| 地图交互 | `src/map-controller.js` | 提示条鼠标/触控/键盘平移；背景短点击回调；排除棋子和高风险草稿；无 Domain 写入 |
| 布局基础层 | `src/workbench-foundation.css` | 固定左 20% 轨道、地图/右侧比例、44px 收起轨道、窄屏任务流、主题语义变量 |
| 主题与状态 | `src/styles.css`、`src/battle-workbench.css` | 浅色/羊皮纸层次、死亡和特殊状态标签、高对比状态文字、骰子/表单 containment |
| 掷骰与入口 | `src/dice-dock.js`、`index.html` | 顶部骰子栏响应式收缩与缓存失效入口 |
| 契约与回归 | `tests/candidate-unified-workbench.test.mjs`、`tests/workbench-foundation.test.mjs` 及受影响历史 UI 合同 | 布局归属、主题、收起轨道、入口和兼容边界断言 |

## 3. 保留的业务边界

- 棋子移动仍由原有 `CombatSession`/事件流程提交，地图平移不触发同一流程。
- 范围预览、待入场摆放、死亡后处理和关联/受控生物逻辑继续使用原 Command/状态边界。
- UI 偏好与视口位置属于内存/展示状态，不写入战斗事件或角色长期记录。
- `v0.7.0` 冻结记录、Release ZIP、Archive Summary 和旧存储键未被改写。

## 4. 协作与实现证据

完整的 Gemini / AG / Codex 分工、执行顺序、文件归因限制和验收证据见同目录 `COLLABORATION_RECORD.md`。候选分支的 UX 验收摘要 `UX_RECOVERY_REVIEW.md` 不是新的 Authority 原件。

## 5. 集成停止点

候选实现已冻结并获 User 授权 merge。合并后只需执行主线回归和更新集成状态；没有自动授权 Release、Archive、Push 或公开发布。
