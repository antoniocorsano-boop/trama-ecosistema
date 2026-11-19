# ATL-KB-01/F-R3d — Ricerca trasversale editoriale
Data: 2026-11-19. Stato: OFFLINE EDITORIAL PROTOTYPE / NO RUNTIME.
La ricerca riusa il validatore ATL-KB v0.2 e la ricevuta F-R3c. La [proiezione minima di collaudo](fixtures/f-r3d-search-evidence-v0.1.json) integra soltanto le etichette dei tre percorsi e i cinque testi degli obiettivi Missione 118, riscontrati nei dossier già citati; non è un catalogo autonomo. Nessuna copia dei materiali, URL di lancio o nuova rotta.

## Comportamento
- Quattro tipi di risultato: concetto, risorsa, esperienza, obiettivo candidato. Ricerca per titolo, sinonimo, domanda, termine correlato; distingue la corrispondenza diretta dal collegamento concetto–risorsa e dall'applicazione concettuale proposta in un'esperienza.
- Normalizzazione italiana di accenti, maiuscole e apostrofi; eliminazione delle parole funzionali per il confronto. Tutte le parole significative devono appartenere a una singola etichetta. Corrispondenza esatta prima di quella parziale con tutti i termini; termini correlati e associazioni hanno peso minore rispetto alle corrispondenze dirette comparabili. Non si inferiscono sinonimi o associazioni nuove. Ordinamento deterministico.
- Filtro per tipo e fascia scolastica; la fascia di un concetto deriva dai soli candidati associati, non è un'attribuzione curricolare del concetto.
- Ricerca per obiettivo: ID esatto, versione 1.3 e impronta b355be71; soltanto collegamenti propri, nessuna propagazione transitiva. Il riferimento storico tech-s2-1 non risolve alcun obiettivo corrente. I sei obiettivi consultabili sono quelli del lotto, non l'intero curricolo.
- Ogni risultato mostra motivo, stato e fonte; le risorse espongono stato di diritti e accessibilità, le esperienze lo stato di registro, gli obiettivi versione e autorità provvisoria. I punteggi sono ordinamento della ricerca, non valutazione dello studente.
- Modalità PUBLIC restituisce sempre una lista vuota: è un blocco deliberato del prototipo, non un nuovo sistema di autorizzazione. Non sostituisce il filtro del portale Esperienze. La futura integrazione deve usare le proiezioni pubbliche esistenti e autorizzate. Nessun profilo, tracciamento, rete o scrittura.

## Uso locale
Eseguire dalla radice del repository dopo l'installazione della dipendenza già prevista dal controllo ATL-KB:
```sh
python scripts/qualify_atlas_knowledge_candidate.py --surface EDITORIAL --search "Come funziona un'azienda agricola?"
python scripts/qualify_atlas_knowledge_candidate.py --surface EDITORIAL --search "sistema tecnologico" --kind EXPERIENCE
python scripts/qualify_atlas_knowledge_candidate.py --surface EDITORIAL --objective-id secondaria-di-primo-grado-tecnologia-classe-ii-o3 --source-version 1.3 --fingerprint b355be71
python scripts/qualify_atlas_knowledge_candidate.py --surface PUBLIC --search "Missione 118"
```
Il comando senza argomenti esegue le prove esistenti e le nove nuove prove trasversali, incluso controllo dei digest effettivi dei due file locali, assenza di mutazioni, determinismo e rifiuto di risultati pubblici.

## Casi di controllo
Domanda agricola → concetto agricolo e r-tec-003; non Missione 118 per transitività.
Sistema tecnologico → Missione 118 soltanto come applicazione concettuale proposta, non come risorsa utilizzata o competenza acquisita.
Prima di decidere, cosa manca? → percorso reperibile per titolo, senza attribuirgli obiettivi.
Obiettivo esatto Tecnologia II, ordinale 3 → obiettivo e r-tec-003; non Missione 118 (classe III).
Obiettivo esatto Tecnologia III, ordinale 5 → obiettivo e Missione 118; non r-tec-003.
Modalità pubblica → nessun risultato.

## Limiti e convergenza
Il prototipo non usa modelli IA, non effettua ricerca vettoriale, non promette interpretazione di domande arbitrarie e non è stato integrato nell'interfaccia Atlas. Il lotto contiene quattro concetti, cinque risorse, tre esperienze e sei obiettivi; nulla è pubblicabile. Le fonti esterne sono state riscontrate a commit esatti; il controllo locale non scarica nuovamente i repository esterni. F-R3e dovrà verificare la convergenza dei rami reali e il comportamento del portale e della modalità accessibile senza alterare il master tridimensionale. La produzione artistica parallela mantiene la propria sequenza e i propri gate.
