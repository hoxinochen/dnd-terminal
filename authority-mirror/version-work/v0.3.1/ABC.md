# ABC：v0.3.1 版本身份与兼容性补丁

- **交付 ID：** `v0.3.1`
- **交付类型：** Patch / Local Private Candidate
- **状态：** `Approved / Frozen — Review Approved / Released — Local Private / Archive Authorized`
- **命名决定：** User 于 `2026-08-24` 明确将本维护交付命名为 `v0.3.1`
- **ABC 批准：** User 已于 `2026-08-24` 批准（`Granted / Frozen`）
- **Implementation 授权：** User 已于 `2026-08-24` 明确授予（`Granted`）
- **Review / Release / Archive 授权：** 均未授予
- **基线产品：** `v0.3.0 Archived — Local Private`
- **技术起点：** post-v0.3.0 Git baseline `0a90260e5e490fbb8415b83c52601f12c21935a5`
- **草案日期：** `2026-08-24`
- **批准权：** User
- **文档 Authority：** `/Users/chenzehao/Vaults/obsidian/obisidian/理工学习相关/DND Terminal`
- **产品 Workspace：** `/Users/chenzehao/Projects/DND Terminal`
- **规则来源区：** `/Users/chenzehao/Antigravity Source/lorebuddy-规则书/NotebookLM_Version`（只读；本交付不使用新规则事实）

User 已于 `2026-08-24` 批准本 ABC；A/B/C 范围与 D31-001 至 D31-010 决定现已冻结。ABC 批准只冻结交付合同，不授权产品代码、测试、用户数据、规则来源、发布包或冻结历史的任何变更。具体施工顺序见同目录 `IMPLEMENTATION_PLAN.md`，该计划从属于本 ABC，不能自行扩大范围或授予实施权限。

## 1. A——目标与拟实施范围

### A-1 目标

在不增加玩法能力、不改变既有数据格式且不迁移用户数据的前提下，明确区分以下四种身份：

1. 产品交付版本（Delivery Version）；
2. 战斗会话 Envelope Schema；
3. 长期角色 `CharacterSheet` Schema；
4. 浏览器存储 namespace。

当前产品能够运行，但源码和 UI 同时出现 `0.2.0` 会话兼容层、`0.3.0 M1-S5` 交付文字、`0.3.0-m1-s5` 角色 Schema 和多组历史存储键。`v0.3.1` 只消除这些名称所造成的身份歧义，并用自动测试证明旧数据继续兼容；不得借机改变其业务语义。

### A-2 版本身份显式化

- 产品交付版本明确为 `v0.3.1`。
- 会话 Envelope Schema 继续保持 `0.2.0`；不得因交付版本变化而无依据地提升 Schema。
- `CharacterSheet` Schema 继续保持 `0.3.0-m1-s5`；本补丁不改变角色数据形状、字段含义或修订语义。
- 现有浏览器存储键保持不变，包括当前会话、角色记录、模板库及兼容读取键。
- 源码中应使用语义清晰的常量名称表达上述身份，避免把 Delivery Version 当作 Schema Version。
- 产品 UI 应显示当前交付身份与会话兼容层的区别，不再把冻结的 `M1-S5` 切片名称冒充当前交付状态。

### A-3 导入导出兼容标识

- JSON 导出的 `schemaVersion` 与 `appVersion` 继续保持既有 `0.2.0` 会话 Envelope 语义，以维持旧导入链路。
- 导出 Envelope 可新增可选的 `deliveryVersion: "0.3.1"` 元数据；这是向后兼容的来源标识，不参与会话 Schema 校验，也不改变业务数据。
- 导入器必须继续接受现有受支持的 v0.1.0/v0.2.0 Envelope；存在或缺少 `deliveryVersion` 都不得改变兼容结果。
- 未知或未来 Schema 继续安全拒绝，且不得覆盖当前内存会话、浏览器存档或角色记录。
- 导入错误文案应明确区分“交付版本”与“受支持的 Envelope Schema”，避免把补丁版本误表述为数据格式版本。

### A-4 兼容性与回归验证

- 建立专门的 v0.3.1 版本身份/导入导出兼容自动测试。
- 证明现有存储键没有变化，不触发浏览器数据搬迁、复制或删除。
- 证明 v0.3.0 现有会话、角色修订、投影、关联单位、施法资源、武器精通候选和战后差异均保持原语义。
- 现有全部自动测试必须继续通过；实际执行结果记录到获授权后创建的 `TESTING.md`，计划本身不得写成通过事实。
- 至少完成一次隔离浏览器工作流：加载旧存档、刷新、导出、重新导入并继续操作。不得直接用唯一一份真实用户数据作破坏性测试。

## 2. B——受保护边界

本交付不得：

1. 修改、重写、移动或重打包 `v0.3.0` 的 ABC、Implementation、Testing、Review、Release Notes、Archive、代码快照、ZIP 或校验清单；
2. 把 post-v0.3.0 Git baseline 追溯声明为 v0.3.0 的正式 Release 或 Archive 身份；
3. 新建或切换 localStorage namespace，迁移、复制、删除或覆盖浏览器用户数据；
4. 提升会话 Envelope Schema 或 `CharacterSheet` Schema；
5. 改变 `CharacterDraft → CharacterSheet revision → CombatProjection → CombatantInstance → CombatEvent → PostCombatDiff → revision N+1` 数据链；
6. 改变事件历史、补偿式撤销、战后回写、角色归档/恢复/删除或会话保存失败保护语义；
7. 新增角色 0 HP、死亡豁免、完整武器精通、法术执行、伤害结算或任何其他玩法能力；
8. 修改 Rules Baseline、规则来源区、原始 Excel、用户导出或其他用户数据；
9. 将 BL-025 本地化、BL-020 角色死亡状态机或其他 Backlog 项附带进入本补丁；
10. 在 ABC 未获明确批准前修改产品代码或测试；
11. 因 ABC 批准自动推导分支、Commit、Push、Independent Review、Release、Archive、部署、公开发布或再分发授权。

## 3. C——明确不属于 v0.3.1 的范围

- PC 0 HP、昏迷、死亡豁免、稳定、即时死亡、治疗或复活状态机；
- 任何新的 D&D 规则准入或自动裁定；
- BL-025 角色详情术语本地化；
- 新存储格式、存储压缩策略重写、完整审计快照持久化或跨设备同步；
- 全职业/法术/武器精通合法性与执行引擎；
- 多人、账户、权限、云同步或公共部署；
- v0.4.0 的范围、ABC、Implementation 或版本承诺。

上述内容如需实施，必须建立独立交付或经 User 明确批准的后续合同，不得把 `v0.3.1` 当作隐含授权入口。

## 4. D——拟冻结决定

| ID | 决策项 | 草案决定 | 影响 |
|---|---|---|---|
| D31-001 | 版本号 | 本交付为 `v0.3.1` Patch | 表示兼容性维护，不宣称新增玩法能力。 |
| D31-002 | Delivery 与 Schema | Delivery Version、Session Envelope Schema、Character Schema、storage namespace 分别表达 | 防止版本字符串承担多种互相冲突的语义。 |
| D31-003 | 会话 Schema | 保持 `0.2.0` | 现有数据形状不变，不制造无意义迁移。 |
| D31-004 | 角色 Schema | 保持 `0.3.0-m1-s5` | 不改变长期角色数据合同。 |
| D31-005 | 浏览器存储键 | 全部保持不变 | 不搬迁、不复制、不删除现有用户数据。 |
| D31-006 | 导出来源标识 | 允许新增可选 `deliveryVersion: "0.3.1"`；既有 Schema 字段不变 | 让导出可追溯，同时保持旧导入兼容。 |
| D31-007 | UI 身份 | 显示 `v0.3.1` 交付与 `0.2.0` 会话 Schema 的区别 | 移除当前交付被标成 `M1-S5 候选` 的歧义。 |
| D31-008 | 规则与玩法 | 零新增、零变更 | 不需要新的 Rules Baseline 准入。 |
| D31-009 | 回退 | 以 Git baseline `0a90260…` 和旧导出为技术回退点；不需要数据降级 | Patch 撤回后旧数据仍可由原实现读取。 |
| D31-010 | 门禁 | ABC 批准、Implementation、Human Acceptance、Review、Release、Archive 分别授权 | 任何前一状态都不自动授予后一状态。 |

User 已于 `2026-08-24` 批准 D31-001 至 D31-010；它们现为本交付的 `Approved/Frozen` 决定。任何实质调整都必须以明确修订记录影响，并重新获得 User 批准；不得在 Implementation 中静默偏离。

## 5. 兼容性合同

| 输入/状态 | v0.3.1 预期行为 |
|---|---|
| 现有 localStorage 会话键 | 原键原地读取与写入，不迁移 |
| 现有角色记录键 | 原键原地读取与写入，不提升角色 Schema |
| v0.1.0 导出 Envelope | 沿既有兼容路径导入 |
| v0.2.0 导出 Envelope | 直接校验并导入 |
| 带 `deliveryVersion` 的 v0.3.1 导出 | 忽略其对 Schema 校验的影响，按 `schemaVersion` 导入 |
| 缺少 `deliveryVersion` 的旧导出 | 正常导入，不补造来源事实 |
| 未知未来 Schema | 安全拒绝，不覆盖当前数据 |
| 损坏或不完整 JSON | 安全拒绝，不覆盖当前数据 |

## 6. Exit Gate

### ABC Gate

- **状态：** `Passed / Approved-Frozen / 2026-08-24`；
- User 已明确批准本 ABC；
- 对任何 A/B/C/D 条款的实质修改都须先形成修订并重新获得 User 批准；
- 当前仍停留在 `Implementation Not Authorized`，等待独立实施指令。

### Implementation Exit Gate

- **状态：** `Implementation Complete / 2026-08-24`；
- 实际变更严格落在 A-2 至 A-4；
- 未修改 v0.3.0 冻结材料、规则来源或用户数据；
- 所有新增/修改测试和既有回归测试通过；
- 浏览器兼容流程已记录；下载完成事件的浏览器控制限制已在 `TESTING.md` 明确保留；
- 变更清单、未验证项、风险和回退结果已写入 `IMPLEMENTATION.md` 与 `TESTING.md`；
- 已停止，等待 User Human Acceptance，未进入 Review。

### Human Acceptance Gate

- **状态：** `Passed / User / 2026-08-24`；
- **验收授权语：** User 明确确认“人工验收通过 v0.3.1”；
- **结论范围：** 接受本 ABC A-2 至 A-4 下完成的版本身份、兼容性与 Chrome 缓存修复结果；不将自动化或浏览器证据伪装为独立评审；
- **后续状态：** Implementation 和 Human Acceptance 均已完成，但尚未授权或创建 Independent Review、Release 或 Archive。

### 后续 Gate

Human Acceptance、Independent Review、Local Private Release 和 Archive 均需要各自的明确 User 授权。User 已于 `2026-08-24` 在同一明确指令中授权完成后续三个 Gate；Review 已复核并获 User 批准，Local Private Release 已创建。Archive 仍须独立完成其快照、完整性、安全与 Summary Gate，完成前不得把 `v0.3.1` 标为 Archived。

## 7. 当前停止点

当前已完成交付命名、ABC 批准冻结、获授权的 v0.3.1 Implementation、User Human Acceptance、Independent Review 与 Local Private Release。产品代码和测试仅按本 ABC 改动；Rules Baseline、规则来源、v0.3.0 冻结材料和用户数据未进入变更。当前只执行已授权的 Archive Gate；在其完成前不声明 Archive 身份。

## 8. Archive Profile Selection

- **Selected Profile：** `Lightweight`。
- **Adopted Contract / Profile：** `schema-v0.1.1` Archive Contract（SHA-256 `7817687601b2bad7cc8f87015d5b8f6b8ae4fe504cd68abb30b8255b531133df`）与 `schema-v0.1.2` Lightweight Archive Profile（SHA-256 `7fc38398b5c131bddf16805e15f14382c0e4424be4bcf63ef115b0865643cb1e`）。
- **Selection Authority / Date：** User / `2026-08-24`；User 明确说明本次为“小更新”，并授权完成 Review、Release 与 Archive 三个 Gate。
- **Reason：** v0.3.1 已具备完整的 Approved ABC、Implementation、Final Testing、Review、Release Notes、发布包和 SHA-256 身份链。Lightweight 只合并归档叙述文件，不免除快照、完整性、测试、评审、秘密安全或八项 Archive Gate。
- **Decision Record：** 本节；其路径在归档开始前已固定为 `version-work/v0.3.1/ABC.md`。
