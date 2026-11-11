// 报告生成 Prompt 模板（通用，适配所有实验类型）

export function buildReportPrompt(experimentData, results) {
  const m = results.meta;
  const cols = Object.keys(experimentData.measurements[0]);

  const systemPrompt = `你是物理实验报告撰写助手，擅长撰写规范的大学物理实验报告。

报告必须包含以下章节（用 Markdown 二级标题）：
## 实验目的
简述本实验要测量的物理量及方法。

## 实验原理
写出核心公式及其推导。

## 实验仪器与装置
列出仪器及仪器误差。

## 数据记录与处理
展示原始数据表格、计算过程、有效数字处理、不确定度计算（A类、B类、合成）。
两种方法都要展示：直接计算法和作图法。

## 结果分析
给出最终结果${m.refValue ? '，与参考值比较，计算相对误差' : ''}。分析误差来源（至少3条具体原因）。

## 实验结论
总结测量结果，评价实验精度。

写作要求:
- 使用规范物理学术语
- 有效数字保留正确
- 不确定度计算过程清晰展示中间步骤
- 误差分析要具体，不要泛泛而谈
- 数据表格用 Markdown 表格
- 公式用行内代码标记`;

  const dataRows = experimentData.measurements
    .map((row, i) => `| ${i + 1} | ${cols.map((c) => row[c]).join(' | ')} |`)
    .join('\n');

  const errorsStr = Object.entries(experimentData.instrumentErrors)
    .map(([k, v]) => `${k} = ${v}`)
    .join('，');

  const refSection = m.refValue
    ? `\n### 参考值\n${m.refLabel} ${m.quantity}₀ = ${m.refValue} ${m.unit}\n相对误差: ${results.relativeError}%`
    : '';

  const userPrompt = `实验名称: ${m.experimentName}

实验数据（共 ${experimentData.measurements.length} 组测量）:
| 组号 | ${cols.join(' | ')} |
|------|${cols.map(() => '------').join('|')}|
${dataRows}

仪器误差: ${errorsStr}

计算结果（已由程序完成精确计算）:

### 方法一: 直接计算法（${results.direct.formula}）
各组 ${m.quantity} 值: ${results.direct.values.join(', ')} ${m.unit}
平均值 ${m.quantity} = ${results.direct.mean} ${m.unit}
A类不确定度 u_A = ${results.direct.uA} ${m.unit}
B类不确定度 u_B = ${results.direct.uB} ${m.unit}
合成不确定度 u_c = ${results.direct.uC} ${m.unit}
结果: ${m.quantity} = ${results.direct.result} ${m.unit}

### 方法二: 作图法（${m.graphYLabel}-${m.graphXLabel} 线性拟合）
拟合方程: ${results.graph.fitEquation}
相关系数 R² = ${results.graph.r2}
${m.quantity} = ${results.graph.result} ${m.unit}
${refSection}

请根据以上数据和计算结果，撰写一份完整的大学物理实验报告。`;

  return { systemPrompt, userPrompt };
}