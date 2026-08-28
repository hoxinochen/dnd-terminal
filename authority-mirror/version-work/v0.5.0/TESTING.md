# Testing：v0.5.0 S1 / S2 / Amendment 03 死亡后结果

- **Slice：** `v0.5.0-S1`、`v0.5.0-S2A`、`v0.5.0-S2B`、`v0.5.0-S2C`
- **状态：** `Automated checks passed — Archived — Local Private`
- **执行日期：** `2026-08-28`
- **范围：** [ABC](ABC.md) §5、[S1 Amendment 01](AMENDMENT_01.md)、[S1 Amendment 02](AMENDMENT_02.md)、[Amendment 03](AMENDMENT_03.md)、[Amendment 04](AMENDMENT_04.md)。

## 已执行验证

在 `/Users/chenzehao/Projects/DND Terminal` 执行：

```sh
node --check src/app.js
node --check src/life-cycle-v050.js
node --check src/characters.js
for test_file in tests/*.test.mjs; do node "$test_file" || exit 1; done
```

结果：**20/20 测试文件通过**，且 `src/app.js`、`src/life-cycle-v050.js` 与 `src/characters.js` 均通过语法检查，`git diff --check` 通过。

另在 Chrome 本地页面加载当前入口：页面标题为 `DND Terminal v0.5.0 — Local Private Implementation`，显示 Session Schema `0.4.1`，浏览器控制台无 error。为避免改动既有浏览器 localStorage，本次未在真实会话中提交死亡、摆放或长休操作。

通过的测试包括：

- `tests/life-cycle-v050.test.mjs`：死亡 PC 正向复活、灵魂/HP 等必填拒绝、`lifePhase`/`lifeStatus`、条件保留或清空、死亡轨迹保留、resolution 审计字段、v0.5.0 Envelope、旧 key copy-on-write 和损坏新 key 阻断。
- `tests/v050-s1-ui-contract.test.mjs`：复活表单字段、PC 专属事件、PC 不能进入怪物/NPC 死亡处理或转化命令、长期卡 DM 备注显示、Chrome app bundle cache revision、v0.5.0 storage/schema/页面标识。
- `tests/v050-s1-amendment.test.mjs`：复活记录生成 `note-append` 候选、默认拒绝零写回、DM 接受后追加既有 `note` 并建立新修订、非法 resolution 与数值更正拒绝。
- `tests/v050-s2.test.mjs`：S2 新卡必有独立 ID、修订从 1 开始；仅复制 DM 勾选的字段组，未勾选能力/装备不被推断；备注保持普通文本且未知继承组被拒绝。
- `tests/v050-amendment03.test.mjs`：四选一无技术 Slice 文案、地图点击摆放、尸体占格拒绝、取消零持久化写入、受控实体候选、命令/期限入口、Schema 与 copy-on-write storage key 合同。
- `tests/v050-s2.test.mjs`：一次长休控制的正常到期、到期后仅记录续控意图，以及 DM 确认的到期前续控将计数刷新为下一次长休而不声称规则自动验证。
- `tests/v050-amendment03.test.mjs`：补充验证 S2 临时预览棋子、独立确认按钮、受控生物的第 0 回合再投入入口和失控关系的关闭边界。
- `tests/version-compatibility-v031.test.mjs`：v0.2.0/v0.3.1/v0.4.0 兼容链与 v0.5.0 Schema 迁移。
- `tests/life-cycle-v040.test.mjs`、`tests/v040-ui-contract.test.mjs`：既有 PC 0 HP、死亡豁免、稳定、死亡、`unconscious`/`prone` 分离回归。
- 其余 12 个现有角色、战斗、几何、持久化、法术展示与 M1-S5 回归测试。

## 已验证的 S1 合同

| 合同 | 自动验证结论 |
| --- | --- |
| 原实例复活 | Pass：正 HP、`lifePhase: active`、`lifeStatus: alive`、不创建替代实例。 |
| 死亡记录与条件 | Pass：死亡豁免 history 保留；保留模式仅去除 `unconscious`，清空模式移除全部条件。 |
| 审计事件 | Pass：`pc.return-to-life.confirmed` 的 resolution 输入包含依据、灵魂、HP、效果处理、地图、先攻和原因。 |
| PC/怪物-NPC 隔离 | Pass：UI 删除通用入口，且死亡处理与转化命令都拒绝 PC。 |
| 先攻与地图语义 | Pass（合同级）：固定记录 `restore-original-token`、`restore-original-slot`；既有 restoration 算法继续决定本轮是否已越过位置。 |
| 撤销与刷新边界 | Pass（代码合同）：S1 事件在现有 compensation undo 列表；Envelope/启动测试覆盖最终状态恢复与损坏新 key 阻断。 |
| 战斗内可见性 | Pass（合同级）：复活后的 PC 状态面板含可读的最近复活记录与 Resolution/Event ID。 |
| 长期角色卡隔离 | Pass：S1 不在当时的 `0.3.0-m1-s5` CharacterSheet 合同中直接写回；只有战后 `note-append` 候选经 DM 接受才追加 `note` 并创建新修订。Amendment 03 的 `0.3.0-m1-s6` 受控生物关系见下方。 |
| DM 备注显示 | Pass（UI 合同级）：角色档案有独立“DM 备注”页签；只读取当前修订已保存的 `note`，并明确区分待接受的战后候选。 |
| S2 UI/命令隔离 | Pass（UI 合同级）：S2A、S2B、S2C 具备各自入口与事件类型；S2B 保存 controllerLink，不复活或写回原 PC；S2A/S2C 使用独立角色卡工厂。 |
| Amendment 03 可视摆放 | Pass（合同级）：新实例路径进入地图草稿；确认前再次以完整地图占用检查拒绝尸体、其他棋子与越界，取消不写入耐久状态。 |
| 受控生物关系与期限 | Pass：`controlledEntities` 与 `linkedEntities` 分离；DM 接受候选后才写入控制者新修订；一次长休到期仅变为 `expired-uncontrolled`，续控意图不恢复控制。 |
| Amendment 04 再投入与续控 | Pass（自动/合同级）：有效受控关系可在新遭遇以新实例物化；失控关系无该入口；S2 预览可拖动且确认前不提交；DM 勾选的到期前续控刷新一次长休计数，未勾选关系照常到期。 |
| 受控关联棋子颜色 | Pass（UI 合同级）：`controlled` / `permanent-controlled` 受控生物强制使用淡紫色 `#C69BF7` 与独立样式，不继承丧尸等模板的敌对红色；不再受控时回到普通关系色。 |
| Schema / 回退边界 | Pass：CharacterSheet `0.3.0-m1-s6` 兼容空集合；Session `0.4.1` 写新 key，原 v0.5.0 key 与 v0.4.0 及更早 key 保持只读来源。 |

## 尚未完成的人工验证

尚未执行隔离浏览器 origin 上的交互式 User/DM Human Acceptance，也未进行 Review。自动化通过不等同于以下事项已经获接受：

- DM 对表单可读性、输入负担、尸体棋子恢复和先攻越过本轮时机的确认；
- 复活后条件处理是否符合本战役的裁定记录习惯；
- 实际浏览器中死亡→地图摆放→战后候选接受→角色卡模块→刷新/导入导出的端到端操作体验；
- 实际浏览器中拖动 S2 临时预览棋子、多次调整、确认/取消，以及长休时混合“续控 / 不续控”条目的可读性与审计习惯；
- v0.5.0-S1 通过后的下一 Slice、Review、Release、Archive 或其他生命周期门禁。

## 回退检查

- v0.4.0 冻结 Archive、ZIP、manifest、校验记录和 Authority 历史未修改。
- Amendment 03 使用独立后继 key；自动测试确认仅选择原 v0.5.0、v0.4.0 与更早 key 的副本，不改写旧值。
- 回退时不删除后继 key、不向旧 key 降级写入；若需保留会话，应先从当前 v0.5.0 导出。

**结论：** 自动测试 Gate 为 `Pass`；S2 + Amendment 03 仍停在 `Awaiting User Human Acceptance`。不进入 Review、Release 或 Archive。
