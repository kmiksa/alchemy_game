import asyncio

import pytest

from apothecaria.events.broadcaster import Broadcaster


@pytest.mark.asyncio
async def test_publish_delivers_to_subscriber():
    b = Broadcaster()
    q = b.subscribe()
    await b.publish({"type": "hello", "msg": "world"})
    event = await asyncio.wait_for(q.get(), timeout=0.1)
    assert event == {"type": "hello", "msg": "world"}


@pytest.mark.asyncio
async def test_publish_fans_out_to_multiple_subscribers():
    b = Broadcaster()
    q1, q2 = b.subscribe(), b.subscribe()
    await b.publish({"x": 1})
    e1 = await asyncio.wait_for(q1.get(), timeout=0.1)
    e2 = await asyncio.wait_for(q2.get(), timeout=0.1)
    assert e1 == e2 == {"x": 1}


@pytest.mark.asyncio
async def test_unsubscribe_stops_delivery():
    b = Broadcaster()
    q = b.subscribe()
    b.unsubscribe(q)
    await b.publish({"x": 1})
    with pytest.raises(asyncio.TimeoutError):
        await asyncio.wait_for(q.get(), timeout=0.05)


@pytest.mark.asyncio
async def test_publish_with_no_subscribers_is_safe():
    b = Broadcaster()
    await b.publish({"x": 1})
