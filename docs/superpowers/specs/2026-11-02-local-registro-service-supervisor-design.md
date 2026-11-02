# LOCAL-REG-02 — Registro Docente Termux Service Supervisor

**Status:** APPROVED FOR IMPLEMENTATION

## Intent

Make the locally built Registro Docente application available on Android without requiring the teacher to open Termux or run commands during ordinary use.

Target daily experience:

`Android boot -> Termux:Boot -> runit -> trama-registro@127.0.0.1:4173 -> teacher taps Registro Docente home-screen shortcut`.

Local Semantic Memory remains a separate optional capability. The application may be available while semantic memory still requires the explicit in-app `Attiva memoria locale` gesture for each browser session.

## Goals

- Add a dedicated runit service named `trama-registro`.
- Bind only to `127.0.0.1` on port `4173`.
- Run an already-built production Registro Docente checkout; boot must never run Git, dependency installation, or application build commands.
- Require the application root, `server.ts`, `package.json`, `dist/index.html`, Bun/Node runtime command, exact configured commit marker, a clean tracked Git worktree, and a deterministic digest of the complete `dist/` tree before service installation succeeds.
- Start with `NODE_ENV=production`, `PORT=4173`, `TRAMA_BIND_HOST=127.0.0.1`.
- Supervise stdout/stderr using the same `svlogger` pattern as LSM-01E.
- Provide one command `trama-registro` with `install`, `start`, `stop`, `status`, `smoke`, and `install-boot`.
- Detect a legacy/non-supervised listener on 4173 and fail closed rather than killing it.
- Boot support must remain optional and idempotent.

## Non-goals

- No source checkout, pull, merge, update, dependency install, or production build at boot or `start`.
- No deployment/publication to AI Studio, Render, or any remote service.
- No browser token storage or automatic Local Semantic Memory activation.
- No APK/native wrapper in this slice.
- No modification of Registro professional data.

## Architecture

Create a focused runtime under `runtime/local-registro-service/` rather than coupling application supervision into `trama-memory`.

Files:

- `registro_supervisor.py`: pure configuration validation and run/boot-script rendering.
- `trama_registro.py`: installation, atomic file publication/rollback, runit control, ownership check, status, smoke, CLI.
- `tests/`: focused unit/contract tests.
- `README.md`: operational runbook.

Installed state:

- config: `~/.config/trama-registro/config.env` mode 0600;
- wrapper: `$PREFIX/bin/trama-registro` mode 0755;
- service: `$PREFIX/var/service/trama-registro`;
- supervised log: `$PREFIX/var/log/sv/trama-registro/current` through `svlogger`;
- frozen controller copies: `$PREFIX/libexec/trama-registro/trama_registro.py` and `$PREFIX/libexec/trama-registro/registro_supervisor.py`;
- optional boot script: `~/.termux/boot/30-trama-registro`.

## Configuration contract

Required install inputs:

- `--app-dir PATH`: exact local Registro checkout/release directory;
- `--runtime-command PATH`: executable used to run `server.ts` (default can be resolved by caller, not downloaded);
- `--candidate-sha SHA`: expected Git commit identity of the prepared checkout;
- `--port 4173` default.

The installer validates:

1. app directory exists;
2. `server.ts`, `package.json`, `dist/index.html` exist;
3. runtime command exists and is executable;
4. `git -C APP rev-parse HEAD` equals `--candidate-sha`;
5. `git status --porcelain --untracked-files=no` reports no staged/unstaged changes to tracked files;
6. a deterministic SHA-256 digest freezes the complete `dist/` file tree, including relative paths and file contents;
7. checkout is not mutated by installation;
8. port is valid and not equal to reserved LSM ports 8080/8765 by default configuration.

## Service run contract

The generated `run` script must:

- `set -eu`;
- `exec 2>&1`;
- export `NODE_ENV=production`;
- export `PORT=4173`;
- export `TRAMA_BIND_HOST=127.0.0.1`;
- `cd` to the configured application directory;
- execute the configured runtime command with `server.ts` directly;
- never invoke `git`, package installation, or build commands.

## Ownership and lifecycle

`start` mirrors LSM-01E fail-closed semantics:

- if 4173 is free and service is down, start it;
- if 4173 is free but service is reported active, synchronously restart it so current config is applied;
- if 4173 is occupied and service is not active, report a legacy/non-supervised listener and stop;
- if 4173 is occupied and service is active, temporarily stop the service and prove the port becomes free within a bounded interval; restore only when ownership is proven;
- no automatic kill/pkill.

`stop` acts only on the supervised service.

## Health and smoke

`status` reports separately:

- supervisor service active/down;
- installed identity verified/not verified (exact SHA, clean tracked worktree, complete `dist/` digest);
- HTTP application ready/unavailable, queried only when identity verification succeeds;
- exact configured candidate SHA.

`smoke`:

1. requires service ownership and starts the service if needed;
2. GETs `http://127.0.0.1:4173/` with proxies disabled;
3. requires HTTP 200 and an HTML document containing the application root marker (`id="root"`);
4. verifies no listener is required on a non-loopback address by configuration contract (runtime uses `TRAMA_BIND_HOST=127.0.0.1`);
5. does not mutate application data.

## Termux:Boot

`install-boot` writes only `~/.termux/boot/30-trama-registro`.

Boot script:

- sources `start-services.sh`;
- waits a bounded 30 seconds for `$SVDIR/trama-registro/supervise/ok`;
- invokes the frozen `$PREFIX/bin/trama-registro start` controller, which revalidates exact SHA, clean tracked worktree, and the complete `dist/` digest before issuing `sv up`;
- does not start or configure semantic memory itself;
- coexists with existing `20-trama-memory-services` when both are installed.

Ordering is intentional: LSM services use prefix 20; Registro uses prefix 30. This does not grant the browser an LSM session automatically.

## Security boundaries

- Registro service is loopback-only.
- No secret is introduced by this supervisor.
- Existing `.env` handling of Registro remains unchanged; the supervisor neither reads nor writes provider secrets.
- The configured checkout identity is frozen at install time; runtime start never updates it.
- The installed CLI executes frozen controller copies under `$PREFIX/libexec/trama-registro`, not Python files from a mutable TRAMA checkout.
- A dirty tracked Registro worktree fails closed at install/start/status/smoke; untracked files are not treated as Git identity evidence.
- A missing or changed `dist/` fails installation/start/status/smoke rather than triggering a build.

## Acceptance

1. RED→GREEN tests prove run script loopback-only and no build/update commands.
2. Install is atomic with rollback and rejects missing `dist/index.html`, SHA mismatch, dirty tracked worktree, or complete-`dist/` digest drift.
3. Installed controller code is frozen under `libexec`, so ordinary execution is independent from later changes to the TRAMA source checkout.
4. Ownership tests cover legacy listener and supervised listener release race.
5. Boot script is bounded, idempotent, service-specific, and routes through guarded `trama-registro start`.
6. Governance exact-SHA suite PASS.
7. Android/Termux hardware qualification proves `trama-registro start/status/smoke`, then opening `http://127.0.0.1:4173` on the device.
8. Final user journey proves the app opens from a home-screen shortcut without opening Termux.