import { useSettings } from '../../services/settings.js'
import styles from './InstallGuide.module.css'

const CONTENT = {
  'zh-CN': {
    title: '把雾语装到手机',
    lead: '不用去应用商店，也不用等审核。三十秒装好，桌面多一个图标。',
    ios: {
      title: 'iPhone / iPad',
      note: '必须用 Safari 打开，微信内置浏览器没有「添加到主屏幕」。',
      steps: [
        '用 Safari 打开这个页面',
        '点屏幕底部中间的「分享」按钮（方框带向上箭头）',
        '在弹出的菜单里往下滑，找到「添加到主屏幕」',
        '右上角点「添加」，回到桌面就能看到图标了',
      ],
      tip: '如果微信里点开的，先点右上角「···」→「在浏览器打开」。',
    },
    android: {
      title: 'Android',
      note: '用 Chrome 或系统浏览器打开。',
      steps: [
        '用 Chrome 打开这个页面',
        '点右上角「⋮」菜单，选「安装应用」或「添加到主屏幕」',
      ],
      tip: '也可以直接装我发给你的 APK 文件，功能完全一样。',
    },
    faq: {
      title: '常见问题',
      items: [
        {
          q: '为什么应用商店搜不到？',
          a: '这是个人维护的独立版本，没有上架商店。装到桌面后和正常 App 一样用，独立图标、全屏显示。',
        },
        {
          q: '需要付费吗？',
          a: '软件本身免费。AI 能力需要用你自己的 API Key，费用由 DeepSeek 官方按用量收取，不经过我。',
        },
        {
          q: '聊天记录存在哪？',
          a: '只存在你手机本地，不上传任何服务器。换手机或清缓存前记得用「导出历史对话」备份。',
        },
        {
          q: 'API Key 怎么拿？',
          a: '在应用内「设置 → 模型与接口」里，点「前往官方获取」注册后创建，把它粘回来即可。',
        },
        {
          q: '以后更新怎么办？',
          a: '联网打开一次就会自动更新，不用重新安装。',
        },
      ],
    },
    back: '进入应用',
  },
  'en-US': {
    title: 'Install Mist on your phone',
    lead: 'No app store, no review queue. Thirty seconds and you get a home screen icon.',
    ios: {
      title: 'iPhone / iPad',
      note: 'Use Safari — in-app browsers do not expose "Add to Home Screen".',
      steps: [
        'Open this page in Safari',
        'Tap the Share button at the bottom (square with an arrow)',
        'Scroll down and choose "Add to Home Screen"',
        'Tap "Add" — the icon appears on your home screen',
      ],
      tip: 'Opened inside WeChat? Tap "···" → "Open in browser" first.',
    },
    android: {
      title: 'Android',
      note: 'Use Chrome or your system browser.',
      steps: [
        'Open this page in Chrome',
        'Tap the "⋮" menu and choose "Install app" or "Add to Home screen"',
      ],
      tip: 'You can also just install the APK I sent you — same app.',
    },
    faq: {
      title: 'Questions',
      items: [
        {
          q: 'Why is it not on the app stores?',
          a: 'This is an independently maintained build. Once installed it behaves like any app: own icon, full screen, no address bar.',
        },
        {
          q: 'Does it cost anything?',
          a: 'The app is free. AI usage is billed by DeepSeek directly against your own API key — nothing goes through me.',
        },
        {
          q: 'Where is my data?',
          a: 'Everything stays on your device. Nothing is uploaded. Export your history before switching phones or clearing storage.',
        },
        {
          q: 'How do I get an API key?',
          a: 'In the app: Settings → Model & API → "Get one from the official site". Create a key there and paste it back.',
        },
        {
          q: 'How do updates work?',
          a: 'Just open the app while online — it refreshes itself.',
        },
      ],
    },
    back: 'Open the app',
  },
} as const

/** 独立的安装指引页：?help=1 时渲染，用于发给客户当说明书。 */
export const InstallGuide = () => {
  const locale = useSettings((state) => state.locale)
  const text = CONTENT[locale === 'en-US' ? 'en-US' : 'zh-CN']

  const openApp = () => {
    window.location.href = window.location.pathname
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{text.title}</h1>
        <p className={styles.lead}>{text.lead}</p>
      </header>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>{text.ios.title}</h2>
        <p className={styles.note}>{text.ios.note}</p>
        <ol className={styles.steps}>
          {text.ios.steps.map((step, index) => (
            <li key={step} className={styles.step}>
              <span className={styles.stepIndex}>{index + 1}</span>
              <span className={styles.stepText}>{step}</span>
            </li>
          ))}
        </ol>
        <p className={styles.tip}>{text.ios.tip}</p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>{text.android.title}</h2>
        <p className={styles.note}>{text.android.note}</p>
        <ol className={styles.steps}>
          {text.android.steps.map((step, index) => (
            <li key={step} className={styles.step}>
              <span className={styles.stepIndex}>{index + 1}</span>
              <span className={styles.stepText}>{step}</span>
            </li>
          ))}
        </ol>
        <p className={styles.tip}>{text.android.tip}</p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>{text.faq.title}</h2>
        <dl className={styles.faq}>
          {text.faq.items.map((item) => (
            <div key={item.q} className={styles.faqItem}>
              <dt className={styles.faqQ}>{item.q}</dt>
              <dd className={styles.faqA}>{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <button type="button" className={styles.back} onClick={openApp}>
        {text.back}
      </button>
    </div>
  )
}
