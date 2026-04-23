import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/solid'

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
  { name: '新闻资讯', path: '/news' },
  { name: '关于我们', path: '/about' },
  { name: '联系我们', path: '/contact' },
]

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-gradient-to-r from-blue-900 to-blue-700 shadow-lg' 
          : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={isScrolled ? '/logo-white.svg' : '/logo.svg'}
              alt="新益策 XINYICE" 
              className="h-10 w-auto transition-all duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const textLogo = document.getElementById('text-logo');
                if (textLogo) textLogo.style.display = 'flex';
              }}
            />
            <div id="text-logo" className={`items-center gap-2 text-2xl font-bold ${isScrolled ? 'text-white' : 'text-blue-800'} hidden`}>
              <span>新益策</span>
              <span className={`text-xs font-normal ${isScrolled ? 'text-blue-200' : 'text-gray-400'}`}>XINYICE</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <div
                key={item.path}
                className="relative"
                onMouseEnter={() => item.submenu && setActiveSubmenu(item.path)}
                onMouseLeave={() => setActiveSubmenu(null)}
              >
                <Link
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? isScrolled
                        ? 'text-white font-semibold'
                        : 'text-primary-600 font-semibold'
                      : isScrolled
                      ? 'text-white/90 hover:text-white'
                      : 'text-gray-800 hover:text-primary-600'
                  }`}
                >
                  <span>{item.name}</span>
                  {item.submenu && (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </Link>

                {/* Submenu */}
                <AnimatePresence>
                  {item.submenu && activeSubmenu === item.path && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg py-2 min-w-[200px]"
                    >
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-500 transition-colors"
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
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className={`w-6 h-6 ${isScrolled ? 'text-white' : 'text-gray-800'}`} />
            ) : (
              <Bars3Icon className={`w-6 h-6 ${isScrolled ? 'text-white' : 'text-gray-800'}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-y-0 right-0 w-80 bg-white/95 backdrop-blur-sm shadow-xl md:hidden"
          >
            <div className="p-4">
              <div className="flex justify-end mb-4">
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <XMarkIcon className="w-6 h-6 text-gray-700" />
                </button>
              </div>
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-500 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
