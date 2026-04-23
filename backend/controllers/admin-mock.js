// 管理员控制器 - 模拟认证
const jwt = require('jsonwebtoken');

const MOCK_ADMIN = {
  email: process.env.ADMIN_EMAIL || 'admin@company.com',
  password: process.env.ADMIN_PASSWORD || 'Admin@123456',
  name: '管理员'
};

// 登录
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: '请输入邮箱和密码'
      });
    }
    
    // 模拟验证 (实际应查询数据库)
    if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
      const token = jwt.sign(
        { email: MOCK_ADMIN.email, role: 'admin' },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );
      
      res.json({
        success: true,
        data: {
          token,
          user: {
            email: MOCK_ADMIN.email,
            name: MOCK_ADMIN.name,
            role: 'admin'
          }
        },
        message: 'Login successful'
      });
    } else {
      res.status(401).json({
        success: false,
        error: '邮箱或密码错误'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 获取管理员信息
exports.getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        email: MOCK_ADMIN.email,
        name: MOCK_ADMIN.name,
        role: 'admin'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 登出 (客户端删除 token 即可)
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};
