import React, { useState, useEffect, useCallback } from 'react'
import { adminApi } from '@/api/admin'
import NewsFormModal from '@/components/admin/NewsFormModal'
import ConfirmModal from '@/components/common/ConfirmModal'
import Pagination from '@/components/common/Pagination'
import type { News, Pagination as PaginationType } from '@/types'

// ==================== Toast ====================

interface Toast {
  id: number
  message: string
  type: 'error' | 'success'
}

// ==================== Helpers ====================

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  published: { label: '已发布', className: 'bg-green-100 text-green-700' },
  draft: { label: '草稿', className: 'bg-yellow-100 text-yellow-700' },
  archived: { label: '已归档', className: 'bg-gray-100 text-gray-600' },
}

const CATEGORY_OPTIONS = ['全部', '公司新闻', '产品动态', '行业活动', '技术文章']
const STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'published', label: '已发布' },
  { value: 'draft', label: '草稿' },
  { value: 'archived', label: '已归档' },
]

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// ==================== Component ====================

const NewsList: React.FC = () => {
  // --- State ---
  const [news, setNews] = useState<News[]>([])
  const [pagination, setPagination] = useState<PaginationType | null>(null)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ keyword: '', category: '', status: '' })
  const [loading, setLoading] = useState(false)

  // Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // Modals
  const [modalOpen, setModalOpen] = useState(false)
  const [editingNews, setEditingNews] = useState<News | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Batch
  const [batchLoading, setBatchLoading] = useState(false)
  const [batchConfirm, setBatchConfirm] = useState<'delete' | 'publish' | null>(null)

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
  const fetchNews = useCallback(async (currentPage: number, currentFilters: typeof filters) => {
    setLoading(true)
    try {
      const params: Record<string, any> = { page: currentPage, limit: 20 }
      if (currentFilters.keyword) params.keyword = currentFilters.keyword
      if (currentFilters.category) params.category = currentFilters.category
      if (currentFilters.status) params.status = currentFilters.status

      const res = await adminApi.news.getList(params)
      setNews(res.data?.data ?? [])
      setPagination(res.data?.pagination ?? null)
      setSelectedIds([])
    } catch {
      showToast('获取新闻列表失败，请刷新重试')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchNews(page, filters)
  }, [page, filters, fetchNews])

  // --- Filter handlers ---
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, keyword: e.target.value }))
    setPage(1)
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value === '全部' ? '' : e.target.value
    setFilters(prev => ({ ...prev, category: val }))
    setPage(1)
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, status: e.target.value }))
    setPage(1)
  }

  // --- Selection ---
  const allSelected = news.length > 0 && selectedIds.length === news.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < news.length

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(news.map(n => n.id))
    }
  }

  const toggleSelectOne = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // --- CRUD ---
  const handleCreate = () => {
    setEditingNews(null)
    setModalOpen(true)
  }

  const handleEdit = (item: News) => {
    setEditingNews(item)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setEditingNews(null)
  }

  const handleModalSuccess = () => {
    fetchNews(page, filters)
  }

  const handleDeleteClick = (id: number) => {
    setDeleteTarget(id)
  }

  const handleDeleteConfirm = async () => {
    if (deleteTarget === null) return
    setDeleteLoading(true)
    try {
      await adminApi.news.delete(deleteTarget)
      showToast('删除成功', 'success')
      setDeleteTarget(null)
      fetchNews(page, filters)
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
  const handleBatchDelete = () => {
    setBatchConfirm('delete')
  }

  const handleBatchPublish = () => {
    setBatchConfirm('publish')
  }

  const handleBatchConfirm = async () => {
    if (!batchConfirm || selectedIds.length === 0) return
    setBatchLoading(true)
    try {
      await adminApi.news.batchOperation({ action: batchConfirm, ids: selectedIds })
      showToast(batchConfirm === 'delete' ? '批量删除成功' : '批量发布成功', 'success')
      setBatchConfirm(null)
      setSelectedIds([])
      fetchNews(page, filters)
    } catch {
      showToast(batchConfirm === 'delete' ? '批量删除失败，请重试' : '批量发布失败，请重试')
    } finally {
      setBatchLoading(false)
    }
  }

  const handleBatchCancel = () => {
    setBatchConfirm(null)
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
        <h2 className="text-2xl font-bold text-gray-800">新闻管理</h2>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新建新闻
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="搜索标题..."
              value={filters.keyword}
              onChange={handleKeywordChange}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category filter */}
        <select
          value={filters.category || '全部'}
          onChange={handleCategoryChange}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {CATEGORY_OPTIONS.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filters.status}
          onChange={handleStatusChange}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
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
            onClick={handleBatchPublish}
            disabled={batchLoading}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            批量发布
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
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : news.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">暂无新闻数据</p>
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
                  <th className="px-4 py-3 text-left font-medium text-gray-600">标题</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">分类</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">状态</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">发布时间</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600 whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {news.map(item => {
                  const statusInfo = STATUS_LABELS[item.status ?? ''] ?? { label: item.status ?? '—', className: 'bg-gray-100 text-gray-600' }
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelectOne(item.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          aria-label={`选择 ${item.title}`}
                        />
                      </td>

                      {/* Title */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800 line-clamp-1 max-w-xs" title={item.title}>
                          {item.title}
                        </div>
                        {item.summary && (
                          <div className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-xs">
                            {item.summary}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                        {item.category ?? '—'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Published at */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {formatDate(item.published_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-md transition-colors mr-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          编辑
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

      {/* News Form Modal */}
      <NewsFormModal
        open={modalOpen}
        news={editingNews}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />

      {/* Single Delete Confirm Modal */}
      <ConfirmModal
        open={deleteTarget !== null}
        title="确认删除"
        message="确定要删除这条新闻吗？此操作不可撤销。"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleteLoading}
      />

      {/* Batch Delete Confirm Modal */}
      <ConfirmModal
        open={batchConfirm === 'delete'}
        title="批量删除"
        message={`确定要删除选中的 ${selectedIds.length} 条新闻吗？此操作不可撤销。`}
        onConfirm={handleBatchConfirm}
        onCancel={handleBatchCancel}
        loading={batchLoading}
      />

      {/* Batch Publish Confirm Modal */}
      <ConfirmModal
        open={batchConfirm === 'publish'}
        title="批量发布"
        message={`确定要发布选中的 ${selectedIds.length} 条新闻吗？`}
        onConfirm={handleBatchConfirm}
        onCancel={handleBatchCancel}
        loading={batchLoading}
      />
    </div>
  )
}

export default NewsList
