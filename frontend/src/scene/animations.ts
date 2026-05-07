import * as THREE from "three";

export type Tween = (dt: number) => boolean;

const tweens = new Set<Tween>();

export function tickTweens(dt: number): void {
  for (const t of tweens) {
    if (!t(dt)) tweens.delete(t);
  }
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function arcToCauldron(
  obj: THREE.Object3D,
  start: THREE.Vector3,
  end: THREE.Vector3,
  durationSec: number,
  onDone?: () => void,
): void {
  let elapsed = 0;
  const peak = Math.max(start.y, end.y) + 1.5;
  obj.position.copy(start);
  tweens.add((dt) => {
    elapsed += dt;
    const t = Math.min(elapsed / durationSec, 1);
    const e = easeInOut(t);
    obj.position.x = THREE.MathUtils.lerp(start.x, end.x, e);
    obj.position.z = THREE.MathUtils.lerp(start.z, end.z, e);
    const linY = THREE.MathUtils.lerp(start.y, end.y, e);
    const arc = 4 * (peak - Math.max(start.y, end.y)) * t * (1 - t);
    obj.position.y = linY + arc;
    if (t >= 1) {
      onDone?.();
      return false;
    }
    return true;
  });
}

export function fadeAlpha(
  material: THREE.Material & { opacity: number; transparent: boolean },
  to: number,
  durationSec: number,
): void {
  const from = material.opacity;
  material.transparent = true;
  let elapsed = 0;
  tweens.add((dt) => {
    elapsed += dt;
    const t = Math.min(elapsed / durationSec, 1);
    material.opacity = THREE.MathUtils.lerp(from, to, easeInOut(t));
    return t < 1;
  });
}

export function colorLerp(
  material: THREE.MeshStandardMaterial,
  to: THREE.Color,
  durationSec: number,
): void {
  const from = material.color.clone();
  let elapsed = 0;
  tweens.add((dt) => {
    elapsed += dt;
    const t = Math.min(elapsed / durationSec, 1);
    material.color.copy(from).lerp(to, easeInOut(t));
    return t < 1;
  });
}
