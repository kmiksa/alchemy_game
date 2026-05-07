import * as THREE from "three";
import { colorLerp } from "./animations";

export type Cauldron = {
  group: THREE.Group;
  liquidPosition: THREE.Vector3;
  setLiquidColor: (hex: string) => void;
  resetColor: () => void;
};

const EMPTY_COLOR = "#2a3a3a";

export function createCauldron(scene: THREE.Scene): Cauldron {
  const group = new THREE.Group();

  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.4, 0.5, 24),
    new THREE.MeshStandardMaterial({ color: "#6b6358", roughness: 0.9 }),
  );
  plinth.position.y = 0.25;
  group.add(plinth);

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 0.7, 1.1, 32),
    new THREE.MeshStandardMaterial({ color: "#1f1a16", roughness: 0.6, metalness: 0.4 }),
  );
  body.position.y = 1.05;
  group.add(body);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.95, 0.07, 12, 32),
    new THREE.MeshStandardMaterial({ color: "#2a2620", roughness: 0.5, metalness: 0.5 }),
  );
  rim.position.y = 1.6;
  rim.rotation.x = Math.PI / 2;
  group.add(rim);

  const liquidGeom = new THREE.CircleGeometry(0.92, 48);
  const liquidMat = new THREE.MeshStandardMaterial({
    color: EMPTY_COLOR,
    roughness: 0.3,
    metalness: 0.1,
    emissive: new THREE.Color(EMPTY_COLOR).multiplyScalar(0.2),
  });
  const liquid = new THREE.Mesh(liquidGeom, liquidMat);
  liquid.rotation.x = -Math.PI / 2;
  liquid.position.y = 1.55;
  group.add(liquid);

  const positions = liquidGeom.attributes.position as THREE.BufferAttribute;
  const original = positions.array.slice();
  let t = 0;
  function update(dt: number): void {
    t += dt;
    for (let i = 0; i < positions.count; i++) {
      const ox = original[i * 3];
      const oy = original[i * 3 + 1];
      const wave = Math.sin(ox * 4 + t * 3) * 0.04 + Math.cos(oy * 5 + t * 2.4) * 0.04;
      positions.setZ(i, wave);
    }
    positions.needsUpdate = true;
  }
  group.userData.update = update;

  group.position.set(0, 0, 0);
  scene.add(group);

  return {
    group,
    liquidPosition: new THREE.Vector3(0, 1.55, 0),
    setLiquidColor: (hex: string) => {
      colorLerp(liquidMat, new THREE.Color(hex), 0.4);
    },
    resetColor: () => {
      colorLerp(liquidMat, new THREE.Color(EMPTY_COLOR), 0.6);
    },
  };
}
