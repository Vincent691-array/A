// 杨氏模量测定（光杠杆法）- 动画模块
const YoungModulusAnim = {
  info: '用光杠杆法测量金属丝微小伸长，计算杨氏模量 E = (F·L)/(S·ΔL)，光杠杆将微小伸长放大2D/b倍',

  principle: {
    steps: [
      { title: '杨氏模量定义', desc: '材料在弹性限度内，应力σ=F/S与应变ε=ΔL/L成正比，比例系数E即杨氏模量', duration: 3 },
      { title: '光杠杆原理', desc: '光杠杆有三足，后足立在钢丝下端夹上。钢丝伸长ΔL使镜偏转α=ΔL/b角', duration: 4 },
      { title: '光杠杆放大', desc: '望远镜中标尺读数变化 n = 2α·D = 2D·ΔL/b，放大倍数 2D/b（通常约40-60倍）', duration: 4 },
      { title: '推导E公式', desc: '代入得 E = (F·L·2D)/(S·b·n)，其中F=mg, S=πd²/4', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      const cx = W / 2;

      if (step === 0) {
        ctx.fillStyle = '#ffd700'; ctx.font = 'bold 22px "Cambria Math", serif'; ctx.textAlign = 'center';
        ctx.fillText('σ = E · ε', cx, 100);
        ctx.fillStyle = '#00d4ff'; ctx.font = '18px "Cambria Math", serif';
        ctx.fillText('F/S = E · ΔL/L', cx, 140);
        ctx.fillStyle = '#e0e6ed'; ctx.font = '15px sans-serif';
        ctx.fillText('E = FL / (S·ΔL)', cx, 190);
        ctx.fillStyle = '#8b9bb4'; ctx.font = '13px sans-serif';
        ctx.fillText('F: 拉力  L: 原长  S: 截面积  ΔL: 伸长量', cx, 240);
        return;
      }

      // 光杠杆装置
      const drawSetup = (deltaL = 0) => {
        const topY = 60, wireBot = 300;
        // 支架顶部
        Equip.stand(ctx, cx - 200, H - 40, H - 100, { width: 60 });
        Equip.stand(ctx, cx + 200, H - 40, H - 100, { width: 60 });
        // 钢丝
        ctx.strokeStyle = '#ccc'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, topY); ctx.lineTo(cx, wireBot + deltaL); ctx.stroke();
        // 夹头
        ctx.fillStyle = '#888'; ctx.fillRect(cx - 15, wireBot + deltaL, 30, 12);
        // 砝码
        if (deltaL > 0) {
          ctx.fillStyle = '#444'; ctx.fillRect(cx - 20, wireBot + deltaL + 12, 40, 30);
          ctx.fillStyle = '#ffd700'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('m', cx, wireBot + deltaL + 30);
        }
        // 光杠杆（小镜）
        const mirrorY = wireBot + deltaL - 20;
        ctx.strokeStyle = '#4fc3f7'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx - 20, mirrorY + 15); ctx.lineTo(cx + 20, mirrorY); ctx.stroke();
        ctx.fillStyle = 'rgba(79,195,247,0.3)'; ctx.fillRect(cx - 20, mirrorY, 40, 15);
        // 望远镜和标尺
        Equip.label(ctx, cx + 200, mirrorY, '望远镜', cx + 200, mirrorY - 30, '#00d4ff');
        ctx.strokeStyle = '#8b9bb4'; ctx.lineWidth = 2;
        ctx.strokeRect(cx + 170, mirrorY - 10, 30, 20);
      };

      if (step === 1) {
        drawSetup();
        const p = Ease.out(t);
        // 标注b
        ctx.strokeStyle = '#ff4466'; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
        ctx.beginPath(); ctx.moveTo(cx - 20, 315); ctx.lineTo(cx + 20, 300); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ff4466'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
        ctx.globalAlpha = p;
        ctx.fillText('b (光杠杆臂长)', cx, 340);
        ctx.globalAlpha = 1;
        return;
      }
      if (step === 2) {
        const dl = t * 15;
        drawSetup(dl);
        // 光路
        ctx.strokeStyle = '#ffeb3b'; ctx.lineWidth = 1.5;
        ctx.setLineDash([5,3]);
        ctx.beginPath();
        ctx.moveTo(cx + 200, 285);
        ctx.lineTo(cx, 285 - dl * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ffd700'; ctx.font = '14px "Cambria Math", serif'; ctx.textAlign = 'center';
        ctx.fillText('n = 2D·ΔL/b', cx, H - 20);
        return;
      }
      if (step === 3) {
        drawSetup(10);
        ctx.fillStyle = '#ffd700'; ctx.font = 'bold 18px "Cambria Math", serif'; ctx.textAlign = 'center';
        ctx.fillText('E = 8mgLD / (πd²b·n)', cx, H - 20);
      }
    }
  },

  procedure: {
    steps: [
      { title: '安装装置', desc: '调节支架铅直，挂上钢丝+夹头+光杠杆+望远镜+标尺', duration: 3 },
      { title: '调节望远镜', desc: '调节目镜看清十字叉丝，调节物镜看清标尺像，使叉丝横线对准标尺刻度', duration: 3 },
      { title: '加初载读数', desc: '加1-2个砝码使丝拉直，记录初始标尺读数n₀', duration: 2 },
      { title: '逐次加码读数', desc: '每次加一个砝码（如200g），等稳定后读标尺读数nᵢ，共加6-8次', duration: 4 },
      { title: '减码读数', desc: '逐次减砝码读数，取加码和减码对应读数平均值以消除弹性滞后', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      const cx = W / 2;
      const masses = step >= 3 ? Math.floor(t * 6) + 1 : (step >= 2 ? 1 : 0);
      const deltaL = masses * 4;
      const topY = 60, wireBot = 280;

      Equip.stand(ctx, cx - 200, H - 40, H - 100, { width: 60 });
      Equip.stand(ctx, cx + 200, H - 40, H - 100, { width: 60 });
      ctx.strokeStyle = '#ccc'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, topY); ctx.lineTo(cx, wireBot + deltaL); ctx.stroke();
      ctx.fillStyle = '#888'; ctx.fillRect(cx - 15, wireBot + deltaL, 30, 12);
      for (let i = 0; i < masses; i++) {
        ctx.fillStyle = `rgba(68,68,68,${0.5 + i * 0.08})`;
        ctx.fillRect(cx - 22, wireBot + deltaL + 12 + i * 10, 44, 9);
      }
      const mirrorY = wireBot + deltaL - 20;
      ctx.strokeStyle = '#4fc3f7'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx - 20, mirrorY + 15); ctx.lineTo(cx + 20, mirrorY); ctx.stroke();
      ctx.strokeStyle = '#8b9bb4'; ctx.lineWidth = 2;
      ctx.strokeRect(cx + 170, mirrorY - 10, 30, 20);

      // 读数
      const reading = (5.00 + masses * 0.30).toFixed(2);
      ctx.fillStyle = '#00d4ff'; ctx.font = 'bold 18px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`n = ${reading} cm`, cx, 35);

      if (step === 0) { ctx.fillStyle = '#8b9bb4'; ctx.font = '13px sans-serif'; ctx.fillText('搭建光杠杆装置', cx, H - 15); }
      if (step === 1) { ctx.fillStyle = '#8b9bb4'; ctx.font = '13px sans-serif'; ctx.fillText('调节望远镜看清标尺', cx, H - 15); }
      if (step === 2) { ctx.fillStyle = '#7bc88a'; ctx.font = '13px sans-serif'; ctx.fillText('加初载使丝拉直，记n₀', cx, H - 15); }
      if (step === 3) { ctx.fillStyle = '#ffd700'; ctx.font = '13px sans-serif'; ctx.fillText(`逐次加砝码，已加 ${masses} 个`, cx, H - 15); }
      if (step === 4) { ctx.fillStyle = '#ff4466'; ctx.font = '13px sans-serif'; ctx.fillText('逐次减砝码，取平均消除滞后', cx, H - 15); }
    }
  },

  data: {
    steps: [
      { title: '逐差法处理', desc: '用逐差法处理数据：将数据分成两组，对应项相减求Δn，再取平均', duration: 3 },
      { title: '计算杨氏模量', desc: '代入 E = 8mgLD/(πd²b·n) 计算杨氏模量', duration: 3 },
      { title: '不确定度分析', desc: '由各测量量不确定度合成计算E的相对不确定度', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      if (step === 0) {
        const data = [['载荷(kg)','加码n(cm)','减码n(cm)','平均'],['0','5.00','5.02','5.01'],['1','5.30','5.32','5.31'],['2','5.61','5.63','5.62'],['3','5.90','5.92','5.91'],['4','6.21','6.23','6.22'],['5','6.51','6.53','6.52']];
        const rows = Math.ceil(data.length * Ease.out(t));
        const x0=80,y0=50,cw=110,rh=32;
        for(let r=0;r<Math.min(rows,data.length);r++){for(let c=0;c<4;c++){const x=x0+c*cw,y=y0+r*rh;ctx.fillStyle=r===0?'#0a2a3d':'#0d1117';ctx.fillRect(x,y,cw,rh);ctx.strokeStyle='#1e2a4a';ctx.lineWidth=1;ctx.strokeRect(x,y,cw,rh);ctx.fillStyle=r===0?'#00d4ff':'#e0e6ed';ctx.font=r===0?'bold 12px sans-serif':'12px sans-serif';ctx.textAlign='center';ctx.fillText(data[r][c],x+cw/2,y+rh/2+4);}}
        return;
      }
      if (step === 1) {
        ctx.fillStyle='#e0e6ed';ctx.font='15px sans-serif';ctx.textAlign='left';
        const lines=[['逐差: Δn = n₃-n₀ = 0.90 cm','#8b9bb4'],['',''],['L = 80.0 cm, D = 150.0 cm','#e0e6ed'],['d = 0.500 mm, b = 8.00 cm','#e0e6ed'],['m = 1 kg, g = 9.80 m/s²','#e0e6ed'],['',''],['E = 8mgLD/(πd²b·Δn)','#00d4ff'],['',''],['E = 2.01 × 10¹¹ N/m²','#ffd700']];
        const showLines=Math.ceil(lines.length*Ease.out(t));
        for(let i=0;i<Math.min(showLines,lines.length);i++){if(!lines[i][0])continue;ctx.fillStyle=lines[i][1];ctx.font=lines[i][0].startsWith('E =')&&i>5?'bold 18px sans-serif':'15px sans-serif';ctx.fillText(lines[i][0],100,50+i*30);}
        return;
      }
      if (step === 2) {
        ctx.fillStyle='#e0e6ed';ctx.font='15px sans-serif';ctx.textAlign='left';
        const lines=[['u(E)/E = √((u_L/L)²+(u_D/D)²+(2u_d/d)²+(u_b/b)²+(u_n/n)²)','#8b9bb4'],['≈ 3.2%','#8b9bb4'],['',''],['结果: E = (2.01 ± 0.06) × 10¹¹ N/m²','#ffd700']];
        const showLines=Math.ceil(lines.length*Ease.out(t));
        for(let i=0;i<Math.min(showLines,lines.length);i++){if(!lines[i][0])continue;ctx.fillStyle=lines[i][1];ctx.font=lines[i][0].startsWith('结果')?'bold 18px sans-serif':'15px sans-serif';ctx.fillText(lines[i][0],100,70+i*40);}
      }
    }
  },
};