import type { ChatMessage } from './types'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

interface ChatWindowProps {
  messages: ChatMessage[]
  isLoading: boolean
  onSend: (message: string) => void
  onMinimize: () => void
}

function TitleBar({ onMinimize }: { onMinimize: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-t-lg bg-[#1e3a5f] px-4 py-3">
      <span className="text-sm font-medium text-white">智能助手</span>
      <button
        onClick={onMinimize}
        aria-label="最小化聊天窗口"
        className="flex h-6 w-6 items-center justify-center rounded text-white/80 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-1 focus:ring-white/50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
        </svg>
      </button>
    </div>
  )
}

export default function ChatWindow({ messages, isLoading, onSend, onMinimize }: ChatWindowProps) {
  return (
    <div
      className="fixed right-6 bottom-6 z-[9999] flex w-[380px] animate-slide-up flex-col rounded-lg bg-white shadow-2xl"
      style={{ height: '520px' }}
    >
      <TitleBar onMinimize={onMinimize} />
      <MessageList messages={messages} isLoading={isLoading} />
      <MessageInput onSend={onSend} disabled={isLoading} />
    </div>
  )
}
