import { Link } from 'react-router-dom'
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/solid'

function Footer() {
  return (
    <footer className="bg-primary-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
            <div className="text-2xl font-bold mb-2">新益策</div>
            <div className="gold-accent-line mb-4" />
            <p className="text-white/50 text-sm leading-relaxed">
              专注于工业网络安全领域，提供全方位的安全解决方案，保护关键基础设施免受网络威胁。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-semibold mb-5 text-white/90">快速链接</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-white/50 hover:text-accent-gold transition-colors text-sm">
                  首页
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-white/50 hover:text-accent-gold transition-colors text-sm">
                  产品中心
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="text-white/50 hover:text-accent-gold transition-colors text-sm">
                  解决方案
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-white/50 hover:text-accent-gold transition-colors text-sm">
                  新闻资讯
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-white/50 hover:text-accent-gold transition-colors text-sm">
                  关于我们
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-base font-semibold mb-5 text-white/90">产品中心</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/products" className="text-white/50 hover:text-accent-gold transition-colors text-sm">
                  软件产品
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-white/50 hover:text-accent-gold transition-colors text-sm">
                  硬件产品
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="text-white/50 hover:text-accent-gold transition-colors text-sm">
                  解决方案
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-white/50 hover:text-accent-gold transition-colors text-sm">
                  下载中心
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-base font-semibold mb-5 text-white/90">联系我们</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <PhoneIcon className="w-4 h-4 text-accent-gold mt-0.5 flex-shrink-0" />
                <span className="text-white/50 text-sm">400-xxx-xxxx</span>
              </li>
              <li className="flex items-start space-x-2">
                <EnvelopeIcon className="w-4 h-4 text-accent-gold mt-0.5 flex-shrink-0" />
                <span className="text-white/50 text-sm">info@winicssec.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPinIcon className="w-4 h-4 text-accent-gold mt-0.5 flex-shrink-0" />
                <span className="text-white/50 text-sm">北京市朝阳区 xxx 路 xxx 号</span>
              </li>
              <li className="flex items-start space-x-2">
                <ChatBubbleLeftRightIcon className="w-4 h-4 text-accent-gold mt-0.5 flex-shrink-0" />
                <span className="text-white/50 text-sm">工作时间：9:00 - 18:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/40 text-sm">
          <p>© 2026 北京新益策顾问管理有限公司 版权所有 | 京 ICP 备 xxxxxx 号</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
