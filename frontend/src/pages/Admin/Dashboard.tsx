import React, { useState, useEffect } from 'react'
import { adminApi } from '@/api/admin'
import type { DashboardData } from '@/types'

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const res = await adminApi.getDashboard()
      if (res.data?.data) {
        setData(res.data.data)
      }
    } catch (err: any) {
      setError(err.message || '加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">加载数据失败：{error}</p>
        <button
          onClick={loadDashboard}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          重试
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 数据卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="📰"
          title="新闻"
          value={data.statistics.news.total}
          subtitle={`新增 ${data.statistics.news.todayNew} 篇`}
          detail={`已发布 ${data.statistics.news.published} | 草稿 ${data.statistics.news.draft}`}
          color="blue"
        />
        <StatCard
          icon="📦"
          title="产品"
          value={data.statistics.products.total}
          subtitle={`新增 ${data.statistics.products.todayNew} 个`}
          detail={`已发布 ${data.statistics.products.published} | 草稿 ${data.statistics.products.draft}`}
          color="green"
        />
        <StatCard
          icon="💬"
          title="留言"
          value={data.statistics.contacts.total}
          subtitle={`今日 ${data.statistics.contacts.todayNew} 条`}
          detail={`未读 ${data.statistics.contacts.unread} | 已读 ${data.statistics.contacts.read}`}
          color="purple"
        />
        <StatCard
          icon="👤"
          title="访客"
          value={data.statistics.visitors.today}
          subtitle={`本周 ${data.statistics.visitors.week} 人`}
          color="orange"
        />
      </div>

      {/* 待处理事项和最新内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 待处理事项 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🔔 待处理事项</h3>
          <div className="space-y-4">
            {data.pendingItems.unreadContacts.length > 0 ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">未读留言 ({data.pendingItems.unreadContacts.length})</p>
                <ul className="space-y-2">
                  {data.pendingItems.unreadContacts.slice(0, 3).map((item) => (
                    <li key={item.id} className="text-sm bg-gray-50 p-2 rounded">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-500 ml-2">({item.type})</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-500">暂无未读留言</p>
            )}

            {data.pendingItems.draftNews.length > 0 ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">待审核新闻 ({data.pendingItems.draftNews.length})</p>
                <ul className="space-y-2">
                  {data.pendingItems.draftNews.slice(0, 3).map((item) => (
                    <li key={item.id} className="text-sm bg-gray-50 p-2 rounded">
                      <span className="font-medium">{item.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-500">暂无待审核新闻</p>
            )}
          </div>
        </div>

        {/* 最新新闻 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📰 最新新闻</h3>
          {data.latestNews.length > 0 ? (
            <ul className="space-y-3">
              {data.latestNews.slice(0, 5).map((news) => (
                <li key={news.id} className="text-sm border-b border-gray-100 pb-2 last:border-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 truncate">{news.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded">{news.category}</span>
                        <span className="ml-2">{new Date(news.published_at).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">暂无新闻</p>
          )}
        </div>
      </div>

      {/* 最新留言 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">💬 最新留言</h3>
        {data.latestContacts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.latestContacts.slice(0, 5).map((contact) => (
                  <tr key={contact.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{contact.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{contact.type}</td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={contact.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(contact.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">暂无留言</p>
        )}
      </div>
    </div>
  )
}

// 统计卡片组件
interface StatCardProps {
  icon: string
  title: string
  value: number
  subtitle?: string
  detail?: string
  color: 'blue' | 'green' | 'purple' | 'orange'
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, subtitle, detail, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200'
  }

  return (
    <div className={`bg-white rounded-lg shadow border-l-4 ${colorClasses[color]} p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl mb-2">{icon}</p>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      {detail && <p className="text-xs text-gray-500 mt-3 pt-3 border-t">{detail}</p>}
    </div>
  )
}

// 状态标签组件
interface StatusBadgeProps {
  status: string
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusClasses: Record<string, string> = {
    new: 'bg-blue-100 text-blue-600',
    read: 'bg-green-100 text-green-600',
    replied: 'bg-purple-100 text-purple-600',
    closed: 'bg-gray-100 text-gray-600'
  }

  const statusLabels: Record<string, string> = {
    new: '未读',
    read: '已读',
    replied: '已回复',
    closed: '已关闭'
  }

  return (
    <span className={`px-2 py-1 rounded text-xs ${statusClasses[status] || 'bg-gray-100'}`}>
      {statusLabels[status] || status}
    </span>
  )
}

export default Dashboard
