# ABC：v0.4.0 PC 0 HP、死亡豁免与稳定状态

- **交付 ID：** `v0.4.0`
- **交付类型：** Minor / Local Private Candidate
- **内部 Slice：** `v0.4.0-S1`（本交付唯一实施 Slice）
- **状态：** `Approved / Frozen — Original S1 + Amendment 01 User Human Acceptance Passed / Review Approved — User / Released — Local Private`
- **范围讨论决定：** User 于 `2026-08-25` 确认采用“一份 ABC、一个主 Slice、一次 Implementation、一次综合验收”的方案
- **ABC 批准：** User 于 `2026-08-25` 明确批准（`Granted / Frozen`）
- **Implementation 授权：** `Granted / User / 2026-08-25`
- **Review / Release / Archive 授权：** `Review Approved — User / 2026-08-25`；`Released — Local Private / 2026-08-25`；`Archive Not Granted`
- **正式产品基线：** `v0.3.1 Archived — Local Private`
- **技术起点：** Git `main@444cdce1248ab4173bbfd904b91a0cebb0000d38`
- **草案日期：** `2026-08-25`
- **批准权：** User
- **文档 Authority：** `/Users/chenzehao/Vaults/obsidian/obisidian/理工学习相关/DND Terminal`
- **产品 Workspace：** `/Users/chenzehao/Projects/DND Terminal`
- **规则来源区：** `/Users/chenzehao/Antigravity Source/lorebuddy-规则书/NotebookLM_Version`（只读）

User 已于 `2026-08-25` 明确批准本 ABC；ESG 适用性、A/B/C 范围、D40-000 至 D40-013、兼容性、测试与回退合同现已冻结。原 S1 与之后获批的 `AMENDMENT_01.md` 均已获 User Human Acceptance；User 随后批准 Review，且 Local Private Release 已按授权完成。该授权不授予修改用户数据、规则来源、分支、Commit、Push、Archive、部署或公开发布权限。

## 0. ESG 适用性与采纳

### 0.1 当前 Core

| 字段 | v0.4.0 草案记录 |
|---|---|
| Adopted Artifact | Downstream Documentation Schema Core |
| Version | `schema-v0.3.0` |
| Core SHA-256 | `4a95a932eba5e549fa96449c178ce18ecc049513a3697b041b08dbd8736f4f4d` |
| Compatible Governance Baseline | Minimal Governance Framework `schema-v0.2.0` |
| Baseline SHA-256 | `84b0fbbe1dd5703acfcda63b297a115e725c79629647d807ae3664a55c4aa727` |
| Repository / Distribution Identity | Engineering Schema Governance 正式 Obsidian Authority；released Git identity `8ff6fc1d387557fa2b79591ce12955e9f003da72` |
| Project-Relative Core Path | `documentation-schema/schema-v0.3.0/DOCUMENTATION_SCHEMA.md` |
| Scope | v0.4.0 ABC、Implementation、Testing、Review、Release/Archive 记录及其门禁身份；不改变产品规则或数据 Authority |
| Applicability Decision / Authority / Date | `Core Applicable / Keep Current` / User / `2026-08-25` |

### 0.2 Milestone Documentation Profile

- **Profile：** `schema-v0.3.0 Milestone Documentation Profile`；SHA-256 `48311b2f51600e25df249162414478f96963d194e4c59d2b663355ae4e39b22a`。
- **v0.4.0 Applicability：** `Not Applicable`。
- **理由：** 本交付只有一个 `v0.4.0-S1`，没有多个可独立授权 Slice、跨 Slice 汇总门禁或 Milestone/产品版本双轴退出状态；单一 Slice 名称本身不触发 Profile。
- **历史边界：** M1/v0.3.0 的 `Core + Required Profiles` 采纳保持冻结，不因 v0.4.0 判定为 `Not Applicable` 而追溯改变。

### 0.3 Archive Contract/Profile

- 当前 Gate 尚未获得 Archive 授权，Archive Contract/Profile 状态为 `Not Selected / Not Applicable at Current Gate`。
- v0.3.0/v0.3.1 曾采用的 `schema-v0.1.1` Archive Contract 与 `schema-v0.1.2` Lightweight Archive Profile 不自动继承到 v0.4.0。
- 若未来 User 授权 v0.4.0 进入 Archive 方向，必须在创建 Archive 材料前单独记录适用性、版本、SHA-256、选择理由、选择日期和 Selecting Authority。

## 1. A——目标与拟实施范围

### A-1 用户问题与版本目标

当前产品只支持怪物/NPC 的 DM 死亡记录。玩家角色降至 `0 HP` 时没有独立的昏迷、死亡豁免、稳定与死亡闭环，也无法在刷新恢复、事件日志、回合推进和战后审核中保持一致表达。

`v0.4.0` 只交付一个垂直能力：让 DM 在本地单人战斗会话中完整记录并裁定 PC 的 `0 HP` 生命周期，同时保持 DM 最终裁定权、顺序事件、兼容迁移和长期角色卡隔离。本交付不是完整伤害、状态、法术或复活规则引擎。

### A-2 单一 Slice

`v0.4.0-S1` 一次 Implementation 内完成以下组成部分；它们不是分别授权的 S1/S2/S3/S4：

1. 精确规则准入与自动化边界；
2. PC 生命状态和死亡豁免数据合同；
3. 事件、回合、保存、刷新恢复和旧会话兼容；
4. 战斗 UI、日志、DM 覆写和战后隔离；
5. 自动测试、隔离浏览器验证和 User Human Acceptance 支持；
6. 不阻塞主能力的两项顺手展示修复。

### A-3 规则准入与裁定边界

实施只可使用 `docs/extensions/rules-baseline.md` 中为本交付登记并在 ABC 批准时一并确认的 2024 本地 Markdown Entry：

- 治疗、生命值与生命值降至 0：`Lore_01_核心玩家规则.md` 第 21263–21317 行；
- 死亡与死亡豁免术语：同文件第 35886–35895 行；
- 伤势稳定术语：同文件第 36218–36221 行；
- 昏迷状态：同文件第 36774–36783 行；
- 当前文件 SHA-256：`b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8`。

上述定位只授权本地私有产品行为，不证明中文文本的官方翻译身份、出版身份、许可或再分发权。Implementation 开始前必须重新核对文件哈希；不一致时停止规则自动化并回到 ABC Amendment，不得凭聊天或模型常识补齐。

自动化允许：

- 由明确伤害数值判断 PC 是否降至 `0 HP`；
- 用明确的伤害余量与 HP 上限判断过量伤害死亡；
- 在 PC 以 `0 HP` 开始其回合时进入死亡豁免流程；
- 按 DM 确认的 d20 结果记录成功/失败、天然 `1`、天然 `20`、第三次成功稳定与第三次失败死亡；
- 按 DM 明确输入的“0 HP 时受伤”“是否重击”“伤害值”记录一次/两次失败或死亡；
- 按 DM 确认的协助动作、施救者和医疗检定最终值记录稳定；
- 任何正 HP 治疗使未死亡 PC 恢复可行动状态，并清零死亡豁免计数。

自动化不允许：

- 自动判断攻击是否命中、是否重击、伤害类型、抗性、免疫、法术合法性或复活条件；
- 自动执行昏迷状态的全部攻击优势、自动重击、掉落持握物等外围规则；这些只可提示 DM；
- 自动处理稳定角色 `1d4` 小时后的恢复，因为当前产品没有战役时间 Authority；
- 把击晕、复活法术、灵魂选择、材料消耗或永久角色死亡附带进入本交付。

### A-4 PC 生命状态合同

- `CombatantInstance` 继续是单场生命状态 Authority；`CharacterSheet` 在战斗期间只读。
- 既有 `lifeStatus` 必须扩展或由等价的单一权威结构表达至少 `alive | unconscious | stable | dead | transformed`，不得同时维护两个互相冲突的生命状态事实源。
- 只有 `kind: character` 自动进入 PC `0 HP` 流程；怪物/NPC 继续沿用 v0.2.0 的 DM 死亡记录，不因本交付自动获得死亡豁免。
- 死亡豁免轨迹至少保存成功数、失败数、每次确认的 d20、结果、发生轮次、事件 ID 和来源。
- `unconscious` PC 保留先攻位置；其回合开始时只处理死亡豁免，不获得普通动作、附赠动作、反应或移动。
- `stable` PC 保持 `0 HP`、不继续死亡豁免、不能正常行动；受到伤害后解除稳定并按规则记录失败或死亡。
- `dead` 与 `temporarily-away`、`participation-ended`、`transformed` 必须保持不同语义；死亡不得伪装为临时离场。
- 天然 `20` 恢复 `1 HP` 后回到 `alive`；任何其他明确治疗恢复至正 HP 时同样回到 `alive`。死亡生物不能通过普通治疗恢复。
- 第三次成功或医疗稳定使成功/失败计数归零但保留历史轨迹；恢复任意正 HP 同样清零当前计数但不删除既有事件。
- 医疗稳定必须记录施救者、最终检定值与是否消耗协助动作；在正常战斗回合内默认要求当前行动者具有普通动作。任何越权稳定只能走带原因的 DM 修正事件。
- 既有“DM 特许 1 HP 复起/特殊转化”继续只服务怪物/NPC 的 v0.2.0 窄流程；PC `dead` 不得借该入口绕过本交付明确排除的复活规则。
- DM 可使用明确、带原因的人工修正事件处理录入错误或桌面裁定；不得无痕改写历史。

### A-5 事件与撤销

- 所有生命状态、死亡豁免、0 HP 受伤、稳定、治疗恢复和 DM 修正均追加顺序 `CombatEvent`。
- 事件至少保存对象、前后状态、规则输入、DM 输入、结果、轮次、行动者、规则引用和修正原因。
- 本交付新增事件必须接入现有“当前页面运行期间”的补偿式撤销，撤销通过 `undoOfEventId` 追加补偿事件，不删除原事件。
- 刷新后必须恢复当前生命状态、死亡豁免轨迹和可读事件；不要求恢复刷新前事件的内存撤销检查点。
- 若刷新前历史事件因既有压缩合同没有 `before` 检查点，UI 必须明确提示不可撤销，不得伪造恢复状态。

### A-6 会话 Schema、存储与回退

- Delivery Version 提升为 `0.4.0`。
- PC 生命状态属于持久化业务语义变更，Session Envelope Schema 候选提升为 `0.3.0`；`CharacterSheet Schema = 0.3.0-m1-s5` 保持不变。
- 新会话使用新的 copy-on-write key `dnd-terminal.v0.4.0.session.current`；现有 `dnd-terminal.v0.3.0-m1-s5.session.current` 和 `dnd-terminal.v0.2.0.session.current` 只读保留，不移动、不删除、不原地覆盖。
- v0.4.0 首次没有新 key 时，可从支持的 v0.1/v0.2 Envelope 或现有 v0.3.1 浏览器会话读取副本并迁移；只有迁移、规范化和校验全部成功后才写入新 key。
- 旧数据中的 PC 若为 `0 HP` 且没有可证明的生命状态或死亡豁免历史，不得自动推断为死亡、稳定或已有豁免结果；必须标记为 `needs-review` 等价状态并由 DM 显式解决后才能继续该角色的回合。
- 新 key 解析或校验失败时不得静默回退到空会话并随后覆盖；应保留原始值、显示错误，并允许用户选择导入或新建。完整 Recovery Mode、快照历史和故障包管理不在本交付。
- v0.4.0 导出必须携带 `schemaVersion: "0.3.0"` 与 `deliveryVersion: "0.4.0"`；导入继续接受 v0.1/v0.2，并拒绝未知未来 Schema 且不覆盖当前数据。
- 模板库、长期角色库及其现有 localStorage key 不变。
- 代码回退到 `main@444cdce…` 时，v0.3.1 继续读取其未被修改的旧 key；回退后的 v0.3.1 不承诺读取 v0.4.0 新会话。用户必须知晓回退会回到 v0.4.0 实施前的旧会话视图。

### A-7 回合与战后边界

- 回合推进必须区分“仍占据先攻位置”与“能够正常行动”；不能因 `0 HP` 而跳过需要死亡豁免的 PC 回合。
- 当轮到 `unconscious` PC 时，界面必须完成本次死亡豁免，或由 DM 以带原因的人工修正事件明确解决，才能继续推进；不得无记录跳过。
- `stable`、`dead` 和 `needs-review` PC 不执行普通行动；界面显示原因和可用的 DM 操作。
- 战后仍只通过 `PostCombatDiff` 审核 HP、资源、施法资源和库存等既有字段。
- `unconscious`、`stable`、`dead`、死亡豁免计数和单场生命状态不得自动写入 `CharacterSheet`、不得自动归档角色、不得创建永久死亡事实。
- DM 可按既有合同接受、拒绝或修正当前 HP 候选；永久死亡、复活和长期损伤继续属于后续独立范围。

### A-8 UI 与顺手修复

战斗 UI 至少显示：

- 当前 PC 生命状态；
- 死亡豁免成功/失败计数与逐次记录；
- 当前回合必须处理的死亡豁免；
- 0 HP 受伤的伤害、重击和 DM 确认入口；
- 医疗稳定、治疗恢复、DM 修正与其规则边界；
- 死亡、稳定、临时离场和参与结束的区别。

允许顺手完成两项不阻塞主能力的展示修复：

1. 施法属性 `intelligence`、`wisdom` 等只在 UI 显示为简体中文，稳定内部 ID 不变；
2. 移除 footer 中把冻结 `M1-S5` 标为当前候选/交付的残留文字。

若两项修复需要扩大 Schema、重构角色详情或影响主功能进度，应延期并如实记录，不阻塞本交付。

## 2. B——受保护边界

本交付不得：

1. 修改、重写、移动或重打包 v0.3.1 及更早版本的 ABC、Implementation、Testing、Review、Release Notes、Archive、发布包、代码快照或校验清单；
2. 修改 Rules Baseline 的来源文件、原始 Excel、用户导出或其他用户数据；
3. 原地迁移、删除或覆盖 v0.3.1/v0.2.0 旧会话 key；
4. 提升或改变 `CharacterSheet Schema`、角色修订、投影、关联单位、武器精通、施法资源或战后回写合同；
5. 实现跨刷新历史撤销、通用逆向补丁框架、完整快照历史或全事件持久化检查点；
6. 建设完整 Recovery Mode、密码学完整性协议、故障数据中心或跨设备恢复；
7. 建设大型 E2E/视觉差异平台，或为本交付重构整个 `app.js`；
8. 自动裁定完整昏迷状态、击晕、复活、法术、抗性、免疫、攻击命中、伤害掷骰或其他玩法能力；
9. 自动把单场死亡或稳定状态写入长期角色卡或角色 Archive；
10. 附带实施 BL-019、BL-021 至 BL-024、完整 BL-025 或其他 Backlog 项；
11. 因范围讨论通过或 ABC 批准自动推导 Implementation、分支、Commit、Push、Review、Release、Archive、部署、公开发布或再分发授权。

## 3. C——明确不属于 v0.4.0 的范围

- 怪物/NPC 完整死亡豁免；
- 攻击、伤害、抗性、免疫与治疗法术的完整自动结算；
- 昏迷状态全部规则效果的自动执行；
- 非致命击晕完整流程；
- 复活、转生、灵魂、材料或永久角色死亡；
- 稳定后 `1d4` 小时自动恢复和战役时间系统；
- 跨刷新历史撤销和通用事件存储重构；
- 完整 Recovery Mode、自动快照、密码学 checksum 与跨设备同步；
- 完整角色详情本地化或 UI 全面重构；
- 大型通用浏览器 E2E 平台；
- 全量法术、武器精通、职业合法性、多人、部署或公开发布。

## 4. D——冻结决定

| ID | 决策项 | 草案决定 | 影响 |
|---|---|---|---|
| D40-000 | ESG 适用性 | Core `schema-v0.3.0` 继续采用；Milestone Profile 对单一 Slice 不适用；Archive Contract/Profile 当前不选择 | 让治理 Schema、Profile 与产品版本保持分离。 |
| D40-001 | 版本结构 | 一份 ABC、一个 `v0.4.0-S1`、一次 Implementation、一次综合验收 | 不为支撑工作建立四个独立 Slice。 |
| D40-002 | 主能力 | 只完成 PC 0 HP、死亡豁免、稳定与死亡垂直闭环 | 形成可感知的 minor 功能，不拼接无关 Backlog。 |
| D40-003 | 规则版本 | 使用已定位的 PHB 2024 本地 Markdown 候选 Entry | 不沿用 2014 锚点，不凭聊天补规则。 |
| D40-004 | DM Authority | 自动化只处理明确数值和已确认骰点；复杂攻击/伤害事实由 DM 输入 | 保持本地单 DM 产品边界。 |
| D40-005 | 生命状态 | 单一权威状态；PC 与怪物/NPC 路径分开 | 避免 `dead`、临时离场和稳定互相冒充。 |
| D40-006 | 会话 Schema | 候选提升为 `0.3.0`；角色 Schema 不变 | 数据格式变化与 Delivery Version 分离。 |
| D40-007 | 存储迁移 | 新 key copy-on-write；旧 key 只读保留 | Git 回退不会原地破坏旧会话。 |
| D40-008 | 撤销 | 新事件接入当前会话补偿撤销；不做跨刷新撤销 | 满足主能力，避免通用事件存储重构。 |
| D40-009 | 恢复 | 只做迁移失败不覆盖和明确错误 | 不扩张为完整 Recovery Mode。 |
| D40-010 | 战后 | 单场生命状态不自动进入长期卡 | 保持 CharacterSheet 与 CombatantInstance 隔离。 |
| D40-011 | 测试 | 针对性自动测试 + 隔离浏览器流程 + User Human Acceptance | 不建设大型测试平台。 |
| D40-012 | 展示债务 | 中文显示/footer 只允许顺手修复且不阻塞 | 不把小优化包装成版本主体。 |
| D40-013 | 门禁 | ABC、Implementation、Human Acceptance、Review、Release、Archive 分别授权 | 前一状态不自动授予后一状态。 |

User 已于 `2026-08-25` 批准 D40-000 至 D40-013；以上决定现为 `Approved / Frozen`。任何实质调整都必须形成 Amendment，说明范围、规则、数据、测试和回退影响，并重新获得 User 批准；不得在 Implementation 中静默偏离。

## 5. 兼容性合同

| 输入/状态 | v0.4.0 预期行为 |
|---|---|
| v0.1.0/v0.2.0 Envelope | 读取副本、显式迁移、校验成功后写入 v0.4.0 新 key |
| v0.3.1 当前浏览器会话 | 从旧 key 读取副本；旧 key 保持原值 |
| 旧 PC `HP > 0` 且无生命状态 | 规范化为 `alive`，不补造死亡事件 |
| 旧 PC `HP = 0` 且无生命状态 | 标记 `needs-review`，由 DM 明确解决，不补造豁免历史 |
| v0.4.0 / Session Schema 0.3.0 | 直接校验并恢复状态、轨迹和事件 |
| 未知未来 Schema | 安全拒绝，不覆盖当前内存或任何存储 key |
| 损坏的新 key | 保留原始值并显示错误，不静默新建后覆盖 |
| 代码回退至 v0.3.1 | v0.3.1 从未改动的旧 key 恢复；不读取 v0.4.0 新会话 |
| CharacterSheet 与模板库 | Schema、key 和现有记录均不迁移 |

## 6. 测试与验收合同

### 自动测试

至少覆盖：

- 正常降至 0、过量伤害即时死亡、非过量伤害昏迷；
- 死亡豁免 `2–9`、`10–19`、天然 `1`、天然 `20`；
- 第三次成功稳定、第三次失败死亡、计数不要求连续；
- 0 HP 受伤一次失败、重击两次失败、伤害达到 HP 上限死亡；
- 稳定后受伤重新进入濒死流程；
- 治疗恢复、计数清零、死亡生物拒绝普通治疗；
- 医疗稳定成功/失败、施救者、动作消耗与 DM 修正追加可读事件；
- 当前会话内补偿撤销保留原事件；刷新后不伪造撤销检查点；
- `unconscious` PC 的先攻位置与死亡豁免回合、`stable/dead` 的不可行动状态；
- 怪物/NPC 原有死亡流程不回归；
- 旧会话迁移、`HP = 0` needs-review、新 key copy-on-write、损坏数据不覆盖；
- 战后不把死亡豁免、稳定或死亡状态写入 CharacterSheet；
- v0.3.1 全部既有自动回归继续通过。

### 隔离浏览器验证

使用独立 origin 和合成夹具，至少完成：

1. 导入/迁移旧 v0.3.1 会话；
2. 使一名 PC 降至 0，完成多次死亡豁免并刷新；
3. 验证刷新后状态、计数、事件和回合位置一致；
4. 验证医疗稳定、0 HP 受伤、治疗恢复和 DM 修正；
5. 验证损坏导入/新 key 不覆盖当前或旧数据；
6. 导出 Session Schema 0.3.0，并重新导入继续操作；
7. 验证浏览器 console 无未解释 error/warning。

不直接读取、迁移或破坏用户唯一一份真实 localStorage。自动测试和浏览器验证不能替代 User Human Acceptance。

### Human Acceptance

由 User/DM 至少确认：

- PC 0 HP 流程在战斗中可理解、可操作；
- 死亡豁免与回合推进不会漏回合或错误授予行动；
- 稳定、死亡、临时离场和怪物死亡在 UI 上可区分；
- 刷新后能够继续当前濒死流程；
- 战后没有把单场生命状态偷偷写入长期角色卡；
- 错误和 DM 覆写文案不会冒充完整 D&D 自动裁定。

## 7. 回退合同

- 技术回退锚点为 `main@444cdce1248ab4173bbfd904b91a0cebb0000d38`。
- 回退只撤销 v0.4.0 产品代码和测试变更；不得修改 v0.3.1 Archive、发布包或 Authority 冻结历史。
- 因旧会话 key 保持不变，回退后的 v0.3.1 可恢复实施前会话；v0.4.0 新会话仍保留在新 key，不自动删除。
- 回退时不得尝试把 Session Schema 0.3.0 降级写回旧 key。
- 若 User 需要保留 v0.4.0 期间产生的战斗内容，应先用 v0.4.0 导出；旧版不承诺读取该数据。
- 回退后重新执行 v0.3.1 全部测试，并复核 v0.3.1 25 文件快照、ZIP 与 manifest 未变化。

## 8. Exit Gate 与当前停止点

### Scope Discussion Gate

- **状态：** `Passed / User / 2026-08-25`；
- 已确认不再使用四个独立 S1/S2/S3/S4；
- 已确认版本采用一个主 Slice，支撑工作一次执行；
- 已确认进度优先、代码允许依靠 Git 回退，但用户存储不得被不可逆破坏。

### ABC Gate

- **状态：** `Passed / Approved-Frozen / User / 2026-08-25`；
- User 已明确批准本文 ESG 适用性、A/B/C/D、兼容性、测试和回退合同；
- 本文现为 `Approved / Frozen for Implementation`，但不自动授予 Implementation；
- 任何实质修改都必须形成 Amendment 并重新批准。

### Implementation Gate

- **状态：** `Completed / Evidence Recorded / 2026-08-25`；
- User 已在 ABC 批准后另行发出“同意版本实施”的独立实施指令；
- 允许在本文冻结范围内修改产品源码、测试与 v0.4.0 Implementation/Testing 记录；不允许静默改变 ABC。

### 后续 Gate

Implementation、User Human Acceptance、Independent Review、Local Private Release 与 Archive 均保持独立。原 S1 与 Amendment 01 的 User Human Acceptance 均已通过，Review 已获 User 批准，Local Private Release 已完成。未创建分支、Commit、Push 或 Archive 材料。
