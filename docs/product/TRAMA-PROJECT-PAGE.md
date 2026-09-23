# TRAMA — Pagina di progetto

**Baseline:** 23 settembre 2026  
**Stato:** PROJECT PAGE / DOCUMENTATION-ONLY  
**Fonte concettuale:** [TRAMA Ecosystem Baseline](../vision/TRAMA-ECOSYSTEM-BASELINE-2026-09-23.md)

## Visione

TRAMA rende coerente, visibile e praticabile il percorso con cui una comunità scolastica trasforma un curricolo autorevole in esperienza educativa.

Non è una quarta applicazione. È la grammatica di governo che mantiene distinti e interoperabili:
- **Arena** — autorità curricolare;
- **Docente OS** — decisione e trasformazione professionale;
- **Atlas** — membrana pubblica, navigazione e fruizione.

## Formula di ecosistema

**Dal curricolo all’esperienza, senza perdere autorità, responsabilità o contesto.**

Questa è una formula narrativa della baseline. La **promessa di valore di prodotto** resta quella registrata in [Strategia di prodotto](../vision/product-strategy.md) — “Dal curricolo alla lezione, con il docente sempre al controllo” — ancora da validare esternamente.

Il percorso semantico di riferimento è:

`curricolo → comprensione → preparazione → lezione → materiale → attività → esperienza`

## Domini

### Arena
Custodisce curricolo verticale d’istituto, provenienza, versioni, approvazione e raccordi.

### Docente OS
Porta il curricolo nel contesto reale della classe. Il docente accetta, modifica, sostituisce o esclude proposte e conserva la decisione professionale.

### Atlas
È la superficie pubblica e navigabile dell’ecosistema. Oggi rende disponibile una parte del curricolo e dei materiali; il target di prodotto integrato estende progressivamente la fruizione verso lezioni, attività e percorsi. La selezione classe/disciplina è contesto pubblico, non identità dello studente.

## Invarianti

- teacher-first;
- privacy-first;
- no silent write;
- provenienza verificabile;
- nessuna seconda authority curricolare;
- nessun runtime cross-product implicito;
- nessun account o tracking individuale dello studente in Atlas.

## Direzioni di design integrate

- accessibilità WCAG 2.2 AA come target;
- mobile e LIM come superfici progettate;
- attività capaci di includere passaggi fuori dallo schermo;
- progressione Atlas da risorse e materiali verso attività e percorsi.

## Modello Atlas V2

Il modello seguente è un riferimento di prodotto/design integrato; non equivale allo stato runtime corrente.

| Livello | Significato |
| --- | --- |
| L1 — Risorsa | Unità elementare di contenuto |
| L2 — Materiale di lezione | Risorsa contestualizzata rispetto a lezione e obiettivi |
| L3 — Attività didattica | Esperienza guidata, anche con fasi off-screen |
| L4 — Percorso | Sequenza coerente nel tempo e nella progressione |

## Stato corrente

Questa sezione è una **fotografia sintetica al 23 settembre 2026**. Per lo stato aggiornato fa fede [`STATUS.md`](../../STATUS.md).

- Arena: operativa come authority curricolare.
- Docente OS: operativo nel proprio dominio.
- Atlas R3-F0/S3-V2: attivo.
- Atlas Mockup V2: **integrato** via PR #61.
- ECO-02/P1: pilota controllato ancora soggetto a chiusura umana.
- Docente OS → Atlas automatico: **non autorizzato**.
- DOS-A1: **RUNTIME_DEFERRED**.

## Priorità operative

La sequenza canonica non è definita in questa pagina. Fa fede il [Piano operativo atomico](../strategy/atomic-operating-plan-2026-09-22.md), richiamato anche da `STATUS.md`.

In sintesi, la direzione corrente privilegia: chiusura delle prove reali già aperte, completamento dell’esperienza Atlas e successivo consolidamento prima di nuove capacità. Qualunque R3-P4 richiede una nuova autorizzazione esplicita.

## Asset ufficiali della baseline

- **Metafora atomica istituzionale** — asset di baseline per identità e significato dell’ecosistema.
- **Tavola tecnica** — asset complementare per authority, flussi, gate e modello L1–L4.
- **Dossier ufficiale** — documento di supporto narrativo e architetturale.
- **Baseline repository** — sintesi versionata e indice delle fonti canoniche.

Gli asset non sostituiscono ADR, contratti, `STATUS.md` o specifiche tecniche.

## Per chi è TRAMA

- dirigenti e governance scolastica: chiarezza di autorità e stato;
- docenti: continuità curricolare senza perdita di autonomia;
- studenti e famiglie: accesso pubblico e comprensibile;
- progettisti e sviluppatori: confini, contratti e criteri di coerenza;
- collaboratori e revisori: una baseline unica da cui ricostruire il significato del progetto.

## Documentazione essenziale

- [Baseline ecosistema](../vision/TRAMA-ECOSYSTEM-BASELINE-2026-09-23.md)
- [Atlas Mockup V2](../design/atlas-mockup-v2-vision-alignment.md)
- [Piano operativo atomico](../strategy/atomic-operating-plan-2026-09-22.md)
- [Piano di manutenzione documentale](../process/trama-documentation-maintenance-plan-2026-09-23.md)
- [Stato corrente](../../STATUS.md)

## Regola di mantenimento

Qualunque nuova superficie, documento o asset deve dichiarare chiaramente **cosa esiste**, **cosa è in sviluppo** e **cosa è soltanto possibile evoluzione**. La vision non deve mai essere usata per anticipare un’autorizzazione tecnica.
