# TRAMA Control Center v2 — View Architecture & Progressive Disclosure

**Data:** 24 settembre 2026  
**Stato:** PRODUCT / UX ANALYSIS — GOVERNED DESIGN INPUT  
**Ambito:** Control Center v2, viste successive a CC2-F2

## Principio

La Home del Control Center non deve diventare una dashboard onnivora.

Il Control Center deve usare **progressive disclosure**:

- Home = orientamento;
- viste specialistiche = decisione, capability, evidenze, dipendenze, integrità;
- drill-down = dettaglio tecnico solo quando serve.

Obiettivo: ridurre rumore, scroll e ripetizione, mantenendo leggibile il rapporto tra stato, evidenza, authority e decisione umana.

## Vista 1 — Decisioni richieste

Domanda: **cosa richiede una decisione umana adesso?**

Mostra soltanto:
- HUMAN REVIEW;
- gate bloccanti;
- promotion decision;
- runtime authorization;
- conflitti di governance.

Ogni elemento deve indicare:
- perché serve una decisione;
- capability interessata;
- exact head / evidenza;
- cosa cambia con l’approvazione;
- cosa resta esplicitamente non autorizzato.

Nessun rumore CI non azionabile.

## Vista 2 — Mappa dell’ecosistema

Domanda: **come sono collegate le parti e quale relazione è autorizzata?**

Nodi:
- TRAMA;
- Arena;
- Atlas;
- Docente OS;
- programmi/capability quando utile.

Relazioni visualmente distinte:
- authority;
- data flow;
- publication;
- validation;
- dependency;
- FUTURE_NOT_AUTHORIZED.

Ogni edge deve poter aprire il relativo contratto, gate, evidenza e stato.

Deve esistere una vista elenco equivalente accessibile.

## Vista 3 — Capability

Domanda: **cosa sa realmente fare oggi l’ecosistema?**

La vista parte dalle capability, non dai repository.

Esempi:
- ECO-01;
- ECO-02/P1;
- R3-F0;
- EC-01;
- TRAMA-PW-01;
- Material Studio;
- DOS-A1.

Per ciascuna:
- owner;
- state;
- maturity;
- runtime state;
- dependencies;
- gate;
- evidence;
- ultima modifica significativa.

## Vista 4 — Evidence Explorer

Domanda: **su quali evidenze si basa lo stato dichiarato?**

Filtri:
- dominio;
- capability;
- evidence type;
- freshness;
- exact head;
- PASS / FAIL / PARTIAL.

Anomalie evidenziate:
- evidenza scaduta;
- evidenza non bound;
- evidenza insufficiente rispetto al livello dichiarato;
- mismatch tra capability e set evidenziale.

## Vista 5 — Gate & Dependency Impact

Domanda: **cosa blocca cosa?**

Rappresentazione:
- causa;
- gate;
- capability bloccata;
- espansioni dipendenti;
- decision authority.

Esempio:
`GATE-R3-F0-EXIT → R3-P2 / R3-P5`.

## Vista 6 — Percorso operativo

Domanda: **dove siamo, cosa viene dopo e cosa non va ancora fatto?**

Deve riflettere la sequenza canonica, non creare una roadmap concorrente.

Mostra:
- attività corrente;
- prossimo gate;
- prossimo incremento;
- defer espliciti;
- dipendenze non soddisfatte.

## Vista 7 — Cronologia governata

Domanda: **come siamo arrivati allo stato attuale?**

Timeline semantica, non log GitHub:
- human review;
- merge;
- ADR approval;
- gate PASS;
- capability promotion;
- runtime authorization;
- deprecation/supersession.

Ogni evento deve avere provenienza.

## Vista 8 — Integrità dell’ecosistema

Domanda: **ci sono incoerenze tra fonti, stato ed evidenze?**

Controlli:
- STATUS vs snapshot;
- roadmap vs capability;
- gate PASS senza evidence;
- dependency verso capability inesistente;
- runtime attivo senza autorizzazione;
- stale evidence;
- documento canonico mancante;
- reference non risolvibili.

La vista non produce un overall score.

Output:
- nessuna incoerenza;
- oppure elenco puntuale delle incoerenze con provenienza.



## Vista stakeholder — Assurance & Quality

Domanda: **quanto è affidabile, governato e verificato il prodotto rispetto ai vincoli che interessano chi deve adottarlo o autorizzarne l’uso?**

Questa vista è destinata a soggetti che non devono leggere PR, SHA o dettagli di implementazione per comprendere il livello di qualità del sistema.

Stakeholder principali:
- dirigente scolastico;
- DSGA / funzioni organizzative quando pertinenti;
- DPO / referente privacy;
- responsabile sicurezza o referente tecnico;
- animatore digitale / team innovazione;
- referente inclusione/accessibilità;
- organi di governance dell’istituto;
- partner o valutatori esterni.

### Principio fondamentale

La vista non assegna un unico “quality score” e non dichiara conformità o certificazioni non dimostrate.

Deve distinguere almeno:

1. **vincolo / requisito applicabile**;
2. **stato di governance**;
3. **evidenza tecnica disponibile**;
4. **review umana / istituzionale**;
5. **eventuale attestazione o certificazione esterna**;
6. **limiti e questioni aperte**.

### Domini di assurance

#### Privacy & protezione dati

Mostra in forma comprensibile:
- presenza/assenza di account studente;
- presenza/assenza di tracking individuale;
- minimizzazione dei dati;
- confini tra Arena, Atlas e Docente OS;
- flussi di dati autorizzati e non autorizzati;
- persistenza e località dei dati quando governate;
- eventuali DPIA, registri, valutazioni o review pertinenti;
- questioni ancora da validare con DPO o istituto.

La vista deve distinguere chiaramente:
- **privacy-by-design evidence**;
- **policy/contract evidence**;
- **institutional/legal review**.

Nessun automatismo può dichiarare “GDPR compliant” come conclusione generale.

#### Normativa scolastica e governance

Mostra:
- fonti normative censite;
- contratti di dominio derivati;
- ADR approvate;
- decisioni istituzionali richieste;
- elementi ancora `SOURCE_REFERENCE`, `DOMAIN_GOVERNED`, `HUMAN_REVIEWED` o `NOT_CERTIFIED`.

La presenza di una fonte normativa non equivale automaticamente a validazione legale dell’intero prodotto.

#### Accessibilità

Mostra:
- target WCAG;
- gate automatici;
- HVA/manual review;
- superfici verificate;
- superfici non ancora verificate;
- browser/device coverage;
- eventuali audit esterni.

#### Usabilità e qualità dell’esperienza

Mostra:
- Human Validation / HVA;
- test con casi reali;
- responsive/mobile/LIM;
- PWA/offline;
- perceptible writes;
- tempi/performance quando misurati;
- regressioni visuali;
- esiti di test con utenti o docenti.

L’esito deve essere espresso come evidenza osservata, non come giudizio assoluto di “buona usabilità”.

#### Sicurezza tecnica

Mostra:
- security gates;
- dependency/security scanning;
- ASVS o framework equivalente quando effettivamente applicato;
- runtime canary;
- release contract;
- vulnerabilità note/non risolte;
- limiti della copertura.

#### Affidabilità operativa

Mostra:
- stato canary/beta;
- incidenti/regressioni;
- rollback/restore test;
- freshness delle evidenze;
- dipendenze esterne;
- stato PWA/offline;
- continuità del servizio quando misurata.

#### Certificazioni, attestazioni e riferibilità esterna

La UI deve distinguere tre categorie:

- **Evidence-backed claim** — proprietà dimostrata da test o documento interno;
- **Independent assessment** — valutazione di terza parte documentata;
- **Formal certification** — certificazione rilasciata da soggetto competente, con ente, standard, ambito, versione, data di rilascio e scadenza.

Non utilizzare il termine “certificato” quando esiste soltanto un test automatico, una review interna o una dichiarazione progettuale.

### Modello di presentazione

Per ogni dominio di assurance:

- **Requisito / obiettivo**
- **Stato**
- **Copertura**
- **Evidenze**
- **Ultima verifica**
- **Chi ha verificato**
- **Scadenza / freshness**
- **Limiti**
- **Azioni ancora richieste**

Stati consentiti, ad esempio:
- Documentato
- Implementato
- Verificato
- Verificato da terza parte
- Certificato esternamente
- Parziale
- Da verificare
- Non applicabile
- Bloccato

### Vista dirigente scolastico

Per il dirigente la vista deve rispondere in pochi secondi a domande come:

- quali vincoli sono coperti?
- quali sono ancora aperti?
- quali evidenze esistono?
- quali richiedono decisione dell’istituto?
- quali richiedono DPO, RSPP, referente accessibilità o altro soggetto competente?
- cosa è stato testato realmente e su quale versione?
- quali claim non possono ancora essere fatti?

Il dettaglio tecnico resta disponibile in drill-down, ma non è il livello primario.

### Vista assurance specialistica

Dalla vista stakeholder deve essere possibile aprire un livello più tecnico per:
- privacy;
- accessibility;
- security;
- usability;
- normative assurance;
- operational reliability;
- external certification registry.

### Registro assurance

Il modello dati dovrà prevedere un registro strutturato con almeno:
- `requirementId`;
- `domain`;
- `claimType`;
- `scope`;
- `status`;
- `evidenceRefs`;
- `reviewAuthority`;
- `assessor`;
- `standardRef`;
- `versionRef`;
- `verifiedAt`;
- `expiresAt`;
- `limitations`;
- `externalCertificateRef` quando realmente esistente.

Questo registro dovrà rimanere separato dalla maturity del prodotto: un livello di maturità elevato non equivale automaticamente a conformità normativa o certificazione.


## Viste specialistiche successive

### Adoption readiness
Preparazione al pilota d’istituto:
- prerequisiti;
- documentazione;
- readiness operativa;
- gap di formazione;
- supporto;
- responsabilità.

### Design / UX assurance
Per Arena, Atlas e Docente OS:
- responsive;
- PWA;
- WCAG;
- browser evidence;
- visual regression;
- HVA;
- perceptible writes;
- qualità delle superfici.

## Sequenza proposta

1. **CC2-F2 — Home snapshot-first**
2. **CC2-F3 — Decisioni & Gate**
3. **CC2-F4 — Capability + Ecosystem Map**
4. **CC2-F5 — Evidence Explorer + Integrity**
5. **CC2-F6 — Timeline + Operational Path**

Le viste Adoption readiness e Design/UX assurance possono essere aggiunte quando le fonti evidenziali sottostanti sono mature.

## Regole UX trasversali

- evitare viste troppo lunghe;
- nessun duplicato informativo tra Home e drill-down;
- ogni pannello deve rispondere a una domanda precisa;
- progressive disclosure;
- mobile-first e LIM-aware;
- stato sempre testuale oltre al colore;
- nessuna metrica decorativa;
- nessun overall score;
- nessun dato o pulsante che suggerisca authority non posseduta;
- Control Center sempre READ_ONLY.

## Decisione di design

La Home resta una superficie di orientamento.

Le viste successive diventano superfici specializzate e interrogabili. Questo mantiene il Control Center utile sia a livello strategico sia operativo senza trasformarlo in una dashboard tecnica generica o in una copia dei repository.
