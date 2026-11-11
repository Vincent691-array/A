// 3D声速测定（驻波法）- 原理+操作阶段
import * as THREE from 'three';

const metalMat = () => new THREE.MeshStandardMaterial({ color: 0x445566, metalness: 0.7, roughness: 0.3 });

function makeTransducer(THREE, label) {
  const g = new THREE.Group();
  const m = metalMat();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.5, 24), m);
  body.rotation.z = Math.PI / 2;
  body.castShadow = true;
  g.add(body);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.35, 24), new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x002244 }));
  face.position.x = 0.25;
  face.rotation.y = Math.PI / 2;
  g.add(face);
  return g;
}

export const SoundSpeed3D = {
  info: '用驻波法 v=fλ，超声波发射器发出声波，移动接收器找波腹位置求波长λ，乘频率f得声速v',

  principle: {
    steps: [
      { title: '超声波声场', desc: '超声换能器发射频率f的声波，在空气中传播形成行波。3D视角可拖拽查看换能器结构', duration: 4 },
      { title: '反射形成驻波', desc: '声波在接收器表面反射，入射波与反射波叠加，形成驻波场', duration: 3 },
      { title: '波腹与波节', desc: '驻波振幅最大处为波腹（声压极大），振幅为零处为波节。相邻波腹间距=λ/2', duration: 4 },
      { title: '测波长求声速', desc: '移动接收器，相邻两次示波器振幅极大（波腹）的接收器位移=λ/2，声速 v=fλ', duration: 4 },
      { title: '温度修正', desc: '声速与温度有关：v=331.4+0.6T（T为摄氏温度），测量时记录室温', duration: 3 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);

      const emitter = makeTransducer(THREE, '发射');
      emitter.position.set(-2.5, 0, 0);
      group.add(emitter);

      const receiver = makeTransducer(THREE, '接收');
      receiver.position.set(2.5, 0, 0);
      group.add(receiver);

      const standMat = new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 0.8, roughness: 0.3 });
      const base = new THREE.Mesh(new THREE.BoxGeometry(7, 0.1, 1.5), standMat);
      base.position.y = -0.35; base.receiveShadow = true;
      group.add(base);

      const waveMat = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.8 });
      const waveGeo = new THREE.BufferGeometry();
      const N = 100;
      const positions = new Float32Array(N * 3);
      waveGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const waveLine = new THREE.Line(waveGeo, waveMat);
      group.add(waveLine);

      const envMat = new THREE.LineDashedMaterial({ color: 0xffd700, dashSize: 0.1, gapSize: 0.06, transparent: true, opacity: 0.4 });
      const envGeo1 = new THREE.BufferGeometry();
      const envGeo2 = new THREE.BufferGeometry();
      envGeo1.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
      envGeo2.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
      const envLine1 = new THREE.Line(envGeo1, envMat);
      const envLine2 = new THREE.Line(envGeo2, envMat);
      envLine1.computeLineDistances(); envLine2.computeLineDistances();
      envLine1.visible = false; envLine2.visible = false;
      group.add(envLine1, envLine2);

      return {
        group, emitter, receiver, waveLine, envLine1, envLine2, N,
        dispose() {
          scene.remove(group);
          group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
        }
      };
    },
    update(refs, t, step, ctx) {
      const { receiver, waveLine, envLine1, envLine2, N } = refs;
      const x1 = -2.0;
      let recvX = 2.0;
      let showStanding = false, showEnv = false;

      if (step === 0) {
        const ang = t * Math.PI * 0.3;
        ctx.camera.position.set(5 * Math.cos(ang + 0.8), 3, 5 * Math.sin(ang + 0.8));
        ctx.controls.target.set(0, 0, 0);
      } else if (step === 1) {
        showStanding = true; showEnv = true;
      } else if (step === 2) {
        showStanding = true; showEnv = true;
        recvX = 2.0 + 0.5 * Math.sin(t * Math.PI);
      } else if (step === 3) {
        showStanding = true; showEnv = true;
        recvX = 2.0 + 0.5 * Math.sin(t * Math.PI);
      } else if (step === 4) {
        showStanding = true; showEnv = true;
      }

      receiver.position.x = recvX;

      const pos = waveLine.geometry.attributes.position.array;
      const epos1 = envLine1.geometry.attributes.position.array;
      const epos2 = envLine2.geometry.attributes.position.array;
      const k = 3.0;
      const amp = 0.4;
      for (let i = 0; i < N; i++) {
        const x = x1 + (recvX - x1) * i / (N - 1);
        let y;
        if (showStanding) {
          const env = Math.abs(Math.sin(k * (x - x1)));
          y = amp * env * Math.cos(t * Math.PI * 6);
        } else {
          y = amp * 0.7 * Math.sin(k * (x - x1) - t * Math.PI * 4);
        }
        pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = 0;
        const env = amp * Math.abs(Math.sin(k * (x - x1)));
        epos1[i * 3] = x; epos1[i * 3 + 1] = env; epos1[i * 3 + 2] = 0;
        epos2[i * 3] = x; epos2[i * 3 + 1] = -env; epos2[i * 3 + 2] = 0;
      }
      waveLine.geometry.attributes.position.needsUpdate = true;
      envLine1.geometry.attributes.position.needsUpdate = true;
      envLine2.geometry.attributes.position.needsUpdate = true;
      envLine1.visible = showEnv; envLine2.visible = showEnv;
      if (showEnv) { envLine1.computeLineDistances(); envLine2.computeLineDistances(); }
    },
  },

  procedure: {
    steps: [
      { title: '连接超声换能器', desc: '操作：将信号发生器接发射换能器，接收换能器接示波器Y通道，换能器面对面放置。\n原理：超声换能器（压电陶瓷）将电信号转为声波，频率取37kHz左右（换能器谐振频率）。\n注意：两换能器轴线对齐，间距约10cm；换能器表面不能触碰。', duration: 4 },
      { title: '调节谐振频率', desc: '操作：调节信号发生器频率，观察示波器振幅，使振幅最大（换能器谐振），记录频率f。\n原理：在谐振频率下换能器转换效率最高，声波最强，驻波波腹最明显。\n注意：谐振频率约37kHz，微调至振幅极大；频率稳定后不再改动。', duration: 4 },
      { title: '移动接收器找波腹', desc: '操作：缓慢移动接收器，示波器振幅周期性变化，记录连续振幅极大（波腹）时接收器位置x₁,x₂...\n原理：相邻波腹间距=λ/2，移动一个波腹相当于接收器移动λ/2。\n注意：用测微鼓轮缓慢单向移动，避免回程间隙；振幅极大判断要准确。', duration: 5 },
      { title: '计算波长与声速', desc: '操作：λ=2×(相邻波腹位置差)，v=fλ，测多组取平均。\n原理：驻波法中波腹间距精确等于半波长，多组平均减小读数误差。\n注意：至少测6个波腹位置，用逐差法处理数据。', duration: 4 },
      { title: '记录室温修正', desc: '操作：用温度计测室温T，按v=331.4+0.6T计算理论值，与测量值比较。\n原理：声速随温度升高而增大，每升高1℃声速增加0.6m/s。\n注意：温度计放在声场附近，等读数稳定再记录。', duration: 3 },
    ],
    create(ctx) {
      const { scene, THREE } = ctx;
      const group = new THREE.Group();
      scene.add(group);

      const emitter = makeTransducer(THREE, '发射');
      emitter.position.set(-2.5, 0, 0);
      group.add(emitter);
      const receiver = makeTransducer(THREE, '接收');
      receiver.position.set(2.5, 0, 0);
      group.add(receiver);

      const standMat = new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 0.8, roughness: 0.3 });
      const base = new THREE.Mesh(new THREE.BoxGeometry(7, 0.1, 1.5), standMat);
      base.position.y = -0.35; base.receiveShadow = true;
      group.add(base);

      const waveMat = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.8 });
      const waveGeo = new THREE.BufferGeometry();
      const N = 100;
      waveGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
      const waveLine = new THREE.Line(waveGeo, waveMat);
      group.add(waveLine);

      return {
        group, emitter, receiver, waveLine, N,
        dispose() {
          scene.remove(group);
          group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
        }
      };
    },
    update(refs, t, step, ctx) {
      const { receiver, waveLine, N } = refs;
      const x1 = -2.0;
      let recvX = 2.0;
      let amp = 0.4;

      if (step === 0) {
        recvX = 2.0; amp = 0.2 * EaseOut(t);
      } else if (step === 1) {
        amp = 0.4 * (0.5 + 0.5 * Math.sin(t * Math.PI * 2));
      } else if (step === 2) {
        recvX = 2.0 + 0.8 * Math.sin(t * Math.PI);
        amp = 0.4;
      } else if (step === 3) {
        amp = 0.4;
      } else if (step === 4) {
        amp = 0.3;
      }

      receiver.position.x = recvX;
      const pos = waveLine.geometry.attributes.position.array;
      const k = 3.0;
      for (let i = 0; i < N; i++) {
        const x = x1 + (recvX - x1) * i / (N - 1);
        const env = Math.abs(Math.sin(k * (x - x1)));
        const y = amp * env * Math.cos(t * Math.PI * 6);
        pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = 0;
      }
      waveLine.geometry.attributes.position.needsUpdate = true;
    },
  },
  data: null,
};

function EaseOut(t) { return 1 - Math.pow(1 - t, 3); }