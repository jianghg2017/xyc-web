const rateLimit = require('./rateLimit');
const { rateLimitMap, RATE_LIMIT } = rateLimit;

// Helper to create mock req/res/next
function createMocks(ip = '127.0.0.1') {
  return {
    req: { ip, connection: { remoteAddress: ip } },
    res: {
      _status: null,
      _json: null,
      status(code) {
        this._status = code;
        return this;
      },
      json(body) {
        this._json = body;
        return this;
      }
    },
    next: jest.fn()
  };
}

describe('rateLimit middleware', () => {
  beforeEach(() => {
    rateLimitMap.clear();
  });

  test('allows requests under the limit', () => {
    const { req, res, next } = createMocks();
    rateLimit(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('allows up to 20 requests per IP per minute', () => {
    for (let i = 0; i < RATE_LIMIT; i++) {
      const { req, res, next } = createMocks('10.0.0.1');
      rateLimit(req, res, next);
      expect(next).toHaveBeenCalled();
    }
  });

  test('returns 429 after 20 requests from the same IP', () => {
    // Exhaust the limit
    for (let i = 0; i < RATE_LIMIT; i++) {
      const { req, res, next } = createMocks('10.0.0.2');
      rateLimit(req, res, next);
    }

    // 21st request should be rejected
    const { req, res, next } = createMocks('10.0.0.2');
    rateLimit(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res._status).toBe(429);
    expect(res._json).toEqual({
      success: false,
      error: '请求过于频繁，请稍后再试'
    });
  });

  test('tracks different IPs independently', () => {
    // Exhaust limit for IP A
    for (let i = 0; i < RATE_LIMIT; i++) {
      const { req, res, next } = createMocks('10.0.0.3');
      rateLimit(req, res, next);
    }

    // IP B should still be allowed
    const { req, res, next } = createMocks('10.0.0.4');
    rateLimit(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('resets counter after the time window expires', () => {
    const ip = '10.0.0.5';

    // Exhaust the limit
    for (let i = 0; i < RATE_LIMIT; i++) {
      const { req, res, next } = createMocks(ip);
      rateLimit(req, res, next);
    }

    // Simulate window expiry by manipulating the stored startTime
    const entry = rateLimitMap.get(ip);
    entry.startTime = Date.now() - 61000; // 61 seconds ago

    // Should be allowed again
    const { req, res, next } = createMocks(ip);
    rateLimit(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('falls back to connection.remoteAddress when req.ip is undefined', () => {
    const req = { ip: undefined, connection: { remoteAddress: '192.168.1.1' } };
    const { res, next } = createMocks();
    rateLimit(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(rateLimitMap.has('192.168.1.1')).toBe(true);
  });
});
