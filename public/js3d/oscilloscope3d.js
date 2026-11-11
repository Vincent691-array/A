// 3D示波器原理与应用（李萨如图形测频率）- 原理+操作阶段
import * as THREE from 'three';

const metalMat = () => new THREE.MeshStandardMaterial({ color: 0x445566, metalness: 0.7, roughness: 0.3 });

function makeOscilloscope(THREE) {
  const g = new THREE.Group();
  const m = metalMat();

  const body = new THREE.Mesh(new THREE.BoxGeometry(4, 2.5, 2), m);
  body.position.y = 1.25; body.castShadow = true; body.receiveShadow = true; g.add(body);

  const screenMat = new THREE.MeshStandardMaterial({ color: 0x001100, emissive: 0x002200, roughness: 0.2 });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.8), screenMat);
  screen.position.set(0, 1.5, 1.01);
  g.add(screen);

  const bezel = new THREE.Mesh(new THREE.RingGeometry(0, 1.8, 4), new THREE.MeshStandardMaterial({ color: 0x222222 }));
  bezel.position.set(0, 1.5, 1.005);
  bezel.scale.set(1.1, 0.65, 1);
  g.add(bezel);

  const knobMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.3 });
  for (let i = 0; i < 4; i++) {
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16), knobMat);
    knob.rotation.x = Math.PI / 2;
    knob.position.set(-1.5 + i * 1.0, 0.4, 1.01);
    g.add(knob);
  }

  return { group: g, screen };
}

export const Oscilloscope3D = {
  info: '示波器显示李萨如图形，由 X/Y 切点数比 n_x:n_y 求 X 轴频率 f_x = f_y · n_y / n_x',

  principle: {
    steps: [
      { title: '示波器结构', desc: '示波器由示波管、Y偏转系统、X偏转系统、扫描电路组成。3D可拖拽查看示波器外形', duration: 4 },
      { title: '波形显示原理', desc: 'Y轴加待测信号，X轴加锯齿扫描电压，光点在屏上画出信号随时间变化的波形', duration: 4 },
      { title: '李萨如图形', desc: 'X和Y轴都加正弦信号（关闭扫描），屏上出现李萨如图形，形状取决于频率比和相位差', duration: 4 },
      { title: '频率比与切点', desc: 'f_x/f_y = n_y/n_x，n_x为图形与X轴切点数，n_y为与Y轴切点数', duration: 4 },
      { title: '求未知频率', desc: '已知Y轴标准频率f_y，数切点n_x、n_y，则 f_x = f_y · n_y / n_x', duration: 3 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);
      const parts = makeOscilloscope(THREE);
      group.add(parts.group);

      const traceMat = new THREE.LineBasicMaterial({ color: 0x00ff66, linewidth: 2 });
      const traceGeo = new THREE.BufferGeometry();
      const N = 200;
      traceGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
      const trace = new THREE.Line(traceGeo, traceMat);
      trace.position.set(0, 1.5, 1.02);
      group.add(trace);

      return {
        group, trace, N,
        dispose() {
          scene.remove(group);
          group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
        }
      };
    },
    update(refs, t, step, ctx) {
      const { trace, N } = refs;
      const pos = trace.geometry.attributes.position.array;

      if (step === 0) {
        const ang = t * Math.PI * 0.25;
        ctx.camera.position.set(5 * Math.cos(ang + 0.5), 3, 5 * Math.sin(ang + 0.5));
        ctx.controls.target.set(0, 1.5, 0);
      }

      let nx = 1, ny = 1, phase = 0;
      if (step === 0 || step === 1) {
        for (let i = 0; i < N; i++) {
          const x = -1.5 + 3 * i / (N - 1);
          const y = 0.7 * Math.sin(x * 4 - t * Math.PI * 4);
          pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = 0;
        }
      } else {
        if (step === 2) { nx = 1; ny = 1; }
        else if (step === 3) { const ratios = [[1,1],[1,2],[2,1],[2,3]]; const r = ratios[Math.floor(t * 4) % 4]; nx = r[0]; ny = r[1]; }
        else if (step === 4) { nx = 1; ny = 2; }
        phase = t * Math.PI;
        for (let i = 0; i < N; i++) {
          const tt = (i / N) * Math.PI * 2;
          pos[i * 3] = 1.3 * Math.sin(ny * tt + phase);
          pos[i * 3 + 1] = 0.75 * Math.sin(nx * tt);
          pos[i * 3 + 2] = 0;
        }
      }
      trace.geometry.attributes.position.needsUpdate = true;
    },
  },

  procedure: {
    steps: [
      { title: '开启示波器调基线', desc: '操作：开机预热，将X和Y输入接地，调亮度和聚焦，调X和Y位移使光点在屏中央。\n原理：无信号时示波器显示一个光点（或一条扫描基线），调到中央作为基准。\n注意：亮度不要太大（烧坏荧光屏）；预热15分钟使电路稳定。', duration: 4 },
      { title: 'Y轴输入信号', desc: '操作：将待测信号接入Y输入，调节Y衰减和扫描时间使屏上显示2~3个完整波形。\n原理：Y轴信号经放大加到垂直偏转板，X轴锯齿扫描使光点水平移动，合成波形。\n注意：波形要稳定不滚动（调触发电平）；幅度不超出屏范围。', duration: 4 },
      { title: '关闭扫描切X-Y模式', desc: '操作：将扫描切换到X-Y模式（或X输入接标准信号），此时X轴不再扫描而是显示X输入信号。\n原理：X-Y模式下两路信号在屏上合成李萨如图形，形状由频率比和相位差决定。\n注意：确认扫描关闭；X和Y输入都要接信号。', duration: 3 },
      { title: '接入标准信号', desc: '操作：Y轴接已知频率f_y的标准信号（如100Hz），X轴接待测信号f_x，屏上出现李萨如图形。\n原理：标准信号提供频率基准，待测信号与基准比较即可求未知频率。\n注意：标准信号频率要准确（用信号发生器）；两路信号幅度适中。', duration: 3 },
      { title: '数切点求频率', desc: '操作：数图形与X轴切点数n_x和与Y轴切点数n_y，代入 f_x=f_y·n_y/n_x 求未知频率。\n原理：切点数比等于频率反比，这是李萨如图形测频率的核心原理。\n注意：切点要数准（图形与水平/垂直线的切点）；换不同频率比多测几组验证。', duration: 4 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);
      const parts = makeOscilloscope(THREE);
      group.add(parts.group);

      const traceMat = new THREE.LineBasicMaterial({ color: 0x00ff66, linewidth: 2 });
      const traceGeo = new THREE.BufferGeometry();
      const N = 200;
      traceGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
      const trace = new THREE.Line(traceGeo, traceMat);
      trace.position.set(0, 1.5, 1.02);
      group.add(trace);

      return {
        group, trace, N,
        dispose() {
          scene.remove(group);
          group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
        }
      };
    },
    update(refs, t, step, ctx) {
      const { trace, N } = refs;
      const pos = trace.geometry.attributes.position.array;

      if (step === 0) {
        for (let i = 0; i < N; i++) { pos[i * 3] = 0; pos[i * 3 + 1] = 0; pos[i * 3 + 2] = 0; }
      } else if (step === 1) {
        for (let i = 0; i < N; i++) {
          const x = -1.5 + 3 * i / (N - 1);
          const y = 0.7 * Math.sin(x * 4 - t * Math.PI * 4);
          pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = 0;
        }
      } else {
        const ratios = [[1,1],[1,2],[2,1],[2,3],[3,2]];
        const r = ratios[Math.min(step - 2, 4)];
        const phase = t * Math.PI;
        for (let i = 0; i < N; i++) {
          const tt = (i / N) * Math.PI * 2;
          pos[i * 3] = 1.3 * Math.sin(r[1] * tt + phase);
          pos[i * 3 + 1] = 0.75 * Math.sin(r[0] * tt);
          pos[i * 3 + 2] = 0;
        }
      }
      trace.geometry.attributes.position.needsUpdate = true;
    },
  },
  data: null,
};