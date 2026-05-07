import * as THREE from "three";
import type { Ingredient } from "../api/client";

export type Jar = {
  mesh: THREE.Group;
  ingredient: Ingredient;
  basePosition: THREE.Vector3;
};

export type Shelf = {
  group: THREE.Group;
  jars: Jar[];
};

function colorForSlug(slug: string): string {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const hue = Math.abs(h) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

function createJar(ingredient: Ingredient): THREE.Group {
  const g = new THREE.Group();
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.45, 20),
    new THREE.MeshStandardMaterial({
      color: colorForSlug(ingredient.slug),
      roughness: 0.4,
      metalness: 0.0,
      transparent: true,
      opacity: 0.85,
    }),
  );
  glass.position.y = 0.225;
  g.add(glass);
  const cork = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.14, 0.1, 16),
    new THREE.MeshStandardMaterial({ color: "#7a4a2a", roughness: 0.9 }),
  );
  cork.position.y = 0.5;
  g.add(cork);
  g.userData.ingredient = ingredient;
  return g;
}

export function createShelf(scene: THREE.Scene, ingredients: Ingredient[]): Shelf {
  const group = new THREE.Group();

  const boardMat = new THREE.MeshStandardMaterial({ color: "#7a5a3a", roughness: 0.85 });
  for (let row = 0; row < 2; row++) {
    const board = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 0.6), boardMat);
    board.position.set(-3.0, 1.2 + row * 0.9, -1.0);
    group.add(board);
  }
  for (const x of [-4.2, -1.8]) {
    const support = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.0, 0.6), boardMat);
    support.position.set(x, 1.5, -1.0);
    group.add(support);
  }

  const jars: Jar[] = [];
  ingredients.slice(0, 6).forEach((ing, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = -3.9 + col * 0.9;
    const y = 1.3 + row * 0.9;
    const jar = createJar(ing);
    jar.position.set(x, y, -1.0);
    group.add(jar);
    jars.push({ mesh: jar, ingredient: ing, basePosition: jar.position.clone() });
  });

  scene.add(group);
  return { group, jars };
}
