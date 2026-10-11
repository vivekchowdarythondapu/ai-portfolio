"""LLM provider abstraction — Gemini (free tier) and OpenAI behind one interface.

Select with the AI_PROVIDER env var:
    AI_PROVIDER=gemini   (default) uses GEMINI_API_KEY  — free: https://aistudio.google.com/apikey
    AI_PROVIDER=openai             uses OPENAI_API_KEY  — paid: https://platform.openai.com/api-keys
"""

import json
import os
from typing import Iterator, Protocol

import httpx


class ProviderError(Exception):
    """Raised when the upstream AI provider rejects or fails a request."""


class Provider(Protocol):
    name: str
    model: str

    @property
    def key_configured(self) -> bool: ...

    def stream(self, system_prompt: str, messages: list[dict]) -> Iterator[str]: ...


class GeminiProvider:
    """Google Gemini via the free tier (streamGenerateContent + SSE)."""

    name = "gemini"
    BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

    def __init__(self) -> None:
        self.api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.model = os.getenv("AI_MODEL", "gemini-3.8-flash")

    @property
    def key_configured(self) -> bool:
        return bool(self.api_key)

    def stream(self, system_prompt: str, messages: list[dict]) -> Iterator[str]:
        # Map OpenAI-style roles onto Gemini's user/model roles.
        contents = [
            {
                "role": "model" if m["role"] == "assistant" else "user",
                "parts": [{"text": m["content"]}],
            }
            for m in messages
        ]
        payload = {
            "systemInstruction": {"parts": [{"text": system_prompt}]},
            "contents": contents,
            "generationConfig": {"temperature": 0.4},
        }
        url = f"{self.BASE_URL}/{self.model}:streamGenerateContent?alt=sse"

        try:
            with httpx.stream(
                "POST",
                url,
                json=payload,
                headers={"x-goog-api-key": self.api_key},
                timeout=httpx.Timeout(60.0, connect=10.0),
            ) as resp:
                if resp.status_code != 200:
                    body = resp.read().decode("utf-8", "replace")
                    raise ProviderError(f"Gemini returned {resp.status_code}: {body[:400]}")
                for line in resp.iter_lines():
                    if not line.startswith("data:"):
                        continue
                    data = line[5:].strip()
                    if not data:
                        continue
                    try:
                        chunk = json.loads(data)
                    except json.JSONDecodeError:
                        continue
                    for candidate in chunk.get("candidates", []):
                        for part in candidate.get("content", {}).get("parts", []):
                            text = part.get("text")
                            if text:
                                yield text
        except httpx.HTTPError as exc:
            raise ProviderError(f"could not reach Gemini: {exc}") from exc


class OpenAIProvider:
    """OpenAI via the official SDK (chat.completions streaming)."""

    name = "openai"

    def __init__(self) -> None:
        self.api_key = os.getenv("OPENAI_API_KEY", "").strip()
        self.model = os.getenv("AI_MODEL", "gpt-4o-mini")

    @property
    def key_configured(self) -> bool:
        return bool(self.api_key)

    def stream(self, system_prompt: str, messages: list[dict]) -> Iterator[str]:
        try:
            from openai import OpenAI
        except ImportError as exc:  # pragma: no cover
            raise ProviderError("openai package not installed") from exc

        client = OpenAI(api_key=self.api_key)
        try:
            stream = client.chat.completions.create(
                model=self.model,
                messages=[{"role": "system", "content": system_prompt}, *messages],
                stream=True,
                temperature=0.4,
                max_tokens=300,
            )
            for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    yield delta
        except Exception as exc:
            raise ProviderError(f"OpenAI error: {exc}") from exc


def get_provider() -> Provider:
    """Pick the provider from AI_PROVIDER (default: gemini — free tier)."""
    if os.getenv("AI_PROVIDER", "gemini").strip().lower() == "openai":
        return OpenAIProvider()
    return GeminiProvider()
