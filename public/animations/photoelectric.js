// 光电效应测普朗克常数 h - 动画模块
const PhotoelectricAnim = {
  info: '用爱因斯坦方程 hν=W+eU₀，测不同频率ν下的截止电压U₀，作U₀-ν图求斜率=h/e得普朗克常数h',

  principle: {
    steps: [
      { title: '光电效应现象', desc: '光照射金属表面，金属发射电子（光电子）。只有ν>ν₀（极限频率）才发生，与光强无关', duration: 3 },
      { title: '截止电压U₀', desc: '加反向电压，光电子被减速。当反向电压=U₀时光电流恰好为零，eU₀等于光电子最大初动能', duration: 4 },
      { title: '爱因斯坦方程', desc: 'hν = W + Ekm，其中W为逸出功，Ekm为最大初动能。又 Ekm = eU₀，故 hν = W + eU₀', duration: 4 },
      { title: 'U₀-ν线性关系', desc: 'U₀ = (h/e)ν - W/e，U₀与ν成线性关系，斜率=h/e，截距=-W/e', duration: 4 },
      { title: '求普朗克常数', desc: '测多组(ν, U₀)作图，求斜率k，则 h = k·e（e=1.6×10⁻¹⁹C）', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;

      let showTube = false, showCurrent = false, showStop = false, showLine = false, showH = false;
      if (step === 0) { showTube = true; }
      else if (step === 1) { showTube = true; showCurrent = true; showStop = true; }
      else if (step === 2) { showTube = true; showStop = true; }
      else if (step === 3) { showTube = true; showStop = true; showLine = true; }
      else if (step === 4) { showLine = true; showH = true; }

      if (showTube) {
        const cx = W / 2, cy = H / 2 - 20;
        // 光电管
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 120, 50, 0, 0, Math.PI * 2);
        ctx.stroke();
        // 阴极K
        ctx.fillStyle = '#445566';
        ctx.fillRect(cx - 90, cy - 30, 8, 60);
        ctx.fillStyle = '#00d4ff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('K', cx - 86, cy + 4);
        // 阳极A
        ctx.fillStyle = '#445566';
        ctx.fillRect(cx + 82, cy - 25, 6, 50);
        ctx.fillStyle = '#00d4ff';
        ctx.fillText('A', cx + 85, cy + 4);

        // 入射光
        const lightAlpha = 0.3 + 0.3 * Math.sin(t * Math.PI * 4);
        ctx.strokeStyle = `rgba(255, 215, 0, ${lightAlpha})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(cx - 150, cy - 30 + i * 20);
          ctx.lineTo(cx - 95, cy - 30 + i * 20);
          ctx.stroke();
        }
        ctx.fillStyle = '#ffd700';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('光 ν', cx - 125, cy - 40);

        // 光电子
        if (showCurrent) {
          for (let i = 0; i < 5; i++) {
            const px = cx - 80 + ((t * 200 + i * 40) % 160);
            ctx.fillStyle = '#ff4466';
            ctx.beginPath();
            ctx.arc(px, cy + (i - 2) * 8, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // 截止电压
        if (showStop) {
          ctx.strokeStyle = '#ff4466';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx + 85, cy + 35);
          ctx.lineTo(cx + 85, cy + 70);
          ctx.lineTo(cx - 86, cy + 70);
          ctx.lineTo(cx - 86, cy + 30);
          ctx.stroke();
          ctx.fillStyle = '#ff4466';
          ctx.font = '13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('U₀ (反向)', cx, cy + 88);
        }
      }

      if (showLine) {
        Equip.axes(ctx, 80, 60, 400, 250, 'ν (THz)', 'U₀ (V)');
        const pts = [[520, -0.13], [550, 0.0], [580, 0.12], [610, 0.25], [640, 0.37]];
        const xMin = 500, xMax = 660, yMin = -0.2, yMax = 0.45;
        const toX = (x) => 80 + (x - xMin) / (xMax - xMin) * 400;
        const toY = (y) => 310 - (y - yMin) / (yMax - yMin) * 250;
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(toX(xMin), toY(0.00417 * (xMin - 517)));
        ctx.lineTo(toX(xMax), toY(0.00417 * (xMax - 517)));
        ctx.stroke();
        const showPts = Math.ceil(pts.length * Ease.out(t));
        ctx.fillStyle = '#ff4466';
        for (let i = 0; i < Math.min(showPts, pts.length); i++) {
          ctx.beginPath();
          ctx.arc(toX(pts[i][0]), toY(pts[i][1]), 5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#ffd700';
        ctx.font = '13px "Cambria Math", serif';
        ctx.textAlign = 'left';
        ctx.fillText('U₀ = (h/e)ν - W/e', 300, 80);
        ctx.fillText('斜率 k = h/e', 300, 100);
      }

      if (showH) {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 18px "Cambria Math", serif';
        ctx.textAlign = 'center';
        ctx.fillText('h = k · e = 6.63×10⁻³⁴ J·s', W / 2, H - 20);
      }
    }
  },

  procedure: {
    steps: [
      { title: '连接光电管电路', desc: '操作：光电管阴极K接电压负端、阳极A接正端，微电流计串接，电压表并联。\n原理：加反向电压（K正A负）测截止电压，微电流计检测光电流为零点。\n注意：光电管避光罩不能漏光；接线前先断开电源。', duration: 4 },
      { title: '微电流计调零', desc: '操作：遮住光电管，调节微电流计零点，使读数为零。\n原理：无光照时光电流应为零，调零消除暗电流和零漂影响。\n注意：微电流计灵敏度极高（10⁻¹²A），调零要耐心；预热15分钟再调。', duration: 3 },
      { title: '换滤光片选频率', desc: '操作：依次换上不同波长的滤光片（如365/405/436/546/577nm），对应不同频率ν=c/λ。\n原理：滤光片从汞灯谱线中选出单色光，每片对应一个确定频率。\n注意：换滤光片要轻，避免振动光电管；记录每片对应波长。', duration: 4 },
      { title: '测截止电压U₀', desc: '操作：光照下缓慢增大反向电压，微电流计读数从有到零，记录电流恰好为零时的电压即U₀。\n原理：反向电压增大时光电流减小，电流为零时光电子最大初动能=eU₀。\n注意：U₀通常<2V；电流为零判断要仔细，多读几次取平均。', duration: 5 },
      { title: '作图求h', desc: '操作：以ν为横轴U₀为纵轴作图，过5个点拟合直线，求斜率k，h=k·e。\n原理：U₀-ν直线斜率=h/e是普适常数，与材料无关（截距才与逸出功有关）。\n注意：用最小二乘法拟合；检查线性关系是否良好（R²>0.99）。', duration: 4 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;

      if (step === 0) {
        const p = Ease.out(t);
        const cx = W / 2, cy = H / 2;
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 90 * p, 40 * p, 0, 0, Math.PI * 2);
        ctx.stroke();
        if (p > 0.5) {
          ctx.fillStyle = '#445566';
          ctx.fillRect(cx - 65, cy - 20, 6, 40);
          ctx.fillRect(cx + 59, cy - 18, 5, 36);
          ctx.fillStyle = '#ff4466';
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('K  A', cx, cy + 35);
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx + 62, cy + 20);
          ctx.lineTo(cx + 100, cy + 20);
          ctx.lineTo(cx + 100, cy + 50);
          ctx.lineTo(cx - 68, cy + 50);
          ctx.lineTo(cx - 68, cy + 20);
          ctx.stroke();
          ctx.fillStyle = '#ffd700';
          ctx.font = '12px sans-serif';
          ctx.fillText('电压表  微电流计', cx, cy + 68);
        }
        return;
      }

      if (step === 1) {
        ctx.fillStyle = '#445566';
        ctx.fillRect(W / 2 - 60, H / 2 - 20, 120, 40);
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(W / 2 - 60, H / 2 - 20, 120, 40);
        ctx.fillStyle = '#00d4ff';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('微电流计', W / 2, H / 2 + 5);
        ctx.fillStyle = '#7bc88a';
        ctx.font = 'bold 20px monospace';
        ctx.fillText('0.000', W / 2, H / 2 - 30);
        ctx.fillStyle = '#ff4466';
        ctx.font = '13px sans-serif';
        ctx.fillText('遮光调零 ✓', W / 2, H - 20);
        return;
      }

      if (step === 2) {
        const filters = ['365nm', '405nm', '436nm', '546nm', '577nm'];
        const idx = Math.floor(t * 5) % 5;
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`滤光片: ${filters[idx]}`, W / 2, H / 2);
        const freq = (3e8 / (parseInt(filters[idx]) * 1e-9) / 1e12).toFixed(0);
        ctx.fillStyle = '#00d4ff';
        ctx.font = '16px "Cambria Math", serif';
        ctx.fillText(`ν = c/λ = ${freq} THz`, W / 2, H / 2 + 35);
        ctx.fillStyle = '#8b9bb4';
        ctx.font = '12px sans-serif';
        ctx.fillText('换片选频率', W / 2, H - 20);
        return;
      }

      if (step === 3) {
        const cx = W / 2, cy = H / 2;
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 20, 80, 35, 0, 0, Math.PI * 2);
        ctx.stroke();
        const U = t * 0.5;
        const current = Math.max(0, 1 - U / 0.4);
        ctx.fillStyle = '#ff4466';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`I = ${(current * 10).toFixed(2)} (×10⁻¹²A)`, cx, cy + 30);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(`U₀ = ${U.toFixed(2)} V`, cx, cy + 55);
        if (current < 0.05) {
          ctx.fillStyle = '#7bc88a';
          ctx.font = 'bold 14px sans-serif';
          ctx.fillText('电流为零 → 记录U₀', cx, H - 20);
        }
        return;
      }

      if (step === 4) {
        Equip.axes(ctx, 80, 50, 400, 280, 'ν (THz)', 'U₀ (V)');
        const pts = [[520, -0.13], [550, 0.0], [580, 0.12], [610, 0.25], [640, 0.37]];
        const xMin = 500, xMax = 660, yMin = -0.2, yMax = 0.45;
        const toX = (x) => 80 + (x - xMin) / (xMax - xMin) * 400;
        const toY = (y) => 330 - (y - yMin) / (yMax - yMin) * 280;
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(toX(xMin), toY(0.00417 * (xMin - 517)));
        ctx.lineTo(toX(xMax), toY(0.00417 * (xMax - 517)));
        ctx.stroke();
        const showPts = Math.ceil(pts.length * Ease.out(t));
        ctx.fillStyle = '#ff4466';
        for (let i = 0; i < Math.min(showPts, pts.length); i++) {
          ctx.beginPath();
          ctx.arc(toX(pts[i][0]), toY(pts[i][1]), 5, 0, Math.PI * 2);
          ctx.fill();
        }
        if (showPts >= pts.length) {
          ctx.fillStyle = '#ffd700';
          ctx.font = 'bold 16px "Cambria Math", serif';
          ctx.textAlign = 'left';
          ctx.fillText('k = h/e = 4.17×10⁻¹⁵ V·s', 300, 80);
          ctx.fillText('h = k·e = 6.63×10⁻³⁴ J·s', 300, 105);
        }
      }
    }
  },

  data: {
    steps: [
      { title: '实验数据表', desc: '不同滤光片（频率）下测得的截止电压U₀', duration: 3 },
      { title: 'U₀-ν拟合图', desc: '作U₀-ν图，最小二乘法拟合直线，斜率k=h/e', duration: 3 },
      { title: '不确定度分析', desc: 'h 的相对不确定度由U₀和ν的测量不确定度合成', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;

      if (step === 0) {
        const data = [
          ['λ (nm)', 'ν (THz)', 'U₀ (V)'],
          ['365', '822', '1.27'],
          ['405', '741', '0.93'],
          ['436', '688', '0.71'],
          ['546', '549', '0.13'],
          ['577', '520', '0.00'],
        ];
        const rows = Math.ceil(data.length * Ease.out(t));
        const x0 = 150, y0 = 50, cw = 150, rh = 38;
        for (let r = 0; r < Math.min(rows, data.length); r++) {
          for (let c = 0; c < 3; c++) {
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
        Equip.axes(ctx, 80, 50, 420, 280, 'ν (THz)', 'U₀ (V)');
        const pts = [[520, 0.0], [549, 0.13], [688, 0.71], [741, 0.93], [822, 1.27]];
        const xMin = 500, xMax = 850, yMin = -0.1, yMax = 1.4;
        const toX = (x) => 80 + (x - xMin) / (xMax - xMin) * 420;
        const toY = (y) => 330 - (y - yMin) / (yMax - yMin) * 280;
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(toX(xMin), toY(0.00417 * (xMin - 517)));
        ctx.lineTo(toX(xMax), toY(0.00417 * (xMax - 517)));
        ctx.stroke();
        const showPts = Math.ceil(pts.length * Ease.out(t));
        ctx.fillStyle = '#ff4466';
        for (let i = 0; i < Math.min(showPts, pts.length); i++) {
          ctx.beginPath();
          ctx.arc(toX(pts[i][0]), toY(pts[i][1]), 5, 0, Math.PI * 2);
          ctx.fill();
        }
        if (showPts >= pts.length) {
          ctx.fillStyle = '#ffd700';
          ctx.font = '14px "Cambria Math", serif';
          ctx.textAlign = 'left';
          ctx.fillText('U₀ = 4.17×10⁻³·ν - 2.17', 300, 80);
          ctx.fillStyle = '#00d4ff';
          ctx.font = 'bold 15px "Cambria Math", serif';
          ctx.fillText('k = 4.17×10⁻¹⁵ V·s', 300, 105);
          ctx.fillText('h = k·e = 6.63×10⁻³⁴ J·s', 300, 130);
        }
        return;
      }

      if (step === 2) {
        ctx.fillStyle = '#e0e6ed';
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'left';
        const lines = [
          ['斜率 k = 4.17×10⁻¹⁵ V·s', '#e0e6ed'],
          ['e = 1.60×10⁻¹⁹ C', '#e0e6ed'],
          ['', null],
          ['h = k·e = 6.63×10⁻³⁴ J·s', '#00d4ff'],
          ['', null],
          ['公认值 h₀ = 6.626×10⁻³⁴ J·s', '#8b9bb4'],
          ['相对误差：0.1%', '#7bc88a'],
          ['', null],
          ['u(h)/h ≈ 2%（由U₀读数误差主导）', '#8b9bb4'],
          ['', null],
          ['结果: h = (6.63 ± 0.13)×10⁻³⁴ J·s', '#ffd700'],
        ];
        const showLines = Math.ceil(lines.length * Ease.out(t));
        for (let i = 0; i < Math.min(showLines, lines.length); i++) {
          if (!lines[i][0]) continue;
          ctx.fillStyle = lines[i][1];
          ctx.font = lines[i][0].startsWith('结果') ? 'bold 18px sans-serif' : '15px sans-serif';
          ctx.fillText(lines[i][0], 100, 55 + i * 32);
        }
      }
    }
  },
};