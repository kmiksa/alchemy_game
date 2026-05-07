import asyncio
import contextlib

import pytest


def test_ws_endpoint_accepts_connection(client):
    """Smoke test: the WS endpoint exists and the upgrade succeeds.

    A full publish-receive integration is awkward to test through Starlette's
    sync TestClient (the module-level broadcaster lives in a different event
    loop). The publish path is covered by the broadcaster unit tests; the
    arrival_loop publishing is covered below.
    """
    with client.websocket_connect("/ws/events") as ws:
        ws.close()


@pytest.mark.asyncio
async def test_arrival_loop_publishes_customer_arrived_event():
    """Drive the arrival loop directly and assert it publishes the right event."""
    from apothecaria.domain.customer_queue import CustomerStore, arrival_loop
    from apothecaria.events.broadcaster import Broadcaster

    store = CustomerStore()
    local_broadcaster = Broadcaster()
    queue = local_broadcaster.subscribe()

    async def on_arrival(customer) -> None:
        await local_broadcaster.publish(
            {
                "type": "customer.arrived",
                "id": customer.id,
                "name": customer.name,
            }
        )

    task = asyncio.create_task(
        arrival_loop(interval_seconds=0.05, store=store, on_arrival=on_arrival)
    )
    try:
        event = await asyncio.wait_for(queue.get(), timeout=1.0)
        assert event["type"] == "customer.arrived"
        assert "id" in event and "name" in event
        assert store.size() >= 1
    finally:
        task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await task
