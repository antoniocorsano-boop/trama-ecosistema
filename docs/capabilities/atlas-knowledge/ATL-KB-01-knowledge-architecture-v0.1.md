# ATL-KB-01 — Patrimonio della conoscenza e integrazione curricolare

Data: 2026-11-15
Stato: DESIGN CANDIDATE / HUMAN REVIEW REQUIRED / NO RUNTIME
Ambito: TRAMA, Docente OS, Studio Atlas, Atlas, Arena
Scopo: rendere la conoscenza reperibile, comprensibile, riutilizzabile e collegabile al curricolo, senza confondere memoria professionale e biblioteca pubblica.

## Baseline e autorità

- [TRAMA-DOS-PP-01](../../product/r4-p2-professional-practice.md): KnowledgeResource != TeachingMaterial; conoscenza professionale nel dominio docente; nessuna scrittura silenziosa.
- [Architettura TRAMA](../../architecture/ecosystem-overview.md): Arena autorità curricolare; Atlas conoscenza navigabile; Docente OS progettazione professionale.
- [Studio Atlas, indice canonico](../atlas-percorsi/workflow/CANONICAL-INDEX-v1.md): produzione, qualificazione e pubblicazione governate.
- Atlas esistente: modello dati del curricolo (AtlasResource, objectiveIds) e fixture dei materiali nel repository Atlas. Non sostituire gli ID, i contratti o i percorsi esistenti.
- Il contratto v1 di scambio del curricolo e i contratti Arena→Atlas rimangono invariati. Usare gli identificativi e le versioni emessi da Arena; nessun secondo curricolo.
- Nessun nuovo runtime, pubblicazione studenti, servizio a pagamento o dipendenza da un modello IA implicita in questa specifica.

## 1. Modello logico

| Entità | Responsabilità | Identità e relazioni |
| --- | --- | --- |
| Fonte professionale | Docente OS / archivio privato | ID locale, provenienza, data, diritti, stato; mai esportare una chat intera o riferimenti privati verso Atlas |
| Nucleo concettuale | catalogo editoriale governato | ID stabile, titolo, definizione, sinonimi, domande, concetti collegati; indipendente da disciplina e UDA |
| Risorsa | Atlas / Studio Atlas | ID stabile esistente ove disponibile, versione, formato, contenuto, accessibilità, diritti, concetti rappresentati |
| Esperienza | Studio Atlas / Atlas | ID e versione, risorse, attività, risultati attesi, modalità, durata, difficoltà, evidenze generiche |
| Collegamento curricolare | Arena come fonte, associazione editoriale governata | riferimento all'ID obiettivo e alla versione approvata, ruolo didattico, motivazione, stato di verifica |
| Innesto UDA | Docente OS | riferimento a esperienza/risorsa e versione, fase UDA, obiettivo, adattamento locale, decisione del docente |

Relazioni molti-a-molti. Una risorsa può rappresentare più concetti; un concetto può avere più esperienze; una esperienza può concorrere a più obiettivi; una UDA può riusare più esperienze. Il collegamento inverso è una vista derivata, non una copia del dato.

## 2. Carta d'identità progressiva

**Acquisizione minima**: ID, titolo, tipo, sintesi fattuale, provenienza controllabile in sede privata, data, stato, classificazione privacy, stato diritti. Se non si dispone dell'originale, registrare una pista, non fingere di avere il documento.
**Catalogazione concettuale**: definizione, sinonimi, domande generatrici, mondi e temi multipli, relazioni tipizzate, prerequisiti, livello di approfondimento; distinguere concetto da singola rappresentazione.
**Qualificazione didattica**: destinatari, conoscenze, abilità, risultati attesi, disciplina/e, modalità, durata stimata, difficoltà, alternative accessibili, evidenze osservabili, riferimenti ai materiali; distinguere proposte da esiti accertati.
**Collegamento curricolare**: obiettivoId, versione/riferimento Arena, relazione (introduce, approfondisce, applica, verifica), motivazione, stato (proposto, verificato, obsoleto), data verifica. Non inventare codici. Una risorsa culturale senza obiettivo resta reperibile nel catalogo candidato.
**Pubblicazione**: contenuto effettivo recuperato/prodotto, diritti risolti, accessibilità verificata, revisione di contenuto e didattica, versione immutabile e approvazione esplicita secondo i gate esistenti. La scheda interna non contiene dati di studenti; la proiezione pubblica usa solo campi autorizzati.

Nessun dato identificativo di studenti, valutazione individuale, conversazione privata, segreto o informazione personale nei repository o nel catalogo pubblico. Provenienza dettagliata conservata soltanto nel dominio privato appropriato; nel catalogo condivisibile, fonte bibliografica o riferimento non identificante autorizzato.

## 3. Vocabolario e navigazione

Relazioni ammesse iniziali: più_generale_di, prerequisito_di, correlato_a, applicato_in, rappresentato_da, approfondito_da, concorre_a, produce_evidenza_di. Inversi derivati. Vietare auto-relazioni e cicli nella gerarchia e nei prerequisiti; consentire reti interdisciplinari non gerarchiche.
Sinonimi e varianti rimandano a un solo concetto; una disciplina non è una cartella proprietaria. I mondi sono viste editoriali, non classificazioni rigide.

Accessi per studente: ricerca per domanda o parole comuni; accesso diretto all'esperienza assegnata; esplorazione per tema; Storie/Laboratori/Scoperte/Percorsi; suggerimenti di prerequisito e approfondimento.
Accessi per docente: ricerca per obiettivo effettivo Arena e versione, UDA, disciplina, anno, durata, modalità, livello, accessibilità; visualizzazione del motivo di pertinenza; aggiunta esplicita alla fase UDA.
Accessi per Studio Atlas: fonti e nuclei candidati autorizzati, esperienze già esistenti, lacune di copertura, riuso di asset e lavori di revisione.
Ricerca iniziale deterministica e locale (titoli, sinonimi, domande, parole chiave, relazioni e filtri); ranking spiegabile: corrispondenza esatta a obiettivo verificato, concetto, adeguatezza destinatari, fase e durata. Ricerca semantica IA solo opzionale, mai necessaria e mai fonte di autorità. Nessun profilo individuale studente.

## 4. Flusso e qualità

Ricognizione → deduplicazione → acquisizione privata → estrazione di nucleo non personale → catalogazione candidata → verifica fonti/diritti → mappatura Arena → progettazione esperienza → qualificazione Studio Atlas → decisione umana di pubblicazione → riuso esplicito in UDA.

Stati indipendenti: reperimento (pista / originale recuperato), maturità editoriale (candidato / in revisione / qualificato), mappatura (assente / proposta / verificata / obsoleta), autorizzazione pubblicazione (non autorizzata / autorizzata secondo gate). Non promuovere uno stato perché un altro è positivo. Mantenere gli stati già definiti nei contratti e introdurre adattatori non distruttivi solo dopo verifica.
Revisioni di Arena: segnalare riferimenti obsoleti, non riassegnarli automaticamente. Revisioni della risorsa: mantenere riferimenti UDA alla versione scelta; aggiornamento volontario e motivato.
Copertura: per obiettivo mostrare esperienze qualificate e pubblicabili, candidate separate, lacune, data/versione della verifica. Una relazione non dimostra acquisizione della competenza.

## 5. Primo lotto verificabile e piste

Le seguenti risorse sono già presenti nei fixture di Atlas; ciò prova l'esistenza del record, non del materiale originale o l'approvazione curricolare. Non creare duplicati.
| ID esistente | Nucleo candidato | Obiettivo riportato nel fixture | Stato |
| --- | --- | --- | --- |
| r-tec-001 | tecnica, tecnologia, sistema tecnologico | tech-s2-1 | da verificare in Arena |
| r-tec-002 | tecnica e tecnologia | tech-s2-1 | da verificare in Arena |
| r-tec-003 | agricoltura come sistema tecnologico | tech-s2-1 | da verificare in Arena |
| r-ita-001 | comprensione del testo informativo | nessuno | mappatura assente |
| r-sci-001 | passaggi di stato della materia | nessuno | mappatura assente |

Piste editoriali generiche da censire in sede privata: energia e trasformazioni; agricoltura e filiere; disegno e progettazione; IA e algoritmi; tempo e misura; materiali ed economia circolare; abitare e costruire; invenzioni e società; cittadinanza; linguaggi e cultura. Nessuna affermazione di recupero integrale delle conversazioni, nessun riferimento a chat private in questo documento.

## 6. Sequenza di attuazione

1. KB-01A: inventario delle capacità e dei contratti già esistenti, verifica indipendente delle sovrapposizioni; conservare fonti originali in ambiente privato.
2. KB-01B: modello portabile con schema e fixture sintetici, regole di identificazione, deduplica e validazione; prova migrazione non distruttiva dei cinque record.
3. KB-01C: ricognizione per lotti, tracciamento delle fonti mancanti, controllo diritti e dati personali; solo derivati autorizzabili.
4. KB-01D: confronto con snapshot effettivo Arena, mappatura motivata e validata; nessun collegamento fittizio.
5. KB-01E: prototipo ricerca e navigazione in sola lettura, confronto tra ricerche per domanda, concetto e obiettivo.
6. KB-01F: proposta di innesto in Docente OS con conferma umana e riferimento immutabile; nessuna scrittura automatica.
7. KB-01G: copertura curricolare e priorità Studio Atlas; revisione indipendente prima di autorizzare implementazione/runtime/pubblicazione.

## 7. Criteri di accettazione del candidato

- I cinque ID esistenti sono preservati; nessun duplicato per sinonimia.
- Un concetto è reperibile tramite sinonimo, domanda e collegamento verificato; un risultato esplicita il motivo della pertinenza.
- Due UDA possono riusare la stessa risorsa senza copiarla; la rimozione da una UDA non elimina il contenuto.
- Mappature mancanti o obsolete sono distinguibili da quelle verificate; nessun ID inventato.
- Una fonte privata o una risorsa con diritti/accessibilità irrisolti non può apparire in una proiezione pubblica.
- Lo studente raggiunge direttamente l'esperienza senza navigare l'architettura curricolare; nessun account/profilo persistente nuovo.
- Il docente può accettare, modificare o respingere suggerimenti; nessuna dipendenza da IA a pagamento.
- I contratti esistenti e la continuità di navigazione restano invariati; verifiche su commit esatto e revisione umana prima dell'integrazione.

## Decisioni aperte

Inventario completo delle fonti non ancora eseguito; schema eseguibile, titolarità di ogni campo, vocabolario definitivo e prove di mappatura effettiva da qualificare nel lotto B. Non è autorizzata una nuova base dati centrale o un nuovo servizio. La specifica non costituisce approvazione editoriale né rilascio pubblico.
