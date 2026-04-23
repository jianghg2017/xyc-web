const { pool } = require('../database/init');

/**
 * 安全解析 JSON 字段：
 * - 如果已经是对象/数组（MySQL JSON 类型自动解析），直接返回
 * - 如果是字符串，尝试 JSON.parse
 * - 否则返回默认值
 */
function parseJsonField(value, defaultValue) {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return defaultValue; }
}

/**
 * 获取产品列表（管理端）
 */
exports.getList = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      status,
      keyword,
      sortBy = 'sort_order',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM products WHERE 1=1';
    let countSql = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
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
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      countSql += ' AND (name LIKE ? OR description LIKE ?)';
      const likeKeyword = `%${keyword}%`;
      params.push(likeKeyword, likeKeyword);
      countParams.push(likeKeyword, likeKeyword);
    }

    // 排序
    const validSortFields = ['sort_order', 'created_at', 'views', 'id', 'name'];
    const validSortOrders = ['ASC', 'DESC'];
    if (!validSortFields.includes(sortBy)) {
      sortBy = 'sort_order';
    }
    if (!validSortOrders.includes(sortOrder.toUpperCase())) {
      sortOrder = 'ASC';
    }
    sql += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    // 执行查询
    const [productsList] = await pool.query(sql, params);
    const [countResult] = await pool.query(countSql, countParams);

    // 解析 JSON 字段（MySQL JSON 类型已自动解析，字符串类型才需要手动解析）
    const products = productsList.map(product => ({
      ...product,
      gallery: parseJsonField(product.gallery, []),
      features: parseJsonField(product.features, []),
      specs: parseJsonField(product.specs, {})
    }));

    res.json({
      data: products,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get products list error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 获取产品详情
 */
exports.getDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [products] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[0];
    
    // 解析 JSON 字段（MySQL JSON 类型已自动解析，字符串类型才需要手动解析）
    const productData = {
      ...product,
      gallery: parseJsonField(product.gallery, []),
      features: parseJsonField(product.features, []),
      specs: parseJsonField(product.specs, {})
    };

    // 增加浏览量
    await pool.query(
      'UPDATE products SET views = views + 1 WHERE id = ?',
      [id]
    );

    res.json({ data: productData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 创建产品
 */
exports.create = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      content, 
      cover_image, 
      gallery,
      category, 
      subcategory,
      features,
      specs,
      price,
      download_url,
      video_url,
      status = 'draft'
    } = req.body;

    // 验证必填字段
    if (!name || !category) {
      return res.status(400).json({ 
        error: 'Name and category are required' 
      });
    }

    const [result] = await pool.query(
      `INSERT INTO products 
       (name, description, content, cover_image, gallery, category, subcategory, 
        features, specs, price, download_url, video_url, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, content, cover_image, 
       JSON.stringify(gallery || []), 
       category, subcategory,
       JSON.stringify(features || []), 
       JSON.stringify(specs || {}),
       price, download_url, video_url, status]
    );

    res.status(201).json({ 
      data: { id: result.insertId },
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 更新产品
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      content, 
      cover_image, 
      gallery,
      category, 
      subcategory,
      features,
      specs,
      price,
      download_url,
      video_url,
      status,
      sort_order
    } = req.body;

    // 检查产品是否存在
    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updateFields = [];
    const params = [];

    if (name !== undefined) { updateFields.push('name = ?'); params.push(name); }
    if (description !== undefined) { updateFields.push('description = ?'); params.push(description); }
    if (content !== undefined) { updateFields.push('content = ?'); params.push(content); }
    if (cover_image !== undefined) { updateFields.push('cover_image = ?'); params.push(cover_image); }
    if (gallery !== undefined) { updateFields.push('gallery = ?'); params.push(JSON.stringify(gallery)); }
    if (category !== undefined) { updateFields.push('category = ?'); params.push(category); }
    if (subcategory !== undefined) { updateFields.push('subcategory = ?'); params.push(subcategory); }
    if (features !== undefined) { updateFields.push('features = ?'); params.push(JSON.stringify(features)); }
    if (specs !== undefined) { updateFields.push('specs = ?'); params.push(JSON.stringify(specs)); }
    if (price !== undefined) { updateFields.push('price = ?'); params.push(price); }
    if (download_url !== undefined) { updateFields.push('download_url = ?'); params.push(download_url); }
    if (video_url !== undefined) { updateFields.push('video_url = ?'); params.push(video_url); }
    if (status !== undefined) { updateFields.push('status = ?'); params.push(status); }
    if (sort_order !== undefined) { updateFields.push('sort_order = ?'); params.push(sort_order); }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);

    await pool.query(
      `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ 
      data: { id: parseInt(id) },
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 删除产品
 */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // 检查产品是否存在
    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await pool.query('DELETE FROM products WHERE id = ?', [id]);

    res.json({ 
      data: { id: parseInt(id) },
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 批量操作产品
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
        sql = 'DELETE FROM products WHERE id IN (?)';
        params = [ids];
        break;
      case 'publish':
        sql = 'UPDATE products SET status = ? WHERE id IN (?)';
        params = ['published', ids];
        break;
      case 'draft':
        sql = 'UPDATE products SET status = ? WHERE id IN (?)';
        params = ['draft', ids];
        break;
      case 'hidden':
        sql = 'UPDATE products SET status = ? WHERE id IN (?)';
        params = ['hidden', ids];
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    const [result] = await pool.query(sql, params);

    res.json({ 
      data: { affectedRows: result.affectedRows },
      message: `Successfully ${action} ${result.affectedRows} products`
    });
  } catch (error) {
    console.error('Batch operation error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 更新产品排序
 */
exports.updateSort = async (req, res) => {
  try {
    const { products } = req.body; // [{id: 1, sort_order: 0}, {id: 2, sort_order: 1}]

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ error: 'Products array is required' });
    }

    const updatePromises = products.map(item => 
      pool.query(
        'UPDATE products SET sort_order = ? WHERE id = ?',
        [item.sort_order, item.id]
      )
    );

    await Promise.all(updatePromises);

    res.json({ 
      data: { updated: products.length },
      message: 'Sort order updated successfully'
    });
  } catch (error) {
    console.error('Update sort error:', error);
    res.status(500).json({ error: error.message });
  }
};
