from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from apothecaria.api.deps import get_session
from apothecaria.db.models import Recipe

router = APIRouter()


class RecipeOut(BaseModel):
    slug: str
    name: str
    ailment_category: str
    lore: str
    sprite: str
    ingredient_slugs: list[str]


@router.get("/api/recipes", response_model=list[RecipeOut])
def list_recipes(session: Session = Depends(get_session)) -> list[RecipeOut]:
    rows = session.scalars(select(Recipe).order_by(Recipe.name)).all()
    return [
        RecipeOut(
            slug=r.slug,
            name=r.name,
            ailment_category=r.ailment_category,
            lore=r.lore,
            sprite=r.sprite,
            ingredient_slugs=[link.ingredient.slug for link in r.ingredient_links],
        )
        for r in rows
    ]
