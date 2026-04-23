const express = require('express');
const router = express.Router();
const rateLimit = require('../middleware/rateLimit');
const chatController = require('../controllers/chat');

// 应用速率限制中间件，然后转发至聊天控制器
router.post('/', rateLimit, chatController.sendMessage);

module.exports = router;
