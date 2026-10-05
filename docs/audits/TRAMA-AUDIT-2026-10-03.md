# TRAMA-AUDIT-2026-10-03 — Audit di completamento e piano operativo
Versione 1.4 — 5 ottobre 2026 — baseline storica del 03/10/2026 aggiornata per la prova reale Visual Factory, il riesame MUSEO ZERO e i residui P4/P5, senza riscrivere le risultanze originarie.

## 1. Mandato, validità e precedenza
Questo documento consolida la ricognizione riportata nella conversazione e ne fa la baseline di confronto per il completamento dell'intero ecosistema. La richiesta dell'utente autorizza il salvataggio e la pianificazione; non attesta nuove prove funzionali.
Le risultanze tecniche dell'audit precedente sono conservate come EVIDENZE RIPORTATE: in questo turno non sono stati rieseguiti i controlli sui quattro prodotti, sui dispositivi o sui provider. Sono stati letti direttamente README.md, STATUS.md e GOVERNANCE.md di TRAMA; confermano la separazione delle autorità e lo stato documentale al 30 settembre.
Non si trasformano i risultati storici in certificazioni attuali. Prima di intervenire, confrontare ogni rilievo con SHA completo, ramo, PR, esito corrente e distribuzione reale.
Precedenza: decisioni/contratti approvati → STATUS.md → piano operativo canonico → specifiche integrate → questo audit, come riferimento trasversale di completamento. La sua integrazione documentale non promuove capacità, non autorizza esecuzioni e non certifica conformità.
Stato del riferimento: il documento è presente su `main` TRAMA e resta la baseline trasversale di completamento. La versione 1.4 incorpora la prova reale FREE_ONLY della Visual Factory, mantiene separata la qualità visuale dalla riuscita tecnica, registra il riesame MUSEO ZERO come REWORK e riallinea P4/P5 senza promuovere capacità prive di prova, attivare T1/T2 o autorizzare nuovi runtime. Le versioni 1.3 e 1.2 restano conservate come baseline precedenti e cronologia verificabile.

## 2. Criterio di completamento
Per ogni capacità mantenere separati: dichiarazione, implementazione, verifica automatica, prova di uso, distribuzione, autorità e integrazione dell'evidenza.
COMPLETATA nel proprio perimetro solo quando comportamento e limiti sono dimostrati, versione verificata e versione distribuita corrispondono, dipendenze sono soddisfatte e ricevuta è consolidata. NO_RUNTIME può essere chiuso come infrastruttura e resta privo di esecuzione.
Stati di lavoro: DA_RIVERIFICARE, BLOCCATA, PARZIALE, PRONTA_PER_PROVA, VERIFICATA, INTEGRATA, DIFFERITA. Nessuna percentuale complessiva.
Una issue aperta non dimostra da sola un difetto; una issue chiusa o CI verde non dimostrano da sole il completamento.

## 3. Invarianti
- Arena: autorità curricolare; Docente OS: contesto professionale e decisione docente; Atlas: pubblicazione e navigazione.
- Arena → Docente OS diretto; Atlas opzionale.
- Control Center READ_ONLY; Drive non è autorità tecnica concorrente.
- DOS-A1 = RUNTIME_DEFERRED; OR-04→OR-10 NO_RUNTIME.
- Atlas senza account, profili o tracciamento individuale degli studenti.
- Nessuna adozione/pubblicazione autonoma, nuova esecuzione qualificata o uso di credenziali autorizzati da questo documento.
- Priorità Docente OS: chiudere orario mobile + PWA + condivisione prima di nuovi fronti funzionali importanti.
- Revisione umana per decisioni di autorità o irreversibili; verifiche proporzionate per correzioni ordinarie, senza ripetere approvazioni generali.

## 4. Baseline di audit conservata
Gli SHA abbreviati sotto sono quelli riportati dall'audit originario; non utilizzarli come pin esecutivi senza recuperarne il valore completo.

| ID | Area/capacità | Risultanza riportata | Evidenza/rilievo e limite |
| --- | --- | --- | --- |
| A01 | Governance TRAMA | Consolidata nel perimetro documentale | Head ecc26952e639…; Governance, snapshot, CC, CC3, post-merge e build PASS riportati; non certificazione generale |
| A02 | Stato e memoria di progetto | Parzialmente allineati | ecosystem-snapshot.json 1.6.0 del 30/09 19:53 UTC; sette controlli PASS, quattro aree PARTIAL; lavori successivi non incorporati |
| A03 | Arena autorità/provenienza | Operativa | 7d0e9d1e30af…; CurManLight Product CI PASS riportato |
| A04 | CurriculumSnapshot/ECO-01 | Chiusi nel perimetro | Baseline e passaggio curricolare consolidati |
| A05 | ECO-02 preparazione→lezione | Chiuso/provato nel pilota | Tecnologia 2C, accettazione umana; non prova universale della V1 |
| A06 | Educazione civica EC-01/Arena-F4 | Integrata con residui | Issue Arena #326 aperta a fronte dello stato CLOSED; STATUS precisa Edge Function validata ma non distribuita e nessun fingerprint reale creato automaticamente |
| A07 | Arena maturità M4 | Incompleta | #121 A1–A10 aperta |
| A08 | Arena componenti/accessibilità | Consolidamento aperto | #271 design system; #292 audit browser/modale LLM; qualificazione di componenti distinta da prodotto completo |
| A09 | Atlas fondazione R3-F0/S3-V2 | Chiusa/provata | db3fed294fe7…; deploy canonico PASS riportato; superfici Home, Curricolo, Esplora, Materiali, Risorse, Percorsi, Obiettivi, Raccordi |
| A10 | Arena→Atlas sincronizzazione | Bloccata | Run 37110196676: pnpm non trovato durante setup-node@v5; ramo fix/arena-curriculum-sync-bootstrap non integrato secondo audit |
| A11 | Atlas R3-P2 curricolo pubblico | Parziale | Superfici presenti, fase non formalmente chiusa |
| A12 | Atlas R3-P3 Student Learning Hub | Pianificata | Non capacità completa |
| A13 | Atlas R3-P4 pubblicazione da Docente OS | Non implementata/non autorizzata | Non aprire runtime implicitamente |
| A14 | Atlas R3-P5 percorsi/navigazione | Parziale | #44 Percorsi G2; #53 flusso Smart end-to-end |
| A15 | Atlas R3-P6 salute curricolo | Pianificata | Nessuna chiusura dimostrata |
| A16 | Atlas consultazione EC-01 e asset | Pendenti | #11, #52/#56 asset, #54 distribuzione Smart studenti |
| A17 | Docente OS nucleo professionale | Operativo con debito | main c1301f1f2910… Product CI/Pages PASS; #626 V1 E0→E5 e #648 uso quotidiano aperte |
| A18 | Docente OS distribuzione | Da riconciliare | Vercel docente-os-product success / docente-os-2026-27 failure riportati; PROJECT_HEALTH.md del 22/08 cita ancora Netlify |
| A19 | Orario mobile/PDF | Bloccato nell'uso | #653 draft, conflitto develop, Product CI FAIL; test real-device mobile flow keeps primary action compact and secondary controls collapsed attende timetableKeyboardHelp rimosso |
| A20 | PWA/Android/condivisione | Non chiuse end-to-end | #649/#629/#601/#655; PDF→nome→estrazione→revisione→conferma→persistenza non accettato; #652 superata da #653 |
| A21 | Conoscenza: acquisizione/provenienza | Operativa con debito | #514 ricerca semantica bounded; #584 Aggiungi/Cerca/Recenti |
| A22 | Copilota contestuale | Parziale | #415/#417/#419/#426/#429: K1/K2, confronto prestazioni in italiano, provider/privacy |
| A23 | Voce/acquisizione contestuale | Incompleta | #385/#491/#493/#499/#501; evitare dedurre duplicazione dai soli titoli |
| A24 | Evidenze didattiche/riflessione | Incompleta | #349/#352/#353/#354/#355/#356/#357; R4-P2 design consentito, runtime non autorizzato |
| A25 | Multi-docente/adozione organizzativa | Non dimostrata | #337 secondo docente isolato; #387 configuratore istituzionale |
| A26 | Argo/didUP G5-A/B | Integrate | Docente OS #646: proiezione, validazione e provenienza |
| A27 | Argo G5-C BIFF8 | Prova automatica pronta, prova reale mancante | #647 CI PASS; foglio Dati sei colonne, round-trip, OLE/CFB, senza macro/formule/link; apertura LibreOffice e import didUP non attestati; TRAMA #187 dirty |
| A28 | OR-04→OR-10 e portabilità | Qualificate NO_RUNTIME | Nessuna esecuzione reale derivata dall'integrazione |
| A29 | Harness P0 | Prove deterministiche storiche | Stub/zero rete già riportati PASS; non prova provider reale |
| A30 | QE-01 | Bloccata/riqualificazione necessaria | #212 body AUTHORIZED_FOR_QUALIFIED_EXECUTION contro validatore QE01-PENDING-STATE, EXECUTION_FAILED_REQUALIFICATION_REQUIRED, executable=false; prevale risultato corrente da riverificare |
| A31 | DOS-A1 | Differita | RUNTIME_DEFERRED |
| A32 | gh-aw T0 | Preparato, non qualificato operativamente | #214 draft; compile/Governance PASS riportati; prova controllata mancante |
| A33 | gh-aw T1/T2 | Successivi | Consolidamento evidenze e manutenzione/proposte, senza autorità automatica |
| A34 | Control Center CC2 F0–F6 | Integrato | Osservatorio, maturità, evidenze, mappa, cronologia, memoria di progetto |
| A35 | Control Center modulare A0–A6 | Qualificato/integrato nel perimetro | Build schedulata PASS riportata; non prova A7 pubblico |
| A36 | A7 pubblico/evidenze | Catena incompleta | #194 draft; deploy dep-daui5gjbc2fs73cn5ug0 / commit 41bc34c… documentati; HTTP non verificato nell'audit; #213 da riconciliare |
| A37 | CC3 previsione governata | Parziale | F0/F1 chiusi; F2 scenari, F3 dipendenze, F4 adozione, F5 calibrazione pianificati |
| A38 | TypeSafe/TRAMA-SA-01 | Advisory parziale | HOLDOUT one-shot non eseguito; nessuna promozione |
| A39 | R4-P1 Officina materiali | Pianificata | Architettura, nessun runtime |
| A40 | R4-P2 Professional Practice | Design autorizzato | Nessuna chiusura runtime |
| A41 | R5 nome/marca/adozione | Pianificati | Dossier dati personali, formazione, assistenza, costi, domanda e pilota istituto da completare |

## 4-bis. Delta verificato dopo l'audit — 3 ottobre 2026
Questo delta aggiorna lo stato operativo senza riscrivere le risultanze storiche A01–A41.

- Docente OS `develop` è a `0b498c0ff399310cc5f4a51c491051fd7b1a1d02`.
- Le PR Docente OS #654, #656 e #658–#669 risultano integrate; il filone Orario ha quindi già acquisito unificazione upload/Share Target, separazione consultazione/aggiornamento/gestione, regressione sul PDF reale, percorso raster, OCR locale browser, timetable mobile prioritaria e rebaseline DOS-CRM.
- La candidata `0.1.0-rc.1` è congelata sullo SHA esatto `efc31ed084da9cc6fe495ac6403151c3361f428a`. Il tag `v0.1.0-rc.1` esiste, risolve a quello SHA e la GitHub prerelease è pubblicata.
- Il confronto `efc31ed… → develop@0b498c0…` mostra due commit successivi e modifiche soltanto a `CHANGELOG.md`, note di release e manifesto RC: nessuna modifica al codice prodotto.
- Docente OS #670 è una proposta documentale separata per riallineare manifesto/note/changelog allo stato GitHub già verificato; fino all'integrazione resta proposta, non stato canonico del ramo `develop`.
- P1 non richiede un terzo ramo funzionale dell'Orario. La condizione di uscita corrente è la validazione reale dell'exact RC: PDF raster reale → OCR locale → docente → 14 lezioni attese → revisione → conferma → persistenza, insieme a installazione PWA e Share Target Android con app aperta/chiusa.
- #652 e #653 sono stati sottoposti a salvage e chiusi come `SUPERSEDED`, senza merge. #653 è superato dalla pipeline local-first/OCR già integrata; da #652 è stato preservato in #649 soltanto il finding UX condizionale su stato di avanzamento molto visibile e anteprima compatta, da usare solo se la prova RC riproduce ancora il difetto.
- La pubblicazione della RC non equivale a `CERTIFIED` né a `PROMOTED`; la promozione Production resta fuori dal perimetro e richiede una decisione separata.
- Arena→Atlas: il run schedulato `37110196676` è stato riesaminato e fallisce in `actions/setup-node@v5` perché la cache automatica tenta di invocare pnpm, pur non essendoci alcun comando pnpm nel job. Atlas #67 propone il fix minimo `package-manager-cache: false`; è una draft PR, non ancora integrata. La regressione di configurazione è stata riprodotta RED e verificata GREEN sul blocco workflow esatto.
- Docente OS #671 propone la remediation del REAL Android FAIL di `rc.1`, exact head `163c0fa00792759b9685d933422e4b2db8611b6b`: OCR locale max 1200 px, deadline 30 s comprensiva di bootstrap Tesseract, progresso percepibile e UI manuale secondaria. TDD RED→GREEN osservato; Product CI, Browser Certification, HVA, WCAG automated, Design, TRAMA-PW, ASVS e Human Interaction PASS sull'exact head. La PR resta draft/non integrata e non costituisce `rc.2`; P1 resta aperto fino alla prova Android reale `Corsano → 14 lezioni → revisione → conferma` sulla nuova candidata distribuita.

## 4-ter. Delta verificato — chiusura tecnica Orario e ripristino bootstrap Arena→Atlas

- Docente OS #677 è stata integrata in `develop` con merge SHA `72d4282ff29a4ca09c2092de57d028b12dd4afd9`: il gate Operational Security non dipende più dalla fixture hosted X5 obsoleta. Il gate corretto è stato verificato PASS sia sulla PR #677 sia nel ciclo finale di #676.
- Docente OS #676 è stata certificata sull'exact head `2f799e170c34d1bf0431cfe5145df0e26b580a12` con Browser Certification, K1 Application Acceptance, Operational Security, ASVS, DPG, Perceptible Write, HIM e gli altri gate applicabili PASS; è stata poi integrata in `develop` con merge SHA `82a5697d5d41bd4a0c23c9bd68802651b8a93138`.
- La capacità Orario cambia baseline: editing manuale diretto come percorso canonico; decorrenza esplicita e versioning non distruttivo; tipologia attività con indicatore visivo sottile; importazione PDF/OCR resta fallback sperimentale e non bloccante. A19 passa da BLOCCATA a PRONTA_PER_PROVA_E2E. P1 non è ancora chiuso: occorre verificare sulla Beta corrispondente modifica → decorrenza → salvataggio → riapertura/persistenza → versione successiva senza perdita dello storico, oltre ai residui PWA/Share Target ancora effettivamente aperti.
- Il servizio Beta Render ha avviato automaticamente il deploy `dep-db0js85g1s2s738qadn0` sul merge SHA `82a5697d5d41bd4a0c23c9bd68802651b8a93138`; al momento di questo aggiornamento il deploy è BUILD_IN_PROGRESS. Non viene quindi ancora dichiarata prova Beta sul nuovo SHA.
- Atlas #67, fix minimo del bootstrap Arena Curriculum Sync, è stata integrata con merge SHA `d3e8a8f7d07c6f90703a180614a170b2cd899aa6` dopo i gate Arena curriculum candidate integrity, provisional governance regression, Perceptible Write e publication authority PASS sull'exact head `d8fa91b9266dfeb9b128d924dde0525d4ce58514`. Il build post-merge è in coda: P2 non è ancora chiuso finché non è dimostrato un run completo del percorso di sync e i controlli di autorità/digest.
- Nessuna modifica a DOS-A1: resta RUNTIME_DEFERRED. Nessuna promozione Production è implicata da queste integrazioni.

## 4-ter. Delta verificato — A14 Atlas Percorsi / Experience Engine — 03/10/2026

La riga A14 della fotografia iniziale resta storicamente **Parziale**. Dopo quella fotografia è stato prodotto e verificato il seguente avanzamento materiale:

- **Atlas PR #69 exact head:** `5227c5200b46c91230e66f7fe3a917666c8c77fb` — Draft, mergeable al momento della rilevazione.
- **Stato A14 aggiornato:** `IMPLEMENTATION_QUALIFIED / NOT_RUNTIME_AUTHORIZED`.
- **Quattro casi di conformità dimostrati:** Smart SP-01 (`sistema-tecnologico`), Smart `fonte-digitale`, Percorso PW-MISSING e Percorso `pw-constraints-tradeoffs-01`.
- **Autorità secondo Percorso:** TRAMA #217 exact head `81534e352396ad858c7cf5ee00c7ec3b0756ae64`, Human Review PASS limitato alla registrazione come implementation candidate.
- **CI canonica Experience Engine:** run push `37144776481` PASS sull'exact Atlas head corrente; i run `37144151493` e `37144148146` restano prove PASS del predecessore immediato prima dell'allineamento a `main`.
- **Evidenze aggiuntive sul predecessore immediato `bfa9746e81fb413133887742a4825eeba7fa90f9` (delta verso l'head corrente limitato al workflow Arena→Atlas):** Percorsi Portfolio Factory `37144151492` PASS; Percorsi G2 Validator `37144151490` PASS; Percorsi G2 UX Collaudo `37144151545` PASS; Mobile/LIM `37144151548` PASS; Visual Evidence F1/F2/F3 `37144151528`/`37144151513`/`37144151523` PASS; TRAMA Perceptible Write `37144151506` PASS; Component Isolation R1 `37144151453` PASS.
- **Catalogo pubblico:** resta fail-closed per i Percorsi non autorizzati al runtime; nessuna route candidata deve diventare pubblicamente avviabile per effetto di questa qualificazione.
- **Confini invariati:** nessun merge automatico, nessuna autorizzazione runtime studenti, nessun cambio di autorità Arena, nessuna promozione automatica Smart→Percorsi, `DOS-A1=RUNTIME_DEFERRED`.

**Residuo A14:** decisione umana di integrazione sull'exact implementation/evidence head e, separatamente, eventuale futura decisione di runtime promotion. La qualificazione dell'implementazione non soddisfa da sola il requisito P7 di “percorso pubblico” autorizzato.

## 4-quater. Delta verificato — 4 ottobre 2026 — P1/P2 e riallineamento del piano

Questo delta usa gli head correnti verificati il 4 ottobre 2026:

- TRAMA `main@4d2605f516ef939cf86cc2cabbac5ada96666f0e`;
- Arena / Curriculum-Manager `main@66fd4bd39b645b6738ace02f53d4cab9233f8b2c`;
- Atlas / Curriculum-Atlas `main@b7b95e81e896a027335b3398d222660aa81f928a`;
- Docente OS `develop@09a3a3600b81992f3675be82d1d2f188f1643909`.

### A19 / P1 — Orario mobile e versioning

A19 passa da **PRONTA_PER_PROVA_E2E** a **VERIFICATA_SU_BETA** nel perimetro del flusso manuale canonico.

Evidenze:

- Docente OS #684 exact head `45ea89d309674fcd25f2b8e4ad4fe05e0e7fda09`, merge `7009f3e05c428254dddf3b2cc491b506af554cdb`;
- prova reale Android completata sul percorso **Orario → Modifica → Data → Controlla → Metti in uso → Orario**;
- decorrenza retrodatabile nell'anno scolastico, con schema runtime Supabase **v86** e lineage PASS;
- Product CI, Browser Certification, HVA, WCAG, P6 e gate applicabili PASS sull'exact head;
- beta canonica successivamente consolidata sul merge Docente OS #686, quindi il comportamento Orario verificato resta incluso nella versione distribuita corrente.

Il percorso PDF/OCR resta fallback separato e non è condizione per riaprire il flusso manuale già verificato.

### A20 / P1 — PWA, Android e Share Target

Il lavoro applicativo passa da **NON CHIUSO END-TO-END** a **IMPLEMENTED_QUALIFIED / DEVICE_NATIVE_RESIDUAL**.

Evidenze:

- Docente OS #686 exact head `0a833a58133f508f8efdddc4e1102272bd11ef2a`, merge `09a3a3600b81992f3675be82d1d2f188f1643909`;
- beta Render canonica deploy `dep-db180cavcj2c739v6lc0` LIVE sul merge `09a3a3600b81992f3675be82d1d2f188f1643909`;
- Product CI e Browser Certification PASS; manifest, service worker e Share Target qualificati automaticamente;
- Docente OS non intercetta più `beforeinstallprompt`, non usa `preventDefault()` e non sostituisce la UI nativa del browser;
- icone PNG 192/512/maskable restano canoniche; l'icona SVG `sizes:any` è stata rimossa dal manifest Android;
- il comportamento del messaggio/installazione nativa Chrome su specifici device resta non deterministico nella prova reale.

Decisione operativa: il residuo **device-native install** non blocca più lo sviluppo Docente OS e non giustifica ulteriori modifiche applicative senza una riproduzione diagnostica specifica. Tuttavia, secondo il criterio rigoroso originario P1, la qualification completa **install/update → share sheet → intake** su Android reale resta una evidenza distinta e non viene falsamente marcata PASS.

Quindi P1 è **CHIUSO COME CANTIERE APPLICATIVO / BETA CONSOLIDATA**, con residuo di qualification nativa registrato.

### A10 / P2 — Arena → Atlas Curriculum Sync

P2 passa da bootstrap ripristinato ma non provato end-to-end a **VERIFICATA / INTEGRATA** nel perimetro del sync governato.

Evidenze:

- Atlas #67 merge `d3e8a8f7d07c6f90703a180614a170b2cd899aa6`;
- più run schedulati del 4 ottobre su Atlas `main@b7b95e81e896a027335b3398d222660aa81f928a` sono PASS;
- run recente `37214517566`: setup-node PASS, **Fetch and validate Arena curriculum** PASS, **Detect curriculum change** PASS;
- risultato: `Arena curriculum already current: b355be71 PROVISIONAL_COMPLETE`; `changed=false`, quindi nessuna PR di sync superflua;
- policy osservata nel run: `atlasAutomaticSync=true`, visibilità pubblica ammessa per `PROVISIONAL_COMPLETE|APPROVED`, mentre la vigenza richiede `APPROVED`.

Questo chiude il difetto bootstrap e dimostra anche il comportamento no-op quando Atlas è già allineato. Non equivale ad attribuire stato `APPROVED` a una sorgente `PROVISIONAL_COMPLETE`.

### Riallineamento del piano

Con questo delta:

- **P1**: chiuso come sviluppo applicativo; residuo device-native registrato e non bloccante;
- **P2**: verificato/integrato;
- **P3**: diventa il prossimo pacchetto canonico — allineare evidenze, distribuzioni, snapshot, STATUS e Control Center;
- il primo riallineamento P3 è già materializzato nel ramo di questa v1.1: il workflow ha sincronizzato `control-center/data/ecosystem-snapshot.json` con il nuovo digest di `STATUS.md` tramite commit automatico `d0494b3f77cf01cd6be13834a2691395c3d8d38e`;
- **P4–P8**: restano nell'ordine originario salvo nuove dipendenze verificate;
- `DOS-A1` resta `RUNTIME_DEFERRED`;
- nessuna promozione Production di Docente OS è implicata.


## 4-quinquies. Delta verificato — 4 ottobre 2026 — P3 — BASELINE_RECONCILED

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

## 4-sexies. Delta verificato — 5 ottobre 2026 — P6 — CLOSED / INTEGRATED

Questa sezione supersede, per lo **stato corrente di P6/gh-aw T0**, le occorrenze storiche `STAGED / NOT_EXECUTABLE` e `P6 = OPEN` nelle sezioni precedenti. Le risultanze originarie restano conservate come cronologia dell'audit.

### Qualificazione agentica T0

- La precedente TRAMA PR #214 è stata chiusa come **SUPERSEDED**, senza merge; il lavoro valido è stato riallineato sulla baseline corrente nella PR #236.
- La PR TRAMA #236 è stata qualificata sull'exact head `3327162f9045619fed6e5c3ba2712334390d0d24` e integrata con squash merge `4ee44c1b906f3f816600c911614f6a9b43c3785c`.
- Il trial reale controllato su issue #117 ha completato, nell'attempt 2 del run `37254749917`, compile-check, pre-activation, activation, GitHub Copilot CLI, threat detection, safe outputs e conclusion.
- Il primo attempt aveva isolato un `HTTP 401` dovuto al PAT usato da `COPILOT_GITHUB_TOKEN` privo del permesso **Copilot Requests**. La correzione è stata limitata al nuovo fine-grained PAT con `Copilot Requests: Read`; il contratto T0 non è stato ampliato per far passare il trial.
- L'output staged proponeva la label `enhancement` e una nota maintainer-facing non autorevole. La verifica prima/dopo su #117 ha confermato **state open, 0 commenti, 0 label e `updated_at` invariato**: nessuna write persistente.

### Contratto finale e regressione

- Dopo il trial sono state rimosse tutte le superfici temporanee: nessun `workflow_call`, nessun `workflow_dispatch`, nessun job di trial permanente e nessuno step permanente con token privilegiato.
- Il sorgente finale scatta soltanto su issue `opened/reopened`, mantiene agente read-only per l'analisi e `safe-outputs.staged: true`; label consentite: `bug`, `enhancement`, `documentation`, `question`, massimo una.
- Il lock finale è stato generato con `gh aw compile --strict`, compiler `v0.89.21`, ed è sincronizzato con il sorgente.
- Sul final head `3327162f9045619fed6e5c3ba2712334390d0d24`: gh-aw T0 compile check run `37257375965` PASS e Governance run `37257376016` PASS.
- Sul merge `4ee44c1b906f3f816600c911614f6a9b43c3785c`: commit GitHub verified; Post-Merge Baseline Integrity run `37257624779` PASS; compile-check, build e Governance/validate post-merge PASS sullo stesso SHA.

### Esito e confini

**P6 — CLOSED / INTEGRATED.** La condizione di uscita T0 è soddisfatta: esecuzione agentica osservata entro i confini, safe-output realmente staged, zero side effect persistenti, lock strict e regressione permanente. T1/T2 restano incrementi futuri separati e non sono autorizzati o attivati automaticamente da questa chiusura.

Restano aperti come residui prioritari indipendenti:

- **P4 / Argo G5-C:** prova reale LibreOffice/didUP ancora necessaria;
- **P5 / QE-01:** `REQUALIFICATION_REQUIRED`, nessuna esecuzione runtime inferita;
- `DOS-A1` resta `RUNTIME_DEFERRED`; nessuna promozione Production è implicata.


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

## 4-octies. Delta verificato — 5 ottobre 2026 — Audit v1.4 / prova reale Visual Factory

Questo delta supersede, per lo **stato corrente**, le formulazioni v1.3 `REAL_VISUAL_RUN_PENDING`, `LIVE_ZERO_COST_EXECUTION_NOT_YET_PROVEN` e `PLAN_INCOMPLETE` relative alla prova reale della Visual Factory. Non modifica retroattivamente la cronologia e non concede authority di runtime, pubblicazione o student use.

### Baseline e prova reale governata

- Baseline Audit v1.3 integrata: `main@d5a54022e1bad7b3fb2c4a853bbdd5f7e114d3aa`.
- Baseline reale osservata per questo delta: `main@290d6f3f0d15df3e8f8f438a46a26449d1247043`, merge della PR #248.
- La linea Studio Atlas / Visual Factory è stata consolidata con PR #243 e i follow-up #244, #245, #247 e #248, senza paid fallback né nuova authority.
- Il run manuale `37348637767` su `main@290d6f3f0d15df3e8f8f438a46a26449d1247043` ha completato `Bounded FREE_ONLY visual orchestration` con esecuzione live SUCCESS, verifica di non-authority e upload delle evidenze.
- L'artefatto `11361642336` contiene le reference candidate governate ed è registrato con digest `sha256:91ed622868c2214b730e2c56f800ffcbd0de579a9913471f96cdb1ca764fea12`; la riuscita tecnica non costituisce approvazione visuale.

### A45 / MUSEO ZERO

A45 passa da `REMEDIATION_IMPLEMENTED / SECOND_HUMAN_PRODUCT_REVIEW_PENDING` a **`REAL_REFERENCES_GENERATED / ART_DIRECTION_REMEDIATION_IMPLEMENTED_CANDIDATE / REGENERATION_PENDING / HUMAN_VISUAL_REVIEW_PENDING / REFERENCE_LOCK_PENDING / SECOND_HUMAN_PRODUCT_REVIEW_PENDING`**.

La prima Human Visual Review delle reference reali non concede reference lock. La PR #249 ha ora implementato il candidato di remediation art-direction sull'exact head `6c223a4556868c0c1f14cdabd6b8f101fce6368d`: Governance, Studio Atlas S1 Standalone, Visual Factory Generation Pipeline v0.2 e Studio Atlas ↔ Atlas Preview E2E risultano PASS. La remediation rafforza l'identità di Lia/Omar/Teo, elimina pseudo-testo e dashboard spurie, rende Sala Zero uno spazio narrativo fisico e Cabina regia un ambiente adiacente e coerente. La nuova generazione reale delle cinque reference e la successiva Human Visual Review restano necessarie; nessun F1–F6 parte prima del reference lock PASS.

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

## 5. Quattro problemi trasversali
F01 Duplicazioni: #652/#653 Orario sono state chiuse come SUPERSEDED e non costituiscono più implementazioni concorrenti; le preview Render temporanee non sono servizi canonici. Voice e /legacy/ restano da confrontare prima di eventuale rimozione; /legacy/ è un fallback intenzionale.
F02 PR superate: #652/#653 risolte; Docente OS #685 chiusa senza merge dopo verifica che la hotfix non era necessaria; #187 e #194 restano da riconciliare prima di qualsiasi chiusura definitiva.
F03 Evidenze non consolidate: P1/P2/P3 sono riconciliati e la chiusura P6 viene proiettata dalla v1.2 nelle fonti governate; restano da consolidare soltanto gli esiti futuri di QE-01 e Argo quando produrranno nuova evidenza reale.
F04 Capacità dichiarate senza prova completa: installazione PWA device-native, QE-01, TypeSafe, didUP e R3-P4 restano esempi attuali. gh-aw T0 non rientra più in questo gruppo dopo il trial staged reale e l'integrazione P6.

# Piano di attuazione — TRAMA-CAP-CLOSE-2026-10-03
> Per gli esecutori: usare superpowers:executing-plans per attuare il piano per attività. Questo documento è un piano di programma con procedure verificabili; i percorsi applicativi non osservati vanno risolti nel primo passo di ogni attività prima di modificarli.

**Obiettivo:** chiudere le capacità già importanti attraverso risultati utilizzabili e un unico stato documentato.
**Architettura:** interventi nei repository autorevoli; TRAMA conserva indice, decisioni e collegamenti alle prove. Nessun nuovo archivio concorrente.
**Tecnologie:** quelle dei repository esistenti; GitHub Actions/pnpm per sync; PWA/Android per Docente OS; BIFF8 per Argo; gh-aw per manutenzione.
**Specifica:** sezioni 1–5 di questo documento.
**Vincoli globali:** tutti quelli della sezione 3; nessuna nuova dipendenza senza necessità dimostrata; nessuna chiusura per solo test testuale.
**Condizioni da verificare:** distribuzione diversa dal codice; documento ambiguo o senza docente; conferma ripetuta/import fallito; PWA già installata o condivisione a freddo; prova automatica verde ma autorizzazione assente.

## 6. Ordine di lavoro e dipendenze
| Ordine | Pacchetto | Capacità sbloccata | Dipendenza/condizione di uscita |
| --- | --- | --- | --- |
| 0 | P0 riferimento e registro | Stato consultabile e confrontabile | Identificativi stabili, nessuna nuova certificazione |
| 1 | P1 orario + PWA + Android | Uso quotidiano, acquisizione documenti e calendario | Versione Beta identificata e prova reale completa |
| 2 | P2 sync Arena→Atlas | Curricolo pubblico aggiornabile | Bootstrap corretto + run completo + autorità rispettata |
| 3 | P3 allineamento evidenze/distribuzioni | Affidabilità di CC e memoria | Incorporare subito blocchi noti; poi esiti P1/P2 |
| 4 | P4 Argo G5-C | Trasferimento al registro elettronico | File reale accettato da LibreOffice/didUP |
| 5 | P5 QE-01 riconciliazione | Preparazione a esecuzione qualificata | Stato coerente; esecuzione solo con dossier valido |
| 6 | P6 gh-aw T0 poi T1/T2 | Meno manutenzione ripetitiva | Prova controllata autorizzata e misurata |
| 7 | P7 completamento prodotto | Atlas/Knowledge/loop docente | P1 chiuso; pacchetti autonomi con prove |
| 8 | P8 funzioni differite/adozione | Evoluzione ulteriore | Nuove decisioni dove richieste |

### Stato dei pacchetti al 5 ottobre 2026

| Pacchetto | Stato v1.2 | Nota |
| --- | --- | --- |
| P0 | **INTEGRATO / RIFERIMENTO V1.4** | Audit presente su `main`; STATUS e proiezioni governate devono restare allineati al delta v1.4 |
| P1 | **CLOSED_APPLICATION_SCOPE / DEVICE_NATIVE_RESIDUAL** | Orario verificato su Beta; PWA/Share applicativamente qualificate; installazione nativa Android residua e non bloccante |
| P2 | **VERIFIED / INTEGRATED** | Run schedulati Arena Curriculum Sync PASS con validation/no-op governato |
| P3 | **CLOSED / BASELINE_RECONCILED** | Stato, distribuzioni, snapshot, Control Center e Project Knowledge riconciliati |
| P4 | **OPEN / LOCAL_PROOF_PACKAGE_READY_CANDIDATE** | Pacchetto fail-closed #246 pronto; prova reale LibreOffice/didUP ancora necessaria |
| P5 | **REQUALIFICATION_PREPARED_NOT_AUTHORIZED** | Pacchetto QE-01 v2 integrato; nuova esecuzione richiede fresh local observation e nuova Human Authorization |
| P6 | **CLOSED / INTEGRATED** | T0 qualificato con trial staged reale e zero side effect; T1/T2 restano incrementi separati |
| P7 | **UNBLOCKED FOR SCOPED INCREMENTS** | P1 non blocca più nuovi incrementi; ogni capacità mantiene i propri gate |
| P8 | **DEFERRED / DECISION-BOUND** | Nessun cambiamento alle funzioni differite |

P2 è una correzione breve candidata a essere svolta senza interrompere il filone P1 già attivo. Non si apre una seconda implementazione concorrente dell'orario. P5 va riconciliato documentalmente subito, ma non precede P1 come sviluppo. Nessuna stima di giorni viene presentata come impegno senza esame del codice.

## 7. Attività dettagliate
### P0 — Consolidare il riferimento
Responsabile: TRAMA. File: docs/audits/TRAMA-AUDIT-2026-10-03.md (questo documento); collegamento da STATUS.md/indice documentale nell'integrazione governata.
- [ ] Registrare SHA completo dei quattro repository, PR e prove usate nel prossimo aggiornamento.
- [ ] Collegare audit e piano dall'indice corrente senza duplicare integralmente STATUS.
- [ ] Eseguire python3 scripts/validate_governance.py e python3 -m unittest discover -s tests -v sulla modifica documentale.
Uscita: documento rintracciabile, controlli richiesti superati, commit/integrazione registrati. Fino ad allora distinguere copia salvata e proposta repository.

### P1 — Chiudere orario mobile + PWA + condivisione
Responsabile: Docente OS. Fonti iniziali: #653/#652/#649/#629/#601/#655; collaborazione con lavoro già attivo.
- [ ] Acquisire stato corrente di #653 e Beta, identificare file modificati e versione effettivamente servita; non agire sullo stato storico.
- [ ] Confrontare #652/#653 e recuperare eventuali cambiamenti unici; risolvere conflitti sul ramo canonico. Chiudere la precedente solo dopo preservazione del contenuto.
- [ ] Riprodurre su dimensioni Android i difetti: sovrapposizione grigia, calendario non prioritario, riscontro caricamento fuori vista, comandi troppo complessi.
- [ ] Verificare il requisito del test timetableKeyboardHelp: aggiornare una aspettativa obsoleta solo se accessibilità e comportamento sono conservati; non eliminare la prova per ottenere verde.
- [ ] Realizzare percorso principale: carica/apri il PDF → riscontro immediato → trova nome → evidenzia fonte → mostra lezioni estratte → correggi → conferma. Opzioni avanzate secondarie.
- [ ] Mostrare prima l'orario, poi le azioni di modifica; finestra cella leggibile con chiusura, scorrimento e gestione del fuoco corretti.
- [ ] Provare docente assente/omonimo, PDF scansione/ruotato/multipagina, errore estrazione, doppia conferma e reimportazione: niente scrittura silenziosa o perdita dell'orario valido.
- [ ] Verificare installazione PWA, icone, manifest, service worker e ricezione Android con app aperta/chiusa/già installata; messaggi comprensibili per casi non supportati.
- [ ] Eseguire Product CI e verifiche pertinenti alla regressione; distribuire sul servizio Beta canonico e registrare commit/versione.
- [ ] Eseguire una sola sessione di accettazione Android completa, dopo la verifica tecnica, conservando riscontro e persistenza dopo ricarica.
Uscita: importazione reale accettata, modifica cella fruibile, PWA/condivisione provate e stesso commit fra prove e Beta. CI PASS da sola non basta.
Ripiego: conservare precedente orario valido e precedente versione distribuita; import fallito non sovrascrive.
Risultato per utente: un orario quotidiano utilizzabile e caricamento documenti senza percorso manuale dispersivo.

### P2 — Ripristinare Arena→Atlas
Responsabile: Atlas. File iniziali da risolvere: workflow Arena Curriculum Sync sotto .github/workflows/ e script richiamati; ramo fix/arena-curriculum-sync-bootstrap.
- [ ] Riverificare run e correzione esistente; recuperare SHA e nomi esatti dei file.
- [ ] Correggere ordine installazione pnpm/setup-node/cache seguendo la toolchain già fissata dal progetto.
- [ ] Eseguire controllo da ambiente pulito: pnpm disponibile prima della cache e installazione coerente con lockfile.
- [ ] Provare un run che raggiunga lettura Arena, validazione provenienza/digest e decisione di sync.
- [ ] Provare fonte non approvata, ricevuta mancante/digest errato e sorgente invariata: blocco corretto o nessuna modifica superflua.
Uscita: errore bootstrap risolto e percorso completo dimostrato. Un rifiuto per autorità può provare il controllo ma non la pubblicazione completa.
Ripiego: nessun contenuto non approvato pubblicato; mantenere ultima proiezione valida.

### P3 — Stato unico, A7 e distribuzioni
Responsabili: TRAMA e proprietari prodotto. File confermati: STATUS.md, ROADMAP.md, docs/decisions/decision-register.json; risolvere percorso reale di ecosystem-snapshot.json e proiezione Project Knowledge.
- [ ] Registrare subito i blocchi P1/P2/QE/Argo/gh-aw come riportati e da riverificare; aggiornare dopo ogni prova senza retrodatare.
- [ ] Confrontare distribuzioni Docente OS e documentazione PROJECT_HEALTH.md; identificare servizio canonico e finalità degli altri prima di dismetterli.
- [ ] Verificare #194/#213 e A7: root modulare, sei sezioni, /legacy/, READ_ONLY, versione pubblica, manifest/rete dove osservabili.
- [ ] Integrare ricevute valide e segnalare controlli non verificabili; validità dello snapshot distinta da freschezza delle fonti.
- [ ] Eseguire validatori e build già previsti; controllare che Project Knowledge indichi data e collegamenti alle prove aggiornate.
Uscita: stesso stato leggibile nel registro, STATUS, snapshot e CC; nessun PASS derivato dalla sola coerenza JSON.

### P4 — Argo/didUP
Responsabili: Docente OS per file/prove; TRAMA per raccordo #187.
- [ ] Riverificare #647 e G5-A/B; ottenere file BIFF8 di prova privo di dati personali.
- [ ] Aprire in LibreOffice, verificare Dati/sei colonne/caratteri/date/ore e corrispondenza con origine.
- [ ] Importare manualmente in didUP nel contesto autorizzato e conservare esito; se non disponibile mantenere PRONTA_PER_PROVA.
- [ ] Correggere solo incompatibilità riprodotte e ripetere round-trip/prova interessata.
- [ ] Riconciliare #187 con ciò che è già integrato evitando ripresentare G5-A/B.
Uscita: import reale accettato e dati corretti; la sola firma OLE non dimostra interoperabilità.

### P5 — QE-01
Responsabile: TRAMA/harness.
- [ ] Leggere dossier/validatore/ricevuta correnti #212 e conservare prova del fallimento.
- [ ] Allineare testo e stato a EXECUTION_FAILED_REQUALIFICATION_REQUIRED se ancora vigente; executable=false fino alla qualifica.
- [ ] Determinare causa documentata, provider/modello/adapter effettivi e credenziale senza divulgarla.
- [ ] Preparare dossier PROPOSE_ONLY, una invocazione, maxRetries=0, senza dati studenti/mutazioni; validare offline.
- [ ] Sottoporre SHA esatto alla revisione richiesta; solo dopo eventuale autorizzazione valida eseguire la prova e conservarne ricevuta.
Uscita documentale: nessuna contraddizione. Uscita runtime: prova reale autorizzata riuscita, separata e non estesa a DOS-A1.

### P6 — gh-aw T0
Responsabile: TRAMA. Fonti correnti: PR #236, exact head `3327162f9045619fed6e5c3ba2712334390d0d24`, merge `4ee44c1b906f3f816600c911614f6a9b43c3785c`, workflow `.github/workflows/trama-t0-issue-triage.md` + lock compilato.
- [x] Compile/configurazione verificati; allow-list chiusa, agente read-only, safe-output staged.
- [x] Prova controllata reale eseguita su issue #117 dopo i prerequisiti di autenticazione.
- [x] Risultato e permessi effettivi registrati; primo errore 401 isolato e corretto senza ampliare il contratto.
- [x] Zero side effect verificato prima/dopo; superfici di trial e step privilegiati rimossi.
- [ ] Misurazione del risparmio operativo: follow-up osservativo, non condizione di chiusura T0.
- [ ] T1 sola lettura e T2 propositive: eventuali incrementi separati, ciascuno con proprio perimetro e qualifica; non attivati automaticamente.
Uscita T0: **soddisfatta** — esecuzione osservata entro i confini, non solo compilazione; nessun passaggio automatico di autorità.

### P7 — Capacità operative successive
Dopo P1, scegliere un incremento verificabile alla volta; ogni punto conserva ID audit e issue originali.
- [ ] Atlas P2/P5: mappare requisiti mancanti A11/A14/A16 e completare un percorso pubblico con provenienza e prova mobile/LIM.
- [ ] Docente OS uso quotidiano #626/#648: preparazione→decisione→lezione→registrazione→riapertura; aggiornare debito residuo.
- [ ] Conoscenza #514/#584: acquisizione→struttura/provenienza→ricerca→apertura; provare risultati assenti e pertinenti.
- [ ] Educazione civica A06/A16: separare governance, Edge Function non distribuita, attuazione Docente OS e consultazione Atlas.
- [ ] Arena M4/design/browser: trasformare #121/#271/#292 in requisiti con prove distinte, senza ripetere qualifiche già valide.
- [ ] Copilota/voce/evidenze didattiche: specifiche autonome e verifica confini runtime prima dello sviluppo; non assimilare fondazioni a prodotto completo.
Uscita di ogni incremento: requisito preciso, versione, prova di comportamento, prova di uso quando necessaria e stato consolidato.

### P8 — Perimetri successivi e differiti
- [ ] CC3 F2–F5: procedere per fasi senza punteggi/probabilità non autorizzati.
- [ ] TypeSafe: mantenere advisory; HOLDOUT solo con decisione esplicita valida e marker di consumo.
- [ ] R3-P3/P6: definire prove della capacità pubblica rispettando privacy.
- [ ] R3-P4/R4-P1/R4-P2 runtime/DOS-A1: lasciare differiti fino ai dossier e alle decisioni necessarie.
- [ ] Multi-docente/R5: isolamento, configurazione istituto, protezione dati, assistenza, costi e pilota prima di dichiarare adozione organizzativa.
Uscita: ciascun filone chiude solo il proprio perimetro dimostrato.

## 8. Registro operativo e aggiornamenti
Campi obbligatori di ogni aggiornamento: ID Axx/Px; requisito; repository/ramo/SHA completo; PR/issue; servizio e versione; prova automatica con URL/data; prova di uso o motivo assenza; stato; blocco; prossimo passo; eventuale decisione richiesta; confronto con versione precedente.
Aggiornare dopo integrazione, distribuzione, prova materiale o nuovo blocco. Una modifica di contratto o autorità segue GOVERNANCE.md; una correzione ordinaria procede nel perimetro già autorizzato.
Baseline immutabile nel significato storico: versioni successive aggiungono variazioni e prove, non cancellano fallimenti o riscrivono la data dell'audit.
Nessuna issue/PR obsoleta viene chiusa solo perché elencata qui: prima confronto contenuto e prove, poi azione documentata.
Prima attività esecutiva aggiornata dalla v1.2: **P4 — Argo G5-C**, quando è disponibile l'ambiente reale LibreOffice/didUP necessario alla prova; in assenza di tale ambiente può procedere **P5 — QE-01** come riconciliazione separata, senza dichiarare P4 chiuso. P1/P2/P3/P6 restano chiusi nei rispettivi perimetri e non vanno riaperti senza nuova evidenza o decisione esplicita.

## 9. Verifica del piano
Copertura: A01–A41 incluse; F01–F04 collegati a P1/P3/P4/P5/P6; differimenti conservati in P8. Le condizioni di revisione sono assegnate a P1/P2/P3/P5.
Limite: i nomi applicativi dei file non letti e i comandi specifici dei prodotti non sono inventati; vengono fissati dopo ispezione nel primo passo del relativo pacchetto. Non è una attestazione di esecuzione dei test.
