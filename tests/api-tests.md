# API 测试用例

## 公开 API

### GET /api/news
```bash
curl http://localhost:3000/api/news?page=1&limit=10
```

**预期响应**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

### GET /api/news/:id
```bash
curl http://localhost:3000/api/news/1
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "新闻标题",
    "content": "新闻内容",
    "author": "作者",
    "publishedAt": "2026-04-12T00:00:00Z"
  }
}
```

### GET /api/products
```bash
curl http://localhost:3000/api/products?page=1&limit=10&category=hardware
```

**预期响应**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {...}
}
```

### POST /api/contact
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "email": "zhangsan@example.com",
    "company": "某某公司",
    "phone": "13800138000",
    "message": "咨询内容"
  }'
```

**预期响应**:
```json
{
  "success": true,
  "message": "提交成功"
}
```

## 管理 API

### POST /api/admin/login
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**预期响应**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### GET /api/admin/news (需要认证)
```bash
curl http://localhost:3000/api/admin/news?page=1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### POST /api/admin/news (需要认证)
```bash
curl -X POST http://localhost:3000/api/admin/news \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "新新闻",
    "content": "新闻内容",
    "author": "admin"
  }'
```

### PUT /api/admin/news/:id (需要认证)
```bash
curl -X PUT http://localhost:3000/api/admin/news/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "更新后的标题",
    "content": "更新后的内容"
  }'
```

### DELETE /api/admin/news/:id (需要认证)
```bash
curl -X DELETE http://localhost:3000/api/admin/news/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 测试脚本

### Postman Collection

可以导入以下 JSON 创建 Postman Collection:

```json
{
  "info": {
    "name": "公司官网 API 测试",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "公开 API",
      "item": [
        {
          "name": "获取新闻列表",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/news?page=1&limit=10"
          }
        },
        {
          "name": "提交联系表单",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/contact",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"测试用户\",\n  \"email\": \"test@example.com\",\n  \"message\": \"测试消息\"\n}"
            }
          }
        }
      ]
    },
    {
      "name": "管理 API",
      "item": [
        {
          "name": "管理员登录",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/admin/login",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"admin\",\n  \"password\": \"admin123\"\n}"
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    }
  ]
}
```
