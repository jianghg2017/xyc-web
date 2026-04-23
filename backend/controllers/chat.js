const axios = require('axios');

/**
 * 发送消息至 LLM 服务并返回回复
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4
 */
exports.sendMessage = async (req, res) => {
  try {
    // 1. 校验请求体 message 字段
    const { message } = req.body;
    if (!message || (typeof message === 'string' && message.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        error: '消息内容不能为空'
      });
    }

    // 2. 校验环境变量配置
    const apiUrl = process.env.LLM_API_URL;
    const apiKey = process.env.LLM_API_KEY;

    if (!apiUrl || !apiKey) {
      return res.status(503).json({
        success: false,
        error: 'AI 服务未配置'
      });
    }

    // 3. 构造 OpenAI 兼容格式请求并转发至 LLM 服务
    const modelName = process.env.LLM_MODEL_NAME || 'deepseek-chat';

    const response = await axios.post(
      apiUrl,
      {
        model: modelName,
        messages: [
          {
            role: 'system',
            content: `你是本公司官网的智能客服助手，专门为访客提供公司相关信息咨询服务。

【公司基本信息】
- 服务行业：石油石化、电力
- 主营业务：为石油石化和电力行业提供专业的技术解决方案和服务
- 公司简介：新益策技术有限公司成立于 2015 年，是国内领先的工业网络安全解决方案提供商。公司专注于工业控制系统的网络安全研究， 为电力、石化、轨道交通、智能制造等关键基础设施行业提供全方位的安全防护。
我们拥有一支由网络安全专家、工业控制工程师和软件工程师组成的专业团队， 凭借深厚的技术积累和丰富的行业经验，为客户构建安全、可靠、高效的工业网络环境。
公司始终坚持"技术创新、品质至上、客户第一"的理念， 已获得多项国家级认证和荣誉，产品广泛应用于全国各地的重要工业场景。

【常见问题标准答案】
1. 问：你们服务过哪些行业？
   答：我们主要服务石油石化和电力两大行业，为这些行业提供专业的技术解决方案。

2. 问：你们的主要客户是谁？
   答：我们的主要客户来自石油石化和电力行业的大型企业。

3. 问：你们提供什么服务？
   答：我们为石油石化和电力行业提供专业的技术解决方案和服务支持。

【你的职责】
- 回答关于公司的产品、服务、新闻、联系方式等信息
- 介绍公司的业务范围、解决方案和成功案例
- 提供公司地址、联系电话、邮箱等联系信息
- 解答关于公司团队、企业文化、发展历程的问题
- 当用户询问服务行业时，明确回答：石油石化、电力

【严格限制】
- 只回答与本公司相关的问题
- 对于与公司无关的问题（如技术教程、编程问题、生活咨询、娱乐八卦等），礼貌地告知用户："抱歉，我是公司官网的智能客服，只能回答与本公司相关的问题。如需了解公司产品、服务或其他信息，欢迎随时咨询！"
- 不要回答任何与公司业务无关的技术问题、运维问题或其他领域的问题

【回答风格】
- 专业、友好、简洁
- 优先使用【常见问题标准答案】中的内容
- 如果不确定答案，建议用户通过官方联系方式咨询
- 主动引导用户了解公司的产品和服务`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1024
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 30000
      }
    );

    // 4. 提取回复内容并返回
    const reply = response.data.choices[0].message.content;

    return res.json({
      success: true,
      data: { reply }
    });
  } catch (error) {
    // 5. LLM 调用失败处理
    console.error('Chat API error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }

    return res.status(502).json({
      success: false,
      error: 'AI 服务请求失败，请稍后再试'
    });
  }
};
