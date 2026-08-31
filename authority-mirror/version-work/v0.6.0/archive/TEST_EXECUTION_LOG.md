# v0.6.0 Archive Test Execution Log

- **Status：** `Final`
- **Execution Date：** `2026-08-31`
- **Execution Scope：** 已发布的 v0.6.0 Local Private ZIP 解出的 `archive/code-snapshot/`；不是活动 Workspace 的替代描述。
- **Record Nature：** Contemporaneous archive execution record.

## Source Identity Before Execution

1. 发布包 `releases/v0.6.0/dnd-terminal-v0.6.0-local-private.zip` 的 SHA-256 为 `366d1d126bde7779f04da5d554b3189116ed1b0e4f5f86850bd14e6850be7448`。
2. 发布内容清单 `releases/v0.6.0/checksums.sha256` 的 SHA-256 为 `5a89d8f333b4a6d334fd0e97ed03b75ea34aad3e7c3db8cb2f013590cf513f84`。
3. 发布 ZIP 已解出到 `archive/code-snapshot/`；测试开始前由发布内容清单逐项校验，`37 / 37 OK`。
4. 该清单在 Local Private Release 时生成；本次归档复测只针对这 37 个已核验字节。
5. 清单固定入口 HTML、启动器、10 个 `src/` 文件、22 个 Node 测试和 3 个合成浏览器夹具；不含用户数据、Authority 文档、Rules Baseline 或运行时配置。

## Commands

```text
shasum -a 256 -c releases/v0.6.0/checksums.sha256
node --check src/*.js
for test_file in tests/*.test.mjs; do node "$test_file" || exit 1; done
rg -n -i '(api[_-]?key|secret|password|bearer[[:space:]]+|private[[:space:]_]?key)' index.html start-dnd-terminal.command src tests
```

## Results

- 内容清单：`37 / 37 OK`。
- Node 语法检查：`9 / 9` 通过。
- 自动化测试：`22 / 22` 通过，`0 failed / 0 skipped`。
- 通过的测试：`character-import-m1-s3`、`character-lifecycle-m1-s5`、`character-ui-m1-s3`、`characters-m1-s1`、`characters-m1-s2`、`encounter-v020`、`geometry`、`life-cycle-v040`、`life-cycle-v050`、`life-cycle-v060`、`m1-s5-contract`、`m1-s5-stabilization-ui`、`persistence-m1-s5`、`spellcasting-m1-s4`、`spellcasting-ui-m1-s4`、`v040-ui-contract`、`v050-amendment03`、`v050-s1-amendment`、`v050-s1-ui-contract`、`v050-s2`、`v060-ui-contract`、`version-compatibility-v031`。
- 秘密扫描：对快照入口、启动器、源码与测试的 API key、secret、password、Bearer、private key 模式无命中。

## Unexecuted / Limitations

- 归档阶段未重做触屏验证、真实用户数据迁移、真实 DM 长时会话、隔离 origin 的逐步浏览器记录、跨多次对话持续性、压力测试、浏览器下载落盘检查或额外规则人工核对；这些不被表述为本日志已执行事实。
- User 已在 Release 前明确确认浏览器完成流程与 Human Acceptance 通过；其授权事实以 `TESTING.md`、`REVIEW.md` 与 `RELEASE_NOTES.md` 为准。
- 未记录自动测试失败。
