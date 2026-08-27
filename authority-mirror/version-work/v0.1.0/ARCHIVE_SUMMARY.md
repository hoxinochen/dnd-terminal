# Archive Summary：DND Terminal v0.1.0

- **Archive Status：** Archived — Local Private
- **Archive Date：** `2026-08-04`
- **Archive Scope：** `v0.1.0` 本地静态发布包、实现身份、验证证据与生命周期文档。
- **Public Disclosure：** 未执行。规则资料的翻译与再分发授权为 `unknown`，本归档不包含数据来源区资料。

## Archive Gates

| Gate | Result | Evidence |
|---|---|---|
| 用户框架工作流接受 | pass | `TESTING.md` 的 User Acceptance Result。 |
| 延期边界明确 | pass | `ABC.md` `DEF-001`～`DEF-005`；未主张其完成。 |
| Independent Review | pass | `REVIEW.md`：用户作为非实现者于 `2026-08-04` 批准。 |
| 实现身份 | pass | `REVIEW.md` 的 5 个 Workspace 文件 SHA-256；Workspace 无 Git identity。 |
| 可复现静态检查 | pass | `node --check` 两项与 `geometry.test.mjs` 均通过。 |
| 发布包完整性 | pass | ZIP `unzip -t` 通过；发布包与清单 SHA-256 记录于 `RELEASE_NOTES.md`。 |
| 权利与披露边界 | pass for local-private only | 不公开发布、不包含规则资料、不推导翻译或再分发授权。 |

## Archived Identity

- **Package：** `/Users/chenzehao/Projects/DND Terminal/releases/v0.1.0/dnd-terminal-v0.1.0-local-private.zip`
- **Package SHA-256：** `d0b78762e8b936fa8caaa11b78ceaee37994446cdca87c8e35ecb5aab77e570d`
- **Content checksum file SHA-256：** `d3fbbf98ba4f24374a9887fefacb0abedfd0b17d2a41e60bc80bcc8045dcd6ad`

未来变更必须以新的交付身份进行；不得将 `v0.1.0` 的归档结论外推到 `DEF-001`～`DEF-005` 或任何公开发行。
