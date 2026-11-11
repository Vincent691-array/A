// 不良导体热导率测定（稳态平板法）λ - 动画模块
const ThermalConductivityAnim = {
  info: '稳态平板法测不良导体热导率 λ = m·c·(dT/dt)·h / (π·R²·(T₁-T₂))，达到稳态后测冷却速率',

  principle: {
    steps: [
      { title: '稳态平板法', desc: '样品夹在加热板（高温T₁）和散热铜盘（低温T₂）之间，稳态时热流连续', duration: 3 },
      { title: '稳态传热', desc: '稳态下样品内温度梯度恒定，通过样品的热流量等于铜盘散热量', duration: 4 },
      { title: '冷却速率', desc: '移去加热板，测铜盘自然冷却速率 dT/dt，由冷却速率求稳态散热功率', duration: 4 },
      { title: '热导率公式', desc: 'λ = m·c·(dT/dt)·h / (π·R²·(T₁-T₂))，m为铜盘质量，c=385J/(kg·K)', duration: 4 },
      { title: '适用条件', desc: '适用于热导率较低的不良导体（如橡胶、玻璃、木材），良导体需用其他方法', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;

      let showSteady = false, showCool = false, showFormula = false;
      if (step === 0) { showSteady = true; }
      else if (step === 1) { showSteady = true; }
      else if (step === 2) { showCool = true; }
      else if (step === 3) { showFormula = true; }
      else if (step === 4) { showFormula = true; }

      if (showSteady) {
        const topY = cy - 60, botY = cy + 60;
        ctx.fillStyle = '#ff4466';
        ctx.fillRect(cx - 80, topY - 20, 160, 25);
        ctx.fillStyle = '#7bc88a';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('加热板 T₁=80°C', cx, topY - 5);

        const sampleAlpha = 0.6 + 0.2 * Math.sin(t * Math.PI * 2);
        ctx.fillStyle = `rgba(139, 69, 19, ${sampleAlpha})`;
        ctx.fillRect(cx - 75, topY + 8, 150, botY - topY - 16);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - 75, topY + 8, 150, botY - topY - 16);
        ctx.fillStyle = '#ffd700';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('样品 h', cx + 80, (topY + botY) / 2);

        ctx.fillStyle = '#445566';
        ctx.fillRect(cx - 80, botY - 5, 160, 25);
        ctx.fillStyle = '#7bc88a';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('铜盘 T₂=30°C', cx, botY + 15);

        ctx.strokeStyle = '#ff4466';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 100, topY - 8);
        ctx.lineTo(cx - 85, topY - 8);
        ctx.stroke();
        ctx.fillStyle = '#ff4466';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('热流→', cx - 105, topY - 4);
      }

      if (showCool) {
        const temp = 50 - 30 * Ease.out(t);
        const tempColor = `rgba(255, ${Math.round(100 + temp * 2)}, 50, 0.7)`;
        ctx.fillStyle = '#445566';
        ctx.fillRect(cx - 80, cy - 25, 160, 50);
        ctx.fillStyle = tempColor;
        ctx.fillRect(cx - 78, cy - 23, 156, 46);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`T = ${temp.toFixed(1)}°C`, cx, cy + 5);
        ctx.fillStyle = '#7bc88a';
        ctx.font = '13px sans-serif';
        ctx.fillText('移去热源，铜盘自然冷却', cx, cy + 50);
        ctx.fillStyle = '#00d4ff';
        ctx.font = '14px "Cambria Math", serif';
        ctx.fillText(`dT/dt = -0.03 °C/s`, cx, cy + 75);
      }

      if (showFormula) {
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 18px "Cambria Math", serif';
        ctx.textAlign = 'center';
        ctx.fillText('λ = m·c·(dT/dt)·h / (π·R²·(T₁-T₂))', W / 2, H / 2 - 20);
        ctx.fillStyle = '#8b9bb4';
        ctx.font = '13px sans-serif';
        ctx.fillText('m:铜盘质量  c:铜比热容385  h:样品厚  R:铜盘半径', W / 2, H / 2 + 15);
        if (step === 4) {
          ctx.fillStyle = '#ffd700';
          ctx.font = '14px sans-serif';
          ctx.fillText('适用：橡胶、玻璃、木材等不良导体', W / 2, H / 2 + 45);
        }
      }
    }
  },

  procedure: {
    steps: [
      { title: '安装样品', desc: '操作：将待测样品（如橡胶片）夹在加热板和散热铜盘之间，测量样品厚度h。\n原理：样品夹在两板间，热流从高温板经样品传到低温铜盘。\n注意：样品要平整、与两板紧密接触（可涂薄层导热硅脂）；h用螺旋测微器测3处取平均。', duration: 4 },
      { title: '加热至稳态', desc: '操作：开启加热板，等待T₁和T₂都稳定（约30分钟），记录稳态温度T₁、T₂。\n原理：稳态时样品内温度梯度恒定，通过样品的热流等于铜盘向环境散热率。\n注意：稳态判据——T₁和T₂在5分钟内变化<0.1°C；热电偶测温要贴紧板面。', duration: 5 },
      { title: '测铜盘冷却速率', desc: '操作：移去加热板和样品，让铜盘单独自然冷却，记录T-t曲线求dT/dt（在T₂附近）。\n原理：稳态时铜盘散热率=样品传热率，冷却速率反映该散热率，故用dT/dt代替稳态散热。\n注意：冷却曲线在T₂附近求斜率（切线法或差分法）；环境温度要稳定。', duration: 5 },
      { title: '测量铜盘参数', desc: '操作：用天平称铜盘质量m，游标卡尺测铜盘半径R。\n原理：m和R用于计算铜盘散热面积πR²和热容mc。\n注意：m精确到0.1g，R测3次取平均；铜的比热容c=385 J/(kg·K)查表。', duration: 3 },
      { title: '计算热导率', desc: '操作：代入 λ = m·c·(dT/dt)·h / (π·R²·(T₁-T₂)) 计算热导率。\n原理：公式来自稳态热流连续性：样品传热率=铜盘散热率=mc·dT/dt。\n注意：单位统一（m用kg，h用m，R用m，dT/dt用K/s）；与文献值比较。', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;

      if (step === 0) {
        const p = Ease.out(t);
        ctx.fillStyle = '#ff4466';
        ctx.fillRect(cx - 70, cy - 50, 140, 20);
        ctx.fillStyle = '#445566';
        ctx.fillRect(cx - 70, cy + 30, 140, 20);
        if (p > 0.3) {
          ctx.fillStyle = `rgba(139, 69, 19, ${p})`;
          ctx.fillRect(cx - 65, cy - 28, 130, 56);
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(cx - 65, cy - 28, 130, 56);
        }
        ctx.fillStyle = '#ffd700';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`h = 5.0 mm`, cx, cy + 5);
        ctx.fillStyle = '#8b9bb4';
        ctx.font = '11px sans-serif';
        ctx.fillText('加热板', cx, cy - 37);
        ctx.fillText('铜盘', cx, cy + 44);
        return;
      }

      if (step === 1) {
        const p = Ease.out(t);
        const T1 = 20 + 60 * p;
        const T2 = 20 + 10 * p;
        ctx.fillStyle = '#ff4466';
        ctx.fillRect(cx - 70, cy - 50, 140, 20);
        ctx.fillStyle = `rgba(255, ${Math.round(150 - T1)}, 50, 0.6)`;
        ctx.fillRect(cx - 68, cy - 48, 136, 16);
        ctx.fillStyle = `rgba(139, 69, 19, 0.7)`;
        ctx.fillRect(cx - 65, cy - 28, 130, 56);
        ctx.fillStyle = '#445566';
        ctx.fillRect(cx - 70, cy + 30, 140, 20);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`T₁ = ${T1.toFixed(0)}°C`, cx, cy - 37);
        ctx.fillStyle = '#7bc88a';
        ctx.fillText(`T₂ = ${T2.toFixed(0)}°C`, cx, cy + 44);
        if (p > 0.9) {
          ctx.fillStyle = '#7bc88a';
          ctx.font = '13px sans-serif';
          ctx.fillText('稳态 ✓', cx, H - 20);
        }
        return;
      }

      if (step === 2) {
        const temp = 50 - 25 * t;
        ctx.fillStyle = '#445566';
        ctx.fillRect(cx - 70, cy - 25, 140, 50);
        ctx.fillStyle = `rgba(255, ${Math.round(100 + temp * 2)}, 50, 0.7)`;
        ctx.fillRect(cx - 68, cy - 23, 136, 46);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`T = ${temp.toFixed(1)}°C`, cx, cy + 5);
        ctx.fillStyle = '#00d4ff';
        ctx.font = '13px "Cambria Math", serif';
        ctx.fillText(`dT/dt ≈ -0.03 °C/s`, cx, cy + 55);
        ctx.fillStyle = '#ff4466';
        ctx.font = '12px sans-serif';
        ctx.fillText('在T₂附近求冷却曲线斜率', cx, H - 20);
        return;
      }

      if (step === 3) {
        ctx.fillStyle = '#e0e6ed';
        ctx.font = '15px monospace';
        ctx.textAlign = 'left';
        const lines = [
          ['铜盘参数：', '#8b9bb4'],
          ['m = 200.0 g', '#e0e6ed'],
          ['R = 60.0 mm', '#e0e6ed'],
          ['c = 385 J/(kg·K) (查表)', '#e0e6ed'],
          ['', null],
          ['样品厚度：', '#8b9bb4'],
          ['h = 5.0 mm', '#e0e6ed'],
        ];
        const showLines = Math.ceil(lines.length * Ease.out(t));
        for (let i = 0; i < Math.min(showLines, lines.length); i++) {
          if (!lines[i][0]) continue;
          ctx.fillStyle = lines[i][1];
          ctx.fillText(lines[i][0], 120, 70 + i * 30);
        }
        return;
      }

      if (step === 4) {
        ctx.fillStyle = '#e0e6ed';
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'left';
        const lines = [
          ['代入数据：', '#8b9bb4'],
          ['λ = 0.2×385×0.03×0.005 / (π×0.06²×50)', '#e0e6ed'],
          ['  = 0.01155 / 0.5655', '#e0e6ed'],
          ['  = 0.0204 W/(m·K)', '#ffd700'],
          ['', null],
          ['橡胶文献值：0.15~0.20 W/(m·K)', '#8b9bb4'],
          ['（示例数据，实际需校准参数）', '#8b9bb4'],
        ];
        const showLines = Math.ceil(lines.length * Ease.out(t));
        for (let i = 0; i < Math.min(showLines, lines.length); i++) {
          if (!lines[i][0]) continue;
          ctx.fillStyle = lines[i][1];
          ctx.font = lines[i][0].startsWith('  =') ? 'bold 15px "Cambria Math", serif' : '15px sans-serif';
          ctx.fillText(lines[i][0], 100, 60 + i * 32);
        }
      }
    }
  },

  data: {
    steps: [
      { title: '实验数据表', desc: '不同稳态温度下测得的热导率', duration: 3 },
      { title: '计算热导率', desc: '由 λ = m·c·(dT/dt)·h / (π·R²·(T₁-T₂)) 计算各组热导率', duration: 3 },
      { title: '不确定度分析', desc: 'λ 的相对不确定度主要由T₁-T₂和冷却速率测量决定', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;

      if (step === 0) {
        const data = [
          ['T₁ (°C)', 'T₂ (°C)', 'T₁-T₂', 'λ (W/m·K)'],
          ['80.0', '30.0', '50.0', '0.204'],
          ['85.0', '32.0', '53.0', '0.193'],
          ['90.0', '35.0', '55.0', '0.186'],
          ['95.0', '38.0', '57.0', '0.179'],
          ['100.0', '40.0', '60.0', '0.170'],
        ];
        const rows = Math.ceil(data.length * Ease.out(t));
        const x0 = 100, y0 = 50, cw = 130, rh = 38;
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
          ['已知参数：', '#8b9bb4'],
          ['m = 200 g, R = 60 mm, h = 5 mm', '#e0e6ed'],
          ['c = 385 J/(kg·K), dT/dt = 0.03 °C/s', '#e0e6ed'],
          ['', null],
          ['示例（T₁=80°C, T₂=30°C）：', '#8b9bb4'],
          ['λ = 0.2×385×0.03×0.005 / (π×0.06²×50)', '#e0e6ed'],
          ['  = 0.204 W/(m·K)', '#ffd700'],
          ['', null],
          ['5组平均：λ = 0.186 W/(m·K)', '#00d4ff'],
        ];
        const showLines = Math.ceil(lines.length * Ease.out(t));
        for (let i = 0; i < Math.min(showLines, lines.length); i++) {
          if (!lines[i][0]) continue;
          ctx.fillStyle = lines[i][1];
          ctx.font = lines[i][0].startsWith('  =') || lines[i][0].startsWith('5组') ? 'bold 15px "Cambria Math", serif' : '15px sans-serif';
          ctx.fillText(lines[i][0], 100, 50 + i * 30);
        }
        return;
      }

      if (step === 2) {
        ctx.fillStyle = '#e0e6ed';
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'left';
        const lines = [
          ['主要误差来源：', '#8b9bb4'],
          ['• T₁-T₂ 测量误差 (±0.1°C)', '#e0e6ed'],
          ['• 冷却速率 dT/dt 误差 (~3%)', '#e0e6ed'],
          ['• 样品厚度 h 误差 (~2%)', '#e0e6ed'],
          ['', null],
          ['u(λ)/λ ≈ 4%', '#8b9bb4'],
          ['', null],
          ['结果: λ = 0.186 ± 0.008 W/(m·K)', '#ffd700'],
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