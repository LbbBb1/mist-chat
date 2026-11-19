import { useSettings } from '../../services/settings.js'
import styles from './InstallGuide.module.css'

const CONTENT = {
  'zh-CN': {
    eyebrow: '雾语 · 独立版本',
    title: '不用开会员的 AI 对话',
    lead: '一个装在手机上的客户端。填自己的 API Key 就能聊，没有中间服务器，聊天记录只存在你自己的设备里。',
    sections: [
      {
        title: '它是什么',
        body: [
          '雾语是一个纯前端客户端，只负责界面和你手机上的存储。',
          '你把自己的 DeepSeek API Key 填进去，请求直接从你手机发到 DeepSeek，不经过任何第三方。',
        ],
      },
      {
        title: '适合谁',
        list: [
          '不想按月充会员，希望按实际用量付费的',
          '在意隐私，不希望聊天记录存在别人服务器上的',
          '已经有一个 API Key，或者愿意花两分钟注册一个的',
        ],
      },
      {
        title: '能做什么',
        list: [
          '流式对话、深度思考、联网搜索',
          '导入 DeepSeek 网页版导出的历史对话（ZIP，含图片）',
          '一键导出全部对话做备份',
          '深色模式、语音输入、图片识别',
          '长会话分页加载，几百轮也不卡',
        ],
      },
      {
        title: '怎么装',
        steps: [
          '安卓：下载 APK 直接安装',
          'iPhone：用 Safari 打开网页，点分享 → 添加到主屏幕',
          '电脑：浏览器打开同一个网址就能用',
        ],
      },
      {
        title: '要花多少钱',
        body: [
          '软件本身免费，我也不收任何服务费。',
          '唯一的费用是 AI 调用费，由 DeepSeek 官方按 token 计费，日常聊天一次通常几分钱。',
          '没有任何会员、没有内购、没有隐藏收费。',
        ],
      },
    ],
    faq: {
      title: '常见问题',
      items: [
        {
          q: 'API Key 是什么？去哪拿？',
          a: '它是你调用 DeepSeek 模型的凭证。在 platform.deepseek.com 注册后创建，复制粘贴到应用设置里就行，全程免费。',
        },
        {
          q: '我的聊天记录会被看到吗？',
          a: '不会。应用没有后端服务器，对话和 Key 都存在你手机本地。换手机或清缓存前记得导出备份。',
        },
        {
          q: '为什么不在应用商店？',
          a: '个人维护的独立版本，没走商店审核。装到主屏幕后用法完全一样：独立图标、全屏、无地址栏。',
        },
        {
          q: '和网页版有什么区别？',
          a: '多了历史导入导出、链接导入、长会话分页，以及自己掌控的数据存储。功能上更接近一个「能带走」的客户端。',
        },
        {
          q: '以后怎么更新？',
          a: '安卓版不自动更新，需要时在设置 → 版本与更新里点「检查更新」，有新版本会提示下载覆盖安装，聊天记录保留。iPhone 和网页版联网打开即为最新，不用重装。',
        },
      ],
    },
    actions: {
      install: '查看安装步骤',
      open: '直接打开应用',
    },
    footer: '第三方客户端，与 DeepSeek 官方无关',
  },
  'en-US': {
    eyebrow: 'Mist · Independent build',
    title: 'An AI client without a subscription',
    lead: 'A client that runs on your phone. Paste your own API key and chat — no middleman server, and your history never leaves your device.',
    sections: [
      {
        title: 'What it is',
        body: [
          'Mist is a pure front-end client. It only handles the interface and local storage.',
          'You supply your own DeepSeek API key, and requests go straight from your device to DeepSeek.',
        ],
      },
      {
        title: 'Who it is for',
        list: [
          'People who prefer paying per usage over a monthly subscription',
          'People who want their chat history to stay on their own device',
          'Anyone who already has an API key, or can spend two minutes getting one',
        ],
      },
      {
        title: 'What it does',
        list: [
          'Streaming chat with thinking mode and web search',
          'Import DeepSeek export archives (ZIP, images included)',
          'One-tap export of your entire history',
          'Dark mode, voice input, image understanding',
          'Paged rendering for very long conversations',
        ],
      },
      {
        title: 'How to install',
        steps: [
          'Android: download the APK and install',
          'iPhone: open the site in Safari, tap Share → Add to Home Screen',
          'Desktop: just open the same URL in a browser',
        ],
      },
      {
        title: 'What it costs',
        body: [
          'The app is free, and I charge nothing on top.',
          'The only cost is DeepSeek billing you for API usage — usually cents per conversation.',
          'No subscription, no in-app purchase, no hidden fees.',
        ],
      },
    ],
    faq: {
      title: 'Questions',
      items: [
        {
          q: 'What is an API key and where do I get one?',
          a: 'It is the credential used to call DeepSeek models. Create one at platform.deepseek.com and paste it into settings. Creating it is free.',
        },
        {
          q: 'Can anyone see my chats?',
          a: 'No. There is no backend server; conversations and keys live on your device. Export a backup before switching phones.',
        },
        {
          q: 'Why is it not on the app stores?',
          a: 'Independently maintained build. Once added to your home screen it behaves like any app: own icon, full screen, no address bar.',
        },
        {
          q: 'How is it different from the web version?',
          a: 'History import/export, URL import, paged long conversations, and data you actually own.',
        },
        {
          q: 'How do updates work?',
          a: 'Open it while online and it refreshes. You can also tap "Check for updates" in settings.',
        },
      ],
    },
    actions: {
      install: 'Install steps',
      open: 'Open the app',
    },
    footer: 'Third-party client, not affiliated with DeepSeek',
  },
} as const

/** 面向小红书/闲鱼的说明页：?about=1 */
export const AboutPage = () => {
  const locale = useSettings((state) => state.locale)
  const text = CONTENT[locale === 'en-US' ? 'en-US' : 'zh-CN']

  const base = window.location.pathname
  const openInstall = () => {
    window.location.href = `${base}?help=1`
  }
  const openApp = () => {
    window.location.href = base
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.eyebrow}>{text.eyebrow}</div>
          <h1 className={styles.title}>{text.title}</h1>
          <p className={styles.lead}>{text.lead}</p>
        </header>

        {text.sections.map((section) => (
          <section key={section.title} className={styles.card}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            {'body' in section && section.body
              ? section.body.map((line) => (
                  <p key={line} className={styles.paragraph}>
                    {line}
                  </p>
                ))
              : null}
            {'list' in section && section.list ? (
              <ul className={styles.bullets}>
                {section.list.map((item) => (
                  <li key={item} className={styles.bullet}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
            {'steps' in section && section.steps ? (
              <ol className={styles.steps}>
                {section.steps.map((step, index) => (
                  <li key={step} className={styles.step}>
                    <span className={styles.stepIndex}>{index + 1}</span>
                    <span className={styles.stepText}>{step}</span>
                  </li>
                ))}
              </ol>
            ) : null}
          </section>
        ))}

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

        <div className={styles.actionRow}>
          <button type="button" className={styles.back} onClick={openInstall}>
            {text.actions.install}
          </button>
          <button type="button" className={styles.secondary} onClick={openApp}>
            {text.actions.open}
          </button>
        </div>

        <footer className={styles.footer}>
          {text.footer}
          {' · '}
          <a
            className={styles.footerLink}
            href="https://github.com/LbbBb1/mist-chat"
            target="_blank"
            rel="noreferrer"
          >
            github.com/LbbBb1/mist-chat
          </a>
        </footer>
      </div>
    </div>
  )
}
