# Apothecaria repository instructions

## Build, test, and lint commands

Run from repository root.

| Command | Purpose |
| --- | --- |
| `uv sync` | Install Python dependencies |
| `make install` | Install frontend dependencies (`npm --prefix frontend install`) |
| `make dev` | Run backend (`:8000`) and frontend (`:5173`) together |
| `make backend-dev` | Run FastAPI backend only |
| `make frontend-dev` | Run Vite frontend only |
| `make build` | Frontend production build (`tsc --noEmit && vite build`) |
| `make lint` | Backend lint (`ruff check backend`) + frontend typecheck (`tsc --noEmit`) |
| `make format` | Format backend with Ruff |
| `make type` | Strict mypy on `backend/apothecaria` |
| `make test` | Run backend pytest suite |
| `make seed` | Upsert JSON content into SQLite DB |
| `make db-reset` | Recreate local SQLite DB from seed files |

Single-test examples:

- `uv run pytest backend/tests/test_api_brew.py::test_brew_exact_recipe_returns_match`
- `uv run pytest backend/tests/test_ws.py::test_arrival_loop_publishes_customer_arrived_event`

## High-level architecture

The app is a FastAPI backend plus a Vite/TypeScript frontend. Backend startup (`apothecaria.main`) always initializes tables and seeds from JSON content files, then starts an in-memory customer arrival loop.

### Backend

- **Content source of truth:** `backend/apothecaria/content/*.json` for ingredients, recipes, and customer templates.
- **Persistence:** SQLAlchemy models in `backend/apothecaria/db/models.py` (SQLite by default, configurable via `APOTHECARIA_DATABASE_URL`).
- **Seed/upsert pipeline:** `apothecaria.db.seed` validates JSON with Pydantic seed schemas, then upserts by slug.
- **Game domain logic:** `domain/` contains pure-ish game logic:
  - `brewing.py`: ingredient matching against recipe ingredient sets.
  - `customer_queue.py`: in-memory active customer store + periodic arrivals.
  - `reputation.py`: serve outcome, reputation updates, and `brew_history` writes.
- **Transport/API layer:** `api/` exposes inventory, recipes, brewing, customer serve/spawn/next, and websocket events.
- **Live events:** `events/broadcaster.py` is an in-memory pub/sub used by `/ws/events`.

### Frontend

- No React/Vue app runtime for gameplay UI; this is modular TypeScript + DOM/CSS.
- `src/main.ts` boots scene + overlays, fetches inventory/recipes once, wires brew/serve actions, and subscribes to websocket events.
- `src/state/session.ts` is the shared in-memory client session state (current customer, cauldron contents, reputation).
- `src/api/client.ts` mirrors backend endpoint contracts used by the UI.

## Key conventions

- **Seed-first content workflow:** modify JSON under `backend/apothecaria/content/`, then run `make seed`. Avoid direct DB edits for gameplay content.
- **Slug-driven linking:** recipes reference ingredient slugs; customer templates reference expected recipe slugs. Keep slugs stable and unique.
- **Customers are ephemeral:** active customers live in `app.state.customer_store` (memory) and are removed on serve; historical outcomes are persisted in `brew_history`.
- **Session dependency pattern:** API routes use `Depends(get_session)`; commit/rollback is handled in the dependency, not per route.
- **Response semantics used by frontend/tests:** `/api/customers/next` returns `204` when empty; `/api/brew` rejects empty ingredient lists with `400`.
- **When adding a recipe/mixture:** update `content/recipes.json`, run `make seed`, and extend `backend/tests/test_api_recipes.py` (the backend auto-discovers recipes from seeded DB data).
- **Workshop placeholders:** `backend/apothecaria/agents/` and `backend/apothecaria/mcp/` are intentional extension points for workshop modules.
