import { useEffect, useRef } from 'react'
import type { ChatMessage } from './types'

interface MessageListProps {
  messages: ChatMessage[]
  isLoading: boolean
}

function RobotAvatar() {
  return (
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5m-4.25-5.682c.25.023.5.05.75.082M12 2.25c-2.796 0-5.487.46-8 1.308m16 0A23.747 23.747 0 0012 2.25"
        />
      </svg>
    </div>
  )
}

function WarningIcon() {
  return (
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
    </div>
  )
}

function LoadingDots() {
  return (
    <div className="flex items-start gap-2">
      <RobotAvatar />
      <div className="rounded-lg rounded-tl-none bg-gray-100 px-3 py-2">
        <div className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
          <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
          <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bottomRef.current && typeof bottomRef.current.scrollIntoView === 'function') {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
      {messages.map((msg) => {
        if (msg.role === 'user') {
          return (
            <div key={msg.id} className="flex justify-end">
              <div className="max-w-[75%] rounded-lg rounded-tr-none bg-blue-600 px-3 py-2 text-sm text-white">
                {msg.content}
              </div>
            </div>
          )
        }

        if (msg.role === 'error') {
          return (
            <div key={msg.id} className="flex items-start gap-2">
              <WarningIcon />
              <div className="max-w-[75%] rounded-lg rounded-tl-none border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {msg.content}
              </div>
            </div>
          )
        }

        // assistant message
        return (
          <div key={msg.id} className="flex items-start gap-2">
            <RobotAvatar />
            <div className="max-w-[75%] rounded-lg rounded-tl-none bg-gray-100 px-3 py-2 text-sm text-gray-800">
              {msg.content}
            </div>
          </div>
        )
      })}

      {isLoading && <LoadingDots />}

      <div ref={bottomRef} />
    </div>
  )
}
