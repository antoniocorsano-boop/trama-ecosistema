# TRAMA-SA-01 — adattatore TypeSafe live

Stato: **LAB_ONLY / PROVIDER_RUN_PENDING**

## Fonte tecnica verificata

Verifica effettuata il 21 settembre 2026 sul repository ufficiale `typesafe-ai/typesafe-sdk-python`.

Dati usati dall'adattatore:
- pacchetto ufficiale: `typesafe-sdk`;
- versione verificata: `0.7.1`;
- Python richiesto upstream: `>=3.10`;
- chiave letta da `TYPESAFE_API_KEY`;
- client: `TypeSafeClient`;
- metodo: `system_one(state, questions, model=...)`;
- primitive: `Choice`, `Noul`;
- risposta Choice: `choice`, `confidence`, `probabilities`;
- risposta Noul: `noul`;
- risposta generale: `model` e `usage`.

La documentazione web TypeSafe rimane la fonte tecnica primaria indicata dalla skill. Poiché l'accesso diretto alla documentazione live non era disponibile nell'ambiente di lavoro, l'adattatore è limitato alle API pubbliche verificate nel sorgente e nel README dell'SDK ufficiale e non introduce opzioni non verificate.

## Confini

L'adattatore:
- usa esclusivamente il corpus sintetico TRAMA-SA-01;
- esegue prima il pre-gate deterministico già versionato;
- non invia i casi respinti dal pre-gate;
- non legge dati di Arena, Atlas o Docente OS in produzione;
- non scrive su alcun prodotto;
- non interpreta probabilità come autorizzazioni;
- non calcola soglie di accettazione;
- salva `humanReview.reviewed=false`;
- registra gli errori del provider come errori, mai come esiti positivi;
- non modifica `TRAMA-ADR-009`.

## Esecuzione locale

Installare soltanto la dipendenza del pilota:

```sh
python3 -m pip install -r requirements/trama-sa01-typesafe.txt
```

Impostare la chiave nell'ambiente senza inserirla nel repository:

```sh
export TYPESAFE_API_KEY="..."
python3 scripts/run_trama_sa01_typesafe.py \
  --output /tmp/trama-sa01-typesafe-raw.json \
  --model jev-latest
```

Il file prodotto è **grezzo** e non supera `scripts/run_trama_sa01.py score` finché una persona non completa la revisione dei singoli casi.

## GitHub Actions

Il workflow manuale `TRAMA-SA-01 TypeSafe Pilot`:
- viene eseguito solo tramite `workflow_dispatch`;
- usa il segreto GitHub `TYPESAFE_API_KEY`;
- installa la versione SDK pinning `0.7.1`;
- valida prima il corpus;
- esegue il provider sul solo corpus sintetico;
- carica il risultato grezzo come artefatto;
- non effettua merge, deploy o scritture nei prodotti.

L'assenza del segreto deve causare fallimento esplicito, non fallback.
