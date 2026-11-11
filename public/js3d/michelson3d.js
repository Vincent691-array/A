// 3D迈克尔逊干涉测波长 - 原理+操作阶段
import * as THREE from 'three';

const metalMat = () => new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 0.8, roughness: 0.3 });

function makeMichelsonApparatus(THREE) {
  const g = new THREE.Group();
  const m = metalMat();

  const laser = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 16), new THREE.MeshStandardMaterial({ color: 0xff4466, emissive: 0x440011 }));
  laser.rotation.z = Math.PI / 2;
  laser.position.set(-2.5, 0, 0);
  laser.castShadow = true;
  g.add(laser);

  const bsMat = new THREE.MeshPhysicalMaterial({ color: 0x88ccff, transparent: true, opacity: 0.4, transmission: 0.5 });
  const bs = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 0.6), bsMat);
  bs.position.set(-1.0, 0, 0);
  bs.rotation.y = Math.PI / 4;
  g.add(bs);

  const mirrorMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.95, roughness: 0.05 });
  const m1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 0.5), mirrorMat);
  m1.position.set(-1.0, 1.0, 0);
  g.add(m1);

  const m2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 0.5), mirrorMat);
  m2.position.set(0.5, 0, 0);
  g.add(m2);

  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.6, 0.6), new THREE.MeshStandardMaterial({ color: 0x223344, roughness: 0.9 }));
  screen.position.set(-1.0, -1.0, 0);
  g.add(screen);

  const base = new THREE.Mesh(new THREE.BoxGeometry(4, 0.08, 1.5), m);
  base.position.y = -0.35; base.receiveShadow = true;
  g.add(base);

  return { group: g, laser, bs, m1, m2, screen };
}

export const Michelson3D = {
  info: '用迈克尔逊干涉仪，动镜移动距离Δd时条纹变化N条，由 2Δd=Nλ 求波长 λ=2Δd/N',

  principle: {
    steps: [
      { title: '干涉仪光路', desc: '激光经分束板G₁分成两束，分别射向固定镜M₁和动镜M₂，反射后合束干涉。3D可拖拽查看光路', duration: 4 },
      { title: '分束与合束', desc: 'G₁半透半反，光束1：G₁→M₁→G₁→屏；光束2：G₁→M₂→G₁→屏，两束光叠加', duration: 4 },
      { title: '光程差与条纹', desc: '两束光程差 δ=2d（d为M₂到G₁距离），δ=kλ时亮纹，δ=(k+½)λ时暗纹，呈同心圆环', duration: 4 },
      { title: '动镜移动与条纹变化', desc: 'M₂移动Δd，光程差变化2Δd，每变化λ出现一次条纹，N=2Δd/λ', duration: 4 },
      { title: '求波长公式', desc: '测动镜移动Δd时条纹变化数N，则 λ = 2Δd/N', duration: 3 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);
      const parts = makeMichelsonApparatus(THREE);
      group.add(parts.group);

      const lineMat = new THREE.LineBasicMaterial({ color: 0xff4466 });
      const pathGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-2.25, 0, 0), new THREE.Vector3(-1.0, 0, 0),
        new THREE.Vector3(-1.0, 1.0, 0), new THREE.Vector3(-1.0, 0, 0),
        new THREE.Vector3(0.5, 0, 0), new THREE.Vector3(-1.0, 0, 0),
        new THREE.Vector3(-1.0, -1.0, 0),
      ]);
      const pathLine = new THREE.Line(pathGeo, lineMat);
      group.add(pathLine);

      const ringMat = new THREE.LineBasicMaterial({ color: 0xff4466, transparent: true, opacity: 0.8 });
      const rings = [];
      for (let i = 0; i < 8; i++) {
        const r = 0.1 + i * 0.08;
        const geo = new THREE.BufferGeometry().setFromPoints(
          Array.from({ length: 32 }, (_, j) => {
            const a = (j / 32) * Math.PI * 2;
            return new THREE.Vector3(r * Math.cos(a), -1.0, r * Math.sin(a));
          })
        );
        const ring = new THREE.LineLoop(geo, ringMat);
        ring.position.x = -1.0;
        group.add(ring);
        rings.push({ mesh: ring, r });
      }

      return {
        group, m2: parts.m2, rings,
        dispose() {
          scene.remove(group);
          group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
        }
      };
    },
    update(refs, t, step, ctx) {
      const { m2, rings } = refs;
      let m2Off = 0, ringAnim = false;

      if (step === 0) {
        const ang = t * Math.PI * 0.25;
        ctx.camera.position.set(5 * Math.cos(ang + 0.8), 3.5, 5 * Math.sin(ang + 0.8));
        ctx.controls.target.set(-0.5, 0, 0);
      } else if (step === 1) {
      } else if (step === 2) {
        ringAnim = true;
      } else if (step === 3) {
        m2Off = 0.15 * Math.sin(t * Math.PI);
        ringAnim = true;
      } else if (step === 4) {
        ringAnim = true;
      }

      m2.position.x = 0.5 + m2Off;

      if (ringAnim) {
        const offset = t * Math.PI * 4;
        for (let i = 0; i < rings.length; i++) {
          const bright = 0.5 + 0.5 * Math.cos(offset + i * 0.8);
          rings[i].mesh.material.opacity = bright * 0.8;
        }
      } else {
        for (const r of rings) r.mesh.material.opacity = 0.3;
      }
    },
  },

  procedure: {
    steps: [
      { title: '开启He-Ne激光', desc: '操作：先开激光电源，等He-Ne激光器输出稳定（约15分钟），光斑呈红色632.8nm。\n原理：He-Ne激光单色性好、相干长度长，是迈克尔逊干涉的理想光源。\n注意：激光器预热期间不要直视光束；光束要水平，高度对准分束板中心。', duration: 4 },
      { title: '调节干涉仪光路', desc: '操作：调M₁和M₂背后的螺丝，使两束反射光重合于屏上，出现干涉条纹。\n原理：两束光要严格平行重合才能干涉，调螺丝改变镜面倾斜使光路对准。\n注意：调螺丝要轻，微调即可；先粗调再细调，看到条纹后不再动镜面。', duration: 5 },
      { title: '调出等倾条纹', desc: '操作：微调M₂使条纹呈同心圆环（等倾干涉），条纹清晰疏密适中。\n原理：M₁和M₂严格垂直时等倾条纹（圆环）；略微倾斜则等厚条纹（直纹）。\n注意：圆环中心在视场中央；条纹太密或太疏都影响计数。', duration: 4 },
      { title: '移动动镜数条纹', desc: '操作：转动测微鼓轮使M₂单向移动，同时数屏上从中心冒出（或吞入）的条纹数N，记M₂位移Δd。\n原理：M₂每移动λ/2，光程差变化λ，条纹变化1条，故N=2Δd/λ。\n注意：必须单向移动防回程间隙；数100~200条条纹减小误差；鼓轮读数估读到0.0001mm。', duration: 5 },
      { title: '计算波长', desc: '操作：λ=2Δd/N，多组测量取平均，与He-Ne激光公认值632.8nm比较。\n原理：迈克尔逊干涉仪精度极高，可测到纳米级波长。\n注意：每组测量后反向移动再正向测（仍需避开回程）；检查仪器零点。', duration: 3 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);
      const parts = makeMichelsonApparatus(THREE);
      group.add(parts.group);

      const ringMat = new THREE.LineBasicMaterial({ color: 0xff4466, transparent: true, opacity: 0.8 });
      const rings = [];
      for (let i = 0; i < 8; i++) {
        const r = 0.1 + i * 0.08;
        const geo = new THREE.BufferGeometry().setFromPoints(
          Array.from({ length: 32 }, (_, j) => {
            const a = (j / 32) * Math.PI * 2;
            return new THREE.Vector3(r * Math.cos(a), -1.0, r * Math.sin(a));
          })
        );
        const ring = new THREE.LineLoop(geo, ringMat);
        ring.position.x = -1.0;
        group.add(ring);
        rings.push({ mesh: ring });
      }

      return {
        group, m2: parts.m2, rings,
        dispose() {
          scene.remove(group);
          group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
        }
      };
    },
    update(refs, t, step, ctx) {
      const { m2, rings } = refs;
      let m2Off = 0, ringAnim = false, speed = 4;

      if (step === 0) {
      } else if (step === 1) {
      } else if (step === 2) {
        ringAnim = true; speed = 2;
      } else if (step === 3) {
        m2Off = 0.2 * Math.sin(t * Math.PI);
        ringAnim = true; speed = 8;
      } else if (step === 4) {
        ringAnim = true; speed = 4;
      }

      m2.position.x = 0.5 + m2Off;

      if (ringAnim) {
        const offset = t * Math.PI * speed;
        for (let i = 0; i < rings.length; i++) {
          const bright = 0.5 + 0.5 * Math.cos(offset + i * 0.8);
          rings[i].mesh.material.opacity = bright * 0.8;
        }
      }
    },
  },
  data: null,
};