const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// 导入真实控制器
const adminController = require('../controllers/admin');
const adminDashboard = require('../controllers/admin-dashboard');
const newsController = require('../controllers/news');
const productsController = require('../controllers/products');
const contactController = require('../controllers/contact');

// JWT 验证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, admin) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.admin = admin;
    next();
  });
};

// ==================== 公开路由 ====================

// 管理员登录
router.post('/login', adminController.login);

// 管理员登出
router.post('/logout', adminController.logout);

// ==================== 需要认证的路由 ====================

// 获取管理员资料
router.get('/profile', authenticateToken, adminController.getProfile);

// 获取概览数据
router.get('/dashboard', authenticateToken, adminDashboard.getDashboard);

// 获取系统信息
router.get('/system-info', authenticateToken, adminDashboard.getSystemInfo);

// ==================== 新闻管理 ====================

// 获取新闻列表
router.get('/news', authenticateToken, newsController.getList);

// 获取新闻详情
router.get('/news/:id', authenticateToken, newsController.getDetail);

// 创建新闻
router.post('/news', authenticateToken, newsController.create);

// 更新新闻
router.put('/news/:id', authenticateToken, newsController.update);

// 删除新闻
router.delete('/news/:id', authenticateToken, newsController.delete);

// 批量操作新闻
router.post('/news/batch', authenticateToken, newsController.batchOperation);

// ==================== 产品管理 ====================

// 获取产品列表
router.get('/products', authenticateToken, productsController.getList);

// 获取产品详情
router.get('/products/:id', authenticateToken, productsController.getDetail);

// 创建产品
router.post('/products', authenticateToken, productsController.create);

// 更新产品
router.put('/products/:id', authenticateToken, productsController.update);

// 删除产品
router.delete('/products/:id', authenticateToken, productsController.delete);

// 批量操作产品
router.post('/products/batch', authenticateToken, productsController.batchOperation);

// 更新产品排序
router.post('/products/sort', authenticateToken, productsController.updateSort);

// ==================== 留言管理 ====================

// 获取留言列表
router.get('/contacts', authenticateToken, contactController.getList);

// 获取留言详情
router.get('/contacts/:id', authenticateToken, contactController.getById);

// 更新留言状态
router.put('/contacts/:id', authenticateToken, contactController.updateStatus);

// 回复留言
router.post('/contacts/:id/reply', authenticateToken, contactController.reply);

// 删除留言
router.delete('/contacts/:id', authenticateToken, contactController.delete);

// 批量操作留言
router.post('/contacts/batch', authenticateToken, contactController.batchOperation);

// 导出留言
router.get('/contacts/export', authenticateToken, contactController.export);

// ==================== 图片上传 ====================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = ['news', 'products', 'banners'].includes(req.query.type) ? req.query.type : 'news';
    const dir = path.join(__dirname, '../public/images', type);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid file type'));
    }
  }
});

router.post('/upload', authenticateToken, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large' });
        }
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message || 'Upload failed' });
    }
    const type = ['news', 'products', 'banners'].includes(req.query.type) ? req.query.type : 'news';
    res.json({
      success: true,
      data: { url: `/images/${type}/${req.file.filename}` }
    });
  });
});

module.exports = router;
