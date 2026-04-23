# 项目迁移说明

**迁移时间**: 2026-04-12 18:24  
**迁移原因**: 将项目从工作区移动到本地开发目录

---

## 📁 迁移详情

### 源路径 (已废弃)
```
C:\Users\admin\AppData\Roaming\winclaw\.openclaw\workspace\tasks\TASK-001
```

### 目标路径 (当前使用)
```
D:\codes\aicode\win-web\TASK-001
```

---

## 📂 项目结构

```
D:\codes\aicode\win-web\
└── TASK-001/
    ├── backend/              # 后端代码
    │   ├── controllers/
    │   ├── database/
    │   ├── middleware/
    │   ├── routes/
    │   ├── server.js
    │   ├── package.json
    │   └── .env
    │
    ├── frontend/             # 前端代码
    │   ├── src/
    │   ├── public/
    │   ├── index.html
    │   ├── package.json
    │   ├── vite.config.ts
    │   ├── tailwind.config.js
    │   └── start.bat
    │
    ├── tests/                # 测试文件
    │   ├── api-tests.md
    │   ├── test-plan.md
    │   └── COMMERCIAL-TEST-REPORT.md
    │
    ├── prd.md                # 产品需求文档
    ├── design-spec.md        # 设计规范
    ├── QUICKSTART.md         # 快速启动指南
    ├── PROJECT-SUMMARY.md    # 项目总结
    ├── DEPLOYMENT.md         # 部署指南
    ├── status.md             # 项目状态
    └── README.md             # 项目说明
```

---

## 🚀 启动项目

### 后端服务

```powershell
cd D:\codes\aicode\win-web\TASK-001\backend
netstat -ano | findstr :3000 | findstr LISTENIN
taskkill -F /PID 37332
start /B node server.js
```

### 前端服务

```powershell
cd D:\codes\aicode\win-web\TASK-001\frontend
.\start.bat
```

---

## 📱 访问地址

- **官网**: http://localhost:5173
- **管理后台**: http://localhost:5173/admin/login
- **API 健康检查**: http://localhost:3000/api/health

---

## ⚠️ 注意事项

1. **服务需要同时运行**: 前端和后端需要在两个独立的终端窗口运行
2. **端口占用**: 如果端口被占用，需要先停止旧进程
3. **环境变量**: 确保 `.env` 文件中的数据库配置正确

---

## 📄 重要文档

- **快速启动**: `QUICKSTART.md`
- **项目总结**: `PROJECT-SUMMARY.md`
- **部署指南**: `DEPLOYMENT.md`
- **CSS 修复**: `CSS-FIX.md`
- **商用测试**: `tests/COMMERCIAL-TEST-REPORT.md`

---

**迁移完成**: ✅ 2026-04-12 18:24  
**迁移工具**: WinClaw AI Assistant
