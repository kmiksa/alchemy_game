# 03 — Custom Instructions

**Goal:** Add a project-level *instructions* file so Copilot CLI follows your conventions automatically — then watch it apply a custom docstring format to a real function in this repo.

## Concepts

- **What instructions are for** — instructions provide context on *how* Copilot should generate code: the things it should be considering as it modifies and updates the codebase (style, naming, error handling, docstring format, security rules, what *not* to touch, etc.). The official docs note this can "significantly improve the quality of the agent's work."
- **Instructions ≠ agents.** Easy to mix up because of naming. **Instructions** are always-on rules that apply to *every* prompt — that's what we're doing in this exercise. **Agents** (the `.agent.md` files you'll meet in a later exercise) are specialized personas you summon for specific complex tasks. GitHub Copilot's primary recommendation is *instructions* for everyday standards; agents are reserved for heavier specialist work.
- **Where instructions live for GitHub Copilot CLI:**

  | File                                          | When to use                                                                                                                                    |
  | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
  | `.github/copilot-instructions.md`             | **Repository-wide, primary recommendation.** Applies to every request in this repo's context.                                                  |
  | `.github/instructions/<name>.instructions.md` | Path-specific. Add an `applyTo:` glob in the frontmatter to target a subset of files (e.g. only the backend).                                  |
  | `AGENTS.md` (root) or `.github/AGENTS.md`     | Cross-platform [open standard](https://agents.md/) — same file works with Copilot, Claude Code, Gemini CLI, etc. Use if your team mixes tools. |

  We'll use **`.github/copilot-instructions.md`** as the primary file in this exercise.
- `**/init`** asks the CLI to scan your repo and generate a starter instructions file for you. You then edit it.
- **Why instructions beat re-typing rules** — in exercises 01 and 02 we typed the rules into each prompt ("read README.md, give me one paragraph…"). Instructions move those rules out of the prompt and into a file the CLI always reads. Now "Add a docstring" produces the right docstring without spelling out the format every time.

## The docstring format we want

We'll teach the CLI to write reST/Sphinx-style docstrings:

```text
Short one-line summary of what the function does.
Use this when <when a caller should reach for this>.
:param <name>: <description>
:return: <description>
```

Two lines of human-facing description, then `:param:` for each argument, then `:return:`. No "Args:"/"Returns:" headers (that's Google style — we don't want that here).

## Steps

Run from the `alchemy_game` repo root. The point of this exercise is to **see the difference** — add a docstring *without* any custom instructions, add the instructions file, then add a docstring to a *different* function. A single `git diff` at the end shows both styles side-by-side.

1. **First, see what Copilot does without any custom instructions.** Pick a function that has no docstring yet — `make_customer` in `backend/apothecaria/domain/customer_queue.py` is a clean candidate (it takes a template and returns a customer instance). In your existing `copilot` session from the previous exercise, ask:
  ```text
   > Add a docstring to make_customer in @backend/apothecaria/domain/customer_queue.py.
  ```
   You'll likely get **Google-style** ("Args:" / "Returns:") or some other default — whatever the model reaches for when no project rule exists. **Keep this change** — we'll compare it to a second docstring in step 5. Exit the session:
  ```text
   > /exit
  ```

2. **Create `.github/copilot-instructions.md`** by hand:
  ```bash
   mkdir -p .github
   touch .github/copilot-instructions.md
  ```
   Add a **Docstrings** section to it. Don't just paste the template — the model reads the whole file as context, so it needs a framing sentence that names the rule and tells it *when* to apply, plus a few qualifiers underneath. Use this content:

```markdown
## Docstrings

When writing or updating a Python function or method, give it a docstring in this exact format:

    Short one-line summary of what the function does.
    Use this when <when a caller should reach for this>.
    :param <name>: <description>
    :return: <description>

- Use reST `:param:` / `:return:` fields — not Google-style "Args:"/"Returns:".
- Skip `:return:` for functions that return `None`.
- Skip `self` from the parameter list on methods.
```


3. **Confirm the CLI is reading the instructions file.** Start a fresh `copilot` session and ask for `/env`:
  ```text
   > /env
  ```
   `/env` lists the instructions, agents, skills, and MCP servers the session has loaded. You should see `.github/copilot-instructions.md` in the list.  

4. **Ask for a docstring on a *different* function — `pick_next_template` in the same file:**
  ```text
   > Add a docstring to pick_next_template in @backend/apothecaria/domain/customer_queue.py. Follow the project's docstring conventions.
  ```
   Note the prompt does **not** describe the format anywhere — the CLI gets it from `.github/copilot-instructions.md`.  

5. **Compare the two docstrings with `git diff`:**
  ```bash
   git diff backend/apothecaria/domain/customer_queue.py
  ```
   Both docstrings appear in the same diff:
  - `make_customer` — Google-style (`Args:` / `Returns:`), added in step 1 with no instructions
  - `pick_next_template` — reST/Sphinx style (`:param:` / `:return:`), added in step 4 after the instructions file was in place, looking something like:
    ```python
    def pick_next_template(...) -> CustomerTemplate:
        """
        Choose the next customer template to spawn from the active pool.
        Use this when the queue needs a new arrival and you want weighted selection.
        :param ...: ...
        :return: the selected customer template
        """
    ```
   Same repo, same prompt structure — **the only thing that changed between the two is the instructions file**. That's the payoff.

## Done when

- The step-1 docstring (no instructions) and the step-4 docstring (with instructions) use different styles — you saw the before/after difference firsthand in `git diff`
- `.github/copilot-instructions.md` exists (bootstrapped by `/init`, with a Docstrings section added)
- `/env` shows the instructions file is loaded
- The step-4 docstring on `pick_next_template` uses `:param:` and `:return:` (not "Args:"/"Returns:")

## Tip: starting from scratch with `/init`

If you ever drop into a repo that has no instructions file, the fastest way to bootstrap one is:

```bash
copilot
```

```text
> /init
```

The CLI scans the project (languages, frameworks, test runner, layout) and writes a tailored instructions file for you. (Recent versions write to `.github/copilot-instructions.md`; older ones may write `AGENTS.md` at the repo root — either works, but rename to the GH-native path for consistency with this course.) Treat the output as a first draft — edit in your team's rules (like the docstring format above) on top.

You can also start from somebody else's. **[github/awesome-copilot](https://github.com/github/awesome-copilot)** is a curated collection of community-made instruction files for .NET, Angular, Azure, Python, Docker, React, and many more stacks. Copy one in and tweak it for your project.

## References

- [Add repository custom instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions) — official GH Copilot docs
- [About customizing GitHub Copilot](https://docs.github.com/en/copilot/concepts/about-customizing-github-copilot-chat-responses)
- [AGENTS.md — cross-platform open standard](https://agents.md/)
- [github/awesome-copilot — community instruction files](https://github.com/github/awesome-copilot)
- [reST / Sphinx docstring fields](https://www.sphinx-doc.org/en/master/usage/domains/python.html#info-field-lists)
- [PEP 257 — docstring conventions](https://peps.python.org/pep-0257/)

