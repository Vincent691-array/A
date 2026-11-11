// 等厚干涉测细丝直径（劈尖法）D - 动画模块
const WedgeInterferenceAnim = {
  info: '劈尖干涉：两块玻璃片夹一细丝形成空气劈尖，单色光垂直入射产生等厚干涉条纹，D=L·λ/(2·Δx)',

  principle: {
    steps: [
      { title: '劈尖模型', desc: '两块玻璃片一端接触、另一端夹细丝，形成空气薄膜劈尖，夹角θ很小', duration: 3 },
      { title: '光程差', desc: '单色光垂直入射，在空气膜上下表面反射，光程差 δ=2d+λ/2（d为膜厚）', duration: 4 },
      { title: '干涉条件', desc: 'δ=kλ时亮纹，δ=(k+½)λ时暗纹。相邻条纹处膜厚差Δd=λ/2', duration: 4 },
      { title: '条纹间距', desc: '相邻条纹间距 Δx=λ/(2θ)，θ为劈尖角。条纹平行于接触棱边', duration: 4 },
      { title: '求细丝直径', desc: '劈尖长L处膜厚=D（细丝直径），D=L·θ=L·λ/(2·Δx)', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;

      let showWedge = false, showRays = false, showFringe = false, showFormula = false;
      if (step === 0) { showWedge = true; }
      else if (step === 1) { showWedge = true; showRays = true; }
      else if (step === 2) { showWedge = true; showFringe = true; }
      else if (step === 3) { showWedge = true; showFringe = true; }
      else if (step === 4) { showFringe = true; showFormula = true; }

      if (showWedge) {
        const x1 = cx - 150, x2 = cx + 150;
        const y1 = cy + 30, y2 = cy - 20;
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y1);
        ctx.stroke();
        ctx.fillStyle = '#00d4ff';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('下玻璃片', cx, y1 + 18);

        ctx.strokeStyle = '#7bc88a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.fillStyle = '#7bc88a';
        ctx.fillText('上玻璃片', cx, y2 - 12);

        ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.fill();

        if (step === 0 || step === 4) {
          ctx.fillStyle = '#ff4466';
          ctx.beginPath();
          ctx.arc(x2, y2, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ff4466';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('细丝 D', x2 + 8, y2 + 4);
          ctx.fillStyle = '#ffd700';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('L', cx, y1 + 35);
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x1, y1 + 25);
          ctx.lineTo(x2, y1 + 25);
          ctx.stroke();
        }
      }

      if (showRays) {
        const rx = cx;
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(rx, cy - 80);
        ctx.lineTo(rx, cy + 30);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ffd700';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('入射光 λ', rx, cy - 88);
        ctx.fillStyle = '#00d4ff';
        ctx.font = '12px "Cambria Math", serif';
        ctx.fillText('δ = 2d + λ/2', rx + 60, cy - 30);
      }

      if (showFringe) {
        const fy = cy + 90;
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(cx - 150, fy - 20, 300, 40);
        const offset = t * Math.PI * 2;
        for (let i = 0; i < 15; i++) {
          const fx = cx - 140 + i * 20;
          const bright = 0.5 + 0.5 * Math.cos(offset + i * 0.8);
          ctx.fillStyle = `rgba(255, 68, 102, ${bright})`;
          ctx.fillRect(fx - 8, fy - 15, 16, 30);
        }
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - 100, fy + 25);
        ctx.lineTo(cx - 80, fy + 25);
        ctx.stroke();
        ctx.fillStyle = '#ffd700';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Δx', cx - 90, fy + 40);
      }

      if (showFormula) {
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 16px "Cambria Math", serif';
        ctx.textAlign = 'center';
        ctx.fillText('Δx = λ/(2θ)', W / 2, 35);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 20px "Cambria Math", serif';
        ctx.fillText('D = L·λ / (2·Δx)', W / 2, H - 20);
      }
    }
  },

  procedure: {
    steps: [
      { title: '制作劈尖', desc: '操作：取两块洁净玻璃片，一端接触（棱边），另一端夹待测细丝，用夹具固定。\n原理：两玻璃片夹细丝形成空气劈尖，夹角θ=D/L很小，满足等厚干涉条件。\n注意：玻璃片要洁净（用酒精擦拭）；接触端要紧密接触；细丝在棱边对侧且平行于棱边。', duration: 4 },
      { title: '放置读数显微镜', desc: '操作：将劈尖置于读数显微镜载物台，上方放钠灯（λ=589.3nm），调焦看清条纹。\n原理：钠灯提供单色光，读数显微镜可精确测量条纹位置（精度0.01mm）。\n注意：钠灯预热5分钟；显微镜从下往上调焦避免压坏物镜；条纹要清晰锐利。', duration: 4 },
      { title: '测量条纹间距', desc: '操作：用读数显微镜十字叉丝对准某暗纹中心记位置x₁，数n条条纹后对准记x_{n+1}，Δx=(x_{n+1}-x₁)/n。\n原理：相邻暗纹间距=λ/(2θ)，测多条取平均减小误差，n取10~20条。\n注意：十字叉丝从同一方向逼近条纹（防回程间隙）；条纹编号要准确。', duration: 5 },
      { title: '测量劈尖长度', desc: '操作：用读数显微镜测从棱边到细丝的距离L（棱边位置x₀，细丝位置x_L）。\n原理：L是劈尖的有效长度，D=L·θ=L·λ/(2·Δx)。\n注意：棱边位置要找准（条纹最密处）；L测3次取平均。', duration: 3 },
      { title: '计算细丝直径', desc: '操作：代入 D=L·λ/(2·Δx) 计算细丝直径，与螺旋测微器直接测量值比较。\n原理：劈尖干涉法可测微米级直径，精度高于螺旋测微器（0.01mm）。\n注意：λ用钠灯589.3nm；单位统一（L和Δx用mm，D结果用μm）。', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;

      if (step === 0) {
        const p = Ease.out(t);
        const x1 = cx - 140, x2 = cx + 140;
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, cy + 30);
        ctx.lineTo(x2, cy + 30);
        ctx.stroke();
        ctx.strokeStyle = '#7bc88a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, cy + 30);
        ctx.lineTo(x2, cy - 15 * p);
        ctx.stroke();
        if (p > 0.7) {
          ctx.fillStyle = '#ff4466';
          ctx.beginPath();
          ctx.arc(x2, cy - 15, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ff4466';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('细丝', x2 + 8, cy - 11);
        }
        ctx.fillStyle = '#8b9bb4';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('两玻璃片夹细丝成劈尖', cx, H - 20);
        return;
      }

      if (step === 1) {
        const x1 = cx - 140, x2 = cx + 140;
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, cy + 30);
        ctx.lineTo(x2, cy + 30);
        ctx.stroke();
        ctx.strokeStyle = '#7bc88a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, cy + 30);
        ctx.lineTo(x2, cy - 15);
        ctx.stroke();
        ctx.fillStyle = '#ffd700';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('钠灯 λ=589.3nm', cx, cy - 60);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.moveTo(cx + i * 40, cy - 50);
          ctx.lineTo(cx + i * 40, cy + 30);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.fillStyle = '#00d4ff';
        ctx.font = '12px sans-serif';
        ctx.fillText('读数显微镜调焦看清条纹', cx, H - 20);
        return;
      }

      if (step === 2) {
        const fy = cy + 20;
        for (let i = 0; i < 15; i++) {
          const fx = cx - 140 + i * 20;
          const bright = 0.5 + 0.5 * Math.cos(i * 0.8);
          ctx.fillStyle = `rgba(255, 68, 102, ${bright})`;
          ctx.fillRect(fx - 8, fy - 12, 16, 24);
        }
        const idx = Math.floor(t * 10) % 10;
        const x1 = cx - 140 + idx * 20;
        const x2 = cx - 140 + (idx + 5) * 20;
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x1, fy - 20);
        ctx.lineTo(x1, fy + 20);
        ctx.moveTo(x2, fy - 20);
        ctx.lineTo(x2, fy + 20);
        ctx.stroke();
        ctx.fillStyle = '#00d4ff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`x₁=${x1.toFixed(0)}`, x1, fy - 25);
        ctx.fillText(`x₆=${x2.toFixed(0)}`, x2, fy - 25);
        ctx.fillStyle = '#ffd700';
        ctx.font = '13px "Cambria Math", serif';
        ctx.fillText(`Δx = (x₆-x₁)/5 = ${((x2 - x1) / 5).toFixed(1)} mm`, cx, H - 20);
        return;
      }

      if (step === 3) {
        const x1 = cx - 140, x2 = cx + 140;
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, cy + 30);
        ctx.lineTo(x2, cy + 30);
        ctx.stroke();
        ctx.strokeStyle = '#7bc88a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, cy + 30);
        ctx.lineTo(x2, cy - 15);
        ctx.stroke();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x1, cy + 50);
        ctx.lineTo(x2, cy + 50);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x1, cy + 45);
        ctx.lineTo(x1, cy + 55);
        ctx.moveTo(x2, cy + 45);
        ctx.lineTo(x2, cy + 55);
        ctx.stroke();
        ctx.fillStyle = '#ffd700';
        ctx.font = '13px "Cambria Math", serif';
        ctx.textAlign = 'center';
        ctx.fillText(`L = ${(x2 - x1).toFixed(0)} mm`, cx, cy + 70);
        return;
      }

      if (step === 4) {
        ctx.fillStyle = '#e0e6ed';
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'left';
        const lines = [
          ['测量数据：', '#8b9bb4'],
          ['L = 50.0 mm, Δx = 0.52 mm', '#e0e6ed'],
          ['λ = 589.3 nm = 5.893×10⁻⁴ mm', '#e0e6ed'],
          ['', null],
          ['D = L·λ/(2·Δx)', '#00d4ff'],
          ['  = 50.0×5.893×10⁻⁴ / (2×0.52)', '#e0e6ed'],
          ['  = 0.0283 mm = 28.3 μm', '#ffd700'],
          ['', null],
          ['螺旋测微器直接测：27.8 μm', '#8b9bb4'],
          ['相对误差：1.8%', '#7bc88a'],
        ];
        const showLines = Math.ceil(lines.length * Ease.out(t));
        for (let i = 0; i < Math.min(showLines, lines.length); i++) {
          if (!lines[i][0]) continue;
          ctx.fillStyle = lines[i][1];
          ctx.font = lines[i][0].startsWith('  =') ? 'bold 15px "Cambria Math", serif' : '15px sans-serif';
          ctx.fillText(lines[i][0], 100, 50 + i * 30);
        }
      }
    }
  },

  data: {
    steps: [
      { title: '实验数据表', desc: '多次测量条纹间距和劈尖长度，计算细丝直径', duration: 3 },
      { title: '计算细丝直径', desc: '由 D=L·λ/(2·Δx) 计算各组直径，取平均', duration: 3 },
      { title: '不确定度分析', desc: 'D 的相对不确定度：u(D)/D = √((u_L/L)² + (u_Δx/Δx)²)', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;

      if (step === 0) {
        const data = [
          ['组号', 'L (mm)', 'Δx (mm)', 'D (μm)'],
          ['1', '50.0', '0.52', '28.3'],
          ['2', '50.0', '0.51', '28.9'],
          ['3', '50.0', '0.53', '27.8'],
          ['4', '50.0', '0.52', '28.3'],
          ['5', '50.0', '0.52', '28.3'],
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
          ['各组直径计算：', '#8b9bb4'],
          ['D₁ = 50.0×589.3e-6/(2×0.52) = 28.3 μm', '#e0e6ed'],
          ['D₂ = 50.0×589.3e-6/(2×0.51) = 28.9 μm', '#e0e6ed'],
          ['D₃ = 50.0×589.3e-6/(2×0.53) = 27.8 μm', '#e0e6ed'],
          ['', null],
          ['平均 D = 28.3 μm', '#00d4ff'],
          ['', null],
          ['螺旋测微器直接测：27.8 μm', '#8b9bb4'],
          ['相对误差：1.8%', '#7bc88a'],
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
          ['L = 50.0 ± 0.5 mm', '#e0e6ed'],
          ['Δx = 0.52 ± 0.01 mm', '#e0e6ed'],
          ['', null],
          ['D = L·λ/(2·Δx) = 28.3 μm', '#00d4ff'],
          ['', null],
          ['u_L/L = 1.0%', '#8b9bb4'],
          ['u_Δx/Δx = 1.9%', '#8b9bb4'],
          ['u(D)/D = √((u_L/L)² + (u_Δx/Δx)²) = 2.1%', '#8b9bb4'],
          ['', null],
          ['结果: D = 28.3 ± 0.6 μm', '#ffd700'],
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