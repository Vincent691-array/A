// 通用动画引擎 - 时间轴/帧循环/播放控制
class AnimationEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.module = null;
    this.phase = 'principle';
    this.stepIdx = 0;
    this.time = 0;
    this.playing = false;
    this.speed = 1;
    this.lastTs = 0;
    this.rafId = null;
    this.onUpdate = null;
  }

  load(module) {
    this.module = module;
    this.phase = 'principle';
    this.stepIdx = 0;
    this.time = 0;
    this.playing = false;
    this.render();
    this._notify();
  }

  setPhase(phase) {
    this.phase = phase;
    this.stepIdx = 0;
    this.time = 0;
    this.playing = false;
    this.render();
    this._notify();
  }

  setStep(idx) {
    const steps = this._phaseData().steps;
    if (idx < 0 || idx >= steps.length) return;
    this.stepIdx = idx;
    this.time = 0;
    this.render();
    this._notify();
  }

  nextStep() {
    const steps = this._phaseData().steps;
    if (this.stepIdx < steps.length - 1) this.setStep(this.stepIdx + 1);
  }

  prevStep() { if (this.stepIdx > 0) this.setStep(this.stepIdx - 1); }

  play() {
    if (!this.module) return;
    const steps = this._phaseData().steps;
    if (this.stepIdx >= steps.length - 1 && this.time >= 1) { this.stepIdx = 0; this.time = 0; }
    this.playing = true;
    this.lastTs = performance.now();
    this._loop();
    this._notify();
  }

  pause() { this.playing = false; if (this.rafId) cancelAnimationFrame(this.rafId); this._notify(); }

  toggle() { this.playing ? this.pause() : this.play(); }

  reset() { this.time = 0; this.playing = false; if (this.rafId) cancelAnimationFrame(this.rafId); this.render(); this._notify(); }

  setSpeed(s) { this.speed = s; }

  _phaseData() { return this.module[this.phase]; }

  _loop() {
    if (!this.playing) return;
    const now = performance.now();
    const dt = (now - this.lastTs) / 1000 * this.speed;
    this.lastTs = now;
    const step = this._phaseData().steps[this.stepIdx];
    this.time += dt / step.duration;
    if (this.time >= 1) {
      this.time = 1;
      if (this.stepIdx < this._phaseData().steps.length - 1) {
        this.stepIdx++;
        this.time = 0;
      } else {
        this.playing = false;
        this._notify();
        return;
      }
    }
    this.render();
    this._notify();
    if (this.playing) this.rafId = requestAnimationFrame(() => this._loop());
  }

  render() {
    if (!this.module) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const phaseData = this._phaseData();
    phaseData.render(ctx, this.time, this.stepIdx, this.canvas);
  }

  _notify() { if (this.onUpdate) this.onUpdate(); }

  getProgress() {
    const steps = this._phaseData().steps;
    const base = this.stepIdx / steps.length;
    const cur = this.time / steps.length;
    return (base + cur) * 100;
  }
}

// 缓动函数
const Ease = {
  linear: (t) => t,
  inOut: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  out: (t) => 1 - Math.pow(1 - t, 3),
  in: (t) => t * t * t,
  bounce: (t) => {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  elastic: (t) => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1,
};

// 工具函数
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));