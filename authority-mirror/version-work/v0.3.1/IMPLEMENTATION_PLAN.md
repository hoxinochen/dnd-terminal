# v0.3.1 具体实施方案

- **交付 ID：** `v0.3.1`
- **文档性质：** Planning Only；不是实施记录
- **状态：** `Planning Only — Approved ABC / No Implementation Authorized`
- **上位合同：** `version-work/v0.3.1/ABC.md`（User 于 `2026-08-24` 批准并冻结）
- **技术基线：** `0a90260e5e490fbb8415b83c52601f12c21935a5`
- **计划日期：** `2026-08-24`

本文件只说明在 ABC 获批且 User 另行授权 Implementation 后应如何施工。它不授予修改代码、测试、用户数据、Git、Release 或 Archive 的权限；如与 Approved ABC 冲突，以 ABC 为准。

## 1. 预期结果

完成后，用户看到的仍是同一套 v0.3.0 能力，没有新规则和新玩法；不同之处只有：

- 产品交付身份显示为 `v0.3.1`；
- UI 和源码能清楚解释“交付版本”与“会话 Schema 0.2.0”的区别；
- 新导出可携带 `deliveryVersion: "0.3.1"` 来源标识；
- 旧导出、旧角色和原浏览器存档继续原地工作；
- 自动测试明确证明没有发生数据迁移和兼容性回退。

## 2. 实施顺序

### Step 0：实施前门禁与基线冻结

1. 重新读取 `AGENTS.md`、Approved v0.3.1 ABC、v0.3.0 Archive Summary 和本计划。
2. 确认 User 已另行明确授权 v0.3.1 Implementation。
3. 记录产品 Git HEAD、工作区状态、v0.3.0 ZIP/manifest SHA-256 和归档 21 文件校验结果。
4. 在隔离测试目录准备脱敏的旧版 Envelope 和 localStorage 夹具；不操作唯一真实用户数据。
5. 若基线不干净或哈希不一致，停止并报告，不开始改动。

### Step 1：建立明确的版本常量

候选文件：`src/app.js`、必要时 `src/encounter.js`。

1. 将当前承担会话 Schema 的 `APP_VERSION` 改为语义明确的名称，例如 `SESSION_ENVELOPE_SCHEMA_VERSION`。
2. 将 Delivery Version 明确设为 `0.3.1`。
3. 保持 `V020_SCHEMA_VERSION === "0.2.0"`、`CHARACTER_SHEET_SCHEMA_VERSION === "0.3.0-m1-s5"` 和所有 storage key 字符串不变。
4. 不新增迁移函数，不扫描、复制或删除其他 storage key。

验收点：仅名称和交付元数据改变；会话与角色对象的数据形状不变。

### Step 2：修正 UI 身份表达

候选文件：`src/app.js`。

1. 页头显示 `DND Terminal v0.3.1`。
2. 会话格式另行显示为 `Session Schema 0.2.0` 或等价中文。
3. 删除把当前产品称为 `M1-S5 候选` 的交付状态文字；可保留 M1-S5 作为冻结能力来源，但不能作为当前门禁。
4. 不改变 Tab、操作入口、战斗逻辑、状态显示或角色详情内容。

验收点：UI 变化只涉及交付/Schema 身份文字。

### Step 3：增加向后兼容的导出来源标识

候选文件：`src/app.js`、`src/encounter.js`。

1. 导出 Envelope 保持：
   - `schemaVersion: "0.2.0"`
   - `appVersion: "0.2.0"`
2. 增加可选元数据：`deliveryVersion: "0.3.1"`。
3. 导入校验继续只以受支持的 Envelope Schema 为准；不得因为 `deliveryVersion` 缺失、为 `0.3.0` 或为 `0.3.1` 而改变结果。
4. 把导入失败文案改为明确说明“仅接受 v0.1.0 或 v0.2.0 Session Envelope Schema”，避免误导用户认为 v0.3.1 导出不能导入。
5. 未知 Schema 或损坏 JSON 失败时，不调用持久化写入，不替换当前会话。

验收点：旧文件可读，新文件可读，未来未知 Schema 安全拒绝。

### Step 4：补齐自动测试

候选文件：

- 新增 `tests/version-compatibility-v031.test.mjs`；
- 按最小需要扩展 `tests/encounter-v020.test.mjs`；
- 按最小需要扩展 `tests/persistence-m1-s5.test.mjs`；
- 如 UI 身份无法由领域测试覆盖，新增或扩展一个专门 UI 合同测试。

最低测试矩阵：

| ID | 场景 | 期望 |
|---|---|---|
| V31-01 | Delivery Version 与 Session Schema 常量 | 分别为 `0.3.1` 与 `0.2.0` |
| V31-02 | Character Schema | 仍为 `0.3.0-m1-s5` |
| V31-03 | storage keys | 与基线逐项完全相同 |
| V31-04 | v0.1.0 Envelope | 沿既有迁移路径成功 |
| V31-05 | v0.2.0 Envelope，无 `deliveryVersion` | 成功 |
| V31-06 | v0.2.0 Envelope，带 `deliveryVersion: 0.3.1` | 成功，业务状态等价 |
| V31-07 | 未知未来 Schema | 拒绝，当前会话不变 |
| V31-08 | 损坏 JSON | 拒绝，当前会话不变 |
| V31-09 | 导出字段 | Schema 字段不变，新增交付来源标识 |
| V31-10 | 现有 12 项回归 | 全部通过 |

UI 测试不能只依赖模糊的源码字符串存在；至少应验证最终渲染文字或用真实浏览器确认。

### Step 5：浏览器兼容验证

在隔离 origin 或独立浏览器 Profile 中执行：

1. 加载一份旧 v0.2.0 Envelope；
2. 验证角色、投影、关联单位、法术资源、武器精通和 PostCombatDiff 仍可见；
3. 刷新页面并确认继续恢复；
4. 导出 v0.3.1 JSON，确认同时存在 Session Schema 和 Delivery Version；
5. 重新导入该 JSON 并继续一个非破坏性操作；
6. 尝试未知 Schema 和损坏 JSON，确认现有会话没有被覆盖；
7. 检查 localStorage，确认没有生成 v0.3.1 新键、没有删除旧键。

浏览器通过事实必须记录执行时间、环境、输入身份和结果；自动测试不能替代该证据。

### Step 6：实施收口

1. 重跑全部源码语法检查和所有自动测试。
2. 复核 v0.3.0 归档 21 文件、发布 ZIP 和 manifest 未变化。
3. 复核 Rules Baseline 与规则来源区未变化。
4. 创建/更新 `version-work/v0.3.1/IMPLEMENTATION.md` 与 `TESTING.md`，只记录实际执行事实。
5. 报告变更文件、命令结果、浏览器证据、未验证项、风险和回退状态。
6. 停止，等待 User Human Acceptance；不进入 Independent Review、Release 或 Archive。

## 3. 预计产品文件变化

| 文件 | 预计变化 | 禁止扩展 |
|---|---|---|
| `src/app.js` | 分离版本常量语义、UI 身份、导出 `deliveryVersion` | 不改玩法、storage key、角色或事件逻辑 |
| `src/encounter.js` | 最小化澄清 Envelope 校验/错误文案 | 不提升 Schema、不扩展迁移范围 |
| `tests/version-compatibility-v031.test.mjs` | 新增补丁合同测试 | 不用源码字符串冒充完整 E2E |
| 既有相关测试 | 仅补兼容断言 | 不重写既有通过标准 |

`src/characters.js`、`src/session-persistence.js`、规则来源和 v0.3.0 归档预计无需产品性改动；它们是回归与冻结检查对象。若实施中发现必须改变其业务逻辑才能完成本补丁，应停止并请求 ABC 修订。

## 4. 风险与控制

| 风险 | 控制 |
|---|---|
| 把 Delivery Version 误当成 Schema | 分离常量，测试固定四类版本身份 |
| 旧 JSON 因显示为 v0.3.1 而被拒绝 | Schema 校验只看 `schemaVersion`；`deliveryVersion` 为可选元数据 |
| 补丁意外触发数据迁移 | storage key 全量冻结并作逐项断言 |
| UI 改动夹带玩法变化 | 预计产品文件表和回归测试限制范围 |
| 源码字符串测试产生虚假信心 | 增加领域断言和隔离浏览器工作流 |
| 实施扩大到持久化重构 | 发现需要新 Schema/新键时停止并修订 ABC |

## 5. 回退方案

- 实施前保留 Git baseline `0a90260e5e490fbb8415b83c52601f12c21935a5` 和一份隔离旧导出。
- 由于本计划不改变 Schema 或 storage key，回退代码后无需数据降级或清理浏览器存储。
- 若新增的 `deliveryVersion` 引发兼容问题，只回退导出元数据和对应 UI/常量改动；旧 JSON 和业务状态不应被改写。
- 不使用自动删除 storage key 作为回退方式。
- Commit、Push、Release 包和 Archive 均须对应门禁授权；本计划不预先授权。

## 6. 需要停止并重新请求授权的条件

出现以下任一情况必须停止：

- 需要修改任何 v0.3.0 冻结文件或发布身份；
- 需要新 storage key、数据迁移或 Schema 提升；
- 需要修改角色、战斗、事件、回写或规则行为；
- 发现旧数据无法在不转换的情况下继续使用；
- 需要安装新依赖或引入浏览器自动化框架；
- 当前 Git 基线不干净、归档哈希不一致或真实用户数据边界不清；
- ABC 尚未批准或 Implementation 尚未单独授权。

## 7. 当前状态

本方案尚未执行。当前没有产品文件、测试、用户数据或规则来源变更，也没有分支、Commit、Push、Review、Release 或 Archive 行为。
