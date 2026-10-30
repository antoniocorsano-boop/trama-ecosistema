from __future__ import annotations
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlparse
import os

LOOPBACK_HOSTS = {'127.0.0.1', 'localhost', '::1'}

class ConfigError(ValueError):
    pass

@dataclass(frozen=True)
class RuntimeConfig:
    host: str
    port: int
    db_path: Path
    token_file: Path
    allowed_origins: tuple[str, ...]
    embedding_url: str
    embedding_model: str
    sqlite_vec_path: Path | None
    max_body_bytes: int = 1024 * 1024
    embedding_timeout_seconds: float = 15.0

def _require_loopback_host(host: str, label: str) -> None:
    if host not in LOOPBACK_HOSTS:
        raise ConfigError(f'{label} must be loopback-only')

def _validate_loopback_url(url: str) -> None:
    parsed = urlparse(url)
    if parsed.scheme != 'http' or parsed.hostname not in LOOPBACK_HOSTS:
        raise ConfigError('embedding URL must use http loopback')

def load_runtime_config(env=None) -> RuntimeConfig:
    env = dict(os.environ if env is None else env)
    home = Path(env.get('TRAMA_MEMORY_HOME', str(Path.home()/'.local/share/trama-semantic-memory'))).expanduser()
    host = env.get('TRAMA_MEMORY_HOST', '127.0.0.1')
    _require_loopback_host(host, 'memory host')
    try:
        port = int(env.get('TRAMA_MEMORY_PORT', '8765'))
    except ValueError as exc:
        raise ConfigError('invalid port') from exc
    if not 0 <= port <= 65535:
        raise ConfigError('invalid port')
    db_path = Path(env.get('TRAMA_MEMORY_DB', str(home/'semantic-memory.sqlite3'))).expanduser()
    token_file = Path(env.get('TRAMA_MEMORY_TOKEN_FILE', str(home/'semantic-memory.token'))).expanduser()
    origins = tuple(x.strip() for x in env.get('TRAMA_MEMORY_ALLOWED_ORIGINS','').split(',') if x.strip())
    if '*' in origins:
        raise ConfigError('wildcard CORS origin forbidden')
    embedding_url = env.get('TRAMA_EMBEDDING_URL', 'http://127.0.0.1:8080')
    _validate_loopback_url(embedding_url)
    embedding_model = env.get('TRAMA_EMBEDDING_MODEL', 'embeddinggemma-2')
    vec_raw = env.get('TRAMA_SQLITE_VEC_PATH','').strip()
    vec_path = Path(vec_raw).expanduser() if vec_raw else None
    return RuntimeConfig(host, port, db_path, token_file, origins, embedding_url.rstrip('/'), embedding_model, vec_path)
