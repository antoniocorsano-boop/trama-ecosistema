# CURR-REF-01/F-R3e — Convergenza Atlas: verifica preventiva
Data: 2026-11-19. Stato: STATIC COMPATIBILITY CHECKED / INTEGRATION BLOCKED.
[Ricevuta con revisioni, controlli e blob](curr-ref-01-f-r3e-convergenza-atlas.json).

## Decisione
La linea Biblioteca LBC realizza il portale effettivo; ASC/AWC resta infrastruttura riutilizzabile separata. Non aprire una quarta linea di produzione e non estendere il lavoro artistico con questo intervento. La ricerca ATL-KB resta editoriale, offline e non pubblicabile. F-R3e confluisce nella fase LBC-03 già prevista nel documento di completamento della Biblioteca, non in un'altra implementazione del portale.

## Riscontro dei rami
Confronto cumulativo dal comune antenato Atlas d2938378c9384c5122adb8379396dbad5b4385fe: 232 file modificati nella linea Biblioteca (#147), 12 nella linea semantica (#144, inclusa #143). Un solo percorso in comune, il registro TERM-01; nessun file del master o del portale modificato dalla linea semantica. Non è un test di fusione.
Nel registro, i 15 elementi originari sono preservati da entrambe le linee; tre eccezioni tecniche nella Biblioteca e una nella linea semantica, non sovrapposte. Tutti gli altri campi sono uguali. Unione prevista di 19 eccezioni esatte, non applicata: preservare percorso, frammento, motivo, rifiutare collisioni e allargamenti. Verificare anche l'inventario delle occorrenze residue e i controlli della terminologia dopo l'integrazione.
In TRAMA, confronto dal comune antenato 4d9b7b487f3f920dad54593683b19a742d639b84: 12 file modificati nel ramo ATL-KB #336 e 39 nel ramo CURR-REF #348 (inclusi i cambiamenti del ramo principale intervenuti prima della sua apertura). Nessun percorso modificato da entrambi nei commit osservati. Il confronto non prova compatibilità esecutiva.

## Contratto del portale
Il risolutore e il componente ospitante conservano gli stessi blob esaminati in F-R3a: curricolo, esperienze, studio. Le due destinazioni reali candidate sono /curricolo e /esperienze, Studio resta senza destinazione. La modalità alternativa HTML usa gli stessi ID. La pagina Esperienze è condizionata all'anteprima e riusa il filtro del registro; due percorsi candidati, zero autorizzati. ATL-KB v0.2 e la ricerca F-R3d non possono diventare un catalogo pubblico, neppure in una pagina di anteprima accessibile agli studenti. Nessuna importazione diretta dei file editoriali nel codice pubblico. L'interfaccia futura deve ricevere soltanto una proiezione minimizzata e autorizzata dai contratti esistenti, senza nuovo risolutore o servizio.
Il test di navigazione differenziale già esistente verifica accesso testuale, movimento ridotto, selezione del portale nella scena, cambio di documento, assenza della scena residua e stato vuoto del catalogo. Il controllo WebGL locale della #147 è positivo, ma non è un collaudo del ramo semantico congiunto o dell'intera Biblioteca. Riutilizzare la matrice esistente, senza introdurre un altro motore.

## Blocco effettivo e sequenza
La #146 ha superato cinque procedure: campata reale 04-0, non intera Biblioteca. Al commit #147 osservato, il controllo LBC-01 fallisce nella fase di bake dei nove materiali: override del materiale di un libro della campata. La qualifica visiva completa, l'estensione LBC-02, la convergenza LBC-03 e il collaudo fisico/artisticamente approvato LBC-04 restano aperti. L'errore compete alla linea LBC; nessuna correzione concorrente da CURR-REF.
AWC #136 ha controlli specifici AWC-A e AWC-B positivi al commit osservato; altri controlli erano in corso. Non confondere questo risultato con completamento della Biblioteca o autorizzazione di rilascio.

## Collaudo congiunto da eseguire su candidato isolato
1. Chiudere LBC-01 e LBC-02 nella linea Biblioteca. Fissare nuovi head esatti, ripetere il confronto e verificarne i cambiamenti.
2. Preparare una candidata con la linea semantica F-R0/F-R1, senza modificare i rami di produzione; risolvere il solo registro condiviso mediante regole esatte, se il nuovo confronto lo conferma.
3. Eseguire controllo autorità Arena, regressione di identità e contesto, TERM-01 e matrice di navigazione già esistente. Verificare accesso diretto, ritorno, tastiera, touch, movimento ridotto, fallback WebGL, stato vuoto, Studio bloccato e assenza di accesso a lab/demo; verificare ID storici ambigui senza reindirizzamento automatico.
4. Qualificare la proiezione editoriale separatamente, senza esposizione di candidati nel portale pubblico. Nessun risultato pubblico del lotto corrente. Colmare diritti e accessibilità prima di ogni promozione.
5. Riesame professionale e artistico, prove su dispositivi fisici e autorizzazione esplicita separata. Nessuna fusione o pubblicazione automatica.

F-R3e è completata soltanto come verifica preventiva. Il collaudo congiunto non è stato eseguito e rimane bloccato. F-R4 (qualificazione pedagogica delle esperienze), riesame editoriale e approfondimenti Arena possono proseguire indipendentemente; non avviare ulteriori studi sulla Biblioteca da questo ramo.
