# v0.3.1 Implementation：版本身份与兼容性补丁

- **交付 ID：** `v0.3.1`
- **状态：** `Implementation Complete / Human Accepted — Awaiting Independent Review Authorization`
- **ABC：** `version-work/v0.3.1/ABC.md`（User 已批准并冻结）
- **Implementation Authority：** User 于 `2026-08-24` 明确指令“实施该版本”
- **实施日期：** `2026-08-24`
- **技术基线：** `0a90260e5e490fbb8415b83c52601f12c21935a5`
- **Review / Release / Archive：** 未授权、未创建、未进入

## 1. 实施结果

v0.3.1 已完成一个兼容性补丁，不增加 D&D 规则、战斗玩法、角色字段、事件语义或浏览器存档迁移。

1. 产品交付身份现为 `v0.3.1`；UI 单独显示稳定的 `Session Schema 0.2.0`，不再把 `M1-S5 候选` 表述为当前交付身份。
2. 新增 `createSessionEnvelope()`，把 `schemaVersion`、遗留兼容字段 `appVersion`、可选的 `deliveryVersion`、时间、会话和 checksum 集中构造。
3. 手动 JSON 导出增加 `deliveryVersion: "0.3.1"`；它只是来源元数据，导入仍只按 `schemaVersion` 判定兼容。
4. 浏览器自动保存继续使用原有 Envelope 形状，不写入 `deliveryVersion`；所有既有 localStorage key 原样保留，没有扫描、搬迁、复制或删除用户数据。
5. 未知 Schema 的错误文案明确为“仅接受 v0.1.0 或 v0.2.0 Session Envelope Schema”。
6. 修复本地静态服务/Chrome 对旧模块缓存时可能出现的模块导出失配：入口 `app.js` 与其更新的 `encounter.js` 采用同一新的资源修订标记；浏览器标签标题同步为 `DND Terminal v0.3.1 — Local Private`。此修复不改变任何 Envelope、角色、存储键或玩法合同。

## 2. 实际文件变更

| 路径 | 实际变更 |
|---|---|
| `src/app.js` | 分离 Delivery Version 与 Session Envelope Schema；使用 Envelope 构造器；更新页头身份；导出追加可选 `deliveryVersion` 和下载提示。 |
| `src/encounter.js` | 新增纯 `createSessionEnvelope()`；澄清未知 Schema 的错误文案。 |
| `index.html` | 更新浏览器标签的 Delivery 身份；更新模块入口资源修订标记以使 Chrome 取得当前交付。 |
| `tests/version-compatibility-v031.test.mjs` | 新增 v0.3.1 版本、Envelope、存储键、旧/新输入和未知 Schema 合同测试，并固定入口/依赖模块资源修订。 |
| `tests/fixtures/*.json` | 新增脱敏的 v0.2、v0.3.1 与未来 Schema 浏览器验证夹具。 |

未改动：`src/characters.js`、`src/session-persistence.js`、Rules Baseline、规则来源、原始 Excel、用户数据，以及 v0.3.0 的 Archive、发布 ZIP、清单和代码快照。

## 3. 已冻结的数据与兼容合同

- `Session Envelope Schema`：仍为 `0.2.0`。
- `CharacterSheet Schema`：仍为 `0.3.0-m1-s5`。
- localStorage key：`dnd-terminal.v0.3.0-m1-s5.session.current`、`dnd-terminal.v0.2.0.session.current`、`dnd-terminal.v0.2.0.templates`、`dnd-terminal.v0.3.0-m1-s5.character-records`、`dnd-terminal.v0.3.0.character-records` 均未改名。
- v0.1.0/v0.2.0 Envelope 继续走原有导入路径；没有 `deliveryVersion` 的旧导出继续有效。
- `deliveryVersion: "0.3.1"` 不改变 Session Schema 校验，也不触发角色/会话迁移。
- 角色卡、投影、实例、事件、补偿撤销与战后 revision N+1 链均未改变。

## 4. 验证事实

详见同交付 `TESTING.md`。本轮实际完成：

- 6 个 `src/*.js` 语法检查通过；
- 13/13 Node 自动测试通过（原 12 项回归 + `version-compatibility-v031.test.mjs`）；
- 隔离 origin `http://127.0.0.1:4175` 的浏览器验证：旧 v0.2 夹具导入并跨刷新保留；带 `deliveryVersion` 的 v0.3.1 夹具导入成功；未来 Schema 被拒绝且当前会话保留；手动保存成功；导出按钮已实际点击且页面给出下载提示。
- 浏览器已实际点击导出并显示下载提示；浏览器驱动没有提供可等待的下载完成事件。导出字段本身由 `createSessionEnvelope()` 自动测试精确验证，浏览器控制台没有 error/warning。实际下载文件的保存位置/内容留给 User Human Acceptance 复核。
- v0.3.0 Archive Snapshot 对发布清单复核为 21/21 `OK`；产品当前工作区发生的仅是本交付列明的未提交实现变更。
- Rules Baseline 来源文件 SHA-256 仍为 `b9c329141af1aecaa32dcb26bed6333d88b9ced935146dc9a5cef47888780be8`。

## 5. 偏差、风险与回退

- **偏差：** 无范围扩张。实现计划原定“浏览器确认导出字段”；受浏览器驱动下载事件限制，字段由自动 Envelope 合同测试确认，浏览器只确认实际点击和下载提示。此限制未被表述为下载文件内容已人工核验。
- **验收期缺陷修复：** Chrome 曾从缓存读取旧 `encounter.js`，而新 `app.js` 需要其新增导出，导致白屏。该问题在 User 的“解决”指令下修复；它属于 A-2/A-4 内的资源失效修复，不构成 ABC 的实质调整或新的玩法/数据合同。修复后自动检查 13/13 通过，Chrome 实际页头和战斗界面正常渲染。
- **风险：** 没有 Schema/存储键迁移，风险限于版本显示、导出元数据和错误文案。
- **回退：** 回退 `src/app.js`、`src/encounter.js` 及新增测试即可；因为未改 Schema 或 storage key，不需降级或清理用户数据。技术基线仍为 `0a90260e5e490fbb8415b83c52601f12c21935a5`。本轮没有 Commit 或 Push。

## 6. 当前停止点

User 于 `2026-08-24` 明确确认“人工验收通过 v0.3.1”。Implementation 与 Human Acceptance 均已完成；下一门禁是 User 对 Independent Review 的明确授权。未经该授权，不进入 Review、Release 或 Archive。
