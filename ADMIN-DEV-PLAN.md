# 后台管理系统开发计划

**开始时间**: 2026-04-14 18:20  
**状态**: 进行中

---

## Phase 1: 后端 API 开发

### 1.1 数据库扩展
- [x] 检查现有表结构
- [ ] 添加 dashboard 统计查询

### 1.2 后端控制器开发
- [ ] `controllers/admin-dashboard.js` - 概览数据统计
- [ ] 完善 `controllers/news.js` - 新闻管理 CRUD
- [ ] 完善 `controllers/products.js` - 产品管理 CRUD
- [ ] 完善 `controllers/contact.js` - 留言管理

### 1.3 路由配置
- [ ] 更新 `routes/admin.js` - 添加 dashboard 路由
- [ ] 确保所有 CRUD 路由正确

---

## Phase 2: 前端类型定义

### 2.1 扩展类型定义
- [ ] 更新 `frontend/src/types/index.ts`
  - Dashboard 相关类型
  - 新闻/产品/留言完整类型
  - 筛选和分页参数类型

---

## Phase 3: 前端页面开发

### 3.1 布局组件
- [ ] `components/AdminLayout.tsx` - 后台管理布局
- [ ] `components/Sidebar.tsx` - 侧边栏导航
- [ ] `components/TopBar.tsx` - 顶部导航栏

### 3.2 概览页面
- [ ] `pages/Admin/Dashboard.tsx` - 完整实现
  - 数据卡片组件
  - 访客趋势图
  - 待处理事项
  - 最新内容列表

### 3.3 新闻管理页面
- [ ] `pages/Admin/News/index.tsx` - 新闻列表
- [ ] `pages/Admin/News/NewsForm.tsx` - 新建/编辑表单
- [ ] `pages/Admin/News/NewsModal.tsx` - 详情/预览

### 3.4 产品管理页面
- [ ] `pages/Admin/Products/index.tsx` - 产品列表
- [ ] `pages/Admin/Products/ProductForm.tsx` - 新建/编辑表单
- [ ] `pages/Admin/Products/ProductModal.tsx` - 详情/预览

### 3.5 留言管理页面
- [ ] `pages/Admin/Contacts/index.tsx` - 留言列表
- [ ] `pages/Admin/Contacts/ContactModal.tsx` - 详情/回复

---

## Phase 4: API 客户端

### 4.1 扩展 API 客户端
- [ ] 更新 `api/admin.ts`
  - dashboard API
  - news CRUD
  - products CRUD
  - contacts CRUD

---

## Phase 5: 测试与调试

### 5.1 功能测试
- [ ] 登录功能
- [ ] Dashboard 数据展示
- [ ] 新闻 CRUD
- [ ] 产品 CRUD
- [ ] 留言管理

---

## 技术栈

- **前端**: React + TypeScript + TailwindCSS
- **后端**: Node.js + Express + MySQL
- **UI 组件**: 使用 TailwindCSS 原生组件
- **图表**: ECharts (用于 Dashboard)
- **富文本**: Quill.js (新闻/产品编辑)

---

## 注意事项

1. **认证**: 所有管理路由需要 JWT 验证
2. **权限**: 预留角色权限检查
3. **错误处理**: 统一错误处理机制
4. **加载状态**: 所有异步操作显示加载状态
5. **表单验证**: 前端 + 后端双重验证
