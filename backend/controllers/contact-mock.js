// 联系表单控制器 - 使用模拟数据
const mockData = require('../mock-data');

// 提交联系表单
exports.submit = async (req, res) => {
  try {
    const { name, email, phone, company, type, message } = req.body;
    
    // 验证必填字段
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email and message are required'
      });
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }
    
    const newContact = {
      id: mockData.contacts.length + 1,
      name,
      email,
      phone: phone || '',
      company: company || '',
      type: type || 'general',
      message,
      status: 'new',
      created_at: new Date().toISOString()
    };
    
    mockData.contacts.push(newContact);
    
    console.log('New contact form submission:', newContact);
    
    res.status(201).json({
      success: true,
      data: newContact,
      message: 'Message submitted successfully. We will contact you soon.'
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 获取留言列表 (管理)
exports.getList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    
    let contacts = mockData.contacts;
    
    if (status) {
      contacts = contacts.filter(c => c.status === status);
    }
    
    // 按创建时间倒序
    contacts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    const total = contacts.length;
    const startIndex = (page - 1) * limit;
    const paginatedContacts = contacts.slice(startIndex, startIndex + limit);
    
    res.json({
      success: true,
      data: paginatedContacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 更新留言状态 (管理)
exports.updateStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    const index = mockData.contacts.findIndex(c => c.id === id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }
    
    if (!['new', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    
    mockData.contacts[index].status = status;
    
    res.json({
      success: true,
      data: mockData.contacts[index],
      message: 'Status updated successfully'
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
