// 3D牛顿环测曲率半径 - 含详细显微镜调节步骤
import * as THREE from 'three';

const mat = (c, m = 0.6, r = 0.2) => new THREE.MeshStandardMaterial({ color: c, metalness: m, roughness: r });

export const NewtonRing3D = {
  info: '利用等厚干涉原理，通过测量牛顿环直径计算平凸透镜的曲率半径 R = (D_m²-D_n²)/(4λ(m-n))',

  principle: {
    steps: [
      { title: '牛顿环装置', desc: '平凸透镜放在平玻璃板上，透镜凸面与玻璃板之间形成空气薄膜。3D视角可旋转查看装置结构', duration: 4 },
      { title: '单色光垂直入射', desc: '钠光灯发出的单色光（λ=589.3nm）垂直入射，经空气膜上下表面反射产生干涉', duration: 3 },
      { title: '等厚干涉原理', desc: '同一圆环上空气膜厚度相同，光程差 δ = 2d + λ/2 相同，形成同心圆环', duration: 4 },
      { title: '暗环条件', desc: '暗环：δ = (k+1)λ，膜厚 d = r²/(2R)，推得 r² = kRλ，即 D² = 4kRλ', duration: 4 },
      { title: '推导R公式', desc: '为减小误差取两环之差：D_m² - D_n² = 4Rλ(m-n)，故 R = (D_m²-D_n²)/(4λ(m-n))', duration: 3 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);

      const glass = new THREE.Mesh(new THREE.BoxGeometry(4, 0.15, 4), mat(0x4fc3f7, 0.3, 0.1));
      glass.position.y = 0.08; glass.receiveShadow = true;
      group.add(glass);

      const lensGeo = new THREE.SphereGeometry(2, 32, 32, 0, Math.PI * 2, 0, Math.PI / 3);
      const lens = new THREE.Mesh(lensGeo, mat(0x4fc3f7, 0.3, 0.1));
      lens.position.y = 0.15; lens.scale.y = 0.3; lens.castShadow = true;
      group.add(lens);

      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 20), new THREE.MeshStandardMaterial({ color: 0xffeb3b, emissive: 0xff9800, emissiveIntensity: 0.8 }));
      lamp.position.set(0, 4, 0);
      group.add(lamp);
      const lampLight = new THREE.PointLight(0xffeb3b, 1, 10);
      lampLight.position.set(0, 4, 0);
      group.add(lampLight);

      const ringCanvas = document.createElement('canvas');
      ringCanvas.width = 512; ringCanvas.height = 512;
      const rctx = ringCanvas.getContext('2d');
      rctx.fillStyle = 'rgba(0,0,0,0)';
      rctx.fillRect(0, 0, 512, 512);
      for (let k = 1; k <= 15; k++) {
        const r = Math.sqrt(k * 6);
        rctx.strokeStyle = `rgba(255, 235, 59, ${0.8 / Math.sqrt(k)})`;
        rctx.lineWidth = 2;
        rctx.beginPath(); rctx.arc(256, 256, r * 8, 0, Math.PI * 2); rctx.stroke();
      }
      const ringTex = new THREE.CanvasTexture(ringCanvas);
      const rings = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 3.5), new THREE.MeshBasicMaterial({ map: ringTex, transparent: true, opacity: 0 }));
      rings.rotation.x = -Math.PI / 2; rings.position.y = 0.16;
      group.add(rings);

      const rayMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b, transparent: true, opacity: 0.5 });
      const ray = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.5, 8), rayMat);
      ray.position.y = 2.2; ray.visible = false;
      group.add(ray);

      return {
        group, lens, glass, lamp, rings, ray,
        dispose() { scene.remove(group); group.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } }); }
      };
    },
    update(refs, t, step, ctx) {
      const { group, rings, ray } = refs;
      if (step === 0) {
        const ang = t * Math.PI * 0.3;
        ctx.camera.position.set(6 * Math.cos(ang + 0.5), 4, 6 * Math.sin(ang + 0.5));
        ctx.controls.target.set(0, 1, 0);
        rings.material.opacity = 0; ray.visible = false;
      } else if (step === 1) { ray.visible = true; rings.material.opacity = 0; }
      else if (step === 2) { ray.visible = true; rings.material.opacity = 0.4 * t; }
      else if (step >= 3) { ray.visible = true; rings.material.opacity = 0.7; group.rotation.y = t * Math.PI * 0.2; }
    },
  },

  procedure: {
    steps: [
      { title: '认识读数显微镜', desc: '读数显微镜由目镜、物镜、镜筒、载物台、粗调焦螺旋、微动鼓轮组成。它既能放大物体又能精密测量位移（精度0.01mm）。3D视角可旋转查看各部件位置关系', duration: 5 },
      { title: '①调节目镜（看清叉丝）', desc: '操作：旋转目镜透镜，改变目镜与分划板距离，直到十字叉丝最清晰。\n原理：每个人视力不同，需先调目镜使叉丝（分划板）成像在自己明视距离处。\n关键：调好后整个实验过程中目镜不再动！后续只调焦螺旋。', duration: 4 },
      { title: '②粗调焦找环（镜筒大幅移动）', desc: '操作：旋转粗调焦螺旋，镜筒大幅上下移动，使物镜对准牛顿环装置，直到视野中出现干涉环（可能模糊）。\n注意：从外侧观察镜筒下降位置，避免物镜压坏透镜！先使镜筒接近载物台，再缓慢上抬寻找像。', duration: 5 },
      { title: '③微调焦使清晰（最关键一步）', desc: '操作：旋转微动鼓轮，镜筒微量上下移动，直到干涉环最清晰、最锐利。\n原理：粗调只能找到像的大致位置，微调才能精确对焦。\n注意：微动鼓轮移动量小，旋转要慢；环中心应为一个暗点（非亮斑）。', duration: 4 },
      { title: '④叉丝左移到m级暗环', desc: '操作：旋转微动鼓轮，使十字叉丝竖丝从中心缓慢向左移到第m级暗环（如m=15）的暗线正中央。\n原理：测直径需读左右两个坐标，竖丝要对准暗环最暗处。\n注意：竖丝应与暗环相切而非相交，对准瞬间读数。', duration: 4 },
      { title: '⑤记录读数 x左', desc: '操作：读取微动鼓轮主尺+副尺读数，记为 x左（如12.500mm）。\n注意：读数时眼睛正对刻度避免视差；主尺读整数+副尺读小数（副尺50格=0.5mm，每格0.01mm）。', duration: 3 },
      { title: '⑥叉丝右移到m级暗环', desc: '操作：继续单向旋转微动鼓轮，竖丝越过中心向右移到第m级暗环右侧暗线正中央，记读数 x右。\n关键：必须单向旋转！中途不能反向，以消除齿轮空程误差（反向时齿轮间隙导致读数偏差）。', duration: 4 },
      { title: '⑦计算直径D并逐级测量', desc: '操作：直径 D_m = |x右 - x左|。依次测 m=15,14,13,...,6 和 n=5,4,...各级直径（共测10级以上）。\n原理：用 D_m²-D_n² 而非单环半径，可消除中心点不确定性误差；取多组数据用逐差法或作图法求 R。\n公式：R = (D_m²-D_n²)/(4λ(m-n))，λ=589.3nm。', duration: 5 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);

      // === 读数显微镜3D模型 ===
      // 底座
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.15, 24), mat(0x444444));
      base.position.y = 0.075; base.receiveShadow = true;
      group.add(base);

      // 立柱
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4, 12), mat(0x666666));
      pillar.position.set(0, 2, 0.9); pillar.castShadow = true;
      group.add(pillar);

      // 载物台
      const stage = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.08, 30), mat(0x555555));
      stage.position.set(0, 1.3, 0); stage.receiveShadow = true;
      group.add(stage);

      // 牛顿环装置（载物台上）
      const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 30), mat(0x4fc3f7, 0.3, 0.1));
      glass.position.y = 1.38;
      group.add(glass);
      const lensGeo = new THREE.SphereGeometry(0.5, 24, 24, 0, Math.PI * 2, 0, Math.PI / 3);
      const lens = new THREE.Mesh(lensGeo, mat(0x4fc3f7, 0.3, 0.1));
      lens.position.y = 1.42; lens.scale.y = 0.3;
      group.add(lens);

      // 镜筒组（可上下移动调焦）
      const tubeGroup = new THREE.Group();
      tubeGroup.position.set(0, 2.8, 0);
      group.add(tubeGroup);

      // 镜筒
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.4, 20), mat(0x333333));
      tubeGroup.add(tube);

      // 目镜（可旋转调节）
      const eyepiece = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.25, 20), mat(0x222222, 0.3, 0.5));
      eyepiece.position.y = 0.82;
      tubeGroup.add(eyepiece);
      // 目镜滚花纹
      const eyepieceRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.02, 8, 20), mat(0x555555));
      eyepieceRing.position.y = 0.82; eyepieceRing.rotation.x = Math.PI / 2;
      tubeGroup.add(eyepieceRing);

      // 物镜
      const objective = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.25, 20), mat(0x444444));
      objective.position.y = -0.82;
      tubeGroup.add(objective);

      // 粗调焦螺旋（大旋钮）
      const coarseKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.12, 20), mat(0x666666));
      coarseKnob.position.set(0.28, -0.2, 0); coarseKnob.rotation.z = Math.PI / 2;
      tubeGroup.add(coarseKnob);

      // 微动鼓轮（小旋钮）
      const fineKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 20), mat(0x888888));
      fineKnob.position.set(0.28, -0.4, 0); fineKnob.rotation.z = Math.PI / 2;
      tubeGroup.add(fineKnob);

      // 钠光源（侧面）
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffeb3b, emissive: 0xff9800, emissiveIntensity: 0.6 }));
      lamp.position.set(-1.8, 1.5, 0);
      group.add(lamp);
      const lampLight = new THREE.PointLight(0xffeb3b, 0.6, 6);
      lampLight.position.set(-1.8, 1.5, 0);
      group.add(lampLight);

      // === 视野模拟（从目镜看到的画面）===
      const viewCanvas = document.createElement('canvas');
      viewCanvas.width = 256; viewCanvas.height = 256;
      const vctx = viewCanvas.getContext('2d');
      const viewTex = new THREE.CanvasTexture(viewCanvas);
      const viewPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({ map: viewTex }));
      viewPlane.position.set(-3, 3, 0);
      group.add(viewPlane);

      // 视野圆形边框
      const viewFrame = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.03, 8, 40), mat(0x00d4ff, 0.8, 0.2));
      viewFrame.position.set(-3, 3, 0.01);
      group.add(viewFrame);

      // 视野标签
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 256; labelCanvas.height = 64;
      const lctx = labelCanvas.getContext('2d');
      lctx.fillStyle = '#00d4ff'; lctx.font = 'bold 24!20px sans-serif'; lctx.textAlign = 'center';
      lctx.fillText('目镜视野', 128, 40);
      const labelTex = new THREE.CanvasTexture(labelCanvas);
      const label = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.3), new THREE.MeshBasicMaterial({ map: labelTex, transparent: true }));
      label.position.set(-3, 3.95, 0);
      group.add(label);

      const drawView = (blur, showRings, crosshairX, reading) => {
        const c = vctx;
        c.fillStyle = '#0a0a1a'; c.fillRect(0, 0, 256, 256);
        // 干涉环
        if (showRings > 0) {
          c.globalAlpha = showRings * (1 - blur * 0.7);
          for (let k = 1; k <= 12; k++) {
            const r = Math.sqrt(k * 5) * (1 + blur * 0.4);
            c.strokeStyle = `rgba(255, 235, 59, ${0.9 / Math.sqrt(k)})`;
            c.lineWidth = 2;
            c.beginPath(); c.arc(128, 128, r, 0, Math.PI * 2); c.stroke();
          }
          c.globalAlpha = 1;
        }
        // 十字叉丝
        c.strokeStyle = `rgba(255, 255, 255, ${1 - blur * 0.4})`;
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(128 + crosshairX, 10); c.lineTo(128 + crosshairX, 246);
        c.moveTo(10, 128); c.lineTo(246, 128);
        c.stroke();
        // 读数显示
        if (reading !== undefined) {
          c.fillStyle = '#00d4ff'; c.font = 'bold 16px monospace'; c.textAlign = 'left';
          c.fillText('x = ' + reading + ' mm', 12, 24);
        }
        viewTex.needsUpdate = true;
      };

      return {
        group, tubeGroup, eyepiece, eyepieceRing, coarseKnob, fineKnob, viewPlane, drawView,
        dispose() { scene.remove(group); group.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } }); }
      };
    },
    update(refs, t, step, ctx) {
      const { tubeGroup, eyepiece, eyepieceRing, coarseKnob, fineKnob, drawView } = refs;

      if (step === 0) {
        // 旋转展示显微镜结构
        const ang = t * Math.PI * 0.4;
        ctx.camera.position.set(5 * Math.cos(ang + 0.8), 3.5, 5 * Math.sin(ang + 0.8));
        ctx.controls.target.set(0, 2, 0);
        drawView(0.7, 0, 0);
      } else if (step === 1) {
        // 调节目镜：目镜旋转，叉丝从模糊到清晰
        eyepiece.rotation.y = t * Math.PI * 6;
        eyepieceRing.rotation.z = t * Math.PI * 6;
        drawView(0.8 * (1 - t), 0, 0);
      } else if (step === 2) {
        // 粗调焦：螺旋旋转，镜筒下移，干涉环出现
        coarseKnob.rotation.x = t * Math.PI * 5;
        tubeGroup.position.y = 2.8 - t * 0.35;
        drawView(0.5 * (1 - t * 0.6), t * 0.7, 0);
      } else if (step === 3) {
        // 微调焦：微动鼓轮旋转，环变清晰
        fineKnob.rotation.x = t * Math.PI * 10;
        drawView(0.2 * (1 - t), 0.7 + t * 0.3, 0);
      } else if (step === 4) {
        // 叉丝左移到m级
        fineKnob.rotation.x = t * Math.PI * 8;
        const x = -t * 70;
        drawView(0, 1, x, (15.000 - t * 2.5).toFixed(3));
      } else if (step === 5) {
        // 读数x左
        drawView(0, 1, -70, '12.500');
      } else if (step === 6) {
        // 叉丝右移到m级
        fineKnob.rotation.x = t * Math.PI * 8;
        const x = -70 + t * 140;
        drawView(0, 1, x, (12.500 + t * 5.9).toFixed(3));
      } else if (step === 7) {
        // 计算直径
        drawView(0, 1, 0, 'D=5.950');
      }
    },
  },
  data: null,
};