# CC2-F3C — Mobile-first Control Center

**Data:** 24 settembre 2026  
**Stato:** ACTIVE / HUMAN REVIEW REQUIRED

## Problema osservato

La prima versione responsive adattava correttamente la griglia, ma sullo smartphone restava una versione troppo vicina al desktop compresso:

- testi e badge troppo piccoli;
- matrice L0–L5 densa;
- Stakeholder Assurance molto lunga;
- priorità operative disperse nella pagina;
- help contestuale non abbastanza mobile-native.

## Principio

La Home mobile risponde prima a:

1. cosa sta accadendo ora;
2. cosa richiede attenzione;
3. qual è il livello raggiunto;
4. quali gap evidenziali restano;
5. dove approfondire.

Il mobile non è una riduzione del desktop.

## Contratto mobile

### Above the fold

La prima superficie contiene:

- fasi attive;
- numero di gate bloccanti;
- numero di requisiti assurance con gap.

I KPI desktop ridondanti vengono nascosti.

### Fasi

Sul telefono vengono mostrate nella Home solo le fasi `ACTIVE` o `IN_PROGRESS`.
Il quadro completo resta nello snapshot/dossier e nelle viste successive.

### Maturità

La matrice desktop diventa una sequenza di card orizzontali snap:

- una area per card;
- livello confermato leggibile;
- livelli L0–L5 con target touch/visivo maggiore;
- dettaglio disponibile al tap tramite contextual help.

### Stakeholder Assurance

Le card sono orizzontali snap, non una pila verticale lunga.
Ogni card mantiene:

- stato attuale;
- target;
- prerequisiti soddisfatti;
- gap principali;
- help al tap.

### Help contestuale

Su mobile viene reso come bottom sheet:

- tap/click;
- focus da tastiera;
- chiusura esplicita;
- Escape;
- altezza massima controllata e scroll interno.

### Navigazione

Bottom navigation a cinque destinazioni:

- Ora;
- Gate;
- Maturità;
- Assurance;
- Evidenze.

Target interattivi minimi: 44 px.

## Progressive disclosure

La Home non tenta di visualizzare simultaneamente tutto il contenuto tecnico.
Dipendenze, espansioni ed evidenze restano disponibili più in basso, mentre i futuri drill-down specialistici assorbiranno il dettaglio tecnico.

## Motion

Sono ammesse solo transizioni informative e highlight di aggiornamento.
`prefers-reduced-motion` resta vincolante.

## Gate

- no horizontal page overflow;
- touch target >= 44 px;
- mobile summary presente;
- maturity e assurance non impilate verticalmente;
- contextual help mobile-native;
- PWA/offline invariati;
- JS syntax PASS;
- human review su smartphone reale 390–412 px.
