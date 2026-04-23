# 🚀 快速启动指南

**项目**: 公司官网 (TASK-001)  
**版本**: 1.0 - 企业级商用版本  
**最后更新**: 2026-04-12

---

## 📋 启动前检查

### 环境要求

- ✅ Node.js v24.13.1 (已安装)
- ✅ MySQL 5.7 (已安装，可选 - 当前使用模拟数据)
- ✅ npm (已安装)
- ✅ 现代浏览器 (Chrome/Firefox/Edge)

### 当前配置

- **数据模式**: 模拟数据 (测试环境)
- **后端端口**: 3000
- **前端端口**: 5173
- **管理员账号**: admin@company.com / Admin@123456

---

## 🎯 快速启动 (3 步)

### 步骤 1: 启动后端 API

```powershell
cd D:\codes\aicode\win-web\TASK-001\backend
node server.js
```

**预期输出**:
```
Server running on http://localhost:3000
Using mock data mode (database optional)
Mock data mode enabled - skipping database initialization
```

✅ 后端启动成功：http://localhost:3000/api/health

---

### 步骤 2: 启动前端开发服务器

**新打开一个 PowerShell 窗口**:

**方法 1 - 使用启动脚本 (推荐)**:
```powershell
cd D:\codes\aicode\win-web\TASK-001\frontend
.\start.bat
```

**方法 2 - 使用 npm**:
```powershell
cd D:\codes\aicode\win-web\TASK-001\frontend
$env:NODE_OPTIONS=""
npm run dev
```

**预期输出**:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

✅ 前端启动成功：http://localhost:5173

**注意**: 如果遇到 `NODE_OPTIONS` 错误，请使用 `start.bat` 脚本启动。

---

### 步骤 3: 访问网站

在浏览器中打开：

- **官网首页**: http://localhost:5173
- **管理后台**: http://localhost:5173/admin/login
- **API 健康检查**: http://localhost:3000/api/health

---

## 🧪 测试验证

### 1. 测试 API 端点

```powershell
# 测试新闻列表
Invoke-WebRequest -Uri "http://localhost:3000/api/news?page=1" -UseBasicParsing | Select-Object -ExpandProperty Content

# 测试产品列表
Invoke-WebRequest -Uri "http://localhost:3000/api/products?page=1" -UseBasicParsing | Select-Object -ExpandProperty Content

# 测试联系表单
$body = @{name="测试";email="test@example.com";message="测试消息"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/api/contact" -UseBasicParsing -Method POST -Body $body -ContentType "application/json"
```

### 2. 测试管理后台登录

```powershell
# 管理员登录
$body = @{email="admin@company.com";password="Admin@123456"} | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/login" -UseBasicParsing -Method POST -Body $body -ContentType "application/json"
$response.Content
```

---

## 📱 页面访问清单

访问以下 URL 测试所有页面：

| 页面 | URL | 测试要点 |
|------|-----|----------|
| 首页 | http://localhost:5173 | Hero Banner、核心优势、产品展示 |
| 关于我们 | http://localhost:5173/about | 公司简介、团队介绍 |
| 产品中心 | http://localhost:5173/products | 产品列表、分类筛选 |
| 产品详情 | http://localhost:5173/products/1 | 产品详细信息 |
| 解决方案 | http://localhost:5173/solutions | 解决方案列表 |
| 新闻资讯 | http://localhost:5173/news | 新闻列表、分页 |
| 新闻详情 | http://localhost:5173/news/1 | 新闻完整内容 |
| 联系我们 | http://localhost:5173/contact | 联系表单提交 |
| 管理登录 | http://localhost:5173/admin/login | 登录功能 |
| 管理后台 | http://localhost:5173/admin/dashboard | 后台管理功能 |

---

## 🔧 常见问题

### Q1: 端口被占用

**错误**: `EADDRINUSE: address already in use :::3000`

**解决**:
```powershell
# 查找占用端口的进程
netstat -ano | findstr ":3000"

# 停止进程 (替换 PID)
Stop-Process -Id <PID> -Force
```

### Q2: NODE_OPTIONS 错误

**错误**: `--disable-warning= is not allowed in NODE_OPTIONS`

**解决**:
```powershell
$env:NODE_OPTIONS=""
```

### Q3: 中文显示乱码

**说明**: PowerShell 编码问题，不影响实际数据

**解决**: 使用浏览器查看前端页面，或切换 UTF-8 编码

### Q4: 数据库连接失败

**说明**: 当前使用模拟数据模式，无需数据库

**切换到生产数据库**:
```bash
# 修改 backend/.env
USE_MOCK_DATA=false
DB_USER=root
DB_PASSWORD=your_password
```

---

## 📦 生产构建

### 前端构建

```powershell
cd D:\codes\aicode\win-web\TASK-001\frontend
npm run build
```

**输出**: `frontend/dist/` 目录

### 构建产物检查

```powershell
# 查看构建大小
Get-ChildItem -Recurse D:\codes\aicode\win-web\TASK-001\frontend\dist | Measure-Object -Property Length -Sum

# 检查文件
ls D:\codes\aicode\win-web\TASK-001\frontend\dist
```

---

## 🚀 部署到生产环境

详细部署步骤请参考：
- **部署指南**: `DEPLOYMENT.md`
- **商用测试报告**: `tests/COMMERCIAL-TEST-REPORT.md`

### 关键步骤

1. 配置生产数据库
2. 修改默认管理员密码
3. 启用 HTTPS
4. 替换真实内容和图片
5. 配置域名和 SSL 证书
6. 部署到服务器 (Nginx + PM2)

---

## 📞 技术支持

### 默认账号

**管理员登录**:
- 邮箱：admin@company.com
- 密码：Admin@123456
- ⚠️ **生产环境必须修改!**

### 文档链接

- [项目 README](./README.md)
- [商用测试报告](./tests/COMMERCIAL-TEST-REPORT.md)
- [部署指南](./DEPLOYMENT.md)
- [API 测试用例](./tests/api-tests.md)

---

## ✅ 上线检查清单

部署前必须完成:

- [ ] 后端服务正常运行
- [ ] 前端页面正常访问
- [ ] 所有 API 端点测试通过
- [ ] 管理后台登录正常
- [ ] 联系表单可以提交
- [ ] HTTPS 已配置
- [ ] 默认密码已修改
- [ ] 真实内容已替换
- [ ] 数据库已配置 (如使用)
- [ ] 错误监控已配置

---

**启动成功提示**: 看到两个服务都在运行，浏览器可以正常访问网站，即表示启动成功！🎉
