# Test Execution Log：DND Terminal v0.3.0 Archive

- **Status：** Final
- **Record Nature：** 归档时的证据提取；不重新解释或修改原始测试事实。
- **Original Execution / Release Verification Date：** `2026-08-24`
- **Evidence Source：** `version-work/v0.3.0/TESTING.md` 的 “v0.3.0 Local Private Release 复核”与 `version-work/v0.3.0/REVIEW.md` 的实际执行记录。

## Executed Checks

- `node --check src/app.js`：pass；
- `node --check src/characters.js`：pass；
- `node --check src/character-import.js`：pass；
- `node --check src/session-persistence.js`：pass；
- `tests/*.test.mjs`：12 / 12 pass：`character-import-m1-s3`、`character-lifecycle-m1-s5`、`character-ui-m1-s3`、`characters-m1-s1`、`characters-m1-s2`、`encounter-v020`、`geometry`、`m1-s5-contract`、`m1-s5-stabilization-ui`、`persistence-m1-s5`、`spellcasting-m1-s4`、`spellcasting-ui-m1-s4`；
- `unzip -t releases/v0.3.0/dnd-terminal-v0.3.0-local-private.zip`：pass（21 / 21）。

## Tested-Source Identity Chain

1. `releases/v0.3.0/checksums.sha256` 在 Local Private Release 时记录 21 个源文件/测试文件的 SHA-256；其 SHA-256 为 `01cbc5f86ef9a665e08e470d1f8893dd47494558a311dfd7086bab8a61c99aa2`。
2. `releases/v0.3.0/dnd-terminal-v0.3.0-local-private.zip` 是同次发布的完整 21 文件证据包；其 SHA-256 为 `bbb689aa2e2ee8cb3a55effc6186c274c4710f48310ece13376d791b87f6aa36`。
3. `version-work/v0.3.0/REVIEW.md` 在 Archive 前已记录关键实现与 M1-S5 测试源的逐文件 SHA-256；`version-work/v0.3.0/RELEASE_NOTES.md` 和 `TESTING.md` 固定该发布复核结果。
4. 本归档的 `archive/code-snapshot/` 从该发布 ZIP 直接提取，并逐项通过上述 `checksums.sha256` 校验（21 / 21）。因此归档快照与已发布、已复核的源/测试集合逐字节一致。

## Archive Snapshot Recheck

- 在 `archive/code-snapshot/` 内重新执行四项 Node 语法检查与全部 12 个测试，结果均为 pass。
- 在同一目录执行发布清单校验，21 / 21 为 `OK`。
- 秘密/凭据模式检查未发现 API key、Authorization、Bearer、password、Cookie 或 secret；快照中仅有启动器的固定回环地址 `127.0.0.1`，用于本机静态服务绑定，不是配置凭据、内部网络地址或用户数据。

## Unexecuted Items and Failures

- 本次 Archive 未重新执行浏览器流程；既有浏览器与 User Human Acceptance 证据仍按 `TESTING.md`、`REVIEW.md` 的证据等级保留，未冒充为新的自动化运行。
- 未记录自动测试失败。
