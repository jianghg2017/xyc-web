# 公司官网前端

基于 React + TypeScript + Vite 构建的公司官网前端应用。

## 技术栈

- **框架**: React 18
- **语言**: TypeScript
- **构建工具**: Vite
- **样式**: TailwindCSS 3.x
- **路由**: React Router v6
- **状态管理**: Zustand + React Query
- **HTTP 客户端**: Axios
- **表单**: React Hook Form + Zod
- **动画**: Framer Motion
- **图标**: Heroicons

## 项目结构

```
src/
├── api/              # API 接口定义
├── assets/           # 静态资源
├── components/       # 通用组件
│   ├── common/       # 通用组件
│   ├── layout/       # 布局组件
│   └── features/     # 业务组件
├── hooks/            # 自定义 Hooks
├── pages/            # 页面组件
│   ├── Home/         # 首页
│   ├── About/        # 关于我们
│   ├── Products/     # 产品中心
│   ├── Solutions/    # 解决方案
│   ├── News/         # 新闻资讯
│   ├── Contact/      # 联系我们
│   └── Admin/        # 管理后台
├── stores/           # 状态管理
├── types/            # TypeScript 类型
├── utils/            # 工具函数
├── App.tsx           # 应用入口
└── main.tsx          # 主入口
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

## 环境变量

复制 `.env.example` 为 `.env` 并配置：

```env
VITE_API_URL=http://localhost:3000/api
```

## 页面说明

### 公开页面

- **首页** (`/`): Hero Banner、核心优势、产品展示、新闻动态
- **关于我们** (`/about`): 公司简介、发展历程、核心价值观
- **产品中心** (`/products`): 产品列表、分类筛选、搜索
- **解决方案** (`/solutions`): 行业方案、案例展示
- **新闻资讯** (`/news`): 新闻列表、分类浏览
- **联系我们** (`/contact`): 联系表单、联系方式

### 管理后台

- **登录** (`/admin/login`): 管理员登录
- **概览** (`/admin/dashboard`): 后台概览
- **新闻管理** (`/admin/news`): 新闻 CRUD
- **产品管理** (`/admin/products`): 产品 CRUD
- **留言管理** (`/admin/contacts`): 联系留言管理

## 设计规范

严格遵循 `design-spec.md` 中的设计规范：

- **主色**: #1890FF
- **圆角**: 按钮 8px, 输入框 6px, 卡片 8px
- **响应式**: 移动端优先，适配全设备

## API 对接

### 公开 API

- `GET /api/news` - 新闻列表
- `GET /api/news/:id` - 新闻详情
- `GET /api/products` - 产品列表
- `GET /api/products/:id` - 产品详情
- `POST /api/contact` - 提交联系表单

### 管理 API (需要 JWT)

- `POST /api/admin/login` - 管理员登录
- `GET /api/admin/news` - 新闻列表
- `POST /api/admin/news` - 创建新闻
- `PUT /api/admin/news/:id` - 更新新闻
- `DELETE /api/admin/news/:id` - 删除新闻
- (产品管理和留言管理类似)

## 开发注意事项

1. **严格遵循设计规范** - 配色、间距、组件样式必须与 design-spec.md 一致
2. **API 对接** - 使用已完成的 backend API，不要修改后端
3. **响应式优先** - 移动端优先，渐进增强
4. **错误处理** - 所有 API 调用必须有错误处理
5. **加载状态** - 所有异步操作显示加载状态
6. **代码质量** - TypeScript 严格模式，ESLint 规范

## License

Copyright © 2026 公司技术有限公司
