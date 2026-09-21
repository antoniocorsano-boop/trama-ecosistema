# TypeSafe come assurance semantica opzionale

Stato: **PROPOSTO**  
Riferimento decisionale: `TRAMA-ADR-009`

## Scopo

TypeSafe può essere valutato in TRAMA come capacità esterna di **giudizio semantico tipizzato e probabilistico**. Non è una nuova autorità dell'ecosistema, non sostituisce le regole deterministiche e non autorizza azioni.

La skill ufficiale descrive il modello System One come un insieme di primitive di giudizio — tra cui `Choice`, `Noul` e `Score` — da comporre nel codice. Il codice mantiene workflow, regole, controlli, stato ed effetti; il modello fornisce interpretazioni semantiche dove una regola esatta non basta.

Riferimento upstream:
- repository skill: https://github.com/typesafe-ai/skills
- skill: https://github.com/typesafe-ai/skills/blob/main/skills/typesafe-ai/SKILL.md
- documentazione corrente: https://docs.typesafe.ai/

La documentazione corrente del fornitore resta la fonte tecnica da consultare prima di ogni implementazione o aggiornamento.

## Collocazione in TRAMA

TypeSafe è ammesso soltanto come **semantic-assurance provider opzionale**.

Può supportare:
- verifica di coerenza tra contenuto proposto ed evidenza fornita;
- selezione o classificazione fra opzioni definite dal codice;
- rilevazione di casi insufficienti, ambigui o contraddittori;
- riordinamento semantico di candidati già recuperati con meccanismi deterministici;
- inoltro alla revisione umana dei casi incerti o non conformi.

Non può:
- diventare fonte autorevole del curricolo;
- approvare, pubblicare, adottare o modificare contenuti;
- sostituire vincoli di schema, database, versione, idempotenza o concorrenza;
- decidere autorizzazioni, identità, diritti di accesso o stati istituzionali;
- trasformare una probabilità in permesso operativo;
- attivare `DOS-A1` o altre capacità differite.

## Separazione dei controlli

### Controlli deterministici

Restano nel codice e devono essere eseguiti indipendentemente da TypeSafe:
- validità JSON/schema;
- presenza e formato degli identificativi;
- `curriculumVersionRef`, `authorityState` e `authorityReceiptRef` quando richiesti;
- controllo di versione e idempotenza;
- vincoli di pubblicazione e ritiro;
- minimizzazione dei dati;
- presenza delle evidenze richieste per diritti/licenze e accessibilità;
- regole di sicurezza e autorizzazione.

### Giudizi semantici

Possono essere sottoposti a TypeSafe soltanto quando richiedono comprensione del significato, per esempio:
- una sintesi didattica conserva il significato dell'obiettivo Arena fornito come evidenza?
- una risorsa proposta è coerente con il contesto didattico dichiarato?
- una descrizione è supportata dall'evidenza citata oppure introduce contenuto non sostenuto?

Le domande devono essere ristrette, autonome e corredate dello stato minimo necessario. Le alternative devono includere un esito equivalente a **evidenza insufficiente** quando il caso può non essere decidibile.

## Politica dell'incertezza

Nel pilota nessuna soglia viene assunta come universale.

1. Tutti i casi sono riesaminati da una persona.
2. Si raccolgono distribuzioni/probabilità, esiti umani e tipologia dell'errore.
3. Eventuali soglie vengono definite solo dopo calibrazione sul dominio reale.
4. Anche un esito ad alta confidenza non equivale ad autorizzazione.
5. Un fallimento del servizio produce un esito controllato e non un'approvazione per difetto.

## Dati e protezione

Per la fase sperimentale:
- sono ammessi soltanto dati sintetici, pubblici o già minimizzati;
- non sono trasferiti dati personali di studenti, famiglie o personale;
- non sono trasferite credenziali, segreti o configurazioni di produzione;
- eventuali credenziali API restano lato server nel prodotto che in futuro integrasse il servizio;
- TRAMA conserva soltanto specifiche, criteri e risultati aggregati del pilota, non ricevute tecniche di prodotto.

Una futura integrazione runtime richiede una decisione distinta che verifichi almeno condizioni del servizio, trattamento e conservazione dei dati, localizzazione dei trattamenti, sicurezza, costi, disponibilità e gestione dei malfunzionamenti.

## Contratto di integrazione TRAMA

Un prodotto che usa un provider di assurance semantica deve trattare il risultato come **advisory-only** e conservarne la provenienza in una struttura propria, senza assumere campi o semantica specifici del fornitore come contratto inter-prodotto.

Il contratto TRAMA deve poter rappresentare almeno:
- provider e versione/configurazione rilevante;
- identificatore del giudizio;
- digest dello stato valutato;
- tipo di giudizio;
- esito strutturato e distribuzione/probabilità disponibile;
- versione della policy che interpreta il risultato;
- data/ora della valutazione;
- indicatore `advisoryOnly=true`;
- esito della successiva revisione umana quando prevista.

## Uso della skill nello sviluppo

La skill TypeSafe è uno strumento per l'agente di sviluppo, non una dipendenza runtime di TRAMA.

Usare **un solo metodo di installazione** per ambiente:

Claude Code:

```sh
claude plugin marketplace add typesafe-ai/skills
claude plugin install typesafe@typesafe-ai
```

Altri agenti compatibili:

```sh
npx skills add typesafe-ai/skills --skill typesafe-ai
```

L'installazione della skill non autorizza l'installazione dell'SDK o l'uso dell'API nei prodotti.

## Gate di promozione

`TRAMA-ADR-009` può passare da `PROPOSED` a `APPROVED` solo dopo:
- completamento del pilota `TRAMA-SA-01`;
- report umano con errori, disaccordi e casi non decidibili;
- evidenza che i controlli deterministici non sono stati delegati;
- evidenza che nessun output ha prodotto effetti automatici;
- definizione documentata della policy di fallback;
- verifica di protezione dati e condizioni del servizio per l'eventuale uso previsto.

La successiva integrazione runtime richiede comunque una decisione separata.
