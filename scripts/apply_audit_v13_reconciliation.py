#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATE = "2026-10-05"
SPEC_PATH = "docs/superpowers/specs/2026-10-05-trama-audit-v1-3-studio-atlas-baseline-design.md"
EVENT_ID = "TRAMA-EVT-AUDIT-V1.3-STUDIO-ATLAS-BASELINE-2026-10-05"


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    (ROOT / path).write_text(text, encoding="utf-8")


def load(path: str):
    return json.loads(read(path))


def dump(path: str, data) -> None:
    write(path, json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


# Task 2 — canonical audit + STATUS.
audit_path = "docs/audits/TRAMA-AUDIT-2026-10-03.md"
audit = read(audit_path)
if "Versione 1.3 — 5 ottobre 2026" not in audit:
    audit = audit.replace(
        "Versione 1.2 — 5 ottobre 2026 — baseline storica del 03/10/2026 aggiornata per delta verificati, senza riscrivere le risultanze originarie.",
        "Versione 1.3 — 5 ottobre 2026 — baseline storica del 03/10/2026 aggiornata per il delta Studio Atlas / Visual Factory, senza riscrivere le risultanze originarie.",
        1,
    )
    audit = audit.replace(
        "La versione 1.2 incorpora i delta verificati fino alla chiusura P6/gh-aw T0; non promuove capacità prive di prova, non attiva T1/T2 e non autorizza nuovi runtime.",
        "La versione 1.3 incorpora i delta verificati fino alla chiusura P6/gh-aw T0 e aggiunge Studio Atlas / Visual Factory alla baseline governata; non promuove capacità prive di prova, non attiva T1/T2 e non autorizza nuovi runtime. La Versione 1.2 resta conservata come baseline precedente e cronologia verificabile.",
        1,
    )

v13_section = r'''
## 4-septies. Delta verificato — 5 ottobre 2026 — Studio Atlas / Visual Factory — Audit v1.3

Questo delta è **additivo**: conserva integralmente A01–A41 e le chiusure P1/P2/P3/P6 già registrate. Non retro-promuove implementazioni aperte e non converte CI verde in approvazione di prodotto, runtime o pubblicazione.

| ID | Area/capacità | Stato v1.3 | Evidenza e limite |
| --- | --- | --- | --- |
| A42 | Studio Atlas — product boundary | **IMPLEMENTED_CANDIDATE / PRODUCT_DOMAIN_ESTABLISHED / NOT_RUNTIME_AUTHORIZED** | Studio Atlas è riconosciuto come dominio applicativo professionale di primo livello sotto TRAMA; non possiede autorità curricolare Arena, verità classe/orario/TeachingSession di Docente OS, stato pubblico Atlas, autorità GPU/provider o identità studente. |
| A43 | Studio Atlas — authoring workflow | **VERIFIED_BUILD / AUTHORING_SLICE_AVAILABLE / HUMAN_GATES_PRESERVED** | Flusso Idea → Storia → Human Story Review → Mondo → World Review → Esperienza → Scene → Storyboard → Produzione disponibile come slice; i gate umani restano vincolanti. |
| A44 | Studio Atlas → Atlas learner preview | **CROSS_PRODUCT_QUALIFIED / NON_PUBLIC / NOT_STUDENT_AUTHORIZED** | Preview cross-product qualificata con boundary non pubblico, origine esatta/nonce, nessuna persistenza Atlas, identità o telemetria; nessuna autorizzazione studente/pubblicazione deriva dall'integrazione. |
| A45 | MUSEO ZERO v0.2 candidate | **REMEDIATION_IMPLEMENTED / SECOND_HUMAN_PRODUCT_REVIEW_PENDING** | La Human Product Review precedente resta **REVISE** e autorevole per la baseline esaminata. Le remediation tecniche successive non trasformano retroattivamente l'esito in PASS. |
| A46 | Visual Factory | **IMPLEMENTATION_ADVANCED / AUTOMATED_QUALIFICATION_AVAILABLE / REAL_VISUAL_RUN_PENDING** | Visual Bible, reference lock, Lia/Omar/Teo, Sala Zero/Cabina regia, F1–F6, FREE_ONLY e ricevute sono implementati; completamento solo dopo run reale refs → human lock → F1–F6 → continuity review → learner integration. |
| A47 | VF-ORCH-01 | **CORE_IMPLEMENTED / PLAN_INCOMPLETE** | Policy di orchestrazione, HF ZeroGPU, Cloudflare/config/evidence risultano implementati; manca ancora la superficie di esecuzione finale prevista dal piano approvato, quindi il piano non è chiuso. |
| A48 | Studio Atlas — durability | **DEVELOPMENT_PERSISTENCE_ONLY / PROFESSIONAL_RUNTIME_FOUNDATION_PENDING** | Persistenza locale di sviluppo non equivale ad autenticazione professionale, store remoto durevole, multi-device, collaborazione o production durability; questi appartengono a S6. |
| A49 | Studio Atlas ↔ Docente OS lesson continuity | **CONTRACT_DIRECTION_ESTABLISHED / RUNTIME_BINDING_DEFERRED** | Le risorse Studio Atlas devono restare collegabili a lezioni/materiali Docente OS tramite riferimenti stabili; Docente OS mantiene decisione d'uso, classe, orario e TeachingSession. Il binding runtime è differito. |

### Topologia canonica v1.3

TRAMA governa contratti, confini e Human Review. Sotto TRAMA operano come domini distinti: **Arena** (autorità curricolare), **Docente OS** (contesto professionale, classe, orario, lezione e decisione docente), **Studio Atlas** (authoring/produzione professionale dei Percorsi Atlas) e **Atlas** (navigazione learner/pubblica, preview/runtime e pubblicazione governata). I servizi condivisi di evidence/knowledge, connector/runtime, sync/import e assurance restano subordinati e non diventano authority concorrenti.

Studio Atlas è standalone nel dominio di ownership; Docente OS resta ingresso professionale privilegiato e autorità sull'uso nella lezione tramite riferimenti stabili. Studio Atlas non possiede identità studente e non abilita tracking o telemetria individuale.

### Sequenza operativa canonica dopo la v1.3

1. riconciliare questa baseline v1.3 e le sue proiezioni governate;
2. consolidare le PR Studio Atlas / Visual Factory sovrapposte, preservando le evidenze e marcando le linee superate come `SUPERSEDED / DO NOT MERGE`;
3. chiudere il residuo bounded di VF-ORCH-01;
4. eseguire la prima generazione reale governata di Lia, Omar, Teo, Sala Zero e Cabina regia;
5. eseguire Human Visual Review e reference lock;
6. generare e revisionare F1–F6 e integrare gli asset nella completa esperienza MUSEO ZERO v0.2;
7. eseguire **una** seconda Human Product Review con esito `PASS / REWORK / REJECT`;
8. soltanto dopo PASS, procedere con Studio Atlas S5; quindi S6 per identità professionale, persistenza remota durevole, standalone deployment e collegamento privilegiato Docente OS ↔ Studio Atlas;
9. P4/Argo e P5/QE-01 restano lane indipendenti da svolgere quando l'ambiente locale richiesto è disponibile.

La riconciliazione v1.3 non autorizza MUSEO ZERO, Visual Factory production, student runtime, QE-01, Argo reale, DOS-A1 o promozioni Production. `DOS-A1=RUNTIME_DEFERRED` resta invariato.
'''.strip()

if "## 4-septies. Delta verificato — 5 ottobre 2026 — Studio Atlas / Visual Factory — Audit v1.3" not in audit:
    marker = "\n## 5. Quattro problemi trasversali"
    require(marker in audit, "Audit insertion marker not found")
    audit = audit.replace(marker, "\n\n" + v13_section + "\n" + marker, 1)
write(audit_path, audit)

status_path = "STATUS.md"
status = read(status_path)
status = status.replace(
    "**v1.2 / delta verificato 05-10-2026**",
    "**v1.3 / delta Studio Atlas–Visual Factory verificato 05-10-2026**",
    1,
)
if "- **P4 Argo G5-C:**" not in status:
    anchor = "- **P6 gh-aw T0:** **CLOSED / INTEGRATED**; prova staged reale PASS, zero side effect persistenti sull'issue pilota, trigger finale production-only e lock strict sincronizzato; T1/T2 restano incrementi successivi separati, non attivati automaticamente."
    require(anchor in status, "STATUS P6 anchor not found")
    status = status.replace(
        anchor,
        anchor + "\n- **P4 Argo G5-C:** **OPEN / REAL_LIBREOFFICE_DIDUP_PROOF_PENDING**; lane indipendente, non chiusa dalla v1.3.\n- **P5 QE-01:** **REQUALIFICATION_PREPARED_NOT_AUTHORIZED**; nessuna nuova esecuzione runtime è autorizzata dalla v1.3.",
        1,
    )
if 'TRAMA --> STUDIO["Studio Atlas' not in status:
    status = status.replace(
        '  TRAMA --> DOS["Docente OS · contesto e decisione docente"]\n  TRAMA --> ATLAS["Atlas · navigazione, risorse e pubblicazioni"]',
        '  TRAMA --> DOS["Docente OS · contesto, classe, lezione e decisione docente"]\n  TRAMA --> STUDIO["Studio Atlas · authoring e produzione professionale"]\n  TRAMA --> ATLAS["Atlas · navigazione learner/pubblica, preview/runtime e pubblicazione governata"]',
        1,
    )
    status = status.replace(
        '  DOS --> DOSA1["DOS-A1 · DEFERRED"]',
        '  DOS --> DOSA1["DOS-A1 · DEFERRED"]\n  DOS -. "ingresso professionale privilegiato + riferimenti stabili" .-> STUDIO\n  STUDIO -. "candidate handoff / preview governata" .-> ATLAS',
        1,
    )

studio_row = "| Studio Atlas | **IMPLEMENTED_CANDIDATE / PRODUCT_DOMAIN_ESTABLISHED / NOT_RUNTIME_AUTHORIZED** | Dominio standalone professionale di authoring/produzione; Docente OS mantiene classe/orario/lezione e decisione d'uso; Atlas mantiene navigazione/pubblicazione; nessuna identità o telemetria studente |"
if studio_row not in status:
    docente_row = "| Docente OS | **OPERATIVO / BETA CONSOLIDATA** | `develop@09a3a3600b81992f3675be82d1d2f188f1643909`; Orario manuale verificato su Android/Beta; PWA e Share Target applicativamente qualificate; residuo installazione nativa browser/device non bloccante |"
    require(docente_row in status, "STATUS Docente OS row not found")
    status = status.replace(docente_row, docente_row + "\n" + studio_row, 1)

studio_section = r'''
## Studio Atlas / Visual Factory — baseline v1.3

Studio Atlas è ora un **dominio applicativo di primo livello** nella mappa canonica TRAMA, ma resta `NOT_RUNTIME_AUTHORIZED`. Il suo ownership riguarda authoring e produzione professionale dei Percorsi; non assorbe autorità da Arena, Docente OS o Atlas.

Stato corrente governato:

- **Studio Atlas product boundary:** `IMPLEMENTED_CANDIDATE / PRODUCT_DOMAIN_ESTABLISHED / NOT_RUNTIME_AUTHORIZED`;
- **Authoring:** `VERIFIED_BUILD / AUTHORING_SLICE_AVAILABLE / HUMAN_GATES_PRESERVED`;
- **Studio Atlas → Atlas preview:** `CROSS_PRODUCT_QUALIFIED / NON_PUBLIC`; nessuna autorizzazione student/public runtime;
- **MUSEO ZERO v0.2:** `REMEDIATION_IMPLEMENTED / SECOND_HUMAN_PRODUCT_REVIEW_PENDING`; l'esito precedente resta `REVISE` fino alla nuova review consolidata;
- **Visual Factory:** `IMPLEMENTATION_ADVANCED / AUTOMATED_QUALIFICATION_AVAILABLE / REAL_VISUAL_RUN_PENDING`;
- **VF-ORCH-01:** `CORE_IMPLEMENTED / PLAN_INCOMPLETE`;
- **Durability:** `DEVELOPMENT_PERSISTENCE_ONLY / PROFESSIONAL_RUNTIME_FOUNDATION_PENDING`;
- **Docente OS ↔ Studio Atlas lesson continuity:** `CONTRACT_DIRECTION_ESTABLISHED / RUNTIME_BINDING_DEFERRED`.

La prova di completamento prodotto richiede ancora la catena reale `references → Human Visual Review/reference lock → F1–F6 → learner integration → seconda Human Product Review`. CI verde e preview tecnica non sostituiscono questi gate.

Sequenza canonica: baseline v1.3 → consolidamento PR sovrapposte → chiusura bounded VF-ORCH-01 → primo run visuale reale governato → Human Visual Review/reference lock → F1–F6 + MUSEO ZERO v0.2 → Human Product Review `PASS/REWORK/REJECT` → S5 → S6. P4/P5 restano lane indipendenti. `DOS-A1=RUNTIME_DEFERRED`.
'''.strip()
if "## Studio Atlas / Visual Factory — baseline v1.3" not in status:
    marker = "\n## OR-07 → OR-10"
    require(marker in status, "STATUS Studio section insertion marker not found")
    status = status.replace(marker, "\n\n" + studio_section + "\n" + marker, 1)

old_priority = r'''1. **R3-P2 — Curriculum pubblico** come prossimo incremento Atlas, ora che ECO-02/P1 e R3-F0 sono chiusi e verificati.
2. **R3-P5 — Smart Navigation / Percorsi** mantenendo separata la promozione runtime dalla presenza di prototipi governati.
3. **Ridurre l'attrito del percorso docente** mantenendo Arena → Docente OS diretto e Atlas opzionale, non obbligatorio.
4. **R4-P1 — Officina materiali** soltanto dopo evidenze e gate dedicati; R4-P2/S1 può proseguire NO_RUNTIME.
5. **R3-P3 — Learning Hub**; successivamente R3-P4 solo con nuova autorizzazione umana/runtime e R3-P6.
6. **R5 — adozione** con nome/marca, privacy dossier, assistenza, costi e pilota d'istituto.
7. Mantenere **DOS-A1 deferred**, pubblicazione autonoma non autorizzata e Atlas privacy-first.'''
new_priority = r'''1. **Audit v1.3 — baseline reconciliation**: integrare Studio Atlas e Visual Factory nelle fonti governate senza promozioni sintetiche.
2. **Consolidamento Studio Atlas / Visual Factory**: una linea corrente per prodotto, evidenze preservate e PR superate marcate `SUPERSEDED / DO NOT MERGE`.
3. **VF-ORCH-01 bounded closeout**: completare soltanto la superficie residua già prevista dal piano approvato.
4. **Prima produzione visuale reale governata**: Lia, Omar, Teo, Sala Zero e Cabina regia → Human Visual Review → reference lock.
5. **MUSEO ZERO v0.2**: produrre/revisionare F1–F6, integrare le interazioni e sottoporre l'esperienza completa a una sola Human Product Review `PASS / REWORK / REJECT`.
6. **Studio Atlas S5 → S6** soltanto dopo PASS di prodotto: handoff/pubblicazione governata, quindi identità professionale, persistenza remota durevole, standalone deployment e collegamento privilegiato Docente OS ↔ Studio Atlas.
7. **P4 Argo e P5 QE-01** restano lane indipendenti da riprendere quando è disponibile l'ambiente locale richiesto.
8. Mantenere **DOS-A1 deferred**, nessuna identità/tracking studente e nessuna pubblicazione/runtime autonomi.'''
if old_priority in status:
    status = status.replace(old_priority, new_priority, 1)
write(status_path, status)


# Task 3 — governed maturity model.
defs_path = "config/maturity-area-definitions.json"
defs = load(defs_path)
if not any(area.get("id") == "studio-atlas" for area in defs["areas"]):
    defs["areas"].append({
        "id": "studio-atlas",
        "name": "Studio Atlas",
        "ownerDomain": "Studio Atlas",
        "levels": {
            "0": {"requiredEvidenceTypes": [], "description": "Perimetro non definito"},
            "1": {"requiredEvidenceTypes": ["DOCUMENT_CANONICAL"], "description": "Boundary di prodotto, ownership e separazione delle autorità documentati"},
            "2": {"requiredEvidenceTypes": ["DOCUMENT_CANONICAL", "CONTRACT_APPROVED"], "description": "Contratti cross-product e gate di authoring/handoff approvati"},
            "3": {"requiredEvidenceTypes": ["DOCUMENT_CANONICAL", "CONTRACT_APPROVED", "PR_EXACT_HEAD", "AUTOMATED_TEST"], "description": "Implementazione exact-head verificabile senza inferire runtime authorization"},
            "4": {"requiredEvidenceTypes": ["DOCUMENT_CANONICAL", "CONTRACT_APPROVED", "PR_EXACT_HEAD", "AUTOMATED_TEST", "HUMAN_REVIEW"], "description": "Prodotto qualificato tramite Human Product Review bound alla baseline esatta"},
            "5": {"requiredEvidenceTypes": ["DOCUMENT_CANONICAL", "CONTRACT_APPROVED", "PR_EXACT_HEAD", "AUTOMATED_TEST", "HUMAN_REVIEW", "REGRESSION_HISTORY", "ADOPTION_EVIDENCE"], "description": "Prodotto stabilizzato con regressione e adozione osservata senza tracking studente"}
        },
        "dependencies": ["governance", "arena"]
    })
dump(defs_path, defs)

registry_path = "governance/maturity/trama-maturity-evidence-registry-v1.json"
registry = load(registry_path)
registry["updatedAt"] = DATE
if not any(item.get("id") == "EV-MAT-STUDIO-ATLAS-DOC" for item in registry["evidence"]):
    registry["evidence"].append({
        "id": "EV-MAT-STUDIO-ATLAS-DOC",
        "type": "DOCUMENT_CANONICAL",
        "area": "studio-atlas",
        "subject": "Studio Atlas first-level product boundary in Audit v1.3 design",
        "status": "PASS",
        "source": {"ref": SPEC_PATH, "path": SPEC_PATH},
        "observedAt": "2026-10-05T00:00:00Z",
        "freshness": {"policy": "UNTIL_CHANGE"},
        "confidence": "HIGH",
        "supports": [{"level": 1}]
    })
dump(registry_path, registry)

recon_path = "governance/maturity/trama-maturity-reconciliation-v1.json"
recon = load(recon_path)
recon["updatedAt"] = DATE
if not any(item.get("area") == "studio-atlas" for item in recon["areas"]):
    recon["areas"].append({
        "area": "studio-atlas",
        "observedLevel": 1,
        "target": "L2_AFTER_CANONICAL_CONTRACT",
        "nextWork": ["approve and bind the canonical Studio Atlas cross-product authority contract"],
        "l5Gap": ["CONTRACT_APPROVED", "PR_EXACT_HEAD", "AUTOMATED_TEST", "HUMAN_REVIEW", "REGRESSION_HISTORY", "ADOPTION_EVIDENCE"]
    })
recon["components"]["currentRegistryCount"] = 11
recon["components"]["missingProductCoverage"] = ["Studio Atlas"]
recon["components"]["coverageState"] = "PARTIAL_PRODUCT_COVERAGE"
recon["components"]["qualificationState"] = "PARTIAL"
recon["functionalSequence"] = [
    "AUDIT_V1_3_BASELINE_RECONCILIATION",
    "STUDIO_ATLAS_PR_CONSOLIDATION",
    "VF_ORCH_01_BOUNDED_CLOSEOUT",
    "VISUAL_FACTORY_FIRST_GOVERNED_RUN",
    "MUSEO_ZERO_V0_2_SECOND_HUMAN_REVIEW",
    "STUDIO_ATLAS_S5",
    "STUDIO_ATLAS_S6"
]
dump(recon_path, recon)

core_path = "scripts/build_ecosystem_snapshot_core.py"
core = read(core_path)
if '"Studio Atlas": "studio-atlas"' not in core:
    old = '        "Docente OS": "docente-os",\n'
    require(old in core, "maturity_by_owner insertion marker not found")
    core = core.replace(old, old + '        "Studio Atlas": "studio-atlas",\n', 1)
write(core_path, core)

maturity_test_path = "scripts/test_maturity_reconciliation.py"
mt = read(maturity_test_path)
mt = mt.replace(
    'assert set(areas)=={"governance","arena","atlas","docente-os"}',
    'assert set(areas)=={"governance","arena","atlas","docente-os","studio-atlas"}',
    1,
)
if 'areas["studio-atlas"]["confirmedLevel"]==1' not in mt:
    anchor = '''assert not any(\n    item.get("area")=="docente-os" and item.get("type")=="RUNTIME_CANARY"\n    for item in snapshot["evidence"]\n)'''
    require(anchor in mt, "maturity test Studio Atlas insertion anchor not found")
    studio_asserts = '''\n\nassert areas["studio-atlas"]["ownerDomain"]=="Studio Atlas"\nassert areas["studio-atlas"]["confirmedLevel"]==1\nassert areas["studio-atlas"]["candidateLevel"]==1\nassert areas["studio-atlas"]["evidenceBindingStatus"]=="PARTIAL"\nassert areas["studio-atlas"]["nextTargetLevel"]==2\nassert areas["studio-atlas"]["nextRequiredEvidenceTypes"]==["CONTRACT_APPROVED"]'''
    mt = mt.replace(anchor, anchor + studio_asserts, 1)
mt = mt.replace(
    '    "governance":4,"arena":4,"atlas":4,"docente-os":3\n}',
    '    "governance":4,"arena":4,"atlas":4,"docente-os":3,"studio-atlas":1\n}',
    1,
)
mt = mt.replace('assert backlog["components"]["missingProductCoverage"]==[]', 'assert backlog["components"]["missingProductCoverage"]==["Studio Atlas"]', 1)
mt = mt.replace('assert backlog["components"]["coverageState"]=="ALL_PRODUCTS_MACHINE_ADDRESSABLE"', 'assert backlog["components"]["coverageState"]=="PARTIAL_PRODUCT_COVERAGE"', 1)
mt = mt.replace('assert backlog["functionalSequence"][:2]==["R3-P2","R3-P5"]', 'assert backlog["functionalSequence"]==["AUDIT_V1_3_BASELINE_RECONCILIATION","STUDIO_ATLAS_PR_CONSOLIDATION","VF_ORCH_01_BOUNDED_CLOSEOUT","VISUAL_FACTORY_FIRST_GOVERNED_RUN","MUSEO_ZERO_V0_2_SECOND_HUMAN_REVIEW","STUDIO_ATLAS_S5","STUDIO_ATLAS_S6"]', 1)
write(maturity_test_path, mt)

component_test_path = "scripts/test_component_evidence_expansion.py"
ct = read(component_test_path)
ct = ct.replace('assert backlog["components"]["missingProductCoverage"]==[]', 'assert backlog["components"]["missingProductCoverage"]==["Studio Atlas"]', 1)
ct = ct.replace('assert backlog["components"]["coverageState"]=="ALL_PRODUCTS_MACHINE_ADDRESSABLE"', 'assert backlog["components"]["coverageState"]=="PARTIAL_PRODUCT_COVERAGE"', 1)
write(component_test_path, ct)


# Task 4 — source-bound Project Knowledge event.
events_path = "status/project-knowledge-events.json"
events = load(events_path)
events["updatedAt"] = "2026-10-05T08:00:00Z"
if not any(event.get("eventId") == EVENT_ID for event in events["events"]):
    events["events"].append({
        "eventId": EVENT_ID,
        "type": "BASELINE",
        "subject": "ecosystem-audit",
        "statement": "Audit v1.3 establishes Studio Atlas as a first-level application domain and records additive findings A42 through A49. It preserves NOT_RUNTIME_AUTHORIZED for Studio Atlas, SECOND_HUMAN_PRODUCT_REVIEW_PENDING for MUSEO ZERO, REAL_VISUAL_RUN_PENDING for Visual Factory, VF-ORCH-01 PLAN_INCOMPLETE, and DOS-A1=RUNTIME_DEFERRED; no student runtime or publication authority is granted.",
        "status": "CURRENT",
        "rationale": "The ecosystem baseline must represent the product architecture actually under development without converting implementation evidence into product, runtime, publication or student authority.",
        "sourceRefs": [
            {"repository": "antoniocorsano-boop/trama-ecosistema", "ref": SPEC_PATH},
            {"repository": "antoniocorsano-boop/trama-ecosistema", "ref": audit_path},
            {"repository": "antoniocorsano-boop/trama-ecosistema", "ref": status_path}
        ],
        "validFrom": "2026-10-05T08:00:00Z",
        "supersedes": [],
        "invalidatedBy": [],
        "freshness": {"policy": "UNTIL_CHANGE"}
    })
dump(events_path, events)

# Guard the exact semantic boundaries before allowing builders to project them.
for token in ["A42", "A49", "SECOND_HUMAN_PRODUCT_REVIEW_PENDING", "REAL_VISUAL_RUN_PENDING", "CORE_IMPLEMENTED / PLAN_INCOMPLETE", "REVISE"]:
    require(token in read(audit_path), f"audit token missing: {token}")
for token in ["v1.3", "Studio Atlas", "NOT_RUNTIME_AUTHORIZED", "DOS-A1", "RUNTIME_DEFERRED"]:
    require(token in read(status_path), f"STATUS token missing: {token}")

print("TRAMA_AUDIT_V1_3_RECONCILIATION_APPLIED")
