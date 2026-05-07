import * as THREE from "three";

import { tickTweens } from "./animations";

export type Scene = {
  three: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  raycaster: THREE.Raycaster;
  pointer: THREE.Vector2;
  registerUpdate: (fn: (dt: number) => void) => void;
};

export function initScene(canvas: HTMLCanvasElement): Scene {
  const three = new THREE.Scene();
  three.background = new THREE.Color("#f3e9d0");

  const aspect = window.innerWidth / window.innerHeight;
  const viewSize = 6;
  const camera = new THREE.OrthographicCamera(
    -viewSize * aspect,
    viewSize * aspect,
    viewSize,
    -viewSize,
    0.1,
    100,
  );
  camera.position.set(0, 2.5, 10);
  camera.lookAt(0, 1.8, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const key = new THREE.DirectionalLight("#fff4d6", 2.0);
  key.position.set(2, 8, 6);
  three.add(key);
  const fill = new THREE.DirectionalLight("#7a9ac0", 0.6);
  fill.position.set(-5, 4, 4);
  three.add(fill);
  three.add(new THREE.AmbientLight("#ffffff", 0.7));

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.MeshStandardMaterial({ color: "#7a5238", roughness: 0.95 }),
  );
  floor.rotation.x = -Math.PI / 2;
  three.add(floor);

  const updates: ((dt: number) => void)[] = [];
  const clock = new THREE.Clock();

  function loop(): void {
    const dt = clock.getDelta();
    updates.forEach((u) => u(dt));
    renderer.render(three, camera);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  updates.push((dt) => tickTweens(dt));
  updates.push((dt) => {
    three.traverse((obj) => {
      const fn = (obj.userData as { update?: (dt: number) => void }).update;
      if (fn) fn(dt);
    });
  });

  window.addEventListener("resize", () => {
    const a = window.innerWidth / window.innerHeight;
    camera.left = -viewSize * a;
    camera.right = viewSize * a;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return {
    three,
    camera,
    renderer,
    raycaster: new THREE.Raycaster(),
    pointer: new THREE.Vector2(),
    registerUpdate: (fn) => {
      updates.push(fn);
    },
  };
}
