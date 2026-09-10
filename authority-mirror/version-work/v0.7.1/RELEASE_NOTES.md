# Release Notes：DND Terminal v0.7.1

- **Release Status：** `Released — Local Private`
- **Release Date：** `2026-09-10`
- **Release Authorization：** User / `2026-09-10` / “授权release”
- **Delivery Scope：** `v0.7.1` 统一战斗工作台 UX 适配，已完成 main 集成与主线回归。
- **Formal Product Baseline：** `v0.7.0 Archived — Local Private`（冻结历史，不被本发布改写）。
- **Technical Starting Point：** `main@3946fb1`；发布身份由下述 ZIP 与内容清单建立。
- **Archive Status：** `Not Authorized / Not Executed`

## 发布身份

| Artifact | Path | SHA-256 |
|---|---|---|
| Local Private release ZIP | `/Users/chenzehao/Projects/DND Terminal/releases/v0.7.1/dnd-terminal-v0.7.1-local-private.zip` | `741f1e76f295f47dc9302a2f187f7e667739752feb273433f54b38d49b4ff1e7` |
| Content manifest | `/Users/chenzehao/Projects/DND Terminal/releases/v0.7.1/checksums.sha256` | `b249140b4e1904238f7acfea5ae3ee940a49e43e37f492e3ca719f79ca2cc457` |

ZIP 包含 `51` 个产品源码、测试、固定测试夹具和本地启动器文件；不包含 Authority 文档、Rules Baseline、用户数据、浏览器 `localStorage`、`.git`、历史 Release、Archive 材料或开发机专用临时验证脚本。

## 本次能力

- 三种非对称工作台布局：左侧轨道固定 20%，地图与右侧检视区按全量、战斗和死亡处理场景分配空间。
- 六档视口与三主题下的生命状态可读性、特殊状态高对比标签、骰子栏 containment 和窄屏单列任务流。
- 地图本身支持鼠标/触控/键盘平移；地图空白短点按可在全量/战斗与地图页面间往返，并排除棋子、控件和高风险草稿。
- 既有死亡处理、关联/受控生物投入与折叠状态保持在原 Domain/Event/Session 边界内。

## 发布验证

| Check | Result |
|---|---|
| Source syntax | `node --check src/app.js src/battle-workbench.js src/map-controller.js` 通过。 |
| Main regression | `node --test tests/*.test.mjs`：`26/26` 测试文件通过。 |
| Formatting | `git diff --check` 通过。 |
| Package integrity | `unzip -t` 通过；解压后内容清单 `51/51` 通过。 |
| Package regression | 解压发布包后再次执行语法检查和 `26/26` 测试，通过。 |
| Sensitive-pattern scan | 对发布解压内容扫描 API key、secret、password、Bearer、private key 模式，无命中。 |
| Human acceptance | User 已完成 Safari 人工验收并确认用户体验良好。 |

## 边界与后续门禁

本次仅完成 User 授权的 Local Private Release。未执行 Archive、Push、部署、公开发布或再分发；Release 包不改变 `v0.7.0` 冻结材料，也不授予后续版本实施权限。
