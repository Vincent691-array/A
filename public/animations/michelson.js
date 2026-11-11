// 迈克尔逊干涉测波长 λ - 动画模块
const MichelsonAnim = {
  info: '用迈克尔逊干涉仪，动镜移动距离Δd时条纹变化N条，由 2Δd=Nλ 求波长 λ=2Δd/N',

  principle: {
    steps: [
      { title: '干涉仪光路', desc: '激光经分束板G₁分成两束，分别射向固定镜M₁和动镜M₂，反射后合束干涉', duration: 3 },
      { title: '分束与合束', desc: 'G₁半透半反，光束1：G₁→M₁→G₁→屏；光束2：G₁→M₂→G₁→屏，两束光叠加', duration: 4 },
      { title: '光程差与条纹', desc: '两束光程差 δ=2d（d为M₂到G₁距离），δ=kλ时亮纹，δ=(k+½)λ时暗纹，呈同心圆环', duration: 4 },
      { title: '动镜移动与条纹变化', desc: 'M₂移动Δd，光程差变化2Δd，每变化λ出现一次条纹，N=2Δd/λ', duration: 4 },
      { title: '求波长公式', desc: '测动镜移动Δd时条纹变化数N，则 λ = 2Δd/N', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;

      let showPath = false, showRing = false, showMove = false, showFormula = false;
      if (step === 0) { showPath = true; }
      else if (step === 1) { showPath = true; }
      else if (step === 2) { showPath = true; showRing = true; }
      else if (step === 3) { showPath = true; showRing = true; showMove = true; }
      else if (step === 4) { showRing = true; showFormula = true; }

      if (showPath) {
        const laserX = 80, g1X = cx - 60, m1Y = cy - 100, m2X = cx + 120;
        // 激光器
        ctx.fillStyle = '#445566';
        ctx.fillRect(laserX - 30, cy - 12, 30, 24);
        ctx.fillStyle = '#ff4466';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('He-Ne', laserX - 15, cy + 4);
        // 分束板G1
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(g1X, cy - 40);
        ctx.lineTo(g1X + 30, cy - 10);
        ctx.stroke();
        ctx.fillStyle = '#00d4ff';
        ctx.font = '11px sans-serif';
        ctx.fillText('G₁', g1X + 22, cy - 30);
        // 固定镜M1
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(g1X - 20, m1Y);
        ctx.lineTo(g1X + 20, m1Y);
        ctx.stroke();
        ctx.fillStyle = '#ffd700';
        ctx.fillText('M₁', g1X, m1Y - 10);
        // 动镜M2
        const m2Off = showMove ? 15 * Math.sin(t * Math.PI) : 0;
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(m2X + m2Off, cy - 20);
        ctx.lineTo(m2X + m2Off, cy + 20);
        ctx.stroke();
        ctx.fillStyle = '#ffd700';
        ctx.fillText('M₂', m2X + m2Off + 15, cy);
        // 观察屏
        ctx.strokeStyle = '#7bc88a';
        ctx.lineWidth = 2;
        ctx.strokeRect(g1X, cy + 60, 60, 50);
        ctx.fillStyle = '#7bc88a';
        ctx.fillText('屏', g1X + 30, cy + 88);

        // 光路
        ctx.strokeStyle = '#ff4466';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(laserX, cy);
        ctx.lineTo(g1X + 15, cy);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 68, 102, 0.7)';
        ctx.beginPath();
        ctx.moveTo(g1X + 15, cy);
        ctx.lineTo(g1X, m1Y);
        ctx.lineTo(g1X + 15, cy);

        ctx.lineTo(m2X + m2Off, cy);
        ctx.lineTo(g1X + 15, cy);
        ctx.lineTo(g1X + 30, cy + 60);
        ctx.stroke();
      }

      if (showRing) {
        const ringX = cx, ringY = cy + 85;
        const offset = showMove ? t * Math.PI * 4 : 0;
        for (let i = 0; i < 8; i++) {
          const r = 8 + i * 7;
          const bright = 0.5 + 0.5 * Math.cos(offset + i * 0.8);
          ctx.strokeStyle = `rgba(255, 68, 102, ${bright * 0.8})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ringX, ringY, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      if (showMove) {
        ctx.fillStyle = '#ffd700';
        ctx.font = '13px "Cambria Math", serif';
        ctx.textAlign = 'center';
        ctx.fillText('M₂移动Δd → 条纹变化N条', W / 2, 30);
      }

      if (showFormula) {
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 18px "Cambria Math", serif';
        ctx.textAlign = 'center';
        ctx.fillText('2Δd = Nλ', W / 2, 35);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 20px "Cambria Math", serif';
        ctx.fillText('λ = 2Δd / N', W / 2, H - 20);
      }
    }
  },

  procedure: {
    steps: [
      { title: '开启He-Ne激光', desc: '操作：先开激光电源，等He-Ne激光器输出稳定（约15分钟），光斑呈红色632.8nm。\n原理：He-Ne激光单色性好、相干长度长，是迈克尔逊干涉的理想光源。\n注意：激光器预热期间不要直视光束；光束要水平，高度对准分束板中心。', duration: 4 },
      { title: '调节干涉仪光路', desc: '操作：调M₁和M₂背后的螺丝，使两束反射光重合于屏上，出现干涉条纹。\n原理：两束光要严格平行重合才能干涉，调螺丝改变镜面倾斜使光路对准。\n注意：调螺丝要轻，微调即可；先粗调再细调，看到条纹后不再动镜面。', duration: 5 },
      { title: '调出等倾条纹', desc: '操作：微调M₂使条纹呈同心圆环（等倾干涉），条纹清晰疏密适中。\n原理：M₁和M₂严格垂直时等倾条纹（圆环）；略微倾斜则等厚条纹（直纹）。\n注意：圆环中心在视场中央；条纹太密或太疏都影响计数。', duration: 4 },
      { title: '移动动镜数条纹', desc: '操作：转动测微鼓轮使M₂单向移动，同时数屏上从中心冒出（或吞入）的条纹数N，记M₂位移Δd。\n原理：M₂每移动λ/2，光程差变化λ，条纹变化1条，故N=2Δd/λ。\n注意：必须单向移动防回程间隙；数100~200条条纹减小误差；鼓轮读数估读到0.0001mm。', duration: 5 },
      { title: '计算波长', desc: '操作：λ=2Δd/N，多组测量取平均，与He-Ne激光公认值632.8nm比较。\n原理：迈克尔逊干涉仪精度极高，可测到纳米级波长。\n注意：每组测量后反向移动再正向测（仍需避开回程）；检查仪器零点。', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;

      if (step === 0) {
        const p = Ease.out(t);
        ctx.fillStyle = '#445566';
        ctx.fillRect(60, H / 2 - 15, 40, 30);
        ctx.strokeStyle = '#ff4466';
        ctx.lineWidth = 2;
        ctx.strokeRect(60, H / 2 - 15, 40, 30);
        ctx.fillStyle = '#ff4466';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('He-Ne', 80, H / 2 + 4);
        if (p > 0.3) {
          ctx.strokeStyle = '#ff4466';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(100, H / 2);
          ctx.lineTo(100 + 300 * p, H / 2);
          ctx.stroke();
        }
        ctx.fillStyle = '#ffd700';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('λ=632.8nm 红光', W / 2, H - 20);
        return;
      }

      if (step === 1) {
        const cx = W / 2, cy = H / 2;
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 30, cy - 40);
        ctx.lineTo(cx, cy - 10);
        ctx.stroke();
        ctx.fillText('G₁', cx - 8, cy - 30);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 20, cy - 80);
        ctx.lineTo(cx + 20, cy - 80);
        ctx.moveTo(cx + 80, cy - 20);
        ctx.lineTo(cx + 80, cy + 20);
        ctx.stroke();
        ctx.fillStyle = '#ffd700';
        ctx.font = '11px sans-serif';
        ctx.fillText('M₁', cx, cy - 90);
        ctx.fillText('M₂', cx + 92, cy);
        ctx.strokeStyle = '#ff4466';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(100, cy);
        ctx.lineTo(cx - 15, cy);
        ctx.lineTo(cx - 15, cy - 80);
        ctx.lineTo(cx - 15, cy);
        ctx.lineTo(cx + 80, cy);
        ctx.lineTo(cx - 15, cy);
        ctx.lineTo(cx, cy + 60);
        ctx.stroke();
        ctx.fillStyle = '#7bc88a';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('调光路重合', W / 2, H - 20);
        return;
      }

      if (step === 2) {
        const cx = W / 2, cy = H / 2;
        const offset = t * Math.PI * 2;
        for (let i = 0; i < 10; i++) {
          const r = 10 + i * 9;
          const bright = 0.5 + 0.5 * Math.cos(offset + i * 0.6);
          ctx.strokeStyle = `rgba(255, 68, 102, ${bright * 0.8})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = '#ffd700';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('等倾干涉条纹（同心圆环）', W / 2, H - 20);
        return;
      }

      if (step === 3) {
        const cx = W / 2, cy = H / 2;
        const offset = t * Math.PI * 8;
        for (let i = 0; i < 10; i++) {
          const r = 10 + i * 9;
          const bright = 0.5 + 0.5 * Math.cos(offset + i * 0.6);
          ctx.strokeStyle = `rgba(255, 68, 102, ${bright * 0.8})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy - 30, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        const N = Math.floor(t * 100);
        const d = (N * 0.0003164).toFixed(4);
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`N = ${N}`, W / 2, 35);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(`Δd = ${d} mm`, W / 2, H - 40);
        ctx.fillStyle = '#ff4466';
        ctx.font = '12px sans-serif';
        ctx.fillText('单向移动动镜，数条纹', W / 2, H - 18);
        return;
      }

      if (step === 4) {
        ctx.fillStyle = '#e0e6ed';
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'left';
        const lines = [
          ['测量数据：', '#8b9bb4'],
          ['N = 200 条', '#e0e6ed'],
          ['Δd = 0.0633 mm', '#e0e6ed'],
          ['', null],
          ['λ = 2Δd/N = 2×0.0633/200', '#00d4ff'],
          ['  = 6.33×10⁻⁴ mm = 633 nm', '#ffd700'],
          ['', null],
          ['公认值：632.8 nm', '#8b9bb4'],
          ['相对误差：0.03%', '#7bc88a'],
        ];
        const showLines = Math.ceil(lines.length * Ease.out(t));
        for (let i = 0; i < Math.min(showLines, lines.length); i++) {
          if (!lines[i][0]) continue;
          ctx.fillStyle = lines[i][1];
          ctx.font = lines[i][0].startsWith('  =') ? 'bold 16px "Cambria Math", serif' : '15px sans-serif';
          ctx.fillText(lines[i][0], 100, 60 + i * 32);
        }
      }
    }
  },

  data: {
    steps: [
      { title: '实验数据表', desc: '多组测量条纹变化数N和对应的动镜位移Δd', duration: 3 },
      { title: '计算波长', desc: '由 λ=2Δd/N 计算各组波长，取平均', duration: 3 },
      { title: '不确定度分析', desc: 'λ 的相对不确定度：u(λ)/λ = u_d/d（N为整数无误差）', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;

      if (step === 0) {
        const data = [
          ['组号', 'N (条)', 'Δd (mm)', 'λ (nm)'],
          ['1', '50', '0.0158', '632.0'],
          ['2', '100', '0.0316', '632.0'],
          ['3', '150', '0.0475', '633.3'],
          ['4', '200', '0.0633', '633.0'],
          ['5', '250', '0.0791', '632.8'],
        ];
        const rows = Math.ceil(data.length * Ease.out(t));
        const x0 = 100, y0 = 50, cw = 140, rh = 38;
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
          ['各组波长计算：', '#8b9bb4'],
          ['λ₁ = 2×0.0158/50 = 632.0 nm', '#e0e6ed'],
          ['λ₂ = 2×0.0316/100 = 632.0 nm', '#e0e6ed'],
          ['λ₃ = 2×0.0475/150 = 633.3 nm', '#e0e6ed'],
          ['λ₄ = 2×0.0633/200 = 633.0 nm', '#e0e6ed'],
          ['λ₅ = 2×0.0791/250 = 632.8 nm', '#e0e6ed'],
          ['', null],
          ['平均 λ = 632.6 nm', '#00d4ff'],
          ['', null],
          ['公认值 632.8 nm，相对误差 0.03%', '#7bc88a'],
        ];
        const showLines = Math.ceil(lines.length * Ease.out(t));
        for (let i = 0; i < Math.min(showLines, lines.length); i++) {
          if (!lines[i][0]) continue;
          ctx.fillStyle = lines[i][1];
          ctx.font = lines[i][0].startsWith('平均') ? 'bold 16px sans-serif' : '15px sans-serif';
          ctx.fillText(lines[i][0], 100, 50 + i * 30);
        }
        return;
      }

      if (step === 2) {
        ctx.fillStyle = '#e0e6ed';
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'left';
        const lines = [
          ['Δd = 0.0633 ± 0.0002 mm', '#e0e6ed'],
          ['N = 200（整数，无误差）', '#e0e6ed'],
          ['', null],
          ['λ = 2Δd/N = 633.0 nm', '#00d4ff'],
          ['', null],
          ['u_d/d = 0.32%', '#8b9bb4'],
          ['u(λ)/λ = u_d/d = 0.32%', '#8b9bb4'],
          ['', null],
          ['结果: λ = 633.0 ± 2.0 nm', '#ffd700'],
        ];
        const showLines = Math.ceil(lines.length * Ease.out(t));
        for (let i = 0; i < Math.min(showLines, lines.length); i++) {
          if (!lines[i][0]) continue;
          ctx.fillStyle = lines[i][1];
          ctx.font = lines[i][0].startsWith('结果') ? 'bold 18px sans-serif' : '15px sans-serif';
          ctx.fillText(lines[i][0], 100, 60 + i * 32);
        }
      }
    }
  },
};