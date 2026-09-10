# v0.7.1 Archive Test Execution Log

- **Execution Date：** `2026-09-10`
- **Tested Product Identity：** Release content from `releases/v0.7.1/dnd-terminal-v0.7.1-local-private.zip`
- **Main Verification Commit：** `c9ab9ab`（产品源码与发布基线 `3946fb1` 一致；其后提交仅为发布文档同步）
- **Status：** `Final`

## 1. Main Workspace Regression

Executed from `/Users/chenzehao/Projects/DND Terminal`:

```sh
node --check src/app.js
node --check src/battle-workbench.js
node --check src/map-controller.js
node --test tests/*.test.mjs
git diff --check
```

Results:

- Three runtime modules passed syntax checks.
- `26` test files passed; `0` failed, `0` skipped.
- `git diff --check` passed.

## 2. Release Package Integrity and Source Identity

- Release ZIP `releases/v0.7.1/dnd-terminal-v0.7.1-local-private.zip` passed `unzip -t`.
- Release content manifest `releases/v0.7.1/checksums.sha256` contains `51` file hashes and has SHA-256 `b249140b4e1904238f7acfea5ae3ee940a49e43e37f492e3ca719f79ca2cc457`.
- ZIP SHA-256 is `741f1e76f295f47dc9302a2f187f7e667739752feb273433f54b38d49b4ff1e7`.
- The archive snapshot was extracted from that ZIP without source-tree reconstruction. `archive/CODE_SNAPSHOT_MANIFEST.sha256` is the pre-existing content manifest; all `51/51` snapshot files match item by item.

## 3. Extracted Package Regression

From an isolated extraction of the Release ZIP:

```sh
node --check src/app.js
node --check src/battle-workbench.js
node --check src/map-controller.js
node --test tests/*.test.mjs
```

Results: syntax checks passed; `26` test files passed; `0` failed.

## 4. Safety and Browser Evidence

- Sensitive-pattern scan over the extracted package for API key, secret, password, Bearer credential and private key patterns returned no matches.
- Isolated Chrome verification and User Safari human acceptance are recorded in `../TESTING.md`; console errors were `0` in the isolated run.

## 5. Unexecuted or Retained Limits

- Firefox/Edge real-browser acceptance, performance/long-session checks, real-user data migration and public-environment checks were not executed.
- These limits remain explicit and do not change the passing results above.
