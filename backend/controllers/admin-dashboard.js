const { pool } = require('../database/init');

/**
 * 获取概览页面统计数据
 */
exports.getDashboard = async (req, res) => {
  try {
    // 1. 新闻统计
    const [newsStats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        (SELECT COUNT(*) FROM news WHERE DATE(created_at) = CURDATE()) as today_new
      FROM news
    `);

    // 2. 产品统计
    const [productStats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        (SELECT COUNT(*) FROM products WHERE DATE(created_at) = CURDATE()) as today_new
      FROM products
    `);

    // 3. 留言统计
    const [contactStats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as unread,
        SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as read_count,
        (SELECT COUNT(*) FROM contacts WHERE DATE(created_at) = CURDATE()) as today_new
      FROM contacts
    `);

    // 4. 近 7 天访客趋势 (这里用新闻浏览量模拟，实际应接入访问统计)
    const [visitorTrend] = await pool.query(`
      SELECT 
        DATE(published_at) as date,
        SUM(views) as visitors
      FROM news
      WHERE published_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(published_at)
      ORDER BY date
    `);

    // 5. 待处理事项
    const pendingItems = {
      unreadContacts: [],
      draftNews: [],
      lowStockProducts: []
    };

    // 未读留言
    const [unreadContacts] = await pool.query(`
      SELECT id, name, type, created_at 
      FROM contacts 
      WHERE status = 'new' 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    pendingItems.unreadContacts = unreadContacts;

    // 待审核新闻
    const [draftNews] = await pool.query(`
      SELECT id, title, created_at 
      FROM news 
      WHERE status = 'draft' 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    pendingItems.draftNews = draftNews;

    // 6. 最新新闻
    const [latestNews] = await pool.query(`
      SELECT id, title, category, status, published_at, views
      FROM news
      WHERE status = 'published'
      ORDER BY published_at DESC
      LIMIT 5
    `);

    // 7. 最新留言
    const [latestContacts] = await pool.query(`
      SELECT id, name, type, status, created_at
      FROM contacts
      ORDER BY created_at DESC
      LIMIT 5
    `);

    res.json({
      data: {
        statistics: {
          news: {
            total: newsStats[0].total || 0,
            published: newsStats[0].published || 0,
            draft: newsStats[0].draft || 0,
            todayNew: newsStats[0].today_new || 0
          },
          products: {
            total: productStats[0].total || 0,
            published: productStats[0].published || 0,
            draft: productStats[0].draft || 0,
            todayNew: productStats[0].today_new || 0
          },
          contacts: {
            total: contactStats[0].total || 0,
            unread: contactStats[0].unread || 0,
            read: contactStats[0].read_count || 0,
            todayNew: contactStats[0].today_new || 0
          },
          visitors: {
            today: visitorTrend[visitorTrend.length - 1]?.visitors || 0,
            week: visitorTrend.reduce((sum, item) => sum + (item.visitors || 0), 0)
          }
        },
        visitorTrend: visitorTrend.map(item => ({
          date: item.date,
          visitors: item.visitors || 0
        })),
        pendingItems,
        latestNews,
        latestContacts
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 获取系统信息
 */
exports.getSystemInfo = async (req, res) => {
  try {
    res.json({
      data: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: 'MySQL',
        lastUpdate: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
