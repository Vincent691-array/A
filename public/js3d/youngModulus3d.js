// 3D杨氏模量测定（光杠杆法）
import * as THREE from 'three';

const mat = (c, m = 0.6, r = 0.2) => new THREE.MeshStandardMaterial({ color: c, metalness: m, roughness: r });

export const YoungModulus3D = {
  info: '用光杠杆法测量金属丝微小伸长，计算杨氏模量 E = 8mgLD/(πd²b·n)，光杠杆将微小伸长放大2D/b倍',

  principle: {
    steps: [
      { title: '杨氏模量定义', desc: '材料在弹性限度内，应力σ=F/S与应变ε=ΔL/L成正比，比例系数E即杨氏模量', duration: 3 },
      { title: '光杠杆原理', desc: '光杠杆有三足，后足立在钢丝下端夹上。钢丝伸长ΔL使镜偏转α=ΔL/b角。3D视角可旋转查看装置', duration: 4 },
      { title: '光杠杆放大', desc: '望远镜中标尺读数变化 n = 2α·D = 2D·ΔL/b，放大倍数 2D/b（通常约40-60倍）', duration: 4 },
      { title: '推导E公式', desc: '代入得 E = 8mgLD/(πd²b·n)，其中F=mg, S=πd²/4', duration: 3 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);

      // 支架（两根立柱+横梁）
      const poleMat = mat(0x888899);
      for (const x of [-2, 2]) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 5, 16), poleMat);
        pole.position.set(x, 2.5, 0); pole.castShadow = true;
        group.add(pole);
      }
      const beam = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.15, 0.3), poleMat);
      beam.position.set(0, 4.9, 0); group.add(beam);

      // 钢丝
      const wireMat = mat(0xcccccc, 0.9, 0.1);
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 4, 8), wireMat);
      wire.position.set(0, 2.8, 0); group.add(wire);

      // 夹头
      const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.2), mat(0x666666));
      clamp.position.set(0, 0.8, 0); group.add(clamp);

      // 砝码
      const masses = new THREE.Group();
      masses.position.set(0, 0.6, 0);
      group.add(masses);

      // 光杠杆小镜
      const mirrorGroup = new THREE.Group();
      mirrorGroup.position.set(0.3, 0.7, 0.3);
      group.add(mirrorGroup);
      const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.01, 0.3), new THREE.MeshStandardMaterial({ color: 0x4fc3f7, metalness: 0.9, roughness: 0.05, emissive: 0x0a1a2a }));
      mirror.rotation.x = -0.1;
      mirrorGroup.add(mirror);
      // 镜架三足
      for (const [fx, fz] of [[-0.15, -0.1], [0.15, -0.1], [0, 0.1]]) {
        const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.15, 8), mat(0x888888));
        foot.position.set(fx, -0.08, fz);
        mirrorGroup.add(foot);
      }

      // 望远镜+标尺
      const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 16), mat(0x444444));
      scope.position.set(2.5, 1.5, 1); scope.rotation.x = -0.3;
      group.add(scope);
      const ruler = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5, 0.05), mat(0xffd700, 0.3, 0.5));
      ruler.position.set(2.5, 1.5, 0.7);
      group.add(ruler);

      // 光路（虚线）
      const rayMat = new THREE.LineDashedMaterial({ color: 0xffeb3b, dashSize: 0.15, gapSize: 0.1, transparent: true, opacity: 0 });
      const rayGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(2.5, 1.5, 1), new THREE.Vector3(0.3, 0.7, 0.3), new THREE.Vector3(2.5, 2.0, 0.7)
      ]);
      const ray = new THREE.Line(rayGeo, rayMat);
      ray.computeLineDistances();
      group.add(ray);

      return {
        group, wire, clamp, masses, mirrorGroup, mirror, ray, ruler,
        wireLen: 4,
        dispose() { scene.remove(group); group.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); }
      };
    },
    update(refs, t, step, ctx) {
      const { wire, clamp, masses, mirrorGroup, mirror, ray, ruler } = refs;
      let deltaL = 0;

      if (step === 0) {
        ctx.camera.position.set(6 * Math.cos(t * 0.6), 4, 6 * Math.sin(t * 0.6));
        ctx.controls.target.set(0, 2.5, 0);
        ray.material.opacity = 0;
      } else if (step === 1) {
        deltaL = 0.1 * Math.sin(t * Math.PI);
        ray.material.opacity = 0;
      } else if (step === 2) {
        deltaL = 0.15 * t;
        ray.material.opacity = 0.6 * t;
        mirror.rotation.x = -0.1 - deltaL * 0.5;
      } else if (step === 3) {
        deltaL = 0.15;
        ray.material.opacity = 0.6;
        mirror.rotation.x = -0.1 - deltaL * 0.5;
      }

      // 更新钢丝长度
      wire.scale.y = 1 + deltaL / refs.wireLen;
      clamp.position.y = 0.8 - deltaL;
      masses.position.y = 0.6 - deltaL;
      mirrorGroup.position.y = 0.7 - deltaL;

      // 砝码数量
      const numMasses = step >= 1 ? Math.floor(t * 4) + 1 : 0;
      while (masses.children.length < numMasses) {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.1, 20), mat(0x555555, 0.7, 0.3));
        m.position.y = -masses.children.length * 0.1;
        m.castShadow = true;
        masses.add(m);
      }
      while (masses.children.length > numMasses) {
        const m = masses.children[masses.children.length - 1];
        masses.remove(m); m.geometry.dispose(); m.material.dispose();
      }
    },
  },

  procedure: {
    steps: [
      { title: '安装装置', desc: '操作：调节支架铅直，挂上钢丝+下夹头，光杠杆后足立在下夹头上、前两足立在工作台槽内，望远镜+标尺置于镜前约1-2m。\n原理：光杠杆后足随钢丝伸长下移，镜面偏转，望远镜中标尺读数变化被放大 2D/b 倍。\n注意：钢丝要自然伸直（可先挂1个砝码）；光杠杆三足在同一水平面、镜面铅直、标尺与镜面平行。', duration: 5 },
      { title: '调节望远镜', desc: '操作：先调目镜看清十字叉丝，再调物镜看清标尺像，使叉丝与标尺像无视差。\n原理：望远镜观察的是光杠杆镜所成像，镜面反射的标尺成像在叉丝面上。\n注意：先沿望远镜筒外侧目视找镜中标尺像（粗调），再用望远镜细调；调好后整个实验不动望远镜。', duration: 4 },
      { title: '加初载读数n₀', desc: '操作：加1-2个砝码使钢丝拉直，记录初始标尺读数 n₀。\n原理：钢丝初始可能弯曲，加初载使其拉直，从拉直状态开始计量伸长量。\n注意：初载不计入伸长计算；读数时叉丝对准标尺刻度，估读到0.1mm。', duration: 3 },
      { title: '逐次加码读数', desc: '操作：每次加一个砝码（如200g），等系统稳定（约1-2分钟）后读标尺读数 nᵢ，共加6-8次。\n原理：每加一码钢丝伸长 ΔL，光杠杆放大显示为标尺读数差 nᵢ-nᵢ₋₁。\n注意：加码要轻放避免冲击钢丝；读数要等标尺像稳定不抖动；用逐差法处理数据（如隔3项相减）可充分利用数据减小误差。', duration: 5 },
      { title: '减码读数取平均', desc: '操作：逐次减砝码，记录对应标尺读数，与加码时同一载荷的读数取平均。\n原理：钢丝存在弹性滞后（加载和卸载应变不同），取加码减码平均值可消除该效应。\n注意：减码也要轻取；加码减码到同一载荷时读数可能不同，差值反映滞后大小；用平均值代入 E=8mgLD/(πd²bn) 求杨氏模量。', duration: 4 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);
      for (const x of [-2, 2]) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 5, 16), mat(0x888899));
        pole.position.set(x, 2.5, 0); group.add(pole);
      }
      const beam = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.15, 0.3), mat(0x888899));
      beam.position.set(0, 4.9, 0); group.add(beam);
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 4, 8), mat(0xcccccc, 0.9, 0.1));
      wire.position.set(0, 2.8, 0); group.add(wire);
      const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.2), mat(0x666666));
      clamp.position.set(0, 0.8, 0); group.add(clamp);
      const masses = new THREE.Group();
      masses.position.set(0, 0.6, 0); group.add(masses);
      const mirrorGroup = new THREE.Group();
      mirrorGroup.position.set(0.3, 0.7, 0.3); group.add(mirrorGroup);
      const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.01, 0.3), new THREE.MeshStandardMaterial({ color: 0x4fc3f7, metalness: 0.9, roughness: 0.05 }));
      mirrorGroup.add(mirror);
      const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 16), mat(0x444444));
      scope.position.set(2.5, 1.5, 1); group.add(scope);
      return {
        group, wire, clamp, masses, mirrorGroup,
        dispose() { scene.remove(group); group.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); }
      };
    },
    update(refs, t, step, ctx) {
      const { wire, clamp, masses, mirrorGroup } = refs;
      const numMasses = step >= 2 ? Math.floor(t * (step === 4 ? (4 - t * 4) : 6)) + 1 : (step >= 2 ? 1 : 0);
      const deltaL = numMasses * 0.04;
      wire.scale.y = 1 + deltaL / 4;
      clamp.position.y = 0.8 - deltaL;
      masses.position.y = 0.6 - deltaL;
      mirrorGroup.position.y = 0.7 - deltaL;
      while (masses.children.length < Math.max(0, numMasses)) {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.1, 20), mat(0x555555, 0.7, 0.3));
        m.position.y = -masses.children.length * 0.1; m.castShadow = true;
        masses.add(m);
      }
      while (masses.children.length > Math.max(0, numMasses)) {
        const m = masses.children[masses.children.length - 1];
        masses.remove(m); m.geometry.dispose(); m.material.dispose();
      }
    },
  },
  data: null,
};