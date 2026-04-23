import React, { useState, useEffect } from 'react'
import { adminApi } from '@/api/admin'
import type { Contact } from '@/types'

interface ContactDetailModalProps {
  open: boolean
  contact?: Contact | null
  onClose: () => void
  onSuccess: () => void
}

const STATUS_LABELS: Record<string, string> = {
  new: '新消息',
  read: '已读',
  replied: '已回复',
  closed: '已关闭',
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  read: 'bg-gray-100 text-gray-600',
  replied: 'bg-green-100 text-green-700',
  closed: 'bg-red-100 text-red-600',
}

const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  open,
  contact,
  onClose,
  onSuccess,
}) => {
  const [reply, setReply] = useState('')
  const [status, setStatus] = useState<'new' | 'read' | 'replied' | 'closed'>('read')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset state and auto-mark as read when modal opens
  useEffect(() => {
    if (open && contact) {
      setReply(contact.reply || '')
      setStatus(contact.status || 'read')
      setError('')

      // Auto-mark as read if status is 'new'
      if (contact.status === 'new') {
        adminApi.contacts
          .updateStatus(contact.id, { id: contact.id, status: 'read' })
          .then(() => {
            onSuccess()
          })
          .catch(() => {
            // Silently ignore auto-read errors
          })
      }
    }
  }, [open, contact])

  const handleSaveReply = async () => {
    if (!contact) return

    setLoading(true)
    setError('')
    try {
      await adminApi.contacts.updateStatus(contact.id, {
        id: contact.id,
        reply,
        status: 'replied',
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.error || '保存失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: 'new' | 'read' | 'replied' | 'closed') => {
    if (!contact) return
    setStatus(newStatus)
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">留言详情</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="关闭"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Contact Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              联系人信息
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">姓名：</span>
                <span className="text-gray-800 font-medium">{contact?.name || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500">邮箱：</span>
                <span className="text-gray-800">{contact?.email || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500">电话：</span>
                <span className="text-gray-800">{contact?.phone || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500">公司：</span>
                <span className="text-gray-800">{contact?.company || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500">咨询类型：</span>
                <span className="text-gray-800">{contact?.type || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500">提交时间：</span>
                <span className="text-gray-800">{formatDate(contact?.created_at)}</span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <span className="text-gray-500">当前状态：</span>
                {contact?.status && (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_COLORS[contact.status] || 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {STATUS_LABELS[contact.status] || contact.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">咨询内容</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed min-h-[80px]">
              {contact?.message || '（无内容）'}
            </div>
          </div>

          {/* Reply Textarea */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              回复内容
            </label>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="请输入回复内容..."
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              更新状态
            </label>
            <select
              value={status}
              onChange={(e) =>
                handleStatusChange(e.target.value as 'new' | 'read' | 'replied' | 'closed')
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="new">新消息</option>
              <option value="read">已读</option>
              <option value="replied">已回复</option>
              <option value="closed">已关闭</option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            关闭
          </button>
          <button
            type="button"
            onClick={handleSaveReply}
            disabled={loading || !contact}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 12 0 12 0v4a8 8 0 00-8 8H4z"
                />
              </svg>
            )}
            {loading ? '保存中...' : '保存回复'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContactDetailModal
