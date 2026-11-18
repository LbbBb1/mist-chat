import clsx from 'clsx'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useIsMobile } from '../../app/viewport.js'
import { useTranslate } from '../../i18n/index.js'
import {
  buildMessageVersions,
  getVisibleMessages,
  type MessageVersions,
} from '../../services/chat/branches.js'
import { selectMessageVersion } from '../../services/chat/store.js'
import type { Session } from '../../services/chat/types.js'
import { closeSearchPanel } from '../search/searchPanelState.js'
import { clearSearchScrollTarget, useSessionSearch } from '../sider/sessionSearchState.js'
import { AssistantMessage } from './AssistantMessage.js'
import { ScrollToBottomContext } from './scrollContext.js'
import { UserMessage } from './UserMessage.js'
import type { Message } from '../../services/chat/types.js'

/**
 * 会话共用可重试的附件上传失败入口，覆盖当前提问与历史消息中的附件。
 * 点击后按失败的回答重新补传附件并请求。
 */
const getUploadRetryId = (messages: Message[], streaming: boolean) => {
  const last = messages.at(-1)
  return !streaming &&
    last?.role === 'assistant' &&
    last.status === 'error' &&
    last.error?.kind === 'upload' &&
    last.error.retryable
    ? last.id
    : null
}
import styles from './MessageList.module.css'

/** 距底部小于该值时视为在底部，流式内容增长时跟随 */
const STICKY_THRESHOLD = 40
/**
 * 单次渲染的消息条数。历史会话动辄数百轮，一次性铺开会让每个 Markdown 块
 * 同时占内存，长回答叠加时直接压垮渲染进程；只渲染最近若干条，其余按需展开。
 */
const PAGE_SIZE = 30
const EMPTY_VERSIONS: MessageVersions = { ids: [], index: -1 }

export const MessageList = ({
  session,
  streaming,
  footer,
}: {
  session: Session
  streaming: boolean
  footer: React.ReactNode
}) => {
  const isMobile = useIsMobile()
  const t = useTranslate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef(true)
  const scrollTopRef = useRef(0)
  const restoreScrollRef = useRef<{ messageId: string; top: number } | null>(null)
  const targetScroll = useSessionSearch((state) => state.targetScroll)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const messages = getVisibleMessages(session)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  /** 展开更早消息前记录滚动高度，渲染后补回差值，避免视口跳动。 */
  const pendingScrollHeightRef = useRef<number | null>(null)
  const [previousVersions, setPreviousVersions] = useState(() =>
    buildMessageVersions(session, new Map())
  )
  const versions = useMemo(
    () => buildMessageVersions(session, previousVersions),
    [session, previousVersions]
  )
  if (versions !== previousVersions) {
    setPreviousVersions(versions)
  }

  // 切换会话回到最近一屏，避免上一个会话的展开状态串台
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [session.id])

  const startIndex = Math.max(0, messages.length - visibleCount)
  const hiddenCount = startIndex

  const loadEarlier = useCallback(() => {
    const el = scrollRef.current
    if (el) {
      pendingScrollHeightRef.current = el.scrollHeight
    }
    setVisibleCount((count) => Math.min(messages.length, count + PAGE_SIZE))
  }, [messages.length])

  // 展开后把新增内容的高度补到 scrollTop，视口停在原来看的那一屏
  useLayoutEffect(() => {
    const el = scrollRef.current
    const previousHeight = pendingScrollHeightRef.current
    if (!el || previousHeight === null) {
      return
    }
    pendingScrollHeightRef.current = null
    const delta = el.scrollHeight - previousHeight
    if (delta > 0) {
      el.scrollTop += delta
      scrollTopRef.current = el.scrollTop
    }
  })

  const lastMessageId = messages.at(-1)?.id
  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current
    if (el && stickyRef.current) {
      el.scrollTop = el.scrollHeight
      scrollTopRef.current = el.scrollTop
    }
  }, [])

  // 内容、键盘和输入框高度变化时，继续遵循当前跟随状态。
  useLayoutEffect(() => {
    const content = contentRef.current
    const scroll = scrollRef.current
    if (!content || !scroll) {
      return
    }
    const observer = new ResizeObserver(scrollToBottom)
    observer.observe(content)
    observer.observe(scroll)
    return () => observer.disconnect()
  }, [isMobile, scrollToBottom])

  // 切换版本后将选择器留在原位置，避免回答长短变化导致操作区跳出视口。
  useLayoutEffect(() => {
    const anchor = restoreScrollRef.current
    const scroll = scrollRef.current
    if (anchor && scroll) {
      const switcher = scroll.querySelector<HTMLElement>(
        `[data-message-version="${CSS.escape(anchor.messageId)}"]`
      )
      if (switcher) {
        scroll.scrollTop += switcher.getBoundingClientRect().top - anchor.top
      }
      restoreScrollRef.current = null
      return
    }
    if (targetScroll?.sessionId === session.id) {
      stickyRef.current = false
      return
    }
    stickyRef.current = true
    scrollToBottom()
  }, [session.id, lastMessageId, scrollToBottom, targetScroll])

  useEffect(() => {
    if (!targetScroll || targetScroll.sessionId !== session.id) {
      return
    }
    // 目标在尚未渲染的区间里：先展开到能覆盖它，渲染完成后再定位
    const targetIndex = messages.findIndex((message) => message.id === targetScroll.messageId)
    if (targetIndex >= 0 && targetIndex < startIndex) {
      setVisibleCount(messages.length - targetIndex + PAGE_SIZE)
      return
    }
    const scroll = scrollRef.current
    if (!scroll) {
      return
    }
    const targetEl = scroll.querySelector<HTMLElement>(
      `[data-message-id="${CSS.escape(targetScroll.messageId)}"]`
    )
    if (!targetEl) {
      return
    }
    stickyRef.current = false
    const scrollRect = scroll.getBoundingClientRect()
    const targetRect = targetEl.getBoundingClientRect()
    const nextTop =
      scroll.scrollTop +
      (targetRect.top - scrollRect.top) -
      Math.max(24, (scroll.clientHeight - targetRect.height) * 0.32)
    scroll.scrollTop = Math.max(0, nextTop)
    scrollTopRef.current = scroll.scrollTop
    setHighlightedId(targetScroll.messageId)
    clearSearchScrollTarget(targetScroll.nonce)
    const timer = window.setTimeout(() => {
      setHighlightedId((current) => (current === targetScroll.messageId ? null : current))
    }, 1800)
    return () => window.clearTimeout(timer)
  }, [session.id, messages, targetScroll, startIndex])

  useEffect(closeSearchPanel, [session.id, lastMessageId])

  const selectVersion = useCallback(
    (messageId: string, anchorTop: number) => {
      if (streaming) {
        return
      }
      restoreScrollRef.current = { messageId, top: anchorTop }
      stickyRef.current = false
      closeSearchPanel()
      selectMessageVersion(session.id, messageId)
    },
    [session.id, streaming]
  )

  // 跨移动端断点时切换滚动层，并保持输入框及当前阅读位置。
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) {
      return
    }
    if (stickyRef.current) {
      scrollToBottom()
    } else {
      el.scrollTop = scrollTopRef.current
    }
    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < STICKY_THRESHOLD
      // 仅在用户向上滚动时停止跟随底部，布局或内容增高时保持跟随状态。
      if (nearBottom) {
        stickyRef.current = true
      } else if (el.scrollTop < scrollTopRef.current) {
        stickyRef.current = false
      }
      scrollTopRef.current = el.scrollTop
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [isMobile, scrollToBottom])

  const lastIndex = messages.length - 1
  const uploadRetryId = getUploadRetryId(messages, streaming)
  return (
    <ScrollToBottomContext.Provider value={scrollToBottom}>
      <div ref={isMobile ? undefined : scrollRef} className={styles.container}>
        <div ref={isMobile ? scrollRef : undefined} className={styles.scroll}>
          <div ref={contentRef} className={styles.column}>
            {hiddenCount > 0 ? (
              <button type="button" className={styles.loadEarlier} onClick={loadEarlier}>
                {t('loadEarlierMessages', { count: hiddenCount })}
              </button>
            ) : null}
            {messages.slice(startIndex).map((message, offset) => {
              const index = startIndex + offset
              return (
                <div
                  key={message.id}
                  data-message-id={message.id}
                  className={clsx(highlightedId === message.id && styles.searchHighlight)}
                >
                  {message.role === 'user' ? (
                    <UserMessage
                      sessionId={session.id}
                      message={message}
                      retryUploadId={uploadRetryId}
                      isFirst={index === 0}
                      isLast={index === lastIndex || index === lastIndex - 1}
                      busy={streaming}
                      versions={versions.get(message.id) ?? EMPTY_VERSIONS}
                      onSelectVersion={selectVersion}
                    />
                  ) : (
                    <AssistantMessage
                      sessionId={session.id}
                      message={message}
                      isLast={index === lastIndex}
                      streaming={streaming && index === lastIndex}
                      busy={streaming}
                      versions={versions.get(message.id) ?? EMPTY_VERSIONS}
                      onSelectVersion={selectVersion}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
        {footer}
      </div>
    </ScrollToBottomContext.Provider>
  )
}
