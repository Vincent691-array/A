// 3D霍尔效应测磁场 — B⊥I（B沿z，I沿x，U_H沿y）
import * as THREE from 'three';

const mat = (c, m = 0.6, r = 0.2) => new THREE.MeshStandardMaterial({ color: c, metalness: m, roughness: r });

const makeLabel = (THREE, text, color) => {
  const c = document.createElement('canvas'); c.width = 128; c.height = 64;
  const cx = c.getContext('2d');
  cx.fillStyle = '#' + color.toString(16).padStart(6, '0');
  cx.font = 'bold 40px sans-serif'; cx.textAlign = 'center';
  cx.fillText(text, 64, 48);
  const tex = new THREE.CanvasTexture(c);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
  sp.scale.set(0.6, 0.3, 1);
  return sp;
};

export const HallEffect3D = {
  info: '霍尔片通电流I置于磁场B中，洛伦兹力使载流子偏转产生霍尔电压U_H = R_H·IB/d = IB/(nqd)',

  principle: {
    steps: [
      { title: '霍尔效应现象', desc: '通有电流I的半导体片置于磁场B中（B⊥I），在垂直于I和B的方向产生霍尔电压U_H。3D视角可旋转查看', duration: 4 },
      { title: '洛伦兹力偏转', desc: '载流子受洛伦兹力 F = qv×B 向一侧偏转，积累形成横向电场。I沿x、B沿z时，F沿y方向', duration: 4 },
      { title: '电场力平衡', desc: '稳态时电场力 = 洛伦兹力：qE_H = qvB，霍尔电场 E_H = vB', duration: 4 },
      { title: '霍尔电压公式', desc: 'U_H = E_H·b = vB·b，代入v=I/(nqb)得 U_H = IB/(nqd) = R_H·IB/d', duration: 3 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);

      // 霍尔片竖直放置：x长3(电流I) × y宽1.5(霍尔电压U_H) × z薄0.15(磁场B穿过)
      const hall = new THREE.Mesh(new THREE.BoxGeometry(3, 1.5, 0.15), mat(0x4fc3f7, 0.3, 0.3));
      hall.position.y = 1.5; hall.castShadow = true; hall.receiveShadow = true;
      group.add(hall);

      // 电磁铁N极（前方z负方向）→ 磁场B沿z正方向，穿过霍尔片
      const nPole = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3, 0.8), mat(0xff4444, 0.5, 0.4));
      nPole.position.set(0, 1.5, -2.2); nPole.castShadow = true;
      group.add(nPole);
      const lbN = makeLabel(THREE, 'N', 0xff4444); lbN.position.set(0, 1.5, -2.8); group.add(lbN);
      // S极（后方z正方向）
      const sPole = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3, 0.8), mat(0x4444ff, 0.5, 0.4));
      sPole.position.set(0, 1.5, 2.2); sPole.castShadow = true;
      group.add(sPole);
      const lbS = makeLabel(THREE, 'S', 0x4444ff); lbS.position.set(0, 1.5, 2.8); group.add(lbS);

      // 磁场线（B沿z正方向，从N到S穿过霍尔片）
      const fieldArrows = [];
      for (let i = 0; i < 5; i++) {
        const y = 0.5 + i * 0.5;
        const arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, y, -1.5), 3, 0x7b2ff7, 0.2, 0.1);
        group.add(arrow);
        fieldArrows.push(arrow);
      }

      // 电流箭头（I沿x方向）
      const currentArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(-2, 1.5, 0), 4, 0xffeb3b, 0.25, 0.15);
      group.add(currentArrow);
      const lbI = makeLabel(THREE, 'I', 0xffeb3b); lbI.position.set(-2.5, 1.5, 0.5); group.add(lbI);

      // 载流子（小球，沿x方向运动，y方向偏转）
      const carriers = [];
      for (let i = 0; i < 10; i++) {
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), new THREE.MeshStandardMaterial({ color: 0xff4466, emissive: 0x440000 }));
        c.position.set(-1.5 + i * 0.3, 1.5, 0);
        c.visible = false;
        group.add(c);
        carriers.push(c);
      }

      // 霍尔电压表（上方）
      const meter = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.15, 24), mat(0x1a1a2e));
      meter.position.set(0, 3.4, 0); meter.rotation.x = Math.PI / 2;
      group.add(meter);
      const meterFace = new THREE.Mesh(new THREE.CircleGeometry(0.25, 24), new THREE.MeshBasicMaterial({ color: 0x00d4ff }));
      meterFace.position.set(0, 3.4, 0.08);
      group.add(meterFace);
      // 电压表连线（从霍尔片y方向上侧引出到电压表）
      const wireMat = new THREE.MeshStandardMaterial({ color: 0x00d4ff, metalness: 0.8 });
      for (const x of [-0.5, 0.5]) {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 8), wireMat);
        w.position.set(x, 2.7, 0);
        group.add(w);
      }

      // 洛伦兹力箭头（F沿y方向，v×B = x×z = -y，对正电荷向下偏转）
      const lorentzArrow = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1.5, 0), 0.8, 0xff4466, 0.2, 0.12);
      lorentzArrow.visible = false;
      group.add(lorentzArrow);
      const lbF = makeLabel(THREE, 'F洛', 0xff4466); lbF.position.set(0.6, 1.0, 0); lbF.visible = false; group.add(lbF);

      return {
        group, hall, carriers, lorentzArrow, currentArrow, fieldArrows, meterFace, lbF,
        dispose() { scene.remove(group); group.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } }); }
      };
    },
    update(refs, t, step, ctx) {
      const { carriers, lorentzArrow, meterFace, fieldArrows, lbF } = refs;

      if (step === 0) {
        const ang = t * Math.PI * 0.3;
        ctx.camera.position.set(7 * Math.cos(ang + 0.5), 4, 7 * Math.sin(ang + 0.5));
        ctx.controls.target.set(0, 1.5, 0);
        carriers.forEach(c => c.visible = false);
        lorentzArrow.visible = false;
        lbF.visible = false;
        fieldArrows.forEach(a => a.visible = false);
      } else {
        fieldArrows.forEach(a => a.visible = true);
      }

      if (step >= 1) {
        // 载流子沿x运动，y方向偏转（洛伦兹力 F=qv×B，v沿x，B沿z，F沿-y）
        carriers.forEach((c, i) => {
          c.visible = true;
          const prog = (t * 1.5 + i / carriers.length) % 1;
          c.position.x = -1.5 + prog * 3;
          const deflect = step >= 2 ? -0.3 * Math.sin(prog * Math.PI) : 0;
          c.position.y = 1.5 + deflect;
        });
        lorentzArrow.visible = step >= 1;
        lorentzArrow.position.set(0, 1.5, 0);
        lbF.visible = step >= 1;
      }

      if (step >= 2) {
        const vH = 0.5 + Math.sin(t * Math.PI * 3) * 0.3;
        meterFace.scale.set(0.8 + vH * 0.2, 0.8 + vH * 0.2, 1);
      }
    },
  },

  procedure: {
    steps: [
      { title: '连接电路', desc: '操作：霍尔片有4个引脚，工作电流端（红色）接直流电源，霍尔电压端（蓝色）接电位差计/数字万用表。\n原理：工作电流I沿霍尔片长度方向流过，霍尔电压U_H在宽度方向产生（垂直于I和B）。\n注意：电流端和电压端不能接反（接反测不到霍尔电压）；工作电流不超过额定值（通常<50mA）避免发热。', duration: 5 },
      { title: '放入磁场', desc: '操作：将霍尔片置于电磁铁气隙中央，使磁场B方向垂直于工作电流I方向，且垂直于霍尔片平面。\n原理：霍尔电压 U_H = R_H·IB/d，B⊥I时U_H最大，B∥I时U_H=0。\n注意：霍尔片要在气隙正中（磁场最均匀处）；记录磁铁电流以便查B-I曲线得B值。', duration: 4 },
      { title: '调零读数', desc: '操作：不加磁场（断开磁铁电源）时调电位差计零点，确认U_H≈0；再加磁场记录U_H和工作电流I。\n原理：不加磁场时U_H应为0，若有读数说明有不等位电势（副效应），调零可部分消除。\n注意：电位差计测微小电压（mV级），灵敏度要高；调零后整个测量过程不再调。', duration: 4 },
      { title: '改变电流测量', desc: '操作：保持磁场B不变，改变工作电流I（如10、20、30、40、50mA），记录对应U_H。\n原理：B不变时 U_H ∝ I，作 U_H-I 图应为过原点直线，斜率 = R_H·B/d，可求霍尔系数 R_H。\n注意：每次改电流后等读数稳定再记；电流不要超额定；U_H和I同时读取。', duration: 4 },
      { title: '消除副效应（关键）', desc: '操作：对每组(I,B)，改变I方向和B方向共四次测量（+I+B、+I-B、-I+B、-I-B），取 U_H = (U₁+U₂+U₃+U₄)/4。\n原理：霍尔电压随I、B反向而反向，但厄廷好森效应、能斯特效应等副效应不全部反向，四次平均可消除大部分副效应。\n注意：这是霍尔效应实验最关键的数据处理步骤；不消副效应 R_H 误差可达几十个百分点。', duration: 5 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);
      // 电磁铁（z方向，B⊥I）
      const nPole = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3, 0.8), mat(0xff4444, 0.5, 0.4));
      nPole.position.set(0, 1.5, -2.2); group.add(nPole);
      const sPole = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3, 0.8), mat(0x4444ff, 0.5, 0.4));
      sPole.position.set(0, 1.5, 2.2); group.add(sPole);
      const lbN = makeLabel(THREE, 'N', 0xff4444); lbN.position.set(0, 1.5, -2.8); group.add(lbN);
      const lbS = makeLabel(THREE, 'S', 0x4444ff); lbS.position.set(0, 1.5, 2.8); group.add(lbS);
      // 霍尔片（竖直，z薄）
      const hall = new THREE.Mesh(new THREE.BoxGeometry(3, 1.5, 0.15), mat(0x4fc3f7, 0.3, 0.3));
      hall.position.y = 1.5; group.add(hall);
      // 电流箭头（I沿x）
      const currentArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(-2, 1.5, 0), 4, 0xffeb3b, 0.25, 0.15);
      group.add(currentArrow);
      // 磁场箭头（B沿z）
      const fieldArrows = [];
      for (let i = 0; i < 3; i++) {
        const y = 0.8 + i * 0.7;
        const arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, y, -1.5), 3, 0x7b2ff7, 0.2, 0.1);
        group.add(arrow); fieldArrows.push(arrow);
      }
      // 电压表
      const meter = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.15, 24), mat(0x1a1a2e));
      meter.position.set(0, 3.4, 0); meter.rotation.x = Math.PI / 2; group.add(meter);
      const meterFace = new THREE.Mesh(new THREE.CircleGeometry(0.25, 24), new THREE.MeshBasicMaterial({ color: 0x00d4ff }));
      meterFace.position.set(0, 3.4, 0.08); group.add(meterFace);
      // 电压表连线
      const wireMat = new THREE.MeshStandardMaterial({ color: 0x00d4ff, metalness: 0.8 });
      for (const x of [-0.5, 0.5]) {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 8), wireMat);
        w.position.set(x, 2.7, 0); group.add(w);
      }
      return {
        group, meterFace, hall, fieldArrows,
        dispose() { scene.remove(group); group.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } }); }
      };
    },
    update(refs, t, step, ctx) {
      const { meterFace, fieldArrows } = refs;
      fieldArrows.forEach(a => a.visible = step >= 1);
      if (step === 0) {
        ctx.camera.position.set(6 * Math.cos(t * 0.5 + 0.5), 4, 6 * Math.sin(t * 0.5 + 0.5));
        ctx.controls.target.set(0, 1.5, 0);
      }
      if (step >= 2) {
        const I = step >= 3 ? (10 + t * 40) : 10;
        const vH = I * 0.05;
        meterFace.scale.set(0.8 + vH * 0.05, 0.8 + vH * 0.05, 1);
      }
    },
  },
  data: null,
};