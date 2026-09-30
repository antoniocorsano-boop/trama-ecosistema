# TRAMA Control Center — Public Browser Certification v1

## Scopo

Questa lane certifica il comportamento del servizio pubblico del TRAMA Control Center mediante Chromium reale eseguito in GitHub Actions. La verifica è esclusivamente in lettura e non modifica Render, repository, configurazioni, dati o stato applicativo.

Target predefinito:

`https://trama-control-center.onrender.com`

## Principio di separazione

La certificazione tecnica non dipende dalle capacità del browser dell'agente umano o di Work.

- **Human Browser Review**: navigazione, leggibilità, contenuti e riscontro visuale.
- **Machine Browser Certification**: rete, metodi HTTP, PWA, service worker, offline, responsive, console e guardia anti-mutazione.

Le due verifiche sono complementari.

## Controlli

| ID | Controllo | Regola |
|---|---|---|
| BC-01 | Identità pubblica | root raggiungibile, origine attesa, presenza TRAMA e READ_ONLY |
| BC-02 | Navigazione primaria | Overview, Maturity, Ecosystem, Evidence, Operations, Assurance raggiungibili |
| BC-03 | Legacy fallback | `/legacy/` resta raggiungibile |
| BC-04 | Invarianti di governance | READ_ONLY e DOS-A1 differito |
| BC-05 | Manifest | HTTP 200, JSON valido, campi PWA minimi e icone |
| BC-06 | Service worker | registrazione attiva, scope coerente, pagina controllata |
| BC-07 | Installabilità | Chrome DevTools Protocol non segnala errori di installabilità |
| BC-08 | Offline | la shell applicativa resta disponibile senza rete |
| BC-09 | Responsive | nessun overflow orizzontale a 320, 390, 768 e 1440 px sulle sei viste |
| BC-10 | Network e READ_ONLY guard | solo GET/HEAD/OPTIONS, nessun errore >=400, mixed content, origine esterna o credenziale; eventuali mutazioni sono bloccate |
| BC-11 | Console | nessun errore applicativo osservato |

## Guardia anti-mutazione

Il contesto Playwright intercetta ogni richiesta. I metodi diversi da `GET`, `HEAD` e `OPTIONS` vengono abortiti prima dell'invio e determinano il fallimento della certificazione.

La lane non esegue autenticazioni e usa un contesto browser effimero.

## Evidenze prodotte

Ogni esecuzione genera un artefatto GitHub Actions contenente:

- `public-browser-certification.json`;
- rapporto HTML Playwright;
- trace e screenshot in caso di errore;
- registro delle risposte osservate;
- esito dei singoli controlli;
- commit e run GitHub associati.

Verdetti ammessi:

- `PUBLIC_BROWSER_CERTIFICATION_PASS`
- `PUBLIC_BROWSER_CERTIFICATION_FAIL`

Non è previsto `NOT_VERIFIABLE` per i controlli inclusi nella lane: un'impossibilità strumentale produce un fallimento esplicito e diagnosticabile.

## Esecuzione

La lane parte automaticamente quando cambiano i propri file di certificazione e può essere lanciata manualmente mediante `workflow_dispatch`, indicando il target pubblico.

Configurazione:

`apps/control-center/playwright.public.config.ts`

Suite:

`apps/control-center/e2e/public-browser-certification.spec.ts`

Workflow:

`.github/workflows/control-center-public-browser-certification.yml`

## Vincoli di governance

- Il Control Center resta **READ_ONLY**.
- `DOS-A1` resta **RUNTIME_DEFERRED**.
- Nessun esito della lane autorizza automaticamente merge, deploy, modifica di authority o attivazioni runtime.
- Le decisioni irreversibili restano soggette a Human Review.
