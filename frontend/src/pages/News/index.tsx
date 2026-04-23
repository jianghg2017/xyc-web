import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarIcon } from '@heroicons/react/24/solid'
import { newsApi } from '@/api/modules'
import Pagination from '@/components/common/Pagination'
import SkeletonCard from '@/components/common/SkeletonCard'
import { getImageUrl } from '@/utils/image'
import type { News, Pagination as PaginationType } from '@/types'

const categories = ['全部', '公司新闻', '行业资讯']

function NewsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [news, setNews] = useState<News[]>([])
  const [pagination, setPagination] = useState<PaginationType | null>(null)
  const [category, setCategory] = useState(() => searchParams.get('category') || '')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // Sync category from URL when navigating via submenu links
  useEffect(() => {
    const urlCategory = searchParams.get('category') || ''
    setCategory(urlCategory)
    setPage(1)
  }, [searchParams.get('category')])

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      try {
        const response = await newsApi.getList(page, 9, category || undefined)
        setNews(response.data.data || [])
        setPagination(response.data.pagination || null)
      } catch (err) {
        console.error('Failed to fetch news:', err)
        setNews([])
        setPagination(null)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [page, category])

  const handleCategoryChange = (cat: string) => {
    const newCategory = cat === '全部' ? '' : cat
    setCategory(newCategory)
    setPage(1)
    if (newCategory) {
      setSearchParams({ category: newCategory })
    } else {
      setSearchParams({})
    }
  }

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="hero-bg py-24 text-white relative">
        <div className="texture-overlay" />
        <div className="geo-decoration w-64 h-64 -top-10 -right-10 animate-pulse-slow" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="gold-accent-line mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">新闻资讯</h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto font-light">
            了解公司的最新动态和行业资讯
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isActive = cat === '全部' ? category === '' : category === cat
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* News List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <SkeletonCard type="news" count={9} />
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg">暂无新闻资讯</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => navigate(`/news/${item.id}`)}
                >
                  {getImageUrl(item.cover_image) ? (
                    <img
                      src={getImageUrl(item.cover_image)!}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                      <span className="text-primary-300 text-sm">暂无图片</span>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      {item.category && (
                        <span className="text-sm text-accent-gold font-medium">
                          {item.category}
                        </span>
                      )}
                      {item.published_at && (
                        <div className="flex items-center text-gray-500 text-sm">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {new Date(item.published_at).toLocaleDateString('zh-CN')}
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 line-clamp-2 text-primary-600">
                      {item.title}
                    </h3>
                    {item.summary && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {item.summary}
                      </p>
                    )}
                    <div className="flex items-center text-accent-gold font-medium text-sm">
                      阅读更多
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination && pagination.pages > 1 && (
            <div className="mt-12">
              <Pagination
                currentPage={page}
                totalPages={pagination.pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default NewsPage
