from __future__ import annotations

import argparse
import hashlib
import os
import shlex
import socket
import stat
import subprocess
import tempfile
import time
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable

from registro_supervisor import (
    DEFAULT_BIND_HOST,
    DEFAULT_PORT,
    SERVICE_NAME,
    RegistroSupervisorConfig,
    render_log_run,
    render_registro_boot,
    render_registro_run,
)

Runner = Callable[..., subprocess.CompletedProcess[str]]
GitHeadResolver = Callable[[Path], str]
HttpGet = Callable[[str], tuple[int, str]]


def _default_git_head_resolver(app_dir: Path) -> str:
    completed = subprocess.run(
        ["git", "-C", str(app_dir), "rev-parse", "HEAD"],
        text=True,
        capture_output=True,
        check=False,
    )
    if completed.returncode != 0:
        raise RuntimeError(
            "Impossibile verificare lo SHA del checkout Registro: "
            + (completed.stderr.strip() or completed.stdout.strip())
        )
    return completed.stdout.strip()


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _dist_tree_sha256(dist_dir: Path) -> str:
    if not dist_dir.is_dir():
        raise RuntimeError(f"Build Registro assente: {dist_dir}")
    files = sorted(
        (path for path in dist_dir.rglob("*") if path.is_file()),
        key=lambda path: path.relative_to(dist_dir).as_posix(),
    )
    if not files:
        raise RuntimeError(f"Build Registro vuota: {dist_dir}")
    digest = hashlib.sha256()
    for path in files:
        relative = path.relative_to(dist_dir).as_posix()
        digest.update(relative.encode("utf-8"))
        digest.update(b"\0")
        digest.update(_sha256(path).encode("ascii"))
        digest.update(b"\n")
    return digest.hexdigest()


def _atomic_write(path: Path, content: str, mode: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, raw_tmp = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    tmp = Path(raw_tmp)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(tmp, mode)
        os.replace(tmp, path)
    finally:
        if tmp.exists():
            tmp.unlink()


def _render_env_value(value: str | Path) -> str:
    return shlex.quote(str(value))


def _parse_env_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        tokens = shlex.split(line, posix=True)
        if len(tokens) != 1 or "=" not in tokens[0]:
            raise RuntimeError(f"Configurazione non valida: {path}")
        key, value = tokens[0].split("=", 1)
        values[key] = value
    return values


@dataclass(frozen=True)
class InstalledRegistro:
    app_dir: Path
    runtime_command: Path
    candidate_sha: str
    port: int
    prefix: Path
    home: Path
    config_path: Path
    wrapper_path: Path
    service_dir: Path
    boot_path: Path
    dist_digest: str
    git_head_resolver: GitHeadResolver = field(
        default=_default_git_head_resolver,
        repr=False,
        compare=False,
    )


def _validate_checkout(
    app_dir: Path,
    runtime_command: Path,
    candidate_sha: str,
    git_head_resolver: GitHeadResolver,
) -> str:
    if not app_dir.is_dir():
        raise RuntimeError(f"Directory Registro non trovata: {app_dir}")
    for relative in ("server.ts", "package.json", "dist/index.html"):
        if not (app_dir / relative).is_file():
            raise RuntimeError(f"Artifact Registro richiesto assente: {relative}")
    if not runtime_command.is_file() or not os.access(runtime_command, os.X_OK):
        raise RuntimeError(f"Runtime non eseguibile: {runtime_command}")
    actual = git_head_resolver(app_dir).strip()
    if actual != candidate_sha:
        raise RuntimeError(
            f"Checkout Registro su SHA diverso dal candidate: atteso {candidate_sha}, attuale {actual}"
        )
    return _dist_tree_sha256(app_dir / "dist")


def _config_text(
    config: RegistroSupervisorConfig,
    dist_digest: str,
) -> str:
    values = {
        "TRAMA_REGISTRO_APP_DIR": config.app_dir,
        "TRAMA_REGISTRO_RUNTIME_COMMAND": config.runtime_command,
        "TRAMA_REGISTRO_CANDIDATE_SHA": config.candidate_sha,
        "TRAMA_REGISTRO_PORT": str(config.port),
        "TRAMA_REGISTRO_BIND_HOST": config.bind_host,
        "TRAMA_REGISTRO_DIST_TREE_SHA256": dist_digest,
    }
    return "".join(f"{key}={_render_env_value(value)}\n" for key, value in values.items())


def _wrapper_text(runtime_script: Path) -> str:
    return "\n".join(
        [
            "#!/data/data/com.termux/files/usr/bin/sh",
            "set -eu",
            f"exec python3 {shlex.quote(str(runtime_script))} \"$@\"",
            "",
        ]
    )


def _snapshot(paths: list[Path]) -> dict[Path, tuple[bytes, int] | None]:
    result: dict[Path, tuple[bytes, int] | None] = {}
    for path in paths:
        if path.exists() and path.is_file():
            result[path] = (path.read_bytes(), stat.S_IMODE(path.stat().st_mode))
        else:
            result[path] = None
    return result


def _restore_snapshot(snapshot: dict[Path, tuple[bytes, int] | None]) -> None:
    for path, previous in snapshot.items():
        if previous is None:
            if path.exists() and path.is_file():
                path.unlink()
            continue
        content, mode = previous
        path.parent.mkdir(parents=True, exist_ok=True)
        fd, raw_tmp = tempfile.mkstemp(prefix=f".{path.name}.rollback.", dir=path.parent)
        tmp = Path(raw_tmp)
        try:
            with os.fdopen(fd, "wb") as handle:
                handle.write(content)
                handle.flush()
                os.fsync(handle.fileno())
            os.chmod(tmp, mode)
            os.replace(tmp, path)
        finally:
            if tmp.exists():
                tmp.unlink()


def install_service(
    *,
    app_dir: Path,
    runtime_command: Path,
    candidate_sha: str,
    prefix: Path,
    home: Path,
    port: int = DEFAULT_PORT,
    git_head_resolver: GitHeadResolver = _default_git_head_resolver,
) -> InstalledRegistro:
    config = RegistroSupervisorConfig(
        app_dir=app_dir,
        runtime_command=runtime_command,
        candidate_sha=candidate_sha,
        port=port,
    )
    prefix = Path(prefix).expanduser().resolve()
    home = Path(home).expanduser().resolve()
    dist_digest = _validate_checkout(
        config.app_dir,
        config.runtime_command,
        config.candidate_sha,
        git_head_resolver,
    )

    config_path = home / ".config" / "trama-registro" / "config.env"
    wrapper_path = prefix / "bin" / "trama-registro"
    service_dir = prefix / "var" / "service" / SERVICE_NAME
    boot_path = home / ".termux" / "boot" / "30-trama-registro"
    source_runtime = Path(__file__).resolve()
    source_supervisor = source_runtime.with_name("registro_supervisor.py")
    if not source_supervisor.is_file():
        raise RuntimeError(f"Supervisore Registro assente: {source_supervisor}")
    controller_dir = prefix / "libexec" / SERVICE_NAME
    installed_runtime = controller_dir / "trama_registro.py"
    installed_supervisor = controller_dir / "registro_supervisor.py"
    targets = [
        config_path,
        wrapper_path,
        installed_runtime,
        installed_supervisor,
        service_dir / "down",
        service_dir / "log" / "run",
        service_dir / "run",
    ]
    before = _snapshot(targets)
    try:
        # Publish the down marker before the run script so runit cannot race a partial install.
        _atomic_write(service_dir / "down", "", 0o644)
        _atomic_write(service_dir / "log" / "run", render_log_run(prefix), 0o755)
        _atomic_write(service_dir / "run", render_registro_run(config), 0o755)
        _atomic_write(config_path, _config_text(config, dist_digest), 0o600)
        _atomic_write(installed_runtime, source_runtime.read_text(encoding="utf-8"), 0o644)
        _atomic_write(installed_supervisor, source_supervisor.read_text(encoding="utf-8"), 0o644)
        _atomic_write(wrapper_path, _wrapper_text(installed_runtime), 0o755)
    except Exception:
        _restore_snapshot(before)
        raise

    return InstalledRegistro(
        app_dir=config.app_dir,
        runtime_command=config.runtime_command,
        candidate_sha=config.candidate_sha,
        port=config.port,
        prefix=prefix,
        home=home,
        config_path=config_path,
        wrapper_path=wrapper_path,
        service_dir=service_dir,
        boot_path=boot_path,
        dist_digest=dist_digest,
        git_head_resolver=git_head_resolver,
    )


def load_installed(*, prefix: Path, home: Path) -> InstalledRegistro:
    prefix = Path(prefix).expanduser().resolve()
    home = Path(home).expanduser().resolve()
    config_path = home / ".config" / "trama-registro" / "config.env"
    if not config_path.is_file():
        raise RuntimeError("trama-registro non installato: config.env assente")
    values = _parse_env_file(config_path)
    required = {
        "TRAMA_REGISTRO_APP_DIR",
        "TRAMA_REGISTRO_RUNTIME_COMMAND",
        "TRAMA_REGISTRO_CANDIDATE_SHA",
        "TRAMA_REGISTRO_PORT",
        "TRAMA_REGISTRO_BIND_HOST",
        "TRAMA_REGISTRO_DIST_TREE_SHA256",
    }
    missing = sorted(required - values.keys())
    if missing:
        raise RuntimeError("Configurazione trama-registro incompleta: " + ", ".join(missing))
    if values["TRAMA_REGISTRO_BIND_HOST"] != DEFAULT_BIND_HOST:
        raise RuntimeError("Configurazione trama-registro non loopback")
    return InstalledRegistro(
        app_dir=Path(values["TRAMA_REGISTRO_APP_DIR"]),
        runtime_command=Path(values["TRAMA_REGISTRO_RUNTIME_COMMAND"]),
        candidate_sha=values["TRAMA_REGISTRO_CANDIDATE_SHA"],
        port=int(values["TRAMA_REGISTRO_PORT"]),
        prefix=prefix,
        home=home,
        config_path=config_path,
        wrapper_path=prefix / "bin" / "trama-registro",
        service_dir=prefix / "var" / "service" / SERVICE_NAME,
        boot_path=home / ".termux" / "boot" / "30-trama-registro",
        dist_digest=values["TRAMA_REGISTRO_DIST_TREE_SHA256"],
    )


def _verify_installed_identity(installed: InstalledRegistro) -> None:
    actual = installed.git_head_resolver(installed.app_dir).strip()
    if actual != installed.candidate_sha:
        raise RuntimeError(
            f"Checkout Registro drift: atteso {installed.candidate_sha}, attuale {actual}"
        )
    index = installed.app_dir / "dist" / "index.html"
    if not index.is_file():
        raise RuntimeError("Build Registro assente: dist/index.html")
    current_digest = _dist_tree_sha256(installed.app_dir / "dist")
    if current_digest != installed.dist_digest:
        raise RuntimeError("Build Registro cambiata dopo installazione: reinstallare trama-registro")


def _run_sv(
    installed: InstalledRegistro,
    action: str,
    *,
    runner: Runner = subprocess.run,
) -> subprocess.CompletedProcess[str]:
    return runner(
        [str(installed.prefix / "bin" / "sv"), action, str(installed.service_dir)],
        text=True,
        capture_output=True,
        check=False,
    )


def _ensure_success(completed: subprocess.CompletedProcess[str], label: str) -> None:
    if completed.returncode == 0:
        return
    detail = (completed.stderr or completed.stdout or "").strip()
    raise RuntimeError(f"{label} fallito" + (f": {detail}" if detail else ""))


def _service_is_active(
    installed: InstalledRegistro,
    *,
    runner: Runner = subprocess.run,
) -> bool:
    completed = _run_sv(installed, "status", runner=runner)
    return completed.returncode == 0 and completed.stdout.lstrip().startswith("run:")


def _loopback_port_in_use(port: int) -> bool:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(0.25)
    try:
        return sock.connect_ex((DEFAULT_BIND_HOST, int(port))) == 0
    finally:
        sock.close()


def _wait_port_free(
    port: int,
    *,
    sleep: Callable[[float], None] = time.sleep,
    attempts: int = 30,
) -> bool:
    for _ in range(attempts):
        if not _loopback_port_in_use(port):
            return True
        sleep(0.1)
    return not _loopback_port_in_use(port)


def start_service(
    installed: InstalledRegistro,
    *,
    runner: Runner = subprocess.run,
    sleep: Callable[[float], None] = time.sleep,
) -> None:
    _verify_installed_identity(installed)
    occupied = _loopback_port_in_use(installed.port)
    active = _service_is_active(installed, runner=runner)

    if not occupied:
        if active:
            stopped = _run_sv(installed, "stop", runner=runner)
            _ensure_success(stopped, "Arresto sincrono trama-registro")
        started = _run_sv(installed, "up", runner=runner)
        _ensure_success(started, "Avvio trama-registro")
        return

    if not active:
        raise RuntimeError(
            f"Porta locale {installed.port} già in uso da un listener legacy/non supervisionato; "
            "arrestarlo esplicitamente prima di avviare trama-registro."
        )

    down = _run_sv(installed, "down", runner=runner)
    _ensure_success(down, "Arresto temporaneo trama-registro per prova ownership")
    if not _wait_port_free(installed.port, sleep=sleep):
        restored = _run_sv(installed, "up", runner=runner)
        _ensure_success(restored, "Ripristino trama-registro dopo ownership non dimostrata")
        raise RuntimeError(
            f"Porta locale {installed.port} resta occupata dopo l'arresto del servizio supervisionato; "
            "listener esterno/non supervisionato rilevato."
        )
    restarted = _run_sv(installed, "up", runner=runner)
    _ensure_success(restarted, "Ripristino trama-registro dopo prova ownership")


def stop_service(
    installed: InstalledRegistro,
    *,
    runner: Runner = subprocess.run,
) -> None:
    completed = _run_sv(installed, "down", runner=runner)
    _ensure_success(completed, "Arresto trama-registro")


def _default_http_get(url: str) -> tuple[int, str]:
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    request = urllib.request.Request(url, headers={"Accept": "text/html"}, method="GET")
    with opener.open(request, timeout=5) as response:
        return int(response.status), response.read(2 * 1024 * 1024).decode("utf-8", errors="replace")


def status_service(installed: InstalledRegistro) -> dict[str, object]:
    active = _service_is_active(installed)
    ready = False
    if active:
        try:
            status, html = _default_http_get(f"http://127.0.0.1:{installed.port}/")
            ready = status == 200 and ("id=\"root\"" in html or "id='root'" in html)
        except Exception:
            ready = False
    return {
        "serviceActive": active,
        "httpReady": ready,
        "candidateSha": installed.candidate_sha,
        "port": installed.port,
    }


def smoke_service(
    installed: InstalledRegistro,
    *,
    http_get: HttpGet = _default_http_get,
    sleep: Callable[[float], None] = time.sleep,
) -> bool:
    start_service(installed)
    url = f"http://127.0.0.1:{installed.port}/"
    last_error: Exception | None = None
    for _ in range(50):
        try:
            status, html = http_get(url)
            if status == 200 and ("id=\"root\"" in html or "id='root'" in html):
                return True
            last_error = RuntimeError(f"HTTP {status} o root marker assente")
        except Exception as exc:
            last_error = exc
        sleep(0.1)
    raise RuntimeError(f"Smoke trama-registro fallito: {last_error}")


def install_boot(installed: InstalledRegistro) -> Path:
    text = render_registro_boot(installed.prefix)
    _atomic_write(installed.boot_path, text, 0o755)
    return installed.boot_path


def _paths_from_env() -> tuple[Path, Path]:
    prefix = os.environ.get("PREFIX")
    home = os.environ.get("HOME")
    if not prefix or not home:
        raise RuntimeError("PREFIX/HOME Termux non disponibili")
    return Path(prefix), Path(home)


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="trama-registro")
    sub = parser.add_subparsers(dest="command", required=True)
    install = sub.add_parser("install")
    install.add_argument("--app-dir", required=True)
    install.add_argument("--runtime-command", required=True)
    install.add_argument("--candidate-sha", required=True)
    install.add_argument("--port", type=int, default=DEFAULT_PORT)
    sub.add_parser("start")
    sub.add_parser("stop")
    sub.add_parser("status")
    sub.add_parser("smoke")
    sub.add_parser("install-boot")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    prefix, home = _paths_from_env()
    if args.command == "install":
        installed = install_service(
            app_dir=Path(args.app_dir),
            runtime_command=Path(args.runtime_command),
            candidate_sha=args.candidate_sha,
            port=args.port,
            prefix=prefix,
            home=home,
        )
        print(f"Configurazione pronta: {installed.config_path}")
        print("Prima attivazione: trama-registro start")
        print(f"Uso quotidiano: apri http://127.0.0.1:{installed.port}")
        return 0

    installed = load_installed(prefix=prefix, home=home)
    if args.command == "start":
        start_service(installed)
        print("Registro Docente locale pronto.")
        return 0
    if args.command == "stop":
        stop_service(installed)
        print("Registro Docente locale arrestato.")
        return 0
    if args.command == "status":
        status = status_service(installed)
        print(
            "Registro: "
            + ("pronto" if status["httpReady"] else "non disponibile")
            + (" (servizio attivo)" if status["serviceActive"] else " (servizio non attivo)")
        )
        print(f"Candidate: {status['candidateSha']}")
        print(f"URL: http://127.0.0.1:{status['port']}")
        return 0 if status["httpReady"] else 1
    if args.command == "smoke":
        smoke_service(installed)
        print("Smoke LOCAL-REG-02: PASS")
        print(f"Candidate: {installed.candidate_sha}")
        print(f"URL: http://127.0.0.1:{installed.port}")
        return 0
    if args.command == "install-boot":
        path = install_boot(installed)
        print(f"Termux:Boot configurato: {path}")
        return 0
    raise RuntimeError(f"Comando non gestito: {args.command}")


if __name__ == "__main__":
    raise SystemExit(main())
