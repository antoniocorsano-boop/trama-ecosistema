from __future__ import annotations

import json
import math
import time
from typing import Any, Protocol
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import ProxyHandler, Request, build_opener

from termux_supervisor import validate_origin


_LOOPBACK_HOSTS = {'127.0.0.1', 'localhost', '::1'}
_SYNTHETIC_SOURCE = {
    'schema': 'trama.semantic-memory-projection/v1',
    'namespace': 'trama-smoke',
    'sourceAppId': 'trama-lsm-smoke',
    'sourceType': 'synthetic',
    'sourceId': 'lsm-01e-hardware-smoke',
    'revision': 'smoke-r1',
    'canonicalRef': 'trama-smoke://lsm-01e-hardware-smoke',
    'updatedAt': '2026-11-01T00:00:00Z',
    'title': 'Smoke LSM-01E',
    'text': (
        'Il cartone ondulato può essere riutilizzato per costruire semplici '
        'modelli didattici di strutture resistenti.'
    ),
    'dataClass': 'TEACHER_PROFESSIONAL',
    'metadata': {'synthetic': 'true', 'purpose': 'lsm-01e-hardware-smoke'},
}
_SEARCH_QUERY = 'materiali riciclati per costruire modelli resistenti'


class SmokeFailure(RuntimeError):
    pass


class SmokeControl(Protocol):
    def restart_memoryd(self) -> None:
        ...


class SmokeTransport(Protocol):
    def request(
        self,
        method: str,
        url: str,
        *,
        origin: str | None = None,
        bearer: str | None = None,
        payload: dict[str, Any] | None = None,
        timeout_seconds: float = 10,
    ) -> tuple[int, dict[str, Any], Any]:
        ...


class JsonHttpTransport:
    def __init__(self) -> None:
        # Loopback traffic must never be redirected through environment proxies.
        self._opener = build_opener(ProxyHandler({}))

    def request(
        self,
        method: str,
        url: str,
        *,
        origin: str | None = None,
        bearer: str | None = None,
        payload: dict[str, Any] | None = None,
        timeout_seconds: float = 10,
    ) -> tuple[int, dict[str, Any], Any]:
        headers = {'Accept': 'application/json'}
        if origin:
            headers['Origin'] = origin
        if bearer:
            headers['Authorization'] = f'Bearer {bearer}'

        body: bytes | None = None
        if payload is not None:
            body = json.dumps(payload, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
            headers['Content-Type'] = 'application/json'

        request = Request(url, data=body, headers=headers, method=method)
        try:
            with self._opener.open(request, timeout=timeout_seconds) as response:
                raw = response.read()
                decoded = _decode_json(raw)
                return response.status, decoded, response.headers
        except HTTPError as exc:
            raw = exc.read()
            return exc.code, _decode_json(raw), exc.headers
        except (URLError, TimeoutError, OSError) as exc:
            raise SmokeFailure(f'Endpoint locale non raggiungibile: {url}') from exc


def _decode_json(raw: bytes) -> dict[str, Any]:
    if not raw:
        return {}
    try:
        value = json.loads(raw.decode('utf-8'))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise SmokeFailure('Risposta locale non JSON.') from exc
    if not isinstance(value, dict):
        raise SmokeFailure('Risposta locale JSON non valida.')
    return value


def _normalize_base_url(base_url: str) -> str:
    parsed = urlparse(base_url.strip())
    if parsed.scheme != 'http' or parsed.hostname not in _LOOPBACK_HOSTS:
        raise SmokeFailure('Lo smoke accetta soltanto un endpoint HTTP loopback.')
    if parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise SmokeFailure('Endpoint smoke non valido.')
    path = parsed.path.rstrip('/')
    if path:
        raise SmokeFailure('Endpoint smoke non deve contenere un percorso.')
    try:
        port = parsed.port
    except ValueError as exc:
        raise SmokeFailure('Porta endpoint smoke non valida.') from exc
    if port is None:
        raise SmokeFailure('Endpoint smoke deve dichiarare la porta locale.')
    return f'http://{parsed.netloc}'


def _require_status(status: int, expected: int, label: str) -> None:
    if status != expected:
        raise SmokeFailure(f'{label}: HTTP {status}, atteso {expected}.')


def _issue_session(
    transport: SmokeTransport,
    base_url: str,
    origin: str,
) -> tuple[str, dict[str, Any]]:
    status, payload, _headers = transport.request(
        'POST', f'{base_url}/v1/session', origin=origin, timeout_seconds=10
    )
    _require_status(status, 200, 'Bootstrap sessione')
    if payload.get('schema') != 'trama.semantic-memory-session/v1':
        raise SmokeFailure('Bootstrap sessione: schema inatteso.')
    token = payload.get('token')
    if not isinstance(token, str) or not token.strip():
        raise SmokeFailure('Bootstrap sessione: capability assente.')
    health = payload.get('health')
    if not isinstance(health, dict):
        raise SmokeFailure('Bootstrap sessione: health assente.')
    return token, health


def _require_ready_health(
    health: dict[str, Any],
    *,
    require_signature: bool = True,
) -> tuple[str | None, int | None]:
    if health.get('schema') != 'trama.semantic-memory-health/v1':
        raise SmokeFailure('Health LSM: schema inatteso.')
    if health.get('status') != 'ready':
        raise SmokeFailure(f'Health LSM non ready: {health.get("status")!r}.')

    model_id = health.get('modelId')
    dimensions = health.get('dimensions')
    if model_id is None and dimensions is None and not require_signature:
        return None, None
    if not isinstance(model_id, str) or not model_id.strip():
        raise SmokeFailure('Health LSM: modelId non valido.')
    if not isinstance(dimensions, int) or isinstance(dimensions, bool) or dimensions <= 0:
        raise SmokeFailure('Health LSM: dimensionalità non valida.')
    return model_id, dimensions


def _wait_ready(
    transport: SmokeTransport,
    base_url: str,
    *,
    timeout_seconds: float = 30,
) -> dict[str, Any]:
    deadline = time.monotonic() + timeout_seconds
    last_error: Exception | None = None
    while time.monotonic() < deadline:
        try:
            status, health, _headers = transport.request(
                'GET', f'{base_url}/v1/health', timeout_seconds=2
            )
            if status == 200 and health.get('status') == 'ready':
                _require_ready_health(health)
                return health
        except SmokeFailure as exc:
            last_error = exc
        time.sleep(0.25)
    if last_error:
        raise SmokeFailure('Runtime LSM non torna ready dopo il restart.') from last_error
    raise SmokeFailure('Runtime LSM non torna ready dopo il restart.')


def _upsert_payload() -> dict[str, Any]:
    return {
        'schema': 'trama.semantic-memory-upsert-request/v1',
        'expectedRevision': None,
        'projection': dict(_SYNTHETIC_SOURCE),
    }


def _search_payload() -> dict[str, Any]:
    return {
        'schema': 'trama.semantic-memory-search-request/v1',
        'query': _SEARCH_QUERY,
        'namespaces': [_SYNTHETIC_SOURCE['namespace']],
        'allowedDataClasses': [_SYNTHETIC_SOURCE['dataClass']],
        'limit': 5,
    }


def _remove_payload() -> dict[str, Any]:
    return {
        'schema': 'trama.semantic-memory-remove-request/v1',
        'expectedRevision': _SYNTHETIC_SOURCE['revision'],
        'source': {
            'sourceAppId': _SYNTHETIC_SOURCE['sourceAppId'],
            'sourceType': _SYNTHETIC_SOURCE['sourceType'],
            'sourceId': _SYNTHETIC_SOURCE['sourceId'],
        },
    }


def _find_synthetic_hit(payload: dict[str, Any]) -> dict[str, Any]:
    if payload.get('schema') != 'trama.semantic-memory-search-response/v1':
        raise SmokeFailure('Ricerca semantica: schema inatteso.')
    hits = payload.get('hits')
    if not isinstance(hits, list):
        raise SmokeFailure('Ricerca semantica: hits non validi.')
    for hit in hits:
        if isinstance(hit, dict) and hit.get('sourceId') == _SYNTHETIC_SOURCE['sourceId']:
            score = hit.get('score')
            if not isinstance(score, (int, float)) or isinstance(score, bool) or not math.isfinite(score):
                raise SmokeFailure('Ricerca semantica: score non valido.')
            return hit
    raise SmokeFailure('Ricerca semantica: fonte sintetica non recuperata.')


def _timed_request(
    transport: SmokeTransport,
    method: str,
    url: str,
    **kwargs: Any,
) -> tuple[int, dict[str, Any], Any, float]:
    started = time.perf_counter()
    status, payload, headers = transport.request(method, url, **kwargs)
    elapsed_ms = round((time.perf_counter() - started) * 1000, 2)
    return status, payload, headers, elapsed_ms


def _cleanup_projection(
    transport: SmokeTransport,
    base_url: str,
    origin: str,
) -> str:
    token, _health = _issue_session(transport, base_url, origin)
    status, payload, _headers = transport.request(
        'POST',
        f'{base_url}/v1/projections/remove',
        origin=origin,
        bearer=token,
        payload=_remove_payload(),
        timeout_seconds=10,
    )
    _require_status(status, 200, 'Cleanup smoke')
    if payload.get('status') not in {'removed', 'not-found', 'not_found'}:
        # The real runtime normally returns removed. Accept an explicit no-op
        # status only so cleanup remains idempotent on retries.
        raise SmokeFailure('Cleanup smoke: receipt inatteso.')
    return 'removed'


def run_smoke(
    *,
    base_url: str,
    origin: str,
    control: SmokeControl,
    transport: SmokeTransport | None = None,
) -> dict[str, Any]:
    base = _normalize_base_url(base_url)
    exact_origin = validate_origin(origin)
    client: SmokeTransport = transport or JsonHttpTransport()

    cleanup_required = False
    cleanup_status = 'not-required'
    primary_error: Exception | None = None
    report: dict[str, Any] | None = None

    try:
        status, health, _headers = client.request('GET', f'{base}/v1/health', timeout_seconds=10)
        _require_status(status, 200, 'Health iniziale')
        _require_ready_health(health, require_signature=False)

        first_token, session_health = _issue_session(client, base, exact_origin)
        _require_ready_health(session_health, require_signature=False)

        cleanup_required = True
        status, _receipt, _headers, upsert_ms = _timed_request(
            client,
            'POST',
            f'{base}/v1/projections/upsert',
            origin=exact_origin,
            bearer=first_token,
            payload=_upsert_payload(),
            timeout_seconds=30,
        )
        _require_status(status, 200, 'Indicizzazione sintetica')

        status, indexed_health, _headers = client.request(
            'GET', f'{base}/v1/health', timeout_seconds=10
        )
        _require_status(status, 200, 'Health dopo indicizzazione')
        indexed_model, indexed_dimensions = _require_ready_health(indexed_health)

        status, search_before, _headers, search_before_ms = _timed_request(
            client,
            'POST',
            f'{base}/v1/search',
            origin=exact_origin,
            bearer=first_token,
            payload=_search_payload(),
            timeout_seconds=30,
        )
        _require_status(status, 200, 'Ricerca prima del restart')
        _find_synthetic_hit(search_before)

        control.restart_memoryd()
        restarted_health = _wait_ready(client, base)
        restarted_model, restarted_dimensions = _require_ready_health(restarted_health)
        if (restarted_model, restarted_dimensions) != (indexed_model, indexed_dimensions):
            raise SmokeFailure('Restart: firma embedding diversa dopo il riavvio.')

        stale_status, _stale_payload, _headers = client.request(
            'POST',
            f'{base}/v1/search',
            origin=exact_origin,
            bearer=first_token,
            payload=_search_payload(),
            timeout_seconds=10,
        )
        _require_status(stale_status, 401, 'Invalidazione capability dopo restart')

        second_token, second_health = _issue_session(client, base, exact_origin)
        second_model, second_dimensions = _require_ready_health(second_health)
        if (second_model, second_dimensions) != (indexed_model, indexed_dimensions):
            raise SmokeFailure('Nuova sessione: firma embedding diversa dopo il riavvio.')
        if second_token == first_token:
            raise SmokeFailure('Restart: la nuova capability coincide con quella precedente.')

        status, search_after, _headers, search_after_ms = _timed_request(
            client,
            'POST',
            f'{base}/v1/search',
            origin=exact_origin,
            bearer=second_token,
            payload=_search_payload(),
            timeout_seconds=30,
        )
        _require_status(status, 200, 'Ricerca dopo il restart')
        _find_synthetic_hit(search_after)

        report = {
            'passed': True,
            'modelId': restarted_model,
            'dimensions': restarted_dimensions,
            'indexRevision': restarted_health.get('indexRevision'),
            'sessionInvalidation': 'pass',
            'persistenceAfterRestart': 'pass',
            'semanticSearch': 'pass',
            'cleanup': 'pending',
            'timingsMs': {
                'upsert': upsert_ms,
                'searchBeforeRestart': search_before_ms,
                'searchAfterRestart': search_after_ms,
            },
        }
    except Exception as exc:
        primary_error = exc if isinstance(exc, SmokeFailure) else SmokeFailure(str(exc))
    finally:
        if cleanup_required:
            try:
                cleanup_status = _cleanup_projection(client, base, exact_origin)
            except Exception as cleanup_exc:
                cleanup_failure = (
                    cleanup_exc
                    if isinstance(cleanup_exc, SmokeFailure)
                    else SmokeFailure(str(cleanup_exc))
                )
                if primary_error is None:
                    primary_error = cleanup_failure
                else:
                    primary_error = SmokeFailure(
                        f'{primary_error} Cleanup smoke non completato: {cleanup_failure}'
                    )
        if report is not None:
            report['cleanup'] = cleanup_status

    if primary_error is not None:
        raise primary_error
    if report is None:
        raise SmokeFailure('Smoke non completato.')
    if cleanup_status != 'removed':
        raise SmokeFailure('Cleanup smoke non completato.')
    return report
