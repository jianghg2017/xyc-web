const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'company_website',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

async function initDatabase() {
  const connection = await pool.getConnection();
  
  try {
    // 创建数据库（如果不存在）
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'company_website'} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE ${process.env.DB_NAME || 'company_website'}`);

    // 创建管理员表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL COMMENT '邮箱',
        password VARCHAR(255) NOT NULL COMMENT '密码 (bcrypt 加密)',
        name VARCHAR(255) COMMENT '姓名',
        avatar VARCHAR(500) COMMENT '头像 URL',
        role ENUM('super_admin', 'admin', 'editor') DEFAULT 'editor' COMMENT '角色',
        last_login_at DATETIME COMMENT '最后登录时间',
        last_login_ip VARCHAR(50) COMMENT '最后登录 IP',
        status ENUM('active', 'inactive', 'locked') DEFAULT 'active' COMMENT '状态',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表'
    `);

    // 创建新闻表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS news (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL COMMENT '标题',
        summary TEXT COMMENT '摘要/简介',
        content LONGTEXT NOT NULL COMMENT '正文内容 (HTML/Markdown)',
        cover_image VARCHAR(500) COMMENT '封面图片 URL',
        category VARCHAR(50) NOT NULL COMMENT '分类',
        author VARCHAR(100) COMMENT '作者',
        published_at DATETIME COMMENT '发布时间',
        views INT DEFAULT 0 COMMENT '浏览量',
        likes INT DEFAULT 0 COMMENT '点赞数',
        tags JSON COMMENT '标签数组',
        seo_title VARCHAR(255) COMMENT 'SEO 标题',
        seo_description TEXT COMMENT 'SEO 描述',
        status ENUM('draft', 'published', 'archived') DEFAULT 'draft' COMMENT '状态',
        sort_order INT DEFAULT 0 COMMENT '排序权重',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_status (status),
        INDEX idx_published_at (published_at),
        FULLTEXT idx_search (title, summary, content)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='新闻文章表'
    `);

    // 创建产品表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL COMMENT '产品名称',
        description TEXT COMMENT '简短描述 (列表页显示)',
        content LONGTEXT COMMENT '详细介绍 (详情页 HTML)',
        cover_image VARCHAR(500) COMMENT '主图 URL',
        gallery JSON COMMENT '图库数组',
        category VARCHAR(50) NOT NULL COMMENT '分类',
        subcategory VARCHAR(100) COMMENT '子分类',
        features JSON COMMENT '功能特性数组',
        specs JSON COMMENT '规格参数',
        price DECIMAL(10,2) COMMENT '价格 (可选)',
        download_url VARCHAR(500) COMMENT '下载链接/资料链接',
        video_url VARCHAR(500) COMMENT '演示视频 URL',
        views INT DEFAULT 0 COMMENT '浏览量',
        status ENUM('draft', 'published', 'hidden') DEFAULT 'draft' COMMENT '状态',
        sort_order INT DEFAULT 0 COMMENT '排序权重',
        seo_title VARCHAR(255) COMMENT 'SEO 标题',
        seo_description TEXT COMMENT 'SEO 描述',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_status (status),
        INDEX idx_sort_order (sort_order),
        FULLTEXT idx_search (name, description, content)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品表'
    `);

    // 创建联系表单表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL COMMENT '姓名',
        email VARCHAR(255) NOT NULL COMMENT '邮箱',
        phone VARCHAR(20) COMMENT '电话',
        company VARCHAR(200) COMMENT '公司名称',
        type VARCHAR(50) NOT NULL COMMENT '咨询类型',
        message TEXT NOT NULL COMMENT '咨询内容',
        ip_address VARCHAR(50) COMMENT '提交 IP',
        user_agent TEXT COMMENT '浏览器信息',
        status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new' COMMENT '状态',
        reply TEXT COMMENT '回复内容',
        replied_at DATETIME COMMENT '回复时间',
        replied_by INT COMMENT '回复管理员 ID',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_type (type),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (replied_by) REFERENCES admins(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='联系表单表'
    `);

    // 创建核心优势表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS features (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL COMMENT '标题',
        description TEXT NOT NULL COMMENT '描述',
        icon VARCHAR(100) NOT NULL COMMENT '图标名称',
        icon_color VARCHAR(20) DEFAULT 'primary-500' COMMENT '图标颜色',
        sort_order INT DEFAULT 0 COMMENT '排序权重',
        status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_sort_order (sort_order),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='核心优势表'
    `);

    // 创建公司数据统计表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS company_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        number VARCHAR(50) NOT NULL COMMENT '数字 (可包含单位)',
        label VARCHAR(100) NOT NULL COMMENT '标签/说明',
        icon VARCHAR(100) COMMENT '图标名称',
        sort_order INT DEFAULT 0 COMMENT '排序权重',
        status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_sort_order (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公司数据统计表'
    `);

    // 创建公司发展历程表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS company_timeline (
        id INT AUTO_INCREMENT PRIMARY KEY,
        year VARCHAR(10) NOT NULL COMMENT '年份',
        event VARCHAR(255) NOT NULL COMMENT '事件描述',
        description TEXT COMMENT '详细描述',
        icon VARCHAR(100) COMMENT '图标名称',
        image VARCHAR(500) COMMENT '配图 URL',
        sort_order INT DEFAULT 0 COMMENT '排序权重',
        status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_year (year),
        INDEX idx_sort_order (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公司发展历程表'
    `);

    // 创建公司价值观表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS company_values (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL COMMENT '价值观名称',
        description TEXT NOT NULL COMMENT '详细描述',
        icon VARCHAR(100) NOT NULL COMMENT '图标名称',
        icon_color VARCHAR(20) DEFAULT 'primary-500' COMMENT '图标颜色',
        sort_order INT DEFAULT 0 COMMENT '排序权重',
        status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_sort_order (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公司价值观表'
    `);

    // 创建网站全局设置表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL COMMENT '配置键',
        setting_value TEXT COMMENT '配置值',
        setting_type VARCHAR(20) DEFAULT 'text' COMMENT '类型',
        category VARCHAR(50) COMMENT '分类',
        description VARCHAR(255) COMMENT '配置说明',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_key (setting_key)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='网站全局设置表'
    `);

    // 创建轮播图表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS banners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) COMMENT '标题',
        subtitle VARCHAR(500) COMMENT '副标题',
        description TEXT COMMENT '描述文字',
        image_url VARCHAR(500) NOT NULL COMMENT '图片 URL',
        link_url VARCHAR(500) COMMENT '跳转链接',
        target_blank BOOLEAN DEFAULT FALSE COMMENT '新窗口打开',
        location VARCHAR(50) DEFAULT 'home_hero' COMMENT '展示位置',
        sort_order INT DEFAULT 0 COMMENT '排序权重',
        status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
        start_date DATE COMMENT '开始展示日期',
        end_date DATE COMMENT '结束展示日期',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_location (location),
        INDEX idx_status (status),
        INDEX idx_sort_order (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轮播图表'
    `);

    // 补全 news 表可能缺失的列（兼容旧表结构）
    const missingNewsCols = [
      { name: 'tags',            def: "JSON COMMENT '标签数组'" },
      { name: 'seo_title',      def: "VARCHAR(255) COMMENT 'SEO 标题'" },
      { name: 'seo_description', def: "TEXT COMMENT 'SEO 描述'" },
      { name: 'sort_order',     def: "INT DEFAULT 0 COMMENT '排序权重'" },
    ];
    for (const col of missingNewsCols) {
      const [rows] = await connection.query(`SHOW COLUMNS FROM news LIKE '${col.name}'`);
      if (rows.length === 0) {
        await connection.query(`ALTER TABLE news ADD COLUMN ${col.name} ${col.def}`);
        console.log(`✅ Added missing column: news.${col.name}`);
      }
    }

    // 补全 contacts 表可能缺失的列（兼容旧表结构）
    const missingContactCols = [
      { name: 'ip_address',  def: "VARCHAR(50) COMMENT '提交 IP'" },
      { name: 'user_agent',  def: "TEXT COMMENT '浏览器信息'" },
      { name: 'reply',       def: "TEXT COMMENT '回复内容'" },
      { name: 'replied_at',  def: "DATETIME COMMENT '回复时间'" },
      { name: 'replied_by',  def: "INT COMMENT '回复管理员 ID'" },
    ];
    for (const col of missingContactCols) {
      const [rows] = await connection.query(`SHOW COLUMNS FROM contacts LIKE '${col.name}'`);
      if (rows.length === 0) {
        await connection.query(`ALTER TABLE contacts ADD COLUMN ${col.name} ${col.def}`);
        console.log(`✅ Added missing column: contacts.${col.name}`);
      }
    }

    // 补全 products 表可能缺失的列（兼容旧表结构）
    const missingCols = [
      { name: 'gallery',         def: "JSON COMMENT '图库数组'" },
      { name: 'subcategory',     def: "VARCHAR(100) COMMENT '子分类'" },
      { name: 'features',        def: "JSON COMMENT '功能特性数组'" },
      { name: 'specs',           def: "JSON COMMENT '规格参数'" },
      { name: 'price',           def: "DECIMAL(10,2) COMMENT '价格'" },
      { name: 'download_url',    def: "VARCHAR(500) COMMENT '下载链接'" },
      { name: 'video_url',       def: "VARCHAR(500) COMMENT '演示视频 URL'" },
      { name: 'views',           def: "INT DEFAULT 0 COMMENT '浏览量'" },
      { name: 'sort_order',      def: "INT DEFAULT 0 COMMENT '排序权重'" },
      { name: 'seo_title',       def: "VARCHAR(255) COMMENT 'SEO 标题'" },
      { name: 'seo_description', def: "TEXT COMMENT 'SEO 描述'" },
    ];
    for (const col of missingCols) {
      const [rows] = await connection.query(`SHOW COLUMNS FROM products LIKE '${col.name}'`);
      if (rows.length === 0) {
        await connection.query(`ALTER TABLE products ADD COLUMN ${col.name} ${col.def}`);
        console.log(`✅ Added missing column: products.${col.name}`);
      }
    }

    // 初始化默认数据（仅当表为空时）
    await initializeDefaultData(connection);

    console.log('✅ Database initialized successfully with 10 tables');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  } finally {
    connection.release();
  }
}

async function initializeDefaultData(connection) {
  // 创建默认管理员
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@company.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  
  const [existingAdmin] = await connection.query(
    'SELECT id FROM admins WHERE email = ?',
    [adminEmail]
  );

  if (existingAdmin.length === 0) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await connection.query(
      'INSERT INTO admins (email, password, name, role) VALUES (?, ?, ?, ?)',
      [adminEmail, hashedPassword, '管理员', 'super_admin']
    );
    console.log('✅ Default admin created');
  }

  // 初始化核心优势
  const [existingFeatures] = await connection.query('SELECT id FROM features LIMIT 1');
  if (existingFeatures.length === 0) {
    await connection.query(`
      INSERT INTO features (title, description, icon, sort_order) VALUES
      ('专业安全', '专注于工业网络安全，提供全方位的安全防护解决方案', 'ShieldCheckIcon', 1),
      ('技术创新', '持续研发投入，保持技术领先地位', 'BoltIcon', 2),
      ('全球服务', '服务覆盖多个行业，客户遍布全球', 'GlobeAltIcon', 3)
    `);
    console.log('✅ Default features created');
  }

  // 初始化公司统计数据
  const [existingStats] = await connection.query('SELECT id FROM company_stats LIMIT 1');
  if (existingStats.length === 0) {
    await connection.query(`
      INSERT INTO company_stats (number, label, sort_order) VALUES
      ('1000+', '服务客户', 1),
      ('500+', '项目案例', 2),
      ('100+', '专业团队', 3),
      ('50+', '专利技术', 4)
    `);
    console.log('✅ Default company stats created');
  }

  // 初始化公司发展历程
  const [existingTimeline] = await connection.query('SELECT id FROM company_timeline LIMIT 1');
  if (existingTimeline.length === 0) {
    await connection.query(`
      INSERT INTO company_timeline (year, event, sort_order) VALUES
      ('2015', '公司成立，专注于工业网络安全研究', 1),
      ('2017', '推出首款工业防火墙产品', 2),
      ('2019', '获得 B 轮融资，团队规模扩大', 3),
      ('2021', '产品覆盖全国 20+ 省份', 4),
      ('2023', '荣获国家级高新技术企业认证', 5),
      ('2026', '服务客户突破 1000 家', 6)
    `);
    console.log('✅ Default company timeline created');
  }

  // 初始化公司价值观
  const [existingValues] = await connection.query('SELECT id FROM company_values LIMIT 1');
  if (existingValues.length === 0) {
    await connection.query(`
      INSERT INTO company_values (title, description, icon, sort_order) VALUES
      ('客户至上', '始终将客户需求放在首位，提供超越期待的产品和服务', 'UserGroupIcon', 1),
      ('追求卓越', '不断突破技术边界，追求产品和服务的极致品质', 'TrophyIcon', 2),
      ('诚信负责', '坚持诚信经营，对客户、员工和社会负责', 'ShieldCheckIcon', 3)
    `);
    console.log('✅ Default company values created');
  }

  // 初始化网站设置
  const [existingSettings] = await connection.query('SELECT id FROM site_settings LIMIT 1');
  if (existingSettings.length === 0) {
    await connection.query(`
      INSERT INTO site_settings (setting_key, setting_value, category, setting_type, description) VALUES
      ('site_name', '公司技术有限公司', 'basic', 'text', '网站名称'),
      ('site_logo', '/images/logo.png', 'basic', 'text', '网站 LOGO'),
      ('site_favicon', '/images/favicon.ico', 'basic', 'text', '网站图标'),
      ('site_description', '专注于工业网络安全的高科技企业', 'seo', 'text', '网站描述'),
      ('site_keywords', '工业安全，网络安全，工控安全', 'seo', 'text', 'SEO 关键词'),
      ('contact_phone', '400-xxx-xxxx', 'contact', 'text', '联系电话'),
      ('contact_email', 'info@winicssec.com', 'contact', 'text', '联系邮箱'),
      ('contact_address', '北京市朝阳区 xxx 路 xxx 号', 'contact', 'text', '公司地址'),
      ('contact_hours', '周一至周五 9:00-18:00', 'contact', 'text', '工作时间'),
      ('social_wechat', '/images/wechat-qrcode.png', 'social', 'text', '微信公众号二维码'),
      ('social_weibo', 'https://weibo.com/example', 'social', 'text', '微博链接'),
      ('social_linkedin', 'https://linkedin.com/company/example', 'social', 'text', 'LinkedIn 链接')
    `);
    console.log('✅ Default site settings created');
  }

  // 初始化轮播图
  const [existingBanners] = await connection.query('SELECT id FROM banners LIMIT 1');
  if (existingBanners.length === 0) {
    await connection.query(`
      INSERT INTO banners (title, subtitle, description, image_url, location, sort_order, status) VALUES
      ('守护工业网络安全', '专业、可靠、创新的工业网络安全解决方案提供商', NULL, 'https://via.placeholder.com/1920x1080', 'home_hero', 1, 'active'),
      ('工业防火墙新品发布', '全新一代，性能提升 50%', NULL, 'https://via.placeholder.com/1920x1080', 'home_hero', 2, 'active'),
      ('战略合作签约仪式', '与多家知名企业达成深度合作', NULL, 'https://via.placeholder.com/1920x1080', 'home_hero', 3, 'active')
    `);
    console.log('✅ Default banners created');
  }

  // 初始化示例新闻（幂等：仅当 news 表为空时插入）
  const [existingNews] = await connection.query('SELECT id FROM news LIMIT 1');
  if (existingNews.length === 0) {
    await connection.query(`
      INSERT INTO news (title, category, summary, content, status, published_at) VALUES
      (
        '北京公司荣获2026年度中国管理咨询创新奖',
        '公司新闻',
        '近日，北京公司顾问管理有限公司在第十二届中国管理咨询行业年会上荣获"2026年度管理咨询创新奖"，这是对公司在战略咨询领域持续创新的高度认可。',
        '<h2>北京公司荣获2026年度中国管理咨询创新奖</h2><p>近日，在第十二届中国管理咨询行业年会上，北京公司顾问管理有限公司凭借其在企业战略转型、数字化管理咨询领域的突出贡献，荣获"2026年度管理咨询创新奖"。</p><p>此次获奖是对公司团队多年来深耕管理咨询领域、持续推动行业创新的充分肯定。公司自成立以来，始终坚持以客户价值为核心，将先进的管理理念与中国企业实际相结合，为数百家企业提供了切实有效的战略咨询服务。</p><h3>创新实践引领行业发展</h3><p>公司在过去一年中，成功推出了"智慧战略规划平台"，通过大数据分析和人工智能技术，帮助企业实现战略制定的科学化和精准化。该平台已服务超过50家大中型企业，平均帮助客户提升战略执行效率30%以上。</p><p>公司总经理在颁奖典礼上表示："这个奖项属于每一位公司人，也属于信任我们的每一位客户。未来，我们将继续深化在管理咨询领域的创新探索，为中国企业的高质量发展贡献更多力量。"</p><h3>展望未来</h3><p>2026年，公司将进一步扩大服务范围，计划在上海、深圳、成都等城市新设分支机构，并持续加大在数字化转型咨询、组织变革管理等新兴领域的投入，为更多企业提供专业、高效的管理咨询服务。</p>',
        'published',
        '2026-03-15 10:00:00'
      ),
      (
        '公司成功助力某大型央企完成组织架构重组',
        '公司新闻',
        '北京公司顾问管理有限公司近期圆满完成了对某大型央企的组织架构重组咨询项目，历时8个月的深度合作取得了显著成效，客户满意度达到98%。',
        '<h2>公司成功助力某大型央企完成组织架构重组</h2><p>经过8个月的深度合作，北京公司顾问管理有限公司近期圆满完成了对某大型央企的组织架构重组咨询项目，项目成果获得客户高度认可，满意度评分达到98分（满分100分）。</p><p>该央企拥有员工逾两万人，业务覆盖全国30余个省市。面对市场竞争加剧和内部管理效率亟待提升的双重压力，企业决策层决定启动全面的组织架构优化工程，并委托公司担任首席咨询顾问。</p><h3>项目实施过程</h3><p>公司项目团队由资深合伙人领衔，汇集了组织设计、人力资源、流程再造等多个专业领域的顾问专家。团队深入企业一线，通过访谈、问卷、数据分析等多种方式，全面诊断企业现有组织架构的痛点与瓶颈。</p><p>在充分调研的基础上，公司为该企业量身定制了"扁平化+矩阵式"的新型组织架构方案，并制定了详细的实施路线图和变革管理计划，有效降低了组织变革的风险和阻力。</p><h3>项目成果</h3><p>重组完成后，该企业管理层级由原来的7级压缩至4级，决策效率提升约40%；跨部门协作流程得到显著优化，内部沟通成本降低25%；员工满意度调查显示，员工对新组织架构的认可度达到85%以上。</p><p>公司将继续为该企业提供后续的落地辅导和效果评估服务，确保组织变革成果的持续巩固和深化。</p>',
        'published',
        '2026-02-20 09:30:00'
      ),
      (
        '2026年中国企业数字化转型趋势报告发布',
        '行业资讯',
        '公司研究院联合多家权威机构发布《2026年中国企业数字化转型趋势报告》，报告显示超过70%的受访企业已将数字化转型列为未来三年的核心战略优先项。',
        '<h2>2026年中国企业数字化转型趋势报告发布</h2><p>近日，公司研究院联合国内多家权威研究机构共同发布了《2026年中国企业数字化转型趋势报告》。报告基于对全国1200余家企业的深度调研，全面呈现了当前中国企业数字化转型的现状、挑战与未来趋势。</p><h3>核心发现</h3><p>报告显示，超过70%的受访企业已将数字化转型列为未来三年的核心战略优先项，较2024年提升了15个百分点。其中，制造业、金融业和零售业是数字化转型最为活跃的三大行业。</p><p>在转型重点领域方面，企业最关注的依次是：业务流程数字化（68%）、数据治理与分析（61%）、客户体验数字化（55%）和供应链数字化（49%）。人工智能和大数据技术的应用成为本年度最大亮点，有超过40%的企业已在核心业务中引入AI辅助决策。</p><h3>主要挑战</h3><p>尽管数字化转型热情高涨，但企业在推进过程中仍面临诸多挑战。报告指出，人才短缺（72%）、数据孤岛（65%）和变革阻力（58%）是制约企业数字化转型的三大主要障碍。</p><p>值得关注的是，有近30%的企业表示，数字化转型项目的实际效果未能达到预期，主要原因在于缺乏清晰的战略规划和有效的变革管理。</p><h3>专家建议</h3><p>公司首席研究员指出，成功的数字化转型需要"战略先行、技术赋能、文化变革"三位一体的系统推进。企业应避免为数字化而数字化，而应聚焦于通过数字化手段解决实际业务痛点、创造真实价值。</p><p>报告全文可通过公司官网免费下载获取。</p>',
        'published',
        '2026-01-18 14:00:00'
      ),
      (
        '管理咨询行业迎来新机遇：ESG战略咨询需求快速增长',
        '行业资讯',
        '随着国内外ESG监管政策持续收紧，越来越多的企业开始寻求专业的ESG战略咨询服务。业内预测，2026年ESG咨询市场规模将突破百亿元，成为管理咨询行业新的重要增长极。',
        '<h2>管理咨询行业迎来新机遇：ESG战略咨询需求快速增长</h2><p>近年来，随着全球可持续发展理念的深入人心和国内外ESG（环境、社会、治理）监管政策的持续收紧，ESG战略咨询已成为管理咨询行业最具活力的新兴细分领域之一。</p><h3>市场规模快速扩张</h3><p>据行业权威机构统计，2025年中国ESG咨询市场规模约为65亿元，同比增长超过80%。业内普遍预测，2026年该市场规模将突破百亿元大关，未来五年复合增长率有望保持在40%以上。</p><p>驱动这一增长的核心因素包括：A股上市公司ESG信息披露要求的全面强化、境外上市企业面临的国际ESG标准合规压力、以及越来越多的大型企业将ESG表现纳入供应链管理要求，带动中小企业跟进。</p><h3>咨询需求多元化</h3><p>当前企业对ESG咨询的需求已从最初的报告编制延伸至战略规划、体系建设、评级提升、投资者关系管理等多个维度。其中，碳中和路径规划、供应链ESG管理和ESG信息披露体系建设是需求最为旺盛的三个方向。</p><h3>公司的布局</h3><p>北京公司顾问管理有限公司已于2025年初成立专业的ESG咨询事业部，汇聚了来自环境科学、公司治理、社会责任等多个领域的专业人才。目前已为十余家上市公司和大型国有企业提供了ESG战略咨询服务，积累了丰富的实践经验。</p><p>公司将持续深化在ESG咨询领域的专业能力建设，为企业实现可持续发展目标提供全方位的专业支持。</p>',
        'published',
        '2026-01-05 11:00:00'
      ),
      (
        '公司战略咨询团队扩编，引进多名顶尖行业专家',
        '公司新闻',
        '为进一步提升专业服务能力，北京公司顾问管理有限公司近期完成新一轮人才引进计划，成功招募5名具有丰富行业经验的资深咨询专家，团队整体实力再上新台阶。',
        '<h2>公司战略咨询团队扩编，引进多名顶尖行业专家</h2><p>北京公司顾问管理有限公司近期宣布完成新一轮人才引进计划，成功招募5名来自国内外知名咨询机构和大型企业的资深专家，进一步充实和强化了公司的专业咨询团队。</p><h3>新加入专家介绍</h3><p>此次引进的专家团队涵盖战略规划、运营管理、人力资源、财务管理和数字化转型五大专业领域，均拥有15年以上的行业从业经验，曾服务于多家世界500强企业和国内头部企业。</p><p>其中，新加入的战略规划首席顾问曾主导完成多个大型企业集团的战略转型项目，在制造业和消费品行业拥有深厚的专业积累；运营管理领域的资深顾问则在精益管理和供应链优化方面具有丰富的实战经验。</p><h3>人才战略的重要意义</h3><p>公司总经理表示："人才是咨询公司最核心的竞争力。此次引进的专家不仅带来了丰富的专业知识和项目经验，更将为我们的团队注入新的思维活力和行业视角。"</p><p>随着团队规模的扩大和专业能力的提升，公司将能够承接更多大型、复杂的咨询项目，为客户提供更加全面、深入的战略咨询服务。</p><h3>未来规划</h3><p>公司计划在2026年底前将咨询顾问团队规模扩大至100人以上，并在行业专业化方向上持续深耕，重点打造金融服务、先进制造、消费零售和医疗健康四大行业咨询品牌。公司同时宣布将加大对顾问培训和知识管理体系建设的投入，确保团队专业能力的持续提升。</p>',
        'published',
        '2025-12-10 16:00:00'
      )
    `);
    console.log('✅ Default sample news created');
  }

  // 初始化示例产品（幂等：仅当 products 表为空时插入）
  const [existingProducts] = await connection.query('SELECT id FROM products LIMIT 1');
  if (existingProducts.length === 0) {
    await connection.query(`
      INSERT INTO products (name, category, description, content, features, status) VALUES
      (
        '企业战略规划管理系统',
        '软件产品',
        '一款专为大中型企业设计的战略规划与执行管理平台，帮助企业实现战略目标的科学制定、高效分解与全程跟踪，提升战略执行力。',
        '<h2>企业战略规划管理系统</h2><p>企业战略规划管理系统是北京公司顾问管理有限公司自主研发的核心软件产品，融合了先进的战略管理理论与丰富的咨询实践经验，为企业提供从战略制定到执行落地的全流程数字化支撑。</p><h3>产品背景</h3><p>在当今快速变化的商业环境中，企业战略的制定与执行面临前所未有的挑战。传统的战略管理方式依赖大量人工操作，信息传递效率低、执行过程难以追踪、战略与运营脱节等问题普遍存在。公司战略规划管理系统正是为解决这些痛点而生。</p><h3>核心功能</h3><p>系统涵盖战略地图绘制、平衡计分卡管理、KPI指标体系建设、战略执行跟踪、绩效评估报告等核心模块，支持多层级战略目标的逐级分解与对齐，确保公司战略与部门计划、个人目标的高度一致。</p><h3>技术特点</h3><p>系统采用B/S架构，支持PC端和移动端访问，内置丰富的数据可视化图表，支持与企业现有ERP、HR等系统的无缝集成。云端部署模式确保数据安全，支持私有化部署满足特殊需求。</p><p>目前，该系统已在50余家大中型企业成功落地应用，用户满意度持续保持在95%以上。</p>',
        '[{"title":"战略地图可视化","description":"支持绘制多维度战略地图，直观呈现战略目标间的因果关系，帮助管理层快速理解战略逻辑"},{"title":"平衡计分卡管理","description":"内置财务、客户、内部流程、学习成长四个维度的BSC框架，支持自定义指标体系"},{"title":"目标分解与对齐","description":"支持战略目标从公司级到部门级、个人级的逐层分解，确保全员目标与公司战略高度对齐"},{"title":"执行进度实时追踪","description":"通过仪表盘实时监控各项战略举措的执行进度，自动预警滞后项目，确保战略落地"},{"title":"智能分析报告","description":"系统自动生成战略执行分析报告，支持多维度数据钻取，为管理决策提供数据支撑"}]',
        'published'
      ),
      (
        '组织效能诊断评估工具',
        '软件产品',
        '基于大数据和人工智能技术的组织效能诊断平台，通过多维度评估模型，快速识别组织管理短板，为企业组织优化提供科学依据。',
        '<h2>组织效能诊断评估工具</h2><p>组织效能诊断评估工具是公司专为企业组织管理优化设计的专业软件产品，集成了国际先进的组织诊断模型与公司多年咨询实践积累，帮助企业快速、准确地识别组织管理中的核心问题。</p><h3>产品价值</h3><p>组织效能是企业竞争力的重要来源，但传统的组织诊断方式耗时长、成本高、主观性强。本工具通过标准化的评估问卷、科学的数据分析模型和智能化的报告生成，将组织诊断的周期从数月压缩至数周，同时大幅提升诊断结论的客观性和准确性。</p><h3>评估维度</h3><p>工具覆盖组织架构合理性、管理流程效率、人才配置优化、团队协作效能、企业文化健康度五大核心维度，每个维度下设多个细分评估指标，形成全面、立体的组织效能评估体系。</p><h3>应用场景</h3><p>适用于企业年度组织健康检查、并购重组后的组织整合评估、重大战略调整前的组织能力评估、以及持续改进中的组织效能监测等多种场景。</p><p>已服务超过80家企业，帮助客户平均提升组织效能指数20%以上。</p>',
        '[{"title":"多维度评估模型","description":"涵盖组织架构、流程效率、人才配置、团队协作、企业文化五大维度，形成360度全景诊断"},{"title":"智能问卷系统","description":"内置经过验证的标准化评估问卷，支持在线填写，自动汇总分析，大幅降低数据收集成本"},{"title":"基准对标分析","description":"内置行业基准数据库，支持与同行业标杆企业进行对标分析，明确改进方向和优先级"},{"title":"可视化诊断报告","description":"自动生成图文并茂的诊断报告，清晰呈现组织效能现状、问题根因和改进建议"},{"title":"改进方案推荐","description":"基于诊断结果，系统智能推荐针对性的改进方案和最佳实践案例，加速改进落地"}]',
        'published'
      ),
      (
        '企业数字化转型咨询解决方案',
        '解决方案',
        '公司为企业量身定制的数字化转型全程咨询服务，涵盖战略规划、路径设计、实施辅导和效果评估，帮助企业系统性推进数字化转型，实现业务价值最大化。',
        '<h2>企业数字化转型咨询解决方案</h2><p>在数字经济时代，数字化转型已成为企业保持竞争力、实现可持续发展的必由之路。然而，数字化转型是一项复杂的系统工程，涉及战略、技术、组织、文化等多个层面，许多企业在推进过程中面临方向不清、路径不明、落地困难等挑战。</p><p>公司企业数字化转型咨询解决方案，凭借深厚的管理咨询专业积累和丰富的数字化转型实践经验，为企业提供从顶层设计到落地实施的全程专业支持。</p><h3>服务框架</h3><p>我们的数字化转型咨询服务分为四个阶段：诊断评估阶段，全面评估企业数字化现状和转型需求；战略规划阶段，制定符合企业实际的数字化转型战略和路线图；实施辅导阶段，协助企业推进关键数字化项目的落地实施；效果评估阶段，持续跟踪转型成效，优化调整转型策略。</p><h3>核心优势</h3><p>公司拥有一支由战略咨询专家、数字化技术专家和行业领域专家组成的复合型团队，能够从业务价值视角审视数字化转型，避免为技术而技术的误区，确保数字化投入产生真实的业务价值。</p><p>已成功服务制造、金融、零售、医疗等多个行业的数字化转型项目，积累了丰富的行业最佳实践。</p>',
        '[{"title":"数字化成熟度评估","description":"运用专业评估框架，全面诊断企业数字化现状，识别关键差距和优先改进领域"},{"title":"转型战略与路线图","description":"结合企业战略目标和数字化趋势，制定清晰的数字化转型战略和分阶段实施路线图"},{"title":"业务场景数字化设计","description":"深入分析核心业务流程，识别高价值数字化应用场景，设计数字化解决方案蓝图"},{"title":"变革管理与组织赋能","description":"制定系统的变革管理计划，通过培训、辅导等方式提升组织数字化能力，降低转型阻力"},{"title":"转型效果持续评估","description":"建立数字化转型KPI体系，定期评估转型成效，及时调整优化转型策略，确保价值实现"}]',
        'published'
      ),
      (
        '人力资源管理体系建设解决方案',
        '解决方案',
        '公司为企业提供系统化的人力资源管理体系建设咨询服务，涵盖组织架构设计、岗位体系建设、薪酬绩效体系设计、人才发展规划等，助力企业构建高效的人力资源管理能力。',
        '<h2>人力资源管理体系建设解决方案</h2><p>人力资源是企业最重要的战略资产，科学完善的人力资源管理体系是企业吸引、激励和留住优秀人才的基础保障。公司人力资源管理体系建设解决方案，帮助企业从系统化视角审视和优化人力资源管理，构建与企业战略高度匹配的人才管理能力。</p><h3>服务内容</h3><p>我们的人力资源管理体系建设服务涵盖以下核心模块：</p><p><strong>组织架构优化：</strong>基于企业战略和业务模式，设计科学合理的组织架构，明确各层级职责权限，优化管理幅度和层级，提升组织运作效率。</p><p><strong>岗位体系建设：</strong>开展全面的岗位分析，建立清晰的岗位说明书体系，构建科学的职级职等框架，为薪酬管理和人才发展奠定基础。</p><p><strong>薪酬体系设计：</strong>基于市场薪酬调研和内部公平性分析，设计具有竞争力和激励性的薪酬结构，包括固定薪酬、绩效奖金和长期激励方案。</p><p><strong>绩效管理体系：</strong>建立与战略目标紧密挂钩的绩效管理体系，设计科学的KPI指标库，规范绩效评估流程，确保绩效管理的公平性和有效性。</p><h3>服务特色</h3><p>公司拥有专业的人力资源咨询团队，具备丰富的跨行业服务经验，能够结合企业所处行业特点和发展阶段，提供高度定制化的解决方案。</p>',
        '[{"title":"组织架构诊断与优化","description":"全面评估现有组织架构的合理性，识别管理层级冗余、职责不清等问题，提出优化方案"},{"title":"岗位分析与职级体系","description":"开展系统的岗位分析，建立清晰的岗位说明书，构建科学的职级职等框架"},{"title":"薪酬体系设计","description":"基于市场调研和内部公平性分析，设计具有竞争力的薪酬结构和激励方案"},{"title":"绩效管理体系建设","description":"建立与战略目标挂钩的绩效管理体系，设计KPI指标库，规范绩效评估流程"},{"title":"人才发展规划","description":"制定系统的人才培养和发展规划，建立人才梯队，为企业可持续发展提供人才保障"}]',
        'published'
      ),
      (
        '企业运营效率提升咨询解决方案',
        '解决方案',
        '公司运营效率提升咨询解决方案，通过流程再造、精益管理和数字化工具应用，帮助企业系统性消除运营浪费，提升核心业务流程效率，降低运营成本，增强企业竞争力。',
        '<h2>企业运营效率提升咨询解决方案</h2><p>在竞争日益激烈的市场环境中，运营效率已成为企业核心竞争力的重要组成部分。公司运营效率提升咨询解决方案，融合精益管理、流程再造和数字化技术，帮助企业系统性识别和消除运营中的低效环节，实现运营成本的持续降低和业务效率的显著提升。</p><h3>问题诊断</h3><p>许多企业在运营管理中面临以下共性问题：业务流程冗长繁琐，审批环节过多；部门间协作不畅，信息传递效率低；资源配置不合理，存在大量隐性浪费；缺乏有效的运营监控机制，问题发现和响应滞后。</p><h3>解决方案框架</h3><p>公司运营效率提升解决方案分三个阶段推进：</p><p><strong>第一阶段——运营诊断：</strong>通过流程梳理、数据分析和现场观察，全面识别运营效率瓶颈和改进机会，量化改进潜力。</p><p><strong>第二阶段——方案设计：</strong>针对诊断发现的问题，设计流程优化方案、组织协作改进方案和数字化工具应用方案，制定详细的实施计划。</p><p><strong>第三阶段——落地实施：</strong>协助企业推进改进方案的落地实施，提供变革管理支持，建立持续改进机制，确保改进成果的持续巩固。</p><h3>典型成效</h3><p>通过公司运营效率提升咨询服务，客户企业平均实现核心流程效率提升30%以上，运营成本降低15%-25%，客户满意度显著提升。</p>',
        '[{"title":"运营流程全面诊断","description":"运用价值流分析、流程挖掘等专业工具，全面识别运营流程中的瓶颈、冗余和浪费环节"},{"title":"精益流程再造","description":"基于精益管理原则，重新设计核心业务流程，消除非增值环节，提升流程效率和质量"},{"title":"跨部门协作优化","description":"优化部门间协作机制和信息传递流程，打破部门壁垒，提升跨职能协作效率"},{"title":"运营数字化赋能","description":"引入适合的数字化工具和系统，实现关键运营流程的自动化和智能化，降低人工成本"},{"title":"持续改进机制建设","description":"建立运营效率监控指标体系和持续改进机制，确保改进成果持续巩固，形成自我优化能力"}]',
        'published'
      )
    `);
    console.log('✅ Default sample products created');
  }
}

module.exports = { pool, initDatabase };
