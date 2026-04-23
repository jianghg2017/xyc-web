import React, { useState, useEffect, useCallback } from 'react'
import { adminApi } from '@/api/admin'
import ContactDetailModal from '@/components/admin/ContactDetailModal'
import ConfirmModal from '@/components/common/ConfirmModal'
import Pagination from '@/components/common/Pagination'
import type { Contact, Pagination as PaginationType } from '@/types'

// ==================== Toast ====================

interface Toast {
  id: number
  message: string
  type: 'error' | 'success'
}

// ==================== Helpers ====================

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  new: { label: '新消息', className: 'bg-blue-100 text-blue-700' },
  read: { label: '已读', className: 'bg-gray-100 text-gray-600' },
  replied: { label: '已回复', className: 'bg-green-100 text-green-700' },
  closed: { label: '已关闭', className: 'bg-red-100 text-red-600' },
}

const STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'new', label: '新消息' },
  { value: 'read', label: '已读' },
  { value: 'replied', label: '已回复' },
  { value: 'closed', label: '已关闭' },
]

const TYPE_OPTIONS = [
  { value: '', label: '全部类型' },
  { value: '产品咨询', label: '产品咨询' },
  { value: '解决方案', label: '解决方案' },
  { value: '技术支持', label: '技术支持' },
  { value: '商务合作', label: '商务合作' },
  { value: '其他问题', label: '其他问题' },
]

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ==================== CSV Export ====================

const exportToCSV = (contacts: Contact[]) => {
  const headers = ['ID', '姓名', '邮箱', '电话', '公司', '类型', '状态', '提交时间', '内容']
  const rows = contacts.map(c => [
    c.id,
    c.name,
    c.email,
    c.phone || '',
    c.company || '',
    c.type,
    c.status,
    c.created_at,
    `"${c.message.replace(/"/g, '""')}"`,
  ])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `contacts-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ==================== Component ====================

const ContactsList: React.FC = () => {
  // --- State ---
  const [contacts, setContacts] = useState<Contact[]>([])
  const [pagination, setPagination] = useState<PaginationType | null>(null)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ keyword: '', status: '', type: '' })
  const [loading, setLoading] = useState(false)

  // Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // Detail modal
  const [detailModal, setDetailModal] = useState(false)
  const [viewingContact, setViewingContact] = useState<Contact | null>(null)

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Batch
  const [batchLoading, setBatchLoading] = useState(false)
  const [batchConfirm, setBatchConfirm] = useState<'read' | 'delete' | null>(null)

  // Toast
  const [toasts, setToasts] = useState<Toast[]>([])

  // --- Toast helpers ---
  const showToast = useCallback((message: string, type: 'error' | 'success' = 'error') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  // --- Fetch ---
  const fetchContacts = useCallback(
    async (currentPage: number, currentFilters: typeof filters) => {
      setLoading(true)
      try {
        const params: Record<string, any> = { page: currentPage, limit: 20 }
        if (currentFilters.keyword) params.keyword = currentFilters.keyword
        if (currentFilters.status) params.status = currentFilters.status
        if (currentFilters.type) params.type = currentFilters.type

        const res = await adminApi.contacts.getList(params)
        setContacts(res.data?.data ?? [])
        setPagination(res.data?.pagination ?? null)
        setSelectedIds([])
      } catch {
        showToast('获取留言列表失败，请刷新重试')
      } finally {
        setLoading(false)
      }
    },
    [showToast]
  )

  useEffect(() => {
    fetchContacts(page, filters)
  }, [page, filters, fetchContacts])

  // --- Filter handlers ---
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, keyword: e.target.value }))
    setPage(1)
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, status: e.target.value }))
    setPage(1)
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, type: e.target.value }))
    setPage(1)
  }

  // --- Selection ---
  const allSelected = contacts.length > 0 && selectedIds.length === contacts.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < contacts.length

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(contacts.map(c => c.id))
    }
  }

  const toggleSelectOne = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // --- Detail modal ---
  const handleViewContact = (contact: Contact) => {
    setViewingContact(contact)
    setDetailModal(true)
  }

  const handleDetailClose = () => {
    setDetailModal(false)
    setViewingContact(null)
  }

  const handleDetailSuccess = () => {
    fetchContacts(page, filters)
  }

  // --- Delete ---
  const handleDeleteClick = (id: number) => {
    setDeleteTarget(id)
  }

  const handleDeleteConfirm = async () => {
    if (deleteTarget === null) return
    setDeleteLoading(true)
    try {
      await adminApi.contacts.delete(deleteTarget)
      showToast('删除成功', 'success')
      setDeleteTarget(null)
      fetchContacts(page, filters)
    } catch {
      showToast('删除失败，请重试')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteTarget(null)
  }

  // --- Batch operations ---
  const handleBatchMarkRead = () => {
    setBatchConfirm('read')
  }

  const handleBatchDelete = () => {
    setBatchConfirm('delete')
  }

  const handleBatchConfirm = async () => {
    if (!batchConfirm || selectedIds.length === 0) return
    setBatchLoading(true)
    try {
      await adminApi.contacts.batchOperation({ action: batchConfirm, ids: selectedIds })
      showToast(batchConfirm === 'delete' ? '批量删除成功' : '批量标记已读成功', 'success')
      setBatchConfirm(null)
      setSelectedIds([])
      fetchContacts(page, filters)
    } catch {
      showToast(batchConfirm === 'delete' ? '批量删除失败，请重试' : '批量标记失败，请重试')
    } finally {
      setBatchLoading(false)
    }
  }

  const handleBatchCancel = () => {
    setBatchConfirm(null)
  }

  // --- Export ---
  const handleExport = () => {
    if (contacts.length === 0) {
      showToast('暂无数据可导出')
      return
    }
    try {
      exportToCSV(contacts)
      showToast('导出成功', 'success')
    } catch {
      showToast('导出失败，请重试')
    }
  }

  // ==================== Render ====================

  return (
    <div className="space-y-4">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all duration-300 pointer-events-auto ${
              toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">留言管理</h2>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          导出
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-3">
        {/* Keyword search */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="搜索姓名、邮箱..."
              value={filters.keyword}
              onChange={handleKeywordChange}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Status filter */}
        <select
          value={filters.status}
          onChange={handleStatusChange}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Type filter */}
        <select
          value={filters.type}
          onChange={handleTypeChange}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {TYPE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Batch toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center gap-4">
          <span className="text-sm text-blue-700 font-medium">
            已选择 {selectedIds.length} 条
          </span>
          <button
            onClick={handleBatchMarkRead}
            disabled={batchLoading}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            批量标记已读
          </button>
          <button
            onClick={handleBatchDelete}
            disabled={batchLoading}
            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            批量删除
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="ml-auto text-sm text-gray-500 hover:text-gray-700"
          >
            取消选择
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg
              className="w-12 h-12 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <p className="text-sm">暂无留言数据</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-10 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={el => {
                        if (el) el.indeterminate = someSelected
                      }}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      aria-label="全选"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">
                    状态
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">姓名</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">邮箱</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">
                    类型
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">
                    提交时间
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600 whitespace-nowrap">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contacts.map(item => {
                  const statusInfo = STATUS_LABELS[item.status ?? ''] ?? {
                    label: item.status ?? '—',
                    className: 'bg-gray-100 text-gray-600',
                  }
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleViewContact(item)}
                    >
                      {/* Checkbox */}
                      <td
                        className="px-4 py-3"
                        onClick={e => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelectOne(item.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          aria-label={`选择 ${item.name}`}
                        />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{item.name}</div>
                        {item.company && (
                          <div className="text-xs text-gray-400 mt-0.5">{item.company}</div>
                        )}
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 text-gray-600">{item.email}</td>

                      {/* Type */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">{item.type}</td>

                      {/* Created at */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {formatDate(item.created_at)}
                      </td>

                      {/* Actions */}
                      <td
                        className="px-4 py-3 text-right whitespace-nowrap"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleViewContact(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-md transition-colors mr-1"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          查看
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          删除
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.pages}
          onPageChange={setPage}
          className="py-2"
        />
      )}

      {/* Contact Detail Modal */}
      <ContactDetailModal
        open={detailModal}
        contact={viewingContact}
        onClose={handleDetailClose}
        onSuccess={handleDetailSuccess}
      />

      {/* Single Delete Confirm Modal */}
      <ConfirmModal
        open={deleteTarget !== null}
        title="确认删除"
        message="确定要删除这条留言吗？此操作不可撤销。"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleteLoading}
      />

      {/* Batch Delete Confirm Modal */}
      <ConfirmModal
        open={batchConfirm === 'delete'}
        title="批量删除"
        message={`确定要删除选中的 ${selectedIds.length} 条留言吗？此操作不可撤销。`}
        onConfirm={handleBatchConfirm}
        onCancel={handleBatchCancel}
        loading={batchLoading}
      />

      {/* Batch Mark Read Confirm Modal */}
      <ConfirmModal
        open={batchConfirm === 'read'}
        title="批量标记已读"
        message={`确定要将选中的 ${selectedIds.length} 条留言标记为已读吗？`}
        onConfirm={handleBatchConfirm}
        onCancel={handleBatchCancel}
        loading={batchLoading}
      />
    </div>
  )
}

export default ContactsList
