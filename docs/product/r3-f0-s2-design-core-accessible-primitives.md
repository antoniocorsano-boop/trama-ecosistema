# R3-F0/S2 — Atlas Design Core & Accessible Primitives

**Stato:** UNDER_REVIEW / NO_RUNTIME  
**Parent:** R3-F0 / ATLAS-F0  
**Dipendenza:** R3-F0/S1 — INTEGRATED / HUMAN_REVIEW_PASS  
**Prodotto interessato:** Atlas  
**Autorità:** TRAMA governa lo slice; Arena resta l'autorità curricolare; Atlas governa identità/versione/stato delle proprie risorse e pubblicazioni; Docente OS resta il dominio del contesto professionale e della decisione docente.

## Scopo

Trasformare l'architettura informativa e la Visual Grammar approvate in un **Design Core coerente, accessibile e riutilizzabile**, prima di costruire prototipi o scegliere librerie frontend.

S2 definisce il linguaggio di interazione di Atlas. Non definisce una tecnologia di implementazione e non autorizza runtime cross-product.

## Confini

Questo incremento:

- definisce token semantici e scale di base;
- definisce tipografia, spaziatura, raggi, bordi, focus, movimento e gerarchia visuale;
- definisce il comportamento delle primitive accessibili minime;
- distingue stato curricolare, stato editoriale, selezione e stato dell'interfaccia;
- mantiene la grammatica visuale di S1 come vincolo;
- mantiene Student Learning Hub privacy-first;
- non introduce account, login, profili, tracking o dati personali studenti;
- non sceglie framework, libreria UI o pacchetto di icone;
- non introduce una palette di marca definitiva;
- non implementa runtime Docente OS → Atlas;
- non implementa Officina materiali;
- non attiva DOS-A1.

## 1. Principi del Design Core

1. **Semantica prima dello stile.** Un token descrive una funzione, non un colore o una forma accidentale.
2. **Curricolo prima della decorazione.** Gerarchia, relazioni e progressione devono essere leggibili anche senza effetti visuali.
3. **Una sola informazione, più rappresentazioni equivalenti.** Grafi, mappe e timeline devono mantenere una forma testuale equivalente.
4. **Stato non affidato al colore.** Icona, testo, forma o posizione devono rendere lo stato comprensibile anche senza colore.
5. **Focus e tastiera sono parte del design.** Non sono aggiunte successive.
6. **Progressive disclosure.** Provenienza, versione e dettagli tecnici sono disponibili senza dominare il contenuto.
7. **Riduzione del rumore.** Ombre, badge, chip e card sono usati solo quando hanno funzione informativa.
8. **Nessuna autorità implicita.** Lo stile non deve far apparire Atlas come fonte curricolare autonoma.

## 2. Architettura dei token

I token sono definiti su tre livelli.

### 2.1 Foundation scale

Scale neutrali e riutilizzabili:

- spazio;
- tipografia;
- raggi;
- bordi;
- dimensioni interattive;
- movimento;
- livelli di sovrapposizione.

### 2.2 Semantic roles

Ruoli indipendenti dalla futura palette di marca:

- `surface.canvas`
- `surface.subtle`
- `surface.raised`
- `surface.inverse`
- `text.primary`
- `text.secondary`
- `text.muted`
- `text.inverse`
- `border.subtle`
- `border.strong`
- `action.primary`
- `action.secondary`
- `action.destructive`
- `focus.ring`
- `selection.background`
- `selection.foreground`
- `status.info`
- `status.success`
- `status.warning`
- `status.error`
- `authority.arena`
- `domain.atlas`
- `domain.docente-os`
- `decision.human`

I ruoli `authority.*` e `domain.*` servono a riconoscere provenienza e dominio. **Non sostituiscono testo, etichette o provenance.**

### 2.3 Component roles

I componenti possono derivare token locali dai ruoli semantici, ma non introdurre significati nuovi o colori hard-coded.

Regola: **nessun componente possiede un colore autorevole proprio**.

## 3. Direzione cromatica

La direzione di marca corrente resta concettuale e sostituibile:

- indaco → governo / autorità curricolare;
- verde petrolio → conoscenza / navigazione Atlas;
- terracotta → azione didattica;
- oro tenue → connessione / decisione;
- avorio → chiarezza / leggibilità.

Questa associazione **non costituisce palette definitiva** e non autorizza valori esadecimali o una libreria colore.

Requisiti:

- target WCAG 2.2 AA;
- testo normale con contrasto adeguato al target AA;
- testo grande e grafica informativa con contrasto adeguato al target AA;
- bordi e focus visibili in condizioni di contrasto ridotto;
- stati success/error/warning non identificati soltanto da verde/rosso/giallo;
- provenienza Arena non identificata soltanto dal colore;
- nessuna combinazione di marca può prevalere sulla leggibilità.

## 4. Tipografia

La baseline non introduce font esterni.

### Ruoli

| Token | Uso |
| --- | --- |
| `type.display` | titoli di apertura o grandi viste, uso raro |
| `type.page-title` | titolo pagina |
| `type.section-title` | sezioni |
| `type.subsection-title` | sottosezioni |
| `type.body` | lettura principale |
| `type.body-strong` | enfasi semantica |
| `type.small` | testo secondario |
| `type.metadata` | provenienza, versione, stato |
| `type.code` | identificativi tecnici solo dove necessari |

Regole:

- baseline: stack di sistema, senza dipendenza frontend;
- corpo leggibile e non compresso;
- altezza di riga generosa nei contenuti didattici;
- lunghezza di riga controllata nelle pagine editoriali;
- maiuscolo esteso vietato per testi lunghi;
- metadata visivamente secondari ma non illeggibili;
- un identificativo tecnico non deve diventare etichetta primaria.

## 5. Spaziatura e densità

Scala raccomandata:

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`

Regole:

- 4/8: relazione interna a un controllo;
- 12/16: gruppi strettamente correlati;
- 24/32: blocchi di contenuto;
- 48/64: separazione tra sezioni principali;
- densità ridotta su LIM e modalità presentazione;
- mobile: contenuto prioritario prima dei pannelli contestuali;
- nessuna griglia di card usata per riempire spazio vuoto.

## 6. Raggi, bordi, profondità

### Raggi

Ruoli raccomandati:

- `radius.none`
- `radius.small`
- `radius.medium`
- `radius.full` solo per elementi realmente circolari o badge compatti.

I pill non sono il contenitore predefinito.

### Bordi

I bordi comunicano:

- delimitazione;
- selezione;
- focus;
- relazione tra contenuti.

Non devono creare una “scacchiera” di pannelli.

### Profondità

Ombre ed elevation sono limitate a:

- overlay;
- menu contestuali;
- pannelli temporanei;
- elementi trascinabili, se mai previsti da uno slice futuro.

La gerarchia ordinaria usa soprattutto spazio, tipografia, bordo e struttura.

## 7. Focus, selezione e stati di interazione

Ogni controllo interattivo deve distinguere almeno:

- default;
- hover, quando disponibile;
- focus;
- active/pressed;
- selected, quando applicabile;
- disabled, solo quando necessario;
- loading;
- error.

Regole:

- focus sempre visibile;
- focus non oscurato da header, overlay o pannelli;
- selezione e focus sono stati differenti;
- hover non è requisito per comprendere o usare il controllo;
- disabilitato non sostituisce una spiegazione;
- il caricamento non deve causare perdita del contesto.

## 8. Movimento

Il movimento non trasporta informazione essenziale.

Ammessi:

- transizioni brevi per disclosure;
- passaggi di stato;
- orientamento spaziale nelle mappe, se non indispensabile.

Vincoli:

- rispetto di `prefers-reduced-motion` in implementazione;
- nessun autoplay decorativo;
- nessuna animazione necessaria per capire sequenza, autorità o stato;
- semantic zoom mantiene significato e selezione durante il cambio di scala.

## 9. Stati: quattro livelli distinti

### 9.1 Stato curricolare

Appartiene ad Arena e viene mostrato come proiezione della fonte.

Atlas non lo modifica.

### 9.2 Stato editoriale Atlas

Descrive risorse, pagine e pubblicazioni Atlas, ad esempio quando applicabile:

- bozza;
- pubblicato;
- aggiornato;
- ritirato;
- rifiutato.

Il vocabolario visuale deve restare distinto dallo stato curricolare.

### 9.3 Stato di decisione docente

Quando una risorsa Atlas è presentata nel contesto professionale, decisioni come riutilizzo, adattamento, sostituzione o esclusione restano nel dominio Docente OS.

Atlas non rappresenta la proposta come già adottata.

### 9.4 Stato dell'interfaccia

Loading, empty, error, selected e focus non devono essere confusi con stati editoriali o curricolari.

## 10. Primitive accessibili

### Link

**Uso:** navigazione verso una destinazione.  
**Vincoli:** testo descrittivo; stato focus visibile; non usare button styling per nascondere la natura di link.  
**Da evitare:** “clicca qui” senza contesto.

### Button

**Uso:** azione.  
**Varianti semantiche:** primary, secondary, quiet, destructive.  
**Vincoli:** etichetta esplicita; stato pressed solo se realmente toggle; loading senza duplicare l'azione.

### Breadcrumbs

**Uso:** posizione nella gerarchia informativa.  
**Vincoli:** riflette il percorso informativo, non ID tecnici; elemento corrente distinguibile ma non duplicato come link inutile.

### Disclosure

**Uso:** dettagli secondari come provenance, versione, filtri avanzati.  
**Vincoli:** apertura/chiusura da tastiera; stato espanso comprensibile; contenuto essenziale non nascosto per default.

### Tabs

**Uso:** prospettive equivalenti dello stesso dominio, ad esempio Lezioni ↔ Obiettivi.  
**Vincoli:** non usate come navigazione primaria; relazione tab/pannello esplicita; ordine tastiera prevedibile.

### Search

**Uso:** ricerca di curricolo e risorse.  
**Vincoli:** etichetta permanente; risultati con contesto sufficiente; nessuna ricerca basata su identità studente.

### Filter

**Uso:** restringere un insieme.  
**Vincoli:** stato dei filtri visibile; azione di reset; filtri applicati comprensibili senza dipendere dal colore.

### List

**Uso:** forma accessibile universale per collezioni e alternative alle viste grafiche.  
**Vincoli:** ordine e raggruppamento semantici; non trasformare ogni riga in card.

### Tree / Outline

**Uso:** disciplina → annualità → nucleo → obiettivo.  
**Vincoli:** espansione prevedibile; livello gerarchico comprensibile; equivalente lineare disponibile quando necessario.

### Status

**Uso:** stato editoriale o informativo.  
**Vincoli:** testo + segnale visuale; non usare un solo colore; vocabolario coerente.

### Relation chip

**Uso:** etichettare una relazione breve, non strutturare l'interfaccia.  
**Vincoli:** uso parsimonioso; non sostituisce breadcrumb, albero o filtri.

### Resource item

**Uso:** rappresentare una singola risorsa Atlas.  
**Contenuto minimo:** titolo, tipo, relazione curricolare, stato editoriale quando utile.  
**Vincoli:** provenance e licenza in progressive disclosure; card solo se il contesto editoriale lo giustifica.

### Curriculum node

**Uso:** rappresentare un nodo della struttura curricolare.  
**Contenuto minimo:** etichetta leggibile, tipo, collocazione, relazioni essenziali.  
**Vincoli:** fonte Arena riconoscibile; nessuna apparenza di modifica/approvazione da parte di Atlas.

### Focus / Selection state

**Uso:** orientamento nell'interazione.  
**Vincoli:** focus e selezione distinti; permanenza della selezione durante cambio vista quando semanticamente possibile.

### Empty state

Deve spiegare cosa manca e quale azione utile è disponibile. Non deve simulare un errore.

### Error state

Deve indicare:

- cosa non è disponibile;
- cosa resta conservato;
- azione di recupero, se esiste.

Nessun errore cancella silenziosamente il contesto.

### Loading state

Mantiene struttura e orientamento; evita salti inutili e non presenta dati placeholder come contenuti reali.

## 11. Progressive disclosure

Tre livelli:

1. **Primario:** ciò che serve per capire il curricolo o usare la risorsa.
2. **Contestuale:** relazioni, stato, filtri e informazioni operative pertinenti.
3. **Tecnico/provenance:** fonte, versione, receipt o riferimenti tecnici.

Regola: il livello tecnico è sempre raggiungibile, ma non deve diventare la schermata principale.

## 12. Responsive

### Mobile Android

- una colonna primaria;
- azioni principali raggiungibili senza hover;
- disclosure e filtri compatti;
- outline progressivo;
- nessuna mappa come unico accesso;
- target interattivi adeguati.

### Desktop

- contenuto principale + contesto secondario facoltativo;
- confronto fra annualità;
- tastiera completa;
- pannelli non invasivi.

### LIM / grande schermo

- gerarchia tipografica più ampia;
- densità ridotta;
- modalità presentazione;
- nessuna informazione critica solo in tooltip o hover;
- navigazione comprensibile anche a distanza.

## 13. Dark mode

La dark mode **non è un requisito generale di R3-F0**.

Può essere valutata successivamente per:

- viste spaziali/mappa;
- presentazione su LIM in condizioni ambientali specifiche;
- superfici dove produce un vantaggio verificabile.

Non deve:

- ridurre leggibilità;
- diventare dipendenza del Design Core;
- introdurre una seconda grammatica cromatica;
- precedere la validazione della modalità chiara.

## 14. Catalogo componenti minimo

Il catalogo S2 comprende:

1. Link
2. Button
3. Breadcrumbs
4. Disclosure
5. Tabs
6. Search
7. Filter
8. List
9. Tree/Outline
10. Status
11. Relation chip
12. Resource item
13. Curriculum node
14. Focus/Selection
15. Empty
16. Error
17. Loading

Per ogni componente, un futuro prototipo deve mostrare:

- uso corretto;
- uso scorretto;
- stato tastiera/focus;
- stato mobile;
- caso con testo lungo;
- caso senza colore;
- comportamento con contenuti reali o realistici.

## 15. Regole di composizione

- al massimo una azione primaria evidente per contesto;
- card solo per oggetti editoriali o contenuti autonomi;
- badge/chip non usati per creare gerarchia;
- breadcrumb + titolo pagina non devono duplicare rumore;
- una sidebar non è obbligatoria;
- i filtri non precedono il contenuto quando non necessari;
- una vista complessa deve offrire sempre “Visuale | Elenco” o equivalente;
- la provenienza non diventa banner permanente salvo necessità di autorità o rischio di ambiguità;
- gli stati editoriali non devono sembrare valutazioni di qualità didattica.

## 16. Criteri di accettazione S2

S2 può essere considerato completato soltanto se:

- [ ] i token sono semantici e non legati a una libreria;
- [ ] nessun colore di marca è hard-coded come significato unico;
- [ ] tipografia e spacing sostengono lettura su mobile, desktop e LIM;
- [ ] focus e selezione sono distinti;
- [ ] stati curricolare/editoriale/interfaccia sono distinti;
- [ ] tutte le primitive minime hanno un contratto di comportamento;
- [ ] ogni primitiva critica è utilizzabile da tastiera;
- [ ] le alternative accessibili previste da S1 restano preservate;
- [ ] il Design Core non trasforma Atlas in una dashboard SaaS generica;
- [ ] Student Learning Hub resta privo di identità personale;
- [ ] nessuna scelta introduce una dipendenza frontend;
- [ ] una review umana exact-head produce PASS o CHANGES_REQUIRED.

## 17. Passo successivo dopo S2

Solo dopo review S2:

- prototipare i tre journey definiti da R3-F0;
- realizzare un POC mappa 2D su un solo caso rappresentativo;
- costruire la matrice device/accessibilità;
- verificare le primitive con contenuti curricolari realistici.

Nome di lavoro consigliato per il successivo incremento: **R3-F0/S3 — Journey Prototypes & 2D Map POC**.

Nessun completamento di S2 autorizza runtime cross-product, nuove dipendenze frontend, Officina runtime o DOS-A1.
