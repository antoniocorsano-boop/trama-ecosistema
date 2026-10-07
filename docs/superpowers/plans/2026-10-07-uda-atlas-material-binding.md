# UDA → Atlas → MaterialBundle → Lezione — implementation plan

## Task 1 — Contratto condiviso Studio Atlas
**Files:** `products/studio-atlas/lib/teaching-material-handoff.test.ts`, `products/studio-atlas/lib/teaching-material-handoff.ts`.

RED: testare schema, tipi materiali consentiti, rifiuto di payload incompleti, callback fuori allowlist e round-trip base64url.
GREEN: implementare parser/encoder puro e fail-closed.
Verify: `npm test` + `npm run typecheck` in `products/studio-atlas`.

## Task 2 — Intake contestuale Studio Atlas
**Files:** `products/studio-atlas/app/materiali/page.tsx`, `products/studio-atlas/components/TeachingMaterialWorkspace.tsx`, `products/studio-atlas/app/globals.css`.

RED: contratto UI/statico che richiede contesto ricevuto, quattro materiali, selezione esplicita e CTA di ritorno.
GREEN: nuova superficie teacher-first, senza duplicare il percorso narrativo Studio Atlas.
Verify: build Studio Atlas.

## Task 3 — Contratto Docente OS
**Files:** `product/src/core/domain/atlas-material-handoff.test.ts`, `product/src/core/domain/atlas-material-handoff.ts`.

RED/GREEN speculare al contratto Studio Atlas; mantenere compatibilità esatta di schema e serializzazione.
Verify: product tests + typecheck.

## Task 4 — CTA UDA contestuale
**Files:** `product/src/app/progetta/page.tsx`, `product/src/app/progetta/progetta-focus.css` e test dedicato.

Aggiungere **Prepara materiali con Atlas** soltanto quando esiste un focus canonico UDA. Il link contiene un envelope versionato privo di dati studente e una callback Docente OS allowlistata.

## Task 5 — Ritorno e conferma
**Files:** nuova route `product/src/app/progetta/atlas/ritorno/*` e modello/repository di binding secondo le convenzioni persistenti già presenti.

Il bundle è mostrato prima della scrittura. Nessuna associazione automatica. Il docente seleziona la lezione e conferma.

## Task 6 — Vista materiali associati
Integrare il binding nella superficie lezione/classe canonica, senza creare un secondo workspace concorrente.

## Task 7 — E2E e Human Review
Journey: UDA → Atlas → selezione → ritorno → conferma → materiale visibile nella lezione.
Gate: Product CI, Studio Atlas CI, HVA/WCAG dove applicabili, exact-head evidence. Nessun merge automatico; Human Review finale.