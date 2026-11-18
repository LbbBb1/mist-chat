# 移动端构建说明

本工程在官方 `deepseek-ai/chat-demo`（MIT）基础上改造，同时产出 **Android APK**、**iOS 工程** 与 **可安装 PWA**。

## 一、目录约定

| 路径 | 内容 |
|---|---|
| `src/` | 纯前端源码（Android / iOS / PWA 共用同一份） |
| `public/` | PWA 清单、图标；构建时复制到 `dist/` 根 |
| `dist/` | 构建产物（`pnpm build` 生成） |
| `android/` | Capacitor Android 工程（可出 APK / AAB） |
| `ios/` | Capacitor iOS 工程（需 macOS + Xcode 编译） |
| `.github/workflows/android-release.yml` | 打 tag 自动出签名 APK |

## 二、Android

### 本机构建

前置：JDK 17、Android SDK（`platforms;android-35`、`build-tools;34.0.0`、`platform-tools`）。

```bash
pnpm install
pnpm build
npx cap sync android

cd android
./gradlew assembleRelease \
  -PdeepchatVersionCode=4 \
  -PdeepchatVersionName=1.0.3
```

产物：`android/app/build/outputs/apk/release/app-release.apk`

### 签名

`android/app/build.gradle` 的 release 签名读取环境变量，缺省回落到 `~/.android/debug.keystore`：

| 变量 | 说明 |
|---|---|
| `DEEPCHAT_KEYSTORE_FILE` | keystore 绝对路径 |
| `DEEPCHAT_KEYSTORE_PASS` | keystore 密码 |
| `DEEPCHAT_KEY_ALIAS` | 密钥别名 |
| `DEEPCHAT_KEY_PASS` | 密钥密码 |

自己生成一份（**不要提交到仓库**）：

```bash
keytool -genkeypair -v \
  -keystore release.keystore -alias youralias \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass YOUR_PASS -keypass YOUR_PASS \
  -dname "CN=YourName, OU=Mobile, O=YourOrg, L=City, ST=Province, C=CN"
```

> 用 `debug.keystore` 签出来的包，任何人都能用同一把公开调试密钥伪造同签名的"升级包"。对外分发前务必换成自己的 release keystore，并妥善保管——**丢了就无法覆盖升级**。

### CI 构建

`.github/workflows/android-release.yml` 已就绪：

1. 在仓库 `Settings → Secrets and variables → Actions` 配置：
   - `SIGNING_KEYSTORE_BASE64`（keystore 的 base64）
   - `SIGNING_KEYSTORE_PASS` / `SIGNING_KEY_ALIAS` / `SIGNING_KEY_PASS`（可选）
2. 推 tag 触发：

```bash
git tag v1.0.3
git push origin v1.0.3
```

生成 keystore 的 base64：

```bash
base64 -w0 release.keystore    # macOS
# Windows PowerShell:
[Convert]::ToBase64String([IO.File]::ReadAllBytes("release.keystore"))
```

## 三、iOS

Windows 无法编译 iOS：`xcodebuild`、CocoaPods 只在 macOS 上可用。工程本身已生成并配置好，拿到 Mac 上直接开：

```bash
pnpm install
pnpm build
npx cap sync ios
npx cap open ios        # 打开 Xcode
```

在 Xcode 中：

1. 选中 `App` target → `Signing & Capabilities`
2. 填 Team、改 Bundle Identifier（默认 `com.deepchat.app`）
3. 选择真机或 `Any iOS Device` → `Product → Archive` → 分发

已在 `Info.plist` 预置：

- 相机、麦克风、相册权限文案（语音输入 / 视觉识图 / 图片附件）
- `NSAllowsLocalNetworking`（允许连接本机或局域网模型服务）
- `ITSAppUsesNonExemptEncryption = false`
- 图标与启动图（`AppIcon.appiconset` 为 1024×1024 无 alpha）

最低系统版本：iOS 14（Capacitor 6 默认）。

## 四、PWA（无需上架，iPhone 可直接装）

```bash
pnpm build
# dist/ 即完整站点，部署到任意静态托管
npx serve dist      # 或 node server.mjs
```

iOS Safari：打开站点 → 分享 → **添加到主屏幕**。会以独立窗口全屏运行，无地址栏。

已支持：

- `manifest.webmanifest`（standalone 显示模式、192/512/maskable 图标）
- `apple-touch-icon`（不透明，系统自动圆角）
- `viewport-fit=cover` + `env(safe-area-inset-*)`（刘海与底部横条不遮挡）
- 深浅色 `theme-color`

> PWA 的存储与 App 分开：浏览器里和装到主屏的是两套 IndexedDB。迁移数据请用「设置 → 数据管理 → 导出/导入历史」。

## 五、版本号

- 前端：`package.json` 的 `version`，构建时注入 `<meta name="application-version">`
- Android：`-PdeepchatVersionCode` / `-PdeepchatVersionName`，缺省读 `android/app/build.gradle`
- iOS：Xcode 里的 `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION`

## 六、常见问题

**Gradle 报 `Your project path contains non-ASCII characters`**

Windows 下 AGP 默认拒绝非 ASCII 路径。工程已在 `android/gradle.properties` 加 `android.overridePathCheck=true`；若仍有问题，把工程复制到纯英文路径再构建。

**Gradle 下载卡住**

`android/gradle/wrapper/gradle-wrapper.properties` 的 `distributionUrl` 可换国内镜像，例如
`https://mirrors.cloud.tencent.com/gradle/gradle-8.2.1-all.zip`。

**`cap sync` 后界面没更新**

`cap sync` 只复制 `dist/`，改完源码要先 `pnpm build`。
