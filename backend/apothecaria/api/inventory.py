from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from apothecaria.api.deps import get_session
from apothecaria.db.models import Ingredient

router = APIRouter()


class IngredientOut(BaseModel):
    slug: str
    name: str
    lore: str
    asset_path: str

    model_config = {"from_attributes": True}


@router.get("/api/inventory", response_model=list[IngredientOut])
def list_inventory(session: Session = Depends(get_session)) -> list[IngredientOut]:
    rows = session.scalars(select(Ingredient).order_by(Ingredient.name)).all()
    return [IngredientOut.model_validate(r) for r in rows]
