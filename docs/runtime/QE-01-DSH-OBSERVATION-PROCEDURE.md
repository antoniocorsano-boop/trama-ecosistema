# QE-01 — DSH real binding observation procedure

**State:** PRE-EXECUTION / READ_ONLY  
**Authority:** TRAMA-ADR-020  
**Capability:** `lesson.preparation.observe`  
**DOS-A1:** `RUNTIME_DEFERRED`

## Purpose

Acquire the real DSH binding required by QE-01 without invoking a model and without reading or persisting credentials.

The observation proves which runtime, adapter, provider, model and profile are actually configured. It does not prove that the endpoint will answer a model request.

## Authoritative DSH configuration surfaces

Current upstream DSH documentation defines:

- active profile configuration at `$DSH_HOME/profiles/<profile>/cordis.patch.yml`;
- default provider/model through `@deepseek-ai/dsh-agent-default-model`;
- pi-ai provider configuration through `@deepseek-ai/dsh-llm-pi-ai`;
- credential values separately under DSH credential storage; QE-01 must not read them.

A provider present only in the installed pi-ai catalog is not sufficient evidence of real configuration.

## Collector

Run from the TRAMA repository on the machine that actually hosts the candidate DSH runtime:

```powershell
python scripts/collect_qe01_dsh_observation.py `
  --profile web `
  --output artifacts/qe01-dsh-observation.json
```

If DSH is installed in a project-local runtime rather than in the default DSH home, add one or more `--runtime-root <path>` arguments so package versions can be read from local `package.json` metadata.

The collector:

- reads only `cordis.patch.yml` and package metadata;
- may invoke only `dsh --version`;
- performs no network request;
- performs no model request;
- never reads `.credentials.yaml`;
- rejects literal secrets found in the profile;
- returns exit code 2 when the observed binding is incomplete.

## Required successful receipt fields

A receipt is complete only when it contains all of:

- DSH runtime version;
- adapter id;
- adapter version;
- provider id;
- model id;
- active profile;
- evidence that the provider is configured in that active profile.

A complete observation remains pre-execution evidence. It does not set `AUTHORIZED_FOR_QUALIFIED_EXECUTION`; the rest of the QE-01 gates and exact-head Human Review remain mandatory.
