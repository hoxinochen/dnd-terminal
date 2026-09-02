# Testing：v0.7.0 高密度 DM 工作台、状态投影与统一视觉系统

- **交付 ID：** `v0.7.0`
- **状态：** Automated and Browser Verification Passed — Human Accepted — Review Complete — Released / Archived Local Private
- **执行日期：** `2026-09-01` 至 `2026-09-02`
- **执行位置：** `/Users/chenzehao/Projects/DND Terminal`

## 1. 自动验证

执行：

```sh
node --check src/app.js
node --check src/dice.js
node --check src/workbench-v070.js
node --check src/life-cycle-v070.js
node --test tests/*.test.mjs
git diff --check
```

结果：24/24 个 Node 合同/回归测试通过；四个 v0.7 运行模块（含 `src/dice.js`）语法检查通过；Git 空白检查通过。

新增或扩展覆盖：

- v0.7 Envelope、Delivery/Schema 分离、v0.6 copy-on-write、启动幂等、旧 key 字节保持、未来 Schema 拒绝、当前 key 损坏阻断；
- 十类 Status Facet、未知值原样保留、组合优先级、效果来源/专注/期限、待摆放/待回写、递归只读与跨工作区同对象结论；
- 七工作区和十面板 Registry 完整字段、核心面板保护、显隐、顺序冲突归一化、三档宽度、两档密度、单工作区/全部重置；
- UiPreferences 损坏回退、角色页签/归档显示/布局编辑隔离；Session 保存和 JSON 导出剥离呈现状态，同时保留恢复敏感草稿；
- 既有死亡、复活、地图、范围、角色、投入、效果、撤销、战后回写与 v0.4/v0.5/v0.6 历史合同继续通过。
- 2026-09-02 验收修正新增结构断言：角色三个注册面板必须使用直接稳定 ID，不得恢复相邻选择器耦合或 `sticky` 覆盖；生产 UI 不得再出现验证数据重置入口；行动经济矩阵、效果录入栅格和标准/紧凑内容层必须存在。

修正前以 `node --test` 对当前工作区及历史冻结快照执行基线回归，105/105 通过。修正完成后重新执行上述正式当前工作区命令，24/24 通过；四个 v0.7 运行模块语法检查和 `git diff --check` 均通过。

本轮地图候选选择区修正完成后，入口修订号相关 5/5 聚焦合同通过，并再次执行包含历史冻结快照的 `node --test`：105/105 通过；四个 v0.7 运行模块语法检查及 `git diff --check` 继续通过。

### Amendment 01 Implementation 复验（2026-09-02）

新增 `tests/dice-amendment01.test.mjs` 覆盖复合骰式、正负骰项、大小写/空格规范化、边界限制、优势/劣势门禁、快捷输入 `110284` 与歧义候选；与既有 23 项合同合计 `24/24` 通过。

使用隔离 localhost 浏览器会话复验：地图存在独立 `MapViewport`/`MapCanvas`，网格不脱离视口，原点/当前行动者定位按钮可见；角色页仅有一个“创建角色”入口，开发验证工具与旧版预设不出现在角色页且设置中的开发工具默认折叠；掷骰历史为 `overflow-y:auto`，快捷串 `110284` 显示候选并包含 `1d10+2d8+4`。浏览器未读取用户真实 localStorage，未执行危险的固定场景载入。

### Review 后固定场景修正复验（2026-09-02）

- `v010FixtureSession()` 已恢复 9 个固定验证单位、2 条角色基线记录和地精同组先攻标识；确定性先攻映射覆盖当前 `preset-*` / `ref-*` 模板 ID。
- 聚焦工作台合同测试及完整 `node --test tests/*.test.mjs` 均为 `24/24`；四个运行模块语法检查与 `git diff --check` 通过。

## 2. 隔离浏览器验证

使用 `127.0.0.1:4187` 与 `localhost:4187` 两个独立 origin 的合成数据；没有读取用户真实 localStorage，也没有改写 v0.6 存储键。

已通过：

- 七工作区导航、刷新、`#map` / `#characters` 路由、浏览器前进/后退；控制台无 error/warn；
- 标准与紧凑密度；面板顺序从 `40/30` 交换为 `30/40` 后实际屏幕纵向位置同步交换；
- 隐藏“持续态势”期间掷骰事件从 3 增至 4，恢复战斗后事件仍在；隐藏地图 Inspector 后地图主体与范围面板保持可见；
- 12 个同名单位正确显示为“丧尸 1…12”，完成确认、先攻、平局裁定和第 1 轮；战斗首屏同时显示五问态势、行动轮与当前任务；
- 地图主体、独立 Inspector、范围面板同时存在；圆形拖动得到 25 格预览和 0 个候选，事件数保持 3，证明预览不写事件；
- 390×844：桌面左轨隐藏、移动导航启用、五问两列、控件 44px、页面 `scrollWidth = viewportWidth = 390`；
- 640px CSS 可用宽度：页面无横向溢出，12 单位仍可操作；Escape 关闭布局面板；Tab 焦点具有 3px solid 轮廓；
- 工作区版本、Delivery、Session Schema、存储边界和 DM 裁定范围可见。

### 2026-09-02 验收修正复验

使用 `127.0.0.1:4188` 新建隔离合成遭遇并完成确认、先攻、动作使用与 DM 恢复；没有读取用户真实 localStorage。

- 单位库原“固定工作区 + 说明”降级为低权重“固定布局”，页面仍保持固定布局且没有附带实现 `BL-029`。
- 当前选中者显示三个等宽行动经济列。宽屏下三列均为 `201 × 156px`，两行按钮分别为 `183 × 40px`；点击“使用动作”后使用按钮禁用、恢复按钮启用，点击恢复后状态和可用性正确反转。
- “重置验证数据”按钮和 `data-action="fixtures"` 均为 0 个，生产 UI 不再提供该入口。
- 效果名称、持续轮数、专注与提交在 1600px 宽屏下均为 44px 高并处于同一基线；宽度按 `220 / 120 / 130 / 150px` 分配，不以机械等宽牺牲名称输入。
- 同一合成状态下，标准模式有 4 个完整辅助内容区域可见、紧凑摘要为 0；切换紧凑后完整区域为 0、短摘要为 3，当前行动面板高度由 `994px` 降至 `828px`。核心状态和操作保持可见，证明差异不是单纯字号变化。
- 角色选择、当前角色、战后审核是 `.character-panel-grid` 的三个直接注册子节点。默认“窄 + 全宽 + 全宽”、改为“窄 + 标准 + 标准”以及 390×844 单栏三种组合的矩形均不相交；角色选择计算样式为 `position: static`。
- 390×844 下页面 `scrollWidth = clientWidth = 390`；行动经济改为单列，效果四项控件依次单列且均为 `348 × 44px`，没有横向溢出。
- 地图范围候选选择区修正前，四个 checkbox 高度均为 `40px`，宽度随名称在 `19.88px / 33.32px` 间变化，标签宽度也仅为 `26.88px / 40.32px`。修正后 1280px 标准模式的四个选择项均为 `420 × 44px`、checkbox 均为 `22 × 22px`；紧凑模式尺寸不变。点击整行可切换候选，已选项同时呈现金色边框、内侧强调线和背景。
- 390×844 下范围注册面板为 `374px` 宽，四个候选行均为 `348 × 44px`、checkbox 均为 `22 × 22px`，页面 `scrollWidth = clientWidth = 390`。同步确认 900px 以下地图面板横跨完整 12 列网格，不再坍缩为单轨宽度；浏览器控制台无 error/warn。

可复核截图：

- `/Users/chenzehao/.codex/visualizations/2026/09/01/01a05ab6-2ac9-7cc0-860b-9f191225b858/dnd-terminal-v070-desktop-density.png`
- `/Users/chenzehao/.codex/visualizations/2026/09/01/01a05ab6-2ac9-7cc0-860b-9f191225b858/dnd-terminal-v070-mobile.png`
- `/Users/chenzehao/.codex/visualizations/2026/09/01/01a05ab6-2ac9-7cc0-860b-9f191225b858/dnd-terminal-v070-map-preview.png`

## 3. 验证边界

- 浏览器控制面未暴露可确认的页面缩放读数；因此用 1280px 桌面布局在 640px CSS 可用宽度下验证等效双倍缩放退化，但不把它冒充为真实浏览器 200% 设置。
- macOS/Windows 真实触屏设备、数值化 WCAG 对比度审计、三种 v0.6 死亡结果的逐流程视觉重演和长时真实 DM 会话未纳入本轮专项复验；相应 Domain 行为已有现存自动回归，但自动测试不替代真实视觉与 DM 验收。
- 浏览器验证使用合成会话；不构成 Release、Archive、部署或公开发布证明。

## 4. 结论

本次欠缺的 Projection 消费、真实布局控制、高密度信息架构、窄屏/键盘/地图交互和 UI/业务隔离均已有自动与浏览器证据。Implementation、User Human Acceptance、Review、Local Private Release 与 Lightweight Archive 门禁已完成。该结论不构成 Commit、Push、部署或公开发布授权。
