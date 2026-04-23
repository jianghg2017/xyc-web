const { pool } = require('../database/init');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 管理员登录
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [admins] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);

    if (admins.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = admins[0];
    const validPassword = await bcrypt.compare(password, admin.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      data: {
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 管理员登出
exports.logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

// 获取管理员资料
exports.getProfile = async (req, res) => {
  try {
    const [admins] = await pool.query(
      'SELECT id, email, name, created_at FROM admins WHERE id = ?',
      [req.admin.id]
    );

    if (admins.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({ data: admins[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
