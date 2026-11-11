// 3D三线摆测转动惯量 - 原理+操作阶段
import * as THREE from 'three';

const metalMat = () => new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 0.8, roughness: 0.3 });

function makeTrifilarPendulum(THREE) {
  const g = new THREE.Group();
  const topR = 0.6, botR = 1.5, H = 3.0;
  const topY = H, botY = 0;

  const m = metalMat();
  const topDisc = new THREE.Mesh(new THREE.CylinderGeometry(topR, topR, 0.08, 32), m);
  topDisc.position.y = topY; topDisc.castShadow = true; g.add(topDisc);
  const botDisc = new THREE.Mesh(new THREE.CylinderGeometry(botR, botR, 0.12, 32), m);
  botDisc.position.y = botY; botDisc.castShadow = true; botDisc.receiveShadow = true; g.add(botDisc);

  const stringMat = new THREE.MeshBasicMaterial({ color: 0xdddddd });
  const strings = [];
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3;
    const tx = topR * Math.cos(a), tz = topR * Math.sin(a);
    const bx = botR * Math.cos(a), bz = botR * Math.sin(a);
    const len = Math.sqrt((bx - tx) ** 2 + H ** 2 + (bz - tz) ** 2);
    const mid = new THREE.Vector3((tx + bx) / 2, (topY + botY) / 2, (tz + bz) / 2);
    const dir = new THREE.Vector3(bx - tx, botY - topY, bz - tz).normalize();
    const str = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, len, 6), stringMat);
    str.position.copy(mid);
    str.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    g.add(str); strings.push({ mesh: str, tx, tz, bx, bz, len });
  }

  const stand = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 2.4), m);
  stand.position.y = -0.06; stand.castShadow = true; stand.receiveShadow = true; g.add(stand);

  return { group: g, topDisc, botDisc, strings, topR, botR, H, topY, botY };
}

export const MomentOfInertia3D = {
  info: '用三线摆扭转振动周期公式 T=2π√(I/(mgh))，测周期T计算转动惯量I',

  principle: {
    steps: [
      { title: '三线摆模型', desc: '上盘小、下盘大，三根等长细线对称悬挂。3D视角可拖拽旋转查看装置结构', duration: 4 },
      { title: '扭转振动', desc: '将下盘扭转一个小角度释放，在悬线张力恢复力矩作用下往复扭转振动', duration: 3 },
      { title: '回复力矩', desc: '扭转角φ时，回复力矩 M = -mgRrφ/H，方向与φ相反，运动近似简谐', duration: 4 },
      { title: '周期公式', desc: '扭转运动方程 I·φ¨ = -mgRrφ/H，周期 T = 2π√(IH/(mgRr))', duration: 4 },
      { title: '推导I公式', desc: '解出 I = mgRrT²/(4π²H)，测量m、R、r、H、T即可求转动惯量', duration: 3 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);
      const parts = makeTrifilarPendulum(THREE);
      group.add(parts.group);

      const botGroup = new THREE.Group();
      botGroup.position.y = 0;
      group.add(botGroup);
      parts.group.remove(parts.botDisc);
      botGroup.add(parts.botDisc);
      for (const s of parts.strings) parts.group.remove(s.mesh);

      const stringMat = new THREE.MeshBasicMaterial({ color: 0xdddddd });
      const dynStrings = [];
      for (let i = 0; i < 3; i++) {
        const a = (i * 2 * Math.PI) / 3;
        const str = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 3.2, 6), stringMat);
        group.add(str);
        dynStrings.push({ mesh: str, a });
      }

      return {
        group, botGroup, botDisc: parts.botDisc, dynStrings,
        topR: parts.topR, botR: parts.botR, H: parts.H, topY: parts.topY,
        dispose() {
          scene.remove(group);
          group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
        }
      };
    },
    update(refs, t, step, ctx) {
      const { botGroup, dynStrings, topR, botR, topY } = refs;
      const maxPhi = 0.3;
      let phi = 0;

      if (step === 0) {
        const ang = t * Math.PI * 0.25;
        ctx.camera.position.set(6 * Math.cos(ang + 0.5), 4, 6 * Math.sin(ang + 0.5));
        ctx.controls.target.set(0, 1.5, 0);
      } else if (step === 1) {
        phi = maxPhi * EaseInOut(t);
      } else if (step === 2) {
        phi = maxPhi * Math.cos(t * Math.PI * 2 * 2);
      } else if (step === 3) {
        phi = maxPhi * Math.cos(t * Math.PI * 2 * 3);
      } else if (step === 4) {
        phi = maxPhi * Math.cos(t * Math.PI * 2 * 2);
      }

      botGroup.rotation.y = phi;

      for (const s of dynStrings) {
        const tx = topR * Math.cos(s.a), tz = topR * Math.sin(s.a);
        const bx = botR * Math.cos(s.a + phi), bz = botR * Math.sin(s.a + phi);
        const mid = new THREE.Vector3((tx + bx) / 2, topY / 2, (tz + bz) / 2);
        const dir = new THREE.Vector3(bx - tx, -topY, bz - tz);
        const len = dir.length();
        s.mesh.position.copy(mid);
        s.mesh.scale.y = len / 3.2;
        s.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      }
    },
  },

  procedure: {
    steps: [
      { title: '调平三线摆', desc: '操作：调节底座螺丝使下盘水平（用水准仪检查），三线等长。\n原理：盘不水平时重力分量会引入系统误差，等长保证对称扭转。\n注意：水准仪气泡居中即可；三线张力要均匀，不能有松线。', duration: 4 },
      { title: '测上下盘半径', desc: '操作：用游标卡尺测上盘三悬点所在圆半径r、下盘三悬点所在圆半径R。\n原理：R和r是公式中力臂参数，r是悬点到上盘中心距离，R是悬点到下盘中心距离。\n注意：测悬点孔中心距离再换算为外接圆半径；测3个悬点取平均。', duration: 4 },
      { title: '测盘间距H', desc: '操作：用米尺测上下盘的垂直距离H（从上盘下表面到下盘上表面）。\n原理：H是悬线在竖直方向的投影长度，近似等于悬线长（小扭转角下）。\n注意：米尺竖直放置，视线垂直读数；H误差对I结果影响较大（I∝1/H）。', duration: 3 },
      { title: '放置待测物体', desc: '操作：将待测物体放于下盘中心，记录质量m（用天平称量）。\n原理：物体与下盘一起扭转，测出的是总转动惯量，减去空盘I₀得物体I。\n注意：物体重心必须在下盘中心轴上，否则会摆动而非纯扭转。', duration: 3 },
      { title: '测扭转周期T', desc: '操作：轻扭下盘一小角度释放，等稳定后过平衡位置开始计时，数50次全振动记总时间t，T=t/50。\n原理：在平衡位置（角速度最大）计时误差最小，与单摆同理。\n注意：扭转角<10°；重复3次取平均；空盘和载物各测一次。', duration: 5 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);
      const parts = makeTrifilarPendulum(THREE);
      group.add(parts.group);

      const botGroup = new THREE.Group();
      botGroup.position.y = 0;
      group.add(botGroup);
      parts.group.remove(parts.botDisc);
      botGroup.add(parts.botDisc);
      for (const s of parts.strings) parts.group.remove(s.mesh);

      const stringMat = new THREE.MeshBasicMaterial({ color: 0xdddddd });
      const dynStrings = [];
      for (let i = 0; i < 3; i++) {
        const a = (i * 2 * Math.PI) / 3;
        const str = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 3.2, 6), stringMat);
        group.add(str);
        dynStrings.push({ mesh: str, a });
      }

      const objMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c, metalness: 0.5, roughness: 0.3 });
      const testObj = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 24), objMat);
      testObj.position.y = 0.18; testObj.castShadow = true;
      testObj.visible = false;
      botGroup.add(testObj);

      const rulerMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0x442200 });
      const ruler = new THREE.Mesh(new THREE.BoxGeometry(0.05, 3.3, 0.02), rulerMat);
      ruler.position.set(2.0, 1.5, 0);
      ruler.visible = false;
      group.add(ruler);

      return {
        group, botGroup, botDisc: parts.botDisc, dynStrings, testObj, ruler,
        topR: parts.topR, botR: parts.botR, H: parts.H, topY: parts.topY,
        dispose() {
          scene.remove(group);
          group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
        }
      };
    },
    update(refs, t, step, ctx) {
      const { botGroup, dynStrings, testObj, ruler, topR, botR, topY } = refs;
      const maxPhi = 0.2;
      let phi = 0;

      if (step === 0) {
        const tilt = (1 - EaseOut(t)) * 0.08;
        botGroup.rotation.z = tilt;
        botGroup.rotation.y = 0;
      } else if (step === 1) {
        botGroup.rotation.z = 0;
        botGroup.rotation.y = 0;
        ruler.visible = false;
      } else if (step === 2) {
        botGroup.rotation.z = 0;
        botGroup.rotation.y = 0;
        ruler.visible = true;
      } else if (step === 3) {
        botGroup.rotation.z = 0;
        botGroup.rotation.y = 0;
        ruler.visible = false;
        testObj.visible = EaseOut(t) > 0.5;
      } else if (step === 4) {
        botGroup.rotation.z = 0;
        phi = maxPhi * Math.cos(t * Math.PI * 2 * 4);
        botGroup.rotation.y = phi;
        testObj.visible = true;
      }

      if (step !== 0) botGroup.rotation.z = 0;

      for (const s of dynStrings) {
        const tx = topR * Math.cos(s.a), tz = topR * Math.sin(s.a);
        const bx = botR * Math.cos(s.a + phi), bz = botR * Math.sin(s.a + phi);
        const mid = new THREE.Vector3((tx + bx) / 2, topY / 2, (tz + bz) / 2);
        const dir = new THREE.Vector3(bx - tx, -topY, bz - tz);
        const len = dir.length();
        s.mesh.position.copy(mid);
        s.mesh.scale.y = len / 3.2;
        s.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      }
    },
  },
  data: null,
};

function EaseInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function EaseOut(t) { return 1 - Math.pow(1 - t, 3); }
