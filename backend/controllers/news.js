const { pool } = require('../database/init');

/**
 * 获取新闻列表（管理端）
 */
exports.getList = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      status,
      keyword,
      sortBy = 'published_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM news WHERE 1=1';
    let countSql = 'SELECT COUNT(*) as total FROM news WHERE 1=1';
    const params = [];
    const countParams = [];

    // 分类筛选
    if (category) {
      sql += ' AND category = ?';
      countSql += ' AND category = ?';
      params.push(category);
      countParams.push(category);
    }

    // 状态筛选
    if (status) {
      sql += ' AND status = ?';
      countSql += ' AND status = ?';
      params.push(status);
      countParams.push(status);
    }

    // 关键词搜索
    if (keyword) {
      sql += ' AND (title LIKE ? OR summary LIKE ?)';
      countSql += ' AND (title LIKE ? OR summary LIKE ?)';
      const likeKeyword = `%${keyword}%`;
      params.push(likeKeyword, likeKeyword);
      countParams.push(likeKeyword, likeKeyword);
    }

    // 排序
    const validSortFields = ['published_at', 'created_at', 'views', 'id'];
    const validSortOrders = ['ASC', 'DESC'];
    if (!validSortFields.includes(sortBy)) {
      sortBy = 'published_at';
    }
    if (!validSortOrders.includes(sortOrder.toUpperCase())) {
      sortOrder = 'DESC';
    }
    sql += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    // 执行查询
    const [newsList] = await pool.query(sql, params);
    const [countResult] = await pool.query(countSql, countParams);

    res.json({
      data: newsList,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get news list error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 获取新闻详情
 */
exports.getDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [news] = await pool.query(
      'SELECT * FROM news WHERE id = ?',
      [id]
    );

    if (news.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    // 增加浏览量
    await pool.query(
      'UPDATE news SET views = views + 1 WHERE id = ?',
      [id]
    );

    res.json({ data: news[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 创建新闻
 */
exports.create = async (req, res) => {
  try {
    const { 
      title, 
      summary, 
      content, 
      cover_image, 
      category, 
      author,
      tags,
      seo_title,
      seo_description,
      status = 'draft'
    } = req.body;

    // 验证必填字段
    if (!title || !content || !category) {
      return res.status(400).json({ 
        error: 'Title, content and category are required' 
      });
    }

    const publishedAt = status === 'published' ? new Date() : null;

    const [result] = await pool.query(
      `INSERT INTO news 
       (title, summary, content, cover_image, category, author, tags, seo_title, seo_description, status, published_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, summary, content, cover_image, category, author, 
       JSON.stringify(tags || []), seo_title, seo_description, status, publishedAt]
    );

    res.status(201).json({ 
      data: { id: result.insertId },
      message: 'News created successfully'
    });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 更新新闻
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      summary, 
      content, 
      cover_image, 
      category, 
      author,
      tags,
      seo_title,
      seo_description,
      status,
      published_at
    } = req.body;

    // 检查新闻是否存在
    const [existing] = await pool.query('SELECT * FROM news WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    const updateFields = [];
    const params = [];

    if (title !== undefined) { updateFields.push('title = ?'); params.push(title); }
    if (summary !== undefined) { updateFields.push('summary = ?'); params.push(summary); }
    if (content !== undefined) { updateFields.push('content = ?'); params.push(content); }
    if (cover_image !== undefined) { updateFields.push('cover_image = ?'); params.push(cover_image); }
    if (category !== undefined) { updateFields.push('category = ?'); params.push(category); }
    if (author !== undefined) { updateFields.push('author = ?'); params.push(author); }
    if (tags !== undefined) { updateFields.push('tags = ?'); params.push(JSON.stringify(tags)); }
    if (seo_title !== undefined) { updateFields.push('seo_title = ?'); params.push(seo_title); }
    if (seo_description !== undefined) { updateFields.push('seo_description = ?'); params.push(seo_description); }
    if (status !== undefined) { 
      updateFields.push('status = ?'); 
      params.push(status);
      // 如果状态改为 published 且之前没有发布时间，设置当前时间
      if (status === 'published' && !existing[0].published_at) {
        updateFields.push('published_at = ?');
        params.push(new Date());
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);

    await pool.query(
      `UPDATE news SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ 
      data: { id: parseInt(id) },
      message: 'News updated successfully'
    });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 删除新闻
 */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // 检查新闻是否存在
    const [existing] = await pool.query('SELECT * FROM news WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    await pool.query('DELETE FROM news WHERE id = ?', [id]);

    res.json({ 
      data: { id: parseInt(id) },
      message: 'News deleted successfully'
    });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 批量操作新闻
 */
exports.batchOperation = async (req, res) => {
  try {
    const { action, ids } = req.body;

    if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        error: 'Action and ids array are required' 
      });
    }

    let sql;
    let params;

    switch (action) {
      case 'delete':
        sql = 'DELETE FROM news WHERE id IN (?)';
        params = [ids];
        break;
      case 'publish':
        sql = 'UPDATE news SET status = ?, published_at = ? WHERE id IN (?)';
        params = ['published', new Date(), ids];
        break;
      case 'draft':
        sql = 'UPDATE news SET status = ? WHERE id IN (?)';
        params = ['draft', ids];
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    const [result] = await pool.query(sql, params);

    res.json({ 
      data: { affectedRows: result.affectedRows },
      message: `Successfully ${action} ${result.affectedRows} news items`
    });
  } catch (error) {
    console.error('Batch operation error:', error);
    res.status(500).json({ error: error.message });
  }
};
