---
theme: seriph
title: 'Copilot CLI — Foundations'
info: |
  ## Foundations
  Workshop: GitHub Copilot CLI & agentic coding.
  Jakub Miksa, Head of AI @ Elastics.
class: text-center
highlighter: shiki
lineNumbers: false
drawings:
  persist: false
transition: slide-left
mdc: true
---

# Copilot CLI

## Foundations

Jakub Miksa · Head of AI @ Elastics

<!--
Welcome. By the end of this session, every laptop in the room runs `copilot` and has answered at least one prompt.
-->

---
layout: intro
---

# About me

**Jakub Miksa**
Head of AI @ **Elastics**

We build the **Bloomberg terminal for prediction markets**.

<!--
Quick context for who I am and why I care about this. Keep this short — 60 seconds. The interesting part is what we're going to build with the agent.
-->

---
layout: section
---

# Why CLI over the VS Code agent?

---

# Why CLI wins

<v-clicks>

- **Automation & scripting** — runs in CI, cron, git hooks, SSH sessions. A GUI can't.
- **Agentic, multi-step work** — long autonomous loops, whole-repo refactors, parallel subagents, background tasks.
- **Composability** — pipes into `grep`, `git`, `jq`. The shell is the universal glue.
- **Headless / remote** — no display, inside containers, over SSH.
- **Lower overhead** — no editor process, no extension host.
- **Reproducibility** — prompts and commands are text. Version, share, replay.

</v-clicks>

<!--
Don't read every bullet. Pick 2-3 that resonate with this audience and elaborate. The "automation" and "reproducibility" points usually land hardest with engineers.
-->

---

# Where VS Code + Copilot is better

<v-clicks>

- **Tight edit-in-flow loop** — inline ghost-text completions while you type.
- **Visual review** — diffs, hover docs, problems panel, integrated debugger.
- **UI / frontend work** — live preview, browser devtools, notebook outputs.
- **Beginners & discoverability** — menus and marketplace lower the floor.
- **Small, local edits** — quick fixes in one file. An agent is overkill.

</v-clicks>

<!--
Be honest about where the IDE wins. Don't sell the CLI as universally better — that's how you lose engineers who know the tradeoffs.
-->

---
layout: statement
---

# CLI for agentic, automatable, repo-wide work.

# IDE for interactive, visual, fine-grained editing.

Most pros use **both**.

<!--
This is the rule of thumb. Land it slowly. Pause. Then move on.
-->

---
layout: section
---

# Don't be John

A cautionary tale.

---

# Don't be John

<v-clicks>

- John relied **too much** on AI coding agents.
- He built a critical project — **never reviewed the code**.
- Autocomplete after autocomplete. Repo grew to **20,000+ lines**.
- Nobody knew what was inside. Bug? **No idea why.**
- Worst part: **silent bugs** — we didn't even know if they happened.
- We tried to trim and understand. Impossible.
- John worked **8am–11pm**. Stopped showering. Stopped eating. Lived on Red Bull.
- 1-month leave. We **rebuilt the project from scratch**.

</v-clicks>

<!--
Tell this as a story, not a list. Slow down. The Red Bull line is the laugh; the rebuild line is the punch. Hold the silence after "rebuilt from scratch" before the next slide.
-->

---
layout: statement
---

# The agent is a tool.

# Not a teammate that takes responsibility for you.

Review the code. Own the architecture.

<!--
This is the whole point. Everything else — when to delegate, what skills are, how MCPs work — is downstream of this.
-->

---
layout: section
---

# Me vs. the Agent

Who does what?

---

# Me vs. the Agent

<div class="grid grid-cols-2 gap-8 mt-8">

<div>

### Delegate to the agent

- Correctness sweeps
- Testing
- Error handling
- Debugging *after* reproduction
- Boilerplate
- Translation
- Thoroughness
- Repetitive implementation

</div>

<div>

### Stay human-led

- Where to start
- Architecture
- Design direction & consistency
- Abstraction boundaries
- Data model and API shape
- Refactoring intent
- Product judgment
- Priority tradeoffs

</div>

</div>

<!--
Walk down both columns. Pattern: the agent is great at *thoroughness within a defined task*. You are still the one who decides what the task even is.
-->

---
layout: section
---

# Untangling the echo

Skills · MCP · Plugins

---

# Skills · MCP · Plugins

<v-clicks>

- **Skill** → a single capability / playbook in a `Skills.md` file.
  Build your own, or install official ones.
  *(This deck was built with the `slidev` skill.)*

- **MCP server** → external connectivity (DB, API, Slack, GitHub).

- **Plugin** → a **bundle** that ships skills + MCP configs + commands.
  Team installs once, gets the whole setup.

</v-clicks>

<div v-click class="mt-8 opacity-75">
Agents themselves get the deep dive later.
</div>

<!--
This is a teaser, not a deep dive. Goal: shared vocabulary so the rest of the workshop has a map. If someone asks a deep question, defer it.
-->

---
layout: section
---

# Install & Setup

Live, hands-on.

<!--
This is the moment the workshop turns hands-on. Everyone laptops out. We don't move on until all 10 hands are up.
-->

---

# Prerequisites

<v-clicks>

- GitHub account with **Copilot access** (Individual / Business / Enterprise seat)
- A terminal — macOS Terminal, iTerm2, Windows Terminal, or Linux shell
- Network access to `github.com` and `gh.io`
  *(corp proxies sometimes block these)*

</v-clicks>

<!--
Confirm seats before continuing. If anyone is missing one, pair them with a neighbor for now and follow up after the workshop.
-->

---

# Step 1 — Install

```bash
curl -fsSL https://gh.io/copilot-install | bash
```

<v-click>

Watch for the installer's final line about `PATH`.

If your shell is `zsh`: restart the terminal **or** `source ~/.zshrc`.

</v-click>

---

# Step 2 — Verify

```bash
copilot --version
```

<v-click>

If `command not found`:

- Installer printed the install dir — add it to `PATH`
- Re-source your shell config

</v-click>

---

# Step 3 — Log in

```bash
copilot
```

<v-click>

First run prompts a **device-code login**.

1. Open the URL it prints
2. Paste the code
3. Approve in GitHub

</v-click>

---

# Step 4 — Proof of life

Inside the `copilot` REPL:

```text
> what is the current git branch?
```

<v-click>

Copilot runs `git branch --show-current` and reports back.

**This is the checkpoint.**

</v-click>

---

# Common failures

<v-clicks>

- `command not found: copilot` → PATH not picked up. **Restart the shell.**
- Login redirect doesn't open → **copy the URL** into the browser manually.
- `403 / no Copilot seat` → confirm your GitHub account has Copilot enabled.
- Corporate proxy blocks `gh.io` → fallback: download the release tarball from GitHub releases.

</v-clicks>

---
layout: center
class: text-center
---

# Hands up

When `copilot` has answered one question.

<div class="mt-8 opacity-60">
We don't move on until all 10 hands are up.
</div>

---
layout: statement
---

# Foundations done

Everyone has `copilot` running.

Now we **build** something with it.

<!--
Quick recap before the break:
- Why CLI matters
- Don't be John
- What to delegate vs. own
- Skills / MCP / Plugins map (we'll build each one)
- Everyone has copilot running
-->

---
layout: section
---

# Hands-on

Apothecaria — a cozy alchemist's apothecary.

<div class="mt-8 opacity-75">
16 exercises. Concepts introduced as we go.
</div>

<!--
This is the second half. We move from "what is copilot CLI" to "what does an agentic-coding workflow actually look like." We'll write code, edit AGENTS.md, install a plugin, build a skill, build MCP servers, and ship a real pydantic-ai agent — all on a single game. Pace: keep moving. We do not have to finish all 16. Pick the modules that resonate.
-->

---

# Setup — boot the game

```bash
git clone https://github.com/jakubmiksa/alchemy_game.git apothecaria
cd apothecaria
uv sync && make install && make seed && make dev
```

<v-click>

Open <http://localhost:5173>.
Drag two ingredients onto the cauldron. Serve a customer.

</v-click>

<v-click>

**Checkpoint**: hands up when the shop renders. Wait for everyone.

</v-click>

<!--
Same rule as before — we don't move on until every laptop has the apothecary on screen. If `make seed` fails, it's almost always Python 3.12 not being on PATH.
-->

---
layout: section
---

# Ex 1–2

Warm-up: prompts and `@file` context.

<!--
Two short exercises to establish the muscle memory: anchor every prompt with @file, and let the agent find code on its own.
-->

---

# Ex 1 — add docstrings

```text
> Add docstrings to all public functions and classes in
> @backend/apothecaria/domain/brewing.py.
> Use sphinx-style :param: and :return:. Example:
>
>   :param product_ids: list of item_group_ids
>   :return: alternative products for each provided id
```

<v-click>

- `@file` reference → agent reads, doesn't guess.
- Example inside the prompt → **few-shot**, agent mirrors style.
- `git diff` afterwards → review every change.

</v-click>

<!--
The format example is what makes this work. Without it, the agent picks Google or numpy style. Always show one example when you have a strong style preference.
-->

---

# Ex 2 — make the first customer arrive faster

```text
> The first customer takes 30 seconds to appear. I want to test
> brewing faster — make it 5 seconds. Look around the codebase
> first to understand how arrivals are timed.
```

<v-click>

The agent uses **Explore** automatically: greps `config.py`, finds `customer_arrival_seconds`, proposes two options.

</v-click>

<v-click>

```bash
APOTHECARIA_CUSTOMER_ARRIVAL_SECONDS=5 make backend-dev
```

Env var, not a code edit. Defaults stay sane.

</v-click>

<!--
Push back when the agent proposes hard-coding a 5-second default. This is the recurring lesson: the agent will happily do the wrong thing.
-->

---
layout: section
---

# New concept

`AGENTS.md` — the team rules file.

<!--
First custom-instructions slide. After this point, every prompt in the workshop is influenced by what we put in AGENTS.md. Worth pausing on.
-->

---

# AGENTS.md

<v-clicks>

- Plain markdown at the repo root. Copilot reads it on every session.
- Cross-tool standard ([agents.md](https://agents.md/)) — Claude, Gemini, Cursor all read it.
- *If you'd say it to every new engineer on day one, it goes here.*

</v-clicks>

<div v-click class="mt-6 grid grid-cols-2 gap-6 text-sm">

<div>

### Project — `<repo>/AGENTS.md`

Team conventions, stack, commands.

</div>

<div>

### Personal — `~/.copilot/AGENTS.md`

Your style. Terse output. `uv` over `pip`.

</div>

</div>

<!--
Two scopes. Both load on every session. Project wins on conflict because it's more specific.
-->

---

# Ex 3 + 5 — write the rules file

```text
> /init
```

<v-click>

`/init` drafts a baseline. Then append:

```markdown
## Code style — docstrings
Sphinx-style with :param: and :return:.
Example: <paste the recommendation example from Ex 1>

## Pydantic models
All BaseModel classes live in backend/apothecaria/domain/models.py.
Do not create per-feature models.py.
```

</v-click>

<v-click>

Then in a fresh session: re-run Ex 1 on a different file. The style sticks **without re-specifying it**. That's the win.

</v-click>

<!--
The "no per-feature models.py" rule is the big one — it prevents the most common LLM-generated mess: a new schema file every time the agent needs a type.
-->

---
layout: section
---

# New concept

Plugins — installable bundles.

<!--
We teased plugins in the foundations deck. Now we install one and inherit a whole workflow.
-->

---

# Plugins

<v-clicks>

- A bundle of **skills + MCP configs + commands**, installed once.
- You don't write a plugin from scratch — you install one.
- Browse: [github/awesome-copilot](https://github.com/github/awesome-copilot).

</v-clicks>

<div v-click class="mt-6 opacity-75">

We install [Playwright](https://github.com/microsoft/playwright-mcp): real browser, screenshot tool, click+drag. Closes the "VS Code wins for UI work" gap from the foundations deck.

</div>

<!--
Plugins are how teams standardize. One person sets up, everyone installs, everyone gets the same agentic workflow.
-->

---

# Ex 6 — install Playwright, drive the shop

```bash
copilot
> /plugin install playwright
```

```text
> Open http://localhost:5173, screenshot the shop. Then drag the
> mandrake jar onto the cauldron and screenshot again.
```

<v-click>

Two PNGs. Different. The agent now has eyes on the browser — UI testing without leaving the CLI.

</v-click>

<!--
First-run downloads ~200MB of Chromium. Pre-warn the room before everyone hits the network.
-->

---
layout: section
---

# New concept

Built-in agents — `/plan` and `/review`.

<!--
Biggest behavior change: stop autocompleting. Plan first, implement against the plan, review after. This is the discipline that separates working *with* an agent from being run over by one.
-->

---

# `/plan` and `/review`

<div class="grid grid-cols-2 gap-8 mt-6">

<div>

### `/plan`

- Step-by-step plan **before** any code.
- You read it. Push back. Edit.
- Catches "I'll add a new file" mistakes early.

</div>

<div>

### `/review`

- Reads your staged diff.
- Flags missing tests, edge cases, style.
- *Not* a substitute for human review.

</div>

</div>

<div v-click class="mt-8 opacity-75">

Behind the scenes: both delegate to **Explore** and **Task** sub-agents in parallel.

</div>

<!--
Walk through both columns. Land the point: /review is good but it misses architectural drift. Reference "Don't be John."
-->

---

# Ex 7 — Plan → Implement → Review a new mixture

```text
> /plan Add ingredient "dragon's breath chili" and recipe
> "dragonfire-tonic" (chili + ginger + honey, treats frostbite).
> Seed JSONs are in @backend/apothecaria/content/.
```

<v-click>

Read the plan. Push back on:
- "I'll add a new model file" → **no**, AGENTS.md says one models.py.
- "I'll write a migration" → **no**, seed loader upserts.

</v-click>

<v-click>

```text
> Implement the plan.
> /review
```

</v-click>

<!--
The pushback step is the whole exercise. The agent will propose unnecessary files. Catch it before any code is written.
-->

---
layout: section
---

# New concept

Skills — auto-triggered playbooks.

<!--
We just did Ex 7 manually. A Skill encodes that workflow so the *next* "add a new potion" runs the same way. Skills are how you turn one-off recipes into team muscle memory.
-->

---

# AGENTS.md vs Skill vs Agent

| Shape | Triggers | Use for |
|---|---|---|
| **AGENTS.md** | Always on | Project-wide rules ("use sphinx docstrings") |
| **Skill** | On user intent | Workflows ("add a new mixture") |
| **Agent** | When invoked (`/agent`) | Personas ("be a security reviewer") |

<div v-click class="mt-6 opacity-75">

Same model under the hood. Three different shapes for **when** the instructions fire.

</div>

<!--
Engineers confuse these constantly. Land the table. The trigger column is what makes them different.
-->

---

# Ex 8 — `/new-mixture` skill

`.github/skills/new-mixture.skill.md`:

```markdown
---
description: Use when adding a new potion / mixture / recipe.
Triggers on "add a new potion", "create a recipe".
---

1. Confirm details — name, ailment category, ingredients.
2. Edit content/ingredients.json (new ingredients first).
3. Edit content/recipes.json.
4. Run `make seed`. Run `make test`.
5. Tell user to refresh the browser.
```

<v-click>

Test in a fresh session:

```text
> Add a potion "moonlit balm" — cures insomnia, uses
> lavender, chamomile, silver dust.
```

</v-click>

<!--
Skill is a *checklist*, not a script. Use plain-language trigger phrases — what would a teammate say?
-->

---
layout: section
---

# Ex 9 – 11

Practice. Ship features.

<!--
The previous exercises set up the rails. Now use them. No new concepts — just /plan + skill + AGENTS.md applied to real feature work.
-->

---

# Ship three features

<v-clicks>

- **Ex 9** — pricing & a player wallet. Customers pay; ingredients cost money.
- **Ex 10** — per-ingredient stock counts. Brew → decrement. Stock 0 → jar fades.
- **Ex 11** — an ingredient store. Buy individual ingredients with coins.

</v-clicks>

<div v-click class="mt-8 opacity-75">

Use `/plan` for each. Push back on stray files. `/review` before commit.
The Store API in Ex 11 is what the **MCP server** in Ex 12 will expose — build it cleanly.

</div>

<!--
This is the practice block. If running short on time, pick one feature and skip the others. Ex 11 is the most important — it sets up Ex 12.
-->

---
layout: section
---

# New concept

MCP — give your agent new senses.

<!--
Up to here, the agent has only edited files and run shell. MCP is how you wire it up to the *running* application — read live state, take live actions. The leap from "AI that writes code" to "AI that operates software."
-->

---

# MCP servers

<v-clicks>

- Expose **tools** (functions) and **resources** (data) over JSON-RPC.
- Speak stdio or HTTP.
- The agent picks a tool the same way it picks a Python function — but the tool runs on **your** machine, against **your** state.

</v-clicks>

<div v-click class="mt-6 grid grid-cols-2 gap-6 text-sm">

<div>

### `inventory_mcp`

- `list_ingredients()`
- `get_stock(slug)`

</div>

<div>

### `store_mcp`

- `list_for_sale()`
- `buy(slug, qty)`

</div>

</div>

<!--
Two thin wrappers around the FastAPI endpoints we already built in Ex 9-11. The point isn't the implementation — it's that the agent can now READ live state and SPEND money.
-->

---

# Ex 12 — wire MCPs into copilot

`mcp.json`:

```json
{
  "mcpServers": {
    "inventory": { "command": "uv", "args": ["run", "-m",
      "apothecaria.mcp.inventory_mcp"] },
    "store":     { "command": "uv", "args": ["run", "-m",
      "apothecaria.mcp.store_mcp"] }
  }
}
```

<v-click>

Restart copilot. Then:

```text
> Which ingredients are low on stock? Restock anything below 3.
```

</v-click>

<v-click>

The agent calls `list_ingredients` → identifies low stock → calls `buy(...)` until stock ≥ 3. **It's operating your shop.**

</v-click>

<!--
This is the moment that lands. Watch the wallet drop in the UI in real time. The agent isn't writing code anymore — it's running the app.
-->

---

# Ex 13 — local LLM (Ollama + Gemma)

```bash
brew install ollama
ollama pull gemma:2b      # 2B params, runs on a laptop
ollama serve &
```

<v-click>

Why local? Ex 14 generates **customer dialogue** — fires every time someone is served. Frontier APIs are overkill and they cost real money during a workshop.

</v-click>

<!--
Pre-pull the weights on every laptop the night before. Don't burn workshop minutes on a 2GB download.
-->

---
layout: section
---

# New concept

Agents in code — pydantic-ai.

<!--
"Agent" up to here meant something inside copilot. pydantic-ai shows the OTHER meaning: an agent inside YOUR application — same idea (LLM + tools + a loop), but it ships as part of your software, not your editor.
-->

---

# Two meanings of "agent"

<div class="grid grid-cols-2 gap-8 mt-6">

<div>

### Inside copilot

`/plan`, `/review`, custom `.agent.md` files.

You **invoke** them. They live in your editor.

</div>

<div>

### Inside your app

`pydantic-ai`, `langchain`, your own loop.

You **ship** them. They run in production.

</div>

</div>

<div v-click class="mt-8 opacity-75">

Same architecture: LLM + tools + a loop. Different lifecycle.
The agent that ships *is the one you own and debug.*

</div>

<!--
This is the frontier most engineers miss. Copilot writes the code. The PRODUCTION agent is something you wrote, you own, and you ship.
-->

---

# Ex 14 — `CustomerAgent` uses our MCPs

```python
from pydantic_ai import Agent
from pydantic_ai.mcp import MCPServerStdio

inventory = MCPServerStdio("uv", ["run", "-m", "apothecaria.mcp.inventory_mcp"])
store     = MCPServerStdio("uv", ["run", "-m", "apothecaria.mcp.store_mcp"])

customer_agent = Agent(
    "ollama:gemma:2b",
    mcp_servers=[inventory, store],
    system_prompt="""
        You are a customer leaving the apothecary. 1-2 sentences.
        If stock of a key ingredient < 3, mention it — and you may
        call store.buy() to help.
    """,
)
```

<!--
The same MCP servers from Ex 12 — now used inside our backend, not by copilot. That's the reuse story: write the MCP once, use it from your editor AND from your app.
-->

---

# Wire it into the serve endpoint

```text
> /plan In @backend/apothecaria/api/customers.py, when serving
> a customer, call @backend/apothecaria/agents/customer_agent.py
> to generate the customer_response. Fall back to canned text
> if the agent times out (>3s).
```

<v-click>

Brew, serve, watch the LLM-generated dialogue. Repeat enough times → stock gets low → **the agent autonomously calls `store.buy`**.

</v-click>

<!--
The fallback matters. Local LLMs cold-start slow. A 3s timeout with a canned fallback is the workshop-friendly default.
-->

---
layout: section
---

# New concept

Logfire — see what your agent did.

<!--
You can't debug what you can't see. A pydantic-ai agent that calls MCP tools, decides things, occasionally makes wrong decisions, is opaque by default. Logfire is the X-ray.
-->

---

# A trace, in Logfire

```
agent.run("Customer=Anya, outcome=DELIGHTED")
├── llm_call(model="gemma:2b", tokens_in=412, tokens_out=87)
├── tool_call(name="inventory.list_ingredients")
│   └── result=[{slug=lavender, stock=2}, ...]
├── tool_call(name="store.buy", args={slug=lavender, qty=3})
│   └── result={ok: true, new_stock: 5}
└── llm_call(model="gemma:2b", tokens_in=531, tokens_out=44)
    └── output="Aaah, restock the lavender, you'll need more."
```

<div v-click class="mt-4 opacity-75">

Every span clickable. Token costs roll up. Errors highlight red.

</div>

<!--
This is the slide that lands the value. Read the trace out loud. The agent's reasoning is no longer opaque — every decision and every tool call is right there.
-->

---

# Ex 15 — instrument the agent

```python
import logfire
logfire.configure()
logfire.instrument_pydantic_ai()
logfire.instrument_fastapi(app)   # bonus: HTTP traces too
```

```bash
export LOGFIRE_TOKEN=pylf_v1_w_...    # write token, in .env
```

<v-click>

Restart backend. Brew. Serve. Open the Logfire dashboard.

One trace per `serve` call, MCP and LLM spans nested underneath.

</v-click>

<!--
Three lines of instrumentation, full visibility. .env the token — never commit it.
-->

---

# Ex 16 — share the dashboard

<v-clicks>

- **Write token** (`pylf_v1_w_...`) — your app sends data with this.
- **Read token** (`pylf_v1_r_...`) — anyone with this can browse traces.

</v-clicks>

<div v-click class="mt-6">

Send a read-token URL to a non-engineer in the room.

They open it, click an interaction, **read what the agent thought** — without ever touching the code.

</div>

<!--
This is the punchline. Observability isn't just for engineers anymore. PMs, support, on-call all get the same lens. Agents are software your whole team owns.
-->

---
layout: statement
---

# What we built

From copilot prompts to a production agent with full observability.

<v-click>

In one workshop.

</v-click>

<!--
Hold this slide. Let it sink in.
-->

---

# Recap — the agentic-coding stack

<v-clicks>

1. Copilot CLI — wrote code with prompts and `@file` (Ex 1–2)
2. `AGENTS.md` — encoded team standards (Ex 3, 5)
3. **Plugins** — installed Playwright (Ex 6)
4. **Built-in agents** — `/plan` + `/review` (Ex 7)
5. **Skills** — `/new-mixture` (Ex 8)
6. Real product features (Ex 9–11)
7. **MCP** — agent operates the running shop (Ex 12)
8. **pydantic-ai** — agent inside our backend (Ex 13–14)
9. **Logfire** — anyone can see what the agent did (Ex 15–16)

</v-clicks>

<!--
Walk down the list. Every bold word is a concept they now own. The unbolded ones are practice.
-->

---
layout: end
---

# Done

You've shipped an agent. Now go ship one in prod.

<!--
End on action. The point of the workshop is what they do *next week*, not what they did *today*.
-->
