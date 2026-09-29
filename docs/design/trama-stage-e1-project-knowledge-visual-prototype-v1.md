# TRAMA Stage E1 — Project Knowledge Visual Prototype v1

**Stato:** PROPOSED / VISUAL PROTOTYPE / NO RUNTIME AUTHORIZATION  
**Data:** 2026-09-29  
**Perimetro:** TRAMA Control Center · Project Knowledge v2  
**Base:** Stage E0 Human Communication & UI Contract

## 1. Scopo

E1 traduce il contratto E0 in un prototipo visuale realistico, responsive e ispezionabile senza modificare il runtime del Control Center.

Il prototipo deve dimostrare che una persona non tecnica può capire:

1. se le informazioni di riferimento restano affidabili;
2. se gli aggiornamenti recenti sono disponibili e completi;
3. se serve fare qualcosa;
4. cosa resta utilizzabile quando un controllo recente non riesce;
5. dove trovare il dettaglio tecnico senza esserne sopraffatta.

## 2. Artefatto

Prototipo standalone:

`docs/prototypes/TRAMA-STAGE-E1-PROJECT-KNOWLEDGE-VISUAL.html`

Proprietà:
- nessun accesso di rete;
- dati esclusivamente sintetici;
- nessuna integrazione con `control-center/*.html`;
- nessuna registrazione nel service worker;
- nessuna authority o write;
- nessuna promotion;
- nessuna telemetria;
- nessuna dipendenza esterna.

## 3. Benchmark adottato

Il prototipo adotta e adatta pattern maturi:

- **GitHub Status Checks**: sintesi dello stato con dettaglio progressivo;
- **GitLab Environments/Deployment Approvals**: stato corrente distinto da storico e azione/approvazione;
- **Backstage Status/Entity Presentation**: ultimo dato valido preservato, identificatori grezzi non usati come nome primario;
- **PatternFly Status & Severity**: stato e gravità separati;
- **W3C / GOV.UK / Carbon**: notifiche proporzionate, testo comprensibile, stato accessibile senza dipendenza dal colore.

TRAMA non copia la terminologia DevOps di questi prodotti; ne riusa l'architettura informativa.

## 4. Gerarchia della schermata

Ordine:

1. titolo e contesto;
2. messaggio complessivo sintetico;
3. eventuale azione richiesta;
4. Informazioni verificate;
5. Aggiornamenti recenti;
6. eventuale Da verificare;
7. dettaglio tecnico progressivo;
8. nota prototipo/non runtime.

Nessun KPI decorativo e nessun overall score.

## 5. Scenari obbligatori

### NORMAL

Messaggio:
> Le informazioni di riferimento sono valide. Gli aggiornamenti recenti non richiedono attenzione.

Nessun banner di allarme.

### LOADING

Messaggio:
> Sto controllando gli aggiornamenti più recenti.

Il contenuto governato già disponibile resta leggibile.

### EMPTY

Messaggio:
> Nessun aggiornamento da mostrare.

Empty non equivale a errore.

### PARTIAL / UNAVAILABLE

Messaggio:
> Alcuni aggiornamenti non sono disponibili. Le informazioni verificate restano consultabili.

Nessun rosso e nessun blocco se l'azione non è realmente bloccata.

### REVIEW_REQUIRED

Messaggio:
> Alcune informazioni sono cambiate e devono essere verificate.

Deve esistere una call-to-action esplicita e comprensibile.

### BLOCKED

Messaggio:
> Serve una verifica prima di continuare.

Deve indicare quale azione è bloccata, chi può intervenire e cosa resta comunque consultabile.

### NO_ACCESS

Messaggio:
> Non hai accesso ai dettagli tecnici di questa verifica.

Non deve apparire come perdita dati o guasto.

### OFFLINE_CACHED

Messaggio:
> Stai vedendo l'ultimo stato disponibile. Non è stato possibile controllare aggiornamenti più recenti.

Il timestamp precedente resta visibile.

## 6. Component roles

- `StateSummary`: sintesi quieta dello stato;
- `ActionNotice`: richiesta di azione concreta;
- `VerifiedInformationCard`: base governata;
- `RecentUpdatesCard`: stato live tradotto;
- `ReviewNotice`: boundary signal comprensibile;
- `TechnicalDetailsDisclosure`: repository/SHA/provenance solo su richiesta;
- `HistoryHint`: collegamento concettuale allo storico, separato dallo stato corrente;
- `ScenarioSwitcher`: solo nel prototipo, mai componente di produzione.

I nomi sono di progettazione, non obbligano l'implementazione E2.

## 7. Responsive

Desktop:
- sidebar prototipo;
- contenuto max-width controllato;
- due colonne per verified + updates;
- dettaglio tecnico sotto.

Mobile:
- singola colonna;
- sintesi e azione prima;
- dettaglio tecnico collassato;
- nessun overflow orizzontale;
- target touch >= 44 px;
- sidebar rimossa.

## 8. Accessibilità

Il prototipo deve:
- avere landmark semantici;
- usare heading gerarchici;
- usare `role=status` / `aria-live=polite` per il cambio scenario;
- non dipendere dal colore;
- mantenere focus-visible;
- usare `details/summary` nativi per il dettaglio tecnico;
- rispettare `prefers-reduced-motion`;
- essere leggibile a zoom elevato e su viewport mobile.

## 9. Copy rules

Nella vista primaria sono vietati:
- semantic drift;
- repository head mismatch;
- overlay;
- SHA;
- promotionRequired;
- CURRENT/FRESH/DEGRADED come label utente.

Sono ammessi nel dettaglio tecnico.

## 10. Criteri E1

E1 è pronto per review quando:

- gli otto scenari sono rappresentati;
- normal non usa un allarme prominente;
- partial/unavailable preserva il dato verificato;
- review-required e blocked sono distinguibili;
- no-access è distinto da unavailable;
- offline/cached è distinto da live;
- stato e gravità non sono compressi in un unico semaforo;
- desktop/mobile mantengono la stessa semantica;
- technical details sono progressivi;
- nessuna rete o runtime è presente;
- il prototipo non è collegato alla superficie di produzione;
- un validatore offline verifica questi invarianti.

## 11. Fuori perimetro

E1 non:
- integra EffectiveProjectContext reale;
- attiva Live Overlay;
- definisce il componente finale;
- promuove ADR-018;
- modifica il service worker;
- aggiunge tracking;
- sostituisce E3 human-use validation.

## 12. Passaggio a E2

E2 potrà iniziare solo dopo:
1. review tecnica/UX del prototipo;
2. conferma che il mapping E0→E1 è completo;
3. verifica mobile/accessibilità;
4. decisione umana sull'exact head E1.

Il prototipo non diventa produzione per semplice somiglianza visuale.
