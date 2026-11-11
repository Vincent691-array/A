// 物理实验数据处理工具集 - 配置驱动通用框架
// 支持 15 种大学物理实验，加新实验只需在 EXPERIMENTS 里加配置

const PI = Math.PI;
const G = 9.7936;

export function sigFig(value, n) {
  if (value === 0 || !isFinite(value)) return value;
  const d = Math.ceil(Math.log10(Math.abs(value)));
  const power = n - d;
  const factor = Math.pow(10, power);
  return Math.round(value * factor) / factor;
}

export function formatResult(value, uncertainty) {
  if (uncertainty === 0 || !isFinite(uncertainty)) return `${sigFig(value, 4)}`;
  const uRounded = sigFig(uncertainty, 2);
  const uDecimals = uRounded === 0 ? 4 : Math.max(0, -Math.floor(Math.log10(Math.abs(uRounded))) + 1);
  return `(${value.toFixed(uDecimals)} ± ${uRounded.toFixed(uDecimals)})`;
}

export function linearFit(xs, ys) {
  const n = xs.length;
  const sX = xs.reduce((a, b) => a + b, 0), sY = ys.reduce((a, b) => a + b, 0);
  const sXY = xs.reduce((a, x, i) => a + x * ys[i], 0), sX2 = xs.reduce((a, x) => a + x * x, 0);
  const denom = n * sX2 - sX * sX;
  const slope = (n * sXY - sX * sY) / denom;
  const intercept = (sY - slope * sX) / n;
  const yM = sY / n;
  const ssTot = ys.reduce((a, y) => a + (y - yM) ** 2, 0);
  const ssRes = ys.reduce((a, y, i) => a + (y - (slope * xs[i] + intercept)) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  const sigma = Math.sqrt(ssRes / (n - 2));
  return { slope, intercept, r2, slopeStdErr: sigma * Math.sqrt(n / denom), sigma };
}

const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
const stdDev = (arr, m) => Math.sqrt(arr.reduce((a, v) => a + (v - m) ** 2, 0) / (arr.length - 1));

// 通用计算框架
function computeWithConfig(config, ms, errors, params) {
  let direct = null, directRaw = null;
  if (config.directCalc) {
    const vals = config.directCalc(ms, errors, params);
    const vMean = mean(vals);
    directRaw = vMean;
    const uA = vals.length > 1 ? stdDev(vals, vMean) / Math.sqrt(vals.length) : 0;
    const relUnc = config.relUncertainty ? config.relUncertainty(ms, errors, params) : 0;
    const uB = Math.abs(vMean * relUnc) / Math.sqrt(3);
    const uC = Math.sqrt(uA * uA + uB * uB);
    direct = {
      formula: config.directFormula,
      values: vals.map((v) => sigFig(v, 5)),
      mean: sigFig(vMean, 5), uA: sigFig(uA, 2), uB: sigFig(uB, 2), uC: sigFig(uC, 2),
      result: formatResult(vMean, uC),
    };
  }

  let graph = null, graphRaw = null;
  if (config.fitXField) {
    const tf = config.fitYTransform === 'square' ? (v) => v * v : (v) => v;
    const fit = linearFit(ms.map((m) => m[config.fitXField]), ms.map((m) => tf(m[config.fitYField])));
    const gVal = config.slopeToValue(fit.slope, params);
    graphRaw = gVal;
    const gUnc = Math.abs(gVal * fit.slopeStdErr / fit.slope);
    graph = {
      fitEquation: config.fitEquation(fit),
      slope: sigFig(fit.slope, 5), intercept: sigFig(fit.intercept, 4), r2: sigFig(fit.r2, 6),
      value: sigFig(gVal, 5), uncertainty: sigFig(gUnc, 2), result: formatResult(gVal, gUnc),
    };
  }

  const ref = config.refValue ? config.refValue(params) : null;
  const cmp = directRaw !== null ? directRaw : graphRaw;
  return {
    meta: {
      experimentName: config.name,
      quantity: config.quantity, quantityName: config.quantityName, unit: config.unit,
      refValue: ref, refLabel: config.refLabel || '',
      graphXLabel: config.fitXLabel || '', graphYLabel: config.fitYLabel || '',
      graphXField: config.fitXField || '', graphYField: config.fitYField || '',
      graphYTransform: config.fitYTransform || 'identity',
      hasGraph: !!graph, hasDirect: !!direct,
    },
    direct, graph,
    relativeError: ref && cmp !== null ? sigFig(Math.abs(cmp - ref) / Math.abs(ref) * 100, 2) : null,
  };
}

export const EXPERIMENTS = {
  pendulum: {
    name: '单摆法测定重力加速度',
    columns: [{ field: 'L', label: '摆长 L (m)' }, { field: 'T', label: '周期 T (s)' }],
    errors: [{ field: 'dL', label: 'ΔL (m)', value: 0.001 }, { field: 'dT', label: 'ΔT (s)', value: 0.001 }],
    sample: [{ L: 1.0, T: 2.006 }, { L: 0.9, T: 1.904 }, { L: 0.8, T: 1.795 }, { L: 0.7, T: 1.679 }, { L: 0.6, T: 1.555 }],
    quantity: 'g', quantityName: '重力加速度', unit: 'm/s²',
    refValue: () => G, refLabel: '长沙地区参考值',
    directFormula: 'g = 4π²L/T²',
    directCalc: (ms) => ms.map((m) => (4 * PI * PI * m.L) / m.T ** 2),
    relUncertainty: (ms, e) => Math.sqrt((e.dL / mean(ms.map((m) => m.L))) ** 2 + (2 * e.dT / mean(ms.map((m) => m.T))) ** 2),
    fitXField: 'L', fitYField: 'T', fitYTransform: 'square', fitXLabel: 'L (m)', fitYLabel: 'T² (s²)',
    slopeToValue: (s) => (4 * PI * PI) / s,
    fitEquation: (f) => `T² = ${sigFig(f.slope, 5)} × L + ${sigFig(f.intercept, 4)}`,
  },

  newtonRing: {
    name: '牛顿环测透镜曲率半径',
    columns: [{ field: 'k', label: '环级 k' }, { field: 'D', label: '直径 D (mm)' }],
    errors: [{ field: 'dD', label: 'ΔD (mm)', value: 0.001 }],
    sample: [{ k: 10, D: 1.538 }, { k: 15, D: 1.879 }, { k: 20, D: 2.17 }, { k: 25, D: 2.43 }, { k: 30, D: 2.662 }, { k: 35, D: 2.87 }],
    quantity: 'R', quantityName: '曲率半径', unit: 'mm',
    directFormula: 'R = (D_m²-D_n²)/(4(m-n)λ), λ=589.3nm',
    directCalc: (ms) => {
      const L = 589.3e-6, h = Math.floor(ms.length / 2), v = [];
      for (let i = 0; i < h; i++) v.push((ms[i + h].D ** 2 - ms[i].D ** 2) / (4 * (ms[i + h].k - ms[i].k) * L));
      return v;
    },
    relUncertainty: (ms, e) => (2 * e.dD) / mean(ms.map((m) => m.D)),
    fitXField: 'k', fitYField: 'D', fitYTransform: 'square', fitXLabel: 'k', fitYLabel: 'D² (mm²)',
    slopeToValue: (s) => s / (4 * 589.3e-6),
    fitEquation: (f) => `D² = ${sigFig(f.slope, 5)} × k + ${sigFig(f.intercept, 4)}`,
  },

  voltAmpere: {
    name: '伏安法测电阻',
    columns: [{ field: 'U', label: '电压 U (V)' }, { field: 'I', label: '电流 I (mA)' }],
    errors: [{ field: 'dU', label: 'ΔU (V)', value: 0.01 }, { field: 'dI', label: 'ΔI (mA)', value: 0.01 }],
    sample: [{ U: 1.0, I: 2.05 }, { U: 2.0, I: 4.08 }, { U: 3.0, I: 6.12 }, { U: 4.0, I: 8.22 }, { U: 5.0, I: 10.2 }],
    quantity: 'R', quantityName: '电阻', unit: 'Ω',
    directFormula: 'R = U/I',
    directCalc: (ms) => ms.map((m) => (1000 * m.U) / m.I),
    relUncertainty: (ms, e) => Math.sqrt((e.dU / mean(ms.map((m) => m.U))) ** 2 + (e.dI / mean(ms.map((m) => m.I))) ** 2),
    fitXField: 'I', fitYField: 'U', fitYTransform: 'identity', fitXLabel: 'I (mA)', fitYLabel: 'U (V)',
    slopeToValue: (s) => s * 1000,
    fitEquation: (f) => `U = ${sigFig(f.slope, 5)} × I + ${sigFig(f.intercept, 4)}`,
  },

  youngModulus: {
    name: '杨氏模量测定（光杠杆法）',
    columns: [{ field: 'F', label: '力 F (N)' }, { field: 'dL', label: '伸长 Δl (mm)' }],
    errors: [{ field: 'dF', label: 'ΔF (N)', value: 0.01 }, { field: 'ddL', label: 'Δ(Δl) (mm)', value: 0.01 }],
    params: [{ field: 'L0', label: '丝长 L₀ (mm)', value: 800 }, { field: 'd', label: '直径 d (mm)', value: 0.5 }],
    sample: [{ F: 2, dL: 0.041 }, { F: 4, dL: 0.082 }, { F: 6, dL: 0.122 }, { F: 8, dL: 0.163 }, { F: 10, dL: 0.204 }],
    quantity: 'E', quantityName: '杨氏模量', unit: 'MPa',
    directFormula: 'E = 4FL₀/(πd²Δl)',
    directCalc: (ms, e, p) => ms.map((m) => (4 * m.F * p.L0) / (PI * p.d ** 2 * m.dL)),
    relUncertainty: (ms, e, p) => Math.sqrt((e.dF / mean(ms.map((m) => m.F))) ** 2 + (e.ddL / mean(ms.map((m) => m.dL))) ** 2 + (2 * 0.001 / p.d) ** 2),
    fitXField: 'F', fitYField: 'dL', fitYTransform: 'identity', fitXLabel: 'F (N)', fitYLabel: 'Δl (mm)',
    slopeToValue: (s, p) => (4 * p.L0) / (PI * p.d ** 2 * s),
    fitEquation: (f) => `Δl = ${sigFig(f.slope, 5)} × F + ${sigFig(f.intercept, 4)}`,
  },

  hallEffect: {
    name: '霍尔效应测霍尔系数',
    columns: [{ field: 'I', label: '工作电流 I (mA)' }, { field: 'UH', label: '霍尔电压 UH (mV)' }],
    errors: [{ field: 'dI', label: 'ΔI (mA)', value: 0.01 }, { field: 'dUH', label: 'ΔUH (mV)', value: 0.01 }],
    params: [{ field: 'B', label: '磁场 B (T)', value: 0.5 }, { field: 'd', label: '片厚 d (mm)', value: 0.2 }],
    sample: [{ I: 1, UH: 0.25 }, { I: 2, UH: 0.5 }, { I: 3, UH: 0.75 }, { I: 4, UH: 1.0 }, { I: 5, UH: 1.25 }],
    quantity: 'RH', quantityName: '霍尔系数', unit: 'm³/C',
    directFormula: 'RH = UH·d/(I·B)',
    directCalc: (ms, e, p) => ms.map((m) => (m.UH * 1e-3 * p.d * 1e-3) / (m.I * 1e-3 * p.B)),
    relUncertainty: (ms, e) => Math.sqrt((e.dI / mean(ms.map((m) => m.I))) ** 2 + (e.dUH / mean(ms.map((m) => m.UH))) ** 2),
    fitXField: 'I', fitYField: 'UH', fitYTransform: 'identity', fitXLabel: 'I (mA)', fitYLabel: 'UH (mV)',
    slopeToValue: (s, p) => (s * 1e-3 * p.d * 1e-3) / p.B,
    fitEquation: (f) => `UH = ${sigFig(f.slope, 5)} × I + ${sigFig(f.intercept, 4)}`,
  },

  soundSpeed: {
    name: '声速测定（驻波法）',
    columns: [{ field: 'f', label: '频率 f (Hz)' }, { field: 'lambda', label: '波长 λ (mm)' }],
    errors: [{ field: 'df', label: 'Δf (Hz)', value: 1 }, { field: 'dlambda', label: 'Δλ (mm)', value: 0.1 }],
    sample: [{ f: 1000, lambda: 340 }, { f: 2000, lambda: 170 }, { f: 3000, lambda: 113.3 }, { f: 4000, lambda: 85 }, { f: 5000, lambda: 68 }],
    quantity: 'v', quantityName: '声速', unit: 'm/s',
    refValue: () => 340, refLabel: '常温参考值',
    directFormula: 'v = f·λ',
    directCalc: (ms) => ms.map((m) => m.f * m.lambda * 1e-3),
    relUncertainty: (ms, e) => Math.sqrt((e.df / mean(ms.map((m) => m.f))) ** 2 + (e.dlambda / mean(ms.map((m) => m.lambda))) ** 2),
    fitXField: 'f', fitYField: 'lambda', fitYTransform: 'identity', fitXLabel: 'f (Hz)', fitYLabel: 'λ (mm)',
    slopeToValue: (s) => s * 1e-3,
    fitEquation: (f) => `λ = ${sigFig(f.slope, 5)} × f + ${sigFig(f.intercept, 4)}`,
  },

  linearExpansion: {
    name: '金属线膨胀系数测定',
    columns: [{ field: 'T', label: '温度 T (°C)' }, { field: 'dL', label: '伸长 ΔL (mm)' }],
    errors: [{ field: 'dT', label: 'ΔT (°C)', value: 0.5 }, { field: 'ddL', label: 'Δ(ΔL) (mm)', value: 0.01 }],
    params: [{ field: 'L0', label: '原长 L₀ (mm)', value: 500 }],
    sample: [{ T: 20, dL: 0 }, { T: 30, dL: 0.085 }, { T: 40, dL: 0.17 }, { T: 50, dL: 0.255 }, { T: 60, dL: 0.34 }],
    quantity: 'α', quantityName: '线膨胀系数', unit: '/°C',
    directFormula: 'α = ΔL/(L₀·ΔT)',
    directCalc: (ms, e, p) => ms.slice(1).map((m) => m.dL / (p.L0 * (m.T - ms[0].T))),
    relUncertainty: (ms, e) => Math.sqrt((e.ddL / mean(ms.map((m) => m.dL || 1))) ** 2 + (e.dT / mean(ms.map((m) => m.T))) ** 2),
    fitXField: 'T', fitYField: 'dL', fitYTransform: 'identity', fitXLabel: 'T (°C)', fitYLabel: 'ΔL (mm)',
    slopeToValue: (s, p) => s / p.L0,
    fitEquation: (f) => `ΔL = ${sigFig(f.slope, 5)} × T + ${sigFig(f.intercept, 4)}`,
  },

  springConstant: {
    name: '弹簧劲度系数测定',
    columns: [{ field: 'F', label: '力 F (N)' }, { field: 'x', label: '伸长 Δx (mm)' }],
    errors: [{ field: 'dF', label: 'ΔF (N)', value: 0.01 }, { field: 'dx', label: 'Δx (mm)', value: 0.1 }],
    sample: [{ F: 0.5, x: 5.2 }, { F: 1.0, x: 10.4 }, { F: 1.5, x: 15.5 }, { F: 2.0, x: 20.8 }, { F: 2.5, x: 25.9 }],
    quantity: 'k', quantityName: '劲度系数', unit: 'N/m',
    directFormula: 'k = F/Δx',
    directCalc: (ms) => ms.map((m) => m.F / (m.x * 1e-3)),
    relUncertainty: (ms, e) => Math.sqrt((e.dF / mean(ms.map((m) => m.F))) ** 2 + (e.dx / mean(ms.map((m) => m.x))) ** 2),
    fitXField: 'F', fitYField: 'x', fitYTransform: 'identity', fitXLabel: 'F (N)', fitYLabel: 'Δx (mm)',
    slopeToValue: (s) => 1 / (s * 1e-3),
    fitEquation: (f) => `Δx = ${sigFig(f.slope, 5)} × F + ${sigFig(f.intercept, 4)}`,
  },

  wheatstone: {
    name: '惠斯通电桥测电阻',
    columns: [{ field: 'R1', label: 'R₁ (Ω)' }, { field: 'R2', label: 'R₂ (Ω)' }, { field: 'R3', label: 'R₃ (Ω)' }],
    errors: [{ field: 'dR', label: 'ΔR (Ω)', value: 0.1 }],
    sample: [{ R1: 100, R2: 200, R3: 150 }, { R1: 100, R2: 200, R3: 151 }, { R1: 100, R2: 200, R3: 149 }, { R1: 100, R2: 200, R3: 150.5 }, { R1: 100, R2: 200, R3: 149.5 }],
    quantity: 'Rx', quantityName: '待测电阻', unit: 'Ω',
    directFormula: 'Rx = R₁·R₃/R₂',
    directCalc: (ms) => ms.map((m) => (m.R1 * m.R3) / m.R2),
    relUncertainty: () => 0.001,
  },

  photoelectric: {
    name: '光电效应测普朗克常数',
    columns: [{ field: 'nu', label: '频率 ν (THz)' }, { field: 'U0', label: '截止电压 U₀ (V)' }],
    errors: [{ field: 'dnu', label: 'Δν (THz)', value: 0.1 }, { field: 'dU0', label: 'ΔU₀ (V)', value: 0.01 }],
    sample: [{ nu: 520, U0: -0.13 }, { nu: 550, U0: 0.0 }, { nu: 580, U0: 0.12 }, { nu: 610, U0: 0.25 }, { nu: 640, U0: 0.37 }],
    quantity: 'h', quantityName: '普朗克常数', unit: 'J·s',
    refValue: () => 6.626e-34, refLabel: '公认值',
    directFormula: 'h = e·|ΔU₀|/Δν',
    directCalc: (ms) => { const e = 1.6e-19, v = []; for (let i = 1; i < ms.length; i++) v.push(Math.abs(e * (ms[i].U0 - ms[0].U0) / ((ms[i].nu - ms[0].nu) * 1e12))); return v; },
    relUncertainty: (ms, e) => Math.sqrt((e.dU0 / mean(ms.map((m) => Math.abs(m.U0) || 1))) ** 2 + (e.dnu / mean(ms.map((m) => m.nu))) ** 2),
    fitXField: 'nu', fitYField: 'U0', fitYTransform: 'identity', fitXLabel: 'ν (THz)', fitYLabel: 'U₀ (V)',
    slopeToValue: (s) => Math.abs(s) * 1.6e-19 / 1e12,
    fitEquation: (f) => `U₀ = ${sigFig(f.slope, 5)} × ν + ${sigFig(f.intercept, 4)}`,
  },

  michelson: {
    name: '迈克尔逊干涉测波长',
    columns: [{ field: 'N', label: '条纹数 N' }, { field: 'd', label: '移动距离 d (mm)' }],
    errors: [{ field: 'dd', label: 'Δd (mm)', value: 0.001 }],
    sample: [{ N: 50, d: 0.0147 }, { N: 100, d: 0.0295 }, { N: 150, d: 0.0442 }, { N: 200, d: 0.0589 }, { N: 250, d: 0.0737 }],
    quantity: 'λ', quantityName: '光波长', unit: 'nm',
    refValue: () => 632.8, refLabel: 'He-Ne激光',
    directFormula: 'λ = 2d/N',
    directCalc: (ms) => ms.map((m) => (2 * m.d * 1e6) / m.N),
    relUncertainty: (ms, e) => e.dd / mean(ms.map((m) => m.d)),
  },

  density: {
    name: '密度测定',
    columns: [{ field: 'm', label: '质量 m (g)' }, { field: 'V', label: '体积 V (mL)' }],
    errors: [{ field: 'dm', label: 'Δm (g)', value: 0.01 }, { field: 'dV', label: 'ΔV (mL)', value: 0.1 }],
    sample: [{ m: 10, V: 3.65 }, { m: 15, V: 5.48 }, { m: 20, V: 7.3 }, { m: 25, V: 9.12 }, { m: 30, V: 10.95 }],
    quantity: 'ρ', quantityName: '密度', unit: 'g/mL',
    directFormula: 'ρ = m/V',
    directCalc: (ms) => ms.map((m) => m.m / m.V),
    relUncertainty: (ms, e) => Math.sqrt((e.dm / mean(ms.map((m) => m.m))) ** 2 + (e.dV / mean(ms.map((m) => m.V))) ** 2),
    fitXField: 'V', fitYField: 'm', fitYTransform: 'identity', fitXLabel: 'V (mL)', fitYLabel: 'm (g)',
    slopeToValue: (s) => s,
    fitEquation: (f) => `m = ${sigFig(f.slope, 5)} × V + ${sigFig(f.intercept, 4)}`,
  },

  momentOfInertia: {
    name: '三线摆测转动惯量',
    columns: [{ field: 'm', label: '质量 m (kg)' }, { field: 'T', label: '周期 T (s)' }],
    errors: [{ field: 'dm', label: 'Δm (kg)', value: 0.001 }, { field: 'dT', label: 'ΔT (s)', value: 0.01 }],
    params: [{ field: 'R', label: '下盘半径 R (mm)', value: 100 }, { field: 'r', label: '上盘半径 r (mm)', value: 50 }, { field: 'H', label: '盘间距 H (mm)', value: 500 }],
    sample: [{ m: 0.5, T: 1.42 }, { m: 1.0, T: 2.01 }, { m: 1.5, T: 2.46 }, { m: 2.0, T: 2.84 }, { m: 2.5, T: 3.18 }],
    quantity: 'I', quantityName: '转动惯量', unit: 'kg·m²',
    directFormula: 'I = mgRrT²/(4π²H)',
    directCalc: (ms, e, p) => ms.map((m) => (m.m * G * p.R * 1e-3 * p.r * 1e-3 * m.T ** 2) / (4 * PI * PI * p.H * 1e-3)),
    relUncertainty: (ms, e) => Math.sqrt((e.dm / mean(ms.map((m) => m.m))) ** 2 + (2 * e.dT / mean(ms.map((m) => m.T))) ** 2),
  },

  doublePrism: {
    name: '双棱镜干涉测波长',
    columns: [{ field: 'd', label: '虚光源距 d (mm)' }, { field: 'dx', label: '条纹间距 Δx (mm)' }],
    errors: [{ field: 'dd', label: 'Δd (mm)', value: 0.01 }, { field: 'ddx', label: 'Δ(Δx) (mm)', value: 0.01 }],
    params: [{ field: 'D', label: '光源到屏 D (mm)', value: 500 }],
    sample: [{ d: 0.3, dx: 0.98 }, { d: 0.3, dx: 0.97 }, { d: 0.3, dx: 0.99 }, { d: 0.3, dx: 0.98 }, { d: 0.3, dx: 0.98 }],
    quantity: 'λ', quantityName: '光波长', unit: 'nm',
    refValue: () => 589.3, refLabel: '钠灯',
    directFormula: 'λ = d·Δx/D',
    directCalc: (ms, e, p) => ms.map((m) => (m.d * m.dx * 1e6) / p.D),
    relUncertainty: (ms, e) => Math.sqrt((e.dd / mean(ms.map((m) => m.d))) ** 2 + (e.ddx / mean(ms.map((m) => m.dx))) ** 2),
  },

  refractiveIndex: {
    name: '分光计测三棱镜折射率',
    columns: [{ field: 'A', label: '棱镜顶角 A (°)' }, { field: 'delta', label: '最小偏向角 δ (°)' }],
    errors: [{ field: 'dA', label: 'ΔA (°)', value: 0.1 }, { field: 'ddelta', label: 'Δδ (°)', value: 0.1 }],
    sample: [{ A: 60, delta: 38.5 }, { A: 60, delta: 38.6 }, { A: 60, delta: 38.4 }, { A: 60, delta: 38.55 }, { A: 60, delta: 38.45 }],
    quantity: 'n', quantityName: '折射率', unit: '',
    refValue: () => 1.5, refLabel: '玻璃典型值',
    directFormula: 'n = sin((A+δ)/2) / sin(A/2)',
    directCalc: (ms) => ms.map((m) => Math.sin(((m.A + m.delta) / 2) * PI / 180) / Math.sin((m.A / 2) * PI / 180)),
    relUncertainty: () => 0.001,
  },

  heatEngine: {
    name: '空气热机效率测定',
    columns: [{ field: 'Th', label: '高温 T₁ (K)' }, { field: 'eta', label: '实际效率 η' }],
    errors: [{ field: 'dTh', label: 'ΔT₁ (K)', value: 1 }, { field: 'deta', label: 'Δη', value: 0.01 }],
    params: [{ field: 'Tc', label: '低温 T₂ (K)', value: 300 }],
    sample: [{ Th: 400, eta: 0.18 }, { Th: 450, eta: 0.25 }, { Th: 500, eta: 0.32 }, { Th: 550, eta: 0.38 }, { Th: 600, eta: 0.43 }],
    quantity: 'ηc', quantityName: '卡诺效率', unit: '',
    directFormula: 'ηc = 1 - T₂/T₁',
    directCalc: (ms, e, p) => ms.map((m) => 1 - p.Tc / m.Th),
    relUncertainty: (ms, e, p) => e.dTh / mean(ms.map((m) => m.Th)),
    fitXField: 'Th', fitYField: 'eta', fitYTransform: 'identity', fitXLabel: 'T₁ (K)', fitYLabel: 'η',
    slopeToValue: (s) => s,
    fitEquation: (f) => `η = ${sigFig(f.slope, 5)} × T₁ + ${sigFig(f.intercept, 4)}`,
  },

  thermalConductivity: {
    name: '不良导体热导率测定（稳态平板法）',
    columns: [{ field: 'T1', label: '稳态高温 T₁ (°C)' }, { field: 'T2', label: '稳态低温 T₂ (°C)' }],
    errors: [{ field: 'dT', label: 'ΔT (°C)', value: 0.1 }],
    params: [{ field: 'm', label: '铜盘质量 m (g)', value: 200 }, { field: 'h', label: '样品厚度 h (mm)', value: 5 }, { field: 'R', label: '铜盘半径 R (mm)', value: 60 }, { field: 'coolRate', label: '冷却速率 (°C/s)', value: 0.03 }],
    sample: [{ T1: 80, T2: 30 }, { T1: 85, T2: 32 }, { T1: 90, T2: 35 }, { T1: 95, T2: 38 }, { T1: 100, T2: 40 }],
    quantity: 'λ', quantityName: '热导率', unit: 'W/(m·K)',
    directFormula: 'λ = m·c·(dT/dt)·h / (π·R²·(T₁-T₂))',
    directCalc: (ms, e, p) => ms.map((m) => (p.m * 1e-3 * 385 * p.coolRate * p.h * 1e-3) / (PI * (p.R * 1e-3) ** 2 * (m.T1 - m.T2))),
    relUncertainty: (ms, e) => Math.sqrt(2) * e.dT / mean(ms.map((m) => m.T1 - m.T2)),
  },

  wedgeInterference: {
    name: '等厚干涉测细丝直径（劈尖法）',
    columns: [{ field: 'L', label: '劈尖长度 L (mm)' }, { field: 'dx', label: '条纹间距 Δx (mm)' }],
    errors: [{ field: 'dL', label: 'ΔL (mm)', value: 0.5 }, { field: 'ddx', label: 'Δ(Δx) (mm)', value: 0.01 }],
    params: [{ field: 'lambda', label: '波长 λ (nm)', value: 589.3 }],
    sample: [{ L: 50, dx: 0.52 }, { L: 50, dx: 0.51 }, { L: 50, dx: 0.53 }, { L: 50, dx: 0.52 }, { L: 50, dx: 0.52 }],
    quantity: 'D', quantityName: '细丝直径', unit: 'μm',
    directFormula: 'D = L·λ/(2·Δx)',
    directCalc: (ms, e, p) => ms.map((m) => (m.L * p.lambda * 1e-6) / (2 * m.dx)),
    relUncertainty: (ms, e) => Math.sqrt((e.dL / mean(ms.map((m) => m.L))) ** 2 + (e.ddx / mean(ms.map((m) => m.dx))) ** 2),
  },

  oscilloscope: {
    name: '示波器原理与应用（李萨如图形测频率）',
    columns: [{ field: 'fy', label: 'Y轴频率 f_y (Hz)' }, { field: 'nx', label: 'X切点数 n_x' }, { field: 'ny', label: 'Y切点数 n_y' }],
    errors: [{ field: 'dfy', label: 'Δf_y (Hz)', value: 1 }],
    sample: [{ fy: 100, nx: 1, ny: 1 }, { fy: 100, nx: 1, ny: 2 }, { fy: 100, nx: 2, ny: 1 }, { fy: 100, nx: 2, ny: 3 }, { fy: 100, nx: 3, ny: 2 }],
    quantity: 'fx', quantityName: 'X轴频率', unit: 'Hz',
    directFormula: 'f_x = f_y · n_y / n_x',
    directCalc: (ms) => ms.map((m) => (m.fy * m.ny) / m.nx),
    relUncertainty: (ms, e) => e.dfy / mean(ms.map((m) => m.fy)),
  },
};

export function computeExperiment(type, measurements, instrumentErrors, params) {
  const config = EXPERIMENTS[type];
  if (!config) throw new Error('不支持的实验类型: ' + type);
  return computeWithConfig(config, measurements, instrumentErrors, params || {});
}

// 返回 UI 配置（不含函数，可序列化）
export function getUIConfigs() {
  const ui = {};
  for (const [key, c] of Object.entries(EXPERIMENTS)) {
    ui[key] = { name: c.name, columns: c.columns, errors: c.errors, params: c.params || [], sample: c.sample };
  }
  return ui;
}