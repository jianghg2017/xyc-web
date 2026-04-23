import api from './client'
import type { News, NewsListResponse, Product, ProductListResponse, ContactForm } from '@/types'

// 新闻 API
export const newsApi = {
  getList: (page = 1, limit = 10, category?: string) => 
    api.get<NewsListResponse>('/news', { params: { page, limit, status: 'published', ...(category ? { category } : {}) } }),
  
  getDetail: (id: number) => 
    api.get<{ data: News }>(`/news/${id}`),
}

// 产品 API
export const productsApi = {
  getList: (page = 1, limit = 10, category?: string) => 
    api.get<ProductListResponse>('/products', { 
      params: { page, limit, status: 'published', ...(category ? { category } : {}) } 
    }),
  
  getDetail: (id: number) => 
    api.get<{ data: Product }>(`/products/${id}`),
}

// 联系表单 API
export const contactApi = {
  submit: (data: ContactForm) => 
    api.post('/contact', data),
}
