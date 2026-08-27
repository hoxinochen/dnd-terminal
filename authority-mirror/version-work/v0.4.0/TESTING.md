# v0.4.0 Testing

- **状态：** `Original S1 + Amendment 01 User Human Acceptance Passed / Review Approved — User / Released — Local Private`
- **范围：** `v0.4.0-S1` 综合验收
- **Authority：** `version-work/v0.4.0/ABC.md`

## 计划矩阵

1. PC 从正 HP 降至 `0 HP`、即时死亡与临时 HP 边界；
2. 死亡豁免普通成功/失败、自然 1、自然 20、第三次成功/失败；
3. `0 HP` 受伤、重击输入、达到 HP 上限的即时死亡；
4. 医疗稳定的施救者、最终检定值、动作消耗与越权修正；
5. 正 HP 治疗恢复、计数归零、轨迹保留；
6. `unconscious` 的先攻位置与死亡豁免回合，`stable/dead/needs-review` 的行动阻断；
7. 顺序事件、当前页面内补偿撤销、刷新后不可伪造撤销；
8. Session Schema `0.3.0`、新 key、v0.1/v0.2/v0.3.1 迁移、损坏新 key/future schema 安全拒绝；
9. v0.3.1 旧 key 不修改，回退读取边界；
10. 战后不把死亡豁免或单场生命状态写入 CharacterSheet；
11. 全部既有 v0.3.1 自动回归；
12. 隔离浏览器中的合成会话关键流程、刷新恢复与错误恢复入口。

## 执行事实

### A. 自动测试

- **日期：** `2026-08-25`
- **环境：** 本地 Node `v26.7.0`
- **最终命令：** `node --check src/app.js && node --test`
- **结果：** `15 passed / 0 failed / 0 skipped`
- **附加检查：** `node --check src/life-cycle-v040.js` 通过；`git diff --check` 通过。

新增领域测试覆盖：正 HP/临时 HP/0 HP 伤害、即时死亡、重击、自然 1/20、三次成功/失败、医疗稳定成功/失败与动作合同、治疗恢复、DM 修正、轨迹保留、回合资格、v0.1/v0.2/v0.3 Envelope、未来版本拒绝、新/旧 key 选择和损坏新 key 不回退。既有 13 个 v0.3.1 测试文件全部继续通过。

### B. 隔离浏览器验证

- **日期：** `2026-08-25`
- **环境：** Codex In-app Browser；本地 `http://127.0.0.1:4173/`；合成隔离 origin；验证后关闭临时标签并停止本地服务器。
- **初始恢复：** 页面可见地从 v0.3.1 旧会话副本迁移到 Session Schema `0.3.0`，提示旧 key 未修改；页面标题、header 与 footer 均显示 v0.4.0 候选身份。
- **0 HP 与重击：** 15 级散打武者从 `112 HP` 受到 `112` 伤害后显示 `unconscious / 0 HP / 0-0`；随后 `0 HP` 时输入 `1` 点重击伤害，显示 `2/3` 次失败。
- **先攻与死亡豁免：** 昏迷 PC 仍在先攻 18 的原位置并成为第 1 轮当前对象；资源与手工效果按钮禁用，页面要求最终 d20。输入 `10` 后记录成功 `1/3` 并推进到下一行动者。
- **医疗稳定：** 下一行动者 15 级塑能师以最终 Medicine `10` 稳定该 PC；PC 显示 `stable / 0 HP / 0-0`，施救者动作显示“已用”。
- **治疗与刷新：** 对稳定 PC 治疗 `5` 后显示 `alive / 5 HP`；刷新后状态、先攻位置、8 个顺序事件和提示保持，浏览器 console 无 error。
- **撤销：** 刷新后尝试撤销时明确显示“此事件没有可恢复检查点；刷新前检查点不会被伪造”。同页新造成 `1` 点伤害后撤销，HP 从 `4` 恢复 `5`，日志保留原 `pc.damage.resolved` 并追加 `event.compensated`。
- **未来 Schema：** 通过 UI 导入 `future-schema-browser-rejection.json`，页面拒绝未知 Schema，header 在前后均保持 `10 events`，当前会话未被覆盖。
- **展示修复：** 角色“法术”栏目把 `unknown` 施法属性显示为“待确认”，两种 CastingOption 仍分开显示；footer 显示 v0.4.0 边界。
- **最终重载：** 应用最后一次 UI 禁用修正后重新加载；标题与 `v0.4.0 / Schema 0.3.0` header 正常，console `0 error`。

### C. User Human Acceptance

- **日期：** `2026-08-25`
- **执行者：** User
- **数据边界：** 用户以旧会话数据进行人工迁移与可用性验证；本记录不读取、不复制、不保存或披露该用户数据。
- **结论：** `Passed`。User 明确确认：“用旧数据人工测试过了，得到的结论是可以用”。
- **覆盖含义：** 这确认旧数据在用户实际环境中的迁移后可用性；它补充而不替代 A、B 两部分的自动测试与隔离浏览器证据。

### D. 未由本次验收替代的门禁与延期验证

- 未进行真实 DM 长时会话或跨多次对话的持续性验证；User 决定待主要功能基本实现后再处理。
- 未进行独立的压力测试；User 决定待主要功能基本实现后再处理。
- Independent Review 已获 User 批准，Local Private Release 已按授权完成；Archive、部署或公开发布测试仍未授权。

### E. Amendment 01 验收计划（待执行）

- 旧 `lifeStatus` 会话规范化为独立的 PC 生命阶段与 `unconscious`/`prone` 条件；不改动旧 key。
- 降至 0 HP、稳定、自然 20、正 HP 治疗、重新受伤时的生命阶段和条件链条。
- 正 HP 但倒地的 PC 可消耗速度一半起立；速度不足或为 0 时拒绝。
- 面板“投 d20 并记录”与手动最终 d20 都记录来源，并继续遵守死亡豁免回合限制。
- 所有既有自动回归与隔离浏览器关键流程。

### F. Amendment 01 执行事实

- **日期：** `2026-08-25`
- **自动化：** `node --check src/app.js && node --check src/life-cycle-v040.js && node --test`：`15 passed / 0 failed / 0 skipped`；`git diff --check` 通过。
- **新增覆盖：** 旧 `lifeStatus` 映射为 PC `lifePhase`；`dying/stable` 均保留 `unconscious + prone`；自然 20 与正 HP 治疗移除昏迷但保留倒地；起立消耗一半速度；Terminal d20 投骰来源保留在死亡豁免轨迹；濒死 PC 仍保留先攻中的死亡豁免回合。
- **隔离浏览器：** 使用已重置的合成固定遭遇。PC 降至 `0 HP` 后显示“濒死 · 昏迷、倒地”，且当前回合显示“投 d20 并记录”与手动 d20。手动 `20` 后显示 `1/112 HP`、正常但倒地；点击起立后显示 `28/55` 移动力且倒地移除。浏览器 console `0 error`。
- **未替代门禁：** Amendment 01 已获 User Human Acceptance；真实 DM 长时会话、跨多次对话与压力测试仍按 User 决定延期；Archive、部署与公开发布仍未授权。

### G. Amendment 01 User Human Acceptance

- **日期：** `2026-08-25`
- **执行者：** User
- **结论：** `Passed`。User 明确确认“测试通过”，并随后授权开始 Review。
- **范围：** 本次确认覆盖 Amendment 01 的 d20 投骰、生命阶段与昏迷/倒地分离、自然 20/治疗后的倒地保留和起立行为；不改变已延期的真实 DM 长时会话、跨多次对话或压力测试边界。
