// 3D动画引擎 - Three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Engine3D {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050810);
    this.scene.fog = new THREE.Fog(0x050810, 15, 50);

    const w = container.clientWidth || 800, h = container.clientHeight || 500;
    this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    this.camera.position.set(6, 4, 8);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.target.set(0, 2.5, 0);
    this.controls.minDistance = 3;
    this.controls.maxDistance = 20;

    this._setupLights();
    this._setupGround();

    this.module = null;
    this.phase = 'principle';
    this.stepIdx = 0;
    this.time = 0;
    this.playing = false;
    this.speed = 1;
    this.lastTs = 0;
    this.refs = null;
    this.onUpdate = null;
    this.rafId = null;
    this._loop();
  }

  _setupLights() {
    const amb = new THREE.AmbientLight(0x3060a0, 0.4);
    this.scene.add(amb);

    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(6, 12, 6);
    dir.castShadow = true;
    dir.shadow.mapSize.set(2048, 2048);
    dir.shadow.camera.left = -10;
    dir.shadow.camera.right = 10;
    dir.shadow.camera.top = 10;
    dir.shadow.camera.bottom = -10;
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 30;
    this.scene.add(dir);

    const p1 = new THREE.PointLight(0x00d4ff, 0.6, 25);
    p1.position.set(-4, 5, 4);
    this.scene.add(p1);

    const p2 = new THREE.PointLight(0x7b2ff7, 0.4, 25);
    p2.position.set(4, 3, -4);
    this.scene.add(p2);
  }

  _setupGround() {
    const grid = new THREE.GridHelper(20, 20, 0x1a3a5a, 0x0e1a2e);
    grid.material.transparent = true;
    grid.material.opacity = 0.5;
    this.scene.add(grid);

    const planeGeo = new THREE.PlaneGeometry(20, 20);
    const planeMat = new THREE.MeshStandardMaterial({ color: 0x080c18, roughness: 0.9, metalness: 0.1 });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    this.scene.add(plane);
  }

  load(module) {
    this._disposeRefs();
    this.module = module;
    this.phase = 'principle';
    this.stepIdx = 0;
    this.time = 0;
    this.playing = false;
    this._setupPhase();
    this._notify();
  }

  _setupPhase() {
    this._disposeRefs();
    const pd = this.module[this.phase];
    if (pd && pd.create) {
      this.refs = pd.create({ scene: this.scene, THREE, camera: this.camera });
    }
  }

  _disposeRefs() {
    if (this.refs) {
      if (this.refs.dispose) this.refs.dispose();
      else if (this.refs.group) {
        this.scene.remove(this.refs.group);
        this.refs.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
      }
    }
    this.refs = null;
  }

  setPhase(phase) {
    this.phase = phase;
    this.stepIdx = 0;
    this.time = 0;
    this.playing = false;
    this._setupPhase();
    this._notify();
  }

  setStep(idx) {
    const steps = this._phaseData().steps;
    if (idx < 0 || idx >= steps.length) return;
    this.stepIdx = idx;
    this.time = 0;
    this._notify();
  }

  nextStep() { const s = this._phaseData().steps; if (this.stepIdx < s.length - 1) this.setStep(this.stepIdx + 1); }
  prevStep() { if (this.stepIdx > 0) this.setStep(this.stepIdx - 1); }

  play() {
    const steps = this._phaseData().steps;
    if (this.stepIdx >= steps.length - 1 && this.time >= 1) { this.stepIdx = 0; this.time = 0; }
    this.playing = true;
    this.lastTs = performance.now();
    this._notify();
  }

  pause() { this.playing = false; this._notify(); }
  toggle() { this.playing ? this.pause() : this.play(); }
  reset() { this.time = 0; this.playing = false; this._notify(); }
  setSpeed(s) { this.speed = s; }

  _phaseData() { return this.module[this.phase]; }

  _loop() {
    this.rafId = requestAnimationFrame(() => this._loop());
    if (this.playing) {
      const now = performance.now();
      const dt = (now - this.lastTs) / 1000 * this.speed;
      this.lastTs = now;
      const step = this._phaseData().steps[this.stepIdx];
      this.time += dt / step.duration;
      if (this.time >= 1) {
        this.time = 1;
        if (this.stepIdx < this._phaseData().steps.length - 1) { this.stepIdx++; this.time = 0; }
        else { this.playing = false; }
      }
      this._notify();
    }
    this._render3d();
  }

  _render3d() {
    if (!this.module) { this.controls.update(); this.renderer.render(this.scene, this.camera); return; }
    const pd = this._phaseData();
    if (pd.update && this.refs) {
      pd.update(this.refs, this.time, this.stepIdx, { scene: this.scene, THREE, camera: this.camera, controls: this.controls });
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  _notify() { if (this.onUpdate) this.onUpdate(); }

  getProgress() {
    const steps = this._phaseData().steps;
    return ((this.stepIdx / steps.length) + (this.time / steps.length)) * 100;
  }

  dispose() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this._disposeRefs();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
  }
}

export { THREE };