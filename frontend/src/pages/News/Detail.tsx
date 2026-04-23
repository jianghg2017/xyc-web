import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { newsApi } from '@/api/modules'
import SkeletonCard from '@/components/common/SkeletonCard'
import type { News } from '@/types'

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>()
  const [news, setNews] = useState<News | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) {
      setNotFound(true)
      setLoading(false)
      return
    }

    const numericId = Number(id)
    if (isNaN(numericId)) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setLoading(true)
    setNotFound(false)

    newsApi
      .getDetail(numericId)
      .then((res) => {
        const data = res.data?.data
        if (!data) {
          setNotFound(true)
        } else {
          setNews(data)
        }
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setNotFound(true)
        } else {
          setNotFound(true)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SkeletonCard type="news" count={1} />
        <div className="mt-8 space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse" />
        </div>
      </div>
    )
  }

  // 404 / not found state
  if (notFound || !news) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
          <svg
            className="w-10 h-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">新闻不存在</h1>
        <p className="text-gray-500 mb-8">您访问的新闻不存在或已被删除。</p>
        <Link
          to="/news"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          返回新闻列表
        </Link>
      </div>
    )
  }

  const backendBase =
    import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'

  const coverImageUrl = news.cover_image
    ? news.cover_image.startsWith('http')
      ? news.cover_image
      : `${backendBase}${news.cover_image}`
    : null

  const formattedDate = news.published_at
    ? new Date(news.published_at).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500" aria-label="面包屑导航">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              首页
            </Link>
            <span aria-hidden="true">/</span>
            <Link to="/news" className="hover:text-blue-600 transition-colors">
              新闻资讯
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">{news.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Article header */}
        <header className="mb-8">
          {/* Category badge */}
          {news.category && (
            <span className="inline-block mb-4 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full">
              {news.category}
            </span>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
            {news.title}
          </h1>

          {/* Meta: date + views */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {formattedDate && (
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formattedDate}
              </span>
            )}
            {typeof news.views === 'number' && (
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
                {news.views} 次阅读
              </span>
            )}
          </div>
        </header>

        {/* Cover image */}
        {coverImageUrl && (
          <div className="mb-8 rounded-2xl overflow-hidden bg-gray-100">
            <img
              src={coverImageUrl}
              alt={news.title}
              className="w-full object-cover max-h-96"
            />
          </div>
        )}

        {/* Summary */}
        {news.summary && (
          <div className="mb-8 p-5 bg-blue-50 border-l-4 border-blue-400 rounded-r-xl">
            <p className="text-gray-700 leading-relaxed italic">{news.summary}</p>
          </div>
        )}

        {/* Article body */}
        {news.content && (
          <article
            className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        )}

        {/* Footer: back link */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            返回新闻列表
          </Link>
        </div>
      </div>
    </div>
  )
}
