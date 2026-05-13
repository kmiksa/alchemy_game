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

We build the **AI Agents for prediction markets**.

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
8 exercises. New concepts introduced as we need them.
</div>

<!--
This is the second half. We move from "what is copilot CLI" to "what does an agentic-coding workflow actually look like." Eight exercises, each layering one new concept on the last: instructions, web research, plan/review, delegation, skills, plugins. Same game throughout.
-->

---

# Setup — boot the game

```bash
git clone https://github.com/jakubmiksa/alchemy_game.git
cd alchemy_game
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
We don't move on until every laptop has the apothecary on screen. If `make seed` fails, it's almost always Python not being on PATH or `uv` missing.
-->

---
layout: section
---

# Ex 1

Install & first prompt — point Copilot at the repo.

<!--
The intro got copilot on every laptop. Ex 1 is where they actually start using it: ask it to summarize the repo, tell them how to run it, then make a small config change. Establishes the muscle memory: ask in plain English, let the CLI read.
-->

---

# Ex 1 — first prompts

```bash
cd alchemy_game
copilot
> /login
```

<v-click>

```text
> What does this repo do? Analyze the repo, then give me a summary
> of what the project is and how the pieces fit together.
```

</v-click>

<v-click>

```text
> How do I run this game locally? Walk me through the prerequisites
> and the exact commands. Tell me which ports the backend and
> frontend listen on and what URL to open.
```

</v-click>

<!--
Two prompts. No @file references yet — the CLI opens files itself. The reply should pull from README.md and Makefile.
-->

---

# Ex 1 — speed up customer arrivals

```text
> A customer takes 30 seconds to appear in the game, which is too
> slow while I'm testing. Change the configuration so the first
> customer appears after 3 seconds instead.
```

<v-click>

The CLI finds `config.py`

</v-click>

<!--
The recurring lesson starts here: the agent will happily do the wrong thing. Defaults stay sane; the env knob is the right answer.
-->

---
layout: section
---

# Ex 2

Essential slash commands — control the session.

<!--
Slash commands govern the session, not the AI's reasoning. Picking a model, watching the context window, compacting, resuming. The boring infrastructure that makes long sessions actually work.
-->

---

# Ex 2 — slash commands you'll use daily

<div class="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 text-sm">

<div>

**Session control**
- `/model` — pick the brain (Claude Sonnet 4.5, GPT-5, …)
- `/clear` — drop conversation, keep session
- `/new` — start fresh, save current to history
- `/resume` — pick a past session

</div>

<div>

**Context**
- `/context` — how full is the window?
- `/compact` — summarize and free up space
- `/rewind` — roll back to an earlier turn

</div>

<div>

**Inspection**
- `/diff` — see what changed in the tree
- `/cwd` — where am I?
- `/statusline` — pin the values you care about

</div>

<div>

**One-offs**
- `/ask <q>` — single Q that doesn't pollute history
- `/help` — list everything

</div>

</div>

<!--
Don't read every line. Cluster: control the session, watch context, inspect work. /compact is the one that buys you long sessions — runs automatically near the limit, manually when answers get fuzzy.
-->

---

# Ex 2 — load context, compact it

```text
> @backend/apothecaria/ Briefly: what are the main modules and
> how do they relate?
> /context
```

<v-click>

```text
> @frontend/src/ How is the Three.js scene organized?
> /context
```

Note the token count climb.

</v-click>

<v-click>

```text
> /compact
> /context
```

Same conversation, smaller footprint. The summary preserves findings; the raw chat is gone.

</v-click>

<!--
Show the numbers live. The drop after /compact is the "aha" — the model isn't losing what it learned, just dropping the verbose history.
-->

---
layout: section
---

# New concept

Custom instructions — rules that fire on every prompt.

<!--
First custom-context concept. After this, every prompt in the workshop is influenced by what we put in the instructions file. Worth pausing on.
-->

---

# Three places to put rules

| File | Scope | When to use |
|---|---|---|
| `.github/copilot-instructions.md` | **Repo-wide** | Primary recommendation. Every prompt in this repo. |
| `.github/instructions/<name>.instructions.md` | Path-glob | Subsets — backend-only, tests-only. |
| `AGENTS.md` (root) | Cross-tool | Same file works for Claude, Gemini, Cursor. |

<div v-click class="mt-6 opacity-75">

Rule of thumb: *if you'd say it to every new engineer on day one, it goes here.*

</div>

<!--
We use the GH-native path. AGENTS.md is the cross-tool option for teams using multiple agents. Same idea, different filename.
-->

---

# Ex 3 — see the before/after

```text
> Add a docstring to make_customer in
> @backend/apothecaria/domain/customer_queue.py.
```

<v-click>

No instructions file yet → Google-style ("Args:" / "Returns:"). Keep the change.

</v-click>

<v-click>

Create `.github/copilot-instructions.md`:

```markdown
## Docstrings
Short one-line summary.
Use this when <when a caller should reach for this>.
:param <name>: <description>
:return: <description>

- reST style — not Google "Args:"/"Returns:".
- Skip `:return:` when the function returns None.
```

</v-click>

<!--
The before/after is the whole point. Same model, same prompt structure — only the instructions file changed.
-->

---

# Ex 3 — confirm and compare

```text
> /env
```

<v-click>

`/env` lists what the session loaded: instructions, agents, skills, MCPs. You should see `.github/copilot-instructions.md`.

</v-click>

<v-click>

```text
> Add a docstring to pick_next_template in
> @backend/apothecaria/domain/customer_queue.py.
> Follow the project's docstring conventions.
```

```bash
git diff backend/apothecaria/domain/customer_queue.py
```

Two docstrings, two styles, side by side.

</v-click>

<!--
The prompt for pick_next_template does NOT describe the format — the file does. That's the win you're showing.
-->

---
layout: section
---

# Ex 4

Web research — `/research` and global instructions.

<!--
The CLI can search the web. Useful for things the model won't remember accurately (file paths, version-specific config). We use it to find where global instructions live, then write one.
-->

---

# Ex 4 — research a real question

```text
> /research Where do GitHub Copilot CLI global / user-level
> instruction files live, and what filenames does the CLI look for?
```

<v-click>

The CLI cites URLs. Verify the path makes sense (something under `~/.copilot/`).

</v-click>

<v-click>

Then have the CLI create it for you:

```text
> Create that file at the path you found and add a single starter
> rule: "When asked to add comments, never explain WHAT the code
> does — only the WHY when non-obvious."
```

</v-click>

<!--
/research is the deep-dive variant — pulls from GitHub and the web, follows links, synthesizes. Use it when one-shot Q&A isn't enough.
-->

---

# Ex 4 — confirm both layers load

```text
> /env
```

<v-click>

`/env` should list **both** files:
- Project: `.github/copilot-instructions.md`
- Global: `~/.copilot/AGENTS.md` (or wherever the research told you)

</v-click>

<v-click>

```text
> Add a comment to make_customer explaining what's happening.
> /diff
```

The global rule kicks in: the CLI either pushes back ("rule says no WHAT-comments") or writes WHY-only.

</v-click>

<!--
Project + global layered. Project wins on conflict — more specific. This is the same pattern we'll see for skills and MCPs later.
-->

---
layout: section
---

# New concept

Built-in agents — `/plan` and `/review`.

<!--
Biggest behavior change in the whole workshop: stop autocompleting. Plan first, implement against the plan, review after. This is the discipline that separates working *with* an agent from being run over by one.
-->

---

# `/plan` and `/review`

<div class="grid grid-cols-2 gap-8 mt-6">

<div>

### `/plan`

- Step-by-step plan **before** any code.
- Investigates the repo to find files you didn't know mattered.
- You read it. Push back. Edit.
- Also: Shift+Tab, or `copilot --plan`.

</div>

<div>

### `/review`

- Reads your staged + unstaged diff.
- Flags issues with severity tags.
- Cheap enough to run before every commit.

</div>

</div>

<div v-click class="mt-8 opacity-75">

Same model. Different orchestration. Plan = investigation. Review = critique.

</div>

<!--
The plan agent's superpower is investigating files you didn't know to look at. "Add a new mixture" sounds simple — the plan surfaces the JSON-seed-loader flow you'd otherwise miss.
-->

---

# Ex 5 — plan Fog Veil, then implement

```text
> /plan I want to add a new mixture called "Fog Veil" —
> ailment_category="confusion", ingredients=["moonpetal", "sage",
> "feather"], with a short flavor line for lore. It should show
> up in /api/recipes, be brewable via /api/brew, and survive a
> server restart. Investigate the codebase first.
```

<v-click>

A good plan surfaces:
- Source of truth is `backend/apothecaria/content/recipes.json` — not Python.
- `make seed` upserts JSON into SQLite. No migration needed.
- Tests live in `backend/tests/test_api_recipes.py`.

</v-click>

<v-click>

```text
> Looks good. Proceed: add the recipe, run make seed, and extend
> the test to assert Fog Veil appears with its three ingredients.
```

</v-click>

<!--
The plan is the deliverable. If it names the wrong files, that's the moment to catch it — before any code is touched.
-->

---

# Ex 5 — verify, then `/review`

```text
> !make seed
> !make test
```

<v-click>

The `!` prefix runs a shell command without the AI in the loop.

</v-click>

<v-click>

```text
> /review
```

Reads the diff. Flags `[CRITICAL]` / `[HIGH]` / `[MEDIUM]` / `[LOW]` items: slug typos, JSON formatting drift, loose assertions, missing trailing newlines.

</v-click>

<!--
/review isn't a substitute for human review — it catches obvious stuff cheaply so your human reviewer focuses on architecture.
-->

---
layout: section
---

# Ex 6

Delegate the plan — hand it to the cloud agent.

<!--
Ex 5's plan was the perfect input for a cloud agent: self-contained, file-backed, no ambiguity. Now we hand the same task to GitHub's cloud infrastructure instead of running it locally.
-->

---

# `/delegate` — same task, different runtime

<v-clicks>

- Hands a self-contained task to the **Copilot cloud agent**.
- Runs on GitHub's infra. Edits on a branch. Opens a PR.
- Your terminal stays free.
- **The pattern**: `/plan` to investigate → save the plan → `/delegate` with the plan attached → review the PR.

</v-clicks>

<div v-click class="mt-6 opacity-75">

When to reach for it: bounded but tedious work — many similar edits, big test passes, repetitive refactors. **Not** for: needs your local DB, secrets, unmerged deps, or back-and-forth iteration.

</div>

<!--
The cloud agent can't pause to ask "did you mean X or Y?". That's why pairing it with /plan matters — you've already removed the ambiguity.
-->

---

# Ex 6 — save the plan, delegate it

```bash
git restore backend/apothecaria/content/recipes.json \
            backend/tests/test_api_recipes.py
make seed     # undo Ex 5 so the cloud agent has real work
```

<v-click>

```text
> /plan ...same prompt as Ex 5...
> Save this plan to docs/plans/fog-veil.md
```

</v-click>

<v-click>

```text
> /delegate Execute the plan in @docs/plans/fog-veil.md exactly.
> Add the recipe, extend the test, run make seed and make test,
> and open a PR titled "Add Fog Veil mixture".
```

The CLI returns a URL to the cloud run / draft PR.

</v-click>

<!--
Save the plan to a file so the cloud agent has the same source of truth you read. Vague prompts produce wrong PRs — file-backed plans don't.
-->

---

# Ex 6 — review the PR

<v-clicks>

- Open the URL. Watch the agent's progress log, file edits, test results.
- Review the diff like any other PR: does it match the plan, only the right files?
- Check CI. If something's off, leave a comment — the agent iterates on feedback.
- Merge. Pull. Verify locally.

</v-clicks>

<div v-click class="mt-6 opacity-75">

**Fallback** — no cloud agent? `copilot --autopilot` runs the plan locally without pausing for confirmations. No PR, but same hands-off feel.

</div>

<!--
Cloud agents are confident, not infallible. The review step is where you stay in the loop.
-->

---
layout: section
---

# New concept

Skills — auto-triggered playbooks.

<!--
Ex 5 and Ex 6 added Fog Veil. The workflow worked. A Skill encodes that workflow so the *next* "add a mixture" runs the same way without re-investigating. Skills are how you turn one-off recipes into team muscle memory.
-->

---

# Instructions vs Agents vs Skills

| Shape | Triggers | Use for |
|---|---|---|
| **Instructions** | Always on | Project-wide rules ("use reST docstrings") |
| **Agents** (`/plan`, `/review`) | When invoked | Different ways of thinking |
| **Skills** | On prompt match | Specific repeatable playbooks |

<div v-click class="mt-6 opacity-75">

Rule of thumb: **instructions** for *style*, **agents** for *process*, **skills** for *playbooks*.

</div>

<!--
Engineers confuse these. Land the table. The trigger column is what makes them different. Same model under the hood.
-->

---

# Ex 7 — `new-mixture` skill

`.github/skills/new-mixture/SKILL.md`:

```markdown
---
name: new-mixture
description: Use when the user asks to add a new mixture,
  recipe, potion, or brew to the Apothecaria game.
---

# New Mixture

## Required inputs
- slug, name, ailment_category, ingredients, lore.
- If anything missing → ask before proceeding.

## Steps
1. Validate ingredients exist.
2. Confirm slug + ingredient-set uniqueness.
3. Add entry to recipes.json.
4. make seed && make test.
5. Branch, commit, push, open PR.
```

<!--
Skill is a *checklist*, not a script. The description field is the discovery mechanism — list every phrase a user might say. "mixture, recipe, potion, brew" hits four triggers.
-->

---

# Ex 7 — reload, trigger, confirm

```text
> /skills reload
> /skills list
```

<v-click>

You should see `new-mixture`. Inspect with `/skills info new-mixture`.

</v-click>

<v-click>

Trigger naturally:

```text
> Add a new mixture called "Sorrowmend Cordial" — ailment_category
> sorrow, ingredients [root, moonpetal, feather]. Lore: a warm
> amber draught that softens grief without numbing it.
```

The CLI follows the checklist instead of re-investigating.

</v-click>

<v-click>

```text
> What skills did you use for that last task?
```

Should mention `new-mixture`. If not, edit the `description` to match how you asked.

</v-click>

<!--
If the skill doesn't fire, the description is wrong — not the model. Use the words a real user would use, not technical jargon.
-->

---
layout: section
---

# New concept

Plugins & MCP — new tools the agent can call.

<!--
Everything so far has been about HOW the agent works (instructions, agents, skills). Plugins change WHAT it can do — they add new tools. MCP is the standard interface.
-->

---

# Plugins & MCP

<v-clicks>

- **Plugins** extend Copilot CLI's toolkit at runtime — browser control, DBs, Slack, Linear, image gen.
- Most plugins are **MCP servers** — small processes exposing tools over a standard protocol (Model Context Protocol).
- Point Copilot at the server, it lists the tools at startup, the model invokes them like built-ins.

</v-clicks>

<div v-click class="mt-6 grid grid-cols-2 gap-6 text-sm">

<div>

**Built-in tools**

Read files. Write files. Run shell.

</div>

<div>

**With a plugin**

Click buttons. Take screenshots. Query databases. Post to Slack.

</div>

</div>

<!--
Plugins are the leap from "AI that edits code" to "AI that operates software." We install one now — Playwright — to drive the apothecary's frontend.
-->

---

# Ex 8 — install Playwright

```bash
make dev    # in another terminal — frontend must be running
```

<v-click>

```bash
npm install -g @playwright/mcp
# or run on-demand: npx -y @playwright/mcp@latest
```

First run downloads Chromium (~150 MB).

</v-click>

<v-click>

```bash
copilot
> /mcp add playwright npx -y @playwright/mcp@latest
> /mcp list
> /mcp info playwright
```

Lists `browser_navigate`, `browser_click`, `browser_snapshot`, `browser_take_screenshot`, etc.

</v-click>

<!--
/mcp add is per-session by default. To persist, add to `.github/copilot/mcp.json` or `~/.copilot/mcp.json`.
-->

---

# Ex 8 — drive the shop with English

```text
> Open the alchemy game at http://localhost:5173 in the browser.
> Wait for the first customer to arrive, read what they're asking
> for, brew the matching potion using the ingredients in the
> workshop, and take a screenshot of the result. Tell me what
> happened at each step.
```

<v-click>

A Chromium window pops up. The CLI clicks through the UI and streams its reasoning: "I see a customer asking for X. I'll select these ingredients and click Brew."

</v-click>

<v-click>

```text
> Which tools did you use for that last task?
```

Should mention `playwright`/`browser_*` tools. If not, re-check `/mcp list`.

</v-click>

<!--
Don't name tools in the prompt. The model picks: "click the brew button" → browser_click; "what's on the page now?" → browser_snapshot. Plain English in, the right tool out.
-->

---
layout: statement
---

# What we built

From copilot prompts to a CLI that drives a real browser and operates the app.

<v-click>

In eight exercises.

</v-click>

<!--
Hold this slide. Let it sink in.
-->

---

# Recap — the agentic-coding stack

<v-clicks>

1. **Ex 1** — Install, first prompts, config tweaks
2. **Ex 2** — Slash commands: model, context, compact, resume
3. **Ex 3** — **Custom instructions** — `.github/copilot-instructions.md`
4. **Ex 4** — **`/research`** + global instructions in `~/.copilot/`
5. **Ex 5** — **`/plan` and `/review`** built-in agents
6. **Ex 6** — **`/delegate`** to the cloud agent
7. **Ex 7** — **Skills** — `new-mixture` auto-triggered playbook
8. **Ex 8** — **Plugins / MCP** — Playwright drives the browser

</v-clicks>

<!--
Walk down the list. Every bold word is a concept they now own. Instructions for style, agents for process, skills for playbooks, plugins for new senses.
-->

---
layout: end
---

# Done

Eight exercises. One game. The full agentic-coding stack.

Now go uweaily your creativity.

<!--
End on action. The point of the workshop is what they do *next week*, not what they did *today*.
-->
