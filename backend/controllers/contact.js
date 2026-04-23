const { pool } = require('../database/init');

/**
 * 提交联系表单（前端公开）
 */
exports.submit = async (req, res) => {
  try {
    const { name, email, phone, company, type, message } = req.body;
    
    // 验证必填字段
    if (!name || !email || !message || !type) {
      return res.status(400).json({ 
        error: 'Name, email, message and type are required' 
      });
    }

    const [result] = await pool.query(
      'INSERT INTO contacts (name, email, phone, company, type, message, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, company, type, message, req.ip, req.get('User-Agent')]
    );

    res.status(201).json({ 
      data: { id: result.insertId }, 
      message: 'Message sent successfully' 
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 获取留言列表（管理端）
 */
exports.getList = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status,
      type,
      keyword,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM contacts WHERE 1=1';
    let countSql = 'SELECT COUNT(*) as total FROM contacts WHERE 1=1';
    const params = [];
    const countParams = [];

    // 状态筛选
    if (status) {
      sql += ' AND status = ?';
      countSql += ' AND status = ?';
      params.push(status);
      countParams.push(status);
    }

    // 类型筛选
    if (type) {
      sql += ' AND type = ?';
      countSql += ' AND type = ?';
      params.push(type);
      countParams.push(type);
    }

    // 关键词搜索
    if (keyword) {
      sql += ' AND (name LIKE ? OR email LIKE ? OR message LIKE ?)';
      countSql += ' AND (name LIKE ? OR email LIKE ? OR message LIKE ?)';
      const likeKeyword = `%${keyword}%`;
      params.push(likeKeyword, likeKeyword, likeKeyword);
      countParams.push(likeKeyword, likeKeyword, likeKeyword);
    }

    // 排序
    const validSortFields = ['created_at', 'id', 'name', 'type', 'status'];
    const validSortOrders = ['ASC', 'DESC'];
    if (!validSortFields.includes(sortBy)) {
      sortBy = 'created_at';
    }
    if (!validSortOrders.includes(sortOrder.toUpperCase())) {
      sortOrder = 'DESC';
    }
    sql += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    // 执行查询
    const [contactsList] = await pool.query(sql, params);
    const [countResult] = await pool.query(countSql, countParams);

    res.json({
      data: contactsList,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get contacts list error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 获取留言详情
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [contacts] = await pool.query(
      'SELECT * FROM contacts WHERE id = ?',
      [id]
    );

    if (contacts.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // 如果是新留言，自动标记为已读
    if (contacts[0].status === 'new') {
      await pool.query(
        'UPDATE contacts SET status = ? WHERE id = ?',
        ['read', id]
      );
      contacts[0].status = 'read';
    }

    res.json({ data: contacts[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 更新留言状态
 */
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reply } = req.body;

    // 验证状态
    const validStatuses = ['new', 'read', 'replied', 'closed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    // 检查留言是否存在
    const [existing] = await pool.query('SELECT * FROM contacts WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const updateFields = [];
    const params = [];

    if (status) {
      updateFields.push('status = ?');
      params.push(status);
      
      // 如果状态改为 replied，记录回复时间和回复人
      if (status === 'replied' && req.admin) {
        updateFields.push('replied_at = ?, replied_by = ?');
        params.push(new Date(), req.admin.id);
      }
    }

    if (reply !== undefined) {
      updateFields.push('reply = ?');
      params.push(reply);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);

    await pool.query(
      `UPDATE contacts SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ 
      data: { id: parseInt(id) },
      message: 'Contact updated successfully'
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 回复留言
 */
exports.reply = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ error: 'Reply content is required' });
    }

    // 检查留言是否存在
    const [existing] = await pool.query('SELECT * FROM contacts WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    await pool.query(
      `UPDATE contacts 
       SET reply = ?, status = ?, replied_at = ?, replied_by = ? 
       WHERE id = ?`,
      [reply, 'replied', new Date(), req.admin?.id || null, id]
    );

    res.json({ 
      data: { id: parseInt(id) },
      message: 'Reply sent successfully'
    });
  } catch (error) {
    console.error('Reply contact error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 删除留言
 */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // 检查留言是否存在
    const [existing] = await pool.query('SELECT * FROM contacts WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    await pool.query('DELETE FROM contacts WHERE id = ?', [id]);

    res.json({ 
      data: { id: parseInt(id) },
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 批量操作留言
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
        sql = 'DELETE FROM contacts WHERE id IN (?)';
        params = [ids];
        break;
      case 'read':
        sql = 'UPDATE contacts SET status = ? WHERE id IN (?) AND status = ?';
        params = ['read', ids, 'new'];
        break;
      case 'close':
        sql = 'UPDATE contacts SET status = ? WHERE id IN (?)';
        params = ['closed', ids];
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    const [result] = await pool.query(sql, params);

    res.json({ 
      data: { affectedRows: result.affectedRows },
      message: `Successfully ${action} ${result.affectedRows} contacts`
    });
  } catch (error) {
    console.error('Batch operation error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 导出留言数据
 */
exports.export = async (req, res) => {
  try {
    const { status, type, startDate, endDate } = req.query;

    let sql = 'SELECT * FROM contacts WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    if (startDate) {
      sql += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND created_at <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY created_at DESC';

    const [contacts] = await pool.query(sql, params);

    // 返回 CSV 格式
    const headers = ['ID', '姓名', '邮箱', '电话', '公司', '类型', '状态', '内容', '提交时间', '回复', '回复时间'];
    const csvRows = contacts.map(contact => [
      contact.id,
      `"${contact.name}"`,
      `"${contact.email}"`,
      `"${contact.phone || ''}"`,
      `"${contact.company || ''}"`,
      contact.type,
      contact.status,
      `"${contact.message}"`,
      contact.created_at,
      `"${contact.reply || ''}"`,
      contact.replied_at || ''
    ]);

    const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Export contacts error:', error);
    res.status(500).json({ error: error.message });
  }
};
