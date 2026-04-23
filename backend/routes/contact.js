const express = require('express');
const router = express.Router();
// 使用真实数据库控制器
const contactController = require('../controllers/contact');

// 公开路由
router.post('/', contactController.submit);

module.exports = router;
