# Release Notes：DND Terminal v0.6.0

- **Release Status：** `Released — Local Private`
- **Release Date：** `2026-08-31`
- **Review Approval / Release Authorization：** User / `2026-08-31` / “我明确浏览器完成流程与人工确认通过，修改结束后可以直接进入release，我授权release”。
- **Delivery Scope：** `v0.6.0` 单一主 Slice 与 [Amendment 01](AMENDMENT_01.md)。
- **Formal Product Baseline：** `v0.5.0 Archived — Local Private`（冻结历史，不被本发布改写）。
- **Technical Starting Point：** `main@86424c630e85ba3e90c7957a1985f9e671b8008e`；本地发布身份由下述 ZIP 与清单建立，不以未提交工作树或 Git Commit 代替。
- **Archive Status：** `Not Authorized`

## 发布身份

| Artifact | Path | SHA-256 |
|---|---|---|
| Local Private release ZIP | `/Users/chenzehao/Projects/DND Terminal/releases/v0.6.0/dnd-terminal-v0.6.0-local-private.zip` | `366d1d126bde7779f04da5d554b3189116ed1b0e4f5f86850bd14e6850be7448` |
| Content manifest | `/Users/chenzehao/Projects/DND Terminal/releases/v0.6.0/checksums.sha256` | `5a89d8f333b4a6d334fd0e97ed03b75ea34aad3e7c3db8cb2f013590cf513f84` |

ZIP 包含 `37` 个产品源码、测试、固定测试夹具和本地启动器文件；不包含 Authority 文档、Rules Baseline、用户数据、浏览器 `localStorage`、`.git`、历史 Release 或 Archive 材料。

## 本次能力

- 将 v0.5.0 四张死亡后结果卡收敛为“恢复原身体”“以新身体或新形态继续冒险”“制造受控不死生物”三种对象拓扑。
- 新身体/新形态提供普通新身体、不死生物形态和其他自定义形态；均建立独立角色卡、投影与战斗实例，保留旧卡和原死亡事实。
- 八个中文法术以结果过滤的结构化裁定资料呈现：回生术、死者复活、复生术、完全复生术、转生术、克隆术、活化死尸、唤起亡灵。
- 裁定工作台提供法术简报、建议/改判/不追踪/未知等分段选择、可选资料与结构化预览；不把材料、时间、灵魂、资格、Campaign Time 或法术合法性变成阻塞 Gate。
- 资源仅在 DM 明确选择同步扣除时变更；取消预览不写入。v0.5.0 S2C 和旧 Session 通过独立 storage key 与 copy-on-write 迁移继续可读。

## 发布前验证

| Check | Result |
|---|---|
| Syntax and source regression | `node --check` 通过；工作树 22/22 测试通过。 |
| Browser and Human Acceptance | User 明确确认浏览器完成流程与人工确认通过。 |
| Package integrity | `unzip -t` 通过；解压后 `shasum -a 256 -c checksums.sha256` 为 `37 / 37` 通过。 |
| Package regression | 解压发布包后再次运行 22/22 测试通过。 |
| Sensitive-pattern scan | 对发布内容扫描 API key、secret、password、Bearer、private key 模式，无命中。 |
| Packaging correction | 首次解压验证发现遗漏 `src/styles.css`；在登记 Release 前已加入最终 ZIP 并重新生成清单，最终包通过完整性与回归验证。 |

## 边界与后续门禁

本次只完成 User 授权的 Local Private Release。未创建 Archive、Commit、Push、部署或公开发布。触屏验证尚未执行；完整法术执行、材料库存、合法性校验、Campaign Time、整体 UI 工作台重构和关联单位战斗中投入仍须各自新的 ABC 与授权。
