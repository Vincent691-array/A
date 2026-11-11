// 3D伏安法测电阻
import * as THREE from 'three';

const mat = (c, m = 0.6, r = 0.2) => new THREE.MeshStandardMaterial({ color: c, metalness: m, roughness: r });

function makeWire(THREE, p1, p2, color = 0xe0e6ed) {
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const len = dir.length();
  const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, len, 8), new THREE.MeshStandardMaterial({ color, metalness: 0.8, roughness: 0.3 }));
  wire.position.copy(p1).add(p2).multiplyScalar(0.5);
  wire.lookAt(p2); wire.rotateX(Math.PI / 2);
  return wire;
}

function makeMeter(THREE, label, color = 0x00d4ff) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.2, 24), mat(0x1a1a2e));
  body.rotation.x = Math.PI / 2;
  g.add(body);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.35, 24), new THREE.MeshBasicMaterial({ color }));
  face.position.z = 0.11;
  g.add(face);
  return g;
}

export const VoltAmpere3D = {
  info: '根据欧姆定律 R = U/I，用电压表测电阻两端电压U，电流表测流过电流I，计算电阻R',

  principle: {
    steps: [
      { title: '欧姆定律', desc: '通过电阻的电流I与两端电压U成正比：U = IR，即 R = U/I', duration: 3 },
      { title: '电路设计', desc: '电源、开关、待测电阻串联，电压表并联测U，电流表串联测I。3D视角可旋转查看电路', duration: 4 },
      { title: '电流表内接法', desc: '电流表内接：电压表读数 = R两端电压 + 电流表分压，适合测大电阻', duration: 4 },
      { title: '电流表外接法', desc: '电流表外接：电流表读数 = R的电流 + 电压表分流，适合测小电阻', duration: 4 },
      { title: '作图法求R', desc: '改变电压测多组(U,I)数据，作U-I图，直线斜率 k = R', duration: 3 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);

      const makeLabel = (text, color) => {
        const c = document.createElement('canvas'); c.width = 512; c.height = 80;
        const cx = c.getContext('2d');
        cx.fillStyle = '#' + color.toString(16).padStart(6, '0');
        cx.font = 'bold 24px sans-serif'; cx.textAlign = 'center';
        cx.fillText(text, 256, 50);
        const tex = new THREE.CanvasTexture(c);
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
        sp.scale.set(2.2, 0.34, 1);
        return sp;
      };

      const board = new THREE.Mesh(new THREE.BoxGeometry(6, 0.1, 4), mat(0x2a3a5a, 0.3, 0.7));
      board.position.y = 0; board.receiveShadow = true;
      group.add(board);

      const battery = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.4), mat(0xff6600, 0.5, 0.4));
      battery.position.set(-2, 0.3, -1); battery.castShadow = true;
      group.add(battery);
      const lbB = makeLabel('电源', 0xff6600); lbB.position.set(-2, 0.65, -1); group.add(lbB);

      const resistor = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.8, 20), mat(0x8B4513, 0.2, 0.8));
      resistor.position.set(1.5, 0.3, -1); resistor.rotation.z = Math.PI / 2; resistor.castShadow = true;
      group.add(resistor);
      for (const c of [0xff0000, 0x000000, 0x00ff00]) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 20), new THREE.MeshBasicMaterial({ color: c }));
        ring.position.set(1.2 + Math.random() * 0.6, 0.3, -1); ring.rotation.y = Math.PI / 2;
        group.add(ring);
      }
      const lbR = makeLabel('待测电阻 R', 0xcc8844); lbR.position.set(1.5, 0.65, -1); group.add(lbR);

      const ammeter = makeMeter(THREE, 'A', 0xffd700);
      ammeter.position.set(-0.5, 0.3, -1); group.add(ammeter);
      const lbA = makeLabel('电流表', 0xffd700); lbA.position.set(-0.5, 0.65, -1); group.add(lbA);

      const voltmeter = makeMeter(THREE, 'V', 0x00d4ff);
      voltmeter.position.set(1.5, 0.75, -1); group.add(voltmeter);
      const lbV = makeLabel('电压表', 0x00d4ff); lbV.position.set(1.5, 1.15, -1); group.add(lbV);

      const wp = (pts) => {
        const g = new THREE.Group();
        for (let i = 0; i < pts.length - 1; i++) {
          g.add(makeWire(THREE, new THREE.Vector3(...pts[i]), new THREE.Vector3(...pts[i + 1])));
        }
        return g;
      };

      const wiresMain = wp([[-1.7, 0.3, -1], [-0.8, 0.3, -1]]);
      const wiresMain2 = wp([[-0.2, 0.3, -1], [1.1, 0.3, -1]]);
      const wiresMain3 = wp([[1.9, 0.3, -1], [2.5, 0.3, -1], [2.5, 0.3, 0.5], [-2, 0.3, 0.5], [-2.3, 0.3, -1]]);
      [wiresMain, wiresMain2, wiresMain3].forEach(w => group.add(w));

      const wiresInner = wp([[-0.8, 0.3, -1], [-0.8, 0.75, -1], [0.2, 0.75, -1], [0.8, 0.75, -1], [1.9, 0.75, -1], [1.9, 0.3, -1]]);
      const wiresOuter = wp([[1.1, 0.3, -1], [1.1, 0.75, -1], [1.2, 0.75, -1], [1.8, 0.75, -1], [1.9, 0.3, -1]]);
      wiresInner.visible = false; wiresOuter.visible = false;
      group.add(wiresInner); group.add(wiresOuter);

      const lbInner = makeLabel('内接：R测 = R + R_A > R（适合大电阻）', 0xff6b6b);
      lbInner.position.set(0, 1.6, -1); lbInner.visible = false; group.add(lbInner);
      const lbOuter = makeLabel('外接：R测 = R·R_V/(R+R_V) < R（适合小电阻）', 0x6bff9e);
      lbOuter.position.set(0, 1.6, -1); lbOuter.visible = false; group.add(lbOuter);

      const particles = [];
      for (let i = 0; i < 8; i++) {
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffeb3b }));
        p.visible = false; group.add(p); particles.push(p);
      }
      const path = [[-1.7, 0.3, -1], [-0.8, 0.3, -1], [-0.2, 0.3, -1], [1.1, 0.3, -1], [1.9, 0.3, -1],
      [2.5, 0.3, -1], [2.5, 0.3, 0.5], [-2, 0.3, 0.5], [-2.3, 0.3, -1], [-1.7, 0.3, -1]];

      return {
        group, voltmeter, ammeter, particles, path, wiresInner, wiresOuter, lbInner, lbOuter,
        dispose() { scene.remove(group); group.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } }); }
      };
    },
    update(refs, t, step, ctx) {
      const { particles, voltmeter, ammeter, path, wiresInner, wiresOuter, lbInner, lbOuter } = refs;

      wiresInner.visible = (step === 2);
      wiresOuter.visible = (step === 1 || step === 3 || step === 4);
      lbInner.visible = (step === 2);
      lbOuter.visible = (step === 3);

      if (step === 2) voltmeter.position.set(0.5, 0.75, -1);
      else voltmeter.position.set(1.5, 0.75, -1);

      if (step === 0) {
        particles.forEach(p => p.visible = false);
        ctx.camera.position.set(5 * Math.cos(t * 0.8), 4, 5 * Math.sin(t * 0.8));
        ctx.controls.target.set(0, 0.5, 0);
      } else {
        particles.forEach((p, i) => {
          p.visible = true;
          const prog = (t * 1.5 + i / particles.length) % 1;
          const seg = prog * (path.length - 1);
          const si = Math.floor(seg), sf = seg - si;
          const a = path[si], b = path[Math.min(si + 1, path.length - 1)];
          p.position.set(a[0] + (b[0] - a[0]) * sf, a[1] + (b[1] - a[1]) * sf, a[2] + (b[2] - a[2]) * sf);
        });
        if (step >= 2) {
          voltmeter.rotation.z = Math.sin(t * Math.PI * 4) * 0.1;
          ammeter.rotation.z = Math.sin(t * Math.PI * 4) * 0.08;
        }
      }
    },
  },

  procedure: {
    steps: [
      { title: '搭建电路', desc: '操作：按图连接：电源→开关→滑动变阻器→电流表→待测电阻→回电源；电压表并联在电阻两端。\n原理：电流表串联测通过R的电流，电压表并联测R两端电压。\n注意：电表极性不能接反（+接+、-接-）；待测电阻约几Ω~几十Ω时用电流表外接法（电压表分流误差小）。', duration: 5 },
      { title: '检查电路', desc: '操作：核对接线、电表量程、变阻器初始位置。\n原理：变阻器初始置最大阻值，闭合开关瞬间电流最小，保护电表不被烧毁。\n注意：电压表量程要大于电源电压；电流表量程要大于 I_max=U/R；用前先机械调零。', duration: 3 },
      { title: '调节电压读数', desc: '操作：闭合开关，缓慢移动变阻器滑片改变电压，待指针稳定后同时读取U和I。\n原理：变阻器分压接法，滑片移动改变串联分压从而改变R两端电压。\n注意：读数时视线正对表盘刻度消除视差；指针稳定后再读（不抖动）；估读到分度值下一位。', duration: 5 },
      { title: '记录多组数据', desc: '操作：取6-8组不同(U,I)值，电压从零均匀增大到量程的80%，记录表格。\n原理：多组数据可用作图法求斜率（=R），比单组 U/I 更准确，能剔除粗差。\n注意：电压不要超量程；数据点尽量均匀分布；每组等指针稳定再读。', duration: 4 },
      { title: '断开整理', desc: '操作：先断开开关，再拆线，电表归零，器材归位。\n原理：带电拆线可能短路打火损坏电表。\n注意：变阻器滑片归到最大阻值位置，方便下次实验。', duration: 3 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);

      const makeLabel = (text, color) => {
        const c = document.createElement('canvas'); c.width = 256; c.height = 64;
        const cx = c.getContext('2d');
        cx.fillStyle = '#' + color.toString(16).padStart(6, '0');
        cx.font = 'bold 26px sans-serif'; cx.textAlign = 'center';
        cx.fillText(text, 128, 42);
        const tex = new THREE.CanvasTexture(c);
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
        sp.scale.set(0.9, 0.22, 1);
        return sp;
      };

      const board = new THREE.Mesh(new THREE.BoxGeometry(6, 0.1, 4), mat(0x2a3a5a, 0.3, 0.7));
      board.position.y = 0; board.receiveShadow = true;
      group.add(board);

      const battery = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.4), mat(0xff6600, 0.5, 0.4));
      battery.position.set(-2, 0.3, -1); group.add(battery);
      const lb1 = makeLabel('电源', 0xff6600); lb1.position.set(-2, 0.65, -1); group.add(lb1);

      const resistor = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.8, 20), mat(0x8B4513, 0.2, 0.8));
      resistor.position.set(1.5, 0.3, -1); resistor.rotation.z = Math.PI / 2; group.add(resistor);
      const lb2 = makeLabel('待测电阻 R', 0xcc8844); lb2.position.set(1.5, 0.65, -1); group.add(lb2);

      const voltmeter = makeMeter(THREE, 'V', 0x00d4ff);
      voltmeter.position.set(1.5, 0.95, -1); group.add(voltmeter);
      const lb3 = makeLabel('电压表', 0x00d4ff); lb3.position.set(1.5, 1.4, -1); group.add(lb3);

      const ammeter = makeMeter(THREE, 'A', 0xffd700);
      ammeter.position.set(-0.5, 0.45, 0.8); group.add(ammeter);
      const lb4 = makeLabel('电流表', 0xffd700); lb4.position.set(-0.5, 0.85, 0.8); group.add(lb4);

      const switchGroup = new THREE.Group();
      switchGroup.position.set(-1.25, 0.45, 0.8);
      group.add(switchGroup);
      const swBase = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.15), mat(0x333333));
      switchGroup.add(swBase);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.025, 0.04), mat(0xdddddd, 0.9, 0.1));
      blade.position.x = 0.15; blade.rotation.z = 0.5;
      switchGroup.add(blade);
      const lb5 = makeLabel('开关', 0xdddddd); lb5.position.set(-1.25, 0.7, 0.8); group.add(lb5);

      const makeWirePath = (pts) => {
        const g = new THREE.Group();
        for (let i = 0; i < pts.length - 1; i++) {
          g.add(makeWire(THREE, new THREE.Vector3(...pts[i]), new THREE.Vector3(...pts[i + 1])));
        }
        return g;
      };

      const w1 = makeWirePath([[-1.7, 0.45, -1], [-1.7, 0.45, 0.8], [-1.45, 0.45, 0.8]]);
      const w2 = makeWirePath([[-1.05, 0.45, 0.8], [-0.9, 0.45, 0.8]]);
      const w3 = makeWirePath([[-0.1, 0.45, 0.8], [1.9, 0.45, 0.8], [1.9, 0.45, -1]]);
      const w4 = makeWirePath([[1.1, 0.45, -1], [-2.3, 0.45, -1]]);
      const wires = [w1, w2, w3, w4];
      wires.forEach(w => { w.visible = false; group.add(w); });

      const wv1 = makeWirePath([[1.3, 0.95, -1], [1.1, 0.45, -1]]);
      const wv2 = makeWirePath([[1.7, 0.95, -1], [1.9, 0.45, -1]]);
      const wiresV = [wv1, wv2];
      wiresV.forEach(w => { w.visible = false; group.add(w); });

      const pathPts = [[-1.7, 0.45, -1], [-1.7, 0.45, 0.8], [-1.05, 0.45, 0.8], [-0.9, 0.45, 0.8],
      [-0.1, 0.45, 0.8], [1.9, 0.45, 0.8], [1.9, 0.45, -1], [1.1, 0.45, -1], [-2.3, 0.45, -1], [-1.7, 0.45, -1]]
        .map(p => new THREE.Vector3(...p));
      const segLen = []; let total = 0;
      for (let i = 0; i < pathPts.length - 1; i++) {
        const l = pathPts[i].distanceTo(pathPts[i + 1]); segLen.push(l); total += l;
      }
      const posAt = (s) => {
        let d = s * total;
        for (let i = 0; i < segLen.length; i++) {
          if (d <= segLen[i]) return new THREE.Vector3().lerpVectors(pathPts[i], pathPts[i + 1], d / segLen[i]);
          d -= segLen[i];
        }
        return pathPts.at(-1).clone();
      };
      const particles = [];
      for (let i = 0; i < 10; i++) {
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
        p.visible = false; group.add(p); particles.push(p);
      }

      return {
        group, voltmeter, ammeter, blade, wires, wiresV, particles, posAt,
        dispose() { scene.remove(group); group.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } }); }
      };
    },
    update(refs, t, step, ctx) {
      const { voltmeter, ammeter, blade, wires, wiresV, particles, posAt } = refs;

      if (step === 0) {
        const prog = t * 4;
        wires.forEach((w, i) => w.visible = prog > i);
        wiresV.forEach(w => w.visible = false);
        particles.forEach(p => p.visible = false);
        blade.rotation.z = 0.5;
        ctx.camera.position.set(5 * Math.cos(t * 0.6 + 0.5), 4, 5 * Math.sin(t * 0.6 + 0.5));
        ctx.controls.target.set(0, 0.5, 0);
      } else if (step === 1) {
        wires.forEach(w => w.visible = true);
        wiresV.forEach((w, i) => w.visible = t * 2 > i);
        particles.forEach(p => p.visible = false);
        blade.rotation.z = 0.5;
      } else if (step === 2) {
        wires.forEach(w => w.visible = true);
        wiresV.forEach(w => w.visible = true);
        blade.rotation.z = 0.5 * Math.max(0, 1 - t * 2);
        if (t > 0.4) {
          particles.forEach((p, i) => {
            p.visible = true;
            p.position.copy(posAt(((t - 0.4) * 0.8 + i / 10) % 1));
          });
        }
        voltmeter.rotation.z = Math.sin(t * Math.PI * 3) * 0.15;
        ammeter.rotation.z = Math.sin(t * Math.PI * 3) * 0.1;
      } else if (step === 3) {
        wires.forEach(w => w.visible = true);
        wiresV.forEach(w => w.visible = true);
        blade.rotation.z = 0;
        particles.forEach((p, i) => {
          p.visible = true;
          p.position.copy(posAt((t + i / 10) % 1));
        });
        voltmeter.rotation.z = Math.sin(t * Math.PI * 4) * 0.2;
        ammeter.rotation.z = Math.sin(t * Math.PI * 4) * 0.15;
      } else if (step === 4) {
        wires.forEach(w => w.visible = true);
        wiresV.forEach(w => w.visible = true);
        blade.rotation.z = 0.5 * t;
        particles.forEach(p => p.visible = false);
      }
    },
  },
  data: null,
};