import asyncio
from collections.abc import AsyncIterator

from fastapi.testclient import TestClient

from app.api.chat import get_groq_service
from app.main import app
from app.services.groq import GroqService, GroqServiceError
from app.core.config import Settings


class FakeGroqService:
    async def stream_chat(self, _messages: list[object]) -> AsyncIterator[str]:
        yield "Привет"
        yield "!"


class FailingGroqService:
    async def stream_chat(self, _messages: list[object]) -> AsyncIterator[str]:
        raise GroqServiceError("Лимит исчерпан", 429)
        yield ""  # pragma: no cover


def test_health() -> None:
    response = TestClient(app).get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_chat_stream() -> None:
    app.dependency_overrides[get_groq_service] = lambda: FakeGroqService()
    try:
        response = TestClient(app).post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": "Привет"}]},
        )
        assert response.status_code == 200
        assert '"type":"delta","content":"Привет"' in response.text
        assert '"type":"done"' in response.text
    finally:
        app.dependency_overrides.clear()


def test_provider_error_is_sent_inside_stream() -> None:
    app.dependency_overrides[get_groq_service] = lambda: FailingGroqService()
    try:
        response = TestClient(app).post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": "Привет"}]},
        )
        assert '"type":"error","content":"Лимит исчерпан"' in response.text
    finally:
        app.dependency_overrides.clear()


def test_empty_messages_are_rejected() -> None:
    response = TestClient(app).post("/api/chat", json={"messages": []})
    assert response.status_code == 422


def test_last_message_must_be_user() -> None:
    response = TestClient(app).post(
        "/api/chat",
        json={"messages": [{"role": "assistant", "content": "Ответ"}]},
    )
    assert response.status_code == 422


def test_missing_api_key_has_clear_message() -> None:
    service = GroqService(Settings(groq_api_key=""))

    async def read_first_event() -> None:
        async for _ in service.stream_chat([]):
            pass

    try:
        asyncio.run(read_first_event())
        raise AssertionError("Ожидалась ошибка конфигурации")
    except GroqServiceError as error:
        assert error.status_code == 503
        assert "GROQ_API_KEY" in error.message


def test_rate_limit_is_translated() -> None:
    try:
        GroqService._raise_provider_error(429, b"{}")
        raise AssertionError("Ожидалась ошибка лимита")
    except GroqServiceError as error:
        assert error.status_code == 429
        assert "лимит Groq" in error.message
