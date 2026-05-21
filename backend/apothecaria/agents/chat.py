"""Chainlit chat UI for the exercise 12 shopping agent.

A thin shell around ``agent.run()``. Chainlit gives a browser chat with
collapsible tool-call steps; the agent itself — model, persona, tools — lives in
``shopper.py``. The agent would run the same from a script or a cron job; this
UI is just one face on it. Run it with ``make agent``.
"""

import chainlit as cl
from pydantic_ai.messages import (
    ModelMessage,
    ModelRequest,
    ModelResponse,
    ToolCallPart,
    ToolReturnPart,
)

from apothecaria.agents.shopper import agent

_GREETING = (
    "I'm the apothecary's shopping apprentice. Tell me what you need — "
    '"what can I afford?" or "stock me up for healing potions" — and I\'ll '
    "visit the store for you. (Make sure the backend is running.)"
)


@cl.on_chat_start
async def on_chat_start() -> None:
    """Greet the alchemist and start an empty conversation history."""
    cl.user_session.set("history", [])
    await cl.Message(content=_GREETING).send()


async def _render_tool_steps(messages: list[ModelMessage]) -> None:
    """Show each tool call from this turn as a collapsible Chainlit step."""
    returns = {
        part.tool_call_id: part
        for message in messages
        if isinstance(message, ModelRequest)
        for part in message.parts
        if isinstance(part, ToolReturnPart)
    }
    for message in messages:
        if not isinstance(message, ModelResponse):
            continue
        for part in message.parts:
            if not isinstance(part, ToolCallPart):
                continue
            async with cl.Step(name=part.tool_name, type="tool") as step:
                step.input = part.args
                returned = returns.get(part.tool_call_id)
                step.output = returned.content if returned else ""


@cl.on_message
async def on_message(message: cl.Message) -> None:
    """Run the agent on the user's message; show its tool calls, then its reply."""
    history = cl.user_session.get("history") or []
    try:
        result = await agent.run(message.content, message_history=history)
    except Exception as exc:
        await cl.Message(content=f"The agent hit an error: {exc}").send()
        return
    cl.user_session.set("history", result.all_messages())
    await _render_tool_steps(result.new_messages())
    await cl.Message(content=result.output).send()
