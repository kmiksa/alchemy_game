# Apothecaria Phase B — Frontend Design

**Date:** 2026-05-07
**Status:** Design (ready for plan-writing)
**Builds on:** [Phase A backend implementation plan](../plans/2026-05-07-apothecaria-phase-a-backend.md), [Workshop design](2026-05-07-apothecaria-workshop-design.md)

## 1. Purpose

Build the visual frontend that turns the Phase A REST/WS backend into a playable cozy-alchemist game. Students cloning the repo run `make dev` and see a 3D brewing scene with arriving customers, drag-style ingredient interactions, and a recipe grimoire — all driven by the existing backend with no new server code.

Phase B does **not** add gameplay logic to the backend. All brewing/reputation/customer-queue logic already exists in Phase A; Phase B is the consumer layer.

## 2. Audience-driven scope

- **Workshop is backend-focused.** Students extend Python (skills, MCP, agents) — they will not edit frontend code during the day. The frontend only needs to *render* their backend changes (e.g., a new ingredient added by the M1 skill should appear as a new jar without touching the frontend).
- **Students aren't JS experts.** No framework, no templating library, no advanced TS. Whatever is shipped must be readable enough for an instructor to point to during a Q&A but not so deep that students feel they need to understand it.
- **"Less code" is a hard constraint.** When choosing between two approaches, prefer the one that ships fewer lines, fewer files, and fewer dependencies, even at some aesthetic cost.

## 3. Stack

- **Vite** + **TypeScript (strict)** + **Three.js** (procedural geometry only — no GLTF assets).
- **Vanilla DOM** for the four UI overlays (no `lit-html`, no React).
- **Plain CSS** for theming (no Tailwind / no design system).
- **Vite dev proxy** for `/api` and `/ws` to `localhost:8000`, so the SPA runs same-origin.
- **No frontend tests.** `tsc --noEmit` is the only static check; manual smoke testing via `make dev`.

Runtime deps: `three` only. Dev deps: `vite`, `typescript`, `@types/three`.

## 4. Architecture

Three layers plus a tiny session-state object:

1. **Scene layer (`src/scene/*`)** — Three.js. Fixed orthographic camera. Pure procedural geometry. One render loop in `scene.ts` drives all per-frame updates (bubbles, color lerps, in-flight tweens).
2. **UI layer (`src/ui/*`)** — Plain TS classes that own a DOM container, exposing `show()`, `hide()`, `update(state)`. CSS handles positioning. No DOM framework.
3. **API layer (`src/api/*`)** — `client.ts` (typed `fetch` wrappers for each REST route) + `ws-client.ts` (WebSocket subscriber with reconnect-with-backoff).

`main.ts` is the conductor: boots scene, opens WS, wires overlay events to the API, owns `state/session.ts` (current customer, cauldron contents).

## 5. File layout

```
frontend/
  package.json              # three; vite, typescript, @types/three (dev)
  vite.config.ts            # proxy /api → :8000, /ws → :8000
  tsconfig.json             # strict
  index.html                # one canvas, one container div per overlay
  src/
    main.ts                 # boot + glue
    scene/
      scene.ts              # camera, lights, render loop, scene root
      cauldron.ts           # geometry, liquid color, bubble shader
      shelf.ts              # shelf box + 6 ingredient jars (color = inventory)
      grimoire.ts           # book on stand, click handler
      door.ts               # archway + NPC silhouette plane
      animations.ts         # arcToCauldron, fadeIn, colorLerp tween helpers
    ui/
      customer-dialog.ts    # ailment narrative + Serve button
      grimoire-panel.ts     # opens on book click, lists recipes
      brew-result.ts        # match + quality + lore after Brew
      inventory-bar.ts      # bottom strip: reputation, cauldron contents, Brew/Clear
    api/
      client.ts             # GET inventory/recipes, POST brew/customers/{id}/serve
      ws-client.ts          # WS subscriber, typed events, backoff reconnect
    state/
      session.ts            # currentCustomer, cauldronContents, reputation
    styles/
      main.css              # parchment palette, warm typography, overlay positioning
```

No `public/assets/`. Fonts pulled from a single Google Fonts link in `index.html` (with system serif fallback if offline).

## 6. Scene composition

Fixed orthographic camera, looking at a 3/4-view alcove. From left to right:

- **Shelf** (back-left wall) — three vertical boards holding 6 jars in a 3×2 grid. Each jar = capped cylinder + cork. Jar colors are derived from a hash of the ingredient slug so M1's new ingredients automatically get a stable color.
- **Cauldron** (center foreground) — large cylinder + torus rim, sitting on a stone plinth. Liquid surface is a colored disc; bubble layer is a vertex-displacement shader sampling sin waves over time. Liquid color lerps toward a blend of the active ingredient colors.
- **Grimoire** (right foreground) — closed book on a small lectern. Click opens the grimoire overlay.
- **Archway** (back wall) — door frame + black plane. NPC silhouette = a single tall dark plane that fades alpha 0→0.7 on `customer.arrived`, fades back on serve.

Lighting: one warm key light (candle gold), one cool fill (moonlight blue), ambient at ~0.3. Background is parchment cream — no skybox.

## 7. UI overlays

Each overlay is a TS class around a fixed `<div>` in `index.html`. CSS pins position; class controls visibility and content.

- **`customer-dialog`** (top-right) — Customer name + ailment narrative. "Serve current cauldron" button. Hidden until a customer arrives.
- **`grimoire-panel`** (modal-style, opens on book click) — Lists the 4 recipes from `/api/recipes`, each with name, lore, and required ingredients. Close button. (Search is intentionally out of scope; M3 plugins exercise can add it.)
- **`brew-result`** (centered toast that auto-dismisses after ~4s) — After `POST /api/brew`, shows match name (or "Unknown brew"), quality score, and lore description.
- **`inventory-bar`** (bottom strip, always visible) — Reputation count, list of ingredients currently in the cauldron, "Brew" button, "Clear cauldron" button. "Brew" is disabled when cauldron is empty.

## 8. Data flow

**Boot (in `main.ts`):**
1. `Promise.all([client.getInventory(), client.getRecipes()])` → render shelf jars and prime the grimoire panel.
2. `wsClient.connect()` and subscribe to `customer.arrived`.
3. Mount scene, start render loop.

**Customer arrival (WS push):**
1. WS event → `door.fadeInSilhouette()` + `customerDialog.show(event)` + `session.currentCustomer = event`.

**Player brews:**
1. Click jar → `animations.arcToCauldron(jar)` → on tween complete, `session.cauldronContents.push(slug)`, `cauldron.lerpColorTo(blendedColor)`, `inventoryBar.update(session)`.
2. Click "Brew" → `client.brew({ ingredient_slugs: session.cauldronContents })` → `brewResult.show(response)`.
3. Click "Serve" → `client.serve(session.currentCustomer.id, { ingredient_slugs: session.cauldronContents })` → `brewResult.show(serveResponse)`, `customerDialog.hide()`, `door.fadeOutSilhouette()`, `session.cauldronContents = []`, `session.reputation = response.new_reputation`, `inventoryBar.update(session)`, `cauldron.lerpColorTo(emptyColor)`.

**Player clears:** "Clear cauldron" → reset contents + color, no API call.

## 9. State

`state/session.ts` exports a single mutable object plus a tiny pub-sub:

```ts
type SessionState = {
  currentCustomer: CustomerArrived | null;
  cauldronContents: string[];     // ingredient slugs in order
  reputation: number;
};
```

Subscribers (`inventoryBar`, `cauldron`) register a callback; whenever any setter is called, they're invoked. ~30 lines including types. No state library.

## 10. Error handling

- **WS disconnect** — `ws-client.ts` retries with 1s, 2s, 5s, then 5s indefinitely. While disconnected, a small banner reads "live updates paused — game still works." REST endpoints continue to function.
- **404 on `serve`** (customer already served / expired) — show a toast "customer left the shop"; close dialog; clear current customer in session.
- **400 on `brew`** (empty ingredient list) — guarded by disabled "Brew" button so this should never reach the network. If it does, toast the error detail.
- **5xx anywhere** — generic toast with the response detail. No retry.
- **Asset / scene init errors** — fail loudly: render an HTML error page over the canvas with the error message. The workshop has no time for silent failures.

## 11. Build & dev

- **`frontend/`** is its own subproject. Vite serves dev on 5173 and builds to `frontend/dist/`.
- **Vite proxy** sends `/api/*` to `http://localhost:8000` and `/ws/*` to `ws://localhost:8000` so the SPA always uses same-origin URLs (no CORS to worry about beyond what Phase A already configured).
- **`make dev`** is updated to start backend (uvicorn) in the background and Vite in the foreground; `Ctrl-C` stops both. Backend logs are prefixed `[api]`, frontend `[web]` via shell `sed`.
- **`make build`** runs `tsc --noEmit` and `vite build`.
- **`make lint`** is extended to run `tsc --noEmit` against `frontend/`.
- **No prod-server step.** The starter doesn't deploy. If a student wants prod, `frontend/dist/` is a static folder and Vite docs cover it.

## 12. Aesthetic

Palette anchors:
- **Parchment cream** `#f3e9d0` — page background, jar labels.
- **Ink** `#3a2a1a` — text, line weight, archway depth.
- **Candle gold** `#e6b85c` — key light, accent borders, brew highlights.
- **Moonlight blue** `#5a7a9a` — fill light, grimoire trim.

Typography: serif for body (e.g., `EB Garamond` via Google Fonts), bolder serif for headings (e.g., `Cormorant Garamond`). Falls back to system serif if Google Fonts is blocked.

No icons. Buttons are bordered text only. Overlays use a soft drop shadow and 1px gold border on parchment.

## 13. What's intentionally NOT included

Out of scope for Phase B (per workshop design §4.4):

- `/new-ingredient` skill — Module 1.
- Inventory MCP server — Module 2.
- Plugin installs / integration — Module 3.
- pydantic-ai customer/sage agents — Module 4.
- Recipe search in grimoire (M3 candidate exercise).
- Audio / sound effects.
- Mobile / responsive layouts.
- Save/load beyond what SQLite gives for free in Phase A.
- Authentication, multiplayer, cloud deploy, internationalization.

## 14. Success criteria

After `make dev`, a student should:

1. See the 3D brewing alcove load within 2 seconds on a mid-tier laptop.
2. See a customer arrive within 30 seconds (or 5 seconds with `APOTHECARIA_CUSTOMER_ARRIVAL_SECONDS=5`).
3. Click a jar and see an ingredient arc into the cauldron.
4. Click "Brew" and see a result panel.
5. Click "Serve" and see reputation update.
6. Open the grimoire and see the four recipes.

After M1 (student adds a new ingredient via the skill):
- The new ingredient appears as a new jar on the shelf with no frontend code change. The jar's color is derived from the slug; no asset file is needed.

## 15. Open notes for the implementation plan

- **Backend port assumption** — Phase A binds 8000. Vite proxy in dev assumes that. If the student already has 8000 in use, they get an obvious uvicorn error, not a silent frontend failure.
- **`make dev` shell complexity** — running two processes from a Makefile is fiddly across shells. Plan should consider a simple `scripts/dev.sh` if the inline form gets ugly.
- **Frontend `package.json` install step** — first `make dev` needs `npm install` to have run. Plan should add a `make install` target or have `make dev` check for `node_modules` and install if missing.
- **Three.js bundle size** — `three` is ~600KB minified. For a workshop starter on local laptops that's fine; no need for tree-shaking or lazy-loading.
