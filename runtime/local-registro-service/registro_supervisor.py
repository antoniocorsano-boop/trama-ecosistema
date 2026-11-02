from __future__ import annotations

import re
import shlex
from dataclasses import dataclass
from pathlib import Path

SERVICE_NAME = "trama-registro"
DEFAULT_BIND_HOST = "127.0.0.1"
DEFAULT_PORT = 4173
RESERVED_PORTS = frozenset({8080, 8765})
_SHA_RE = re.compile(r"^[0-9a-fA-F]{40}$")


def _shell_quote(value: str | Path) -> str:
    text = str(value)
    quoted = shlex.quote(text)
    if quoted == text:
        return f"'{text}'"
    return quoted


@dataclass(frozen=True)
class RegistroSupervisorConfig:
    app_dir: Path
    runtime_command: Path
    candidate_sha: str
    port: int = DEFAULT_PORT
    bind_host: str = DEFAULT_BIND_HOST

    def __post_init__(self) -> None:
        object.__setattr__(self, "app_dir", Path(self.app_dir).expanduser().resolve())
        object.__setattr__(
            self,
            "runtime_command",
            Path(self.runtime_command).expanduser().resolve(),
        )
        if self.bind_host != DEFAULT_BIND_HOST:
            raise ValueError("Registro locale deve usare esclusivamente 127.0.0.1")
        if not 1 <= int(self.port) <= 65535:
            raise ValueError(f"Porta non valida: {self.port}")
        if int(self.port) in RESERVED_PORTS:
            raise ValueError(f"Porta riservata a Local Semantic Memory: {self.port}")
        if not _SHA_RE.fullmatch(self.candidate_sha):
            raise ValueError("candidate_sha deve essere uno SHA Git completo di 40 caratteri")


def render_registro_run(config: RegistroSupervisorConfig) -> str:
    return "\n".join(
        [
            "#!/bin/sh",
            "set -eu",
            "exec 2>&1",
            "export NODE_ENV='production'",
            f"export PORT='{int(config.port)}'",
            f"export TRAMA_BIND_HOST='{config.bind_host}'",
            f"cd {_shell_quote(config.app_dir)}",
            f"exec {_shell_quote(config.runtime_command)} server.ts",
            "",
        ]
    )


def render_log_run(prefix: Path) -> str:
    svlogger = Path(prefix) / "bin" / "svlogger"
    log_dir = Path(prefix) / "var" / "log" / "sv" / SERVICE_NAME
    return "\n".join(
        [
            "#!/bin/sh",
            "set -eu",
            f"mkdir -p {_shell_quote(log_dir)}",
            f"exec {_shell_quote(svlogger)} -tt {_shell_quote(log_dir)}",
            "",
        ]
    )


def render_registro_boot(prefix: Path) -> str:
    profile = Path(prefix) / "etc" / "profile.d" / "start-services.sh"
    sv = Path(prefix) / "bin" / "sv"
    default_svdir = Path(prefix) / "var" / "service"
    return "\n".join(
        [
            "#!/bin/sh",
            "set -eu",
            f". {_shell_quote(profile)}",
            f"SVDIR=\"${{SVDIR:-{default_svdir}}}\"",
            "for i in $(seq 1 30); do",
            '  [ -e "$SVDIR/trama-registro/supervise/ok" ] && break',
            "  sleep 1",
            "done",
            'test -e "$SVDIR/trama-registro/supervise/ok"',
            f"{_shell_quote(sv)} up trama-registro",
            "",
        ]
    )
