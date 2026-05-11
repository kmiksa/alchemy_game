import type { Recipe } from "../api/client";

export type GrimoirePanel = {
  setRecipes: (recipes: Recipe[]) => void;
  toggle: () => void;
  hide: () => void;
};

export function createGrimoirePanel(): GrimoirePanel {
  const root = document.getElementById("overlay-grimoire-panel")!;
  let recipes: Recipe[] = [];

  function render(): void {
    root.innerHTML = `
      <div class="card grimoire-card">
        <div class="grimoire-header">
          <h2>Grimoire</h2>
          <button id="grimoire-close-btn" class="btn" aria-label="Close">×</button>
        </div>
        <ul class="recipe-list">
          ${recipes
            .map(
              (r) => `
            <li class="recipe-row">
              ${r.sprite ? `<img class="recipe-sprite" src="/sprites/potions/${esc(r.sprite)}" alt="" />` : ""}
              <div class="recipe-text">
                <h3>${esc(r.name)}</h3>
                <p class="lore">${esc(r.lore)}</p>
                <p class="ings">${r.ingredient_slugs.map(esc).join(" + ")}</p>
                <p class="cat">For ${esc(r.ailment_category)}</p>
              </div>
            </li>
          `,
            )
            .join("")}
        </ul>
      </div>
    `;
    document.getElementById("grimoire-close-btn")!.addEventListener("click", hide);
  }

  function show(): void {
    if (!recipes.length) return;
    render();
    root.hidden = false;
  }

  function hide(): void {
    root.hidden = true;
    root.innerHTML = "";
  }

  return {
    setRecipes: (r) => {
      recipes = r;
    },
    toggle: () => {
      if (root.hidden) show();
      else hide();
    },
    hide,
  };
}

function esc(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
