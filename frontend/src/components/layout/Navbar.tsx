import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/solid'
import { company } from '@/config/company'

const navItems = [
  { name: '首页', path: '/' },
  { 
    name: '产品中心', 
    path: '/products',
    submenu: [
      { name: '软件产品', path: '/products?category=软件产品' },
      { name: '硬件产品', path: '/products?category=硬件产品' },
      { name: '解决方案', path: '/products?category=解决方案' },
    ]
  },
  { 
    name: '解决方案', 
    path: '/solutions',
    submenu: [
      { name: '行业方案', path: '/solutions?category=行业方案' },
      { name: '案例展示', path: '/solutions?category=案例展示' },
      { name: '咨询服务', path: '/solutions?category=咨询服务' },
    ]
  },
  { 
    name: '新闻资讯', 
    path: '/news',
    submenu: [
      { name: '公司新闻', path: '/news?category=公司新闻' },
      { name: '行业资讯', path: '/news?category=行业资讯' },
    ]
  },
  { name: '关于我们', path: '/about' },
  { name: '联系我们', path: '/contact' },
]

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const location = useLocation()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-600/95 backdrop-blur-md shadow-lg shadow-primary-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={company.logoWhite}
              alt={`${company.name} ${company.nameEn}`} 
              className="h-10 w-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const textLogo = document.getElementById('text-logo');
                if (textLogo) textLogo.style.display = 'flex';
              }}
            />
            <div id="text-logo" className="items-center gap-2 text-2xl font-bold text-white hidden">
              <span>{company.name}</span>
              <span className="text-xs font-normal text-white/60">{company.nameEn}</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <div
                key={item.path}
                className="relative"
                onMouseEnter={() => item.submenu && setActiveSubmenu(item.path)}
                onMouseLeave={() => setActiveSubmenu(null)}
              >
                <Link
                  to={item.path}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    location.pathname === item.path
                      ? 'bg-accent-gold text-white shadow-md'
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{item.name}</span>
                  {item.submenu && (
                    <ChevronDownIcon className="w-3.5 h-3.5" />
                  )}
                </Link>

                {/* Submenu */}
                <AnimatePresence>
                  {item.submenu && activeSubmenu === item.path && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl shadow-primary-900/10 py-2 min-w-[200px] border border-gray-100"
                    >
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          className="block px-4 py-2.5 text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors text-sm"
                          onClick={() => setActiveSubmenu(null)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="打开菜单"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6 text-white" />
            ) : (
              <Bars3Icon className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu - dropdown below navbar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-primary-700 border-t border-white/10"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-accent-gold text-white'
                      : 'text-white/80 active:bg-white/10'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
