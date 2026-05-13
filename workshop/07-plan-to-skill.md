# 07 — Plan to Skill

**Goal:** Encode the "add a new mixture" workflow you discovered in [exercise 05](./05-plan-and-review.md) as a reusable **skill**, so the next time you ask "add a mixture called X…", the CLI follows the recipe automatically instead of re-investigating from scratch.

## Concepts

- **Skills** are folders containing instructions that Copilot CLI **auto-loads when your prompt matches the skill's description**. You don't have to "activate" them — just ask naturally.
- **Three flavors of Copilot context**, side by side:

  | Mechanism | Scope | When it applies |
  |---|---|---|
  | **Instructions** (`.github/copilot-instructions.md`, [ex 03](./03-custom-instructions.md)) | Always-on rules ("use reST docstrings") | Every prompt, automatically |
  | **Agents** (`/plan`, `/review`, [ex 05](./05-plan-and-review.md)) | Change *how* the AI thinks | When you invoke them |
  | **Skills** (this exercise) | Specific repeatable task recipes | When your prompt matches the skill's `description` |

  Rule of thumb: **instructions** for *style*, **agents** for *process*, **skills** for *playbooks*.
- **`SKILL.md` format** — YAML frontmatter (`name`, `description`) plus a markdown body. The description is the discovery mechanism: it has to contain the words a user would naturally use ("add a mixture", "new recipe", "new potion").
- **Project vs user scope**:
  - `.github/skills/<name>/SKILL.md` — checked into the repo, shared with the team.
  - `~/.copilot/skills/<name>/SKILL.md` — personal, available in every project on your machine.
  - We'll use project scope here so anyone cloning the repo gets the skill.
- **`/skills`** — `/skills list` shows what's installed, `/skills info <name>` shows a skill's details, `/skills reload` re-reads SKILL.md files after edits. You can also force-invoke a skill with `/<skill-name> <prompt>`.

## Steps

Run from the `alchemy_game` repo root.

1. **Create the skill folder + `SKILL.md`:**

   ```bash
   mkdir -p .github/skills/new-mixture
   ```

   Then create `.github/skills/new-mixture/SKILL.md` with this content:

````markdown
---
name: new-mixture
description: Use when the user asks to add a new mixture, recipe, potion, or brew to the Apothecaria game. Adds a recipe to the JSON seed so it shows up in /api/recipes and is brewable via /api/brew.
---

# New Mixture

Adding a new mixture means adding a recipe entry so the apothecary recognizes it: it shows up in `/api/recipes` and can be brewed via `/api/brew` after re-seeding.

## Required inputs

Before making any changes, confirm the user has provided:

- **slug** — lowercase, `snake_case`, unique among existing recipes. e.g. `fog_veil`.
- **name** — human display name. e.g. "Fog Veil".
- **ailment_category** — short tag (`confusion`, `wound`, `sleep`, `fatigue`, `anxiety`, `sorrow`, …). Reuse an existing category when possible.
- **ingredients** — list of slugs that **must already exist** in `backend/apothecaria/content/ingredients.json`.
- **lore** — one-line flavor description, matching the sensory, evocative tone of existing entries.

If anything is missing or ambiguous, ask the user before proceeding.

## Preconditions

- The working tree must be clean (`git status` shows no changes). If it isn't, stop and ask the user to commit or stash first.
- `gh` (GitHub CLI) must be installed and authenticated for the PR step. If `gh auth status` fails, stop after the test step and tell the user to run `gh auth login` before continuing.

## Steps

1. **Validate.** Read `backend/apothecaria/content/ingredients.json` and confirm every requested ingredient slug exists. If any are missing, stop and tell the user to add the ingredient first — that's a separate task, not part of this skill.

2. **Confirm uniqueness.** Read `backend/apothecaria/content/recipes.json` and confirm the new `slug` and the new ingredient-set are both unique. The brewing engine matches recipes by ingredient set, so two recipes with identical ingredient sets would collide.

3. **Add the entry to `backend/apothecaria/content/recipes.json`.** Match the existing entries' shape and one-line-per-object formatting exactly. Trailing newline preserved.

4. **Re-seed:**
   ```bash
   make seed
   ```

5. **Extend tests.** Add an assertion in `backend/tests/test_api_recipes.py` that the new mixture is present in the API response with its expected ingredients. Follow the patterns already in that file.

6. **Run the test suite:**
   ```bash
   make test
   ```

7. **Branch, commit, push, open the PR.** Create a branch named `add-mixture-<slug>`, commit just the two changed files with a Conventional Commit message, push, and open a PR with the body template below.

   ```bash
   git checkout -b add-mixture-<slug>
   git add backend/apothecaria/content/recipes.json backend/tests/test_api_recipes.py
   git commit -m "feat(content): add <name> mixture"
   git push -u origin add-mixture-<slug>
   gh pr create --title "Add <name> mixture" --body "$(cat <<'EOF'
   ## Summary
   Adds a new mixture **<name>** (`<slug>`) for the `<ailment_category>` ailment.

   ## Recipe
   - **Ingredients:** <comma-separated ingredient slugs>
   - **Lore:** <lore line>

   ## Verification
   - `make seed` upserts the new recipe.
   - `make test` passes; extended `test_api_recipes.py` with an assertion that this mixture appears in the API response with its expected ingredients.

   ## What this PR does *not* touch
   API routes, brewing logic, DB models, frontend. The seed loader and DB-backed brew-matching pick up the new recipe automatically.
   EOF
   )"
   ```

   Substitute `<slug>`, `<name>`, `<ailment_category>`, the ingredient list, and the lore line into both the title and body. Print the PR URL `gh` returns.

8. **Show the diff** with `/diff` and summarize the change.

## Files this skill touches

- `backend/apothecaria/content/recipes.json` (always)
- `backend/tests/test_api_recipes.py` (always)
- One new git branch + one PR (always)
- *Not* the API routes, brewing logic, or frontend — those auto-discover recipes from the DB.

## What NOT to do

- Don't add new ingredients here. If the recipe needs one, stop and tell the user.
- Don't edit the API, brewing logic, or DB models.
- Don't add a database migration — the JSON seed is the source of truth; `make seed` upserts.
- Don't touch the frontend.
````

2. **Reload skills** so the CLI picks up the new file without a restart:

   ```bash
   copilot
   ```

   ```text
   > /skills reload
   > /skills list
   ```

   You should see `new-mixture` in the list. Inspect it:

   ```text
   > /skills info new-mixture
   ```

3. **Trigger it naturally.** Ask in the same plain-English way an artist or designer might, *without* mentioning files or steps:

   ```text
   > Add a new mixture called "Sorrowmend Cordial" — ailment_category sorrow, ingredients [root, moonpetal, feather]. Lore: a warm amber draught that softens grief without numbing it.
   ```

   Watch the CLI: it should follow the steps from `SKILL.md` (validate, add to JSON, seed, add test, run tests) rather than re-investigating the codebase.

4. **(Optional) Force-invoke.** You can also call the skill directly when you want to be explicit:

   ```text
   > /new-mixture Add a mixture called "Iron Resolve" — ailment_category fear, ingredients [sage, eye-of-newt, root]. Lore: a metallic-tasting tonic that steadies a trembling hand.
   ```

5. **Confirm the skill actually drove the work.** Ask the CLI directly:

   ```text
   > What skills did you use for that last task?
   ```

   It should mention `new-mixture`. If it didn't fire, your `description` field probably doesn't match the way you asked — edit the description to include the words you used, then `/skills reload`.

6. **Run the suite one more time** outside the CLI:

   ```bash
   make test
   ```

## Done when

- [ ] `.github/skills/new-mixture/SKILL.md` exists with required frontmatter
- [ ] `/skills list` shows `new-mixture`
- [ ] Asking "add a new mixture…" auto-triggers the skill (the CLI doesn't re-plan from scratch)
- [ ] At least one new mixture is in `recipes.json`, seeded, and covered by a test
- [ ] `make test` is green
- [ ] A PR was opened on its own branch (`add-mixture-<slug>`) with a summary, recipe block, and verification notes
- [ ] The PR's CI run passes

## Tips

- **Description discoverability.** The `description` field is the only thing Copilot uses to decide *whether* to load your skill. Include the words a user would naturally type. "Use when the user asks to add a new mixture, recipe, potion, or brew" hits four trigger phrases for the price of one.
- **Skills compose with agents and instructions.** `.github/copilot-instructions.md` still applies (so docstrings still follow exercise 03's format), and `/review` still runs on top of the diff.
- **Iterate by editing `SKILL.md` directly.** After any edit, `/skills reload` is enough — no restart needed.

## References

- [About Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [Copilot CLI command reference](https://docs.github.com/en/copilot/reference/cli-command-reference) — `/skills`
- [github/awesome-copilot — community skills](https://github.com/github/awesome-copilot)
