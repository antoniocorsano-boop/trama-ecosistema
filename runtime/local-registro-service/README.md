# trama-registro — runbook Android/Termux

`trama-registro` mantiene disponibile una build **già preparata** di Registro Docente sul telefono Android come servizio Termux supervisionato, esclusivamente su `127.0.0.1:4173`.

L'obiettivo d'uso quotidiano è:

`Android -> Termux:Boot -> runit -> trama-registro -> collegamento Registro Docente`

Il servizio non esegue `git pull`, installazioni di dipendenze, build, download di modelli o aggiornamenti automatici.

## Prerequisiti

Prima dell'installazione devono essere disponibili sul telefono:

- un checkout locale esatto di Registro Docente;
- una build di produzione già presente in `dist/`, compreso `dist/index.html`;
- `server.ts` e `package.json` nello stesso checkout;
- un runtime eseguibile già installato e compatibile con l'avvio diretto di `server.ts`;
- Python 3;
- `termux-services`/runit già configurato.

La preparazione o l'aggiornamento della build di Registro avviene **fuori** da `trama-registro`.

## Installazione una tantum

Definire il checkout dell'ecosistema, il checkout Registro e il runtime realmente usato sul dispositivo:

```sh
TRAMA_ROOT="$HOME/trama-ecosistema"
REGISTRO_ROOT="$HOME/registro-docente"
REGISTRO_SHA="$(git -C "$REGISTRO_ROOT" rev-parse HEAD)"
RUNTIME_COMMAND="/percorso/esatto/del/runtime"
```

Installare il servizio:

```sh
python3 "$TRAMA_ROOT/runtime/local-registro-service/trama_registro.py" install \
  --app-dir "$REGISTRO_ROOT" \
  --runtime-command "$RUNTIME_COMMAND" \
  --candidate-sha "$REGISTRO_SHA"
```

L'installazione verifica l'exact SHA del checkout, richiede che i file Git tracciati non abbiano modifiche staged/unstaged e congela un digest dell'intero albero `dist/`. Una modifica successiva a un file tracciato o a qualunque file della build fa fallire `start`, `status` e `smoke` in modalità chiusa finché il checkout non viene ripristinato o il nuovo candidato non viene reinstallato esplicitamente. I file non tracciati non sono usati come prova Git; l'integrità di `dist/` resta coperta dal digest completo.

Stato installato:

- configurazione: `~/.config/trama-registro/config.env`;
- comando: `$PREFIX/bin/trama-registro`;
- controller congelato: `$PREFIX/libexec/trama-registro/trama_registro.py` e `$PREFIX/libexec/trama-registro/registro_supervisor.py`;
- servizio runit: `$PREFIX/var/service/trama-registro`;
- log supervisionato: `$PREFIX/var/log/sv/trama-registro/current`;
- script Termux:Boot opzionale: `~/.termux/boot/30-trama-registro`.

## Prima attivazione e verifica

```sh
trama-registro start
trama-registro status
trama-registro smoke
```

Il risultato atteso è:

- servizio `trama-registro` attivo;
- risposta HTTP pronta su `http://127.0.0.1:4173/`;
- candidate SHA uguale al checkout installato;
- `Integrità candidato: verificata` nello stato;
- `Smoke LOCAL-REG-02: PASS`.

Se la porta `4173` è occupata da un processo non supervisionato, `trama-registro` **non lo termina**: l'avvio fallisce e richiede una risoluzione esplicita del conflitto.

## Avvio automatico con Termux:Boot

Dopo avere verificato manualmente `start`, `status` e `smoke`:

```sh
trama-registro install-boot
```

Lo script di boot attende runit e invoca il controller installato con `trama-registro start`; in questo modo il cold-start ripete la verifica di SHA, worktree tracciato e digest completo di `dist/` prima di autorizzare `sv up`. Non compila Registro, non aggiorna repository e non attiva la memoria semantica locale.

Dopo un riavvio Android, il collaudo corretto consiste nel **non aprire Termux** e aprire direttamente il collegamento di Registro Docente.

## Collegamento Android

L'indirizzo locale da usare è:

```text
http://127.0.0.1:4173
```

Dopo aver verificato che la pagina sia pronta, creare dal browser il collegamento alla schermata Home o installare la PWA, se proposta dal browser. Nell'uso ordinario il docente deve poter toccare soltanto questa icona.

## Memoria semantica locale

`trama-registro` e Local Semantic Memory restano due responsabilità distinte.

L'avvio di Registro **non autorizza e non attiva automaticamente** la memoria locale. L'eventuale comando/servizio `trama-memory` mantiene il proprio ciclo di vita; nel Registro l'utente conserva il gesto esplicito **«Attiva memoria locale»** previsto dal contratto LSM-01D/01E.

## Aggiornamento controllato di Registro

Non aggiornare il checkout sotto un servizio installato e poi riavviarlo direttamente. Procedere invece così:

1. `trama-registro stop`;
2. aggiornare il checkout Registro con la procedura governata prevista dal progetto;
3. produrre e verificare separatamente la nuova `dist/`;
4. acquisire il nuovo exact SHA;
5. rieseguire `trama-registro install` con lo SHA e il runtime esatti;
6. eseguire nuovamente `start`, `status` e `smoke`.

Il controllo su SHA e digest di `dist/` impedisce di avviare accidentalmente una combinazione diversa da quella installata.

## Collaudo hardware LOCAL-REG-02

Il collaudo finale deve essere eseguito sul telefono reale e senza modificare dati professionali:

```sh
trama-registro start && trama-registro status && trama-registro smoke
```

Poi:

1. installare Termux:Boot con `trama-registro install-boot`;
2. riavviare il dispositivo o eseguire il cold-start previsto dal protocollo;
3. non aprire Termux;
4. toccare il collegamento Android di Registro Docente;
5. verificare che `http://127.0.0.1:4173` sia disponibile;
6. verificare separatamente che **«Attiva memoria locale»** resti un gesto esplicito e distinto.

La PR LOCAL-REG-02 non deve essere integrata sulla sola base dei test cloud: il receipt hardware exact-SHA resta un gate separato.