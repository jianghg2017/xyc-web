import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ShieldCheckIcon, BoltIcon, GlobeAltIcon } from '@heroicons/react/24/solid'
import { API } from '@/api'
import { getImageUrl } from '@/utils/image'

// 图标映射
const iconMap: Record<string, React.FC<any>> = {
  ShieldCheckIcon,
  BoltIcon,
  GlobeAltIcon,
}

function Home() {
  const [features, setFeatures] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [news, setNews] = useState<any[]>([])
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      // 并行请求所有数据
      const [featuresRes, productsRes, newsRes, bannersRes] = await Promise.all([
        API.features.getList('active'),
        API.products.getList(1, 3),
        API.news.getList(1, 3),
        API.banners.getList('home_hero', 'active'),
      ])

      setFeatures(featuresRes.data.data || [])
      setProducts(productsRes.data.data || [])
      setNews(newsRes.data.data || [])
      setBanners(bannersRes.data.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取图标组件
  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || ShieldCheckIcon
  }

  return (
    <div>
      {/* Hero Banner - 动态轮播图 */}
      {banners.length > 0 ? (
        banners.map((banner, index) => (
          <section
            key={banner.id}
            className="relative h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700"
          >
            <div className="absolute inset-0 bg-black/30" />
            {banner.image_url && (
              <img
                src={banner.image_url}
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
            )}
            <div className="relative z-10 text-center text-white px-4">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="text-5xl md:text-6xl font-bold mb-6"
              >
                {banner.title}
              </motion.h1>
              {banner.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 + index * 0.2 }}
                  className="text-xl md:text-2xl mb-8 text-white/90"
                >
                  {banner.subtitle}
                </motion.p>
              )}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 + index * 0.2 }}
                className="flex justify-center space-x-4"
              >
                <Link
                  to="/products"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
                >
                  了解产品
                </Link>
                <Link
                  to="/contact"
                  className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
                >
                  联系我们
                </Link>
              </motion.div>
            </div>
          </section>
        ))
      ) : (
        // 默认 Hero Banner
        <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 text-center text-white px-4">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold mb-6"
            >
              守护工业网络安全
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl mb-8 text-white/90"
            >
              专业、可靠、创新的工业网络安全解决方案提供商
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex justify-center space-x-4"
            >
              <Link
                to="/products"
                className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                了解产品
              </Link>
              <Link
                to="/contact"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                联系我们
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Core Features - 动态数据 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">核心优势</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              我们致力于为客户提供最优质的工业网络安全产品和服务
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              // 加载状态
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="bg-white p-8 rounded-xl shadow-lg animate-pulse"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-full mb-4" />
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                ))
            ) : features.length > 0 ? (
              // 动态数据
              features.map((feature, index) => {
                const IconComponent = getIconComponent(feature.icon)
                return (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <IconComponent className="w-12 h-12 text-primary-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </motion.div>
                )
              })
            ) : (
              // 空状态
              <div className="col-span-3 text-center text-gray-500">
                暂无数据
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Products Preview - 动态数据 */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">产品中心</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              丰富的产品矩阵，满足不同场景的安全需求
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              // 加载状态
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse"
                  >
                    <div className="w-full h-48 bg-gray-200" />
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
                      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))
            ) : products.length > 0 ? (
              // 动态数据
              products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <img
                    src={getImageUrl(product.cover_image) || '/images/products/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <span className="text-sm text-primary-500 font-medium">
                      {product.category}
                    </span>
                    <h3 className="text-xl font-semibold mt-2 mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <Link
                      to={`/products/${product.id}`}
                      className="text-primary-500 hover:text-primary-600 font-medium"
                    >
                      查看详情 →
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              // 空状态
              <div className="col-span-3 text-center text-gray-500">
                暂无产品数据
              </div>
            )}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              查看全部产品
            </Link>
          </div>
        </div>
      </section>

      {/* News Preview - 动态数据 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">新闻动态</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              了解新益策的最新动态和行业资讯
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              // 加载状态
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-lg animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                ))
            ) : news.length > 0 ? (
              // 动态数据
              news.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-xl shadow-lg"
                >
                  <span className="text-sm text-gray-500">
                    {new Date(item.published_at).toLocaleDateString('zh-CN')}
                  </span>
                  <h3 className="text-lg font-semibold mt-2 mb-3 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {item.summary || item.excerpt}
                  </p>
                  <Link
                    to={`/news/${item.id}`}
                    className="text-primary-500 hover:text-primary-600 font-medium mt-4 inline-block"
                  >
                    阅读更多 →
                  </Link>
                </motion.div>
              ))
            ) : (
              // 空状态
              <div className="col-span-3 text-center text-gray-500">
                暂无新闻数据
              </div>
            )}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/news"
              className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              查看全部新闻
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
