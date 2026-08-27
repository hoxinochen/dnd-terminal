# Testing：v0.3.0 / M1

- **状态：** `M1 Implementation Complete — Review Approved；v0.3.0 Released — Local Private`
- **产品版本映射：** `M1 ↔ v0.3.0`
- **当前测试范围：** `M1-S1` 至 `M1-S5` 与 Amendment 2 稳定化
- **执行者：** Implementation Agent；人工验收、Independent Review 与 Local Private Release Authority 均为 User
- **产品 Workspace：** `/Users/chenzehao/Projects/DND Terminal`

本记录区分计划、自动执行、浏览器验证和用户人工验收。任何未执行项不得写成通过；自动测试不能替代用户人工验收。

## M1-S1 测试计划

### 阻塞断言

1. `CharacterSheet`、`CombatProjection` 与 `CombatantInstance` 不共享 HP 或资源引用。
2. 从指定角色卡修订生成的投影在长期卡后续变化后保持不变。
3. 战斗资源消费只修改实例并追加事件，不直接改写长期卡或投影。
4. 战后差异默认只是候选；未确认或失败不会创建新角色卡修订。
5. DM 只确认选定字段时创建 `revision N+1`，旧修订保持不变。
6. 撤销资源消费通过补偿事件恢复实例，不删除旧事件。
7. v0.1.0/v0.2.0 旧战斗 JSON 仍能按既有路径读取，不伪造长期卡、投影或回写历史。

### 浏览器流程

```text
手工新建非施法角色
→ 保存 revision 1
→ 生成 CombatProjection
→ 加入现有遭遇 / 战斗
→ 消费一项资源
→ 结束战斗并查看 PostCombatDiff
→ 逐项确认
→ 创建 CharacterSheet revision 2
```

### 当前结果

- 自动测试：Passed
- 浏览器流程：Passed
- 用户人工验收：Passed；User；`2026-08-17`
- M1-S1 Gate：Passed / Human Accepted

## 自动执行记录

- **执行日期：** `2026-08-17`
- **依赖：** 未安装依赖；系统 PATH 无 `node`，使用 Codex Workspace 内置 Node.js runtime。
- **命令：**

```text
<bundled-node> --check src/app.js
<bundled-node> --check src/characters.js
<bundled-node> tests/characters-m1-s1.test.mjs
<bundled-node> tests/encounter-v020.test.mjs
<bundled-node> tests/geometry.test.mjs
```

- **结果：** 语法检查通过；`characters-m1-s1.test.mjs: pass`；`encounter-v020.test.mjs: pass`；`geometry.test.mjs: pass`。
- **覆盖结论：**
  - 四层对象无共享 HP / 资源引用；
  - 投影保留角色修订引用且不随长期卡变化；
  - 资源消费和补偿只作用于实例；
  - 默认拒绝不建修订，选定字段建立 revision 2；
  - 旧 revision 1 保持不变；
  - stale diff 与未知字段在修改前拒绝；
  - v0.2.0 兼容迁移只补空集合，不伪造长期卡、投影或回写记录。

## 真实浏览器执行记录

- **执行日期 / Surface：** `2026-08-17` / Codex in-app browser / `http://localhost:4174/`
- **隔离说明：** 使用与既有 `127.0.0.1` 浏览器数据不同的 `localhost` origin 建立 M1-S1 测试状态，未删除既有本地会话。
- **步骤与观察：**
  1. 手工创建 `M1-S1 武者`：HP `20/20`、AC `16`、功力 `3/3`，保存 revision 1；
  2. 从 revision 1 生成投影并加入当前遭遇；确认遭遇后形成参战实例并进入第 1 轮；
  3. 功力 `3 → 2`，界面与事件数同步变化；
  4. 执行“撤销上一步”，功力 `2 → 3`，原事件保留并新增补偿事件；
  5. 再次消费功力 `3 → 2`；
  6. 结束战斗，系统未立即清场，生成 1 份 `PostCombatDiff`；
  7. 角色页在审核前仍显示 revision 1、功力 `3/3`；候选“功力 `3 → 2`”默认未勾选；
  8. 只勾选该资源字段并确认，形成 revision 2、历史 2 份、功力 `2/3`，并显示 `character.writeback.confirmed` 决定事件 ID；
  9. 页面重载后 revision 2 和决定事件仍在；浏览器控制台无 warning / error。

### “加入现有战斗”补充路径

使用独立的 `http://localhost:4175/` origin 另行验证 ABC 的精确措辞：

1. 先以丧尸建立遭遇并开始第 1 轮；
2. 在已开始战斗中打开角色页，从 revision 1 生成投影；
3. 角色进入“待投入：1 个”批次，投先攻后确认整批投入；
4. 战斗页出现独立 `M1-S1 武者` 参战实例，HP `20/20`、功力 `3/3`，待投入面板消失并追加第 3 个事件；
5. 浏览器控制台无 warning / error。

### 浏览器断言

| 断言 | 结果 |
|---|---|
| 长期卡在战斗消费后、审核前仍为 `3/3` | Passed |
| 资源消费可通过补偿事件恢复，再次消费仍可记录 | Passed |
| 候选字段默认 unchecked | Passed |
| 只接受资源字段后创建 revision 2 | Passed |
| 旧修订保留为历史，不被原地改写 | Passed |
| 审核决定有 CombatEvent identity | Passed |
| 已开始战斗可生成投影并经待入场批次物化 | Passed |
| 浏览器 warning / error | 0 |

## 启动器阻塞缺陷回归

- **问题：** `4174` 已有 DND Terminal 服务时，旧脚本再次启动 Python 会因 `EADDRINUSE` 触发 `set -e`，在执行浏览器 `open` 前退出，表现为“Chrome 打不开”。
- **修复验证：**
  - `/bin/zsh -n start-dnd-terminal.command` 完成语法解析；
  - 实际存在 DND Terminal `4174` 服务时运行启动器，输出“正在复用并打开 Chrome”，退出码 `0`；
  - 启动器使用 `/usr/bin/open -a 'Google Chrome'` 明确打开 Chrome；
  - 未终止既有服务、未切换端口、未删除或迁移 localStorage。

## 人工验收结果

用户于 `2026-08-17` 明确确认：“M1-S1 的 TESTING 中的人工验收部分通过”，因此 M1-S1 Human Gate 通过。

```text
角色 → 保存一张最小角色卡 → 生成投影并加入
→ 战斗中消费资源 → 结束战斗
→ 角色页确认候选默认未勾选
→ 勾选需要写入的字段 → 确认新修订
```

### 非阻塞优化观察 M1-S1-O1

- **观察：** 角色 Tab 的创建按钮显示“保存长期角色卡修订 1”。
- **当前含义：** `1` 表示全新 `CharacterSheet` 的初始修订号 `revision 1`，不是角色等级、角色数量或操作次数。
- **UX 问题：** 创建表单把内部修订术语暴露给用户，且按钮在已有角色卡存在时仍固定显示 `1`，容易被理解成修改现有卡或与角色等级有关。
- **建议文案：** “创建长期角色卡”；如需强调历史机制，可在辅助说明中写“创建后从修订 1 开始”。
- **门禁判断：** 不影响对象隔离、事件、补偿、候选审核或 revision N+1，因此不阻塞 M1-S1 验收。
- **处理状态：** Implemented in M1-S2；主按钮已改为“创建长期角色卡”，辅助说明保留“从修订 1 开始”。

M1-S1 通过时不授权 M1-S2；后续 User 已于 `2026-08-17` 单独授权 M1-S2。该历史结论从未授权 Independent Review、Release 或 Archive。

## M1-S2 测试计划

### 阻塞断言

1. M1-S1 长期卡可安全迁移到 M1-S2 Schema，原 HP、AC、速度、先攻、资源、备注与修订历史不丢失；缺少的新字段保持空或 `unknown / needs-review`。
2. 角色详情页提供战斗概览、检定与熟练、动作与能力、法术、装备、起源与经历、关联单位、导入与修订八个区域；不适用区域可动态隐藏或明确显示不适用。
3. 派生值保留计算输入、计算值、可选手工覆写、有效值与覆写原因；未知规则来源不得冒充已核验自动计算。
4. `AttackProfile` 与普通动作/额外能力分离，并能随 `CombatProjection` 深复制；长期卡后续编辑不污染既有投影。
5. 轻量装备与 `LinkedEntity` 可在长期卡查看和修订；LinkedEntity 不共享角色 HP，也不在 M1-S2 提前物化到战斗。
6. 编辑任何长期字段都会创建 revision N+1，旧修订不变；修订差异可见。
7. 散打武者能够完成“查看/编辑 → 投影 → 加入现有遭遇/战斗 → 消费功力 → 战后确认回写”的既有闭环，且不显示未经准入的武器精通。
8. v0.1.0/v0.2.0 战斗 JSON 与 M1-S1 自动测试继续通过。
9. `M1-S1-O1` 文案完成修复：创建按钮不再把内部“修订 1”当作主操作名称。

### 浏览器流程

```text
创建或打开散打武者长期卡
→ 查看八区详情和派生值依据
→ 编辑攻击、装备、资源与关联单位并创建新修订
→ 查看 revision 差异
→ 生成 CombatProjection 并加入遭遇 / 战斗
→ 消费功力并结束战斗
→ 逐项确认 PostCombatDiff
→ 创建新的 CharacterSheet revision
```

### 当前结果

- 自动测试：Passed
- 浏览器流程：Passed
- 用户人工验收：Passed / User / `2026-08-17`
- M1-S2 Gate：Passed / Human Accepted

M1-S2 已完成自动、浏览器与 User Human Acceptance，当前停止等待 M1-S3 的单独 Implementation 授权；既有授权不包含 M1-S3、Independent Review、Release 或 Archive。

## M1-S2 自动执行记录

- **执行日期：** `2026-08-17`
- **依赖：** 未安装依赖；使用 Codex Workspace 内置 Node.js runtime。
- **命令：**

```text
<bundled-node> --check src/app.js
<bundled-node> --check src/characters.js
<bundled-node> tests/characters-m1-s2.test.mjs
<bundled-node> tests/characters-m1-s1.test.mjs
<bundled-node> tests/encounter-v020.test.mjs
<bundled-node> tests/geometry.test.mjs
```

- **结果：** 两个语法检查通过；`characters-m1-s2.test.mjs: pass`；`characters-m1-s1.test.mjs: pass`；`encounter-v020.test.mjs: pass`；`geometry.test.mjs: pass`。
- **覆盖结论：**
  - M1-S1 角色卡安全迁移为 `0.3.0-m1-s2`，原 HP、资源与备注保留，缺失攻击为空，武器精通为 `unknown`；
  - 派生值覆写必须带理由，手工输入保持 `needs-review`；
  - 攻击、装备、关联关系和武器精通显式状态在长期卡、投影、遭遇成员与参战实例间深复制；
  - 编辑创建 revision 2，旧 revision 1 不变，AC、装备等修订差异可见；
  - 八个区域均在详情组件中声明，M1-S1-O1 的旧主按钮文案已消失；
  - M1-S1 与 v0.2.0 既有闭环、迁移和几何回归全部通过。

## M1-S2 真实浏览器执行记录

- **执行日期 / Surface：** `2026-08-17` / Codex in-app browser / `http://127.0.0.1:4176/`
- **隔离说明：** 使用临时本机端口与独立 origin；未删除或覆盖既有 `4174`、`localhost` 或其他 origin 的 localStorage。
- **步骤与观察：**
  1. 角色 Tab 初始显示“创建长期角色卡”，辅助说明解释创建后从修订 1 开始；旧按钮文案不存在；
  2. 用 M1-S2 手工验证表创建 `15级散打武者` revision 1：HP `112/112`、AC `16`、速度 `55`、功力 `15/15`；
  3. 详情页实际渲染八个区域；法术区对非施法角色动态隐藏，战斗快捷条、四个派生值审计、结构化攻击、独立动作、装备、来源和修订均可见；
  4. 把 AC 改为 `17`、装备数量改为 `2` 并加入 `验证盟友` 长期关系，创建 revision 2；revision 1 保留，差异显示 `AC 16 → 17`、`旅行装备 ×1 → ×2`、`无 → 验证盟友`；
  5. 首轮浏览器检查发现快捷条 AC 为 `17`，审计仍为 `16`；修复审计复用条件并补自动断言后，重载显示 `AC：17 needs-review`；
  6. 从 revision 2 生成 `CombatProjection` 并加入遭遇，确认后进入第 1 轮；战斗 Tab 显示徒手打击快照和疾风连击说明，但明确不自动掷骰或结算；
  7. 参战实例功力 `15 → 14` 后，切回角色页仍显示长期功力 `15/15`；
  8. 结束战斗生成一份候选差异，资源候选默认无 `checked` 属性；勾选确认后建立 revision 3，长期功力变为 `14/15`，revision 2 保留；
  9. 页面重载后 revision 3、资源余额、八区、审计值和人类可读修订差异保持；浏览器 console warning/error 为 `0`。

### 浏览器断言

| 断言 | 结果 |
|---|---|
| 八个详情区域均存在；非施法法术区动态隐藏 | Passed |
| 战斗快捷条与派生值审计一致 | Passed（首次发现缺陷后修复并回归） |
| 武器精通显示 `unknown`，无自动 Grant/Selection | Passed |
| revision 1/2/3 均保留，修订差异可读 | Passed |
| AttackProfile 与动作随 revision 2 投影到战斗 Tab | Passed |
| LinkedEntity 只保存长期关系，不提供战斗物化入口 | Passed |
| 战斗实例功力 `14/15` 时长期卡审核前仍为 `15/15` | Passed |
| 候选默认未勾选；确认后 revision 3 为 `14/15` | Passed |
| 刷新恢复当前修订与详情 | Passed |
| 浏览器 warning / error | 0 |

## M1-S2 人工验收结果

用户于 `2026-08-17` 完成 M1-S2 人工检查，并确认徒手打击卡片中已填写的敏捷、熟练与 5 尺信息可以理解；攻击加值和伤害缺少准入依据时保持 `unknown / needs-review` 属于正常安全边界。随后用户明确“同意优化项下版本更新”，因此 M1-S2 User Human Gate 记为 Passed。

### 非阻塞优化观察 M1-S2-O1

- **观察：** 徒手打击卡片当前显示“攻击 unknown · 待 DM 填写 unknown”，数据状态正确，但重复 `unknown` 不够自然。
- **建议文案：** “攻击加值：待填写 · 伤害：待填写”，继续保留 `needs-review` / `dm-authored` 的审计状态。
- **门禁判断：** 不影响字段真实性、角色卡修订、投影隔离或战斗回写，因此不阻塞 M1-S2 验收。
- **处理状态：** Deferred；留待下一获授权实施切片处理，预期为 M1-S3；当前未修改产品代码，且该记录不授权 M1-S3。

`M1-S2` Human Accepted 不授权 `M1-S3`，也不授权 `REVIEW.md`、Independent Review、Release、Archive、部署或公开发布。

## M1-S3 测试计划与执行记录

### 阻塞断言

1. 仅 `beiling-dnd55e-character-sheet@1.0.15` 的冻结结构能生成 `CharacterDraft`；Profile 不匹配、损坏、加密、宏或外部关系输入安全拒绝。
2. 读取原始 Excel 不执行/重算公式，不执行宏、脚本、外链或嵌入代码；公式缓存必须显示位置与警告。
3. 莉亚输入生成的 Draft 展示固定单元格映射、缺失、默认值、冲突和未映射范围；不把完整工作簿或资料表写入角色卡。
4. 确认前没有 `CharacterSheet` 写入；武器精通补充和施法来源冲突处理必须由 DM 明确输入。
5. 首次确认创建 revision 1；同 SHA-256 重导入只显示候选差异并经确认才允许 revision N+1；错误输入不得改变既有角色卡。
6. M1-S1/M1-S2、v0.2.0 会话兼容和几何回归继续通过。

### 自动执行

- **执行日期：** `2026-08-17`
- **依赖：** 未安装依赖；使用 Codex Workspace 内置 Node.js runtime。
- **命令：**

```text
<bundled-node> --check src/character-import.js
<bundled-node> --check src/characters.js
<bundled-node> --check src/app.js
<bundled-node> tests/character-import-m1-s3.test.mjs
<bundled-node> tests/characters-m1-s2.test.mjs
<bundled-node> tests/characters-m1-s1.test.mjs
<bundled-node> tests/encounter-v020.test.mjs
<bundled-node> tests/geometry.test.mjs
```

- **结果：** 全部通过；五个测试脚本均输出 `pass`。
- **覆盖结论：** 固定 Profile 生成 `needs-confirmation` Draft；豁免/技能的未熟练、熟练、专精三级映射正确；特性、武器、装备和背包容器进入长期卡；固有精通词条不冒充当前选择；高等精灵施法歧义与精通选择保留 `needs-review`；原始“同调”标识不被误判；公式缓存有警告；导入来源回执持久化；错误 Profile 被拒绝；Schema 加法迁移和既有闭环未回归。

### 真实浏览器执行

- **执行日期 / Surface：** `2026-08-17` / Codex in-app browser / 临时本机 `localhost:4181` origin。
- **隔离说明：** 验证使用临时本机端口与独立 localStorage，不删除或覆盖既有产品 origin 的会话。原始 Excel 仅作为浏览器本地文件选择输入，未复制、修改或执行。
- **步骤与观察：**
  1. 选择原始莉亚工作簿，Profile 成功生成内存 Draft，文件 SHA-256 与冻结验证向量一致；页面显示 233 个字段回执，摘要为豁免 6 项、技能 18 项、特性 19 项、武器 4 条、装备/物品 15 件、实际容器 2 个；
  2. 页面显示公式缓存位置、武器精通待补充、高等精灵施法来源冲突，以及法术区、背包财务账本和内部资料表等受限未映射范围；未执行规则文本或自动选择施法属性；
  3. 首次真实文件验证因读取允许表遗漏 `主要!C15:C18` 而安全拒绝为“熟练项名称不能为空”，没有产生半张角色卡；修正允许单元格后补充回归通过；
  4. DM 从候选 `匕首、短弓、短剑` 中选择 `匕首、短弓`，并填写“保留原始来源；M1-S4 前不生成施法 Profile”后确认，创建 `莉亚` 长期 CharacterSheet revision 1；
  5. 角色页显示 `运动：4 · 专精`、`敏捷豁免：6 · 熟练`、当前精通选择与“最多 2 种/完成长休可重选”提示；职业/种族/专长卡片和 `箭矢 ×20` 背包物品可见；武器固有精通词条没有自动产生 S5 战斗效果；
  6. 再次选择同一 SHA 输入，系统显示现有 revision 1 与候选新修订差异，并只提供“确认并创建新修订”；该轮未确认写入；
  7. 选择刻意构造的非 ZIP `.xlsx`，显示“不是可识别的 ZIP/XLSX 文件”，莉亚 revision 1 仍存在；
  8. 已确认 M1-S2-O1 文案在角色卡与战斗快照显示“攻击加值：待填写 · 伤害：待填写”。

| 浏览器断言 | 结果 |
|---|---|
| 原始样本只读生成 Draft，确认前无长期卡 | Passed |
| 映射、缺失、默认、冲突、公式缓存警告和未映射范围可见 | Passed |
| DM 补充缺失精通、暂行处理施法冲突后才可确认 | Passed |
| X/O/🅞 对应未熟练/熟练/专精，豁免和技能结果可见 | Passed |
| 特性、主要装备与背包物品进入长期卡，财务账本不导入 | Passed |
| 固有精通词条、待复核资格与 DM 当前选择保持分离 | Passed |
| 首次确认创建 revision 1，来源回执与 SHA 可追溯 | Passed |
| 同源重导入只显示更新预览，不静默覆盖 | Passed |
| 损坏/未知输入安全拒绝且不改变已创建角色 | Passed |
| 浏览器 console warning / error | 0 |

### M1-S3 角色详情 UI 验收整改验证

- **执行日期 / Surface：** `2026-08-18` / Codex in-app browser / 临时本机 `127.0.0.1:4183` origin。
- **自动检查：** 使用 Workspace 内置 Node.js runtime 通过 `--check` 检查 `src/app.js`、`src/characters.js`、`src/character-import.js`；`character-ui-m1-s3`、`character-import-m1-s3`、`characters-m1-s2`、`characters-m1-s1`、`encounter-v020`、`geometry` 六个测试脚本均 `pass`。
- **浏览器观察：** 创建隔离的手工 `UI 验证角色` revision 1 后，战斗概览、检定与熟练、动作与能力、装备、起源与经历、关联单位、导入与修订七个适用页签逐一切换成功；战斗概览实际显示结构化攻击，浏览器 console 为 `0` warning / `0` error。非施法卡不显示法术页签，符合动态隐藏规则。
- **Excel 回归说明：** 本轮浏览器自动化的本地 `fileChooser.setFiles()` 被浏览器连接器拒绝（`Not allowed`），因此没有把“本轮 UI 重构后原始 Excel 的真实文件选择”写成通过。该限制没有修改产品、原始 Excel 或既有本地角色库；原始莉亚 Excel 的导入闭环仍以上一节 `2026-08-17` 真实浏览器记录和本轮导入自动测试为证。最终 User Human Acceptance 应以产品页面亲自重新选择原始文件为准。

### M1-S3 武器精通资格泛化缺陷修复验证

- **授权 / 日期：** User 明确“授权修复” / `2026-08-18`；仅修复当前 M1-S3 的跨角色错误精通资格提示，不进入 M1-S4 或 M1-S5。
- **缺陷证据：** 已保存的“拉拉维娜”吟游诗人 revision 1 显示了“最多 2 种、完成长休可重选”的武器精通选择请求；其受控 Excel 的可见职业特性并没有 `武器精通`，因此该提示属于产品推断错误，不能当作输入缺失。
- **自动检查：** Workspace 内置 Node.js runtime 通过 `--check src/character-import.js`、`--check src/app.js`；`character-import-m1-s3`、`character-ui-m1-s3`、`characters-m1-s2`、`characters-m1-s1`、`encounter-v020`、`geometry` 均输出 `pass`。
- **断言：** 莉亚夹具保留明确职业特性，仍生成唯一 `imported-weapon-mastery` Grant 与待 DM 确认缺失项；拉拉维娜等无该特性的夹具生成 `not-applicable`、零 Grant、零 Selection、零选择缺失，并在写入 `CharacterSheet` 后保持该状态。详情页只在有 Grant 时展示选择提示；武器有固有词条但无角色资格时也不要求 DM 选择或触发效果。
- **浏览器范围限制：** 修复后不静默迁移或改写已保存的拉拉维娜 revision 1；本次浏览器连接没有可复用的用户 Chrome tab，且为避免未经确认创建 revision N+1，未代替用户重新选择或确认其 Excel。该真实本地重导入仍留作本 Slice 的人工验收。

### M1-S3 人工验收门禁

- **状态：** Passed / User / `2026-08-18`。
- **请检查：** 在角色 Tab 选择原始莉亚 Excel 后，确认预览摘要与角色详情中的熟练/专精、特性、武器/装备、背包物品和武器精通选择符合原表；再选择拉拉维娜 Excel，确认预览不再要求填写武器精通补充，且只查看预览不会写入角色库。若决定创建新修订，确认新修订详情不显示精通选择提示；旧 revision 1 仍保持历史原样。在详情页逐一切换页签，确认攻击不会把条件特性合并进伤害，特性仅展示而不自动触发；确认固有精通词条没有被当成当前选择或自动战斗效果；同一文件再次导入只出现更新预览；非正常文件被拒绝且现有角色不变。
- **验收结论：** 用户于 `2026-08-18` 明确确认“M1-S3 人工验收通过”。本轮同时复核拉拉维娜重导入后不再出现伪武器精通提示；此前写入的错误历史修订保持可追溯，不静默覆盖。
- **通过后影响：** `M1-S3` 记为 `Complete / Human Accepted`。不自动授权 `M1-S4`、`M1-S5`、Independent Review、Release、Archive、部署或公开发布。

## M1-S4 测试计划与执行记录

### 阻塞断言

1. 一个长期角色可同时保存多个 `classes[]`、施法 Profile、资源池和同名法术的多个 CastingOption；缺失和冲突必须保留 `unknown / needs-review`。
2. 塑能师、法师/牧师与莉亚三类夹具都能显示真实来源结构；多职业拥有资源池不自动获得高环法术。
3. Profile、资源池和法术从长期卡到投影、遭遇成员和实例均深复制；实例消费不直接改写长期卡或投影。
4. 实例法术资源变化追加事件并可补偿撤销；战后只生成默认未确认的 `spell-resource` 差异，DM 接受后才创建 revision N+1。
5. 既有 M1-S1/M1-S3、v0.2.0 会话和几何测试继续通过。

### 自动执行

- **执行日期：** `2026-08-18`
- **依赖：** 未安装依赖；使用 Codex Workspace 内置 Node.js runtime。
- **命令：**

```text
<bundled-node> --check src/app.js
<bundled-node> tests/spellcasting-m1-s4.test.mjs
<bundled-node> tests/spellcasting-ui-m1-s4.test.mjs
<bundled-node> tests/character-import-m1-s3.test.mjs
<bundled-node> tests/character-ui-m1-s3.test.mjs
<bundled-node> tests/characters-m1-s2.test.mjs
<bundled-node> tests/characters-m1-s1.test.mjs
<bundled-node> tests/encounter-v020.test.mjs
<bundled-node> tests/geometry.test.mjs
```

- **结果：** 全部通过。`spellcasting-m1-s4` 覆盖 Schema 迁移、三夹具、非法 Profile 引用拒绝、投影/实例隔离、实例消费、战后候选差异和 DM 接受写回；其余 7 个回归脚本均输出 `pass`。

### Chrome 本地浏览器验证

- **执行日期 / Surface：** `2026-08-18` / User 指定 Chrome / 临时只读本机 `127.0.0.1:4184`。
- **隔离说明：** 服务仅为读取 Workspace 静态文件而临时启动；浏览器页面使用该临时 origin 的隔离 localStorage。未读取、上传、修改或执行原始 Excel；验证后将关闭临时服务与代理创建的标签页。
- **观察：**
  1. 角色 Tab 出现 M1-S4 本地验证角色入口；创建塑能师夹具后，法术页显示法师（塑能师）Profile、`spellbook / prepared`、1/3/5 环资源余额、油腻术/火球术/寒冰锥，攻击调整值与 DC 仍为 `unknown`。
  2. 创建法师/牧师夹具后，两个 Profile 分别保留 intelligence/wisdom；共享资源池标为 `needs-review`，页面没有虚构 9 环法术或自动取得权限。
  3. 创建莉亚夹具后，种族和背景/专长来源、两份免费次数以及同名占位法术的“2 种施放方式”均可见，所有未确认输入保持 `needs-review`。
  4. 页面页脚为 `M1-S4 候选`，Chrome 语义快照未出现渲染错误。

### M1-S4 人工验收门禁

- **状态：** Passed / User / `2026-08-18`。
- **请检查：** 在角色 Tab 依次创建“塑能师夹具”“法师/牧师夹具”“莉亚来源夹具”。确认：塑能师的准备数 19 仍标为待核验且攻击/DC 不被虚构；法师/牧师的两个来源/属性没有串成一个 Profile，且没有因资源池显示而得到高环法术；莉亚的两份免费次数和同名法术的 2 种施放方式分别可见。随后把其中任一角色“生成投影并加入”进入一场遭遇，开始战斗后在当前角色的法术资源面板消耗一格资源；确认长期角色页在战后审核前仍是原余额、候选差异默认不写入，只有 DM 勾选接受才会创建下一修订。最后确认撤销能恢复实例余额。
- **通过条件：** 上述来源隔离、资源隔离、候选写回和撤销都清楚可用；任一资源串池、战斗直接改写长期卡、自动补高环法术或未确认字段变为确定值即为 Block。
- **验收结论：** 用户明确“人工验收通过”。来源隔离、资源隔离、候选写回和撤销均通过；英文 `intelligence`、`wisdom` 等展示标签不影响本次验收。
- **通过后影响：** `M1-S4` 记为 `Complete / Human Accepted`；仍不自动授权 `M1-S5`、Independent Review、Release、Archive、部署或公开发布。

### 非阻塞优化观察 M1-S4-O1

- **观察：** 法术页把内部稳定属性枚举 `intelligence`、`wisdom` 等直接展示为英文。
- **影响：** 不影响施法来源、资源池、投影隔离、事件、候选差异或本 Slice 的人工验收。
- **处理边界：** 下一获授权实施应将这些显示标签本地化为简体中文，例如“智力”“感知”；底层稳定 ID、已存角色数据、Rules Baseline 引用和 `unknown / needs-review` 语义不得改变。
- **授权状态：** 已登记为 `BL-025`，不构成 M1-S5 或任何产品代码修改授权。

## M1-S5 自动与浏览器验证记录

### 自动执行

- **执行日期：** `2026-08-21`
- **命令：** `node --check src/app.js`、`node --check src/session-persistence.js`、`node --check src/characters.js`、`node --check src/character-import.js`，以及 `for f in tests/*.test.mjs; do node "$f"; done`。
- **结果：** 10 个测试脚本全部 `pass`：既有 M1-S1 至 M1-S4、会话、几何回归，加上 `m1-s5-contract.test.mjs` 与 `persistence-m1-s5.test.mjs`。
- **M1-S5 合同覆盖：** Vex 的显式 stable ID 与选择、库存余额投影隔离、库存候选差异、更正必须带原因、长期卡 revision 不可变、关联单位投影的三重引用与 Rules Baseline 本地锚点。

### Chrome 投影战斗结束缺陷回归

- **现场证据：** User 的 Chrome `127.0.0.1:4174/#region-origin` 在含角色投影的第 1 轮、9 个事件会话中报告 `QuotaExceededError`；抛出点是向 `dnd-terminal.v0.3.0-m1-s5.session.current` 写入时。旧 `persist()` 在异常后不再执行 `render()`，因此结束战斗看似卡死。
- **自动回归：** `node --check src/app.js` 通过；`persistence-m1-s5.test.mjs` 断言持久化只保存事件历史、删除内存撤销检查点、配额异常可返回并显示可见错误，以及页内结束确认的请求/确认链路存在；全套 10 个测试脚本通过。
- **隔离状态：** 为避免覆盖 User 当前 Chrome 会话，本记录不把现场页刷新后的用户流程写为已通过。修复随 `src/app.js?v=20260821-3` 在刷新后加载；User Human Acceptance 仍须自行确认投影战斗可以结束。

### 关联单位 UnitTemplate ID 缺陷回归

- **缺陷与修复：** 早期提示示例 `scout` 不是运行时单位库 ID，造成绑定后物化被拒绝。运行时可用的旧验证斥候 ID 为 `preset-scout`；单位库显示实际 ID，关联单位错误信息回显无效 ID，既有角色不会被静默迁移。
- **自动回归：** `m1-s5-contract.test.mjs` 以运行时 `legacyNpcPresets` 中的 `preset-scout` 创建关联单位投影，确认 `LinkedEntity.templateRef` 与物化的 `unitTemplateRef` 相同；全套 10 个测试脚本通过。

### 多角色投影容量缺陷回归

- **现场证据：** User 的新会话显示 5 个角色投影而事件数为 0；关联单位物化只是触发下一次保存。调查确认每个投影的完整 `sheetSnapshot` 被保存一次，随后又作为 `combatProjectionSnapshot` 分别嵌入遭遇成员和参战实例，导致无事件时也会超出 Chrome 配额。
- **自动回归：** `persistence-m1-s5.test.mjs` 构造各 30 KB 的角色投影、遭遇成员、参战实例和事件检查点，断言持久化副本去除三类重复审计快照，保留 HP 与事件历史，并不改动内存中的原始快照；全套 10 个测试脚本通过。
- **刷新语义：** 当前入口版本为 `src/app.js?v=20260821-7`。刷新后，当前页面的重复审计快照不会恢复；战斗所需字段与战后逐项差异基线保留。User 需在刷新前自行导出当前页面状态，才可保留尚未保存的本页内容。

### Chrome 缓存与容量诊断复查

- **现场证据：** Chrome 页面实际加载 `app.js?v=20260821-4`，当前仅有莉亚与小羽两个第 0 回合成员、0 个事件，仍显示由会话 `persist()` 产生的配额错误。因此此前“5 个投影”已不是当前现场条件。
- **修复：** `app.js` 对 `session-persistence.js` 的导入加入同版本查询参数，入口同步升级到 `v=20260821-5`；配额异常文案加入压缩会话 KB 数。若仍失败，可据此判断是压缩会话仍过大，还是同源角色库/模板库已占据绝大部分配额。
- **自动回归：** 语法检查和全套 10 个测试脚本通过；`persistence-m1-s5.test.mjs` 新增缓存版本与容量诊断文案断言。

### 保存错误阶段分类复查

- **现场证据：** `v=20260821-5` 的提示没有“本次压缩会话约 X KB”，因此 `serialized` 仍为空，异常发生在会话压缩或 JSON 序列化阶段，而不是已确认的浏览器写入配额异常。
- **修复与结果：** `persist()` 分别标记“压缩会话 / 序列化会话 / 写入浏览器存储”；只有写入阶段且异常名为 `QuotaExceededError` 才报告空间不足。其他异常显示真实阶段、名称和消息。入口为 `v=20260821-6`；语法检查和全套 10 个测试通过。

### 关联单位 DataCloneError 回归

- **现场证据：** `v=20260821-6` 报告 `压缩会话 / DataCloneError`，不可克隆值是 `uid` 函数。代码核对确认只有关联单位路径调用了 `createEncounterMember(template, uid, position)`；其他路径均传入字符串 ID。
- **修复与结果：** 关联单位路径改为 `createEncounterMember(template, uid(), position)`。`m1-s5-contract.test.mjs` 断言物化成员 ID 为字符串，且包含 `LinkedEntityProjection` 的遭遇片段可被 `structuredClone`；静态回归同时禁止原错误调用。入口为 `v=20260821-7`；语法检查和全套 10 个测试通过。

### 真实浏览器冒烟验证

- **执行日期 / Surface：** `2026-08-21` / Codex in-app browser / 临时本机 `127.0.0.1:4173`。
- **观察：** `index.html` 标题为 `DND Terminal v0.3.0 M1-S5 — Combat Integration Candidate`；战斗页和角色页正常渲染，页脚为 `M1-S5 候选`，浏览器 console error 为 `0`。空会话没有长期角色，因而不显示受条件约束的关联单位物化面板，属于预期而非通过冒充。
- **未作通过声明：** 本轮没有可访问的原始莉亚 `.xlsx`，因此未执行该冻结 SHA 的真实文件选择/精通端到端流程；该项留给 User Human Acceptance。

### 待人工验收的最小检查

1. 用冻结莉亚 Excel 创建/重导入一个新修订，DM 明确选择 `短弓`；投影进入战斗后，记录“命中并造成伤害”，确认仅生成侵扰候选；应用后在来源下一回合结束自动到期，撤销显示补偿事件。
2. 消耗一份箭矢或消耗品、确认一次带结构化支付选项的施法，然后结束战斗；在角色页分别拒绝、接受和更正候选，确认只有接受/更正产生新修订且更正有理由。
3. 在单位库复制一个未归档的实际 `UnitTemplate ID`（例如 `preset-scout`），为关联单位写入该值，先投影其主人、再于第 0 回合物化；确认它有独立 HP/行动轮、映射写入 `encounter.confirmed`，且重复物化被拒绝。

本记录不构成 User Human Acceptance，也不构成 Independent Review、Release 或 Archive。

## M1-S5 Amendment 2 稳定化验证记录

### 自动测试

- **执行日期：** `2026-08-21`
- **命令：** `node --check src/app.js`、`node --check src/characters.js`，以及 `for f in tests/*.test.mjs; do node "$f"; done`
- **结果：** 12 个测试脚本全部 `pass`。
- **新增覆盖：** `tests/m1-s5-stabilization-ui.test.mjs` 验证字段级错误态、图形化关联单位编辑、本场模板选择、用户文案、归档/删除守卫与精通状态显示；`tests/character-lifecycle-m1-s5.test.mjs` 验证旧记录迁移、归档、恢复、永久删除前置条件和引用保护。
- **既有回归：** M1-S1 至 M1-S4、M1-S5 合同、持久化、导入、几何与遭遇测试全部通过。

### Chrome 本地浏览器冒烟

- **执行日期 / Surface：** `2026-08-21` / User Chrome / 临时本机 `http://127.0.0.1:4185/`。
- **隔离说明：** 使用临时 origin 的独立 localStorage；创建的验证角色、关联单位和遭遇成员未写入用户原有 `4174` origin；未读取、上传或修改原始 Excel。
- **观察：**
  1. 角色手工表的关联单位区域显示图形化名称、类型、关系、备注、UnitTemplate 下拉框和新增/移除按钮；选择 `preset-scout` 后成功保存关联单位。
  2. 角色详情的“关联单位”页签显示本场 UnitTemplate 选择器；主人生成投影后，“生成棋子并加入遭遇”启用，点击后显示独立棋子成功加入第 0 回合；重复加入按钮变为“已加入本次遭遇”并禁用。
  3. 归档角色后活动列表隐藏该角色，详情显示“恢复角色”和“永久删除”；归档角色的编辑和新投影入口禁用。
  4. 浏览器控制台错误/警告为 `0`。
- **未覆盖项：** 本次冒烟未重新构造完整莉亚 Excel 精通攻击链，也未把战后差异流程写成 User Human Acceptance；两者仍需用户在当前产品 origin 亲自验收。

### Amendment 2 人工门禁

- **状态：** `Required / User`
- **验收范围：**
  1. 将任一战后条目选为“更正后写入”，留空更正值或原因，确认对应框体红色、提示可读且提交被阻止；补全后可正常写回。
  2. 新建/编辑关联单位时只使用图形化设置；选择本场模板加入后，确认主人与关联棋子 HP、行动轮独立，重复加入被拒绝。
  3. 在已有角色上验证归档、恢复和永久删除确认；带当前投影或待审核差异时永久删除必须被阻止。
  4. 用莉亚 Vex 流程确认武器精通候选、应用效果、来源/到期/目标展示及“不自动掷骰/结算优势”提示。
- **当时结论：** 自动与浏览器验证通过，等待 User 对上述四项完成明确人工确认。后续 User 已于 `2026-08-24` 明确确认通过，并授权 Independent Review；见“Amendment 2 用户人工验收与 Review 启动”。

### Amendment 2 用户复测缺陷回归（第二轮）

- **执行日期：** `2026-08-21`
- **自动结果：** `node --check src/app.js`、`node --check src/characters.js` 与 12 个 `tests/*.test.mjs` 全部通过。领域测试新增 `PostCombatDiff pending → abandoned`、副本隔离和重复废除拒绝；UI 回归新增归档引用阻断、过期候选提示、废除按钮/事件及来源/目标双视角精通显示断言。
- **Chrome Surface：** User Chrome / 隔离 origin `http://127.0.0.1:4186/`；未触碰 User 的 `4174` 会话或业务数据。
- **已观察通过：** 同一长期角色 revision 1 生成两个战斗投影后，角色页“归档角色”按钮禁用；两实例分别形成 HP 与资源候选。第一份接受并建立 revision 2 后，第二份显示“基于修订 1，长期角色已更新为修订 2”的过期警告，“确认本份审核”禁用，只保留一项“废除本份战斗候选差异”。
- **部分浏览器证据：** 点击废除按钮成功出现不可逆确认对话框；确认后的最终 DOM/console 复读被 Chrome 控制连接超时中断，因此不把最终视觉状态冒充为浏览器通过。领域自动测试已确认 `abandoned` 终态、条目状态和原候选不被原地改写；最终按钮闭环仍列入 User 人工门禁。
- **精通显示位置：** 实现已把独立“武器精通”区放入战斗 Tab → 当前选中者状态 → 状态、Buff 与专注之后，并同时查询当前单位作为来源或目标的效果。本轮隔离数据没有冻结莉亚 Excel，未伪造完整 Vex 浏览器链。
- **更新后的人工门禁：** User 需确认三点：① Vex 生效后在当前选中者状态下可从来源和目标两侧看到独立“武器精通”区；② 当前战斗投影或待审核候选存在时不能归档，历史异常归档卡可恢复或废除候选；③ 重复投影的首份候选写回后，另一份可废除，状态变为“已废除，不写入”，并允许完成战后清理。

### Amendment 2 武器精通可读性与长休配置回归（第三轮）

- **执行日期：** `2026-08-24`
- **自动结果：** `node --check src/app.js`、`node --check src/characters.js` 与 12 个 `tests/*.test.mjs` 全部通过。
- **领域新增覆盖：** `tests/m1-s5-contract.test.mjs` 验证 Nick/Vex 冻结展示目录、Vex 优势收益文本、熟练武器候选、长休选择 revision N+1、`masteryPropertyId` 写入、攻击启用状态同步、旧修订不变，以及空选择/空说明拒绝。
- **UI 新增覆盖：** `tests/m1-s5-stabilization-ui.test.mjs` 验证当前长休配置在触发前常驻、效果文本被渲染、图形化重选表单、领域修订入口和投影/候选引用守卫；`tests/character-ui-m1-s3.test.mjs` 继续锁定只有 `phb2024:vex` 进入候选自动化。
- **兼容结果：** M1-S1 至 M1-S4、导入、角色生命周期、遭遇、几何、持久化和 M1-S5 战后合同均回归通过。Rules Baseline、规则来源、原始 Excel 与既有 localStorage 键未修改。
- **本轮浏览器证据：** 未执行；不得把静态 UI 合同测试表述为 Chrome 人工通过。
- **待 User 人工确认（当时）：** ① 在角色“动作与能力”页，当前选择立即显示武器、词条和完整效果；② 长休重新选择后建立 revision N+1，再生成战斗投影时，战斗 Tab 在任何攻击触发前就显示该配置；③ Vex 应用后在同一区域继续显示效果含义、来源、目标和到期；④ 当前投影或待审核战后候选存在时，长休重选按钮禁用且命令不能绕过。
- **门禁（当时）：** 本轮技术实施完成，等待 User Human Acceptance。后续 User 已于 `2026-08-24` 完成人工通过、批准 Independent Review 并授权 Local Private Release；该历史路径不自动传递到 Archive、部署或公开发布。

### Amendment 2 用户人工验收与 Review 启动

- **人工验收：** User 于 `2026-08-24` 明确确认本轮人工检查通过；`M1-S5-STAB-1` 与 `M1-S5-STAB-2` 状态更新为 `Complete / Human Accepted`。
- **Review 授权：** User 于同日明确授权执行 `M1` Independent Review。

## v0.3.0 Local Private Release 复核

- **执行日期：** `2026-08-24`
- **门禁事实：** Independent Review 已完成并获 User 批准；User 同日明确授权 Local Private Release。
- **复跑：** `node --check src/app.js`、`src/characters.js`、`src/character-import.js`、`src/session-persistence.js` 均通过；12 个 `tests/*.test.mjs` 均通过。
- **包完整性：** `releases/v0.3.0/dnd-terminal-v0.3.0-local-private.zip` 已通过 `unzip -t`（21 / 21）；`checksums.sha256` 对包内全部 21 个源文件/测试文件复核通过。
- **边界：** 此记录不代表新的浏览器人工验收，不代表 Archive、部署、公开发布或规则/再分发授权；正式发布身份见 `RELEASE_NOTES.md`。
- **边界：** 该授权仅允许创建和完成 `REVIEW.md`；不授权 Release、Archive、部署或公开发布。
