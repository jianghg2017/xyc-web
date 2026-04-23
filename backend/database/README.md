# 数据库配置指南

## 📋 概述

本文档介绍公司官网的完整数据库配置和使用方法。

## 🗄️ 数据库信息

| 配置项 | 值 |
|--------|-----|
| **类型** | MySQL 5.7+ |
| **主机** | 127.0.0.1 |
| **端口** | 3306 |
| **数据库名** | company_website |
| **用户名** | root |
| **密码** | Wnt.1@3456 |
| **字符集** | utf8mb4 |

## 📊 数据表清单

系统包含 **10 张核心数据表**：

### 1. admins - 管理员表
存储后台管理系统管理员账户信息。

**关键字段**:
- `email` - 登录邮箱
- `password` - bcrypt 加密密码
- `role` - 角色 (super_admin/admin/editor)
- `status` - 账户状态

**默认账户**:
- 邮箱：admin@company.com
- 密码：Admin@123456

### 2. news - 新闻文章表
存储公司新闻、产品动态、行业资讯等。

**关键字段**:
- `title` - 文章标题
- `content` - 正文内容 (HTML/Markdown)
- `category` - 分类 (公司新闻/产品动态/行业活动/技术文章)
- `status` - 状态 (draft/published/archived)
- `views` - 浏览量

### 3. products - 产品表
展示公司产品和服务。

**关键字段**:
- `name` - 产品名称
- `description` - 简短描述
- `content` - 详细介绍
- `category` - 分类 (软件产品/硬件产品/解决方案)
- `features` - 功能特性 (JSON)
- `gallery` - 产品图库 (JSON)

### 4. contacts - 联系表单表
存储用户提交的咨询信息。

**关键字段**:
- `name` - 姓名
- `email` - 邮箱
- `type` - 咨询类型
- `message` - 咨询内容
- `status` - 处理状态 (new/read/replied/closed)

### 5. features - 核心优势表
首页核心优势展示。

**示例数据**:
- 专业安全
- 技术创新
- 全球服务

### 6. company_stats - 公司数据统计表
关于我们页面的统计数据。

**示例数据**:
- 1000+ 服务客户
- 500+ 项目案例
- 100+ 专业团队
- 50+ 专利技术

### 7. company_timeline - 公司发展历程表
时间轴展示公司发展历史。

**示例数据**:
- 2015: 公司成立
- 2017: 推出首款产品
- 2026: 服务客户突破 1000 家

### 8. company_values - 公司价值观表
核心价值观展示。

**示例数据**:
- 客户至上
- 追求卓越
- 诚信负责

### 9. site_settings - 网站全局设置表
存储网站配置信息。

**配置分类**:
- `basic` - 基本信息 (网站名称、LOGO 等)
- `contact` - 联系方式 (电话、邮箱、地址)
- `social` - 社交媒体链接
- `seo` - SEO 设置

### 10. banners - 轮播图表
首页轮播图配置。

**关键字段**:
- `title` - 标题
- `image_url` - 图片 URL
- `link_url` - 跳转链接
- `location` - 展示位置
- `status` - 启用状态

## 🚀 快速开始

### 1. 环境配置

复制环境变量文件并配置：

```bash
cd backend
copy .env.example .env
```

编辑 `.env` 文件：

```env
# 数据库配置
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Wnt.1@3456
DB_NAME=company_website

# 管理员默认账户
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=Admin@123456

# JWT 配置
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# 是否使用模拟数据
USE_MOCK_DATA=false
```

### 2. 安装依赖

```bash
cd backend
npm install
```

### 3. 初始化数据库

```bash
# 运行数据库初始化脚本
node database/init.js
```

系统会自动：
- 创建数据库 `company_website`
- 创建 10 张数据表
- 插入默认数据

### 4. 启动服务

```bash
# 后端服务
npm start

# 或使用 nodemon 自动重启
npm run dev
```

服务启动后访问:
- 前端：http://localhost:5173
- 后端 API: http://localhost:3000/api

## 🔧 数据库管理

### 查看表结构

```bash
# 查看所有表
mysql -u root -p company_website -e "SHOW TABLES;"

# 查看表结构
mysql -u root -p company_website -e "DESCRIBE news;"
```

### 数据备份

```bash
# 备份整个数据库
mysqldump -u root -p company_website > backup_$(date +%Y%m%d).sql

# 备份特定表
mysqldump -u root -p company_website news products > backup_tables.sql
```

### 数据恢复

```bash
# 从备份文件恢复
mysql -u root -p company_website < backup_20260414.sql
```

### 查看数据

```sql
-- 查看所有新闻
SELECT id, title, category, published_at FROM news WHERE status='published' ORDER BY published_at DESC;

-- 查看所有产品
SELECT id, name, category, status FROM products WHERE status='published';

-- 查看联系表单
SELECT id, name, email, type, status, created_at FROM contacts ORDER BY created_at DESC;

-- 查看统计数据
SELECT number, label FROM company_stats ORDER BY sort_order;
```

## 📝 开发指南

### 添加新数据

#### 添加新闻文章

```sql
INSERT INTO news (title, summary, content, cover_image, category, author, published_at, status)
VALUES (
  '新文章标题',
  '文章摘要...',
  '<p>文章内容 HTML...</p>',
  '/images/news-cover.jpg',
  '公司新闻',
  '作者名',
  NOW(),
  'published'
);
```

#### 添加产品

```sql
INSERT INTO products (name, description, content, cover_image, category, status, sort_order)
VALUES (
  '产品名称',
  '简短描述',
  '<p>详细介绍...</p>',
  '/images/product.jpg',
  '硬件产品',
  'published',
  1
);
```

#### 修改网站设置

```sql
-- 更新网站名称
UPDATE site_settings SET setting_value='新网站名称' WHERE setting_key='site_name';

-- 更新联系电话
UPDATE site_settings SET setting_value='400-888-8888' WHERE setting_key='contact_phone';
```

### API 接口

后端已提供完整的 RESTful API：

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/news` | GET | 获取新闻列表 |
| `/api/news/:id` | GET | 获取新闻详情 |
| `/api/products` | GET | 获取产品列表 |
| `/api/products/:id` | GET | 获取产品详情 |
| `/api/contacts` | POST | 提交联系表单 |
| `/api/admin/news` | GET/POST/PUT/DELETE | 新闻管理 |
| `/api/admin/products` | GET/POST/PUT/DELETE | 产品管理 |

### 前端数据绑定

前端页面将从数据库动态读取数据：

```tsx
// 示例：从 API 获取新闻数据
const { data: news } = await apiClient.get('/api/news?status=published');

// 示例：获取公司统计数据
const { data: stats } = await apiClient.get('/api/site/stats');
```

## 🛠️ 常见问题

### Q: 数据库连接失败？

**A**: 检查以下几点：
1. MySQL 服务是否启动
2. 数据库配置是否正确 (`.env` 文件)
3. 用户权限是否足够
4. 防火墙是否阻止 3306 端口

### Q: 如何重置管理员密码？

**A**: 
```sql
-- 使用 bcrypt 生成新密码哈希
-- 然后在数据库中更新
UPDATE admins SET password='$2a$10$新哈希值' WHERE email='admin@company.com';
```

### Q: 如何清空所有数据？

**A**: 
```sql
-- 删除所有表（谨慎操作！）
DROP TABLE IF EXISTS admins, news, products, contacts, features, company_stats, company_timeline, company_values, site_settings, banners;

-- 重新初始化
node database/init.js
```

### Q: 如何添加新的产品分类？

**A**: 
产品表使用 VARCHAR 类型存储分类，可以直接插入新分类：
```sql
INSERT INTO products (name, category, ...) VALUES ('新产品', '新分类', ...);
```

## 📚 参考资料

- [数据库表结构文档](./schema.md)
- [后端 API 文档](../docs/API.md)
- [前端开发指南](../../frontend/README.md)

## 🔄 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0 | 2026-04-14 | 初始版本，创建 10 张核心表 |
