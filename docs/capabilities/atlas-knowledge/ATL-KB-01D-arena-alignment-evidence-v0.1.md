# ATL-KB-01D — Raccordo con Arena: riscontro della base e regole di identità

Data: 2026-11-15
Stato: EVIDENCE / PROVISIONAL SOURCE / HUMAN REVIEW REQUIRED / NO RUNTIME
Nessuna modifica di Arena, Atlas o Docente OS; nessuna pubblicazione.

## Riscontro effettivo

| Elemento | Risultato |
| --- | --- |
| Revisione Arena | d8b1bf43388cb5c4cdcc940b0c558bb128976c4c |
| Revisione Atlas | d2938378c9384c5122adb8379396dbad5b4385fe |
| Identità del blob Git esportato e della copia Atlas | d1ab3fd860db9c043452e62359e404e4c9b94bfd (coincidente) |
| Versione del master | 1.3 |
| Impronta strutturale | b355be71 |
| Autorità | PROVISIONAL_COMPLETE |
| Ricevuta di approvazione | assente |
| Digest di integrità previsto per approvazione | assente |

Il riferimento è effettivamente presente nella base esportata, ma la base è provvisoria e non vigente. Non promuovere l'autorità, la pertinenza didattica o lo stato di pubblicazione per effetto della sola coincidenza dei blob.

## Identità degli obiettivi

L'esportazione contiene bande con testi di obiettivi; non attribuisce un ID permanente a ciascuna stringa. La proiezione Atlas genera l'identificativo dalla disciplina, dalla classe normalizzata e dall'ordinale (a partire da uno). Si tratta di identità proiettate e dipendenti dalla versione. Un collegamento deve conservare insieme ID proiettato, banda, ordinale, testo, versione, impronta, stato di autorità, motivazione e stato della revisione umana. Se cambia la versione o il testo/ordinale, riesaminare: non rimappare automaticamente.

Esempi effettivamente presenti nella fonte:

| ID proiettato | Banda | Testo |
| --- | --- | --- |
| tecnologia-classe-ii-o3 | secondaria-di-primo-grado-tecnologia-classe-ii | leggere processi produttivi |
| tecnologia-classe-ii-o5 | secondaria-di-primo-grado-tecnologia-classe-ii | organizzare informazioni |
| tecnologia-classe-iii-o2 | secondaria-di-primo-grado-tecnologia-classe-iii | analizzare sistemi energetici/produttivi |
| tecnologia-classe-iii-o4 | secondaria-di-primo-grado-tecnologia-classe-iii | usare dati |

Per le risorse esistenti r-tec-001, r-tec-002 e r-tec-003, il riferimento tech-s2-1 compare nel catalogo dimostrativo, non negli ID della proiezione Arena. Conservare gli ID risorsa e il riferimento storico; vietata sostituzione silenziosa. Per r-tec-003, l'obiettivo tecnologia-classe-ii-o3 costituisce una proposta motivata dal tema della risorsa, da validare. Non attribuire automaticamente lo stesso raccordo alle altre due risorse.

## UDA

Il documento di copertura canonica di Docente OS alla revisione 27e20e72454eafb0cf8212f61422f02dc6a60d6e dichiara 25 UDA indicizzate e i relativi codici. Esempi: CAN-UDA-2-01 (Agricoltura, suolo e produzioni sostenibili), CAN-UDA-2-06 (Rilievo, scale e proiezioni ortogonali), CAN-UDA-3-01 (Energia: forme, trasformazioni e fabbisogni), CAN-UDA-3-08 (Tecnologia, sostenibilità e scelte responsabili). La presenza documentale di un codice non dimostra l'innesto operativo, né l'approvazione di un'associazione.

## Regole di accettazione

- ricerca esatta per identificativo, non confronto per sottostringhe (classe II diversa da III);
- identità risorsa preservata;
- riferimento verificato distinto da pertinenza proposta, approvazione e pubblicazione;
- assenza di ricevuta di autorità blocca ogni dichiarazione di vigenza;
- riuso mediante riferimenti versionati, non copia dei contenuti o delle fonti professionali;
- conservazione delle fonti private e dei registri di ricognizione nel dominio privato, esclusi dal repository condiviso.

Il lotto di ricognizione privato non viene inserito in questo repository. Questo riscontro non costituisce revisione indipendente della PR né autorizzazione di un nuovo servizio.

## Aggiornamento F-R3b — 19 novembre 2026
Il contratto di identità sopra descrive la proiezione storica antecedente a F-R0. Non utilizzarla per nuove associazioni: Atlas #143 corregge l'ambiguità degli ID, #144 conserva il contesto semantico della fascia. I due rami sono ancora aperti. Al commit Atlas 2a681bcd4a611badcfa984b3b60b868eede21e55 il blob della fonte è identico a quello Arena, d1ab3fd860db9c043452e62359e404e4c9b94bfd, e il proiettore (blob a4dbcc5f452e3aef756ca1143dd964eee5d7f9d2) genera ID da fascia e ordinale. La proposta r-tec-003 usa ora secondaria-di-primo-grado-tecnologia-classe-ii-o3, testo «leggere processi produttivi», versione 1.3, impronta b355be71; riferimento esatto nella candidata, non approvato, non vigente. Il riferimento tech-s2-1 rimane storico irrisolto per tutti e tre i record. Nessuna associazione nuova per gli altri quattro. Il modello v0.2 rappresenta questi stati separatamente. Non inventa equivalenze, non pubblica e non modifica i riferimenti nel catalogo Atlas.
