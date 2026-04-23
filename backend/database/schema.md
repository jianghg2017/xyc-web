# 数据库表结构文档

## 概述

本数据库支持公司官网的所有动态内容展示，包括首页、关于我们、产品中心、新闻资讯、联系我们等页面。

## 表清单

| 表名 | 用途 |
|------|------|
| `admins` | 后台管理员账户 |
| `news` | 新闻文章 |
| `products` | 产品展示 |
| `contacts` | 联系表单提交 |
| `features` | 首页核心优势 |
| `company_stats` | 公司数据统计 |
| `company_timeline` | 公司发展历程 |
| `company_values` | 公司核心价值观 |
| `site_settings` | 网站全局设置 |
| `banners` | 轮播图/Banner |

---

## 表结构详情

### 1. admins - 管理员表

存储后台管理系统管理员账户。

```sql
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL COMMENT '邮箱',
  password VARCHAR(255) NOT NULL COMMENT '密码 (bcrypt 加密)',
  name VARCHAR(255) COMMENT '姓名',
  avatar VARCHAR(500) COMMENT '头像 URL',
  role ENUM('super_admin', 'admin', 'editor') DEFAULT 'editor' COMMENT '角色',
  last_login_at DATETIME COMMENT '最后登录时间',
  last_login_ip VARCHAR(50) COMMENT '最后登录 IP',
  status ENUM('active', 'inactive', 'locked') DEFAULT 'active' COMMENT '状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';
```

**默认数据**:
- email: admin@company.com
- password: Admin@123456 (bcrypt 加密)
- name: 管理员
- role: super_admin

---

### 2. news - 新闻文章表

存储公司新闻、产品动态、行业资讯等内容。

```sql
CREATE TABLE news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL COMMENT '标题',
  summary TEXT COMMENT '摘要/简介',
  content LONGTEXT NOT NULL COMMENT '正文内容 (HTML/Markdown)',
  cover_image VARCHAR(500) COMMENT '封面图片 URL',
  category VARCHAR(50) NOT NULL COMMENT '分类：公司新闻/产品动态/行业活动/技术文章',
  author VARCHAR(100) COMMENT '作者',
  published_at DATETIME COMMENT '发布时间',
  views INT DEFAULT 0 COMMENT '浏览量',
  likes INT DEFAULT 0 COMMENT '点赞数',
  tags JSON COMMENT '标签数组',
  seo_title VARCHAR(255) COMMENT 'SEO 标题',
  seo_description TEXT COMMENT 'SEO 描述',
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft' COMMENT '状态',
  sort_order INT DEFAULT 0 COMMENT '排序权重',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_published_at (published_at),
  FULLTEXT idx_search (title, summary, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='新闻文章表';
```

**分类枚举**:
- 公司新闻
- 产品动态
- 行业活动
- 技术文章

---

### 3. products - 产品表

展示公司产品和服务。

```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL COMMENT '产品名称',
  description TEXT COMMENT '简短描述 (列表页显示)',
  content LONGTEXT COMMENT '详细介绍 (详情页 HTML)',
  cover_image VARCHAR(500) COMMENT '主图 URL',
  gallery JSON COMMENT '图库数组 [url1, url2, ...]',
  category VARCHAR(50) NOT NULL COMMENT '分类：软件产品/硬件产品/解决方案',
  subcategory VARCHAR(100) COMMENT '子分类',
  features JSON COMMENT '功能特性数组 [{title, description}]',
  specs JSON COMMENT '规格参数',
  price DECIMAL(10,2) COMMENT '价格 (可选)',
  download_url VARCHAR(500) COMMENT '下载链接/资料链接',
  video_url VARCHAR(500) COMMENT '演示视频 URL',
  views INT DEFAULT 0 COMMENT '浏览量',
  status ENUM('draft', 'published', 'hidden') DEFAULT 'draft' COMMENT '状态',
  sort_order INT DEFAULT 0 COMMENT '排序权重',
  seo_title VARCHAR(255) COMMENT 'SEO 标题',
  seo_description TEXT COMMENT 'SEO 描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_sort_order (sort_order),
  FULLTEXT idx_search (name, description, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品表';
```

**分类枚举**:
- 软件产品
- 硬件产品
- 解决方案

**示例数据**:
```json
{
  "features": [
    {"title": "工业协议深度检测", "description": "..."},
    {"title": "实时威胁阻断", "description": "..."}
  ]
}
```

---

### 4. contacts - 联系表单表

存储用户提交的联系咨询信息。

```sql
CREATE TABLE contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '姓名',
  email VARCHAR(255) NOT NULL COMMENT '邮箱',
  phone VARCHAR(20) COMMENT '电话',
  company VARCHAR(200) COMMENT '公司名称',
  type VARCHAR(50) NOT NULL COMMENT '咨询类型',
  message TEXT NOT NULL COMMENT '咨询内容',
  ip_address VARCHAR(50) COMMENT '提交 IP',
  user_agent TEXT COMMENT '浏览器信息',
  status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new' COMMENT '状态',
  reply TEXT COMMENT '回复内容',
  replied_at DATETIME COMMENT '回复时间',
  replied_by INT COMMENT '回复管理员 ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (replied_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='联系表单表';
```

**咨询类型枚举**:
- 产品咨询
- 解决方案
- 技术支持
- 商务合作
- 其他问题

---

### 5. features - 核心优势表

首页核心优势/特点展示。

```sql
CREATE TABLE features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL COMMENT '标题',
  description TEXT NOT NULL COMMENT '描述',
  icon VARCHAR(100) NOT NULL COMMENT '图标名称 (Heroicons)',
  icon_color VARCHAR(20) DEFAULT 'primary-500' COMMENT '图标颜色',
  sort_order INT DEFAULT 0 COMMENT '排序权重',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sort_order (sort_order),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='核心优势表';
```

**示例数据**:
```sql
INSERT INTO features (title, description, icon, sort_order) VALUES
('专业安全', '专注于工业网络安全，提供全方位的安全防护解决方案', 'ShieldCheckIcon', 1),
('技术创新', '持续研发投入，保持技术领先地位', 'BoltIcon', 2),
('全球服务', '服务覆盖多个行业，客户遍布全球', 'GlobeAltIcon', 3);
```

---

### 6. company_stats - 公司数据统计表

关于我们页面的统计数据展示。

```sql
CREATE TABLE company_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  number VARCHAR(50) NOT NULL COMMENT '数字 (可包含单位如 1000+)',
  label VARCHAR(100) NOT NULL COMMENT '标签/说明',
  icon VARCHAR(100) COMMENT '图标名称',
  sort_order INT DEFAULT 0 COMMENT '排序权重',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公司数据统计表';
```

**示例数据**:
```sql
INSERT INTO company_stats (number, label, sort_order) VALUES
('1000+', '服务客户', 1),
('500+', '项目案例', 2),
('100+', '专业团队', 3),
('50+', '专利技术', 4);
```

---

### 7. company_timeline - 公司发展历程表

关于我们页面的时间轴展示。

```sql
CREATE TABLE company_timeline (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year VARCHAR(10) NOT NULL COMMENT '年份',
  event VARCHAR(255) NOT NULL COMMENT '事件描述',
  description TEXT COMMENT '详细描述 (可选)',
  icon VARCHAR(100) COMMENT '图标名称',
  image VARCHAR(500) COMMENT '配图 URL (可选)',
  sort_order INT DEFAULT 0 COMMENT '排序权重',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_year (year),
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公司发展历程表';
```

**示例数据**:
```sql
INSERT INTO company_timeline (year, event, sort_order) VALUES
('2015', '公司成立，专注于工业网络安全研究', 1),
('2017', '推出首款工业防火墙产品', 2),
('2019', '获得 B 轮融资，团队规模扩大', 3),
('2021', '产品覆盖全国 20+ 省份', 4),
('2023', '荣获国家级高新技术企业认证', 5),
('2026', '服务客户突破 1000 家', 6);
```

---

### 8. company_values - 公司价值观表

核心价值观展示。

```sql
CREATE TABLE company_values (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL COMMENT '价值观名称',
  description TEXT NOT NULL COMMENT '详细描述',
  icon VARCHAR(100) NOT NULL COMMENT '图标名称',
  icon_color VARCHAR(20) DEFAULT 'primary-500' COMMENT '图标颜色',
  sort_order INT DEFAULT 0 COMMENT '排序权重',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公司价值观表';
```

**示例数据**:
```sql
INSERT INTO company_values (title, description, icon, sort_order) VALUES
('客户至上', '始终将客户需求放在首位，提供超越期待的产品和服务', 'UserGroupIcon', 1),
('追求卓越', '不断突破技术边界，追求产品和服务的极致品质', 'TrophyIcon', 2),
('诚信负责', '坚持诚信经营，对客户、员工和社会负责', 'ShieldCheckIcon', 3);
```

---

### 9. site_settings - 网站全局设置表

存储网站的全局配置信息。

```sql
CREATE TABLE site_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL COMMENT '配置键',
  setting_value TEXT COMMENT '配置值 (JSON 或文本)',
  setting_type VARCHAR(20) DEFAULT 'text' COMMENT '类型：text/json/number/boolean',
  category VARCHAR(50) COMMENT '分类：basic/contact/social/seo',
  description VARCHAR(255) COMMENT '配置说明',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='网站全局设置表';
```

**示例数据**:
```sql
INSERT INTO site_settings (setting_key, setting_value, category, setting_type) VALUES
-- 基本信息
('site_name', '新益策技术有限公司', 'basic', 'text'),
('site_logo', '/images/logo.png', 'basic', 'text'),
('site_favicon', '/images/favicon.ico', 'basic', 'text'),
('site_description', '专注于工业网络安全的高科技企业', 'seo', 'text'),
('site_keywords', '工业安全,网络安全,工控安全', 'seo', 'text'),

-- 联系方式
('contact_phone', '400-xxx-xxxx', 'contact', 'text'),
('contact_email', 'info@winicssec.com', 'contact', 'text'),
('contact_address', '北京市朝阳区 xxx 路 xxx 号', 'contact', 'text'),
('contact_hours', '周一至周五 9:00-18:00', 'contact', 'text'),

-- 社交媒体
('social_wechat', '/images/wechat-qrcode.png', 'social', 'text'),
('social_weibo', 'https://weibo.com/example', 'social', 'text'),
('social_linkedin', 'https://linkedin.com/company/example', 'social', 'text');
```

---

### 10. banners - 轮播图/横幅表

首页或其他页面的轮播图。

```sql
CREATE TABLE banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) COMMENT '标题',
  subtitle VARCHAR(500) COMMENT '副标题',
  description TEXT COMMENT '描述文字',
  image_url VARCHAR(500) NOT NULL COMMENT '图片 URL',
  link_url VARCHAR(500) COMMENT '跳转链接',
  target_blank BOOLEAN DEFAULT FALSE COMMENT '新窗口打开',
  location VARCHAR(50) DEFAULT 'home_hero' COMMENT '展示位置',
  sort_order INT DEFAULT 0 COMMENT '排序权重',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
  start_date DATE COMMENT '开始展示日期',
  end_date DATE COMMENT '结束展示日期',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_location (location),
  INDEX idx_status (status),
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轮播图表';
```

---

## 数据库初始化脚本

完整的初始化 SQL 脚本位于：`database/init.js`

## 数据迁移

如需添加新表或修改表结构，请：
1. 更新 `database/init.js`
2. 在 `database/migrations/` 创建迁移脚本
3. 执行迁移：`node database/migrations/run.js`
