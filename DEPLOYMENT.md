# 部署指南

## 生产环境部署

### 1. 环境准备

#### 服务器要求
- CPU: 2 核+
- 内存：4GB+
- 磁盘：20GB+
- 操作系统：Linux (Ubuntu 20.04+) / Windows Server 2019+

#### 软件依赖
- Node.js v24.13.1+
- MySQL 8.0+
- Nginx (可选，用于反向代理)

### 2. 数据库部署

```bash
# 安装 MySQL (Ubuntu)
sudo apt update
sudo apt install mysql-server

# 安全配置
sudo mysql_secure_installation

# 创建数据库
mysql -u root -p
```

在 MySQL 中执行:

```sql
CREATE DATABASE company_website CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE company_website;

-- 导入表结构
SOURCE /path/to/schema.sql;

-- 创建应用用户
CREATE USER 'website_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON company_website.* TO 'website_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. 后端部署

#### 3.1 上传代码

```bash
cd /var/www/company-website
# 上传或 git clone 后端代码
```

#### 3.2 安装依赖

```bash
cd backend
npm install --production
```

#### 3.3 配置环境变量

创建 `/var/www/company-website/backend/.env`:

```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=website_user
DB_PASSWORD=your_secure_password
DB_NAME=company_website
JWT_SECRET=your_super_secure_jwt_secret_key_change_this
JWT_EXPIRES_IN=24h
```

#### 3.4 使用 PM2 管理进程

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start backend/server.js --name company-website-api

# 保存配置
pm2 save

# 设置开机自启
pm2 startup
```

### 4. 前端部署

#### 4.1 构建生产版本

```bash
cd frontend
npm run build
```

构建产物在 `frontend/dist/` 目录

#### 4.2 配置 Nginx

创建 `/etc/nginx/sites-available/company-website`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root /var/www/company-website/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置:

```bash
sudo ln -s /etc/nginx/sites-available/company-website /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL 证书配置 (HTTPS)

使用 Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 6. 监控和日志

#### PM2 日志

```bash
# 查看日志
pm2 logs company-website-api

# 实时监控
pm2 monit
```

#### Nginx 日志

```bash
# 访问日志
tail -f /var/log/nginx/access.log

# 错误日志
tail -f /var/log/nginx/error.log
```

### 7. 备份策略

#### 数据库备份

```bash
# 创建备份脚本
cat > /usr/local/bin/backup-database.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u website_user -p'your_password' company_website > $BACKUP_DIR/backup_$DATE.sql
# 保留最近 7 天的备份
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-database.sh

# 添加 cron 任务 (每天凌晨 2 点)
crontab -e
0 2 * * * /usr/local/bin/backup-database.sh
```

#### 代码备份

```bash
# 定期备份代码目录
tar -czf /var/backups/company-website-code-$(date +%Y%m%d).tar.gz /var/www/company-website
```

## 本地开发环境部署

### Windows 开发环境

```powershell
# 1. 安装 Node.js v24.13.1
# 从 https://nodejs.org/ 下载安装

# 2. 安装 MySQL
# 从 https://dev.mysql.com/downloads/ 下载安装

# 3. 克隆项目
cd D:\codes\aicode\win-web\TASK-001

# 4. 安装后端依赖
cd backend
npm install

# 5. 配置数据库
copy .env.example .env
# 编辑 .env 文件

# 6. 启动后端
npm start

# 7. 安装前端依赖 (新窗口)
cd ..\frontend
npm install

# 8. 启动前端
npm run dev
```

## 健康检查

### 后端健康检查

```bash
curl http://localhost:3000/api/health
```

### 前端健康检查

浏览器访问:
- http://localhost:5173 (开发)
- http://localhost (生产，经 Nginx)

### API 端点检查

```bash
# 公开 API
curl http://localhost:3000/api/news?page=1

# 管理 API (需要登录)
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 故障排查

### 问题 1: 后端无法启动

**检查**:
```bash
# 查看端口占用
netstat -ano | findstr :3000

# 查看日志
pm2 logs company-website-api
```

### 问题 2: 数据库连接失败

**检查**:
```bash
# 测试数据库连接
mysql -u website_user -p -h localhost company_website

# 检查 MySQL 服务
sudo systemctl status mysql
```

### 问题 3: 前端构建失败

**检查**:
```bash
# 清理缓存
cd frontend
rm -rf node_modules package-lock.json
npm install

# 检查 TypeScript 错误
npm run build
```

### 问题 4: Nginx 502 Bad Gateway

**检查**:
```bash
# 确认后端运行
pm2 list

# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

## 性能优化

### 前端优化

1. **代码分割**: 已配置路由懒加载
2. **图片优化**: 使用 WebP 格式，添加懒加载
3. **CDN**: 静态资源可使用 CDN

### 后端优化

1. **数据库索引**: 为常用查询字段添加索引
2. **缓存**: 使用 Redis 缓存热点数据
3. **压缩**: 启用 gzip 压缩

### Nginx 优化

```nginx
# 启用 gzip
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# 静态资源缓存
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 安全建议

1. **定期更新**: 保持 Node.js、MySQL、Nginx 最新版本
2. **防火墙**: 仅开放必要端口 (80, 443, 22)
3. **SSH 安全**: 使用密钥登录，禁用密码
4. **数据库**: 限制远程访问，使用强密码
5. **JWT**: 使用强密钥，定期更换
6. **HTTPS**: 强制使用 HTTPS
7. **备份**: 定期备份数据库和代码
8. **监控**: 设置异常访问告警

---

**文档版本**: 1.0.0  
**最后更新**: 2026-04-12  
**维护者**: WinClaw AI
