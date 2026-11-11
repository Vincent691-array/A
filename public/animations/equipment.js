// 可复用器材绘制库 - 所有函数接收 (ctx, x, y, options)
const Equip = {

  // 支架（铁架台）
  stand(ctx, x, y, h = 200, opts = {}) {
    const w = opts.width || 80;
    ctx.strokeStyle = opts.color || '#666';
    ctx.lineWidth = opts.thick || 4;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y);
    ctx.lineTo(x + w / 2, y);
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - h);
    ctx.stroke();
    ctx.fillStyle = '#444';
    ctx.fillRect(x - w / 2 - 6, y - 4, w + 12, 6);
  },

  // 夹子
  clamp(ctx, x, y, w = 30) {
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y);
    ctx.lineTo(x + w / 2, y);
    ctx.stroke();
    ctx.fillStyle = '#aaa';
    ctx.fillRect(x - 4, y - 6, 8, 12);
  },

  // 小球（带高光）
  ball(ctx, x, y, r, color = '#e74c3c') {
    const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.3, color);
    grad.addColorStop(1, '#8b0000');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  },

  // 绳子/细线
  string(ctx, x1, y1, x2, y2, color = '#ccc') {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  },

  // 光源（带光线）
  lightSource(ctx, x, y, label = '光源') {
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff9800';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (label) {
      ctx.fillStyle = '#ffeb3b';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y - 14);
    }
  },

  // 光线（带箭头）
  lightRay(ctx, x1, y1, x2, y2, color = '#ffeb3b', dashed = false) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    if (dashed) ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
    const ang = Math.atan2(y2 - y1, x2 - x1);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 8 * Math.cos(ang - 0.4), y2 - 8 * Math.sin(ang - 0.4));
    ctx.lineTo(x2 - 8 * Math.cos(ang + 0.4), y2 - 8 * Math.sin(ang + 0.4));
    ctx.fill();
  },

  // 透镜（凸透镜）
  lens(ctx, x, y, h = 60, convex = true) {
    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(79, 195, 247, 0.15)';
    const w = convex ? 12 : -12;
    ctx.beginPath();
    ctx.moveTo(x, y - h / 2);
    ctx.quadraticCurveTo(x + w, y, x, y + h / 2);
    ctx.quadraticCurveTo(x - w, y, x, y - h / 2);
    ctx.fill();
    ctx.stroke();
  },

  // 平玻璃片
  glassPlate(ctx, x, y, w, h = 6) {
    ctx.fillStyle = 'rgba(79, 195, 247, 0.2)';
    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 1;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
  },

  // 电压表/电流表（圆形表盘）
  meter(ctx, x, y, r, label, value, unit) {
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#00d4ff';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y - r * 0.4);
    if (value !== undefined) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(value.toFixed(2) + (unit || ''), x, y + r * 0.2);
    }
    const ang = value !== undefined ? lerp(-2.2, 2.2, clamp(value / 5, 0, 1)) : 0;
    ctx.strokeStyle = '#ff4466';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (r - 8) * Math.sin(ang), y - (r - 8) * Math.cos(ang));
    ctx.stroke();
  },

  // 电阻（锯齿形）
  resistor(ctx, x1, y, x2, label = 'R') {
    const n = 6, seg = (x2 - x1) / (n * 2);
    ctx.strokeStyle = '#e0e6ed';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    for (let i = 0; i < n; i++) {
      ctx.lineTo(x1 + seg * (i * 2 + 1), y - 8);
      ctx.lineTo(x1 + seg * (i * 2 + 2), y + 8);
    }
    ctx.lineTo(x2, y);
    ctx.stroke();
    if (label) {
      ctx.fillStyle = '#e0e6ed';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, (x1 + x2) / 2, y - 14);
    }
  },

  // 直流电源
  battery(ctx, x, y, label = 'E') {
    ctx.strokeStyle = '#e0e6ed';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 10);
    ctx.lineTo(x - 12, y + 10);
    ctx.moveTo(x + 12, y - 6);
    ctx.lineTo(x + 12, y + 6);
    ctx.stroke();
    ctx.fillStyle = '#e0e6ed';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y + 24);
    ctx.fillText('+', x + 12, y - 12);
    ctx.fillText('−', x - 12, y - 12);
  },

  // 导线（直角连接）
  wire(ctx, points, color = '#e0e6ed') {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.stroke();
  },

  // 开关
  switch_(ctx, x, y, closed = true) {
    ctx.strokeStyle = '#e0e6ed';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 15, y);
    ctx.lineTo(x - 5, y);
    ctx.stroke();
    if (closed) {
      ctx.lineTo(x + 5, y);
      ctx.lineTo(x + 15, y);
      ctx.stroke();
    } else {
      ctx.lineTo(x + 4, y - 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 5, y);
      ctx.lineTo(x + 15, y);
      ctx.stroke();
    }
  },

  // 标注文字（带引线）
  label(ctx, x, y, text, tx, ty, color = '#00d4ff') {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = color;
    ctx.font = '13px sans-serif';
    ctx.textAlign = tx < x ? 'right' : 'left';
    ctx.fillText(text, tx, ty);
  },

  // 角度弧线
  angleArc(ctx, cx, cy, r, startAng, endAng, label) {
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAng, endAng);
    ctx.stroke();
    if (label) {
      const midAng = (startAng + endAng) / 2;
      ctx.fillStyle = '#ffd700';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, cx + (r + 14) * Math.cos(midAng), cy + (r + 14) * Math.sin(midAng));
    }
  },

  // 坐标轴
  axes(ctx, x0, y0, w, h, xLabel, yLabel) {
    ctx.strokeStyle = '#8b9bb4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, y0 + h);
    ctx.lineTo(x0 + w, y0 + h);
    ctx.moveTo(x0, y0 + h);
    ctx.lineTo(x0, y0);
    ctx.stroke();
    ctx.fillStyle = '#8b9bb4';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    if (xLabel) ctx.fillText(xLabel, x0 + w - 20, y0 + h + 18);
    if (yLabel) { ctx.textAlign = 'left'; ctx.fillText(yLabel, x0 + 6, y0 + 12); }
  },

  // 闪光效果（脉冲）
  glow(ctx, x, y, r, color, alpha) {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  },
};