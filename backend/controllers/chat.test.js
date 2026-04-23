const axios = require('axios');
const chatController = require('./chat');

// Mock axios
jest.mock('axios');

// Helper to create mock req/res
function createMocks(body = {}) {
  return {
    req: {
      body,
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' }
    },
    res: {
      _status: 200,
      _json: null,
      status(code) {
        this._status = code;
        return this;
      },
      json(data) {
        this._json = data;
        return this;
      }
    }
  };
}

describe('Chat Controller - sendMessage', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = {
      ...originalEnv,
      LLM_API_URL: 'https://api.example.com/v1/chat/completions',
      LLM_API_KEY: 'test-api-key'
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  // --- Input validation tests ---

  test('returns 400 when message is missing', async () => {
    const { req, res } = createMocks({});
    await chatController.sendMessage(req, res);
    expect(res._status).toBe(400);
    expect(res._json.success).toBe(false);
  });

  test('returns 400 when message is empty string', async () => {
    const { req, res } = createMocks({ message: '' });
    await chatController.sendMessage(req, res);
    expect(res._status).toBe(400);
    expect(res._json.success).toBe(false);
  });

  test('returns 400 when message is whitespace only', async () => {
    const { req, res } = createMocks({ message: '   ' });
    await chatController.sendMessage(req, res);
    expect(res._status).toBe(400);
    expect(res._json.success).toBe(false);
  });

  // --- Environment variable tests ---

  test('returns 503 when LLM_API_URL is not configured', async () => {
    delete process.env.LLM_API_URL;
    const { req, res } = createMocks({ message: 'hello' });
    await chatController.sendMessage(req, res);
    expect(res._status).toBe(503);
    expect(res._json.success).toBe(false);
    expect(res._json.error).toContain('未配置');
  });

  test('returns 503 when LLM_API_KEY is not configured', async () => {
    delete process.env.LLM_API_KEY;
    const { req, res } = createMocks({ message: 'hello' });
    await chatController.sendMessage(req, res);
    expect(res._status).toBe(503);
    expect(res._json.success).toBe(false);
    expect(res._json.error).toContain('未配置');
  });

  test('returns 503 when both LLM env vars are missing', async () => {
    delete process.env.LLM_API_URL;
    delete process.env.LLM_API_KEY;
    const { req, res } = createMocks({ message: 'hello' });
    await chatController.sendMessage(req, res);
    expect(res._status).toBe(503);
    expect(res._json.success).toBe(false);
  });

  // --- Successful LLM response tests ---

  test('returns 200 with reply on successful LLM response', async () => {
    axios.post.mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: '这是AI的回复'
            }
          }
        ]
      }
    });

    const { req, res } = createMocks({ message: '你好' });
    await chatController.sendMessage(req, res);

    expect(res._status).toBe(200);
    expect(res._json).toEqual({
      success: true,
      data: { reply: '这是AI的回复' }
    });
  });

  test('forwards message to LLM with correct format', async () => {
    axios.post.mockResolvedValue({
      data: {
        choices: [{ message: { content: 'reply' } }]
      }
    });

    const { req, res } = createMocks({ message: '测试消息' });
    await chatController.sendMessage(req, res);

    expect(axios.post).toHaveBeenCalledWith(
      'https://api.example.com/v1/chat/completions',
      expect.objectContaining({
        model: 'deepseek-chat',
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          expect.objectContaining({ role: 'user', content: '测试消息' })
        ])
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-api-key'
        })
      })
    );
  });

  test('uses custom model name from LLM_MODEL_NAME env var', async () => {
    process.env.LLM_MODEL_NAME = 'gpt-4';
    axios.post.mockResolvedValue({
      data: {
        choices: [{ message: { content: 'reply' } }]
      }
    });

    const { req, res } = createMocks({ message: 'hello' });
    await chatController.sendMessage(req, res);

    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ model: 'gpt-4' }),
      expect.any(Object)
    );
  });

  // --- LLM failure tests ---

  test('returns 502 when LLM service call fails', async () => {
    axios.post.mockRejectedValue(new Error('Connection refused'));

    const { req, res } = createMocks({ message: 'hello' });
    await chatController.sendMessage(req, res);

    expect(res._status).toBe(502);
    expect(res._json.success).toBe(false);
  });

  test('returns 502 when LLM service times out', async () => {
    const timeoutError = new Error('timeout of 30000ms exceeded');
    timeoutError.code = 'ECONNABORTED';
    axios.post.mockRejectedValue(timeoutError);

    const { req, res } = createMocks({ message: 'hello' });
    await chatController.sendMessage(req, res);

    expect(res._status).toBe(502);
    expect(res._json.success).toBe(false);
  });
});

// --- Rate limiting tests (integration with middleware) ---

describe('Rate Limiting', () => {
  const rateLimit = require('../middleware/rateLimit');
  const { rateLimitMap, RATE_LIMIT } = rateLimit;

  beforeEach(() => {
    rateLimitMap.clear();
  });

  test('returns 429 after 20 requests from the same IP', () => {
    const ip = '10.0.0.99';

    // Exhaust the limit
    for (let i = 0; i < RATE_LIMIT; i++) {
      const req = { ip, connection: { remoteAddress: ip } };
      const res = {
        _status: null,
        _json: null,
        status(code) { this._status = code; return this; },
        json(body) { this._json = body; return this; }
      };
      const next = jest.fn();
      rateLimit(req, res, next);
      expect(next).toHaveBeenCalled();
    }

    // 21st request should be rejected
    const req = { ip, connection: { remoteAddress: ip } };
    const res = {
      _status: null,
      _json: null,
      status(code) { this._status = code; return this; },
      json(body) { this._json = body; return this; }
    };
    const next = jest.fn();
    rateLimit(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res._status).toBe(429);
    expect(res._json.success).toBe(false);
  });
});
