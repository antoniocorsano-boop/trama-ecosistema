# LSM-01E — Termux Service Supervisor

## Intento

Ridurre l'uso quotidiano della memoria semantica locale a una sola azione nel Registro (`Attiva memoria locale`), rendendo Termux infrastruttura locale supervisionata e non parte del flusso ordinario del docente.

## Obiettivi

- configurazione Termux una tantum;
- un solo comando `trama-memory` per installazione, avvio, arresto, stato e smoke;
- supervisione distinta di EmbeddingGemma/llama-server e `trama-memoryd` tramite `termux-services`/runit;
- avvio automatico opzionale dopo riavvio Android tramite Termux:Boot;
- nessun token copiato o mostrato nel browser;
- nessun wildcard CORS e nessun accesso LAN;
- smoke hardware ridotto a un solo comando e corpus sintetico;
- nessun merge/deploy implicito.

## Non-obiettivi

- non modificare il contratto LSM-01D del consumer Registro;
- non introdurre probe automatici dal browser;
- non sincronizzare automaticamente Biblioteca/Professional Memory;
- non scaricare automaticamente modelli GGUF o binari `llama-server`;
- non rendere il runtime raggiungibile fuori dal loopback;
- non usare l'indice LSM come fonte canonica.

## Approcci considerati

### A. `nohup` + PID file

Semplice, ma fragile dopo crash/riavvio e responsabile dell'attrito osservato durante lo smoke. Scartato.

### B. Un unico processo supervisore shell

Riduce i comandi ma concentra gestione figli, restart e log in uno script proprietario. Più difficile da diagnosticare e meno aderente agli strumenti Termux esistenti. Scartato.

### C. `termux-services` + `trama-memory` — scelto

Usa runit già supportato da Termux per due servizi separati (`trama-embedding`, `trama-memoryd`). Il comando `trama-memory` installa/configura e controlla lo stack; Termux:Boot resta opzionale per l'avvio al boot. È la soluzione più robusta e rende il terminale irrilevante nell'uso quotidiano.

## Architettura

### Configurazione

File utente: `~/.config/trama-memory/config.env`.

Contiene solo configurazione non segreta:

- percorso assoluto di `llama-server`;
- percorso assoluto del GGUF EmbeddingGemma;
- percorso runtime LSM;
- host/porte loopback;
- origini browser esatte consentite;
- modello dichiarato e TTL sessione.

Il master token continua a essere gestito da `trama-memoryd` nel proprio token file e non viene copiato nella configurazione CLI.

### Servizi

`trama-embedding` esegue `llama-server --embedding`, con bind esclusivo `127.0.0.1` e nessun download modello.

`trama-memoryd` attende l'endpoint embedding loopback, esporta la configurazione LSM e poi esegue `main.py` del runtime installato, sempre su `127.0.0.1`.

### CLI

- `trama-memory install`: valida configurazione e crea wrapper/servizi;
- `trama-memory start`: avvia embedding, attende health, poi memoryd e attende health LSM;
- `trama-memory stop`: arresta memoryd e poi embedding;
- `trama-memory status`: restituisce uno stato sintetico senza token;
- `trama-memory smoke`: esegue una qualifica hardware sintetica e pulisce le proprie proiezioni;
- `trama-memory install-boot`: crea lo script `~/.termux/boot/20-trama-memory-services` senza includere segreti.

## Sicurezza e autorità

- host LSM ed embedding: solo `127.0.0.1`;
- origini CORS: lista esatta, wildcard vietata;
- capability LSM-01D effimere e origin-bound invariate;
- nessun master token in stdout, log CLI, config o browser;
- nessun `curl | sh`, download automatico o esecuzione remota;
- `smoke` usa solo dati sintetici e rimuove la proiezione creata;
- `install` non cancella database o token esistenti.

## UX target

### Configurazione una tantum

1. installare `termux-services`;
2. eseguire una sola volta `trama-memory install ...`;
3. facoltativamente configurare Termux:Boot;
4. da quel momento i servizi sono supervisionati.

### Uso quotidiano

1. aprire Registro Docente;
2. `Attiva memoria locale`;
3. usare ricerca/sincronizzazione.

Nessun token, porta, comando Termux o riavvio manuale deve comparire nel percorso ordinario.

## Qualificazione

TDD e CI devono provare almeno:

- installer fail-closed se mancano percorso modello/origine o se compare `*`;
- servizi generati bindano solo loopback;
- nessun comando contiene download automatici;
- memoryd attende embedding prima di avviarsi;
- start/stop/status non stampano token;
- smoke usa solo corpus sintetico e pulisce la propria proiezione;
- script boot usa il meccanismo Termux:Boot ufficiale senza incorporare segreti.

La prova finale resta su Android/Termux reale perché supervisione dei processi e boot non sono qualificabili integralmente su GitHub Actions.
