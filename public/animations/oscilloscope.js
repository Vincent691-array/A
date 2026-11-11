// 示波器原理与应用（李萨如图形测频率）fx - 动画模块
const OscilloscopeAnim = {
  info: '示波器显示李萨如图形，由 X/Y 切点数比 n_x:n_y 求 X 轴频率 f_x = f_y · n_y / n_x',

  principle: {
    steps: [
      { title: '示波器结构', desc: '示波器由示波管、Y偏转系统、X偏转系统、扫描电路组成。电子束打在荧光屏上显示波形', duration: 4 },
      { title: '波形显示原理', desc: 'Y轴加待测信号，X轴加锯齿扫描电压，光点在屏上画出信号随时间变化的波形', duration: 4 },
      { title: '李萨如图形', desc: 'X和Y轴都加正弦信号（关闭扫描），屏上出现李萨如图形，形状取决于频率比和相位差', duration: 4 },
      { title: '频率比与切点', desc: 'f_x/f_y = n_y/n_x，n_x为图形与X轴切点数，n_y为与Y轴切点数', duration: 4 },
      { title: '求未知频率', desc: '已知Y轴标准频率f_y，数切点n_x、n_y，则 f_x = f_y · n_y / n_x', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;

      let showScope = false, showWave = false, showLissajous = false, showFormula = false;
      if (step === 0) { showScope = true; }
      else if (step === 1) { showScope = true; showWave = true; }
      else if (step === 2) { showLissajous = true; }
      else if (step === 3) { showLissajous = true; }
      else if (step === 4) { showLissajous = true; showFormula = true; }

      if (showScope) {
        ctx.fillStyle = '#0a1a0a';
        ctx.fillRect(cx - 120, cy - 80, 240, 160);
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 120, cy - 80, 240, 160);
        ctx.fillStyle = '#00ff66';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('示波器', cx, cy - 88);
      }

      if (showWave && !showLissajous) {
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = -100; x <= 100; x += 2) {
          const y = 40 * Math.sin(x * 0.05 - t * Math.PI * 4);
          if (x === -100) ctx.moveTo(cx + x, cy + y);
          else ctx.lineTo(cx + x, cy + y);
        }
        ctx.stroke();
        ctx.fillStyle = '#00ff66';
        ctx.font = '11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Y轴信号 + X轴扫描 → 波形', cx - 110, cy + 70);
      }

      if (showLissajous) {
        ctx.fillStyle = '#0a1a0a';
        ctx.fillRect(cx - 120, cy - 80, 240, 160);
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 120, cy - 80, 240, 160);
        const fx = 100, fy = 100;
        const ratio = step >= 3 ? (1 + Math.floor(t * 3 % 4) * 0.5) : 1;
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i <= 200; i++) {
          const tt = (i / 200) * Math.PI * 2;
          const x = 70 * Math.sin(fx * tt * ratio + t * Math.PI);
          const y = 60 * Math.sin(fy * tt);
          if (i === 0) ctx.moveTo(cx + x, cy + y);
          else ctx.lineTo(cx + x, cy + y);
        }
        ctx.stroke();
        ctx.fillStyle = '#00ff66';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        if (step >= 3) {
          const ratios = ['1:1', '1:2', '1:3', '2:3'];
          const idx = Math.floor(t * 4) % 4;
          ctx.fillText(`f_x:f_y = ${ratios[idx]}`, cx - 110, cy - 65);
        }
      }

      if (showFormula) {
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 18px "Cambria Math", serif';
        ctx.textAlign = 'center';
        ctx.fillText('f_x / f_y = n_y / n_x', W / 2, 35);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 20px "Cambria Math", serif';
        ctx.fillText('f_x = f_y · n_y / n_x', W / 2, H - 20);
      }
    }
  },

  procedure: {
    steps: [
      { title: '开启示波器调基线', desc: '操作：开机预热，将X和Y输入接地，调亮度和聚焦，调X和Y位移使光点在屏中央。\n原理：无信号时示波器显示一个光点（或一条扫描基线），调到中央作为基准。\n注意：亮度不要太大（烧坏荧光屏）；预热15分钟使电路稳定。', duration: 4 },
      { title: 'Y轴输入信号', desc: '操作：将待测信号接入Y输入，调节Y衰减和扫描时间使屏上显示2~3个完整波形。\n原理：Y轴信号经放大加到垂直偏转板，X轴锯齿扫描使光点水平移动，合成波形。\n注意：波形要稳定不滚动（调触发电平）；幅度不超出屏范围。', duration: 4 },
      { title: '关闭扫描切X-Y模式', desc: '操作：将扫描切换到X-Y模式（或X输入接标准信号），此时X轴不再扫描而是显示X输入信号。\n原理：X-Y模式下两路信号在屏上合成李萨如图形，形状由频率比和相位差决定。\n注意：确认扫描关闭；X和Y输入都要接信号。', duration: 3 },
      { title: '接入标准信号', desc: '操作：Y轴接已知频率f_y的标准信号（如100Hz），X轴接待测信号f_x，屏上出现李萨如图形。\n原理：标准信号提供频率基准，待测信号与基准比较即可求未知频率。\n注意：标准信号频率要准确（用信号发生器）；两路信号幅度适中。', duration: 3 },
      { title: '数切点求频率', desc: '操作：数图形与X轴切点数n_x和与Y轴切点数n_y，代入 f_x=f_y·n_y/n_x 求未知频率。\n原理：切点数比等于频率反比，这是李萨如图形测频率的核心原理。\n注意：切点要数准（图形与水平/垂直线的切点）；换不同频率比多测几组验证。', duration: 4 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;

      if (step === 0) {
        const p = Ease.out(t);
        ctx.fillStyle = '#0a1a0a';
        ctx.fillRect(cx - 120, cy - 80, 240, 160);
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 120, cy - 80, 240, 160);
        ctx.fillStyle = '#00ff66';
        ctx.beginPath();
        ctx.arc(cx, cy, 3 * p, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00ff66';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('光点调到中央', cx, H - 20);
        return;
      }

      if (step === 1) {
        ctx.fillStyle = '#0a1a0a';
        ctx.fillRect(cx - 120, cy - 80, 240, 160);
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 120, cy - 80, 240, 160);
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = -100; x <= 100; x += 2) {
          const y = 50 * Math.sin(x * 0.06 - t * Math.PI * 4);
          if (x === -100) ctx.moveTo(cx + x, cy + y);
          else ctx.lineTo(cx + x, cy + y);
        }
        ctx.stroke();
        ctx.fillStyle = '#00ff66';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Y轴信号波形', cx, H - 20);
        return;
      }

      if (step === 2) {
        ctx.fillStyle = '#0a1a0a';
        ctx.fillRect(cx - 120, cy - 80, 240, 160);
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 120, cy - 80, 240, 160);
        ctx.fillStyle = '#00ff66';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('X-Y模式（扫描关闭）', cx, H - 20);
        return;
      }

      if (step === 3) {
        ctx.fillStyle = '#0a1a0a';
        ctx.fillRect(cx - 120, cy - 80, 240, 160);
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 120, cy - 80, 240, 160);
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i <= 200; i++) {
          const tt = (i / 200) * Math.PI * 2;
          const x = 70 * Math.sin(tt + t * Math.PI);
          const y = 60 * Math.sin(tt);
          if (i === 0) ctx.moveTo(cx + x, cy + y);
          else ctx.lineTo(cx + x, cy + y);
        }
        ctx.stroke();
        ctx.fillStyle = '#00ff66';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('f_y=100Hz(Y) + f_x(X) → 李萨如图', cx, H - 20);
        return;
      }

      if (step === 4) {
        const ratios = [
          { nx: 1, ny: 1, label: '1:1', fx: 100 },
          { nx: 1, ny: 2, label: '1:2', fx: 200 },
          { nx: 2, ny: 1, label: '2:1', fx: 50 },
          { nx: 2, ny: 3, label: '2:3', fx: 150 },
        ];
        const idx = Math.floor(t * 4) % 4;
        const r = ratios[idx];
        ctx.fillStyle = '#0a1a0a';
        ctx.fillRect(cx - 120, cy - 80, 240, 160);
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 120, cy - 80, 240, 160);
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i <= 300; i++) {
          const tt = (i / 300) * Math.PI * 2;
          const x = 70 * Math.sin(r.ny * tt + t * Math.PI);
          const y = 60 * Math.sin(r.nx * tt);
          if (i === 0) ctx.moveTo(cx + x, cy + y);
          else ctx.lineTo(cx + x, cy + y);
        }
        ctx.stroke();
        ctx.fillStyle = '#00ff66';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`n_x:${r.nx} n_y:${r.ny} → f_x=${r.fx}Hz`, cx, H - 20);
      }
    }
  },

  data: {
    steps: [
      { title: '实验数据表', desc: '不同频率比下测得的李萨如图形切点数和X轴频率', duration: 3 },
      { title: '计算X轴频率', desc: '由 f_x = f_y · n_y / n_x 计算各组频率，验证一致性', duration: 3 },
      { title: '不确定度分析', desc: 'f_x 的不确定度主要由标准频率f_y的精度决定', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;

      if (step === 0) {
        const data = [
          ['f_y (Hz)', 'n_x', 'n_y', 'f_x (Hz)'],
          ['100', '1', '1', '100'],
          ['100', '1', '2', '200'],
          ['100', '2', '1', '50'],
          ['100', '2', '3', '150'],
          ['100', '3', '2', '67'],
        ];
        const rows = Math.ceil(data.length * Ease.out(t));
        const x0 = 120, y0 = 50, cw = 130, rh = 38;
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
        ctx.fillStyle = '#e0e6ed';
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'left';
        const lines = [
          ['各组频率计算：', '#8b9bb4'],
          ['f_x = f_y · n_y / n_x', '#00d4ff'],
          ['', null],
          ['1:1 → 100×1/1 = 100 Hz', '#e0e6ed'],
          ['1:2 → 100×2/1 = 200 Hz', '#e0e6ed'],
          ['2:1 → 100×1/2 = 50 Hz', '#e0e6ed'],
          ['2:3 → 100×3/2 = 150 Hz', '#e0e6ed'],
          ['3:2 → 100×2/3 ≈ 67 Hz', '#e0e6ed'],
          ['', null],
          ['各组独立测量，结果一致', '#7bc88a'],
        ];
        const showLines = Math.ceil(lines.length * Ease.out(t));
        for (let i = 0; i < Math.min(showLines, lines.length); i++) {
          if (!lines[i][0]) continue;
          ctx.fillStyle = lines[i][1];
          ctx.fillText(lines[i][0], 100, 50 + i * 30);
        }
        return;
      }

      if (step === 2) {
        ctx.fillStyle = '#e0e6ed';
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'left';
        const lines = [
          ['标准频率 f_y = 100 ± 1 Hz', '#e0e6ed'],
          ['切点数 n_x, n_y 为整数（无误差）', '#e0e6ed'],
          ['', null],
          ['示例：f_x = 100 × 2/1 = 200 Hz', '#00d4ff'],
          ['', null],
          ['u(f_x)/f_x = u(f_y)/f_y = 1%', '#8b9bb4'],
          ['', null],
          ['结果: f_x = 200 ± 2 Hz', '#ffd700'],
          ['', null],
          ['优点：可测任意频率比', '#7bc88a'],
          ['缺点：频率比变化时图形会滚动', '#8b9bb4'],
        ];
        const showLines = Math.ceil(lines.length * Ease.out(t));
        for (let i = 0; i < Math.min(showLines, lines.length); i++) {
          if (!lines[i][0]) continue;
          ctx.fillStyle = lines[i][1];
          ctx.font = lines[i][0].startsWith('结果') ? 'bold 18px sans-serif' : '15px sans-serif';
          ctx.fillText(lines[i][0], 100, 50 + i * 30);
        }
      }
    }
  },
};