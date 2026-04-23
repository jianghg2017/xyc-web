/**
 * Feature: company-website-completion
 * Property 9: Database init idempotency
 *
 * Validates: Requirements 10.3
 * WHEN running initDatabase() multiple times,
 * THE Database SHALL NOT insert duplicate rows (idempotent operation).
 */

'use strict';

// ─── In-memory state that simulates the database ────────────────────────────

// These are module-level so they can be accessed from jest.mock factory.
// Prefixed with 'mock' to satisfy Jest's variable naming restriction.
let mockDbState = {
  admins: [],
  features: [],
  company_stats: [],
  company_timeline: [],
  company_values: [],
  site_settings: [],
  banners: [],
  news: [],
  products: [],
};

function resetMockDbState() {
  mockDbState = {
    admins: [],
    features: [],
    company_stats: [],
    company_timeline: [],
    company_values: [],
    site_settings: [],
    banners: [],
    news: [],
    products: [],
  };
}

// ─── Mock mysql2/promise ─────────────────────────────────────────────────────

jest.mock('mysql2/promise', () => {
  // Note: jest.mock factory cannot reference outer scope variables directly,
  // but variables prefixed with 'mock' are allowed.
  // We use a getter approach via global to share state.

  const mockQuery = jest.fn(async (sql, params) => {
    const state = global.__mockDbState;
    const sqlTrimmed = sql.trim();

    // CREATE DATABASE / USE / CREATE TABLE → no-op
    if (
      /^CREATE DATABASE/i.test(sqlTrimmed) ||
      /^USE /i.test(sqlTrimmed) ||
      /^CREATE TABLE/i.test(sqlTrimmed)
    ) {
      return [[], {}];
    }

    // SELECT COUNT(*) as c FROM news WHERE status="published"
    if (/SELECT COUNT\(\*\) as c FROM news/i.test(sqlTrimmed)) {
      const count = state.news.filter((r) => r.status === 'published').length;
      return [[{ c: count }], {}];
    }

    // SELECT COUNT(*) as c FROM products WHERE status="published"
    if (/SELECT COUNT\(\*\) as c FROM products/i.test(sqlTrimmed)) {
      const count = state.products.filter((r) => r.status === 'published').length;
      return [[{ c: count }], {}];
    }

    // SELECT id FROM admins WHERE email = ?
    if (/SELECT id FROM admins WHERE email/i.test(sqlTrimmed)) {
      const email = params && params[0];
      const found = state.admins.filter((r) => r.email === email);
      return [found, {}];
    }

    // INSERT INTO admins
    if (/INSERT INTO admins/i.test(sqlTrimmed)) {
      const email = params && params[0];
      state.admins.push({ id: state.admins.length + 1, email });
      return [{ insertId: state.admins.length }, {}];
    }

    // SELECT id FROM features LIMIT 1
    if (/SELECT id FROM features/i.test(sqlTrimmed)) {
      return [state.features.slice(0, 1), {}];
    }

    // INSERT INTO features
    if (/INSERT INTO features/i.test(sqlTrimmed)) {
      state.features.push({ id: 1 }, { id: 2 }, { id: 3 });
      return [{ insertId: 1 }, {}];
    }

    // SELECT id FROM company_stats LIMIT 1
    if (/SELECT id FROM company_stats/i.test(sqlTrimmed)) {
      return [state.company_stats.slice(0, 1), {}];
    }

    // INSERT INTO company_stats
    if (/INSERT INTO company_stats/i.test(sqlTrimmed)) {
      state.company_stats.push({ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 });
      return [{ insertId: 1 }, {}];
    }

    // SELECT id FROM company_timeline LIMIT 1
    if (/SELECT id FROM company_timeline/i.test(sqlTrimmed)) {
      return [state.company_timeline.slice(0, 1), {}];
    }

    // INSERT INTO company_timeline
    if (/INSERT INTO company_timeline/i.test(sqlTrimmed)) {
      for (let i = 1; i <= 6; i++) state.company_timeline.push({ id: i });
      return [{ insertId: 1 }, {}];
    }

    // SELECT id FROM company_values LIMIT 1
    if (/SELECT id FROM company_values/i.test(sqlTrimmed)) {
      return [state.company_values.slice(0, 1), {}];
    }

    // INSERT INTO company_values
    if (/INSERT INTO company_values/i.test(sqlTrimmed)) {
      state.company_values.push({ id: 1 }, { id: 2 }, { id: 3 });
      return [{ insertId: 1 }, {}];
    }

    // SELECT id FROM site_settings LIMIT 1
    if (/SELECT id FROM site_settings/i.test(sqlTrimmed)) {
      return [state.site_settings.slice(0, 1), {}];
    }

    // INSERT INTO site_settings
    if (/INSERT INTO site_settings/i.test(sqlTrimmed)) {
      for (let i = 1; i <= 12; i++) state.site_settings.push({ id: i });
      return [{ insertId: 1 }, {}];
    }

    // SELECT id FROM banners LIMIT 1
    if (/SELECT id FROM banners/i.test(sqlTrimmed)) {
      return [state.banners.slice(0, 1), {}];
    }

    // INSERT INTO banners
    if (/INSERT INTO banners/i.test(sqlTrimmed)) {
      state.banners.push({ id: 1 }, { id: 2 }, { id: 3 });
      return [{ insertId: 1 }, {}];
    }

    // SELECT id FROM news LIMIT 1
    if (/SELECT id FROM news/i.test(sqlTrimmed)) {
      return [state.news.slice(0, 1), {}];
    }

    // INSERT INTO news
    if (/INSERT INTO news/i.test(sqlTrimmed)) {
      for (let i = 1; i <= 5; i++) {
        state.news.push({ id: i, status: 'published' });
      }
      return [{ insertId: 1 }, {}];
    }

    // SELECT id FROM products LIMIT 1
    if (/SELECT id FROM products/i.test(sqlTrimmed)) {
      return [state.products.slice(0, 1), {}];
    }

    // INSERT INTO products
    if (/INSERT INTO products/i.test(sqlTrimmed)) {
      for (let i = 1; i <= 5; i++) {
        state.products.push({ id: i, status: 'published' });
      }
      return [{ insertId: 1 }, {}];
    }

    // Default: return empty result
    return [[], {}];
  });

  const mockConnection = {
    query: mockQuery,
    release: jest.fn(),
  };

  const mockPool = {
    getConnection: jest.fn(async () => mockConnection),
    query: mockQuery,
    end: jest.fn(async () => {}),
  };

  return {
    createPool: jest.fn(() => mockPool),
  };
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Property 9: Database init idempotency', () => {
  let initDatabase;
  let pool;

  beforeEach(() => {
    // Reset in-memory DB state before each test and expose via global
    resetMockDbState();
    global.__mockDbState = mockDbState;

    // Clear module registry so init.js re-evaluates with fresh mock state
    jest.resetModules();

    // Re-require after resetting modules
    const initModule = require('./init');
    initDatabase = initModule.initDatabase;
    pool = initModule.pool;
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete global.__mockDbState;
  });

  /**
   * Validates: Requirements 10.3
   *
   * Calling initDatabase() twice should produce the same row counts for
   * news — repeated runs must not insert duplicates.
   */
  it('running initDatabase twice produces same news row counts', async () => {
    // First call — seeds the database
    await initDatabase();

    const [count1Result] = await pool.query(
      'SELECT COUNT(*) as c FROM news WHERE status="published"'
    );
    const count1 = count1Result[0].c;

    // Second call — should be idempotent (tables already have data)
    await initDatabase();

    const [count2Result] = await pool.query(
      'SELECT COUNT(*) as c FROM news WHERE status="published"'
    );
    const count2 = count2Result[0].c;

    expect(count2).toBe(count1);
    expect(count1).toBeGreaterThan(0);
  });

  /**
   * Validates: Requirements 10.3
   *
   * Calling initDatabase() twice should produce the same row counts for
   * products — repeated runs must not insert duplicates.
   */
  it('running initDatabase twice produces same products row counts', async () => {
    // First call — seeds the database
    await initDatabase();

    const [count1Result] = await pool.query(
      'SELECT COUNT(*) as c FROM products WHERE status="published"'
    );
    const count1 = count1Result[0].c;

    // Second call — should be idempotent
    await initDatabase();

    const [count2Result] = await pool.query(
      'SELECT COUNT(*) as c FROM products WHERE status="published"'
    );
    const count2 = count2Result[0].c;

    expect(count2).toBe(count1);
    expect(count1).toBeGreaterThan(0);
  });

  it('running initDatabase three times produces same row counts as after first call', async () => {
    await initDatabase();

    const [newsCount1] = await pool.query(
      'SELECT COUNT(*) as c FROM news WHERE status="published"'
    );
    const [productsCount1] = await pool.query(
      'SELECT COUNT(*) as c FROM products WHERE status="published"'
    );

    await initDatabase();
    await initDatabase();

    const [newsCount3] = await pool.query(
      'SELECT COUNT(*) as c FROM news WHERE status="published"'
    );
    const [productsCount3] = await pool.query(
      'SELECT COUNT(*) as c FROM products WHERE status="published"'
    );

    expect(newsCount3[0].c).toBe(newsCount1[0].c);
    expect(productsCount3[0].c).toBe(productsCount1[0].c);
  });

  it('news table has at least 5 published records after init', async () => {
    await initDatabase();

    const [countResult] = await pool.query(
      'SELECT COUNT(*) as c FROM news WHERE status="published"'
    );
    expect(countResult[0].c).toBeGreaterThanOrEqual(5);
  });

  it('products table has at least 5 published records after init', async () => {
    await initDatabase();

    const [countResult] = await pool.query(
      'SELECT COUNT(*) as c FROM products WHERE status="published"'
    );
    expect(countResult[0].c).toBeGreaterThanOrEqual(5);
  });
});
