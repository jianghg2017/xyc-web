/**
 * 公共数据 API
 * 用于获取首页、关于我们等页面的静态配置数据
 */
import apiClient from './client'

/**
 * 核心优势 API
 */
export const featuresAPI = {
  /**
   * 获取核心优势列表
   * @param status - 状态筛选 (active/inactive)
   */
  getList: (status?: string) =>
    apiClient.get('/features', { params: { status } }),
}

/**
 * 公司统计 API
 */
export const statsAPI = {
  /**
   * 获取公司统计数据
   */
  get: () => apiClient.get('/stats'),
}

/**
 * 发展历程 API
 */
export const timelineAPI = {
  /**
   * 获取公司发展历程
   */
  getList: () => apiClient.get('/timeline'),
}

/**
 * 核心价值观 API
 */
export const valuesAPI = {
  /**
   * 获取核心价值观
   */
  getList: () => apiClient.get('/values'),
}

/**
 * 网站设置 API
 */
export const settingsAPI = {
  /**
   * 获取网站全局设置
   * @param category - 分类筛选 (basic/contact/social/seo)
   */
  get: (category?: string) =>
    apiClient.get('/settings', { params: { category } }),
  
  /**
   * 获取单个设置项
   * @param key - 设置键名
   */
  getSetting: (key: string) =>
    apiClient.get(`/settings/${key}`),
}

/**
 * 轮播图 API
 */
export const bannersAPI = {
  /**
   * 获取轮播图列表
   * @param location - 展示位置 (home_hero 等)
   * @param status - 状态筛选 (active/inactive)
   */
  getList: (location?: string, status?: string) =>
    apiClient.get('/banners', { params: { location, status } }),
}

/**
 * 图片资源 API
 */
export const imagesAPI = {
  /**
   * 获取图片目录信息
   */
  getInfo: () => apiClient.get('/images/info'),
  
  /**
   * 构建图片完整 URL
   * @param imagePath - 图片相对路径 (如 products/product-1.jpg)
   */
  getImageUrl: (imagePath: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    return `${baseUrl}/images/${imagePath}`
  },
}

// 导出所有公共数据 API
export default {
  features: featuresAPI,
  stats: statsAPI,
  timeline: timelineAPI,
  values: valuesAPI,
  settings: settingsAPI,
  banners: bannersAPI,
  images: imagesAPI,
}
