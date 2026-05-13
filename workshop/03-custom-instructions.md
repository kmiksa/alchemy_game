# 03 — Custom Instructions (AGENTS.md)

**Goal:** Add a project-level instructions file so Copilot CLI follows your conventions automatically — then watch it apply a custom docstring format to a real function in this repo.

## Concepts

- **What instructions are for** — instructions provide context on *how* Copilot should generate code: the things it should be considering as it modifies and updates the codebase (style, naming, error handling, docstring format, security rules, what *not* to touch, etc.).
- **Project-level instructions** are markdown files Copilot CLI reads automatically at the start of every session. You write rules once; every prompt afterwards inherits them.
- **`AGENTS.md`** is the recommended format — an [open standard](https://agents.md/) shared across Copilot, Claude Code, and other AI coding tools. Place it at the repo root.
  - Alternatives: `.github/copilot-instructions.md` (Copilot-specific) or topic files under `.github/instructions/`.
- **`/init`** asks the CLI to scan your repo and generate a starter `AGENTS.md` for you. You then edit it.
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

Run from the `alchemy_game` repo root.

1. **Create `AGENTS.md`** at the repo root with the docstring rule. Either let the CLI generate a starter:

   ```bash
   copilot
   ```

   ```text
   > /init
   ```

   …and then edit the generated `AGENTS.md`. Or skip `/init` and write the file by hand. Either way, make sure it contains a **Docstrings** section:

   ```markdown
   ## Docstrings

   All Python functions and methods get a docstring in this format:

       Short one-line summary of what the function does.
       Use this when <when a caller should reach for this>.
       :param <name>: <description>
       :return: <description>

   - Use reST `:param:` / `:return:` fields — not Google-style "Args:"/"Returns:".
   - Skip `:return:` for functions that return `None`.
   - Skip `self` from the parameter list on methods.
   ```

2. **Confirm the CLI is reading it.** In a fresh session:

   ```bash
   copilot
   ```

   ```text
   > /env
   ```

   `/env` lists the instructions, agents, skills, and MCP servers the session has loaded. You should see `AGENTS.md` in the list.

3. **Pick a function to document.** A good candidate is `make_customer` in `backend/apothecaria/domain/customer_queue.py` — it takes a template and returns a customer instance, and has no docstring yet.

4. **Ask for the docstring:**

   ```text
   > Add a docstring to make_customer in @backend/apothecaria/domain/customer_queue.py. Follow the project's docstring conventions.
   ```

   Note the prompt does **not** describe the format — the CLI gets the format from `AGENTS.md`.

5. **Inspect the change:**

   ```text
   > /diff
   ```

   You should see something like:

   ```python
   def make_customer(template: CustomerTemplate) -> CustomerInstance:
       """
       Build a fresh CustomerInstance from a template definition.
       Use this when spawning a new customer to enter the apothecary queue.
       :param template: customer template loaded from seed content
       :return: customer instance with a unique id and arrival timestamp
       """
   ```

6. **Try a second function** to verify the format sticks across prompts (this is where the instruction file pays off — no need to restate the rule):

   ```text
   > Add a docstring to pick_next_template in the same file.
   > /diff
   ```

## Done when

- [ ] `AGENTS.md` exists at the repo root with a Docstrings section
- [ ] `/env` shows `AGENTS.md` is loaded
- [ ] The generated docstring on `make_customer` uses `:param:` and `:return:` (not "Args:"/"Returns:")
- [ ] A second docstring on a different function follows the same format without you re-typing the rule

## Tip: starting from scratch with `/init`

If you ever drop into a repo that has no instructions file, the fastest way to bootstrap one is:

```bash
copilot
```

```text
> /init
```

The CLI scans the project (languages, frameworks, test runner, layout) and writes a tailored `AGENTS.md` for you. Treat the output as a first draft — edit in your team's rules (like the docstring format above) on top.

You can also start from somebody else's. **[github/awesome-copilot](https://github.com/github/awesome-copilot)** is a curated collection of community-made instruction files for .NET, Angular, Azure, Python, Docker, React, and many more stacks. Copy one in and tweak it for your project.

## References

- [AGENTS.md — open standard](https://agents.md/)
- [Custom agents configuration](https://docs.github.com/en/copilot/reference/custom-agents-configuration)
- [github/awesome-copilot — community instruction files](https://github.com/github/awesome-copilot)
- [reST / Sphinx docstring fields](https://www.sphinx-doc.org/en/master/usage/domains/python.html#info-field-lists)
- [PEP 257 — docstring conventions](https://peps.python.org/pep-0257/)
