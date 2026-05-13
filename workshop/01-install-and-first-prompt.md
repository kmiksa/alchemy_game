# 01 — Install & First Prompt

**Goal:** Install GitHub Copilot CLI, sign in, and use it to summarize this repo.

## Concepts

- **GitHub Copilot CLI** — a terminal-native AI coding assistant. You talk to it in plain English; it reads your files, runs commands, and answers back.
- **Device-flow authentication** — `/login` opens a browser, you paste a one-time code, GitHub authorizes the CLI.
- **Asking an AI to read your codebase** — the CLI can open files itself. You don't need to paste code into a prompt; just point it at the repo and ask.

## Steps

1. **Install** (pick one):

   ```bash
   npm install -g @github/copilot           # any platform with Node 20+
   brew install copilot-cli                 # macOS / Linux
   winget install GitHub.Copilot            # Windows
   curl -fsSL https://gh.io/copilot-install | bash   # macOS / Linux script
   ```

2. **Start the CLI from the repo root:**

   ```bash
   cd alchemy_game
   copilot
   ```

   Trust the folder when prompted (one-time, or for all future sessions).

3. **Sign in:**

   ```text
   > /login
   ```

   Copy the one-time code, paste it in the browser tab that opens, click *Authorize*, return to your terminal.

4. **Ask the CLI to analyze the repo:**

   ```text
   > What does this repo do? Analyze the repo, then give me a summary of what the project is and how the pieces fit together.
   ```

   When you're done:

   ```text
   > /exit
   ```

## Done when

- [ ] `copilot` launches an interactive session (prompt with `>` appears)
- [ ] `/login` completes and the CLI confirms you're signed in
- [ ] The CLI's reply correctly identifies Apothecaria as a Python/FastAPI backend + Vite/TypeScript (DOM + CSS) frontend apothecary game with a SQLite seed and a customer-serving loop

## References

- [Install GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/cli-getting-started)
- [Copilot CLI command reference](https://docs.github.com/en/copilot/reference/cli-command-reference)
- [About Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli)
