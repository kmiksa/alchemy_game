import * as THREE from "three";
import { fadeAlpha } from "./animations";

export type Door = {
  group: THREE.Group;
  showCustomer: () => void;
  hideCustomer: () => void;
};

export function createDoor(scene: THREE.Scene): Door {
  const group = new THREE.Group();

  // Back wall (parchment cream)
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 20),
    new THREE.MeshStandardMaterial({ color: "#e8d8b0", roughness: 0.95 }),
  );
  wall.position.set(0, 6, -3);
  group.add(wall);

  // Doorway is offset right so it doesn't sit directly behind the cauldron
  const doorX = 3.0;
  const frameMat = new THREE.MeshStandardMaterial({ color: "#3a2a1a", roughness: 0.85 });
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.5, 0.2), frameMat);
  left.position.set(doorX - 1.0, 1.75, -2.95);
  const right = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.5, 0.2), frameMat);
  right.position.set(doorX + 1.0, 1.75, -2.95);
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 0.2), frameMat);
  top.position.set(doorX, 3.4, -2.95);
  group.add(left, right, top);

  // Doorway interior (warm dusk glow rather than pure black)
  const interior = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 3.3),
    new THREE.MeshBasicMaterial({ color: "#3a2a3a" }),
  );
  interior.position.set(doorX, 1.65, -2.94);
  group.add(interior);

  // Customer figure — a small hooded character that fades in on arrival.
  // Positioned to the left of the cauldron, in front of the counter, so
  // they can't be occluded by the cauldron.
  const customer = new THREE.Group();
  const cloakMat = new THREE.MeshStandardMaterial({
    color: "#6a4a8a",
    roughness: 0.7,
    transparent: true,
    opacity: 0,
  });
  const cloak = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.55, 1.5, 16), cloakMat);
  cloak.position.y = 0.75;
  customer.add(cloak);

  const skinMat = new THREE.MeshStandardMaterial({
    color: "#e8b08a",
    roughness: 0.6,
    transparent: true,
    opacity: 0,
  });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), skinMat);
  head.position.y = 1.7;
  customer.add(head);

  const hoodMat = new THREE.MeshStandardMaterial({
    color: "#4a2a6a",
    roughness: 0.7,
    transparent: true,
    opacity: 0,
  });
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12, 0, Math.PI * 2, 0, Math.PI / 1.6), hoodMat);
  hood.position.y = 1.78;
  hood.rotation.x = -0.2;
  customer.add(hood);

  customer.position.set(-2.4, 0.0, 1.6);
  customer.rotation.y = 0.4;
  group.add(customer);

  scene.add(group);
  return {
    group,
    showCustomer: () => {
      fadeAlpha(cloakMat, 1.0, 0.6);
      fadeAlpha(skinMat, 1.0, 0.6);
      fadeAlpha(hoodMat, 1.0, 0.6);
    },
    hideCustomer: () => {
      fadeAlpha(cloakMat, 0, 0.6);
      fadeAlpha(skinMat, 0, 0.6);
      fadeAlpha(hoodMat, 0, 0.6);
    },
  };
}
