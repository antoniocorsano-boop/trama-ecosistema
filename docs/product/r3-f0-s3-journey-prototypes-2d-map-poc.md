# R3-F0/S3 — Journey Prototypes & 2D Map POC

**Stato:** STATIC_PACKAGE_INTEGRATED / HUMAN_REVIEW_PASS / EXIT_GATES_PENDING / NO_RUNTIME  
**Parent:** R3-F0 / ATLAS-F0  
**Dipendenze:** R3-F0/S1 e R3-F0/S2 — INTEGRATED / HUMAN_REVIEW_PASS  
**Prodotto interessato:** Atlas  
**Autorità:** TRAMA governa lo slice; Arena resta l'autorità curricolare; Atlas governa solo le proprie risorse/pagine/pubblicazioni; Docente OS resta il dominio professionale e della decisione docente.

## Scopo

Trasformare IA, Visual Grammar e Design Core approvati in prototipi di esperienza verificabili, senza introdurre frontend runtime o nuove dipendenze.

S3 deve dimostrare che Atlas funziona come **atlante integrale del curricolo** per pubblico, studente e docente, mantenendo:

- lettura curricolare prima della decorazione;
- accessibilità equivalente tra visuale e lista;
- provenienza Arena sempre ricostruibile;
- separazione tra stato curricolare, editoriale e UI;
- privacy-first nello Student Learning Hub;
- nessun comportamento autonomo di adozione o pubblicazione.

## 1. Caso rappresentativo

Il caso di prova S3 è:

- disciplina: **Tecnologia**;
- grado: scuola secondaria di primo grado;
- annualità principale: **seconda**;
- tema didattico di lavoro: **Agricoltura come sistema tecnologico**;
- uso: pubblico/famiglia, studente, docente;
- dati personali: nessuno.

Il tema è un **contenuto rappresentativo di prototipo**. Le etichette degli obiettivi curricolari mostrate nei prototipi devono essere lette da Arena o marcate esplicitamente come placeholder/sintetiche: S3 non crea formulazioni curricolari autorevoli.

## 2. Prototipo journey pubblico/famiglia

### Obiettivo

Consentire a una persona non tecnica di capire:

1. dove si colloca Tecnologia;
2. cosa si affronta nella seconda annualità;
3. come il tema si collega a nuclei e obiettivi;
4. quali esempi e risorse Atlas sono disponibili;
5. da dove proviene l'informazione curricolare.

### Percorso

`Curricolo → Tecnologia → Seconda → Nucleo → Obiettivo Arena → Evidenza/Risorsa Atlas → Provenienza`

### Wireframe logico

1. **Header essenziale**
   - Atlas
   - Curricolo · Percorsi · Risorse · Esplora

2. **Titolo pagina**
   - Tecnologia
   - selettore annualità: Prima | Seconda | Terza

3. **Progressione**
   - breve vista verticale delle annualità;
   - annualità corrente evidenziata con testo + forma, non solo colore.

4. **Nuclei e obiettivi**
   - outline, non griglia di card;
   - ogni obiettivo mostra tipo e posizione;
   - provenance disponibile tramite disclosure.

5. **Esempi e risorse**
   - resource item Atlas;
   - licenza/accessibilità/stato editoriale sotto disclosure.

### Verifiche

- nessun ID tecnico nella lettura primaria;
- Arena riconoscibile come fonte, non invasiva;
- nessuna confusione tra obiettivo Arena e risorsa Atlas;
- funziona su mobile in una sola colonna;
- tab order lineare;
- nessun significato affidato solo al colore.

## 3. Prototipo journey studente

### Obiettivo

Consentire accesso immediato a contenuti pubblici senza account o identità.

### Ingresso

Contesto minimizzato:

- annualità;
- disciplina;
- eventuale sezione solo se indispensabile a distinguere contenuti pubblici;
- eventuale data solo se indispensabile.

### Percorso

`Hub → Seconda → Tecnologia → Lezioni ↔ Obiettivi → Materiale`

### Vista Lezioni

- sequenza pubblicata;
- titolo leggibile;
- breve descrizione;
- materiale disponibile;
- nessuna informazione su valutazioni o singoli studenti.

### Vista Obiettivi

- stessi contenuti del dominio informativo;
- raggruppamento per obiettivo;
- nessuna seconda copia autorevole dell'obiettivo;
- passaggio Lezioni ↔ Obiettivi senza perdita del contesto.

### Verifiche

- nessun login;
- nessun profilo persistente;
- nessun tracking individuale;
- tabs utilizzabili da tastiera;
- il cambio di vista non cambia autorità o stato;
- materiale fruibile senza conoscere strutture tecniche.

## 4. Prototipo journey docente

### Obiettivo

Consentire al docente di esplorare il curricolo e valutare risorse Atlas senza trasformare Atlas in Docente OS.

### Percorso

`Curricolo → Nodo → Progressione → Prerequisiti/Raccordi → Risorse Atlas → Provenienza`

### Regole

- il nodo curricolare proviene da Arena;
- Atlas non mostra pulsanti che implicano approvazione istituzionale;
- eventuali azioni professionali tipo “usa/adatta/sostituisci/escludi” appartengono al contesto Docente OS e non vengono simulate come azioni operative Atlas in S3;
- la pagina può spiegare il collegamento con Docente OS, ma non esegue runtime cross-product.

### Verifiche

- docente distingue chiaramente fonte curricolare e risorsa;
- prerequisiti e raccordi hanno equivalente testuale;
- provenance/versione raggiungibili senza invadere la lettura;
- nessun trasferimento automatico.

## 5. POC mappa 2D professionale

### Scopo

Dimostrare una vista 2D utile per esplorare relazioni, senza renderla obbligatoria.

### Caso

Tema: **Agricoltura come sistema tecnologico**.

Nodi dimostrativi:

- annualità;
- nucleo;
- obiettivo curricolare Arena;
- prerequisito;
- percorso;
- risorsa Atlas;
- raccordo interdisciplinare.

Le etichette curricolari non possono essere inventate come definitive.

### Layout

- asse verticale: progressione/annualità;
- asse orizzontale: relazioni pertinenti;
- nodo selezionato con focus distinto dalla selezione persistente;
- pannello contestuale opzionale;
- comando **Visuale | Elenco** sempre disponibile.

### Semantic zoom

Tre livelli:

1. **Panoramica** — annualità + nuclei principali;
2. **Relazione** — obiettivi e raccordi;
3. **Dettaglio** — risorse, provenance e stato editoriale.

Il semantic zoom cambia densità e dettaglio, non:

- identità del nodo;
- autorità;
- stato;
- significato della relazione.

### Tastiera

Per la baseline S3, la mappa non deve richiedere un grafo ARIA complesso.

La modalità accessibile primaria è:

- elenco/outline equivalente;
- focus sequenziale;
- selezione del nodo;
- apertura del dettaglio;
- ritorno al contesto.

Un eventuale modello applicativo a frecce richiede uno slice futuro specifico.

## 6. Prova di separazione degli stati

S3 deve mostrare nello stesso scenario almeno tre stati contemporanei:

1. **CurricularStatus**
   - es. contenuto curricolare corrente, derivato da Arena;

2. **EditorialStatus**
   - es. risorsa Atlas ritirata o aggiornata;

3. **UIFeedbackStatus**
   - es. errore temporaneo di caricamento di una risorsa correlata.

Criterio: i tre stati devono essere distinguibili anche:

- in scala di grigi;
- senza affidarsi al colore;
- con screen reader;
- con testo lungo;
- su mobile.

Atlas non inferisce autonomamente `curricular.current` o `curricular.superseded`: visualizza soltanto stato/proiezione proveniente dalla fonte Arena.

## 7. Matrice device e accessibilità

| Scenario | Android | Desktop | LIM | Tastiera | Reflow | Screen reader |
| --- | --- | --- | --- | --- | --- | --- |
| Pubblico/famiglia | obbligatorio | obbligatorio | verifica leggibilità | obbligatorio | obbligatorio | percorso critico |
| Studente | obbligatorio | obbligatorio | facoltativo | obbligatorio | obbligatorio | percorso critico |
| Docente | obbligatorio | obbligatorio | verifica presentazione | obbligatorio | obbligatorio | percorso critico |
| Mappa 2D | fallback elenco | visuale+elenco | visuale+elenco | elenco equivalente obbligatorio | obbligatorio | elenco equivalente |

## 8. Criteri WCAG espliciti S3

La matrice S3 verifica almeno:

- SC 1.4.1 — Use of Color;
- SC 1.4.3 — Contrast (Minimum);
- SC 1.4.11 — Non-text Contrast;
- SC 2.1.1 — Keyboard;
- SC 2.4.7 — Focus Visible;
- SC 2.4.11 — Focus Not Obscured (Minimum);
- SC 2.5.8 — Target Size (Minimum);
- SC 1.4.10 — Reflow.

Per il testo “large-scale”, il requisito 3:1 si applica solo quando il testo soddisfa realmente la definizione WCAG. I token più piccoli o non qualificabili come large-scale restano soggetti a 4.5:1.

## 9. Test di leggibilità tipografica

Verificare in particolare:

- `type.body`;
- `type.small`;
- `type.metadata = 0.8125rem`.

Test minimi:

- Android portrait;
- zoom browser;
- desktop;
- LIM / visione a distanza;
- testo lungo italiano;
- stringhe di provenance/versione;
- nessun clipping o truncation che elimini informazione essenziale.

## 10. Prototipi testuali canonici

S3 non richiede ancora codice frontend. Gli artefatti canonici possono essere:

- wireframe testuali;
- diagrammi statici;
- tavole di stato;
- flow dei journey;
- mappa 2D statica/annotata;
- checklist device/accessibilità.

Qualunque prototipo visuale deve essere derivabile dai documenti S1/S2 e non può introdurre nuovi comportamenti autorevoli.

## 11. Exit criteria S3

S3 può essere considerato completato soltanto se:

- [ ] i tre journey sono prototipati end-to-end;
- [ ] il caso Tecnologia è comprensibile senza spiegazioni tecniche;
- [ ] la mappa 2D migliora l'esplorazione ma non è l'unico accesso;
- [ ] Visuale | Elenco mantiene equivalenza informativa;
- [ ] Arena è riconoscibile come fonte curricolare;
- [ ] stato curricolare, editoriale e UI sono distinti nello stesso schermo;
- [ ] il caso è utilizzabile senza colore;
- [ ] mobile Android è verificato;
- [ ] tastiera e focus sono verificati;
- [ ] reflow è verificato;
- [ ] provenance/versione sono raggiungibili ma non dominanti;
- [ ] Student Learning Hub resta privo di identità personale;
- [ ] nessuna azione implica pubblicazione o adozione automatica;
- [ ] nessuna nuova dipendenza frontend è introdotta;
- [ ] una review terza e una HUMAN EXACT-HEAD REVIEW producono PASS.

## 12. Non obiettivi

S3 non autorizza:

- implementazione frontend;
- runtime Docente OS → Atlas;
- pubblicazione automatica;
- autenticazione/account studenti;
- tracking o analytics individuale;
- Officina materiali runtime;
- Galaxy/Spatial come navigazione primaria;
- DOS-A1;
- chiusura automatica di R3-F0.

## 13. Esito corrente e passo successivo

Il pacchetto statico S3 è stato approvato con HUMAN EXACT-HEAD REVIEW PASS sull'exact head `e58ad641fb46ded63da714aec706bc14ac60a0d2` e integrato con merge commit `74dbcbea894ff8871784c62baa142be967884001`.

Restano PENDING le verifiche che richiedono un prototipo renderizzato: Android, desktop, LIM, screen reader e test automatici di contrasto/reflow. Per questo S3 non è ancora chiuso.

Il prossimo lavoro deve essere un incremento separato di **Rendered Prototype Validation**, ancora distinto da qualsiasi runtime cross-product e senza attivare DOS-A1.

L'**exit review complessiva di R3-F0 resta PENDING** fino alla verifica degli output obbligatori e della checklist finale.
