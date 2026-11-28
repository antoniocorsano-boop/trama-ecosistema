# TRAMA FREE-DEPLOY — Piano operativo v1

**Data:** 2026-11-14 · **Stato:** HUMAN_DIRECTION_APPROVED / DOCUMENTATION_CANDIDATE / NO_RUNTIME  
Decisione: [TRAMA-ADR-022](../decisions/trama-adr-022-free-deploy.md). Unica roadmap canonica: [ROADMAP.md](../../ROADMAP.md). Questa scheda approfondisce le fasi, non costituisce un registro alternativo di maturità.

## Obiettivo
Rendere ripetibile la produzione, il collaudo e la pubblicazione dei prodotti scolastici con costo aggiuntivo autorizzato zero, riducendo i servizi temporanei. Il docente deve poter condividere un collegamento stabile da Atlas o Padlet soltanto dopo l'approvazione. Gratuità attuale non è garanzia futura.

## Architettura minima e classi di destinazione

| Classe | Destinazione | Dati e confini |
|---|---|---|
| PUB_STATIC | Atlas Edu, candidato Cloudflare Pages / GitHub Pages | Solo derivati pubblicabili, statici, nessun dato personale, nessun account studente. |
| LAB_PRIVATE_STATIC | TRAMA Lab, candidato Pages + Access | Fixture sintetica iniziale, poi contenuto consentito; protezione di ogni hostname e asset. |
| LAB_PRIVATE_DYNAMIC | TRAMA Lab, ambiente Next.js gratuito qualificato o locale | Nessun dato scolastico reale; verifica accessi e capacità server, non presupporre compatibilità edge. |
| PROFESSIONAL_LOCAL | Docente OS e Registro Docente dove compatibile | Installazione locale, backup protetto, non perdita dei dati; approvazione istituzionale quando tratta dati scolastici. |
| INSTITUTIONAL | Arena e servizi professionali che richiedono persistenza condivisa | Solo infrastruttura autorizzata dall'istituzione; non migrare a consumer free per eludere governance/privacy. |

TRAMA Lab e Atlas Edu sono nomi logici, non progetti hosting già creati. Control Center può usare statico soltanto per la superficie read-only idonea, senza esporre dati o evidenze riservate. Atlas esistente non viene migrato automaticamente. Studio Atlas mantiene il proprio confine Next.js e l'importazione ZIP locale; una prova statica non qualifica il suo backend.

## FD-01 — Inventario preliminare (da completare con verifica conti e quote)

Evidenze tecniche: TRAMA #311, #313 e commenti 6872698325, 6872721466; main di riferimento 4226ab5b2bdcbf57f6541aafbeec84cd86c4d013.

| Risorsa / ambiente | Stato verificato o da accertare | Decisione |
|---|---|---|
| Missione 118 V9.1 0.4.2-draft | Codice integrato #313; ZIP privato e 10 risorse; revisione umana, diritti, accessibilità, Arena aperti | Pilota dopo fixture; nessun upload/pubblicazione ora. |
| Missione 118 V9 0.4.1 e La luce giusta | Versioni e stati separati; nessuna promozione per analogia | Conservare. |
| Studio Atlas Render PR #262 | Ultimo live osservato il 07/10/2026, commit ebf27e788b15835171beed16a49b599e71bd4734, autoDeploy=no | Non idoneo a collaudare V9.1; non modificare. |
| Studio Atlas Vercel | Creazione progetto dedicato rifiutata 403; progetto assente al ricontrollo | Blocco permessi; non ripetere o bypassare. |
| Atlas / GitHub Pages | Esistenza infrastruttura statica già documentata; quota e pubblicazioni effettive da riconciliare | Alternativa per pubblico approvato, non Lab privato. |
| Render: gateway, Control Center, prototipi e altre anteprime | Inventario servizi osservato; quote, piano, costi e dipendenze non verificati | Audit read-only prima di consolidamento; nessuna cancellazione. |
| Docente OS / Registro Docente / Arena | Applicazioni professionali, diversa classe di dati | Non trattare come contenuti statici pubblici. |
| Cloudflare Pages / Access | Documentazione pubblica consultata; account, piano, permessi e policy non ancora verificati | Candidati, non provider qualificati. |

## Condizioni dei fornitori — ricognizione al 14/11/2026

| Fornitore | Condizioni rilevate | Vincolo di ammissione |
|---|---|---|
| Cloudflare Pages Free | Richieste statiche senza addebito per richiesta; 500 build/mese, 20.000 file/sito, 25 MiB/file. Functions hanno quote separate. | Solo asset statici nella prima prova; verificare piano effettivo, termini, quote e assenza di paid bindings. |
| Cloudflare Access Free | Offerta gratuita per piccoli gruppi, indicata per meno di 50 utenti. Preview Pages pubbliche di default; policy preview non copre automaticamente hostname principale o custom domain. | Copertura e prova anonima per ogni dominio, asset diretto, alias e preview; nessun bypass. |
| GitHub Pages Free | Repository pubblico, sito max 1 GB, traffico soft 100 GB/mese; limiti d'uso, non hosting di SaaS commerciale o transazioni sensibili. | Solo contenuti didattici pubblicabili, senza segreti/dati; verificare quote GitHub Actions separatamente. |
| Vercel Hobby | Uso personale non commerciale; condizioni e fair use restringono impiego professionale. | Non qualificare per impiego scolastico professionale finché compatibilità contrattuale, account, protezione e permessi non verificati. |
| Render Free | 750 ore/mese condivise, sospensione per inattività, database free a scadenza, niente disco persistente; build e traffico possono generare costi oltre quota se presente pagamento. | Non dipendenza primaria studenti; verifica costi e sospensione effettiva, non semplice piano Free. |
| Locale | Nessuna tariffa hosting; dipende da dispositivo, conservazione e accesso | Ripiego privato, non collegamento pubblico. |

Fonti ufficiali, da ricontrollare prima di ogni qualificazione:
- [Cloudflare Pages — limiti](https://developers.cloudflare.com/pages/platform/limits/) e [prezzi Functions/statico](https://developers.cloudflare.com/pages/functions/pricing/).
- [Cloudflare Pages — anteprime](https://developers.cloudflare.com/pages/configuration/preview-deployments/), [protezione dominio principale](https://developers.cloudflare.com/pages/platform/known-issues/), [Access](https://www.cloudflare.com/sase/products/access/).
- [GitHub Pages — limiti](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).
- [Vercel Hobby](https://vercel.com/docs/plans/hobby), [condizioni](https://vercel.com/legal/terms), [fair use](https://vercel.com/docs/limits/fair-use-guidelines).
- [Render Free](https://render.com/docs/free), [FAQ costi](https://render.com/docs/faq).

Non assumere che un servizio gratuito oggi lo resti, né che assenza di costo implichi conformità contrattuale o protezione dati. Verificare DPA e ruolo dell'istituzione dove necessario.

## Sequenza e criteri di uscita

| Fase | Stato iniziale | Evidenza richiesta / criterio di uscita |
|---|---|---|
| FD-00 — Decisione e documentazione | CANDIDATE | ADR, registro, roadmap, checklist, PR e review esatta. |
| FD-01 — Inventario e contabilità | PRELIMINARY | Conti, owner, piani/quote, limiti e pagamento, servizi/commit, accessi, dati, dipendenze, rischio, costo e ripiego. Nessun cambio. |
| FD-02 — Statico portabile | PLANNED | Fixture sintetica, nessuna risorsa privata, prova su candidato Cloudflare e verifica alternativa GitHub; asset, URL, mobile/LIM, CSP, zero dipendenze a pagamento, ricevuta. |
| FD-03 — Collaudo riservato permanente | PLANNED | Configurazione protetta prima di caricare contenuti; prove anonime di diniego e accesso autorizzato su tutti gli URL; costo verificato. Per Studio Next.js, build/import/API/IDB su esatto commit e accesso reale, separati dalla fixture statica. |
| FD-04 — EduTwin pilota | PLANNED | V9.1 immutata, verifica diritti, ascolto, accessibilità, prova umana, Arena e decisione editoriale; test riservato. Solo con autorizzazione separata, pubblicazione Atlas, collegamento Padlet e ricevuta. |
| FD-05 — Distribuzione ripetibile e rollback | PLANNED | Contratto provider-neutral, build immutabile, lista file ammessi, digest, selezione provider qualificati, ripristino e ritiro, nessun fallback pubblico/paid, approvazione esatta. |
| FD-06 — Sostenibilità nel tempo | PLANNED | Controllo mensile e prima del deploy, soglie di attenzione 70% e 90% proposte da calibrare, stop preventivo se quota/costo non certi; report delle sole variazioni materiali e aggiornamento inventario. |

## Pilota: Missione 118

Usare prima una fixture senza contenuto scolastico o originale, dopo distinta autorizzazione al provisioning. La V9.1 è un HTML autonomo (1.757.481 byte), non richiede server per l'esecuzione autonoma; importazione Studio Atlas e pubblicazione Atlas sono flussi distinti. Mantenere archivio privato, guida docente separata, audio e immagini originali. Il manifesto di intake non è un manifesto di pubblicazione. Non usare HTML o ZIP della V9.1 in un sito pubblico finché non è approvata. Un collegamento Padlet si produce esclusivamente a valle del gate editoriale. Ritiro rimuove l'accesso controllato dal gestore; non promettere cancellazione di copie già scaricate.

## Continuità del lavoro

Prima di avviare qualunque nuovo hosting leggere ADR-022, la [checklist](trama-free-deploy-checklist-v1.md) e la fase corrispondente. Aggiornare la stessa roadmap, non aprire una nuova strategia in una chat. Conservare il registro delle prove e dei blocchi, inclusi tentativi falliti. Nessuna nuova app per rappresentare il piano; eventuale vista Control Center resta derivata e read-only. Il documento non modifica automaticamente i servizi né autorizza una spesa.
