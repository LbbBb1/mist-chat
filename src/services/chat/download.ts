import { Capacitor } from '@capacitor/core'
import { Directory, Filesystem } from '@capacitor/filesystem'

/** 链接导入：把远端 ZIP 下载成可直接交给导入流程的 File。 */

export type DownloadProgress = {
  received: number
  /** 服务端未给 content-length 时为 0 */
  total: number
}

/** 从响应头里取文件名，取不到时给一个占位名。 */
const fileNameFrom = (disposition: string | null): string => {
  if (!disposition) {
    return 'archive.zip'
  }
  // filename*=UTF-8''xxx 优先，其次 filename="xxx"
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(disposition)
  if (encoded) {
    try {
      return decodeURIComponent(encoded[1].trim())
    } catch {
      // 解码失败就继续尝试普通 filename
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(disposition)
  return plain ? plain[1].trim() : 'archive.zip'
}

/** 只接受 http(s) 链接，避免 file:// 之类的本地路径被当成远端地址。 */
export const isDownloadableUrl = (value: string): boolean => /^https?:\/\/\S+$/i.test(value.trim())

/** 原生平台单次读入内存的上限；超过就别走链接导入，改用文件选择器。 */
const NATIVE_INLINE_LIMIT = 80 * 1024 * 1024

const base64ToBytes = (data: string): Uint8Array => {
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * 原生平台走 Filesystem.downloadFile：由原生网络栈直接落盘，
 * 既绕开 WebView 的 CORS 与混合内容限制，也能拿到下载进度。
 * 读完就删缓存文件，不把 ZIP 留在设备上。
 */
const downloadNative = async (
  url: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<File> => {
  const path = `mist-import-${Date.now()}.zip`
  let lastEmit = 0
  const listener = await Filesystem.addListener('progress', (event) => {
    if (event.url && event.url !== url) {
      return
    }
    const now = performance.now()
    if (now - lastEmit < 100) {
      return
    }
    lastEmit = now
    onProgress?.({ received: event.bytes, total: event.contentLength })
  })
  try {
    await Filesystem.downloadFile({
      url,
      path,
      directory: Directory.Cache,
      progress: true,
      connectTimeout: 30_000,
      readTimeout: 300_000,
    })
    // downloadFile 返回的可能是绝对路径，但 stat/readFile 需要与 directory 组合的相对路径，
    // 所以统一用调用时传入的 path。
    const stat = await Filesystem.stat({ path, directory: Directory.Cache })
    // 优先走 Capacitor 的本地文件服务：fetch 出来是 Blob，不需要 base64，内存占用接近文件本身。
    try {
      const { uri } = await Filesystem.getUri({ path, directory: Directory.Cache })
      const local = Capacitor.convertFileSrc(uri)
      const response = await fetch(local)
      if (response.ok) {
        const blob = await response.blob()
        if (blob.size > 0) {
          onProgress?.({ received: blob.size, total: blob.size })
          return new File([blob], 'archive.zip', { type: 'application/zip' })
        }
      }
    } catch {
      // 本地文件服务不可用时回退到 base64 读取
    }
    if (stat.size > NATIVE_INLINE_LIMIT) {
      throw new Error(
        `文件 ${Math.round(stat.size / 1024 / 1024)} MB 超过链接导入上限（80 MB），请改用上传`
      )
    }
    // WebView 读不到 cache 目录，只能让原生读成 base64 再转 Blob。
    const file = await Filesystem.readFile({ path, directory: Directory.Cache })
    const bytes =
      typeof file.data === 'string'
        ? base64ToBytes(file.data)
        : new Uint8Array(await file.data.arrayBuffer())
    const blob = new Blob([bytes as BlobPart], { type: 'application/zip' })
    onProgress?.({ received: blob.size, total: blob.size })
    return new File([blob], 'archive.zip', { type: 'application/zip' })
  } finally {
    await listener.remove()
    await Filesystem.deleteFile({ path, directory: Directory.Cache }).catch(() => {})
  }
}

/** 浏览器：流式 fetch，受服务端 CORS 限制。 */
const downloadWeb = async (
  target: string,
  onProgress?: (progress: DownloadProgress) => void,
  signal?: AbortSignal
): Promise<File> => {
  const response = await fetch(target, { signal, credentials: 'omit', redirect: 'follow' })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  const total = Number(response.headers.get('content-length') ?? 0) || 0
  const name = fileNameFrom(response.headers.get('content-disposition'))
  const body = response.body
  if (!body) {
    const blob = await response.blob()
    onProgress?.({ received: blob.size, total: blob.size })
    return new File([blob], name, { type: blob.type || 'application/zip' })
  }
  const reader = body.getReader()
  const chunks: BlobPart[] = []
  let received = 0
  let lastEmit = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    chunks.push(value as BlobPart)
    received += value.length
    const now = performance.now()
    if (now - lastEmit >= 100) {
      lastEmit = now
      onProgress?.({ received, total })
    }
  }
  onProgress?.({ received, total: total || received })
  return new File(chunks, name, { type: 'application/zip' })
}

/**
 * 下载归档。原生平台由 Filesystem 直接落盘（不受 CORS 限制）；
 * 浏览器环境依赖服务端放开跨域。
 */
export const downloadArchive = async (
  url: string,
  onProgress?: (progress: DownloadProgress) => void,
  signal?: AbortSignal
): Promise<File> => {
  const target = url.trim()
  if (!isDownloadableUrl(target)) {
    throw new Error('链接格式不正确')
  }
  if (Capacitor.isNativePlatform()) {
    return downloadNative(target, onProgress)
  }
  return downloadWeb(target, onProgress, signal)
}
