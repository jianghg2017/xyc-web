require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态资源服务 - 图片目录
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  });
});

// 图片目录信息
app.get('/api/images/info', (req, res) => {
  res.json({
    baseUrl: '/images',
    directories: ['products', 'news', 'banners', 'team', 'logo'],
    fullUrl: `http://localhost:${PORT}/images`
  });
});

// 公共数据路由 (放在前面，避免被其他路由拦截)
app.use('/api', require('./routes/public-data'));

// 业务路由
app.use('/api/news', require('./routes/news'));
app.use('/api/products', require('./routes/products'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chat', require('./routes/chat'));

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server Error' });
});

// 启动服务器
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // LLM 配置检查
  if (!process.env.LLM_API_URL || !process.env.LLM_API_KEY) {
    console.warn('Warning: LLM_API_URL or LLM_API_KEY is not configured. AI chat service will be unavailable.');
  }
  
  if (process.env.USE_MOCK_DATA === 'true') {
    console.log('Mock data mode enabled - skipping database initialization');
  } else {
    try {
      await initDatabase();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Fatal: Database connection failed:', error.message);
      process.exit(1);
    }
  }
});

module.exports = app;
 
 
 
 
