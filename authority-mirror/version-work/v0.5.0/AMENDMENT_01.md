# v0.5.0-S1 Amendment 01：复活记录可见性与受控长期备注候选

- **状态：** `Approved / Frozen — Implementation Authorized`
- **批准与实施授权：** User / `2026-08-27` / “同意补充”
- **适用范围：** 仅 `v0.5.0-S1` 的既有 PC 原实例复活；不授权 S2A、S2B、S2C 或任何后续生命周期门禁。
- **基线 ABC：** [v0.5.0 ABC](ABC.md) §A-3、§A-7、§A-8、§5。

## 问题与批准决定

S1 已将复活依据、灵魂、HP、状态处理、地图、先攻和 DM 原因持久化到顺序事件与 `deathRecord.resolutions`，但战斗 Tab 没有持续的人类可读摘要；长期 CharacterSheet 的 `note` 也没有受控承接入口。该状态使 DM 很难看出填写内容的实际用途。

本 Amendment 批准以下两层呈现与写回：

1. **战斗内可见性：** 已复活 PC 的“PC 生命状态”区域必须显示最新复活记录。该摘要从当前 CombatantInstance 的 `deathRecord.resolutions` 读取，显示依据、灵魂、HP、状态处理、地图、先攻、DM 原因、轮次与 resolution/event ID；它不产生新的角色卡写入。
2. **战后受控备注候选：** 对有对应 CombatProjection 的 S1 复活 PC，战后 `PostCombatDiff` 新增 `note-append` 候选。默认拒绝；只有 DM 显式选择接受，系统才把一段稳定、可读的复活摘要追加到该 CharacterSheet 当前 `note`，并创建一个新修订。

## 数据与状态合同

- `resolutionId` 同时用作 `pc.return-to-life.confirmed` 的 Event ID，使 combatant 内的 resolution 与顺序事件可直接对应。
- `note-append` 的内容由已记录的 S1 resolution 生成，不再从表单或规则书推断；它包含 resolution/event ID、轮次、依据状态与标签、灵魂、HP、状态处理、地图/先攻结果和 DM 原因。
- 候选必须绑定原 `combatProjectionId`、`characterId` 与 `characterRevision`。没有该投影的旧兼容 PC 继续只保留战斗内摘要，不得猜测或修改任何长期角色卡。
- 接受 `note-append` 时仅追加文本；不覆盖既有 note，不自动改 HP、资源、条件、法术、装备或其他 CharacterSheet 字段。
- `note-append` 不允许“更正后写入”数值模式；DM 可接受或拒绝。若描述有误，应在战斗内追加适当的 DM 事件/修正后重新生成候选，而不是伪造长期记录。
- 角色卡已归档、修订不匹配、投影不匹配或战后候选已失效时，系统必须拒绝写回；候选仍可废除。

## 非目标与回退

- 不自动把复活记录写入 CharacterSheet；仍须战后 DM 显式接受。
- 不改变 CharacterSheet Schema `0.3.0-m1-s5`；`note` 是既有普通文本字段，不建立结构化关系、同步或唯一继承。
- 不把此能力扩展至 S2A/S2B/S2C、怪物/NPC 复起/转化、规则合法性、长期疾病/诅咒/力竭计算、法术与材料审计或 Campaign Time。
- 仅 v0.5.0 新 key 写入新增会话数据；旧 key 与 v0.4.0 冻结 Archive 均不修改。回退不把新 Schema 写回旧 key。

## 必测项

- 战斗 Tab 在复活后持续显示完整摘要，刷新后仍可由持久化 resolution 恢复；
- resolution 与 `pc.return-to-life.confirmed` 事件 ID 一致；
- 有 CombatProjection 的复活 PC 在战后得到一个默认拒绝的 `note-append` 候选；
- 接受候选会创建下一 CharacterSheet 修订并追加、而非覆盖既有 note；拒绝或废除不会改动角色卡；
- 无投影 PC、已归档角色、过期修订与未知/非法 note entry 都不得写回；
- 既有 S1、v0.4.0 和全部回归测试继续通过。
