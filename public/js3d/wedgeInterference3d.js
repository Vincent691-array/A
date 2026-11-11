// 3D等厚干涉测细丝直径（劈尖法）- 原理+操作阶段
import * as THREE from 'three';

const glassMat = () => new THREE.MeshPhysicalMaterial({ color: 0x88ccff, transparent: true, opacity: 0.35, transmission: 0.6, roughness: 0.1 });

function makeWedgeApparatus(THREE) {
  const g = new THREE.Group();

  const bottomGlass = new THREE.Mesh(new THREE.BoxGeometry(4, 0.1, 2), glassMat());
  bottomGlass.position.y = 0; bottomGlass.receiveShadow = true; g.add(bottomGlass);

  const topGlass = new THREE.Mesh(new THREE.BoxGeometry(4, 0.1, 2), glassMat());
  topGlass.position.y = 0.15; topGlass.rotation.z = -0.03; g.add(topGlass);

  const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 2, 12), new THREE.MeshStandardMaterial({ color: 0xff4466, metalness: 0.7 }));
  wire.rotation.x = Math.PI / 2;
  wire.position.set(1.9, 0.12, 0);
  g.add(wire);

  const base = new THREE.Mesh(new THREE.BoxGeometry(5, 0.08, 3), new THREE.MeshStandardMaterial({ color: 0x445566, metalness: 0.5 }));
  base.position.y = -0.1; base.receiveShadow = true; g.add(base);

  return { group: g, bottomGlass, topGlass, wire };
}

export const WedgeInterference3D = {
  info: '劈尖干涉：两块玻璃片夹一细丝形成空气劈尖，单色光垂直入射产生等厚干涉条纹，D=L·λ/(2·Δx)',

  principle: {
    steps: [
      { title: '劈尖模型', desc: '两块玻璃片一端接触、另一端夹细丝，形成空气薄膜劈尖，夹角θ很小。3D可拖拽查看', duration: 4 },
      { title: '光程差', desc: '单色光垂直入射，在空气膜上下表面反射，光程差 δ=2d+λ/2（d为膜厚）', duration: 4 },
      { title: '干涉条件', desc: 'δ=kλ时亮纹，δ=(k+½)λ时暗纹。相邻条纹处膜厚差Δd=λ/2', duration: 4 },
      { title: '条纹间距', desc: '相邻条纹间距 Δx=λ/(2θ)，θ为劈尖角。条纹平行于接触棱边', duration: 4 },
      { title: '求细丝直径', desc: '劈尖长L处膜厚=D（细丝直径），D=L·θ=L·λ/(2·Δx)', duration: 3 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);
      const parts = makeWedgeApparatus(THREE);
      group.add(parts.group);

      const lightMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.5 });
      const lightBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.5, 8), lightMat);
      lightBeam.position.set(0, 1.5, 0);
      group.add(lightBeam);

      return {
        group, ...parts, lightBeam,
        dispose() {
          scene.remove(group);
          group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
        }
      };
    },
    update(refs, t, step, ctx) {
      const { lightBeam } = refs;

      if (step === 0) {
        const ang = t * Math.PI * 0.25;
        ctx.camera.position.set(4 * Math.cos(ang + 0.5), 3, 4 * Math.sin(ang + 0.5));
        ctx.controls.target.set(0, 0.2, 0);
      }
      lightBeam.material.opacity = 0.3 + 0.2 * Math.sin(t * Math.PI * 3);
    },
  },

  procedure: {
    steps: [
      { title: '制作劈尖', desc: '操作：取两块洁净玻璃片，一端接触（棱边），另一端夹待测细丝，用夹具固定。\n原理：两玻璃片夹细丝形成空气劈尖，夹角θ=D/L很小，满足等厚干涉条件。\n注意：玻璃片要洁净（用酒精擦拭）；接触端要紧密接触；细丝在棱边对侧且平行于棱边。', duration: 4 },
      { title: '放置读数显微镜', desc: '操作：将劈尖置于读数显微镜载物台，上方放钠灯（λ=589.3nm），调焦看清条纹。\n原理：钠灯提供单色光，读数显微镜可精确测量条纹位置（精度0.01mm）。\n注意：钠灯预热5分钟；显微镜从下往上调焦避免压坏物镜；条纹要清晰锐利。', duration: 4 },
      { title: '测量条纹间距', desc: '操作：用读数显微镜十字叉丝对准某暗纹中心记位置x₁，数n条条纹后对准记x_{n+1}，Δx=(x_{n+1}-x₁)/n。\n原理：相邻暗纹间距=λ/(2θ)，测多条取平均减小误差，n取10~20条。\n注意：十字叉丝从同一方向逼近条纹（防回程间隙）；条纹编号要准确。', duration: 5 },
      { title: '测量劈尖长度', desc: '操作：用读数显微镜测从棱边到细丝的距离L（棱边位置x₀，细丝位置x_L）。\n原理：L是劈尖的有效长度，D=L·θ=L·λ/(2·Δx)。\n注意：棱边位置要找准（条纹最密处）；L测3次取平均。', duration: 3 },
      { title: '计算细丝直径', desc: '操作：代入 D=L·λ/(2·Δx) 计算细丝直径，与螺旋测微器直接测量值比较。\n原理：劈尖干涉法可测微米级直径，精度高于螺旋测微器（0.01mm）。\n注意：λ用钠灯589.3nm；单位统一（L和Δx用mm，D结果用μm）。', duration: 3 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);
      const parts = makeWedgeApparatus(THREE);
      group.add(parts.group);

      const lightMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.5 });
      const lightBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.5, 8), lightMat);
      lightBeam.position.set(0, 1.5, 0);
      group.add(lightBeam);

      return {
        group, ...parts, lightBeam,
        dispose() {
          scene.remove(group);
          group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
        }
      };
    },
    update(refs, t, step, ctx) {
      const { lightBeam, wire } = refs;
      lightBeam.material.opacity = 0.3 + 0.2 * Math.sin(t * Math.PI * 3);
      if (step === 0) {
        wire.visible = EaseOut(t) > 0.5;
      }
    },
  },
  data: null,
};

function EaseOut(t) { return 1 - Math.pow(1 - t, 3); }