import { useSettings } from '../../services/settings.js'
import styles from './InstallGuide.module.css'

type Section = {
  title: string
  paragraphs?: readonly string[]
  list?: readonly string[]
  steps?: readonly string[]
  table?: { head: readonly string[]; rows: readonly (readonly string[])[] }
  note?: string
}

const CONTENT = {
  'zh-CN': {
    eyebrow: '雾语 · 使用手册',
    title: '怎么用',
    lead: '从填 Key 到导入历史对话，一页看完。',
    sections: [
      {
        title: '第一次使用',
        steps: [
          '打开 platform.deepseek.com 注册（免费），进「API Keys」创建一个，复制出来',
          '打开雾语，弹出的设置里粘贴 Key，保存',
          '发一句「你好」测试，几秒内逐字输出就是通了',
        ],
        note: 'Key 只显示一次，先存好。账户需要余额才能调用，充值在同一页面。',
      },
      {
        title: '三个开关',
        table: {
          head: ['按钮', '作用', '什么时候开'],
          rows: [
            ['深度思考', '先推理再回答，更准但更慢更贵', '数学、逻辑、写代码'],
            ['智能搜索', '联网检索后再答', '问实时信息、价格'],
            ['生图', '生成图片', '需要配图'],
          ],
        },
        note: '三个都关 = 普通对话，最快最省。',
      },
      {
        title: '会话管理',
        list: [
          '左上角汉堡按钮打开侧栏，按「今天 / 昨天 / 7 天内 / 30 天内」自动分组',
          '侧栏顶部搜索框可以搜标题，也能搜消息内容，命中的会话点进去会自动定位',
          '会话右侧 ··· 菜单里能重命名、置顶、删除',
          '超过 30 条消息的会话，顶部会出现「展开更早的 N 条」，点一下往上翻',
        ],
      },
      {
        title: '导入历史对话',
        steps: [
          '在 chat.deepseek.com 左下角 → 设置 → 数据管理 → 导出全部对话，等邮件下载 ZIP',
          '雾语里：设置 → 数据管理 → 导入历史对话',
          '选文件上传，或者把 ZIP 传网盘拿直链后选「从链接导入」',
        ],
        note: '导入是覆盖式的，会替换本地全部对话。有重要内容先导出备份。大文件导入期间别锁屏。',
      },
      {
        title: '换手机怎么迁移',
        steps: [
          '旧手机：设置 → 数据管理 → 导出所有历史对话',
          '新手机：装好雾语 → 数据管理 → 导入历史对话 → 选那个 ZIP',
          '重新填一次 API Key（导出文件不含 Key）',
        ],
      },
      {
        title: '数据存在哪',
        paragraphs: [
          '全部在你自己的设备上：Key 在 localStorage，对话和图片在 IndexedDB。没有账号、没有云同步。',
          '代价是换设备不通用、清浏览器数据会一起删、卸载安卓应用会清空。所以定期导出一份备份。',
        ],
      },
      {
        title: '常见问题',
        list: [
          '提示 Key 无效：多半是复制时带了空格，或者 Key 被删了、账号没余额',
          '提示余额不足：去开放平台充值，DeepSeek 是预付费',
          '回复很慢：关掉深度思考和智能搜索会快很多；高峰期官方接口本身慢',
          '导入卡住：248 MB 的归档要 1–3 分钟，别锁屏；一直不动就取消重来',
          '提示消息分支损坏：ZIP 不是官方导出格式或已损坏，重新导出一份',
        ],
      },
      {
        title: '要花多少钱',
        paragraphs: [
          '软件免费。只有 DeepSeek 按 token 收的 API 费，普通对话一次几分钱。',
          '设置里的「每日 Token 用量提醒」可以盯着实际消耗。',
        ],
      },
    ],
    actions: {
      install: '安装步骤',
      about: '了解这个应用',
      open: '直接打开',
    },
    footer: '完整版手册在仓库 docs/USER-GUIDE.md',
  },
  'en-US': {
    eyebrow: 'Mist · User guide',
    title: 'How to use it',
    lead: 'From pasting a key to importing your history — one page.',
    sections: [
      {
        title: 'Getting started',
        steps: [
          'Sign up at platform.deepseek.com (free), open API Keys, create one and copy it',
          'Open Mist, paste the key into the dialog, save',
          'Send "hello" — streaming text within a few seconds means it works',
        ],
        note: 'The key is shown once. Your account also needs credit before calls go through.',
      },
      {
        title: 'The three toggles',
        table: {
          head: ['Toggle', 'What it does', 'When to use'],
          rows: [
            ['Thinking', 'Reasons before answering — better, slower, pricier', 'Math, logic, code'],
            ['Web search', 'Looks things up before answering', 'Live info, prices'],
            ['Image gen', 'Generates an image', 'When you need visuals'],
          ],
        },
        note: 'All off = plain chat, fastest and cheapest.',
      },
      {
        title: 'Sessions',
        list: [
          'Hamburger button opens the sidebar, grouped by today / yesterday / 7 days / 30 days',
          'The sidebar search covers titles and message text; results jump to the hit',
          'The ··· menu renames, pins and deletes a session',
          'Sessions over 30 messages show "expand earlier N" at the top',
        ],
      },
      {
        title: 'Importing history',
        steps: [
          'On chat.deepseek.com: profile → Settings → Data → Export all conversations, download the ZIP',
          'In Mist: Settings → Data → Import history',
          'Upload the file, or host it and use "Import from link"',
        ],
        note: 'Import replaces everything locally — export a backup first. Do not lock the screen during a large import.',
      },
      {
        title: 'Moving to a new phone',
        steps: [
          'Old phone: Settings → Data → Export all conversations',
          'New phone: install Mist → Data → Import history → pick that ZIP',
          'Re-enter your API key (exports do not include it)',
        ],
      },
      {
        title: 'Where your data lives',
        paragraphs: [
          'Everything stays on your device: the key in localStorage, conversations and images in IndexedDB. No account, no sync.',
          'The trade-off: it does not follow you across devices, clearing browser data wipes it, uninstalling on Android wipes it. Export a backup regularly.',
        ],
      },
      {
        title: 'Troubleshooting',
        list: [
          'Invalid key: usually a stray space when pasting, or the key was deleted / the account is empty',
          'Insufficient balance: top up at the platform; DeepSeek is prepaid',
          'Slow replies: turn off Thinking and Web search; peak hours are slower',
          'Import stuck: a 248 MB archive takes 1–3 minutes, keep the screen on',
          'Branch corrupted: the ZIP is not an official export or is damaged — export again',
        ],
      },
      {
        title: 'What it costs',
        paragraphs: [
          'The app is free. Only DeepSeek charges you, per token — cents per conversation.',
          'The daily token counter in settings shows real usage.',
        ],
      },
    ],
    actions: {
      install: 'Install steps',
      about: 'About the app',
      open: 'Open the app',
    },
    footer: 'Full guide: docs/USER-GUIDE.md in the repository',
  },
} as const

/** 使用手册页：?guide=1 */
export const UserGuide = () => {
  const locale = useSettings((state) => state.locale)
  const text = CONTENT[locale === 'en-US' ? 'en-US' : 'zh-CN']
  const base = window.location.pathname

  const go = (query: string) => {
    window.location.href = `${base}${query}`
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.eyebrow}>{text.eyebrow}</div>
          <h1 className={styles.title}>{text.title}</h1>
          <p className={styles.lead}>{text.lead}</p>
        </header>

        {text.sections.map((section) => {
          const s = section as Section
          return (
            <section key={s.title} className={styles.card}>
              <h2 className={styles.sectionTitle}>{s.title}</h2>
              {s.paragraphs?.map((line) => (
                <p key={line} className={styles.paragraph}>
                  {line}
                </p>
              ))}
              {s.steps ? (
                <ol className={styles.steps}>
                  {s.steps.map((step, index) => (
                    <li key={step} className={styles.step}>
                      <span className={styles.stepIndex}>{index + 1}</span>
                      <span className={styles.stepText}>{step}</span>
                    </li>
                  ))}
                </ol>
              ) : null}
              {s.list ? (
                <ul className={styles.bullets}>
                  {s.list.map((item) => (
                    <li key={item} className={styles.bullet}>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
              {s.table ? (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        {s.table.head.map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {s.table.rows.map((row) => (
                        <tr key={row[0]}>
                          {row.map((cell, i) => (
                            <td key={`${row[0]}-${i}`}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              {s.note ? <p className={styles.tip}>{s.note}</p> : null}
            </section>
          )
        })}

        <div className={styles.actionRow}>
          <button type="button" className={styles.back} onClick={() => go('')}>
            {text.actions.open}
          </button>
          <button type="button" className={styles.secondary} onClick={() => go('?about=1')}>
            {text.actions.about}
          </button>
          <button type="button" className={styles.secondary} onClick={() => go('?help=1')}>
            {text.actions.install}
          </button>
        </div>

        <footer className={styles.footer}>{text.footer}</footer>
      </div>
    </div>
  )
}
