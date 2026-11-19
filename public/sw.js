/*
 * DeepChat Service Worker
 *
 * 目标：PWA 第二次打开秒开、断网也能进界面。
 * 策略：
 *   - 导航请求（HTML）：network-first，失败回落到缓存 / index.html
 *   - 同源静态资源（JS/CSS/图片/字体）：cache-first，命中即返回
 *   - 跨域请求（api.deepseek.com 等）：完全不拦截
 */

const CACHE = 'deepchat-shell-v1'
const SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
  'apple-touch-icon.png',
  'favicon-32.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // 单个资源 404 不应该让整个安装失败
      .then((cache) => Promise.allSettled(SHELL.map((path) => cache.add(path))))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') {
    return
  }
  const url = new URL(request.url)
  // 只处理自己站点的资源；API 请求原样放行
  if (url.origin !== self.location.origin) {
    return
  }
  if (url.pathname.endsWith('/sw.js')) {
    return
  }

  const isNavigation =
    request.mode === 'navigate' ||
    url.pathname.endsWith('/') ||
    url.pathname.endsWith('.html')

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {})
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          if (cached) {
            return cached
          }
          const shell = await caches.match('index.html')
          return shell || Response.error()
        })
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached
      }
      return fetch(request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {})
        }
        return response
      })
    })
  )
})
