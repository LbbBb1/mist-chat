import './polyfills.js'
import { createRoot } from 'react-dom/client'
import { App } from './app/App.js'
import { setupTheme } from './app/theme.js'
import { ErrorBoundary } from './components/base/ErrorBoundary.js'
import { AboutPage } from './components/help/AboutPage.js'
import { InstallGuide } from './components/help/InstallGuide.js'
import { UserGuide } from './components/help/UserGuide.js'
import { ensureKatex } from './services/markdown/katex.js'
import './app/theme.css'
import './app/global.css'

ensureKatex()
setupTheme()

/**
 * 只在浏览器里注册 Service Worker：
 * - 原生壳（Capacitor）自带本地资源，不需要缓存层，注册反而会拖慢更新
 * - file:// 打开时也不支持
 */
const registerServiceWorker = () => {
  const isNative = (window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
  if (isNative || !('serviceWorker' in navigator) || window.location.protocol === 'file:') {
    return
  }
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // 注册失败不影响主流程
    })
  })
}

registerServiceWorker()

// ?about=1 产品说明，?help=1 安装步骤，?guide=1 使用手册，其余进入应用
const search = new URLSearchParams(window.location.search)
const page =
  search.get('about') === '1'
    ? 'about'
    : search.get('help') === '1'
      ? 'help'
      : search.get('guide') === '1'
        ? 'guide'
        : 'app'

createRoot(document.getElementById('root') as HTMLElement).render(
  <ErrorBoundary>
    {page === 'about' ? (
      <AboutPage />
    ) : page === 'help' ? (
      <InstallGuide />
    ) : page === 'guide' ? (
      <UserGuide />
    ) : (
      <App />
    )}
  </ErrorBoundary>
)
