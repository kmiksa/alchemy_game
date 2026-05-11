export type Cauldron = {
  el: HTMLElement;
  setLiquidColor: (hex: string) => void;
  resetColor: () => void;
};

export function createCauldron(container: HTMLElement): Cauldron {
  container.replaceChildren();
  const img = document.createElement("img");
  img.className = "cauldron-img";
  img.src = "/sprites/scene/cauldron.png";
  img.alt = "Cauldron";
  container.appendChild(img);

  function setColor(hex: string): void {
    img.style.filter = `drop-shadow(0 8px 14px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 18px ${glowFromHex(hex)})`;
  }

  function reset(): void {
    img.style.filter = "drop-shadow(0 8px 14px rgba(0, 0, 0, 0.55))";
  }

  return {
    el: container,
    setLiquidColor: setColor,
    resetColor: reset,
  };
}

function glowFromHex(hex: string): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, 0.55)`;
}
