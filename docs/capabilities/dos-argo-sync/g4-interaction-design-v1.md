# CAP-DOS-ARGO-SYNC — G4 Interaction Design v1

**Lifecycle:** G4 — Design  
**Status:** PASS / FLOW-VALIDATED  
**Runtime:** NOT_AUTHORIZED  
**Depends on:** G3 Specification v1, ARGO_PROGRAM_XLS_PROFILE_v1

## 1. Design objective

Make Argo export feel like a natural final step of annual programming, not a technical file-conversion tool.

The teacher should understand:
- whether the programming is ready;
- what will be exported;
- what needs fixing;
- whether the file is current or stale;
- what to do next in Argo;
- whether synchronization has been confirmed.

## 2. Placement in Docente OS

Primary placement is bound to the real Docente OS surfaces:

```text
AppShell
→ Piano annuale
→ section/class context
→ annual programming
→ consolidated state
→ Prepara file per Argo
```

`Progetta → Programmazione annuale` may expose a contextual secondary link into the same canonical workflow.

The Argo action must not create a new top-level navigation item or parallel shell.

It must not live only in:
- Settings;
- Tools;
- generic Import/Export;
- developer/admin surfaces.

## 3. Primary states

### Draft

Header:

`Programmazione annuale — Tecnologia — 1A`

State badge:

`In lavorazione`

Primary action:

`Consolida programmazione`

Argo action:
- not primary;
- optional preview may explain that final generation becomes available after consolidation.

### Consolidated

State badge:

`Consolidata`

Primary actions:

- `Prepara file per Argo`
- secondary `Riapri modifica`

### Ready for Argo

Show a review surface with:

- year/class/subject;
- module count;
- argument count;
- package type;
- warnings;
- blocking issues;
- expandable module list.

Primary action:

`Genera file .xls per Argo`

### Generated / awaiting confirmation

Show:

- file name;
- generated date/time;
- current status;
- clear manual next step.

Actions:

- `Apri istruzioni per Argo`
- `Conferma importazione riuscita`
- `Segnala problema`
- `Rigenera` only when still current.

### Confirmed

State badge:

`Importazione Argo confermata`

Show:
- confirmed date;
- artifact version;
- baseline status.

No repeated prompt to confirm the same artifact.

## 4. Preparation panel

Recommended structure:

### Section A — Contesto

- anno scolastico;
- classe;
- disciplina;
- stato programmazione.

### Section B — Cosa verrà esportato

- N moduli;
- N argomenti;
- execution-state coverage where present.

### Section C — Controlli

Each finding appears as:
- icon;
- short plain-language title;
- affected item;
- fix action when possible.

### Section D — File Argo

Only when validation passes:
- `Genera file .xls per Argo`.

Technical details are collapsed by default.

## 5. Conflict design

Conflict is not a red generic error.

A conflict item must state:
- what changed;
- why the system cannot decide safely;
- what the teacher can do.

Example:

`Questo argomento risulta già utilizzato e non può essere rimosso automaticamente.`

Actions:
- `Mantieni`
- `Modifica`
- `Escludi dalla sincronizzazione`

No automatic choice.

## 6. Stale artifact design

If the teacher edits programming after file generation:

Prominent message:

`La programmazione è cambiata dopo la generazione del file Argo.`

Status:

`File precedente non più aggiornato`

Primary action:

`Consolida e rigenera`

The old file remains in history but is no longer presented as current.

## 7. Manual Argo handoff

After generation, the screen must explain the next action in plain language:

1. apri Argo didUP;
2. vai a Didattica → Programma Scolastico;
3. usa Importa da file Excel/XLS;
4. seleziona il file generato;
5. verifica moduli e argomenti;
6. torna in Docente OS e conferma l'esito.

This guidance is contextual help, not browser automation.

## 8. Confirmation design

Confirmation dialog must identify the exact artifact:

- file name;
- generated timestamp;
- class;
- subject.

Prompt:

`Hai importato questo file in Argo e verificato che moduli e argomenti siano corretti?`

Actions:
- primary `Conferma importazione riuscita`
- secondary `Non ancora`
- tertiary `Segnala problema`

No preselected consent.

## 9. Problem-report path

If teacher chooses `Segnala problema`:

Choices:
- Argo ha rifiutato il file;
- contenuti duplicati;
- contenuti mancanti;
- contenuti diversi da quelli attesi;
- esito non chiaro;
- altro.

Result:
- sync state becomes FAILED or UNKNOWN;
- baseline does not advance;
- teacher receives next-step guidance.

## 10. Responsive behavior

### Desktop

Use a single main reading column with a secondary sticky summary only if it improves orientation.

Avoid dense dashboard-card mosaics.

### Tablet

Stack summary and review sections vertically; keep primary action visible without horizontal scrolling.

### Mobile

- one-column flow;
- no wide table dependency;
- modules become expandable sections;
- counts and status remain visible;
- bottom sticky action may be used for the single current primary action;
- technical details remain secondary.

## 11. Accessibility

- all controls keyboard reachable;
- disclosure controls expose state;
- validation summary receives focus after failed validation;
- first blocking finding can be reached directly;
- generated-file success is announced to assistive technology;
- state badges include text, not only icon/color;
- confirmation dialog traps focus correctly and restores it on close;
- module/argument review has semantic headings/lists or accessible table structure.

## 12. Perceptible feedback

### Consolidate

`Programmazione consolidata. Ora puoi preparare il file per Argo.`

### Validation blocked

`Il file non può ancora essere generato. Correggi 2 elementi.`

### Generation in progress

`Sto preparando il file per Argo…`

### Generation success

`File pronto. Ora puoi importarlo in Argo.`

### Confirmation success

`Importazione confermata. La baseline è aggiornata.`

### Unknown result

`L'esito in Argo non è stato confermato. La baseline precedente resta valida.`

## 13. Empty states

### No modules

`La programmazione non contiene ancora moduli da esportare.`

Action:
`Aggiungi modulo`

### No arguments

Module-level warning:
`Questo modulo non contiene argomenti.`

Whether it blocks generation follows G3/profile rules.

## 14. Technical details disclosure

Optional section:

`Dettagli tecnici`

May expose:
- profile version;
- artifact SHA-256;
- validation result;
- package mode;
- sync ID.

This is not visible by default.

## 15. Design invariants

- one primary action per state;
- no technical jargon in main flow;
- no hidden automatic write;
- no confirmation before actual external verification;
- no stale artifact presented as current;
- no conflict silently resolved;
- teacher always understands the next step.

## 16. G4 Definition of Done status

- [x] user journey/task flow defined;
- [x] information architecture and interaction states defined;
- [x] desktop/mobile/responsive behavior defined;
- [x] accessibility addressed;
- [x] success/error/waiting/recovery feedback defined;
- [x] human control and authority boundaries preserved;
- [x] prototype/mockup evidence available as flow evidence;
- [x] design review findings resolved in `g4-design-review-v1.md`;
- [x] handoff traceable to G3 requirements.

## 17. Current G4 assessment

**PASS / READY_FOR_G5 PLANNING.**

No runtime implementation is authorized.


## 18. Visual fidelity rule

The generated mockup is **non-binding visually**.

Implementation must reuse the real Docente OS AppShell/navigation/components and preserve the established product language.

The mockup is authoritative only for flow, state transitions, action semantics, feedback and confirmation timing.

See `g4-design-review-v1.md` for the AppShell reconciliation and resolved findings.
