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

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || ShieldCheckIcon
  }

  return (
    <div>
      {/* Hero Banner */}
      {banners.length > 0 ? (
        banners.map((banner, index) => (
          <section
            key={banner.id}
            className="hero-bg relative min-h-screen flex items-center justify-center"
          >
            {/* Texture overlay */}
            <div className="texture-overlay" />

            {/* Geometric decorations */}
            <div className="geo-decoration w-96 h-96 -top-20 -right-20 animate-pulse-slow" />
            <div className="geo-decoration w-64 h-64 bottom-20 -left-10 animate-float" />
            <div className="geo-decoration w-40 h-40 top-1/3 right-1/4 animate-float-delayed" />

            {/* Accent glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-teal/5 rounded-full blur-3xl pointer-events-none" />

            {/* Background image if available */}
            {banner.image_url && (
              <img
                src={banner.image_url}
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover opacity-20"
              />
            )}

            <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
              {/* Gold accent line */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 60 }}
                transition={{ duration: 0.8 }}
                className="gold-accent-line mx-auto mb-8"
              />

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="text-5xl md:text-7xl font-black mb-6 tracking-tight"
              >
                {banner.title}
              </motion.h1>
              {banner.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 + index * 0.2 }}
                  className="text-xl md:text-2xl mb-10 text-white/80 font-light max-w-3xl mx-auto leading-relaxed"
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
                  to="/solutions"
                  className="bg-accent-gold hover:bg-accent-gold-dark text-white px-8 py-3.5 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  了解方案
                </Link>
                <Link
                  to="/contact"
                  className="bg-transparent border-2 border-white/40 hover:border-accent-gold hover:bg-accent-gold/10 text-white px-8 py-3.5 rounded-lg text-lg font-semibold transition-all duration-300"
                >
                  免费咨询
                </Link>
              </motion.div>
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
          </section>
        ))
      ) : (
        /* Default Hero Banner */
        <section className="hero-bg relative min-h-screen flex items-center justify-center">
          {/* Texture overlay */}
          <div className="texture-overlay" />

          {/* Geometric decorations */}
          <div className="geo-decoration w-96 h-96 -top-20 -right-20 animate-pulse-slow" />
          <div className="geo-decoration w-64 h-64 bottom-20 -left-10 animate-float" />
          <div className="geo-decoration w-40 h-40 top-1/3 right-1/4 animate-float-delayed" />

          {/* Accent glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-teal/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
            {/* Gold accent line */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 60 }}
              transition={{ duration: 0.8 }}
              className="gold-accent-line mx-auto mb-8"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-accent-gold text-sm md:text-base font-medium tracking-widest uppercase mb-4"
            >
              智能制造网络安全咨询专家
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight"
            >
              守护工业网络安全
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl mb-10 text-white/75 font-light max-w-3xl mx-auto leading-relaxed"
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
                to="/solutions"
                className="bg-accent-gold hover:bg-accent-gold-dark text-white px-8 py-3.5 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                了解方案
              </Link>
              <Link
                to="/contact"
                className="bg-transparent border-2 border-white/40 hover:border-accent-gold hover:bg-accent-gold/10 text-white px-8 py-3.5 rounded-lg text-lg font-semibold transition-all duration-300"
              >
                免费咨询
              </Link>
            </motion.div>

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              {[
                { num: '500+', label: '服务企业' },
                { num: '1000+', label: '安全项目' },
                { num: '98%', label: '客户满意度' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-accent-gold mb-1">{stat.num}</div>
                  <div className="text-white/60 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
        </section>
      )}

      {/* Core Features */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-600 mb-4">核心优势</h2>
            <div className="section-divider mb-4" />
            <p className="text-gray-500 max-w-2xl mx-auto">
              我们致力于为客户提供最优质的工业网络安全产品和服务
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
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
              features.map((feature, index) => {
                const IconComponent = getIconComponent(feature.icon)
                return (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="card-premium bg-white p-8 rounded-xl shadow-md"
                  >
                    <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mb-5">
                      <IconComponent className="w-8 h-8 text-primary-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-primary-600 mb-3">{feature.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                  </motion.div>
                )
              })
            ) : (
              <div className="col-span-3 text-center text-gray-500">
                暂无数据
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-600 mb-4">产品中心</h2>
            <div className="section-divider mb-4" />
            <p className="text-gray-500 max-w-2xl mx-auto">
              丰富的产品矩阵，满足不同场景的安全需求
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
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
              products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card-premium bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={getImageUrl(product.cover_image) || '/images/products/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-sm text-accent-gold font-medium">
                      {product.category}
                    </span>
                    <h3 className="text-xl font-semibold mt-2 mb-2 text-primary-600">{product.name}</h3>
                    <p className="text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                    <Link
                      to={`/products/${product.id}`}
                      className="text-accent-gold hover:text-accent-gold-dark font-medium transition-colors"
                    >
                      查看详情 →
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-500">
                暂无产品数据
              </div>
            )}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              查看全部产品
            </Link>
          </div>
        </div>
      </section>

      {/* News Preview */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-600 mb-4">新闻动态</h2>
            <div className="section-divider mb-4" />
            <p className="text-gray-500 max-w-2xl mx-auto">
              了解新益策的最新动态和行业资讯
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
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
              news.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card-premium bg-white p-6 rounded-xl shadow-md"
                >
                  <span className="text-sm text-gray-400">
                    {new Date(item.published_at).toLocaleDateString('zh-CN')}
                  </span>
                  <h3 className="text-lg font-semibold mt-2 mb-3 text-primary-600 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">
                    {item.summary || item.excerpt}
                  </p>
                  <Link
                    to={`/news/${item.id}`}
                    className="text-accent-gold hover:text-accent-gold-dark font-medium mt-4 inline-block transition-colors"
                  >
                    阅读更多 →
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-500">
                暂无新闻数据
              </div>
            )}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/news"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              查看全部新闻
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-gradient py-20 text-white relative overflow-hidden">
        <div className="texture-overlay" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-teal/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">需要专业的安全咨询？</h2>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            我们的专家团队将为您量身定制最适合的安全方案
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/contact"
              className="bg-accent-gold hover:bg-accent-gold-dark text-white px-8 py-3.5 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              免费咨询
            </Link>
            <Link
              to="/about"
              className="bg-transparent border-2 border-white/30 hover:border-accent-gold hover:bg-accent-gold/10 text-white px-8 py-3.5 rounded-lg font-semibold transition-all duration-300"
            >
              了解我们
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
