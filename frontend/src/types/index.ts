// ==================== 基础类型 ====================

export interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

// ==================== 管理员类型 ====================

export interface Admin {
  id: number
  email: string
  name?: string
  avatar?: string
  role?: 'super_admin' | 'admin' | 'editor'
  created_at?: string
  last_login_at?: string
  last_login_ip?: string
  status?: 'active' | 'inactive' | 'locked'
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  data: {
    token: string
    admin: Admin
  }
}

export interface AuthState {
  token: string | null
  admin: Admin | null
  isAuthenticated: boolean
}

// ==================== 新闻类型 ====================

export interface News {
  id: number
  title: string
  summary?: string
  content: string
  cover_image?: string
  category?: '公司新闻' | '产品动态' | '行业活动' | '技术文章'
  author?: string
  published_at?: string
  views?: number
  likes?: number
  tags?: string[]
  seo_title?: string
  seo_description?: string
  status?: 'draft' | 'published' | 'archived'
  sort_order?: number
  created_at?: string
  updated_at?: string
}

export interface NewsListResponse {
  data: News[]
  pagination: Pagination
}

export interface NewsCreateRequest {
  title: string
  summary?: string
  content: string
  cover_image?: string
  category: string
  author?: string
  tags?: string[]
  seo_title?: string
  seo_description?: string
  status?: 'draft' | 'published'
}

export interface NewsUpdateRequest extends Partial<NewsCreateRequest> {
  id: number
}

// ==================== 产品类型 ====================

export interface ProductFeature {
  title: string
  description: string
}

export interface Product {
  id: number
  name: string
  description?: string
  content?: string
  cover_image?: string
  gallery?: string[]
  category?: '软件产品' | '硬件产品' | '解决方案'
  subcategory?: string
  features?: ProductFeature[]
  specs?: Record<string, any>
  price?: number
  download_url?: string
  video_url?: string
  views?: number
  status?: 'draft' | 'published' | 'hidden'
  sort_order?: number
  seo_title?: string
  seo_description?: string
  created_at?: string
  updated_at?: string
}

export interface ProductListResponse {
  data: Product[]
  pagination: Pagination
}

export interface ProductCreateRequest {
  name: string
  description?: string
  content?: string
  cover_image?: string
  gallery?: string[]
  category: string
  subcategory?: string
  features?: ProductFeature[]
  specs?: Record<string, any>
  price?: number
  download_url?: string
  video_url?: string
  status?: 'draft' | 'published' | 'hidden'
  sort_order?: number
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
  id: number
}

// ==================== 留言类型 ====================

export interface Contact {
  id: number
  name: string
  email: string
  phone?: string
  company?: string
  type: '产品咨询' | '解决方案' | '技术支持' | '商务合作' | '其他问题'
  message: string
  ip_address?: string
  user_agent?: string
  status?: 'new' | 'read' | 'replied' | 'closed'
  reply?: string
  replied_at?: string
  replied_by?: number
  created_at?: string
  updated_at?: string
}

export interface ContactListResponse {
  data: Contact[]
  pagination: Pagination
}

export interface ContactForm {
  name: string
  email: string
  phone?: string
  company?: string
  type: string
  message: string
}

export interface ContactUpdateRequest {
  id: number
  status?: 'new' | 'read' | 'replied' | 'closed'
  reply?: string
}

// ==================== Dashboard 类型 ====================

export interface DashboardStatistics {
  news: {
    total: number
    published: number
    draft: number
    todayNew: number
  }
  products: {
    total: number
    published: number
    draft: number
    todayNew: number
  }
  contacts: {
    total: number
    unread: number
    read: number
    todayNew: number
  }
  visitors: {
    today: number
    week: number
  }
}

export interface VisitorTrendItem {
  date: string
  visitors: number
}

export interface PendingItem {
  id: number
  title?: string
  name?: string
  type?: string
  created_at: string
}

export interface DashboardData {
  statistics: DashboardStatistics
  visitorTrend: VisitorTrendItem[]
  pendingItems: {
    unreadContacts: PendingItem[]
    draftNews: PendingItem[]
    lowStockProducts: any[]
  }
  latestNews: Array<{
    id: number
    title: string
    category: string
    status: string
    published_at: string
    views: number
  }>
  latestContacts: Array<{
    id: number
    name: string
    type: string
    status: string
    created_at: string
  }>
}

export interface DashboardResponse {
  data: DashboardData
}

// ==================== 批量操作类型 ====================

export interface BatchOperationRequest {
  action: 'delete' | 'publish' | 'draft' | 'hidden' | 'read' | 'close'
  ids: number[]
}

export interface BatchOperationResponse {
  data: {
    affectedRows: number
  }
  message: string
}

// ==================== 排序类型 ====================

export interface ProductSortItem {
  id: number
  sort_order: number
}

export interface ProductSortRequest {
  products: ProductSortItem[]
}

// ==================== API 响应基础类型 ====================

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}
