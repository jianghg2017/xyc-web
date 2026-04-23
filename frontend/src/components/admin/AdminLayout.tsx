import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { adminApi } from '@/api'
import type { Admin } from '@/types'

interface AdminLayoutProps {
  children?: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // 验证登录状态
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      navigate('/admin/login', { replace: true })
      return
    }

    // 验证 token 有效性
    adminApi.getProfile()
      .then(res => {
        if (res.data?.data) {
          setAdmin(res.data.data)
        } else {
          localStorage.removeItem('admin_token')
          navigate('/admin/login', { replace: true })
        }
      })
      .catch(() => {
        localStorage.removeItem('admin_token')
        navigate('/admin/login', { replace: true })
      })
      .finally(() => setLoading(false))
  }, [navigate])

  // 处理登出
  const handleLogout = () => {
    adminApi.logout()
      .then(() => {
        localStorage.removeItem('admin_token')
        navigate('/admin/login', { replace: true })
      })
      .catch(() => {
        localStorage.removeItem('admin_token')
        navigate('/admin/login', { replace: true })
      })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* 侧边栏 */}
      <aside 
        className={`${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } bg-gray-800 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          {sidebarCollapsed ? (
            <span className="text-2xl font-bold text-blue-400">W</span>
          ) : (
            <h1 className="text-xl font-bold">后台管理系统</h1>
          )}
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <MenuItem 
            to="/admin/dashboard" 
            icon="📊" 
            label="概览" 
            collapsed={sidebarCollapsed}
            active={location.pathname === '/admin/dashboard'}
          />
          <MenuItem 
            to="/admin/news" 
            icon="📰" 
            label="新闻管理" 
            collapsed={sidebarCollapsed}
            active={location.pathname.startsWith('/admin/news')}
          />
          <MenuItem 
            to="/admin/products" 
            icon="📦" 
            label="产品管理" 
            collapsed={sidebarCollapsed}
            active={location.pathname.startsWith('/admin/products')}
          />
          <MenuItem 
            to="/admin/contacts" 
            icon="💬" 
            label="留言管理" 
            collapsed={sidebarCollapsed}
            active={location.pathname.startsWith('/admin/contacts')}
          />
        </nav>

        {/* 底部信息 */}
        <div className="p-4 border-t border-gray-700">
          {sidebarCollapsed ? (
            <button
              onClick={handleLogout}
              className="w-full p-2 hover:bg-gray-700 rounded text-center"
              title="退出登录"
            >
              🚪
            </button>
          ) : (
            <div>
              <div className="text-sm text-gray-400">欢迎，{admin?.name || admin?.email}</div>
              <button
                onClick={handleLogout}
                className="mt-2 w-full p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              >
                退出登录
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部栏 */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded mr-4"
            >
              ☰
            </button>
            <h2 className="text-xl font-semibold text-gray-800">
              {getPageTitle(location.pathname)}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </span>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

// 菜单项组件
interface MenuItemProps {
  to: string
  icon: string
  label: string
  collapsed: boolean
  active?: boolean
}

const MenuItem: React.FC<MenuItemProps> = ({ to, icon, label, collapsed, active }) => {
  const navigate = useNavigate()
  
  return (
    <button
      onClick={() => navigate(to)}
      className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-700 transition-colors ${
        active ? 'bg-blue-600 text-white' : 'text-gray-300'
      }`}
    >
      <span className="text-xl">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </button>
  )
}

// 获取页面标题
const getPageTitle = (pathname: string): string => {
  const titles: Record<string, string> = {
    '/admin/dashboard': '概览',
    '/admin/news': '新闻管理',
    '/admin/news/new': '新建新闻',
    '/admin/news/edit': '编辑新闻',
    '/admin/products': '产品管理',
    '/admin/products/new': '新建产品',
    '/admin/products/edit': '编辑产品',
    '/admin/contacts': '留言管理',
  }
  return titles[pathname] || '后台管理'
}

export default AdminLayout
