# D&D 规则基线（Rules Baseline）

- **Extension ID：** `local.dnd-rules-baseline`
- **Status：** Approved/Frozen historical Entries；v0.6.0 复活、转生与受控不死生物提示 Entries approved for non-blocking local guidance，Implementation Not Authorized
- **Owner：** User
- **Evidence Date：** `2026-07-30`
- **Ruleset Candidate：** `PHB 2024 + DMG 2024 + MM 2025`
- **Maximum Provisional Duration：** v0.1.0 Independent Review
- **Proposed Disposition：** Stable Local Extension

## 证据边界

当前规则资料只可从用户指定的受限本地数据来源区读取：

- 数据来源根目录：`/Users/chenzehao/Antigravity Source/lorebuddy-规则书/NotebookLM_Version`
- 当前可见形态：`Lore_01_核心玩家规则.md` 至 `Lore_06_其他资料.md` 六个本地 Markdown 文件。
- 资料仅用于本地私有验证；翻译、出版身份、许可与再分发权均为 `unknown`。

此前 LoreBuddy GPT Project Export 的 Artifact、Manifest、Entry ID 与 SHA-256 是历史核验收据，不能自动证明此新目录中 Markdown 的逐字同一性。本次仅迁移数据来源位置，未重新建立 Markdown 到旧 Entry 的映射或重做规则数值核验；未检索或未重新核验的规则不得凭模型知识补齐。

所有中文资料的官方翻译身份、许可与再分发权均为 `unknown`。目录名只能证明本地来源分类，不能证明官方出版或授权。

## 已核验规则 Entry

| Topic | Entry ID | Source Path | SHA-256 |
|---|---|---|---|
| 战斗、先攻、平局、回合 | `urn:uuid:3457e871-bd39-5a8a-98b5-a5cf776fde86` | `玩家手册2024/进行游戏/战斗流程.htm` | `fa09bbd2a52366b1570f2b94ddd613c206e2445977746f081923022bf467435c` |
| 方格、移动、体型、占位 | `urn:uuid:8dca5c63-b735-52b8-9f51-082466e67873` | `玩家手册2024/进行游戏/移动和位置.htm` | `05180393980377b239d47182da9e5e57bab1aa5d53a59aa0533294430bd0405a` |
| 微缩模型、半格覆盖、斜向可选规则 | `urn:uuid:6148725c-40b9-5a78-abb9-4ee73ab700b5` | `城主指南2024/2.运作游戏/运作战斗/微缩模型.htm` | `293919c4b51a7189606a2d8dbae1a2d9e39adb80af05a6e13ff57332b22e87b2` |
| 动作 | `urn:uuid:d28c9c9e-c9d6-52be-9da6-4c8431427a69` | `玩家手册2024/进行游戏/动作.htm` | `4730190b5496bd6a85af624a60c314b49a33642f36b3f26977ccbabd037e17e3` |
| 反应 | `urn:uuid:0ee0aa1d-92ad-5167-b81d-72a4f83973c5` | `玩家手册2024/进行游戏/反应.htm` | `84d928bd56b9b575b688a5570ec8f4dca88a91d7441ba61185ae3c8cb0128307` |
| 附赠动作 | `urn:uuid:ec205063-27fb-5072-abaa-a97ce0eb2e6b` | `玩家手册2024/进行游戏/附赠动作.htm` | `3b050bcebf008891c42499fc31804029a474eae0e48b85e719675de2346c247d` |
| 临时 HP | `urn:uuid:9e95a317-f10b-53ba-be18-258dd7d42c45` | `玩家手册2024/进行游戏/临时生命值.htm` | `b5e6f001007eb6fd192ce33df2cf599f106a2d81e86a2427c8d6c8ec0fb5cc4d` |
| 0 HP、死亡与死亡豁免（v0.2.0 限定 DM 记录） | `local-markdown-anchor: Lore_01_核心玩家规则.md#降至0生命值`（原 Entry UUID `unknown`） | `Lore_01_核心玩家规则.md` 第 9790–9827 行 | `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8` |
| PHB 2024 治疗、生命值与生命值降至 0（v0.4.0 ABC-scoped） | `local-markdown-anchor:Lore_01_核心玩家规则.md#PHB2024-治疗-生命值-0HP`（原 Entry UUID `unknown`） | `Lore_01_核心玩家规则.md` 第 21263–21317 行 | `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8` |
| PHB 2024 死亡、死亡豁免、稳定与昏迷术语（v0.4.0 ABC-scoped） | `local-markdown-anchor:Lore_01_核心玩家规则.md#PHB2024-死亡-死亡豁免-稳定-昏迷`（原 Entry UUID `unknown`） | `Lore_01_核心玩家规则.md` 第 35886–35895、36218–36221、36774–36783 行 | `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8` |
| PHB 2024 回生术（v0.6.0 非阻塞提示） | `local-markdown-anchor:Lore_01_核心玩家规则.md#PHB2024-回生术`（原 Entry UUID `unknown`） | `Lore_01_核心玩家规则.md` 第 23937–23945 行 | `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8` |
| PHB 2024 死者复活（v0.6.0 非阻塞提示） | `local-markdown-anchor:Lore_01_核心玩家规则.md#PHB2024-死者复活`（原 Entry UUID `unknown`） | `Lore_01_核心玩家规则.md` 第 25633–25648 行 | `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8` |
| PHB 2024 复生术（v0.6.0 非阻塞提示） | `local-markdown-anchor:Lore_01_核心玩家规则.md#PHB2024-复生术`（原 Entry UUID `unknown`） | `Lore_01_核心玩家规则.md` 第 23380–23390 行 | `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8` |
| PHB 2024 完全复生术（v0.6.0 非阻塞提示） | `local-markdown-anchor:Lore_01_核心玩家规则.md#PHB2024-完全复生术`（原 Entry UUID `unknown`） | `Lore_01_核心玩家规则.md` 第 24357–24366 行 | `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8` |
| PHB 2024 转生术（v0.6.0 非阻塞提示） | `local-markdown-anchor:Lore_01_核心玩家规则.md#PHB2024-转生术`（原 Entry UUID `unknown`） | `Lore_01_核心玩家规则.md` 第 25657–25665 行 | `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8` |
| PHB 2024 克隆术（v0.6.0 非阻塞提示） | `local-markdown-anchor:Lore_01_核心玩家规则.md#PHB2024-克隆术`（原 Entry UUID `unknown`） | `Lore_01_核心玩家规则.md` 第 25954–25963 行 | `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8` |
| PHB 2024 活化死尸（v0.6.0 非阻塞提示） | `local-markdown-anchor:Lore_01_核心玩家规则.md#PHB2024-活化死尸`（原 Entry UUID `unknown`） | `Lore_01_核心玩家规则.md` 第 23494–23502 行 | `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8` |
| PHB 2024 唤起亡灵（v0.6.0 非阻塞提示） | `local-markdown-anchor:Lore_01_核心玩家规则.md#PHB2024-唤起亡灵`（原 Entry UUID `unknown`） | `Lore_01_核心玩家规则.md` 第 26198–26208 行 | `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8` |
| PHB 2024 遗体防腐（v0.6.0 辅助提示） | `local-markdown-anchor:Lore_01_核心玩家规则.md#PHB2024-遗体防腐`（原 Entry UUID `unknown`） | `Lore_01_核心玩家规则.md` 第 24751–24759 行 | `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8` |
| 状态与持续时间 | `urn:uuid:a171312b-6e73-5bfc-8177-68c7b101c5dd` | `玩家手册2024/进行游戏/状态.htm` | `05aabf545f7c4a48971ddd452e32808852c3f87ce8fe23e089ef7d2dee164078` |
| 效应区域形状 | `urn:uuid:dd3b98c8-f317-5910-aded-f00bc669851c` | `玩家手册2024/术语汇编/效应区域.htm` | `cb98c748a3404d30e0754b872b6c11142ca0c774a1aada65fa782aa0c0c4720a` |
| 法术效应与 DM 边界 | `urn:uuid:52738c9b-d985-578a-8eb3-72c806d0531e` | `玩家手册2024/法术/法术效应.htm` | `184448330ff2291624c4623c5924282ee3a85e7e16187a8e0a799caac8b22136` |
| 法术位 | `urn:uuid:92e6162f-1b04-5dee-b2fe-99e68c95cd31` | `玩家手册2024/法术/法术环阶.htm` | `aeb03219943ce6685efbf8a1396e15e338ef6a95eac2739eca01413a50e9a9e1` |
| 一环法术（含油腻术） | `urn:uuid:23faa68f-588b-5b14-a6fb-7e0df89dcf8a` | `玩家手册2024/法术详述/1环.htm` | `9522f9178efa536d1eeab5984865afa648af745739dc4b5d5633fd1e5b74422c` |
| 三环法术（含火球、飞行、加速、闪电束、召唤妖精） | `urn:uuid:5909de48-eb19-58e3-b6ae-98cbe7e58c88` | `玩家手册2024/法术详述/3环.htm` | `27b964c5d027569800726693e91e01b4aa8ac63bedffa1cfeeb4c3f0f95327f7` |
| 五环法术（含寒冰锥） | `urn:uuid:e2f3f7c0-0fd2-569c-b264-08db06c4c19d` | `玩家手册2024/法术详述/5环.htm` | `8450df055efb10a4bed0a02dcfecc132cbd45dadbbcacc06f603a58e505e1604` |
| 武僧 15 级 | `urn:uuid:5c3f3b49-bb2e-5c54-bb97-560f185396a6` | `玩家手册2024/角色职业/武僧/武僧.htm` | `fb3ba60ac810abfd6606e4eded35f8f4424654b23e286f683741e5c2be833802` |
| 散打武者 | `urn:uuid:b2167d68-574e-5421-bd05-a4b3bb1b6c18` | `玩家手册2024/角色职业/武僧/散打武者.htm` | `1714dda8de3b93a6d822fddfd8b92e8d808d8f7c6baf1af396b7ea8725e3210e` |
| 法师 15 级 | `urn:uuid:340db2c0-1bca-56a5-ab30-90c81437becd` | `玩家手册2024/角色职业/法师/法师.htm` | `25a281c8272e6e3841f5a9bf41ddaaf4d34e9cca685114a91363e95d404eee77` |
| 塑能师 | `urn:uuid:ec770dfd-4025-5e5f-8e17-42ddacad7a6c` | `玩家手册2024/角色职业/法师/塑能师.htm` | `34ee92f6486e218cbbcacaba3856e46d1716ca2c1c53149b8a803518e760808e` |
| 游荡者武器精通资格与更换时点（M1-S5） | `local-markdown-anchor:Lore_01_核心玩家规则.md#游荡者-武器精通`（原 Entry UUID `unknown`） | `Lore_01_核心玩家规则.md` 第 31218–31255 行 | `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8` |
| 匕首/短弓与精通词条映射（M1-S5） | `local-markdown-anchor:Lore_01_核心玩家规则.md#武器表`（原 Entry UUID `unknown`） | `Lore_01_核心玩家规则.md` 第 34664–34677 行 | `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8` |
| 迅击与侵扰精通词条（M1-S5） | `local-markdown-anchor:Lore_01_核心玩家规则.md#精通词条-Nick-Vex`（原 Entry UUID `unknown`） | `Lore_01_核心玩家规则.md` 第 34681–34708 行 | `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8` |

## 候选怪物与 NPC

| Category | Template | Entry ID | Source Path | Verification Role |
|---|---|---|---|---|
| Monster | 地精武者 | `urn:uuid:59e8ff3d-cddd-5452-ae67-1181b18beed8` | `怪物图鉴2025/妖精/地精/地精武者.htm` | 重复实例、远程、附赠动作 |
| Monster | 火巨人 | `urn:uuid:89061a89-389d-5eb3-ac14-e3c539feeba5` | `怪物图鉴2025/巨人/序位巨人/火巨人.htm` | 巨型 3×3、远程、推离 |
| Monster | 眼魔 | `urn:uuid:5752e02e-5174-5805-bf1a-e96a3f8a6f23` | `怪物图鉴2025/多类型/眼魔/眼魔.htm` | 大型、飞行、锥域、状态、次数资源 |
| NPC | 斥候 | `urn:uuid:3d41b593-6297-5a65-9c47-18d9e34e768c` | `怪物图鉴2025/类人/斥候/斥候.htm` | 友方远程、多重攻击 |
| NPC | 祭司 | `urn:uuid:6de197a8-985f-51ad-bca0-10908e6b15b0` | `怪物图鉴2025/类人/祭司/祭司.htm` | Buff、治疗、持续效果、次数资源 |
| NPC | 魔法师 | `urn:uuid:6bd7fbe8-f5cd-50ce-a8f9-bad87a385644` | `怪物图鉴2025/类人/魔法师/魔法师.htm` | 中立关系、范围施法、反应、次数资源 |

这些条目采用 MM 2025 的怪物式次数施法，不得错误建模成玩家法术位。

## 规则结论与待决项

### v0.6.0 复活、转生与受控不死生物提示 Entry

- 上述八个法术 Entry 及遗体防腐辅助 Entry 已由 User 于 `2026-08-31` 随 `version-work/v0.6.0/ABC.md` 批准，只用于本地私有产品中的简短规则提示、建议值、详细参考和来源展示。
- 产品先由 DM 选择实际结果，再显示适用法术；提示不得成为资格、材料、时间、灵魂、尸体或剧情身份的强制合法性 Gate。
- DM 可以采用建议、明确改判、标记不适用、不追踪、未知或使用自定义依据；最终对象关系与 DM 确认值高于提示默认值。
- 克隆术的 120 日、复活期限、遗体防腐有效区间和不死生物控制期限均不建立自动计时；不把一次长休等同于 24 小时。
- 活化死尸与唤起亡灵的目标、Template、数量、升环、命令与控制期限只提供候选提示；系统不自动宣称施法合法。
- 遗体防腐只作为尸体/死亡记录的辅助提示，不是第九个死亡后结果，不自动计算时间或阻止 DM 裁定。
- **Status：** `Approved / Frozen for v0.6.0 non-blocking guidance / Implementation Not Authorized`。中文翻译、出版身份、许可与再分发权继续为 `unknown`。

### PC 0 HP、死亡豁免与稳定（v0.4.0 Approved ABC）

- 本地 Markdown 已定位到明确标注为“玩家手册2024”的治疗、生命值、0 HP、死亡豁免、稳定、死亡和昏迷条目；文件 SHA-256 已于 `2026-08-25` 只读复核为 `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8`。
- 候选自动化只包括：过量伤害死亡、0 HP 昏迷、回合开始死亡豁免、三次成功/失败、天然 `1`/`20`、0 HP 受伤、医疗稳定和正 HP 治疗恢复。攻击是否命中/重击、伤害来源、医疗检定最终值和其他复杂事实仍由 DM 明确输入或确认。
- 昏迷状态的完整攻击优势、自动重击、持握物掉落等外围效应只作提示，不进入本候选自动执行范围；稳定后 `1d4` 小时恢复也不自动执行，因为当前产品没有战役时间 Authority。
- **Status：** `Approved / v0.4.0 ABC-scoped / Implemented / User Human Acceptance Passed / Review Approved — User / Archived — Local Private`。User 已明确批准并冻结 `version-work/v0.4.0/ABC.md`，并另行授权 Implementation、批准 Review、Local Private Release 与 Archive；以上 Entry 已在该 ABC 的自动化边界内实现，不得扩张到复活、完整昏迷效果、法术/伤害引擎或其他交付。
- 中文文本的官方翻译身份、出版身份、许可与再分发权继续为 `unknown`；候选只用于本地私有产品验证。

### 0 HP 与死亡（v0.2.0 限定结论）

- 本地 Markdown 锚点记载：生物死亡后不能恢复 HP，直到被复活；多数 DM 会在怪物 HP 降至 `0` 时判定其死亡，重要 NPC 可另作处理；角色 `0 HP` 涉及昏迷、即时死亡与死亡豁免。
- **Status：** `Approved / v0.2.0 limited DM record`。本版本只允许怪物/NPC 在 HP 降至 `0` 时被明确记录为死亡、退出先攻并保留尸体棋子；DM 可用审计事件特许其以 1 HP 复起，或以新 `CombatantInstance` 作特殊复苏/转化。
- 在 v0.2.0 的冻结限定范围内，不自动判断即时死亡、治疗/复活法术、材料、死亡豁免、稳定或角色 `0 HP`；当时角色显示“死亡豁免待后续实现”。后续 v0.4.0 已按独立 Approved ABC 实现并归档 PC 0 HP 状态机，不追溯改写 v0.2.0 历史范围。
- 此锚点的原始 Entry UUID 不可得，故仅作为当前受限本地资料的可复核 Markdown 定位，不推导出版、翻译、授权或再分发结论。

### 斜向移动

- PHB 2024 默认：直线邻接与斜线邻接均消耗 1 格，即默认每格 5 尺。
- DMG 2024 可选：对角线依次按 5 尺、10 尺交替。
- **推荐：** `five-feet` 为 v0.1.0 默认，同时把 `five-ten-alternating` 作为设置项。
- **Status：** `Approved`。默认 `five-feet`，同时提供 `five-ten-alternating` 设置项。

### 范围覆盖

- DMG 2024：效应区域至少覆盖半格时整格受影响；源点选择格点交点。
- 旧版可选模板法：任意部分覆盖即包含；与 DMG 2024 半格规则结果可能不同。
- **推荐：** 最新规则 `intersection-area >= 50% cell-area`；仅接触边线/顶点、交叠面积为 0 时不算覆盖。DM 可手动增删目标。
- **Status：** `Approved`。连续交叠面积 `>= 50%`；零面积边线/顶点接触不算覆盖。

### 单位覆盖

候选规则：一个单位占据的任一方格被范围覆盖时，单位进入自动候选列表；最终目标由 DM 确认。对于多格单位，日志同时保存命中的占位格。

### 先攻

- 每名参战者在战斗开始时进行敏捷检定决定先攻；现场投骰的基础计算为 `d20 + 先攻调整值`。
- 2025 怪物条目的“先攻”字段列出投骰使用的先攻调整值。该值通常等于敏捷调整值，但可能额外包含熟练等调整，因此参考怪物优先使用条目显式值，不从敏捷机械反推；DM 仍可在 Terminal 投入表单中覆写。
- 本版本准入默认值：丧尸 `-2`、骷髅 `+3`、地精喽啰 `+2`、食人魔 `-1`、狼 `+2`、火巨人 `+3`、眼魔 `+12`。特别是火巨人敏捷调整值为 `-1`、显式先攻为 `+3`；眼魔敏捷调整值为 `+2`、显式先攻为 `+12`，可证明不能一律从敏捷反推。
- **本地证据：** `Lore_01_核心玩家规则.md` 第 5247、10034、21523 行附近，SHA-256 `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8`；`Lore_02_怪物图鉴大全.md` 第 35075 行及上述七个怪物条目，SHA-256 `932b6a77f0d3bc25aedc112a450ddaefddab2a9face462a91f1cc892934e39db`。仅用于本地私有验证，翻译、出版身份与再分发授权仍为 `unknown`。
- 先攻从高到低，序列每轮保持一致。
- 平局：DM 决定怪物间顺序；玩家决定同值玩家角色顺序；玩家角色与怪物同值时由 DM 决定。
- 完全相同的一组怪物可共用一次先攻；数据模型使用 `initiativeGroupId`，不合并实例状态。

### 行动经济与持续状态

- 每回合最多一个普通动作；只有规则授予时才有附赠动作，且每回合最多一个。
- 反应使用后到该单位下个回合开始前不可再次使用。
- 状态按各自来源独立记录持续时间；同名状态通常不叠加强度。
- 专注是一种独立持续效果关系；复杂中断与豁免由 DM 确认，系统保留提示与事件。

## 已知冲突与不确定性

1. Export 同时含 2014、2024、2025、第三方与模组资料；默认最新策略不能替代用户对实质冲突的批准。
2. 斜向移动有同版默认与可选规则。
3. 范围覆盖存在 2024 半格口径与旧版任意部分覆盖口径。
4. 中文译名、文本勘误、出版身份与授权状态未外部核验。
5. `square` 是产品二维形状；D&D 规则常用 `Cube`、`Sphere` 等三维术语。每个能力必须保存原规则形状与二维投影形状，不能把两者静默等同。
