# DeepChat · 社区改造版

> **本仓库 fork 自 [YanJiuWeiYuanHui/DeepChat](https://github.com/YanJiuWeiYuanHui/DeepChat)，**
> **而上游又是 [deepseek-ai/chat-demo](https://github.com/deepseek-ai/chat-demo)（DeepSeek 官方开源前端，MIT）的派生。**
> 原始版权与许可保持不变，见 [LICENSE](LICENSE)。

一个纯前端的 AI 对话客户端：自带 API Key、无后端、对话与密钥只存本机。
支持 Android / iOS / PWA 三端，内置 DeepSeek 历史对话导入导出。

## 在线使用（PWA）

不需要安装，浏览器打开即可，iOS 可「添加到主屏幕」当 App 用：

| 地址 | 说明 |
|---|---|
| **https://deepchat-app.pages.dev/** | Cloudflare Pages（推荐，国内实测 ~600 ms） |
| https://lbbbb1.github.io/DeepChat/ | GitHub Pages（备用，~1 s） |

三者数据互通方式：各自独立存储，换地址后需重新填 API Key 并导入历史。

## 与上游的差异

在 `YanJiuWeiYuanHui/DeepChat` v1.0.2 基础上做了以下改动：

### 历史导入

- **导入进度条**：按归档已读取的压缩字节计算百分比，界面实时显示（原版只有「已解析 N 个」）
- **ZIP 解析性能**：中央目录从「逐条目 slice 读」（700 条目约 2100 次异步 I/O）改为一次性读入；条目头也从 2–3 次读取合并为 1 次
- **链接导入**：支持粘贴 URL 直接下载并导入，另有「用浏览器下载」按钮供大文件或需要登录态的链接使用
- **大文件支持**：原生读取改用 `convertFileSrc` 流式加载，实测 1 GB 归档（1000 会话 / 1000 张图）下载 45s + 导入 27s

### 对话列表

- **分页渲染**：默认只渲染最近 30 条消息，顶部「展开更早的 N 条」，避免长会话把渲染进程压垮；展开时保持滚动位置

### 移动端适配

- **PWA 支持**：manifest、192/512/maskable 图标、apple-touch-icon、standalone 显示模式
- **安全区适配**：顶栏与侧栏抽屉补 `env(safe-area-inset-*)`，刘海与底部横条不遮挡
- **设置面板窄屏修复**：去掉内容区负边距，补 `min-width: 0`，390px 下不再横向溢出

### 其他

- **API Key 一键获取**：输入框下方直达 DeepSeek 开放平台
- **默认提示词中性化**：不再让模型自称官方身份
- **iOS 工程补全**：图标（无 alpha）、权限文案、ATS 本地网络、版本对齐
- **签名**：构建走独立 release keystore，不再回落 debug keystore

## 构建

```bash
pnpm install
pnpm build

# Android
npx cap sync android
cd android && ./gradlew assembleRelease

# iOS（需 macOS + Xcode）
npx cap sync ios
npx cap open ios
```

详细说明见 [docs/MOBILE-BUILD.md](docs/MOBILE-BUILD.md)，改动评审见 [docs/REVIEW.md](docs/REVIEW.md)。

## 许可与声明

- 代码继承上游 MIT 许可。
- 本项目是第三方客户端，**与 DeepSeek 官方无关**，不使用其商标与图标。
- 应用不提供模型服务：API Key、调用费用与合规责任均由使用者自行承担。
- 生成内容由 AI 产生，仅供参考。
