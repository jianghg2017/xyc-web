const express = require('express');
const router = express.Router();
// 使用真实数据库控制器
const productsController = require('../controllers/products');
const { authenticate } = require('../middleware/auth');

// 公开路由
router.get('/', productsController.getList);
router.get('/:id', productsController.getDetail);

// 管理路由 (需要认证)
router.post('/', authenticate, productsController.create);
router.put('/:id', authenticate, productsController.update);
router.delete('/:id', authenticate, productsController.delete);

module.exports = router;
