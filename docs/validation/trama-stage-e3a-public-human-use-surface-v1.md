# TRAMA Stage E3-A — Public Human-use Validation Surface v1

**Stato:** PROPOSED / PUBLIC VALIDATION SURFACE / READ_ONLY  
**Data:** 2026-09-29  
**Perimetro:** TRAMA Control Center pubblico su Render  
**Parent:** Stage E3 Human-use Validation Protocol v1  
**Runtime authority:** NONE  
**Live Overlay:** NOT ACTIVATED  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Decisione

La validazione E3 viene condotta sulla stessa applicazione pubblica del Control Center, evitando un secondo ambiente che potrebbe divergere dal runtime reale.

La superficie pubblica ordinaria resta:

`/`

La superficie del moderatore è:

`/e3/`

Gli scenari vengono aperti sulla Home reale tramite query allowlisted:

`/?validation=e3&scenario=<scenario>#projectKnowledge`

## 2. Perché non uno staging separato

Per E3 interessa verificare la comunicazione e l'interazione della superficie reale. Uno staging separato introdurrebbe una seconda copia da mantenere e potrebbe produrre evidenza su una UI diversa da quella pubblicata.

La separazione necessaria viene ottenuta a livello di rotta e modalità, non con un secondo servizio.

## 3. Invarianti

La modalità E3:

- è attiva solo con `validation=e3`;
- accetta solo scenari allowlisted;
- espone sempre un banner che dichiara lo scenario sintetico;
- non salva fixture E3 nella cache Project Knowledge;
- non effettua nuove chiamate di rete;
- non consulta GitHub o altre API dal browser;
- non abilita scritture o approvazioni;
- non abilita Live Overlay;
- non abilita telemetria;
- non raccoglie automaticamente dati del partecipante.

La Home senza query E3 mantiene il comportamento E2 ordinario.

## 4. Scenari pubblici

La superficie supporta:

- normal;
- loading;
- empty;
- partial;
- review;
- blocked;
- noaccess;
- offline;
- unavailable.

Gli scenari sono fixture sintetiche per il solo test di comprensione.

## 5. Stato NO_ACCESS

E3 ha evidenziato una lacuna di copertura: il protocollo include `NO_ACCESS`, mentre il mapper E2 non aveva un ramo esplicito.

Il mapper ora riconosce `effectiveContext.accessStatus = NO_ACCESS` e presenta un esito leggibile senza dettagli tecnici. L'aggiunta è fail-closed e non modifica la produzione finché il campo non è presente.

## 6. Pannello moderatore

`control-center/e3/index.html` consente di:

- aprire gli scenari sulla Home reale;
- scegliere un profilo astratto non identificante;
- registrare l'esito osservato;
- classificare un eventuale finding;
- generare localmente una receipt JSON.

La receipt non viene trasmessa.

## 7. Binding al build testato

Il pannello riceve l'exact head attraverso il parametro `head`.

Una receipt può essere generata solo se `head` è un SHA-1 Git valido di 40 caratteri.

Il link distribuito per una tornata deve quindi avere forma:

`/e3/?head=<EXACT_HEAD>`

Questo evita chiamate runtime a GitHub e mantiene il binding esplicito alla baseline testata.

## 8. Privacy

Il pannello non contiene campi per nome, email o account.

La receipt dichiara:

- `containsDirectIdentifiers: false`;
- `containsUngovernedRecording: false`.

Le note devono restare anonime e pertinenti al comportamento osservato.

## 9. PWA

La rotta E3 entra nello shell cache `trama-control-center-v10`.

La modalità offline non trasforma dati sintetici in dati live e non modifica la semantica del normale Control Center.

## 10. Validazione automatica

`scripts/test_stage_e3_public_validation_surface.cjs` verifica:

- scenari allowlisted;
- banner esplicito;
- assenza di capability di rete nel pannello E3;
- assenza di token/header sensibili;
- receipt privacy fail-closed;
- exact-head binding;
- cache PWA v10;
- presenza della rotta E3.

I workflow Control Center e Governance eseguono il test.

## 11. Non autorizzazioni

Questo stage non autorizza:

- merge automatico;
- Live Overlay;
- collector/browser polling;
- GitHub App;
- mutation/write;
- telemetria;
- raccolta di dati personali;
- promozione automatica;
- DOS-A1.

## 12. Gate umano

La superficie E3-A può essere pubblicata solo dopo:

- CI verde;
- review tecnica/UX indipendente;
- verifica mobile;
- HUMAN EXACT-HEAD REVIEW — PASS;
- decisione umana di integrazione.

La pubblicazione della superficie abilita la prova E3, ma non equivale a PASS E3.
