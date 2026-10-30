# LSM-01B — memoria semantica locale di riferimento per Termux

Questo runtime implementa il contratto `@trama/contextual-copilot-semantic-memory@0.1.0` come **indice semantico derivato e ricostruibile**. Non è una fonte canonica di UDA, lezioni, memoria professionale o curricolo.

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

## 2. Avviare l'endpoint embedding locale

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

## 3. Configurare il daemon LSM

Esempio:

```sh
export TRAMA_MEMORY_HOME="$HOME/.local/share/trama-semantic-memory"
export TRAMA_MEMORY_HOST="127.0.0.1"
export TRAMA_MEMORY_PORT="8765"
export TRAMA_MEMORY_DB="$TRAMA_MEMORY_HOME/semantic-memory.sqlite3"
export TRAMA_MEMORY_TOKEN_FILE="$TRAMA_MEMORY_HOME/semantic-memory.token"
export TRAMA_MEMORY_ALLOWED_ORIGINS="https://origine-pwa-esatta.example"
export TRAMA_EMBEDDING_URL="http://127.0.0.1:8080"
export TRAMA_EMBEDDING_MODEL="embeddinggemma-2-local"
```

`TRAMA_MEMORY_ALLOWED_ORIGINS` è una lista separata da virgole di **origini esatte**. Il carattere jolly non è ammesso.

Per attivare facoltativamente `sqlite-vec`, indicare il percorso assoluto di una libreria già installata localmente:

```sh
export TRAMA_SQLITE_VEC_PATH="/percorso/assoluto/vec0.so"
```

Se l'estensione non supera la verifica di caricamento, il servizio continua con il backend lineare e lo stato health diventa `degraded`.

## 4. Avviare il runtime

```sh
cd /percorso/di/trama-ecosistema/runtime/local-semantic-memory
./run_termux.sh
```

Il token locale viene creato al primo avvio nel file configurato, con permessi `0600` dove supportati. Il token non viene restituito dagli endpoint e non viene scritto nei log. I consumer autorizzati devono riceverlo tramite una procedura locale esplicita di abbinamento; LSM-01B non implementa ancora tale interfaccia prodotto.

Verifica health:

```sh
curl -s http://127.0.0.1:8765/v1/health
```

Una risposta sana usa lo schema `trama.semantic-memory-health/v1` e non contiene token, percorsi del database o contenuti indicizzati.

## 5. Collegamento da una PWA

Una PWA pubblica deve essere servita da un **contesto sicuro HTTPS** e usare CORS con la propria origine esatta. Nei browser Chromium attuali l'accesso da un'origine pubblica al loopback è soggetto all'autorizzazione di rete locale `loopback-network`.

Il primo tentativo di connessione **non deve partire automaticamente al caricamento della pagina o da un service worker**. Deve essere attivato da un **gesto esplicito** dell'utente, per esempio un pulsante “Collega memoria locale”, dopo aver spiegato perché è richiesto l'accesso al servizio sul dispositivo.

Non aggiungere le vecchie intestazioni Private Network Access come meccanismo di compatibilità: il runtime usa CORS standard e il consumer deve gestire l'autorizzazione browser.

## 6. Rebuild esplicito

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

## 7. Qualificazione automatica

```sh
python3 -m unittest discover -s runtime/local-semantic-memory/tests -v
python3 -m unittest tests.test_local_semantic_memory_runtime_boundary -v
python3 -m unittest discover -s tests -v
```

Lo smoke automatico usa un endpoint embedding fittizio sul loopback e verifica create, ricerca, replace CAS, remove CAS e riavvio sullo stesso SQLite.

## 8. Qualificazione manuale sul dispositivo

La qualifica hardware richiede un dispositivo Android/Termux reale e non viene sostituita dai test automatici. Registrare senza dati personali:

- modello GGUF e digest/versione;
- versione/commit di `llama.cpp` e comando di avvio;
- ABI del dispositivo;
- dimensionalità restituita da `/v1/embeddings`;
- stato health iniziale;
- latenza indicativa di indicizzazione e ricerca su corpus sintetico;
- persistenza dopo riavvio;
- comportamento offline con tutti i file già locali;
- passaggio intenzionale a modello/dimensione incompatibile con risultato `rebuild-required`.

Usare esclusivamente un corpus sintetico non personale per questa qualifica.
