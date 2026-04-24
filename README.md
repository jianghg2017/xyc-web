# 公司官网项目文档 - 公司

## 项目概述

这是一个基于 React + Express + MySQL 的全栈公司官网项目，包含前台展示页面和后台管理系统，属于北京公司顾问管理有限公司。

## 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: TailwindCSS 3.x
- **路由**: React Router v6
- **状态管理**: Zustand + TanStack Query
- **表单**: React Hook Form + Zod
- **HTTP 客户端**: Axios
- **动画**: Framer Motion
- **图标**: Heroicons

### 后端
- **运行时**: Node.js v24.13.1
- **框架**: Express
- **数据库**: MySQL
- **认证**: JWT

## 项目结构

```
tasks/TASK-001/
├── backend/              # 后端代码
│   ├── server.js         # 主入口文件
│   ├── routes/           # API 路由
│   ├── controllers/      # 控制器
│   ├── middleware/       # 中间件
│   └── config/           # 配置文件
├── frontend/             # 前端代码
│   ├── src/
│   │   ├── api/          # API 接口
│   │   ├── components/   # 组件
│   │   │   ├── common/   # 通用组件
│   │   │   └── layout/   # 布局组件
│   │   ├── pages/        # 页面组件
│   │   ├── types/        # TypeScript 类型
│   │   ├── utils/        # 工具函数
│   │   ├── App.tsx       # 主应用
│   │   └── main.tsx      # 入口文件
│   ├── public/           # 静态资源
│   ├── index.html        # HTML 模板
│   ├── package.json      # 依赖配置
│   ├── tailwind.config.js # Tailwind 配置
│   └── vite.config.ts    # Vite 配置
├── tests/                # 测试文件
│   ├── test-plan.md      # 测试计划
│   └── api-tests.md      # API 测试用例
├── design-spec.md        # 设计规范
├── status.md             # 项目状态
└── README.md             # 项目文档
```

## 快速开始

### 环境要求

- Node.js v24.13.1+
- MySQL 8.0+
- npm 或 yarn

### 安装步骤

#### 1. 后端安装

```bash
cd backend
npm install

# 配置数据库
# 复制 .env.example 为 .env 并修改配置
cp .env.example .env

# 启动后端
npm start
```

后端将在 http://localhost:3000 启动

#### 2. 前端安装

```bash
cd frontend
npm install

# 启动前端开发服务器
npm run dev
```

前端将在 http://localhost:5173 启动

### 数据库配置

```sql
-- 创建数据库
CREATE DATABASE company_website CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户表
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'editor') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建新闻表
CREATE TABLE news (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(100),
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建产品表
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建留言表
CREATE TABLE contacts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  company VARCHAR(100),
  phone VARCHAR(20),
  message TEXT NOT NULL,
  status ENUM('unread', 'read', 'replied') DEFAULT 'unread',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认管理员账号
INSERT INTO users (username, password, role) VALUES 
('admin', '$2b$10$YourHashedPasswordHere', 'admin');
```

## API 文档

### 公开 API

#### 新闻相关
- `GET /api/news` - 获取新闻列表（分页）
- `GET /api/news/:id` - 获取新闻详情

#### 产品相关
- `GET /api/products` - 获取产品列表（分页）
- `GET /api/products/:id` - 获取产品详情

#### 联系表单
- `POST /api/contact` - 提交联系表单

### 管理 API (需要 JWT 认证)

#### 认证
- `POST /api/admin/login` - 管理员登录
- `POST /api/admin/logout` - 管理员登出
- `GET /api/admin/profile` - 获取管理员信息

#### 新闻管理
- `GET /api/admin/news` - 获取新闻列表
- `POST /api/admin/news` - 创建新闻
- `PUT /api/admin/news/:id` - 更新新闻
- `DELETE /api/admin/news/:id` - 删除新闻

#### 产品管理
- `GET /api/admin/products` - 获取产品列表
- `POST /api/admin/products` - 创建产品
- `PUT /api/admin/products/:id` - 更新产品
- `DELETE /api/admin/products/:id` - 删除产品

#### 留言管理
- `GET /api/admin/contacts` - 获取留言列表

## 页面路由

### 前台页面
- `/` - 首页
- `/about` - 关于我们
- `/products` - 产品中心
- `/products/:id` - 产品详情
- `/solutions` - 解决方案
- `/news` - 新闻资讯
- `/news/:id` - 新闻详情
- `/contact` - 联系我们

### 后台页面
- `/admin/login` - 登录页面
- `/admin/dashboard` - 后台首页
- `/admin/news` - 新闻管理
- `/admin/products` - 产品管理
- `/admin/contacts` - 留言管理

## 设计规范

### 配色方案
- 主色：`#1890FF`
- 成功：`#52C41A`
- 警告：`#FAAD14`
- 错误：`#FF4D4F`

### 组件规范
- 按钮：圆角 8px，高度 40px
- 输入框：圆角 6px，高度 40px
- 卡片：圆角 8px，阴影 `0 2px 8px rgba(0,0,0,0.08)`

### 响应式断点
- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: ≥ 1024px

## 构建和部署

### 前端构建

```bash
cd frontend
npm run build
```

构建产物将输出到 `frontend/dist/` 目录

### 后端部署

```bash
cd backend
npm install --production
npm start
```

### Docker 部署（可选）

创建 `docker-compose.yml`:

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: company_website
    ports:
      - "3306:3306"
  
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    depends_on:
      - mysql
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

## 测试

### 运行测试

```bash
# 前端测试
cd frontend
npm test

# API 测试
使用 Postman 导入 tests/api-tests.md 中的集合
```

### 测试覆盖率

```bash
cd frontend
npm run test:coverage
```

## 开发指南

### 代码规范

- 使用 TypeScript 严格模式
- ESLint 配置已就绪
- Prettier 格式化代码

### Git 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具
```

## 常见问题

### Q: 前端无法访问后端 API？
A: 检查 vite.config.ts 中的 proxy 配置，确保后端在 3000 端口运行

### Q: JWT 令牌失效？
A: 默认 token 有效期为 24 小时，可在 backend/middleware/auth.js 中修改

### Q: 数据库连接失败？
A: 检查 backend/.env 中的数据库配置，确保 MySQL 服务运行

## 维护记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|---------|------|
| 2026-04-12 | 1.0.0 | 初始版本 | WinClaw AI |

## 联系方式

如有问题，请联系开发团队。

---

**项目状态**: ✅ 开发完成，待测试
**最后更新**: 2026-04-12
