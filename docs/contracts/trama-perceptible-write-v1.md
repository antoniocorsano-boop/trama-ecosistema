# TRAMA-PW-01 — Perceptible Write Contract v1

**Stato proposto:** ECOSYSTEM_GOVERNANCE / CROSS_PRODUCT / HUMAN_CONTROL
**Ambito:** Arena · Docente OS · Atlas · ogni futura superficie TRAMA con azioni mutative
**Principio:** nessuna write user-initiated può essere silenziosa.

## 1. Regola canonica

Ogni azione che modifica stato locale, remoto, editoriale, curricolare, didattico, di pubblicazione o di workflow deve rendere percepibile all'utente l'intero ciclo:

**intenzione → in corso → esito → stato risultante → prossimo passo**

Un cambio di pagina, un rerender, un cambio di posizione nella UI o il solo fatto che il dato sia stato persistito **non costituiscono feedback sufficiente**.

## 2. Requisiti obbligatori

Per ogni write user-facing:

1. **Intento chiaro prima della write** — il controllo comunica cosa accadrà.
2. **Pending percepibile** — se l'operazione non è istantanea, il controllo o una regione associata indica che l'azione è in corso ed evita doppi invii.
3. **Successo esplicito** — dopo una write riuscita compare una conferma comprensibile, vicina al contesto dell'azione.
4. **Errore esplicito** — un fallimento non può lasciare l'utente in stato ambiguo; deve indicare che cosa non è avvenuto e cosa può fare.
5. **Stato risultante leggibile** — l'utente deve capire che cosa è cambiato.
6. **Prossimo passo** — quando utile, il feedback indica cosa è ora possibile o necessario fare.
7. **Accessibilità** — successo e errore sono annunciabili alle tecnologie assistive (`role=status`, `role=alert`, `aria-live` o equivalente nativo).
8. **Non dipendenza dal colore** — il solo colore non è feedback.
9. **No toast-only per decisioni critiche** — approvazioni, pubblicazioni, ritiri, adozioni, eliminazioni e decisioni istituzionali devono lasciare anche uno stato persistente nella superficie.
10. **Nessuna approvazione implicita** — persistenza, trasferimento, download, import/export o navigazione non equivalgono a conferma umana.

## 3. Ambito delle write

Sono comprese almeno:
- create/update/delete/upsert;
- accetta/rifiuta/scarta/rimuovi;
- approva/rivalida/conferma;
- collega/allega/usa nella lezione;
- pubblica/aggiorna/ritira;
- import/export quando produce stato o ricevuta;
- trasferimenti cross-product;
- salvataggi locali autorevoli;
- azioni assistite/AI che diventano operative dopo conferma.

Le azioni puramente read-only non rientrano nel contratto.

Per meccanismi mutativi custom non riconoscibili staticamente si usa il marker `@trama-write`. Nei rari casi ambigui realmente read-only si può usare `@trama-readonly`; il marker non può mascherare una write effettiva e resta soggetto a review.

## 4. Enforcement

Ogni prodotto deve mantenere:
- manifest machine-readable del contratto;
- gate CI `TRAMA Perceptible Write`;
- classificazione del diff per superfici mutative;
- evidenza automatica di feedback successo/errore e, quando applicabile, pending;
- test del risultato percepito, non soltanto dello stato persistito;
- audit baseline delle write preesistenti.

Una PR che modifica una superficie mutativa senza evidenza di feedback percepibile deve fallire chiusa.

## 5. Human acceptance

Per i journey critici il collaudo umano deve poter rispondere, dopo ogni write:

> Ho capito che l'azione è partita, se è riuscita o fallita, che cosa è cambiato e cosa posso fare adesso?

Se una delle quattro informazioni manca, la write non è human-complete anche se tecnicamente corretta.

## 6. Stato di adozione

- **Docente OS:** regola già presente nel Design System, da promuovere a gate eseguibile e audit baseline.
- **Arena:** da integrare nel Human Interaction Model e audit delle superfici mutative.
- **Atlas:** gate preventivo obbligatorio prima dell'introduzione di qualunque runtime mutativo.
- **TRAMA:** questo contratto è la fonte di governance comune.

## 7. Confini invariati

TRAMA-PW-01 non:
- autorizza nuove write;
- attiva DOS-A1;
- modifica l'autorità curricolare di Arena;
- autorizza runtime cross-product;
- trasforma Atlas in sistema autenticato o repository di dati personali.

Il contratto disciplina soltanto la qualità percettiva e verificabile delle write già autorizzate da altri gate.
