# Release Notes：DND Terminal v0.3.1

- **Release Status：** `Released — Local Private`
- **Release Date：** `2026-08-24`
- **Approval Chain：** User-approved ABC → authorized Implementation → User Human Acceptance → evidence review / User Review Approved → User-authorized Local Private Release。
- **Distribution：** 仅本地私有发布；不部署、不公开分享、不创建远端发布、不 Commit 或 Push，也不据此推导规则资料、翻译、出版或再分发授权。
- **Archive Authorization：** User 已在同一明确授权中允许完成 Archive；Archive 身份在其独立 Gate 全部通过前尚未成立。

## 发布内容

v0.3.1 是对已归档 v0.3.0 的兼容性维护补丁，不增加 D&D 玩法能力：

- 明确区分产品交付版本 `v0.3.1`、Session Envelope Schema `0.2.0`、CharacterSheet Schema `0.3.0-m1-s5` 与既有浏览器存储 namespace；
- 手动 JSON 导出保留 `schemaVersion` / `appVersion` 的 `0.2.0` 语义，并追加可选来源标识 `deliveryVersion: "0.3.1"`；
- 旧 v0.1.0 / v0.2.0 Envelope 继续可导入，未知 Schema 继续安全拒绝且不覆盖当前会话；
- 修复 Chrome 旧模块缓存与新入口不匹配造成的白屏，并将页面与浏览器标签身份显示为 v0.3.1；
- 新增版本/兼容性合同测试和脱敏浏览器夹具。

## 发布包与身份

- 发布包：[dnd-terminal-v0.3.1-local-private.zip](/Users/chenzehao/Projects/DND%20Terminal/releases/v0.3.1/dnd-terminal-v0.3.1-local-private.zip)
- ZIP SHA-256：`633a429c2dcd43754f5bf0aeac58c4b320e72cad4f86687d773e553be73f70f1`
- 内容 SHA-256 清单：[checksums.sha256](/Users/chenzehao/Projects/DND%20Terminal/releases/v0.3.1/checksums.sha256)
- 清单 SHA-256：`a0c227e7978a8b1b6e4e010bdbaeb353296f118baaf630c65cd86abdd06e62c0`
- 包内容：25 个文件（入口 HTML、启动器、7 个 `src/` 文件、13 个 Node 测试和 3 个脱敏浏览器夹具）；ZIP 内另有 3 个目录条目。
- Git technical baseline：`0a90260e5e490fbb8415b83c52601f12c21935a5`；它只用于维护可追溯性，不是本 Release 身份。Release 身份由 ZIP、内容清单和 SHA-256 建立。

发布包不含 Rules Baseline、原始 Excel、未筛选数据、用户会话、浏览器存储、Authority 文档、`.git` 或部署配置。

## 发布验证

- 6 / 6 Node 语法检查通过；
- `tests/*.test.mjs`：13 / 13 通过；
- `unzip -t`：通过；
- 内容清单：25 / 25 通过；
- `REVIEW.md`：`Review Approved — User`；
- User Human Acceptance：`Passed / 2026-08-24`。

## 已知限制与非主张

- 不提升会话或角色 Schema，不迁移、复制或删除浏览器用户数据。
- 不新增规则准入、法术执行、伤害结算、完整角色死亡规则、多人协作、公开部署或公开发布。
- 规则资料只作本地私有验证输入；翻译、出版身份、许可与再分发授权继续为 `unknown`。
- 本机静态服务仅在其本地进程运行时可用；这不是持续托管服务。
