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
