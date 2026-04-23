/**
 * Unit tests for AssistantWidget components
 *
 * Validates: Requirements 1.1, 2.1, 2.5, 4.3, 4.4
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import BubbleIcon from './BubbleIcon'
import ChatWindow from './ChatWindow'
import MessageInput from './MessageInput'
import MessageList from './MessageList'
import AssistantWidget from './AssistantWidget'
import type { ChatMessage } from './types'

// Mock the sendChatMessage API
vi.mock('../../../api/chat', () => ({
  sendChatMessage: vi.fn(),
}))

import { sendChatMessage } from '../../../api/chat'

const mockedSendChatMessage = vi.mocked(sendChatMessage)

// ---------------------------------------------------------------------------
// BubbleIcon  (Validates: Requirement 1.1)
// ---------------------------------------------------------------------------
describe('BubbleIcon', () => {
  it('renders a button with the correct aria-label', () => {
    render(<BubbleIcon onClick={() => {}} />)
    expect(screen.getByRole('button', { name: '打开智能助手' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<BubbleIcon onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledOnce()
  })
})

// ---------------------------------------------------------------------------
// ChatWindow  (Validates: Requirement 2.1, 2.5)
// ---------------------------------------------------------------------------
describe('ChatWindow', () => {
  const baseProps = {
    messages: [] as ChatMessage[],
    isLoading: false,
    onSend: vi.fn(),
    onMinimize: vi.fn(),
  }

  it('renders the title bar with "智能助手" text', () => {
    render(<ChatWindow {...baseProps} />)
    expect(screen.getByText('智能助手')).toBeInTheDocument()
  })

  it('renders a minimize button and calls onMinimize when clicked', () => {
    const onMinimize = vi.fn()
    render(<ChatWindow {...baseProps} onMinimize={onMinimize} />)
    const minimizeBtn = screen.getByRole('button', { name: '最小化聊天窗口' })
    expect(minimizeBtn).toBeInTheDocument()
    fireEvent.click(minimizeBtn)
    expect(onMinimize).toHaveBeenCalledOnce()
  })
})


// ---------------------------------------------------------------------------
// MessageInput  (Validates: Requirement 4.3, 4.4)
// ---------------------------------------------------------------------------
describe('MessageInput', () => {
  it('renders with placeholder text', () => {
    render(<MessageInput onSend={vi.fn()} disabled={false} />)
    expect(screen.getByPlaceholderText('请输入您的问题...')).toBeInTheDocument()
  })

  it('disables send button when input is empty', () => {
    render(<MessageInput onSend={vi.fn()} disabled={false} />)
    const sendBtn = screen.getByRole('button', { name: '发送消息' })
    expect(sendBtn).toBeDisabled()
  })

  it('enables send button when input has content', () => {
    render(<MessageInput onSend={vi.fn()} disabled={false} />)
    const input = screen.getByPlaceholderText('请输入您的问题...')
    fireEvent.change(input, { target: { value: '你好' } })
    const sendBtn = screen.getByRole('button', { name: '发送消息' })
    expect(sendBtn).toBeEnabled()
  })

  it('disables send button when disabled prop is true even with content', () => {
    render(<MessageInput onSend={vi.fn()} disabled={true} />)
    const input = screen.getByPlaceholderText('请输入您的问题...')
    // Input itself is disabled so we can't type, but button should be disabled
    const sendBtn = screen.getByRole('button', { name: '发送消息' })
    expect(sendBtn).toBeDisabled()
  })

  it('calls onSend with trimmed text and clears input on button click', () => {
    const onSend = vi.fn()
    render(<MessageInput onSend={onSend} disabled={false} />)
    const input = screen.getByPlaceholderText('请输入您的问题...')
    fireEvent.change(input, { target: { value: '  测试消息  ' } })
    fireEvent.click(screen.getByRole('button', { name: '发送消息' }))
    expect(onSend).toHaveBeenCalledWith('测试消息')
    expect(input).toHaveValue('')
  })

  it('calls onSend on Enter key press', () => {
    const onSend = vi.fn()
    render(<MessageInput onSend={onSend} disabled={false} />)
    const input = screen.getByPlaceholderText('请输入您的问题...')
    fireEvent.change(input, { target: { value: '回车发送' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSend).toHaveBeenCalledWith('回车发送')
  })
})


// ---------------------------------------------------------------------------
// MessageList  (Validates: Requirement 2.1)
// ---------------------------------------------------------------------------
describe('MessageList', () => {
  const assistantMsg: ChatMessage = {
    id: '1',
    role: 'assistant',
    content: '您好！我是智能助手',
    timestamp: Date.now(),
  }

  const userMsg: ChatMessage = {
    id: '2',
    role: 'user',
    content: '你好',
    timestamp: Date.now(),
  }

  const errorMsg: ChatMessage = {
    id: '3',
    role: 'error',
    content: '网络连接失败，请检查网络后重试',
    timestamp: Date.now(),
  }

  it('renders assistant messages', () => {
    render(<MessageList messages={[assistantMsg]} isLoading={false} />)
    expect(screen.getByText('您好！我是智能助手')).toBeInTheDocument()
  })

  it('renders user messages', () => {
    render(<MessageList messages={[userMsg]} isLoading={false} />)
    expect(screen.getByText('你好')).toBeInTheDocument()
  })

  it('renders error messages', () => {
    render(<MessageList messages={[errorMsg]} isLoading={false} />)
    expect(screen.getByText('网络连接失败，请检查网络后重试')).toBeInTheDocument()
  })

  it('renders all message types together', () => {
    render(<MessageList messages={[assistantMsg, userMsg, errorMsg]} isLoading={false} />)
    expect(screen.getByText('您好！我是智能助手')).toBeInTheDocument()
    expect(screen.getByText('你好')).toBeInTheDocument()
    expect(screen.getByText('网络连接失败，请检查网络后重试')).toBeInTheDocument()
  })

  it('shows loading dots when isLoading is true', () => {
    const { container } = render(<MessageList messages={[]} isLoading={true} />)
    // Loading dots are rendered as animated spans
    const dots = container.querySelectorAll('.animate-bounce')
    expect(dots.length).toBe(3)
  })

  it('does not show loading dots when isLoading is false', () => {
    const { container } = render(<MessageList messages={[]} isLoading={false} />)
    const dots = container.querySelectorAll('.animate-bounce')
    expect(dots.length).toBe(0)
  })
})


// ---------------------------------------------------------------------------
// AssistantWidget (integration)  (Validates: Requirement 2.1, 2.5)
// ---------------------------------------------------------------------------
describe('AssistantWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initially shows the bubble icon and not the chat window', () => {
    render(<AssistantWidget />)
    expect(screen.getByRole('button', { name: '打开智能助手' })).toBeInTheDocument()
    expect(screen.queryByText('智能助手')).not.toBeInTheDocument()
  })

  it('opens chat window and hides bubble when bubble is clicked', () => {
    render(<AssistantWidget />)
    fireEvent.click(screen.getByRole('button', { name: '打开智能助手' }))
    // Chat window should be visible with title
    expect(screen.getByText('智能助手')).toBeInTheDocument()
    // Bubble should be hidden
    expect(screen.queryByRole('button', { name: '打开智能助手' })).not.toBeInTheDocument()
  })

  it('shows welcome message when chat window opens', () => {
    render(<AssistantWidget />)
    fireEvent.click(screen.getByRole('button', { name: '打开智能助手' }))
    expect(screen.getByText('您好！我是智能助手，有什么可以帮您的吗？')).toBeInTheDocument()
  })

  it('closes chat window and shows bubble when minimize is clicked', () => {
    render(<AssistantWidget />)
    // Open the chat window
    fireEvent.click(screen.getByRole('button', { name: '打开智能助手' }))
    expect(screen.getByText('智能助手')).toBeInTheDocument()
    // Click minimize
    fireEvent.click(screen.getByRole('button', { name: '最小化聊天窗口' }))
    // Chat window should be hidden
    expect(screen.queryByText('智能助手')).not.toBeInTheDocument()
    // Bubble should be visible again
    expect(screen.getByRole('button', { name: '打开智能助手' })).toBeInTheDocument()
  })

  it('sends a message and displays the assistant reply', async () => {
    mockedSendChatMessage.mockResolvedValueOnce({
      success: true,
      data: { reply: '这是AI回复' },
    })

    render(<AssistantWidget />)
    fireEvent.click(screen.getByRole('button', { name: '打开智能助手' }))

    const input = screen.getByPlaceholderText('请输入您的问题...')
    fireEvent.change(input, { target: { value: '测试问题' } })
    fireEvent.click(screen.getByRole('button', { name: '发送消息' }))

    // User message should appear immediately
    expect(screen.getByText('测试问题')).toBeInTheDocument()

    // Wait for assistant reply
    await waitFor(() => {
      expect(screen.getByText('这是AI回复')).toBeInTheDocument()
    })
  })

  it('displays error message when API call fails', async () => {
    const apiError = new Error('Server error')
    ;(apiError as any).isAxiosError = true
    ;(apiError as any).response = { status: 500 }
    mockedSendChatMessage.mockRejectedValueOnce(apiError)

    render(<AssistantWidget />)
    fireEvent.click(screen.getByRole('button', { name: '打开智能助手' }))

    const input = screen.getByPlaceholderText('请输入您的问题...')
    fireEvent.change(input, { target: { value: '测试错误' } })
    fireEvent.click(screen.getByRole('button', { name: '发送消息' }))

    await waitFor(() => {
      expect(screen.getByText('抱歉，服务暂时不可用，请稍后再试')).toBeInTheDocument()
    })
  })
})