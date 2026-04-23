// 新闻控制器 - 使用模拟数据
const mockData = require('../mock-data');

// 获取新闻列表
exports.getList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    
    let newsList = mockData.news.filter(n => n.status === 'published');
    
    if (category) {
      newsList = newsList.filter(n => n.category === category);
    }
    
    const total = newsList.length;
    const startIndex = (page - 1) * limit;
    const paginatedNews = newsList.slice(startIndex, startIndex + limit);
    
    res.json({
      success: true,
      data: paginatedNews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get news list error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 获取新闻详情
exports.getDetail = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const news = mockData.news.find(n => n.id === id && n.status === 'published');
    
    if (!news) {
      return res.status(404).json({ success: false, error: 'News not found' });
    }
    
    // 增加阅读量
    news.views = (news.views || 0) + 1;
    
    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Get news detail error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 创建新闻 (管理)
exports.create = async (req, res) => {
  try {
    const newNews = {
      id: mockData.news.length + 1,
      ...req.body,
      status: req.body.status || 'draft',
      views: 0,
      created_at: new Date().toISOString()
    };
    
    mockData.news.push(newNews);
    
    res.status(201).json({
      success: true,
      data: newNews,
      message: 'News created successfully'
    });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 更新新闻 (管理)
exports.update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = mockData.news.findIndex(n => n.id === id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'News not found' });
    }
    
    mockData.news[index] = {
      ...mockData.news[index],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: mockData.news[index],
      message: 'News updated successfully'
    });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 删除新闻 (管理)
exports.delete = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = mockData.news.findIndex(n => n.id === id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'News not found' });
    }
    
    mockData.news.splice(index, 1);
    
    res.json({
      success: true,
      message: 'News deleted successfully'
    });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
