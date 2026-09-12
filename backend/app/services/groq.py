import json
from collections.abc import AsyncIterator

import httpx

from app.core.config import Settings
from app.models.chat import ChatMessage


class GroqServiceError(Exception):
    def __init__(self, message: str, status_code: int = 502) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class GroqService:
    def __init__(self, settings: Settings, client: httpx.AsyncClient | None = None) -> None:
        self.settings = settings
        self._client = client

    async def stream_chat(self, messages: list[ChatMessage]) -> AsyncIterator[str]:
        if not self.settings.groq_api_key:
            raise GroqServiceError(
                "На сервере не настроен GROQ_API_KEY. Добавьте ключ в backend/.env.",
                status_code=503,
            )

        payload = {
            "model": self.settings.groq_model,
            "messages": [message.model_dump() for message in messages],
            "stream": True,
            "temperature": 0.7,
        }
        headers = {
            "Authorization": f"Bearer {self.settings.groq_api_key}",
            "Content-Type": "application/json",
        }

        owns_client = self._client is None
        client = self._client or httpx.AsyncClient(timeout=httpx.Timeout(60, connect=10))

        try:
            async with client.stream(
                "POST",
                f"{self.settings.groq_base_url}/chat/completions",
                headers=headers,
                json=payload,
            ) as response:
                if response.status_code != 200:
                    body = await response.aread()
                    self._raise_provider_error(response.status_code, body)

                async for line in response.aiter_lines():
                    if not line.startswith("data:"):
                        continue
                    data = line.removeprefix("data:").strip()
                    if data == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data)
                        content = chunk["choices"][0]["delta"].get("content")
                    except (json.JSONDecodeError, KeyError, IndexError, TypeError):
                        continue
                    if content:
                        yield content
        except httpx.TimeoutException as exc:
            raise GroqServiceError("Groq не успел ответить. Попробуйте ещё раз.", 504) from exc
        except httpx.RequestError as exc:
            raise GroqServiceError("Не удалось подключиться к Groq.", 502) from exc
        finally:
            if owns_client:
                await client.aclose()

    @staticmethod
    def _raise_provider_error(status_code: int, body: bytes) -> None:
        if status_code == 429:
            raise GroqServiceError(
                "Бесплатный лимит Groq исчерпан. Подождите и повторите запрос.", 429
            )
        if status_code in {401, 403}:
            raise GroqServiceError("Groq отклонил API-ключ. Проверьте GROQ_API_KEY.", 502)

        detail = ""
        try:
            parsed = json.loads(body)
            detail = parsed.get("error", {}).get("message", "")
        except (json.JSONDecodeError, AttributeError):
            pass
        message = "Groq вернул ошибку."
        if detail:
            message = f"{message} {detail}"
        raise GroqServiceError(message, 502)
