import React, { useState, useEffect, useRef } from 'react'
import apiClient from '@/api/client'
import { adminApi } from '@/api/admin'
import type { News, NewsCreateRequest, NewsUpdateRequest } from '@/types'

interface NewsFormModalProps {
  open: boolean
  news?: News | null
  onClose: () => void
  onSuccess: () => void
}

const NEWS_CATEGORIES = ['公司新闻', '产品动态', '行业活动', '技术文章'] as const

const initialFormData = {
  title: '',
  category: '公司新闻' as string,
  summary: '',
  cover_image: '',
  content: '',
  tags: '',
  status: 'draft' as 'draft' | 'published',
}

const NewsFormModal: React.FC<NewsFormModalProps> = ({ open, news, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditMode = Boolean(news)

  // Populate form when editing
  useEffect(() => {
    if (open) {
      if (news) {
        setFormData({
          title: news.title || '',
          category: news.category || '公司新闻',
          summary: news.summary || '',
          cover_image: news.cover_image || '',
          content: news.content || '',
          tags: Array.isArray(news.tags) ? news.tags.join(', ') : (news.tags || ''),
          status: news.status === 'published' ? 'published' : 'draft',
        })
      } else {
        setFormData(initialFormData)
      }
      setErrors({})
      setUploadError('')
    }
  }, [open, news])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) {
      newErrors.title = '标题为必填项'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError('')

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const response = await apiClient.post('/admin/upload?type=news', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.data?.data?.url) {
        setFormData(prev => ({ ...prev, cover_image: response.data.data.url }))
      } else {
        setUploadError('上传失败，请重试')
      }
    } catch {
      setUploadError('上传失败，请检查文件格式和大小（最大 5MB）')
    } finally {
      setUploading(false)
      // Reset file input so the same file can be re-selected if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      // Parse tags from comma-separated string
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        : []

      if (isEditMode && news) {
        const updateData: NewsUpdateRequest = {
          id: news.id,
          title: formData.title,
          category: formData.category,
          summary: formData.summary || undefined,
          cover_image: formData.cover_image || undefined,
          content: formData.content,
          tags: tagsArray,
          status: formData.status,
        }
        await adminApi.news.update(news.id, updateData)
      } else {
        const createData: NewsCreateRequest = {
          title: formData.title,
          category: formData.category,
          summary: formData.summary || undefined,
          cover_image: formData.cover_image || undefined,
          content: formData.content,
          tags: tagsArray,
          status: formData.status,
        }
        await adminApi.news.create(createData)
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      const message = err?.response?.data?.error || '操作失败，请重试'
      setErrors(prev => ({ ...prev, submit: message }))
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditMode ? '编辑新闻' : '新建新闻'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="关闭"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Submit error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="请输入新闻标题"
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {NEWS_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">摘要</label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              placeholder="请输入新闻摘要（可选）"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">封面图</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="cover_image"
                value={formData.cover_image}
                onChange={handleChange}
                placeholder="图片 URL 或点击上传"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {uploading ? '上传中...' : '上传图片'}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {uploadError && (
              <p className="mt-1 text-xs text-red-500">{uploadError}</p>
            )}
            {formData.cover_image && (
              <div className="mt-2">
                <img
                  src={
                    formData.cover_image.startsWith('/')
                      ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${formData.cover_image}`
                      : formData.cover_image
                  }
                  alt="封面预览"
                  className="h-24 w-auto rounded border border-gray-200 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">正文内容</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="请输入新闻正文内容（支持 HTML）"
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
            />
            <p className="mt-1 text-xs text-gray-400">支持 HTML 标签，如 &lt;p&gt;、&lt;strong&gt;、&lt;ul&gt; 等</p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="多个标签用逗号分隔，如：技术, 创新, 管理"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">多个标签请用英文逗号分隔</p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
            </select>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            type="submit"
            form=""
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 12 0 12 0v4a8 8 0 00-8 8H4z" />
              </svg>
            )}
            {submitting ? '保存中...' : isEditMode ? '保存修改' : '创建新闻'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewsFormModal
