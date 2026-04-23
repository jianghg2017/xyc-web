// 模拟数据模式 - 用于测试和演示
const mockData = {
  news: [
    {
      id: 1,
      title: '新益策荣获 2026 年度网络安全创新奖',
      summary: '在近日举行的中国网络安全大会上，新益策凭借在工业网络安全领域的突出贡献荣获创新奖',
      content: '在近日举行的中国网络安全大会上，新益策凭借在工业网络安全领域的突出贡献荣获 2026 年度网络安全创新奖。该奖项是对新益策在工业防火墙、安全审计系统等核心产品研发上持续投入的认可。新益策 CEO 表示，将继续加大研发投入，为工业网络安全提供更可靠的解决方案。',
      cover_image: '/images/news/news-001.jpg',
      category: '公司新闻',
      author: '市场部',
      published_at: '2026-04-10T10:00:00Z',
      views: 1256,
      status: 'published'
    },
    {
      id: 2,
      title: '新版工业防火墙 V5.0 正式发布',
      summary: '经过半年研发，新益策推出全新一代工业防火墙，性能提升 50%',
      content: '经过半年研发，新益策推出全新一代工业防火墙 V5.0。新版本在性能、安全性和易用性方面都有显著提升：吞吐量提升 50%，支持更丰富的协议解析，新增可视化策略管理界面。目前已在国内多家大型制造企业部署使用，运行稳定可靠。',
      cover_image: '/images/news/news-002.jpg',
      category: '产品发布',
      author: '产品部',
      published_at: '2026-04-05T14:30:00Z',
      views: 2341,
      status: 'published'
    },
    {
      id: 3,
      title: '与某大型制造企业达成战略合作',
      summary: '新益策与某大型制造企业签署战略合作协议，为其提供全面的工业网络安全解决方案',
      content: '新益策与某大型制造企业签署战略合作协议，将为其旗下 20 余家工厂提供全面的工业网络安全解决方案。项目包括工业防火墙部署、安全审计系统建设、网络安全培训等内容，合同金额超千万元。这标志着新益策在大型工业企业市场取得重要突破。',
      cover_image: '/images/news/news-003.jpg',
      category: '合作案例',
      author: '市场部',
      published_at: '2026-03-28T09:00:00Z',
      views: 1876,
      status: 'published'
    },
    {
      id: 4,
      title: '参加 2026 中国国际工业博览会',
      summary: '新益策携最新产品亮相工博会，吸引众多观众驻足体验',
      content: '新益策参加了在上海国家会展中心举办的 2026 中国国际工业博览会，展出了工业防火墙、安全审计系统、入侵检测系统等一系列核心产品。展会期间，新益策展台吸引了大量专业观众驻足体验，并与多家企业达成了合作意向。',
      cover_image: '/images/news/news-004.jpg',
      category: '展会活动',
      author: '市场部',
      published_at: '2026-03-20T16:00:00Z',
      views: 1543,
      status: 'published'
    }
  ],
  products: [
    {
      id: 1,
      name: 'WinICS FW 工业防火墙',
      description: '专为工业环境设计的高性能防火墙，支持多种工业协议深度解析',
      content: 'WinICS FW 工业防火墙是新益策自主研发的核心产品，专为工业控制系统环境设计。产品特点：\n\n1. 支持 Modbus、DNP3、IEC104、S7 等主流工业协议深度解析\n2. 白名单机制，只允许合法通信\n3. 工业级设计，宽温工作，抗电磁干扰\n4. 支持旁路监听和串接部署\n5. 可视化策略管理界面\n\n应用场景：电力、石化、冶金、制造等行业的关键基础设施保护。',
      cover_image: '/images/products/product-001.jpg',
      category: '硬件产品',
      price: 0,
      status: 'published',
      sort_order: 1
    },
    {
      id: 2,
      name: 'WinICS ADS 安全审计系统',
      description: '全面的工业网络行为审计与监控，满足等保 2.0 要求',
      content: 'WinICS ADS 安全审计系统是新益策推出的工业网络审计解决方案，满足等保 2.0 三级要求。产品特点：\n\n1. 全流量采集与存储\n2. 工业协议解析与还原\n3. 异常行为检测与告警\n4. 操作审计与追溯\n5. 合规报表生成\n\n支持旁路部署，不影响生产网络正常运行。',
      cover_image: '/images/products/product-002.jpg',
      category: '软件产品',
      price: 0,
      status: 'published',
      sort_order: 2
    },
    {
      id: 3,
      name: 'WinICS IDS 入侵检测系统',
      description: '实时检测并阻止工业网络威胁，保护关键基础设施',
      content: 'WinICS IDS 入侵检测系统专注于工业网络威胁检测，内置丰富的工业协议攻击特征库。产品特点：\n\n1. 实时流量分析\n2. 工业协议异常检测\n3. 已知攻击特征匹配\n4. 机器学习异常识别\n5. 实时告警与联动阻断\n\n可与防火墙、审计系统联动，构建纵深防御体系。',
      cover_image: '/images/products/product-003.jpg',
      category: '软件产品',
      price: 0,
      status: 'published',
      sort_order: 3
    },
    {
      id: 4,
      name: 'WinICS MDM 设备管理系统',
      description: '工业设备全生命周期管理，提升运维效率',
      content: 'WinICS MDM 设备管理系统提供工业设备的全生命周期管理功能。产品特点：\n\n1. 设备资产自动发现\n2. 设备配置统一管理\n3. 固件版本控制\n4. 故障预警与维护提醒\n5. 运维报表统计\n\n帮助工业企业提升设备管理效率，降低运维成本。',
      cover_image: '/images/products/product-004.jpg',
      category: '软件产品',
      price: 0,
      status: 'published',
      sort_order: 4
    }
  ],
  solutions: [
    {
      id: 1,
      title: '电力行业网络安全解决方案',
      description: '针对电力行业的特殊需求，提供从监测、防护到审计的全方位解决方案',
      content: '电力行业是国民经济的重要基础，其网络安全关系到国家能源安全。新益策电力行业解决方案涵盖：\n\n1. 发电厂监控网络安全防护\n2. 变电站网络安全监测\n3. 调度数据网安全防护\n4. 电力监控系统安全审计\n5. 等保 2.0 合规建设\n\n已成功服务于多家发电集团和电网公司。',
      image: '/images/solutions/solution-001.jpg',
      industry: '电力'
    },
    {
      id: 2,
      title: '石化行业工控安全解决方案',
      description: '保障石化生产安全，预防网络攻击导致的生产事故',
      content: '石化行业生产过程连续性强，一旦遭受网络攻击可能导致严重安全事故。新益策石化行业解决方案：\n\n1. DCS 系统安全防护\n2. SIS 系统安全加固\n3. 现场总线网络安全\n4. 移动设备接入管理\n5. 安全运维平台建设\n\n为多家大型石化企业提供安全服务。',
      image: '/images/solutions/solution-002.jpg',
      industry: '石化'
    },
    {
      id: 3,
      title: '制造业智能制造安全解决方案',
      description: '助力制造业数字化转型，保障智能制造安全',
      content: '制造业数字化转型过程中，IT 与 OT 融合带来新的安全挑战。新益策制造业解决方案：\n\n1. 生产网与管理网隔离\n2. 工业物联网安全\n3. 机器人安全接入\n4. 供应链安全管理\n5. 零信任架构实施\n\n服务客户涵盖汽车、电子、机械等行业。',
      image: '/images/solutions/solution-003.jpg',
      industry: '制造'
    }
  ],
  contacts: []
};

module.exports = mockData;
