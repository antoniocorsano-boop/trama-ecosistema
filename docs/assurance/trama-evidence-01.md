# TRAMA-EVIDENCE-01 — Standard di tracciabilità scientifica, normativa e di assurance

**Versione:** 0.1  
**Data:** 2026-09-23  
**Stato:** PROPOSED / CROSS-PRODUCT / NO_RUNTIME_AUTHORIZATION

## 1. Scopo

Definire un modo uniforme per dimostrare che una decisione, un requisito o una funzionalità TRAMA:

- è coerente con il contesto scientifico dichiarato;
- tiene conto del quadro normativo e istituzionale pertinente;
- distingue chiaramente evidenza, interpretazione e decisione progettuale;
- conserva le prove in un registro separato e verificabile;
- rende immediatamente visibili stato, limiti, gap e data dell'ultima verifica.

Lo standard non certifica conformità giuridica e non sostituisce consulenza legale, DPO, organi collegiali o altre autorità competenti.

## 2. Pattern adottato

TRAMA usa un pattern vicino a pratiche comuni di **assurance case**, **requirements traceability matrix**, **compliance matrix** ed **evidence register**.

La struttura minima è:

```
Claim / requisito
  ↓
Fonte scientifica o normativa
  ↓
Interpretazione applicabile
  ↓
Controllo / verifica
  ↓
Evidence ID
  ↓
Stato + reviewer + data + exact head
```

Questo separa ciò che una fonte dice da ciò che TRAMA decide di fare.

## 3. Quattro livelli separati

### A. Scientific evidence

Risponde a: **«Su quali evidenze pedagogiche, professionali o tecniche si basa questa scelta?»**

Esempi:
- articolo peer-reviewed;
- monografia scientifica;
- revisione sistematica;
- framework di competenza validato;
- standard tecnico non normativo.

Prefisso ID: `SCI-`.

### B. Normative / institutional context

Risponde a: **«Quali obblighi, linee guida, responsabilità o vincoli istituzionali sono pertinenti?»**

Classi:
- `LAW-`: norma cogente;
- `AUTH-`: autorità indipendente / provvedimento / guidance istituzionale;
- `POL-`: linee guida ministeriali o policy istituzionale;
- `STD-`: standard tecnico/gestionale;
- `INT-`: orientamento internazionale non cogente.

Il registro deve sempre specificare **giurisdizione, forza, versione/data e ambito**. Una linea guida non va presentata come legge; una fonte scientifica non va presentata come obbligo.

### C. TRAMA interpretation

Risponde a: **«Che cosa ne deriva per il nostro ecosistema?»**

Ogni derivazione deve essere marcata come:
- `DIRECT`: conseguenza direttamente supportata;
- `ADAPTED`: adattamento a un dominio diverso;
- `DESIGN_RULE`: scelta architetturale/progettuale TRAMA;
- `HYPOTHESIS`: ipotesi da validare.

### D. Verification evidence

Risponde a: **«Come dimostriamo che il requisito è effettivamente rispettato?»**

Esempi:
- test automatizzato;
- screenshot o prova browser;
- schema/validator;
- log o receipt;
- review umana;
- audit exact-head;
- verbale/decisione istituzionale quando pertinente.

Prefisso ID: `EVD-`.

## 4. Assurance Summary obbligatorio

Ogni documento TRAMA che fonda requisiti su evidenza scientifica o contesto normativo **deve** aprirsi con una scheda sintetica:

| Campo | Valore |
| --- | --- |
| Artifact ID | identificativo |
| Scope | superficie / popolazione / processo |
| Scientific basis | VERIFIED / PARTIAL / MISSING / N.A. |
| Normative context | VERIFIED / PARTIAL / MISSING / N.A. |
| Evidence pack | collegamento al registro separato |
| Runtime effect | NONE / PROPOSED / AUTHORIZED |
| Open gaps | numero + sintesi |
| Independent review | stato + exact head |
| Last verified | data |

La scheda serve a **mostrare** lo stato; non contiene tutte le prove.

## 5. Evidence Register separato

Le prove vengono conservate in un file separato, per evitare di rendere il documento principale illeggibile.

Campi minimi per ogni fonte:

| Campo | Significato |
| --- | --- |
| Evidence ID | identificatore stabile |
| Type | SCI / LAW / AUTH / POL / STD / INT / EVD |
| Citation / title | titolo leggibile |
| Authority / publisher | autore o autorità |
| Date / version | versione controllata |
| Jurisdiction / population | dove e per chi vale |
| Force | binding / institutional guidance / standard / research evidence / international guidance |
| Claim supported | quale affermazione supporta |
| Applicability | diretta / adattata / contestuale |
| Source locator | DOI, URL ufficiale o percorso repo |
| Verified on | data verifica |
| Reviewer | review umana/indipendente/automatica |
| Status | VERIFIED / PARTIAL / SUPERSEDED / MISSING |
| Notes / limits | limiti e condizioni |

## 6. Requirements Traceability Matrix

Nel documento progettuale si conserva solo la matrice compatta:

| Req ID | Requisito TRAMA | Source IDs | Derivation | Verification IDs | Status |
| --- | --- | --- | --- | --- | --- |

Regola: **nessun requisito con etichetta “scientificamente fondato” o “normativamente richiesto” senza almeno un Source ID verificabile**.

## 7. Regole linguistiche

Usare formulazioni diverse a seconda della forza della fonte:

- **«richiede / vieta / obbliga»** → solo quando una fonte cogente lo consente;
- **«prevede / stabilisce»** → atto istituzionale nel proprio ambito;
- **«raccomanda / orienta»** → linee guida, standard volontari, UNESCO, Commissione quando non cogente;
- **«evidenzia / suggerisce / riscontra»** → letteratura scientifica;
- **«TRAMA adotta / propone»** → decisione progettuale interna.

Evitare il termine generico **«conforme»** senza specificare a quale requisito e con quale evidenza.

## 8. Stati di assurance

- `VERIFIED`: fonte e applicabilità controllate; evidenza disponibile;
- `PARTIAL`: fonte valida ma applicabilità o verifica incompleta;
- `GAP`: requisito pertinente senza evidenza sufficiente;
- `CONFLICT`: fonti o requisiti in tensione; decisione umana richiesta;
- `SUPERSEDED`: fonte sostituita da versione successiva;
- `N.A.`: non applicabile al perimetro.

Uno stato verde tecnico non può cancellare un gap normativo o scientifico.

## 9. Versionamento e review

Ogni review deve registrare:
- exact head;
- versione/data delle fonti sensibili al tempo;
- evidence IDs controllati;
- gap aperti;
- reviewer;
- decisione PASS / CHANGES REQUIRED.

Un nuovo commit invalida il PASS exact-head precedente secondo il protocollo TRAMA di review freeze.

### Evidenze post-commit e ricevute esterne

Le evidenze che nascono **dopo** la creazione dell'exact head — per esempio workflow CI, review indipendenti e HUMAN REVIEW — non possono essere scritte dentro lo stesso commit senza modificarne lo SHA.

Per evitare una dipendenza circolare:
- il repository contiene il requisito, il registro delle fonti e le evidenze pre-commit;
- CI e review exact-head sono registrate come **ricevute esterne immutabili** nel sistema che le produce (GitHub check, workflow run, review/commento PR);
- l'Assurance Summary nel commit dichiara lo stato `PENDING` per le ricevute post-commit non ancora prodotte;
- la promozione/merge deve verificare che le ricevute esterne si riferiscano esattamente allo SHA candidato;
- non è richiesto un commit solo per copiare nel repository l'ID di una review PASS, perché ciò invaliderebbe il PASS appena ottenuto.

Un registro può mantenere ricevute storiche di head precedenti, purché siano marcate `HISTORICAL` e non usate come verifica positiva dell'head corrente.

## 10. Automazione futura

La prima versione resta documentale. In seguito si può introdurre un manifest machine-readable e un validator che controlli:

- Source ID mancanti o duplicati;
- URL/DOI assenti;
- data di verifica scaduta;
- fonti `SUPERSEDED`;
- requisito senza evidenza;
- uso di `binding` su fonte non cogente;
- review collegata a SHA diverso.

L'automazione deve controllare **tracciabilità e completezza**, non interpretare autonomamente il diritto o la validità scientifica.

## 11. Allineamento a pratiche esterne

Il modello è coerente, senza dichiararne certificazione, con principi ricorrenti in:

- ISO/IEC 42001: sistema di gestione dell'IA, tracciabilità, trasparenza e gestione continua;
- NIST AI RMF: GOVERN, MAP, MEASURE, MANAGE e documentazione dei requisiti legali/regolatori;
- pratiche di quality management e safety/assurance: claims, evidence, traceability e review.

Questi riferimenti informano il metodo; non attribuiscono a TRAMA certificazione ISO o conformità NIST.

## 12. Regola di adozione

Per ogni nuovo documento che introduce requisiti scientifici/normativi:

1. creare Assurance Summary;
2. creare/aggiornare Evidence Register separato;
3. assegnare Source IDs;
4. costruire traceability matrix;
5. verificare forza e ambito di ogni fonte;
6. eseguire review indipendente;
7. solo dopo, se previsto, promuovere il requisito a governance.

