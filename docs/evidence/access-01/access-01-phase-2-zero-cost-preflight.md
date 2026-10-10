# ACCESS-01 Phase 2 — Zero-cost Preflight

**Data:** 2026-10-10  
**Branch:** `feat/access-01-phase-2-trama-access-runtime`  
**Baseline di esecuzione:** `fe0084ae99121cb3ea2de9b1da5c5ccca38a27a6`  
**Decisione:** `PASS — ZERO_COST_PREFLIGHT`

## Scopo

Questo preflight verifica i presupposti zero-cost richiesti dalla specifica e dal piano ACCESS-01 Phase 2 prima di qualsiasi provisioning live.

Il controllo è stato eseguito in sola lettura: **nessun progetto Supabase, servizio Render, database, callback, utente Auth o risorsa a pagamento è stato creato o modificato**.

## Evidenze

### 1. Slot Supabase Free disponibile — PASS

- organizzazione collegata: `EduManag`;
- piano rilevato: `free` / `tier_free`;
- progetti visibili: 4;
- progetti attivi: 1;
- progetti inattivi/paused: 3;
- la documentazione Supabase corrente dichiara una quota di **due progetti Free attivi** e specifica che i progetti paused non contano verso la quota.

Conclusione: esiste capacità per un ulteriore progetto Free attivo senza upgrade, salvo variazioni di account/quota da ricontrollare immediatamente prima del provisioning.

Fonte pubblica: `https://supabase.com/docs/guides/platform/billing-faq`

### 2. Regione UE Supabase disponibile — PASS

L'API di gestione collegata espone regioni UE, incluse `eu-west-1`, `eu-west-3`, `eu-central-1` ed `eu-north-1`. La documentazione Supabase corrente conferma regioni specifiche UE quali Irlanda, Parigi, Francoforte e Stoccolma.

Per Phase 2 il progetto dovrà essere creato in una regione UE specifica; la scelta finale sarà registrata nel proof live.

Fonte pubblica: `https://supabase.com/docs/guides/platform/regions`

### 3. Canale email gratuito compatibile con il pilot — PASS

Il provider email predefinito Supabase può inviare email Auth soltanto a indirizzi appartenenti all'organizzazione del progetto quando non è configurato SMTP custom. L'account collegato è membro dell'organizzazione `EduManag`; pertanto esiste almeno un indirizzo di organizzazione idoneo a essere usato come principal reale di pilot senza introdurre SMTP a pagamento.

Il receipt non registra l'indirizzo personale del pilot.

Fonte pubblica: `https://supabase.com/changelog/29370-supabase-auth-changes-to-default-email-provider`

### 4. Runtime Render Free disponibile — PASS

Il workspace Render collegato supporta web service Node sul piano `free`; sono già presenti servizi Free e la capability di creazione consente esplicitamente `plan=free` e regione `frankfurt`.

La documentazione Render corrente conferma la disponibilità dei Free web services. Sono accettati per il pilot i limiti noti: spin-down dopo inattività, filesystem effimero e pool mensile di Free instance hours. Nessun Render Postgres è richiesto dal design Phase 2.

Fonti pubbliche:
- `https://render.com/docs/free`
- `https://render.com/docs/web-services`

### 5. Nessun add-on o servizio a pagamento obbligatorio — PASS

Il boundary approvato usa:

- Supabase Free: Auth passwordless + Postgres Access dedicato;
- Render Free: singolo web service Node;
- nessun Render Postgres;
- nessun persistent disk;
- nessun SMTP esterno;
- nessun social provider;
- nessun add-on Supabase;
- nessuna risorsa a pagamento.

Non è emersa una dipendenza obbligatoria a pagamento per chiudere il pilot Phase 2.

## Vincoli conservati

Questo PASS **non autorizza ancora provisioning immediato**. Il piano richiede prima implementazione e certificazione deterministica dei Task 1–8 e un secondo preflight immediatamente prima del Task 9.

Restano invariati:

- zero cost;
- nessuna federazione prodotto;
- nessun cutover Gateway;
- nessun dato learner;
- nessun product database condiviso;
- nessun secret nel repository;
- nessun merge automatico.

## Stop conditions

Il provisioning dovrà fermarsi e richiedere una nuova decisione se, al re-check del Task 9, cambia uno dei seguenti presupposti:

- non è più disponibile uno slot Free Supabase;
- una regione UE non è disponibile;
- il canale email gratuito non può servire il principal di pilot;
- Render richiede un piano a pagamento;
- è necessario SMTP/add-on/database esterno a pagamento;
- il provider non consente il percorso verified-claims richiesto dal contratto.
