# Release Notes：DND Terminal v0.2.0

- **Release Status：** Released — Local Private
- **Release Date：** `2026-08-14`
- **Approval Chain：** User-approved ABC → Implementation Gate complete → User-approved Independent Review → User-authorized Local Private Release
- **Distribution：** 仅本地私有发布；不部署、不公开分享，不据此推导任何规则资料、翻译或再分发授权。
- **Archive Status：** 未授权；本交付尚未归档。

## 发布内容

v0.2.0 将 DND Terminal 扩展为 DM 的本地私有遭遇准备与战斗生命周期工具：

- 自定义、变体和参考单位模板；模板快照与战斗实例隔离；
- 遭遇草案与第 0 回合准备，确认后才投先攻；
- 可编辑先攻调整值、批量投骰、平局裁定与批量投入；
- 场外预备、临时加入、临时离场、同实例再入场、等待增援；
- 战斗结束的保存/不保存防呆与清场/战后清理分流；
- 怪物/NPC 的有限死亡记录、DM 特许复起和特殊转化；
- 参考动作、DM 自定义动作、特性和可计数资源的分层展示；
- 本地自动保存、JSON 导入导出、补偿撤销、二维地图与既有战斗功能。

## 发布包与身份

- 发布包：[dnd-terminal-v0.2.0-local-private.zip](/Users/chenzehao/Projects/DND%20Terminal/releases/v0.2.0/dnd-terminal-v0.2.0-local-private.zip)
- ZIP SHA-256：`fb012ab0bacea73fc6e52e539073b40385b5ac5c2f8024d11794bf9b49e23c85`
- 内容 SHA-256 清单：[checksums.sha256](/Users/chenzehao/Projects/DND%20Terminal/releases/v0.2.0/checksums.sha256)
- 清单 SHA-256：`443520afd1361f05442452e9450ccb8b7a0c0acee8a14f57491f217429f97dce`
- Git identity：不适用；Workspace 未初始化 Git。

发布 ZIP 包含 8 个文件：`index.html`、4 个 `src/` 文件、2 个测试文件和本机启动脚本。

## 发布验证

- `node --check src/app.js`：pass
- `node --check src/encounter.js`：pass
- `node tests/encounter-v020.test.mjs`：pass
- `node tests/geometry.test.mjs`：pass
- `unzip -t dnd-terminal-v0.2.0-local-private.zip`：pass（8/8 文件）

## 已知限制与延期

- 结束战斗的连续原生确认框具备用户手动 DM 验收和数据层回归证据，但没有浏览器自动化通过证据；详见 `REVIEW.md` 的 R-001。
- 完整角色 `0 HP` / 死亡豁免、长期角色结算与永久损伤/奖励、完整规则引擎、全量怪物导入、多人协作及公开发布仍延期。
- 参考规则字段只用于本地私有验证；翻译、出版身份、许可与再分发授权仍为 `unknown`。
