# 西安交警-违停上报助手（GKD 订阅）

> 打开微信小程序「西安交警」后，自动完成「交通违法随手拍 → 违停行为上报」的点击类操作；文本输入与号牌由你确认后手动填写，避免误报。

[![Platform](https://img.shields.io/badge/Platform-Android-3DDC84)](https://gkd.li/)
[![GKD](https://img.shields.io/badge/GKD-%E2%89%A5%20v1.12.0-1976D2)](https://gkd.li/guide/subscription)

面向中文用户、基于 [GKD 订阅规则](https://gkd.li/guide/subscription) 的个人订阅。

## ✨ 项目亮点

- **自动化重复点击**：从首页到「违停行为」表单的稳定点击路径全自动完成。
- **保留人工核对**：问题描述、详细地址、定位关键词、号牌类型、车牌号牌、最终提交均由你手动确认，防止误报。
- **拍照辅助**：自动点击相机预览「完成」，并自动拉起第 2/3 张照片；第 1 张由你手动取景拍摄。
- **零额外依赖**：纯 GKD 订阅即可使用，无需脚本、OCR 接口或其它运行环境。

## 📦 安装 / 订阅

### 在线订阅

复制以下任一链接到 GKD 即可在线订阅（每个代码块右上角可一键复制）：

**GitHub 源**

```txt
https://raw.githubusercontent.com/PingWangWang/Charge100YPerSession/main/dist/gkd.json5
```

**jsDelivr 加速（大陆推荐）**

```txt
https://fastly.jsdelivr.net/gh/PingWangWang/Charge100YPerSession@main/dist/gkd.json5
```

**npmmirror 源（需先发布到 npm）**

```txt
https://registry.npmmirror.com/xi-an-traffic-violation-subscription/latest/files/dist/gkd.json5
```

> [!IMPORTANT]
> - GitHub / jsDelivr 源需在把最新 `dist/gkd.json5` **提交并推送到 `main`** 后才可访问；npmmirror 源需先执行 `pnpm publish` 发布到 npm（本仓库已配置 `publishConfig`，尚未发布）。
> - **jsDelivr 为 CDN**，提交后可能有数分钟缓存滞后；若 GKD 刷新显示无更新，可稍后重试或改用 GitHub 源。

### 本地添加

1. `pnpm run build` 后在 GKD 中直接添加本地文件 `dist/gkd.json5`。
2. 在 GKD「订阅 → 应用规则 → 微信」下启用「西安交警-违停上报」规则组。

## 🚀 快速开始

1. 确保 GKD ≥ v1.12.0，并授予无障碍权限。
2. 添加订阅（在线链接或本地文件）。
3. 启用微信（`com.tencent.mm`）规则组。
4. 手动打开微信小程序「西安交警」，自动化即开始执行。

## 🧭 使用流程

**自动完成（点击类）**：

1. 首页 → 点击「随手拍」
2. 随手拍页 → 点击「交通违法行为」的「立即上报」
3. 用户须知 → 勾选「我已阅读并同意」→ 点击「开始上报」
4. 违法类型 → 选择「违停行为」
5. 填写信息 → 关闭「注意事项」弹窗（确认）
6. 上报位置 → 点击「重新选择」→ 点击定位搜索结果第一条 → 点击「完成」
7. 拍照辅助 → 第 1 张手动拍摄；第 2/3 张自动点击「上传照片」，每张后自动点击相机预览「完成」

**手动完成（输入/核对）**：

- 问题描述（如「路边违停」）
- 详细地址（如「灞桥区元熙樾府小区（绕城高速联络线）」）
- 定位搜索关键词（如「元熙樾府」）
- 号牌类型（蓝=小型汽车 / 绿=新能源汽车）与车牌号牌
- 点击「提交」

## 📁 项目结构

```text
src/
├─ apps/com.tencent.mm.ts    # 微信（西安交警）规则，本订阅核心
├─ subscription.ts           # 订阅元信息（id/name/version/author）
├─ globalGroups.ts           # 全局规则（本订阅未使用）
└─ categories.ts             # 规则分类（本订阅未使用）
scripts/
├─ check.ts                  # 订阅结构校验
└─ build.ts                  # 构建 dist
dist/                        # 构建产物（勿手动修改）
docs/design.md               # 方案设计文档
```

## ❓ 适用场景

- 经常通过「西安交警 · 交通违法随手拍」举报违停，想减少重复点击的用户。
- 举报地点相对固定（如灞桥区元熙樾府周边），详细地址、问题描述可固定填写的场景。
- 希望保留人工确认（车牌、地址、提交前核对）以避免误报，不完全交给自动化。

## 🛠️ 开发

```shell
pnpm install                 # 安装依赖（可用 --registry=https://registry.npmmirror.com 加速）
pnpm run check               # 类型检查 + 订阅结构校验
pnpm run build               # 生成 dist/gkd.json5 等构建产物
```

> [!TIP]
> 本仓库不设置自动提交；请先 `pnpm run check`、`pnpm run build` 确认无误后再手动提交。

## 🤝 贡献 / 反馈

规则开发请参考 [GKD 订阅规则](https://gkd.li/guide/subscription) 与 [高级选择器](https://gkd.li/guide/selector)。如需调整，编辑 `src/apps/com.tencent.mm.ts` 后运行 `pnpm run check`、`pnpm run build`。

## ⚠️ 注意事项

- 违停举报受理时间为 **7:00~22:00**；需在 **5 分钟内**完成资料提交，超时需重新进入。
- 需开启手机 GPS。
- 小程序 webview 为动态渲染，匹配可能不稳定；建议结合 GKD「快照审查」微调选择器，必要时使用 `matchDelay`。

## 📝 License

本项目仅供个人学习、个人使用，未指定开源许可证（待补充）。
