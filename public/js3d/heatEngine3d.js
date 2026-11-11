// 3D空气热机效率测定 - 原理+操作阶段
import * as THREE from 'three';

const metalMat = () => new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 0.8, roughness: 0.3 });

function makeHeatEngine(THREE) {
  const g = new THREE.Group();
  const m = metalMat();

  const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2.0, 32), new THREE.MeshPhysicalMaterial({ color: 0xaaccff, transparent: true, opacity: 0.3, transmission: 0.6 }));
  cylinder.rotation.z = Math.PI / 2;
  cylinder.castShadow = true;
  g.add(cylinder);

  const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.2, 24), new THREE.MeshStandardMaterial({ color: 0xff4466, metalness: 0.6, roughness: 0.3 }));
  piston.rotation.z = Math.PI / 2;
  piston.castShadow = true;
  g.add(piston);

  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 8), m);
  rod.position.set(1.5, 0, 0);
  rod.rotation.z = Math.PI / 2;
  g.add(rod);

  const flywheel = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.05, 16, 48), new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 }));
  flywheel.position.set(2.5, 0, 0);
  flywheel.castShadow = true;
  g.add(flywheel);

  const hotPlate = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.8), new THREE.MeshStandardMaterial({ color: 0xff3300, emissive: 0x441100 }));
  hotPlate.position.set(-1.2, 0, 0);
  g.add(hotPlate);

  const coldPlate = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.8), new THREE.MeshStandardMaterial({ color: 0x3366ff, emissive: 0x001144 }));
  coldPlate.position.set(1.2, 0, 0);
  g.add(coldPlate);

  const base = new THREE.Mesh(new THREE.BoxGeometry(5, 0.08, 1.5), m);
  base.position.y = -0.5; base.receiveShadow = true;
  g.add(base);

  return { group: g, piston, rod, flywheel, hotPlate, coldPlate };
}

export const HeatEngine3D = {
  info: '空气热机将热能转为机械能，测实际效率η并与卡诺效率ηc=1-T₂/T₁比较',

  principle: {
    steps: [
      { title: '热机模型', desc: '空气热机通过气缸内空气在高温热源吸热、低温热源放热，推动活塞做功。3D可拖拽查看结构', duration: 4 },
      { title: '热机循环', desc: '空气经历等温膨胀→等容冷却→等温压缩→等容加热的循环，P-V图上形成闭合曲线', duration: 4 },
      { title: '热机效率', desc: '效率 η = W/Q₁（输出功/吸热量），实际效率因摩擦、漏气等损失低于理论值', duration: 4 },
      { title: '卡诺效率', desc: '理想可逆热机效率上限 ηc = 1 - T₂/T₁，仅与高低温热源温度有关', duration: 4 },
      { title: '比较分析', desc: '测量不同温差下的实际效率η，与卡诺效率ηc比较，分析损失来源', duration: 3 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);
      const parts = makeHeatEngine(THREE);
      group.add(parts.group);

      return {
        group, ...parts,
        dispose() {
          scene.remove(group);
          group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
        }
      };
    },
    update(refs, t, step, ctx) {
      const { piston, rod, flywheel } = refs;
      const phase = t * Math.PI * 2;

      if (step === 0) {
        const ang = t * Math.PI * 0.25;
        ctx.camera.position.set(5 * Math.cos(ang + 0.8), 3, 5 * Math.sin(ang + 0.8));
        ctx.controls.target.set(0.5, 0, 0);
      }

      const speed = step === 0 ? 1 : (step === 4 ? 2 : 1.5);
      const p = Math.sin(t * Math.PI * 2 * speed);
      piston.position.x = p * 0.6;
      rod.position.x = 1.5 + p * 0.3;
      flywheel.rotation.z = -t * Math.PI * 2 * speed;
    },
  },

  procedure: {
    steps: [
      { title: '组装空气热机', desc: '操作：将热机气缸连接高温热源（电加热）和低温热源（水冷），活塞连杆接飞轮。\n原理：热机通过气缸内空气吸热膨胀推动活塞做功，经连杆带动飞轮输出机械能。\n注意：各连接处密封良好避免漏气；飞轮转动灵活无卡阻。', duration: 4 },
      { title: '加热至稳态', desc: '操作：开启电加热，等待高温端温度T₁稳定（约5分钟），记录T₁和低温端T₂。\n原理：稳态下热机循环稳定，输出功率恒定，此时测量才有意义。\n注意：温度稳定指1分钟内变化<0.5°C；热电偶测温要贴紧热源。', duration: 4 },
      { title: '测量输出功率', desc: '操作：用测功器或发电机测热机输出功率P_out，同时测输入电功率P_in。\n原理：实际效率 η = P_out / P_in，电加热功率即近似吸热量Q₁的功率。\n注意：测功器要校准；P_out和P_in同时读数；测3次取平均。', duration: 4 },
      { title: '改变温差测多组', desc: '操作：调节加热功率改变T₁，重复步骤2-3，测5组不同温差下的效率。\n原理：温差越大卡诺效率越高，实际效率也相应增大，但比值η/ηc可能变化。\n注意：每次改变T₁后要等稳态再测；T₁范围400~600K为宜。', duration: 4 },
      { title: '比较卡诺效率', desc: '操作：计算各组ηc=1-T₂/T₁，作η-T₁图与ηc曲线比较，分析损失来源。\n原理：η<ηc始终成立，差距来自摩擦、漏气、非等温过程等不可逆因素。\n注意：差距大说明热机效率低，可分析改进方向（减少摩擦、改善密封）。', duration: 3 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);
      const parts = makeHeatEngine(THREE);
      group.add(parts.group);

      return {
        group, ...parts,
        dispose() {
          scene.remove(group);
          group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
        }
      };
    },
    update(refs, t, step, ctx) {
      const { piston, rod, flywheel, hotPlate } = refs;
      const speed = step === 0 ? 0.5 : (step >= 2 ? 2 : 1);
      const p = Math.sin(t * Math.PI * 2 * speed);
      piston.position.x = p * 0.6;
      rod.position.x = 1.5 + p * 0.3;
      flywheel.rotation.z = -t * Math.PI * 2 * speed;

      if (step >= 1) {
        const heat = 0.5 + 0.5 * Math.sin(t * Math.PI);
        hotPlate.material.emissive.setRGB(0.3 + heat * 0.3, 0.05, 0);
      }
    },
  },
  data: null,
};