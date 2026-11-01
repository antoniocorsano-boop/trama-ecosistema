from __future__ import annotations

import argparse
from dataclasses import dataclass
import os
from pathlib import Path
import shlex
import subprocess
import sys
import tempfile
import time
from typing import Callable, Sequence
import urllib.error
import urllib.request

from termux_supervisor import (
    SupervisorConfig,
    render_boot_script,
    render_embedding_run,
    render_memoryd_run,
    validate_origin,
)


DEFAULT_PREFIX = Path('/data/data/com.termux/files/usr')


@dataclass(frozen=True)
class InstalledStack:
    home: Path
    prefix: Path
    config_path: Path
    wrapper_path: Path
    service_root: Path
    config: SupervisorConfig


def _as_path(value: str | os.PathLike[str] | Path) -> Path:
    return Path(value).expanduser().resolve()


def _require_existing_file(path: Path, label: str, *, executable: bool = False) -> None:
    if not path.is_file():
        raise ValueError(f'{label} non trovato: {path}')
    if executable and not os.access(path, os.X_OK):
        raise ValueError(f'{label} non eseguibile: {path}')


def _require_existing_dir(path: Path, label: str) -> None:
    if not path.is_dir():
        raise ValueError(f'{label} non trovata: {path}')


def _atomic_write(path: Path, content: str, mode: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(prefix=f'.{path.name}.', dir=str(path.parent), text=True)
    tmp_path = Path(tmp_name)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8', newline='\n') as handle:
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(tmp_path, mode)
        os.replace(tmp_path, path)
    finally:
        if tmp_path.exists():
            tmp_path.unlink()


def _env_line(key: str, value: str | int) -> str:
    return f'{key}={shlex.quote(str(value))}'


def _render_config(config: SupervisorConfig) -> str:
    return '\n'.join([
        '# LSM-01E — configurazione locale non segreta',
        _env_line('TRAMA_RUNTIME_DIR', config.runtime_dir),
        _env_line('TRAMA_LLAMA_SERVER', config.llama_server),
        _env_line('TRAMA_MODEL', config.model),
        _env_line('TRAMA_MEMORY_HOME', config.memory_home),
        _env_line('TRAMA_ALLOWED_ORIGINS', ','.join(config.allowed_origins)),
        _env_line('TRAMA_EMBEDDING_PORT', config.embedding_port),
        _env_line('TRAMA_MEMORY_PORT', config.memory_port),
        _env_line('TRAMA_SESSION_TTL_SECONDS', config.session_ttl_seconds),
        _env_line('TRAMA_EMBEDDING_MODEL', config.embedding_model),
        '',
    ])


def _render_wrapper(runtime_dir: Path) -> str:
    script = runtime_dir / 'trama_memory.py'
    return '\n'.join([
        '#!/data/data/com.termux/files/usr/bin/sh',
        'set -eu',
        f'exec python3 {shlex.quote(str(script))} "$@"',
        '',
    ])


def install_stack(
    *,
    home: str | os.PathLike[str] | Path,
    prefix: str | os.PathLike[str] | Path,
    runtime_dir: str | os.PathLike[str] | Path,
    llama_server: str | os.PathLike[str] | Path,
    model: str | os.PathLike[str] | Path,
    origins: Sequence[str],
    embedding_port: int = 8080,
    memory_port: int = 8765,
    session_ttl_seconds: int = 28800,
    embedding_model: str = 'embeddinggemma-2-local',
) -> InstalledStack:
    home_path = _as_path(home)
    prefix_path = _as_path(prefix)
    runtime_path = _as_path(runtime_dir)
    llama_path = _as_path(llama_server)
    model_path = _as_path(model)

    # Fail closed before creating any file or service directory.
    _require_existing_dir(runtime_path, 'Runtime LSM')
    _require_existing_file(runtime_path / 'main.py', 'main.py del runtime LSM')
    _require_existing_file(runtime_path / 'trama_memory.py', 'CLI trama-memory')
    _require_existing_file(llama_path, 'llama-server', executable=True)
    _require_existing_file(model_path, 'Modello GGUF')
    normalized_origins = tuple(validate_origin(origin) for origin in origins)

    config = SupervisorConfig(
        runtime_dir=runtime_path,
        llama_server=llama_path,
        model=model_path,
        memory_home=home_path / '.local' / 'share' / 'trama-semantic-memory',
        allowed_origins=normalized_origins,
        embedding_port=embedding_port,
        memory_port=memory_port,
        session_ttl_seconds=session_ttl_seconds,
        embedding_model=embedding_model,
    )

    config_path = home_path / '.config' / 'trama-memory' / 'config.env'
    wrapper_path = prefix_path / 'bin' / 'trama-memory'
    service_root = prefix_path / 'var' / 'service'

    rendered_config = _render_config(config)
    rendered_wrapper = _render_wrapper(runtime_path)
    embedding_run = render_embedding_run(config)
    memoryd_run = render_memoryd_run(config)

    _atomic_write(config_path, rendered_config, 0o600)
    _atomic_write(wrapper_path, rendered_wrapper, 0o755)
    for service_name, run_script in (
        ('trama-embedding', embedding_run),
        ('trama-memoryd', memoryd_run),
    ):
        service_dir = service_root / service_name
        _atomic_write(service_dir / 'run', run_script, 0o755)
        # runit interprets an existing `down` file as "do not auto-start".
        _atomic_write(service_dir / 'down', '', 0o644)

    return InstalledStack(
        home=home_path,
        prefix=prefix_path,
        config_path=config_path,
        wrapper_path=wrapper_path,
        service_root=service_root,
        config=config,
    )


def _parse_env_file(path: Path) -> dict[str, str]:
    if not path.is_file():
        raise ValueError('trama-memory non è configurato. Eseguire prima `trama-memory install`.')
    values: dict[str, str] = {}
    for raw_line in path.read_text(encoding='utf-8').splitlines():
        line = raw_line.strip()
        if not line or line.startswith('#'):
            continue
        if '=' not in line:
            raise ValueError(f'Riga di configurazione non valida: {raw_line}')
        key, raw_value = line.split('=', 1)
        parsed = shlex.split(raw_value, posix=True)
        if len(parsed) != 1:
            raise ValueError(f'Valore di configurazione non valido per {key}')
        values[key] = parsed[0]
    return values


def load_installed(
    *,
    home: str | os.PathLike[str] | Path,
    prefix: str | os.PathLike[str] | Path,
) -> InstalledStack:
    home_path = _as_path(home)
    prefix_path = _as_path(prefix)
    config_path = home_path / '.config' / 'trama-memory' / 'config.env'
    values = _parse_env_file(config_path)

    required = {
        'TRAMA_RUNTIME_DIR', 'TRAMA_LLAMA_SERVER', 'TRAMA_MODEL', 'TRAMA_MEMORY_HOME',
        'TRAMA_ALLOWED_ORIGINS', 'TRAMA_EMBEDDING_PORT', 'TRAMA_MEMORY_PORT',
        'TRAMA_SESSION_TTL_SECONDS', 'TRAMA_EMBEDDING_MODEL',
    }
    missing = sorted(required - values.keys())
    if missing:
        raise ValueError(f'Configurazione incompleta: {", ".join(missing)}')

    origins = tuple(value for value in values['TRAMA_ALLOWED_ORIGINS'].split(',') if value)
    config = SupervisorConfig(
        runtime_dir=_as_path(values['TRAMA_RUNTIME_DIR']),
        llama_server=_as_path(values['TRAMA_LLAMA_SERVER']),
        model=_as_path(values['TRAMA_MODEL']),
        memory_home=_as_path(values['TRAMA_MEMORY_HOME']),
        allowed_origins=origins,
        embedding_port=int(values['TRAMA_EMBEDDING_PORT']),
        memory_port=int(values['TRAMA_MEMORY_PORT']),
        session_ttl_seconds=int(values['TRAMA_SESSION_TTL_SECONDS']),
        embedding_model=values['TRAMA_EMBEDDING_MODEL'],
    )
    return InstalledStack(
        home=home_path,
        prefix=prefix_path,
        config_path=config_path,
        wrapper_path=prefix_path / 'bin' / 'trama-memory',
        service_root=prefix_path / 'var' / 'service',
        config=config,
    )


def wait_http_ready(url: str, *, timeout_seconds: float = 60.0) -> bool:
    deadline = time.monotonic() + max(0.1, timeout_seconds)
    while time.monotonic() < deadline:
        try:
            request = urllib.request.Request(url, method='GET')
            with urllib.request.urlopen(request, timeout=2) as response:
                if 200 <= response.status < 300:
                    return True
        except (urllib.error.URLError, TimeoutError, OSError):
            pass
        time.sleep(0.25)
    return False


def _run_sv(
    installed: InstalledStack,
    action: str,
    service_name: str,
    *,
    runner: Callable[..., object] = subprocess.run,
) -> object:
    sv = installed.prefix / 'bin' / 'sv'
    service_dir = installed.service_root / service_name
    return runner(
        [str(sv), action, str(service_dir)],
        capture_output=True,
        text=True,
        check=False,
    )


def _ensure_success(result: object, label: str) -> None:
    if getattr(result, 'returncode', 1) != 0:
        stderr = str(getattr(result, 'stderr', '')).strip()
        raise RuntimeError(f'{label} non riuscito' + (f': {stderr}' if stderr else '.'))


def start_stack(
    installed: InstalledStack,
    *,
    runner: Callable[..., object] = subprocess.run,
    health_check: Callable[..., bool] = wait_http_ready,
) -> None:
    result = _run_sv(installed, 'up', 'trama-embedding', runner=runner)
    _ensure_success(result, 'Avvio embedding')

    embedding_health = f'http://127.0.0.1:{installed.config.embedding_port}/health'
    if not health_check(embedding_health, timeout_seconds=60):
        _run_sv(installed, 'down', 'trama-embedding', runner=runner)
        raise RuntimeError('Embedding locale non disponibile; memoria non avviata.')

    try:
        result = _run_sv(installed, 'up', 'trama-memoryd', runner=runner)
        _ensure_success(result, 'Avvio memoria')
        memory_health = f'http://127.0.0.1:{installed.config.memory_port}/v1/health'
        if not health_check(memory_health, timeout_seconds=60):
            raise RuntimeError('Memoria locale non disponibile dopo l’avvio.')
    except Exception:
        # A failed stack start must not leave the embedding server consuming
        # phone resources after memoryd has failed to become usable.
        for service_name in ('trama-memoryd', 'trama-embedding'):
            try:
                _run_sv(installed, 'down', service_name, runner=runner)
            except OSError:
                pass
        raise


def stop_stack(
    installed: InstalledStack,
    *,
    runner: Callable[..., object] = subprocess.run,
) -> None:
    first = _run_sv(installed, 'down', 'trama-memoryd', runner=runner)
    second = _run_sv(installed, 'down', 'trama-embedding', runner=runner)
    _ensure_success(first, 'Arresto memoria')
    _ensure_success(second, 'Arresto embedding')


def status_stack(
    installed: InstalledStack,
    *,
    runner: Callable[..., object] = subprocess.run,
    health_check: Callable[..., bool] = wait_http_ready,
) -> dict[str, object]:
    embedding_service = _run_sv(installed, 'status', 'trama-embedding', runner=runner)
    memory_service = _run_sv(installed, 'status', 'trama-memoryd', runner=runner)
    return {
        'embedding_service': getattr(embedding_service, 'returncode', 1) == 0,
        'memory_service': getattr(memory_service, 'returncode', 1) == 0,
        'embedding_ready': health_check(
            f'http://127.0.0.1:{installed.config.embedding_port}/health', timeout_seconds=1
        ),
        'memory_ready': health_check(
            f'http://127.0.0.1:{installed.config.memory_port}/v1/health', timeout_seconds=1
        ),
    }


def format_status(status: dict[str, object]) -> str:
    embedding = 'pronto' if status.get('embedding_ready') else 'non disponibile'
    memory = 'pronta' if status.get('memory_ready') else 'non disponibile'
    embedding_service = 'attivo' if status.get('embedding_service') else 'non attivo'
    memory_service = 'attivo' if status.get('memory_service') else 'non attivo'
    return (
        f'Embedding: {embedding} (servizio {embedding_service})\n'
        f'Memoria: {memory} (servizio {memory_service})'
    )


def install_boot(
    *,
    home: str | os.PathLike[str] | Path,
    prefix: str | os.PathLike[str] | Path,
) -> Path:
    home_path = _as_path(home)
    prefix_path = _as_path(prefix)
    boot_path = home_path / '.termux' / 'boot' / '20-trama-memory-services'
    _atomic_write(boot_path, render_boot_script(prefix_path), 0o700)
    return boot_path


class ServiceSmokeControl:
    def __init__(
        self,
        installed: InstalledStack,
        *,
        runner: Callable[..., object] = subprocess.run,
    ) -> None:
        self.installed = installed
        self.runner = runner

    def restart_memoryd(self) -> None:
        down = _run_sv(self.installed, 'down', 'trama-memoryd', runner=self.runner)
        _ensure_success(down, 'Arresto memoria per smoke')
        up = _run_sv(self.installed, 'up', 'trama-memoryd', runner=self.runner)
        _ensure_success(up, 'Riavvio memoria per smoke')


def _resolve_smoke_origin(installed: InstalledStack, requested: str | None) -> str:
    allowed = installed.config.allowed_origins
    if requested:
        exact = validate_origin(requested)
        if exact not in allowed:
            raise ValueError('Origine smoke non presente nella configurazione autorizzata.')
        return exact
    if len(allowed) == 1:
        return allowed[0]
    raise ValueError('Più origini configurate: specificare `--origin` per lo smoke.')


def _format_smoke_report(report: dict[str, object]) -> str:
    timings = report.get('timingsMs') if isinstance(report.get('timingsMs'), dict) else {}
    return '\n'.join([
        'Smoke LSM-01E: PASS',
        f'Modello: {report.get("modelId")}',
        f'Dimensioni: {report.get("dimensions")}',
        f'Revisione indice: {report.get("indexRevision")}',
        f'Invalidazione sessione al restart: {report.get("sessionInvalidation")}',
        f'Persistenza indice al restart: {report.get("persistenceAfterRestart")}',
        f'Ricerca semantica: {report.get("semanticSearch")}',
        f'Cleanup sintetico: {report.get("cleanup")}',
        'Latenze indicative (ms): '
        f'upsert={timings.get("upsert")}, '
        f'ricerca-pre={timings.get("searchBeforeRestart")}, '
        f'ricerca-post={timings.get("searchAfterRestart")}',
    ])


def _default_home() -> str:
    return str(Path.home())


def _default_prefix() -> str:
    return os.environ.get('PREFIX', str(DEFAULT_PREFIX))


def _add_common_paths(parser: argparse.ArgumentParser) -> None:
    parser.add_argument('--home', default=_default_home())
    parser.add_argument('--prefix', default=_default_prefix())


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog='trama-memory')
    subparsers = parser.add_subparsers(dest='command', required=True)

    install = subparsers.add_parser('install', help='Configura una volta i servizi locali')
    _add_common_paths(install)
    install.add_argument('--runtime-dir', required=True)
    install.add_argument('--llama-server', required=True)
    install.add_argument('--model', required=True)
    install.add_argument('--origin', action='append', required=True)
    install.add_argument('--embedding-port', type=int, default=8080)
    install.add_argument('--memory-port', type=int, default=8765)
    install.add_argument('--session-ttl-seconds', type=int, default=28800)
    install.add_argument('--embedding-model', default='embeddinggemma-2-local')

    for name, help_text in (
        ('start', 'Avvia memoria locale e embedding'),
        ('stop', 'Arresta memoria locale e embedding'),
        ('status', 'Mostra lo stato locale'),
        ('install-boot', 'Predisponi l’avvio tramite Termux:Boot'),
    ):
        command = subparsers.add_parser(name, help=help_text)
        _add_common_paths(command)

    smoke = subparsers.add_parser('smoke', help='Esegue la qualifica hardware sintetica in un comando')
    _add_common_paths(smoke)
    smoke.add_argument('--origin', default=None)

    return parser


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        if args.command == 'install':
            installed = install_stack(
                home=args.home,
                prefix=args.prefix,
                runtime_dir=args.runtime_dir,
                llama_server=args.llama_server,
                model=args.model,
                origins=tuple(args.origin),
                embedding_port=args.embedding_port,
                memory_port=args.memory_port,
                session_ttl_seconds=args.session_ttl_seconds,
                embedding_model=args.embedding_model,
            )
            print(f'Configurazione pronta: {installed.config_path}')
            print('Prima attivazione dei servizi: trama-memory start')
            print('Uso quotidiano: apri Registro Docente e scegli “Attiva memoria locale”.')
            return 0

        if args.command == 'install-boot':
            path = install_boot(home=args.home, prefix=args.prefix)
            print(f'Avvio al boot predisposto: {path}')
            return 0

        installed = load_installed(home=args.home, prefix=args.prefix)
        if args.command == 'start':
            start_stack(installed)
            print('Memoria locale pronta.')
            return 0
        if args.command == 'stop':
            stop_stack(installed)
            print('Memoria locale arrestata.')
            return 0
        if args.command == 'status':
            print(format_status(status_stack(installed)))
            return 0
        if args.command == 'smoke':
            from hardware_smoke import run_smoke

            start_stack(installed)
            origin = _resolve_smoke_origin(installed, args.origin)
            report = run_smoke(
                base_url=f'http://127.0.0.1:{installed.config.memory_port}',
                origin=origin,
                control=ServiceSmokeControl(installed),
            )
            print(_format_smoke_report(report))
            return 0
    except (ValueError, RuntimeError, OSError) as exc:
        print(f'ERRORE: {exc}', file=sys.stderr)
        return 1

    parser.error(f'Comando non gestito: {args.command}')
    return 2


if __name__ == '__main__':
    raise SystemExit(main())