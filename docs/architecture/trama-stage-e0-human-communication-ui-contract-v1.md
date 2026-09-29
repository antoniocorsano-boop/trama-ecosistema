# TRAMA Stage E0 — Human Communication & UI Contract v1

**Stato:** PROPOSED / GOVERNANCE-ONLY / NO RUNTIME AUTHORIZATION  
**Data:** 2026-09-29  
**Perimetro:** TRAMA Control Center · Project Knowledge v2  
**Obiettivo:** tradurre correttamente lo stato tecnico in informazioni comprensibili, pulite e azionabili per utenti anche non tecnici.

## 1. Scopo

Stage E0 definisce il contratto di comunicazione e interazione che precede qualsiasi implementazione UI dello Stage E.

Il problema non è semplicemente “mostrare tre stati”. Il sistema interno distingue conoscenza governata, osservazione live e drift semantico; la UI deve tradurre queste dimensioni in un linguaggio che una persona non tecnica possa comprendere senza conoscere repository, SHA, overlay, semantic drift o promotion.

La vista primaria deve consentire di rispondere rapidamente a tre domande:

1. **Posso fidarmi di queste informazioni?**
2. **Sono aggiornate?**
3. **Devo fare qualcosa?**

Se per rispondere serve conoscere terminologia DevOps o interna a TRAMA, la UI non è qualificata.

## 2. Principio fondante

**Terminologia interna != terminologia utente.**

Gli identificatori del dominio tecnico restano nei contratti, nei log e nei dettagli per specialisti. La UI primaria usa un vocabolario controllato, naturale e coerente.

Esempi:

| Stato interno | Linguaggio utente raccomandato |
|---|---|
| governedKnowledgeStatus=CURRENT | Informazioni di riferimento verificate |
| liveObservationStatus=FRESH | Controllato di recente |
| liveObservationStatus=PARTIAL | Alcuni aggiornamenti non sono disponibili |
| semanticDriftStatus=NONE | Nessuna informazione aggiuntiva da mostrare |
| semanticDriftStatus=DETECTED | Alcune informazioni recenti non sono ancora verificabili |
| semanticDriftStatus=REVIEW_REQUIRED | Alcune informazioni sono cambiate e devono essere verificate |
| effectiveContextStatus=DEGRADED | Informazioni parzialmente aggiornate |
| effectiveContextStatus=BLOCKED | Serve una verifica prima di continuare |

Queste formulazioni sono esempi normativi di significato, non stringhe obbligatorie immutabili. Le stringhe finali devono essere validate con test d'uso.

## 3. Benchmark di riferimento

Stage E0 adotta pattern osservati in prodotti maturi, senza copiarne la terminologia tecnica.

### GitHub

GitHub Status Checks separa stato del controllo, conclusione e dettaglio. Lo scopo è permettere a revisori e maintainer di capire se un cambiamento è pronto, ancora in esecuzione o richiede attenzione.

Riferimento:
- https://docs.github.com/en/pull-requests/reference/status-checks

GitHub Deployments mantiene inoltre una cronologia di stati e distingue lo stato corrente dal dettaglio/descrizione.

Riferimento:
- https://docs.github.com/en/rest/deployments/statuses

**Pattern adottato in TRAMA:** sintesi dello stato prima, dettaglio dopo; non esporre l'identificatore tecnico come messaggio principale.

### GitLab

GitLab Environments e Deployments separa ambiente corrente, cronologia, stato e approvazioni. Le deployment approvals mantengono distinta la condizione “bloccato/in attesa di approvazione” dallo stato tecnico del deployment.

Riferimenti:
- https://docs.gitlab.com/ci/environments/
- https://docs.gitlab.com/ci/environments/deployments/
- https://docs.gitlab.com/ci/environments/deployment_approvals/

**Pattern adottato in TRAMA:** distinguere “informazione”, “incertezza”, “richiede azione” e “blocco”. Non usare un unico semaforo che comprima dimensioni differenti.

### Backstage

Backstage distingue l'entità dal suo stato di elaborazione. In caso di errore di ingestione può preservare il precedente dato valido, mentre lo stato segnala il problema di aggiornamento.

Riferimento:
- https://backstage.io/docs/features/software-catalog/well-known-statuses/

Backstage Entity Presentation traduce entity reference tecnici in nomi leggibili dall'utente e può lasciare il riferimento grezzo nel dettaglio.

Riferimento:
- https://backstage.io/docs/features/software-catalog/entity-presentation/

**Pattern adottato in TRAMA:** preservare l'ultimo contenuto governato valido quando l'osservazione recente è incompleta; mostrare nomi e significati leggibili, non identificatori grezzi.

## 4. Modello mentale dell'utente

La UI primaria NON presenta:

- Governed Core;
- Live Overlay;
- EffectiveProjectContext;
- semantic drift;
- repository head;
- exact SHA;
- promotionRequired;
- enum tecnici come CURRENT / FRESH / DEGRADED.

La UI primaria presenta invece tre concetti comprensibili.

### 4.1 Informazioni di riferimento

Significato:
> ciò che è stato verificato e costituisce la base affidabile.

Esempio:
> **Informazioni verificate**  
> Le informazioni di riferimento restano valide.  
> Verificate il 29 settembre.

### 4.2 Aggiornamenti recenti

Significato:
> ciò che il sistema ha osservato più recentemente e che può cambiare rapidamente.

Esempio:
> **Aggiornamenti**  
> Controllati pochi minuti fa.  
> Nessuna modifica che richieda attenzione.

Quando non completamente disponibili:
> **Aggiornamenti parziali**  
> Puoi continuare a consultare le informazioni verificate; alcuni aggiornamenti recenti non sono ancora disponibili.

### 4.3 Da verificare

Questa sezione appare solo quando necessaria.

Caso non verificabile:
> **Da verificare**  
> Alcune informazioni recenti non sono ancora state verificate.

Caso di cambiamento significativo:
> **Da verificare**  
> Alcune informazioni sono cambiate e devono essere controllate prima di essere considerate confermate.

Non usare “errore” se il sistema ha soltanto evidenza insufficiente.

## 5. Gerarchia informativa

Ordine della vista primaria:

1. **messaggio sintetico complessivo**, massimo due frasi;
2. **eventuale azione richiesta**, se presente;
3. **informazioni di riferimento**;
4. **aggiornamenti recenti**;
5. **eventuale sezione da verificare**;
6. **Dettagli tecnici**, progressivamente espandibili.

Il livello tecnico non deve essere necessario per capire lo stato operativo.

## 6. Regola del silenzio

**Il normale non ha bisogno di rumore.**

Quando:
- conoscenza governata valida;
- osservazione live disponibile;
- nessun semantic drift;
- nessuna azione richiesta;

la UI non deve accumulare badge verdi.

È sufficiente una comunicazione neutra e compatta, oppure nessun richiamo particolare.

Gli stati visivamente prominenti sono riservati a:
- azione richiesta;
- informazione non verificabile;
- blocco;
- cambiamento rilevante.

## 7. Stato, spiegazione, azione

Ogni segnalazione non normale deve rispondere a tre campi concettuali:

1. **Cosa succede?**
2. **Cosa significa per me?**
3. **Devo fare qualcosa?**

Esempio:

> **Alcuni aggiornamenti non sono disponibili**  
> Le informazioni verificate restano consultabili.  
> Non è richiesta alcuna azione.

Oppure:

> **Serve una verifica**  
> Una fonte di riferimento è cambiata.  
> Verifica le informazioni prima di procedere con l'azione indicata.

## 8. Tempo e freschezza

I timestamp ISO non appartengono alla vista primaria.

Preferire:
- “Controllato pochi minuti fa”;
- “Verificato oggi alle 08:20”;
- “Ultimo controllo ieri”;
- “Non è stato possibile completare l'ultimo controllo”.

Il dettaglio tecnico può esporre:
- governedAsOf;
- liveObservedAt;
- exact timestamp UTC;
- provenance.

Il tempo relativo non deve nascondere ambiguità oltre una soglia ragionevole; deve essere possibile accedere al timestamp esatto.

## 9. Colore, icone e accessibilità

Il significato NON deve dipendere soltanto dal colore.

Ogni stato rilevante deve avere:
- testo comprensibile;
- icona con significato coerente;
- semantica accessibile;
- focus e ordine di lettura corretti;
- testo alternativo/label accessibile quando necessario.

Il colore è un rinforzo, non il vettore unico del significato.

Evitare il pattern “tutto verde / giallo / rosso” come unico riassunto del sistema.

## 10. Dettagli tecnici progressivi

Il pannello **Dettagli tecnici** può mostrare:

- repository;
- SHA/head;
- PR;
- workflow;
- governedAsOf;
- liveObservedAt;
- semantic anchor;
- sourceRefs/provenance;
- stato interno e reason code.

Queste informazioni non devono contaminare la vista primaria.

Il dettaglio tecnico deve essere:
- espandibile;
- copiabile;
- stabile nei nomi;
- utile a revisori e sviluppatori;
- non necessario per il normale uso.

## 11. Distinzione fra problema, incertezza e aggiornamento

TRAMA deve rappresentare esplicitamente tre categorie diverse.

### Aggiornamento

Qualcosa è cambiato operativamente.

Non implica errore né necessità di review.

### Incertezza

Il sistema non dispone di evidenza sufficiente per confermare lo stato più recente.

Non deve essere presentata come errore.

### Problema / blocco

Una condizione impedisce una decisione o un'azione specifica.

Deve indicare chiaramente:
- cosa è bloccato;
- perché;
- quale azione può sbloccarlo.

## 12. Mapping normativo iniziale

| Condizione tecnica | Trattamento UI primario |
|---|---|
| CURRENT + FRESH + NONE + USABLE | Nessun allarme; stato normale e compatto |
| CURRENT + PARTIAL + DETECTED + DEGRADED | “Informazioni parzialmente aggiornate” |
| CURRENT + FRESH + REVIEW_REQUIRED + USABLE | “Alcune informazioni sono cambiate e devono essere verificate” |
| CURRENT + UNAVAILABLE + DETECTED + DEGRADED | “Ultimo controllo non disponibile; le informazioni verificate restano consultabili” |
| UNKNOWN + PARTIAL + DETECTED + BLOCKED | “Serve una verifica prima di continuare” |

Questa tabella non autorizza l'implementazione automatica di testi senza validazione E0/E1.

## 13. Anti-pattern vietati

Non usare nella vista primaria:

- “semantic drift detected”;
- “overlay stale”;
- “repository head mismatch”;
- SHA come titolo;
- “promotion required”;
- “CURRENT / FRESH / DEGRADED” come copy utente;
- semaforo unico per tutte le dimensioni;
- rosso per semplice mancanza di evidenza;
- messaggi di errore senza conseguenza/azione esplicitata;
- timestamp ISO come informazione principale;
- badge verdi ridondanti quando tutto è normale.

## 14. Responsive e PWA

Lo stesso modello comunicativo deve funzionare su desktop e mobile.

Mobile:
- sintesi e azione prioritarie;
- una sezione per volta;
- dettagli tecnici collassati;
- nessun overflow orizzontale necessario per capire lo stato;
- target touch e focus conformi al design system.

PWA/offline:
- distinguere chiaramente “ultimo dato disponibile” da “dato appena verificato”;
- non trasformare un dato cache in un dato live;
- indicare quando l'ultimo controllo non è stato possibile.

## 15. Sequenza Stage E

### E0 — Human Communication & Interaction Contract

Questa specifica:
- vocabolario;
- modello mentale;
- gerarchia;
- mapping;
- benchmark;
- accessibility baseline;
- acceptance criteria.

Nessun runtime.

### E1 — Visual prototype

Prototipo realistico desktop/mobile:
- stato normale;
- aggiornamenti parziali;
- verifica richiesta;
- blocco;
- dettaglio tecnico;
- offline/stale.

### E2 — Implementation

Componenti e integrazione reale con EffectiveProjectContext.

### E3 — Human-use validation

Test con utenti non necessariamente tecnici.

## 16. Criteri di accettazione E0/E1

Una persona non tecnica, senza spiegazioni preventive, deve riuscire a determinare:

1. se le informazioni di riferimento sono affidabili;
2. se gli aggiornamenti sono recenti o incompleti;
3. se è richiesta una sua azione;
4. cosa resta comunque utilizzabile;
5. dove trovare i dettagli, se desiderati.

Ulteriori criteri:
- nessuna dipendenza dal colore;
- nessun termine tecnico necessario alla comprensione primaria;
- differenza fra incertezza ed errore chiaramente percepibile;
- desktop e mobile semanticamente equivalenti;
- ultimo dato valido preservato e riconoscibile;
- il normale non genera rumore visivo;
- nessuna UI crea nuova authority.

## 17. Regola di benchmark permanente

Per ogni pattern UI significativo di Stage E:

1. verificare almeno un riferimento maturo pertinente;
2. documentare il pattern osservato;
3. dichiarare l'adattamento TRAMA;
4. motivare eventuali deviazioni;
5. preferire pattern consolidati rispetto a soluzioni locali non validate.

GitHub, GitLab e Backstage sono baseline di confronto, non design da copiare letteralmente.

## 18. Non-goals

E0 non:
- attiva il Live Overlay;
- autorizza polling;
- modifica authority;
- approva ADR;
- abilita promotion;
- introduce GitHub App;
- definisce estetica finale;
- sostituisce la human-use validation.

## 19. Decisione operativa

Stage E non può passare direttamente all'implementazione UI.

La sequenza obbligatoria è:

`E0 communication contract -> E1 visual prototype -> E2 implementation -> E3 human-use validation`.

Il criterio guida resta:

> **prima il significato per l'utente, poi il dettaglio tecnico.**
