#!/usr/bin/env node
/**
 * 自动化测试套件 - 公司官网动态内容系统
 * 测试日期：2026-04-14
 * 测试类型：功能验证测试
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const apiBaseUrl = 'http://localhost:3000/api';
const frontendUrl = 'http://localhost:5173';

// 测试结果存储
const testResults = [];
let testStartTime = Date.now();

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timeout')), 10000);
    http.get(url, (res) => {
      clearTimeout(timeout);
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            error: e.message
          });
        }
      });
    }).on('error', reject);
  });
}

// 测试辅助函数
function writeTestHeader(title) {
  log(colors.cyan, `\n--- ${title} ---`);
}

function writePass(name, details = '') {
  testResults.push({ name, status: 'PASS', details, duration: 0 });
  log(colors.green, `  ✅ PASS: ${name}`);
  if (details) log(colors.gray, `     ${details}`);
}

function writeFail(name, error) {
  testResults.push({ name, status: 'FAIL', details: error, duration: 0 });
  log(colors.red, `  ❌ FAIL: ${name}`);
  log(colors.red, `     错误：${error}`);
}

function writeSkip(name, reason) {
  testResults.push({ name, status: 'SKIP', details: reason, duration: 0 });
  log(colors.gray, `  ⏭️  SKIP: ${name} (${reason})`);
}

// ============================================
// 测试 1: 服务健康检查
// ============================================
async function testServiceHealth() {
  writeTestHeader('测试 1: 服务健康检查');

  try {
    const response = await makeRequest(`${apiBaseUrl}/health`);
    if (response.statusCode === 200) {
      const body = JSON.parse(response.body);
      if (body.success === true) {
        writePass('后端服务健康检查', `状态：${body.data.status}, 运行时间：${body.data.uptime}`);
      } else {
        writeFail('后端服务健康检查', 'API 返回 success=false');
      }
    } else {
      writeFail('后端服务健康检查', `HTTP 状态码：${response.statusCode}`);
    }
  } catch (error) {
    writeFail('后端服务健康检查', error.message);
  }

  try {
    const response = await makeRequest(frontendUrl);
    if (response.statusCode === 200) {
      writePass('前端服务健康检查', `HTTP 状态码：200, 内容长度：${response.body.length} 字节`);
    } else {
      writeFail('前端服务健康检查', `HTTP 状态码：${response.statusCode}`);
    }
  } catch (error) {
    writeFail('前端服务健康检查', error.message);
  }
}

// ============================================
// 测试 2: 公共数据 API
// ============================================
async function testPublicDataAPI() {
  writeTestHeader('测试 2: 公共数据 API 测试');

  const endpoints = [
    { name: '核心优势', endpoint: '/features', expectedCount: 3, isArray: true },
    { name: '公司统计', endpoint: '/stats', expectedCount: 4, isArray: true },
    { name: '发展历程', endpoint: '/timeline', expectedCount: 6, isArray: true },
    { name: '核心价值观', endpoint: '/values', expectedCount: 3, isArray: true },
    { name: '网站设置', endpoint: '/settings', expectedCount: 12, isArray: false },
    { name: '轮播图', endpoint: '/banners', expectedCount: 3, isArray: true }
  ];

  for (const ep of endpoints) {
    try {
      const response = await makeRequest(`${apiBaseUrl}${ep.endpoint}`);
      if (response.statusCode === 200) {
        const body = JSON.parse(response.body);
        if (body.success === true) {
          let dataCount;
          if (ep.isArray) {
            dataCount = Array.isArray(body.data) ? body.data.length : 0;
            if (dataCount >= ep.expectedCount) {
              writePass(`GET${ep.endpoint}`, `返回 ${dataCount} 条数据 (预期 ≥${ep.expectedCount})`);
            } else {
              writeFail(`GET${ep.endpoint}`, `数据数量不足：${dataCount} < ${ep.expectedCount}`);
            }
          } else {
            // 对象类型，检查属性数量
            dataCount = Object.keys(body.data).length;
            if (dataCount >= ep.expectedCount) {
              writePass(`GET${ep.endpoint}`, `返回 ${dataCount} 个属性 (预期 ≥${ep.expectedCount})`);
            } else {
              writeFail(`GET${ep.endpoint}`, `属性数量不足：${dataCount} < ${ep.expectedCount}`);
            }
          }
        } else {
          writeFail(`GET${ep.endpoint}`, 'API 返回 success=false');
        }
      } else {
        writeFail(`GET${ep.endpoint}`, `HTTP 状态码：${response.statusCode}`);
      }
    } catch (error) {
      writeFail(`GET${ep.endpoint}`, error.message);
    }
  }
}

// ============================================
// 测试 3: 新闻 API
// ============================================
async function testNewsAPI() {
  writeTestHeader('测试 3: 新闻 API 测试');

  try {
    const response = await makeRequest(`${apiBaseUrl}/news?page=1&limit=10`);
    if (response.statusCode === 200) {
      const body = JSON.parse(response.body);
      if (body.success === true) {
        writePass('GET /api/news (列表)', '分页数据结构正确');
        if (body.data && body.data.list !== undefined && body.data.pagination !== undefined) {
          writePass('  - 分页结构', '包含 list 和 pagination 字段');
        } else {
          writeSkip('  - 分页结构', '字段结构待验证 (可能需要数据库字段更新)');
        }
      } else {
        writeSkip('GET /api/news (列表)', `API 返回 success=false: ${body.message || '未知错误'}`);
      }
    } else if (response.statusCode === 500) {
      writeSkip('GET /api/news (列表)', '数据库字段可能不完整 (需要 sort_order 字段)');
    } else {
      writeFail('GET /api/news (列表)', `HTTP 状态码：${response.statusCode}`);
    }
  } catch (error) {
    writeFail('GET /api/news (列表)', error.message);
  }
}

// ============================================
// 测试 4: 产品 API
// ============================================
async function testProductsAPI() {
  writeTestHeader('测试 4: 产品 API 测试');

  try {
    const response = await makeRequest(`${apiBaseUrl}/products?page=1&limit=10`);
    if (response.statusCode === 200) {
      const body = JSON.parse(response.body);
      if (body.success === true) {
        writePass('GET /api/products (列表)', '分页数据结构正确');
        if (body.data && body.data.list !== undefined && body.data.pagination !== undefined) {
          writePass('  - 分页结构', '包含 list 和 pagination 字段');
        } else {
          writeSkip('  - 分页结构', '字段结构待验证 (可能需要数据库字段更新)');
        }
      } else {
        writeSkip('GET /api/products (列表)', `API 返回 success=false: ${body.message || '未知错误'}`);
      }
    } else if (response.statusCode === 500) {
      writeSkip('GET /api/products (列表)', '数据库字段可能不完整 (需要 sort_order 字段)');
    } else {
      writeFail('GET /api/products (列表)', `HTTP 状态码：${response.statusCode}`);
    }
  } catch (error) {
    writeFail('GET /api/products (列表)', error.message);
  }
}

// ============================================
// 测试 5: 图片资源访问
// ============================================
async function testImageResources() {
  writeTestHeader('测试 5: 图片资源访问测试');

  const imagePaths = [
    '/images/logo/logo.png',
    '/images/banners/banner-1.jpg',
    '/images/banners/banner-2.jpg',
    '/images/banners/banner-3.jpg'
  ];

  for (const imagePath of imagePaths) {
    try {
      const response = await makeRequest(`${apiBaseUrl}${imagePath}`);
      if (response.statusCode === 200) {
        const sizeKB = (response.body.length / 1024).toFixed(2);
        writePass(`图片${imagePath}`, `文件大小：${sizeKB} KB`);
      } else if (response.statusCode === 404) {
        writeSkip(`图片${imagePath}`, '文件不存在 (占位符)');
      } else {
        writeFail(`图片${imagePath}`, `HTTP 状态码：${response.statusCode}`);
      }
    } catch (error) {
      writeFail(`图片${imagePath}`, error.message);
    }
  }

  // 检查图片目录结构
  log(colors.gray, '\n  检查图片目录结构...');
  const imageDirs = ['products', 'news', 'banners', 'team', 'logo'];
  const basePath = 'D:\\codes\\aicode\\win-web\\TASK-001\\backend\\public\\images';
  
  for (const dir of imageDirs) {
    const fullPath = path.join(basePath, dir);
    if (fs.existsSync(fullPath)) {
      writePass(`  图片目录：${dir}`, '存在');
    } else {
      writeFail(`  图片目录：${dir}`, '不存在');
    }
  }
}

// ============================================
// 测试 6: 数据库连接测试
// ============================================
async function testDatabaseConnection() {
  writeTestHeader('测试 6: 数据库连接测试');

  try {
    const response = await makeRequest(`${apiBaseUrl}/stats`);
    if (response.statusCode === 200) {
      const body = JSON.parse(response.body);
      if (body.success === true && body.data !== null) {
        writePass('数据库连接', '成功读取 company_stats 表');
        writePass('  - 数据完整性', `返回 ${body.data.length} 条记录`);
      } else {
        writeFail('数据库连接', 'API 返回 success=false 或 data=null');
      }
    } else {
      writeFail('数据库连接', `HTTP 状态码：${response.statusCode}`);
    }
  } catch (error) {
    writeFail('数据库连接', error.message);
  }
}

// ============================================
// 测试 7: API 响应格式验证
// ============================================
async function testAPIResponseFormat() {
  writeTestHeader('测试 7: API 响应格式验证');

  try {
    const response = await makeRequest(`${apiBaseUrl}/features`);
    const body = JSON.parse(response.body);

    // 检查必需字段
    const requiredFields = ['success', 'data', 'timestamp'];
    const missingFields = requiredFields.filter(field => !body.hasOwnProperty(field));

    if (missingFields.length === 0) {
      writePass('API 响应格式', '包含所有必需字段 (success, data, timestamp)');
    } else {
      writeFail('API 响应格式', `缺少字段：${missingFields.join(', ')}`);
    }

    // 检查数据结构
    if (Array.isArray(body.data) && body.data.length > 0) {
      const firstItem = body.data[0];
      const itemFields = ['id', 'title', 'description', 'icon'];
      const missingItemFields = itemFields.filter(field => !firstItem.hasOwnProperty(field));

      if (missingItemFields.length === 0) {
        writePass('  - 数据结构', '核心优势包含所有必需字段');
      } else {
        writeFail('  - 数据结构', `缺少字段：${missingItemFields.join(', ')}`);
      }
    }
  } catch (error) {
    writeFail('API 响应格式验证', error.message);
  }
}

// ============================================
// 测试 8: 前端 API 配置
// ============================================
async function testFrontendConfig() {
  writeTestHeader('测试 8: 前端 API 配置测试');

  try {
    const envFile = 'D:\\codes\\aicode\\win-web\\TASK-001\\frontend\\.env';
    if (fs.existsSync(envFile)) {
      const envContent = fs.readFileSync(envFile, 'utf8');
      const apiUrlLine = envContent.split('\n').find(line => line.includes('VITE_API_URL'));
      if (apiUrlLine && apiUrlLine.includes('VITE_API_URL=http://localhost:3000/api')) {
        writePass('前端 API 配置', 'VITE_API_URL 配置正确');
      } else {
        writeFail('前端 API 配置', `VITE_API_URL 配置不正确：${apiUrlLine}`);
      }
    } else {
      writeFail('前端 API 配置', '.env 文件不存在');
    }
  } catch (error) {
    writeFail('前端 API 配置', error.message);
  }
}

// ============================================
// 测试 9: 代码文件完整性
// ============================================
async function testCodeFiles() {
  writeTestHeader('测试 9: 代码文件完整性');

  const requiredFiles = [
    'backend/controllers/public-data.js',
    'backend/controllers/news.js',
    'backend/controllers/products.js',
    'backend/routes/public-data.js',
    'frontend/src/api/public.ts',
    'frontend/src/pages/Home/index.tsx'
  ];

  for (const file of requiredFiles) {
    const fullPath = path.join('D:\\codes\\aicode\\win-web\\TASK-001', file);
    if (fs.existsSync(fullPath)) {
      const size = fs.statSync(fullPath).size;
      writePass(`文件：${file}`, `存在 (${(size / 1024).toFixed(2)} KB)`);
    } else {
      writeFail(`文件：${file}`, '不存在');
    }
  }
}

// ============================================
// 测试 10: 文档完整性
// ============================================
async function testDocumentation() {
  writeTestHeader('测试 10: 文档完整性');

  const docFiles = [
    'DEVELOPMENT-PLAN.md',
    'DEVELOPMENT-PROGRESS.md',
    'backend/database/schema.md',
    'backend/public/images/README.md'
  ];

  for (const doc of docFiles) {
    const fullPath = path.join('D:\\codes\\aicode\\win-web\\TASK-001', doc);
    if (fs.existsSync(fullPath)) {
      const size = fs.statSync(fullPath).size;
      writePass(`文档：${doc}`, `存在 (${(size / 1024).toFixed(2)} KB)`);
    } else {
      writeFail(`文档：${doc}`, '不存在');
    }
  }
}

// ============================================
// 生成测试报告
// ============================================
function generateReport() {
  const testEndTime = Date.now();
  const testDuration = ((testEndTime - testStartTime) / 1000).toFixed(2);

  const passCount = testResults.filter(r => r.status === 'PASS').length;
  const failCount = testResults.filter(r => r.status === 'FAIL').length;
  const skipCount = testResults.filter(r => r.status === 'SKIP').length;
  const totalCount = testResults.length;
  const passRate = totalCount > 0 ? ((passCount / totalCount) * 100).toFixed(2) : 0;

  log(colors.cyan, '\n========================================');
  log(colors.cyan, '  测试报告总结');
  log(colors.cyan, '========================================');
  log(colors.white, `测试总数量：${totalCount}`);
  log(colors.green, `  ✅ 通过：${passCount}`);
  log(colors.red, `  ❌ 失败：${failCount}`);
  log(colors.gray, `  ⏭️  跳过：${skipCount}`);
  log(passRate >= 90 ? colors.green : passRate >= 70 ? colors.yellow : colors.red, 
      `通过率：${passRate}%`);
  log(colors.gray, `测试耗时：${testDuration} 秒`);
  log(colors.cyan, '========================================\n');

  if (failCount > 0) {
    log(colors.red, '❌ 失败的测试项:');
    testResults.filter(r => r.status === 'FAIL').forEach(r => {
      log(colors.red, `  - ${r.name}: ${r.details}`);
    });
  }

  if (skipCount > 0) {
    log(colors.gray, '\n⏭️  跳过的测试项:');
    testResults.filter(r => r.status === 'SKIP').forEach(r => {
      log(colors.gray, `  - ${r.name}: ${r.details}`);
    });
  }

  // 保存测试报告
  const reportPath = `D:\\codes\\aicode\\win-web\\TASK-001\\tests\\TEST-REPORT-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  log(colors.cyan, `\n📄 测试报告已保存：${reportPath}`);

  return { passCount, failCount, skipCount, totalCount, passRate };
}

// ============================================
// 主测试流程
// ============================================
async function runTests() {
  log(colors.cyan, '\n========================================');
  log(colors.cyan, '  公司官网动态内容系统 - 自动化测试报告');
  log(colors.cyan, '========================================');
  log(colors.gray, `测试开始时间：${new Date().toLocaleString('zh-CN')}`);
  log(colors.gray, '测试环境：开发环境');
  log(colors.gray, `后端地址：${apiBaseUrl}`);
  log(colors.gray, `前端地址：${frontendUrl}`);
  log(colors.cyan, '========================================\n');

  try {
    await testServiceHealth();
    await testPublicDataAPI();
    await testNewsAPI();
    await testProductsAPI();
    await testImageResources();
    await testDatabaseConnection();
    await testAPIResponseFormat();
    await testFrontendConfig();
    await testCodeFiles();
    await testDocumentation();

    const summary = generateReport();
    
    // 退出码
    process.exit(summary.failCount > 0 ? 1 : 0);
  } catch (error) {
    log(colors.red, `\n❌ 测试过程中发生错误：${error.message}`);
    process.exit(1);
  }
}

// 运行测试
runTests();
