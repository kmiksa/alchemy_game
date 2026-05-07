from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class IngredientSeed(BaseModel):
    """Schema for one row in content/ingredients.json."""

    slug: str = Field(min_length=1)
    name: str = Field(min_length=1)
    lore: str = ""
    asset_path: str = ""


class RecipeSeed(BaseModel):
    """Schema for one row in content/recipes.json."""

    slug: str = Field(min_length=1)
    name: str = Field(min_length=1)
    ailment_category: str = Field(min_length=1)
    lore: str = ""
    ingredients: list[str] = Field(min_length=1)


class CustomerTemplate(BaseModel):
    """One customer archetype loaded from content/customers.json."""

    slug: str
    name: str
    persona: str
    ailment_narrative: str
    ailment_category: str
    expected_recipe_slug: str
    patience_seconds: int = 60


class CustomerInstance(BaseModel):
    """A live customer in the in-memory store. Ephemeral — no DB persistence."""

    id: str
    template_slug: str
    name: str
    persona: str
    ailment_narrative: str
    ailment_category: str
    expected_recipe_slug: str
    arrived_at: datetime


class BrewResult(BaseModel):
    matched_recipe_slug: str | None
    matched_recipe_name: str | None
    matched_ailment_category: str | None
    quality_score: float = Field(ge=0.0, le=1.0)
    ingredient_slugs: list[str]
    description: str


class Outcome(StrEnum):
    DELIGHTED = "delighted"
    NEUTRAL = "neutral"
    DISAPPOINTED = "disappointed"
    CONFUSED = "confused"


class ServiceResult(BaseModel):
    outcome: Outcome
    reputation_delta: int
    new_reputation: int
    customer_response: str
