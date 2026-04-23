const express = require('express');
const router = express.Router();
// 使用真实数据库控制器
const newsController = require('../controllers/news');
const { authenticate } = require('../middleware/auth');

// 公开路由
router.get('/', newsController.getList);
router.get('/:id', newsController.getDetail);

// 管理路由 (需要认证)
router.post('/', authenticate, newsController.create);
router.put('/:id', authenticate, newsController.update);
router.delete('/:id', authenticate, newsController.delete);

module.exports = router;
