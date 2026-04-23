import { useState } from 'react'
import type { ChatMessage } from './types'
import BubbleIcon from './BubbleIcon'
import ChatWindow from './ChatWindow'
import { sendChatMessage } from '../../../api/chat'

function generateId(): string {
  return `${Date.now()}-${Math.random()}`
}

const welcomeMessage: ChatMessage = {
  id: generateId(),
  role: 'assistant',
  content: '您好！我是公司官网智能客服，很高兴为您服务。我可以帮您了解公司的产品、服务、新闻动态和联系方式等信息。请问有什么可以帮您的吗？',
  timestamp: Date.now(),
}

export default function AssistantWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage])
  const [isLoading, setIsLoading] = useState(false)

  const handleOpen = () => setIsOpen(true)
  const handleMinimize = () => setIsOpen(false)

  const handleSend = async (content: string) => {
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await sendChatMessage(content)
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.data.reply,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: unknown) {
      const isNetworkError =
        error instanceof Error &&
        'isAxiosError' in error &&
        !(error as { response?: unknown }).response

      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'error',
        content: isNetworkError
          ? '网络连接失败，请检查网络后重试'
          : '抱歉，服务暂时不可用，请稍后再试',
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {!isOpen && <BubbleIcon onClick={handleOpen} />}
      {isOpen && (
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSend={handleSend}
          onMinimize={handleMinimize}
        />
      )}
    </>
  )
}
