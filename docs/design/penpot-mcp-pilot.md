# TRAMA — Penpot MCP design pilot

**Data:** 24 settembre 2026  
**Stato:** PROPOSED PILOT / NO RUNTIME AUTHORIZATION  
**Perimetro:** TRAMA Control Center v2 — design system, mockup eseguibile, design↔code  
**Authority:** nessuna nuova authority; repository TRAMA e snapshot governati restano canonici.

## 1. Scopo

Valutare Penpot come ambiente visuale principale per TRAMA in sostituzione della dipendenza operativa da Figma, mantenendo:

- specifica visuale ad alta fedeltà;
- componenti e varianti;
- token di design;
- responsive desktop/mobile/LIM;
- corrispondenza 1:1 tra componenti visuali e componenti React;
- workflow MCP per lettura e modifica controllata del file;
- assenza di lock-in architetturale nel prodotto TRAMA.

Il pilot non modifica runtime, authority, dati o governance dell'ecosistema.

## 2. Motivazione

Il requisito non è disporre di un semplice strumento di disegno, ma di una superficie che possa diventare:

1. specifica visuale;
2. design system;
3. prototipo verificabile;
4. ponte design↔code;
5. contesto interrogabile da agenti;
6. riferimento per visual regression.

La dipendenza dal piano gratuito Figma ha mostrato un limite operativo nell'accesso MCP. Il pilot verifica se Penpot consente di mantenere lo stesso livello di integrazione senza rendere lo strumento visuale una fonte autorevole.

## 3. Evidenza tecnica esterna

L'MCP ufficiale Penpot è integrato nel repository principale Penpot e consente a client MCP di:

- leggere struttura, componenti, stili, token, pagine e layer;
- creare o modificare elementi tramite Plugin API;
- supportare workflow design-to-design, code-to-design e design-to-code.

Il percorso corrente dichiarato dalla documentazione Penpot prevede due modalità:

### Remote MCP

- attivazione da Account → Integrations → MCP Server;
- generazione di una chiave MCP;
- URL remoto con `userToken`;
- connessione del client MCP all'endpoint remoto;
- plugin MCP aperto nel file Penpot.

### Local MCP

- Node.js 22.x;
- avvio tramite `npx -y @penpot/mcp@latest`;
- endpoint locale predefinito sulla porta 4401;
- connessione del plugin Penpot al server locale.

Per TRAMA il pilot parte dalla modalità **remote MCP** quando disponibile, perché riduce le parti infrastrutturali. La modalità self-hosted resta un secondo passo.

## 4. Architettura del pilot

```text
Repository TRAMA / snapshot governato
              |
              | specifica + dati di esempio
              v
        Penpot Design File
              |
      +-------+--------+
      |                |
 design review      Penpot MCP
      |                |
      +-------+--------+
              |
              v
      implementazione React
```

Vincoli:

- Penpot non determina lo stato del sistema;
- nessuna evidenza viene promossa da Penpot;
- nessun gate viene chiuso da Penpot;
- nessuna modifica MCP autorizza runtime;
- la sorgente canonica di dati resta lo snapshot TRAMA;
- il file visuale usa dati sintetici o snapshot read-only.

## 5. Struttura del file Penpot

Pagine minime:

1. **Foundations**
   - colore;
   - tipografia;
   - spacing;
   - radius;
   - elevation;
   - focus;
   - stato semantico.

2. **Tokens**
   - surface/background;
   - text;
   - border;
   - semantic success/warning/danger/info;
   - domain Arena/Atlas/Docente OS/Assurance/Adoption.

3. **Components**
   - PhaseRail;
   - MetricCard;
   - StatusBadge;
   - MaturityRow / MaturityMatrix;
   - EvidenceRow;
   - AttentionItem;
   - ExpansionItem;
   - EcosystemNode;
   - DependencyRow;
   - ContextHelp;
   - MobileBottomNav.

4. **Desktop 1440**
   - home strategica;
   - vista tecnica.

5. **Mobile 390**
   - home mobile-first;
   - bottom navigation;
   - bottom sheet contestuale;
   - card orizzontali dove richiesto.

6. **LIM 1920**
   - vista proiettabile e leggibile a distanza.

7. **States**
   - loading;
   - fresh;
   - stale;
   - partial;
   - empty;
   - blocked;
   - error;
   - offline.

8. **Interaction notes**
   - hover/focus/tap;
   - progressive disclosure;
   - drawer/bottom sheet;
   - grafi e viste equivalenti;
   - reduced motion.

## 6. Piano di collaudo MCP

### P0 — connessione

- account Penpot;
- MCP abilitato;
- server URL ottenuto;
- plugin MCP connesso al file.

**PASS** se client e plugin risultano connessi senza modifica del file.


#### Procedura P0 — remote MCP ufficiale

1. In Penpot aprire **Your account → Integrations → MCP Server** e abilitare lo stato.
2. Generare la **MCP key**. È mostrata una sola volta e va trattata come una credenziale.
3. Copiare il **server URL** fornito da Penpot. Nel SaaS ufficiale ha forma `https://design.penpot.app/mcp/stream?userToken=...`.
4. Configurare un client MCP compatibile con quell'URL. La documentazione ufficiale propone anche `npx -y add-mcp -g -n penpot <URL>`.
5. Aprire il file `TRAMA — Control Center v2`.
6. Nel file Penpot usare **File → MCP Server → Connect**.
7. Eseguire solo test read-only iniziali.

Vincoli di sicurezza:

- non inserire la MCP key nel repository;
- non incollare URL contenenti `userToken` in issue, PR, log o screenshot;
- se la chiave viene esposta, rigenerarla immediatamente;
- il contesto MCP segue la **pagina Penpot attualmente in focus**;
- una sola scheda browser può essere la scheda MCP attiva alla volta.

**Nota operativa ChatGPT:** al momento non è disponibile nel catalogo collegato a questa conversazione un connettore Penpot diretto. Il collaudo P0/P1 richiede quindi un client MCP compatibile configurato dall'utente; una volta disponibile un connettore Penpot in ChatGPT, il pilot potrà essere eseguito direttamente da questa chat.

### P1 — read-only

Prompt di prova:

- lista pagine;
- lista componenti;
- lista token/stili;
- analisi della struttura;
- rilevazione di naming incoerente.

**PASS** se l'agente restituisce dati corrispondenti al file senza modifiche.

### P2 — write minimo

Operazioni:

- creare un token di prova in namespace pilot;
- creare un componente di prova;
- rinominare un layer di prova;
- verificare undo e tracciabilità.

**PASS** se le modifiche sono visibili, controllabili e non toccano elementi fuori dal perimetro.

### P3 — screen composition

Comporre una vista desktop e una mobile usando componenti reali del file.

**PASS** se:

- niente overflow;
- mobile non è desktop compresso;
- gerarchia coerente con la UI spec;
- componenti riusabili;
- mapping React identificabile.

### P4 — design↔code

Verificare che i componenti possano essere tradotti in specifiche utili al codice:

- token;
- struttura;
- dimensioni;
- stati;
- comportamento responsive;
- note di interazione.

**PASS** se il passaggio non richiede ricostruzione manuale del modello visuale.

## 7. Criteri di successo

Il pilot è candidato alla promozione solo se tutti i seguenti punti sono verificati:

- nessun limite MCP incompatibile con l'uso ordinario;
- connessione stabile;
- lettura e scrittura controllata del file;
- token e componenti maturi;
- responsive modellabile senza workaround strutturali;
- design visualmente comparabile alla UI reale;
- esportabilità e interoperabilità adeguate;
- nessuna nuova authority;
- nessun dato sensibile necessario;
- flusso comprensibile e ripetibile;
- costo operativo pari a zero nella configurazione scelta per il pilot.

## 8. Rischi e punti aperti

### MCP remoto

Da verificare sul piano gratuito effettivamente usato:

- disponibilità dell'opzione Account → Integrations → MCP Server;
- eventuali limiti di quota;
- stabilità della sessione;
- compatibilità del client disponibile.

### Self-hosted multi-user

È presente almeno un issue aperto recente relativo alla propagazione del `userToken` nel flusso plugin in modalità multi-user. Per questo il pilot non parte dal self-hosted multi-user.

### Migrazione da Figma

Non si assume una migrazione automatica completa. Il file Figma esistente resta riferimento fino a quando:

- Penpot riproduce le viste necessarie;
- i componenti sono ricostruiti;
- il responsive è verificato;
- il pilot riceve review umana.

## 9. Strategia di adozione

Sequenza:

1. creare account/workspace Penpot;
2. creare file `TRAMA — Control Center v2`;
3. attivare MCP;
4. eseguire P0/P1;
5. costruire Foundations/Tokens;
6. costruire Components;
7. ricostruire Desktop 1440;
8. ricostruire Mobile 390;
9. collaudo visuale;
10. valutazione design↔code;
11. decisione umana.

Fino al punto 11:

**PENPOT = PILOT TOOL / NON CANONICAL / NO RUNTIME AUTHORITY.**

## 10. Decisione richiesta al termine

La review umana finale deve scegliere una sola delle seguenti:

- **ADOPT** — Penpot diventa ambiente visuale preferenziale TRAMA;
- **DUAL** — Penpot preferenziale, Figma mantenuto solo per interoperabilità;
- **REVISE** — pilot da correggere;
- **STOP** — nessuna adozione.

Nessuno di questi esiti è automatico.
