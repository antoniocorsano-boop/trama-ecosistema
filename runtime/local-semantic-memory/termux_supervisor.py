from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import shlex
from urllib.parse import urlparse

_LOOPBACK_HOSTS = {'127.0.0.1', 'localhost', '::1'}


def validate_origin(origin: str) -> str:
    value = origin.strip()
    if not value or '*' in value:
        raise ValueError('origin must be exact and cannot contain wildcards')

    parsed = urlparse(value)
    if parsed.scheme not in {'http', 'https'}:
        raise ValueError('origin must use http or https')
    if not parsed.hostname or parsed.username or parsed.password:
        raise ValueError('origin must have a plain hostname')
    if parsed.path or parsed.params or parsed.query or parsed.fragment:
        raise ValueError('origin must not contain path, params, query or fragment')

    try:
        _ = parsed.port
    except ValueError as exc:
        raise ValueError('origin has an invalid port') from exc

    if parsed.scheme == 'http' and parsed.hostname not in _LOOPBACK_HOSTS:
        raise ValueError('plain HTTP origins must be loopback-only')

    return f'{parsed.scheme}://{parsed.netloc}'


def _require_port(value: int, label: str) -> int:
    if not isinstance(value, int) or isinstance(value, bool) or not 1 <= value <= 65535:
        raise ValueError(f'{label} must be an integer port in 1..65535')
    return value


def _double_quote(value: str) -> str:
    return '"' + value.replace('\\', '\\\\').replace('"', '\\"').replace('$', '\\$').replace('`', '\\`') + '"'


@dataclass(frozen=True)
class SupervisorConfig:
    runtime_dir: Path
    llama_server: Path
    model: Path
    memory_home: Path
    allowed_origins: tuple[str, ...]
    embedding_port: int = 8080
    memory_port: int = 8765
    session_ttl_seconds: int = 28800
    embedding_model: str = 'embeddinggemma-2-local'

    def __post_init__(self) -> None:
        _require_port(self.embedding_port, 'embedding_port')
        _require_port(self.memory_port, 'memory_port')
        if self.embedding_port == self.memory_port:
            raise ValueError('embedding and memory ports must differ')
        if not 60 <= self.session_ttl_seconds <= 86400:
            raise ValueError('session_ttl_seconds must be in 60..86400')
        if not self.allowed_origins:
            raise ValueError('at least one allowed origin is required')
        normalized = tuple(validate_origin(origin) for origin in self.allowed_origins)
        object.__setattr__(self, 'allowed_origins', normalized)
        if not self.embedding_model.strip():
            raise ValueError('embedding_model must be nonblank')


def render_embedding_run(config: SupervisorConfig) -> str:
    llama = shlex.quote(str(config.llama_server))
    model = shlex.quote(str(config.model))
    return '\n'.join([
        '#!/data/data/com.termux/files/usr/bin/sh',
        'set -eu',
        f'exec {llama} -m {model} --embedding --host 127.0.0.1 --port {config.embedding_port} --no-webui',
        '',
    ])


def render_memoryd_run(config: SupervisorConfig) -> str:
    embedding_url = f'http://127.0.0.1:{config.embedding_port}'
    health_url = f'{embedding_url}/health'
    memory_home = str(config.memory_home)
    runtime_dir = str(config.runtime_dir)
    origins = ','.join(config.allowed_origins)

    lines = [
        '#!/data/data/com.termux/files/usr/bin/sh',
        'set -eu',
        f'EMBEDDING_HEALTH={_double_quote(health_url)}',
        'ready=0',
        'attempt=0',
        'while [ "$attempt" -lt 60 ]; do',
        '  if curl --noproxy \'*\' --fail --silent --show-error "$EMBEDDING_HEALTH" >/dev/null 2>&1; then',
        '    ready=1',
        '    break',
        '  fi',
        '  attempt=$((attempt + 1))',
        '  sleep 1',
        'done',
        '[ "$ready" -eq 1 ] || { echo "Embedding locale non disponibile." >&2; exit 1; }',
        f'export TRAMA_MEMORY_HOME={_double_quote(memory_home)}',
        'export TRAMA_MEMORY_HOST="127.0.0.1"',
        f'export TRAMA_MEMORY_PORT="{config.memory_port}"',
        f'export TRAMA_MEMORY_DB={_double_quote(str(config.memory_home / "semantic-memory.sqlite3"))}',
        f'export TRAMA_MEMORY_TOKEN_FILE={_double_quote(str(config.memory_home / "semantic-memory.token"))}',
        f'export TRAMA_MEMORY_ALLOWED_ORIGINS={_double_quote(origins)}',
        f'export TRAMA_MEMORY_SESSION_TTL_SECONDS="{config.session_ttl_seconds}"',
        f'export TRAMA_EMBEDDING_URL={_double_quote(embedding_url)}',
        f'export TRAMA_EMBEDDING_MODEL={_double_quote(config.embedding_model)}',
        f'cd {shlex.quote(runtime_dir)}',
        'exec python3 main.py',
        '',
    ]
    return '\n'.join(lines)


def render_boot_script(prefix: Path) -> str:
    start_services = prefix / 'etc/profile.d/start-services.sh'
    return '\n'.join([
        '#!/data/data/com.termux/files/usr/bin/sh',
        'set -eu',
        f'. {shlex.quote(str(start_services))}',
        'sv up trama-embedding',
        'sv up trama-memoryd',
        '',
    ])
