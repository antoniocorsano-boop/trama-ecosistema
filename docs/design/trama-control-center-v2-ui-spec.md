# TRAMA Control Center v2 — UI/UX & Design Specification

**Data:** 24 settembre 2026  
**Stato:** DESIGN TARGET / NO RUNTIME AUTHORIZATION

## 1. Obiettivo visuale

Realizzare una superficie seria, leggibile e distintiva, coerente con il mockup approvato come direzione, evitando l’effetto “dashboard tecnica generica”.

Il design deve comunicare:

- governo;
- chiarezza;
- evidenza;
- dipendenza;
- avanzamento;
- controllo umano.

## 2. Griglia

Desktop target:

- larghezza 1440–1600;
- sidebar 216–232 px;
- contenuto con max-width controllato;
- griglia 12 colonne;
- gutter 16 px;
- spacing scale 4 / 8 / 12 / 16 / 24 / 32.

Mobile:

- singola colonna;
- 12–16 px margini;
- pannelli ordinati per decisione, non per origine tecnica.

## 3. Gerarchia

Ordine desktop:

1. Header + salute dati;
2. Phase Rail R1–R5;
3. KPI sintetici;
4. Matrice maturità;
5. Ecosistema vivo;
6. Attenzione richiesta;
7. Evidenze recenti;
8. Prossime espansioni;
9. Integrità e policy.

## 4. Design token

Famiglie:

- background;
- surface;
- elevated surface;
- border subtle/strong;
- text primary/secondary/muted;
- semantic success;
- semantic warning;
- semantic danger;
- semantic info;
- domain Arena;
- domain Atlas;
- domain Docente OS;
- domain Assurance;
- domain Adoption.

Il colore di dominio non coincide con lo stato.

## 5. Tipografia

Principi:

- massimo 3 livelli di enfasi principali per schermata;
- titoli brevi;
- numeri KPI molto leggibili;
- testo tecnico in monospace soltanto per SHA/ID;
- descrizioni secondarie non inferiori alla soglia di leggibilità definita dal design system.

## 6. Componenti

### Phase Rail
Ogni fase mostra:

- numero;
- nome;
- stato;
- gate principale;
- relazione con fase successiva.

### KPI Card
Mai puramente decorativa. Deve rispondere a una domanda.

Esempi:

- aree mature;
- gate aperti;
- evidenze recenti;
- evidenze stale;
- espansioni candidate.

### Maturity Matrix
Non un heatmap “bella” ma opaca.

Ogni riga mostra:

- ambito;
- livelli;
- livello confermato;
- candidato;
- confidence;
- stato.

Hover/focus o click apre il dettaglio con evidenze.

### Ecosystem Graph
Il nodo centrale TRAMA collega domini e programmi.

Le linee hanno semantica:

- piena = relazione attiva;
- tratteggiata = futura/non autorizzata;
- doppia = authority/binding;
- warning marker = gate.

È sempre disponibile una vista elenco equivalente.

### Attention Panel
Ordina per:

1. blocco di governance;
2. gate umano;
3. gate runtime;
4. regressione;
5. evidenza stale.

### Expansion Panel
Non usa “raccomandato”. Mostra:

- candidato;
- prerequisiti;
- dipendenze;
- stato di eleggibilità.

## 7. Stati visuali

Ogni componente deve supportare:

- loading;
- fresh;
- stale;
- partial;
- empty;
- error;
- blocked;
- offline.

Nessun errore deve essere rappresentato solo con colore rosso.

## 8. Motion

Ammesso:

- comparsa progressiva pannelli;
- transizione apertura drawer;
- highlight di aggiornamento;
- movimento controllato del grafo.

Non ammesso:

- animazioni continue decorative;
- pulsazioni non necessarie;
- effetti che competono con le informazioni.

Respect `prefers-reduced-motion`.

## 9. Specifica visuale eseguibile — Penpot pilot

Penpot è il **candidato preferenziale per il pilot** della specifica visuale eseguibile del Control Center v2.

Non diventa fonte di stato, authority o governance. La fonte canonica resta nel repository TRAMA e negli snapshot governati. Il file Penpot serve a:

- rappresentare componenti e stati;
- verificare layout desktop/mobile/LIM;
- mantenere token e varianti coerenti;
- documentare interazioni;
- favorire la corrispondenza 1:1 con i componenti React;
- consentire workflow design↔code mediante MCP senza introdurre autorità runtime.

Struttura target del file:

- Foundations;
- Tokens;
- Components;
- Desktop 1440;
- Mobile 390;
- LIM 1920;
- States;
- Interaction notes.

I componenti Penpot devono mappare 1:1 ai componenti React principali.

Il pilot MCP procede in due fasi:

1. **read-only**: elenco pagine, componenti, stili/token e ispezione della struttura;
2. **write controllato**: creazione/modifica di token, componenti e viste, con verifica umana prima di qualunque promozione del flusso.

Figma resta utilizzabile come riferimento o import/export visuale quando opportuno, ma non è requisito architetturale del Control Center.

Riferimento operativo: `docs/design/penpot-mcp-pilot.md`.

## 10. Librerie

Scelte target:

- shadcn/ui per composizione e proprietà del codice;
- Radix UI per primitive accessibili;
- Tailwind CSS per token e layout;
- Lucide per iconografia;
- ECharts per grafici e trend;
- XYFlow per il grafo;
- TanStack Table per evidenze;
- Motion per micro-interazioni.

## 11. Criteri di fedeltà al mockup

La review deve verificare:

- densità informativa;
- allineamenti;
- ritmo verticale;
- larghezze pannelli;
- gerarchia;
- contrasto;
- iconografia;
- coerenza delle superfici;
- assenza di overflow;
- comportamento responsive.

Non è richiesto copiare pixel generati dall’immagine. È richiesto ricostruire **lo stesso sistema visuale con componenti reali e dati reali**.

## 12. Visual regression

Baseline obbligatorie:

- desktop 1440 × 1024;
- desktop 1600 × 1000;
- mobile 390 × 844;
- mobile 412 × 915;
- LIM 1920 × 1080.

La review visuale deve distinguere:

- modifica voluta;
- regressione;
- differenza dovuta ai dati.

## 13. Accessibilità visiva

- contrasto AA;
- focus ring non eliminabile;
- stato sempre testuale + visivo;
- target touch adeguati;
- tooltip non essenziali;
- grafici con alternativa testuale/tabellare;
- zoom 200% senza perdita di funzione.

## 14. Linguaggio

Preferire:

- “Attenzione richiesta”;
- “Gate aperto”;
- “Evidenza disponibile”;
- “Livello confermato”;
- “Livello candidato”;
- “Dipendenza”;
- “Non autorizzato”.

Evitare:

- “health score”;
- “success score”;
- “best/worst”;
- gergo DevOps non necessario nella vista strategica.
