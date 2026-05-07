import * as THREE from "three";

export type Grimoire = {
  group: THREE.Group;
  hitMesh: THREE.Object3D;
};

export function createGrimoire(scene: THREE.Scene): Grimoire {
  const group = new THREE.Group();

  const lectern = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 1.6, 0.6),
    new THREE.MeshStandardMaterial({ color: "#7a5a3a", roughness: 0.85 }),
  );
  lectern.position.set(3.2, 0.8, -0.6);
  group.add(lectern);

  const book = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.12, 0.5),
    new THREE.MeshStandardMaterial({ color: "#5a3a22", roughness: 0.6 }),
  );
  book.position.set(3.2, 1.65, -0.6);
  book.rotation.y = -0.15;
  group.add(book);

  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.02, 0.5),
    new THREE.MeshStandardMaterial({ color: "#5a7a9a", roughness: 0.5, metalness: 0.4 }),
  );
  trim.position.set(3.2, 1.71, -0.6);
  trim.rotation.y = -0.15;
  group.add(trim);

  scene.add(group);
  return { group, hitMesh: book };
}
