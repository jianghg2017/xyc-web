import { Routes, Route, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Products from './pages/Products'
import ProductDetail from './pages/Products/Detail'
import News from './pages/News'
import NewsDetail from './pages/News/Detail'
import Contact from './pages/Contact'
import Solutions from './pages/Solutions'
import AdminLayout from './components/admin/AdminLayout'
import AdminLogin from './pages/Admin/Login'
import Dashboard from './pages/Admin/Dashboard'
import NewsList from './pages/Admin/News'
import ProductsList from './pages/Admin/Products'
import ContactsList from './pages/Admin/Contacts'
import AssistantWidget from './components/features/AssistantWidget'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* 后台管理登录页 - 独立页面，不带导航 */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* 后台管理系统 - 独立布局 */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="news" element={<NewsList />} />
          <Route path="products" element={<ProductsList />} />
          <Route path="contacts" element={<ContactsList />} />
        </Route>
      </Routes>
      <AssistantWidget />
    </>
  )
}

export default App
