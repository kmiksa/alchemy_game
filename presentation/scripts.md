# Workshop Script — Hands-on with Apothecaria

> Working document. Exercises are run **linearly**, one after another. New AI-engineering concepts (AGENTS.md, plugins, built-in agents, skills, MCP, pydantic-ai, Logfire) are introduced *the first time they're needed* — when that happens, there's a matching slide. Everything else lives in this script.
>
> Reference: [GitHub Copilot CLI for Beginners](https://github.com/github/copilot-cli-for-beginners) — we borrow patterns from chapters 02–07, but the exercises themselves drive the learning.

## Format

- **Audience**: 10 engineers, laptops out, `copilot` already installed (foundations script done)
- **Codebase**: [`apothecaria`](https://github.com/jakubmiksa/alchemy_game) — a cozy alchemist's apothecary game (FastAPI + Vite/Three.js)
- **Style**: presenter narrates, audience runs the same prompts, we don't move on until everyone is unstuck

## Concept introduction order (and the slides that go with them)

| First seen in | Concept | Slide title |
|---|---|---|
| Ex 3 | `AGENTS.md` / custom instructions | "AGENTS.md — the team rules file" |
| Ex 6 | Plugins | "Plugins — installable bundles" |
| Ex 7 | Built-in agents (`/plan`, `/review`) | "Built-in agents — Plan & Review" |
| Ex 8 | Skills | "Skills — auto-triggered playbooks" |
| Ex 12 | MCP servers | "MCP — give your agent new senses" |
| Ex 14 | Programmatic agents (pydantic-ai) | "Agents in code — pydantic-ai" |
| Ex 15 | Observability (Logfire) | "Logfire — see what your agent did" |

Skill / MCP / Plugin were teased in the foundations deck. Now we *build* each one.

---

## Setup — clone & boot the game

> **Time**: 8 min. Don't move on until every screen shows the apothecary in the browser.

```bash
git clone https://github.com/jakubmiksa/alchemy_game.git apothecaria
cd apothecaria
uv sync                # python deps
make install           # frontend deps (npm)
make seed              # creates apothecaria.sqlite
make dev               # backend :8000, frontend :5173
```

Open <http://localhost:5173>. You should see the shop. Try brewing once — drag two ingredients onto the cauldron and serve a customer.

**Checkpoint**: hands up when the shop renders. Wait for everyone.

---

## Exercise 1 — Add docstrings to the code

> **Concept anchor**: basic prompting + `@file` context references.
> **Why this exercise**: gentle warm-up. Establishes the `copilot` REPL muscle and shows that *context comes from explicit references*, not telepathy.

### Run it

```bash
copilot
```

In the REPL, paste:

```text
> Add docstrings to all public functions and classes in @backend/apothecaria/domain/brewing.py.
> Use sphinx-style :param: and :return: tags. Example:
>
>     Get alternative/similar product recommendations based on a list of product IDs.
>     Use this when user explicitly asks for alternatives or similar products.
>     :param product_ids: list of item_group_ids to base recommendations on
>     :return: alternative products for each provided product id
```

### What you're showing

- `@backend/apothecaria/domain/brewing.py` — explicit file reference. The agent doesn't guess; it reads.
- The example docstring inside the prompt — **few-shot** prompting. Copilot mirrors the style.
- Diff review at the end: copilot shows changes, you accept/reject.

### Verify

```bash
make lint    # ruff still passes
git diff backend/apothecaria/domain/brewing.py
```

Eyeball the diff. Are the docstrings sphinx-style? Is anything missing or fabricated?

### Pitfalls

- **No `@file` reference** → copilot may invent function names. Always anchor with `@`.
- **Vague format** → "add docstrings" alone produces Google-style or numpy-style. Show an example.

---

## Exercise 2 — First customer should appear sooner

> **Concept anchor**: let the agent *find* the code. You describe the symptom; the agent locates the cause.
> **Why this exercise**: shows agentic exploration. Compare to a teammate who doesn't know the codebase — they grep, read configs, propose a fix. The agent does the same.

### Run it

```text
> The first customer takes 30 seconds to appear. I want to test the brewing flow faster — make it 5 seconds.
> Look around the codebase first to understand how arrivals are timed.
```

### What you're showing

- Copilot opens the **Explore** sub-agent automatically (it greps, reads `config.py`, finds the `customer_arrival_seconds` setting and the `arrival_loop` in `domain/customer_queue.py`).
- It proposes **two options**: edit the default in `config.py` *or* export `APOTHECARIA_CUSTOMER_ARRIVAL_SECONDS=5`. Pick the one that won't ship in git.
- Restart `make dev`. First customer arrives within 5s.

### Verify

Restart the backend, watch the WebSocket panel. Customer should pop within ~5 seconds.

```bash
APOTHECARIA_CUSTOMER_ARRIVAL_SECONDS=5 make backend-dev
```

### Pitfalls

- **Hard-coding the default to 5** ships dev settings to prod. Talk through *why* env vars exist — this is a recurring agentic-coding theme: the agent is happy to do the wrong thing if you don't push back.

---

## Exercise 3 — Add AGENTS.md with our docstring + models.py conventions

> **Concept anchor (NEW)**: `AGENTS.md` — the project rules file every agent reads automatically.
> **Slide**: "AGENTS.md — the team rules file."

### Why a slide here

This is the first time we touch persistent custom instructions. After this, *every* prompt in this workshop is influenced by what we put here. Worth pausing to land the concept.

### What `AGENTS.md` is

- Plain markdown at the repo root. Copilot CLI reads it automatically on every session.
- Cross-tool standard ([agents.md](https://agents.md/)) — Claude Code, Gemini CLI, etc. all read it.
- Rule of thumb: *if you'd say it to every new engineer on day one, it goes in AGENTS.md.*

### Run it

```text
> /init
```

`/init` is a built-in agent that scans the repo and drafts an `AGENTS.md`. Let it write a baseline, then we'll add our two rules.

Open the generated `AGENTS.md` and append:

```markdown
## Code style

### Docstrings

Use sphinx-style with `:param:` and `:return:` tags. Example:

    Get alternative/similar product recommendations based on a list of product IDs.
    Use this when user explicitly asks for alternatives or similar products.
    :param product_ids: list of item_group_ids to base recommendations on
    :return: alternative products for each provided product id

### Pydantic models

All `BaseModel` classes belong in `backend/apothecaria/domain/models.py`.
Do **not** create per-feature `models.py` or scatter `BaseModel` classes
across API routers. One file is the home for shared schemas.
```

### What you're showing

- *One* docstring example > 100 words of prose explaining "Sphinx-style".
- The "no per-feature models.py" rule prevents the most common LLM-generated mess: a new file every time it needs a schema.

### Verify

Re-run Ex 1 in a fresh `copilot` session on a different file. Docstring style now matches without you specifying it. The conventions stuck.

### Pitfalls

- **AGENTS.md too long** → copilot truncates. Keep it under ~400 lines. Long-form expansion goes in `.github/instructions/<topic>.instructions.md`.
- **Conflicting rules** → if two lines disagree, the agent picks one arbitrarily. Edit ruthlessly.

---

## Exercise 5 — AGENTS.md in the project vs the global config

> **Concept anchor**: scope. Project rules vs personal rules.
> *(There is no Exercise 4 — we count by what's in the original task list.)*

### What you're showing

Two locations, two scopes:

| Path | Scope | Use it for |
|---|---|---|
| `<repo>/AGENTS.md` | This project | Stack, commands, conventions everyone shares |
| `~/.copilot/AGENTS.md` | Every project on your laptop | Your personal preferences (terse output, prefer pytest, etc.) |

### Run it

```bash
mkdir -p ~/.copilot
$EDITOR ~/.copilot/AGENTS.md
```

Drop in a personal preference, e.g.:

```markdown
## Personal

- Keep responses terse. No closing summaries.
- When you write code, do not add comments unless they explain something non-obvious.
- Prefer `uv` over `pip`; prefer `pytest -x` (fail fast) over the default.
```

### Demo: same prompt, different folders

In the apothecaria repo:

```text
> Show me how brewing matches recipes.
```

In a totally unrelated folder (`cd /tmp && copilot`):

```text
> Show me how brewing matches recipes.
```

Second one has no project context, but **still uses your personal AGENTS.md** (terse output, etc.).

### Pitfalls

- **Secrets in `~/.copilot/AGENTS.md`** — don't put API keys here. It gets shipped to the model on every prompt.
- **Conflicts between project and personal** — project wins by default; the model treats project rules as more specific.

---

## Exercise 6 — Install the Playwright plugin

> **Concept anchor (NEW)**: Plugins — bundles of skills + MCP configs + commands you install once.
> **Slide**: "Plugins — installable bundles."

### Why a slide here

We teased Skills/MCP/Plugins in the foundations deck. Plugins are the *delivery mechanism* — you don't write a plugin from scratch; you install one and inherit a whole workflow.

### What we're installing & why

[Playwright MCP/Plugin](https://github.com/microsoft/playwright-mcp) gives the agent a real browser. Now we can ask "click the cauldron, drag mandrake on it, screenshot the result" and the agent *actually does it*.

This unlocks UI testing in CLI workflows — the missing piece that the foundations deck called out as a VS Code strength.

### Run it

```bash
copilot
> /plugin install playwright
```

(Adjust to whatever the actual install command is on the day — see [github/awesome-copilot](https://github.com/github/awesome-copilot) for current install syntax.)

### Try it

```text
> Open http://localhost:5173, take a screenshot of the apothecary shop,
> then drag the mandrake jar onto the cauldron and screenshot again.
```

### Verify

Two PNGs in your working dir. Different. Second one has mandrake in the cauldron.

### Pitfalls

- **First-run downloads** Chromium (~200MB). Tell the room before everyone hits the network at once.
- **Headed vs headless** — default is headless; pass `--headed` if you want them to see the browser pop up (recommended for the demo).

---

## Exercise 7 — Plan → Review → Implement a new mixture

> **Concept anchor (NEW)**: built-in agents `/plan` and `/review` — the workflow agents.
> **Slide**: "Built-in agents — Plan & Review."

### Why a slide here

`/plan` and `/review` change *how* you work with copilot. Instead of "write code, run tests, hope for the best," you get a deliberate plan-first / review-after loop. This is the single biggest behavior change for engineers used to autocomplete-style assistants.

### Story

A new ingredient and recipe just arrived: **dragon's breath chili** (treats *frostbite*, recipe = `dragonfire-tonic` = chili + ginger + honey).

We'll add it three ways:

1. `/plan` — agent writes a step-by-step plan (no code yet).
2. We read the plan. Push back on anything we don't like.
3. Implement against the plan.
4. `/review` — agent reviews its own diff before we commit.

### Run it

```text
> /plan Add a new ingredient "dragon's breath chili" and a new recipe
> "dragonfire-tonic" (chili + ginger + honey, treats frostbite).
> The seed JSON files are in @backend/apothecaria/content/.
```

Read the plan. Common things to push back on:

- "I'll add a new model file" → no, AGENTS.md says one models.py.
- "I'll write a migration" → no, seed loader upserts.
- "I'll create a separate recipe loader" → no, the existing seed code handles it.

When the plan looks right:

```text
> Implement the plan.
```

After implementation:

```text
> /review
```

`/review` does a focused pass on the staged diff: missing tests, edge cases, style.

### Verify

```bash
make seed && make test
# Refresh http://localhost:5173 — chili jar appears on the shelf.
```

### Pitfalls

- **Skipping the plan** is the single most common mistake. Engineers (and the agent) want to start typing. Don't.
- **`/review` is not a substitute for human review.** It catches obvious things; it misses architectural drift. *(Cf. "Don't be John" from the foundations deck.)*

---

## Exercise 8 — A `/new-mixture` skill

> **Concept anchor (NEW)**: Skills — reusable, auto-triggered playbooks.
> **Slide**: "Skills — auto-triggered playbooks."

### Why a slide here

Ex 7 worked, but we did the plan-implement-review dance manually. A **Skill** encodes that dance so it triggers automatically the next time someone says "add a new potion." The skill *is* the workflow — it's how you turn a one-off recipe into team muscle memory.

### Skill vs Agent vs AGENTS.md (the slide content)

- **AGENTS.md** → always-on rules. ("Use sphinx docstrings.")
- **Skill** → triggered on intent. ("Add a new mixture" → run this playbook.")
- **Agent** → a persona you switch into. ("Be a python reviewer.")

Same model under the hood, three different shapes for *when* the instructions fire.

### Run it

```bash
mkdir -p .github/skills
$EDITOR .github/skills/new-mixture.skill.md
```

Paste:

```markdown
---
name: new-mixture
description: |
  Use when the user wants to add a new potion / mixture / recipe to the apothecary.
  Triggers on: "add a new potion", "create a recipe", "new mixture".
---

# New Mixture Skill

When the user asks for a new mixture, do this in order:

1. **Confirm the mixture details** — name, ailment category, ingredient list.
   Ask before guessing. If the user named ingredients that don't exist, propose
   adding them as ingredients first.

2. **Edit `backend/apothecaria/content/ingredients.json`** for any new ingredients.
   Generate a slug from the name (lowercase, hyphenated). Pick a thematic `lore`
   (1 sentence). Leave `sprite` empty (procedural color is derived from the slug).

3. **Edit `backend/apothecaria/content/recipes.json`**:
   ```json
   {
     "slug": "<recipe-slug>",
     "name": "<Display Name>",
     "ailment_category": "<one of the existing categories or a new one>",
     "lore": "<one sentence>",
     "ingredients": ["<ingredient-slug>", ...]
   }
   ```

4. **Run `make seed`** to upsert into SQLite.

5. **Run `make test`** to make sure nothing broke.

6. **Tell the user to refresh the browser** — the new ingredient jar appears on
   the shelf, the new recipe is brewable.

Never:
- Add a new file under `backend/apothecaria/db/` for a recipe — the seed loader handles it.
- Create a new `BaseModel` class — recipes use `RecipeSeed` from `domain/models.py`.
```

### Try it

In a fresh `copilot` session:

```text
> Add a new potion called "moonlit balm" — it cures insomnia and uses lavender,
> chamomile, and silver dust.
```

Watch copilot recognize the intent, walk the skill steps, and stop to confirm at each gate.

### Verify

```bash
git diff backend/apothecaria/content/
make seed && make test
```

Refresh the browser. Lavender jar (or silver dust jar — depending on what existed) appears.

### Pitfalls

- **Skill description too narrow** → won't auto-trigger. Use plain-language phrases the user might say.
- **Skill too prescriptive** → the agent ignores parts that don't fit. Skills should be *checklists*, not scripts.
- **Skill that duplicates AGENTS.md** → put always-on rules in AGENTS.md, not in every skill.

---

## Exercise 9 — Add pricing and a money counter

> **Concept anchor**: practice. Just ship a feature with copilot. The previous exercises set up the rails — now use them.

### Story

Customers should pay for their potions. Each ingredient has a `cost`, each recipe a `sale_price`. The shop has a wallet.

### Run it

Use whichever combination of tools you've internalized:

```text
> /plan I want to add pricing. Each ingredient has a `cost` (int, copper coins).
> Each recipe has a `sale_price`. There's a `PlayerWallet` with starting balance 50.
> Serving a customer credits the wallet by the recipe's sale_price minus the
> ingredient costs. Display the wallet balance in the UI.
> Touch the seed JSONs, models, the serve endpoint, and the frontend overlay.
```

Read the plan. Implement. `/review`.

### Things you'll see the agent get right (or wrong)

- ✅ Adds `cost` to `IngredientSeed`, `sale_price` to `RecipeSeed`, runs `make seed`.
- ✅ Adds a `wallet` column to `PlayerState`.
- ✅ Updates `apply_outcome` to credit the wallet.
- ⚠️ May try to make a new `Wallet` model in a new file — push back, it lives in `db/models.py`.
- ⚠️ May forget the frontend overlay update. The wallet is in `frontend/src/...`.

### Verify

Brew, serve a customer, watch the wallet tick up. Check `git diff` for stray files.

---

## Exercise 10 — Ingredient stock counts, restock, depletion

### Story

Every ingredient now has a `stock` count. Brewing decrements stock. Stock at 0 = jar empties on the shelf. There's a `restock` action that adds 5 of each ingredient and costs 30 coins.

### Run it

```text
> /plan Add per-ingredient stock counts (default 10). Brewing decrements the stock
> of each ingredient used. If stock hits 0, the jar in the UI fades. Add a /api/restock
> endpoint that costs 30 coins and refills every ingredient by 5.
```

### What this exercise teaches

This is where the model's *guesses* about what "the UI" means start to matter. You'll likely have to point the agent at `frontend/src/` for the jar fade effect. Use this to reinforce: **explicit context beats hand-waving every time.**

### Verify

Brew until ingredients run out. Watch jars fade. Restock. Watch them refill. Wallet should drop by 30.

---

## Exercise 11 — An ingredient store

### Story

Players can also buy *individual* ingredients (not just "restock all"). Add a Store panel in the UI — list of ingredients, prices, "Buy" buttons.

### Run it

```text
> /plan Add a Store panel (frontend) with each ingredient's purchase price (1.5x cost,
> rounded). POST /api/store/buy {"slug": "..."} adds 1 to stock and deducts the price.
> Reuse @frontend/src/ for the panel's style — don't introduce React.
```

### Why this matters for the next exercise

This Store API is what the **MCP server** (next exercise) is going to expose to a downstream AI agent. Build it cleanly, with a real schema response — it'll pay off.

### Verify

Open the Store, buy a mandrake. Stock +1, wallet −price. No regressions in the existing brewing flow.

---

## Exercise 12 — Build `inventory_mcp` and `store_mcp`

> **Concept anchor (NEW)**: MCP servers — give your agent eyes and hands on external systems.
> **Slide**: "MCP — give your agent new senses."

### Why a slide here

So far, the agent has only edited files and run shell commands. **MCP** is how you wire it up to your *running* application — read live state, take live actions. This is the leap from "AI that writes code" to "AI that operates software."

### What MCP is, in three lines

- An MCP server exposes **tools** (functions the agent can call) and **resources** (data the agent can read).
- It speaks JSON-RPC over stdio or HTTP.
- The agent picks the tool the same way it picks a function — but the tool runs on *your* machine, against *your* state.

### Servers we're building

| Server | Tools | Why it exists |
|---|---|---|
| `inventory_mcp` | `list_ingredients()`, `get_stock(slug)` | Agent needs to read what's in stock right now |
| `store_mcp` | `list_for_sale()`, `buy(slug, qty)` | Agent needs to spend money to restock when low |

Both are thin wrappers around the FastAPI endpoints we already have.

### Run it (skill from Ex 8 makes this easy)

If you wrote a `new-mcp` skill (or you can ask copilot to scaffold one):

```text
> Build an MCP server at backend/apothecaria/mcp/inventory_mcp.py that exposes
> two tools: `list_ingredients()` returning the current stock for every ingredient,
> and `get_stock(slug)` returning the stock for one. Use the FastAPI app's
> Session dependency. Stdio transport.
```

Same prompt, swap names for `store_mcp`.

Wire them into copilot:

```bash
# in your repo or ~/.copilot/mcp.json (depending on plugin convention)
```

```json
{
  "mcpServers": {
    "inventory": { "command": "uv", "args": ["run", "python", "-m", "apothecaria.mcp.inventory_mcp"] },
    "store":     { "command": "uv", "args": ["run", "python", "-m", "apothecaria.mcp.store_mcp"] }
  }
}
```

### Try it

Restart copilot. Now:

```text
> Which ingredients are low on stock? Restock anything below 3.
```

The agent calls `list_ingredients` → sees what's low → calls `buy` until stock ≥ 3. **It's operating your shop.**

### Verify

Watch the wallet drop in the UI. Watch jars refill in real time.

### Pitfalls

- **MCP server can't import the running FastAPI app** — make it open its own DB session via the same SQLAlchemy engine. (The existing `db/session.py` is your friend.)
- **No auth** — these MCP servers are local-only. If you ever expose them, gate with a token.
- **Tool descriptions matter more than function names.** The agent reads the description to pick the tool. Be explicit: "Returns current stock count per ingredient. Use when planning what to restock."

---

## Exercise 13 — Local LLM with Ollama + Gemma

> **Concept anchor**: not every model has to be a frontier API call. For tools that fire often (here, customer dialogue generation), a local model is fast and free.
> **No new slide** — this is glue work for Ex 14.

### Run it

```bash
brew install ollama        # macOS; on Linux use the install script
ollama pull gemma:2b       # 2B parameters, runs on a laptop
ollama serve &             # daemon, listens on :11434
ollama run gemma:2b "say hi"  # smoke test
```

### Verify

```bash
curl http://localhost:11434/api/tags    # gemma:2b should appear
```

### Why we're doing this

Ex 14 builds a pydantic-ai agent that generates customer responses ("Did the moonlit balm help your insomnia?"). That agent calls our MCP servers as tools. Frontier APIs are overkill for cosmetic dialogue and they cost real money during a workshop.

---

## Exercise 14 — A pydantic-ai agent that uses our MCP servers

> **Concept anchor (NEW)**: programmatic AI agents (vs. interactive copilot agents).
> **Slide**: "Agents in code — pydantic-ai."

### Why a slide here

Up to here, "agent" has meant "a thing inside copilot" (`/plan`, `/review`, custom agents). [pydantic-ai](https://ai.pydantic.dev/) shows the *other* meaning: an **agent inside your application**. Same idea — LLM + tools + a loop — but the agent ships as part of your software, not as part of your editor.

This is the frontier most engineers miss: copilot writes the code, but the *production* agent is something you wrote, you own, and you ship.

### What we're building

A `CustomerAgent` that:

- Receives a `(customer, brew_outcome)` input.
- Uses `inventory_mcp` and `store_mcp` as **tools** (yes, the same MCP servers).
- Returns a customer dialogue line ("Aaah, my joints feel like marble — restock the willow bark, you'll need more.")
- And, if stock is low, can autonomously call `store_mcp.buy(...)` — the agent decides.

### Run it

```bash
uv add pydantic-ai
```

Sketch (`backend/apothecaria/agents/customer_agent.py`):

```python
from pydantic_ai import Agent
from pydantic_ai.mcp import MCPServerStdio

inventory_mcp = MCPServerStdio("uv", ["run", "python", "-m", "apothecaria.mcp.inventory_mcp"])
store_mcp     = MCPServerStdio("uv", ["run", "python", "-m", "apothecaria.mcp.store_mcp"])

customer_agent = Agent(
    "ollama:gemma:2b",
    mcp_servers=[inventory_mcp, store_mcp],
    system_prompt="""
        You are a customer leaving the apothecary. Reply in 1–2 sentences,
        in-character. If a brewing went poorly, mention which ingredient
        seemed off. If you notice (via tools) that stock of a key ingredient
        is below 3, mention that the shopkeeper should restock — and you
        may call store_mcp.buy() to help if you have coins.
    """,
)

async def reply(customer, brew_outcome):
    result = await customer_agent.run(f"Customer={customer.name}, outcome={brew_outcome}")
    return result.output
```

Wire it into the existing `serve` endpoint:

```text
> /plan In @backend/apothecaria/api/customers.py, when serving a customer,
> call @backend/apothecaria/agents/customer_agent.py to generate the
> customer_response field. Fall back to the existing canned response if
> the agent times out (>3s).
```

### Try it

Brew, serve a customer, watch the response come from the LLM. Repeat enough times that stock gets low — watch the agent autonomously call `store_mcp.buy`.

### Pitfalls

- **Streaming vs sync** — pydantic-ai supports both. For a workshop demo, sync is easier to follow.
- **Cold starts** — first agent call takes ~2s because Ollama loads weights. Warm it up at app startup.
- **Tool loops** — if your prompt is unclear, the agent will hammer the tool. Cap with `max_turns=4` or similar.

---

## Exercise 15 — Logfire on the pydantic-ai agent

> **Concept anchor (NEW)**: observability for agents. You can't debug what you can't see.
> **Slide**: "Logfire — see what your agent did."

### Why a slide here

A pydantic-ai agent that calls MCP tools, decides things, occasionally makes wrong decisions, is **opaque by default**. You ship it to prod, a customer says "the agent told me to drink moonlit balm for *frostbite*," and you have no idea why. Logfire is the X-ray.

### What Logfire shows

Each agent run becomes a trace tree:

```
agent.run("Customer=Anya, outcome=DELIGHTED")
├── llm_call(model="ollama:gemma:2b", tokens_in=412, tokens_out=87)
├── tool_call(name="inventory_mcp.list_ingredients")
│   └── result=[{slug=lavender, stock=2}, ...]
├── tool_call(name="store_mcp.buy", args={slug=lavender, qty=3})
│   └── result={ok: true, new_stock: 5}
└── llm_call(model="...", tokens_in=531, tokens_out=44)
    └── output="Aaah, restock the lavender, you'll need more."
```

Every span is clickable. Token costs roll up. Errors highlight red.

### Run it

Sign up at <https://logfire.pydantic.dev>, create a project, grab a write token.

```bash
uv add logfire
export LOGFIRE_TOKEN=pylf_v1_...
```

```python
# backend/apothecaria/main.py — top of the file
import logfire
logfire.configure()
logfire.instrument_pydantic_ai()
logfire.instrument_fastapi(app)  # bonus: traces every HTTP request too
```

Restart the backend. Brew, serve. Open Logfire dashboard.

### Verify

You should see one trace per `serve` call, with the LLM and MCP-tool spans nested underneath. Click in. Read what the agent thought.

### Pitfalls

- **`LOGFIRE_TOKEN` in git** — don't. `.env` it.
- **Sampling in dev** — leave at 100%. Sample down only when you're paying real money.

---

## Exercise 16 — Read-token access to the Logfire dashboard

> **Concept anchor**: the read token unlocks the dashboard for *non-engineers* (PMs, support, anyone debugging an issue).

### What you're showing

Logfire has two token types:

- **Write token** (`pylf_v1_w_...`) — the app sends data with this. Goes in `.env`.
- **Read token** (`pylf_v1_r_...`) — anyone with this can browse traces. Share with PMs, customer support, on-call.

### Run it

In the Logfire UI: **Project Settings → Tokens → New read token**. Copy the URL with the token embedded.

Send the URL to a non-engineer in the workshop room. They open it, see traces, click a customer interaction, and read what the agent thought *without ever touching the code*.

### Why this is the punchline of the day

We've gone end-to-end:

1. Wrote code with copilot CLI (Ex 1–2)
2. Encoded team standards in AGENTS.md (Ex 3, 5)
3. Bolted on plugins (Ex 6)
4. Used built-in agents to plan and review (Ex 7)
5. Built our own skill (Ex 8)
6. Shipped real product features (Ex 9–11)
7. Let the agent operate the running app via MCP (Ex 12)
8. Embedded a programmatic agent into our backend (Ex 13–14)
9. Made the agent's behavior visible to anyone (Ex 15–16)

The full agentic-coding stack, on a game you can drag and drop in a browser.

---

## Proposed additions (things that might be missing)

> Worth flagging to Jakub before the workshop.

- **Programmatic / headless `copilot` mode** — running prompts non-interactively from a shell script (great for CI). One short exercise after Ex 8 would land it.
- **Eval — how do you know your skill works?** — add a regression check: run the `/new-mixture` skill against a frozen prompt, diff the JSON output. Goes naturally after Ex 8.
- **Cost awareness** — Logfire reports tokens; we should at least *show* the token-cost column in Ex 15. One sentence on "this is real money in prod."
- **Sub-agents / parallelism** — `/plan` already uses Explore in parallel. A 5-min aside in Ex 7 explaining why that's load-bearing for big tasks.
- **Comparison: when to use copilot CLI vs the VS Code agent vs cloud agent** — a single slide near the end, mirroring the foundations deck's "rule of thumb" slide.
- **Reading agent failures** — what to do when the agent does something dumb. A "debugging your agent" sidebar could go near Ex 14.

If any of these resonate, I'll fold them into the next revision.

## Notes / open questions

- [ ] Confirm the alchemy game repo URL and clone command are stable before the day.
- [ ] Check the *exact* Playwright plugin install command at workshop time — the ecosystem moves fast.
- [ ] Decide whether students get pre-issued Logfire write tokens or each create their own. Pre-issued saves 5 minutes per student.
- [ ] Pre-pull the Ollama Gemma weights on every laptop the night before — don't burn workshop minutes on a 2GB download.
