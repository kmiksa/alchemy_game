# 10 — Refactor at Scale

**Goal:** Take the `/plan` and `/review` agents from [exercise 05](./05-plan-and-review.md) and point them at a change far bigger than anything so far — rename **`reputation` → `$`** across the entire stack, give every ingredient a **per-player count**, and add an **ingredient store** table. One plan, one execution, one review.

## Concepts

- **Same agents, different scale.** In [exercise 05](./05-plan-and-review.md) `/plan` planned a one-row JSON change. Here it has to plan a column rename that ripples through ~9 backend files, ~6 frontend files, and the test suite — plus two new pieces of data model. The lesson: **`/plan`'s value grows non-linearly with the size of the change.** A small change you can hold in your head; a big one touches files you would never enumerate by hand.
- **`/review` is the safety net.** On a large diff, the thing `/plan` forgot is exactly the thing `/review` catches — a stale frontend reference, a test that still says `reputation`, a missing seed update. Running `/review` on a big change isn't optional.
- **Why this change.** It reworks the game's economy: customers pay you in **`$`**, ingredients are a finite resource you spend when brewing, and a **store** holds ingredients with prices. This exercise sets up [exercise 11](./11-mcp-server.md), where you'll build an MCP server that *buys* from that store — so exercise 10 deliberately leaves the store **read-only**, with no buy endpoint.

## Steps

Run from the `alchemy_game` repo root, with a clean working tree (`git status` shows nothing to commit).

1. **Plan the whole change at once.** Start the CLI and hand `/plan` the full, three-part ask:

   ```bash
   copilot
   ```

   ```text
   > /plan I want a bigger change to the apothecary's economy. Investigate the codebase first, then give me a complete plan naming every file before you write any code. Three parts:
   >
   > 1. Rename "reputation" to money everywhere — the PlayerState column, the domain logic, the BrewHistory delta field, the API responses, the frontend state and UI, and the tests. After this there is no "reputation" concept left; customers pay the player in $.
   >
   > 2. Track per-player ingredient counts. The player owns a quantity of each ingredient, and brewing a potion consumes one of each ingredient used. Seed a generous starting count (20 of each) so the player can brew freely. When an ingredient would go below zero, brewing with it should fail gracefully with a clear message.
   >
   > 3. Add an ingredient store: a new table holding, per ingredient, a price in $ and a stock count the store has available. Seed it from a JSON content file, the same way the other seed data works. The store is read-only for now — no buy endpoint, no API routes, no purchasing logic. A later exercise adds buying.
   ```

2. **Read the plan carefully — this is the point of the exercise.** A good plan for this codebase will surface a surface area you would not have listed from memory:

   - **The rename is deep.** `reputation` lives in `db/models.py` (`PlayerState`, `BrewHistory.reputation_delta`), `domain/reputation.py` (the file itself is a rename candidate), `domain/models.py` (`ServiceResult`), `api/customers.py`, `db/seed.py`, four test files (including `test_reputation.py`), **and** six frontend files (`state/session.ts`, `api/client.ts`, `ui/inventory-bar.ts`, `ui/brew-result.ts`, `main.ts`, `styles/main.css`).
   - **Ingredient counts need a home** — a new column or table — plus a decrement step in the brew flow (`api/brew.py`) and a seeded starting amount.
   - **The store is a new table** in `db/models.py`, a new file under `content/`, and a loader change in `db/seed.py`.
   - If anything in the plan looks wrong or thin, say so and ask `/plan` to revise it *before* you approve.

3. **Approve and execute.** Once the plan looks complete:

   ```text
   > Looks good — proceed with the whole plan.
   ```

4. **Seed and test directly** (the `!` prefix runs a shell command without the AI):

   ```text
   > !make seed
   > !make test
   ```

5. **Review the full diff:**

   ```text
   > /review
   ```

   On a change this size `/review` earns its keep. Watch for the classic big-refactor misses: a frontend label still reading "Reputation", a test asserting on the old field name, `recipes.json`/seed data not updated, a missing trailing newline. Fix what it flags.

6. **Verify in the browser** (optional, satisfying):

   ```text
   > !make dev
   ```

   Open <http://localhost:5173>, brew a potion, and confirm the UI shows `$` (not "reputation") and that the ingredient you used went down by one.

7. **Commit.** One commit for the whole refactor is fine, or split it by concern (rename / counts / store) — your call.

## Done when

- [ ] `/plan` produced a written plan that named files across **backend, frontend, and tests** before any code was written
- [ ] `reputation` is gone — `grep -ri reputation backend/ frontend/src/` returns nothing; it's `$`/money everywhere
- [ ] Every ingredient has a per-player count, brewing consumes ingredients, and counts are seeded with a starting amount
- [ ] An `ingredient_store` table exists, seeded from a JSON content file with a price and stock per ingredient (and **no** buy endpoint — that's exercise 11)
- [ ] `make test` passes
- [ ] `/review` ran on the full diff and its findings were addressed

## Tips

- **`grep` is how you verify a rename.** A rename is "done" only when the old word appears nowhere. `grep -ri reputation .` is the fastest possible check — run it before you trust the diff.
- **A thin plan is a prompt to push back.** If `/plan` misses the frontend or the tests, don't just accept it — tell it what it missed and let it revise. The plan is a conversation.
- **`/review` scales with the diff.** The bigger the change, the more `/review` is worth running. Get in the habit of running it on anything that touches more than a couple of files.
- **This sets up [exercise 11](./11-mcp-server.md).** The `ingredient_store` table you just created is what the MCP server will buy from. Leaving it read-only here keeps that exercise focused.

## References

- [Exercise 05 — Plan & Review](./05-plan-and-review.md) — the same agents, at small scale
- [Built-in agents (Plan, Code-review, etc.)](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli#use-custom-agents)
- [Copilot CLI command reference](https://docs.github.com/en/copilot/reference/cli-command-reference)
