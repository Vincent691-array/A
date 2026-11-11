// 霍尔效应测磁场 - 动画模块
const HallEffectAnim = {
  info: '霍尔片通电流I置于磁场B中，洛伦兹力使载流子偏转产生霍尔电压U_H = R_H·IB/d = IB/(nqd)',

  principle: {
    steps: [
      { title: '霍尔效应现象', desc: '通有电流I的半导体片置于磁场B中（B⊥I），在垂直于I和B的方向产生霍尔电压U_H', duration: 3 },
      { title: '洛伦兹力偏转', desc: '载流子受洛伦兹力 F = qvB 向一侧偏转，积累形成横向电场', duration: 4 },
      { title: '电场力平衡', desc: '稳态时电场力 = 洛伦兹力：qE_H = qvB，霍尔电场 E_H = vB', duration: 4 },
      { title: '霍尔电压公式', desc: 'U_H = E_H·b = vB·b，代入v=I/(nqb)得 U_H = IB/(nqd) = R_H·IB/d', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;
      const pw = 200, ph = 100;

      // 霍尔片
      ctx.fillStyle = 'rgba(79,195,247,0.1)';
      ctx.strokeStyle = '#4fc3f7'; ctx.lineWidth = 2;
      ctx.fillRect(cx - pw/2, cy - ph/2, pw, ph);
      ctx.strokeRect(cx - pw/2, cy - ph/2, pw, ph);

      // 磁场方向（叉叉表示进入纸面）
      ctx.strokeStyle = '#7b2ff7'; ctx.lineWidth = 1.5;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const x = cx + i * 50, y = cy + j * 30;
          ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4); ctx.stroke();
        }
      }
      if (step >= 1) {
        ctx.fillStyle = '#7b2ff7'; ctx.font = '13px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('B (磁场⊗)', cx + pw/2 + 10, cy - ph/2);
      }

      // 电流方向
      if (step >= 0) {
        Equip.lightRay(ctx, cx - pw/2 - 60, cy, cx - pw/2, cy, '#ffeb3b');
        ctx.fillStyle = '#ffeb3b'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('I', cx - pw/2 - 30, cy - 10);
      }

      // 载流子偏转
      if (step >= 1) {
        const offset = Math.sin(t * Math.PI * 2) * 15;
        ctx.fillStyle = '#ff4466';
        for (let i = 0; i < 5; i++) {
          const px = cx - 60 + i * 30 + t * 20;
          const py = cy + offset - 20;
          if (px < cx + pw/2 - 10) {
            ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
          }
        }
        // 洛伦兹力箭头
        ctx.strokeStyle = '#ff4466'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - 40); ctx.stroke();
        ctx.fillStyle = '#ff4466';
        ctx.beginPath(); ctx.moveTo(cx, cy - 40); ctx.lineTo(cx - 5, cy - 32); ctx.lineTo(cx + 5, cy - 32); ctx.fill();
        Equip.label(ctx, cx, cy - 25, 'F = qvB', cx + 80, cy - 30, '#ff4466');
      }

      // 霍尔电压
      if (step >= 2) {
        const vH = 0.5 + Math.sin(t * Math.PI * 3) * 0.3;
        ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - ph/2);
        ctx.lineTo(cx + 60, cy - ph/2);
        ctx.lineTo(cx + 60, cy - ph/2 - 25);
        ctx.stroke();
        Equip.meter(ctx, cx + 60, cy - ph/2 - 40, 22, 'U_H', vH, 'mV');
        ctx.beginPath();
        ctx.moveTo(cx, cy + ph/2);
        ctx.lineTo(cx + 60, cy + ph/2);
        ctx.lineTo(cx + 60, cy - ph/2 - 63);
        ctx.stroke();
        ctx.fillStyle = '#00d4ff'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('霍尔电压', cx + 60, cy - ph/2 - 75);
      }

      if (step === 3) {
        ctx.fillStyle = '#ffd700'; ctx.font = 'bold 18px "Cambria Math", serif'; ctx.textAlign = 'center';
        ctx.fillText('U_H = R_H · I·B / d', cx, H - 20);
      }
    }
  },

  procedure: {
    steps: [
      { title: '连接电路', desc: '将霍尔片接入电路，工作电流I端接电源，霍尔电压端接电位差计', duration: 3 },
      { title: '放入磁场', desc: '将霍尔片放入电磁铁气隙中，使磁场B垂直于工作电流I方向', duration: 3 },
      { title: '调零读数', desc: '不加磁场时调零，加磁场后记录霍尔电压U_H和工作电流I', duration: 3 },
      { title: '改变电流测量', desc: '保持磁场不变，改变工作电流I（如10-50mA），记录对应U_H', duration: 3 },
      { title: '消除副效应', desc: '通过改变I和B的方向取四次测量平均，消除不等位电势等副效应', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2 + 20;
      const pw = 160, ph = 80;

      // 电磁铁
      ctx.strokeStyle = '#666'; ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 140, cy - 60); ctx.lineTo(cx - 90, cy - 60);
      ctx.lineTo(cx - 90, cy + 60); ctx.lineTo(cx - 140, cy + 60);
      ctx.moveTo(cx + 140, cy - 60); ctx.lineTo(cx + 90, cy - 60);
      ctx.lineTo(cx + 90, cy + 60); ctx.lineTo(cx + 140, cy + 60);
      ctx.stroke();
      ctx.fillStyle = '#7b2ff7'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('N', cx - 115, cy); ctx.fillText('S', cx + 115, cy);

      // 霍尔片
      ctx.fillStyle = 'rgba(79,195,247,0.2)'; ctx.strokeStyle = '#4fc3f7'; ctx.lineWidth = 2;
      ctx.fillRect(cx - pw/2, cy - ph/2, pw, ph); ctx.strokeRect(cx - pw/2, cy - ph/2, pw, ph);

      // 电流
      if (step >= 1) {
        Equip.lightRay(ctx, cx - pw/2 - 50, cy, cx - pw/2, cy, '#ffeb3b');
        ctx.fillStyle = '#ffeb3b'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('I', cx - pw/2 - 25, cy - 8);
      }

      // 电压表
      if (step >= 2) {
        const I = step >= 3 ? (10 + t * 40) : 10;
        const vH = I * 0.05;
        Equip.meter(ctx, cx + 80, cy - ph/2 - 30, 24, 'U_H', vH, 'mV');
        ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(cx, cy - ph/2); ctx.lineTo(cx + 80, cy - ph/2); ctx.lineTo(cx + 80, cy - ph/2 - 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy + ph/2); ctx.lineTo(cx + 80, cy + ph/2); ctx.lineTo(cx + 80, cy - ph/2 - 52); ctx.stroke();
      }

      // 显示电流
      if (step >= 3) {
        const I = (10 + t * 40).toFixed(0);
        ctx.fillStyle = '#ffd700'; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center';
        ctx.fillText(`I = ${I} mA`, cx, 30);
      }

      if (step === 0) { ctx.fillStyle = '#8b9bb4'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('连接霍尔片电路', cx, H - 15); }
      if (step === 1) { ctx.fillStyle = '#8b9bb4'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('放入电磁铁气隙', cx, H - 15); }
      if (step === 2) { ctx.fillStyle = '#7bc88a'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('调零并记录初始读数', cx, H - 15); }
      if (step === 3) { ctx.fillStyle = '#ffd700'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('改变I，记录U_H', cx, H - 15); }
      if (step === 4) { ctx.fillStyle = '#ff4466'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('改变I和B方向取四次平均', cx, H - 15); }
    }
  },

  data: {
    steps: [
      { title: '测量数据', desc: '记录不同工作电流I下的霍尔电压U_H', duration: 3 },
      { title: 'U_H-I拟合', desc: '作U_H-I图，直线斜率 k = R_H·B/d，由此求霍尔系数R_H', duration: 3 },
      { title: '计算磁场B', desc: '由已知R_H或标准样品标定，计算磁场B = U_H·d/(R_H·I)', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      if (step === 0) {
        const data = [['I (mA)','U_H (mV)'],['10','5.2'],['20','10.3'],['30','15.5'],['40','20.6'],['50','25.8']];
        const rows = Math.ceil(data.length * Ease.out(t));
        const x0=200,y0=60,cw=160,rh=38;
        for(let r=0;r<Math.min(rows,data.length);r++){for(let c=0;c<2;c++){const x=x0+c*cw,y=y0+r*rh;ctx.fillStyle=r===0?'#0a2a3d':'#0d1117';ctx.fillRect(x,y,cw,rh);ctx.strokeStyle='#1e2a4a';ctx.lineWidth=1;ctx.strokeRect(x,y,cw,rh);ctx.fillStyle=r===0?'#00d4ff':'#e0e6ed';ctx.font=r===0?'bold 14px sans-serif':'14px sans-serif';ctx.textAlign='center';ctx.fillText(data[r][c],x+cw/2,y+rh/2+5);}}
        return;
      }
      if (step === 1) {
        Equip.axes(ctx, 80, 40, 500, 320, 'I (mA)', 'U_H (mV)');
        const pts = [[10,5.2],[20,10.3],[30,15.5],[40,20.6],[50,25.8]];
        const toX = (x)=>80+x/60*500, toY=(y)=>360-y/30*320;
        ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(toX(0),toY(0)); ctx.lineTo(toX(60),toY(31.0)); ctx.stroke();
        const showPts = Math.ceil(pts.length * Ease.out(t));
        ctx.fillStyle = '#ff4466';
        for(let i=0;i<Math.min(showPts,pts.length);i++){ctx.beginPath();ctx.arc(toX(pts[i][0]),toY(pts[i][1]),5,0,Math.PI*2);ctx.fill();}
        ctx.fillStyle = '#ffd700'; ctx.font = '15px "Cambria Math", serif'; ctx.textAlign = 'left';
        ctx.fillText('k = 0.516 mV/mA', 320, 70);
        ctx.fillText('R² = 0.9998', 320, 95);
        return;
      }
      if (step === 2) {
        ctx.fillStyle='#e0e6ed';ctx.font='15px sans-serif';ctx.textAlign='left';
        const lines=[['k = R_H·B/d = 0.516 mV/mA','#e0e6ed'],['d = 0.5 mm, R_H = 4.0×10⁻⁴ m³/C','#e0e6ed'],['',''],['B = k·d/R_H = 0.645 T','#ffd700']];
        const showLines=Math.ceil(lines.length*Ease.out(t));
        for(let i=0;i<Math.min(showLines,lines.length);i++){if(!lines[i][0])continue;ctx.fillStyle=lines[i][1];ctx.font=lines[i][0].startsWith('B =')?'bold 18px sans-serif':'15px sans-serif';ctx.fillText(lines[i][0],100,70+i*40);}
      }
    }
  },
};