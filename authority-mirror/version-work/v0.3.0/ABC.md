# ABC：v0.3.0 长期角色卡、受控导入与战斗投影

- **交付 ID：** `v0.3.0`
- **内部里程碑：** `M1`（对应产品交付 `v0.3.0`）
- **状态：** 已批准并冻结总体合同（`Approved / Frozen for Slice Authorization`）
- **草案日期：** `2026-08-14`
- **草案修订日期：** `2026-08-14`（恢复前序产品决定，并登记 `M1 ↔ v0.3.0` 的 ESG Milestone Profile 采纳与 Slice 门禁）
- **批准日期：** `2026-08-17`
- **批准权：** User
- **批准范围：** 本文 A/B/C、D3-001 至 D3-012、验收条件、`M1-S1` 至 `M1-S5` 登记与授权语义
- **实施授权：** `M1-S1` 至 `M1-S4` 已完成并通过 User Human Acceptance；`M1-S5 Amendment 1` 已完成人工门禁；`M1-S5 Amendment 2` 已获用户批准并授权实施
- **当前阶段：** `v0.3.0 Archive In Progress`；已选择 Lightweight Archive Profile，等待 Archive Gate 最终结论
- **前序版本：** `v0.2.0 Released — Local Private`；尚未 Archive，不修改其发布包或冻结身份
- **文档 Authority：** `/Users/chenzehao/Vaults/obsidian/obisidian/理工学习相关/DND Terminal`
- **产品 Workspace：** `/Users/chenzehao/Projects/DND Terminal`
- **规则数据来源区：** `/Users/chenzehao/Antigravity Source/lorebuddy-规则书/NotebookLM_Version`（只读、仅限本地私有证据）

本文已由用户于 `2026-08-17` 批准为 `M1 ↔ v0.3.0` 的冻结总体合同。用户随后同意并授权 `M1-S1` 至 `M1-S4`，各 Slice 已通过 User Human Acceptance。用户于 `2026-08-21` 批准 `M1-S5 Amendment 1` 并授权实施；随后明确确认 M1-S5 人工测试门禁全部通过。用户于同日批准 `M1-S5 Amendment 2` 并授权在 `v0.3.0` 内直接实施 `M1-S5-STAB-1` 与 `M1-S5-STAB-2`；用户于 `2026-08-24` 明确确认稳定化人工检查通过、批准 M1 Independent Review，并授权本地私有 Release。用户随后于同日明确授权执行 Archive，并选择本合同第 15 节记录的本地私有 Lightweight Archive。该 Archive 不传递到部署、公开发布或再分发。

本合同恢复 `DT v0.2.0` Work 最近相关讨论中已经形成、但初次交接时被压缩的产品决定：指定 Excel Profile 已完成只读结构分析；长期角色页必须是跑团操作面板而非资料浏览器；武器精通必须进入 DM 本地战斗流程；复杂施法与多职业在本版建立可验证骨架。上述内容现已作为总体范围获得批准，但仍不构成任何 Slice 的实施授权。

## 1. ESG Profile 适用性审计与里程碑身份

### 1.1 适用性结论

`v0.1.0` 启动时，DND Terminal 没有 Milestone 管理多个 Slice、跨 Slice Exit Gate 或里程碑/产品版本双轴事实，因此当时对 Milestone Documentation Profile 的 `Not Applicable` 判定保持历史真实，不追溯改写。

本交付已经出现新的可验证事实：一个内部里程碑管理五个可独立授权和执行、但共同决定 `v0.3.0` 退出门禁的 Slice；每个 Slice 都有人工验收与强制停止点；Slice 完成、里程碑完成、产品 Release 和 Archive 必须分别判断。因此 Milestone Documentation Profile 的适用性已经触发。

用户于 `2026-08-14` 明确选择：对外产品版本保持 `v0.3.0`，内部治理采用首个正式里程碑 `M1`，切片为 `M1-S1` 至 `M1-S5`。当前适用性审计结论为 `Core + Required Profiles`。用户随后于 `2026-08-17` 批准本 ABC；这仍不授予任何产品 Implementation 权限。

### 1.2 采纳记录

| 字段 | 记录 |
|---|---|
| Adopted Artifact | Downstream Documentation Schema Core + Milestone Documentation Profile |
| Version / Profile | `schema-v0.3.0` / `schema-v0.3.0 Milestone Documentation Profile` |
| Compatible With | `schema-v0.2.0 Minimal Governance Framework`；不改变 v0.1.0/v0.2.0 冻结事实 |
| Repository / Distribution Identity | Engineering Schema Governance 正式 Obsidian Authority；Git Commit `8ff6fc1d387557fa2b79591ce12955e9f003da72` |
| Project-Relative Artifact Paths | `documentation-schema/schema-v0.3.0/DOCUMENTATION_SCHEMA.md`；`documentation-schema/schema-v0.3.0/MILESTONE_DOCUMENTATION_PROFILE.md` |
| SHA-256 | Core `4a95a932eba5e549fa96449c178ce18ecc049513a3697b041b08dbd8736f4f4d`；Profile `48311b2f51600e25df249162414478f96963d194e4c59d2b663355ae4e39b22a` |
| Scope | 仅管辖 `M1 ↔ v0.3.0` 的 Slice 登记、逐项授权、实施/测试记录、人工验收、跨 Slice 汇总和退出状态；不改变产品 A/B/C 或领域规则 Authority |
| Selection Date / Authority | `2026-08-14` / User |
| Applicability Audit Verdict | `Core + Required Profiles` |
| Next Review Point | 每个 Slice 人工验收、Independent Review、Release/Archive 准备 |

### 1.3 双轴身份与等价路径

```text
Product Version v0.3.0
└── Milestone M1
    ├── M1-S1
    ├── M1-S2
    ├── M1-S3
    ├── M1-S4
    └── M1-S5
```

- `v0.3.0` 是产品兼容、Release Notes、发布和归档身份；`M1` 是内部开发与退出门禁身份，二者不得互相推导。
- 本项目将现有 `version-work/v0.3.0/` 固定为 Profile 所允许的等价里程碑路径，不另建 `milestone-work/M1/`。
- Slice 默认登记在本 ABC、单一 `IMPLEMENTATION.md`、单一 `TESTING.md` 和单一 `REVIEW.md` 中；不为每个 Slice 自动创建独立文件。
- `TESTING.md` 仅在 `M1-S1` 另获实施授权后激活，用于累计自动验证与人工验收结果；当前等待 Slice 授权阶段不得创建。

### 1.4 当前激活基线

`M1` 以当前 `docs/ARCHITECTURE.md` 的 v0.2.0 已实施事实作为兼容起点，以 `docs/extensions/project-authority.md`、`product-requirements.md` 和 `rules-baseline.md` 作为项目、产品与规则 Authority，并仅激活本 ABC 明确列入 A 和 `M1-S1` 至 `M1-S5` 的新增能力。Roadmap、Backlog、未实施的长期产品方向和未准入规则 Entry 不成为当前 Slice 的实施门禁或自动化依据。

## 2. 目标

让 DND Terminal 从“少量预置角色进入战斗”扩展为可长期保存、预览并修订角色卡的本地工具：DM 或玩家可以导入受支持的角色卡，检查字段映射、缺失项、默认值、规则版本与冲突，确认后写入长期 `CharacterSheet`，再从长期卡生成与本场战斗隔离的投影和 `CombatantInstance`。

目标流程：

```text
选择角色卡文件或手工新建
→ 解析为 CharacterDraft
→ 字段映射、冲突与缺失项预览
→ 玩家 / DM 修订并确认
→ 写入长期 CharacterSheet
→ 选择本场准备内容与资源
→ 生成 CombatProjection
→ 加入遭遇 / 战斗
→ 战斗内消费实例资源并记录事件
→ 战后生成候选差异，由 DM 逐项决定是否回写
```

本版本的成功标准不是“系统会完整创建并绝对判定所有 D&D 角色”，而是证明非施法、完整施法、多职业和混合施法来源都能进入同一套不互相污染的数据结构与战斗流程。

## 3. A——拟实施范围

以下范围只有在用户明确批准并冻结本 ABC、且另行授权当前实施切片后，才可在该切片边界内进入 Implementation。

### A-1 长期角色卡与修订边界

- 建立独立于 `UnitTemplate`、`EncounterMember`、`CombatProjection` 和 `CombatantInstance` 的长期 `CharacterSheet`。
- 长期卡至少保存：稳定 ID、显示名、玩家/所有者提示、规则版本、角色总等级、职业与子职构成、种族/背景、六项属性与调整值、熟练加值、豁免、技能、感官、语言、AC、速度、长期当前 HP、HP 上限、生命骰、攻击/武器、武器精通、特性、装备、资源、施法档案、法术、备注、来源信息、修订号和修订时间。
- 派生值使用“计算输入 → 计算值 → 可选手工覆写 → 有效值 → 覆写原因”的可审计表达；不得只保存最终数字而丢失依据。
- 角色卡编辑产生新修订；不得用战斗实例覆盖长期卡，也不得无痕改写已用于历史战斗的修订快照。
- 首版角色详情提供八个可按角色能力动态隐藏的信息区域：战斗概览、检定与熟练、动作与能力、法术、装备、起源与经历、关联单位、导入与修订。现有简短“角色导入”页面降为导入入口，不再承担正式角色卡的日常浏览与管理。
- 战斗概览顶部保持跑团高频信息可见：HP/最大 HP、临时 HP、AC、先攻、速度、熟练加值、被动察觉、生命骰、英雄激励、当前状态与专注状态；每个派生值可展开查看来源与覆写。
- 攻击不作为普通动作说明保存。每个 `AttackProfile` 至少表达武器/攻击身份、熟练状态、使用属性、攻击加值、伤害骰与类型、触及/射程、弹药或关联资源、固有精通词条及当前是否启用；偷袭等额外能力独立保存，不能写死进某一武器伤害。
- 装备至少使用轻量容器模型，表达名称、数量、装备/未装备、同调、所在容器、消耗品、弹药/资源关联和备注；完整价格、货币账本与精确负重计算延期。
- 魔宠、盟友等保存为 `LinkedEntity` 关系，可从角色卡查看和加入遭遇；其进入战斗后必须物化为独立模板/实例、棋子、HP 与行动轮。据点等战役资产只保留为扩展资料，不进入本版角色核心。

### A-2 受控导入与 `CharacterDraft`

- 文件导入必须先解析为不具备长期身份的 `CharacterDraft`，保存来源文件名称、文件 SHA-256（可取得时）、导入器 ID/版本、原始字段位置、解析警告、未映射字段与候选映射。
- 首个受支持的 Excel Profile 以用户提供的本地样本 `【暂定】DND5.5E人物卡_刺客莉亚v1.0.15(2024).xlsx` 为验证输入；当前样本 SHA-256 为 `939d43cb1a33ec7c77ef4f2e96cef83c711dda31f2d7004d91418ac61bdc8711`，大小 `1,748,788 bytes`。它是私有验证输入，不嵌入、不复制到产品发布内容，也不据此推导模板作者、版权或再分发授权。
- 首版适配器身份冻结为 `sourceFormat: beiling-dnd55e-character-sheet`、`sourceVersion: 1.0.15`。样本 SHA-256 是该 Profile 的本地验证向量，不等于宣称任何同名或相似工作簿都兼容。
- 已知样本包含 18 个工作表，兼具角色构筑、规则数据库、装备/法术资料和外部导出功能。导入器只读取经 Profile 明确列出的角色输出区域，不导入其内置职业、种族、专长、装备、法术数据库、骰娘/CCF 输出逻辑、据点资料或表现层资源。
- 导入预览必须逐区显示：已识别值、来源单元格/区域、默认值、冲突、缺失必填项、未映射内容和将被忽略的表现层内容。
- 导入失败、未知工作簿版本、损坏文件、未来 Schema 或关键歧义不得覆盖已有角色卡；用户可以放弃草稿或手工补齐后再次校验。
- 导入器只读取角色事实和必要来源。允许把已知单元格的现存缓存结果作为带位置和警告的候选值，但不得执行、重算或信任任意 Excel 公式，不执行宏、脚本、外链或嵌入代码，也不把图片或嵌入规则全文作为正式角色事实。
- 未识别内容只保留为受限、规范化的单元格事实：工作表/区域、单元格位置、值、类型、公式存在状态、映射状态和忽略原因；不得把完整原始工作簿、图片、外链目标、嵌入代码或整套规则数据库复制到 `unmapped` 或角色导出。
- 同一角色重复导入默认创建“更新预览”，展示当前修订与候选修订差异；未经确认不得覆盖或新建重复长期卡。

### A-3 战斗概览、武器精通与动作资源

- 长期角色卡的“战斗”区域统一展示 AC、HP、速度、先攻、攻击、武器、武器精通、行动类型、核心战斗资源和常用规则提示。
- 武器精通必须作为武器/攻击与角色特性之间的明确关联：分别保存精通资格来源 `MasteryGrant`、选择上限和更换时点、当前 `MasterySelection`、适用武器、固有精通词条、启用状态、触发候选、效果摘要和规则来源状态；若导入卡未正确表达，预览中标记为缺失或待补充，不凭名称自动补齐规则效果。
- 规则资料已准入的动作、资源或特性可显示其已核验摘要和来源；用户自定义项只显示用户输入的名称、用途、说明、次数或骰式，二者不得混同。
- 精通必须随攻击投影到 `CombatantInstance` 和战斗 Tab。DM 本地端在攻击满足已准入触发条件时生成候选，允许应用或跳过；已实现的简单状态、行动经济或地图变化可在 DM 确认后联动，复杂目标、豁免、移动与额外攻击继续要求 DM 操作。
- 精通候选、应用、拒绝、目标、资源/行动变化和结果必须进入顺序事件；撤销追加补偿事件并恢复对应战斗状态。只在长期角色卡显示精通文字而不进入战斗使用流程，不算本版完成。
- 本版不承诺八种精通效果全部自动裁定，也不建立独立玩家端。玩家权威骰点后的自动弹窗、动画、音效、跨端提示、权限与防重复提交仍属于 `BL-021`。

### A-4 多职业与多施法来源的数据骨架

- `CharacterSheet.classes[]` 分别保存每个职业/子职及其等级；角色总等级、职业等级、规则计算所需施法贡献等级和熟练加值依据不得合并为同一字段。
- 每个施法来源建立独立 `SpellcastingProfile`，最少区分：职业、子职、种族、背景/专长、物品和自定义来源；每个 Profile 保存施法属性、攻击调整值、豁免 DC、取得/准备模式、规则版本、来源与可选手工覆写。
- 法术分别表达“已知/法术书拥有”“已准备”“始终准备”“本场可用”，不得压缩成一个布尔值。
- 同一法术只有在稳定法术 ID、规则版本与来源足以确认同一身份时才可在 UI 合并显示；不得仅按中文名、译名或显示名称合并。数据上始终保留多个 `CastingOption`；每个选项明确施法来源、施法属性、可用资源、免费次数、环级选择和规则证据状态。
- `SpellResourcePool` 至少能表达常规共享法术位、特殊/契约类法术位、种族/专长免费次数、物品充能和自定义资源。是否可以跨来源支付由已准入规则或 DM 明确选择决定，不因名称相似自动合并。
- v0.3.0 允许对已准入且版本明确的规则执行确定性默认计算，并允许带理由覆写；未准入、多版本冲突或未知组合必须显示 `unknown / needs-review`，不得声称绝对合法。

### A-5 战斗投影与长期联动

- 角色加入遭遇或战斗前，从指定 `CharacterSheet` 修订生成独立 `CombatProjection`；投影包含本场所需的 HP、资源、法术位、准备法术、结构化攻击、武器精通、动作、状态入口、携带装备/弹药、关联单位选择和显示信息快照。
- `CombatProjection` 是长期卡与战斗实例之间的确认边界；长期卡后续编辑不得改变已经开始的战斗，战斗内变化不得直接反写长期卡。
- 战斗 Tab 统一显示当前实例可用的攻击、动作、资源和法术；DM 不应在战斗时返回长期角色卡执行攻击或精通。每个法术必须能追溯到 `SpellcastingProfile`、`CastingOption` 与 `SpellResourcePool`，每个武器精通必须追溯到 `MasteryGrant`、`MasterySelection` 与 `AttackProfile`。
- 施放或消费资源时，事件至少记录角色卡修订、Profile、法术/能力、支付资源、变化前后值、目标与 DM 修正；撤销继续追加补偿事件。
- 结束战斗时只生成相对于开战投影的候选差异。HP、法术位、职业资源、免费次数、物品充能、弹药/消耗品数量与其他已存在的长期余额字段由 DM 逐项确认、放弃或修正；默认均不自动回写。位置、先攻、行动经济、专注和临时效果默认不回写。
- 该最小回写边界只处理已存在的长期字段差异；永久损伤、永久祝福/诅咒及复杂结算继续由 `BL-019` 管理，除非本 ABC 后续修订并重新批准。

### A-6 四类验证角色

本版本必须用四类相互补充的角色证明 Schema 与 UI，不以一张物理职业卡通过替代复杂角色验证：

1. **单一非施法职业：** 验证基础属性、攻击、动作经济、功力资源、装备、战斗投影和战后差异；候选复用现有 15 级散打武者，但不得假定 2024 武僧天然拥有武器精通。若额外要求该角色验证精通，必须冻结其明确的专长或其他准入来源。
2. **单一完整施法职业：** 验证单一施法属性、法术书/已知/准备状态、法术位、升环选项和战斗消费；候选复用现有 15 级塑能师，但不得沿用未经核验的旧字段冒充新角色卡事实。
3. **多职业施法角色：** 使用两个施法属性不同、但可能涉及共享常规法术位的职业组合，验证职业等级、施法 Profile、法术取得权限和资源池分离；候选为法师/牧师验证卡，具体等级、法术和计算规则须经规则准入后冻结。
4. **混合施法来源与武器精通角色：** 使用已确认的 3 级高等精灵刺客游荡者“莉亚”Excel 样本，验证游荡者职业授予的武器精通资格、所选武器与触发联动，以及高等精灵等职业外施法来源、免费次数、施法属性歧义和同一法术多个 `CastingOption`。Excel 未完整表达的精通选择或施法属性必须在预览中补充或标为待确认，导入器不得自行选择最高属性。

四个角色都是本地私有验证对象，不构成全职业支持、完整建卡合法性或规则资料发布。

### A-7 兼容、导出与验证

- 为 `CharacterDraft`、`CharacterSheet`、`AttackProfile`、`MasteryGrant`、`MasterySelection`、轻量装备容器、`LinkedEntity`、`CombatProjection`、施法 Profile、资源池和 Casting Option 建立明确 Schema 版本、校验器与安全迁移路径。
- v0.1.0/v0.2.0 现有角色预设和战斗 JSON 必须保持可打开；迁移不得倒推不存在的长期角色历史或将现有角色预设自动宣称为完整 `CharacterSheet`。
- 新角色导出必须包含长期卡修订、来源/导入信息、未解决警告和必要校验信息；不得包含原始 Excel 文件、宏、嵌入图片或未经授权的规则资料全文。
- 为导入安全拒绝、重复导入差异预览、模板/角色/投影/实例隔离、结构化攻击、武器精通触发/应用/撤销、多 Profile、多资源池、同一法术多选项、战斗消费/补偿撤销、关联单位独立物化和战后逐项回写建立自动测试与浏览器验收。

## 4. B——受保护边界

不得：

1. 修改或重打包 v0.1.0/v0.2.0 的冻结实现、发布包、Review、Release Notes 或版本身份；
2. 在本 ABC 获用户明确批准前编写产品代码、安装依赖、创建 `IMPLEMENTATION.md` 或进入 Implementation；ABC 获批后，也不得超出用户明确授权的当前切片；
3. 修改 LoreBuddy、NotebookLM 来源区、未筛选数据集、用户原始 Excel 或任何其他项目；
4. 把 Excel、角色卡自然语言、模型常识或未准入资料当作最终规则 Authority；
5. 把长期 `CharacterSheet`、单位模板、战斗投影和 `CombatantInstance` 合并成一个可互相覆盖的对象；
6. 导入失败或存在关键歧义时覆盖已有角色卡，或省略导入差异预览；
7. 在战斗中直接修改长期角色卡，或在战斗结束时无审核回写 HP、资源、法术位、装备或永久效果；
8. 把多个施法来源、不同施法属性、共享/独立法术资源或同名法术静默合并；
9. 用较高法术位反推角色必然学会或能够准备对应环级法术；
10. 把“可手工表达”和“结构支持”宣传成完整多职业合法性、完整法术引擎或全职业支持；
11. 执行 Excel 宏、公式脚本、外链或嵌入代码；
12. 把 Excel 内置的职业、种族、法术、装备或其他规则数据库整体导入 Terminal，或把工作簿当作运行时规则引擎；
13. 初始化 Git、部署、联网同步、公开发布、建立账户/玩家端或再分发规则资料。

## 5. C——明确延期但保留的发展方向

- 对话式建卡、Agent Gateway、模型自动改卡和自然语言完整角色构筑；
- 全职业、全子职、逐级升级、先决条件、选项资格和完整多职业合法性引擎（`BL-022`）；
- 全量法术表、完整法术内容库、目标/范围/组件/持续时间/专注及复杂效果自动裁定（`BL-023`）；
- 2014、2024 与其他规则来源之间的自动识别、差异转换和可逆升级工具（`BL-024`）；
- 玩家端权威骰点后的自动触发弹窗、动画/音效、跨端特效提示、账户、权限、房间和多人实时协作（`BL-021`、`BL-009`、`BL-011`）；DM 本地端的武器精通候选、确认、事件和撤销属于本版 A-3/A-5，不在此延期；
- 永久损伤、永久奖励、祝福/诅咒完整结算（`BL-019`）；
- 角色 0 HP、死亡豁免、稳定与完整死亡/复活状态机（`BL-020`）；
- 公共角色库、角色公开分享、部署、规则资料嵌入或任何授权推断。

## 6. 已批准并冻结的决定事项

| ID | 决策项 | 冻结决定 | 影响 |
|---|---|---|---|
| D3-001 | v0.3.0 是否只做长期角色卡、受控导入和战斗投影 | 是；对话式建卡与 Agent Gateway 延期 | 保持本版本为可完成的本地数据闭环。 |
| D3-002 | 自动计算的规则版本 | 以已准入的 2024 规则为自动计算基线；其他版本保存来源并允许手工覆写 | 避免静默混合规则版本，同时兼容未知角色卡。 |
| D3-003 | 首个 Excel 支持范围 | 只承诺 `beiling-dnd55e-character-sheet@1.0.15` Profile；其他 Excel 只做文件身份/错误预览后安全拒绝，用户可改走手工建卡，但不提供通用工作簿映射器 | 防止把单一样本误称为通用 Excel 导入。 |
| D3-004 | XLSX 解析依赖策略 | 优先使用可本地打包、许可可审计且不联网的最小解析器；安装前在 Implementation 报告名称、版本、许可、包身份与离线方式；只读取已知单元格及缓存候选值，不执行或重算公式 | 冻结供应链和工作簿执行边界。 |
| D3-005 | 四类验证角色 | 采用 A-6 四类；散打武者验证非施法核心，塑能师验证完整施法，法师/牧师验证多职业，莉亚同时验证混合施法来源、Excel Profile 与游荡者武器精通 | 让复杂角色结构成为阻塞验收，并避免给武僧虚构精通来源。 |
| D3-006 | 多职业自动计算深度 | 已准入规则才自动计算；未准入组合要求显式人工值和 `needs-review` | 不让 Schema 骨架冒充完整合法性引擎。 |
| D3-007 | 同一法术的 UI | 仅在稳定法术 ID、规则版本和来源足以确认同一身份时合并为一个展示条目，展开多个来源/支付选项；同名、异版或身份冲突时不合并，底层始终不合并 | 降低页面重复，同时保持身份、资源与来源正确。 |
| D3-008 | 战后资源回写 | 仅对当前 HP、法术位、职业资源、免费次数、物品充能、弹药/消耗品等既存余额逐角色逐字段预览；默认不回写，DM 明确勾选后写入新修订 | 保护长期角色状态；HP 上限、永久效果与复杂结算继续延期。 |
| D3-009 | 未识别字段的处理 | 在 Draft 中保留受限、规范化的单元格位置/值/类型/映射状态，用户可映射、备注或忽略；不保存整份工作簿、图片、外链、代码或内置规则库 | 避免静默丢失角色事实，同时遵守安全与再分发边界。 |
| D3-010 | 角色与模板关系 | `CharacterSheet` 直接生成战斗投影；可产生只读显示快照，但不降格为可编辑怪物模板 | 保留长期角色特有结构和身份。 |
| D3-011 | 武器精通自动化深度 | v0.3.0 实现 DM 本地端触发候选、应用/拒绝、简单联动、事件和补偿撤销；不承诺八种效果全自动裁定，玩家端权威骰点与特效进入 `BL-021` | 防止“只展示不使用”，同时避免扩张为玩家端完整触发引擎。 |
| D3-012 | Implementation 授权方式 | 批准 ABC 只冻结总体范围；`M1-S1` 至 `M1-S5` 必须逐项授权、逐项验收，完成当前切片后强制停止 | 让用户可以在真实产品证据出现后继续、修改或终止，避免一次授权覆盖整个大版本。 |

上述 D3-001 至 D3-012 已由用户随整份 ABC 于 `2026-08-17` 一次性批准并冻结。任何实质修改都必须形成明确修订、说明对未开始或已完成 Slice 的影响，并重新获得用户批准；不得在 Implementation 中静默偏离。

## 7. 数据边界与状态模型

```text
Excel / JSON / Manual Input
  → CharacterDraft
      - 原始来源定位
      - 候选字段
      - unmapped / warning / conflict
  → 玩家 / DM 明确确认
  → CharacterSheet revision N（长期 Authority）
      ├─ classes[]
      ├─ attackProfiles[]
      ├─ masteryGrants[] / masterySelections[] / features[]
      ├─ inventoryContainers[] / inventoryItems[]
      ├─ linkedEntities[]
      ├─ spellcastingProfiles[]
      ├─ spellResourcePools[]
      └─ spells[] + castingOptions[]
  → 本场确认
  → CombatProjection（角色卡修订快照）
  → CombatantInstance（单场可变）
  → CombatEvent + Snapshot
  → PostCombatDiff（候选）
  → DM 逐项确认
  → CharacterSheet revision N+1
```

| 对象 | 负责保存 | 不得承担 |
|---|---|---|
| `CharacterDraft` | 未确认导入值、来源定位、警告、冲突、未映射字段 | 长期身份、参战事实、自动覆盖 |
| `CharacterSheet` | 长期角色事实、来源、规则版本、修订、长期资源 | 单场位置、行动轮、临时效果、无审核战斗变化 |
| `AttackProfile` | 攻击身份、熟练、属性、攻击/伤害、射程、弹药、精通引用 | 偷偷嵌入其他独立能力、单场消耗或未经证据的规则效果 |
| `MasteryGrant` / `MasterySelection` | 精通资格来源、选择上限/更换时点、当前武器选择与规则状态 | 未经规则来源自动授予精通、战斗内临时触发状态 |
| `InventoryContainer` / `InventoryItem` | 轻量容器、数量、装备/同调/消耗品状态与资源关联 | 完整价格/货币账本、未经确认的战斗消耗回写 |
| `LinkedEntity` | 角色与魔宠/盟友等独立实体的长期关系和加入入口 | 把关联单位 HP、棋子或行动轮嵌入角色本体 |
| `SpellcastingProfile` | 一个施法来源的属性、DC、攻击、取得/准备模式 | 其他来源的静默合并、整个角色唯一施法状态 |
| `SpellResourcePool` | 一类可消费法术/能力资源及恢复语义 | 自动证明任意法术都可支付 |
| `CastingOption` | 某法术从某来源以某资源施放的候选方式 | 法术规则全文或未经证据的自动裁定 |
| `CombatProjection` | 指定角色卡修订的本场确认快照 | 长期 Authority、战斗后自动回写 |
| `CombatantInstance` | 本场 HP、资源、位置、状态、先攻、行动经济 | 角色卡或模板的反向覆盖 |
| `PostCombatDiff` | 战前快照与战后实例的候选差异及 DM 决定 | 未经确认的永久写入 |

## 8. 迁移与兼容性

- v0.1.0/v0.2.0 发布包和历史 JSON 保持冻结；只为当前 Workspace 的新 Schema 增加非破坏性识别与迁移。
- 现有两名角色预设可迁移为“legacy character preset”或经 DM 确认后建立首个 `CharacterSheet` 修订；不得伪造原始导入来源、长期历史或规则核验状态。
- 缺少施法 Profile、资源池或来源信息的旧角色数据不得自动猜测；保留原字段并标记 `needs-review`。
- 新导入先在隔离草稿中验证；失败、未来版本或损坏输入不得覆盖当前长期角色库、活动遭遇或战斗会话。
- `beiling-dnd55e-character-sheet@1.0.15` 只读取冻结的已知输出区域；Profile 不匹配、公式缓存缺失或关键候选歧义时进入警告/阻塞，不尝试执行工作簿以“修复”数据。
- 旧战斗 JSON 没有 `CharacterSheet`/`CombatProjection` 时仍按既有会话打开，不倒推长期卡，也不强迫执行战后回写。
- 新导出必须保留 Schema 版本、角色卡修订、投影来源和事件引用；导入后不能因角色卡后续编辑改变历史战斗。
- 回退方式是保留原输入与前一角色卡修订，并追加新修订或补偿记录；不得物理删除历史修订来伪造回退。

## 9. 验收标准

进入 Independent Review 前必须有实际证据证明：

1. 用户能够新建、查看、编辑和保存长期角色卡，完整页面不再依赖现有狭窄导入区域承载全部信息。
2. 当前“刺客莉亚”Excel 样本能进入 `CharacterDraft` 预览；来源、已识别字段、缺失、警告和未映射内容可见，未经确认不创建或覆盖角色卡。
3. 损坏、未知 Profile、未来 Schema 和关键歧义输入能安全拒绝，不改变当前角色库与战斗。
4. 重复导入同一角色显示修订差异并要求确认，不静默创建重复角色或覆盖当前修订。
5. `CharacterSheet → CombatProjection → CombatantInstance` 三层数据隔离有自动测试；任何一层的 HP、资源、法术与状态修改不会共享引用或反向污染。
6. 非施法散打武者能展示结构化攻击、动作经济、功力资源和装备，并投影到现有遭遇与战斗流程；没有证据时不显示其拥有武器精通。
7. 单一完整施法角色能区分法术书/已知、准备、始终准备与本场可用状态，并正确显示施法属性、攻击调整值、DC 和法术位。
8. 多职业施法角色保留两个独立职业等级与施法 Profile；共享资源池不授予错误的高环法术取得权限，未准入计算会显示待确认。
9. 莉亚能以 `beiling-dnd55e-character-sheet@1.0.15` 导入：高等精灵施法属性的多个候选会阻止自动确认；混合来源法术保留多个 `CastingOption`，分别显示免费次数、施法属性和可支付资源，不重复或双重扣费。
10. 法术/资源在战斗中的消费写入明确事件，补偿撤销准确恢复对应资源池，不影响其他 Profile 或资源池。
11. 长期卡在战斗开始后被编辑，不会改变已开始战斗；战斗内变化不会直接改写长期卡。
12. 战斗结束生成逐字段候选差异；默认不自动回写，DM 确认后才创建新的角色卡修订，放弃或失败不破坏战斗日志。
13. v0.1.0/v0.2.0 现有战斗 JSON 仍可安全读取，且不会伪造长期角色卡或导入历史。
14. 四类验证角色均完成至少一次“长期卡/导入 → 战斗投影 → 加入遭遇 → 消费资源或行动 → 结束 → 差异预览”的浏览器工作流。
15. 莉亚的游荡者武器精通资格、至少一个当前精通选择和对应攻击能投影到战斗 Tab；满足触发条件后生成候选，DM 可应用或跳过，应用结果进入事件并可补偿撤销。散打武者不得被虚构为天然拥有精通。
16. 轻量装备容器可保存数量、装备/同调/消耗品和弹药关联；至少一个魔宠/盟友关系可保留为 `LinkedEntity`，加入战斗时生成独立实例而不共享 HP 或行动轮。
17. 无 LoreBuddy、规则来源区、未筛选数据集或原始 Excel 改动；无 Git 初始化、部署、公开发布、Agent Gateway、完整规则引擎或规则资料再分发。

## 10. 风险与控制措施

| 风险 | 控制措施 / 门禁 |
|---|---|
| Excel 版式复杂、合并单元格、缓存值和公式导致错误映射 | 使用 `beiling-dnd55e-character-sheet@1.0.15` 版本化 Profile、已知输出区域、字段级来源定位、预览和未映射区；不执行/重算公式，未知版式安全拒绝。 |
| 单一样本被误称为通用 Excel 兼容 | 指定 SHA-256 只作为首个验证向量；兼容声明仅限通过版本与结构指纹识别的 `beiling-dnd55e-character-sheet@1.0.15` Profile，其他格式须另增 Profile 与测试。 |
| 长期角色卡与战斗实例共享引用 | 强制 `CharacterSheet revision → CombatProjection snapshot → CombatantInstance` 单向物化并做隔离测试。 |
| 多职业等级、法术权限和法术位被混为一个数字 | 分离职业等级、施法 Profile、规则贡献、法术取得与资源池；所有派生值展示输入和覆写。 |
| 同名法术多来源导致重复扣费或错误属性 | 底层保留多个 Casting Option；事件记录具体 Profile 和 Resource Pool，并验证幂等。 |
| 武器精通被降格为说明文字，或半自动联动错误改变行动/地图 | 分离资格、选择、攻击和战斗触发状态；DM 确认后才应用；按事件记录并以补偿事件撤销，复杂效果保留人工操作。 |
| 未准入规则被自动补齐 | 标记 `unknown / needs-review`，仅允许人工值与理由；新增规则自动化前更新 Rules Baseline 和 ABC。 |
| 依赖库扩大本地供应链与授权风险 | 依赖安装前报告版本、许可、打包方式和离线边界；不联网执行工作簿内容。 |
| 战后回写把临时损耗变成永久修改 | 默认不回写、逐字段预览、DM 确认、新修订、失败不覆盖。 |
| 角色详情一次塞入过多信息导致不可用 | 使用八个可动态隐藏的信息区，顶部保留战斗快捷条；角色档案负责长期配置，战斗 Tab 负责实际使用。 |
| 范围膨胀为完整角色构筑与规则引擎 | 以四类验证角色和明确延期项封顶；结构支持不等于全职业完成。 |

## 11. M1 分阶段实施与逐项授权门禁（不构成授权）

v0.3.0 保持一个完整产品交付候选，内部由 `M1` 管理，但不得用一次 Implementation 授权连续实施全部范围。实施顺序冻结为 `M1-S1` 至 `M1-S5`；每个切片都必须经历“单独授权 → 实施 → 自动测试与浏览器验证 → 人工验收 → 报告结果和变更 → 强制停止 → 用户决定下一步”。除修复当前切片阻塞缺陷外，不得提前建设后续切片。

### Slice 登记表

| Slice ID / Parent | Goal / Approved Scope Reference | Product / Release Mapping | Human Acceptance | Implementation / Review State | Contribution to M1 Exit | Commit or Artifact Identity |
|---|---|---|---|---|---|---|
| `M1-S1` / `M1` | 最薄长期卡—战斗—回写闭环；第 11 节 `M1-S1` | `v0.3.0`；无独立 Release | Passed / User / `2026-08-17` | Complete / Review Approved | 四层隔离、事件、补偿、差异审核和 revision N+1 已通过；非阻塞观察见 `TESTING.md` 的 `M1-S1-O1` | SHA-256 见 `IMPLEMENTATION.md`；发布身份见 `RELEASE_NOTES.md` |
| `M1-S2` / `M1` | 长期角色卡与非施法详情；第 11 节 `M1-S2` | `v0.3.0`；无独立 Release | Passed / User / `2026-08-17` | Complete / Review Approved | 长期角色页、非施法端到端与安全 `unknown / needs-review` 边界已通过；非阻塞观察见 `TESTING.md` 的 `M1-S2-O1` | SHA-256 见 `IMPLEMENTATION.md`；发布身份见 `RELEASE_NOTES.md` |
| `M1-S3` / `M1` | 受控 Excel Profile 与莉亚导入；第 11 节 `M1-S3` | `v0.3.0`；无独立 Release | Passed / User / `2026-08-18` | Complete / Review Approved | 安全 Draft、三级熟练、特性、主要装备/背包、仅显式特性触发的 DM 精通选择、同源更新预览与拒绝路径均已验证 | SHA-256 见 `IMPLEMENTATION.md`；发布身份见 `RELEASE_NOTES.md` |
| `M1-S4` / `M1` | 施法、多职业与多资源池骨架；第 11 节 `M1-S4` | `v0.3.0`；无独立 Release | Passed / User / `2026-08-18` | Complete / Review Approved | 已证明三类复杂施法结构可共存、实例消费不回写长期卡；非阻塞术语本地化见 `M1-S4-O1` | SHA-256 见 `IMPLEMENTATION.md`；发布身份见 `RELEASE_NOTES.md` |
| `M1-S5` / `M1` | 武器精通、完整战斗接入与证据收口；第 11 节 `M1-S5` | `v0.3.0`；无独立 Release | Passed / User | Complete / Review Approved | 汇总全部验收并完成 M1 退出门禁 | 发布身份见 `RELEASE_NOTES.md` |
| `M1-S5-STAB-1` / `M1` | 战后审核、关联单位与武器精通 UI 稳定化；Amendment 2 | `v0.3.0`；无独立 Release | Passed / User / `2026-08-24` | Complete / Review Approved | 清理验收后阻塞性 UX 观察已通过 | 本次实施证据；发布身份见 `RELEASE_NOTES.md` |
| `M1-S5-STAB-2` / `M1` | 长期角色卡归档、恢复与安全删除；Amendment 2 | `v0.3.0`；无独立 Release | Passed / User / `2026-08-24` | Complete / Review Approved | 建立角色库生命周期安全边界已通过 | 本次实施证据；发布身份见 `RELEASE_NOTES.md` |

表中实施、评审、验收和身份状态只描述当前事实。Slice 通过不等于 `M1 Complete`，`M1 Complete` 不等于 `v0.3.0 Released` 或 `Archived`。

### 人工验收门禁

| Slice | Acceptance Question | Required Artifact / Environment | Executor / Approving Authority | Evidence Location | Pass / Block Criterion | Blocked Axis |
|---|---|---|---|---|---|---|
| `M1-S1` | 最小长期卡能否安全进入战斗并经确认形成新修订？ | 本地产品、非施法手工角色、自动测试与浏览器流程 | User | 获授权后写入 `TESTING.md` 的 `M1-S1` 节 | 用户明确通过；任一隔离、兼容或回写保护失败即 Block | `M1-S1`、后续 Slice |
| `M1-S2` | 长期角色页是否足以完成非施法角色日常管理和战斗准备？ | 本地产品、散打武者、角色详情与战斗流程 | User | `TESTING.md` 的 `M1-S2` 节 | 用户明确通过；关键详情、攻击、资源或修订流程不可用即 Block | `M1-S2`、后续 Slice |
| `M1-S3` | 莉亚是否能在不执行工作簿逻辑的情况下安全导入和修订？ | 本地产品、原始 Excel 只读输入、Draft/差异预览 | User | `TESTING.md` 的 `M1-S3` 节 | 用户明确通过；错误映射、静默覆盖或安全拒绝失败即 Block | `M1-S3`、后续 Slice |
| `M1-S4` | 单一完整施法、多职业施法和混合来源是否保持可审计隔离？ | 本地产品、塑能师、法师/牧师、莉亚 | User | `TESTING.md` 的 `M1-S4` 节 | 用户明确通过；Profile、资源池、取得权限或消费串池即 Block | `M1-S4`、后续 Slice |
| `M1-S5` | 四类角色、武器精通和战后差异是否构成可接受的 v0.3.0 候选？ | 本地产品、四角色、全套自动与浏览器证据 | User | `TESTING.md` 的 `M1-S5` 节 | 用户明确通过且全部阻塞项清零；否则 M1 不得进入 Independent Review | `M1`、Independent Review |

### M1-S1——最薄长期卡—战斗—回写闭环

- 建立最小 `CharacterSheet` 修订、`CombatProjection`、`CombatantInstance`、`CombatEvent` 和 `PostCombatDiff` 数据边界。
- 只使用手工创建的单一非施法角色，跑通“保存长期卡 → 生成投影 → 加入现有战斗 → 消费一项资源 → 生成候选差异 → DM 确认后写入新修订”。
- 只实现支撑该闭环所需的最小 UI 和非破坏性兼容；不建设 Excel 导入、完整八区详情页、多职业施法或武器精通自动化。
- **停止条件：** 提交对象隔离、事件、补偿/失败保护和旧战斗兼容的证据；用户验收前不得进入 `M1-S2`。

### M1-S2——长期角色卡与非施法角色详情

- 扩展长期卡 Schema，加入八个动态信息区域、战斗快捷条、派生值审计、`AttackProfile`、动作/资源、轻量装备、`LinkedEntity` 和修订差异。
- 使用散打武者验证非施法角色的查看、编辑、攻击、装备、资源、投影与回写；没有准入来源时不得给该角色补武器精通。
- **停止条件：** 完整角色详情页和非施法端到端流程通过验收；用户决定是否进入 Excel 导入。

### M1-S3——受控 Excel Profile 与莉亚导入

- 只实现 `beiling-dnd55e-character-sheet@1.0.15`，从冻结的已知输出区域生成 `CharacterDraft`。
- 完成字段来源、缺失、默认值、冲突、公式缓存警告、受限未映射内容、手工补充、确认写入和重复导入更新预览。
- 使用“刺客莉亚”验证；不建立通用 Excel 映射器，不执行公式、宏、脚本、外链或工作簿内置规则数据库。
- 仅当 Excel 明确导入 `武器精通` 职业特性时才出现 DM 当前选择流程；不得依据职业名称、武器固有精通词条或其他字段推断角色资格。
- **停止条件：** 莉亚能够安全形成长期卡，未知/损坏 Profile 能安全拒绝；用户决定是否进入施法与多职业骨架。

### M1-S4——施法、多职业与多资源池骨架

- 加入 `classes[]`、多个 `SpellcastingProfile`、`SpellResourcePool`、法术状态和多个 `CastingOption`，并接入长期卡、投影、消费事件和差异预览。
- 使用塑能师验证单一完整施法，使用法师/牧师验证多职业施法，使用莉亚验证职业外施法来源、免费次数与同一法术多个施放方式。
- 仅对已准入且版本明确的 Entry 自动计算；未知或冲突组合必须显示 `unknown / needs-review` 并允许带理由覆写。
- **停止条件：** 三类施法结构各自完成可审计验证；用户决定是否进入完整战斗接入。

### M1-S5——武器精通、完整战斗接入与证据收口

- 完成角色卡攻击/法术/资源到战斗 Tab 的正式接入、关联单位独立物化，以及莉亚游荡者武器精通资格、选择、触发候选、应用/跳过、事件和补偿撤销。
- 完成所有准入余额的战后逐项确认/放弃/修正和新修订写入；永久损伤、永久奖励和复杂结算保持延期。
- 对四类角色完成自动测试和真实浏览器端到端验收，汇总 Implementation 证据后停止，等待用户另行授权 Independent Review。
- **停止条件：** 第 9 节全部适用验收项有可复核证据；不得自行创建 `REVIEW.md`、发布或归档。

### 授权语义

- `批准 v0.3.0 ABC`：只冻结 A/B/C、D3 决策和 `M1-S1` 至 `M1-S5` 的总体合同，不授权产品修改。
- `授权实施 M1-S1`（或其他明确切片）：只授权该切片所列产品、测试和 Implementation 记录。
- `批准 ABC 并实施` 不再视为 `M1-S1` 至 `M1-S5` 的完整授权；若用户未点明切片，只能请求确认，不得开始产品修改。
- 一个切片完成后必须停止。后续修复、调整范围或进入下一切片，都需要用户新的明确指令。

## 12. 预计文档与产品文件边界

当前 `M1-S1` 至 `M1-S4` 已完成并通过人工验收；`M1-S4` 的英文施法属性展示标签记录为非阻塞 `M1-S4-O1`，可随已授权的 `M1-S5 Amendment 1` 修复。M1-S4 没有扩展到全量法术引擎、完整合法性、武器精通战斗触发或其他后续范围。

- 为保持活 Authority 一致而同步 `AGENTS.md`、`README.md`、本 ABC、`IMPLEMENTATION.md` 与 `TESTING.md` 的当前门禁事实；
- 在产品 Workspace 实施第 11 节 `M1-S4` 的产品代码与测试；
- 在完成实际验证后，按实施事实更新 `docs/ARCHITECTURE.md`。

ABC 获批且当前切片另获明确授权后的 Implementation 才可：

- 在产品 Workspace 修改现有 HTML/CSS/JavaScript、测试和必要的本地解析依赖；
- 在文档 Authority 创建 `version-work/v0.3.0/IMPLEMENTATION.md`；
- 创建并累计维护 `version-work/v0.3.0/TESTING.md`，分别记录各 Slice 的自动验证和人工验收；
- 如已实施事实改变架构，在完成验证后更新 `docs/ARCHITECTURE.md`；
- 如自动规则计算需要新 Entry，先按 Authority 更新 `docs/extensions/rules-baseline.md` 并重新核对 ABC 规则边界。

未经后续单独授权，不创建 `REVIEW.md`、`RELEASE_NOTES.md`、`ARCHIVE_SUMMARY.md`，不发布、不归档、不部署。

## 13. M1-S5 Amendment 1：最小战斗接入合同

- **批准 / 实施授权：** User / `2026-08-21`。本修订只授权本节和原 M1-S5 的产品代码、测试及累计 Implementation/Testing 记录；不授权 Review、Release、Archive、部署、规则来源或原始 Excel 修改。
- **规则准入：** 仅采用 Rules Baseline 中本修订新增的游荡者武器精通资格、匕首/短弓映射与 Nick/Vex 锚点。原 Entry UUID 不可得时保留 `local-markdown-anchor`、`source_path`、行锚点与 SHA-256；不推导出版、翻译或再分发授权。
- **自动化边界：** 攻击命中、伤害、目标与时机均由 DM 确认。仅短弓 `Vex/侵扰` 可在 DM 应用后生成“下一次攻击优势提醒”效果，并精确持续至来源单位下一回合结束；不自动掷骰、命中、伤害或优势。`Nick/迅击` 只显示候选和人工说明，不自动改变行动经济；其他六种精通保持人工处理。
- **事件：** 新增 `attack.outcome.confirmed`、`weapon-mastery.candidate.generated`、`weapon-mastery.candidate.applied`、`weapon-mastery.candidate.skipped`、`spell.cast.confirmed` 与 `combatant.inventory-balance.changed`。候选以 `outcomeId + selectionId + masteryPropertyId` 去重；应用的补偿必须把候选标记为 `compensated`，不得恢复为可重复应用的 `pending`。
- **关联单位：** `LinkedEntity` 可显式绑定模板，或由 DM 仅为本场选择模板；物化必须形成独立 `LinkedEntityProjection → EncounterMember → CombatantInstance`，冻结模板快照、独立 HP/行动轮，并以 `combatProjectionId + linkedEntityId` 每场一次去重。物化映射随既有确认/批量投入事件保存，不另造悬空事件。
- **战后余额：** HP、职业资源、法术/免费次数、物品充能、弹药与消耗品都只能以 `accept / reject / correct` 逐项审核。`correct` 必须有值和原因；全部决定原子校验，成功才建立 revision N+1。
- **兼容与回退：** M1-S5 使用新的会话和角色库存储键进行 copy-on-write 迁移，保留 M1-S4 原键。回退不得用旧代码重写 S5 数据；保留导出、前一修订与补偿事件。
- **验收输入：** 莉亚真实浏览器 E2E 使用 SHA-256 `939d43cb1a33ec7c77ef4f2e96cef83c711dda31f2d7004d91418ac61bdc8711` 的原始 Excel；若本地不可用，自动夹具可通过但该人工输入项为 blocked，不得伪报通过。

## 13. 新 Work 启动门禁

新 Work 必须重新读取 Authority，而不是仅依赖聊天上下文。建议顺序：`AGENTS.md`、`README.md`、`project-authority.md`、`BACKLOG.md`、本 ABC、v0.2.0 的 `ABC/REVIEW/RELEASE_NOTES`、相关 Architecture/Product Requirements/Rules Baseline。

新 Work 应先报告对已批准 A/B/C、D3-001 至 D3-012、四类验证角色、规则准入缺口与 `M1-S1` 至 `M1-S5` 的理解。本 ABC 已冻结总体合同；在用户另行点名授权当前切片之前，不得进入 Implementation。每个切片完成并报告后必须停止，等待下一次明确授权。

## 14. M1-S5 Amendment 2：验收后稳定化

- **批准 / 实施授权：** User / `2026-08-21`。本修订仍属于 `v0.3.0`，直接授权下列稳定化切片的产品代码、测试以及累计 `IMPLEMENTATION.md` / `TESTING.md` 记录；不授权 Independent Review、Release、Archive、部署、规则来源或原始 Excel 修改。
- **切片：** `M1-S5-STAB-1`（战后审核、关联单位与武器精通 UI）和 `M1-S5-STAB-2`（长期角色卡生命周期）。两个切片独立验证、独立人工验收；完成后停止，等待下一门禁决定。
- **验收后状态：** 原 `M1-S5` 人工测试门禁保持 `Complete / Human Accepted`，本修订不追溯撤销已通过门禁；稳定化新增观察项必须有自己的自动测试与浏览器证据。
- **战后差异防呆：** 选择 `correct` 时更正值与原因均为必填；空值、非数字、负数或空原因在字段级标红、设置 `aria-invalid`、聚焦首个错误并阻止任何写回。领域层的数值/原因原子校验继续保留。
- **关联单位图形化：** 角色卡的 `LinkedEntity` 编辑使用可增删卡片、类型/关系选择、备注和 UnitTemplate 下拉框；保留稳定 `LinkedEntity.id` 与现有 `templateRef` 合同。角色详情的“关联单位”页签直接提供“生成棋子并加入遭遇”，可在本场选择模板；本场选择不回写长期角色卡，去重键仍为 `combatProjectionId + linkedEntityId`。
- **用户文案：** 所有用户可见的“物化并加入遭遇”改为“生成棋子并加入遭遇”；内部 `LinkedEntityProjection`、`materializeLinkedEntity` 和事件语义不改名。
- **精通显示：** `weapon-mastery` 效果来源显示为“武器精通”；在战斗 Tab 的“当前选中者状态”中设置独立“武器精通”区，同时从来源与目标两个视角显示候选状态、目标、来源、到期与“不自动掷骰/结算优势”边界。只增加可发现性，不扩大 Nick/Vex 自动化范围。
- **精通效果与长休配置追补（User / `2026-08-24`）：** 用户在听取现状与实施方案后明确要求继续实施。战斗 Tab 的“武器精通”区必须在任何触发发生前常驻显示当前长休选择、武器、精通词条、可读效果和自动化边界；实际触发后再附加来源、目标、候选状态与到期。角色“动作与能力”页提供长休结束后的图形化重新选择，仅列出已熟练且具有本地已准入稳定武器/词条 ID 的候选，要求 DM 确认说明，并以 copy-on-write 创建 revision N+1。当前战斗投影或 `pending` 战后候选仍引用该角色时阻止更换。该追补不扩大 Vex 自动化，不自动执行 Nick，不新增 Rules Baseline Entry。
- **角色生命周期：** 长期角色记录新增加法字段 `status: active | archived`、`archivedAt`、`archivedReason`。归档隐藏于活动列表并禁止新投影；恢复可逆。当前战斗仍有该角色投影或仍有 `pending` 战后候选时，归档入口与命令层都必须阻止归档。永久删除仅限已归档角色，要求输入完整名称确认；当前投影或待审核差异引用存在时必须阻止永久删除。旧记录缺省迁移为 `active`。
- **重复投影与候选废除：** 同一角色修订可产生多个独立战斗投影和 `PostCombatDiff`。首份候选写回形成 revision N+1 后，其余仍基于 revision N 的候选必须显示实例身份与过期原因、禁用确认写回，并提供“废除本份战斗候选差异”。废除只把该候选置为终态 `abandoned`，把条目标记为 `abandoned` 并追加 `character.writeback.abandoned` 审计事件；不得改写长期角色卡、其他候选或既有战斗日志。
- **回退：** STAB-1 仅改变渲染与本地验证，不改变既有战斗事件合同；STAB-2 使用加法字段、copy-on-write 角色记录和归档优先，删除失败不触碰历史修订、投影或事件。回退保留当前导出、历史修订和已确认遭遇。
- **Rules Baseline：** 不新增规则 Entry，不修改规则来源、锚点、来源身份或原始 Excel；本修订仅消费已准入的 M1-S5 结构。

## 15. v0.3.0 Archive Contract/Profile 选择

- **选择授权：** User / `2026-08-24`（明确指令“执行archive”）。
- **选定合同与 Profile：** `schema-v0.1.1` Archive Contract（SHA-256 `7817687601b2bad7cc8f87015d5b8f6b8ae4fe504cd68abb30b8255b531133df`）与 `schema-v0.1.2` Lightweight Archive Profile（SHA-256 `7fc38398b5c131bddf16805e15f14382c0e4424be4bcf63ef115b0865643cb1e`）。
- **选择：** `Lightweight`；归档根目录固定为 `version-work/v0.3.0/archive/`。
- **理由：** 本版本已有冻结 ABC、Implementation、Testing、Review、Release Notes、发布 ZIP 与 SHA-256 清单；Workspace 非 Git，仍须归档完整代码快照并逐项匹配既有发布/测试身份。Lightweight 只合并叙述文档，不减免八项 Archive Gate、代码快照、哈希、测试、评审、秘密检查或生命周期一致性。
- **边界：** 归档为本地私有证据冻结，不删除、不移动或重打包已发布 ZIP，不修改产品源码、规则来源、原始 Excel、v0.1.0/v0.2.0 记录，也不授权部署、公开发布或再分发。
