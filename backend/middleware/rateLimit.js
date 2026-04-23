/**
 * 内存速率限制中间件
 * 基于 IP 地址限制请求频率，每分钟最多 20 次请求
 * Requirements: 6.6
 */

const rateLimitMap = new Map();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60 * 1000; // 1 分钟

// 定期清理过期条目，防止内存泄漏
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now - entry.startTime >= RATE_WINDOW) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_WINDOW);

/**
 * 速率限制中间件
 * 单个 IP 每分钟最多 RATE_LIMIT 次请求
 * 超出限制返回 HTTP 429
 */
function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.startTime >= RATE_WINDOW) {
    // 首次请求或窗口已过期，重置计数
    rateLimitMap.set(ip, { count: 1, startTime: now });
    return next();
  }

  if (entry.count < RATE_LIMIT) {
    // 未超出限制，递增计数
    entry.count++;
    return next();
  }

  // 超出限制
  return res.status(429).json({
    success: false,
    error: '请求过于频繁，请稍后再试'
  });
}

// 导出中间件函数和内部状态（用于测试）
module.exports = rateLimit;
module.exports.rateLimitMap = rateLimitMap;
module.exports.RATE_LIMIT = RATE_LIMIT;
module.exports.RATE_WINDOW = RATE_WINDOW;
