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

   Then create `.github/skills/new-mixture/SKILL.md`. The full content is in [`07-SKILL.md`](./07-SKILL.md) for readability — copy it verbatim into the new file. Key things to notice in it:

   - **YAML frontmatter** — `name` matches the folder name; `description` lists the trigger phrases ("add a new mixture, recipe, potion, or brew") so Copilot knows when to fire.
   - **Required inputs + Preconditions** — the skill stops and asks if anything is missing before touching the repo.
   - **Steps** — validate, edit `recipes.json`, re-seed, extend tests, open a PR — the same flow you walked through manually in [exercise 05](./05-plan-and-review.md).
   - **What NOT to do** — explicit out-of-scope list, so the skill doesn't drift into API/migration/frontend changes.

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
