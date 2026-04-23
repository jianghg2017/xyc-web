/**
 * API 统一导出
 * 所有 API 接口统一从这里导入
 */

import apiClient from './client'
import { newsApi, productsApi, contactApi } from './modules'
import { adminApi } from './admin'
import * as publicAPI from './public'

// 合并所有 API
export const API = {
  // 公共数据 API
  features: publicAPI.featuresAPI,
  stats: publicAPI.statsAPI,
  timeline: publicAPI.timelineAPI,
  values: publicAPI.valuesAPI,
  settings: publicAPI.settingsAPI,
  banners: publicAPI.bannersAPI,
  images: publicAPI.imagesAPI,
  
  // 业务 API
  news: newsApi,
  products: productsApi,
  contact: contactApi,
  admin: adminApi,
  
  // 底层客户端
  client: apiClient,
}

// 导出各个 API 模块，保持向后兼容
export { newsApi as newsAPI }
export { newsApi }
export { productsApi as productsAPI }
export { productsApi }
export { contactApi as contactAPI }
export { contactApi }
export { adminApi as adminAPI }
export { adminApi }
export * from './public'

// 导出客户端
export { apiClient }

export default API
