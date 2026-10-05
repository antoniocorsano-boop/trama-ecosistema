#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "docs/audits/TRAMA-AUDIT-2026-10-03.md"
STATUS = ROOT / "STATUS.md"
EVENTS = ROOT / "status/project-knowledge-events.json"

P6_EVENT = "TRAMA-EVT-GHAW-T0-CLOSED-INTEGRATED-2026-10-05"
OLD_P6_EVENT = "TRAMA-EVT-GHAW-T0-STAGED-NOT-EXECUTABLE-2026-10-04"
MERGE_SHA = "4ee44c1b906f3f816600c911614f6a9b43c3785c"
PR_HEAD = "3327162f9045619fed6e5c3ba2712334390d0d24"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one occurrence, found {count}")
    return text.replace(old, new, 1)


def update_status() -> None:
    text = STATUS.read_text(encoding="utf-8")
    text = replace_once(text, "Aggiornato al 4 ottobre 2026.", "Aggiornato al 5 ottobre 2026.", "STATUS date")
    text = replace_once(
        text,
        "**v1.1 / delta verificato 04-10-2026**.",
        "**v1.2 / delta verificato 05-10-2026**.",
        "STATUS audit version",
    )
    text = replace_once(
        text,
        "- **P3 evidenze/distribuzioni:** **CLOSED / BASELINE_RECONCILED**; stato canonico, Project Knowledge persistente, Control Center e distribuzioni sono riconciliati; QE-01, Argo G5-C e gh-aw T0 restano residui separati P5/P4/P6.\n",
        "- **P3 evidenze/distribuzioni:** **CLOSED / BASELINE_RECONCILED**; stato canonico, Project Knowledge persistente, Control Center e distribuzioni restano riconciliati; Argo G5-C e QE-01 restano residui separati P4/P5.\n"
        "- **P6 gh-aw T0:** **CLOSED / INTEGRATED**; prova staged reale PASS, zero side effect persistenti sull'issue pilota, trigger finale production-only e lock strict sincronizzato; T1/T2 restano incrementi successivi separati, non attivati automaticamente.\n",
        "STATUS package summary",
    )
    STATUS.write_text(text, encoding="utf-8")


def update_audit() -> None:
    text = AUDIT.read_text(encoding="utf-8")
    text = replace_once(
        text,
        "Versione 1.1 — 4 ottobre 2026 — baseline storica del 03/10/2026 aggiornata per delta verificati, senza riscrivere le risultanze originarie.",
        "Versione 1.2 — 5 ottobre 2026 — baseline storica del 03/10/2026 aggiornata per delta verificati, senza riscrivere le risultanze originarie.",
        "audit version",
    )
    text = replace_once(
        text,
        "Stato del riferimento: il documento è presente su `main` TRAMA e resta la baseline trasversale di completamento. La versione 1.1 aggiorna soltanto delta verificati e priorità operative; non promuove capacità prive di prova e non autorizza nuovi runtime.",
        "Stato del riferimento: il documento è presente su `main` TRAMA e resta la baseline trasversale di completamento. La versione 1.2 incorpora i delta verificati fino alla chiusura P6/gh-aw T0; non promuove capacità prive di prova, non attiva T1/T2 e non autorizza nuovi runtime.",
        "audit reference state",
    )

    marker = "\n## 5. Quattro problemi trasversali\n"
    if marker not in text:
        raise SystemExit("audit insertion marker missing")
    if "## 4-sexies. Delta verificato — 5 ottobre 2026 — P6 — CLOSED / INTEGRATED" not in text:
        delta = f'''\n## 4-sexies. Delta verificato — 5 ottobre 2026 — P6 — CLOSED / INTEGRATED\n\nQuesta sezione supersede, per lo **stato corrente di P6/gh-aw T0**, le occorrenze storiche `STAGED / NOT_EXECUTABLE` e `P6 = OPEN` nelle sezioni precedenti. Le risultanze originarie restano conservate come cronologia dell'audit.\n\n### Qualificazione agentica T0\n\n- La precedente TRAMA PR #214 è stata chiusa come **SUPERSEDED**, senza merge; il lavoro valido è stato riallineato sulla baseline corrente nella PR #236.\n- La PR TRAMA #236 è stata qualificata sull'exact head `{PR_HEAD}` e integrata con squash merge `{MERGE_SHA}`.\n- Il trial reale controllato su issue #117 ha completato, nell'attempt 2 del run `37254749917`, compile-check, pre-activation, activation, GitHub Copilot CLI, threat detection, safe outputs e conclusion.\n- Il primo attempt aveva isolato un `HTTP 401` dovuto al PAT usato da `COPILOT_GITHUB_TOKEN` privo del permesso **Copilot Requests**. La correzione è stata limitata al nuovo fine-grained PAT con `Copilot Requests: Read`; il contratto T0 non è stato ampliato per far passare il trial.\n- L'output staged proponeva la label `enhancement` e una nota maintainer-facing non autorevole. La verifica prima/dopo su #117 ha confermato **state open, 0 commenti, 0 label e `updated_at` invariato**: nessuna write persistente.\n\n### Contratto finale e regressione\n\n- Dopo il trial sono state rimosse tutte le superfici temporanee: nessun `workflow_call`, nessun `workflow_dispatch`, nessun job di trial permanente e nessuno step permanente con token privilegiato.\n- Il sorgente finale scatta soltanto su issue `opened/reopened`, mantiene agente read-only per l'analisi e `safe-outputs.staged: true`; label consentite: `bug`, `enhancement`, `documentation`, `question`, massimo una.\n- Il lock finale è stato generato con `gh aw compile --strict`, compiler `v0.89.21`, ed è sincronizzato con il sorgente.\n- Sul final head `{PR_HEAD}`: gh-aw T0 compile check run `37257375965` PASS e Governance run `37257376016` PASS.\n- Sul merge `{MERGE_SHA}`: commit GitHub verified; Post-Merge Baseline Integrity run `37257624779` PASS; compile-check, build e Governance/validate post-merge PASS sullo stesso SHA.\n\n### Esito e confini\n\n**P6 — CLOSED / INTEGRATED.** La condizione di uscita T0 è soddisfatta: esecuzione agentica osservata entro i confini, safe-output realmente staged, zero side effect persistenti, lock strict e regressione permanente. T1/T2 restano incrementi futuri separati e non sono autorizzati o attivati automaticamente da questa chiusura.\n\nRestano aperti come residui prioritari indipendenti:\n\n- **P4 / Argo G5-C:** prova reale LibreOffice/didUP ancora necessaria;\n- **P5 / QE-01:** `REQUALIFICATION_REQUIRED`, nessuna esecuzione runtime inferita;\n- `DOS-A1` resta `RUNTIME_DEFERRED`; nessuna promozione Production è implicata.\n'''
        text = text.replace(marker, delta + marker, 1)

    text = replace_once(
        text,
        "F03 Evidenze non consolidate: il delta P1/P2 del 4 ottobre deve ancora essere proiettato coerentemente in snapshot, Control Center e memoria di progetto; QE-01, Argo e gh-aw mantengono inoltre residui propri. Questo è il focus immediato di P3.",
        "F03 Evidenze non consolidate: P1/P2/P3 sono riconciliati e la chiusura P6 viene proiettata dalla v1.2 nelle fonti governate; restano da consolidare soltanto gli esiti futuri di QE-01 e Argo quando produrranno nuova evidenza reale.",
        "F03 current state",
    )
    text = replace_once(
        text,
        "F04 Capacità dichiarate senza prova completa: installazione PWA device-native, QE-01, gh-aw controllato, TypeSafe, didUP e R3-P4 restano esempi attuali. Il flusso manuale Orario non rientra più in questo gruppo.",
        "F04 Capacità dichiarate senza prova completa: installazione PWA device-native, QE-01, TypeSafe, didUP e R3-P4 restano esempi attuali. gh-aw T0 non rientra più in questo gruppo dopo il trial staged reale e l'integrazione P6.",
        "F04 current state",
    )

    text = replace_once(
        text,
        "| P3 | **NEXT** | Riconciliare stato, distribuzioni, snapshot, Control Center e project knowledge |",
        "| P3 | **CLOSED / BASELINE_RECONCILED** | Stato, distribuzioni, snapshot, Control Center e Project Knowledge riconciliati |",
        "P3 package table",
    )
    text = replace_once(
        text,
        "| P6 | **OPEN** | gh-aw T0 da provare in esecuzione controllata |",
        "| P6 | **CLOSED / INTEGRATED** | T0 qualificato con trial staged reale e zero side effect; T1/T2 restano incrementi separati |",
        "P6 package table",
    )

    p6_old = '''### P6 — gh-aw\nResponsabile: TRAMA. Fonti: #214 e workflow .github/workflows/*.md/.lock.yml.\n- [ ] Riverificare compile e configurazione; limiti add-labels.allowed, repository consentiti e safe-outputs.\n- [ ] Eseguire prova controllata prevista dal contratto solo dopo soddisfacimento dei prerequisiti.\n- [ ] Registrare risultato, permessi effettivi, errori, modifiche consentite e procedura di disattivazione.\n- [ ] Misurare attività ripetitive risparmiate senza dedurre qualità dal numero di commenti.\n- [ ] Introdurre T1 sola lettura; T2 solo proposte documentate su F01–F04 dopo T0 provato.\nUscita: esecuzione osservata entro i confini, non solo compilazione. Nessun passaggio automatico di autorità.\n'''
    p6_new = f'''### P6 — gh-aw T0\nResponsabile: TRAMA. Fonti correnti: PR #236, exact head `{PR_HEAD}`, merge `{MERGE_SHA}`, workflow `.github/workflows/trama-t0-issue-triage.md` + lock compilato.\n- [x] Compile/configurazione verificati; allow-list chiusa, agente read-only, safe-output staged.\n- [x] Prova controllata reale eseguita su issue #117 dopo i prerequisiti di autenticazione.\n- [x] Risultato e permessi effettivi registrati; primo errore 401 isolato e corretto senza ampliare il contratto.\n- [x] Zero side effect verificato prima/dopo; superfici di trial e step privilegiati rimossi.\n- [ ] Misurazione del risparmio operativo: follow-up osservativo, non condizione di chiusura T0.\n- [ ] T1 sola lettura e T2 propositive: eventuali incrementi separati, ciascuno con proprio perimetro e qualifica; non attivati automaticamente.\nUscita T0: **soddisfatta** — esecuzione osservata entro i confini, non solo compilazione; nessun passaggio automatico di autorità.\n'''
    text = replace_once(text, p6_old, p6_new, "P6 detailed section")

    text = replace_once(
        text,
        "Prima attività esecutiva aggiornata dalla v1.1: **P3 — allineamento evidenze/distribuzioni**. La precedente priorità P1 è chiusa come cantiere applicativo con residuo device-native registrato; P2 è verificato/integrato. Nessuna nuova attività deve riaprire P1 senza un bug riproducibile o una decisione esplicita.",
        "Prima attività esecutiva aggiornata dalla v1.2: **P4 — Argo G5-C**, quando è disponibile l'ambiente reale LibreOffice/didUP necessario alla prova; in assenza di tale ambiente può procedere **P5 — QE-01** come riconciliazione separata, senza dichiarare P4 chiuso. P1/P2/P3/P6 restano chiusi nei rispettivi perimetri e non vanno riaperti senza nuova evidenza o decisione esplicita.",
        "audit next activity",
    )
    AUDIT.write_text(text, encoding="utf-8")


def update_events() -> None:
    payload = json.loads(EVENTS.read_text(encoding="utf-8"))
    events = payload["events"]
    by_id = {event["eventId"]: event for event in events}

    old = by_id[OLD_P6_EVENT]
    old["status"] = "SUPERSEDED"
    old["invalidatedBy"] = [P6_EVENT]

    p3 = by_id["TRAMA-EVT-P3-BASELINE-RECONCILED-2026-10-04"]
    p3["statement"] = p3["statement"].replace(
        "P4/P5/P6 residuals remain explicitly separate and open.",
        "At the P3 closure baseline, P4/P5/P6 residuals were explicitly separate and open; later closures are recorded by their own events.",
    )

    if P6_EVENT not in by_id:
        events.append({
            "eventId": P6_EVENT,
            "type": "CLOSURE",
            "subject": "gh-aw-t0",
            "statement": "P6 gh-aw T0 is CLOSED / INTEGRATED: controlled staged execution completed successfully, safe outputs produced zero persistent side effects, the production-only trigger and strict compiled lock are integrated on TRAMA main.",
            "status": "CURRENT",
            "rationale": "PR #236 replaced superseded PR #214, qualified the real staged agent path on issue #117, isolated and corrected the Copilot PAT permission blocker, removed all trial-only surfaces, and passed final plus post-merge governance/compile checks without granting authority or runtime promotion.",
            "sourceRefs": [
                {
                    "repository": "antoniocorsano-boop/trama-ecosistema",
                    "pullRequest": 236,
                    "exactHead": PR_HEAD,
                    "ref": "gh-aw T0 — controlled staged issue triage qualification",
                },
                {
                    "repository": "antoniocorsano-boop/trama-ecosistema",
                    "exactHead": MERGE_SHA,
                    "ref": "main",
                },
                {
                    "repository": "antoniocorsano-boop/trama-ecosistema",
                    "exactHead": "9b66f24748b6dbcbb36e0cec1009c9a360381c2f",
                    "ref": "github-actions:workflow-run/37254749917#attempt-2",
                },
                {
                    "repository": "antoniocorsano-boop/trama-ecosistema",
                    "exactHead": PR_HEAD,
                    "ref": "github-actions:workflow-run/37257375965",
                },
                {
                    "repository": "antoniocorsano-boop/trama-ecosistema",
                    "exactHead": MERGE_SHA,
                    "ref": "github-actions:workflow-run/37257624779",
                },
            ],
            "validFrom": "2026-10-05T03:00:44Z",
            "supersedes": [OLD_P6_EVENT],
            "invalidatedBy": [],
            "freshness": {"policy": "UNTIL_CHANGE"},
        })

    payload["updatedAt"] = "2026-10-05T03:00:44Z"
    EVENTS.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    update_status()
    update_audit()
    update_events()
    print("AUDIT_V1_2_P6_RECONCILED")


if __name__ == "__main__":
    main()
