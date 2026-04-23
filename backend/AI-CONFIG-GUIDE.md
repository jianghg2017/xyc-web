# AI 智能助手配置指南

## 问题诊断结果

✅ **配置正确**：
- API URL: `https://open.bigmodel.cn/api/paas/v4/chat/completions`
- API Key: 有效
- 模型名称: `glm-4` (正确)

❌ **当前问题**：
- 错误代码: 1113
- 错误信息: "余额不足或无可用资源包,请充值。"

## 解决方案

### 方案 1: 充值智谱 AI 账户

1. 访问智谱 AI 开放平台: https://open.bigmodel.cn/
2. 登录你的账户
3. 进入"用户中心" → "账户管理"
4. 充值或激活免费试用资源包
5. 充值完成后，AI 助手将自动恢复正常

### 方案 2: 使用其他 LLM 服务

#### 使用 DeepSeek（推荐，性价比高）

修改 `.env` 文件：

```bash
LLM_API_URL=https://api.deepseek.com/v1/chat/completions
LLM_API_KEY=你的DeepSeek_API_Key
LLM_MODEL_NAME=deepseek-chat
```

注册地址: https://platform.deepseek.com/

#### 使用 OpenAI

修改 `.env` 文件：

```bash
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_API_KEY=你的OpenAI_API_Key
LLM_MODEL_NAME=gpt-3.5-turbo
```

#### 使用阿里云通义千问

修改 `.env` 文件：

```bash
LLM_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
LLM_API_KEY=你的通义千问_API_Key
LLM_MODEL_NAME=qwen-turbo
```

## 智谱 AI 支持的模型列表

- `glm-4` - GLM-4 标准版（推荐）
- `glm-4-plus` - GLM-4 Plus 增强版
- `glm-4-flash` - GLM-4 Flash 快速版
- `glm-4-air` - GLM-4 Air 轻量版
- `glm-4-airx` - GLM-4 AirX 超轻量版

## 测试 API 连接

运行测试脚本：

```bash
cd TASK-001/backend
node test-chat-api.js
```

成功响应示例：

```json
{
  "success": true,
  "data": {
    "reply": "你好！我是智能助手，有什么可以帮您的吗？"
  }
}
```

## 常见错误代码

| 错误代码 | 错误信息 | 解决方案 |
|---------|---------|---------|
| 1211 | 模型不存在 | 检查 `LLM_MODEL_NAME` 配置 |
| 1113 | 余额不足 | 充值或激活资源包 |
| 1301 | API Key 无效 | 检查 `LLM_API_KEY` 配置 |
| 1302 | API Key 过期 | 重新生成 API Key |

## 重启服务

修改配置后，需要重启后端服务：

```bash
# 如果使用 nodemon (开发模式)
# 会自动重启，或手动触发：
cd TASK-001/backend
npm run dev

# 如果使用 node (生产模式)
# 需要手动重启
```

## 联系支持

- 智谱 AI 官方文档: https://open.bigmodel.cn/dev/api
- 智谱 AI 客服: 开放平台右下角在线客服
