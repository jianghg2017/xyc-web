import apiClient from './client'
import type { 
  LoginRequest, 
  LoginResponse, 
  Admin,
  News,
  NewsCreateRequest,
  NewsUpdateRequest,
  NewsListResponse,
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductListResponse,
  Contact,
  ContactUpdateRequest,
  ContactListResponse,
  DashboardResponse,
  BatchOperationRequest,
  BatchOperationResponse,
  ProductSortRequest
} from '@/types'

// 获取 Token
const getToken = (): string | null => {
  return localStorage.getItem('admin_token')
}

// API 基础配置
const getAuthHeaders = () => {
  const token = getToken()
  return {
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  }
}

// 管理员 API
export const adminApi = {
  // ==================== 认证 ====================
  
  // 登录
  login: (data: LoginRequest) => 
    apiClient.post<LoginResponse>('/admin/login', data),
  
  // 登出
  logout: () => 
    apiClient.post('/admin/logout', {}, getAuthHeaders()),
  
  // 获取管理员信息
  getProfile: () => 
    apiClient.get<{ data: Admin }>('/admin/profile', getAuthHeaders()),

  // ==================== Dashboard ====================
  
  // 获取概览数据
  getDashboard: () => 
    apiClient.get<DashboardResponse>('/admin/dashboard', getAuthHeaders()),
  
  // 获取系统信息
  getSystemInfo: () => 
    apiClient.get('/admin/system-info', getAuthHeaders()),

  // ==================== 新闻管理 ====================
  
  news: {
    // 获取新闻列表
    getList: (params?: {
      page?: number
      limit?: number
      category?: string
      status?: string
      keyword?: string
      sortBy?: string
      sortOrder?: string
    }) => 
      apiClient.get<NewsListResponse>('/admin/news', {
        ...getAuthHeaders(),
        params
      }),
    
    // 获取新闻详情
    getById: (id: number) => 
      apiClient.get<{ data: News }>(`/admin/news/${id}`, getAuthHeaders()),
    
    // 创建新闻
    create: (data: NewsCreateRequest) => 
      apiClient.post('/admin/news', data, getAuthHeaders()),
    
    // 更新新闻
    update: (id: number, data: NewsUpdateRequest) => 
      apiClient.put(`/admin/news/${id}`, data, getAuthHeaders()),
    
    // 删除新闻
    delete: (id: number) => 
      apiClient.delete(`/admin/news/${id}`, getAuthHeaders()),
    
    // 批量操作
    batchOperation: (data: BatchOperationRequest) => 
      apiClient.post<BatchOperationResponse>('/admin/news/batch', data, getAuthHeaders()),
  },

  // ==================== 产品管理 ====================
  
  products: {
    // 获取产品列表
    getList: (params?: {
      page?: number
      limit?: number
      category?: string
      status?: string
      keyword?: string
      sortBy?: string
      sortOrder?: string
    }) => 
      apiClient.get<ProductListResponse>('/admin/products', {
        ...getAuthHeaders(),
        params
      }),
    
    // 获取产品详情
    getById: (id: number) => 
      apiClient.get<{ data: Product }>(`/admin/products/${id}`, getAuthHeaders()),
    
    // 创建产品
    create: (data: ProductCreateRequest) => 
      apiClient.post('/admin/products', data, getAuthHeaders()),
    
    // 更新产品
    update: (id: number, data: ProductUpdateRequest) => 
      apiClient.put(`/admin/products/${id}`, data, getAuthHeaders()),
    
    // 删除产品
    delete: (id: number) => 
      apiClient.delete(`/admin/products/${id}`, getAuthHeaders()),
    
    // 批量操作
    batchOperation: (data: BatchOperationRequest) => 
      apiClient.post<BatchOperationResponse>('/admin/products/batch', data, getAuthHeaders()),
    
    // 更新排序
    updateSort: (data: ProductSortRequest) => 
      apiClient.post('/admin/products/sort', data, getAuthHeaders()),
  },

  // ==================== 留言管理 ====================
  
  contacts: {
    // 获取留言列表
    getList: (params?: {
      page?: number
      limit?: number
      status?: string
      type?: string
      keyword?: string
      sortBy?: string
      sortOrder?: string
    }) => 
      apiClient.get<ContactListResponse>('/admin/contacts', {
        ...getAuthHeaders(),
        params
      }),
    
    // 获取留言详情
    getById: (id: number) => 
      apiClient.get<{ data: Contact }>(`/admin/contacts/${id}`, getAuthHeaders()),
    
    // 更新留言状态
    updateStatus: (id: number, data: ContactUpdateRequest) => 
      apiClient.put(`/admin/contacts/${id}`, data, getAuthHeaders()),
    
    // 回复留言
    reply: (id: number, reply: string) => 
      apiClient.post(`/admin/contacts/${id}/reply`, { reply }, getAuthHeaders()),
    
    // 删除留言
    delete: (id: number) => 
      apiClient.delete(`/admin/contacts/${id}`, getAuthHeaders()),
    
    // 批量操作
    batchOperation: (data: BatchOperationRequest) => 
      apiClient.post<BatchOperationResponse>('/admin/contacts/batch', data, getAuthHeaders()),
    
    // 导出留言
    export: (params?: {
      status?: string
      type?: string
      startDate?: string
      endDate?: string
    }) => 
      apiClient.get('/admin/contacts/export', {
        ...getAuthHeaders(),
        params,
        responseType: 'blob'
      }),
  },
}
