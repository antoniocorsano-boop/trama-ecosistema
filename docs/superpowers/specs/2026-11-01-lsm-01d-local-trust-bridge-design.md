# LSM-01D — Local Trust Bridge

**Data:** 2026-11-01  
**Stato:** DESIGN — DOCS ONLY  
**TRAMA baseline:** `trama-ecosistema@947e18de723dc1e4e2eb2c9031596f8c552a848a`  
**Registro baseline osservato:** `registro-docente@33d486db1e2258a82ccd016274ab8db0d3e1b691`  
**Dipendenze:** LSM-01A shared contract, LSM-01B Termux runtime, LSM-01C consumer adoption  
**Vincolo:** nessun merge/deploy implicito; #97 resta invariata e qualificata sul proprio exact SHA.

## 1. Intento

Eliminare l’inserimento manuale del token LSM dall’interfaccia del Registro senza spostare il segreto nel browser, nel vault professionale o nei backup.

L’esperienza obiettivo è:

```text
Impostazioni
  → Memoria semantica locale
  → Attiva memoria locale
  → Pronta
```

Il docente non copia, vede o gestisce token. Il segreto persistente resta esclusivamente nel runtime Termux. Il consumer riceve soltanto una capacità effimera, valida per la sessione corrente, ottenuta dopo un gesto esplicito dell’utente.

## 2. Problema osservato

Lo smoke Android reale ha qualificato la catena Registro → `trama-memoryd` → EmbeddingGemma → indice → ricerca semantica. Ha però evidenziato due attriti operativi:

1. il token persistente del daemon deve essere copiato manualmente nel Registro a ogni nuova sessione;
2. l’origine del consumer deve essere configurata esplicitamente nel runtime Termux.

Il primo punto è un costo UX ricorrente e non aggiunge sicurezza percepibile al docente. Il secondo è corretto come principio, ma deve diventare parte dell’installazione/configurazione governata, non un intervento manuale durante l’uso ordinario.

## 3. Principi da preservare

LSM-01D non modifica i principi già fissati da LSM-01:

- il runtime resta **loopback-only**;
- nessun bind `0.0.0.0`, LAN sharing o discovery;
- CORS solo per origini esplicitamente ammesse, mai wildcard;
- nessun dato studente;
- SQLite e vettori restano indice derivato e ricostruibile;
- nessuna sincronizzazione automatica senza opt-in del docente;
- nessun probe automatico del loopback al semplice caricamento della pagina;
- nessun segreto LSM nel vault canonico, nelle impostazioni applicative o nei backup;
- nessun fallback remoto;
- il consumer resta fail-closed se il runtime non è disponibile o il contratto non è valido.

## 4. Approcci considerati

### A. Token in `sessionStorage`

Riduce la digitazione dopo navigazioni interne, ma il token va reinserito dopo un nuovo caricamento/sessione. Migliora solo parzialmente l’esperienza.

**Non selezionato.**

### B. Token persistente cifrato nel browser/vault

Consente riconnessione rapida, ma trasforma una credenziale runtime locale in stato persistente del consumer. Il vault attuale è orientato ai dati applicativi e ai backup; introdurre qui un segreto locale richiederebbe un nuovo contratto di esclusione dall’export e aumenterebbe il raggio di rischio.

**Non selezionato.**

### C. Local Trust Bridge con capacità effimera di sessione

Il master token resta in Termux. Dopo un gesto esplicito del docente, il runtime emette una capacità bearer casuale, a vita breve e solo in memoria. Il Registro usa quella capacità per health, upsert, remove e search. Alla ricarica la capacità scompare e il docente deve solo premere nuovamente **Attiva memoria locale**, senza digitare segreti.

**Selezionato.**

## 5. UX selezionata

### 5.1 Stato non attivo

La scheda Impostazioni mostra:

- titolo `Memoria semantica locale`;
- stato `Non attiva`;
- endpoint locale, in sola lettura o configurazione avanzata collassata;
- azione primaria `Attiva memoria locale`;
- testo: `Usa il motore locale sul dispositivo. Nessun dato viene inviato a servizi remoti.`

Non compare alcun campo token.

### 5.2 Gesto di attivazione

Il click/tap su `Attiva memoria locale` è l’unico trigger iniziale della sessione. Il consumer:

1. contatta il bridge loopback;
2. richiede una capacità effimera;
3. valida la risposta;
4. crea il client LSM in memoria;
5. verifica health;
6. passa a `Pronta`.

Nessuna sincronizzazione parte automaticamente.

### 5.3 Stato pronto

Mostra:

- badge `Pronta`;
- `Memoria locale connessa e pronta.`;
- `Sincronizza`;
- `Disattiva`.

`Sincronizza` resta una scelta esplicita e governa solo proiezioni ammesse.

### 5.4 Nuova sessione

Dopo ricarica, chiusura scheda o riavvio app:

- la capacità effimera non esiste più;
- lo stato torna `Non attiva`;
- nessun probe parte automaticamente;
- un singolo tap su `Attiva memoria locale` ristabilisce la sessione senza token manuale.

## 6. Contratto runtime LSM-01D

Aggiungere un endpoint locale dedicato:

```text
POST /v1/session
```

La richiesta non contiene il master token. È ammessa solo quando:

- il server è loopback-only;
- `Origin` è presente ed è nella whitelist esatta;
- il path e il metodo coincidono;
- il payload è vuoto o usa uno schema versionato minimale;
- non è presente una richiesta cross-origin non autorizzata.

Risposta proposta:

```json
{
  "schema": "trama.semantic-memory-session/v1",
  "token": "<ephemeral-capability>",
  "expiresAt": "2026-11-01T08:00:00Z",
  "health": {
    "schema": "trama.semantic-memory-health/v1",
    "status": "ready",
    "protocolVersion": 1,
    "modelId": "embeddinggemma-2-local",
    "dimensions": 768,
    "indexRevision": "1"
  }
}
```

Il token effimero:

- è generato con entropia crittografica;
- non viene scritto su disco;
- è legato all’`Origin` che lo ha richiesto;
- ha TTL breve e configurabile, default 8 ore;
- viene invalidato al riavvio di `trama-memoryd`;
- non è restituito da health o log;
- può essere revocato in memoria da `Disattiva` tramite rimozione client-side; un endpoint server-side di revoca è opzionale in v1 e non necessario alla correttezza se il TTL è bounded e il processo è loopback-only.

## 7. Autenticazione server

Il master token esistente continua a esistere e resta utile per strumenti amministrativi/locali. Per le richieste consumer:

```text
Authorization: Bearer <ephemeral-capability>
```

Il server accetta una richiesta autenticata se:

- il bearer coincide con il master token **oppure**
- coincide con una capacità effimera attiva e l’`Origin` della richiesta coincide con quella associata alla capacità.

Questo consente compatibilità con smoke/strumenti esistenti senza esporre il master token nel browser.

Le capacità sono mantenute in una struttura in-memory bounded. La pulizia avviene su accesso e/o timer semplice. Nessuna capacità deve essere serializzata nel database semantico.

## 8. CORS e origine locale

`TRAMA_MEMORY_ALLOWED_ORIGINS` resta autorità esplicita. LSM-01D non introduce wildcard e non deduce origini dalla rete.

Per il profilo Android/Termux di Registro, l’installazione locale deve predisporre l’origine del consumer. In sviluppo/smoke può essere `http://127.0.0.1:4173`; in distribuzione la lista deve contenere solo le origini effettivamente usate dal consumer.

Il runtime deve continuare a rispondere `403 origin_forbidden` prima di creare sessioni o toccare il servizio quando l’origine non è autorizzata.

## 9. Consumer Registro

### 9.1 Nuovo client

Il client semantico introduce un’operazione di attivazione, separata dalla porta LSM canonica:

```ts
interface LocalSemanticMemorySessionBootstrap {
  activate(endpointUrl: string): Promise<{
    token: string;
    health: SemanticMemoryHealthV1;
    expiresAt: string;
  }>;
}
```

`LocalSemanticMemoryPort` non cambia: continua a usare bearer per le operazioni normali.

### 9.2 Persistenza

Il Registro può persistere **solo** preferenze non segrete, per esempio l’endpoint loopback o il fatto che l’utente abbia già configurato la funzionalità. Non persiste:

- master token;
- token effimero;
- header Authorization;
- session bootstrap response.

La capacità vive esclusivamente in memoria (`ref`/state session-only).

### 9.3 Errori UX

- runtime assente → `Memoria locale non disponibile. Avvia Termux e riprova.`;
- origin non ammessa → messaggio di configurazione locale, non richiesta token;
- sessione scaduta durante search/sync → stato torna `Non attiva`; nessun retry automatico con side effect;
- rebuild-required → comportamento esistente;
- errore embedding → errore tecnico distinto da no-match.

## 10. Sincronizzazione e ricerca

Nessun cambiamento di authority:

- `Sincronizza` resta esplicito;
- solo classi dati ammesse vengono proiettate;
- search usa la capacità effimera corrente;
- session expiry non modifica dati canonici;
- nessun auto-upsert al momento dell’attivazione.

## 11. Sicurezza e minacce

### Sito web arbitrario

Bloccato da origin whitelist esatta prima del bootstrap.

### Processo locale malevolo

Il servizio resta loopback-only; un processo locale con privilegi dell’utente è fuori dal confine browser. LSM-01D non peggiora questo modello rispetto al master token su file `0600`.

### XSS nel consumer

Una XSS nella sessione attiva potrebbe leggere la capacità effimera in memoria. Il rischio è limitato da TTL, binding all’origine, assenza di persistenza e confine loopback. Persistire il master token nel browser sarebbe peggiore.

### Esfiltrazione backup

Nessun segreto LSM entra nel backup.

### Replay

Il bearer effimero è valido solo fino a scadenza, solo per l’origine associata e solo finché il daemon resta attivo.

## 12. Test di accettazione

### Runtime

- `/v1/session` con origine non ammessa → 403 e nessuna sessione creata;
- origine ammessa → session response valida;
- capacità casuale sufficientemente lunga;
- capacità non persistita su disco;
- capacità valida + stessa origine → POST autorizzato;
- capacità valida + origine diversa → 401/403 fail-closed;
- capacità scaduta → 401;
- master token storico resta valido;
- wildcard origin continua a essere vietata;
- restart daemon invalida tutte le capacità.

### Registro

- nessun campo token visibile;
- nessun network probe prima del tap `Attiva memoria locale`;
- tap → bootstrap + ready;
- token effimero non entra in storage/vault/settings;
- reload → stato non attivo e nessun auto-probe;
- nuovo tap → pronta senza digitazione;
- sync non parte con activate;
- sync manuale continua a rispettare data class e CAS;
- search semantica reale continua a recuperare la fonte professionale;
- session expiry durante operazione degrada senza scrittura canonica.

### Android/Termux

Journey minimo reale:

```text
avvio memoria locale
→ Registro / Impostazioni
→ Attiva memoria locale
→ Pronta
→ Sincronizza
→ Biblioteca / Ricerca per significato
→ risultato pertinente
→ reload Registro
→ Non attiva
→ Attiva memoria locale
→ Pronta, senza token manuale
```

## 13. Non-obiettivi

LSM-01D non introduce:

- auto-start Termux dal browser;
- persistenza del token nel Registro;
- sincronizzazione automatica all’avvio;
- accesso LAN;
- pairing cloud;
- account/device identity condivisa;
- modifiche al modello EmbeddingGemma;
- modifica delle policy dati LSM-01A.

## 14. Decomposizione implementativa proposta

1. **D1 Runtime RED** — test session bootstrap/origin/TTL/binding/restart.
2. **D2 Runtime GREEN** — session capability store in-memory + `/v1/session` + bearer dual-path.
3. **D3 Consumer RED** — contratto `Attiva memoria locale`, assenza campo token, zero probe pre-gesture.
4. **D4 Consumer GREEN** — bootstrap session-only + client LSM con capacità effimera.
5. **D5 UX hardening** — messaggi errori, expiry, no auto-sync, focus/mobile.
6. **D6 Exact-SHA qualification** — unit/security/browser + Android/Termux real smoke.

## 15. Decisione

**Selezionato: Local Trust Bridge con capacità effimera di sessione.**

Il risultato utente è “zero token da copiare”, mantenendo il gesto esplicito di attivazione e senza trasformare un segreto runtime in stato persistente del browser.
