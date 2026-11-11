// 3D不良导体热导率测定（稳态平板法）- 原理+操作阶段
import * as THREE from 'three';

const metalMat = () => new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 0.8, roughness: 0.3 });

function makeThermalApparatus(THREE) {
  const g = new THREE.Group();
  const m = metalMat();

  const hotPlate = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.15, 32), new THREE.MeshStandardMaterial({ color: 0xff3300, emissive: 0x441100, metalness: 0.5 }));
  hotPlate.position.y = 1.0; hotPlate.castShadow = true; g.add(hotPlate);

  const sample = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.3, 32), new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 }));
  sample.position.y = 0.65; sample.castShadow = true; sample.receiveShadow = true; g.add(sample);

  const copperDisc = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.2, 32), new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.9, roughness: 0.2 }));
  copperDisc.position.y = 0.4; copperDisc.castShadow = true; copperDisc.receiveShadow = true; g.add(copperDisc);

  const stand1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8), m);
  stand1.position.set(-1.3, 0.75, 0); g.add(stand1);
  const stand2 = stand1.clone(); stand2.position.x = 1.3; g.add(stand2);

  const base = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.08, 2.0), m);
  base.position.y = -0.04; base.receiveShadow = true; g.add(base);

  return { group: g, hotPlate, sample, copperDisc };
}

export const ThermalConductivity3D = {
  info: '稳态平板法测不良导体热导率 λ = m·c·(dT/dt)·h / (π·R²·(T₁-T₂))',

  principle: {
    steps: [
      { title: '稳态平板法', desc: '样品夹在加热板（高温T₁）和散热铜盘（低温T₂）之间，稳态时热流连续。3D可拖拽查看', duration: 4 },
      { title: '稳态传热', desc: '稳态下样品内温度梯度恒定，通过样品的热流量等于铜盘散热量', duration: 4 },
      { title: '冷却速率', desc: '移去加热板，测铜盘自然冷却速率 dT/dt，由冷却速率求稳态散热功率', duration: 4 },
      { title: '热导率公式', desc: 'λ = m·c·(dT/dt)·h / (π·R²·(T₁-T₂))，m为铜盘质量，c=385J/(kg·K)', duration: 4 },
      { title: '适用条件', desc: '适用于热导率较低的不良导体（如橡胶、玻璃、木材），良导体需用其他方法', duration: 3 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);
      const parts = makeThermalApparatus(THREE);
      group.add(parts.group);

      const heatArrow = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1.3, 0), 0.5, 0xff4466, 0.1, 0.06);
      group.add(heatArrow);

      return {
        group, ...parts, heatArrow,
        dispose() {
          scene.remove(group);
          group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
        }
      };
    },
    update(refs, t, step, ctx) {
      const { hotPlate, copperDisc, heatArrow } = refs;

      if (step === 0) {
        const ang = t * Math.PI * 0.25;
        ctx.camera.position.set(4 * Math.cos(ang + 0.5), 3, 4 * Math.sin(ang + 0.5));
        ctx.controls.target.set(0, 0.6, 0);
      }

      if (step >= 1) {
        const heat = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);
        hotPlate.material.emissive.setRGB(0.3 + heat * 0.4, 0.05, 0);
        heatArrow.visible = true;
      } else {
        heatArrow.visible = false;
      }

      if (step === 2) {
        const cool = 1 - EaseOut(t);
        copperDisc.material.emissive.setRGB(cool * 0.3, cool * 0.1, 0);
      }
    },
  },

  procedure: {
    steps: [
      { title: '安装样品', desc: '操作：将待测样品（如橡胶片）夹在加热板和散热铜盘之间，测量样品厚度h。\n原理：样品夹在两板间，热流从高温板经样品传到低温铜盘。\n注意：样品要平整、与两板紧密接触（可涂薄层导热硅脂）；h用螺旋测微器测3处取平均。', duration: 4 },
      { title: '加热至稳态', desc: '操作：开启加热板，等待T₁和T₂都稳定（约30分钟），记录稳态温度T₁、T₂。\n原理：稳态时样品内温度梯度恒定，通过样品的热流等于铜盘向环境散热率。\n注意：稳态判据——T₁和T₂在5分钟内变化<0.1°C；热电偶测温要贴紧板面。', duration: 5 },
      { title: '测铜盘冷却速率', desc: '操作：移去加热板和样品，让铜盘单独自然冷却，记录T-t曲线求dT/dt（在T₂附近）。\n原理：稳态时铜盘散热率=样品传热率，冷却速率反映该散热率，故用dT/dt代替稳态散热。\n注意：冷却曲线在T₂附近求斜率（切线法或差分法）；环境温度要稳定。', duration: 5 },
      { title: '测量铜盘参数', desc: '操作：用天平称铜盘质量m，游标卡尺测铜盘半径R。\n原理：m和R用于计算铜盘散热面积πR²和热容mc。\n注意：m精确到0.1g，R测3次取平均；铜的比热容c=385 J/(kg·K)查表。', duration: 3 },
      { title: '计算热导率', desc: '操作：代入 λ = m·c·(dT/dt)·h / (π·R²·(T₁-T₂)) 计算热导率。\n原理：公式来自稳态热流连续性：样品传热率=铜盘散热率=mc·dT/dt。\n注意：单位统一（m用kg，h用m，R用m，dT/dt用K/s）；与文献值比较。', duration: 3 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);
      const parts = makeThermalApparatus(THREE);
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
      const { hotPlate, copperDisc, sample } = refs;

      if (step === 0) {
        const p = EaseOut(t);
        sample.scale.y = p;
      } else if (step === 1) {
        const heat = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);
        hotPlate.material.emissive.setRGB(0.3 + heat * 0.4, 0.05, 0);
      } else if (step === 2) {
        const cool = 1 - EaseOut(t);
        copperDisc.material.emissive.setRGB(cool * 0.3, cool * 0.1, 0);
        hotPlate.material.emissive.setRGB(0, 0, 0);
      }
    },
  },
  data: null,
};

function EaseOut(t) { return 1 - Math.pow(1 - t, 3); }