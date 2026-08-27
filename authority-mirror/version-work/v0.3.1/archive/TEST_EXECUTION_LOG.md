# v0.3.1 Archive Test Execution Log

- **Status：** `Final`
- **Execution Date：** `2026-08-24`
- **Execution Scope：** 已发布 `v0.3.1` ZIP 解出的 `archive/code-snapshot/`；不是活动 Workspace 的替代描述。
- **Record Nature：** Contemporaneous archive execution record.

## Source Identity Before Execution

1. 发布包 `releases/v0.3.1/dnd-terminal-v0.3.1-local-private.zip` 的 SHA-256 为 `633a429c2dcd43754f5bf0aeac58c4b320e72cad4f86687d773e553be73f70f1`。
2. 发布内容清单 `releases/v0.3.1/checksums.sha256` 的 SHA-256 为 `a0c227e7978a8b1b6e4e010bdbaeb353296f118baaf630c65cd86abdd06e62c0`。
3. 发布 ZIP 已解出到 `archive/code-snapshot/`；在测试开始前对该快照执行内容清单，25 / 25 `OK`。
4. 该清单逐项固定入口、启动器、7 个 `src/` 文件、13 个 Node 测试和 3 个脱敏浏览器夹具；本日志记录的测试只针对这些已核验字节。

## Commands

```text
shasum -a 256 -c releases/v0.3.1/checksums.sha256
node --check src/app.js
node --check src/encounter.js
node --check src/characters.js
node --check src/character-import.js
node --check src/session-persistence.js
node --check src/geometry.js
for test_file in tests/*.test.mjs; do node "$test_file"; done
```

## Results

- 内容清单：25 / 25 `OK`。
- Node 语法检查：6 / 6 通过。
- 自动化测试：13 / 13 通过。
- 通过的测试：`character-import-m1-s3`、`character-lifecycle-m1-s5`、`character-ui-m1-s3`、`characters-m1-s1`、`characters-m1-s2`、`encounter-v020`、`geometry`、`m1-s5-contract`、`m1-s5-stabilization-ui`、`persistence-m1-s5`、`spellcasting-m1-s4`、`spellcasting-ui-m1-s4`、`version-compatibility-v031`。

## Unexecuted / Limitations

- 未在归档阶段重新执行真实用户数据导入、浏览器下载文件落盘检查或规则人工核对；这些不被表述为本日志已执行事实。
- 已有隔离浏览器验证和 User Human Acceptance 继续以 `version-work/v0.3.1/TESTING.md` 的分级记录为准。
- 未记录自动测试失败。
