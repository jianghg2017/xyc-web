// 产品控制器 - 使用模拟数据
const mockData = require('../mock-data');

// 获取产品列表
exports.getList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    
    let products = mockData.products.filter(p => p.status === 'published');
    
    if (category) {
      products = products.filter(p => p.category === category);
    }
    
    // 按排序顺序
    products.sort((a, b) => a.sort_order - b.sort_order);
    
    const total = products.length;
    const startIndex = (page - 1) * limit;
    const paginatedProducts = products.slice(startIndex, startIndex + limit);
    
    res.json({
      success: true,
      data: paginatedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products list error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 获取产品详情
exports.getDetail = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = mockData.products.find(p => p.id === id && p.status === 'published');
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product detail error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 创建产品 (管理)
exports.create = async (req, res) => {
  try {
    const newProduct = {
      id: mockData.products.length + 1,
      ...req.body,
      status: req.body.status || 'draft',
      sort_order: req.body.sort_order || 0,
      created_at: new Date().toISOString()
    };
    
    mockData.products.push(newProduct);
    
    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 更新产品 (管理)
exports.update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = mockData.products.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    mockData.products[index] = {
      ...mockData.products[index],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: mockData.products[index],
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 删除产品 (管理)
exports.delete = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = mockData.products.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    mockData.products.splice(index, 1);
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
