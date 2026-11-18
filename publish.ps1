<#
  一键发布到 GitHub。

  前置：先在网页上创建空仓库（或 fork 原仓库）：
    https://github.com/new            新建空仓库，名字填 DeepChat，不要勾选 README
    或
    https://github.com/YanJiuWeiYuanHui/DeepChat/fork   直接 fork，仓库名保持 DeepChat

  然后在本目录运行：
    powershell -ExecutionPolicy Bypass -File .\publish.ps1 -Repo DeepChat

  首次会弹出浏览器要求登录 GitHub（Git Credential Manager），登录一次之后不再需要。
#>
param(
  [string]$Owner = "LbbBb1",
  [string]$Repo  = "DeepChat",
  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"
$remote = "https://github.com/$Owner/$Repo.git"

Write-Host "远端: $remote" -ForegroundColor Cyan

# 检查仓库是否已能访问（存在性 + 权限）
$env:GIT_TERMINAL_PROMPT = "0"
$probe = git ls-remote $remote 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "无法访问 $remote" -ForegroundColor Yellow
  Write-Host "请先在 https://github.com/new 创建同名空仓库（不要初始化 README）后重试。" -ForegroundColor Yellow
  exit 1
}

# 配置 remote
$existing = git remote 2>$null
if ($existing -contains "origin") {
  git remote set-url origin $remote
} else {
  git remote add origin $remote
}

Write-Host "推送中（首次会弹出浏览器登录 GitHub）..." -ForegroundColor Cyan
git push -u origin $Branch

if ($LASTEXITCODE -eq 0) {
  Write-Host "`n推送成功：https://github.com/$Owner/$Repo" -ForegroundColor Green
  Write-Host @"

接下来手动上传安装包：
  1. 打开 https://github.com/$Owner/$Repo/releases/new
  2. Tag 填 v1.2.3，标题填 DeepChat v1.2.3
  3. 把 release\DeepChat-1.2.3-release.apk 拖进附件区
  4. 正文可从 release\README.md 复制
"@ -ForegroundColor Cyan
} else {
  Write-Host "推送失败，检查网络或凭据后重试。" -ForegroundColor Red
  exit 1
}
