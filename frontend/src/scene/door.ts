import * as THREE from "three";
import { fadeAlpha } from "./animations";

export type Door = {
  group: THREE.Group;
  showSilhouette: () => void;
  hideSilhouette: () => void;
};

export function createDoor(scene: THREE.Scene): Door {
  const group = new THREE.Group();

  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 20),
    new THREE.MeshStandardMaterial({ color: "#e8d8b0", roughness: 0.95 }),
  );
  wall.position.set(0, 6, -3);
  group.add(wall);

  const frameMat = new THREE.MeshStandardMaterial({ color: "#3a2a1a", roughness: 0.85 });
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.5, 0.2), frameMat);
  left.position.set(-1.0, 1.75, -2.95);
  const right = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.5, 0.2), frameMat);
  right.position.set(1.0, 1.75, -2.95);
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 0.2), frameMat);
  top.position.set(0, 3.4, -2.95);
  group.add(left, right, top);

  const interior = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 3.3),
    new THREE.MeshBasicMaterial({ color: "#0a0a14" }),
  );
  interior.position.set(0, 1.65, -2.94);
  group.add(interior);

  const silhouetteMat = new THREE.MeshBasicMaterial({
    color: "#1a1a26",
    transparent: true,
    opacity: 0,
  });
  const silhouette = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 2.2), silhouetteMat);
  silhouette.position.set(0, 1.1, -2.93);
  group.add(silhouette);

  scene.add(group);
  return {
    group,
    showSilhouette: () => fadeAlpha(silhouetteMat, 0.85, 0.6),
    hideSilhouette: () => fadeAlpha(silhouetteMat, 0, 0.6),
  };
}
