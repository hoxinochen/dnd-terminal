# Implementation：v0.7.0 高密度 DM 工作台、状态投影与统一视觉系统

- **交付 ID：** `v0.7.0`
- **状态：** Implementation Complete — Human Accepted — Review Complete
- **实施授权：** User / `2026-09-01` / “实施implementation”；User / `2026-09-01` / “完成欠缺的部分”
- **Amendment 01 实施授权：** User / `2026-09-02` / “批准冻结amendment01，并且授权执行implementation，顺序执行两个操作”
- **实施范围：** 完整执行冻结 ABC 的一个主 Slice；本文件不承担 Review、Release、Archive、Commit、Push、部署或公开发布授权。
- **Workspace：** `/Users/chenzehao/Projects/DND Terminal`

## 已实施事实

### 1. 兼容、存储与回退

- `src/life-cycle-v070.js` 继续以 v0.6.0 的 `Session Schema 0.5.0` 归一化 Domain；`Delivery 0.7.0` 与 Domain Schema 身份分离，没有借 UI 重构改变角色、模板、战斗实例、行动轮、地图、资源或 Event Log 语义。
- v0.7.0 只写 `dnd-terminal.v0.7.0.workbench.session.current`。有效 v0.6.0 及更早 Envelope 通过 copy-on-write 读取；旧 key 字节保持。当前 v0.7 key 损坏时明确阻断，不以旧值静默覆盖。
- 保存和 JSON 导出统一经过 `sessionForStorage()`；工作区、当前选择、通知、角色详情页签、归档显示和布局编辑状态不进入 CombatSession、CombatEvent 或导出文件。范围、待入场等恢复敏感草稿继续保留。
- UI 偏好独立使用 `dnd-terminal.v0.7.0.ui-preferences`，包含版本、最近工作区、详情页签、归档显示、标准/紧凑密度，以及面板显隐、顺序、三档宽度。偏好损坏只回退默认布局，不阻断会话恢复。

### 2. Status / Workspace Projection

- `src/workbench-v070.js` 建立一次性只读 Projection，统一表达 encounter、participation、presence、life、turn、action、effects、control、pending 与 confidence 十类 Facet。
- 未识别未来状态不会归入“正常”；Projection 同时保留原始值、`needs-review` 置信度和复核原因。
- 效果投影包含来源、专注、开始轮次和到期信息；待摆放、待回写与 DM 复核进入统一 pending/priority 结果。
- 同一投影对象由战斗态势、单位行、地图 Inspector、角色当前战斗状态与日志结论共同消费；输出递归冻结，不写回 Domain。

### 3. Shell、信息架构与工作区

- 稳定 Shell 包含桌面左侧导航、窄屏折叠导航、会话/版本/阶段、全局通知和工作区容器。工作区使用 `#battle`、`#map`、`#characters`、`#library`、`#log`、`#dice`、`#settings` 路由，刷新、前进和后退可恢复。
- 战斗首屏提供“一屏五问”：轮次/行动者、可行动性、重要异常、最近结果、待 DM 决定；行动轮、当前任务和单位态势按默认优先级排列。
- 地图主体、Inspector、范围/投入成为三个独立面板；范围拖动预览不写事件，松开后再进入候选编辑。
- 角色、单位库、日志、掷骰、设置不再共享同权重卡片堆：角色按长期卡/详情/战后审核组织；日志按轮次分组且 Payload 默认折叠；掷骰支持普通、优势、劣势和最近历史；设置按会话、显示、数据安全和运行时分组。
- 外层 `#app` Shell 不随业务操作重建；当前工作区子树是明确更新边界。冻结 ABC 要求保留的 Legacy UI 候选和少量兼容注入路径在 User Human Acceptance 前仍保留，未被提前删除。

### 4. Panel Registry 与受控布局

- 七工作区与战斗/地图/角色的十个复杂面板具有统一 Registry：ID、归属、标题、责任、核心性、默认顺序、宽度、Projection、Command 与 empty/error/unknown 状态合同齐全。
- 战斗、地图、角色采用同一 12 列组合网格；上移/下移、`narrow / standard / full`、辅助面板显隐和单工作区/全部重置真实改变布局。
- 行动轮、当前行动、地图主体、角色列表和角色详情等核心流程不可隐藏。辅助面板隐藏只改变 CSS 呈现，事件、效果、待处理事项和持久化继续维护。
- 不提供自由拖拽窗口、任意像素缩放、绝对定位、命名布局或远端插件。

### 5. 统一视觉与可访问性

- `src/styles.css` 建立完整颜色、字号、间距、圆角、阴影、动效、焦点和层级 Token；深色深蓝背景、暖金主强调、红橙风险状态形成非纯颜色的信息层级。
- 桌面为左轨工作台；900px 以下切换折叠导航和单栏；620px 以下五问态势为两列、控件至少 44px、无横向页面溢出。
- 标准/紧凑只改变密度，不改变功能；键盘焦点为 3px 明确轮廓，Escape 可关闭布局和移动导航面板。

### 6. 2026-09-02 User Human Acceptance 修正

- User 明确授权继续修正角色布局、战斗状态区、密度表达和单位库固定布局提示。角色选择、当前角色、战后审核改为三个直接、平级且具有稳定 `data-panel-id` 的面板根节点；取消角色选择跨行 `sticky`，不再通过 `.character-workspace + .panel.two` 之类的相邻结构选择器冒充解耦。
- `narrow / standard / full` 继续使用同一 Panel Registry 与 UiPreferences，但角色工作区改由自己的 12 列面板网格承载。全宽面板独占一行，其他面板进入下一行；导入草稿和手工创建入口作为明确的非注册流程区排列，不覆盖三个注册面板。
- 当前选中者的动作、附赠动作、反应改为三列行动经济矩阵；每列依次显示状态、使用操作和 DM 恢复。原战斗控制中的三个使用按钮已移入该矩阵，事件与恢复语义不变。
- 手工效果录入改为语义化四列栅格：效果名称使用较宽列，持续轮数、专注和提交按信息需要分配宽度；四项控件等高并对齐，窄屏退化为单列。
- 标准/紧凑不再只改变字号和 Padding。标准模式显示完整效果名称与辅助解释；紧凑模式改为效果数量和短摘要，同时保持行动、异常、阻塞、待 DM 裁定及核心操作可见。
- 生产 UI 的“重置验证数据”、点击绑定和会生成 `session.fixtures.reset` 的运行时入口已删除；合成夹具继续由测试和受控开发流程提供。
- 单位库的“固定工作区”主视觉提示降级为低权重“固定布局”标签；搜索、筛选和快速定位没有附带实现，已按 User 授权登记为 `docs/BACKLOG.md` 的 `BL-029`。
- 地图范围预览的“候选与 DM 覆写”保留既有候选判定与手动增删语义，仅修复旧 `.row > label` 网格样式造成的视觉技术债：每个候选改为同宽、同高且整行可点击的选择项，勾选框固定为 `22 × 22px`，名称与控件共用统一基线；勾选状态同时使用边框、内侧强调线和背景表达，不依赖原生蓝色勾选框尺寸。同步修正 900px 以下地图注册面板只占一个 12 列轨道的规则冲突，使地图主体、Inspector 与范围面板真正按单栏占满可用宽度。

### 7. Amendment 01 Implementation

- 地图主体拆分为 `MapViewport` / `MapCanvas`：深色底纹、边框和双向滚动由视口承载，网格与棋子按实际格数由画布承载；保留 fit/tactical 两种显示模式及原有坐标事实，并提供回到原点/当前行动者的定位按钮。
- 掷骰新增复合骰式解析器 `src/dice.js`，支持多组有符号 `NdM`、常数、规范化 raw/canonical、结构化逐项骰果/小计和安全上限；数字快捷串先预览候选，`110284` 可选择 `1d10+2d8+4`，歧义不会直接写入事件。
- 掷骰历史改为最新在前、最多 100 条、固定高度可滚动并可回到最新；条目显示原始/规范骰式、逐骰结果、常数、总值、模式、公开/暗骰、回合与时间。骰点使用无撤销快照的非可逆事件路径，Event Log 仍保留完整事实。
- 角色页收敛为唯一“创建角色”入口，导入和手工创建互斥展开；两个活动面板分别注册为 `character-import` / `character-manual` 并记忆三档宽度。手工草稿在重渲染、切换方式和工作区时保留，关闭/切换提供明确保留或放弃选项。
- M1-S4 三个夹具、两个旧版角色预设和固定战斗验证场景移至设置内默认折叠的“开发与验证工具”；固定场景替换前二次确认，可先导出，存在待审核候选差异时阻断。正常角色页与战斗控制区不再显示这些入口。

### 8. Review 后非阻塞项修正（2026-09-02）

- 按 R70-001 修复开发验证固定场景：恢复 v0.6.0 原有 9 个单位组成（PC×2、NPC×3、火巨人、眼魔、地精×2），补回角色基线行，并为重复地精恢复同组先攻标识。
- 固定场景的确定性先攻映射同步兼容当前 `preset-*` 与 `ref-*` 模板 ID；仅作用于 `v0.1.0-fixture` 开发验证路径，不改变正常战斗掷骰。
- 该修正不改写 v0.6.0 冻结快照或生产会话数据。

## 变更文件

- `index.html`
- `src/app.js`
- `src/life-cycle-v070.js`
- `src/workbench-v070.js`
- `src/session-persistence.js`
- `src/styles.css`
- `tests/workbench-v070.test.mjs`
- `tests/persistence-m1-s5.test.mjs`
- 既有版本兼容与 UI 合同测试的当前入口断言
- Authority `docs/BACKLOG.md`：新增 `BL-029`，仅记录未来意图，不授予当前实施权限

## 未执行的后续门禁

- User Human Acceptance、Independent Review、Local Private Release 与 Lightweight Archive 已完成；Commit、Push、部署、公开发布与再分发仍未获授权。
- 冻结 `ABC.md` 保持其冻结时“Implementation Not Granted”的历史事实；本文件记录随后取得且已执行的独立实施授权，不改写冻结合同。
