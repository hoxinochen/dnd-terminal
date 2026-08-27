# v0.3.1 Testing：版本身份与兼容性补丁

- **交付 ID：** `v0.3.1`
- **状态：** `Final for Release / Archive — 13 / 13 automated pass; User Human Acceptance Passed; Review Approved`
- **执行日期：** `2026-08-24`
- **执行环境：** Node.js `v26.7.0`；隔离静态 origin `http://127.0.0.1:4175`
- **范围：** 已批准的 v0.3.1 ABC A-2 至 A-4
- **不代表：** User Human Acceptance、Independent Review、Release 或 Archive

## 1. 自动检查

执行的语法检查：

```text
node --check src/app.js
node --check src/encounter.js
node --check src/characters.js
node --check src/character-import.js
node --check src/session-persistence.js
node --check src/geometry.js
```

**结果：6/6 通过。**

执行全部 `tests/*.test.mjs`：

| 测试集合 | 结果 |
|---|---|
| 既有 v0.3.0 回归测试 | 12/12 通过 |
| `version-compatibility-v031.test.mjs` | 通过 |
| 总计 | **13/13 通过** |

`version-compatibility-v031.test.mjs` 实际验证：

| ID | 结果 | 证据 |
|---|---|---|
| V31-01 | Pass | Delivery Version 为 `0.3.1`，Session Schema 为 `0.2.0`。 |
| V31-02 | Pass | `CharacterSheet` Schema 仍为 `0.3.0-m1-s5`。 |
| V31-03 | Pass | 五个既有 storage key 在源码合同中逐项固定，未引入 v0.3.1 key。 |
| V31-04 | Pass | v0.1.0 迁移由既有 `encounter-v020` 回归继续覆盖。 |
| V31-05 | Pass | 无 `deliveryVersion` 的 v0.2 夹具可经 `validateImportedEnvelope()` 导入。 |
| V31-06 | Pass | 带 `deliveryVersion: "0.3.1"` 的 v0.2 Schema Envelope 可导入并保留该元数据。 |
| V31-07 | Pass | `schemaVersion: "0.3.1"` 被安全拒绝；产品交付号不能伪装成 Schema。 |
| V31-08 | Pass | 损坏/不完整 Envelope 的既有拒绝路径继续通过。 |
| V31-09 | Pass | 实际 `createSessionEnvelope()` 断言 Schema 字段不变、导出携带可选 `deliveryVersion`、持久化 Envelope 不携带该字段。 |
| V31-10 | Pass | 既有 12 项回归全部通过。 |
| V31-11 | Pass | `index.html` 的入口资源修订、`app.js` 的更新 Envelope 模块修订及浏览器标签 Delivery 身份均由自动测试固定，防止新入口搭配旧模块缓存。 |

## 2. 隔离浏览器验证

浏览器验证使用 `127.0.0.1:4175`，不是既有产品默认 origin；输入均为 `tests/fixtures/` 中的脱敏 JSON，未读取或检查用户浏览器 localStorage，也未使用真实角色/Excel/用户导出。

| 流程 | 结果 | 实际观察 |
|---|---|---|
| 初始页面 | Pass | 页头显示 `v0.3.1 · 会话 Schema 0.2.0 · 本地私有`。 |
| 旧 v0.2 导入 | Pass | 导入后显示 `v0.2 浏览器兼容夹具` 与成功提示。 |
| 刷新恢复 | Pass | 刷新后旧 v0.2 夹具仍存在。 |
| 带交付元数据的导入 | Pass | `v0.3.1 浏览器兼容夹具` 成功导入。 |
| 未来 Schema 拒绝 | Pass | 显示 Session Envelope Schema 拒绝文案，当前 v0.3.1 夹具仍保留。 |
| 手动保存 | Pass | 显示“已手动保存至此浏览器 localStorage”。 |
| 导出按钮 | Pass with limitation | 已点击并显示 v0.3.1 下载提示，浏览器 console 无 error/warning；控制接口未提供下载完成事件，因此未将文件落盘/内容读回表述为浏览器通过事实。 |
| Chrome 缓存修复复测 | Pass | 在 Chrome 的 `127.0.0.1:4174/?v=20260824-2` 重新加载后，标签标题为 `DND Terminal v0.3.1 — Local Private`，页头为 `v0.3.1 · 会话 Schema 0.2.0 · 本地私有`，战斗界面正常渲染。此前同标签的旧模块报错是修复前历史记录，未在修复后页面重现。 |

自动 Envelope 合同测试已覆盖导出字段；User Human Acceptance 应在正常浏览器中确认下载得到的 JSON 同时含 `schemaVersion: "0.2.0"`、`appVersion: "0.2.0"` 和 `deliveryVersion: "0.3.1"`。

## 3. 冻结边界复核

- 从 `version-work/v0.3.0/archive/code-snapshot/` 对 v0.3.0 发布 `checksums.sha256` 执行校验：**21/21 OK**。
- Rules Baseline 原文件 SHA-256：`b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8`，与实施前一致。
- 没有修改 Rules Baseline、规则来源、原始 Excel、用户数据、v0.3.0 Archive 或发布包。

## 4. 未执行与下一门禁

- 未进行真实用户数据导入；隔离夹具不能替代 User Human Acceptance。
- 未验证浏览器下载管理器的实际文件落盘，原因是控制接口未返回下载完成事件；这不是自动合同测试失败。
- 未创建/执行 `REVIEW.md`、`RELEASE_NOTES.md` 或 Archive 材料。

## 5. 用户人工验收

- **状态：** `Passed / User / 2026-08-24`。
- **验收结论：** User 明确确认“人工验收通过 v0.3.1”。
- **门禁影响：** v0.3.1 记为 `Complete / Human Accepted`。此结论不授予 Independent Review、Release、Archive、部署或公开发布；下一步仍须 User 明确授权 Independent Review。
