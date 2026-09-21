# TRAMA-SA-01/R3 — Piano di robustezza e calibrazione

Stato: **AUTHORIZED_FOR_SYNTHETIC_PILOT / IMPLEMENTATION_IN_REVIEW**

## Autorizzazione umana

R3 è stato autorizzato il 21 settembre 2026 esclusivamente per il pilota sintetico descritto in questo documento.

L'autorizzazione **non**:
- promuove `TRAMA-ADR-009`;
- autorizza runtime in Arena, Atlas o Docente OS;
- autorizza dati personali;
- modifica `DOS-A1`.

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
