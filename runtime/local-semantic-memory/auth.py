from __future__ import annotations
from pathlib import Path
import hmac, os, secrets

def load_or_create_local_token(path: Path) -> str:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        token = path.read_text(encoding='utf-8').strip()
        if len(token) < 43:
            raise ValueError('token file contains an invalid token')
        try: os.chmod(path, 0o600)
        except OSError: pass
        return token
    token = secrets.token_urlsafe(32)
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL
    fd = os.open(path, flags, 0o600)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as f:
            f.write(token + '\n')
    except Exception:
        try: path.unlink()
        except OSError: pass
        raise
    try: os.chmod(path, 0o600)
    except OSError: pass
    return token

def bearer_matches(header: str | None, token: str) -> bool:
    if not header or not header.startswith('Bearer '):
        return False
    return hmac.compare_digest(header[7:], token)
