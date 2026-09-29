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

## 19. Stato vs gravità

TRAMA MUST distinguish **status** from **severity**.

- **Status** answers: what state is this information/system in?
- **Severity** answers: how much impact does the problem have?

A non-current or partial state is not automatically severe.
A changed source is not automatically critical.
A blocking problem may be severe even if the underlying live observation is fresh.

User-facing components MUST therefore avoid using warning/critical visual language solely because a status is PARTIAL, STALE or DETECTED.

This follows the mature PatternFly distinction between status and severity and prevents false alarm semantics.

## 20. Notification and interruption policy

Status communication MUST be proportional to user impact.

Rules:
- normal state does not generate banners or toasts;
- informational changes remain inline when possible;
- use a prominent banner only when the message affects the page/task as a whole;
- avoid multiple simultaneous global banners; prefer the highest-priority message plus grouped detail;
- dynamic status changes MUST be announced accessibly without stealing focus unless immediate action is required;
- do not repeatedly re-announce unchanged state;
- dismissible notifications MUST NOT hide a still-active blocking condition permanently.

Accessibility:
- use semantic live regions/status roles appropriate to impact;
- reserve assertive interruption for true urgent/blocking conditions;
- status updates that do not change context should be programmatically exposed to assistive technology.

This aligns with W3C status-message guidance and mature notification systems such as GOV.UK and Carbon.

## 21. Empty, loading, unavailable and no-access states

These states MUST remain distinct.

### Loading

Meaning:
> data is being obtained and no result is available yet.

Do not show an error or empty-state message while a request is still pending.

### Empty

Meaning:
> the request completed successfully and there is currently nothing to show.

Example:
> **Nessun aggiornamento da mostrare**  
> Non ci sono cambiamenti recenti che richiedono attenzione.

### Unavailable

Meaning:
> the latest information could not be obtained.

Example:
> **Aggiornamenti non disponibili**  
> Le informazioni verificate restano consultabili.

### No access

Meaning:
> the user is not permitted to see a detail.

Do not represent lack of permission as missing data or system failure.

### Not configured / not enrolled

Meaning:
> a source or feature has not yet been configured.

State what must be done next rather than blaming the user.

These distinctions MUST be represented in E1 prototypes.

## 22. Actionability, responsibility and permissions

Every state that requires action MUST identify:

1. what action is required;
2. who can perform it, when relevant;
3. whether the current user can perform it;
4. what remains possible before the action is completed;
5. the consequence of not acting.

Avoid dead-end warnings.

If the current user cannot perform the action, show a useful next step such as:
- who/which role can intervene;
- where the relevant review is located;
- whether no action is required from the current user.

Buttons MUST describe the action:
- prefer “Verifica le informazioni”;
- avoid generic “OK”, “Continua” or “Risolvi” where the actual action is more specific.

## 23. Change transparency and history

A high-quality state UI MUST answer not only “what is the state now?” but, when relevant, “what changed?”.

For review-required or blocking states, the detail layer SHOULD expose:
- what changed;
- when it was first observed;
- what source is involved;
- whether the change is operational or semantic;
- whether a previous verified state remains usable;
- what review/action occurred afterwards.

The primary UI should summarize the consequence, not dump the technical diff.

History MUST remain separate from current state so old incidents do not appear active.

## 24. Provenance and trust explanation

The primary UI may use concise trust language such as “Informazioni verificate”, but the user MUST be able to inspect why that statement is justified.

Progressive detail SHOULD provide:
- source;
- verification time;
- authority/owner when meaningful;
- current/previous status;
- provenance references;
- technical identifiers only in the technical-detail tier.

Do not use vague confidence percentages unless a governed model actually defines and validates them.

## 25. Localizzazione, tempo e linguaggio

User-facing dates/times MUST respect the user's locale and timezone.

Rules:
- relative time is useful for immediacy (“5 minuti fa”);
- exact local date/time remains available for audit;
- never show a relative time that can be mistaken for a current live observation after reconnect/offline reuse;
- avoid untranslated internal English enums in Italian UI;
- labels, punctuation, capitalization and terminology MUST follow one controlled glossary;
- localization must preserve meaning, not merely translate strings literally.

## 26. Content quality and cognitive accessibility

The copy layer MUST use:
- common words;
- short sentences;
- one idea per sentence where practical;
- short blocks;
- explicit subjects and actions;
- consistent terminology;
- minimal abbreviations;
- no avoidable jargon.

A technical term may appear in the primary UI only when the target user reasonably needs it to act.

Where a technical concept has no simple equivalent, explain the consequence first and expose the term secondarily.

This is consistent with W3C cognitive-accessibility guidance for clear, understandable content.

## 27. Component-role mapping for E1

E1 MUST prototype at least these presentation roles:

| Need | Preferred presentation role |
|---|---|
| normal/current information | inline summary / quiet status |
| supporting context | inline text / disclosure |
| non-blocking uncertainty | inline notice |
| page-wide important condition | single banner |
| action-required condition | prominent action block |
| blocking error | blocking message with clear next action |
| no data | empty state |
| loading | progress/skeleton with accessible status |
| technical detail | expandable detail panel |
| history | timeline/activity view separate from current status |

Exact components are not selected by E0; E1 selects them from the ecosystem design system after comparison with mature libraries.

## 28. Human-use validation protocol

E3 MUST use observable comprehension tasks, not only subjective visual approval.

Minimum tasks for a non-technical participant:
- identify whether reference information is still valid;
- identify whether recent information is complete;
- identify whether action is required;
- identify the next action, if any;
- distinguish “not verified yet” from “error”;
- find technical/source detail only when asked;
- recognize when displayed information is cached/offline.

Minimum acceptance evidence:
- users can answer the three core questions without opening technical details;
- no critical task depends on interpreting color alone;
- uncertainty is not systematically mistaken for failure;
- users do not treat ordinary head/change activity as a blocking problem;
- participants can identify the required action in action-required states;
- screen-reader/keyboard validation covers dynamic status messages and disclosures.

Quantitative thresholds SHOULD be chosen during the E1/E3 test-plan design, not invented in E0 without evidence.

## 29. Extended benchmark baseline

In addition to GitHub, GitLab and Backstage, Stage E SHOULD consult:

- PatternFly status/severity and alert patterns for explicit separation of current state and impact;
- GOV.UK notification guidance for restrained, task-relevant banners;
- W3C WCAG 2.2 / Status Messages and cognitive-accessibility guidance;
- Carbon notification accessibility for keyboard/screen-reader behavior and dynamic messages.

These are benchmark references, not mandatory component libraries.

## 30. Decisione operativa

Stage E non può passare direttamente all'implementazione UI.

La sequenza obbligatoria è:

`E0 communication contract -> E1 visual prototype -> E2 implementation -> E3 human-use validation`.

E1 non può essere considerato completo finché non copre almeno: normal, loading, empty, partial/unavailable, review-required, blocked, no-access e offline/cached state.

Il criterio guida resta:

> **prima il significato per l'utente, poi il dettaglio tecnico.**
