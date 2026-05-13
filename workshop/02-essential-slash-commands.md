# 02 — Essential Slash Commands

**Goal:** Learn the slash commands you'll reach for every session — picking a model, watching context, compacting history, clearing or resuming sessions, reviewing diffs, and checking where you are.

## Concepts

Slash commands control the **session itself**, not the AI's reasoning. They fall into a few buckets:

- **Pick the brain** — `/model` lets you choose which AI model answers (e.g. Claude Sonnet 4.5, GPT-5, etc.).
- **Watch the context window** — `/context` shows how full the model's working memory is. Every file you `@`-reference and every turn of conversation eats tokens. When the window fills, the model starts forgetting earlier parts of the chat.
- **Free up context** — `/compact` summarizes the conversation so far and replaces the raw history with that summary. It runs **automatically** when the window gets close to full, but you can also trigger it manually:
  - when you want to switch to a different task but keep the broad context, or
  - when responses start feeling confused or off-topic (a sign that stale context is interfering).
- **Reset or pick up a session** — `/clear` throws away the current conversation and starts fresh. `/resume` opens a picker of past sessions so you can return to one.
- **Inspect your work** — `/diff` shows the changes the CLI (or you) have made in the working tree, like `git diff` but inside the session. `/cwd` prints the current working directory the CLI is operating in.
- **Customize the status bar** — `/statusline` picks which fields appear in the bar at the bottom of the session (directory, branch, model, context-window usage, quota). Get the info you care about at a glance instead of running `/context` and `/cwd` repeatedly.

## Steps

Run these from the `alchemy_game` repo root.

1. **Start a session and check the basics:**

   ```bash
   copilot
   ```

   ```text
   > /cwd
   > /help
   ```

   `/cwd` confirms you're in the right repo. `/help` lists every command — skim it once.

2. **Pick a model:**

   ```text
   > /model
   ```

   You'll see a picker. Select **Claude Sonnet 4.5** (or whichever Claude model is available to you).

3. **Customize the status bar** so you can see model + context usage without running commands:

   ```text
   > /statusline
   ```

   Toggle on at least `model`, `context-window`, and `branch`. Glance at the bar — those values now update live.

4. **Load some context and watch it fill:**

   ```text
   > @backend/apothecaria/ Briefly: what are the main modules in this package and how do they relate?
   > /context
   ```

   Note the token count. Now load more and check again:

   ```text
   > @frontend/src/ How is the Three.js scene organized?
   > /context
   ```

5. **Compact the conversation:**

   ```text
   > /compact
   > /context
   ```

   Notice the drop. The summary preserves your key findings; the raw chat history is gone.

6. **Make a small change and review it:**

   ```text
   > Add a one-line comment at the top of README.md that says: "Apothecaria — workshop starter".
   > /diff
   ```

   Inspect the diff inside the session before deciding to keep or revert.

6. **Reset and resume:**

   ```text
   > /clear
   ```

   Then exit and come back:

   ```text
   > /exit
   ```

   ```bash
   copilot
   ```

   ```text
   > /resume
   ```

   Pick the session you were just in and confirm the model + context are restored.

## Other commands worth knowing

| Command | What it does |
|---|---|
| `/new` | End the current session (saved to history) and start a fresh one. Use instead of `/clear` when you want to be able to resume the old session later. |
| `/rename <name>` | Give the current session a memorable name. Resume later with `copilot --resume=<name>`. |
| `/rewind` | Open a timeline picker to roll back the conversation to any earlier point. Also bound to Esc-Esc. |
| `/ask <question>` | One-shot question that doesn't pollute the main conversation history. |
| `/exit` | End the session. |

## Done when

- [ ] `/model` shows a model picker and you've selected a Claude model
- [ ] `/context` reports a token usage number
- [ ] `/compact` runs and `/context` shows a lower number afterward
- [ ] `/diff` shows the README.md change you made
- [ ] `/resume` lists past sessions and lets you re-enter one

## References

- [Copilot CLI command reference](https://docs.github.com/en/copilot/reference/cli-command-reference)
- [Use Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli)
- [About Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli)
