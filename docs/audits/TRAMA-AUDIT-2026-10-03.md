# TRAMA-AUDIT-2026-10-03 — Audit di completamento e piano operativo
Versione 1.0 — 3 ottobre 2026 — riferimento richiesto da Antonio nella conversazione del 03/10/2026.

## 1. Mandato, validità e precedenza
Questo documento consolida la ricognizione riportata nella conversazione e ne fa la baseline di confronto per il completamento dell'intero ecosistema. La richiesta dell'utente autorizza il salvataggio e la pianificazione; non attesta nuove prove funzionali.
Le risultanze tecniche dell'audit precedente sono conservate come EVIDENZE RIPORTATE: in questo turno non sono stati rieseguiti i controlli sui quattro prodotti, sui dispositivi o sui provider. Sono stati letti direttamente README.md, STATUS.md e GOVERNANCE.md di TRAMA; confermano la separazione delle autorità e lo stato documentale al 30 settembre.
Non si trasformano i risultati storici in certificazioni attuali. Prima di intervenire, confrontare ogni rilievo con SHA completo, ramo, PR, esito corrente e distribuzione reale.
Precedenza: decisioni/contratti approvati → STATUS.md → piano operativo canonico → specifiche integrate → questo audit, come riferimento trasversale di completamento. La sua integrazione documentale non promuove capacità, non autorizza esecuzioni e non certifica conformità.
Stato del riferimento: adottato dall'utente per la pianificazione; integrazione nel ramo principale da documentare separatamente. Una proposta di integrazione non equivale a integrazione.

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

## 5. Quattro problemi trasversali
F01 Duplicazioni: #652/#653 orario e distribuzioni Docente OS concorrenti; Voice e legacy da confrontare prima di eliminarli. /legacy/ è un ripiego intenzionale, non una duplicazione da rimuovere automaticamente.
F02 PR superate: #652 dichiarata sostituita; #187 da riconciliare con G5-A/B integrati; #194 draft dopo cutover da verificare. Non chiudere PR con contenuti ancora unici.
F03 Evidenze non consolidate: snapshot 30/09, A7, QE-01, Argo, gh-aw. Il disallineamento riguarda stato/implementazione/prova.
F04 Capacità dichiarate senza prova completa: orario/PWA, QE-01, gh-aw controllato, TypeSafe, didUP, R3-P4. Uno stato non autorizzato va conservato, non trattato come difetto da aggirare.

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

### P6 — gh-aw
Responsabile: TRAMA. Fonti: #214 e workflow .github/workflows/*.md/.lock.yml.
- [ ] Riverificare compile e configurazione; limiti add-labels.allowed, repository consentiti e safe-outputs.
- [ ] Eseguire prova controllata prevista dal contratto solo dopo soddisfacimento dei prerequisiti.
- [ ] Registrare risultato, permessi effettivi, errori, modifiche consentite e procedura di disattivazione.
- [ ] Misurare attività ripetitive risparmiate senza dedurre qualità dal numero di commenti.
- [ ] Introdurre T1 sola lettura; T2 solo proposte documentate su F01–F04 dopo T0 provato.
Uscita: esecuzione osservata entro i confini, non solo compilazione. Nessun passaggio automatico di autorità.

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
Prima attività esecutiva aggiornata dal delta 4-bis: validare la RC esatta `v0.1.0-rc.1` sul percorso Android/PWA/Share Target e completare il salvage di #652/#653 senza integrarli; P2 può procedere in parallelo come correzione circoscritta.

## 9. Verifica del piano
Copertura: A01–A41 incluse; F01–F04 collegati a P1/P3/P4/P5/P6; differimenti conservati in P8. Le condizioni di revisione sono assegnate a P1/P2/P3/P5.
Limite: i nomi applicativi dei file non letti e i comandi specifici dei prodotti non sono inventati; vengono fissati dopo ispezione nel primo passo del relativo pacchetto. Non è una attestazione di esecuzione dei test.
