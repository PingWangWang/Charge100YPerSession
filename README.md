# 西安交警-违停上报助手

> 面向微信小程序「西安交警」的个人 GKD 订阅，自动完成「交通违法随手拍 → 违停行为上报」的**点击类**操作。文本输入与号牌信息由用户手动填写。

## 说明

本订阅面向「交通违法随手拍 → 违停行为上报」流程，自动执行可确定化的点击动作，减少重复操作。由于 GKD 订阅规则不支持文本输入（`action` 仅支持 click / back / longClick / swipe 等），凡涉及输入的内容均保留给用户手动完成。

**自动完成（点击类）**：

1. 首页 → 点击「随手拍」
2. 随手拍页 → 点击「交通违法行为」的「立即上报」
3. 用户须知 → 勾选「我已阅读并同意」→ 点击「开始上报」
4. 违法类型 → 选择「违停行为」
5. 填写信息 → 关闭「注意事项」弹窗（确认）
6. 上报位置 → 点击「重新选择」→ 点击定位搜索结果第一条 → 点击「完成」
7. 拍照辅助 → 第 1 张由用户手动拍摄；第 2/3 张自动点击「上传照片」，每张拍摄后自动点击相机预览「完成」

**手动完成（输入/核对）**：

- 问题描述（如「路边违停」）
- 详细地址（如「灞桥区元熙樾府小区（绕城高速联络线）」）
- 定位搜索关键词（如「元熙樾府」）
- 号牌类型（蓝=小型汽车 / 绿=新能源汽车）与车牌号牌
- 点击「提交」

## 环境要求

- Node.js、pnpm（构建用）；GKD ≥ v1.12.0（滑动/自动化工作模式依赖）。
- 已授予 GKD 无障碍权限，并在 GKD 中启用微信（`com.tencent.mm`）规则。
- 手机开启 GPS（定位上报）。

## 订阅 / 使用

### 在线订阅

复制以下任意一个链接到 GKD 即可在线订阅：

- GitHub 源：`https://raw.githubusercontent.com/PingWangWang/Charge100YPerSession/main/dist/gkd.json5`
- jsDelivr 加速（大陆推荐）：`https://fastly.jsdelivr.net/gh/PingWangWang/Charge100YPerSession@main/dist/gkd.json5`
- npmmirror 源（需先发布到 npm）：`https://registry.npmmirror.com/xi-an-traffic-violation-subscription/latest/files/dist/gkd.json5`

> [!IMPORTANT]
> GitHub / jsDelivr 源需要在把最新的 `dist/gkd.json5` **提交并推送到 `main` 分支**后才可访问；npmmirror 源需先在本地执行 `pnpm publish` 发布到 npm 后才生效（本仓库已配置 `publishConfig`，但尚未发布）。

### 本地添加

1. 构建订阅后（`pnpm run build`），在 GKD 中直接添加本地文件 `dist/gkd.json5`。
2. 在 GKD「订阅 → 应用规则 → 微信」下启用「西安交警-违停上报」规则组。
3. 手动打开微信小程序「西安交警」，自动化即开始执行。

> [!IMPORTANT]
> 建议**只启用本订阅相关规则**，不要无脑开启过多规则，否则可能造成规则阻塞、触发缓慢。

## 构建

```shell
pnpm install                 # 安装依赖（可用 --registry=https://registry.npmmirror.com 加速）
pnpm run check               # 类型检查 + 订阅结构校验
pnpm run build               # 生成 dist/gkd.json5 等构建产物
```

> [!TIP]
> 本仓库不设置任何自动提交。请先 `pnpm run check`、`pnpm run build`，确认无误后再**手动**提交改动。

构建后的订阅文件为 `dist/gkd.json5`，可提交到 `main` 后通过上面的「在线订阅」地址使用，或直接本地添加。

## 目录结构

```text
src/
├─ apps/com.tencent.mm.ts    # 微信（西安交警）规则，本订阅的核心
├─ subscription.ts         # 订阅元信息（id/name/version/author）
├─ globalGroups.ts         # 全局规则（本订阅未使用）
└─ categories.ts           # 规则分类（本订阅未使用）
dist/                      # 构建产物（勿手动修改）
```

## 注意事项

- 违停举报受理时间为 **7:00~22:00**；需在 **5 分钟内**完成资料提交，超时需重新进入。
- 微信小程序 webview 内容为动态渲染，匹配可能不稳定；落地建议结合 GKD「快照审查」微调选择器，必要时使用 `matchDelay`。
- 本订阅仅供个人学习、个人使用。

## 开发 / 反馈

规则开发可参考 [GKD 订阅规则](https://gkd.li/guide/subscription) 与 [高级选择器](https://gkd.li/guide/selector) 文档。如需调整规则，编辑 `src/apps/com.tencent.mm.ts` 后运行 `pnpm run check` 与 `pnpm run build`。
