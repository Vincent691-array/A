// 单摆测重力加速度 g - 动画模块
const PendulumAnim = {
  info: '用单摆的周期公式 T=2π√(L/g)，通过测量摆长L和周期T计算重力加速度g',

  principle: {
    steps: [
      { title: '单摆模型', desc: '理想单摆：质点悬挂在不可伸长轻线下端，在重力作用下往复摆动', duration: 3 },
      { title: '拉开小角度', desc: '将小球拉离平衡位置一个小角度θ（<5°），重力沿切线方向的分量提供回复力', duration: 3 },
      { title: '回复力分析', desc: '回复力 F = -mg sinθ，方向指向平衡位置。小角度下 sinθ ≈ θ，运动近似为简谐振动', duration: 4 },
      { title: '简谐运动周期', desc: '简谐振动周期 T = 2π√(L/g)，仅与摆长L和g有关，与振幅、质量无关（等时性原理）', duration: 4 },
      { title: '推导g公式', desc: '由 T = 2π√(L/g) 解出 g = 4π²L/T²。测量L和T即可求得重力加速度g', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      const pivotX = W / 2, pivotY = 80;
      const L = 280;
      const ballR = 22;

      // 摆角计算
      let theta = 0, showFormula = false, showForce = false, showG = false;
      const maxAngle = 0.16; // ~9°

      if (step === 0) {
        theta = 0;
        Equip.glow(ctx, pivotX, pivotY + L, 40, '#00d4ff', 0.3 * (1 - t));
      } else if (step === 1) {
        theta = maxAngle * Ease.inOut(t);
      } else if (step === 2) {
        theta = maxAngle;
        showForce = true;
        const swing = Math.sin(t * Math.PI * 4) * 0.02;
        theta = maxAngle + swing;
      } else if (step === 3) {
        const period = 2.0;
        theta = maxAngle * Math.cos(t * Math.PI * 2 * 3);
        showFormula = true;
      } else if (step === 4) {
        theta = maxAngle * Math.cos(t * Math.PI * 2 * 2);
        showG = true;
      }

      const bx = pivotX + L * Math.sin(theta);
      const by = pivotY + L * Math.cos(theta);

      // 支架
      Equip.stand(ctx, pivotX, H - 40, H - 40 - 60, { width: 100 });
      Equip.clamp(ctx, pivotX, pivotY, 36);

      // 平衡位置虚线
      if (step >= 1) {
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(pivotX, pivotY + L + 30);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 摆线
      Equip.string(ctx, pivotX, pivotY, bx, by, '#ccc');

      // 摆球
      Equip.ball(ctx, bx, by, ballR);

      // 角度标注
      if (step >= 1 && Math.abs(theta) > 0.01) {
        Equip.angleArc(ctx, pivotX, pivotY, 50, Math.PI / 2, Math.PI / 2 + theta, 'θ');
      }

      // 回复力箭头
      if (showForce) {
        const fx = -Math.sin(theta) * 60;
        const fy = -Math.cos(theta) * 60;
        ctx.strokeStyle = '#ff4466';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + fx, by + fy);
        ctx.stroke();
        const ang = Math.atan2(fy, fx);
        ctx.fillStyle = '#ff4466';
        ctx.beginPath();
        ctx.moveTo(bx + fx, by + fy);
        ctx.lineTo(bx + fx - 10 * Math.cos(ang - 0.4), by + fy - 10 * Math.sin(ang - 0.4));
        ctx.lineTo(bx + fx - 10 * Math.cos(ang + 0.4), by + fy - 10 * Math.sin(ang + 0.4));
        ctx.fill();
        Equip.label(ctx, bx + fx / 2, by + fy / 2, 'F = -mg sinθ', bx + fx + 20, by + fy - 10, '#ff4466');
      }

      // 重力箭头
      if (showForce) {
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx, by + 50);
        ctx.stroke();
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(bx, by + 50);
        ctx.lineTo(bx - 6, by + 42);
        ctx.lineTo(bx + 6, by + 42);
        ctx.fill();
        Equip.label(ctx, bx, by + 30, 'mg', bx + 25, by + 35, '#ffd700');
      }

      // 公式显示
      if (showFormula) {
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 20px "Cambria Math", serif';
        ctx.textAlign = 'center';
        ctx.fillText('T = 2π√(L/g)', W / 2, H - 20);
      }
      if (showG) {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 22px "Cambria Math", serif';
        ctx.textAlign = 'center';
        ctx.fillText('g = 4π²L / T²', W / 2, H - 20);
      }

      // 摆长标注
      if (step >= 3) {
        ctx.strokeStyle = '#7bc88a';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(pivotX - 40, pivotY);
        ctx.lineTo(pivotX - 40, pivotY + L);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#7bc88a';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('L', pivotX - 46, pivotY + L / 2);
      }
    }
  },

  procedure: {
    steps: [
      { title: '搭建装置', desc: '将铁架台放稳，在夹子上悬挂细线，线下端系上金属小球，组成单摆装置', duration: 4 },
      { title: '测量摆线长度', desc: '用米尺测量悬点到小球上端的摆线长度 l（精确到mm）', duration: 3 },
      { title: '测量球径计算L', desc: '用游标卡尺测小球直径 d，摆长 L = l + d/2（从悬点到球心）', duration: 3 },
      { title: '拉开小角度释放', desc: '将小球拉开角度 < 5°（振幅要小），无初速释放，等待摆动稳定', duration: 3 },
      { title: '计时50次全振动', desc: '小球过最低点时开始计时，数 n=50 次全振动，记录总时间 t，T = t/n', duration: 4 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      const pivotX = W / 2, pivotY = 90;
      const L = 260;
      const ballR = 20;

      // 步骤0：组装动画
      if (step === 0) {
        const p = Ease.out(t);
        Equip.stand(ctx, pivotX, H - 40, (H - 100) * p, { width: 100 });
        if (p > 0.3) {
          Equip.clamp(ctx, pivotX, pivotY, 36);
          const sp = clamp((p - 0.3) / 0.3, 0, 1);
          const bx = pivotX, by = pivotY + L * sp;
          Equip.string(ctx, pivotX, pivotY, bx, by, '#ccc');
          if (sp > 0.8) Equip.ball(ctx, bx, by, ballR);
        }
        ctx.fillStyle = '#8b9bb4';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('① 铁架台  ② 夹子  ③ 摆线  ④ 小球', W / 2, H - 15);
        return;
      }

      // 步骤1：测摆线长度
      if (step === 1) {
        const bx = pivotX, by = pivotY + L;
        Equip.stand(ctx, pivotX, H - 40, H - 100, { width: 100 });
        Equip.clamp(ctx, pivotX, pivotY, 36);
        Equip.string(ctx, pivotX, pivotY, bx, by, '#ccc');
        Equip.ball(ctx, bx, by, ballR);

        // 米尺
        const rulerX = pivotX - 50 - t * 20;
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(rulerX, pivotY - 10);
        ctx.lineTo(rulerX, pivotY + L + 10);
        ctx.stroke();
        for (let i = 0; i <= L + 20; i += 10) {
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(rulerX, pivotY - 10 + i);
          ctx.lineTo(rulerX - (i % 50 === 0 ? 10 : 5), pivotY - 10 + i);
          ctx.stroke();
        }
        ctx.fillStyle = '#ffd700';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('l', rulerX - 14, pivotY + L / 2);
        ctx.fillText('米尺', rulerX - 14, pivotY - 16);
        return;
      }

      // 步骤2：游标卡尺测球径
      if (step === 2) {
        const bx = pivotX, by = pivotY + L;
        Equip.stand(ctx, pivotX, H - 40, H - 100, { width: 100 });
        Equip.clamp(ctx, pivotX, pivotY, 36);
        Equip.string(ctx, pivotX, pivotY, bx, by, '#ccc');
        Equip.ball(ctx, bx, by, ballR);

        // 游标卡尺示意
        const open = ballR * 2 + 8;
        ctx.strokeStyle = '#7bc88a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bx - open / 2, by - 15);
        ctx.lineTo(bx - open / 2, by + 15);
        ctx.moveTo(bx + open / 2, by - 15);
        ctx.lineTo(bx + open / 2, by + 15);
        ctx.moveTo(bx - open / 2, by - 12);
        ctx.lineTo(bx + open / 2, by - 12);
        ctx.stroke();
        Equip.label(ctx, bx, by - 20, 'd', bx + 50, by - 30, '#7bc88a');
        ctx.fillStyle = '#7bc88a';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('游标卡尺', bx, by + 30);

        // L = l + d/2 公式
        ctx.fillStyle = '#ffd700';
        ctx.font = '16px "Cambria Math", serif';
        ctx.textAlign = 'center';
        ctx.fillText('L = l + d/2', W / 2, H - 20);
        return;
      }

      // 步骤3：拉开释放
      if (step === 3) {
        const maxAng = 0.08;
        let theta;
        if (t < 0.3) theta = maxAng * (t / 0.3);
        else theta = maxAng * Math.cos((t - 0.3) / 0.7 * Math.PI * 3);
        const bx = pivotX + L * Math.sin(theta);
        const by = pivotY + L * Math.cos(theta);
        Equip.stand(ctx, pivotX, H - 40, H - 100, { width: 100 });
        Equip.clamp(ctx, pivotX, pivotY, 36);
        Equip.string(ctx, pivotX, pivotY, bx, by, '#ccc');
        Equip.ball(ctx, bx, by, ballR);
        if (Math.abs(theta) > 0.01) Equip.angleArc(ctx, pivotX, pivotY, 45, Math.PI / 2, Math.PI / 2 + theta, 'θ<5°');
        ctx.fillStyle = '#ff4466';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('无初速释放', W / 2, H - 15);
        return;
      }

      // 步骤4：计时50次
      if (step === 4) {
        const theta = 0.06 * Math.cos(t * Math.PI * 2 * 6);
        const bx = pivotX + L * Math.sin(theta);
        const by = pivotY + L * Math.cos(theta);
        Equip.stand(ctx, pivotX, H - 40, H - 100, { width: 100 });
        Equip.clamp(ctx, pivotX, pivotY, 36);
        Equip.string(ctx, pivotX, pivotY, bx, by, '#ccc');
        Equip.ball(ctx, bx, by, ballR);

        // 计数器
        const count = Math.floor(t * 50);
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`n = ${count}/50`, W / 2, 40);

        // 秒表
        const elapsed = (t * 100).toFixed(1);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 18px monospace';
        ctx.fillText(`⏱ ${elapsed}s`, W / 2, H - 20);

        // 最低点标记
        ctx.strokeStyle = 'rgba(0, 255, 100, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(pivotX - 30, pivotY + L);
        ctx.lineTo(pivotX + 30, pivotY + L);
        ctx.stroke();
        ctx.setLineDash([]);
        return;
      }
    }
  },

  data: {
    steps: [
      { title: '实验数据表', desc: '改变摆长，测量对应的周期，记录数据如下表所示', duration: 3 },
      { title: '计算重力加速度', desc: '用 T² = 4π²L/g 作图，斜率 k = 4π²/g，故 g = 4π²/k', duration: 3 },
      { title: '不确定度分析', desc: 'g 的不确定度由 L 和 T 的不确定度合成：u(g) = g·√((u_L/L)² + (2u_T/T)²)', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;

      if (step === 0) {
        // 数据表格
        const data = [
          ['L (m)', 't (s)', 'T (s)', 'g (m/s²)'],
          ['0.800', '1.795', '1.795', '9.79'],
          ['0.900', '1.902', '1.902', '9.82'],
          ['1.000', '2.006', '2.006', '9.81'],
          ['1.100', '2.105', '2.105', '9.80'],
          ['1.200', '2.196', '2.196', '9.82'],
        ];
        const rows = Math.ceil(data.length * Ease.out(t));
        const x0 = 120, y0 = 60, cw = 140, rh = 38;
        for (let r = 0; r < Math.min(rows, data.length); r++) {
          for (let c = 0; c < 4; c++) {
            const x = x0 + c * cw, y = y0 + r * rh;
            ctx.fillStyle = r === 0 ? '#0a2a3d' : '#0d1117';
            ctx.fillRect(x, y, cw, rh);
            ctx.strokeStyle = '#1e2a4a';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, cw, rh);
            ctx.fillStyle = r === 0 ? '#00d4ff' : '#e0e6ed';
            ctx.font = r === 0 ? 'bold 14px sans-serif' : '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(data[r][c], x + cw / 2, y + rh / 2 + 5);
          }
        }
        return;
      }

      if (step === 1) {
        // T²-L 拟合图
        Equip.axes(ctx, 80, 40, 500, 320, 'L (m)', 'T² (s²)');
        const pts = [[0.8, 3.22], [0.9, 3.62], [1.0, 4.02], [1.1, 4.43], [1.2, 4.82]];
        const xMin = 0.7, xMax = 1.3, yMin = 2.8, yMax = 5.2;
        const toX = (x) => 80 + (x - xMin) / (xMax - xMin) * 500;
        const toY = (y) => 360 - (y - yMin) / (yMax - yMin) * 320;
        // 拟合线
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(toX(xMin), toY(4.02 * xMin));
        ctx.lineTo(toX(xMax), toY(4.02 * xMax));
        ctx.stroke();
        // 数据点
        const showPts = Math.ceil(pts.length * Ease.out(t));
        ctx.fillStyle = '#ff4466';
        for (let i = 0; i < Math.min(showPts, pts.length); i++) {
          ctx.beginPath();
          ctx.arc(toX(pts[i][0]), toY(pts[i][1]), 5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#ffd700';
        ctx.font = '14px "Cambria Math", serif';
        ctx.textAlign = 'left';
        ctx.fillText('T² = 4.02·L  (k = 4π²/g)', 300, 70);
        ctx.fillText('g = 4π²/k = 9.81 m/s²', 300, 95);
        return;
      }

      if (step === 2) {
        ctx.fillStyle = '#e0e6ed';
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'left';
        const lines = [
          ['L = 1.000 ± 0.002 m', '#e0e6ed'],
          ['T = 2.006 ± 0.004 s', '#e0e6ed'],
          ['', null],
          ['g = 4π²L/T² = 9.81 m/s²', '#00d4ff'],
          ['', null],
          ['u_L/L = 0.2%', '#8b9bb4'],
          ['u_T/T = 0.2%', '#8b9bb4'],
          ['u(g)/g = √((u_L/L)² + (2u_T/T)²) = 0.45%', '#8b9bb4'],
          ['', null],
          ['结果: g = 9.81 ± 0.04 m/s²', '#ffd700'],
        ];
        const showLines = Math.ceil(lines.length * Ease.out(t));
        for (let i = 0; i < Math.min(showLines, lines.length); i++) {
          if (!lines[i][0]) continue;
          ctx.fillStyle = lines[i][1];
          ctx.font = lines[i][0].startsWith('结果') ? 'bold 18px sans-serif' : '15px sans-serif';
          ctx.fillText(lines[i][0], 120, 70 + i * 32);
        }
      }
    }
  },
};