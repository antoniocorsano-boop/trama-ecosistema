# R3-F0 — Atlas Product & Design Foundation

**Stato:** READY_FOR_IMPLEMENTATION_REVIEW / NO_RUNTIME  
**Alias prodotto:** ATLAS-F0  
**Autorità:** TRAMA governa lo slice; Atlas resta il dominio di prodotto interessato.

## Scopo

Creare la fondazione di prodotto e design necessaria perché Atlas evolva come **atlante integrale del curricolo**, non come semplice libreria di materiali o visualizzazione specialistica.

Questo slice non implementa ancora capacità runtime cross-product.

## Dipendenze

TRAMA-ADR-010 è approvata e integrata.

R3-F0 può entrare in esecuzione soltanto mantenendo:

- gli invarianti di autorità definiti da ADR-007/008/010;
- Arena come fonte curricolare;
- Docente OS come workspace professionale;
- DOS-A1 in stato RUNTIME_DEFERRED;
- il runtime Docente OS → Atlas non autorizzato finché non esiste una distinta decisione.

## Output obbligatori

### 1. Information Architecture canonica

Navigazione primaria target:

- Curricolo
- Percorsi
- Risorse
- Esplora

Student Learning Hub resta una superficie contestuale, non sostituisce la navigazione primaria.

Fonti e provenance restano disponibili sotto progressive disclosure.

### 2. Visual Grammar of Curriculum

Deve essere formalizzata una grammatica visuale che leghi il tipo di relazione educativa alla rappresentazione appropriata.

Matrice minima:

| Relazione | Forma primaria candidata |
| --- | --- |
| disciplina → nucleo → obiettivi | albero / outline |
| progressione per annualità | percorso verticale / ladder |
| sequenza didattica | timeline |
| obiettivi × classi | matrice |
| raccordi interdisciplinari | rete |
| prerequisiti | grafo orientato |
| obiettivo → lezioni → materiali | percorso collegato |
| processo tecnologico | flow diagram |
| sistema e causalità | system map |

Le card non sono la forma predefinita per qualunque contenuto.

### 3. Atlas Design Core

Definizione, non ancora adozione tecnica, di:

- design token condivisi TRAMA/Atlas;
- ruoli cromatici semantici;
- tipografia editoriale;
- spacing, radius e focus;
- stati editoriali;
- primitive accessibili;
- catalogo componenti;
- regole per progressive disclosure;
- dark mode limitata alle viste dove ha reale valore.

Nessuna libreria è autorizzata automaticamente da questo documento.

### 4. Primitive accessibili minime

Devono essere progettate almeno:

- link;
- button;
- breadcrumbs;
- disclosure;
- tabs;
- search;
- filter;
- list;
- tree/outline;
- status;
- relation chip;
- resource item;
- curriculum node;
- focus/selection state;
- empty/error/loading state.

Target: WCAG 2.2 AA, con verifica automatica e umana.

### 5. Prototipi dei journey principali

Devono essere prototipati almeno tre journey:

**Pubblico/famiglia**
- entra nel Curricolo;
- sceglie disciplina e annualità;
- comprende progressione e obiettivi;
- apre esempi e risorse;
- consulta provenance su richiesta.

**Studente**
- apre il percorso disponibile;
- sceglie disciplina;
- passa da vista Lezioni a vista Obiettivi;
- apre materiali senza conoscere struttura tecnica o identificativi interni.

**Docente**
- esplora un nodo curricolare;
- segue relazioni/prerequisiti;
- confronta risorse Atlas;
- distingue chiaramente conoscenza Atlas da contesto professionale Docente OS.

### 6. POC mappa 2D professionale

Un solo caso rappresentativo deve dimostrare:

- leggibilità;
- semantic zoom;
- selezione di nodo;
- relazione fra annualità;
- accesso alternativo tramite elenco;
- uso da tastiera;
- assenza di dipendenza obbligatoria da Galaxy/Spatial.

Galaxy/Spatial resta una vista specialistica, non la baseline del prodotto.

### 7. Device and interaction matrix

Verifica prevista su:

- Android mobile;
- desktop;
- LIM / grande schermo;
- tastiera;
- focus visibile;
- reflow/ridisposizione;
- contrasto;
- tecnologie assistive nei journey critici.

### 8. Evidenza di uscita

Lo slice deve produrre:

- IA approvata;
- Visual Grammar versionata;
- token/design roles;
- inventario primitive;
- prototipo dei tre journey;
- POC mappa 2D;
- matrice accessibilità/device;
- registro issue aperte;
- rapporto umano di review.

## Non obiettivi

R3-F0 non autorizza:

- runtime Docente OS → Atlas;
- autenticazione studenti;
- OutcomeAggregateSnapshot;
- pubblicazione automatica;
- Officina materiali in runtime;
- nuova dipendenza frontend;
- migrazione del curricolo da Arena;
- modifica del ruolo di Docente OS;
- attivazione di DOS-A1.

## Gate di uscita

R3-F0 può essere promosso soltanto se:

1. IA e Visual Grammar sono comprensibili senza spiegazioni tecniche;
2. i tre journey risultano coerenti fra loro;
3. la mappa 2D non è l'unico modo di accedere ai contenuti;
4. provenance e dettagli tecnici sono disponibili ma non dominano l'esperienza;
5. accessibilità automatica e review umana non mostrano blocker;
6. Atlas non appare come fonte curricolare autonoma;
7. nessun flusso implica adozione o pubblicazione automatica;
8. review umana exact-head = PASS.

## Condizione di avvio

Questo documento è un **implementation-ready brief**. La sua integrazione autorizza l'avvio dello slice R3-F0 di prodotto/design entro i confini descritti, ma non autorizza capacità runtime cross-product, nuove dipendenze frontend o DOS-A1.
