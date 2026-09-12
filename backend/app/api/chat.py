import asyncio
import json
from collections.abc import AsyncIterator, Callable

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse

from app.core.config import Settings, get_settings
from app.models.chat import ChatRequest, StreamEvent
from app.services.groq import GroqService, GroqServiceError

router = APIRouter(prefix="/chat", tags=["chat"])


def get_groq_service(settings: Settings = Depends(get_settings)) -> GroqService:
    return GroqService(settings)


def encode_sse(event: StreamEvent) -> str:
    return f"event: {event.type}\ndata: {event.model_dump_json()}\n\n"


@router.post("")
async def chat(
    payload: ChatRequest,
    request: Request,
    service: GroqService = Depends(get_groq_service),
) -> StreamingResponse:
    async def event_stream() -> AsyncIterator[str]:
        try:
            async for token in service.stream_chat(payload.messages):
                if await request.is_disconnected():
                    return
                yield encode_sse(StreamEvent(type="delta", content=token))
            yield encode_sse(StreamEvent(type="done"))
        except asyncio.CancelledError:
            raise
        except GroqServiceError as exc:
            yield encode_sse(StreamEvent(type="error", content=exc.message))
        except Exception:
            yield encode_sse(
                StreamEvent(type="error", content="Внутренняя ошибка сервера.")
            )

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
