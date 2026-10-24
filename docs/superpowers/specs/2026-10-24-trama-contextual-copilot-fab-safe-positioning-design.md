# TRAMA Contextual Copilot FAB — adaptive safe positioning

**Data:** 2026-10-24  
**Stato:** HUMAN-APPROVED DESIGN · IMPLEMENTATION PLANNING AUTHORIZED  
**Documento padre:** `docs/superpowers/specs/2026-10-22-trama-contextual-copilot-core-design.md`  
**Primo consumatore:** Docente OS  
**Consumatori previsti:** Docente OS, registro-docente, future applicazioni TRAMA  

## 1. Decisione

Il FAB del Contextual Copilot diventa un **presentation adapter riusabile con posizionamento adattivo**.

La modalità predefinita è automatica. L'utente può spostare manualmente il FAB. La posizione manuale viene ricordata localmente, ma non può prevalere sui vincoli di leggibilità e sicurezza del layout.

La decisione approvata è:

**AUTO + drag manuale + snap a safe zone + preferenza locale semantica + collision correction + fallback docked + reset AUTO.**

Il FAB non acquisisce logica di dominio, policy AI o autorità di write. Resta una superficie di presentazione del Contextual Copilot Core.

## 2. Origine del requisito

La Human Visual / Design Review di Docente OS PR #745, exact SHA `845a62e8f01be22e7f9689df7a24ecd494582bd6`, ha classificato **REWORK** un caso mobile reale: durante `Progetta → UDA` il trigger chiuso del Copilota può essere `fixed` e coprire testo operativo. Il retry successivo risulta corretto, ma il contratto visuale non può dipendere da timing di hydration o retry.

Il problema non va risolto con una patch UDA-specifica. La correzione deve diventare un contratto riusabile del presentation adapter.

## 3. Obiettivi

Il componente deve:

- non coprire contenuto operativo, CTA, bottom navigation, tastiera o pannelli persistenti;
- scegliere automaticamente una posizione valida quando possibile;
- permettere drag manuale su mobile/touch;
- fare snap a una posizione sicura, non lasciare coordinate arbitrarie;
- ricordare localmente la preferenza manuale;
- correggere temporaneamente la preferenza quando il layout la rende invalida;
- tornare alla preferenza manuale quando torna valida;
- degradare a una posizione `docked` nel normale flusso se nessuna posizione floating è sicura;
- offrire `Ripristina posizione automatica`;
- funzionare senza rete, account, telemetria o persistenza server.

## 4. Non-obiettivi del primo incremento

Non fanno parte di questo incremento:

- spostamento libero del pannello Copilota espanso;
- sincronizzazione della posizione fra dispositivi o applicazioni;
- persistenza nel tenant o nel profilo server;
- personalizzazione AI della posizione;
- telemetria comportamentale;
- modifica del Contextual Copilot Core headless o delle policy di autorità;
- nuove capability del Copilota.

## 5. Modello di stato

Il presentation adapter espone quattro stati geometrici:

```text
AUTO_FLOATING
MANUAL_FLOATING
TEMPORARILY_DISPLACED
DOCKED_SAFE
```

Regole:

- `AUTO_FLOATING`: il resolver sceglie la safe zone valida più coerente con il default applicativo;
- `MANUAL_FLOATING`: l'utente ha espresso una preferenza tramite drag e snap;
- `TEMPORARILY_DISPLACED`: la preferenza manuale esiste, ma viene sostituita temporaneamente dalla safe zone valida più vicina;
- `DOCKED_SAFE`: nessuna posizione floating soddisfa il contratto; il trigger rientra nel normale flusso della pagina.

`TEMPORARILY_DISPLACED` non cancella la preferenza manuale.

## 6. Preferenza persistita

Non si persistono coordinate pixel assolute.

Contratto minimo:

```ts
export type ContextualFabPreference =
  | { version: 1; mode: 'auto' }
  | {
      version: 1
      mode: 'manual'
      edge: 'left' | 'right'
      yRatio: number
    }
```

`yRatio` è normalizzato nell'intervallo `0..1` rispetto all'area utilizzabile del viewport.

La persistenza è locale all'origine/applicazione e contiene esclusivamente preferenze UI. Nessun dato professionale, studente, tenant, conversazione o telemetria entra nel payload.

Il consumer fornisce lo storage adapter; il core cross-app non dipende da `localStorage`.

## 7. Safe-area contract

Il resolver riceve geometria, non selettori o tipi verticali.

Input concettuali:

```ts
viewport
fabSize
safeInsets
protectedRects
preferredPlacement?
dockAvailable
```

Le `protectedRects` possono rappresentare:

- contenuto operativo che non deve essere oscurato;
- CTA e controlli primari;
- bottom navigation;
- sticky action bars;
- pannelli aperti;
- area occupata dalla tastiera/visual viewport.

Ordine di risoluzione:

```text
validità geometrica > protected regions > preferenza manuale > default automatico
```

Se la preferenza manuale collide, il resolver cerca la safe zone più vicina. Se non esiste, usa `DOCKED_SAFE`.

## 8. Comportamento durante scroll, resize e tastiera

Il posizionamento viene rivalutato quando cambia materialmente la geometria:

- resize/orientamento;
- `visualViewport` quando disponibile;
- apertura/chiusura tastiera;
- apertura/chiusura di pannelli persistenti;
- scroll quando una posizione floating rischia di entrare in una protected region.

La rivalutazione non deve produrre jitter continuo: se la posizione corrente resta valida, non cambia.

## 9. Drag e snap

Il drag modifica una **preferenza**, non impone una coordinata assoluta.

Al rilascio:

1. si determina il bordo sicuro più vicino;
2. si calcola `yRatio`;
3. si verifica la collisione;
4. si applica la safe zone valida più vicina;
5. si persiste la preferenza semantica.

Durante il drag il FAB resta entro i limiti del viewport utilizzabile.

## 10. Accessibilità

- target interattivo minimo: 44×44 px;
- l'apertura del Copilota resta completamente utilizzabile senza drag;
- il drag è un miglioramento opzionale, non l'unico modo per rendere il contenuto accessibile;
- in assenza di input pointer/touch il sistema resta in AUTO e deve comunque garantire non-overlap;
- `Ripristina posizione automatica` è un comando keyboard-accessible;
- focus visibile e nome accessibile del trigger restano obbligatori;
- `prefers-reduced-motion` elimina animazioni non essenziali di riposizionamento.

## 11. Hydration e determinismo

La geometria del FAB deve avere **un solo owner**. Regole CSS concorrenti che dichiarano alternativamente `position: static` e `position: fixed` sullo stesso stato sono vietate.

Prima che il resolver client sia pronto, il fallback deve essere sicuro: `DOCKED_SAFE` oppure una posizione deterministica che non possa coprire contenuto.

Il risultato valido non può dipendere da retry Playwright, ordine di caricamento CSS o timing di hydration.

## 12. Contratto di integrazione applicativo

Ogni consumer fornisce:

- le protected regions pertinenti alla superficie;
- eventuale dock point nel flusso;
- default edge;
- storage adapter locale;
- il presentation content del FAB.

Il componente condiviso non conosce `Lesson`, `UDA`, `ClassDiary`, route o selettori verticali.

## 13. Prima applicazione: Docente OS

Il primo incremento chiude il finding HVA `Progetta → UDA` e poi verifica che lo stesso adapter resti valido sulle altre superfici che usano il Copilota floating.

Vincoli Docente OS:

- nessun dato persistito nel tenant;
- nessuna modifica al contratto AI/autorità;
- nessuna regressione della bottom navigation;
- pannello espanso fuori scope salvo correzioni strettamente necessarie per il reset AUTO;
- desktop invariato salvo riuso del contratto comune.

## 14. Prova automatizzata obbligatoria

Il gate deve dimostrare almeno:

```text
AUTO chooses a valid placement
MANUAL drag snaps to a safe edge
manual semantic preference survives reload
collision temporarily displaces but does not erase manual preference
no valid floating slot falls back to DOCKED_SAFE
bottom navigation and keyboard are excluded
320×800, 390×844 and 412×915 remain usable
first render after hydration is safe without retry
```

La prova browser deve fallire se il trigger interseca una protected region o la navigazione mobile.

## 15. Criterio di Human Visual / Design PASS

Il REWORK può diventare PASS soltanto se, sul nuovo exact SHA:

1. il primo tentativo mobile non copre testo o controlli;
2. il FAB resta percepibile ma subordinato al contenuto;
3. drag e snap non introducono jitter o movimenti inattesi;
4. la preferenza manuale è reversibile tramite reset AUTO;
5. DPG-09 e DPG-18 risultano PASS su evidenza reale;
6. non compaiono nuove regressioni su DPG-05, DPG-07 o DPG-17.

## 16. Decisione consolidata

Il posizionamento adattivo del FAB appartiene al **presentation adapter condivisibile** del Contextual Copilot, non al dominio e non a una singola pagina. Docente OS è il primo consumer e il finding HVA è il caso causale che ne qualifica il primo incremento.