// 牛顿环测透镜曲率半径 R - 动画模块
const NewtonRingAnim = {
  info: '利用等厚干涉原理，通过测量牛顿环直径计算平凸透镜的曲率半径 R = (D_m²-D_n²)/(4λ(m-n))',

  principle: {
    steps: [
      { title: '牛顿环装置', desc: '平凸透镜放在平玻璃板上，透镜凸面与玻璃板之间形成空气薄膜', duration: 3 },
      { title: '单色光垂直入射', desc: '钠光灯发出的单色光（λ=589.3nm）垂直入射，经空气膜上下表面反射产生干涉', duration: 3 },
      { title: '等厚干涉原理', desc: '同一圆环上空气膜厚度相同，光程差 δ = 2d + λ/2 相同，形成同心圆环', duration: 4 },
      { title: '暗环条件', desc: '暗环：δ = (k+1)λ，膜厚 d = r²/(2R)，推得 r² = kRλ，即 D² = 4kRλ', duration: 4 },
      { title: '推导R公式', desc: '为减小误差取两环之差：D_m² - D_n² = 4Rλ(m-n)，故 R = (D_m²-D_n²)/(4λ(m-n))', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;

      // 步骤0：装置图
      if (step === 0) {
        const p = Ease.out(t);
        // 平玻璃板
        Equip.glassPlate(ctx, cx - 100, cy + 20, 200, 10);
        // 凸透镜
        ctx.globalAlpha = p;
        Equip.lens(ctx, cx, cy - 20, 120, true);
        ctx.globalAlpha = 1;
        // 标注
        if (p > 0.5) {
          Equip.label(ctx, cx, cy - 60, '平凸透镜', cx + 120, cy - 80, '#4fc3f7');
          Equip.label(ctx, cx, cy + 25, '平玻璃板', cx + 120, cy + 40, '#4fc3f7');
          ctx.fillStyle = '#8b9bb4';
          ctx.font = '13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('空气薄膜', cx, cy + 5);
        }
        return;
      }

      // 步骤1：光路
      if (step === 1) {
        Equip.glassPlate(ctx, cx - 100, cy + 20, 200, 10);
        Equip.lens(ctx, cx, cy - 20, 120, true);
        // 入射光
        Equip.lightSource(ctx, cx, 30, '钠光');
        Equip.lightRay(ctx, cx, 40, cx, cy - 10, '#ffeb3b');
        // 反射光
        const alpha = 0.3 + 0.4 * Math.sin(t * Math.PI * 4);
        ctx.globalAlpha = alpha;
        Equip.lightRay(ctx, cx, cy - 10, cx, 40, '#ffeb3b', true);
        ctx.globalAlpha = 1;
        Equip.label(ctx, cx, 20, 'λ=589.3nm', cx + 100, 20, '#ffeb3b');
        return;
      }

      // 步骤2-4：干涉条纹
      if (step >= 2) {
        // 画牛顿环
        const maxR = 140;
        const numRings = 12;
        const lambda = 589.3;
        const R = 1000;

        for (let k = 1; k <= numRings; k++) {
          const r = Math.sqrt(k * R * lambda * 1e-6) * 80;
          if (r > maxR) break;
          // 暗环
          ctx.strokeStyle = `rgba(0, 0, 0, ${0.8})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
          // 亮环（内填淡黄）
          if (k < numRings) {
            const rNext = Math.sqrt((k + 1) * R * lambda * 1e-6) * 80;
            const rInner = Math.sqrt(k * R * lambda * 1e-6) * 80;
            ctx.fillStyle = `rgba(255, 235, 59, ${0.15 / k})`;
            ctx.beginPath();
            ctx.arc(cx, cy, (rInner + Math.min(rNext, maxR)) / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // 动态高亮
        if (step === 2) {
          const ringIdx = Math.floor(t * 8) + 1;
          const r = Math.sqrt(ringIdx * R * lambda * 1e-6) * 80;
          Equip.glow(ctx, cx, cy, r, '#00d4ff', 0.2);
          ctx.fillStyle = '#00d4ff';
          ctx.font = '13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`同一环上厚度d相同`, cx, H - 20);
        }

        if (step === 3) {
          ctx.fillStyle = '#ffd700';
          ctx.font = 'bold 18px "Cambria Math", serif';
          ctx.textAlign = 'center';
          ctx.fillText('δ = 2d + λ/2 = (k+1)λ  →  r² = kRλ', cx, H - 20);
        }

        if (step === 4) {
          ctx.fillStyle = '#ffd700';
          ctx.font = 'bold 18px "Cambria Math", serif';
          ctx.textAlign = 'center';
          ctx.fillText('R = (D_m² - D_n²) / [4λ(m-n)]', cx, H - 20);
        }
      }
    }
  },

  procedure: {
    steps: [
      { title: '调节钠光灯', desc: '开启钠光灯，预热稳定后调节出光方向对准显微镜', duration: 2 },
      { title: '放置牛顿环装置', desc: '将牛顿环装置放在读数显微镜载物台上，使光垂直入射', duration: 3 },
      { title: '调节显微镜', desc: '调节目镜看清十字叉丝，再调节物镜找到干涉环并使之清晰', duration: 3 },
      { title: '确定环心位置', desc: '移动微动鼓轮，使叉丝从中心向左数到第m级暗环，再回到m级开始读数', duration: 3 },
      { title: '测量各级环直径', desc: '从m=15开始，依次测左、右坐标，求直径D。再测n=5等，取多组(m,n)组合', duration: 4 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;

      // 显微镜筒
      ctx.strokeStyle = '#8b9bb4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 40, 20);
      ctx.lineTo(cx - 40, cy - 60);
      ctx.lineTo(cx - 60, cy - 40);
      ctx.moveTo(cx + 40, 20);
      ctx.lineTo(cx + 40, cy - 60);
      ctx.lineTo(cx + 60, cy - 40);
      ctx.stroke();
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(cx - 40, 20, 80, 15);

      // 载物台
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 120, cy + 40);
      ctx.lineTo(cx + 120, cy + 40);
      ctx.stroke();

      // 牛顿环装置
      Equip.glassPlate(ctx, cx - 80, cy + 25, 160, 8);
      Equip.lens(ctx, cx, cy, 80, true);

      if (step === 0) {
        Equip.lightSource(ctx, 60, cy, '钠光');
        const p = Ease.out(t);
        ctx.globalAlpha = p;
        Equip.lightRay(ctx, 70, cy, cx - 40, cy, '#ffeb3b');
        ctx.globalAlpha = 1;
      }

      if (step >= 1) {
        Equip.lightSource(ctx, 60, cy, '钠光');
        Equip.lightRay(ctx, 70, cy, cx - 40, cy, '#ffeb3b');
      }

      if (step >= 2) {
        // 视野中的干涉环
        const vx = cx, vy = cy + 5;
        for (let k = 1; k <= 8; k++) {
          const r = Math.sqrt(k) * 12;
          ctx.strokeStyle = `rgba(0,0,0,0.7)`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(vx, vy, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = '#00d4ff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('视野', cx, cy - 50);
      }

      if (step >= 3) {
        // 叉丝移动
        const moveX = (t - 0.5) * 100;
        ctx.strokeStyle = '#ff4466';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(cx + moveX, cy - 20);
        ctx.lineTo(cx + moveX, cy + 30);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (step === 4) {
        ctx.fillStyle = '#ffd700';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('D = |x_右 - x_左|', W / 2, H - 15);
      }
    }
  },

  data: {
    steps: [
      { title: '测量数据', desc: '测量m=15,14,...,6和n=5,4,...,1级暗环直径，取(m,n)组合', duration: 3 },
      { title: '计算曲率半径', desc: 'R = (D_m² - D_n²) / [4λ(m-n)]，取多组平均', duration: 3 },
      { title: '不确定度分析', desc: '由D的测量不确定度传递计算R的不确定度', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;

      if (step === 0) {
        const data = [
          ['m', 'D_m (mm)', 'n', 'D_n (mm)', 'D_m²-D_n²'],
          ['15', '5.95', '5', '3.25', '24.09'],
          ['14', '5.72', '4', '2.88', '23.85'],
          ['13', '5.48', '3', '2.42', '24.12'],
          ['12', '5.22', '2', '1.85', '23.96'],
          ['11', '4.95', '1', '1.18', '23.72'],
        ];
        const rows = Math.ceil(data.length * Ease.out(t));
        const x0 = 80, y0 = 60, cw = 120, rh = 36;
        for (let r = 0; r < Math.min(rows, data.length); r++) {
          for (let c = 0; c < 5; c++) {
            const x = x0 + c * cw, y = y0 + r * rh;
            ctx.fillStyle = r === 0 ? '#0a2a3d' : '#0d1117';
            ctx.fillRect(x, y, cw, rh);
            ctx.strokeStyle = '#1e2a4a';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, cw, rh);
            ctx.fillStyle = r === 0 ? '#00d4ff' : '#e0e6ed';
            ctx.font = r === 0 ? 'bold 13px sans-serif' : '13px sans-serif';
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
          ['λ = 589.3 nm = 5.893×10⁻⁴ mm', '#e0e6ed'],
          ['', null],
          ['R = (D_m² - D_n²) / [4λ(m-n)]', '#00d4ff'],
          ['', null],
          ['R₁ = 24.09 / (4×5.893×10⁻⁴×10) = 1023 mm', '#e0e6ed'],
          ['R₂ = 23.85 / (...) = 1013 mm', '#e0e6ed'],
          ['R₃ = 24.12 / (...) = 1024 mm', '#e0e6ed'],
          ['', null],
          ['R̄ = 1021 mm = 1.021 m', '#ffd700'],
        ];
        const showLines = Math.ceil(lines.length * Ease.out(t));
        for (let i = 0; i < Math.min(showLines, lines.length); i++) {
          if (!lines[i][0]) continue;
          ctx.fillStyle = lines[i][1];
          ctx.font = lines[i][0].startsWith('R̄') ? 'bold 18px sans-serif' : '15px sans-serif';
          ctx.fillText(lines[i][0], 100, 60 + i * 32);
        }
        return;
      }

      if (step === 2) {
        ctx.fillStyle = '#e0e6ed';
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'left';
        const lines = [
          ['u_A(R) = s(Rᵢ) = 5 mm', '#8b9bb4'],
          ['u_B(D) = Δ仪/√3 = 0.005/√3 mm', '#8b9bb4'],
          ['u_B(R) ≈ 3 mm', '#8b9bb4'],
          ['', null],
          ['u_c = √(u_A² + u_B²) ≈ 6 mm', '#e0e6ed'],
          ['', null],
          ['结果: R = 1.021 ± 0.006 m', '#ffd700'],
        ];
        const showLines = Math.ceil(lines.length * Ease.out(t));
        for (let i = 0; i < Math.min(showLines, lines.length); i++) {
          if (!lines[i][0]) continue;
          ctx.fillStyle = lines[i][1];
          ctx.font = lines[i][0].startsWith('结果') ? 'bold 18px sans-serif' : '15px sans-serif';
          ctx.fillText(lines[i][0], 120, 70 + i * 36);
        }
      }
    }
  },
};