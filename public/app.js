// 动画播放器主控（普通脚本，动态加载3D模块）
const $ = (id) => document.getElementById(id);

// 2D模块从全局获取
const ANIM_MODULES_2D = {
  pendulum: PendulumAnim,
  newtonRing: NewtonRingAnim,
  voltAmpere: VoltAmpereAnim,
  youngModulus: YoungModulusAnim,
  hallEffect: HallEffectAnim,
  momentOfInertia: MomentOfInertiaAnim,
  soundSpeed: SoundSpeedAnim,
  photoelectric: PhotoelectricAnim,
  michelson: MichelsonAnim,
  heatEngine: HeatEngineAnim,
  thermalConductivity: ThermalConductivityAnim,
  wedgeInterference: WedgeInterferenceAnim,
  oscilloscope: OscilloscopeAnim,
};

// 3D模块异步加载后填充
let ANIM_MODULES_3D = {};
let Engine3DClass = null;
let engine3d = null;

const ANIM_NAMES = {
  pendulum: '单摆法测重力加速度',
  newtonRing: '牛顿环测曲率半径',
  voltAmpere: '伏安法测电阻',
  youngModulus: '杨氏模量测定（光杠杆法）',
  hallEffect: '霍尔效应测磁场',
  momentOfInertia: '三线摆测转动惯量',
  soundSpeed: '声速测定（驻波法）',
  photoelectric: '光电效应测普朗克常数',
  michelson: '迈克尔逊干涉测波长',
  heatEngine: '空气热机效率测定',
  thermalConductivity: '不良导体热导率测定',
  wedgeInterference: '等厚干涉测细丝直径',
  oscilloscope: '示波器原理与应用',
};

let EXPERIMENTS = {};
let currentType = 'pendulum';
let currentPhase = 'principle';
let engine2d = null;
let activeEngine = null;
let viewMode = '3d';

function getModule() {
  return ANIM_MODULES_3D[currentType] || ANIM_MODULES_2D[currentType];
}

function has3D(phase) {
  const m = ANIM_MODULES_3D[currentType];
  return m && m[phase] != null;
}

function init() {
  engine2d = new AnimationEngine($('animCanvas'));
  engine2d.onUpdate = updateUI;

  const sel = $('expType');
  sel.innerHTML = Object.keys(ANIM_NAMES).map((k) => `<option value="${k}">${ANIM_NAMES[k]}</option>`).join('');
  sel.value = currentType;

  loadExperiment(currentType);

  sel.addEventListener('change', () => { currentType = sel.value; loadExperiment(currentType); });

  document.querySelectorAll('.phase-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.phase-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      switchPhase(tab.dataset.phase);
    });
  });

  $('playBtn').addEventListener('click', () => activeEngine && activeEngine.toggle());
  $('prevBtn').addEventListener('click', () => activeEngine && activeEngine.prevStep());
  $('nextBtn').addEventListener('click', () => activeEngine && activeEngine.nextStep());
  $('resetBtn').addEventListener('click', () => activeEngine && activeEngine.reset());
  $('speedSlider').addEventListener('input', (e) => {
    const s = parseFloat(e.target.value);
    if (activeEngine) activeEngine.setSpeed(s);
    $('speedLabel').textContent = s.toFixed(2) + 'x';
  });

  $('addRow').addEventListener('click', () => addRow());
  $('analyzeBtn').addEventListener('click', analyze);
  $('generateBtn').addEventListener('click', generate);
  $('copyBtn').addEventListener('click', () => navigator.clipboard.writeText($('reportContent').innerText).then(() => alert('报告已复制')));

  $('viewToggle').addEventListener('click', () => {
    viewMode = viewMode === '3d' ? '2d' : '3d';
    updateViewToggle();
    switchPhase(currentPhase);
  });
}

function loadExperiment(type) {
  currentType = type;
  const mod = getModule();
  $('expInfo').textContent = mod.info || '';
  document.querySelectorAll('.phase-tab').forEach((t) => t.classList.remove('active'));
  document.querySelector('.phase-tab[data-phase="principle"]').classList.add('active');
  switchPhase('principle');
  if (EXPERIMENTS[type]) setupCalcExperiment(type);
}

function updateViewToggle() {
  const btn = $('viewToggle');
  if (!btn) return;
  const has3d = ANIM_MODULES_3D[currentType] && ANIM_MODULES_3D[currentType][currentPhase] != null;
  if (!has3d) {
    btn.disabled = true;
    btn.textContent = '📺 2D';
    btn.classList.remove('primary');
  } else {
    btn.disabled = false;
    btn.textContent = viewMode === '3d' ? '🎬 3D' : '📺 2D';
    btn.classList.toggle('primary', viewMode === '3d');
  }
}

function switchPhase(phase) {
  currentPhase = phase;
  updateViewToggle();
  const use3d = viewMode === '3d' && has3D(phase);

  if (use3d) {
    if (!engine3d) {
      try {
        engine3d = new Engine3DClass($('anim3dContainer'));
        engine3d.onUpdate = updateUI;
      } catch (e) {
        console.error('3D引擎创建失败:', e);
        $('expInfo').textContent = '3D创建失败: ' + e.message + '，使用2D模式';
        use3d = false;
      }
    }
    if (use3d) {
      if (activeEngine === engine2d) engine2d.pause();
      $('animCanvas').style.display = 'none';
      $('anim3dContainer').style.display = 'block';
      activeEngine = engine3d;
      engine3d.load(ANIM_MODULES_3D[currentType]);
      engine3d.setPhase(phase);
    }
  }
  if (!use3d) {
    if (activeEngine === engine3d && engine3d) engine3d.pause();
    $('anim3dContainer').style.display = 'none';
    $('animCanvas').style.display = 'block';
    activeEngine = engine2d;
    engine2d.load(ANIM_MODULES_2D[currentType]);
    engine2d.setPhase(phase);
  }
  updateUI();
}

function updateUI() {
  const engine = activeEngine;
  if (!engine || !engine.module) return;
  const phase = engine.phase;
  const phaseData = engine.module[phase];
  if (!phaseData) return;
  const stepIdx = engine.stepIdx;
  const step = phaseData.steps[stepIdx];
  if (!step) return;

  $('stepTitle').textContent = step.title;
  $('explainTitle').textContent = `${stepIdx + 1}. ${step.title}`;
  $('explainContent').innerHTML = `<p>${step.desc}</p>${getFormulaHTML(currentType, phase, stepIdx)}`;

  const stepList = $('stepList');
  stepList.innerHTML = phaseData.steps.map((s, i) => {
    const cls = i === stepIdx ? 'active' : (i < stepIdx ? 'done' : '');
    return `<div class="step-item ${cls}" data-idx="${i}"><span class="step-num">${i + 1}</span><span>${s.title}</span></div>`;
  }).join('');
  stepList.querySelectorAll('.step-item').forEach((el) => {
    el.addEventListener('click', () => engine.setStep(parseInt(el.dataset.idx)));
  });

  $('playBtn').textContent = engine.playing ? '⏸ 暂停' : '▶ 播放';
  $('progressFill').style.width = engine.getProgress() + '%';
  $('prevBtn').disabled = stepIdx === 0 && engine.time === 0;
  $('nextBtn').disabled = stepIdx >= phaseData.steps.length - 1;

  if (phase === 'data' && EXPERIMENTS[currentType]) {
    $('calcSection').hidden = false;
  } else {
    $('calcSection').hidden = true;
  }
}

function getFormulaHTML(type, phase, stepIdx) {
  const formulas = {
    pendulum: {
      principle: ['', '', '<span class="formula">F = -mg sinθ ≈ -mgθ</span><span class="tip">小角度近似：sinθ ≈ θ (θ &lt; 5°)</span>', '<span class="formula">T = 2π√(L/g)</span><span class="tip">周期仅与L和g有关，与振幅、质量无关</span>', '<span class="formula">g = 4π²L / T²</span>'],
      procedure: ['', '', '<span class="formula">L = l + d/2</span><span class="tip">摆长 = 线长 + 球半径</span>', '<span class="tip">拉开角度 &lt; 5°，无初速释放</span>', '<span class="formula">T = t / n</span><span class="tip">n取50次以减小计时误差</span>'],
      data: ['', '<span class="formula">T² = (4π²/g)·L</span><span class="tip">作T²-L图，斜率k = 4π²/g</span>', '<span class="formula">u(g)/g = √((u_L/L)² + (2u_T/T)²)</span>'],
    },
    newtonRing: {
      principle: ['', '', '<span class="formula">δ = 2d + λ/2</span>', '<span class="formula">r² = kRλ → D² = 4kRλ</span>', '<span class="formula">R = (D_m² - D_n²) / [4λ(m-n)]</span>'],
      procedure: ['', '', '', '', '<span class="tip">从中心向外数环，避免回程误差</span>'],
      data: ['', '<span class="formula">R = (D_m² - D_n²) / [4λ(m-n)]</span>', ''],
    },
    voltAmpere: {
      principle: ['<span class="formula">R = U / I</span>', '', '<span class="tip">内接法：R测 = R + R_A &gt; R（适合大电阻）</span>', '<span class="tip">外接法：R测 = RR_V/(R+R_V) &lt; R（适合小电阻）</span>', '<span class="formula">U = k·I, k = R</span>'],
      procedure: ['', '', '', '', ''],
      data: ['', '<span class="formula">R = 斜率k</span>', ''],
    },
    youngModulus: {
      principle: ['<span class="formula">E = FL / (S·ΔL)</span>', '<span class="formula">α = ΔL / b</span>', '<span class="formula">n = 2D·ΔL / b</span><span class="tip">放大倍数 = 2D/b ≈ 40-60倍</span>', '<span class="formula">E = 8mgLD / (πd²b·n)</span>'],
      procedure: ['', '', '', '', '<span class="tip">加码减码取平均，消除弹性滞后</span>'],
      data: ['<span class="tip">逐差法：Δn = n_{i+3} - n_i</span>', '<span class="formula">E = 8mgLD / (πd²b·Δn)</span>', ''],
    },
    hallEffect: {
      principle: ['', '<span class="formula">F = qvB</span>', '<span class="formula">qE_H = qvB → E_H = vB</span>', '<span class="formula">U_H = R_H·IB/d = IB/(nqd)</span>'],
      procedure: ['', '', '', '', '<span class="tip">改变I和B方向取四次平均，消除副效应</span>'],
      data: ['', '<span class="formula">k = R_H·B/d</span>', '<span class="formula">B = k·d / R_H</span>'],
    },
  };
  const f = formulas[type] && formulas[type][phase];
  return (f && f[stepIdx]) ? f[stepIdx] : '';
}

// ===== 计算功能 =====
const dataBody = $('dataBody'), dataHead = $('dataHead');
const paramInputs = $('paramInputs'), errorInputs = $('errorInputs');

function setupCalcExperiment(type) {
  const exp = EXPERIMENTS[type];
  if (!exp) return;
  dataHead.innerHTML = `<tr><th>组号</th>${exp.columns.map((c) => `<th>${c.label}</th>`).join('')}<th>操作</th></tr>`;
  errorInputs.innerHTML = exp.errors.map((e) => `<label>${e.label}: <input type="number" id="${e.field}" value="${e.value}" step="0.001"></label>`).join('');
  paramInputs.innerHTML = (exp.params || []).map((p) => `<label>${p.label}: <input type="number" id="param_${p.field}" value="${p.value}" step="0.001"></label>`).join('');
  dataBody.innerHTML = '';
  exp.sample.forEach((d) => addRow(d));
}

function addRow(data = {}) {
  const exp = EXPERIMENTS[currentType];
  if (!exp) return;
  const row = document.createElement('tr');
  const idx = dataBody.children.length + 1;
  const cells = exp.columns.map((c) => `<td><input type="number" class="${c.field}" value="${data[c.field] !== undefined ? data[c.field] : ''}" step="0.001"></td>`).join('');
  row.innerHTML = `<td>${idx}</td>${cells}<td><button class="btn-small del">删除</button></td>`;
  row.querySelector('.del').addEventListener('click', () => { row.remove(); refreshIdx(); });
  dataBody.appendChild(row);
}

function refreshIdx() { [...dataBody.children].forEach((r, i) => { r.children[0].textContent = i + 1; }); }

function getData() {
  const exp = EXPERIMENTS[currentType];
  return [...dataBody.children].map((row) => {
    const d = {};
    exp.columns.forEach((c) => { d[c.field] = parseFloat(row.querySelector('.' + c.field).value); });
    return d;
  }).filter((d) => exp.columns.every((c) => !isNaN(d[c.field]) && d[c.field] > 0));
}

function getErrors() { const exp = EXPERIMENTS[currentType], e = {}; exp.errors.forEach((er) => { e[er.field] = parseFloat($(er.field).value); }); return e; }
function getParams() { const exp = EXPERIMENTS[currentType], p = {}; (exp.params || []).forEach((pr) => { p[pr.field] = parseFloat($('param_' + pr.field).value); }); return p; }
function showError(msg) { $('errorText').textContent = msg; $('errorSection').hidden = false; }
function hideError() { $('errorSection').hidden = true; }

function renderResults(results) {
  const m = results.meta;
  $('resultSection').hidden = false;
  let html = '';
  if (results.direct) {
    html += `<h3>方法一: 直接计算法（${results.direct.formula}）</h3>
      <p>各组 ${m.quantity} 值: ${results.direct.values.join(', ')} ${m.unit}</p>
      <p>平均值 ${m.quantity} = <span class="highlight">${results.direct.mean}</span> ${m.unit}</p>
      <p>A类不确定度 u_A = ${results.direct.uA} ${m.unit}</p>
      <p>B类不确定度 u_B = ${results.direct.uB} ${m.unit}</p>
      <p>合成不确定度 u_c = ${results.direct.uC} ${m.unit}</p>
      <p>结果: ${m.quantity} = <span class="highlight">${results.direct.result}</span> ${m.unit}</p>`;
  }
  if (results.graph) {
    html += `<h3>方法二: 作图法（${m.graphYLabel}-${m.graphXLabel} 拟合）</h3>
      <p>拟合方程: ${results.graph.fitEquation}</p>
      <p>相关系数 R² = ${results.graph.r2}</p>
      <p>${m.quantity} = <span class="highlight">${results.graph.result}</span> ${m.unit}</p>`;
  }
  if (m.refValue) {
    html += `<h3>与参考值比较</h3><p>${m.refLabel} ${m.quantity}₀ = ${m.refValue} ${m.unit}</p><p>相对误差: <span class="highlight">${results.relativeError}%</span></p>`;
  }
  $('resultContent').innerHTML = html;
  $('chartArea').hidden = !m.hasGraph;
  if (m.hasGraph) $('chartTitle').textContent = `${m.graphYLabel}-${m.graphXLabel} 线性拟合图`;
}

function drawGraph(measurements, results) {
  const m = results.meta;
  if (!m.hasGraph) return;
  const canvas = $('fitChart'), ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const tf = m.graphYTransform === 'square' ? (v) => v * v : (v) => v;
  const points = measurements.map((d) => ({ x: d[m.graphXField], y: tf(d[m.graphYField]) }));
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  const xMin = Math.min(...xs) * 0.95, xMax = Math.max(...xs) * 1.05;
  const yMin = Math.min(...ys, results.graph.slope * xMin + results.graph.intercept) * 0.95;
  const yMax = Math.max(...ys, results.graph.slope * xMax + results.graph.intercept) * 1.05;
  const margin = 55, pW = W - margin * 2, pH = H - margin * 2;
  const toX = (x) => margin + (x - xMin) / (xMax - xMin) * pW;
  const toY = (y) => H - margin - (y - yMin) / (yMax - yMin) * pH;
  ctx.strokeStyle = '#8b9bb4'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(margin, margin); ctx.lineTo(margin, H - margin); ctx.lineTo(W - margin, H - margin); ctx.stroke();
  ctx.fillStyle = '#8b9bb4'; ctx.font = '12px sans-serif';
  for (let i = 0; i <= 5; i++) { const x = xMin + (xMax - xMin) / 5 * i, px = toX(x); ctx.textAlign = 'center'; ctx.fillText(x.toFixed(2), px, H - margin + 16); }
  for (let i = 0; i <= 5; i++) { const y = yMin + (yMax - yMin) / 5 * i, py = toY(y); ctx.textAlign = 'right'; ctx.fillText(y.toFixed(2), margin - 8, py + 4); }
  ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(toX(xMin), toY(results.graph.slope * xMin + results.graph.intercept)); ctx.lineTo(toX(xMax), toY(results.graph.slope * xMax + results.graph.intercept)); ctx.stroke();
  ctx.fillStyle = '#ff4466'; points.forEach((p) => { ctx.beginPath(); ctx.arc(toX(p.x), toY(p.y), 5, 0, Math.PI * 2); ctx.fill(); });
}

function renderMarkdown(md) {
  let html = md;
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>').replace(/^## (.+)$/gm, '<h2>$1</h2>').replace(/^# (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return html.split('\n\n').map((b) => b.startsWith('<h2>') || b.startsWith('<h3>') ? b : `<p>${b.replace(/\n/g, '<br>')}</p>`).join('\n');
}

async function analyze() {
  hideError();
  const measurements = getData();
  if (measurements.length < 2) { showError('至少需要 2 组有效数据'); return; }
  $('analyzeBtn').disabled = true; $('analyzeBtn').textContent = '计算中...';
  try {
    const resp = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ experimentType: currentType, measurements, instrumentErrors: getErrors(), params: getParams() }) });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error);
    renderResults(data.results); drawGraph(measurements, data.results);
  } catch (err) { showError(err.message); } finally { $('analyzeBtn').disabled = false; $('analyzeBtn').textContent = '计算结果'; }
}

async function generate() {
  hideError();
  const measurements = getData();
  if (measurements.length < 2) { showError('至少需要 2 组有效数据'); return; }
  $('generateBtn').disabled = true; $('generateBtn').textContent = '生成中...';
  $('reportSection').hidden = true;
  try {
    const resp = await fetch('/api/generate-stream', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ experimentType: currentType, measurements, instrumentErrors: getErrors(), params: getParams() }) });
    const reader = resp.body.getReader(), decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n'); buffer = events.pop();
      for (const ev of events) {
        if (!ev.startsWith('data: ')) continue;
        const data = JSON.parse(ev.slice(6));
        if (data.error) { showError(data.error); break; }
        if (data.done) { renderResults(data.results); drawGraph(measurements, data.results); $('reportSection').hidden = false; $('reportContent').innerHTML = renderMarkdown(data.report); }
      }
    }
  } catch (err) { showError(err.message); } finally { $('generateBtn').disabled = false; $('generateBtn').textContent = '生成报告'; }
}

// 启动：先加载实验配置，再初始化2D，最后异步加载3D
fetch('/api/experiments').then((r) => r.json()).then((configs) => {
  EXPERIMENTS = configs;
  init();
  // 异步加载3D模块（失败不影响2D正常使用）
  import('./js3d/engine3d.js').then((m) => {
    Engine3DClass = m.Engine3D;
    return Promise.all([
      import('./js3d/pendulum3d.js'),
      import('./js3d/newtonRing3d.js'),
      import('./js3d/voltAmpere3d.js'),
      import('./js3d/youngModulus3d.js'),
      import('./js3d/hallEffect3d.js'),
      import('./js3d/momentOfInertia3d.js'),
      import('./js3d/soundSpeed3d.js'),
      import('./js3d/photoelectric3d.js'),
      import('./js3d/michelson3d.js'),
      import('./js3d/heatEngine3d.js'),
      import('./js3d/thermalConductivity3d.js'),
      import('./js3d/wedgeInterference3d.js'),
      import('./js3d/oscilloscope3d.js'),
    ]);
  }).then((mods) => {
    ANIM_MODULES_3D.pendulum = mods[0].Pendulum3D;
    ANIM_MODULES_3D.newtonRing = mods[1].NewtonRing3D;
    ANIM_MODULES_3D.voltAmpere = mods[2].VoltAmpere3D;
    ANIM_MODULES_3D.youngModulus = mods[3].YoungModulus3D;
    ANIM_MODULES_3D.hallEffect = mods[4].HallEffect3D;
    ANIM_MODULES_3D.momentOfInertia = mods[5].MomentOfInertia3D;
    ANIM_MODULES_3D.soundSpeed = mods[6].SoundSpeed3D;
    ANIM_MODULES_3D.photoelectric = mods[7].Photoelectric3D;
    ANIM_MODULES_3D.michelson = mods[8].Michelson3D;
    ANIM_MODULES_3D.heatEngine = mods[9].HeatEngine3D;
    ANIM_MODULES_3D.thermalConductivity = mods[10].ThermalConductivity3D;
    ANIM_MODULES_3D.wedgeInterference = mods[11].WedgeInterference3D;
    ANIM_MODULES_3D.oscilloscope = mods[12].Oscilloscope3D;
    console.log('全部13个3D模块加载成功');
    if (currentPhase !== 'data') switchPhase(currentPhase);
  }).catch((err) => {
    console.error('3D加载失败，使用2D模式:', err);
    $('expInfo').textContent += '  [3D加载失败，使用2D模式: ' + err.message + ']';
  });
}).catch((err) => {
  document.body.innerHTML = '<div style="color:red;padding:40px;">服务器连接失败: ' + err.message + '</div>';
});