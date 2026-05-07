from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from apothecaria.api.deps import get_customer_store, get_session
from apothecaria.domain.brewing import combine_ingredients
from apothecaria.domain.customer_queue import (
    CustomerStore,
    make_customer,
    pick_next_template,
)
from apothecaria.domain.models import CustomerInstance
from apothecaria.domain.reputation import apply_outcome

router = APIRouter()


class CustomerOut(BaseModel):
    id: str
    name: str
    persona: str
    ailment_narrative: str
    ailment_category: str
    expected_recipe_slug: str


class ServeBody(BaseModel):
    ingredient_slugs: list[str]


class ServeOut(BaseModel):
    outcome: str
    reputation_delta: int
    new_reputation: int
    customer_response: str


def _to_out(customer: CustomerInstance) -> CustomerOut:
    return CustomerOut(
        id=customer.id,
        name=customer.name,
        persona=customer.persona,
        ailment_narrative=customer.ailment_narrative,
        ailment_category=customer.ailment_category,
        expected_recipe_slug=customer.expected_recipe_slug,
    )


@router.post(
    "/api/customers/spawn",
    response_model=CustomerOut,
    status_code=status.HTTP_201_CREATED,
)
def spawn(store: CustomerStore = Depends(get_customer_store)) -> CustomerOut:
    template = pick_next_template()
    customer = make_customer(template)
    store.add(customer)
    return _to_out(customer)


@router.get("/api/customers/next", response_model=None)
def next_customer(
    store: CustomerStore = Depends(get_customer_store),
) -> CustomerOut | Response:
    customer = store.get_oldest()
    if customer is None:
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    return _to_out(customer)


@router.post("/api/customers/{customer_id}/serve", response_model=ServeOut)
def serve(
    customer_id: str,
    body: ServeBody,
    session: Session = Depends(get_session),
    store: CustomerStore = Depends(get_customer_store),
) -> ServeOut:
    customer = store.get(customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="customer not found")

    brew = combine_ingredients(body.ingredient_slugs, session)
    result = apply_outcome(brew, customer, session)
    store.remove(customer_id)

    return ServeOut(
        outcome=result.outcome.value,
        reputation_delta=result.reputation_delta,
        new_reputation=result.new_reputation,
        customer_response=result.customer_response,
    )
