import React, { useState, useEffect, useRef } from 'react'
import apiClient from '@/api/client'
import { adminApi } from '@/api/admin'
import type { Product, ProductCreateRequest, ProductUpdateRequest, ProductFeature } from '@/types'

interface ProductFormModalProps {
  open: boolean
  product?: Product | null
  onClose: () => void
  onSuccess: () => void
}

const PRODUCT_CATEGORIES = ['软件产品', '硬件产品', '解决方案'] as const

interface SpecEntry {
  key: string
  value: string
}

const initialFormData = {
  name: '',
  category: '软件产品' as string,
  description: '',
  cover_image: '',
  content: '',
  status: 'draft' as 'draft' | 'published' | 'hidden',
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ open, product, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(initialFormData)
  const [features, setFeatures] = useState<ProductFeature[]>([])
  const [specs, setSpecs] = useState<SpecEntry[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditMode = Boolean(product)

  // Populate form when editing
  useEffect(() => {
    if (open) {
      if (product) {
        setFormData({
          name: product.name || '',
          category: product.category || '软件产品',
          description: product.description || '',
          cover_image: product.cover_image || '',
          content: product.content || '',
          status: (product.status as 'draft' | 'published' | 'hidden') || 'draft',
        })
        setFeatures(
          Array.isArray(product.features) && product.features.length > 0
            ? product.features.map(f => ({ title: f.title || '', description: f.description || '' }))
            : []
        )
        // Convert specs Record to SpecEntry array
        const specsRecord = product.specs || {}
        setSpecs(
          Object.entries(specsRecord).map(([key, value]) => ({ key, value: String(value) }))
        )
      } else {
        setFormData(initialFormData)
        setFeatures([])
        setSpecs([])
      }
      setErrors({})
      setUploadError('')
    }
  }, [open, product])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      newErrors.name = '产品名称为必填项'
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

      const response = await apiClient.post('/admin/upload?type=products', formDataUpload, {
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
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // ==================== Features ====================

  const addFeature = () => {
    setFeatures(prev => [...prev, { title: '', description: '' }])
  }

  const removeFeature = (index: number) => {
    setFeatures(prev => prev.filter((_, i) => i !== index))
  }

  const updateFeature = (index: number, field: 'title' | 'description', value: string) => {
    setFeatures(prev =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    )
  }

  // ==================== Specs ====================

  const addSpec = () => {
    setSpecs(prev => [...prev, { key: '', value: '' }])
  }

  const removeSpec = (index: number) => {
    setSpecs(prev => prev.filter((_, i) => i !== index))
  }

  const updateSpec = (index: number, field: 'key' | 'value', value: string) => {
    setSpecs(prev =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  // ==================== Submit ====================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      // Convert features (filter out empty entries)
      const featuresData: ProductFeature[] = features
        .filter(f => f.title.trim() || f.description.trim())
        .map(f => ({ title: f.title.trim(), description: f.description.trim() }))

      // Convert specs array to Record (filter out entries with empty keys)
      const specsData: Record<string, string> = {}
      specs
        .filter(s => s.key.trim())
        .forEach(s => {
          specsData[s.key.trim()] = s.value
        })

      if (isEditMode && product) {
        const updateData: ProductUpdateRequest = {
          id: product.id,
          name: formData.name,
          category: formData.category,
          description: formData.description || undefined,
          cover_image: formData.cover_image || undefined,
          content: formData.content || undefined,
          features: featuresData.length > 0 ? featuresData : undefined,
          specs: Object.keys(specsData).length > 0 ? specsData : undefined,
          status: formData.status,
        }
        await adminApi.products.update(product.id, updateData)
      } else {
        const createData: ProductCreateRequest = {
          name: formData.name,
          category: formData.category,
          description: formData.description || undefined,
          cover_image: formData.cover_image || undefined,
          content: formData.content || undefined,
          features: featuresData.length > 0 ? featuresData : undefined,
          specs: Object.keys(specsData).length > 0 ? specsData : undefined,
          status: formData.status,
        }
        await adminApi.products.create(createData)
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
            {isEditMode ? '编辑产品' : '新建产品'}
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

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              产品名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="请输入产品名称"
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
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
              {PRODUCT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">简短描述</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="请输入产品简短描述（用于列表页展示）"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">详细介绍</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="请输入产品详细介绍（支持 HTML）"
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
            />
            <p className="mt-1 text-xs text-gray-400">支持 HTML 标签，如 &lt;p&gt;、&lt;strong&gt;、&lt;ul&gt; 等</p>
          </div>

          {/* Features */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">功能特性</label>
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center gap-1 px-3 py-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                添加特性
              </button>
            </div>
            {features.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">暂无功能特性，点击"添加特性"按钮添加</p>
            ) : (
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={feature.title}
                        onChange={e => updateFeature(index, 'title', e.target.value)}
                        placeholder="特性标题"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={feature.description}
                        onChange={e => updateFeature(index, 'description', e.target.value)}
                        placeholder="特性描述"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="self-start p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      aria-label="删除特性"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Specs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">规格参数</label>
              <button
                type="button"
                onClick={addSpec}
                className="flex items-center gap-1 px-3 py-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                添加参数
              </button>
            </div>
            {specs.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">暂无规格参数，点击"添加参数"按钮添加</p>
            ) : (
              <div className="space-y-2">
                {specs.map((spec, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={e => updateSpec(index, 'key', e.target.value)}
                      placeholder="参数名称（如：处理器）"
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-400 text-sm">:</span>
                    <input
                      type="text"
                      value={spec.value}
                      onChange={e => updateSpec(index, 'value', e.target.value)}
                      placeholder="参数值（如：Intel i7）"
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpec(index)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      aria-label="删除参数"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              <option value="hidden">已隐藏</option>
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
            {submitting ? '保存中...' : isEditMode ? '保存修改' : '创建产品'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductFormModal
