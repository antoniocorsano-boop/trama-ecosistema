# CORE-DIST-01 — Contextual Copilot Core distribution contract v1

**Data:** 2026-10-24  
**Stato:** IMPLEMENTATION AUTHORIZED · NO REGISTRY · NO DEPLOY  
**Baseline:** `main@4de1de1daf2a68ebee4d52b0140420b45ae1ef3e`  
**Pacchetto:** `@trama/contextual-copilot-core@0.1.0`

## Intento

Rendere il Contextual Copilot Core consumabile da repository distinti senza creare un registry esterno, senza dipendere dalla rete durante build/runtime e senza duplicare l'autorità del sorgente.

TRAMA resta l'unica fonte canonica. I consumer possono conservare una copia vendorizzata **generata e non modificabile a mano** del pacchetto, legata a una versione e a un exact source commit tramite digest SHA-256.

## Meccanismo v1

TRAMA pubblica un manifesto canonico:

`shared/contextual-copilot-core/distribution.json`

Il manifesto dichiara:

- schema version del contratto di distribuzione;
- package name e semantic version;
- repository e exact source commit canonici;
- source path del pacchetto;
- modalità di consumo `vendored-file-package`;
- file distribuibili esatti;
- SHA-256 di ogni file;
- regola `networkRequiredAtBuild = false`;
- regola `externalRegistryRequired = false`.

## Consumer contract

Un consumer conforme:

1. materializza soltanto i file elencati dal manifesto;
2. aggiunge un proprio file di provenienza fuori dal pacchetto importabile o escluso dalla sua superficie pubblica;
3. verifica i digest prima di considerare il vendor snapshot valido;
4. dichiara la dipendenza come `file:` verso il package vendorizzato;
5. non modifica direttamente il vendor snapshot;
6. aggiorna il Core soltanto con una nuova versione/manifesto e una decisione esplicita;
7. non richiede rete né credenziali durante installazione/build una volta che lo snapshot è nel repository.

## Autorità

Il vendoring non crea un fork del Core. Il consumer può creare solo adapter verticali sopra l'API pubblica del pacchetto.

Sono vietati:

- resolver sostitutivi locali;
- patch silenziose dei file vendorizzati;
- capability o policy duplicate nel consumer;
- dipendenza da `main` non pinning;
- URL o branch mobili come fonte di build;
- pubblicazione automatica su registry esterni.

## Compatibilità con Bun

Il meccanismo usa `file:` perché il pacchetto canonico vive in una sottocartella di `trama-ecosistema`. Il consumer non dipende quindi da una Git dependency che presupponga un `package.json` alla radice del repository.

## Superficie canonica v0.1.0

Il set distribuibile resta esattamente:

```text
README.md
index.d.ts
package.json
src/index.js
```

`distribution.json`, test e documenti di governance non fanno parte dell'artefatto importabile.

## Gate

CORE-DIST-01 è qualificabile quando:

- il manifesto è valido e chiuso rispetto ai campi previsti;
- package/version/source commit sono esatti;
- il set file coincide con la superficie v0.1.0;
- tutti i digest coincidono con i file del package presenti sull'exact candidate;
- `npm pack --dry-run --json` continua a produrre soltanto i quattro file importabili;
- Governance CI è PASS sull'exact candidate SHA;
- nessun deploy o publish è stato eseguito.
