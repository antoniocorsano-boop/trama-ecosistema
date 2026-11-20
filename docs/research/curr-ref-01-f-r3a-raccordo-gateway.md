# CURR-REF-01/F-R3a — Raccordo semantico con la Biblioteca 3D Atlas
Data: 2026-11-19. Stato: DESIGN CANDIDATE / READ ONLY / NO RUNTIME.
Evidenze e revisioni esatte: [ricevuta di raccordo](curr-ref-01-f-r3a-raccordo-gateway.json). Le PR sono ancora aperte; non sono una baseline integrata. Il documento non cambia la navigazione.

## Decisione di convergenza
Un'unica Biblioteca centrale, due linee di produzione coordinate. ASC/AWC conserva l'identità visiva, la geometria, la luce, i materiali, le interazioni e le prestazioni. CURR-REF-01 e ATL-KB organizzano la conoscenza. AG-02/AG-03 resta l'unico contratto di accesso; AWC non risolve riferimenti pedagogici, ATL-KB non genera geometria e il dossier F-R2 non impone alla sala una sequenza didattica. Una visita orientativa non equivale a una prestazione di apprendimento. Nessun quarto portale, nuovo archivio o nuovo risolutore.

## Riscontro al commit osservato
Il contratto storico AG-02 contiene tre portali; descrive la biblioteca delle esperienze come hub da costruire. Il codice candidato successivo ha già una pagina di aggregazione e un risolutore condiviso. Non confondere il documento storico con lo stato della candidata, né la candidata con il prodotto pubblicato.

| Identità | Stato osservato | Sviluppo semantico consentito in seguito |
| --- | --- | --- |
| curricolo | rotta /curricolo; /esplora raggiungibile; Arena autorità | consultazione fedele dei riferimenti, F-R0/F-R1; nessuna asserzione di vigenza |
| esperienze | rotta /esperienze, disponibile solo con ATLAS_GATEWAY_PREVIEW; ricerca per titolo e filtro tipologia, solo percorsi attivi autorizzati | ricerca concettuale, risorse e percorsi attraverso proiezioni esplicite; mantenere i cataloghi e il filtro di pubblicazione |
| studio | href null; messaggio professionale non ancora abilitato | nessun accesso fino a origine verificata, identità e autorizzazione |

Il registro dei percorsi osservato ha due candidati e zero autorizzazioni di esecuzione. Non confondere i percorsi ACTIVE con autorizzati. I cinque record ATL-KB sono descrizioni di risorse esistenti, non risorse pubblicabili: diritti irrisolti, accessibilità non verificata, originali non provati. Non devono entrare nella biblioteca pubblica per effetto della sola catalogazione. I tre record Tecnologia conservano il riferimento storico tech-s2-1, privo di versione; il riferimento non risolto non si sostituisce in blocco. I quattro concetti e la relazione del lotto restano candidati.

## Responsabilità e confini
- Arena: fonte del curricolo e autorità. CURR-REF-01 definisce criteri, non nuovi identificativi ministeriali.
- ATL-KB: concetti e associazioni editoriali. Identità stabile della risorsa, riferimenti versionati a fascia e obiettivo; non duplicare le fonti o inventare collegamenti.
- Studio Atlas: progettazione e qualificazione delle esperienze; dossier F-R2, evidenze e decisione di pubblicazione governata.
- AG-02/AG-03: portali, risoluzione, navigazione e sicurezza. Il componente ospitante usa l'identità dei tre portali sia per la scena sia per la navigazione equivalente; la scena non riceve i cataloghi privati.
- ASC/AWC: configurazione dei mondi e derivazione artistica/WebGL. Il riferimento library.reference è PLAN_ONLY, non un ambiente automaticamente qualificato.

## Invarianti di integrazione
1. La scena invia soltanto un'azione e un ID di portale ammesso attraverso il protocollo esistente; l'ospitante convalida origine, sorgente e canale. Non introdurre URL, dati personali o query private nel messaggio della scena.
2. Un'unica risoluzione esatta per la modalità 3D e l'alternativa HTML; mantenere il ritorno e l'accesso diretto. Nessun nuovo URL da un'etichetta o da un suggerimento.
3. La ricerca interna può restituire soltanto le proiezioni autorizzate alla specifica superficie. Un risultato curricolare provvisorio deve dichiarare la sua fonte e non vigenza; non costituisce autorizzazione editoriale.
4. Conservare separati provenienza, mappatura, qualità editoriale, diritti, accessibilità e autorizzazione. Un esito positivo in uno stato non promuove gli altri.
5. Per i riferimenti candidati usare fascia, ordinale, testo, versione, impronta e stato; in caso di deriva o ambiguità richiedere riesame, non rimappare automaticamente.
6. L'integrazione non richiede nuovi asset 3D. Il catalogo dei mondi non deve contenere copie del curricolo o dell'indice di conoscenza. Una variazione artistica non cambia le destinazioni.
7. Nessun collegamento a lab, demo, origini professionali non autorizzate o pacchetti non pubblicabili. La rotta candidata resta protetta dal controllo di anteprima.

## Sequenza con dipendenze esplicite
F-R3b: nel candidato ATL-KB (TRAMA #336), riallineare i cinque record esistenti, mantenere i riferimenti storici e qualificare il modello di proiezione senza pubblicarlo. Evitare un secondo schema; proporre lì un'evoluzione versionata se necessaria.
F-R3c: riferimenti motivati a obiettivi e concetti, con F-R0 e F-R1 quali dipendenze. Separare corrispondenza strutturale da pertinenza didattica e approvazione. Per Profilo, obiettivi generali e nuclei, attendere il raccordo con Arena.
F-R3d: ricerca deterministica e spiegabile nel portale Esperienze già presente, preservando i filtri esistenti. Consultazione curricolare resta nel relativo portale. Prima prova su dati sintetici o candidati privati, non sul catalogo pubblico.
F-R3e: confronto del commit esatto della candidata artistica con il ramo semantico, test dei tre portali, accesso diretto, ritorno, tastiera, fallback 2D, mobile, errore WebGL e assenza di accessi non autorizzati. Conservare il master e le evidenze visive, non alterare il budget di produzione. Solo dopo verifiche e decisione umana può essere proposta l'integrazione.

F-R4 riguarda le esperienze formative, non il semplice ingresso alla Biblioteca. Può preparare criteri di riesame indipendentemente dalla produzione artistica.

## Qualificazione e limiti
Il test strutturale della ricevuta verifica vincoli e riferimenti interni. Non equivale a riesecuzione dei test browser, verifica delle revisioni future, autorizzazione Studio o pubblicazione. Ripetere il confronto dei blob sui commit da integrare; se uno è cambiato, rivalutare le osservazioni. Le PR #143, #144, #136, #145 e TRAMA #336 sono dipendenze aperte al momento del riscontro. Non accorpare i rami artistici a questa PR. Nessuna modifica operativa alle destinazioni, ai modelli 3D, al motore, ai contratti o ai cataloghi.
