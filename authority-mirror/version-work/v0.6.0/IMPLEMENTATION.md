# Implementation：v0.6.0 DM 裁定驱动的复活、转生与受控不死生物关联

- **交付 ID：** `v0.6.0`
- **状态：** Implemented — Awaiting Browser Verification and User Human Acceptance
- **实施授权：** User / `2026-08-31` / “对implementation授权实施”
- **实施范围：** 完整执行冻结 ABC 的单一主 Slice；不包含 Review、Release、Archive、Commit、Push、部署或公开发布。
- **Workspace：** `/Users/chenzehao/Projects/DND Terminal`

## 已实施事实

### Amendment 01：结构化法术裁定工作台

- User 已批准并授权 `AMENDMENT_01.md`。`V060_SPELLS` 现为可扩展的 `SpellRulingProfile` 目录：每个法术保存中文名、环阶/时间/距离简报、推荐结果和结果专属裁定字段；新增资料不改变死亡后对象 Schema。
- 每张结果卡先显示“法术/依据”选择器；选择后才展开紧凑法术简报、折叠详细参考、视觉化分段裁定卡和裁定预览。裁定卡要求明确选择采用建议、DM 改判、不追踪、未知，或材料对应四种处理；改判/自定义才要求文字。
- 裁定预览在全部适用字段完成后显示建议与最终记录，并与现有原实例确认或地图摆放预览衔接。桌面端预览卡保持可见，窄屏自然退化为单栏。
- 本增补没有引入法术合法性、Campaign Time、材料库存、Template/数量自动推导或法术效果引擎。

### 三种结果与八个法术

- PC 死亡后入口固定为“恢复原身体”“以新身体或新形态继续冒险”“制造受控不死生物”三张结果卡；不再创建独立第四张不死生物 PC 卡。
- 新身体/新形态内部使用“普通新身体”“不死生物形态”“其他自定义形态”一次选择。三者均复用独立 `CharacterSheet`、`CombatProjection`、`CombatantInstance`、选择性继承、旧卡保留和写回隔离合同。
- `src/life-cycle-v060.js` 维护八个中文法术的结果过滤：回生术、死者复活、复生术、完全复生术、转生术、克隆术、活化死尸、唤起亡灵。完全复生术由首次结果卡选择确定路径；非推荐路径使用“自定义依据”。
- 法术提示提供简短说明、折叠的详细参考和可选的遗体防腐记录；没有材料、时间、灵魂、资格或规则符合情况时，DM 仍可提交。

### 数据、确认与边界

- 新 Schema 为 `0.5.0`，交付标识为 `0.6.0`；自动保存只写 `dnd-terminal.v0.6.0.death-outcomes.session.current`。启动与导入从 v0.5.0 及更早有效 Envelope copy-on-write 迁移，旧 key 不改写。
- 新后继事件为 `pc.successor.confirmed`，并保存明确的形态子类型；v0.5.0 的 S1/S2A/S2B/S2C 事件继续由兼容路径读取。
- 资源只在 DM 主动选择“同步扣除当前资源”时变更。资源预检在地图确认前完成；后继角色卡、实例、控制关系、资源变化和事件在同一确认路径内写入。
- 恢复原身体在写入前展示原实例、HP、地图、先攻、依据和资源变更预览；新身体和受控不死生物继续使用既有地图预览/确认。取消预览不写入。
- 已有后继来源再次创建时，要求 DM 勾选重复来源确认并填写原因。
- 新建受控不死生物默认只记录本场 DM 裁定；控制者和长期候选只在 DM 主动选择后关联。新操作使用“DM 管理”期限，明确不把一次长休等同于 24 小时，也不追踪克隆术的 120 日准备。

## 变更文件

- `src/app.js`
- `src/life-cycle-v060.js`
- `index.html`
- `tests/life-cycle-v060.test.mjs`
- `tests/v060-ui-contract.test.mjs`
- `version-work/v0.6.0/AMENDMENT_01.md`
- 既有版本兼容与 UI 合同测试的当前版本断言

## 未执行的后续门禁

- 浏览器完成流程与 User/DM Human Acceptance 已由 User 明确确认通过；隔离 origin 与触屏的细化证据仍未单独记录。
- Independent Review 已获 User 批准，Local Private Release 已完成；Archive、Commit、Push、部署、公开发布和再分发均未获授权。
