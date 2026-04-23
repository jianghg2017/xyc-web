import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productsApi } from '@/api/modules'
import SkeletonCard from '@/components/common/SkeletonCard'
import type { Product } from '@/types'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
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

    productsApi
      .getDetail(numericId)
      .then((res) => {
        const data = res.data?.data
        if (!data) {
          setNotFound(true)
        } else {
          setProduct(data)
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SkeletonCard type="product" count={1} />
        <div className="mt-8 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse" />
        </div>
      </div>
    )
  }

  // 404 / not found state
  if (notFound || !product) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
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
        <h1 className="text-2xl font-bold text-gray-900 mb-3">产品不存在</h1>
        <p className="text-gray-500 mb-8">您访问的产品不存在或已被删除。</p>
        <Link
          to="/products"
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
          返回产品列表
        </Link>
      </div>
    )
  }

  const backendBase =
    import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'

  const coverImageUrl = product.cover_image
    ? product.cover_image.startsWith('http')
      ? product.cover_image
      : `${backendBase}${product.cover_image}`
    : null

  const hasFeatures = Array.isArray(product.features) && product.features.length > 0
  const hasSpecs =
    product.specs &&
    typeof product.specs === 'object' &&
    Object.keys(product.specs).length > 0

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500" aria-label="面包屑导航">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              首页
            </Link>
            <span aria-hidden="true">/</span>
            <Link to="/products" className="hover:text-blue-600 transition-colors">
              产品中心
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header section: cover image + name/category/description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          {/* Cover image */}
          <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3] flex items-center justify-center">
            {coverImageUrl ? (
              <img
                src={coverImageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <svg
                  className="w-16 h-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm">暂无图片</span>
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col justify-center">
            {product.category && (
              <span className="inline-block mb-3 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full w-fit">
                {product.category}
              </span>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>
            {product.description && (
              <p className="text-gray-600 text-base leading-relaxed">{product.description}</p>
            )}
            <div className="mt-6">
              <Link
                to="/products"
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
                返回产品列表
              </Link>
            </div>
          </div>
        </div>

        {/* Detailed content */}
        {product.content && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              产品介绍
            </h2>
            <div
              className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.content }}
            />
          </section>
        )}

        {/* Features list */}
        {hasFeatures && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              功能特性
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {product.features!.map((feature, index) => (
                <li
                  key={index}
                  className="flex gap-4 p-5 rounded-xl bg-blue-50 border border-blue-100"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    {feature.description && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Specs table */}
        {hasSpecs && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              规格参数
            </h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-6 py-3 font-semibold text-gray-700 w-1/3 border-b border-gray-200">
                      参数名称
                    </th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-700 border-b border-gray-200">
                      参数值
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(product.specs!).map(([key, value], index) => (
                    <tr
                      key={key}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="px-6 py-3 font-medium text-gray-700 border-b border-gray-100">
                        {key}
                      </td>
                      <td className="px-6 py-3 text-gray-600 border-b border-gray-100">
                        {String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
