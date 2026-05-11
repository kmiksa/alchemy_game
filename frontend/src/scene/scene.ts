export type Scene = {
  root: HTMLElement;
  shelfContainer: HTMLElement;
  cauldronContainer: HTMLElement;
  customerContainer: HTMLElement;
  flyLayer: HTMLElement;
};

export function initScene(): Scene {
  const root = document.getElementById("scene")!;
  return {
    root,
    shelfContainer: document.getElementById("scene-shelf")!,
    cauldronContainer: document.getElementById("scene-cauldron")!,
    customerContainer: document.getElementById("scene-customer")!,
    flyLayer: document.getElementById("scene-fly-layer")!,
  };
}
