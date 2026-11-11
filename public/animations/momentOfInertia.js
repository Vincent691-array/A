// 三线摆测转动惯量 I - 动画模块
const MomentOfInertiaAnim = {
  info: '用三线摆扭转振动周期公式 T=2π√(I/(mgh))，测周期T计算转动惯量I，其中 h=H（盘间距近似）',

  principle: {
    steps: [
      { title: '三线摆模型', desc: '上盘小、下盘大，三根等长细线对称悬挂，下盘可绕中心轴扭转振动', duration: 3 },
      { title: '扭转振动', desc: '将下盘扭转一个小角度释放，在悬线张力恢复力矩作用下往复扭转振动', duration: 3 },
      { title: '回复力矩', desc: '扭转角φ时，重力分量产生回复力矩 M = -mgRrφ/H，方向与φ相反', duration: 4 },
      { title: '周期公式', desc: '扭转运动方程 I·φ¨ = -mgRrφ/H，周期 T = 2π√(IH/(mgRr))', duration: 4 },
      { title: '推导I公式', desc: '解出 I = mgRrT²/(4π²H)，测量m、R、r、H、T即可求转动惯量', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      const cx = W / 2;
      const topY = 70, botY = H - 90;
      const topR = 50, botR = 130;

      let phi = 0, showFormula = false, showTorque = false, showI = false;
      const maxPhi = 0.25;

      if (step === 0) { phi = 0; }
      else if (step === 1) { phi = maxPhi * Ease.inOut(t); }
      else if (step === 2) { phi = maxPhi * Math.cos(t * Math.PI * 2 * 2); showTorque = true; }
      else if (step === 3) { phi = maxPhi * Math.cos(t * Math.PI * 2 * 3); showFormula = true; }
      else if (step === 4) { phi = maxPhi * Math.cos(t * Math.PI * 2 * 2); showI = true; }

      // 上盘
      ctx.fillStyle = '#445566';
      ctx.beginPath();
      ctx.ellipse(cx, topY, topR, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 下盘（扭转）
      ctx.save();
      ctx.translate(cx, botY);
      ctx.transform(Math.cos(phi), 0.15 * Math.sin(phi), 0, 1, 0, 0);
      ctx.fillStyle = '#3a4a5a';
      ctx.beginPath();
      ctx.ellipse(0, 0, botR, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // 下盘上的标记线（显示扭转）
      ctx.strokeStyle = '#ff4466';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-botR + 10, 0);
      ctx.lineTo(botR - 10, 0);
      ctx.stroke();
      ctx.restore();

      // 三根悬线
      for (let i = 0; i < 3; i++) {
        const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
        const tx = cx + topR * Math.cos(a);
        const ty = topY + 12 * Math.sin(a);
        const bx = cx + botR * Math.cos(a + phi);
        const by = botY + 18 * Math.sin(a + phi);
        Equip.string(ctx, tx, ty, bx, by, '#ccc');
      }

      // 中心轴虚线
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(cx, topY);
      ctx.lineTo(cx, botY + 30);
      ctx.stroke();
      ctx.setLineDash([]);

      // 扭转角标注
      if (step >= 1 && Math.abs(phi) > 0.02) {
        ctx.strokeStyle = '#ff4466';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, botY, 40, 0, phi);
        ctx.stroke();
        ctx.fillStyle = '#ff4466';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('φ', cx + 45, botY - 5);
      }

      // 回复力矩箭头
      if (showTorque) {
        const dir = phi > 0 ? -1 : 1;
        ctx.strokeStyle = '#ff4466';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, botY, botR + 20, phi, phi + dir * 0.5);
        ctx.stroke();
        ctx.fillStyle = '#ff4466';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('M = -mgRrφ/H', cx, botY + 45);
      }

      // 公式
      if (showFormula) {
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 18px "Cambria Math", serif';
        ctx.textAlign = 'center';
        ctx.fillText('T = 2π√(IH/(mgRr))', W / 2, H - 20);
      }
      if (showI) {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 20px "Cambria Math", serif';
        ctx.textAlign = 'center';
        ctx.fillText('I = mgRrT² / (4π²H)', W / 2, H - 20);
      }

      // 标注
      ctx.fillStyle = '#8b9bb4';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('上盘 r', cx, topY - 18);
      ctx.fillText('下盘 R', cx, botY + 38);
      if (step >= 3) {
        ctx.strokeStyle = '#7bc88a';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(cx + botR + 15, topY);
        ctx.lineTo(cx + botR + 15, botY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#7bc88a';
        ctx.textAlign = 'left';
        ctx.fillText('H', cx + botR + 20, (topY + botY) / 2);
      }
    }
  },

  procedure: {
    steps: [
      { title: '调平三线摆', desc: '操作：调节底座螺丝使下盘水平（用水准仪检查），三线等长。\n原理：盘不水平时重力分量会引入系统误差，等长保证对称扭转。\n注意：水准仪气泡居中即可；三线张力要均匀，不能有松线。', duration: 4 },
      { title: '测上下盘半径', desc: '操作：用游标卡尺测上盘三悬点所在圆半径r、下盘三悬点所在圆半径R。\n原理：R和r是公式中力臂参数，r是悬点到上盘中心距离，R是悬点到下盘中心距离。\n注意：测悬点孔中心距离再除以2√3/3换算为外接圆半径；测3个悬点取平均。', duration: 4 },
      { title: '测盘间距H', desc: '操作：用米尺测上下盘的垂直距离H（从上盘下表面到下盘上表面）。\n原理：H是悬线在竖直方向的投影长度，近似等于悬线长（小扭转角下）。\n注意：米尺竖直放置，视线垂直读数；H误差对I结果影响较大（I∝1/H）。', duration: 3 },
      { title: '放置待测物体', desc: '操作：将待测物体放于下盘中心，记录质量m（用天平称量）。\n原理：物体与下盘一起扭转，测出的是总转动惯量，减去空盘I₀得物体I。\n注意：物体重心必须在下盘中心轴上，否则会摆动而非纯扭转。', duration: 3 },
      { title: '测扭转周期T', desc: '操作：轻扭下盘一小角度释放，等稳定后过平衡位置开始计时，数50次全振动记总时间t，T=t/50。\n原理：在平衡位置（角速度最大）计时误差最小，与单摆同理。\n注意：扭转角<10°；重复3次取平均；空盘和载物各测一次。', duration: 5 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      const cx = W / 2;
      const topY = 70, botY = H - 90;
      const topR = 45, botR = 120;

      if (step === 0) {
        const p = Ease.out(t);
        ctx.fillStyle = '#445566';
        ctx.beginPath();
        ctx.ellipse(cx, topY, topR, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        const tilt = (1 - p) * 0.08;
        ctx.save();
        ctx.translate(cx, botY);
        ctx.rotate(tilt);
        ctx.fillStyle = '#3a4a5a';
        ctx.beginPath();
        ctx.ellipse(0, 0, botR, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
        for (let i = 0; i < 3; i++) {
          const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
          Equip.string(ctx, cx + topR * Math.cos(a), topY, cx + botR * Math.cos(a), botY, '#ccc');
        }
        if (p > 0.5) {
          ctx.fillStyle = '#00d4ff';
          ctx.font = '13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('水准仪 ✓', cx, botY + 35);
        }
        return;
      }

      if (step === 1) {
        ctx.fillStyle = '#445566';
        ctx.beginPath();
        ctx.ellipse(cx, topY, topR, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3a4a5a';
        ctx.beginPath();
        ctx.ellipse(cx, botY, botR, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        for (let i = 0; i < 3; i++) {
          const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
          Equip.string(ctx, cx + topR * Math.cos(a), topY, cx + botR * Math.cos(a), botY, '#ccc');
        }
        const showR = t > 0.3;
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, botY);
        ctx.lineTo(cx + botR, botY);
        ctx.stroke();
        ctx.fillStyle = '#ffd700';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('R', cx + botR / 2, botY - 8);
        if (showR) {
          ctx.beginPath();
          ctx.moveTo(cx, topY);
          ctx.lineTo(cx + topR, topY);
          ctx.stroke();
          ctx.fillText('r', cx + topR / 2, topY + 16);
        }
        ctx.fillStyle = '#7bc88a';
        ctx.font = '12px sans-serif';
        ctx.fillText('游标卡尺', cx, H - 15);
        return;
      }

      if (step === 2) {
        ctx.fillStyle = '#445566';
        ctx.beginPath();
        ctx.ellipse(cx, topY, topR, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3a4a5a';
        ctx.beginPath();
        ctx.ellipse(cx, botY, botR, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 3; i++) {
          const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
          Equip.string(ctx, cx + topR * Math.cos(a), topY, cx + botR * Math.cos(a), botY, '#ccc');
        }
        const rulerX = cx + botR + 25;
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(rulerX, topY);
        ctx.lineTo(rulerX, botY);
        ctx.stroke();
        for (let y = topY; y <= botY; y += 10) {
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(rulerX, y);
          ctx.lineTo(rulerX - ((y - topY) % 50 === 0 ? 10 : 5), y);
          ctx.stroke();
        }
        ctx.fillStyle = '#ffd700';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('H', rulerX + 8, (topY + botY) / 2);
        ctx.fillText('米尺', rulerX + 8, topY - 5);
        return;
      }

      if (step === 3) {
        ctx.fillStyle = '#445566';
        ctx.beginPath();
        ctx.ellipse(cx, topY, topR, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3a4a5a';
        ctx.beginPath();
        ctx.ellipse(cx, botY, botR, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 3; i++) {
          const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
          Equip.string(ctx, cx + topR * Math.cos(a), topY, cx + botR * Math.cos(a), botY, '#ccc');
        }
        const p = Ease.out(t);
        const objR = 35 * p;
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(cx, botY - 5, objR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ff4466';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        if (p > 0.8) {
          ctx.fillStyle = '#ff4466';
          ctx.font = '13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('待测物体 m', cx, botY - 5);
        }
        return;
      }

      if (step === 4) {
        const phi = 0.2 * Math.cos(t * Math.PI * 2 * 4);
        ctx.fillStyle = '#445566';
        ctx.beginPath();
        ctx.ellipse(cx, topY, topR, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.translate(cx, botY);
        ctx.transform(Math.cos(phi), 0.15 * Math.sin(phi), 0, 1, 0, 0);
        ctx.fillStyle = '#3a4a5a';
        ctx.beginPath();
        ctx.ellipse(0, 0, botR, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
        for (let i = 0; i < 3; i++) {
          const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
          Equip.string(ctx, cx + topR * Math.cos(a), topY, cx + botR * Math.cos(a + phi), botY, '#ccc');
        }
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(cx, botY - 5, 30, 0, Math.PI * 2);
        ctx.fill();
        const count = Math.floor(t * 50);
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`n = ${count}/50`, W / 2, 40);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(`⏱ ${(t * 100).toFixed(1)}s`, W / 2, H - 20);
      }
    }
  },

  data: {
    steps: [
      { title: '实验数据表', desc: '改变下盘上物体质量，测量对应的扭转周期，记录数据', duration: 3 },
      { title: '计算转动惯量', desc: '用 I = mgRrT²/(4π²H) 直接计算各组数据的I值', duration: 3 },
      { title: '不确定度分析', desc: 'I 的相对不确定度：u(I)/I = √((u_m/m)² + (2u_T/T)²)', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;

      if (step === 0) {
        const data = [
          ['m (kg)', 'T (s)', 'T² (s²)', 'I (kg·m²)'],
          ['0.500', '1.420', '2.016', '0.0103'],
          ['1.000', '2.010', '4.040', '0.0412'],
          ['1.500', '2.460', '6.052', '0.0927'],
          ['2.000', '2.840', '8.066', '0.1653'],
          ['2.500', '3.180', '10.112', '0.2589'],
        ];
        const rows = Math.ceil(data.length * Ease.out(t));
        const x0 = 100, y0 = 60, cw = 150, rh = 38;
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
          ['R = 100 mm,  r = 50 mm,  H = 500 mm', '#e0e6ed'],
          ['', null],
          ['计算公式：', '#8b9bb4'],
          ['I = mgRrT² / (4π²H)', '#00d4ff'],
          ['', null],
          ['示例（m=1.0 kg, T=2.01 s）：', '#8b9bb4'],
          ['I = 1.0×9.8×0.1×0.05×2.01² / (4π²×0.5)', '#e0e6ed'],
          ['  = 0.0412 kg·m²', '#ffd700'],
        ];
        const showLines = Math.ceil(lines.length * Ease.out(t));
        for (let i = 0; i < Math.min(showLines, lines.length); i++) {
          if (!lines[i][0]) continue;
          ctx.fillStyle = lines[i][1];
          ctx.font = lines[i][0].startsWith('  =') ? 'bold 16px "Cambria Math", serif' : '15px sans-serif';
          ctx.fillText(lines[i][0], 100, 60 + i * 30);
        }
        return;
      }

      if (step === 2) {
        ctx.fillStyle = '#e0e6ed';
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'left';
        const lines = [
          ['m = 1.000 ± 0.001 kg', '#e0e6ed'],
          ['T = 2.010 ± 0.010 s', '#e0e6ed'],
          ['', null],
          ['I = mgRrT²/(4π²H) = 0.0412 kg·m²', '#00d4ff'],
          ['', null],
          ['u_m/m = 0.1%', '#8b9bb4'],
          ['u_T/T = 0.5%', '#8b9bb4'],
          ['u(I)/I = √((u_m/m)² + (2u_T/T)²) = 1.0%', '#8b9bb4'],
          ['', null],
          ['结果: I = 0.0412 ± 0.0004 kg·m²', '#ffd700'],
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