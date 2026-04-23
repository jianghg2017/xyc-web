const { pool } = require('../database/init');

// 获取核心优势列表
async function getFeatures(req, res) {
  try {
    const { status = 'active' } = req.query;
    
    const [rows] = await pool.query(
      'SELECT * FROM features WHERE status = ? ORDER BY sort_order ASC',
      [status]
    );
    
    res.json({
      success: true,
      data: rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching features:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch features',
      message: error.message
    });
  }
}

module.exports = {
  getFeatures
};
