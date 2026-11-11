// 3D单摆测g - 原理+操作阶段
import * as THREE from 'three';

const metalMat = () => new THREE.MeshStandardMaterial({ color: 0x888899, metalness: 0.85, roughness: 0.25 });
const woodMat = () => new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });

function makeStand(THREE) {
  const g = new THREE.Group();
  const m = metalMat();
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 1.2), m);
  base.position.y = 0.06; base.castShadow = true; base.receiveShadow = true; g.add(base);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 5.2, 20), m);
  pole.position.set(-1.0, 2.6, 0); pole.castShadow = true; g.add(pole);
  const beam = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 0.1), m);
  beam.position.set(0, 5.0, 0); beam.castShadow = true; g.add(beam);
  const pivot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 20, 20), m);
  pivot.position.set(0, 5.0, 0); g.add(pivot);
  return g;
}

export const Pendulum3D = {
  info: '用单摆的周期公式 T=2π√(L/g)，通过测量摆长L和周期T计算重力加速度g',

  principle: {
    steps: [
      { title: '单摆模型', desc: '理想单摆：质点悬挂在不可伸长轻线下端，在重力作用下往复摆动。3D视角可拖拽旋转查看装置结构', duration: 4 },
      { title: '拉开小角度', desc: '将小球拉离平衡位置一个小角度θ（<5°），重力沿切线方向的分量提供回复力', duration: 3 },
      { title: '回复力分析', desc: '回复力 F = -mg sinθ，方向指向平衡位置。小角度下 sinθ ≈ θ，运动近似为简谐振动', duration: 4 },
      { title: '简谐运动周期', desc: '简谐振动周期 T = 2π√(L/g)，仅与摆长L和g有关，与振幅、质量无关（等时性原理）', duration: 4 },
      { title: '推导g公式', desc: '由 T = 2π√(L/g) 解出 g = 4π²L/T²。测量L和T即可求得重力加速度g', duration: 3 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);

      const stand = makeStand(THREE);
      group.add(stand);

      const L = 3.8;
      const pivotY = 5.0;

      // 摆组（线+球一起旋转）
      const pendulum = new THREE.Group();
      pendulum.position.set(0, pivotY, 0);
      group.add(pendulum);

      // 摆线
      const stringMat = new THREE.MeshBasicMaterial({ color: 0xdddddd });
      const string = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, L, 8), stringMat);
      string.position.y = -L / 2;
      pendulum.add(string);

      // 摆球
      const ballMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c, metalness: 0.7, roughness: 0.15, emissive: 0x330000 });
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.28, 40, 40), ballMat);
      ball.position.y = -L;
      ball.castShadow = true;
      pendulum.add(ball);

      // 平衡位置虚线
      const eqLineMat = new THREE.LineDashedMaterial({ color: 0x00d4ff, dashSize: 0.15, gapSize: 0.1, transparent: true, opacity: 0.4 });
      const eqGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, pivotY, 0), new THREE.Vector3(0, pivotY - L - 0.5, 0)]);
      const eqLine = new THREE.Line(eqGeo, eqLineMat);
      eqLine.computeLineDistances();
      group.add(eqLine);

      // 回复力箭头
      const forceArrow = new THREE.ArrowHelper(
        new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), 1, 0xff4466, 0.2, 0.12
      );
      forceArrow.visible = false;
      group.add(forceArrow);

      // 重力箭头
      const gravArrow = new THREE.ArrowHelper(
        new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 0), 1.2, 0xffd700, 0.2, 0.12
      );
      gravArrow.visible = false;
      group.add(gravArrow);

      // 摆长标注线
      const lenLineMat = new THREE.LineDashedMaterial({ color: 0x7bc88a, dashSize: 0.1, gapSize: 0.08 });
      const lenGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.5, pivotY, 0), new THREE.Vector3(-0.5, pivotY - L, 0)]);
      const lenLine = new THREE.Line(lenGeo, lenLineMat);
      lenLine.computeLineDistances();
      lenLine.visible = false;
      group.add(lenLine);

      return {
        group, pendulum, ball, string, forceArrow, gravArrow, eqLine, lenLine,
        L, pivotY,
        dispose() {
          scene.remove(group);
          group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
        }
      };
    },
    update(refs, t, step, ctx) {
      const { pendulum, forceArrow, gravArrow, lenLine, L, pivotY } = refs;
      const maxAng = 0.16;
      let theta = 0;
      let showForce = false, showGrav = false, showLen = false;

      if (step === 0) {
        theta = 0;
        // 相机缓慢旋转
        const ang = t * Math.PI * 0.3;
        ctx.camera.position.set(6 * Math.cos(ang + 0.5), 4, 8 * Math.sin(ang + 0.5));
        ctx.controls.target.set(0, 2.5, 0);
      } else if (step === 1) {
        theta = maxAng * (t < 0.4 ? EaseInOut(t / 0.4) : 1);
      } else if (step === 2) {
        theta = maxAng * Math.cos(t * Math.PI * 2 * 2);
        showForce = true; showGrav = true;
      } else if (step === 3) {
        theta = maxAng * Math.cos(t * Math.PI * 2 * 3);
        showLen = true;
      } else if (step === 4) {
        theta = maxAng * Math.cos(t * Math.PI * 2 * 2);
        showLen = true;
      }

      pendulum.rotation.z = theta;

      // 更新力箭头
      if (showForce) {
        const bx = L * Math.sin(theta);
        const by = pivotY - L * Math.cos(theta);
        forceArrow.visible = true;
        forceArrow.position.set(bx, by, 0);
        const fdir = new THREE.Vector3(-Math.sin(theta), -Math.cos(theta), 0);
        forceArrow.setDirection(fdir);
        forceArrow.setLength(1.0, 0.2, 0.12);
      } else {
        forceArrow.visible = false;
      }

      if (showGrav) {
        const bx = L * Math.sin(theta);
        const by = pivotY - L * Math.cos(theta);
        gravArrow.visible = true;
        gravArrow.position.set(bx, by, 0);
      } else {
        gravArrow.visible = false;
      }

      lenLine.visible = showLen;
    },
  },

  procedure: {
    steps: [
      { title: '搭建装置', desc: '操作：铁架台放稳，夹子上悬挂细线，下端系金属小球。\n原理：理想单摆要求线轻且不可伸长、球小而重（可视为质点）。\n注意：线要细（<0.5mm）、球要密实（如钢球）；夹紧悬点避免摆动中悬点移动。', duration: 5 },
      { title: '测量摆线长度 l', desc: '操作：用米尺测悬点到球上端的线长 l，精确到mm。\n原理：摆长 L 是悬点到球心距离，需分别测线长和球径再合成。\n注意：米尺要竖直、贴紧细线读数；视线垂直刻度避免视差。', duration: 4 },
      { title: '测球径计算摆长L', desc: '操作：游标卡尺测球径 d（不同方向测3次取平均），摆长 L = l + d/2。\n原理：L 从悬点到球心，线长只到球面，需补半个球径。\n注意：游标卡尺精度0.02mm，读数=主尺+游标对齐格×0.02。', duration: 4 },
      { title: '拉开小角度释放', desc: '操作：将球拉开角度 θ < 5°（约8cm振幅），无初速释放，等摆动稳定。\n原理：θ<5°时 sinθ≈θ 误差<0.2%，简谐近似成立；角度大周期会偏长。\n注意：只能在同一竖直平面内摆动，不能旋转释放（否则变圆锥摆）；手释放时别给初速度。', duration: 4 },
      { title: '计时50次全振动', desc: '操作：球过最低点时启动秒表并数0，之后每过一个最低点数1，数到50停止，记总时间 t。\n原理：在最低点计时因速度最大，位置判断误差对时间影响最小。\n注意：T = t/50；重复测3次取平均；人反应时间约0.2s，测50次可将该误差稀释到0.004s/次。', duration: 5 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);

      const stand = makeStand(THREE);
      group.add(stand);

      const L = 3.8, pivotY = 5.0;
      const pendulum = new THREE.Group();
      pendulum.position.set(0, pivotY, 0);
      group.add(pendulum);

      const string = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, L, 8), new THREE.MeshBasicMaterial({ color: 0xdddddd }));
      string.position.y = -L / 2;
      pendulum.add(string);

      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.28, 40, 40), new THREE.MeshStandardMaterial({ color: 0xe74c3c, metalness: 0.7, roughness: 0.15 }));
      ball.position.y = -L; ball.castShadow = true;
      pendulum.add(ball);

      // 米尺（步骤2显示）
      const ruler = new THREE.Mesh(new THREE.BoxGeometry(0.05, L + 0.5, 0.02), new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0x442200 }));
      ruler.position.set(-0.5, pivotY - L / 2, 0);
      ruler.visible = false;
      group.add(ruler);

      // 游标卡尺（步骤3显示）
      const caliper = new THREE.Group();
      const calMat = new THREE.MeshStandardMaterial({ color: 0x7bc88a, metalness: 0.5 });
      const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), calMat);
      const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), calMat);
      c1.position.x = -0.3; c2.position.x = 0.3;
      caliper.add(c1, c2);
      caliper.position.set(0, pivotY - L, 0.4);
      caliper.visible = false;
      group.add(caliper);

      return {
        group, pendulum, ball, string, ruler, caliper, L, pivotY,
        dispose() {
          scene.remove(group);
          group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
        }
      };
    },
    update(refs, t, step, ctx) {
      const { pendulum, ruler, caliper, L, pivotY } = refs;
      const maxAng = 0.08;
      let theta = 0;

      if (step === 0) {
        // 组装动画：摆球从上方落下
        const p = EaseOut(t);
        pendulum.rotation.z = 0;
        const ballY = p > 0.5 ? -L : -L * (p * 2);
        refs.ball.position.y = ballY;
        if (p <= 0.5) refs.string.scale.y = p * 2;
        else refs.string.scale.y = 1;
      } else if (step === 1) {
        theta = 0;
        ruler.visible = true;
        refs.ball.position.y = -L;
        refs.string.scale.y = 1;
      } else if (step === 2) {
        theta = 0;
        caliper.visible = true;
        ruler.visible = false;
        refs.ball.position.y = -L;
      } else if (step === 3) {
        caliper.visible = false;
        if (t < 0.3) theta = maxAng * (t / 0.3);
        else theta = maxAng * Math.cos((t - 0.3) / 0.7 * Math.PI * 3);
        refs.ball.position.y = -L;
      } else if (step === 4) {
        theta = 0.06 * Math.cos(t * Math.PI * 2 * 6);
        refs.ball.position.y = -L;
      }

      if (step !== 0) {
        pendulum.rotation.z = theta;
        refs.string.scale.y = 1;
        refs.ball.position.y = -L;
      }
    },
  },
  data: null,
};

function EaseInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function EaseOut(t) { return 1 - Math.pow(1 - t, 3); }