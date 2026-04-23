import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BuildingOfficeIcon, UserGroupIcon, TrophyIcon, ShieldCheckIcon } from '@heroicons/react/24/solid'
import { statsAPI, timelineAPI, valuesAPI } from '@/api/public'
import SkeletonCard from '@/components/common/SkeletonCard'

// Static fallback data used when API fails
const fallbackStats = [
  { id: 1, number: '1000+', label: '服务客户' },
  { id: 2, number: '500+', label: '项目案例' },
  { id: 3, number: '100+', label: '专业团队' },
  { id: 4, number: '50+', label: '专利技术' },
]

const fallbackTimeline = [
  { id: 1, year: '2015', event: '公司成立，专注于工业网络安全研究' },
  { id: 2, year: '2017', event: '推出首款工业防火墙产品' },
  { id: 3, year: '2019', event: '获得 B 轮融资，团队规模扩大' },
  { id: 4, year: '2021', event: '产品覆盖全国 20+ 省份' },
  { id: 5, year: '2023', event: '荣获国家级高新技术企业认证' },
  { id: 6, year: '2026', event: '服务客户突破 1000 家' },
]

const fallbackValues = [
  {
    id: 1,
    title: '客户至上',
    description: '始终将客户需求放在首位，提供超越期待的产品和服务',
    icon: 'user-group',
  },
  {
    id: 2,
    title: '追求卓越',
    description: '不断突破技术边界，追求产品和服务的极致品质',
    icon: 'trophy',
  },
  {
    id: 3,
    title: '诚信负责',
    description: '坚持诚信经营，对客户、员工和社会负责',
    icon: 'shield-check',
  },
]

interface Stat {
  id: number
  number: string
  label: string
}

interface TimelineItem {
  id: number
  year: string
  event: string
}

interface Value {
  id: number
  title: string
  description: string
  icon?: string
}

// Map icon string to Heroicon component
function ValueIcon({ icon }: { icon?: string }) {
  switch (icon) {
    case 'trophy':
      return <TrophyIcon className="w-12 h-12 text-primary-500 mx-auto mb-4" />
    case 'shield-check':
      return <ShieldCheckIcon className="w-12 h-12 text-primary-500 mx-auto mb-4" />
    case 'user-group':
    default:
      return <UserGroupIcon className="w-12 h-12 text-primary-500 mx-auto mb-4" />
  }
}

function About() {
  const [stats, setStats] = useState<Stat[]>([])
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [values, setValues] = useState<Value[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, timelineRes, valuesRes] = await Promise.all([
          statsAPI.get(),
          timelineAPI.getList(),
          valuesAPI.getList(),
        ])

        setStats(statsRes.data?.data ?? fallbackStats)
        setTimeline(timelineRes.data?.data ?? fallbackTimeline)
        setValues(valuesRes.data?.data ?? fallbackValues)
      } catch {
        setError(true)
        setStats(fallbackStats)
        setTimeline(fallbackTimeline)
        setValues(fallbackValues)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Determine which data to render (API data or fallback)
  const displayStats = error || stats.length === 0 ? fallbackStats : stats
  const displayTimeline = error || timeline.length === 0 ? fallbackTimeline : timeline
  const displayValues = error || values.length === 0 ? fallbackValues : values

  return (
    <div className="pt-16 overflow-x-hidden">
      {/* Hero Section */}
      <section className="hero-bg py-24 text-white relative">
        <div className="texture-overlay" />
        <div className="geo-decoration w-64 h-64 -top-10 -right-10 animate-pulse-slow" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="gold-accent-line mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">关于我们</h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto font-light">
            新益策技术有限公司是专注于工业网络安全领域的高科技企业，致力于为全球客户提供专业的安全解决方案
          </p>
        </div>
      </section>

      {/* Company Introduction */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">公司简介</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                新益策技术有限公司成立于 2015 年，是国内领先的工业网络安全解决方案提供商。公司专注于工业控制系统的网络安全研究，
                为电力、石化、轨道交通、智能制造等关键基础设施行业提供全方位的安全防护。
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                我们拥有一支由网络安全专家、工业控制工程师和软件工程师组成的专业团队，
                凭借深厚的技术积累和丰富的行业经验，为客户构建安全、可靠、高效的工业网络环境。
              </p>
              <p className="text-gray-600 leading-relaxed">
                公司始终坚持"技术创新、品质至上、客户第一"的理念，
                已获得多项国家级认证和荣誉，产品广泛应用于全国各地的重要工业场景。
              </p>
            </div>
            <div className="bg-gray-100 rounded-xl h-80 flex items-center justify-center">
              <BuildingOfficeIcon className="w-32 h-32 text-primary-300" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-gradient py-20 text-white relative overflow-hidden">
        <div className="texture-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <SkeletonCard type="text" count={3} />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {displayStats.map((stat, index) => (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                  <div className="text-white/80">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">发展历程</h2>
            <p className="text-gray-600">见证我们的成长与进步</p>
          </div>
          {loading ? (
            <div className="space-y-4">
              <SkeletonCard type="text" count={3} />
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary-200" />
              {displayTimeline.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className={`relative flex items-center mb-12 ${
                    index % 2 === 0 ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'order-last pl-8'}`}>
                    <div className="text-2xl font-bold text-primary-500 mb-2">{item.year}</div>
                    <div className="text-gray-700">{item.event}</div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary-500 rounded-full" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">核心价值观</h2>
            <p className="text-gray-600">我们的信念与追求</p>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <SkeletonCard type="text" count={3} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayValues.map((value, index) => (
                <motion.div
                  key={value.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-xl shadow-lg text-center"
                >
                  <ValueIcon icon={value.icon} />
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default About
