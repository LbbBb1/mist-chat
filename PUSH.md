# 发布到 GitHub

本目录已经是完整的 git 仓库（`main` 分支，1 个提交，282 个文件），只差建立远端并推送。

> 说明：我这台机器上没有可用的 GitHub 凭证（凭据管理器里的条目已过期，`gh` CLI 未安装），
> 所以只能把仓库准备到「一条命令即可推送」的状态。

---

## 方式 A：网页 fork 原仓库（推荐，能显示「forked from」）

这样 GitHub 会在仓库标题下方标注 **forked from YanJiuWeiYuanHui/DeepChat**，正是你要的归属说明。

1. 打开 https://github.com/YanJiuWeiYuanHui/DeepChat
2. 右上角点 **Fork** → 创建 `LbbBb1/DeepChat`
3. 回到本目录，运行：

```powershell
git remote add origin https://github.com/LbbBb1/DeepChat.git
git fetch origin
git reset --soft origin/main      # 把上游历史接到当前 HEAD 下面
git commit -m "feat: mobile import progress, link import, paged rendering"
git push -u origin main
```

> `git reset --soft origin/main` 的作用：保留工作区内容不动，把当前分支的基点移到上游最新提交上，
> 这样一次提交就叠在原作者历史之上，fork 关系完整。

---

## 方式 B：新建空仓库

不 fork，直接建自己的仓库，README 里已经写明 fork 来源（GitHub 不会显示 fork 标记）。

1. 打开 https://github.com/new ，仓库名填 `DeepChat`，**不要**勾选 README / .gitignore / license
2. 运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\publish.ps1
```

首次运行会弹出浏览器要求登录 GitHub（Git Credential Manager），登录一次后不再需要。

---

## 方式 C：纯手动

```powershell
git remote add origin https://github.com/LbbBb1/DeepChat.git
git push -u origin main
```

---

## 上传安装包

APK 不适合放进仓库（5.4 MB 二进制，每次改动都会膨胀历史），走 Releases：

1. 打开 `https://github.com/<你的账号>/DeepChat/releases/new`
2. Tag 填 `v1.2.3`，标题填 `DeepChat v1.2.3`
3. 把 `DeepChat-1.2.3-release.apk` 拖进附件区
4. 正文可直接从 `release/README.md` 复制

---

## 仓库里有什么

```
.github/          打 tag 自动构建签名 APK 的 workflow
android/          Capacitor Android 工程
ios/              Capacitor iOS 工程
public/           PWA 清单与图标
src/              前端源码
docs/             构建说明与代码评审
scripts/          构建与图标生成脚本
publish.ps1       推送到 GitHub 的辅助脚本
```

构建产物（`dist/`、`android/app/build/`、`ios/App/App/public/`）已在 `.gitignore` 中排除，clone 后执行 `pnpm build && npx cap sync` 即可重新生成。

---

## 许可证与归属

- 代码继承上游 MIT 许可，`LICENSE` 原样保留
- README 开头已注明：本仓库 fork 自 `YanJiuWeiYuanHui/DeepChat`，其上游为 `deepseek-ai/chat-demo`
- 提交信息里同样写明了 fork 关系
