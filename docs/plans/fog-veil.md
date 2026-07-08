# Plan: Add Fog Veil Recipe

## Goal

Add a new mixture called **Fog Veil** to the apothecary so that it:

- Appears in `GET /api/recipes` with its three ingredients
- Can be brewed via `POST /api/brew`
- Survives a server restart (persisted via seed)

## Recipe details

| Field              | Value                                |
|--------------------|--------------------------------------|
| `slug`             | `fog_veil`                           |
| `name`             | `Fog Veil`                           |
| `ailment_category` | `confusion`                          |
| `ingredients`      | `moonpetal`, `sage`, `feather`       |
| `lore`             | A pale, drifting brew that gently unravels a tangled mind. |

## Files to touch

1. **`backend/apothecaria/content/recipes.json`** — append the new recipe entry.
2. **`backend/tests/test_api_recipes.py`** — add assertions that Fog Veil appears in the recipes list with the correct three ingredients and ailment category.

## Steps

- [ ] Add the Fog Veil entry to `recipes.json`.
- [ ] Update `test_api_recipes.py` to assert Fog Veil appears with its three ingredients.
- [ ] Run `make seed` to load the new recipe into the database.
- [ ] Run `make test` to confirm all tests pass.
