# 代码评审与改进记录

评审对象：`YanJiuWeiYuanHui/DeepChat`（官方 `deepseek-ai/chat-demo` 的 fork），聚焦「只做网页端复刻 + 自带 Key」这条路线。
评审基线：`main` @ 2026-11-17（v1.0.2）。

---

## 一、本次已修复

### 1. 长对话把渲染进程压垮（Issue #2 的根因之一）

**问题**：`MessageList` 直接 `messages.map(...)` 全量渲染。导入上千个历史会话后，任何一个长对话都会把全部消息（含 Markdown、KaTeX、Mermaid、代码高亮）一次性挂到 DOM 上；再叠加深度思考的长回答，WebView 渲染进程直接 `STATUS_ACCESS_VIOLATION`。

**改动**：`src/components/messages/MessageList.tsx`

- 默认只渲染最近 **30 条**，顶部出现「展开更早的 N 条消息」；
- 展开时记录 `scrollHeight` 差值，在 `useLayoutEffect` 里补回 `scrollTop`，视口不跳；
- 搜索命中位于未渲染区间时，自动展开到覆盖目标再定位；
- 切换会话重置为 30 条。

**收益**：DOM 节点数与历史长度解耦，导入规模从「几百条就卡」变成「只和当前屏有关」。

### 2. PWA 安装能力缺失

**问题**：`index.html` 只有 `theme-color`，没有 manifest、没有 apple 图标，iOS「添加到主屏幕」后仍是带地址栏的网页。

**改动**

- 新增 `public/manifest.webmanifest`：`standalone`、192/512/maskable 图标、主题色、快捷方式；
- 新增 `public/` 下 6 张图标（从 `assets/icon.png` 生成，maskable 单独留安全边距）；
- `src/index.html` 补 `viewport-fit=cover`、`interactive-widget=resizes-content`、双 `theme-color`、`apple-mobile-web-app-*`；
- `rspack.config.ts` 的 `CopyRspackPlugin` 输出 `public/`；
- `server.mjs` 补 `.webmanifest` 的 MIME（原先是 `application/octet-stream`）。

### 3. 刘海屏 / 底部横条遮挡

**问题**：`MobileHeader` 与移动端侧栏抽屉没有安全区适配，iPhone 上标题被灵动岛压住、抽屉顶部内容被裁。

**改动**：`MobileHeader.module.css` 的高度与 `padding-top` 加 `env(safe-area-inset-top)`；`Sider.module.css` 的 `.mobile` 补上下安全区。

### 4. 默认人格自称官方

**问题**：`DEFAULT_SYSTEM_PROMPT` 是「该助手为DeepSeek，由深度求索公司创造。」作为第三方客户端，这等于让模型冒充官方身份。

**改动**：`src/services/settings.ts` 改为中性的「你是一个乐于助人的 AI 助手……」；语音通话提示词同步去掉品牌自称。用户仍可在设置里自行填写。

### 5. iOS 平台完全缺失

**改动**：`@capacitor/ios` + `ios/` 工程，并预置：

- `Info.plist`：相机、麦克风、相册读写权限文案，`NSAllowsLocalNetworking`（连本地模型），`ITSAppUsesNonExemptEncryption=false`；
- `AppIcon.appiconset`：1024×1024 **无 alpha**（iOS 硬要求）；
- 启动图替换为白底居中图标；
- 版本号与 Android 对齐（1.0.3 / 4）。

### 6. 签名从 debug 换成 release

**问题**：仓库构建默认回落到 `~/.android/debug.keystore`，`androiddebugkey`/`android` 是公开的——任何人都能伪造同证书的「升级包」，配合应用内自更新（`REQUEST_INSTALL_PACKAGES`）风险放大。

**改动**：本次构建使用独立 release keystore（`CN=DeepChat`，RSA 2048，10 年），签名验证 v1+v2 均通过。仓库代码未改动签名逻辑，仍支持 `DEEPCHAT_KEYSTORE_*` 环境变量。

---

## 二、仍值得做（按性价比排序）

### P0 · 安全

| 问题 | 说明 | 建议 |
|---|---|---|
| **API Key 明文存 localStorage** | `settings.ts` 把主 Key 和 5 个子渠道 Key 都写进 `localStorage`，WebView 明文落盘；root 设备或备份可直接读出 | **按产品决定保留**：BYOK 模式下 Key 属于用户自己，明文存储换来「卸载即清空、无需系统密钥库、换机靠导出」的简单模型。若日后要改，接 `@capacitor/preferences` + iOS Keychain / Android Keystore 即可 |
| **自更新通道** | `updater.ts` 从 GitHub Releases 下载 APK 直接拉起安装 | 校验 APK 签名证书指纹与内置常量一致后再安装；或直接移除自更新，改由用户手动覆盖 |
| **`apiOrigin` 任意可填** | 用户填了恶意地址，Key 会被发过去 | 设置页明确提示「不要填写来源不明的地址」；可选做域名白名单 |

### P1 · 稳定性与性能

| 问题 | 说明 | 建议 |
|---|---|---|
| **大归档导入无进度百分比** | 实测一份真实导出（248 MB / 717 会话 / 6530 消息 / 239 个附件）在 MuMu 上导入耗时约 **6 分钟**，期间只显示「正在导入历史对话（已解析 N 个）」，且必须保持前台、不能锁屏 | ✅ **已修复**：ZIP 读取按压缩字节上报进度，界面显示百分比 + 进度条；同时把中央目录解析从「逐条目 slice 读」（700 条目 ≈ 2100 次异步 I/O）改为一次性读入，条目头也从 2–3 次读取合并为 1 次。39 MB / 100 会话的归档从「十几秒无反馈」降到 **约 20 秒且有连续进度** |
| **无虚拟列表** | 分页后单页仍有 30 条，极端长回答（数万字 + 表格 + Mermaid）仍可能卡 | 接 `@tanstack/react-virtual` 做窗口化；或对单条超长消息做折叠/分段渲染 |
| **Markdown 全量重解析** | 流式时每条增量都可能触发整段重排 | 已有 `useThrottleMarkdownRender`，可再按段落做增量解析（只重算末尾块） |
| **搜索是全文线性扫描** | 上千会话靠 `JSON.stringify` 匹配 | 建倒排索引（IndexedDB 存 token → messageId），或至少只索引 `title + 最近 N 条` |
| **无自动备份** | 只有手动导出 ZIP；Android 卸载即清空（除非走 `allowBackup`） | 定时导出到 `Documents/` 或系统分享目录；iOS 走 iCloud Drive |
| **导入是整体替换** | 官方行为：导入会清空现有全部会话 | 加「合并导入」选项：按 `sessionId + updatedAt` 去重后追加 |

### P2 · 工程质量

| 问题 | 说明 | 建议 |
|---|---|---|
| **零测试** | 全仓库没有一行业务测试 | 至少给 `history/importArchive`、`branches`、`store` 的纯函数加单测（vitest，与 rspack 无冲突） |
| **`store.ts` 2145 行** | 状态、流式、附件、生图全在一个文件 | 按领域拆 `sessionStore` / `streamStore` / `attachmentStore` |
| **i18n 分散** | `store.ts` 里有硬编码中文提示 | 统一走 `translate()` |
| **错误只进 console** | `reportStorageError` 只 `console.error` | 加可导出的诊断日志（脱敏），用户反馈问题时能直接发 |
| **无无障碍检查** | 部分图标按钮缺 `aria-label` | 跑一遍 axe，补齐 |

### P3 · 体验

- 会话列表无分组折叠，上千条时滚动很长（可加按月份折叠）
- 消息无「复制为 Markdown / 导出整段对话」
- 生图结果没有「保存到相册」的原生入口
- 输入框无 `@` 引用历史消息
- 不支持自定义快捷指令/预设提示词
- **设置面板在 390px 窄屏下右侧仍有轻微裁切**：部分行（API 片段导入、协议下拉）内容宽度大于视口。已加 `min-width: 0` 与 `overflow-x: hidden` 防止横向滚动，但根本修法是把这些行的固定宽度改为 `flex: 1 1 auto; min-width: 0`，逐个排查 `width: 159px` / `min-width: 128px` 这类硬编码。

---

## 三、判断

这次改造把「能装到手机上正常用」补齐了（PWA/iOS/安全区/签名/分页），但**它仍然是一个以浏览器存储为中心的 WebApp**：Key、会话、附件全在本地明文存储，没有任何系统级保护。作为自用或小范围分发够用；要当成正经产品，**P0 里的 Key 存储和自更新校验是必须先解决的**。

## 四、真实规模实测记录

2026-11-18，用一份真实导出的归档在 MuMu（Android 12 / x86_64 / 900×1600）上跑完整导入：

| 指标 | 数值 |
|---|---|
| 归档大小 | 248 MB（未压缩 274 MB） |
| 会话数 | 717 |
| 消息总数 | 6,530（单会话最大 314 条） |
| 附件 | 239 个（非图片） |
| 格式 | `export_format_version: 3`，含 `user.json` |
| 导入耗时 | 约 6 分钟（解析 717 个用 4 分钟，写入与提交约 2 分钟） |
| 结果 | 提示「已导入 717 个对话」，列表按今天/昨天/7 天内/30 天内分组正常，打开会话渲染正常，无崩溃、无 OOM |

**关键结论**：此前社区反馈的「导入约 1130 个会话后渲染进程崩溃」（Issue #2）在本轮未复现——会话列表与单会话渲染都稳定。但导入耗时与无进度反馈是新暴露的体验短板，已记入 P1。
