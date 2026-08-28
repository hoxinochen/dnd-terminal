# v0.5.0 Archive Test Execution Log

- **Status：** `Final`
- **Execution Date：** `2026-08-28`
- **Execution Scope：** 已发布的 v0.5.0 Local Private ZIP 解出的 `archive/code-snapshot/`；不是活动 Workspace 的替代描述。
- **Record Nature：** Contemporaneous archive execution record.

## Source Identity Before Execution

1. 发布包 `releases/v0.5.0/dnd-terminal-v0.5.0-local-private.zip` 的 SHA-256 为 `6c51367227fb5ab763605b597e46541f05514a9c0e0f1f68985e3278ae3920b1`。
2. 发布内容清单 `releases/v0.5.0/checksums.sha256` 的 SHA-256 为 `8d7e0ffe9a8a3f2ae5804be7b213f5a98c917932a85d1da57af390debe1a8941`。
3. 发布 ZIP 已解出到 `archive/code-snapshot/`；测试开始前由发布内容清单逐项校验，`34 / 34 OK`。
4. 该清单在 Local Private Release 时生成；本次归档复测只针对这 34 个已核验字节。
5. 清单固定入口 HTML、启动器、9 个 `src/` 文件、20 个 Node 测试和 3 个合成浏览器夹具；不含用户数据、Authority 文档、Rules Baseline 或运行时配置。

## Commands

```text
shasum -a 256 -c releases/v0.5.0/checksums.sha256
node --check src/app.js
node --check src/character-import.js
node --check src/characters.js
node --check src/encounter.js
node --check src/geometry.js
node --check src/life-cycle-v040.js
node --check src/life-cycle-v050.js
node --check src/session-persistence.js
for test_file in tests/*.test.mjs; do node "$test_file" || exit 1; done
```

## Results

- 内容清单：`34 / 34 OK`。
- Node 语法检查：`8 / 8` 通过。
- 自动化测试：`20 / 20` 通过，`0 failed / 0 skipped`。
- 通过的测试：`character-import-m1-s3`、`character-lifecycle-m1-s5`、`character-ui-m1-s3`、`characters-m1-s1`、`characters-m1-s2`、`encounter-v020`、`geometry`、`life-cycle-v040`、`life-cycle-v050`、`m1-s5-contract`、`m1-s5-stabilization-ui`、`persistence-m1-s5`、`spellcasting-m1-s4`、`spellcasting-ui-m1-s4`、`v040-ui-contract`、`v050-amendment03`、`v050-s1-amendment`、`v050-s1-ui-contract`、`v050-s2`、`version-compatibility-v031`。
- 秘密扫描：对快照入口、启动器、源码与测试的 API key、secret、password、Bearer、private key 模式无命中。

## Unexecuted / Limitations

- 未在归档阶段重新执行真实用户数据迁移、真实 DM 长时会话、隔离 origin 的端到端浏览器验收、跨多次对话持续性、压力测试、浏览器下载文件落盘检查或额外规则人工核对；这些不被表述为本日志已执行事实。
- User 的 Review / Local Private Release 授权和迭代 Chrome 反馈以 `version-work/v0.5.0/REVIEW.md`、`TESTING.md` 与 `RELEASE_NOTES.md` 的分级记录为准。
- 未记录自动测试失败。
