from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from apothecaria.events.broadcaster import broadcaster

router = APIRouter()


@router.websocket("/ws/events")
async def ws_events(ws: WebSocket) -> None:
    await ws.accept()
    queue = broadcaster.subscribe()
    try:
        while True:
            event = await queue.get()
            await ws.send_json(event)
    except WebSocketDisconnect:
        pass
    finally:
        broadcaster.unsubscribe(queue)
