# Repository Guidelines

本仓库是 GKD 订阅模板，使用 TypeScript + pnpm 编写。运行环境需 nodejs >= 22（用于 WasmGc 校验正则）与 pnpm >= 9。

## 项目结构与模块组织

- `src/subscription.ts`：订阅元信息（`id`、`name`、`version`、`author` 等）。
- `src/globalGroups.ts`：全局规则。
- `src/categories.ts`：规则分类。
- `src/apps/`：单应用规则，每个应用一个文件，按包名命名（如 `com.tencent.mm.ts`）。
- `scripts/`：`check.ts` 校验订阅、`build.ts` 构建。
- `dist/`：构建产物（`gkd.json5` 等），由脚本生成，勿手动修改。
- `.github/workflows/`：CI 工作流（校验、格式化、发布）。

## 构建、测试与开发命令

- `pnpm install`：安装依赖。
- `pnpm run check`：`tsc --noEmit` 类型校验 + `tsx scripts/check.ts` 校验订阅结构。
- `pnpm run build`：类型校验并通过 `scripts/build.ts` 生成 `dist/`。
- `pnpm run lint`：运行 ESLint 并自动修复。
- `pnpm run format`：运行 Prettier 格式化。

本地提交前确保 `pnpm run check` 通过；推送时 pre-push hook 会自动执行 `check`。

## 编码风格与命名

- 使用 ESM（`"type": "module"`），`tsconfig.json` 启用 `strict` 与 `noUnusedLocals`。
- Prettier 使用单引号；ESLint 集成 `unused-imports` 插件，未使用的导入会报错。
- 应用规则文件以包名命名（`com.xxx.yyy.ts`），通过 `defineGkdApp`、`defineGkdSubscription` 等模板导出 default。
- 提交由 lint-staged / 简单 git hooks 自动执行格式化与 lint 修复。

## 测试指南

- 无独立测试框架，依靠 `pnpm run check` 进行类型与订阅结构校验。
- 提交/开 PR 前必须通过 `pnpm run check`；格式与 lint 由 hook 与 CI 自动处理。

## 提交与 PR 指南

- Git 历史遵循 Conventional Commits 风格：发布版本用 `chore: vX.Y.Z`，CI 自动格式化用 `chore(actions): check_format_lint`。
- 每个 PR 尽量只改一个文件（`pull_request_check` 限制 `src/` 变更文件数 <= 1），并在描述中说明变更的应用/规则及关联问题。
- 可选：新建应用规则时单个 Commit 增加对应 app 文件即可。

## 其他注意事项

- 修改 `src/subscription.ts` 中的 `id` 为一个较大的随机数，避免与其他订阅冲突。
- 私有信息（密钥等）不要提交，`.gitignore` 已忽略 `.env`。
- CI 需在仓库 Settings > Actions 中开启 Read and write permissions，才能自动格式化并推送。
