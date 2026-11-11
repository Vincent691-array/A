// 智谱 GLM API 封装
// 文档: https://open.bigmodel.cn/dev/api

const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

export async function callGLM(messages, options = {}) {
  const apiKey = process.env.ZHIPUAI_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('未配置 ZHIPUAI_API_KEY，请在 .env 文件中设置智谱 API Key');
  }

  const body = {
    model: options.model || 'glm-4-flash',
    messages,
    temperature: options.temperature ?? 0.7,
    stream: false,
  };

  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`GLM API 错误 ${resp.status}: ${errText}`);
  }

  const data = await resp.json();
  return data.choices[0].message.content;
}