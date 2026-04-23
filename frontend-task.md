# 前端开发任务书

**任务 ID**: TASK-001-FRONTEND  
**创建时间**: 2026-04-11 20:56  
**优先级**: P1  
**状态**: 🟡 进行中

---

## 📋 任务概述

基于已完成的后端 API 和 UI/UX 设计规范，开发公司官网 React 前端应用。

## 🎯 开发目标

1. **完整实现所有页面**
   - 首页 (Home)
   - 关于我们 (About Us)
   - 产品中心 (Products)
   - 解决方案 (Solutions)
   - 新闻资讯 (News)
   - 联系我们 (Contact)

2. **对接后端 API**
   - 公开 API: 新闻、产品、联系表单
   - 管理 API: 登录、新闻 CRUD、产品 CRUD、留言管理

3. **响应式设计**
   - 移动端优先
   - 全设备适配

## 🛠️ 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: TailwindCSS 3.x
- **状态管理**: Zustand / React Query
- **路由**: React Router v6
- **HTTP 客户端**: Axios
- **表单**: React Hook Form + Zod
- **动画**: Framer Motion
- **图标**: Heroicons

## 📁 项目结构

```
frontend/
├── src/
│   ├── api/              # API 接口定义
│   ├── assets/           # 静态资源
│   ├── components/       # 通用组件
│   │   ├── common/       # 通用组件 (按钮、输入框等)
│   │   ├── layout/       # 布局组件 (导航、页脚等)
│   │   └── features/     # 业务组件
│   ├── hooks/            # 自定义 Hooks
│   ├── pages/            # 页面组件
│   │   ├── Home/
│   │   ├── About/
│   │   ├── Products/
│   │   ├── Solutions/
│   │   ├── News/
│   │   └── Contact/
│   ├── stores/           # 状态管理
│   ├── types/            # TypeScript 类型
│   ├── utils/            # 工具函数
│   ├── App.tsx
│   └── main.tsx
├── public/
├── .env.example
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## 📐 设计规范

严格遵循 `design-spec.md` 中的规范：

### 配色方案
- 主色: `#1890FF`
- 成功: `#52C41A`
- 警告: `#FAAD14`
- 错误: `#FF4D4F`

### 组件规范
- 按钮: 圆角 8px，高度 40px(默认)
- 输入框: 圆角 6px，高度 40px
- 卡片: 圆角 8px，阴影 `0 2px 8px rgba(0,0,0,0.08)`

### 响应式断点
- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: ≥ 1024px

## 🔌 API 对接

后端 API 地址：`http://localhost:3000/api`

### 公开接口
```typescript
// 新闻
GET /api/news          // 新闻列表 (分页)
GET /api/news/:id      // 新闻详情

// 产品
GET /api/products      // 产品列表 (分页)
GET /api/products/:id  // 产品详情

// 联系
POST /api/contact      // 提交联系表单
```

### 管理接口 (需要 JWT)
```typescript
// 认证
POST /api/admin/login     // 管理员登录
POST /api/admin/logout    // 管理员登出
GET /api/admin/profile    // 获取管理员信息

// 新闻管理
GET    /api/admin/news       // 新闻列表
POST   /api/admin/news       // 创建新闻
PUT    /api/admin/news/:id   // 更新新闻
DELETE /api/admin/news/:id   // 删除新闻

// 产品管理
GET    /api/admin/products       // 产品列表
POST   /api/admin/products       // 创建产品
PUT    /api/admin/products/:id   // 更新产品
DELETE /api/admin/products/:id   // 删除产品

// 留言管理
GET /api/admin/contacts  // 留言列表
```

## ✅ 开发清单

### 第一阶段：项目初始化 ⏳
- [ ] 创建 React + TypeScript + Vite 项目
- [ ] 配置 TailwindCSS
- [ ] 配置路由 (React Router)
- [ ] 配置 Axios 拦截器
- [ ] 创建项目基础结构

### 第二阶段：通用组件 ⏳
- [ ] 按钮组件 (Primary/Secondary/Text/Danger)
- [ ] 输入框组件 (Input/Textarea/Select)
- [ ] 卡片组件
- [ ] 导航栏组件 (桌面端 + 移动端)
- [ ] 页脚组件
- [ ] 加载状态组件
- [ ] 提示消息组件

### 第三阶段：页面开发 ⏳
- [ ] 首页 (Hero Banner、核心优势、产品展示、新闻动态)
- [ ] 关于我们 (公司简介、团队、时间轴)
- [ ] 产品中心 (列表、筛选、详情)
- [ ] 解决方案 (列表、详情、案例)
- [ ] 新闻资讯 (列表、详情)
- [ ] 联系我们 (表单、地图、联系信息)

### 第四阶段：管理后台 ⏳
- [ ] 登录页面
- [ ] 后台布局
- [ ] 新闻管理 (CRUD)
- [ ] 产品管理 (CRUD)
- [ ] 留言管理

### 第五阶段：优化 ⏳
- [ ] 响应式测试
- [ ] 性能优化 (懒加载、代码分割)
- [ ] 错误处理完善
- [ ] 加载状态优化
- [ ] SEO 优化

### 第六阶段：文档 ⏳
- [ ] README 文档
- [ ] API 对接说明
- [ ] 部署指南

## 📊 进度追踪

| 阶段 | 状态 | 预计时间 |
|------|------|----------|
| 项目初始化 | ⏳ 待开始 | 2 小时 |
| 通用组件 | ⏳ 待开始 | 4 小时 |
| 页面开发 | ⏳ 待开始 | 12 小时 |
| 管理后台 | ⏳ 待开始 | 6 小时 |
| 优化 | ⏳ 待开始 | 4 小时 |
| 文档 | ⏳ 待开始 | 2 小时 |

**总计**: 约 30 小时 (约 4 个工作日)

## 📝 注意事项

1. **严格遵循设计规范** - 配色、间距、组件样式必须与 design-spec.md 一致
2. **API 对接** - 使用已完成的 backend API，不要修改后端
3. **响应式优先** - 移动端优先，渐进增强
4. **错误处理** - 所有 API 调用必须有错误处理
5. **加载状态** - 所有异步操作显示加载状态
6. **代码质量** - TypeScript 严格模式，ESLint 规范

## 📂 输出位置

前端代码将输出到：`tasks/TASK-001/frontend/`

---

**创建者**: WinClaw AI  
**分配给**: frontend-developer 子智能体  
**启动时间**: 2026-04-11 20:56  
**启动状态**: 🟢 已启动

---

## 🚀 启动说明

前端开发子智能体已启动，将开始以下工作：

1. 创建 React + TypeScript + Vite 项目
2. 配置 TailwindCSS 和设计规范
3. 实现所有页面组件
4. 对接后端 API
5. 完善响应式设计和错误处理

预计完成时间：约 4 个工作日 (30 小时)
