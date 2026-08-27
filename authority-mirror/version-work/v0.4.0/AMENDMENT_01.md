# v0.4.0 Amendment 01：死亡豁免投骰与昏迷/倒地分离

- **状态：** `Approved / Frozen — Implementation Authorized`
- **批准与实施授权：** User / `2026-08-25` / “同意，执行”
- **适用交付：** `v0.4.0-S1`；不创建新 Slice、不提升 Session Envelope Schema。
- **排除决定：** PC 死亡后的复活、转化与怪物/NPC 同类系统移至未来独立交付 `v0.4.1`，不属于本 Amendment。

## 新增规则定位与合同

- 沿用已确认的 `Lore_01_核心玩家规则.md`，SHA-256 `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8`。
- 新增定位：第 `36751–36756` 行，倒地状态可通过消耗速度一半起立；速度为 0 时不能起立。
- 昏迷与倒地为独立状态：昏迷使生物失能并倒地；昏迷结束不会移除倒地。

## 批准变更

1. PC 单场数据将生命阶段与状态条件分离：生命阶段为 `active | dying | stable | dead | needs-review`；`unconscious` 与 `prone` 保存在独立条件集合中。为兼容既有 v0.4.0 会话，旧 `lifeStatus` 在读取时映射为生命阶段；新写入不再以它作为 PC 的权威事实。
2. 降至 `0 HP` 且未死亡：进入 `dying`，并加入 `unconscious`、`prone`。稳定后为 `stable + unconscious + prone`。
3. 自然 20 或有效治疗：恢复正 HP，进入 `active`，移除 `unconscious`；`prone` 保留。当前可行动的倒地 PC 可消耗其速度一半执行“起立”，仅移除 `prone`。
4. 死亡豁免面板新增“投 d20 并记录”：Terminal 生成 1–20，记录投骰来源与结果；现有“手动填写最终 d20”保留，供实体骰与 DM 修正使用。
5. 本 Amendment 不自动执行完整昏迷攻击影响、掉落物、完整状态引擎、稳定后 `1d4` 小时恢复、复活、转化、法术合法性或战役时间。

## 兼容、测试与回退

- Schema 继续为 `0.3.0`：新增字段与条件只在 v0.4.0 新 key 内规范化；旧 v0.3.1/v0.2 key 仍只读。
- 必测：旧 v0.4.0 数据的 phase/condition 映射；0 HP、稳定、自然 20、治疗、起立的条件保留/移除；速度不足或速度 0 不能起立；面板随机 d20 与手动 d20 的来源审计；既有回归。
- 回退仍为 `main@444cdce1248ab4173bbfd904b91a0cebb0000d38`；不改写旧 key、v0.3.1 Archive 或发布包。
