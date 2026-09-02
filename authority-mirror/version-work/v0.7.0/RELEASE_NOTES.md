# Release Notes：DND Terminal v0.7.0

- **Release Status：** `Released — Local Private`
- **Release Date：** `2026-09-02`
- **Release / Archive Authorization：** User / `2026-09-02` / “release and archive 未遇到特殊情况，允许两个先后一次性执行”
- **Delivery Scope：** `v0.7.0` 主 Slice、Amendment 01 及其获授权的 Review 后 R70-001 非阻塞修正。
- **Formal Product Baseline：** `v0.6.0 Archived — Local Private`（冻结历史，不被本发布改写）。
- **Technical Starting Point：** `main@3464d173779d6b14be4fe66c7b4444223f6a7779`；本地发布身份由下述 ZIP 与清单建立，不以未提交工作树或 Git Commit 代替。
- **Archive Status：** `Authorized — Pending Finalization`

## 发布身份

| Artifact | Path | SHA-256 |
|---|---|---|
| Local Private release ZIP | `/Users/chenzehao/Projects/DND Terminal/releases/v0.7.0/dnd-terminal-v0.7.0-local-private.zip` | `00e48a82d4d2d62a3ccf0c84ab7e8bfe3b4927ec0c3f9ebf2723b2bb0af3e4d1` |
| Content manifest | `/Users/chenzehao/Projects/DND Terminal/releases/v0.7.0/checksums.sha256` | `d32fdcd82e0988b9088c9bc84ef7d4e219a934c14ebe5b5cd851fda51b5b6914` |

ZIP 包含 `42` 个产品源码、测试、固定测试夹具和本地启动器文件；不包含 Authority 文档、Rules Baseline、用户数据、浏览器 `localStorage`、`.git`、历史 Release 或 Archive 材料。

## 本次能力

- 建立只读 Status / Workspace Projection、稳定 Shell、七个工作区、统一视觉 Token、受控布局与 UI/业务存储隔离。
- 修复角色选择/当前角色/战后审核面板覆盖，建立行动经济矩阵、标准/紧凑信息层级和对齐的效果/候选输入。
- 地图采用 `MapViewport` / `MapCanvas` 分层；保留 fit/tactical、滚动、定位与范围预览，地图图片导入、动态边界、负坐标和热扩展仍延期至 BL-007。
- 掷骰支持复合有符号骰式、快捷输入候选、最新 100 条滚动历史和结构化骰果记录。
- 角色页统一“创建角色”入口；开发验证工具移至设置并默认折叠，固定场景替换带确认与待审核差异阻断。
- Review 后恢复固定验证场景的 9 个单位、角色基线、地精同组先攻及当前模板 ID 的确定性映射。

## 发布前验证

| Check | Result |
|---|---|
| Syntax and source regression | 四个 v0.7 运行模块 `node --check` 通过；Workspace `node --test tests/*.test.mjs` 为 `24/24`；`git diff --check` 通过。 |
| Browser and Human Acceptance | `TESTING.md` 记录隔离浏览器复验；User 已确认人工审核通过。 |
| Package integrity | `unzip -t` 通过；解压后按内容清单 `42 / 42` 通过。 |
| Package regression | 解压发布包后再次运行 `node --test tests/*.test.mjs` 为 `24/24`，四个 v0.7 模块语法检查通过。 |
| Sensitive-pattern scan | 对发布解压内容扫描 API key、secret、password、Bearer、private key 模式，无命中。 |

## 边界与后续门禁

本次完成 User 授权的 Local Private Release，并已获 Archive 授权进入下一步归档。未执行 Commit、Push、部署、公开发布或再分发。BL-007 地图导入/动态边界/负坐标/热扩展与 BL-029 单位库搜索筛选继续保持后续 Backlog 身份。
