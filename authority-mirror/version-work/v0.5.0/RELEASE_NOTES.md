# Release Notes：DND Terminal v0.5.0

- **Release Status：** `Released — Local Private`
- **Release Date：** `2026-08-28`
- **Review Approval / Release Authorization：** User / `2026-08-28` / “进入release”。
- **Delivery Scope：** `v0.5.0-S1`、`S2A`、`S2B`、`S2C` 及 Amendment 01–04。
- **Formal Product Baseline：** `v0.4.0 Archived — Local Private`（冻结历史，不被本发布改写）。
- **Technical Starting Point：** `main@431db95894a0aa99a4e85cb464f56e584ad2a8d6`；本地发布身份不以未提交 Git 工作树、分支或 Commit 作为替代。
- **Archive Status：** `Not Authorized`

## 发布身份

本地私有发布身份由下列独立产物建立：

| Artifact | Path | SHA-256 |
|---|---|---|
| Local Private release ZIP | `/Users/chenzehao/Projects/DND Terminal/releases/v0.5.0/dnd-terminal-v0.5.0-local-private.zip` | `6c51367227fb5ab763605b597e46541f05514a9c0e0f1f68985e3278ae3920b1` |
| Content manifest | `/Users/chenzehao/Projects/DND Terminal/releases/v0.5.0/checksums.sha256` | `8d7e0ffe9a8a3f2ae5804be7b213f5a98c917932a85d1da57af390debe1a8941` |

ZIP 包含 `34` 个产品源码、测试、固定测试夹具和本地启动器文件；不包含 Authority 文档、Rules Baseline、用户数据、浏览器 `localStorage`、`.git`、历史 Release 或 Archive 材料。

## 本次能力

- PC 死亡后的四条明确路径：原实例复活、独立新身体 PC、受施法者控制的亡灵 monster/NPC，以及独立的新亡灵 PC 角色卡；不混用角色卡、战斗实例或玩家控制语义。
- S1 复活记录在战斗 Tab 与经 DM 接受的战后角色卡备注中可追溯；PC 不再显示或接受怪物/NPC 的特许复起、特殊转化入口。
- S2A/S2C 创建时只复制 DM 勾选字段；两张 CharacterSheet 仅以备注追溯，之后独立可编辑、可并存，不自动归档或同步。
- S2B 建立 `controlledEntities` 长期关联和本场 `controllerLink`；受控生物可作为关联生物再次投入新遭遇，每场都创建独立 CombatantInstance。失控、解除或控制丢失后不再从控制者卡投入。
- S2 新实例采用可反复拖动的临时地图预览，只有明确确认才生成；尸体、其他棋子、完整占位与边界均为提交 guard。
- 长休可由 DM 登记受控生物到期，或记录一次已经确认的续控以刷新下一个长休计数；不执行或验证任何具体法术。
- 受控关联生物使用专属淡紫色 `#C69BF7`，避免将丧尸等 monster/NPC Template 的敌对红色误读为控制关系或阵营。
- v0.5.0 Session 的 copy-on-write 迁移与 CharacterSheet 兼容集合保护；旧 key 和 v0.4.0 冻结历史不被改写。

## 发布前验证

| Check | Result |
|---|---|
| Syntax | `node --check src/app.js`、`src/characters.js`、`src/life-cycle-v050.js` 通过。 |
| Automated regression | 工作树 20/20 测试文件通过；解压发布包后再次 20/20 通过。 |
| Diff format | `git diff --check` 通过。 |
| Package integrity | `unzip -t` 通过；解压后 `shasum -a 256 -c checksums.sha256` 为 `34 / 34` 通过。 |
| Sensitive-pattern scan | 对发布内容扫描 API key、secret、password、Bearer、private key 模式，无命中。 |
| User approval | User 经过 Chrome 环境的迭代反馈后，明确授权进入 Review 和 Release。没有伪造独立第三方验收或自动法术规则验证。 |

真实 DM 长时会话、隔离 origin 的全流程浏览器验收、跨多次对话持续性和压力测试仍未被写作本发布已完成的验证。

## 边界与后续门禁

本次只完成 User 授权的 Local Private Release。未创建分支、Commit、Push、部署或公开发布，也没有 Archive 授权、Archive 材料或 Archive 身份。具体法术的资格、材料、法术位、目标数、精确时机、战役时间和自动行动时序仍需逐项 Rules Baseline 准入与新的明确授权。
