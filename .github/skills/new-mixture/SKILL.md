---
name: new-mixture
description: >
  Add a new potion/mixture recipe to the Apothecaria game — handles content JSON,
  test updates, database re-seeding, and opening a PR. Use this skill whenever the
  user wants to add a new recipe, potion, mixture, brew, elixir, tonic, or draught
  to the game, even if they don't say "recipe" explicitly. Also use it when someone
  says things like "create a new potion", "I have an idea for a brew", or "add
  fog_veil to the game".
---

# New Mixture Playbook

Adding a recipe to Apothecaria is a content-only change — the generic brewing, API,
and seed machinery already handles any recipe that appears in `recipes.json`. The work
is: write the JSON entry, make sure the tests reflect the new count, add a brew-match
test, re-seed, verify, and ship.

## Required inputs

Gather these from the user before starting. If any are missing, ask — don't guess.

| Input              | Example                          | Notes |
|--------------------|----------------------------------|-------|
| `slug`             | `fog_veil`                       | snake_case, unique across recipes |
| `name`             | `Fog Veil`                       | Display name |
| `ailment_category` | `confusion`                      | Must be a known category or a new one the user intends to add |
| `ingredients`      | `["moonpetal", "sage", "feather"]` | Each ingredient slug must already exist in `ingredients.json` |
| `lore`             | `"A swirling silver draught…"`   | One-sentence flavour text |

A `sprite` field is also required in the JSON but defaults to `<slug>.png` — the
image itself can be a placeholder.

## Step-by-step workflow

### 1. Validate ingredients

Read `backend/apothecaria/content/ingredients.json` and confirm every slug in the
user's `ingredients` list exists. If any are missing, stop and tell the user — they
need to add the ingredient first (that's a separate task).

### 2. Check for duplicate slug

Read `backend/apothecaria/content/recipes.json` and confirm the new slug doesn't
collide with an existing recipe. Also confirm no existing recipe uses the exact same
ingredient set (order-independent).

### 3. Add the recipe to `recipes.json`

Append a new object to `backend/apothecaria/content/recipes.json`:

```json
{
  "slug": "<slug>",
  "name": "<name>",
  "ailment_category": "<ailment_category>",
  "lore": "<lore>",
  "ingredients": ["<ing1>", "<ing2>", ...],
  "sprite": "<slug>.png"
}
```

Follow the existing formatting — one object per line, consistent key order
(`slug`, `name`, `ailment_category`, `lore`, `ingredients`, `sprite`).

### 4. Add a placeholder sprite

Create an empty (or placeholder) file at:

```
frontend/public/sprites/potions/<slug>.png
```

If `frontend/public/sprites/potions/ATTRIBUTION.md` exists, add a line noting the
placeholder (e.g., `- \`<slug>.png\` — placeholder, to be replaced with final art`).

### 5. Update test counts and slug sets

Three test files reference recipe counts and slug sets. After adding a recipe the
numbers go up by one and the slug set gains the new entry.

#### `backend/tests/test_seed.py`

In `test_seed_is_idempotent_no_duplicates`, update the expected recipe count:

```python
assert len(session.scalars(select(Recipe)).all()) == <OLD + 1>
```

#### `backend/tests/test_api_recipes.py`

- Update the `len(data) ==` assertion to `<OLD + 1>`.
- Add `"<slug>"` to the expected slug set.
- If the test function name embeds the count (e.g., `test_recipes_returns_five`),
  rename it to reflect the new count.

### 6. Add a brew-match test

In `backend/tests/test_brewing.py`, add a test that verifies the new recipe brews
correctly:

```python
def test_<slug>_exact_match(seeded_session):
    result = combine_ingredients(<ingredients list>, seeded_session)
    assert result.matched_recipe_slug == "<slug>"
    assert result.matched_recipe_name == "<name>"
    assert result.matched_ailment_category == "<ailment_category>"
    assert result.quality_score == 1.0
```

### 7. Re-seed and run tests

```bash
make seed    # upsert new recipe into SQLite
make test    # all tests must pass
```

If tests fail, fix the issue and re-run. Common gotchas:
- Off-by-one in recipe count assertions.
- Ingredient slug typo (case-sensitive, hyphenated like `eye-of-newt`).
- Duplicate ingredient set matching an existing recipe.

### 8. Commit and open a PR

Create a branch, commit, and open a PR:

```bash
git checkout -b add-<slug>-recipe
git add -A
git commit -m "feat(content): add <name> recipe

- Add <slug> to recipes.json (<ailment_category>)
- Update test counts and slug sets
- Add brew-match test

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
git push -u origin add-<slug>-recipe
gh pr create --title "Add <name> recipe" \
  --body "Adds the **<name>** recipe (slug: \`<slug>\`, category: \`<ailment_category>\`).

Ingredients: $(echo '<ingredients>' | tr ',' ', ')

Lore: *<lore>*

## Checklist
- [x] Recipe added to \`recipes.json\`
- [x] Placeholder sprite created
- [x] Test counts updated
- [x] Brew-match test added
- [x] \`make seed\` ✓
- [x] \`make test\` ✓"
```

## Notes

- No API, domain, DB-schema, or seed-logic code changes are needed — the existing
  generic machinery handles everything.
- If no customer has the new `ailment_category` yet, mention that in the PR as a
  natural follow-up task.
- The frontend fetches recipes dynamically, so no frontend code changes are needed
  beyond the sprite.
