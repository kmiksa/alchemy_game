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
5. **Ask the CLI how to run the game** — same session, so it still has the repo summary in context:
  ```text
   > How do I run this game locally? Walk me through the prerequisites and the exact commands. Tell me which ports the backend and frontend listen on, what URL to open in the browser, and how to reset the database if I want a clean state.
  ```
   The reply should pull from `README.md` and `Makefile` and end up with something like: `uv sync`, `make install`, `make seed`, `make dev`, then open [http://localhost:5173](http://localhost:5173).
6. **Ask Copilot to speed up customer arrivals** — by default the first customer takes 30 seconds to appear, which is slow when you're poking around. Have Copilot find the right knob and change it without touching the default in the source:
  ```text
   > A customer takes 30 seconds to appear in the game, which is too slow while I'm testing. Change the configuration so the first customer appears after 3 seconds instead.
  ```
   Copilot should locate `config and update the value`
   Verify it took effect: in a separate terminal, run `make dev`, open [http://localhost:5173](http://localhost:5173), and a customer should arrive within ~3 seconds.
7. **Exit when you're done:**
  ```text
   > /exit
  ```

## Done when

- `copilot` launches an interactive session (prompt with `>` appears)
- `/login` completes and the CLI confirms you're signed in
- The CLI's reply correctly identifies Apothecaria as a Python/FastAPI backend + Vite/TypeScript (DOM + CSS) frontend apothecary game with a SQLite seed and a customer-serving loop
- The "how do I run it" reply lists the right commands (`uv sync`, `make install`, `make seed`, `make dev`) and points at [http://localhost:5173](http://localhost:5173)
- A `.env` file at the repo root contains `APOTHECARIA_CUSTOMER_ARRIVAL_SECONDS=3` and the first customer arrives in ~3 seconds when you run `make dev`

## References

- [Install GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/cli-getting-started)
- [Copilot CLI command reference](https://docs.github.com/en/copilot/reference/cli-command-reference)
- [About Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli)

