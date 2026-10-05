import json
from pathlib import Path

AUDIT = Path("docs/audits/TRAMA-AUDIT-2026-10-03.md")
STATUS = Path("STATUS.md")
EVENTS = Path("status/project-knowledge-events.json")


def replace_once(text: str, old: str, new: str, error: str) -> str:
    if old in text:
        return text.replace(old, new, 1)
    if new in text:
        return text
    raise SystemExit(error)


def reconcile_audit() -> None:
    audit = AUDIT.read_text(encoding="utf-8")
    audit = replace_once(
        audit,
        "Versione 1.3 — 5 ottobre 2026 — baseline storica del 03/10/2026 aggiornata per il delta Studio Atlas / Visual Factory, senza riscrivere le risultanze originarie.",
        "Versione 1.4 — 5 ottobre 2026 — baseline storica del 03/10/2026 aggiornata per la prova reale Visual Factory, il riesame MUSEO ZERO e i residui P4/P5, senza riscrivere le risultanze originarie.",
        "AUDIT_V1_4_HEADER_ANCHOR_NOT_FOUND",
    )
    audit = replace_once(
        audit,
        "Stato del riferimento: il documento è presente su `main` TRAMA e resta la baseline trasversale di completamento. La versione 1.3 incorpora i delta verificati fino alla chiusura P6/gh-aw T0 e aggiunge Studio Atlas / Visual Factory alla baseline governata; non promuove capacità prive di prova, non attiva T1/T2 e non autorizza nuovi runtime. La Versione 1.2 resta conservata come baseline precedente e cronologia verificabile.",
        "Stato del riferimento: il documento è presente su `main` TRAMA e resta la baseline trasversale di completamento. La versione 1.4 incorpora la prova reale FREE_ONLY della Visual Factory, mantiene separata la qualità visuale dalla riuscita tecnica, registra il riesame MUSEO ZERO come REWORK e riallinea P4/P5 senza promuovere capacità prive di prova, attivare T1/T2 o autorizzare nuovi runtime. Le versioni 1.3 e 1.2 restano conservate come baseline precedenti e cronologia verificabile.",
        "AUDIT_REFERENCE_PARAGRAPH_ANCHOR_NOT_FOUND",
    )
    audit = audit.replace(
        "| P4 | **OPEN** | Argo G5-C: prova reale LibreOffice/didUP ancora necessaria |",
        "| P4 | **OPEN / LOCAL_PROOF_PACKAGE_READY_CANDIDATE** | Pacchetto fail-closed #246 pronto; prova reale LibreOffice/didUP ancora necessaria |",
    )
    audit = audit.replace(
        "| P5 | **OPEN / REQUALIFICATION** | QE-01 da riconciliare prima di nuova esecuzione |",
        "| P5 | **REQUALIFICATION_PREPARED_NOT_AUTHORIZED** | Pacchetto QE-01 v2 integrato; nuova esecuzione richiede fresh local observation e nuova Human Authorization |",
    )
    audit = audit.replace(
        "| P0 | **INTEGRATO / DA RENDERE PIÙ RINTRACCIABILE** | Audit presente su `main`; questa v1.2 mantiene il collegamento operativo da STATUS |",
        "| P0 | **INTEGRATO / RIFERIMENTO V1.4** | Audit presente su `main`; STATUS e proiezioni governate devono restare allineati al delta v1.4 |",
    )

    marker = "## 4-octies. Delta verificato — 5 ottobre 2026 — Audit v1.4 / prova reale Visual Factory"
    if marker not in audit:
        anchor = "## 5. Quattro problemi trasversali"
        if anchor not in audit:
            raise SystemExit("AUDIT_SECTION_5_ANCHOR_NOT_FOUND")
        delta = """## 4-octies. Delta verificato — 5 ottobre 2026 — Audit v1.4 / prova reale Visual Factory

Questo delta supersede, per lo **stato corrente**, le formulazioni v1.3 `REAL_VISUAL_RUN_PENDING`, `LIVE_ZERO_COST_EXECUTION_NOT_YET_PROVEN` e `PLAN_INCOMPLETE` relative alla prova reale della Visual Factory. Non modifica retroattivamente la cronologia e non concede authority di runtime, pubblicazione o student use.

### Baseline e prova reale governata

- Baseline Audit v1.3 integrata: `main@d5a54022e1bad7b3fb2c4a853bbdd5f7e114d3aa`.
- Baseline reale osservata per questo delta: `main@290d6f3f0d15df3e8f8f438a46a26449d1247043`, merge della PR #248.
- La linea Studio Atlas / Visual Factory è stata consolidata con PR #243 e i follow-up #244, #245, #247 e #248, senza paid fallback né nuova authority.
- Il run manuale `37348637767` su `main@290d6f3f0d15df3e8f8f438a46a26449d1247043` ha completato `Bounded FREE_ONLY visual orchestration` con esecuzione live SUCCESS, verifica di non-authority e upload delle evidenze.
- L'artefatto `11361642336` contiene le reference candidate governate ed è registrato con digest `sha256:91ed622868c2214b730e2c56f800ffcbd0de579a9913471f96cdb1ca764fea12`; la riuscita tecnica non costituisce approvazione visuale.

### A45 / MUSEO ZERO

A45 passa da `REMEDIATION_IMPLEMENTED / SECOND_HUMAN_PRODUCT_REVIEW_PENDING` a **`REAL_REFERENCES_GENERATED / HUMAN_VISUAL_REVIEW_REWORK / REFERENCE_LOCK_PENDING / SECOND_HUMAN_PRODUCT_REVIEW_PENDING`**.

La prima Human Visual Review delle reference reali non concede reference lock. La PR #249, osservata come Draft sull'exact head `c3b4aa3cf952f6d4a5cc91d3015c3bfa8143ea8f`, apre una remediation bounded dell'art direction: rafforzare l'identità di Lia/Omar/Teo, eliminare pseudo-testo e dashboard spurie, rendere Sala Zero uno spazio narrativo fisico e Cabina regia un ambiente adiacente e coerente. Nessun F1–F6 parte prima del nuovo Human Visual Review PASS.

### A46 / Visual Factory

A46 passa da `IMPLEMENTATION_ADVANCED / AUTOMATED_QUALIFICATION_AVAILABLE / REAL_VISUAL_RUN_PENDING` a **`REAL_REFERENCE_GENERATION_PROVEN / GOVERNED_EVIDENCE_AVAILABLE / HUMAN_VISUAL_ACCEPTANCE_PENDING`**.

È ora dimostrato end-to-end il percorso `piano canonico Studio Atlas → orchestratore bounded → provider gratuito qualificato → generazione reale → ricevuta → materializzazione binari → verifica SHA-256 → artefatto revisionabile`. Resta separata la qualità del risultato dalla riuscita tecnica.

### A47 / VF-ORCH-01

A47 passa da `DETERMINISTIC_QUALIFICATION_PASS / LIVE_ZERO_COST_EXECUTION_NOT_YET_PROVEN` a **`LIVE_ZERO_COST_REFERENCE_EXECUTION_PROVEN / FREE_ONLY / FAIL_CLOSED / HUMAN_AUTHORITY_PRESERVED`**.

Il residuo di prova reale dell'orchestratore è chiuso nel perimetro reference. `shots` resta correttamente fail-closed fino al reference lock umano; questo è un gate di prodotto, non un difetto residuo dell'orchestratore.

### P4 / Argo G5-C

P4 resta aperto ma avanza a **`OPEN / LOCAL_PROOF_PACKAGE_READY_CANDIDATE`**. La PR #246, exact head `ef5734646964ce6403a85e53caa72ea62527e32e`, prepara manifest, dossier, validatore e test fail-closed; il gate resta `LOCAL_EVIDENCE_REQUIRED`. Servono ancora apertura reale del `.xls` in LibreOffice, import manuale in didUP, attestazione umana e review finale.

### P5 / QE-01

P5 passa da `OPEN / REQUALIFICATION` a **`REQUALIFICATION_PREPARED_NOT_AUTHORIZED`**. La PR #241 è integrata con merge `c0ab9f65d42ee88a640afd57ddfac9bef9df6606`; il pacchetto resta intenzionalmente `executable=false`. Una nuova esecuzione richiede fresh local observation, exact target freeze, Human Exact-Head Review e nuova Human Authorization separata.

### Maturità formale

Nessuna promozione automatica dei livelli di maturità deriva da questo delta. Restano confermati: Governance L4, Arena L4, Atlas L4, Docente OS L3, Studio Atlas L1. Studio Atlas resta L1 finché non esiste evidenza `CONTRACT_APPROVED` sufficiente per L2; ADR-020/ADR-021 non vengono promosse da questo audit.

### Sequenza operativa v1.4

1. completare la remediation art-direction v0.3 delle sole cinque reference canoniche;
2. rigenerare Lia, Omar, Teo, Sala Zero e Cabina regia con la stessa pipeline FREE_ONLY governata;
3. eseguire Human Visual Review; soltanto un PASS concede reference lock;
4. generare e revisionare F1–F6;
5. integrare gli asset nella learner experience MUSEO ZERO v0.2;
6. eseguire la seconda Human Product Review `PASS / REWORK / REJECT`;
7. solo dopo PASS procedere con S5 e quindi S6;
8. P4 e P5 restano lane indipendenti, rispettivamente vincolate a prova locale reale e nuova autorizzazione di esecuzione.

`DOS-A1=RUNTIME_DEFERRED` resta invariato. Nessuna promozione Production, student runtime o pubblicazione automatica è implicata dalla v1.4.

"""
        audit = audit.replace(anchor, delta + anchor, 1)
    AUDIT.write_text(audit, encoding="utf-8")


def reconcile_status() -> None:
    status = STATUS.read_text(encoding="utf-8")
    status = replace_once(
        status,
        "Riferimento trasversale di completamento: [`docs/audits/TRAMA-AUDIT-2026-10-03.md`](docs/audits/TRAMA-AUDIT-2026-10-03.md), **v1.3 / delta Studio Atlas–Visual Factory verificato 05-10-2026**.",
        "Riferimento trasversale di completamento: [`docs/audits/TRAMA-AUDIT-2026-10-03.md`](docs/audits/TRAMA-AUDIT-2026-10-03.md), **v1.4 / prova reale Visual Factory e riesame MUSEO ZERO verificati 05-10-2026**.",
        "STATUS_AUDIT_REFERENCE_ANCHOR_NOT_FOUND",
    )
    status = replace_once(
        status,
        "- **P4 Argo G5-C:** **OPEN / REAL_LIBREOFFICE_DIDUP_PROOF_PENDING**; lane indipendente, non chiusa dalla v1.3.",
        "- **P4 Argo G5-C:** **OPEN / LOCAL_PROOF_PACKAGE_READY_CANDIDATE / REAL_LIBREOFFICE_DIDUP_PROOF_PENDING**; PR #246 prepara il pacchetto fail-closed, ma la prova reale LibreOffice/didUP resta obbligatoria.",
        "STATUS_P4_ANCHOR_NOT_FOUND",
    )
    status = replace_once(
        status,
        "- **P5 QE-01:** **REQUALIFICATION_PREPARED_NOT_AUTHORIZED**; nessuna nuova esecuzione runtime è autorizzata dalla v1.3.",
        "- **P5 QE-01:** **REQUALIFICATION_PREPARED_NOT_AUTHORIZED**; il pacchetto v2 è integrato, ma nessuna nuova esecuzione runtime è autorizzata dalla v1.4.",
        "STATUS_P5_ANCHOR_NOT_FOUND",
    )
    status = replace_once(
        status,
        "- **MUSEO ZERO v0.2:** `REMEDIATION_IMPLEMENTED / SECOND_HUMAN_PRODUCT_REVIEW_PENDING`; l'esito precedente resta `REVISE` fino alla nuova review consolidata;",
        "- **MUSEO ZERO v0.2:** `REAL_REFERENCES_GENERATED / HUMAN_VISUAL_REVIEW_REWORK / REFERENCE_LOCK_PENDING / SECOND_HUMAN_PRODUCT_REVIEW_PENDING`; la prima review visuale delle reference reali richiede remediation art-direction v0.3; nessun F1–F6 prima del reference lock;",
        "STATUS_MUSEO_ANCHOR_NOT_FOUND",
    )
    status = replace_once(
        status,
        "- **Visual Factory:** `IMPLEMENTATION_ADVANCED / AUTOMATED_QUALIFICATION_AVAILABLE / REAL_VISUAL_RUN_PENDING`;",
        "- **Visual Factory:** `REAL_REFERENCE_GENERATION_PROVEN / GOVERNED_EVIDENCE_AVAILABLE / HUMAN_VISUAL_ACCEPTANCE_PENDING`; run FREE_ONLY reale `37348637767` su `main@290d6f3f0d15df3e8f8f438a46a26449d1247043`, artefatto governato `11361642336`;",
        "STATUS_VISUAL_FACTORY_ANCHOR_NOT_FOUND",
    )
    status = replace_once(
        status,
        "- **VF-ORCH-01:** `DETERMINISTIC_QUALIFICATION_PASS / LIVE_ZERO_COST_EXECUTION_NOT_YET_PROVEN`; runner condiviso, modalità manuali `dry-run | references | shots`, test/typecheck/build e contratti provider sono qualificati; nessun live inference è ancora attestato;",
        "- **VF-ORCH-01:** `LIVE_ZERO_COST_REFERENCE_EXECUTION_PROVEN / FREE_ONLY / FAIL_CLOSED / HUMAN_AUTHORITY_PRESERVED`; reference live provate end-to-end, mentre `shots` resta fail-closed fino al reference lock umano;",
        "STATUS_VF_ORCH_ANCHOR_NOT_FOUND",
    )
    status = replace_once(
        status,
        "La prova di completamento prodotto richiede ancora la catena reale `references → Human Visual Review/reference lock → F1–F6 → learner integration → seconda Human Product Review`. CI verde e preview tecnica non sostituiscono questi gate.",
        "La prova `references` è ora reale e governata. Il completamento prodotto richiede ancora `art direction v0.3 → rigenerazione delle 5 reference → Human Visual Review/reference lock → F1–F6 → learner integration → seconda Human Product Review`. La riuscita tecnica non sostituisce l'accettazione visuale o di prodotto.",
        "STATUS_PRODUCT_PROOF_ANCHOR_NOT_FOUND",
    )
    status = replace_once(
        status,
        "Sequenza canonica: baseline v1.3 → consolidamento Studio Atlas/Visual Factory + qualifica deterministica VF-ORCH-01 → primo run visuale reale governato → Human Visual Review/reference lock → F1–F6 + MUSEO ZERO v0.2 → Human Product Review `PASS/REWORK/REJECT` → S5 → S6. P4/P5 restano lane indipendenti. `DOS-A1=RUNTIME_DEFERRED`.",
        "Sequenza canonica v1.4: prova reference reale acquisita → remediation art-direction v0.3 → nuova generazione delle 5 reference → Human Visual Review/reference lock → F1–F6 + MUSEO ZERO v0.2 → Human Product Review `PASS/REWORK/REJECT` → S5 → S6. P4/P5 restano lane indipendenti. `DOS-A1=RUNTIME_DEFERRED`.",
        "STATUS_SEQUENCE_ANCHOR_NOT_FOUND",
    )
    STATUS.write_text(status, encoding="utf-8")


def reconcile_events() -> None:
    data = json.loads(EVENTS.read_text(encoding="utf-8"))
    audit_event = "TRAMA-EVT-AUDIT-V1.4-VISUAL-FACTORY-LIVE-PROOF-2026-10-05"
    live_event = "TRAMA-EVT-VF-ORCH-01-LIVE-ZERO-COST-PROOF-2026-10-05"

    for event in data["events"]:
        if event.get("eventId") == "TRAMA-EVT-AUDIT-V1.3-STUDIO-ATLAS-BASELINE-2026-10-05":
            event["status"] = "SUPERSEDED"
            if audit_event not in event.setdefault("invalidatedBy", []):
                event["invalidatedBy"].append(audit_event)
        if event.get("eventId") == "TRAMA-EVT-VF-ORCH-01-DETERMINISTIC-QUALIFICATION-2026-10-05":
            event["status"] = "SUPERSEDED"
            if live_event not in event.setdefault("invalidatedBy", []):
                event["invalidatedBy"].append(live_event)

    ids = {event.get("eventId") for event in data["events"]}
    if live_event not in ids:
        data["events"].append(
            {
                "eventId": live_event,
                "type": "BASELINE",
                "subject": "visual-factory",
                "statement": "VF-ORCH-01 has proven a real governed FREE_ONLY reference execution on main@290d6f3f0d15df3e8f8f438a46a26449d1247043. Run 37348637767 completed live execution, non-authority verification and governed evidence upload; artifact 11361642336 contains reviewable candidates. Human Visual Review and reference lock remain separate gates.",
                "status": "CURRENT",
                "rationale": "Supersedes the deterministic-only VF-ORCH baseline because real zero-cost provider execution and governed candidate materialization are now directly evidenced, without granting runtime, publication, learner or student authority.",
                "sourceRefs": [
                    {
                        "repository": "antoniocorsano-boop/trama-ecosistema",
                        "exactHead": "290d6f3f0d15df3e8f8f438a46a26449d1247043",
                        "ref": "github-actions:trama-ecosistema/run/37348637767",
                    },
                    {
                        "repository": "antoniocorsano-boop/trama-ecosistema",
                        "pullRequest": 248,
                        "exactHead": "b35df2741cddfc2781816b176b640217c40b7b38",
                        "ref": "github:trama-ecosistema/pull/248",
                    },
                    {
                        "repository": "antoniocorsano-boop/trama-ecosistema",
                        "ref": "STATUS.md",
                    },
                ],
                "validFrom": "2026-10-05T17:28:42Z",
                "supersedes": ["TRAMA-EVT-VF-ORCH-01-DETERMINISTIC-QUALIFICATION-2026-10-05"],
                "invalidatedBy": [],
                "freshness": {"policy": "UNTIL_CHANGE"},
            }
        )
    if audit_event not in ids:
        data["events"].append(
            {
                "eventId": audit_event,
                "type": "BASELINE",
                "subject": "ecosystem-audit",
                "statement": "Audit v1.4 records real Visual Factory reference generation as proven, VF-ORCH-01 live FREE_ONLY reference execution as proven, MUSEO ZERO as Human Visual Review REWORK with reference lock pending, P5 as REQUALIFICATION_PREPARED_NOT_AUTHORIZED and P4 as local-proof-package-ready candidate. Formal maturity levels remain unchanged and DOS-A1 remains RUNTIME_DEFERRED.",
                "status": "CURRENT",
                "rationale": "Reconciles the governed completion audit with evidence integrated after Audit v1.3 while preserving the distinction between technical execution, human visual acceptance, maturity promotion and runtime authority.",
                "sourceRefs": [
                    {
                        "repository": "antoniocorsano-boop/trama-ecosistema",
                        "exactHead": "290d6f3f0d15df3e8f8f438a46a26449d1247043",
                        "ref": "docs/audits/TRAMA-AUDIT-2026-10-03.md",
                    },
                    {
                        "repository": "antoniocorsano-boop/trama-ecosistema",
                        "pullRequest": 241,
                        "exactHead": "32f63da198c7341363201778c47daa032c14ddd1",
                        "ref": "github:trama-ecosistema/pull/241",
                    },
                    {
                        "repository": "antoniocorsano-boop/trama-ecosistema",
                        "pullRequest": 246,
                        "exactHead": "ef5734646964ce6403a85e53caa72ea62527e32e",
                        "ref": "github:trama-ecosistema/pull/246",
                    },
                    {
                        "repository": "antoniocorsano-boop/trama-ecosistema",
                        "pullRequest": 249,
                        "exactHead": "c3b4aa3cf952f6d4a5cc91d3015c3bfa8143ea8f",
                        "ref": "github:trama-ecosistema/pull/249",
                    },
                    {
                        "repository": "antoniocorsano-boop/trama-ecosistema",
                        "ref": "STATUS.md",
                    },
                ],
                "validFrom": "2026-10-05T17:43:00Z",
                "supersedes": ["TRAMA-EVT-AUDIT-V1.3-STUDIO-ATLAS-BASELINE-2026-10-05"],
                "invalidatedBy": [],
                "freshness": {"policy": "UNTIL_CHANGE"},
            }
        )
    data["updatedAt"] = "2026-10-05T17:43:00Z"
    EVENTS.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


if __name__ == "__main__":
    reconcile_audit()
    reconcile_status()
    reconcile_events()
    print("AUDIT_V1_4_CANONICAL_SOURCES_RECONCILED")
