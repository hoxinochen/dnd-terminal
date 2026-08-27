# Independent Review：DND Terminal v0.3.1

- **状态：** `Review Approved — User`
- **评审启动与批准：** User / `2026-08-24`；User 在同一授权中明确允许后续 Local Private Release 与 Archive。
- **评审范围：** 已冻结的 `v0.3.1` ABC A-2 至 A-4、验收期 Chrome 缓存修复，以及对应测试和发布候选；不包含任何新玩法、规则准入、数据迁移或 Backlog 项。
- **独立性说明：** 本记录是与实施分离的证据复核；复核不修改产品代码、规则来源、原始 Excel、用户数据或 v0.3.0 冻结材料。它不声称存在外部第三方评审者。

## 1. 证据分级

- **自动化：** 实际执行 6 项 Node 语法检查，全部通过；实际执行 `tests/*.test.mjs`，13 / 13 通过。
- **人工验收：** User 于 `2026-08-24` 明确确认“人工验收通过 v0.3.1”。
- **浏览器：** `TESTING.md` 记录了隔离旧/新 Envelope 导入、刷新恢复、未来 Schema 拒绝、导出提示，以及 Chrome 缓存修复后的实际渲染；本评审不把静态阅读冒充为新的用户浏览器验收。
- **规则：** 本交付没有准入新规则。既有规则源 `Lore_01_核心玩家规则.md` 的 SHA-256 为 `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8`，与 v0.3.0 记录一致。

## 2. 工作区身份与复现检查

- **技术基线：** post-v0.3.0 Git baseline `0a90260e5e490fbb8415b83c52601f12c21935a5`；它只是维护技术起点，不是 v0.3.0 的发布或归档身份。
- **当前工作区变更：** `index.html`、`src/app.js`、`src/encounter.js`、3 个脱敏浏览器夹具与 `tests/version-compatibility-v031.test.mjs`。没有其他未追踪发布候选文件。
- **代码质量：** `git diff --check` 通过。
- **保护性复核：** 从 v0.3.0 冻结 `archive/code-snapshot/` 对其发布清单复核，21 / 21 `OK`。
- **秘密扫描：** 对发布候选执行 API key、secret、password、私钥与 Bearer 模式扫描，无命中。

| 受本补丁影响的文件 | SHA-256 |
|---|---|
| `index.html` | `40d11618adae0f0405e9c21b97656eeb863f8bb51867c61d0e66fbcf30351ae5` |
| `src/app.js` | `69e2669aa1ec739228480a9ce2b212a2d57e8d2c40cb454af751741dc0be3e12` |
| `src/encounter.js` | `38cbd0a6fbb28e193313aaa47d7a0a951a7ac8bf807e9fb1ff19059439db6c54` |
| `tests/version-compatibility-v031.test.mjs` | `77499f130eb8687ab5b9f5238c3568f60d798ae5db092dd95dcd809dd20a5040` |
| `tests/fixtures/future-schema-browser-rejection.json` | `4a91d6103691f48914bca931483165fe232c46105bc3b3dbfadfefd0b99c95f3` |
| `tests/fixtures/v020-browser-compat.json` | `1430f2576ab024f0992f13244015dd74dff0cd8272e5134473016562510ac72e` |
| `tests/fixtures/v031-browser-compat.json` | `35a9ed91fc08641ef5f326ce54c0d96e4e2e1b8aeb11f6b4dbb02800b81a7f23` |

## 3. 合同与范围复核

| 合同 | 复核结果 |
|---|---|
| Delivery、Session Envelope、CharacterSheet 与 storage namespace 分离 | 通过。Delivery 为 `0.3.1`；Session Envelope Schema 仍为 `0.2.0`；CharacterSheet Schema 仍为 `0.3.0-m1-s5`；五个既有 storage key 未改名。 |
| 导入/导出兼容 | 通过。导出可携带可选 `deliveryVersion: "0.3.1"`，但 v0.1.0/v0.2.0 Schema 接受路径不变，未知 Schema 被安全拒绝。 |
| 缓存修复 | 通过。入口和更新的 `encounter.js` 使用新的资源修订标记，避免 Chrome 用旧模块搭配新入口；浏览器标题和页头均显示 v0.3.1 身份。 |
| 玩法、规则与数据边界 | 通过。未新增 D&D 规则、角色字段、事件语义、写回行为、存储迁移、用户数据写入或 Rules Baseline 改动。 |

## 4. 测试复核

```text
node --check src/app.js
node --check src/encounter.js
node --check src/characters.js
node --check src/character-import.js
node --check src/session-persistence.js
node --check src/geometry.js
for test_file in tests/*.test.mjs; do node "$test_file"; done
```

结果：6 / 6 语法检查通过；13 / 13 自动化测试通过。`version-compatibility-v031.test.mjs` 额外固定了 v0.3.1 的 Envelope 字段、旧/新浏览器夹具、未知 Schema 拒绝、存储键不变、资源修订与浏览器标签身份。

## 5. 评审发现与保留风险

- **R31-001 非阻塞：** 手动下载文件的实际保存位置仍由用户浏览器决定；字段内容由纯 Envelope 合同测试精确覆盖，User Human Acceptance 已通过。
- **R31-002 非阻塞：** 本地静态服务在其进程退出后不会持续可用；这是本地私有运行方式，不是产品数据或兼容性缺陷。
- **无阻塞发现。**

## 6. 结论

**结论：Review Approved — User。** 已冻结范围、自动测试、人工验收、版本/数据合同、规则边界、Chrome 缓存修复和 v0.3.0 冻结保护之间未发现阻塞性不一致。

User 已明确授权继续完成 `v0.3.1 Local Private Release` 与 `Archive`。该授权不授予部署、公开发布、再分发、分支、Commit 或 Push。
