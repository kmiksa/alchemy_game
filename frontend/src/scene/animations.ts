/** Animate a clone of `srcEl` flying along an arc to `targetEl`'s center. */
export function animateToCauldron(
  srcEl: HTMLElement,
  targetEl: HTMLElement,
  flyLayer: HTMLElement,
  spriteUrl: string,
  onComplete: () => void,
): void {
  const src = srcEl.getBoundingClientRect();
  const tgt = targetEl.getBoundingClientRect();
  const layer = flyLayer.getBoundingClientRect();

  const startX = src.left + src.width / 2 - layer.left - 40;
  const startY = src.top + src.height / 2 - layer.top - 40;
  const endX = tgt.left + tgt.width / 2 - layer.left - 40;
  const endY = tgt.top + tgt.height * 0.32 - layer.top - 40;

  const sprite = document.createElement("img");
  sprite.src = spriteUrl;
  sprite.className = "fly-sprite";
  sprite.style.left = `${startX}px`;
  sprite.style.top = `${startY}px`;
  flyLayer.appendChild(sprite);

  const peakY = Math.min(startY, endY) - 120;
  sprite.animate(
    [
      { transform: "translate(0,0) rotate(0deg) scale(1)", offset: 0 },
      {
        transform: `translate(${(endX - startX) * 0.5}px, ${peakY - startY}px) rotate(180deg) scale(0.85)`,
        offset: 0.5,
      },
      {
        transform: `translate(${endX - startX}px, ${endY - startY}px) rotate(360deg) scale(0.4)`,
        offset: 1,
      },
    ],
    { duration: 700, easing: "cubic-bezier(0.45, 0, 0.55, 1)", fill: "forwards" },
  ).onfinish = () => {
    sprite.remove();
    onComplete();
  };
}

export function fadeIn(el: HTMLElement, durationMs = 600): void {
  el.hidden = false;
  el.style.transitionDuration = `${durationMs}ms`;
  requestAnimationFrame(() => el.classList.add("visible"));
}

export function fadeOut(el: HTMLElement, durationMs = 600): void {
  el.classList.remove("visible");
  el.style.transitionDuration = `${durationMs}ms`;
  setTimeout(() => {
    if (!el.classList.contains("visible")) el.hidden = true;
  }, durationMs);
}
