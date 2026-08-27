# v0.4.0 Archive Test Execution Log

- **Status：** `Final`
- **Execution Date：** `2026-08-25`
- **Execution Scope：** 已发布的 v0.4.0 Local Private ZIP 解出的 `archive/code-snapshot/`；不是活动 Workspace 的替代描述。
- **Record Nature：** Contemporaneous archive execution record.

## Source Identity Before Execution

1. 发布包 `releases/v0.4.0/dnd-terminal-v0.4.0-local-private.zip` 的 SHA-256 为 `774cc4ed1317c8b061be690725a3450bf58fdf316bd06d583343141c98a055d2`。
2. 发布内容清单 `releases/v0.4.0/checksums.sha256` 的 SHA-256 为 `4bf308905b05eeea7143abe6bda229fbf16979c8bb296720d91149e8e34c3979`。
3. 发布 ZIP 已解出到 `archive/code-snapshot/`；测试开始前由发布内容清单逐项校验，`28 / 28 OK`。
4. 该清单是 Local Private Release 生成时使用的内容身份清单，并由 `RELEASE_NOTES.md` 记录发布前 `node --test` 的 `15 passed / 0 failed / 0 skipped` 结果；本次归档复测只针对这 28 个已核验字节。
5. 清单固定入口 HTML、启动器、8 个 `src/` 文件、15 个 Node 测试和 3 个合成浏览器夹具；不含用户数据、Authority 文档、Rules Baseline 或运行时配置。

## Commands

```text
shasum -a 256 -c releases/v0.4.0/checksums.sha256
node --check src/app.js
node --check src/character-import.js
node --check src/characters.js
node --check src/encounter.js
node --check src/geometry.js
node --check src/life-cycle-v040.js
node --check src/session-persistence.js
node --test
```

## Results

- 内容清单：`28 / 28 OK`。
- Node 语法检查：`7 / 7` 通过。
- 自动化测试：`15 / 15` 通过，`0 failed / 0 skipped`。
- 通过的测试：`character-import-m1-s3`、`character-lifecycle-m1-s5`、`character-ui-m1-s3`、`characters-m1-s1`、`characters-m1-s2`、`encounter-v020`、`geometry`、`life-cycle-v040`、`m1-s5-contract`、`m1-s5-stabilization-ui`、`persistence-m1-s5`、`spellcasting-m1-s4`、`spellcasting-ui-m1-s4`、`v040-ui-contract`、`version-compatibility-v031`。

## Unexecuted / Limitations

- 未在归档阶段重新执行真实用户数据迁移、真实 DM 长时会话、跨多次对话持续性、压力测试、浏览器下载文件落盘检查或额外规则人工核对；这些不被表述为本日志已执行事实。
- 已有隔离浏览器验证和 User Human Acceptance 继续以 `version-work/v0.4.0/TESTING.md` 的分级记录为准。
- 未记录自动测试失败。
