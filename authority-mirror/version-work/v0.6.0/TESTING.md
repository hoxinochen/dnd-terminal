# Testing：v0.6.0 DM 裁定驱动的复活、转生与受控不死生物关联

- **交付 ID：** `v0.6.0`
- **状态：** Automated Tests Passed — Browser Verification and User Human Acceptance Passed
- **执行日期：** `2026-08-31`
- **执行位置：** `/Users/chenzehao/Projects/DND Terminal`

## 已执行自动验证

命令：

```sh
node --check src/app.js
node --check src/life-cycle-v060.js
for test in tests/*.test.mjs; do node "$test" || exit 1; done
git diff --check
```

结果：22/22 个 Node 合同/回归测试通过；语法检查和 Git 空白检查通过。

新增覆盖：

- `tests/life-cycle-v060.test.mjs`：Schema/Delivery、独立 storage key、八个法术按结果过滤、自定义依据、重复 event ID 拒绝、v0.5.0 copy-on-write 迁移。
- `tests/v060-ui-contract.test.mjs`：三张结果卡、无第四张不死生物 PC 卡、三个形态子选项、折叠详细参考、遗体防腐辅助记录、DM 管理期限、长休不等于 24 小时、重复来源确认和恢复预览入口。
- Amendment 01 覆盖：八法术 `SpellRulingProfile`、标准/材料四种裁定状态、法术/依据选择器、裁定资料分段控件和完整前预览进度。
- 既有 v0.4.0/v0.5.0/版本兼容测试更新为同时保留历史模块断言与当前 v0.6.0 入口、Schema、缓存版本断言。

## 浏览器与人工验收

User 于 `2026-08-31` 明确确认浏览器完成流程与人工确认通过。该结论覆盖本交付的功能完成性；已观察到模块可运行且应显示内容均出现。未单独保留隔离 origin、窄屏或每条流程的操作截图/录像，后续浏览器回归仍应补足这些可重复证据。

## 未执行或未重复验证

- 触屏验证：未执行。
- Rules Baseline 人工复核：未重复执行；本交付只使用已冻结 Entry 的非阻塞提示。

## 结论

自动回归、浏览器完成流程与 User/DM Human Acceptance 均已通过。Review 已获 User 批准并进入 User 授权的 Local Private Release；不构成 Archive、Commit 或 Push 授权。
