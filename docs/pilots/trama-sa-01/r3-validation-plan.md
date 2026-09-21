# TRAMA-SA-01/R3 — Piano di robustezza e calibrazione

Stato: **AUTHORIZED_FOR_EXPERIMENT / DEVELOPMENT_RUN_NOT_YET_EXECUTED**

## Obiettivo

Verificare se il disegno R2 mantiene utilità e sicurezza su un corpus sostanzialmente più ampio senza trasformare una probabilità in autorizzazione.

## Corpus

Target ingegneristico iniziale: **48 casi semantici preregistrati**, bilanciati come segue:

- 12 `ALIGNED`;
- 12 `PARTIAL`;
- 12 `CONTRADICTORY`;
- 12 `INSUFFICIENT_EVIDENCE`.

Il target è un banco di prova, non una garanzia statistica.

### Copertura richiesta

Il corpus deve includere:

- formulazioni brevi e lunghe;
- lessico scolastico italiano;
- obiettivi semplici e compositi;
- parafrasi equivalenti;
- omissioni sottili;
- contraddizioni esplicite e implicite;
- evidenza troppo generica;
- evidenza pertinente ma incompleta;
- risorse apparentemente plausibili ma non sostenute;
- almeno più di una disciplina o dominio didattico per verificare che il comportamento non dipenda soltanto dal lessico di Tecnologia.

Nessun dato personale reale.

## Split

Prima di qualunque tuning:

- 32 casi: development/calibration;
- 16 casi: holdout finale.

L'holdout non deve essere usato per modificare prompt, criteri o boundary.

**Guardia operativa:** il workflow R3 autorizzato esegue soltanto i 32 casi DEVELOPMENT. I 16 casi HOLDOUT non sono eseguibili dal workflow corrente e richiedono un gate umano successivo dopo l'analisi DEVELOPMENT.

## Disegno

R3 conserva:

1. pre-gate deterministico;
2. `evidence_sufficient` separato;
3. `alignment` separato;
4. output provider-neutral;
5. `advisoryOnly=true`;
6. revisione umana.

Il boundary non viene assunto come definitivo. R3 deve confrontare almeno:
- routing con `0.5`;
- una policy di escalation che considera anche incertezza/confidence;
- nessun routing automatico per casi vicini al boundary senza review.

## Metriche

Registrare almeno:

- accordo esatto;
- falsi `ALIGNED`;
- falsi `INSUFFICIENT_EVIDENCE`;
- confusion matrix;
- stabilità su coppie di parafrasi;
- comportamento sui casi limite;
- distribuzione delle confidence;
- latenza;
- input/output token;
- errori provider;
- timeout/retry;
- quota di casi inviati a review umana.

## Gate di sicurezza

R3 fallisce se:

- un caso respinto dal pre-gate viene inviato al provider;
- viene trasferito un dato personale non previsto;
- un errore provider viene trasformato in esito positivo;
- un risultato produce scritture o autorizzazioni;
- `advisoryOnly` non è true;
- il risultato non è legato allo stato tramite digest;
- l'holdout viene usato per tuning prima della valutazione finale.

## Provider-neutrality

L'harness R3 deve continuare a produrre il contratto TRAMA provider-neutral.

La semantica inter-prodotto non deve dipendere da:
- nomi di classi SDK;
- modello `jev-*`;
- formato proprietario di risposta;
- credenziali o endpoint TypeSafe.

## Esito

R3 può produrre soltanto:

- `STOP`;
- `REVISE`;
- `CANDIDATE_FOR_ADR_REVIEW`.

Nessun esito modifica automaticamente `TRAMA-ADR-009`.


## Consolidamento canonico pre-run

Il corpus canonico è stato consolidato in `r3-cases.json` versione `3.1.0` dopo aver identificato come non conforme il precedente corpus monodisciplinare.

Prima del consolidamento canonico erano già stati avviati due run DEVELOPMENT sul corpus monodisciplinare; entrambi sono esclusi dall'evidenza R3. Il relativo HOLDOUT non è stato eseguito e nessun output dei due run è stato usato per tuning, modifica di prompt, boundary, casi o nuovo holdout.

Il corpus canonico contiene:
- 48 casi;
- 32 DEVELOPMENT;
- 16 HOLDOUT bloccati;
- 12 casi per ciascuna etichetta;
- 12 casi per ciascuno dei quattro domini: Tecnologia, Scienze, Matematica, Educazione civica;
- 24 coppie di parafrasi.

Policy sperimentali preregistrate:
- baseline evidence routing: `0.5`;
- fascia conservativa di review: `0.4–0.6`;
- alignment confidence floor: `0.65`.

Questi valori servono esclusivamente al confronto sperimentale e non costituiscono soglie runtime o autorizzative.

Il workflow corrente esegue soltanto DEVELOPMENT. L'HOLDOUT richiede una review umana dei risultati DEVELOPMENT e un gate separato.


## Run monodisciplinari esclusi

Prima del consolidamento canonico 3.1.0 erano stati avviati due run DEVELOPMENT sul corpus R3 monodisciplinare:

- run `35648847753`: **FAILURE**;
- run `35649286123`: **SUCCESS**.

Entrambi sono classificati **NON_CANONICAL / EXCLUDED_FROM_R3_EVIDENCE** perché il corpus usato non rispettava il requisito multi-dominio già previsto dal piano R3.

La non conformità del corpus era stata identificata prima di usare questi output per analisi o tuning. Nessun risultato dei due run viene utilizzato per:
- modificare prompt;
- modificare boundary;
- selezionare casi;
- modificare l'holdout canonico 3.1.0;
- sostenere `TRAMA-ADR-009`.

L'HOLDOUT canonico 3.1.0 non è stato eseguito.
