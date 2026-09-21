# TRAMA-SA-01/R3 — Piano di robustezza e calibrazione

Stato: **AUTHORIZED_FOR_EXPERIMENT / IMPLEMENTATION_IN_REVIEW**

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


## Consolidamento preregistrazione

Prima di qualsiasi run provider R3, il corpus iniziale monodisciplinare è stato sostituito dal corpus canonico `r3-cases.json` versione `3.1.0`.

Verifica effettuata prima del consolidamento:
- run R3 provider eseguiti: **0**;
- holdout osservato da TypeSafe: **no**;
- tuning sull'holdout: **no**.

Il corpus canonico ora contiene:
- 48 casi;
- 32 development;
- 16 holdout bloccati;
- 12 casi per etichetta;
- 12 casi per ciascuno dei quattro domini: Tecnologia, Scienze, Matematica, Educazione civica;
- 24 coppie di parafrasi;
- policy preregistrate nel file corpus e non modificabili dal workflow.

Policy sperimentali preregistrate:
- baseline evidence routing: `0.5`;
- fascia conservativa di review: `0.4–0.6`;
- confidence floor alignment: `0.65`.

Questi valori servono soltanto al confronto sperimentale e non sono soglie runtime o di autorizzazione.

## Implementazione canonica

- corpus: `docs/pilots/trama-sa-01/r3-cases.json`;
- validator/scorer: `scripts/run_trama_sa01_r3.py`;
- entrypoint validator compatibile: `scripts/validate_trama_sa01_r3.py`;
- adapter TypeSafe: `scripts/run_trama_sa01_typesafe_r3.py`;
- workflow manuale: `.github/workflows/trama-sa01-typesafe-r3.yml`;
- regressioni: `tests/test_trama_sa01_r3.py`.
