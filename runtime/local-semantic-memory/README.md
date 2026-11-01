# LSM-01B/01D — memoria semantica locale di riferimento per Termux

Questo runtime implementa il contratto `@trama/contextual-copilot-semantic-memory@0.1.0` come **indice semantico derivato e ricostruibile**. Non è una fonte canonica di UDA, lezioni, memoria professionale o curricolo.

LSM-01D aggiunge un bootstrap di sessione locale: il master token resta esclusivamente in Termux, mentre il consumer browser ottiene dopo un gesto esplicito una capability effimera, legata all’origine e conservata solo in memoria.

## Perimetro della v1

- solo testo;
- servizio HTTP legato al loopback, normalmente `127.0.0.1:8765`;
- SQLite locale come indice derivato;
- embedding ottenuti esclusivamente da un endpoint HTTP loopback;
- ricerca lineare sempre disponibile;
- `sqlite-vec` facoltativo come accelerazione;
- nessun fallback verso provider remoti;
- nessun endpoint SQL, file system, shell o download di modelli.

## 1. Prerequisiti in Termux

Occorrono Python 3 e SQLite. Per il profilo di riferimento servono inoltre una build recente di `llama.cpp`, il binario `llama-server` e un file GGUF di **EmbeddingGemma 2** già presente sul dispositivo.

Il runtime **non scarica né installa automaticamente** modelli o binari. Conservare modello e sorgenti in percorsi scelti dall'utente e verificati separatamente.

Una build locale di `llama-server`, quando i sorgenti di `llama.cpp` sono già disponibili, può essere prodotta con CMake:

```sh
cd "$HOME/src/llama.cpp"
cmake -B build
cmake --build build --config Release -t llama-server
```

## 2. LSM-01E — configurazione una tantum e uso quotidiano

LSM-01E rende Termux infrastruttura supervisionata: nell'uso quotidiano il docente non deve avviare processi, copiare token o gestire porte. I due servizi locali restano separati: `trama-embedding` per EmbeddingGemma/`llama-server` e `trama-memoryd` per la memoria semantica.

### Configurazione una tantum

1. Installare una sola volta il supervisore runit di Termux:

```sh
pkg install termux-services
```

Terminata l'installazione, **riavviare la shell Termux** una sola volta affinché il `service-daemon` venga avviato dal profilo di `termux-services`. Questo passaggio appartiene esclusivamente alla configurazione iniziale, non all'uso quotidiano.

2. Con runtime LSM, `llama-server` e GGUF già presenti sul dispositivo, eseguire il bootstrap. **Alla prima installazione assoluta** il comando stabile `trama-memory` non esiste ancora, perché viene creato proprio dall'installazione: entrare quindi nella directory del runtime ed eseguire direttamente il modulo Python. L'origine deve essere esatta e non può contenere caratteri jolly:

```sh
cd "$HOME/src/trama-ecosistema/runtime/local-semantic-memory"
python3 trama_memory.py install \
  --runtime-dir "$HOME/src/trama-ecosistema/runtime/local-semantic-memory" \
  --llama-server "$HOME/src/llama.cpp/build/bin/llama-server" \
  --model "$HOME/models/embeddinggemma-2.gguf" \
  --origin "http://127.0.0.1:4173"
```

Dopo questo bootstrap, il sottocomando di installazione e riconfigurazione è disponibile come `trama-memory install`; tutte le operazioni successive usano il solo comando stabile `trama-memory`.

L'installazione crea `~/.config/trama-memory/config.env`, il comando stabile `trama-memory` e i servizi `trama-embedding` e `trama-memoryd`. La configurazione contiene solo parametri non segreti: **nessun token** viene copiato nel file, nell'output del comando o nel browser. Il master token resta gestito dal runtime nel proprio file locale.

LSM-01E richiede che modello GGUF e binario `llama-server` esistano già: **nessun download automatico** di modelli o binari viene eseguito.

3. Avviare lo stack supervisionato e verificarne lo stato:

```sh
trama-memory start
trama-memory status
```

`trama-memory start` avvia prima `trama-embedding`, attende l'health loopback e solo dopo avvia `trama-memoryd`. Per arrestare intenzionalmente lo stack:

```sh
trama-memory stop
```

4. Facoltativamente, per riattivare i servizi dopo un riavvio Android, usare **Termux:Boot**. Come prerequisito, installare l'applicazione e **aprire Termux:Boot almeno una volta** dal launcher Android; solo dopo installare lo script di avvio:

```sh
trama-memory install-boot
```

Lo script viene creato in `~/.termux/boot/20-trama-memory-services` e non incorpora segreti.

5. La qualifica hardware, quando serve, è un solo comando e usa esclusivamente un **corpus sintetico** con cleanup finale:

```sh
trama-memory smoke
```

### Uso quotidiano

Dopo la configurazione una tantum, il percorso ordinario è browser-only:

1. aprire **Registro Docente**;
2. scegliere **Attiva memoria locale**;
3. usare ricerca e sincronizzazione tramite i normali gesti del Registro.

Nel percorso ordinario non compaiono token, porte, comandi Termux o riavvii manuali. `trama-memory start`, `trama-memory stop`, `trama-memory status` e `trama-memory smoke` restano strumenti di amministrazione e diagnosi, non passaggi della giornata del docente.

### Dettaglio tecnico e diagnostica

Le sezioni seguenti descrivono i processi sottostanti e restano utili per diagnosi, sviluppo e qualificazione. Non costituiscono il flusso quotidiano raccomandato.

## 3. Dettaglio tecnico: endpoint embedding locale

Esempio con un GGUF già disponibile:

```sh
MODEL="$HOME/models/embeddinggemma-2.gguf"
"$HOME/src/llama.cpp/build/bin/llama-server" \
  -m "$MODEL" \
  --embedding \
  --host 127.0.0.1 \
  --port 8080 \
  --no-webui
```

`llama-server` espone l'endpoint compatibile OpenAI `POST /v1/embeddings`. Il runtime LSM accetta come provider embedding soltanto `http://127.0.0.1`, `http://localhost` o `http://[::1]`.

Non usare in questo profilo opzioni che scaricano modelli da rete: il file GGUF deve essere già locale.

## 4. Dettaglio tecnico: configurare il daemon LSM

Esempio per lo smoke locale del Registro servito da `127.0.0.1:4173`:

```sh
export TRAMA_MEMORY_HOME="$HOME/.local/share/trama-semantic-memory"
export TRAMA_MEMORY_HOST="127.0.0.1"
export TRAMA_MEMORY_PORT="8765"
export TRAMA_MEMORY_DB="$TRAMA_MEMORY_HOME/semantic-memory.sqlite3"
export TRAMA_MEMORY_TOKEN_FILE="$TRAMA_MEMORY_HOME/semantic-memory.token"
export TRAMA_MEMORY_ALLOWED_ORIGINS="http://127.0.0.1:4173"
export TRAMA_MEMORY_SESSION_TTL_SECONDS="28800"
export TRAMA_EMBEDDING_URL="http://127.0.0.1:8080"
export TRAMA_EMBEDDING_MODEL="embeddinggemma-2-local"
```

`TRAMA_MEMORY_ALLOWED_ORIGINS` è una lista separata da virgole di **origini esatte**. Il carattere jolly non è ammesso. In una distribuzione diversa sostituire l’origine di esempio con la sola origine effettivamente usata dal consumer.

`TRAMA_MEMORY_SESSION_TTL_SECONDS` controlla la durata delle capability effimere. Il default è `28800` secondi (8 ore); il runtime accetta valori compresi tra 60 e 86400 secondi.

Per attivare facoltativamente `sqlite-vec`, indicare il percorso assoluto di una libreria già installata localmente:

```sh
export TRAMA_SQLITE_VEC_PATH="/percorso/assoluto/vec0.so"
```

Se l'estensione non supera la verifica di caricamento, il servizio continua con il backend lineare e lo stato health diventa `degraded`.

## 5. Dettaglio tecnico: avviare il runtime

```sh
cd /percorso/di/trama-ecosistema/runtime/local-semantic-memory
./run_termux.sh
```

Il master token locale viene creato al primo avvio nel file configurato, con permessi `0600` dove supportati. Non viene restituito da health, non viene scritto nei log e resta utile per strumenti amministrativi/locali.

**Non copiare il master token nel browser.** Il consumer usa invece `POST /v1/session` dopo un gesto esplicito dell’utente; il runtime restituisce una capability bearer effimera, legata all’origine, con scadenza e conservata soltanto in memoria. Il riavvio di `trama-memoryd` invalida tutte le capability di sessione.

Verifica health:

```sh
curl -s http://127.0.0.1:8765/v1/health
```

Una risposta sana usa lo schema `trama.semantic-memory-health/v1` e non contiene token, percorsi del database o contenuti indicizzati.

## 6. Collegamento da una PWA

Una PWA pubblica deve essere servita da un **contesto sicuro HTTPS** e usare CORS con la propria origine esatta. Nei browser Chromium attuali l'accesso da un'origine pubblica al loopback è soggetto all'autorizzazione di rete locale `loopback-network`.

Il primo tentativo di connessione **non deve partire automaticamente al caricamento della pagina o da un service worker**. Deve essere attivato da un **gesto esplicito** dell'utente, per esempio `Attiva memoria locale`, dopo aver spiegato perché è richiesto l'accesso al servizio sul dispositivo.

Il bootstrap browser usa:

```text
POST /v1/session
```

La richiesta non porta il master token. Se l’origine è nella whitelist e il runtime è sano, la risposta contiene una capability effimera e il payload health. L’attivazione non sincronizza né indicizza automaticamente nulla: `Sincronizza` resta un gesto separato del consumer.

Nel consumer Chromium la richiesta al loopback deve inoltre dichiarare esplicitamente lo spazio di indirizzamento quando l'API del browser lo supporta, per esempio:

```js
await fetch('http://127.0.0.1:8765/v1/session', {
  method: 'POST',
  targetAddressSpace: 'loopback',
  credentials: 'omit',
  cache: 'no-store',
  redirect: 'error'
});
```

Non aggiungere wildcard CORS o le vecchie intestazioni Private Network Access come meccanismo di compatibilità: il runtime usa CORS standard e il consumer deve gestire l'autorizzazione browser.

Dopo ricarica o nuova sessione del consumer, la capability browser non viene recuperata da storage. Il docente può riattivare la memoria con un nuovo gesto esplicito, senza digitare token.

## 7. Rebuild esplicito

SQLite è soltanto un indice derivato. Se `health.status` diventa `rebuild-required` perché il modello o la dimensionalità non coincidono con l'indice esistente:

1. arrestare il daemon LSM;
2. conservare il file token;
3. eliminare il database derivato e gli eventuali file WAL/SHM;
4. riavviare il daemon;
5. fare riproiettare gli oggetti dai prodotti canonici con il normale contratto CAS.

Esempio, **solo a daemon arrestato**:

```sh
rm -f "$TRAMA_MEMORY_DB" "$TRAMA_MEMORY_DB-wal" "$TRAMA_MEMORY_DB-shm"
```

La cancellazione del database LSM non deve comportare perdita professionale: se accade, un consumer sta usando l'indice come fonte canonica e viola il disegno LSM-01.

## 8. Qualificazione automatica

```sh
python3 -m unittest discover -s runtime/local-semantic-memory/tests -v
python3 -m unittest tests.test_local_semantic_memory_runtime_boundary -v
python3 -m unittest discover -s tests -v
```

Lo smoke automatico usa un endpoint embedding fittizio sul loopback e verifica create, ricerca, replace CAS, remove CAS, bootstrap di sessione e riavvio sullo stesso SQLite.

## 9. Qualificazione manuale sul dispositivo

La qualifica hardware richiede un dispositivo Android/Termux reale e non viene sostituita dai test automatici. Registrare senza dati personali:

- modello GGUF e digest/versione;
- versione/commit di `llama.cpp` e comando di avvio;
- ABI del dispositivo;
- dimensionalità restituita da `/v1/embeddings`;
- stato health iniziale;
- attivazione browser tramite `/v1/session` senza esposizione del master token;
- latenza indicativa di indicizzazione e ricerca su corpus sintetico;
- persistenza dell’indice dopo riavvio e invalidazione delle capability di sessione;
- comportamento offline con tutti i file già locali;
- passaggio intenzionale a modello/dimensione incompatibile con risultato `rebuild-required`.

Usare esclusivamente un corpus sintetico non personale per questa qualifica.
