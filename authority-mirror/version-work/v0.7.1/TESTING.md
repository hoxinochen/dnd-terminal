# Testing：v0.7.1 统一战斗工作台 UX 适配

- **交付 ID：** `v0.7.1`
- **状态：** `Automated and Browser Verification Passed — Human Accepted — Ready for Main Integration`
- **执行日期：** `2026-09-10`
- **测试候选 commit：** `58ebd929255d157973ec7587d73d6b0fecf05f93`

## 1. 自动测试

执行：

```sh
node --check src/app.js
node --check src/battle-workbench.js
node --check src/map-controller.js
node --test tests/*.test.mjs
git diff --check
```

结果：26/26 个测试文件通过；三个关键运行模块语法通过；Git 空白检查通过。

## 2. 隔离浏览器验证

使用候选本地服务和独立临时 Chrome 配置执行 `scratch/verify-ux-recovery.mjs`，未读取用户浏览器存档或真实 localStorage。

通过项目：

- 全量、战斗、死亡处理三种布局的实际宽度比例；死亡处理下临时右侧展开和双侧栏收起后的空间释放；
- 320、390、768、1024、1280、1440 六档视口 × dark/light/parchment 三主题；页面无横向溢出，顶部骰子控件均在容器内；
- 生命状态标签对比度、主题背景替换、浅色和羊皮纸特殊状态可读性；
- 鼠标和单指触控拖动提示条平移地图；空白短点按在地图/来源视图间往返；高风险草稿、棋子和控件不触发错误导航；
- 资源操作后 details 展开状态、动作快捷操作展开状态、后继继承“全不勾选”状态保持；
- 地图平移和空白导航前后战斗 Session 序列化内容一致；控制台错误为 0。

## 3. 人工验收

User 已在 Safari 中完成当前候选版本验收并确认用户体验良好，作为本交付的人工审核通过。此前隔离 Chrome 验收也已通过。

## 4. 未执行或保留边界

- Firefox/Edge 实机验收未执行；
- 性能、长时会话、真实用户数据迁移和公开环境验收未执行；
- 本文件不把人工验收或自动测试表述为 Release、Archive、部署或公开发布证明；
- 主线合并后的回归仍需在 merge 后执行并补充结果。

## 5. 复现入口

候选分支的可复现脚本为 `scratch/verify-ux-recovery.mjs`。它要求本地静态服务监听 `127.0.0.1:4174`、macOS Chrome 和支持原生 WebSocket 的 Node；输出截图位于临时目录，不进入产品运行时。
