# Apothecaria Phase B — Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Vite + TypeScript + Three.js frontend that consumes the Phase A backend, producing a playable cozy-alchemist scene with arriving customers, ingredient-arc brewing, a recipe grimoire, and reputation tracking — all from procedural geometry, no asset files.

**Architecture:** Static SPA in `frontend/`. Three layers: a Three.js scene with a fixed orthographic camera and procedural geometry, four vanilla-DOM overlay classes (no UI framework), and typed `fetch` + `WebSocket` API clients. `main.ts` is the conductor that boots the scene, opens the WS, and wires overlay events to the API. Vite proxies `/api` and `/ws` to `localhost:8000` so the SPA runs same-origin in dev.

**Tech Stack:** Vite, TypeScript (strict), Three.js, vanilla DOM, plain CSS. No UI library, no test runner, no asset pipeline.

---

## Project root

All paths in this plan are absolute and root at:

```
/Users/jakubmiksa/Documents/Side_Projects/alchemy_game/
```

The frontend is a sibling of `backend/`:

```
alchemy_game/
  backend/        (Phase A — unchanged)
  frontend/       (Phase B — new)
```

---

## File structure

| Path | Responsibility |
|---|---|
| `frontend/package.json` | npm metadata, deps (`three`), devDeps (`vite`, `typescript`, `@types/three`) |
| `frontend/tsconfig.json` | TypeScript strict config |
| `frontend/vite.config.ts` | Dev proxy `/api → :8000`, `/ws → :8000` |
| `frontend/index.html` | Single canvas + one fixed div per overlay |
| `frontend/src/main.ts` | Boot: scene + overlays + WS + initial fetches; event glue |
| `frontend/src/styles/main.css` | Parchment palette, typography, overlay layout |
| `frontend/src/api/client.ts` | Typed fetch wrappers: `getInventory`, `getRecipes`, `brew`, `serve` |
| `frontend/src/api/ws-client.ts` | WS subscriber, `customer.arrived` typed event, backoff reconnect |
| `frontend/src/state/session.ts` | Pub-sub session state (current customer, cauldron, reputation) |
| `frontend/src/scene/scene.ts` | Camera, lights, render loop, scene root |
| `frontend/src/scene/cauldron.ts` | Cauldron geometry, liquid color lerp, bubble animation |
| `frontend/src/scene/shelf.ts` | Shelf + 6 jars (colors derived from ingredient slugs) |
| `frontend/src/scene/grimoire.ts` | Book on stand, click handler |
| `frontend/src/scene/door.ts` | Archway + NPC silhouette plane (fade in/out) |
| `frontend/src/scene/animations.ts` | `arcToCauldron`, `fadeAlpha`, `colorLerp` tween helpers |
| `frontend/src/ui/customer-dialog.ts` | Customer narrative + Serve button overlay |
| `frontend/src/ui/grimoire-panel.ts` | Modal overlay listing 4 recipes |
| `frontend/src/ui/brew-result.ts` | Toast-style overlay showing brew/serve outcome |
| `frontend/src/ui/inventory-bar.ts` | Bottom strip: reputation + cauldron contents + Brew/Clear |
| `frontend/.gitignore` | `node_modules/`, `dist/`, `.vite/` |
| `Makefile` (root, modified) | Add `install`, `build`; `dev` runs backend + frontend together |
| `.gitignore` (root, modified) | Ensure frontend node_modules etc. ignored (already partly there) |
| `README.md` (root, modified) | Update quickstart with frontend bring-up notes |

---

## Tasks

20 tasks. Build bottom-up: scaffold → API → state → scene primitives → scene composition → overlays → wiring → polish.

Each task ends with a verification step and a commit. Run all shell commands from project root unless stated otherwise.

---

### Task 1: Frontend scaffold (Vite + TS + Three.js)

**Files:**
- Create: `frontend/package.json`, `frontend/tsconfig.json`, `frontend/vite.config.ts`, `frontend/index.html`, `frontend/src/main.ts`, `frontend/.gitignore`

- [ ] **Step 1: Create directory tree**

```bash
mkdir -p frontend/src/{api,state,scene,ui,styles}
```

- [ ] **Step 2: Write `frontend/package.json`**

```json
{
  "name": "apothecaria-frontend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "three": "^0.169.0"
  },
  "devDependencies": {
    "@types/three": "^0.169.0",
    "typescript": "^5.6.0",
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 3: Write `frontend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "useDefineForClassFields": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Write `frontend/vite.config.ts`**

```ts
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8000",
      "/ws": { target: "ws://localhost:8000", ws: true },
    },
  },
});
```

- [ ] **Step 5: Write `frontend/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Apothecaria</title>
    <link rel="stylesheet" href="/src/styles/main.css" />
    <link
      href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;600&family=Cormorant+Garamond:wght@600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <canvas id="scene"></canvas>
    <div id="overlay-customer-dialog" class="overlay" hidden></div>
    <div id="overlay-grimoire-panel" class="overlay" hidden></div>
    <div id="overlay-brew-result" class="overlay" hidden></div>
    <div id="overlay-inventory-bar" class="overlay"></div>
    <div id="overlay-toast" class="overlay" hidden></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 6: Write a placeholder `frontend/src/main.ts`**

```ts
console.log("apothecaria booting");
```

- [ ] **Step 7: Write a placeholder `frontend/src/styles/main.css`**

```css
:root {
  --parchment: #f3e9d0;
  --ink: #3a2a1a;
  --candle-gold: #e6b85c;
  --moonlight: #5a7a9a;
}
html,
body {
  margin: 0;
  height: 100%;
  background: var(--parchment);
  color: var(--ink);
  font-family: "EB Garamond", Georgia, serif;
}
#scene {
  display: block;
  width: 100vw;
  height: 100vh;
}
.overlay {
  position: fixed;
}
```

- [ ] **Step 8: Write `frontend/.gitignore`**

```
node_modules/
dist/
.vite/
```

- [ ] **Step 9: Install deps**

```bash
cd frontend && npm install && cd ..
```

Expected: `node_modules/` appears, no errors.

- [ ] **Step 10: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit && cd ..
```

Expected: no output (clean compile).

- [ ] **Step 11: Verify dev server boots**

```bash
cd frontend && timeout 3 npx vite || true && cd ..
```

Expected: "VITE v5.x.x ready in …ms" line in output. Process exits at timeout.

- [ ] **Step 12: Commit**

```bash
git add frontend/ && git commit -m "feat(frontend): vite + typescript + three scaffold"
```

---

### Task 2: Update root Makefile + .gitignore + README

**Files:**
- Modify: `Makefile`
- Modify: `.gitignore`
- Modify: `README.md`

- [ ] **Step 1: Replace `Makefile`**

```makefile
.PHONY: dev backend-dev frontend-dev install test lint format type seed db-reset build clean help

PYTHON := uv run
NPM := npm --prefix frontend

help:
	@echo "Targets: dev, backend-dev, frontend-dev, install, test, lint, format, type, seed, db-reset, build, clean"

install:
	$(PYTHON) python -c "print('python deps already managed by uv sync')"
	$(NPM) install

dev:
	@echo "Starting backend on :8000 and frontend on :5173"
	@trap 'kill %1 %2 2>/dev/null' EXIT; \
		$(PYTHON) uvicorn apothecaria.main:app --reload --host 127.0.0.1 --port 8000 --app-dir backend 2>&1 | sed 's/^/[api] /' & \
		$(NPM) run dev 2>&1 | sed 's/^/[web] /' & \
		wait

backend-dev:
	$(PYTHON) uvicorn apothecaria.main:app --reload --host 127.0.0.1 --port 8000 --app-dir backend

frontend-dev:
	$(NPM) run dev

build:
	$(NPM) run build

test:
	$(PYTHON) pytest

lint:
	$(PYTHON) ruff check backend
	$(NPM) run typecheck

format:
	$(PYTHON) ruff format backend

type:
	$(PYTHON) mypy backend/apothecaria

seed:
	$(PYTHON) python -m apothecaria.db.seed

db-reset:
	rm -f apothecaria.sqlite apothecaria.sqlite-journal
	$(MAKE) seed

clean:
	rm -rf .venv .pytest_cache .mypy_cache .ruff_cache *.egg-info __pycache__
	rm -rf frontend/node_modules frontend/dist frontend/.vite
	find . -type d -name __pycache__ -exec rm -rf {} +
```

- [ ] **Step 2: Verify root `.gitignore` covers frontend artifacts**

The Phase A `.gitignore` already includes `node_modules/`, `dist/`, `.vite/`. No edit needed unless those lines are missing — if so, append them.

- [ ] **Step 3: Update `README.md` quickstart**

Replace the "Quickstart" section with:

````markdown
## Quickstart

```bash
git clone <this-repo>
cd <repo>
uv sync                # install python deps
make install           # install frontend deps (npm)
make seed              # creates apothecaria.sqlite
make dev               # backend on :8000, frontend on :5173
```

Open <http://localhost:5173> for the game, or <http://localhost:8000/api/health> for a backend health check.

## Make targets

| Target | What |
|---|---|
| `make dev` | Run backend + frontend together |
| `make backend-dev` | Backend only |
| `make frontend-dev` | Frontend only |
| `make install` | `npm install` for the frontend |
| `make build` | TypeScript + vite production build |
| `make test` | Run pytest (backend) |
| `make lint` | `ruff check` + `tsc --noEmit` |
| `make format` | `ruff format` |
| `make type` | `mypy` |
| `make seed` | Upsert JSON content into SQLite |
| `make db-reset` | Delete the sqlite file and re-seed |
````

(Leave the rest of the README untouched.)

- [ ] **Step 4: Verify lint target picks up frontend**

```bash
make lint
```

Expected: ruff check passes, tsc passes (the placeholder main.ts is valid).

- [ ] **Step 5: Commit**

```bash
git add Makefile README.md && git commit -m "chore: dev/build/install targets for frontend"
```

---

### Task 3: API client (typed fetch wrappers)

**Files:**
- Create: `frontend/src/api/client.ts`

- [ ] **Step 1: Write `frontend/src/api/client.ts`**

```ts
export type Ingredient = {
  slug: string;
  name: string;
  lore: string;
  asset_path: string;
};

export type Recipe = {
  slug: string;
  name: string;
  ailment_category: string;
  lore: string;
  ingredient_slugs: string[];
};

export type Customer = {
  id: string;
  name: string;
  persona: string;
  ailment_narrative: string;
  ailment_category: string;
  expected_recipe_slug: string;
};

export type BrewResult = {
  matched_recipe_slug: string | null;
  matched_recipe_name: string | null;
  matched_ailment_category: string | null;
  quality_score: number;
  ingredient_slugs: string[];
  description: string;
};

export type ServeResult = {
  outcome: "delighted" | "neutral" | "disappointed" | "confused";
  reputation_delta: number;
  new_reputation: number;
  customer_response: string;
};

export class ApiError extends Error {
  constructor(public status: number, public detail: string) {
    super(`HTTP ${status}: ${detail}`);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, detail);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const client = {
  getInventory: () => request<Ingredient[]>("/api/inventory"),
  getRecipes: () => request<Recipe[]>("/api/recipes"),
  getNextCustomer: () => request<Customer | null>("/api/customers/next"),
  spawnCustomer: () =>
    request<Customer>("/api/customers/spawn", { method: "POST" }),
  brew: (ingredient_slugs: string[]) =>
    request<BrewResult>("/api/brew", {
      method: "POST",
      body: JSON.stringify({ ingredient_slugs }),
    }),
  serve: (customerId: string, ingredient_slugs: string[]) =>
    request<ServeResult>(`/api/customers/${customerId}/serve`, {
      method: "POST",
      body: JSON.stringify({ ingredient_slugs }),
    }),
};
```

- [ ] **Step 2: Sanity-import in `main.ts`**

Replace `frontend/src/main.ts`:
```ts
import { client } from "./api/client";

console.log("apothecaria booting", client);
```

- [ ] **Step 3: Verify typecheck passes**

```bash
make lint
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/api/client.ts frontend/src/main.ts
git commit -m "feat(frontend/api): typed fetch wrappers"
```

---

### Task 4: WebSocket client with reconnect

**Files:**
- Create: `frontend/src/api/ws-client.ts`

- [ ] **Step 1: Write `frontend/src/api/ws-client.ts`**

```ts
export type CustomerArrivedEvent = {
  type: "customer.arrived";
  id: string;
  name: string;
  persona: string;
  ailment_narrative: string;
  ailment_category: string;
};

export type WsEvent = CustomerArrivedEvent;

type Listener = (event: WsEvent) => void;
type StatusListener = (connected: boolean) => void;

const BACKOFFS_MS = [1000, 2000, 5000];

export class WsClient {
  private ws: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private statusListeners = new Set<StatusListener>();
  private attempt = 0;
  private closed = false;

  constructor(private url: string) {}

  connect(): void {
    this.closed = false;
    this.open();
  }

  close(): void {
    this.closed = true;
    this.ws?.close();
    this.ws = null;
  }

  on(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private open(): void {
    const ws = new WebSocket(this.url);
    this.ws = ws;
    ws.addEventListener("open", () => {
      this.attempt = 0;
      this.statusListeners.forEach((l) => l(true));
    });
    ws.addEventListener("message", (e) => {
      try {
        const event = JSON.parse(e.data) as WsEvent;
        this.listeners.forEach((l) => l(event));
      } catch {
        // ignore malformed
      }
    });
    ws.addEventListener("close", () => {
      this.statusListeners.forEach((l) => l(false));
      if (this.closed) return;
      const delay = BACKOFFS_MS[Math.min(this.attempt, BACKOFFS_MS.length - 1)];
      this.attempt += 1;
      setTimeout(() => this.open(), delay);
    });
    ws.addEventListener("error", () => {
      ws.close();
    });
  }
}

export function makeWsClient(): WsClient {
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return new WsClient(`${proto}//${window.location.host}/ws/events`);
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd frontend && npx tsc --noEmit && cd ..
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/api/ws-client.ts
git commit -m "feat(frontend/api): websocket client with backoff reconnect"
```

---

### Task 5: Session state with pub-sub

**Files:**
- Create: `frontend/src/state/session.ts`

- [ ] **Step 1: Write `frontend/src/state/session.ts`**

```ts
import type { Customer } from "../api/client";

export type Session = {
  currentCustomer: Customer | null;
  cauldronContents: string[];
  reputation: number;
};

type Listener = (state: Readonly<Session>) => void;

const state: Session = {
  currentCustomer: null,
  cauldronContents: [],
  reputation: 0,
};

const listeners = new Set<Listener>();

export const session = {
  get(): Readonly<Session> {
    return state;
  },
  setCurrentCustomer(c: Customer | null): void {
    state.currentCustomer = c;
    notify();
  },
  addIngredient(slug: string): void {
    state.cauldronContents.push(slug);
    notify();
  },
  clearCauldron(): void {
    state.cauldronContents = [];
    notify();
  },
  setReputation(value: number): void {
    state.reputation = value;
    notify();
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    listener(state);
    return () => listeners.delete(listener);
  },
};

function notify(): void {
  listeners.forEach((l) => l(state));
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd frontend && npx tsc --noEmit && cd ..
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/state/session.ts
git commit -m "feat(frontend/state): pub-sub session state"
```

---

### Task 6: Scene boot — camera, lights, render loop

**Files:**
- Create: `frontend/src/scene/scene.ts`
- Modify: `frontend/src/main.ts`

- [ ] **Step 1: Write `frontend/src/scene/scene.ts`**

```ts
import * as THREE from "three";

export type Scene = {
  three: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  raycaster: THREE.Raycaster;
  pointer: THREE.Vector2;
  registerUpdate: (fn: (dt: number) => void) => void;
};

export function initScene(canvas: HTMLCanvasElement): Scene {
  const three = new THREE.Scene();
  three.background = new THREE.Color("#f3e9d0");

  const aspect = window.innerWidth / window.innerHeight;
  const viewSize = 6;
  const camera = new THREE.OrthographicCamera(
    -viewSize * aspect,
    viewSize * aspect,
    viewSize,
    -viewSize,
    0.1,
    100,
  );
  camera.position.set(4, 4, 8);
  camera.lookAt(0, 1.5, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Warm key + cool fill + soft ambient
  const key = new THREE.DirectionalLight("#e6b85c", 1.4);
  key.position.set(5, 8, 5);
  three.add(key);
  const fill = new THREE.DirectionalLight("#5a7a9a", 0.4);
  fill.position.set(-5, 4, -2);
  three.add(fill);
  three.add(new THREE.AmbientLight("#ffffff", 0.3));

  // Floor (subtle wooden plank tone)
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: "#5a3a22", roughness: 0.95 }),
  );
  floor.rotation.x = -Math.PI / 2;
  three.add(floor);

  const updates: ((dt: number) => void)[] = [];
  const clock = new THREE.Clock();

  function loop(): void {
    const dt = clock.getDelta();
    updates.forEach((u) => u(dt));
    renderer.render(three, camera);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  window.addEventListener("resize", () => {
    const a = window.innerWidth / window.innerHeight;
    camera.left = -viewSize * a;
    camera.right = viewSize * a;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return {
    three,
    camera,
    renderer,
    raycaster: new THREE.Raycaster(),
    pointer: new THREE.Vector2(),
    registerUpdate: (fn) => {
      updates.push(fn);
    },
  };
}
```

- [ ] **Step 2: Replace `frontend/src/main.ts`**

```ts
import { initScene } from "./scene/scene";
import "./styles/main.css";

const canvas = document.getElementById("scene") as HTMLCanvasElement;
initScene(canvas);
```

- [ ] **Step 3: Verify typecheck + build**

```bash
make lint
```

Expected: passes.

- [ ] **Step 4: Manual smoke**

```bash
make frontend-dev
```

Open <http://localhost:5173>. Expected: a parchment-cream background with a brown floor visible at the bottom of the viewport. Quit with Ctrl-C.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/scene/scene.ts frontend/src/main.ts
git commit -m "feat(frontend/scene): camera + lights + render loop"
```

---

### Task 7: Animations module (tween helpers)

**Files:**
- Create: `frontend/src/scene/animations.ts`

- [ ] **Step 1: Write `frontend/src/scene/animations.ts`**

```ts
import * as THREE from "three";

export type Tween = (dt: number) => boolean; // returns true while running

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
    // Parabolic y: 4 * peak * t * (1 - t) blended with linear from start.y to end.y
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
```

- [ ] **Step 2: Wire `tickTweens` into the render loop**

In `frontend/src/scene/scene.ts`, add the import and a registered update.

Add to imports:
```ts
import { tickTweens } from "./animations";
```

After `requestAnimationFrame(loop);` (the first one), insert before the `window.addEventListener("resize"` block:
```ts
updates.push((dt) => tickTweens(dt));
```

- [ ] **Step 3: Verify typecheck**

```bash
make lint
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/scene/animations.ts frontend/src/scene/scene.ts
git commit -m "feat(frontend/scene): tween helpers (arc, fade, color lerp)"
```

---

### Task 8: Cauldron component

**Files:**
- Create: `frontend/src/scene/cauldron.ts`
- Modify: `frontend/src/main.ts`

- [ ] **Step 1: Write `frontend/src/scene/cauldron.ts`**

```ts
import * as THREE from "three";
import { colorLerp } from "./animations";

export type Cauldron = {
  group: THREE.Group;
  liquidPosition: THREE.Vector3; // where ingredients should arc to
  setLiquidColor: (hex: string) => void;
  resetColor: () => void;
};

const EMPTY_COLOR = "#2a3a3a";

export function createCauldron(scene: THREE.Scene): Cauldron {
  const group = new THREE.Group();

  // Stone plinth
  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.4, 0.5, 24),
    new THREE.MeshStandardMaterial({ color: "#6b6358", roughness: 0.9 }),
  );
  plinth.position.y = 0.25;
  group.add(plinth);

  // Cauldron body
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 0.7, 1.1, 32),
    new THREE.MeshStandardMaterial({ color: "#1f1a16", roughness: 0.6, metalness: 0.4 }),
  );
  body.position.y = 1.05;
  group.add(body);

  // Rim
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.95, 0.07, 12, 32),
    new THREE.MeshStandardMaterial({ color: "#2a2620", roughness: 0.5, metalness: 0.5 }),
  );
  rim.position.y = 1.6;
  rim.rotation.x = Math.PI / 2;
  group.add(rim);

  // Liquid surface (vertex-displaced disc)
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

  // Bubble animation: displace vertices with sine waves over time
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
  // Register the update by attaching to a userData hook that scene.ts will pick up.
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
```

- [ ] **Step 2: Update `scene.ts` to call any `group.userData.update`**

In `frontend/src/scene/scene.ts`, replace the `updates.push((dt) => tickTweens(dt));` block with:
```ts
updates.push((dt) => tickTweens(dt));
updates.push((dt) => {
  three.traverse((obj) => {
    const fn = (obj.userData as { update?: (dt: number) => void }).update;
    if (fn) fn(dt);
  });
});
```

- [ ] **Step 3: Mount the cauldron in `main.ts`**

```ts
import { initScene } from "./scene/scene";
import { createCauldron } from "./scene/cauldron";
import "./styles/main.css";

const canvas = document.getElementById("scene") as HTMLCanvasElement;
const scene = initScene(canvas);
createCauldron(scene.three);
```

- [ ] **Step 4: Manual smoke**

```bash
make frontend-dev
```

Open <http://localhost:5173>. Expected: cauldron visible center-stage with bubbling dark liquid surface. Quit.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/scene/cauldron.ts frontend/src/scene/scene.ts frontend/src/main.ts
git commit -m "feat(frontend/scene): cauldron with bubbling liquid + color lerp"
```

---

### Task 9: Shelf + jars (color from ingredient slug)

**Files:**
- Create: `frontend/src/scene/shelf.ts`
- Modify: `frontend/src/main.ts`

- [ ] **Step 1: Write `frontend/src/scene/shelf.ts`**

```ts
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

// Stable color from slug: simple FNV-1a-ish hash → HSL
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

  // Two horizontal boards
  const boardMat = new THREE.MeshStandardMaterial({ color: "#7a5a3a", roughness: 0.85 });
  for (let row = 0; row < 2; row++) {
    const board = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 0.6), boardMat);
    board.position.set(-3.0, 1.2 + row * 0.9, -1.0);
    group.add(board);
  }
  // Two vertical supports
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
```

- [ ] **Step 2: Update `main.ts` to fetch inventory and build the shelf**

```ts
import { initScene } from "./scene/scene";
import { createCauldron } from "./scene/cauldron";
import { createShelf } from "./scene/shelf";
import { client } from "./api/client";
import "./styles/main.css";

const canvas = document.getElementById("scene") as HTMLCanvasElement;
const scene = initScene(canvas);
createCauldron(scene.three);

client.getInventory().then((inv) => {
  createShelf(scene.three, inv);
});
```

- [ ] **Step 3: Manual smoke (backend must be running)**

```bash
make dev
```

Open <http://localhost:5173>. Expected: a shelf in the back-left with 6 colored jars in a 3×2 grid. Quit.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/scene/shelf.ts frontend/src/main.ts
git commit -m "feat(frontend/scene): shelf with 6 jars, colors derived from slug"
```

---

### Task 10: Grimoire model + click handler

**Files:**
- Create: `frontend/src/scene/grimoire.ts`
- Modify: `frontend/src/main.ts`

- [ ] **Step 1: Write `frontend/src/scene/grimoire.ts`**

```ts
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
```

- [ ] **Step 2: Mount grimoire in `main.ts`**

```ts
import { initScene } from "./scene/scene";
import { createCauldron } from "./scene/cauldron";
import { createShelf } from "./scene/shelf";
import { createGrimoire } from "./scene/grimoire";
import { client } from "./api/client";
import "./styles/main.css";

const canvas = document.getElementById("scene") as HTMLCanvasElement;
const scene = initScene(canvas);
createCauldron(scene.three);
createGrimoire(scene.three);

client.getInventory().then((inv) => {
  createShelf(scene.three, inv);
});
```

- [ ] **Step 3: Manual smoke**

```bash
make dev
```

Open <http://localhost:5173>. Expected: lectern + book on the right side of the cauldron. Quit.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/scene/grimoire.ts frontend/src/main.ts
git commit -m "feat(frontend/scene): grimoire (lectern + book)"
```

---

### Task 11: Door + NPC silhouette

**Files:**
- Create: `frontend/src/scene/door.ts`
- Modify: `frontend/src/main.ts`

- [ ] **Step 1: Write `frontend/src/scene/door.ts`**

```ts
import * as THREE from "three";
import { fadeAlpha } from "./animations";

export type Door = {
  group: THREE.Group;
  showSilhouette: () => void;
  hideSilhouette: () => void;
};

export function createDoor(scene: THREE.Scene): Door {
  const group = new THREE.Group();

  // Back wall — a tall plane behind everything
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 8),
    new THREE.MeshStandardMaterial({ color: "#d8c8a8", roughness: 0.95 }),
  );
  wall.position.set(0, 4, -3);
  group.add(wall);

  // Doorway frame — a U-shape made of three boxes
  const frameMat = new THREE.MeshStandardMaterial({ color: "#3a2a1a", roughness: 0.85 });
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.5, 0.2), frameMat);
  left.position.set(-1.0, 1.75, -2.95);
  const right = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.5, 0.2), frameMat);
  right.position.set(1.0, 1.75, -2.95);
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 0.2), frameMat);
  top.position.set(0, 3.4, -2.95);
  group.add(left, right, top);

  // Doorway dark interior
  const interior = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 3.3),
    new THREE.MeshBasicMaterial({ color: "#0a0a14" }),
  );
  interior.position.set(0, 1.65, -2.94);
  group.add(interior);

  // NPC silhouette plane
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
```

- [ ] **Step 2: Mount door in `main.ts`**

Add to imports:
```ts
import { createDoor } from "./scene/door";
```

After `createGrimoire(scene.three);`, add:
```ts
const door = createDoor(scene.three);
// Temporarily prove the silhouette works on a 3-second timer
setTimeout(() => door.showSilhouette(), 3000);
```

- [ ] **Step 3: Manual smoke**

```bash
make dev
```

Open <http://localhost:5173>. Expected: archway visible in the back; after 3s a dark silhouette fades in inside the doorway. Quit.

- [ ] **Step 4: Remove the temporary `setTimeout`**

In `main.ts`, delete the `setTimeout` line. Keep `const door = createDoor(scene.three);`.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/scene/door.ts frontend/src/main.ts
git commit -m "feat(frontend/scene): doorway + NPC silhouette fade"
```

---

### Task 12: Customer dialog overlay

**Files:**
- Create: `frontend/src/ui/customer-dialog.ts`

- [ ] **Step 1: Write `frontend/src/ui/customer-dialog.ts`**

```ts
import type { Customer } from "../api/client";

export type CustomerDialog = {
  show: (c: Customer) => void;
  hide: () => void;
  onServe: (cb: () => void) => void;
};

export function createCustomerDialog(): CustomerDialog {
  const root = document.getElementById("overlay-customer-dialog")!;
  let serveCallback: (() => void) | null = null;

  function render(c: Customer): void {
    root.innerHTML = `
      <div class="card customer-card">
        <h2>${escape(c.name)}</h2>
        <p class="persona">${escape(c.persona)}</p>
        <p class="narrative">${escape(c.ailment_narrative)}</p>
        <button id="customer-serve-btn" class="btn primary">Serve from cauldron</button>
      </div>
    `;
    root.hidden = false;
    document.getElementById("customer-serve-btn")!.addEventListener("click", () => {
      serveCallback?.();
    });
  }

  return {
    show: render,
    hide: () => {
      root.hidden = true;
      root.innerHTML = "";
    },
    onServe: (cb) => {
      serveCallback = cb;
    },
  };
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
```

- [ ] **Step 2: Append CSS for `customer-card` to `frontend/src/styles/main.css`**

Append:
```css
#overlay-customer-dialog {
  top: 24px;
  right: 24px;
  max-width: 360px;
  z-index: 10;
}
.card {
  background: var(--parchment);
  border: 1px solid var(--candle-gold);
  box-shadow: 0 8px 24px rgba(58, 42, 26, 0.25);
  padding: 18px 20px;
  border-radius: 6px;
}
.customer-card h2 {
  font-family: "Cormorant Garamond", Georgia, serif;
  margin: 0 0 4px;
  font-size: 28px;
}
.customer-card .persona {
  font-style: italic;
  color: var(--moonlight);
  margin: 0 0 12px;
  font-size: 14px;
}
.customer-card .narrative {
  margin: 0 0 16px;
  line-height: 1.45;
}
.btn {
  font-family: inherit;
  font-size: 16px;
  padding: 8px 16px;
  border: 1px solid var(--ink);
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  border-radius: 4px;
}
.btn.primary {
  background: var(--candle-gold);
}
.btn:hover {
  filter: brightness(0.95);
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Verify typecheck**

```bash
make lint
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/ui/customer-dialog.ts frontend/src/styles/main.css
git commit -m "feat(frontend/ui): customer dialog overlay"
```

---

### Task 13: Grimoire panel overlay

**Files:**
- Create: `frontend/src/ui/grimoire-panel.ts`
- Modify: `frontend/src/styles/main.css`

- [ ] **Step 1: Write `frontend/src/ui/grimoire-panel.ts`**

```ts
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
            <li>
              <h3>${esc(r.name)}</h3>
              <p class="lore">${esc(r.lore)}</p>
              <p class="ings">${r.ingredient_slugs.map(esc).join(" + ")}</p>
              <p class="cat">For ${esc(r.ailment_category)}</p>
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
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
```

- [ ] **Step 2: Append CSS**

Append to `frontend/src/styles/main.css`:
```css
#overlay-grimoire-panel {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 520px;
  width: 80vw;
  z-index: 20;
}
.grimoire-card {
  max-height: 70vh;
  overflow: auto;
}
.grimoire-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.grimoire-card h2 {
  font-family: "Cormorant Garamond", Georgia, serif;
  margin: 0;
  font-size: 32px;
}
.recipe-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.recipe-list li {
  padding: 12px 0;
  border-top: 1px solid rgba(58, 42, 26, 0.2);
}
.recipe-list h3 {
  font-family: "Cormorant Garamond", Georgia, serif;
  margin: 0 0 4px;
}
.recipe-list .lore {
  font-style: italic;
  margin: 4px 0;
}
.recipe-list .ings {
  margin: 4px 0;
  color: var(--moonlight);
}
.recipe-list .cat {
  margin: 4px 0;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
```

- [ ] **Step 3: Verify typecheck**

```bash
make lint
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/ui/grimoire-panel.ts frontend/src/styles/main.css
git commit -m "feat(frontend/ui): grimoire panel overlay"
```

---

### Task 14: Brew result overlay (toast)

**Files:**
- Create: `frontend/src/ui/brew-result.ts`
- Modify: `frontend/src/styles/main.css`

- [ ] **Step 1: Write `frontend/src/ui/brew-result.ts`**

```ts
import type { BrewResult, ServeResult } from "../api/client";

export type BrewResultOverlay = {
  showBrew: (r: BrewResult) => void;
  showServe: (r: ServeResult) => void;
};

const TOAST_MS = 4000;

export function createBrewResult(): BrewResultOverlay {
  const root = document.getElementById("overlay-brew-result")!;
  let timer: number | null = null;

  function showHTML(html: string, accent: string): void {
    if (timer !== null) window.clearTimeout(timer);
    root.innerHTML = `<div class="card toast" style="border-color:${accent}">${html}</div>`;
    root.hidden = false;
    timer = window.setTimeout(() => {
      root.hidden = true;
      root.innerHTML = "";
      timer = null;
    }, TOAST_MS);
  }

  return {
    showBrew: (r) => {
      const title = r.matched_recipe_name ?? "Unknown brew";
      const quality = `${Math.round(r.quality_score * 100)}% quality`;
      showHTML(
        `<h3>${esc(title)}</h3><p>${esc(r.description)}</p><p class="meta">${esc(quality)}</p>`,
        r.matched_recipe_slug ? "var(--candle-gold)" : "var(--moonlight)",
      );
    },
    showServe: (r) => {
      const accent =
        r.outcome === "delighted"
          ? "var(--candle-gold)"
          : r.outcome === "neutral"
            ? "var(--moonlight)"
            : "#a44";
      const sign = r.reputation_delta >= 0 ? "+" : "";
      showHTML(
        `<h3>${esc(r.outcome)}</h3><p>${esc(r.customer_response)}</p><p class="meta">Reputation ${sign}${r.reputation_delta} → ${r.new_reputation}</p>`,
        accent,
      );
    },
  };
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
```

- [ ] **Step 2: Append CSS**

Append to `frontend/src/styles/main.css`:
```css
#overlay-brew-result {
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 420px;
  z-index: 30;
  animation: toast-in 220ms ease-out;
}
.toast h3 {
  font-family: "Cormorant Garamond", Georgia, serif;
  margin: 0 0 6px;
  text-transform: capitalize;
  font-size: 22px;
}
.toast p {
  margin: 4px 0;
}
.toast .meta {
  color: var(--moonlight);
  font-size: 13px;
  letter-spacing: 0.5px;
}
@keyframes toast-in {
  from {
    opacity: 0;
    transform: translate(-50%, -10px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
```

- [ ] **Step 3: Verify typecheck**

```bash
make lint
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/ui/brew-result.ts frontend/src/styles/main.css
git commit -m "feat(frontend/ui): brew/serve result toast overlay"
```

---

### Task 15: Inventory bar (bottom strip)

**Files:**
- Create: `frontend/src/ui/inventory-bar.ts`
- Modify: `frontend/src/styles/main.css`

- [ ] **Step 1: Write `frontend/src/ui/inventory-bar.ts`**

```ts
import { session } from "../state/session";

export type InventoryBar = {
  onBrew: (cb: () => void) => void;
  onClear: (cb: () => void) => void;
  onGrimoire: (cb: () => void) => void;
};

export function createInventoryBar(): InventoryBar {
  const root = document.getElementById("overlay-inventory-bar")!;
  let brewCb: (() => void) | null = null;
  let clearCb: (() => void) | null = null;
  let grimoireCb: (() => void) | null = null;

  function render(): void {
    const s = session.get();
    root.innerHTML = `
      <div class="card bar">
        <div class="bar-section">
          <span class="label">Reputation</span>
          <span class="reputation">${s.reputation}</span>
        </div>
        <div class="bar-section flex-grow">
          <span class="label">Cauldron</span>
          <span class="contents">${
            s.cauldronContents.length === 0
              ? "<em>empty</em>"
              : s.cauldronContents.map(esc).join(" + ")
          }</span>
        </div>
        <div class="bar-section actions">
          <button id="bar-grimoire-btn" class="btn">Grimoire</button>
          <button id="bar-clear-btn" class="btn" ${s.cauldronContents.length === 0 ? "disabled" : ""}>Clear</button>
          <button id="bar-brew-btn" class="btn primary" ${s.cauldronContents.length === 0 ? "disabled" : ""}>Brew</button>
        </div>
      </div>
    `;
    document.getElementById("bar-brew-btn")!.addEventListener("click", () => brewCb?.());
    document.getElementById("bar-clear-btn")!.addEventListener("click", () => clearCb?.());
    document.getElementById("bar-grimoire-btn")!.addEventListener("click", () => grimoireCb?.());
  }

  session.subscribe(() => render());
  render();

  return {
    onBrew: (cb) => {
      brewCb = cb;
    },
    onClear: (cb) => {
      clearCb = cb;
    },
    onGrimoire: (cb) => {
      grimoireCb = cb;
    },
  };
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
```

- [ ] **Step 2: Append CSS**

Append to `frontend/src/styles/main.css`:
```css
#overlay-inventory-bar {
  left: 24px;
  right: 24px;
  bottom: 24px;
  z-index: 5;
}
.bar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 14px 20px;
}
.bar-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.bar-section.flex-grow {
  flex: 1;
}
.bar-section.actions {
  flex-direction: row;
  gap: 10px;
  align-items: center;
}
.bar .label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--moonlight);
}
.bar .reputation {
  font-family: "Cormorant Garamond", Georgia, serif;
  font-size: 26px;
}
.bar .contents {
  font-size: 16px;
}
```

- [ ] **Step 3: Verify typecheck**

```bash
make lint
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/ui/inventory-bar.ts frontend/src/styles/main.css
git commit -m "feat(frontend/ui): inventory bar with reputation + brew/clear"
```

---

### Task 16: Toast helper for errors

**Files:**
- Create: `frontend/src/ui/toast.ts`
- Modify: `frontend/src/styles/main.css`

- [ ] **Step 1: Write `frontend/src/ui/toast.ts`**

```ts
const root = () => document.getElementById("overlay-toast")!;

let timer: number | null = null;

export function showToast(message: string, kind: "info" | "error" = "info"): void {
  const el = root();
  if (timer !== null) window.clearTimeout(timer);
  el.innerHTML = `<div class="card toast ${kind === "error" ? "toast-error" : ""}">${escape(message)}</div>`;
  el.hidden = false;
  timer = window.setTimeout(() => {
    el.hidden = true;
    el.innerHTML = "";
    timer = null;
  }, 3500);
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
```

- [ ] **Step 2: Append CSS**

Append to `frontend/src/styles/main.css`:
```css
#overlay-toast {
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 360px;
  z-index: 40;
}
.toast-error {
  border-color: #a44 !important;
}
```

- [ ] **Step 3: Verify typecheck**

```bash
make lint
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/ui/toast.ts frontend/src/styles/main.css
git commit -m "feat(frontend/ui): toast helper for errors and notices"
```

---

### Task 17: Wire it all together in main.ts (jar clicks, brew, serve, WS)

**Files:**
- Modify: `frontend/src/main.ts`

- [ ] **Step 1: Replace `frontend/src/main.ts` with the full conductor**

```ts
import * as THREE from "three";
import { ApiError, client } from "./api/client";
import type { Customer } from "./api/client";
import { makeWsClient } from "./api/ws-client";
import { session } from "./state/session";
import { initScene } from "./scene/scene";
import { createCauldron } from "./scene/cauldron";
import { createShelf, type Jar } from "./scene/shelf";
import { createGrimoire } from "./scene/grimoire";
import { createDoor } from "./scene/door";
import { arcToCauldron } from "./scene/animations";
import { createCustomerDialog } from "./ui/customer-dialog";
import { createGrimoirePanel } from "./ui/grimoire-panel";
import { createBrewResult } from "./ui/brew-result";
import { createInventoryBar } from "./ui/inventory-bar";
import { showToast } from "./ui/toast";
import "./styles/main.css";

const canvas = document.getElementById("scene") as HTMLCanvasElement;
const scene = initScene(canvas);

const cauldron = createCauldron(scene.three);
const grimoireMesh = createGrimoire(scene.three);
const door = createDoor(scene.three);

const customerDialog = createCustomerDialog();
const grimoirePanel = createGrimoirePanel();
const brewResult = createBrewResult();
const inventoryBar = createInventoryBar();

let shelfJars: Jar[] = [];

// Stable color used for cauldron blend
const ingredientColors = new Map<string, string>();

void boot();

async function boot(): Promise<void> {
  try {
    const [inventory, recipes] = await Promise.all([
      client.getInventory(),
      client.getRecipes(),
    ]);
    const shelf = createShelf(scene.three, inventory);
    shelfJars = shelf.jars;
    grimoirePanel.setRecipes(recipes);

    inventory.forEach((i) => {
      const m = (
        shelfJars.find((j) => j.ingredient.slug === i.slug)?.mesh.children[0] as THREE.Mesh | undefined
      )?.material as THREE.MeshStandardMaterial | undefined;
      if (m) ingredientColors.set(i.slug, "#" + m.color.getHexString());
    });

    enableJarPicking();
    wireOverlays();
    connectWs();
  } catch (err) {
    const msg = err instanceof ApiError ? err.detail : String(err);
    showToast(`Failed to start: ${msg}`, "error");
  }
}

function enableJarPicking(): void {
  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    scene.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    scene.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    scene.raycaster.setFromCamera(scene.pointer, scene.camera);

    // Priority 1: grimoire book click
    const bookHits = scene.raycaster.intersectObject(grimoireMesh.hitMesh, true);
    if (bookHits.length > 0) {
      grimoirePanel.toggle();
      return;
    }

    // Priority 2: jar click
    const jarMeshes = shelfJars.map((j) => j.mesh);
    const jarHits = scene.raycaster.intersectObjects(jarMeshes, true);
    if (jarHits.length > 0) {
      const jar = shelfJars.find(
        (j) => jarHits[0].object === j.mesh.children[0] || jarHits[0].object.parent === j.mesh,
      );
      if (jar) addJarToCauldron(jar);
    }
  });
}

function addJarToCauldron(jar: Jar): void {
  const flying = jar.mesh.clone();
  // Hide its base (cork+glass) child opacity isn't necessary; just clone for visual feedback
  scene.three.add(flying);
  arcToCauldron(
    flying,
    jar.basePosition.clone(),
    cauldron.liquidPosition.clone(),
    0.7,
    () => {
      scene.three.remove(flying);
      session.addIngredient(jar.ingredient.slug);
      cauldron.setLiquidColor(blendedCauldronColor());
    },
  );
}

function blendedCauldronColor(): string {
  const slugs = session.get().cauldronContents;
  if (slugs.length === 0) return "#2a3a3a";
  const c = new THREE.Color("#000");
  let n = 0;
  for (const s of slugs) {
    const hex = ingredientColors.get(s);
    if (hex) {
      c.add(new THREE.Color(hex));
      n += 1;
    }
  }
  if (n === 0) return "#2a3a3a";
  c.multiplyScalar(1 / n);
  return "#" + c.getHexString();
}

function wireOverlays(): void {
  inventoryBar.onBrew(async () => {
    const slugs = session.get().cauldronContents;
    if (slugs.length === 0) return;
    try {
      const r = await client.brew(slugs);
      brewResult.showBrew(r);
    } catch (err) {
      showToast(errorText(err), "error");
    }
  });

  inventoryBar.onClear(() => {
    session.clearCauldron();
    cauldron.resetColor();
  });

  inventoryBar.onGrimoire(() => {
    grimoirePanel.toggle();
  });

  customerDialog.onServe(async () => {
    const c = session.get().currentCustomer;
    if (!c) return;
    const slugs = session.get().cauldronContents;
    if (slugs.length === 0) {
      showToast("Add ingredients before serving");
      return;
    }
    try {
      const r = await client.serve(c.id, slugs);
      brewResult.showServe(r);
      session.setReputation(r.new_reputation);
      session.setCurrentCustomer(null);
      session.clearCauldron();
      cauldron.resetColor();
      customerDialog.hide();
      door.hideSilhouette();
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        showToast("That customer has left the shop");
        session.setCurrentCustomer(null);
        customerDialog.hide();
        door.hideSilhouette();
      } else {
        showToast(errorText(err), "error");
      }
    }
  });
}

function connectWs(): void {
  const ws = makeWsClient();
  ws.onStatus((connected) => {
    if (!connected) showToast("Live updates paused — game still works");
  });
  ws.on((event) => {
    if (event.type === "customer.arrived") {
      const c: Customer = {
        id: event.id,
        name: event.name,
        persona: event.persona,
        ailment_narrative: event.ailment_narrative,
        ailment_category: event.ailment_category,
        expected_recipe_slug: "",
      };
      // Only show the new customer if there isn't one already on the counter
      if (!session.get().currentCustomer) {
        session.setCurrentCustomer(c);
        customerDialog.show(c);
        door.showSilhouette();
      }
    }
  });
  ws.connect();
}

function errorText(err: unknown): string {
  if (err instanceof ApiError) return err.detail || `HTTP ${err.status}`;
  return err instanceof Error ? err.message : String(err);
}
```

- [ ] **Step 2: Verify typecheck**

```bash
make lint
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/main.ts
git commit -m "feat(frontend): wire scene + overlays + ws into main"
```

---

### Task 18: CSS polish pass

**Files:**
- Modify: `frontend/src/styles/main.css`

- [ ] **Step 1: Replace the whole file with a polished version**

```css
:root {
  --parchment: #f3e9d0;
  --parchment-dark: #e8dcb8;
  --ink: #3a2a1a;
  --candle-gold: #e6b85c;
  --moonlight: #5a7a9a;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  height: 100%;
  background: var(--parchment);
  color: var(--ink);
  font-family: "EB Garamond", Georgia, serif;
  font-size: 16px;
  overflow: hidden;
}

#scene {
  display: block;
  width: 100vw;
  height: 100vh;
}

.overlay {
  position: fixed;
  user-select: none;
}

.card {
  background: var(--parchment);
  border: 1px solid var(--candle-gold);
  box-shadow: 0 8px 24px rgba(58, 42, 26, 0.25);
  padding: 18px 20px;
  border-radius: 6px;
}

.btn {
  font-family: inherit;
  font-size: 16px;
  padding: 8px 16px;
  border: 1px solid var(--ink);
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  border-radius: 4px;
  transition: filter 120ms ease;
}
.btn.primary {
  background: var(--candle-gold);
}
.btn:hover {
  filter: brightness(0.95);
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Customer dialog (top-right) */
#overlay-customer-dialog {
  top: 24px;
  right: 24px;
  max-width: 360px;
  z-index: 10;
}
.customer-card h2 {
  font-family: "Cormorant Garamond", Georgia, serif;
  margin: 0 0 4px;
  font-size: 28px;
}
.customer-card .persona {
  font-style: italic;
  color: var(--moonlight);
  margin: 0 0 12px;
  font-size: 14px;
}
.customer-card .narrative {
  margin: 0 0 16px;
  line-height: 1.45;
}

/* Grimoire panel (modal) */
#overlay-grimoire-panel {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 520px;
  width: 80vw;
  z-index: 20;
}
.grimoire-card {
  max-height: 70vh;
  overflow: auto;
}
.grimoire-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.grimoire-card h2 {
  font-family: "Cormorant Garamond", Georgia, serif;
  margin: 0;
  font-size: 32px;
}
.recipe-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.recipe-list li {
  padding: 12px 0;
  border-top: 1px solid rgba(58, 42, 26, 0.2);
}
.recipe-list h3 {
  font-family: "Cormorant Garamond", Georgia, serif;
  margin: 0 0 4px;
}
.recipe-list .lore {
  font-style: italic;
  margin: 4px 0;
}
.recipe-list .ings {
  margin: 4px 0;
  color: var(--moonlight);
}
.recipe-list .cat {
  margin: 4px 0;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Brew result toast (top-center) */
#overlay-brew-result {
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 420px;
  z-index: 30;
  animation: toast-in 220ms ease-out;
}
.toast h3 {
  font-family: "Cormorant Garamond", Georgia, serif;
  margin: 0 0 6px;
  text-transform: capitalize;
  font-size: 22px;
}
.toast p {
  margin: 4px 0;
}
.toast .meta {
  color: var(--moonlight);
  font-size: 13px;
  letter-spacing: 0.5px;
}
@keyframes toast-in {
  from {
    opacity: 0;
    transform: translate(-50%, -10px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* Inventory bar (bottom strip) */
#overlay-inventory-bar {
  left: 24px;
  right: 24px;
  bottom: 24px;
  z-index: 5;
}
.bar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 14px 20px;
}
.bar-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.bar-section.flex-grow {
  flex: 1;
}
.bar-section.actions {
  flex-direction: row;
  gap: 10px;
  align-items: center;
}
.bar .label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--moonlight);
}
.bar .reputation {
  font-family: "Cormorant Garamond", Georgia, serif;
  font-size: 26px;
}
.bar .contents {
  font-size: 16px;
}

/* Generic toast (errors, notices) — bottom-center above the bar */
#overlay-toast {
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 360px;
  z-index: 40;
}
.toast-error {
  border-color: #a44 !important;
}
```

- [ ] **Step 2: Verify typecheck + dev server still boots**

```bash
make lint && cd frontend && timeout 3 npx vite || true && cd ..
```

Expected: lint passes, vite starts.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/styles/main.css
git commit -m "style(frontend): consolidated CSS pass"
```

---

### Task 19: End-to-end smoke test

**Files:** none (manual verification only)

- [ ] **Step 1: Reset DB and start the stack with fast arrivals**

```bash
make db-reset
APOTHECARIA_CUSTOMER_ARRIVAL_SECONDS=5 make dev
```

Expected: backend `[api]` lines and frontend `[web] VITE …` lines interleave; no errors.

- [ ] **Step 2: Open the app**

Open <http://localhost:5173>.

Expected: scene loads with cauldron + shelf + grimoire + archway. Inventory bar shows reputation 0 and "empty" cauldron.

- [ ] **Step 3: Wait ~5 seconds for a customer arrival**

Expected: dark silhouette fades into the doorway; customer dialog appears top-right.

- [ ] **Step 4: Click 3 jars**

Expected: each jar visibly arcs into the cauldron (clone of the jar mesh tweens in a parabola). Inventory bar updates. Cauldron color shifts.

- [ ] **Step 5: Click "Brew"**

Expected: top-center toast shows match name + quality + lore.

- [ ] **Step 6: Click "Serve"**

Expected: serve toast (delighted/neutral/disappointed/confused). Reputation updates. Customer silhouette fades; dialog closes; cauldron empties + color resets.

- [ ] **Step 7: Click the book**

Expected: grimoire panel opens with 4 recipes. Click × to close.

- [ ] **Step 8: Stop the server**

`Ctrl-C`. Both `[api]` and `[web]` should exit cleanly.

- [ ] **Step 9: No commit (verification only)**

---

### Task 20: README polish + final verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Append a "Phase B / frontend" section to `README.md`**

Append to `README.md`:

````markdown
## Frontend

- Vite + TypeScript + Three.js, all procedural geometry (no asset files).
- Vanilla DOM overlays for the four panels (customer dialog, grimoire, brew result, inventory bar).
- `make dev` starts both processes; backend is `[api]`-prefixed, frontend `[web]`-prefixed.
- `make build` produces a static bundle in `frontend/dist/`.
- `make install` runs `npm install` inside `frontend/`. Run it once after cloning.

### Adding a new ingredient

The frontend has no asset files. Adding an ingredient is purely a backend edit:

1. Edit `backend/apothecaria/content/ingredients.json`.
2. Run `make seed` (upsert).
3. Refresh the browser. A new jar appears on the shelf, color derived from the slug.

The M1 workshop module wraps this flow in a `/new-ingredient` skill.
````

- [ ] **Step 2: Run full verification**

```bash
make lint
make test
make build
```

Expected:
- `make lint` — `ruff check` clean, `tsc --noEmit` clean.
- `make test` — 53+ pytest passes (Phase A unchanged).
- `make build` — vite produces `frontend/dist/` with `index.html` + js bundle.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: README updates for frontend bring-up"
```

- [ ] **Step 4: Tag**

```bash
git tag phase-b-frontend
```

---

## Final verification checklist

- [ ] `make lint` clean
- [ ] `make test` clean (53+ tests)
- [ ] `make build` produces `frontend/dist/`
- [ ] `make dev` starts both processes; `Ctrl-C` stops both
- [ ] Manual smoke (Task 19) end-to-end succeeds
- [ ] `phase-b-frontend` tag exists

---

## Self-review

**Spec coverage (against `2026-05-07-apothecaria-phase-b-frontend-design.md`):**

| Spec section | Where covered |
|---|---|
| §3 Stack: Vite + TS strict + Three.js + vanilla DOM + plain CSS, no tests | Task 1 |
| §4 Architecture (3 layers + main conductor) | Tasks 6, 12–17 |
| §5 File layout | Tasks 1, 3–17 |
| §6 Scene composition (shelf, cauldron, grimoire, archway, NPC) | Tasks 8–11 |
| §7 UI overlays (4 overlays as listed) | Tasks 12–15 |
| §8 Data flow (boot, arrival, brew, serve) | Task 17 |
| §9 Pub-sub session state | Task 5 |
| §10 Error handling (WS reconnect, 404, 5xx, scene init) | Tasks 4, 16, 17 |
| §11 Build & dev (`make dev` runs both, Vite proxy) | Tasks 1, 2 |
| §12 Aesthetic (palette + serif typography) | Tasks 1, 18 |
| §13 Out of scope (skill, MCP, plugins, agents) | Not implemented (correct) |
| §14 Success criteria | Task 19 (smoke) |
| §15 Open notes (proxy, install step, bundle size) | Tasks 1, 2 |

**Placeholder scan:** No "TBD", "TODO", or "implement later" strings. All code blocks are complete.

**Type consistency:**
- `client.brew(slugs)` returns `BrewResult` — defined Task 3, used Task 17.
- `client.serve(id, slugs)` returns `ServeResult` — defined Task 3, used Task 17.
- `Customer` shape — defined Task 3, used Tasks 5, 12, 17.
- `Ingredient`, `Recipe` — defined Task 3, used Tasks 9, 13, 17.
- `Jar` — defined Task 9, used Task 17.
- `session` API (`get`, `setCurrentCustomer`, `addIngredient`, `clearCauldron`, `setReputation`, `subscribe`) — defined Task 5, used Tasks 15, 17.
- `arcToCauldron`, `fadeAlpha`, `colorLerp` — defined Task 7, used Tasks 8, 11, 17.
- `Cauldron` API (`liquidPosition`, `setLiquidColor`, `resetColor`) — defined Task 8, used Task 17.
- `Door` API (`showSilhouette`, `hideSilhouette`) — defined Task 11, used Task 17.

No drift detected.

---

## Open implementation notes (non-blocking)

- The cauldron's per-frame vertex update (Task 8) runs every frame on every face. For ~50 verts at 60fps this is fine; if a future "performance fallback" mode is added, swap to a simpler material toggle.
- `WsClient` doesn't surface granular reconnect state to the UI — only "connected / not." If the workshop wants a "reconnecting in 3s…" countdown, the `attempt`/`delay` fields are easy to expose.
- `frontend/dist/` is git-ignored. If a student wants to preview the prod build, `npm --prefix frontend run preview` works after `make build`.
