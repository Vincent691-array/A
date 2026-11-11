// 声速测定（驻波法）v=fλ - 动画模块
const SoundSpeedAnim = {
  info: '用驻波法 v=fλ，超声波发射器发出声波，移动接收器找波腹位置求波长λ，乘频率f得声速v',

  principle: {
    steps: [
      { title: '超声波声场', desc: '超声换能器发射频率f的声波，在空气中传播形成行波，接收器处声压随位置变化', duration: 3 },
      { title: '反射形成驻波', desc: '声波在接收器表面反射，入射波与反射波叠加，形成驻波场', duration: 3 },
      { title: '波腹与波节', desc: '驻波振幅最大处为波腹（声压极大），振幅为零处为波节。相邻波腹间距=λ/2', duration: 4 },
      { title: '测波长求声速', desc: '移动接收器，相邻两次示波器振幅极大（波腹）的接收器位移=λ/2，声速 v=fλ', duration: 4 },
      { title: '温度修正', desc: '声速与温度有关：v=331.4+0.6T（T为摄氏温度），测量时记录室温', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      const y0 = H / 2;
      const x1 = 80, x2 = W - 80;

      let showWave = false, showStanding = false, showNode = false, showFormula = false, showTemp = false;
      if (step === 0) { showWave = true; }
      else if (step === 1) { showWave = true; showStanding = true; }
      else if (step === 2) { showStanding = true; showNode = true; }
      else if (step === 3) { showStanding = true; showNode = true; showFormula = true; }
      else if (step === 4) { showStanding = true; showFormula = true; showTemp = true; }

      // 发射器
      ctx.fillStyle = '#445566';
      ctx.fillRect(x1 - 20, y0 - 25, 30, 50);
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x1 - 20, y0 - 25, 30, 50);
      ctx.fillStyle = '#00d4ff';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('发射', x1 - 5, y0 + 4);

      // 接收器（可移动）
      const recvX = step >= 1 ? x2 - 30 - 20 * Math.sin(t * Math.PI) : x2 - 30;
      ctx.fillStyle = '#445566';
      ctx.fillRect(recvX, y0 - 25, 30, 50);
      ctx.strokeStyle = '#ff4466';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(recvX, y0 - 25, 30, 50);
      ctx.fillStyle = '#ff4466';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('接收', recvX + 15, y0 + 4);

      // 行波
      if (showWave && !showStanding) {
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = x1 + 10; x <= recvX; x += 2) {
          const y = y0 + 30 * Math.sin((x - x1) * 0.05 - t * Math.PI * 4);
          if (x === x1 + 10) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // 驻波
      if (showStanding) {
        const k = 0.08;
        const amp = 40 * (showNode ? 1 : 0.7);
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = x1 + 10; x <= recvX; x += 2) {
          const env = Math.abs(Math.sin(k * (x - x1)));
          const y = y0 + amp * env * Math.cos(t * Math.PI * 6);
          if (x === x1 + 10) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        // 包络线
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        for (let x = x1 + 10; x <= recvX; x += 2) {
          const y = y0 + amp * Math.abs(Math.sin(k * (x - x1)));
          if (x === x1 + 10) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.beginPath();
        for (let x = x1 + 10; x <= recvX; x += 2) {
          const y = y0 - amp * Math.abs(Math.sin(k * (x - x1)));
          if (x === x1 + 10) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 波腹波节标注
      if (showNode) {
        const k = 0.08;
        for (let x = x1 + 10; x <= recvX; x += 4) {
          const env = Math.abs(Math.sin(k * (x - x1)));
          if (env > 0.95) {
            ctx.fillStyle = '#ff4466';
            ctx.beginPath();
            ctx.arc(x, y0 - 55, 4, 0, Math.PI * 2);
            ctx.fill();
          } else if (env < 0.05) {
            ctx.fillStyle = '#7bc88a';
            ctx.beginPath();
            ctx.arc(x, y0 + 55, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.fillStyle = '#ff4466';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('● 波腹（声压极大）', x1 + 10, y0 - 70);
        ctx.fillStyle = '#7bc88a';
        ctx.fillText('● 波节（声压为零）', x1 + 10, y0 + 75);
        // λ/2 标注
        const halfLambda = Math.PI / k;
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x1 + 10, y0 + 90);
        ctx.lineTo(x1 + 10 + halfLambda, y0 + 90);
        ctx.stroke();
        ctx.fillStyle = '#ffd700';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('λ/2', x1 + 10 + halfLambda / 2, y0 + 105);
      }

      if (showFormula) {
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 18px "Cambria Math", serif';
        ctx.textAlign = 'center';
        ctx.fillText('v = f · λ', W / 2, 35);
      }
      if (showTemp) {
        ctx.fillStyle = '#ffd700';
        ctx.font = '14px "Cambria Math", serif';
        ctx.textAlign = 'center';
        ctx.fillText('v = 331.4 + 0.6T (m/s)', W / 2, H - 20);
      }
    }
  },

  procedure: {
    steps: [
      { title: '连接超声换能器', desc: '操作：将信号发生器接发射换能器，接收换能器接示波器Y通道，换能器面对面放置。\n原理：超声换能器（压电陶瓷）将电信号转为声波，频率取37kHz左右（换能器谐振频率）。\n注意：两换能器轴线对齐，间距约10cm；换能器表面不能触碰。', duration: 4 },
      { title: '调节谐振频率', desc: '操作：调节信号发生器频率，观察示波器振幅，使振幅最大（换能器谐振），记录频率f。\n原理：在谐振频率下换能器转换效率最高，声波最强，驻波波腹最明显。\n注意：谐振频率约37kHz，微调至振幅极大；频率稳定后不再改动。', duration: 4 },
      { title: '移动接收器找波腹', desc: '操作：缓慢移动接收器，示波器振幅周期性变化，记录连续振幅极大（波腹）时接收器位置x₁,x₂...\n原理：相邻波腹间距=λ/2，移动一个波腹相当于接收器移动λ/2。\n注意：用测微鼓轮缓慢单向移动，避免回程间隙；振幅极大判断要准确。', duration: 5 },
      { title: '计算波长与声速', desc: '操作：λ=2×(相邻波腹位置差)，v=fλ，测多组取平均。\n原理：驻波法中波腹间距精确等于半波长，多组平均减小读数误差。\n注意：至少测6个波腹位置，用逐差法处理数据。', duration: 4 },
      { title: '记录室温修正', desc: '操作：用温度计测室温T，按v=331.4+0.6T计算理论值，与测量值比较。\n原理：声速随温度升高而增大，每升高1℃声速增加0.6m/s。\n注意：温度计放在声场附近，等读数稳定再记录。', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;
      const y0 = H / 2;
      const x1 = 80, x2 = W - 80;

      if (step === 0) {
        const p = Ease.out(t);
        ctx.fillStyle = '#445566';
        ctx.fillRect(x1 - 20, y0 - 25, 30, 50);
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x1 - 20, y0 - 25, 30, 50);
        ctx.fillStyle = '#445566';
        ctx.fillRect(x2 - 10, y0 - 25, 30, 50);
        ctx.strokeStyle = '#ff4466';
        ctx.strokeRect(x2 - 10, y0 - 25, 30, 50);
        if (p > 0.5) {
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x1 + 15, y0);
          ctx.lineTo(x2 - 10, y0);
          ctx.stroke();
          ctx.fillStyle = '#ffd700';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('信号发生器→发射  接收→示波器', W / 2, H - 20);
        }
        return;
      }

      if (step === 1) {
        ctx.fillStyle = '#445566';
        ctx.fillRect(x1 - 20, y0 - 25, 30, 50);
        ctx.strokeStyle = '#00d4ff';
        ctx.strokeRect(x1 - 20, y0 - 25, 30, 50);
        ctx.fillStyle = '#445566';
        ctx.fillRect(x2 - 10, y0 - 25, 30, 50);
        ctx.strokeStyle = '#ff4466';
        ctx.strokeRect(x2 - 10, y0 - 25, 30, 50);
        const amp = 30 * (0.5 + 0.5 * Math.sin(t * Math.PI * 2));
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = x1 + 10; x <= x2 - 10; x += 2) {
          const y = y0 + amp * Math.sin((x - x1) * 0.05 - t * Math.PI * 4);
          if (x === x1 + 10) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`f = 37000 Hz`, W / 2, 35);
        ctx.fillStyle = '#ff4466';
        ctx.font = '13px sans-serif';
        ctx.fillText('调谐振：振幅最大', W / 2, H - 20);
        return;
      }

      if (step === 2) {
        ctx.fillStyle = '#445566';
        ctx.fillRect(x1 - 20, y0 - 25, 30, 50);
        ctx.strokeStyle = '#00d4ff';
        ctx.strokeRect(x1 - 20, y0 - 25, 30, 50);
        const recvX = x2 - 60 - 30 * Math.sin(t * Math.PI);
        ctx.fillStyle = '#445566';
        ctx.fillRect(recvX, y0 - 25, 30, 50);
        ctx.strokeStyle = '#ff4466';
        ctx.strokeRect(recvX, y0 - 25, 30, 50);
        const k = 0.08;
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = x1 + 10; x <= recvX; x += 2) {
          const y = y0 + 35 * Math.abs(Math.sin(k * (x - x1))) * Math.cos(t * Math.PI * 6);
          if (x === x1 + 10) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        const pos = (recvX - x1).toFixed(0);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`x = ${pos} mm`, W / 2, 35);
        ctx.fillStyle = '#ff4466';
        ctx.font = '12px sans-serif';
        ctx.fillText('移动接收器，找振幅极大', W / 2, H - 20);
        return;
      }

      if (step === 3) {
        const data = ['x₁=15.0', 'x₂=20.3', 'x₃=25.6', 'x₄=30.9'];
        ctx.fillStyle = '#e0e6ed';
        ctx.font = '14px monospace';
        ctx.textAlign = 'left';
        const showN = Math.ceil(data.length * Ease.out(t));
        for (let i = 0; i < Math.min(showN, data.length); i++) {
          ctx.fillText(data[i] + ' mm', 100, 70 + i * 30);
        }
        if (showN >= data.length) {
          ctx.fillStyle = '#00d4ff';
          ctx.font = 'bold 16px "Cambria Math", serif';
          ctx.fillText('λ = 2(x₂-x₁) = 10.6 mm', 100, 200);
          ctx.fillStyle = '#ffd700';
          ctx.font = 'bold 18px "Cambria Math", serif';
          ctx.fillText('v = fλ = 37000×0.0106 = 392 m/s', 100, 235);
        }
        return;
      }

      if (step === 4) {
        ctx.fillStyle = '#e0e6ed';
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'left';
        const lines = [
          ['室温 T = 20.0 °C', '#e0e6ed'],
          ['', null],
          ['理论值：v = 331.4 + 0.6×20 = 343.4 m/s', '#00d4ff'],
          ['测量值：v = 343.2 m/s', '#ffd700'],
          ['', null],
          ['相对误差：0.06%', '#7bc88a'],
        ];
        const showLines = Math.ceil(lines.length * Ease.out(t));
        for (let i = 0; i < Math.min(showLines, lines.length); i++) {
          if (!lines[i][0]) continue;
          ctx.fillStyle = lines[i][1];
          ctx.fillText(lines[i][0], 120, 70 + i * 35);
        }
      }
    }
  },

  data: {
    steps: [
      { title: '实验数据表', desc: '固定频率f，移动接收器记录连续波腹位置，计算波长和声速', duration: 3 },
      { title: '逐差法求波长', desc: '用逐差法处理波腹位置数据：λ=2×(x_{i+n}-x_i)/n，减小读数误差', duration: 3 },
      { title: '不确定度分析', desc: 'v 的相对不确定度：u(v)/v = √((u_f/f)² + (u_λ/λ)²)', duration: 3 },
    ],
    render(ctx, t, step, canvas) {
      const W = canvas.width, H = canvas.height;

      if (step === 0) {
        const data = [
          ['波腹i', '位置 xᵢ (mm)', 'f (Hz)', 'v (m/s)'],
          ['1', '15.0', '37000', '343.1'],
          ['2', '20.3', '37000', '343.1'],
          ['3', '25.6', '37000', '343.1'],
          ['4', '30.9', '37000', '343.1'],
          ['5', '36.2', '37000', '343.1'],
          ['6', '41.5', '37000', '343.1'],
        ];
        const rows = Math.ceil(data.length * Ease.out(t));
        const x0 = 80, y0 = 50, cw = 150, rh = 36;
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
          ['逐差法（n=3）：', '#8b9bb4'],
          ['Δx = (x₄-x₁)/3 = (30.9-15.0)/3 = 5.30 mm', '#e0e6ed'],
          ['Δx = (x₅-x₂)/3 = (36.2-20.3)/3 = 5.30 mm', '#e0e6ed'],
          ['Δx = (x₆-x₃)/3 = (41.5-25.6)/3 = 5.30 mm', '#e0e6ed'],
          ['', null],
          ['平均 Δx = 5.30 mm', '#00d4ff'],
          ['λ = 2·Δx = 10.60 mm', '#00d4ff'],
          ['', null],
          ['v = f·λ = 37000 × 0.01060 = 392.2 m/s', '#ffd700'],
          ['（注：示例数据，实际需校准f）', '#8b9bb4'],
        ];
        const showLines = Math.ceil(lines.length * Ease.out(t));
        for (let i = 0; i < Math.min(showLines, lines.length); i++) {
          if (!lines[i][0]) continue;
          ctx.fillStyle = lines[i][1];
          ctx.font = lines[i][0].startsWith('v =') ? 'bold 16px "Cambria Math", serif' : '15px sans-serif';
          ctx.fillText(lines[i][0], 100, 55 + i * 30);
        }
        return;
      }

      if (step === 2) {
        ctx.fillStyle = '#e0e6ed';
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'left';
        const lines = [
          ['f = 37000 ± 1 Hz', '#e0e6ed'],
          ['λ = 10.60 ± 0.05 mm', '#e0e6ed'],
          ['', null],
          ['v = f·λ = 392.2 m/s', '#00d4ff'],
          ['', null],
          ['u_f/f = 0.003%', '#8b9bb4'],
          ['u_λ/λ = 0.47%', '#8b9bb4'],
          ['u(v)/v = √((u_f/f)² + (u_λ/λ)²) = 0.47%', '#8b9bb4'],
          ['', null],
          ['结果: v = 392.2 ± 1.8 m/s', '#ffd700'],
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