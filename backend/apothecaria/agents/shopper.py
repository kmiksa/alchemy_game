"""Apothecaria shopping agent.

A pydantic-ai agent — the apothecary's shopping apprentice — that browses the
store and buys ingredients for the alchemist.

Unlike the exercise 11 MCP server, this agent carries its own model, its own
persona, and its own reasoning loop. It is a complete program: call it with
``agent.run(goal)`` and it does the rest. The four tools are thin HTTP calls to
the running Apothecaria backend — the same ``/api/store`` API the MCP server
uses. Only the container differs.
"""

import os

import httpx
from dotenv import load_dotenv
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.github import GitHubProvider

from apothecaria.config import settings

# GITHUB_API_KEY has no APOTHECARIA_ prefix, so it is read straight from the
# environment; load_dotenv() makes a .env entry visible to os.getenv below.
load_dotenv()

MODEL_NAME = "openai/gpt-4o"

_GITHUB_API_KEY = os.getenv("GITHUB_API_KEY")
if not _GITHUB_API_KEY:
    raise RuntimeError(
        "GITHUB_API_KEY is not set. The exercise 12 agent uses GitHub Models as "
        "its LLM — create a token and put it in .env. "
        "See workshop/12-pydantic-ai-agent.md."
    )

model = OpenAIChatModel(MODEL_NAME, provider=GitHubProvider(api_key=_GITHUB_API_KEY))

agent = Agent(
    model,
    name="shopper",
    output_type=str,
    system_prompt=(
        "You are the apothecary's shopping apprentice — a warm, thrifty helper "
        "who runs to the store for the alchemist, I am the alchemist You look after  "
        "my coin as if it were your own.\n\n"
        "How you work:\n"
        "- Before buying anything, check what the store sells and what the "
        "alchemist can afford. Use list_store, get_balance, and list_inventory "
        "to ground every decision in real numbers — never guess prices or "
        "stock.\n"
        "- Buy with buy_ingredient only after you have checked. Spend within "
        "the alchemist's means; if a request would overspend, buy what you "
        "sensibly can and explain what you skipped and why.\n"
        '- When a goal is vague ("stock me up for healing potions"), make one '
        "sensible shopping plan, act on it, then summarise what you bought, "
        "what it cost, and the balance left.\n"
        "- If a tool reports an error, read it, adjust, and tell the alchemist "
        "plainly what happened.\n\n"
        "Keep replies short and friendly, like a quick word across the shop "
        "counter."
    ),
)

_BACKEND_DOWN = (
    "The apothecary backend isn't reachable. Start it with `make backend-dev` and try again."
)


def _client() -> httpx.AsyncClient:
    """Open an HTTP client pointed at the Apothecaria backend."""
    return httpx.AsyncClient(base_url=settings.api_base_url, timeout=10.0)


@agent.tool_plain
async def list_store() -> str:
    """List every ingredient the apothecary store sells, with its price and stock.

    Call this before buying so you know the valid ingredient slugs, their
    prices in $, and how many units are in stock.
    """
    try:
        async with _client() as http:
            response = await http.get("/api/store")
    except httpx.HTTPError:
        return _BACKEND_DOWN
    items = response.json()
    if not items:
        return "The store has nothing for sale."
    lines = [
        f"- {item['slug']} ({item['name']}): ${item['price']} each, {item['stock']} in stock"
        for item in items
    ]
    return "The apothecary store sells:\n" + "\n".join(lines)


@agent.tool_plain
async def get_balance() -> str:
    """Report how much money ($) the alchemist currently has to spend."""
    try:
        async with _client() as http:
            response = await http.get("/api/player")
    except httpx.HTTPError:
        return _BACKEND_DOWN
    return f"The alchemist has ${response.json()['money']}."


@agent.tool_plain
async def list_inventory() -> str:
    """List the ingredients the alchemist already owns and how many of each."""
    try:
        async with _client() as http:
            response = await http.get("/api/inventory")
    except httpx.HTTPError:
        return _BACKEND_DOWN
    owned = [
        f"{item['quantity']} × {item['name']}" for item in response.json() if item["quantity"] > 0
    ]
    if not owned:
        return "The alchemist owns no ingredients yet."
    return "The alchemist owns: " + ", ".join(owned)


@agent.tool_plain
async def buy_ingredient(ingredient_slug: str, quantity: int) -> str:
    """Buy a quantity of an ingredient from the apothecary store.

    Spends the alchemist's money and adds the ingredient to their inventory.
    ``ingredient_slug`` must be a slug from ``list_store`` (for example
    "moonpetal"); ``quantity`` is how many units to buy.
    """
    try:
        async with _client() as http:
            response = await http.post(
                "/api/store/buy",
                json={"ingredient_slug": ingredient_slug, "quantity": quantity},
            )
    except httpx.HTTPError:
        return _BACKEND_DOWN
    if response.is_success:
        return str(response.json()["message"])
    detail = response.json().get("detail", response.text)
    return f"Could not buy {quantity} {ingredient_slug}: {detail}"
