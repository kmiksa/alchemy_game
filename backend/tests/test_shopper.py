import os
from typing import Any


def _import_agent() -> Any:
    """Import the shopper agent, with a placeholder token if none is set.

    ``shopper.py`` raises at import time when ``GITHUB_API_KEY`` is unset, so it
    fails fast for a real run. These tests never make a real model call — they
    override the model with ``TestModel`` — so a placeholder token is enough to
    let the module import. ``setdefault`` leaves a real token in place if the
    developer happens to have one exported.
    """
    os.environ.setdefault("GITHUB_API_KEY", "test-token-not-used")
    from apothecaria.agents.shopper import agent

    return agent


def test_agent_registers_the_four_store_tools():
    agent = _import_agent()
    # _function_toolset is a private accessor — this smoke test deliberately
    # peeks at the tool registry; a pydantic-ai upgrade breaking it is
    # expected fragility, not a mystery.
    names = set(agent._function_toolset.tools.keys())
    assert names == {"list_store", "get_balance", "list_inventory", "buy_ingredient"}


async def test_agent_runs_offline_with_a_test_model(monkeypatch):
    from pydantic_ai.models.test import TestModel

    from apothecaria.config import settings

    # Point the tools at a dead address so the run is genuinely offline: no
    # real LLM (TestModel stands in) and no backend (the tools catch the
    # connection error and return their friendly fallback string).
    monkeypatch.setattr(settings, "api_base_url", "http://localhost:1")
    agent = _import_agent()
    with agent.override(model=TestModel()):
        result = await agent.run("hello")
    assert isinstance(result.output, str)
