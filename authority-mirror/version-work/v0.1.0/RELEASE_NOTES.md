# Release Notes：DND Terminal v0.1.0

- **Release Status：** Released — Local Private
- **Release Date：** `2026-08-04`
- **Approval Chain：** User Framework Acceptance → User-approved scope deferrals → User-approved Independent Review → Local Private Release
- **Distribution：** 不公开发布；不得据此推导任何规则资料、翻译或再分发授权。

## 发布内容

本发布交付面向 DM 的本地静态战斗辅助网页：行动轮、二维地图、棋子、范围预览与 DM 覆写、HP/临时 HP、Buff/状态、资源、日志、自动保存、JSON 导入导出、补偿撤销、朝向与发射口。

发布包：

- `/Users/chenzehao/Projects/DND Terminal/releases/v0.1.0/dnd-terminal-v0.1.0-local-private.zip`
- SHA-256：`d0b78762e8b936fa8caaa11b78ceaee37994446cdca87c8e35ecb5aab77e570d`
- 内容 SHA-256 清单：`releases/v0.1.0/checksums.sha256`
- 清单 SHA-256：`d3fbbf98ba4f24374a9887fefacb0abedfd0b17d2a41e60bc80bcc8045dcd6ad`

## 发布验证

- `node --check src/app.js`：pass
- `node --check src/geometry.js`：pass
- `node tests/geometry.test.mjs`：pass
- ZIP `unzip -t`：pass（5/5 文件）

## 已知延期与非主张

本发布不主张规则数值正确性、完整战斗结束回写、完整受控召唤、独立玩家端/真实权限隔离，或完整自动回归套件已实现。详见 `ABC.md` 的 `DEF-001`～`DEF-005` 与 `TESTING.md` 的延期分类。
