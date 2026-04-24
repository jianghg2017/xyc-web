/**
 * Company configuration
 *
 * Switch between companies by changing the `active` key below.
 * All company-specific text and assets are centralised here so the
 * rest of the codebase stays identical.
 */

export interface CompanyConfig {
  /** Short display name, e.g. "公司" */
  name: string
  /** English / pinyin brand name, e.g. "XINYICE" */
  nameEn: string
  /** Full legal name shown in footer copyright */
  fullName: string
  /** One-line tagline used in page title & hero */
  tagline: string
  /** Logo path for light backgrounds */
  logo: string
  /** Logo path for dark backgrounds (white version) */
  logoWhite: string
  /** Contact email */
  email: string
  /** About page – hero subtitle */
  aboutHeroText: string
  /** About page – first paragraph of company intro */
  aboutIntro: string
}

const companies: Record<string, CompanyConfig> = {
  xinyice: {
    name: '新益策',
    nameEn: 'XINYICE',
    fullName: '北京新益策顾问管理有限公司',
    tagline: '企业咨询专家',
    logo: '/logo.svg',
    logoWhite: '/logo-white.svg',
    email: 'info@winicssec.com',
    aboutHeroText:
      '新益策技术有限公司是专注于智能制造领域的高科技企业，致力于为全球客户提供专业的企业管理咨询方案',
    aboutIntro:
      '新益策术有限公司成立于 2023 年，是国内领先的企业管理咨询方案提供商。公司专注于企业管理的研究，为新能源、国央企、智能制造等行业提供全方位的服务。',
  },
  zhiandun: {
    name: '智安盾',
    nameEn: 'ZHIANDUN',
    fullName: '北京智安盾技术有限公司',
    tagline: '安防行业专家',
    logo: '/logo-zhiandun.svg',
    logoWhite: '/logo-zhiandun-white.svg',
    email: 'info@zhiandun.com',
    aboutHeroText:
      '智安盾技术有限公司是专注于安防领域的高科技企业，致力于为全球客户提供专业的安防解决方案',
    aboutIntro:
      '智安盾技术有限公司成立于 2025 年，是国内领先的安防解决方案提供商。公司专注于安全防护相关研究，为电力、石油石化、轨道交通、智能制造等关键基础设施行业提供全方位的安全防护。',
  },
}

// ---- Switch company here ----
const active: string = import.meta.env.VITE_COMPANY || 'xinyice'

export const company: CompanyConfig = companies[active] ?? companies.xinyice
