import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'

const industries = [
  { id: 1, name: '电力行业',  icon: '⚡', description: '保护电力生产、传输、分配系统的安全稳定运行' },
  { id: 2, name: '石化行业',  icon: '🏭', description: '确保石化生产过程中的网络安全和工艺安全' },
  { id: 3, name: '轨道交通',  icon: '🚇', description: '保障轨道交通信号系统和运营系统的安全' },
  { id: 4, name: '智能制造',  icon: '🤖', description: '保护智能制造工厂的工业控制系统和生产线' },
  { id: 5, name: '水处理',    icon: '💧', description: '确保水处理厂控制系统的安全可靠运行' },
  { id: 6, name: '矿山行业',  icon: '⛏️', description: '保护矿山自动化系统和监控网络的安全' },
]

const solutions = [
  {
    id: 1,
    title: '工业网络安全整体解决方案',
    industry: '电力行业',
    image: 'https://via.placeholder.com/600x400',
    painPoints: ['生产网络与办公网络边界模糊', '缺乏有效的安全监测手段', '历史系统安全防护能力不足'],
    features: ['网络分区隔离', '边界安全防护', '实时威胁监测', '安全运维管理'],
    results: '帮助某大型发电集团实现生产网络安全防护全覆盖，安全事件响应时间缩短 80%',
  },
  {
    id: 2,
    title: '工控安全审计解决方案',
    industry: '石化行业',
    image: 'https://via.placeholder.com/600x400',
    painPoints: ['操作行为无法追溯', '违规操作难以发现', '合规审计压力大'],
    features: ['全流量审计', '操作行为分析', '异常行为告警', '合规报告生成'],
    results: '为某石化企业建立完善的操作审计体系，满足等保 2.0 三级要求',
  },
  {
    id: 3,
    title: '轨道交通安全防御体系',
    industry: '轨道交通',
    image: 'https://via.placeholder.com/600x400',
    painPoints: ['信号系统面临网络威胁', '多系统互联增加风险', '安全防护影响实时性'],
    features: ['信号系统防护', '通信安全加密', '实时威胁检测', '应急恢复机制'],
    results: '保障某城市地铁线路安全运行 3 年，零安全事故',
  },
]

const consultingServices = [
  {
    id: 1,
    title: '安全评估服务',
    description: '对企业现有工业控制系统进行全面的安全风险评估，识别潜在威胁和漏洞，提供专业的整改建议。',
    items: ['资产梳理与识别', '漏洞扫描与分析', '风险等级评定', '整改方案建议'],
  },
  {
    id: 2,
    title: '安全规划咨询',
    description: '根据企业业务需求和安全现状，制定符合国家标准和行业规范的工业网络安全整体规划方案。',
    items: ['安全架构设计', '合规性分析', '建设路线规划', '预算方案制定'],
  },
  {
    id: 3,
    title: '安全培训服务',
    description: '为企业安全管理人员和运维人员提供专业的工业网络安全培训，提升整体安全意识和技能水平。',
    items: ['安全意识培训', '技术技能培训', '应急演练指导', '认证考试辅导'],
  },
]

const TABS = ['行业方案', '案例展示', '咨询服务'] as const

function Solutions() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = (searchParams.get('category') as typeof TABS[number]) || '行业方案'

  const industryRef  = useRef<HTMLElement>(null)
  const casesRef     = useRef<HTMLElement>(null)
  const consultRef   = useRef<HTMLElement>(null)
  const isTabClick   = useRef(false)

  const refMap: Record<typeof TABS[number], React.RefObject<HTMLElement>> = {
    行业方案: industryRef,
    案例展示: casesRef,
    咨询服务: consultRef,
  }

  // Only scroll when user clicks a tab, not on initial page load
  useEffect(() => {
    if (!isTabClick.current) return
    isTabClick.current = false
    const ref = refMap[activeCategory]
    if (ref?.current) {
      setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    }
  }, [activeCategory])

  const handleTabClick = (tab: typeof TABS[number]) => {
    isTabClick.current = true
    setSearchParams({ category: tab })
  }

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="hero-bg py-24 text-white relative">
        <div className="texture-overlay" />
        <div className="geo-decoration w-64 h-64 -top-10 -right-10 animate-pulse-slow" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="gold-accent-line mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">解决方案</h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto font-light">
            针对不同行业的工业网络安全需求，提供专业化的解决方案
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-6 bg-gray-50 border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`px-5 py-2 rounded-full font-medium transition-colors ${
                  activeCategory === tab
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 行业方案 */}
      <section ref={industryRef} className="py-20 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">行业方案</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              我们深入理解各行业特点，提供针对性的安全解决方案
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {industries.map((industry, index) => (
              <motion.div
                key={industry.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow cursor-pointer"
              >
                <div className="text-4xl mb-4">{industry.icon}</div>
                <h3 className="font-semibold mb-2">{industry.name}</h3>
                <p className="text-gray-600 text-sm">{industry.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 案例展示 */}
      <section ref={casesRef} className="py-20 bg-gray-50 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">案例展示</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              经过实践验证的成功案例，为您带来可靠的安全保障
            </p>
          </div>
          <div className="space-y-12">
            {solutions.map((solution) => (
              <motion.div
                key={solution.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="h-64 lg:h-auto">
                    <img
                      src={solution.image}
                      alt={solution.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-8">
                    <div className="inline-block bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm font-medium mb-4">
                      {solution.industry}
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{solution.title}</h3>
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3 flex items-center">
                        <ExclamationTriangleIcon className="w-5 h-5 text-orange-500 mr-2" />
                        痛点分析
                      </h4>
                      <ul className="space-y-2">
                        {solution.painPoints.map((point) => (
                          <li key={point} className="text-gray-600 flex items-start">
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3 flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                        方案特色
                      </h4>
                      <ul className="space-y-2">
                        {solution.features.map((feature) => (
                          <li key={feature} className="text-gray-600 flex items-start">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-green-700">
                        <strong>实施效果：</strong> {solution.results}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 咨询服务 */}
      <section ref={consultRef} className="py-20 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">咨询服务</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              专业的安全咨询团队，为您提供全方位的安全服务支持
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {consultingServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow"
              >
                <h3 className="text-xl font-bold mb-4 text-primary-600">{service.title}</h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">{service.description}</p>
                <ul className="space-y-2">
                  {service.items.map((item) => (
                    <li key={item} className="flex items-center text-sm text-gray-700">
                      <CheckCircleIcon className="w-4 h-4 text-primary-500 mr-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-gradient py-20 text-white relative overflow-hidden">
        <div className="texture-overlay" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-teal/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4">需要定制化解决方案？</h2>
          <p className="text-xl text-white/70 mb-8">
            我们的专家团队将为您量身定制最适合的安全方案
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="/contact"
              className="bg-accent-gold hover:bg-accent-gold-dark text-white px-8 py-3.5 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              咨询方案
            </a>
            <a
              href="/about"
              className="bg-transparent border-2 border-white/30 hover:border-accent-gold hover:bg-accent-gold/10 text-white px-8 py-3.5 rounded-lg font-semibold transition-all duration-300"
            >
              了解我们
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Solutions
