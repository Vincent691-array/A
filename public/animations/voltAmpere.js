// 伏安法测电阻 - 动画模块
const VoltAmpereAnim = {
  info: '根据欧姆定律 R = U/I，用电压表测电阻两端电压U，电流表测流过电流I，计算电阻R',

  principle: {
    steps: [
      { title: '欧姆定律', desc: '通过电阻的电流I与两端电压U成正比：U = IR，即 R = U/I', duration: 3 },
      { title: '电路设计', desc: '电源、开关、待测电阻串联，电压表并联测U，电流表串联测I', duration: 3 },
      { title: '电流表内接法', desc: '电流表内接：电压表读数 = R两端电压 + 电流表分压，适合测大电阻', duration: 4 },
      { title: '电流表外接法', desc: '电流表外接：电流表读数 = R的电流 + 电压表分流，适合测小电阻', duration: 4 },
      { title: '作图法求R', desc: '改变电压测多组(U,I)数据，作U-I图，直线斜率 k = R', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;

      if (step === 0) {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 28px "Cambria Math", serif';
        ctx.textAlign = 'center';
        ctx.fillText('U = I · R', cx, cy);
        ctx.font = '18px "Cambria Math", serif';
        ctx.fillStyle = '#00d4ff';
        ctx.fillText('R = U / I', cx, cy + 50);
        // 动画箭头
        const p = t * Math.PI * 2;
        ctx.strokeStyle = '#7bc88a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy + 100, 30, p, p + Math.PI * 1.5);
        ctx.stroke();
        return;
      }

      // 电路图 (步骤1-4)
      const drawCircuit = (external) => {
        const left = cx - 180, right = cx + 180, top = cy - 80, bot = cy + 80;
        // 串联回路
        Equip.wire(ctx, [[left, top], [right, top]]);
        Equip.wire(ctx, [[right, top], [right, bot]]);
        Equip.wire(ctx, [[left, bot], [right, bot]]);
        Equip.wire(ctx, [[left, top], [left, bot]]);
        // 电源（左中）
        Equip.battery(ctx, left, cy, 'E');
        // 开关（上中偏左）
        Equip.switch_(ctx, cx - 80, top, true);
        // 电阻（右中）
        Equip.resistor(ctx, right, cy - 40, right, 'R_x');

        if (external) {
          // 电流表外接：A在串联回路，V并联在R两端
          Equip.meter(ctx, cx + 40, bot, 28, 'A', 0.05, 'A');
          Equip.wire(ctx, [[cx + 100, cy - 40], [cx + 140, cy - 40], [cx + 140, cy + 20]]);
          Equip.meter(ctx, cx + 140, cy + 50, 25, 'V', 2.5, 'V');
          Equip.wire(ctx, [[cx + 140, cy + 80], [cx + 140, cy + 100], [right, cy + 100]]);
          Equip.wire(ctx, [[right, cy + 100], [right, bot]]);
        } else {
          // 电流表内接：A串联在R之前，V并联在A+R两端
          Equip.meter(ctx, cx + 40, cy - 40, 25, 'A', 0.05, 'A');
          Equip.meter(ctx, cx + 120, cy + 30, 25, 'V', 2.6, 'V');
          Equip.wire(ctx, [[cx + 120, cy], [cx + 120, cy + 5]]);
          Equip.wire(ctx, [[cx + 120, cy + 55], [cx + 120, cy + 80], [right, cy + 80]]);
        }
      };

      if (step === 1) {
        const p = Ease.out(t);
        ctx.globalAlpha = p;
        drawCircuit(true);
        ctx.globalAlpha = 1;
        return;
      }
      if (step === 2) { drawCircuit(false); ctx.fillStyle = '#ff4466'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('内接法（适合大电阻）', cx, H - 15); return; }
      if (step === 3) { drawCircuit(true); ctx.fillStyle = '#7bc88a'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('外接法（适合小电阻）', cx, H - 15); return; }
      if (step === 4) {
        // U-I 图
        Equip.axes(ctx, 80, 50, 400, 280, 'I (A)', 'U (V)');
        const pts = [[0.01, 0.50], [0.02, 1.00], [0.03, 1.50], [0.04, 2.00], [0.05, 2.50]];
        const toX = (x) => 80 + x / 0.06 * 400, toY = (y) => 330 - y / 3.0 * 280;
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(toX(0), toY(0));
        ctx.lineTo(toX(0.06), toY(3.0));
        ctx.stroke();
        const showPts = Math.ceil(pts.length * Ease.out(t));
        ctx.fillStyle = '#ff4466';
        for (let i = 0; i < Math.min(showPts, pts.length); i++) {
          ctx.beginPath();
          ctx.arc(toX(pts[i][0]), toY(pts[i][1]), 5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#ffd700';
        ctx.font = '15px "Cambria Math", serif';
        ctx.textAlign = 'left';
        ctx.fillText('斜率 k = R = 50.0 Ω', 320, 80);
      }
    }
  },

  procedure: {
    steps: [
      { title: '搭建电路', desc: '按电路图连接：电源→开关→电流表→电阻→回电源，电压表并联在电阻两端', duration: 3 },
      { title: '检查电路', desc: '检查接线无误，电表量程合适，滑动变阻器在最大阻值位置', duration: 2 },
      { title: '调节电压读数', desc: '闭合开关，调节滑动变阻器改变电压，依次读取电压U和电流I', duration: 4 },
      { title: '记录多组数据', desc: '取6-8组不同(U,I)值，电压从零逐步增大，记录在表格中', duration: 3 },
      { title: '断开整理', desc: '测量完毕断开开关，整理器材，准备数据处理', duration: 2 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;
      const left = cx - 180, right = cx + 180, top = cy - 80, bot = cy + 80;

      // 始终画电路
      Equip.wire(ctx, [[left, top], [right, top]]);
      Equip.wire(ctx, [[right, top], [right, bot]]);
      Equip.wire(ctx, [[left, bot], [right, bot]]);
      Equip.wire(ctx, [[left, top], [left, bot]]);
      Equip.battery(ctx, left, cy, 'E');
      Equip.switch_(ctx, cx - 80, top, step >= 2);
      Equip.resistor(ctx, right, cy - 40, right, 'R_x');
      Equip.meter(ctx, cx + 40, bot, 28, 'A', step >= 2 ? 0.05 * (1 + step * 0.3) : 0, 'A');
      Equip.meter(ctx, cx + 120, cy + 30, 25, 'V', step >= 2 ? 2.5 * (1 + step * 0.3) : 0, 'V');

      if (step === 0) {
        const p = Ease.out(t);
        ctx.fillStyle = '#00d4ff';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.globalAlpha = p;
        ctx.fillText('① 连接串联回路  ② 并联电压表', cx, H - 15);
        ctx.globalAlpha = 1;
      }
      if (step === 1) {
        ctx.fillStyle = '#ff4466';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('检查量程与接线极性', cx, H - 15);
      }
      if (step === 2) {
        const v = (2.5 + t * 1.5).toFixed(2);
        const i = (0.05 + t * 0.03).toFixed(3);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`U = ${v} V   I = ${i} A`, cx, H - 15);
      }
      if (step === 3) {
        ctx.fillStyle = '#7bc88a';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('逐点记录 (U, I) 数据', cx, H - 15);
      }
      if (step === 4) {
        ctx.fillStyle = '#8b9bb4';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('断开开关，整理器材', cx, H - 15);
      }
    }
  },

  data: {
    steps: [
      { title: '测量数据', desc: '记录各组电压U和电流I的对应值', duration: 3 },
      { title: 'U-I拟合求R', desc: '作U-I图线性拟合，斜率k = R，相关系数R²越接近1越好', duration: 3 },
      { title: '不确定度分析', desc: 'R的不确定度由U和I的测量不确定度合成', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      if (step === 0) {
        const data = [['U (V)', 'I (mA)', 'R (Ω)'], ['0.50', '10.0', '50.0'], ['1.00', '20.1', '49.8'], ['1.50', '29.9', '50.2'], ['2.00', '40.0', '50.0'], ['2.50', '50.1', '49.9']];
        const rows = Math.ceil(data.length * Ease.out(t));
        const x0 = 150, y0 = 60, cw = 160, rh = 38;
        for (let r = 0; r < Math.min(rows, data.length); r++) {
          for (let c = 0; c < 3; c++) {
            const x = x0 + c * cw, y = y0 + r * rh;
            ctx.fillStyle = r === 0 ? '#0a2a3d' : '#0d1117';
            ctx.fillRect(x, y, cw, rh);
            ctx.strokeStyle = '#1e2a4a'; ctx.lineWidth = 1; ctx.strokeRect(x, y, cw, rh);
            ctx.fillStyle = r === 0 ? '#00d4ff' : '#e0e6ed';
            ctx.font = r === 0 ? 'bold 14px sans-serif' : '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(data[r][c], x + cw / 2, y + rh / 2 + 5);
          }
        }
        return;
      }
      if (step === 1) {
        Equip.axes(ctx, 80, 40, 500, 320, 'I (A)', 'U (V)');
        const pts = [[0.01,0.50],[0.02,1.00],[0.03,1.50],[0.04,2.00],[0.05,2.50]];
        const toX = (x)=>80+x/0.06*500, toY=(y)=>360-y/3.0*320;
        ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(toX(0),toY(0)); ctx.lineTo(toX(0.06),toY(3.0)); ctx.stroke();
        const showPts = Math.ceil(pts.length * Ease.out(t));
        ctx.fillStyle = '#ff4466';
        for (let i=0;i<Math.min(showPts,pts.length);i++){ctx.beginPath();ctx.arc(toX(pts[i][0]),toY(pts[i][1]),5,0,Math.PI*2);ctx.fill();}
        ctx.fillStyle = '#ffd700'; ctx.font = '15px "Cambria Math", serif'; ctx.textAlign = 'left';
        ctx.fillText('U = 50.0·I', 320, 70);
        ctx.fillText('R² = 0.9999', 320, 95);
        ctx.fillText('R = 50.0 Ω', 320, 120);
        return;
      }
      if (step === 2) {
        ctx.fillStyle = '#e0e6ed'; ctx.font = '15px sans-serif'; ctx.textAlign = 'left';
        const lines = [['R = 50.0 Ω','#00d4ff'],['u_A(R) = 0.1 Ω','#8b9bb4'],['u_B ≈ 0.2 Ω','#8b9bb4'],['',''],['结果: R = 50.0 ± 0.2 Ω','#ffd700']];
        const showLines = Math.ceil(lines.length * Ease.out(t));
        for (let i=0;i<Math.min(showLines,lines.length);i++){if(!lines[i][0])continue;ctx.fillStyle=lines[i][1];ctx.font=lines[i][0].startsWith('结果')?'bold 18px sans-serif':'15px sans-serif';ctx.fillText(lines[i][0],120,70+i*40);}
      }
    }
  },
};