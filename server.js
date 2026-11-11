import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { computeExperiment, getUIConfigs } from './src/physics.js';
import { buildReportPrompt } from './src/prompt.js';
import { callGLM } from './src/llm.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), {
  etag: true,
  lastModified: true,
  setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache'),
}));

app.get('/api/experiments', (req, res) => res.json(getUIConfigs()));

app.post('/api/analyze', (req, res) => {
  try {
    const { experimentType, measurements, instrumentErrors, params } = req.body;
    if (!measurements || measurements.length === 0) return res.status(400).json({ error: '请提供实验数据' });
    const results = computeExperiment(experimentType, measurements, instrumentErrors, params);
    res.json({ type: experimentType, results });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

app.post('/api/generate-stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
  try {
    const { experimentType, measurements, instrumentErrors, params } = req.body;
    if (!measurements || measurements.length === 0) { send({ error: '请提供实验数据' }); return res.end(); }

    const configs = getUIConfigs();
    const expName = configs[experimentType]?.name || experimentType;
    send({ step: 1, name: '识别实验类型', status: 'running' });
    await delay(400);
    send({ step: 1, status: 'done', detail: expName });

    send({ step: 2, name: '数据验证', status: 'running' });
    await delay(400);
    send({ step: 2, status: 'done', detail: `${measurements.length} 组有效数据` });

    send({ step: 3, name: '直接法计算', status: 'running' });
    await delay(500);
    const results = computeExperiment(experimentType, measurements, instrumentErrors, params);
    send({ step: 3, status: 'done', detail: results.direct ? `${results.meta.quantity} = ${results.direct.mean} ${results.meta.unit}` : '跳过' });

    send({ step: 4, name: results.graph ? `作图法 ${results.meta.graphYLabel}-${results.meta.graphXLabel} 拟合` : '作图法', status: 'running' });
    await delay(500);
    send({ step: 4, status: 'done', detail: results.graph ? `${results.meta.quantity} = ${results.graph.value} ${results.meta.unit}, R² = ${results.graph.r2}` : '本实验无拟合法' });

    send({ step: 5, name: '不确定度分析', status: 'running' });
    await delay(400);
    const errDetail = results.direct ? `u_c = ${results.direct.uC} ${results.meta.unit}` + (results.relativeError !== null ? `, 相对误差 ${results.relativeError}%` : '') : '完成';
    send({ step: 5, status: 'done', detail: errDetail });

    send({ step: 6, name: '调用 AI 生成报告', status: 'running' });
    const { systemPrompt, userPrompt } = buildReportPrompt({ measurements, instrumentErrors }, results);
    const report = await callGLM([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);
    send({ step: 6, status: 'done', detail: '报告生成完成' });

    send({ done: true, type: experimentType, results, report });
    res.end();
  } catch (err) {
    send({ error: err.message });
    res.end();
  }
});

app.listen(PORT, () => console.log(`服务器已启动: http://localhost:${PORT}`));