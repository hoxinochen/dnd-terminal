# Release Notes：DND Terminal v0.4.0

- **Release Status：** `Released — Local Private`
- **Release Date：** `2026-08-25`
- **Release Authorization：** User / `2026-08-25` / “批准实施review、release，两个都批准，可以按顺序执行”
- **Delivery Scope：** `v0.4.0-S1` 与已批准的 `AMENDMENT_01.md`
- **Formal Product Baseline：** `v0.3.1 Archived — Local Private`（冻结历史，不被本发布改写）
- **Technical Starting Point：** `main@444cdce1248ab4173bbfd904b91a0cebb0000d38`
- **Archive Status：** `Not Authorized`

## 发布身份

本地私有发布身份由下列独立产物建立，不以未提交 Git 工作树、分支或 Commit 作为发布身份：

| Artifact | Path | SHA-256 |
|---|---|---|
| Local Private release ZIP | `/Users/chenzehao/Projects/DND Terminal/releases/v0.4.0/dnd-terminal-v0.4.0-local-private.zip` | `774cc4ed1317c8b061be690725a3450bf58fdf316bd06d583343141c98a055d2` |
| Content manifest | `/Users/chenzehao/Projects/DND Terminal/releases/v0.4.0/checksums.sha256` | `4bf308905b05eeea7143abe6bda229fbf16979c8bb296720d91149e8e34c3979` |

ZIP 包含 `28` 个产品源码、测试与固定测试夹具文件；不包含 Authority 文档、Rules Baseline、用户数据、浏览器 `localStorage`、`.git` 或历史发布/归档材料。

## 本次能力

- PC 从正 HP 到 `0 HP`、即时死亡、死亡豁免、稳定、治疗恢复与人工修正的顺序事件闭环；
- 新增 Terminal 内“投 d20 并记录”，并保留手动最终 d20；
- PC 生命阶段与条件分离：`lifePhase` 为权威，`unconscious` 与 `prone` 独立保存；
- 自然 20 或有效治疗恢复正 HP 时移除昏迷、保留倒地；起立消耗速度一半；
- `v0.4.0` 新 key 的 copy-on-write 迁移保护，旧 v0.3.1/v0.2 key 不改写。

PC 死亡后的复活和转化不属于本发布，已明确留待未来 `v0.4.1`。

## 发布前验证

| Check | Result |
|---|---|
| Syntax | `node --check src/app.js`、`src/encounter.js`、`src/life-cycle-v040.js` 通过 |
| Automated regression | `node --test`：`15 passed / 0 failed / 0 skipped` |
| Diff format | `git diff --check` 通过 |
| Package integrity | `unzip -t` 通过；解压后 `shasum -a 256 -c checksums.sha256` 为 `28 / 28` 通过 |
| Sensitive-pattern scan | 对发布内容扫描 API key、secret、password、Bearer、private key 模式，无命中 |
| Human acceptance | 原 S1 和 Amendment 01 均获 User Human Acceptance；旧数据可用性由 User 在其环境中人工确认 |

真实 DM 长时会话、跨多次对话持续性和压力测试仍按 User 决定延期；它们未被写作本发布已完成的验证。

## 边界与后续门禁

本次仅完成 User 授权的 Local Private Release。未创建分支、Commit、Push、部署或公开发布，也没有 Archive 授权、Archive 材料或 Archive 身份。若未来进入 Archive，必须另获 User 授权，并单独选择 Archive Contract/Profile 与执行相应 Gate。
