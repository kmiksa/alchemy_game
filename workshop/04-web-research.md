# 04 — Web Research

**Goal:** Use Copilot CLI's built-in web search to look up something the model probably doesn't remember accurately — and apply what it finds to extend exercise 03's instructions across *every* project on your machine.

## Concepts

- **Copilot CLI can search the web.** When a prompt asks about something current (docs, library versions, "where do I put X"), the CLI can hit search engines, fetch pages, and cite sources back to you. You don't have to leave the terminal to look something up.
- **`/research`** is the dedicated slash command for deep investigation. It pulls from GitHub and the web, follows links, and synthesizes a report. Use it when you want more than a one-shot answer.
- **Why this beats memorizing docs** — official docs move. File paths, command flags, and config schemas change between CLI versions. Searching at the moment you need it is more reliable than recalling whatever the model trained on.
- **Project vs. global instructions** — in [exercise 03](./03-custom-instructions.md) you put `AGENTS.md` in the repo so it applies to *this* project. Global instructions live in your home directory and apply to *every* project you open with Copilot CLI. We'll find out exactly where via the CLI itself.

## Steps

1. **Open a session anywhere** (doesn't have to be this repo):

   ```bash
   copilot
   ```

2. **Ask the CLI to research the question:**

   ```text
   > Perform a search into how and where to put global instructions for all projects in GitHub Copilot CLI. Cite the official docs and tell me the exact file path on macOS/Linux and Windows.
   ```

   Or use the dedicated research command for a deeper dive:

   ```text
   > /research Where do GitHub Copilot CLI global / user-level instruction files live, and what filenames does the CLI look for?
   ```

3. **Read the answer carefully.** Check that:
   - It cites real URLs (the CLI shows the sources it consulted)
   - The path it suggests actually makes sense (e.g. something under `~/.copilot/` on macOS/Linux)
   - The filename matches what the CLI actually loads (commonly `AGENTS.md` or similar at the user level)

4. **Create the file the CLI told you to create.** Either ask the CLI to do it for you:

   ```text
   > Create that file at the path you found and add a single starter rule: "When asked to add comments, never explain WHAT the code does — only the WHY when non-obvious."
   ```

   …or do it yourself in a shell.

5. **Verify the global file loads.** Exit the session, `cd` into any project (e.g. `alchemy_game`), start `copilot` again, and run:

   ```text
   > /env
   ```

   The output should list both the project-level `AGENTS.md` (from exercise 03) **and** the new global one.

6. **Sanity-check that the rule applies.** Ask the CLI to add a comment to any function:

   ```text
   > Add a comment to make_customer in @backend/apothecaria/domain/customer_queue.py explaining what's happening.
   > /diff
   ```

   If the global rule is loaded, the CLI should push back ("the project rule says no WHAT-comments") or write a WHY-style comment only.

## Done when

- [ ] The CLI returns a research answer with cited URLs
- [ ] A global instructions file exists at the path the CLI identified
- [ ] `/env` in this repo lists **both** the project `AGENTS.md` and the global file

## References

- [GitHub Copilot CLI command reference](https://docs.github.com/en/copilot/reference/cli-command-reference) — includes `/research`
- [Use Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli)
- [AGENTS.md — open standard](https://agents.md/) — covers the user-level / global location too
