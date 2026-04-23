import apiClient from './client'

interface ChatResponse {
  success: boolean
  data: {
    reply: string
  }
}

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const response = await apiClient.post<ChatResponse>('/chat', { message })
  return response.data
}
