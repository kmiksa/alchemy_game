# 05 — Plan & Review

**Goal:** Add two built-in agents to your mixture — `/plan` (think before code) and `/review` (automated code review on your diff). We'll exercise them by actually adding a new mixture to the apothecary.

## Concepts

- **Built-in agents** are slash commands that change *how* Copilot approaches a task, not just what it answers. You used `/init` in [exercise 03](./03-custom-instructions.md); `/plan` and `/review` are two more that show up constantly in real workflows.
- **`/plan`** — runs the Plan agent. It investigates the codebase, writes a step-by-step implementation plan, and shows it to you *before* touching any code. You approve, edit, or scrap the plan.
  - Most valuable when you don't yet know what files a change touches. The plan answers that for you. (You'll see this below: "add a new mixture" looks simple, but the plan will surface the JSON-seed-loader flow you'd otherwise have to discover by reading code.)
  - Also reachable by pressing **Shift+Tab** in an interactive session, or launching with `copilot --plan`.
- **`/review`** — runs the Code-review agent on your current diff (staged + unstaged). It flags bugs, security issues, missing tests, and style problems with severity tags. Fast enough to run before every commit.

## Steps

Run from the `alchemy_game` repo root, with a clean working tree (`git status` shows nothing to commit).

1. **Plan the change.** Start the CLI and ask `/plan` how to add a new mixture:

   ```bash
   copilot
   ```

   ```text
   > /plan I want to add a new mixture to the apothecary called "Fog Veil" — ailment_category="confusion", ingredients=["moonpetal", "sage", "feather"], with a short flavor line for lore. It should show up in /api/recipes, be brewable via /api/brew, and survive a server restart. Investigate the codebase first and tell me every file I need to touch.
   ```

   **What the plan should reveal** — read it carefully. A good plan for this codebase will discover:
   - The source of truth is `backend/apothecaria/content/recipes.json`, not Python code.
   - All listed ingredient slugs must already exist in `backend/apothecaria/content/ingredients.json` (they do here — moonpetal, sage, feather are all present).
   - `make seed` upserts the JSON into SQLite; the API and brewing logic read from the DB, so no Python changes are needed for a basic mixture.
   - The existing tests in `backend/tests/test_api_recipes.py` and `backend/tests/test_brewing.py` will validate the new mixture once it's seeded; you may want to add an assertion that "Fog Veil" appears.

2. **Approve and implement.** Either let the CLI execute the plan, or tweak it first:

   ```text
   > Looks good. Proceed: add the recipe to recipes.json, run make seed, and add a small test in backend/tests/test_api_recipes.py that asserts Fog Veil appears in the response with its three ingredients.
   ```

3. **Run seed + tests directly** (the `!` prefix runs a shell command without the AI):

   ```text
   > !make seed
   > !make test
   ```

4. **Review your own diff:**

   ```text
   > /review
   ```

   The Code-review agent scans the staged + unstaged changes and reports issues with severity tags (`[CRITICAL]`, `[HIGH]`, `[MEDIUM]`, `[LOW]`). For this change it might flag things like: ingredient slug typos, JSON formatting drift from the rest of the file, missing trailing newline, an assertion that's too loose, etc.

5. **Verify in the browser** (optional, satisfying):

   ```text
   > !make dev
   ```

   Open <http://localhost:8000/api/recipes> and confirm Fog Veil is in the response.

## Done when

- [ ] `/plan` produced a written plan that names the right files (`recipes.json`, `make seed`) before any code was written
- [ ] "Fog Veil" appears in `GET /api/recipes` and can be brewed via `POST /api/brew` with `["moonpetal", "sage", "feather"]`
- [ ] `make test` passes
- [ ] `/review` returned a list of findings (zero findings is fine — the point is the agent ran)

## Tips

- **`/plan` scales.** Try it with a much larger ask ("add an authentication layer with API keys and per-key rate limits") to see how it decomposes the work.
- **`/review` is cheap.** Get into the habit of running it before every commit. Catches obvious stuff that would otherwise burn a reviewer's attention.

## References

- [Built-in agents (Plan, Code-review, etc.)](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli#use-custom-agents)
- [Copilot CLI command reference](https://docs.github.com/en/copilot/reference/cli-command-reference)
- [Autopilot mode](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/autopilot) — the natural next step once you trust your plans
