# 发布状态：已完成

本仓库已推送到 GitHub。

| 项 | 地址 |
|---|---|
| 仓库 | https://github.com/LbbBb1/DeepChat |
| Release | https://github.com/LbbBb1/DeepChat/releases/tag/v1.2.3 |

GitHub 在仓库标题下方会显示 **forked from YanJiuWeiYuanHui/DeepChat**（因为是用 `gh repo fork` 创建的）。

## 提交历史

```
1730bee  feat: mobile import progress, link import, paged rendering   ← 本仓库改动
80e0722  feat: finalize v1.0.2 with search overlay, avatars, ...      ← 上游
b72032e  feat: release v1.0.2                                        ← 上游
```

我们的改动是一次提交叠在上游最新提交之上，所以 fork 关系完整、diff 清晰可读。

## 后续如何发版

装了 gh CLI（`E:\workspace\Tools\gh`，见其 README），流程：

```powershell
$env:GH_CONFIG_DIR = "E:\workspace\Tools\gh\config"
$env:HTTPS_PROXY = "http://127.0.0.1:7892"
$gh = "E:\workspace\Tools\gh\bin\gh.exe"

# 1. 提交改动
git add -A
git commit -m "feat: ..."
git push

# 2. 发版
& $gh release create v1.2.4 <apk路径> `
  --repo LbbBb1/DeepChat `
  --title "DeepChat v1.2.4" `
  --notes "更新说明"
```

## 如果原仓库有更新

```powershell
git fetch upstream        # 需要先 git remote add upstream https://github.com/YanJiuWeiYuanHui/DeepChat.git
git rebase upstream/main
git push --force-with-lease
```

## 说明

- APK 只作为 Release 附件，不进仓库（`.gitignore` 已排除 `release/`）
- 构建产物（`dist/`、`android/app/build/`、`ios/App/App/public/`）同样排除，clone 后 `pnpm build && npx cap sync` 可重新生成
