# R4-P2/S1 — Reflective Lesson Continuity

**Data:** 2026-09-23  
**Stato:** PRODUCT/UX SPECIFICATION — NO_RUNTIME  
**Padre:** `TRAMA-DOS-PP-01`  
**Perimetro:** Docente OS, con riferimenti governati ad Arena e Conoscenza  
**Vincoli:** HUMAN PROFESSIONAL JUDGMENT · NO SILENT WRITE · DOS-A1 RUNTIME_DEFERRED

## 1. Obiettivo

R4-P2/S1 trasforma la chiusura di una lezione in un momento professionale leggero e utile, capace di alimentare la preparazione successiva senza introdurre burocrazia aggiuntiva.

Il sistema deve aiutare il docente a distinguere:

1. **ciò che è accaduto**;
2. **come lo interpreta professionalmente**;
3. **che cosa decide di fare dopo**.

La continuità è quindi:

`Lezione svolta → Osservazione → Riflessione → Decisione → Prossima preparazione`.

## 2. Principi di esperienza

### 2.1 Minimo attrito
La riflessione non deve diventare una scheda obbligatoria lunga. Il docente deve poter chiudere una lezione anche con poche informazioni essenziali.

### 2.2 Prima i fatti, poi le interpretazioni
La superficie deve separare visivamente:
- **Osservazioni**: fatti o evidenze annotati dal docente;
- **Riflessione**: interpretazione professionale;
- **Decisione**: intenzione esplicita per il seguito.

### 2.3 Nessuna decisione implicita
Un suggerimento IA non può diventare decisione, promemoria, modifica di progettazione o contenuto della lezione successiva senza conferma esplicita.

### 2.4 Continuità, non automazione
Il sistema deve riportare nella preparazione successiva soltanto elementi che il docente ha deciso di mantenere come rilevanti.

### 2.5 Contesto leggibile
Ogni riflessione deve mostrare chiaramente:
- classe;
- disciplina;
- data;
- lezione di origine;
- eventuale UDA/percorso;
- riferimento alla baseline curricolare Arena quando presente.

## 3. Oggetti concettuali

### LessonReflection

Rappresenta la riflessione professionale associata a una lezione.

Campi minimi:

- `id`
- `lessonId`
- `classContextRef`
- `subjectRef`
- `schoolYearRef`
- `createdAt`
- `updatedAt`
- `status`
- `observations[]`
- `reflectionText`
- `followUpDecisions[]`
- `knowledgeLinks[]`
- `curriculumContextRef?`
- `authorType = teacher`

### ReflectionObservation

Elemento descrittivo.

Campi:
- `id`
- `text`
- `category?`
- `source = teacher`
- `createdAt`

Categorie opzionali:
- partecipazione;
- comprensione;
- tempi;
- attività;
- materiali;
- gestione;
- verifica formativa;
- altro.

Le categorie servono solo per organizzazione e recupero. Non implicano valutazioni automatiche.

### FollowUpDecision

Decisione esplicita del docente per il seguito.

Campi:
- `id`
- `text`
- `target`
- `targetLessonId?`
- `status`
- `createdAt`
- `confirmedByTeacherAt`

Target ammessi:
- prossima lezione;
- progettazione;
- materiale;
- conoscenza;
- nessuno / solo memoria professionale.

### KnowledgeLink

Collegamento non distruttivo tra riflessione e risorsa di Conoscenza.

Campi:
- `resourceRef`
- `relationType`
- `createdBy`

Relazioni:
- supporta;
- approfondisce;
- contraddice;
- da verificare;
- utile per il seguito.

## 4. Stati

### LessonReflection.status

- `EMPTY` — nessuna riflessione avviata;
- `DRAFT` — esiste contenuto non consolidato;
- `REVIEWED` — il docente ha rivisto la riflessione;
- `CLOSED` — la riflessione è conclusa per quella lezione.

Nessuno stato viene promosso automaticamente dall’IA.

### FollowUpDecision.status

- `PROPOSED` — suggerita dal sistema o formulata ma non confermata;
- `CONFIRMED` — confermata dal docente;
- `APPLIED` — collegata alla superficie di destinazione;
- `DISMISSED` — esclusa dal docente.

Transizione consentita:

`PROPOSED → CONFIRMED → APPLIED`

oppure:

`PROPOSED → DISMISSED`

## 5. Flusso utente principale

### Momento A — Fine lezione

Nella scheda lezione compare un’azione primaria discreta:

**“Com’è andata?”**

La selezione apre un pannello leggero, senza uscire dalla scheda lezione.

### Momento B — Tre blocchi

#### 1. Cosa hai osservato?
Campo rapido, anche in forma di note brevi.

Suggerimenti visivi opzionali:
- cosa ha funzionato;
- dove si sono fermati;
- cosa non hai completato;
- cosa ti ha sorpreso.

Non devono apparire come questionario obbligatorio.

#### 2. Cosa ne ricavi?
Campo di riflessione libera.

L’IA può offrire solo azioni opzionali:
- “Aiutami a distinguere fatti e interpretazioni”;
- “Fammi 2 domande di approfondimento”;
- “Confronta con le ultime lezioni di questa classe”.

Nessuna funzione parte automaticamente.

#### 3. Cosa vuoi portare avanti?
Il docente può creare una o più decisioni.

Esempi:
- riprendere il concetto X;
- ridurre la parte introduttiva;
- preparare un esempio grafico;
- collegare una risorsa;
- verificare il prerequisito Y.

### Momento C — Chiusura

Azioni:

- **Salva bozza**
- **Conferma riflessione**
- **Nessuna azione per la prossima lezione**

Quando una decisione è confermata, il sistema può proporre:

**“Porta questa decisione nella prossima preparazione”**

L’operazione richiede conferma distinta.

## 6. Continuità verso la prossima lezione

Nella preparazione della lezione successiva deve comparire un blocco:

### “Dalla lezione precedente”

Contiene solo:
- decisioni `CONFIRMED`;
- eventuali note esplicitamente marcate dal docente come utili;
- collegamenti a materiali o risorse già approvati.

Ogni elemento deve mostrare:
- origine;
- data;
- lezione;
- azione possibile.

Azioni:
- **Usa**
- **Modifica**
- **Ignora**
- **Apri origine**

Nessun elemento viene incorporato automaticamente nel piano della nuova lezione.

## 7. Comportamento IA

### Consentito

L’assistente può:
- riformulare una nota senza alterarne il significato;
- chiedere domande riflessive;
- distinguere osservazione da interpretazione;
- evidenziare ricorrenze documentate;
- suggerire possibili collegamenti con Conoscenza;
- proporre alternative per la lezione successiva;
- sintetizzare più riflessioni su richiesta.

### Non consentito

L’assistente non può:
- creare una decisione confermata;
- modificare il piano annuale;
- scrivere automaticamente nella prossima lezione;
- attribuire cause certe;
- diagnosticare difficoltà della classe o di singoli studenti;
- valutare il docente;
- generare profili individuali degli studenti;
- pubblicare materiali;
- modificare riferimenti Arena.

### Forma linguistica obbligatoria per inferenze

Quando l’IA interpreta dati longitudinali deve usare formule del tipo:
- “Nelle note disponibili ricorre…”
- “Potrebbe valere la pena verificare…”
- “Questa è un’ipotesi, non una conclusione…”

Deve evitare:
- “La classe è…”
- “Gli studenti non sono capaci di…”
- “La causa è…”

## 8. Privacy e minimizzazione

R4-P2/S1 non richiede dati personali degli studenti.

Regole:
- niente nomi studenti come campo strutturato;
- niente profili individuali;
- niente classificazioni sensibili;
- niente inferenze sanitarie, comportamentali o psicologiche;
- eventuali riferimenti liberi inseriti dal docente non diventano entità strutturate automaticamente;
- il sistema deve preferire formulazioni aggregate riferite alla classe o alla lezione.

## 9. Provenance

Ogni elemento derivato deve conservare:
- lezione di origine;
- autore umano o IA;
- data;
- eventuale risorsa collegata;
- stato di conferma docente.

Per i suggerimenti IA:
- `source = ai_advisory`
- `confirmedByTeacherAt = null` finché non c’è conferma esplicita.

## 10. Non-silent-write

Ogni scrittura verso superfici diverse dalla riflessione corrente richiede:
1. anteprima;
2. destinazione leggibile;
3. azione esplicita del docente;
4. feedback di completamento;
5. possibilità di annullamento quando tecnicamente applicabile.

Destinazioni considerate:
- prossima preparazione;
- progettazione;
- Conoscenza;
- materiali.

## 11. Struttura UX proposta

### Scheda lezione

Nuova sezione compatta:

**Dopo la lezione**
- stato riflessione;
- ultima modifica;
- azione “Com’è andata?”;
- eventuale indicatore “2 decisioni per il seguito”.

### Pannello riflessione

Ordine:
1. intestazione lezione;
2. osservazioni;
3. riflessione;
4. decisioni;
5. collegamenti a Conoscenza;
6. assistenza IA opzionale;
7. azioni di chiusura.

### Preparazione successiva

Blocco iniziale:
**Dalla lezione precedente**

Non deve occupare più spazio del necessario e può essere compresso.

## 12. Accessibilità

Requisiti minimi:
- tastiera completa;
- focus visibile;
- etichette esplicite;
- nessuna informazione solo tramite colore;
- stato comprensibile anche con lettore di schermo;
- controlli IA separati dai controlli di conferma;
- testi brevi e leggibili su LIM e schermi piccoli.

## 13. Errori e casi limite

### Nessuna riflessione
La lezione può essere chiusa normalmente.

### Più lezioni consecutive della stessa classe
Le decisioni devono mantenere sempre l’origine e non essere fuse automaticamente.

### Lezione modificata dopo la riflessione
Il sistema segnala che il contesto è cambiato e mantiene la riflessione storica.

### Risorsa di Conoscenza rimossa
Il collegamento appare come non disponibile senza cancellare la riflessione.

### IA non disponibile
Tutte le funzioni core devono restare utilizzabili.

## 14. Criteri di accettazione di prodotto

S1 è pronto per un gate di implementazione soltanto se il prototipo dimostra che:

1. un docente può registrare una riflessione in meno di un minuto;
2. osservazione, riflessione e decisione sono chiaramente distinguibili;
3. nessuna decisione viene applicata senza conferma;
4. la prossima lezione mostra solo elementi esplicitamente confermati;
5. l’IA è opzionale e non blocca il flusso;
6. Conoscenza è collegabile senza trasformare una fonte in materiale didattico;
7. Arena non viene modificata;
8. Atlas non è richiesto per il flusso;
9. nessun dato personale studente è richiesto;
10. ogni scrittura cross-surface produce feedback visibile.

## 15. Gate umano

La review umana deve verificare almeno:

- utilità reale dopo una lezione;
- carico cognitivo;
- chiarezza tra fatto e interpretazione;
- controllo docente;
- qualità del passaggio alla lezione successiva;
- assenza di automatismi opachi;
- leggibilità su desktop, mobile e LIM.

## 16. Fuori perimetro S1

Non fanno parte di S1:
- analisi longitudinali avanzate;
- dashboard di sviluppo professionale;
- corsi e attestati;
- simulazioni professionali;
- pubblicazione Atlas;
- modifiche ad Arena;
- valutazione studenti;
- valutazione docente;
- runtime agentico autonomo.

Questi elementi richiedono slice o decisioni successive.
