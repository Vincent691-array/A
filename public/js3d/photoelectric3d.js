// 3D光电效应测普朗克常数 - 原理+操作阶段
import * as THREE from 'three';

const metalMat = () => new THREE.MeshStandardMaterial({ color: 0x445566, metalness: 0.7, roughness: 0.3 });

function makePhotoTube(THREE) {
  const g = new THREE.Group();
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x88aacc, transparent: true, opacity: 0.25, roughness: 0.1, transmission: 0.7 });
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2.0, 32), glassMat);
  tube.rotation.z = Math.PI / 2;
  g.add(tube);
  const cathodeMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9, roughness: 0.2 });
  const cathode = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 0.6), cathodeMat);
  cathode.position.x = -0.8;
  g.add(cathode);
  const anodeMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 });
  const anode = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 12), anodeMat);
  anode.position.x = 0.8;
  g.add(anode);
  return { group: g, cathode, anode };
}

export const Photoelectric3D = {
  info: '用爱因斯坦方程 hν=W+eU₀，测不同频率ν下的截止电压U₀，作U₀-ν图求斜率=h/e得普朗克常数h',

  principle: {
    steps: [
      { title: '光电效应现象', desc: '光照射金属表面，金属发射电子（光电子）。只有ν>ν₀（极限频率）才发生，与光强无关', duration: 4 },
      { title: '截止电压U₀', desc: '加反向电压，光电子被减速。当反向电压=U₀时光电流恰好为零，eU₀等于光电子最大初动能', duration: 4 },
      { title: '爱因斯坦方程', desc: 'hν = W + Ekm，其中W为逸出功，Ekm为最大初动能。又 Ekm = eU₀，故 hν = W + eU₀', duration: 4 },
      { title: 'U₀-ν线性关系', desc: 'U₀ = (h/e)ν - W/e，U₀与ν成线性关系，斜率=h/e，截距=-W/e', duration: 4 },
      { title: '求普朗克常数', desc: '测多组(ν, U₀)作图，求斜率k，则 h = k·e（e=1.6×10⁻¹⁹C）', duration: 3 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);

      const parts = makePhotoTube(THREE);
      group.add(parts.group);

      const lightMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.6 });
      const lightBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8), lightMat);
      lightBeam.rotation.z = Math.PI / 2;
      lightBeam.position.set(-1.8, 0, 0);
      group.add(lightBeam);

      const electronMat = new THREE.MeshStandardMaterial({ color: 0xff4466, emissive: 0x440011 });
      const electrons = [];
      for (let i = 0; i < 8; i++) {
        const e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), electronMat);
        e.position.set(-0.7, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4);
        e.userData = { speed: 0.3 + Math.random() * 0.3, offset: i };
        e.visible = false;
        group.add(e);
        electrons.push(e);
      }

      const wireMat = new THREE.LineBasicMaterial({ color: 0xff4466 });
      const wireGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0.8, 0, 0), new THREE.Vector3(1.5, 0, 0), new THREE.Vector3(1.5, -1, 0),
        new THREE.Vector3(-1.5, -1, 0), new THREE.Vector3(-1.5, 0, 0), new THREE.Vector3(-0.8, 0, 0),
      ]);
      const wire = new THREE.Line(wireGeo, wireMat);
      wire.visible = false;
      group.add(wire);

      return {
        group, lightBeam, electrons, wire, cathode: parts.cathode, anode: parts.anode,
        dispose() {
          scene.remove(group);
          group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
        }
      };
    },
    update(refs, t, step, ctx) {
      const { lightBeam, electrons, wire } = refs;
      let showElectrons = false, showWire = false;

      if (step === 0) {
        const ang = t * Math.PI * 0.3;
        ctx.camera.position.set(4 * Math.cos(ang + 0.5), 2.5, 4 * Math.sin(ang + 0.5));
        ctx.controls.target.set(0, 0, 0);
      } else if (step === 1) {
        showElectrons = true; showWire = true;
      } else if (step === 2) {
        showWire = true;
      } else if (step === 3) {
        showWire = true;
      } else if (step === 4) {
        showWire = true;
      }

      lightBeam.material.opacity = 0.4 + 0.2 * Math.sin(t * Math.PI * 4);
      wire.visible = showWire;

      for (const e of electrons) {
        e.visible = showElectrons;
        if (showElectrons) {
          const phase = (t * e.userData.speed + e.userData.offset * 0.15) % 1;
          e.position.x = -0.7 + phase * 1.5;
          e.position.y = Math.sin(phase * Math.PI) * 0.1 * Math.sign(Math.sin(e.userData.offset));
        }
      }
    },
  },

  procedure: {
    steps: [
      { title: '连接光电管电路', desc: '操作：光电管阴极K接电压负端、阳极A接正端，微电流计串接，电压表并联。\n原理：加反向电压（K正A负）测截止电压，微电流计检测光电流为零点。\n注意：光电管避光罩不能漏光；接线前先断开电源。', duration: 4 },
      { title: '微电流计调零', desc: '操作：遮住光电管，调节微电流计零点，使读数为零。\n原理：无光照时光电流应为零，调零消除暗电流和零漂影响。\n注意：微电流计灵敏度极高（10⁻¹²A），调零要耐心；预热15分钟再调。', duration: 3 },
      { title: '换滤光片选频率', desc: '操作：依次换上不同波长的滤光片（如365/405/436/546/577nm），对应不同频率ν=c/λ。\n原理：滤光片从汞灯谱线中选出单色光，每片对应一个确定频率。\n注意：换滤光片要轻，避免振动光电管；记录每片对应波长。', duration: 4 },
      { title: '测截止电压U₀', desc: '操作：光照下缓慢增大反向电压，微电流计读数从有到零，记录电流恰好为零时的电压即U₀。\n原理：反向电压增大时光电流减小，电流为零时光电子最大初动能=eU₀。\n注意：U₀通常<2V；电流为零判断要仔细，多读几次取平均。', duration: 5 },
      { title: '作图求h', desc: '操作：以ν为横轴U₀为纵轴作图，过5个点拟合直线，求斜率k，h=k·e。\n原理：U₀-ν直线斜率=h/e是普适常数，与材料无关（截距才与逸出功有关）。\n注意：用最小二乘法拟合；检查线性关系是否良好（R²>0.99）。', duration: 4 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);
      const parts = makePhotoTube(THREE);
      group.add(parts.group);

      const lightMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.6 });
      const lightBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8), lightMat);
      lightBeam.rotation.z = Math.PI / 2;
      lightBeam.position.set(-1.8, 0, 0);
      group.add(lightBeam);

      const filterMat = new THREE.MeshStandardMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.5 });
      const filter = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.0, 1.0), filterMat);
      filter.position.set(-1.2, 0, 0);
      group.add(filter);

      return {
        group, lightBeam, filter,
        dispose() {
          scene.remove(group);
          group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
        }
      };
    },
    update(refs, t, step, ctx) {
      const { lightBeam, filter } = refs;
      const colors = [0x9933ff, 0x6644ff, 0x4488ff, 0x44ff44, 0xffdd00];
      if (step === 2) {
        const idx = Math.floor(t * 5) % 5;
        filter.material.color.setHex(colors[idx]);
        filter.visible = true;
      } else {
        filter.visible = step >= 2;
        if (filter.visible) filter.material.color.setHex(colors[Math.floor(t * 5) % 5]);
      }
      lightBeam.material.opacity = 0.4 + 0.2 * Math.sin(t * Math.PI * 4);
    },
  },
  data: null,
};