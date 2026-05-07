from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from apothecaria.api.deps import get_session
from apothecaria.domain.brewing import combine_ingredients
from apothecaria.domain.models import BrewResult

router = APIRouter()


class BrewBody(BaseModel):
    ingredient_slugs: list[str]


@router.post("/api/brew", response_model=BrewResult)
def brew(body: BrewBody, session: Session = Depends(get_session)) -> BrewResult:
    if not body.ingredient_slugs:
        raise HTTPException(status_code=400, detail="ingredient_slugs must not be empty")
    return combine_ingredients(body.ingredient_slugs, session)
