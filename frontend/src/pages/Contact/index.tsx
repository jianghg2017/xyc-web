import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/solid'
import { settingsAPI } from '../../api/public'
import { contactApi } from '../../api/modules'
import type { ContactForm as ContactFormType } from '../../types'

// ==================== Validation ====================

export interface ContactFormErrors {
  name?: string
  email?: string
  phone?: string
  company?: string
  type?: string
  message?: string
}

/**
 * Validates a contact form submission.
 * Required fields: name, email (with format check), message.
 * Returns a per-field error map; empty object means valid.
 */
export function validateContactForm(
  data: Partial<ContactFormType>
): ContactFormErrors {
  const errors: ContactFormErrors = {}

  if (!data.name || data.name.trim() === '') {
    errors.name = '请输入姓名'
  }

  if (!data.email || data.email.trim() === '') {
    errors.email = '请输入邮箱'
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email.trim())) {
      errors.email = '请输入有效的邮箱地址'
    }
  }

  if (!data.message || data.message.trim() === '') {
    errors.message = '请输入咨询内容'
  }

  return errors
}

// ==================== Contact Info Types ====================

interface ContactSettings {
  address: string
  phone: string
  email: string
  hours: string
}

const DEFAULT_CONTACT_SETTINGS: ContactSettings = {
  address: '北京市朝阳区 xxx 路 xxx 号',
  phone: '400-xxx-xxxx',
  email: 'info@winicssec.com',
  hours: '周一至周五 9:00-18:00',
}

// ==================== Form State ====================

interface FormData {
  name: string
  email: string
  phone: string
  company: string
  type: string
  message: string
}

const EMPTY_FORM: FormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  type: '',
  message: '',
}

// ==================== Component ====================

function Contact() {
  const [contactSettings, setContactSettings] = useState<ContactSettings>(DEFAULT_CONTACT_SETTINGS)
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<ContactFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null)
  const [submitErrorMsg, setSubmitErrorMsg] = useState<string>('')

  // Load contact settings on mount
  useEffect(() => {
    settingsAPI.get('contact').then((res) => {
      const items: Array<{ key: string; value: string; category: string }> =
        res.data?.data ?? []

      const parsed: Partial<ContactSettings> = {}

      items.forEach((item) => {
        const key = item.key?.toLowerCase() ?? ''
        if (key.includes('address')) parsed.address = item.value
        else if (key.includes('phone')) parsed.phone = item.value
        else if (key.includes('email')) parsed.email = item.value
        else if (key.includes('hour') || key.includes('time') || key.includes('working')) {
          parsed.hours = item.value
        }
      })

      setContactSettings((prev) => ({ ...prev, ...parsed }))
    }).catch(() => {
      // Fall back to defaults silently
    })
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear field error on change
    if (errors[name as keyof ContactFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateContactForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)
    setSubmitStatus(null)
    setSubmitErrorMsg('')

    try {
      const payload: ContactFormType = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        company: formData.company.trim() || undefined,
        type: formData.type,
        message: formData.message.trim(),
      }
      await contactApi.submit(payload)
      setSubmitStatus('success')
      setFormData(EMPTY_FORM)
      setErrors({})
      setTimeout(() => setSubmitStatus(null), 5000)
    } catch (error: any) {
      const reason =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        '请稍后重试'
      setSubmitErrorMsg(reason)
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus(null), 5000)
    } finally {
      setSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: PhoneIcon,
      title: '电话咨询',
      content: contactSettings.phone,
      subtitle: '工作时间：9:00 - 18:00',
    },
    {
      icon: EnvelopeIcon,
      title: '邮箱联系',
      content: contactSettings.email,
      subtitle: '我们会在 24 小时内回复',
    },
    {
      icon: MapPinIcon,
      title: '公司地址',
      content: contactSettings.address,
      subtitle: '欢迎来访',
    },
    {
      icon: ClockIcon,
      title: '工作时间',
      content: contactSettings.hours,
      subtitle: '节假日除外',
    },
  ]

  const inquiryTypes = [
    '产品咨询',
    '解决方案',
    '技术支持',
    '商务合作',
    '其他问题',
  ]

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="hero-bg py-24 text-white relative">
        <div className="texture-overlay" />
        <div className="geo-decoration w-64 h-64 -top-10 -right-10 animate-pulse-slow" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="gold-accent-line mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">联系我们</h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto font-light">
            我们期待与您的沟通，为您提供专业的工业网络安全解决方案
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold mb-6">联系方式</h2>
              <div className="space-y-6">
                {contactInfo.map((item) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <item.icon className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-gray-700">{item.content}</p>
                      <p className="text-gray-500 text-sm">{item.subtitle}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Social Media */}
              <div className="mt-8">
                <h3 className="font-semibold mb-4">关注我们</h3>
                <div className="flex space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-primary-100 cursor-pointer transition-colors">
                    微信
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-primary-100 cursor-pointer transition-colors">
                    微博
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-primary-100 cursor-pointer transition-colors">
                    LinkedIn
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">在线留言</h2>
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      姓名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="请输入您的姓名"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      邮箱 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="请输入您的邮箱"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      电话
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="请输入您的电话"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      公司
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="请输入您的公司"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    咨询类型
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.type ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">请选择咨询类型</option>
                    {inquiryTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    咨询内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.message ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请详细描述您的需求..."
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                  )}
                </div>

                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"
                  >
                    提交成功！我们会尽快与您联系。
                  </motion.div>
                )}

                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
                  >
                    提交失败：{submitErrorMsg || '请稍后重试'}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full bg-primary-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-700'
                  }`}
                >
                  {submitting && (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
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
                  )}
                  {submitting ? '提交中...' : '提交'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
