from __future__ import annotations

from dataclasses import dataclass
import hmac
import secrets
import time
from typing import Callable

_MAX_ACTIVE_CAPABILITIES = 64


@dataclass(frozen=True)
class SessionCapability:
    token: str
    origin: str
    expires_at_epoch: float


class SessionCapabilityStore:
    def __init__(
        self,
        ttl_seconds: int,
        now_fn: Callable[[], float] = time.time,
    ) -> None:
        if ttl_seconds <= 0:
            raise ValueError('ttl_seconds must be positive')
        self._ttl_seconds = ttl_seconds
        self._now_fn = now_fn
        self._capabilities: dict[str, SessionCapability] = {}

    def _purge_expired(self) -> None:
        now = self._now_fn()
        expired = [
            token
            for token, capability in self._capabilities.items()
            if capability.expires_at_epoch <= now
        ]
        for token in expired:
            self._capabilities.pop(token, None)

    def _enforce_bound(self) -> None:
        if len(self._capabilities) < _MAX_ACTIVE_CAPABILITIES:
            return
        oldest = min(
            self._capabilities.values(),
            key=lambda capability: capability.expires_at_epoch,
        )
        self._capabilities.pop(oldest.token, None)

    def issue(self, origin: str) -> SessionCapability:
        if not isinstance(origin, str) or not origin.strip():
            raise ValueError('origin must be non-blank')
        self._purge_expired()
        self._enforce_bound()
        token = secrets.token_urlsafe(32)
        capability = SessionCapability(
            token=token,
            origin=origin,
            expires_at_epoch=self._now_fn() + self._ttl_seconds,
        )
        self._capabilities[token] = capability
        return capability

    def matches(self, token: str, origin: str | None) -> bool:
        if not token or origin is None:
            return False
        self._purge_expired()
        capability = self._capabilities.get(token)
        if capability is None:
            return False
        return hmac.compare_digest(capability.token, token) and hmac.compare_digest(
            capability.origin,
            origin,
        )

    def active_count(self) -> int:
        self._purge_expired()
        return len(self._capabilities)
