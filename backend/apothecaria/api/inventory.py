from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from apothecaria.api.deps import get_session
from apothecaria.db.models import Ingredient, PlayerInventory

router = APIRouter()


class IngredientOut(BaseModel):
    slug: str
    name: str
    lore: str
    sprite: str
    quantity: int

    model_config = {"from_attributes": True}


@router.get("/api/inventory", response_model=list[IngredientOut])
def list_inventory(session: Session = Depends(get_session)) -> list[IngredientOut]:
    """Return all ingredients with the player's current quantity of each.

    Use this when rendering the shelf / ingredient picker.
    :param session: DB session injected by FastAPI.
    :return: list of ingredients with quantities.
    """
    rows = session.execute(
        select(Ingredient, PlayerInventory.quantity)
        .outerjoin(PlayerInventory, Ingredient.id == PlayerInventory.ingredient_id)
        .order_by(Ingredient.name)
    ).all()
    return [
        IngredientOut(
            slug=ing.slug,
            name=ing.name,
            lore=ing.lore,
            sprite=ing.sprite,
            quantity=qty if qty is not None else 0,
        )
        for ing, qty in rows
    ]
