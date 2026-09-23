# TRAMA — Piano di manutenzione documentale

**Data:** 23 settembre 2026  
**Stato:** DOCUMENTATION GOVERNANCE / NON NORMATIVE FOR PRODUCT SEQUENCING  
**Scopo:** evitare duplicazioni, disallineamenti e perdita di provenienza nella documentazione dell’ecosistema.

> La sequenza operativa di prodotto resta definita da [Piano operativo atomico](../strategy/atomic-operating-plan-2026-09-22.md).  
> Lo stato corrente resta definito da [STATUS.md](../../STATUS.md).  
> Questo documento governa soltanto il mantenimento delle fonti e degli asset documentali.

## D0 — Mappa delle fonti

Mantenere una gerarchia esplicita:
1. ADR e contratti approvati — decisioni normative;
2. `STATUS.md` — stato corrente verificato;
3. piano operativo atomico — priorità e sequenza operativa;
4. specifiche integrate — comportamento del relativo dominio;
5. filosofia in sviluppo — razionale e ipotesi;
6. baseline ecosistema — sintesi e indice;
7. dossier e asset visuali — spiegazione e comunicazione.

## D1 — Baseline ecosistema

La baseline deve:
- collegare le fonti canoniche;
- definire lessico e modello concettuale;
- distinguere stato, direzione e ipotesi;
- non duplicare il dettaglio operativo già governato altrove.

## D2 — Registro degli asset

Per ogni asset registrare:
- titolo;
- versione/data;
- categoria;
- proprietario logico;
- fonte canonica di riferimento;
- stato: baseline / supporto / superato;
- uso consentito;
- eventuale sostituto.

Categorie:
- istituzionale;
- architetturale;
- prodotto/journey;
- stato/roadmap;
- dimostrativo didattico.

## D3 — Aggiornamenti obbligatori

Aggiornare la baseline o i rimandi quando:
- cambia una authority;
- viene autorizzato un runtime;
- cambia il modello dei contenuti;
- cambia un vincolo privacy/accessibilità;
- si chiude o apre una fase rilevante;
- un asset di baseline viene sostituito.

Una modifica puramente grafica che non cambia significato non richiede una nuova baseline concettuale.

## D4 — Controllo anti-duplicazione

Prima di creare un nuovo documento:
- verificare se il contenuto appartiene a una fonte già esistente;
- estendere la fonte corretta quando possibile;
- evitare nuovi identificatori che possano confondersi con roadmap di prodotto;
- inserire sempre link bidirezionali fra sintesi e fonte primaria.

## D5 — Definition of Done documentale

Un aggiornamento documentale è completo quando:
- la fonte primaria è identificata;
- lo stato è verificabile;
- non esistono copie concorrenti autorevoli;
- i link interni funzionano;
- gli asset coinvolti sono registrati;
- un nuovo collaboratore può ricostruire il perché della decisione senza dipendere dalla chat originale.

## Regola finale

La documentazione TRAMA deve **ridurre l’ambiguità**, non creare nuovi centri di autorità.
