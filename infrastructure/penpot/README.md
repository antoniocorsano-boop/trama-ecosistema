# Penpot self-host baseline for TRAMA

**Status:** PILOT / NON-CANONICAL / NO RUNTIME AUTHORITY  
**Scope:** visual design infrastructure only.

This directory lets TRAMA version and review the **configuration** used to run Penpot without vendoring or forking the Penpot source tree.

## Architecture

- Penpot application runs from official container images.
- PostgreSQL stores Penpot state.
- Valkey provides cache / coordination.
- Penpot MCP is enabled as a dedicated service.
- Penpot assets use a named Docker volume.
- No Penpot service becomes an authority for TRAMA state, evidence, gates or runtime decisions.

TRAMA repository and governed snapshots remain canonical.

## Version policy

The baseline follows the official Penpot Docker topology and currently pins the default Penpot line to `2.18`, matching the upstream Docker compose baseline inspected for this pilot.

Override only through `PENPOT_VERSION` after review.

## Local pilot

1. Copy `.env.example` to `.env`.
2. Generate a strong secret:
   ```bash
   python3 -c "import secrets; print(secrets.token_urlsafe(64))"
   ```
3. Set `PENPOT_SECRET_KEY` and a strong `PENPOT_DATABASE_PASSWORD`.
4. Start:
   ```bash
   docker compose --env-file .env up -d
   ```
5. Open `http://localhost:9001`.
6. Enable the Penpot MCP integration in the account and connect it only after P0/P1 review.

## Security boundary

The default profile is **local pilot only**.

The default flags include:
- `enable-mcp`;
- `disable-email-verification`;
- `disable-secure-session-cookies`.

The last two are acceptable only for localhost / isolated pilot use. **Do not expose this exact configuration to the public Internet.**

Before any remote deployment:

- serve Penpot behind HTTPS;
- remove `disable-secure-session-cookies`;
- remove `disable-email-verification`;
- configure SMTP and verified registration policy;
- rotate all secrets;
- configure backups;
- review CSP / plugin requirements;
- perform a separate security review.

## MCP

The compose file includes the official `penpotapp/mcp` service and `enable-mcp`.

The MCP container is intentionally **not published directly to the host** in this baseline. The Penpot frontend / same-origin integration remains the public boundary.

Do not commit:
- MCP keys;
- URLs containing `userToken`;
- `.env`;
- database dumps;
- user exports.

## Validation

Run:

```bash
python3 infrastructure/penpot/validation/validate_penpot_config.py
```

The validator checks the governance-critical invariants of this baseline. It does not replace `docker compose config`, runtime health checks or human review.

## Relationship to the Control Center

Penpot is a design surface, not part of the public TRAMA Control Center runtime.

The Control Center remains a separately deployed read-only surface. Penpot must never be placed under `control-center/` or served as if it were a static asset bundle.
