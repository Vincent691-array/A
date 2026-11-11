// 空气热机效率测定 η - 动画模块
const HeatEngineAnim = {
  info: '空气热机将热能转为机械能，测实际效率η并与卡诺效率ηc=1-T₂/T₁比较',

  principle: {
    steps: [
      { title: '热机模型', desc: '空气热机通过气缸内空气在高温热源吸热、低温热源放热，推动活塞做功', duration: 3 },
      { title: '热机循环', desc: '空气经历等温膨胀→等容冷却→等温压缩→等容加热的循环，P-V图上形成闭合曲线', duration: 4 },
      { title: '热机效率', desc: '效率 η = W/Q₁（输出功/吸热量），实际效率因摩擦、漏气等损失低于理论值', duration: 4 },
      { title: '卡诺效率', desc: '理想可逆热机效率上限 ηc = 1 - T₂/T₁，仅与高低温热源温度有关', duration: 4 },
      { title: '比较分析', desc: '测量不同温差下的实际效率η，与卡诺效率ηc比较，分析损失来源', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;

      let showPV = false, showEngine = false, showCarnot = false, showCompare = false;
      if (step === 0) { showEngine = true; }
      else if (step === 1) { showPV = true; showEngine = true; }
      else if (step === 2) { showPV = true; }
      else if (step === 3) { showCarnot = true; }
      else if (step === 4) { showCompare = true; }

      if (showEngine) {
        const cx = 150, cy = H / 2;
        ctx.fillStyle = '#445566';
        ctx.fillRect(cx - 60, cy - 25, 100, 50);
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 60, cy - 25, 100, 50);
        const pistonX = cx - 30 + 25 * Math.sin(t * Math.PI * 2);
        ctx.fillStyle = '#ff4466';
        ctx.fillRect(pistonX - 8, cy - 22, 16, 44);
        ctx.fillStyle = '#ffd700';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('高温T₁', cx - 35, cy - 32);
        ctx.fillStyle = '#7bc88a';
        ctx.fillText('低温T₂', cx + 30, cy + 42);
      }

      if (showPV) {
        const px = 350, py = H / 2;
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= 60; i++) {
          const a = (i / 60) * Math.PI * 2 + t * Math.PI * 0.5;
          const r = 60 + 15 * Math.sin(a * 2);
          const x = px + r * Math.cos(a) * 1.2;
          const y = py - r * Math.sin(a) * 0.8;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = '#8b9bb4';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('P', px - 80, py - 65);
        ctx.fillText('V', px + 75, py + 55);
        ctx.fillStyle = '#ffd700';
        ctx.font = '13px "Cambria Math", serif';
        ctx.fillText('W = ∮P dV (闭合面积)', px, py + 80);
      }

      if (showCarnot) {
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 22px "Cambria Math", serif';
        ctx.textAlign = 'center';
        ctx.fillText('ηc = 1 - T₂/T₁', W / 2, H / 2 - 20);
        ctx.fillStyle = '#8b9bb4';
        ctx.font = '14px sans-serif';
        ctx.fillText('T₁=高温热源, T₂=低温热源 (开尔文)', W / 2, H / 2 + 15);
        ctx.fillText('卡诺效率是所有热机的效率上限', W / 2, H / 2 + 38);
      }

      if (showCompare) {
        Equip.axes(ctx, 80, 50, 450, 280, 'T₁ (K)', '效率 η');
        const pts = [[400, 0.18], [450, 0.25], [500, 0.32], [550, 0.38], [600, 0.43]];
        const xMin = 380, xMax = 620, yMin = 0, yMax = 0.55;
        const toX = (x) => 80 + (x - xMin) / (xMax - xMin) * 450;
        const toY = (y) => 330 - (y - yMin) / (yMax - yMin) * 280;
        ctx.strokeStyle = '#7bc88a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(toX(xMin), toY(1 - 300 / xMin));
        ctx.lineTo(toX(xMax), toY(1 - 300 / xMax));
        ctx.stroke();
        ctx.strokeStyle = '#00d4ff';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        for (let x = xMin; x <= xMax; x += 5) {
          const y = 0.85 * (1 - 300 / x);
          if (x === xMin) ctx.moveTo(toX(x), toY(y));
          else ctx.lineTo(toX(x), toY(y));
        }
        ctx.stroke();
        ctx.setLineDash([]);
        const showPts = Math.ceil(pts.length * Ease.out(t));
        ctx.fillStyle = '#ff4466';
        for (let i = 0; i < Math.min(showPts, pts.length); i++) {
          ctx.beginPath();
          ctx.arc(toX(pts[i][0]), toY(pts[i][1]), 5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#7bc88a';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('— 卡诺效率 ηc', 320, 70);
        ctx.fillStyle = '#00d4ff';
        ctx.fillText('-- 实际效率 η', 320, 90);
        ctx.fillStyle = '#ff4466';
        ctx.fillText('● 实验数据', 320, 110);
      }
    }
  },

  procedure: {
    steps: [
      { title: '组装空气热机', desc: '操作：将热机气缸连接高温热源（电加热）和低温热源（水冷），活塞连杆接飞轮。\n原理：热机通过气缸内空气吸热膨胀推动活塞做功，经连杆带动飞轮输出机械能。\n注意：各连接处密封良好避免漏气；飞轮转动灵活无卡阻。', duration: 4 },
      { title: '加热至稳态', desc: '操作：开启电加热，等待高温端温度T₁稳定（约5分钟），记录T₁和低温端T₂。\n原理：稳态下热机循环稳定，输出功率恒定，此时测量才有意义。\n注意：温度稳定指1分钟内变化<0.5°C；热电偶测温要贴紧热源。', duration: 4 },
      { title: '测量输出功率', desc: '操作：用测功器或发电机测热机输出功率P_out，同时测输入电功率P_in。\n原理：实际效率 η = P_out / P_in，电加热功率即近似吸热量Q₁的功率。\n注意：测功器要校准；P_out和P_in同时读数；测3次取平均。', duration: 4 },
      { title: '改变温差测多组', desc: '操作：调节加热功率改变T₁，重复步骤2-3，测5组不同温差下的效率。\n原理：温差越大卡诺效率越高，实际效率也相应增大，但比值η/ηc可能变化。\n注意：每次改变T₁后要等稳态再测；T₁范围400~600K为宜。', duration: 4 },
      { title: '比较卡诺效率', desc: '操作：计算各组ηc=1-T₂/T₁，作η-T₁图与ηc曲线比较，分析损失来源。\n原理：η<ηc始终成立，差距来自摩擦、漏气、非等温过程等不可逆因素。\n注意：差距大说明热机效率低，可分析改进方向（减少摩擦、改善密封）。', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;

      if (step === 0) {
        const p = Ease.out(t);
        ctx.fillStyle = '#445566';
        ctx.fillRect(cx - 80, cy - 30, 120, 60);
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 80, cy - 30, 120, 60);
        if (p > 0.3) {
          const px = cx - 40 + 20 * Math.sin(t * Math.PI * 3);
          ctx.fillStyle = '#ff4466';
          ctx.fillRect(px - 6, cy - 26, 12, 52);
        }
        if (p > 0.6) {
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx + 70, cy, 25, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#ffd700';
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('飞轮', cx + 70, cy + 4);
        }
        ctx.fillStyle = '#8b9bb4';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('气缸+活塞+飞轮', cx, H - 20);
        return;
      }

      if (step === 1) {
        const temp = 20 + 60 * Ease.out(t);
        ctx.fillStyle = '#445566';
        ctx.fillRect(cx - 80, cy - 30, 120, 60);
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 80, cy - 30, 120, 60);
        const heatColor = `rgba(255, ${Math.round(100 - temp)}, 0, 0.5)`;
        ctx.fillStyle = heatColor;
        ctx.fillRect(cx - 78, cy - 28, 116, 56);
        ctx.fillStyle = '#ff4466';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`T₁ = ${temp.toFixed(0)}°C`, cx, cy + 5);
        ctx.fillStyle = '#7bc88a';
        ctx.font = '14px monospace';
        ctx.fillText('T₂ = 25°C', cx, cy + 50);
        if (temp > 70) {
          ctx.fillStyle = '#7bc88a';
          ctx.font = '13px sans-serif';
          ctx.fillText('稳态 ✓', cx, H - 20);
        }
        return;
      }

      if (step === 2) {
        const p = Ease.out(t);
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`P_out = ${(2.5 * p).toFixed(2)} W`, cx, cy - 20);
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`P_in = ${(10 * p).toFixed(2)} W`, cx, cy + 10);
        if (p > 0.8) {
          ctx.fillStyle = '#ff4466';
          ctx.font = 'bold 20px "Cambria Math", serif';
          ctx.fillText(`η = P_out/P_in = ${((2.5 / 10) * 100).toFixed(1)}%`, cx, cy + 50);
        }
        return;
      }

      if (step === 3) {
        const data = ['T₁=400K η=18%', 'T₁=450K η=25%', 'T₁=500K η=32%', 'T₁=550K η=38%', 'T₁=600K η=43%'];
        const showN = Math.ceil(data.length * Ease.out(t));
        ctx.fillStyle = '#e0e6ed';
        ctx.font = '14px monospace';
        ctx.textAlign = 'left';
        for (let i = 0; i < Math.min(showN, data.length); i++) {
          ctx.fillText(data[i], 120, 70 + i * 32);
        }
        ctx.fillStyle = '#8b9bb4';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('改变温差测多组', W / 2, H - 20);
        return;
      }

      if (step === 4) {
        Equip.axes(ctx, 80, 50, 450, 280, 'T₁ (K)', '效率');
        const xMin = 380, xMax = 620, yMin = 0, yMax = 0.55;
        const toX = (x) => 80 + (x - xMin) / (xMax - xMin) * 450;
        const toY = (y) => 330 - (y - yMin) / (yMax - yMin) * 280;
        ctx.strokeStyle = '#7bc88a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(toX(xMin), toY(1 - 300 / xMin));
        ctx.lineTo(toX(xMax), toY(1 - 300 / xMax));
        ctx.stroke();
        ctx.strokeStyle = '#00d4ff';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        for (let x = xMin; x <= xMax; x += 5) {
          const y = 0.85 * (1 - 300 / x);
          if (x === xMin) ctx.moveTo(toX(x), toY(y));
          else ctx.lineTo(toX(x), toY(y));
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ff4466';
        const pts = [[400, 0.18], [450, 0.25], [500, 0.32], [550, 0.38], [600, 0.43]];
        const showPts = Math.ceil(pts.length * Ease.out(t));
        for (let i = 0; i < Math.min(showPts, pts.length); i++) {
          ctx.beginPath();
          ctx.arc(toX(pts[i][0]), toY(pts[i][1]), 5, 0, Math.PI * 2);
          ctx.fill();
        }
        if (showPts >= pts.length) {
          ctx.fillStyle = '#7bc88a';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('— ηc (卡诺)', 320, 70);
          ctx.fillStyle = '#ff4466';
          ctx.fillText('● η (实际)', 320, 90);
          ctx.fillStyle = '#ffd700';
          ctx.font = 'bold 14px sans-serif';
          ctx.fillText('η < ηc (不可逆损失)', 320, 115);
        }
      }
    }
  },

  data: {
    steps: [
      { title: '实验数据表', desc: '不同高温T₁下测得的实际效率η与卡诺效率ηc', duration: 3 },
      { title: 'η-T₁关系图', desc: '作η-T₁图，同时画卡诺效率曲线ηc=1-T₂/T₁对比', duration: 3 },
      { title: '效率损失分析', desc: '计算各组η/ηc比值，分析不可逆损失来源', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;

      if (step === 0) {
        const data = [
          ['T₁ (K)', 'T₂ (K)', 'η', 'ηc', 'η/ηc'],
          ['400', '300', '0.18', '0.250', '0.72'],
          ['450', '300', '0.25', '0.333', '0.75'],
          ['500', '300', '0.32', '0.400', '0.80'],
          ['550', '300', '0.38', '0.455', '0.84'],
          ['600', '300', '0.43', '0.500', '0.86'],
        ];
        const rows = Math.ceil(data.length * Ease.out(t));
        const x0 = 70, y0 = 50, cw = 120, rh = 36;
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
        Equip.axes(ctx, 80, 50, 450, 280, 'T₁ (K)', '效率');
        const xMin = 380, xMax = 620, yMin = 0, yMax = 0.55;
        const toX = (x) => 80 + (x - xMin) / (xMax - xMin) * 450;
        const toY = (y) => 330 - (y - yMin) / (yMax - yMin) * 280;
        ctx.strokeStyle = '#7bc88a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(toX(xMin), toY(1 - 300 / xMin));
        ctx.lineTo(toX(xMax), toY(1 - 300 / xMax));
        ctx.stroke();
        ctx.fillStyle = '#ff4466';
        const pts = [[400, 0.18], [450, 0.25], [500, 0.32], [550, 0.38], [600, 0.43]];
        const showPts = Math.ceil(pts.length * Ease.out(t));
        for (let i = 0; i < Math.min(showPts, pts.length); i++) {
          ctx.beginPath();
          ctx.arc(toX(pts[i][0]), toY(pts[i][1]), 5, 0, Math.PI * 2);
          ctx.fill();
        }
        if (showPts >= pts.length) {
          ctx.fillStyle = '#7bc88a';
          ctx.font = '13px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('— ηc = 1-T₂/T₁ (卡诺上限)', 280, 70);
          ctx.fillStyle = '#ff4466';
          ctx.fillText('● η (实际测量)', 280, 92);
        }
        return;
      }

      if (step === 2) {
        ctx.fillStyle = '#e0e6ed';
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'left';
        const lines = [
          ['η/ηc 比值分析：', '#8b9bb4'],
          ['T₁=400K: η/ηc = 0.72', '#e0e6ed'],
          ['T₁=500K: η/ηc = 0.80', '#e0e6ed'],
          ['T₁=600K: η/ηc = 0.86', '#e0e6ed'],
          ['', null],
          ['温差越大 η/ηc 越高', '#00d4ff'],
          ['（高温下相对损失占比下降）', '#8b9bb4'],
          ['', null],
          ['损失来源：', '#8b9bb4'],
          ['• 活塞摩擦 (~10%)', '#ff4466'],
          ['• 气体漏泄 (~5%)', '#ff4466'],
          ['• 非等温传热 (~8%)', '#ff4466'],
        ];
        const showLines = Math.ceil(lines.length * Ease.out(t));
        for (let i = 0; i < Math.min(showLines, lines.length); i++) {
          if (!lines[i][0]) continue;
          ctx.fillStyle = lines[i][1];
          ctx.fillText(lines[i][0], 100, 50 + i * 28);
        }
      }
    }
  },
};