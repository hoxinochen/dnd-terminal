# v0.5.0-S1 Amendment 02：长期角色卡 DM 备注显示

- **状态：** `Approved / Frozen — Implementation Authorized`
- **批准与实施授权：** User / `2026-08-27` / “补充增加”
- **适用范围：** 仅为已存在的 CharacterSheet `note` 增加可读显示；不授权 S2A、S2B、S2C 或任何后续生命周期门禁。
- **基线 Authority：** [v0.5.0 ABC](ABC.md) §A-3、§A-7、§A-8、§5；[S1 Amendment 01](AMENDMENT_01.md)。

## 批准决定

角色卡需要一个明确、独立的 **DM 备注**显示模块，展示当前 CharacterSheet 修订已保存的 `note`。它使 Amendment 01 被接受的复活记录，以及其他已保存的 DM 备注，在角色页不再只作为“起源与经历”中的小字出现。

## 视图与数据合同

- 角色档案增加“DM 备注”页签，展示当前修订的完整 `note`，保留换行并标出修订号。
- 战后 `note-append` 候选在 DM 接受前仍只显示于“战后候选差异”；不得提前显示为长期角色卡事实。
- DM 接受候选后，既有 Amendment 01 的追加与新修订机制不变；新模块显示新修订的完整 `note`，而“导入与修订”继续显示 `note` 字段差异。
- 该模块纯读取既有 CharacterSheet 数据：不改 Session Schema、CharacterSheet Schema、事件、投影、战斗实例、规则裁定或角色卡生命周期。

## Chrome 加载合同

本次 `app.js` 入口更新必须提升版本查询参数，确保 Chrome 不会将新的战斗摘要与旧的角色页模块混用。

## 必测项与非目标

- 角色页出现独立的“DM 备注”页签和当前修订的完整备注显示；空 note 明确显示“尚无 DM 备注”。
- 静态 UI 合同验证当前入口加载 revision；既有 `note-append` 默认拒绝、接受后新修订与修订差异测试继续通过。
- 不添加自动写回、自动规则裁定、结构化复活关系、S2 转化或任何发布动作。
