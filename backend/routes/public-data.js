const express = require('express');
const router = express.Router();
const publicDataController = require('../controllers/public-data');

// 核心优势
router.get('/features', publicDataController.getFeatures);

// 公司统计
router.get('/stats', async (req, res) => {
  try {
    const { pool } = require('../database/init');
    const [rows] = await pool.query(
      'SELECT * FROM company_stats WHERE status = ? ORDER BY sort_order ASC',
      ['active']
    );
    
    res.json({
      success: true,
      data: rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
      message: error.message
    });
  }
});

// 发展历程
router.get('/timeline', async (req, res) => {
  try {
    const { pool } = require('../database/init');
    const [rows] = await pool.query(
      'SELECT * FROM company_timeline WHERE status = ? ORDER BY sort_order ASC',
      ['active']
    );
    
    res.json({
      success: true,
      data: rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timeline',
      message: error.message
    });
  }
});

// 核心价值观
router.get('/values', async (req, res) => {
  try {
    const { pool } = require('../database/init');
    const [rows] = await pool.query(
      'SELECT * FROM company_values WHERE status = ? ORDER BY sort_order ASC',
      ['active']
    );
    
    res.json({
      success: true,
      data: rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching values:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch values',
      message: error.message
    });
  }
});

// 网站设置
router.get('/settings', async (req, res) => {
  try {
    const { pool } = require('../database/init');
    const { category } = req.query;
    
    let query = 'SELECT * FROM site_settings';
    let params = [];
    
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY id ASC';
    
    const [rows] = await pool.query(query, params);
    
    // 转换为键值对格式
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    
    res.json({
      success: true,
      data: settings,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settings',
      message: error.message
    });
  }
});

// 获取单个设置项
router.get('/settings/:key', async (req, res) => {
  try {
    const { pool } = require('../database/init');
    const { key } = req.params;
    
    const [rows] = await pool.query(
      'SELECT * FROM site_settings WHERE setting_key = ?',
      [key]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Setting not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0].setting_value,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch setting',
      message: error.message
    });
  }
});

// 轮播图
router.get('/banners', async (req, res) => {
  try {
    const { pool } = require('../database/init');
    const { location, status = 'active' } = req.query;
    
    let query = 'SELECT * FROM banners WHERE status = ?';
    let params = [status];
    
    if (location) {
      query += ' AND location = ?';
      params.push(location);
    }
    
    query += ' ORDER BY sort_order ASC';
    
    const [rows] = await pool.query(query, params);
    
    res.json({
      success: true,
      data: rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch banners',
      message: error.message
    });
  }
});

module.exports = router;
