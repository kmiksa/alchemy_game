# 06 — Delegate the Plan

**Goal:** Take the plan you wrote in [exercise 05](./05-plan-and-review.md) and hand it to the **GitHub Copilot cloud agent** with `/delegate` instead of executing it locally. Same task, different runtime.

## Concepts

- **`/delegate`** hands a self-contained task to the cloud agent. The agent runs on GitHub's infrastructure, makes its changes on a branch, and opens a PR. Your terminal stays free.
- **Why pair `/plan` with `/delegate`** — a plan is the perfect input for a cloud agent. The agent can't pause to ask "did you mean X or Y?", so vague prompts produce wrong PRs. A `/plan` that you've already read and approved removes the ambiguity before the handoff.
  - Workflow pattern: **`/plan` to investigate → read the plan → `/delegate` with the plan attached → review the resulting PR.**
- **When to delegate vs. run locally** — the work in exercise 05 was small enough to do interactively in 2 minutes. Delegate when the work is **bounded but tedious**: many similar edits, big test-generation passes, repetitive refactors. Don't delegate work that needs your local DB, secrets, an unmerged dependency, or back-and-forth iteration.
- **Prerequisite** — `/delegate` needs Copilot coding-agent access on the repo (cloud agent enabled in repo settings + push perms). If your repo isn't on GitHub yet, push it first, or skip to the Autopilot fallback at the bottom.

## Setup

If you already added Fog Veil locally in exercise 05, undo it so the cloud agent has real work to do:

```bash
git restore backend/apothecaria/content/recipes.json backend/tests/test_api_recipes.py
make seed
```

(Or just work on a fresh branch off `main`.)

## Steps

1. **Re-run the plan and save it.** Open the CLI and capture the plan to a file the cloud agent can read:

   ```bash
   copilot
   ```

   ```text
   > /plan I want to add a new mixture to the apothecary called "Fog Veil" — ailment_category="confusion", ingredients=["moonpetal", "sage", "feather"], with a short flavor line for lore. It should show up in /api/recipes, be brewable via /api/brew, and survive a server restart. Investigate the codebase first and tell me every file I need to touch.
   ```

   Once the plan looks good:

   ```text
   > Save this plan to docs/plans/fog-veil.md
   ```

   You now have a self-contained, file-backed task description.

2. **Delegate using the plan as the source of truth:**

   ```text
   > /delegate Execute the plan in @docs/plans/fog-veil.md exactly. Add the new recipe to backend/apothecaria/content/recipes.json, extend backend/tests/test_api_recipes.py with assertions that Fog Veil appears with its three ingredients, run `make seed` and `make test`, and open a PR titled "Add Fog Veil mixture".
   ```

   The CLI confirms the handoff and gives you a URL to the cloud agent's run / draft PR.

3. **Watch the agent work (optional).** Open the URL in your browser. You'll see:
   - The agent's own plan / progress log
   - Files it's editing
   - Test results
   - The draft PR once it's done

4. **Review the PR like any other PR.** This is the important step — cloud agents are confident, not infallible. Open the PR in GitHub and:
   - Check the diff matches the plan (`recipes.json` + a test, nothing else)
   - Skim the test assertions for tightness (e.g. does it assert the ailment_category, or just the name?)
   - Look at the CI run to confirm tests passed
   - If something's off, leave a review comment — the agent can iterate on feedback.

5. **Merge.** When you're satisfied, merge the PR, pull the change locally, and verify:

   ```bash
   git checkout main && git pull
   make seed
   curl http://localhost:8000/api/recipes | grep -i "fog veil"
   ```

## Done when

- [ ] `docs/plans/fog-veil.md` exists with the plan you saved
- [ ] `/delegate` produced a URL to a cloud agent run / draft PR
- [ ] The PR's diff matches the plan (no surprise files touched)
- [ ] CI on the PR is green
- [ ] After merge + pull, "Fog Veil" appears in `GET /api/recipes`

## Tips

- **The cloud agent reads your instructions file.** The custom docstring/style rules you set up in [exercise 03](./03-custom-instructions.md) (`.github/copilot-instructions.md`) apply on the cloud too. The PR should respect them.
- **Cancel and retry.** If the agent goes off the rails, cancel the run from its page and re-delegate with a sharper prompt.
- **Delegate is async, not magic.** Don't pile up 10 delegations and lose track. One in flight at a time is plenty for most workflows.

## Fallback: Autopilot (no cloud agent)

If `/delegate` isn't available on your repo, you can get a similar "set it and forget it" experience locally with **Autopilot mode** — Copilot CLI works through the plan without pausing for confirmations:

```bash
copilot --autopilot
```

```text
> Execute the plan in @docs/plans/fog-veil.md.
```

Autopilot runs on *your* machine (your DB, your env), so it can do things `/delegate` can't — but it also can't open a PR for you. You'll commit and push yourself when it's done.

## References

- [`/delegate` and the Copilot coding agent](https://docs.github.com/en/copilot/using-github-copilot/using-copilot-coding-agent-to-work-on-tasks)
- [Autopilot mode](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/autopilot)
- [Copilot CLI command reference](https://docs.github.com/en/copilot/reference/cli-command-reference)
