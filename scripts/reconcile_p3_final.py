#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATUS = ROOT / "STATUS.md"
AUDIT = ROOT / "docs/audits/TRAMA-AUDIT-2026-10-03.md"
EVENTS = ROOT / "status/project-knowledge-events.json"

OLD_STATUS = "- **P3 evidenze/distribuzioni:** **NEXT**."
NEW_STATUS = (
    "- **P3 evidenze/distribuzioni:** **CLOSED / BASELINE_RECONCILED**; "
    "stato canonico, Project Knowledge persistente, Control Center e distribuzioni sono riconciliati; "
    "QE-01, Argo G5-C e gh-aw T0 restano residui separati P5/P4/P6."
)
CLOSURE_ID = "TRAMA-EVT-P3-BASELINE-RECONCILED-2026-10-04"
OLD_P3_ID = "TRAMA-EVT-P3-EVIDENCE-DISTRIBUTION-NEXT-2026-10-04"
UPDATED_AT = "2026-10-04T20:08:00Z"


def reconcile_status() -> None:
    text = STATUS.read_text(encoding="utf-8")
    if NEW_STATUS in text:
        return
    if OLD_STATUS not in text:
        raise RuntimeError("P3_STATUS_ANCHOR_MISSING")
    STATUS.write_text(text.replace(OLD_STATUS, NEW_STATUS, 1), encoding="utf-8")


def event(event_id: str, event_type: str, subject: str, statement: str, rationale: str, refs: list[dict], *, supersedes: list[str] | None = None) -> dict:
    return {
        "eventId": event_id,
        "type": event_type,
        "subject": subject,
        "statement": statement,
        "status": "CURRENT",
        "rationale": rationale,
        "sourceRefs": refs,
        "validFrom": UPDATED_AT,
        "supersedes": supersedes or [],
        "invalidatedBy": [],
        "freshness": {"policy": "UNTIL_CHANGE"},
    }


def reconcile_events() -> None:
    payload = json.loads(EVENTS.read_text(encoding="utf-8"))
    items = payload.get("events")
    if not isinstance(items, list):
        raise RuntimeError("PROJECT_KNOWLEDGE_EVENTS_INVALID")
    by_id = {item.get("eventId"): item for item in items if isinstance(item, dict)}
    old = by_id.get(OLD_P3_ID)
    if old is None:
        raise RuntimeError("P3_NEXT_EVENT_MISSING")
    old["status"] = "SUPERSEDED"
    invalidated = list(old.get("invalidatedBy", []))
    if CLOSURE_ID not in invalidated:
        invalidated.append(CLOSURE_ID)
    old["invalidatedBy"] = invalidated

    additions = [
        event(
            CLOSURE_ID,
            "CLOSURE",
            "project-knowledge",
            "P3 evidence/distribution alignment is CLOSED / BASELINE_RECONCILED: the governed persistent Project Knowledge, STATUS and Control Center distribution now share the post-P1/P2 baseline; Docente OS Beta is the canonical current test distribution on Render; A7 is deployed on the current TRAMA main baseline. P4/P5/P6 residuals remain explicitly separate and open.",
            "PR #234 integrated the persistent synchronization lane and was verified post-merge. The final P3 reconciliation records the current distribution evidence and prevents superseded P3=NEXT state from remaining current.",
            [
                {"repository": "antoniocorsano-boop/trama-ecosistema", "pullRequest": 234, "exactHead": "b4ca73b34ec3f9892342031ace79fa0971fa4697", "ref": "STATUS.md"},
                {"repository": "antoniocorsano-boop/trama-ecosistema", "exactHead": "0000ca9be8a8dfa24535a4b718eecdbcde82ab8c", "ref": "github-actions:workflow-run/37230342692"},
                {"repository": "antoniocorsano-boop/trama-ecosistema", "exactHead": "0000ca9be8a8dfa24535a4b718eecdbcde82ab8c", "ref": "render:deploy/dep-db1b042vcj2c73a2na60"},
                {"repository": "antoniocorsano-boop/docente-os-2026-27", "exactHead": "09a3a3600b81992f3675be82d1d2f188f1643909", "ref": "render:deploy/dep-db180cavcj2c739v6lc0"},
                {"repository": "antoniocorsano-boop/trama-ecosistema", "ref": "docs/audits/TRAMA-AUDIT-2026-10-03.md"},
            ],
            supersedes=[OLD_P3_ID],
        ),
        event(
            "TRAMA-EVT-QE01-REQUALIFICATION-REQUIRED-2026-10-04",
            "BLOCKER",
            "qe-01",
            "QE-01 remains REQUALIFICATION_REQUIRED. PR #212 still carries an authorization narrative, while current validator/audit evidence does not establish executable runtime authorization; no new qualified execution is inferred from P3.",
            "P3 records the contradiction instead of resolving it by assertion. QE-01 remains a distinct P5 package and must be reconciled against the current validator, receipt and exact execution target before any execution.",
            [
                {"repository": "antoniocorsano-boop/trama-ecosistema", "pullRequest": 212, "ref": "runtime: prepare QE-01 first qualified execution"},
                {"repository": "antoniocorsano-boop/trama-ecosistema", "ref": "docs/audits/TRAMA-AUDIT-2026-10-03.md"},
            ],
        ),
        event(
            "TRAMA-EVT-ARGO-G5C-REAL-IMPORT-PENDING-2026-10-04",
            "DEFERMENT",
            "argo-g5c",
            "Argo G5-C remains PRONTA_PER_PROVA_REALE: Docente OS PR #647 is still draft at exact head e5dd179f074421f08b2c7952238fa0764d643ce6; automated BIFF8 structure/round-trip evidence exists, but LibreOffice opening and manual didUP import are not attested.",
            "The automated proof does not establish real interoperability. P4 remains open until a non-personal reference workbook is accepted in the authorized real workflow.",
            [
                {"repository": "antoniocorsano-boop/docente-os-2026-27", "pullRequest": 647, "exactHead": "e5dd179f074421f08b2c7952238fa0764d643ce6", "ref": "CAP-DOS-ARGO-SYNC G5-C: BIFF8 XLS proof"},
                {"repository": "antoniocorsano-boop/trama-ecosistema", "ref": "docs/audits/TRAMA-AUDIT-2026-10-03.md"},
            ],
        ),
        event(
            "TRAMA-EVT-GHAW-T0-STAGED-NOT-EXECUTABLE-2026-10-04",
            "DEFERMENT",
            "gh-aw-t0",
            "gh-aw T0 remains STAGED / NOT_EXECUTABLE: TRAMA PR #214 is still draft at exact head ba98dfcf730e60cdd946cd44ccedca5c3eec049b and requires current-cli compilation/lock plus controlled staged-run evidence before execution or integration.",
            "P3 records the current maintenance-automation boundary without promoting source review or compilation to operational qualification. P6 remains separate.",
            [
                {"repository": "antoniocorsano-boop/trama-ecosistema", "pullRequest": 214, "exactHead": "ba98dfcf730e60cdd946cd44ccedca5c3eec049b", "ref": "gh-aw T0 — staged issue triage pilot"},
                {"repository": "antoniocorsano-boop/trama-ecosistema", "ref": "docs/audits/TRAMA-AUDIT-2026-10-03.md"},
            ],
        ),
    ]
    for item in additions:
        existing = by_id.get(item["eventId"])
        if existing is None:
            items.append(item)
            by_id[item["eventId"]] = item
        elif existing != item:
            raise RuntimeError(f"P3_EVENT_CONFLICT:{item['eventId']}")

    payload["updatedAt"] = UPDATED_AT
    EVENTS.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


DELTA = r'''## 4-quinquies. Delta verificato — 4 ottobre 2026 — P3 — BASELINE_RECONCILED

Questa sezione supersede, per lo **stato corrente**, le occorrenze storiche `P3 = NEXT` nelle sezioni 4-quater, 6 e 8. Le risultanze originarie restano conservate come cronologia dell'audit.

### Stato canonico e Project Knowledge

- La PR TRAMA #234, exact head `b4ca73b34ec3f9892342031ace79fa0971fa4697`, è stata integrata con squash merge `0000ca9be8a8dfa24535a4b718eecdbcde82ab8c`.
- Sul merge `0000ca9be8a8dfa24535a4b718eecdbcde82ab8c`, Governance push run `37230342576` è PASS e Build TRAMA Control Center Bundle run `37230342692` è PASS.
- Il lane di build rigenera e riconcilia `ecosystem-snapshot`, `project-context-snapshot` e `project-knowledge` solo per variazioni semantiche; il secondo passaggio sullo stesso contenuto è idempotente.
- `STATUS.md` e Project Knowledge non mantengono più `P3 = NEXT` come stato corrente: P3 è **CLOSED / BASELINE_RECONCILED**.
- `decision-register.json` e `ROADMAP.md` sono stati riesaminati ma non modificati: P3 non introduce una nuova decisione di authority e non cambia la sequenza di prodotto; la separazione tra decisione normativa e stato operativo resta intenzionale.

### Distribuzioni Docente OS riconciliate

- Docente OS `develop@09a3a3600b81992f3675be82d1d2f188f1643909` è la baseline applicativa corrente già registrata dalla v1.1.
- Il servizio Render **Beta** è la distribuzione canonica di prova: deploy `dep-db180cavcj2c739v6lc0` è LIVE sullo SHA `09a3a3600b81992f3675be82d1d2f188f1643909`, con auto-deploy da `develop`.
- `PROJECT_HEALTH.md` è esplicitamente un puntatore storico/non canonico e rimanda a `docs/product/PROJECT_STATUS_CURRENT.md`, che identifica Render come runtime corrente.
- Il servizio Render denominato Production resta separato: auto-deploy disattivato e ultimo deploy LIVE osservato sul commit storico `7fa8deae375bc15b4386d17c97b1809f49488b98`. Non viene quindi assunto come automaticamente allineato a `develop` e **nessuna promozione Production** è dichiarata da P3.

### A7 / Control Center pubblico

- Il servizio Render `trama-control-center` ha deploy `dep-db1b042vcj2c73a2na60` LIVE sull'exact main `0000ca9be8a8dfa24535a4b718eecdbcde82ab8c`.
- Il build post-merge ha qualificato rigenerazione snapshot, materializzazione read-only della Project Knowledge, dossier stakeholder, contratto macchina e pacchetto distribuibile.
- La verifica HTTP esterna diretta del dominio Render non è stata rieseguita con successo da questo ambiente di esecuzione; questo limite è registrato come **controllo non osservabile nel turno**, non trasformato in PASS e non interpretato come FAIL applicativo. Restano valide le evidenze Render e i gate A7/build già prodotti sul commit distribuito.

### Residui separati, registrati ma non chiusi da P3

- **P4 / Argo G5-C:** Docente OS #647 resta Draft, exact head `e5dd179f074421f08b2c7952238fa0764d643ce6`; prova automatica BIFF8 disponibile, apertura LibreOffice e import manuale didUP ancora non attestati.
- **P5 / QE-01:** TRAMA #212 resta aperta; il testo di autorizzazione e le evidenze correnti del validatore non sono trattati come equivalenti. Stato operativo: **REQUALIFICATION_REQUIRED**; nessuna nuova esecuzione è autorizzata o inferita da P3.
- **P6 / gh-aw T0:** TRAMA #214 resta Draft, exact head `ba98dfcf730e60cdd946cd44ccedca5c3eec049b`; stato **STAGED / NOT_EXECUTABLE** fino a compilazione/lock corrente e prova controllata prevista dal contratto.

### Esito P3

**P3 — CLOSED / BASELINE_RECONCILED.** La condizione di uscita è soddisfatta nel perimetro di riconciliazione: stato corrente, memoria persistente, snapshot/Control Center e distribuzioni canoniche sono ricondotti alla stessa baseline source-bound; i controlli non osservabili sono esplicitati e i residui QE-01, Argo e gh-aw sono mantenuti nei rispettivi pacchetti P5/P4/P6. P1 e P2 non vengono riaperti; `DOS-A1` resta `RUNTIME_DEFERRED`.

'''


def reconcile_audit() -> None:
    text = AUDIT.read_text(encoding="utf-8")
    if "P3 — BASELINE_RECONCILED" in text:
        return
    anchor = "## 5. Quattro problemi trasversali"
    if anchor not in text:
        raise RuntimeError("P3_AUDIT_ANCHOR_MISSING")
    AUDIT.write_text(text.replace(anchor, DELTA + anchor, 1), encoding="utf-8")


def main() -> None:
    reconcile_status()
    reconcile_events()
    reconcile_audit()
    print("P3_FINAL_RECONCILIATION_APPLIED")


if __name__ == "__main__":
    main()
