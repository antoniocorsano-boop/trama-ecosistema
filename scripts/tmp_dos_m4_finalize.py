#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

PRODUCT_HEAD = "39bce05fa2e87f3746ee3b6dcd7433065cb2d876"
DEPLOY_REF = "dep-db2ke2ajnfac73f3qoog"
RUN_ID = "37560864731"
ARTIFACT_ID = "11457120823"
ARTIFACT_DIGEST = "sha256:8bfab50dd0505a8a1b05c84f16c5ba3fa4610b9f7fa62a122afcaf07cf62ccc1"
OBSERVED_AT = "2026-10-07T02:13:36.899Z"
EVIDENCE_ID = "EV-MAT-DOS-RUNTIME-CANARY-2026-10-07"


def write_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly one occurrence, found {count}: {old!r}")
    return text.replace(old, new, 1)


# 1) Governed maturity evidence registry: add the version-bound runtime canary.
registry_path = ROOT / "governance/maturity/trama-maturity-evidence-registry-v1.json"
registry = json.loads(registry_path.read_text(encoding="utf-8"))
registry["updatedAt"] = "2026-10-07"
registry["evidence"] = [item for item in registry["evidence"] if item.get("id") != EVIDENCE_ID]
registry["evidence"].append(
    {
        "id": EVIDENCE_ID,
        "type": "RUNTIME_CANARY",
        "area": "docente-os",
        "subject": "Docente OS real timetable runtime canary on canonical Beta",
        "status": "PASS",
        "source": {
            "ref": f"github-actions:docente-os-2026-27/run/{RUN_ID}",
            "path": "docs/qualification/DOS-M4-01-runtime-canary.md",
            "repository": "antoniocorsano-boop/docente-os-2026-27",
            "runId": RUN_ID,
        },
        "observedAt": OBSERVED_AT,
        "freshness": {"policy": "RUNTIME_BOUND"},
        "confidence": "HIGH",
        "supports": [{"level": 4}],
        "binding": {
            "areaRef": "docente-os",
            "releaseRef": DEPLOY_REF,
            "exactHead": PRODUCT_HEAD,
        },
    }
)
write_json(registry_path, registry)

# 2) Current reconciliation registry: Docente OS is now observed at L4; L5 remains stability/adoption-bound.
recon_path = ROOT / "governance/maturity/trama-maturity-reconciliation-v1.json"
recon = json.loads(recon_path.read_text(encoding="utf-8"))
recon["updatedAt"] = "2026-10-07"
dos = next(item for item in recon["areas"] if item["area"] == "docente-os")
dos.update(
    {
        "observedLevel": 4,
        "target": "L5_AFTER_STABILITY_AND_ADOPTION",
        "nextWork": [
            "collect version-bound regression history",
            "collect adoption evidence without student tracking",
        ],
        "l5Gap": ["REGRESSION_HISTORY", "ADOPTION_EVIDENCE"],
    }
)
write_json(recon_path, recon)

# 3) Deterministic registry binding test.
binding_path = ROOT / "scripts/test_maturity_evidence_binding.py"
binding = binding_path.read_text(encoding="utf-8")
binding = replace_once(
    binding,
    "# Registry-only expectations are conservative. Atlas still needs the existing\n# governed exit accessibility/human projection; Docente OS intentionally lacks\n# a version-bound runtime canary.",
    "# Registry-only expectations remain conservative. Atlas still needs the existing\n# governed exit accessibility/human projection; Docente OS now has the\n# version-bound runtime canary required for L4.",
    "binding comment",
)
binding = replace_once(
    binding,
    'assert results["docente-os"]["confirmedLevel"] == 3, results["docente-os"]',
    'assert results["docente-os"]["confirmedLevel"] == 4, results["docente-os"]',
    "binding docente level",
)
binding = replace_once(
    binding,
    'assert "RUNTIME_CANARY" not in dos_types',
    'assert "RUNTIME_CANARY" in dos_types\nassert "EV-MAT-DOS-RUNTIME-CANARY-2026-10-07" in results["docente-os"]["currentEvidenceRefs"]',
    "binding runtime type",
)
binding = replace_once(
    binding,
    'assert "no `RUNTIME_CANARY` evidence is promoted by this slice" in receipt\n',
    '',
    "historical no-canary assertion",
)
binding_path.write_text(binding, encoding="utf-8")

# 4) Reconciliation test: L4 is deterministic and the next gap is L5 stability/adoption.
recon_test_path = ROOT / "scripts/test_maturity_reconciliation.py"
recon_test = recon_test_path.read_text(encoding="utf-8")
recon_test = replace_once(recon_test, 'assert areas["docente-os"]["confirmedLevel"]==3', 'assert areas["docente-os"]["confirmedLevel"]==4', "recon level")
recon_test = replace_once(recon_test, 'assert areas["docente-os"]["nextTargetLevel"]==4', 'assert areas["docente-os"]["nextTargetLevel"]==5', "recon next target")
recon_test = replace_once(
    recon_test,
    'assert areas["docente-os"]["nextRequiredEvidenceTypes"]==["RUNTIME_CANARY"]',
    'assert set(areas["docente-os"]["nextRequiredEvidenceTypes"])=={"REGRESSION_HISTORY","ADOPTION_EVIDENCE"}',
    "recon next evidence",
)
old_no_runtime = '''assert not any(\n    item.get("area")=="docente-os" and item.get("type")=="RUNTIME_CANARY"\n    for item in snapshot["evidence"]\n)'''
new_runtime = '''assert any(\n    item.get("id")=="EV-MAT-DOS-RUNTIME-CANARY-2026-10-07"\n    and item.get("type")=="RUNTIME_CANARY"\n    and (item.get("binding") or {}).get("exactHead")=="39bce05fa2e87f3746ee3b6dcd7433065cb2d876"\n    for item in snapshot["evidence"]\n)'''
recon_test = replace_once(recon_test, old_no_runtime, new_runtime, "recon runtime evidence")
recon_test = replace_once(
    recon_test,
    '"governance":4,"arena":4,"atlas":4,"docente-os":3,"studio-atlas":1',
    '"governance":4,"arena":4,"atlas":4,"docente-os":4,"studio-atlas":1',
    "reconciliation registry expected levels",
)
recon_test_path.write_text(recon_test, encoding="utf-8")

# 5) Control Center workflow's embedded conservative wiring assertions.
workflow_path = ROOT / ".github/workflows/control-center-snapshot.yml"
workflow = workflow_path.read_text(encoding="utf-8")
workflow = replace_once(
    workflow,
    'assert areas["docente-os"]["confirmedLevel"] == 3, areas["docente-os"]',
    'assert areas["docente-os"]["confirmedLevel"] == 4, areas["docente-os"]',
    "workflow docente level",
)
workflow = replace_once(
    workflow,
    'assert areas["docente-os"]["nextRequiredEvidenceTypes"] == ["RUNTIME_CANARY"], areas["docente-os"]',
    'assert set(areas["docente-os"]["nextRequiredEvidenceTypes"]) == {"REGRESSION_HISTORY", "ADOPTION_EVIDENCE"}, areas["docente-os"]',
    "workflow next evidence",
)
old_workflow_no_runtime = '''          assert not any(\n              item.get("area") == "docente-os" and item.get("type") == "RUNTIME_CANARY"\n              for item in snapshot["evidence"]\n          )'''
new_workflow_runtime = '''          assert any(\n              item.get("id") == "EV-MAT-DOS-RUNTIME-CANARY-2026-10-07"\n              and item.get("type") == "RUNTIME_CANARY"\n              and (item.get("binding") or {}).get("exactHead") == "39bce05fa2e87f3746ee3b6dcd7433065cb2d876"\n              for item in snapshot["evidence"]\n          )'''
workflow = replace_once(workflow, old_workflow_no_runtime, new_workflow_runtime, "workflow runtime evidence")
workflow_path.write_text(workflow, encoding="utf-8")

# 6) Qualification dossier: canonicalize the observed runtime proof and keep final Human Review pending.
dossier_path = ROOT / "docs/qualification/DOS-M4-01-runtime-canary.md"
dossier = f'''# DOS-M4-01 — Docente OS L3 → L4 runtime-canary qualification

**Stato:** CANARY_PASS / L4_PROJECTED — HUMAN_EXACT_HEAD_REVIEW_PENDING  
**Data:** 7 ottobre 2026  
**Ambito:** Docente OS product maturity  
**Authority effect:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Obiettivo

Chiudere in modo evidence-bound il gap formale che separava Docente OS da L4 nel modello TRAMA, acquisendo una `RUNTIME_CANARY` reale, version-bound e verificabile.

La qualificazione non autorizza Production, non cambia authority, non abilita DOS-A1 e non riapre superfici UX deliberate come legacy.

## 2. Baseline osservata

- repository prodotto: `antoniocorsano-boop/docente-os-2026-27`;
- active development ref: `develop`;
- exact product head: `{PRODUCT_HEAD}`;
- Beta canonica Render: deploy `{DEPLOY_REF}`, LIVE sullo stesso SHA;
- `/api/build-info`: exact-head binding PASS prima della mutazione;
- AAL2 governato: PASS tramite credenziali tecniche E2E;
- workflow finale: `https://github.com/antoniocorsano-boop/docente-os-2026-27/actions/runs/{RUN_ID}`;
- artifact finale: `{ARTIFACT_ID}` (`{ARTIFACT_DIGEST}`).

La prova resta `RUNTIME_BOUND`: un futuro drift del prodotto richiede una nuova canary e non consente il riuso sintetico di questa evidenza.

## 3. Percorso professionale verificato

La canary ha eseguito sul runtime Beta reale:

1. apertura di **Orario**;
2. modifica persistente di un dato reale nel workspace tecnico E2E;
3. impostazione della decorrenza;
4. **Metti in uso** con mutazione reale Supabase;
5. riapertura e reload della vista;
6. verifica della persistenza del marker;
7. verifica browser della nuova bozza derivata dalla versione attiva;
8. seconda sostituzione reale per produrre lineage osservabile;
9. verifica read-only indipendente del datastore: `ACTIVE + DRAFT + ARCHIVED`, con conservazione dei marker nelle versioni precedenti.

Esito: **PASS**.

## 4. Evidenza browser

Ricevuta prodotta dal run `{RUN_ID}`:

```yaml
id: EV-MAT-DOS-RUNTIME-CANARY-BROWSER-2026-10-07
type: RUNTIME_CANARY_BROWSER
area: docente-os
status: PASS
source:
  repository: antoniocorsano-boop/docente-os-2026-27
  ref: {DEPLOY_REF}
observedAt: "{OBSERVED_AT}"
freshness:
  policy: RUNTIME_BOUND
confidence: HIGH
binding:
  areaRef: docente-os
  releaseRef: {DEPLOY_REF}
  exactHead: {PRODUCT_HEAD}
evidence:
  workflowRun: "https://github.com/antoniocorsano-boop/docente-os-2026-27/actions/runs/{RUN_ID}"
  aal2: true
  realSupabase: true
  persistedAfterReload: true
  replacementPerformed: true
  nextDraftCopyObserved: true
  activationCount: 2
  finalMarker: "DOS-M4-CANARY-1791339228338-HISTORY"
  effectiveFrom: 2026-10-08
```

## 5. Verifica indipendente di lineage e storico

Una query **read-only** sul progetto Supabase effettivamente usato dalla Beta ha verificato, per il marker finale della canary:

- una versione `ACTIVE` con decorrenza `2026-10-08` e marker finale presente;
- una nuova versione `DRAFT` con copia del marker finale;
- più versioni `ARCHIVED` con intervalli di efficacia chiusi;
- conservazione del marker precedente nelle versioni storiche;
- nessuna perdita dello storico osservato.

La lettura Supabase non ha effettuato mutazioni: tutte le scritture della canary sono avvenute esclusivamente attraverso il flusso browser del prodotto.

## 6. Nota sulla route legacy `/orario/gestisci`

La route non costituisce un blocker DOS-M4. PR Docente OS #684 l'ha deliberatamente trasformata in compatibilità verso `/orario/aggiorna?fase=controllo` per preservare il flusso semplice:

`Orario → Modifica → Data → Controlla → Metti in uso → Orario`.

La qualificazione non reintroduce la vecchia UI tecnica: lineage e storico sono stati verificati senza alterare l'esperienza approvata.

## 7. Evidenza canonica promossa nel registry

Questa PR aggiunge al maturity evidence registry:

```yaml
id: {EVIDENCE_ID}
type: RUNTIME_CANARY
area: docente-os
status: PASS
observedAt: "{OBSERVED_AT}"
freshness:
  policy: RUNTIME_BOUND
confidence: HIGH
supports:
  - level: 4
binding:
  areaRef: docente-os
  releaseRef: {DEPLOY_REF}
  exactHead: {PRODUCT_HEAD}
```

La proiezione resta read-only e `automaticPromotion=false`.

## 8. Risultato di maturità atteso

Con la `RUNTIME_CANARY` version-bound disponibile insieme alle evidenze già canoniche, la proiezione deterministica deve risultare:

- `Docente OS confirmedLevel = 4`;
- `nextTargetLevel = 5`;
- `nextRequiredEvidenceTypes = REGRESSION_HISTORY + ADOPTION_EVIDENCE`;
- `DOS-A1 = RUNTIME_DEFERRED` invariato.

L4 non implica Production né runtime authorization aggiuntiva.

## 9. Criterio di uscita della PR

DOS-M4-01 può diventare `CLOSED / L4 VERIFIED` soltanto quando, sul **medesimo exact head TRAMA** della PR:

- registry e snapshot proiettano deterministicamente `confirmedLevel = 4`;
- i gate automatici richiesti sono PASS;
- la riconciliazione è coerente con L4;
- una Human Exact-Head Review conclusiva attesta coerenza tra product SHA `{PRODUCT_HEAD}`, deploy `{DEPLOY_REF}`, run `{RUN_ID}`, evidenza Supabase read-only e proiezione di maturità;
- `DOS-A1=RUNTIME_DEFERRED` resta invariato;
- nessuna promozione Production viene derivata implicitamente.

Fino a quella review finale, lo stato resta **CANARY_PASS / L4_PROJECTED — HUMAN_EXACT_HEAD_REVIEW_PENDING**.
'''
dossier_path.write_text(dossier, encoding="utf-8")

# 7) Regenerate the governed snapshot from the modified canonical sources.
import sys
sys.path.insert(0, str(ROOT / "scripts"))
import build_ecosystem_snapshot as snapshot_builder
snapshot = snapshot_builder.build_snapshot(ROOT)
snapshot_builder.validate(snapshot)
write_json(ROOT / "control-center/data/ecosystem-snapshot.json", snapshot)

print("DOS_M4_FINALIZATION_WORKSPACE_READY")
