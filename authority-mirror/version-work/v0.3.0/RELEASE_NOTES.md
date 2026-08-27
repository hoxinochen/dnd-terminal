# Release Notes：DND Terminal v0.3.0

- **Release Status：** Released — Local Private
- **Release Date：** `2026-08-24`
- **Approval Chain：** User-approved ABC → M1-S1 至 M1-S5 及 Amendment 2 完成 → User Human Acceptance → Independent Review 推荐批准 → User Review Approved → User-authorized Local Private Release
- **Distribution：** 仅本地私有发布；不部署、不公开分享、不创建远端发布或 Git 身份，也不据此推导规则资料、翻译、出版或再分发授权。
- **Archive Status：** 未授权；本交付尚未归档。

## 发布内容

v0.3.0 将 DND Terminal 从单位与遭遇战斗工具扩展为本地私有的长期角色与战斗投影闭环：

- 长期 `CharacterSheet`、可审计修订、战斗投影和实例资源隔离；
- 受控 Excel `CharacterDraft` 导入、来源/缺失/拒绝路径与同源更新预览；
- 八区角色详情、结构化攻击、轻量装备与关联单位；
- 多职业、多施法来源、独立资源池及多个 `CastingOption`；
- DM 确认的短弓 `Vex/侵扰` 候选与效果提醒；其他精通维持明确的人工处理边界；
- 关联单位独立生成棋子并加入遭遇、独立 HP 与行动轮；
- 战后逐项 `accept / reject / correct` 回写、字段级防呆、过期候选阻断与废除本场候选终态；
- 长期角色归档、恢复与安全删除，以及会话保存失败保护。

## 发布包与身份

- 发布包：[dnd-terminal-v0.3.0-local-private.zip](/Users/chenzehao/Projects/DND%20Terminal/releases/v0.3.0/dnd-terminal-v0.3.0-local-private.zip)
- ZIP SHA-256：`bbb689aa2e2ee8cb3a55effc6186c274c4710f48310ece13376d791b87f6aa36`
- 内容 SHA-256 清单：[checksums.sha256](/Users/chenzehao/Projects/DND%20Terminal/releases/v0.3.0/checksums.sha256)
- 清单 SHA-256：`01cbc5f86ef9a665e08e470d1f8893dd47494558a311dfd7086bab8a61c99aa2`
- Git identity：不适用；Workspace 未初始化 Git。

发布 ZIP 包含 21 个文件：入口 HTML、本机启动器、7 个 `src/` 源文件和 12 个 Node 回归测试；不包含原始 Excel、规则来源、未筛选数据集、用户会话或部署配置。

## 发布验证

- `node --check src/app.js`、`src/characters.js`、`src/character-import.js`、`src/session-persistence.js`：pass；
- `tests/*.test.mjs`：12 / 12 pass；
- `unzip -t dnd-terminal-v0.3.0-local-private.zip`：pass（21 / 21）；
- 包内文件 SHA-256 与清单已在打包后生成并保存。

## 已知限制与非主张

- 仅已准入的匕首/Nick 和短弓/Vex 进入精通选择；仅 Vex 生成 DM 确认后的优势提醒，不自动掷骰、命中、伤害、移动或改变行动经济。
- 完整角色 `0 HP` / 死亡豁免、完整规则引擎、全量职业/法术/精通合法性、多人协作、公开部署与公开发布仍不在本版本承诺中。
- 规则资料只作本地私有验证输入；翻译、出版身份、许可与再分发授权继续为 `unknown`。
- 本 Release 使用 SHA-256 而非 Git 提交标识；浏览器人工验收事实按 `TESTING.md` 和 `REVIEW.md` 的分级记录保留。
