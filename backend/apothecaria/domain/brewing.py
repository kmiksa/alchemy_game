from __future__ import annotations

from collections import Counter

from sqlalchemy import select
from sqlalchemy.orm import Session

from apothecaria.db.models import Ingredient, PlayerInventory, Recipe
from apothecaria.domain.models import BrewResult


def combine_ingredients(ingredient_slugs: list[str], session: Session) -> BrewResult:
    """Match ingredient slugs against known recipes and return a brew result.

    Use this when the player brews or serves a potion.
    :param ingredient_slugs: slugs the player placed in the cauldron.
    :param session: active SQLAlchemy session.
    :return: brew result with match info and description.
    """
    if not ingredient_slugs:
        return BrewResult(
            matched_recipe_slug=None,
            matched_recipe_name=None,
            matched_ailment_category=None,
            quality_score=0.0,
            ingredient_slugs=[],
            description="An empty cauldron sits cold.",
        )

    requested = list(ingredient_slugs)
    requested_set = set(requested)

    known = {
        i.slug
        for i in session.scalars(select(Ingredient).where(Ingredient.slug.in_(requested))).all()
    }
    unknown = requested_set - known
    if unknown:
        return BrewResult(
            matched_recipe_slug=None,
            matched_recipe_name=None,
            matched_ailment_category=None,
            quality_score=0.0,
            ingredient_slugs=requested,
            description=f"The cauldron sputters at unknown ingredients: {sorted(unknown)}.",
        )

    # Check player has enough of each ingredient
    slug_counts = Counter(requested)
    inventory_rows = {
        pi.ingredient.slug: pi
        for pi in session.scalars(
            select(PlayerInventory).join(Ingredient).where(Ingredient.slug.in_(requested))
        ).all()
    }
    insufficient = [
        slug
        for slug, needed in slug_counts.items()
        if slug not in inventory_rows or inventory_rows[slug].quantity < needed
    ]
    if insufficient:
        names = sorted(insufficient)
        return BrewResult(
            matched_recipe_slug=None,
            matched_recipe_name=None,
            matched_ailment_category=None,
            quality_score=0.0,
            ingredient_slugs=requested,
            description=f"Not enough ingredients: {names}. Visit the store to stock up!",
        )

    # Decrement quantities
    for slug, needed in slug_counts.items():
        inventory_rows[slug].quantity -= needed
    session.flush()

    for recipe in session.scalars(select(Recipe)).all():
        recipe_slugs = {link.ingredient.slug for link in recipe.ingredient_links}
        if recipe_slugs == requested_set and len(requested) == len(recipe_slugs):
            return BrewResult(
                matched_recipe_slug=recipe.slug,
                matched_recipe_name=recipe.name,
                matched_ailment_category=recipe.ailment_category,
                quality_score=1.0,
                ingredient_slugs=requested,
                description=f"The brew settles into a perfect {recipe.name.lower()}.",
            )

    return BrewResult(
        matched_recipe_slug=None,
        matched_recipe_name=None,
        matched_ailment_category=None,
        quality_score=0.0,
        ingredient_slugs=requested,
        description="The cauldron belches a foul-smelling cloud — an unknown brew.",
    )
