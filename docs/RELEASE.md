# 发布说明

## 交付矩阵

| 平台 | 交付物 | 说明 |
|---|---|---|
| Android | `Mist-1.2.9-release.apk` | 5.31 MB，versionCode 16，Android 7.0+（minSdk 22 / targetSdk 35） |
| iPhone / iPad | https://mist-chat.pages.dev/ | PWA，Safari 打开 → 添加到主屏幕 |
| 电脑 | 同一个地址 | 浏览器直接打开 |
| iOS 原生 | `DeepChat-v1.2.3-unsigned.ipa` | 未签名，需 Sideloadly 自签，仅供有 Mac/iPhone 时使用 |

在线入口：

| 用途 | 完整地址 |
|---|---|
| 应用本体 | https://mist-chat.pages.dev/ |
| 产品说明 | https://mist-chat.pages.dev/?about=1 |
| 安装指引 | https://mist-chat.pages.dev/?help=1 |
| 使用手册 | https://mist-chat.pages.dev/?guide=1 |
| 备用站 | https://lbbbb1.github.io/mist-chat/ |
| 仓库 | https://github.com/LbbBb1/mist-chat |

## 签名

Android 用独立 release keystore（不是 debug 签名），所以后续版本可以覆盖升级。

```
密钥库    release.keystore（不入库，.gitignore 已排除）
别名      deepchat
有效期    10000 天
```

环境变量：

```powershell
$env:MIST_KEYSTORE_FILE="/path/to/release.keystore"
$env:MIST_KEYSTORE_PASS="..."
$env:MIST_KEY_ALIAS="deepchat"
$env:MIST_KEY_PASS="..."
```

## 构建

```bash
pnpm install
pnpm build

# Android
npx cap sync android
cd android && ./gradlew assembleRelease -PmistVersionCode=17 -PmistVersionName=1.3.0

# iOS（需 macOS）
npx cap sync ios && npx cap open ios
```

产物落在 `android/app/build/outputs/apk/release/app-release.apk`。

> ⚠️ 版本参数名是 `mistVersionCode` / `mistVersionName`。历史上曾因参数名不匹配（那时叫 `deepchatVersionName`）导致多个包版本号恒为 1.0.2，改名前务必核对 `android/app/build.gradle` 里的 `hasProperty` 判断。

## 版本历史

| 版本 | 主要变化 |
|---|---|
| v1.2.9 | 清理原生层残留的 DeepChat 标识（桥名、端点、下载目录） |
| v1.2.8 | 修复 gradle 版本参数失效，versionCode 从 3 修正为 15 |
| v1.2.7 | 去掉启动自动检查更新，只保留手动按钮 |
| v1.2.6 | 修复帮助页无法滚动，加 GitHub 链接 |
| v1.2.5 | 新图标（雾蓝底 + 三道雾线） |
| v1.2.4 | 品牌改为雾语 / Mist，包名 `app.mist.chat` |
| v1.2.3 及以前 | DeepChat 时期，包名 `com.deepchat.app` |

> 从 1.2.3 升级需先卸载（包名变更）。1.2.4 ~ 1.2.7 的内部 versionCode 都是 3，升到 1.2.8+ 建议卸载重装。

## 上机检查

见 [TEST-CHECKLIST.md](TEST-CHECKLIST.md)。

## 截图

全部在 `docs/screenshots/`：

| 文件 | 内容 |
|---|---|
| `screenshot-android-home.png` | 主界面 |
| `screenshot-android-home-icon.png` | 桌面图标（新品牌） |
| `screenshot-android-settings.png` | 设置页 |
| `screenshot-android-apikey-help.png` | API Key 一键获取入口 |
| `screenshot-android-import-ok.png` / `-done.png` | 历史导入 |
| `screenshot-android-progress-20.png` / `-70.png` | 导入进度条 |
| `screenshot-android-link-import.png` / `-imported.png` | 链接导入 |
| `screenshot-android-1gb-import.png` | 1 GB 归档导入完成 |
| `screenshot-android-long-chat-paged.png` / `-expanded.png` | 长会话分页 |
| `screenshot-android-sider.png` | 侧栏 |
| `screenshot-help-page.png` / `-bottom.png` | 安装指引页 |
| `screenshot-about-page.png` / `-bottom.png` | 产品说明页 |
| `screenshot-update-manual.png` | 手动检查更新 |
| `screenshot-ios-webkit-iphone13.png` / `-SE.png` | iOS 尺寸（Playwright WebKit） |
| `pwa-qrcode.png` / `pwa-qrcode-cloudflare.png` | 站点二维码 |
