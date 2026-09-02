# v0.7.0 Archive Test Execution Log

- **Status：** `Final`
- **Execution Date：** `2026-09-02`
- **Execution Scope：** 已发布的 v0.7.0 Local Private ZIP 解出的 `archive/code-snapshot/`；不是活动 Workspace 的替代描述。
- **Record Nature：** Contemporaneous archive execution record。

## Source Identity Before Execution

1. 发布包 `releases/v0.7.0/dnd-terminal-v0.7.0-local-private.zip` 的 SHA-256 为 `00e48a82d4d2d62a3ccf0c84ab7e8bfe3b4927ec0c3f9ebf2723b2bb0af3e4d1`。
2. 发布内容清单 `releases/v0.7.0/checksums.sha256` 的 SHA-256 为 `d32fdcd82e0988b9088c9bc84ef7d4e219a934c14ebe5b5cd851fda51b5b6914`。
3. 发布 ZIP 已解出到 `archive/code-snapshot/`；测试开始前由快照清单逐项校验，`42 / 42 OK`。
4. 快照清单 SHA-256 为 `bdf228ea83a22366a7a8b7c812892d6e0fbe60163a9507d94f1f5b73d466ed89`，与发布内容清单逐项一致。
5. 该快照固定入口 HTML、启动器、12 个 JavaScript 源文件、样式表、24 个 Node 测试和 3 个合成浏览器夹具；不含用户数据、Authority 文档、Rules Baseline 或运行时配置。

## Commands

```text
shasum -a 256 -c version-work/v0.7.0/archive/CODE_SNAPSHOT_MANIFEST.sha256
for source_file in version-work/v0.7.0/archive/code-snapshot/src/*.js; do node --check "$source_file"; done
node --test version-work/v0.7.0/archive/code-snapshot/tests/*.test.mjs
rg -n -i '(api[_-]?key|secret|password|bearer[[:space:]]+|private[[:space:]_]?key)' version-work/v0.7.0/archive/code-snapshot/index.html version-work/v0.7.0/archive/code-snapshot/start-dnd-terminal.command version-work/v0.7.0/archive/code-snapshot/src version-work/v0.7.0/archive/code-snapshot/tests
```

## Results

- 内容清单：`42 / 42 OK`。
- Node 语法检查：`12 / 12` 通过。
- 自动化测试：`24 / 24` 通过，`0 failed / 0 skipped`。
- 秘密扫描：对快照入口、启动器、源码与测试的 API key、secret、password、Bearer、private key 模式无命中。
- Release ZIP：`unzip -t` 通过；解压包回归为 `24 / 24`，四个 v0.7 运行模块语法检查通过。

## Unexecuted / Limitations

- 归档阶段未重做触屏验证、真实用户数据迁移、真实 DM 长时会话、压力测试、浏览器下载落盘检查或额外规则人工核对；这些不被表述为本日志已执行事实。
- User 已在 Release 前明确确认人工审核通过；其授权事实以 `REVIEW.md`、`RELEASE_NOTES.md` 与本归档记录为准。
- 未记录自动测试失败。
