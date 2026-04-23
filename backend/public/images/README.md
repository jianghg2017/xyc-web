# 图片资源目录

## 📁 目录结构

```
backend/public/images/
├── products/          # 产品图片
│   ├── product-1.jpg          # 工业防火墙
│   ├── product-2.jpg          # 安全审计系统
│   └── ...
├── news/             # 新闻配图
│   ├── news-1.jpg             # 获奖新闻
│   ├── news-2.jpg             # 新品发布
│   └── ...
├── banners/          # 轮播图
│   ├── banner-1.jpg           # 首页轮播 1
│   ├── banner-2.jpg           # 首页轮播 2
│   └── ...
├── team/             # 团队照片
│   ├── team-1.jpg             # 团队成员
│   └── ...
└── logo/             # Logo 和图标
    ├── logo.png               # 公司 Logo
    ├── logo-white.png         # 白色 Logo (深色背景用)
    └── favicon.ico            # 网站图标
```

## 📐 图片规格建议

### 产品图片
- **尺寸**: 800x600px 或 1200x800px
- **格式**: JPG (照片) / PNG (带透明背景)
- **文件大小**: < 500KB
- **用途**: 产品列表、产品详情

### 新闻配图
- **尺寸**: 1200x630px (推荐社交媒体分享尺寸)
- **格式**: JPG
- **文件大小**: < 300KB
- **用途**: 新闻列表、新闻详情、社交分享

### 轮播图
- **尺寸**: 1920x1080px (全高清)
- **格式**: JPG
- **文件大小**: < 800KB
- **用途**: 首页 Hero Banner

### 团队照片
- **尺寸**: 400x400px (正方形)
- **格式**: JPG / PNG
- **文件大小**: < 200KB
- **用途**: 团队成员展示

### Logo
- **尺寸**: 200x60px (横向) / 100x100px (方形)
- **格式**: PNG (透明背景) / SVG
- **文件大小**: < 50KB
- **用途**: 导航栏、页脚、浏览器标签

### Favicon
- **尺寸**: 32x32px / 64x64px
- **格式**: ICO / PNG
- **用途**: 浏览器标签页图标

## 📝 使用说明

### 1. 在数据库中存储图片路径

```sql
-- 产品图片
INSERT INTO products (name, cover_image, ...) 
VALUES ('工业防火墙', '/images/products/product-1.jpg', ...);

-- 新闻配图
INSERT INTO news (title, cover_image, ...) 
VALUES ('新闻标题', '/images/news/news-1.jpg', ...);

-- 轮播图
INSERT INTO banners (title, image_url, ...) 
VALUES ('轮播标题', '/images/banners/banner-1.jpg', ...);
```

### 2. 前端引用图片

```tsx
// 直接使用相对路径
<img src="/images/products/product-1.jpg" alt="产品" />

// 或使用变量
const imageUrl = `/images/news/${news.coverImage}`;
<img src={imageUrl} alt={news.title} />
```

### 3. 图片上传 (后台管理)

后台管理系统支持：
- 单张图片上传
- 多图上传 (产品图库)
- 图片裁剪和压缩
- 自动重命名和存储

上传后的图片会自动保存到对应目录。

## 🛠️ 图片处理工具

### 推荐工具

1. **Photoshop** - 专业图片编辑
2. **GIMP** - 免费开源图片编辑
3. **TinyPNG** - 图片压缩在线工具
4. **IrfanView** - 批量图片处理

### 批量压缩命令 (可选)

```bash
# 使用 ImageMagick 批量压缩
mogrify -path ./compressed -quality 80 *.jpg

# 使用 pngquant 压缩 PNG
pngquant --quality=65-80 *.png
```

## 📋 图片清单

### 待准备图片

#### Logo 和图标
- [ ] 公司 Logo (PNG, 透明背景)
- [ ] Logo 白色版本 (用于深色背景)
- [ ] Favicon (ICO, 32x32)

#### 轮播图
- [ ] 首页轮播图 1 (1920x1080)
- [ ] 首页轮播图 2 (1920x1080)
- [ ] 首页轮播图 3 (1920x1080)

#### 产品图片
- [ ] 工业防火墙产品图
- [ ] 安全审计系统截图
- [ ] 入侵检测系统截图
- [ ] 其他产品图片...

#### 新闻配图
- [ ] 获奖新闻配图
- [ ] 新品发布配图
- [ ] 合作签约配图
- [ ] 其他新闻配图...

#### 团队照片
- [ ] 团队成员照片 (可选)
- [ ] 公司环境照片 (可选)

## 🔗 相关文档

- [数据库配置指南](./database/README.md)
- [API 文档](./docs/API.md)
- [开发计划](../DEVELOPMENT-PLAN.md)
