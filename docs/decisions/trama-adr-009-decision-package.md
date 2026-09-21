# TRAMA-ADR-009 — Decision package

Stato del pacchetto: **READY_FOR_HUMAN_DECISION / ADR STATUS UNCHANGED**

ADR collegata: `TRAMA-ADR-009`  
Stato ADR corrente: **PROPOSED**

## Domanda decisionale

TRAMA dispone ora di evidenza sufficiente per promuovere TypeSafe da capacità sperimentale a capacità di assurance semantica approvata?

## Evidenza disponibile

### R1

- 12 casi totali;
- 10 casi semantici;
- 2 pre-gate reject;
- 8/10 accordo con etichette umane;
- 1 falso passaggio `ALIGNED`;
- 0 errori provider;
- outcome umano: **REVISE**.

Il finding principale di R1 è stato l'uso non robusto di `INSUFFICIENT_EVIDENCE` come quarta alternativa nello stesso `Choice`.

### R2

R2 ha separato:
1. sufficienza dell'evidenza tramite `Noul`;
2. allineamento tramite `Choice` solo dopo il routing sperimentale.

Sul medesimo corpus:

- 10/10 accordo con etichette umane;
- 0 falsi passaggi `ALIGNED`;
- 2/2 casi di evidenza insufficiente fermati prima dell'allineamento;
- 0 errori provider;
- outcome umano: **CANDIDATE**.

Costi osservati rispetto a R1:

- input token: circa +47%;
- output token: circa -18%;
- latenza media: circa 1.9x.

Questi dati descrivono il corpus pilota e non costituiscono una misura di affidabilità generale.

## Gate ADR-009 già soddisfatti

Sono documentati:

- pilota TRAMA-SA-01 eseguito;
- report umano su errori e disaccordi;
- controlli deterministici mantenuti separati;
- nessun output TypeSafe ha prodotto pubblicazione, modifica, adozione o altro effetto;
- esecuzione fail-closed senza chiave;
- output `advisoryOnly=true`;
- revisione umana obbligatoria nel pilota;
- runtime dei prodotti non autorizzato;
- `DOS-A1` invariato.

## Gate non ancora sufficientemente soddisfatti

### Robustezza

Il corpus semantico attuale contiene soltanto 10 casi. Non dimostra stabilità su:
- maggiore varietà linguistica;
- obiettivi curricolari più lunghi o compositi;
- parafrasi equivalenti;
- casi quasi-contraddittori;
- evidenza parziale ma non insufficiente;
- contenuti provenienti da discipline diverse;
- variazioni di modello/provider.

### Boundary di routing

Il valore `0.5` in R2 è stato usato come boundary naturale del `Noul` per decidere se formulare la seconda query.

Ha funzionato sul campione corrente, ma:
- non è calibrato;
- non è validato come policy generale;
- non può essere promosso a soglia runtime.

### Fallback di prodotto

Il laboratorio è fail-closed, ma un eventuale prodotto deve ancora definire formalmente:
- comportamento quando TypeSafe è indisponibile;
- timeout;
- retry;
- degraded mode;
- UX per esito incerto;
- logging minimizzato;
- conservazione dei risultati;
- divieto di escalation automatica ad azioni.

### Protezione dati e condizioni del servizio

Prima di un uso reale devono essere verificati e registrati:
- trattamento e conservazione dei dati;
- localizzazione dei trattamenti;
- eventuale uso dei dati per training o miglioramento;
- misure di sicurezza;
- condizioni contrattuali applicabili;
- disponibilità e costi;
- gestione delle credenziali;
- compatibilità con il contesto scolastico e con i dati effettivamente previsti.

## Valutazione tecnica

L'evidenza corrente supporta la prosecuzione della sperimentazione, ma **non supporta ancora la promozione di ADR-009 ad APPROVED**.

Il disegno R2 è un candidato valido per una fase R3 di robustezza e calibrazione.

## Opzioni per la review umana

### A — STOP

Interrompere la sperimentazione TypeSafe.

### B — R3

Mantenere `TRAMA-ADR-009 = PROPOSED` e autorizzare esclusivamente una fase R3 di validazione più ampia.

### C — APPROVE

Promuovere ADR-009 ad `APPROVED` come capacità di assurance semantica opzionale, restando comunque separata da ogni autorizzazione runtime.

Questa opzione non è supportata dall'evidenza corrente senza ulteriori assunzioni.

## Proposta tecnica

**Opzione B — R3**, mantenendo `TRAMA-ADR-009 = PROPOSED`.

La proposta non modifica automaticamente il registro decisionale.

## Condizioni minime per una futura proposta APPROVED

Prima di ripresentare ADR-009 per approvazione:

1. completare R3 su un corpus più ampio e preregistrato;
2. mantenere un holdout non usato per modificare domande o boundary;
3. misurare falsi `ALIGNED`, falsi `INSUFFICIENT_EVIDENCE`, stabilità a parafrasi e casi limite;
4. registrare latenza, token e failure mode;
5. verificare la policy di fallback;
6. completare la verifica di protezione dati e condizioni del servizio;
7. confermare che il contratto TRAMA resta provider-neutral;
8. mantenere revisione umana sui casi ambigui;
9. mantenere separata ogni futura decisione runtime.


## Stato successivo alla decisione umana R3

Il 21 settembre 2026 è stata autorizzata **Opzione B — R3**.

Conseguenze:
- R3 può essere implementato ed eseguito sul corpus sintetico preregistrato;
- `TRAMA-ADR-009` resta `PROPOSED`;
- `APPROVED` non è autorizzato;
- ogni runtime nei prodotti resta `NOT_AUTHORIZED`;
- l'holdout R3 non può essere usato per tuning prima della valutazione finale.
