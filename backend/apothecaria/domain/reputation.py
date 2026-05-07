from __future__ import annotations

import json

from sqlalchemy.orm import Session

from apothecaria.db.models import BrewHistory, PlayerState
from apothecaria.domain.models import BrewResult, CustomerInstance, Outcome, ServiceResult


def determine_outcome(brew: BrewResult, customer: CustomerInstance) -> tuple[Outcome, int, str]:
    """Pure function: outcome + reputation delta + customer response. No side effects."""
    if brew.matched_recipe_slug == customer.expected_recipe_slug:
        return (
            Outcome.DELIGHTED,
            10,
            f"{customer.name} beams: 'Yes — exactly what I needed. Thank you.'",
        )
    if brew.matched_recipe_slug is not None:
        if brew.matched_ailment_category == customer.ailment_category:
            return (
                Outcome.NEUTRAL,
                1,
                f"{customer.name} accepts the bottle: "
                "'Not quite what I expected, but I suppose it'll do.'",
            )
        return (
            Outcome.DISAPPOINTED,
            -5,
            f"{customer.name} pushes the bottle back: 'This is not what I asked for.'",
        )
    return (
        Outcome.CONFUSED,
        -2,
        f"{customer.name} sniffs the cloudy mixture, frowns, and shuffles out.",
    )


def apply_outcome(brew: BrewResult, customer: CustomerInstance, session: Session) -> ServiceResult:
    """Compute outcome, update PlayerState, append a BrewHistory row."""
    outcome, delta, response = determine_outcome(brew, customer)

    state = session.get(PlayerState, 1)
    if state is None:
        state = PlayerState(id=1, reputation=0, brews_count=0)
        session.add(state)
        session.flush()
    state.reputation += delta
    state.brews_count += 1

    session.add(
        BrewHistory(
            ingredient_slugs=json.dumps(brew.ingredient_slugs),
            matched_recipe_slug=brew.matched_recipe_slug,
            quality_score=brew.quality_score,
            customer_id=customer.id,
            customer_name=customer.name,
            customer_ailment_category=customer.ailment_category,
            expected_recipe_slug=customer.expected_recipe_slug,
            outcome=outcome.value,
            reputation_delta=delta,
        )
    )
    session.flush()

    return ServiceResult(
        outcome=outcome,
        reputation_delta=delta,
        new_reputation=state.reputation,
        customer_response=response,
    )
