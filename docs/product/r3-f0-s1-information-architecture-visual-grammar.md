# R3-F0/S1 — Information Architecture + Visual Grammar

**Stato:** UNDER_REVIEW / NO_RUNTIME  
**Parent:** R3-F0 / ATLAS-F0  
**Prodotto interessato:** Atlas  
**Autorità:** TRAMA governa lo slice; Arena resta l'autorità curricolare; Atlas governa identità/versione/stato delle proprie risorse e pubblicazioni; Docente OS governa contesto professionale e decisione docente.

## Problema

Atlas deve diventare un atlante integrale del curricolo, leggibile da pubblico, studenti e docenti, senza assumere la forma di una libreria di card o di una dashboard generica.

Prima di realizzare componenti e prototipi occorre fissare una struttura informativa stabile e una grammatica visuale che associ ogni relazione educativa alla rappresentazione più adatta.

## Confini

Questo incremento:

- definisce architettura dell'informazione, gerarchia, percorsi e regole visuali;
- usa soltanto contesto non identificante;
- non introduce autenticazione, account, profili, tracking o dati personali studenti;
- non introduce runtime cross-product;
- non autorizza nuove dipendenze frontend;
- non modifica i contratti Arena → Docente OS o Docente OS → Atlas;
- non attiva DOS-A1;
- non implementa Officina materiali.

## 1. Modello informativo pubblico

### Navigazione primaria

1. **Curricolo** — comprendere struttura, progressione, nuclei e obiettivi.
2. **Percorsi** — seguire sequenze didattiche e collegamenti tra obiettivi, lezioni e risorse pubblicabili.
3. **Risorse** — cercare materiali e oggetti di apprendimento Atlas.
4. **Esplora** — navigare relazioni, prerequisiti, raccordi e mappe.

Lo **Student Learning Hub** è una superficie contestuale. Non diventa una quinta radice della navigazione.

### Entità visibili

- Disciplina
- Annualità
- Nucleo
- Obiettivo
- Evidenza curricolare/didattica non individuale
- Percorso
- Lezione pubblicabile
- Risorsa Atlas
- Relazione
- Provenienza/versione

In S1, **Evidenza** indica esclusivamente una evidenza curricolare/didattica pubblicabile e non individuale (esempio di prestazione, prodotto, traccia o manifestazione attesa dell'apprendimento). Non indica valutazioni, esiti, osservazioni o dati riferibili a un singolo studente.

Le entità tecniche interne non devono emergere nell'interfaccia primaria.

## 2. Gerarchia di navigazione

### Curricolo

`Curricolo → Disciplina → Annualità → Nucleo → Obiettivo → Evidenze/Risorse`

Regole:

- la progressione tra annualità deve essere sempre raggiungibile;
- il breadcrumb descrive il percorso informativo, non identificativi tecnici;
- versione e provenienza sono disponibili tramite disclosure;
- Arena è indicata come fonte curricolare quando serve, senza dominare la pagina.

### Percorsi

`Percorsi → Tema/Sequenza → Tappe → Obiettivi collegati → Risorse`

Una sequenza non crea una seconda struttura curricolare: collega contenuti Atlas a riferimenti Arena.

### Risorse

`Risorse → Filtri semantici → Risorsa → Relazioni curricolari`

Filtri ammessi in R3-F0/S1:

- disciplina;
- annualità;
- tipo di risorsa;
- nucleo/tema;
- stato editoriale pubblico.

Nessun filtro usa identità personale.

### Esplora

`Esplora → Vista → Nodo selezionato → Relazioni → Dettaglio`

Viste iniziali:

- Progressione;
- Prerequisiti;
- Interdisciplinarità;
- Percorso collegato;
- Elenco equivalente.

## 3. Student Learning Hub

Ingresso tramite contesto non identificante e minimizzato:

- grado/annualità;
- disciplina;
- eventuale sezione soltanto se indispensabile alla selezione di contenuti pubblici;
- data soltanto se indispensabile a distinguere lezioni pubblicate.

Viste:

- **Lezioni** — sequenza cronologica/pubblicata;
- **Obiettivi** — accesso per ciò che si sta imparando.

Le due viste devono mostrare lo stesso dominio informativo con ordinamenti diversi, senza creare duplicazioni autorevoli.

## 4. Visual Grammar of Curriculum — v0.1

| Relazione educativa | Forma primaria | Forma alternativa/accessibile | Da evitare come default |
| --- | --- | --- | --- |
| disciplina → nucleo → obiettivi | albero/outline | elenco gerarchico | griglia di card |
| progressione per annualità | ladder/percorso verticale | tabella/elenco ordinato | rete libera |
| sequenza didattica | timeline | elenco numerato | card scollegate |
| obiettivi × classi | matrice | tabella lineare | timeline |
| raccordi interdisciplinari | rete controllata | elenco per relazione | grafo denso senza filtri |
| prerequisiti | grafo orientato | elenco “prima di / dopo” | semplice colore |
| obiettivo → lezioni → materiali | percorso collegato | outline | raccolta piatta |
| processo tecnologico | diagramma di flusso | passi numerati | mappa concettuale generica |
| sistema e causalità | system map | elenco cause/effetti | timeline |

## 5. Regole della grammatica

1. **La relazione determina la forma.** Il contenitore non è scelto per uniformità grafica.
2. **Le card sono oggetti editoriali**, non la grammatica universale del curricolo.
3. **Ogni vista grafica ha un equivalente testuale/elenco** con pari accesso alle informazioni.
4. **Colore, posizione o animazione non possono essere l'unico vettore semantico.**
5. **Semantic zoom** cambia il livello di dettaglio, non il significato o l'autorità.
6. **Provenienza e versione** sono progressive disclosure: reperibili, non invasive.
7. **Stato editoriale e stato curricolare sono distinti.**
8. **Atlas non presenta come proprio** un obiettivo curricolare proveniente da Arena.

## 6. Pattern di pagina

### Pagina Disciplina

Ordine raccomandato:

1. titolo e descrizione;
2. selettore annualità;
3. progressione;
4. nuclei;
5. obiettivi;
6. percorsi/risorse correlate;
7. fonti e versione su richiesta.

### Pagina Obiettivo

1. obiettivo curricolare;
2. posizione nella progressione;
3. prerequisiti/raccordi;
4. evidenze;
5. lezioni pubblicabili collegate;
6. risorse Atlas;
7. provenienza/versione.

### Pagina Risorsa

1. titolo e tipo;
2. anteprima/descrizione;
3. relazione con obiettivi;
4. livello/annualità;
5. accessibilità e diritti/licenza;
6. versione/stato editoriale;
7. provenienza.

## 7. Responsive e accessibilità

### Mobile Android

- una sola colonna primaria;
- outline espandibile;
- filtri in disclosure;
- alternative elenco per grafi e mappe;
- target tattili adeguati;
- nessun hover necessario.

### Desktop

- contenuto principale + pannello contestuale opzionale;
- confronto tra annualità senza perdere il contesto;
- tastiera completa per albero, tab, disclosure e selezione nodo.

### LIM / grande schermo

- tipografia e spaziatura adatte alla lettura a distanza;
- modalità presentazione non interattiva disponibile come prospettiva;
- nessuna informazione critica confinata in tooltip.

Target trasversale: **WCAG 2.2 AA**.

## 8. Journey coperti da S1

### Pubblico/famiglia

Curricolo → Tecnologia → seconda → nucleo → obiettivo → esempio/risorsa → provenienza.

### Studente

Hub → seconda → Tecnologia → Lezioni ↔ Obiettivi → materiale.

### Docente

Curricolo → nodo → progressione/prerequisiti → risorse Atlas → distinzione esplicita dal contesto professionale Docente OS.

## 9. Criteri di accettazione

S1 può essere considerato completato soltanto se:

- [ ] le quattro aree primarie hanno responsabilità non sovrapposte;
- [ ] i tre journey sono ricostruibili senza identificativi tecnici;
- [ ] ogni vista grafica critica ha una forma alternativa elenco/tabella;
- [ ] la progressione verticale non dipende da Galaxy/Spatial;
- [ ] provenienza/versione restano disponibili senza dominare;
- [ ] Student Learning Hub non richiede identità personale;
- [ ] nessun elemento suggerisce che Atlas sia autorità curricolare;
- [ ] le regole supportano mobile, desktop, LIM e tastiera;
- [ ] una review umana exact-head produce PASS o CHANGES_REQUIRED.

## 10. Passo successivo dopo S1

Solo dopo review di S1:

- **R3-F0/S2 — Design Core & Accessible Primitives**, con token, ruoli semantici, tipografia, focus, stati, primitive e catalogo componenti;
- successivamente prototipi dei journey e POC mappa 2D.

Nessun completamento di S1 autorizza runtime cross-product o DOS-A1.
