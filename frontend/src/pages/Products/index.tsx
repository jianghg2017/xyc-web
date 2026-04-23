import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { productsApi } from '@/api/modules'
import Pagination from '@/components/common/Pagination'
import SkeletonCard from '@/components/common/SkeletonCard'
import { getImageUrl } from '@/utils/image'
import type { Product, Pagination as PaginationType } from '@/types'

const categories = ['全部', '软件产品', '硬件产品', '解决方案']

function Products() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<PaginationType | null>(null)
  const [category, setCategory] = useState(() => searchParams.get('category') || '')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // 当 URL 中的 category 参数变化时同步到 state（如从导航栏点击过来）
  useEffect(() => {
    const urlCategory = searchParams.get('category') || ''
    setCategory(urlCategory)
    setPage(1)
  }, [searchParams.get('category')])

  useEffect(() => {
    fetchProducts()
  }, [page, category])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productsApi.getList(page, 9, category || undefined)
      setProducts(response.data.data || [])
      setPagination(response.data.pagination || null)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setProducts([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }

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

  const handleCardClick = (id: number) => {
    navigate(`/products/${id}`)
  }

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-700 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">产品中心</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            丰富的产品矩阵，满足不同场景的工业网络安全需求
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
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <SkeletonCard type="product" count={9} />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">没有找到匹配的产品</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => handleCardClick(product.id)}
                >
                  {getImageUrl(product.cover_image) ? (
                    <img
                      src={getImageUrl(product.cover_image)!}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <span className="text-blue-400 text-4xl font-bold">
                        {product.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-primary-500 font-medium">
                        {product.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                      {product.description}
                    </p>
                    {product.features && product.features.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {product.features.slice(0, 3).map((feature) => (
                          <div
                            key={feature.title}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2 flex-shrink-0" />
                            {feature.title}
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg font-medium transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCardClick(product.id)
                      }}
                    >
                      查看详情
                    </button>
                  </div>
                </motion.div>
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

      {/* CTA Section */}
      <section className="py-20 bg-primary-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">需要定制化解决方案？</h2>
          <p className="text-xl text-white/90 mb-8">
            我们的专家团队将为您提供专业的咨询服务
          </p>
          <button
            className="bg-white text-primary-500 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
            onClick={() => navigate('/contact')}
          >
            联系我们
          </button>
        </div>
      </section>
    </div>
  )
}

export default Products
