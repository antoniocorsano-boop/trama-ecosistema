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

## Promessa di prodotto

**Dal curricolo all’esperienza, senza perdere autorità, responsabilità o contesto.**

Il percorso semantico di riferimento è:

`curricolo → comprensione → preparazione → lezione → materiale → attività → esperienza`

## Domini

### Arena
Custodisce curricolo verticale d’istituto, provenienza, versioni, approvazione e raccordi.

### Docente OS
Porta il curricolo nel contesto reale della classe. Il docente accetta, modifica, sostituisce o esclude proposte e conserva la decisione professionale.

### Atlas
Rende pubblici e navigabili curricolo, lezioni, materiali, attività e percorsi. La selezione classe/disciplina è contesto pubblico, non identità dello studente.

## Principi non negoziabili

- teacher-first;
- privacy-first;
- accessibilità WCAG 2.2 AA;
- no silent write;
- provenienza verificabile;
- nessuna seconda authority curricolare;
- nessun runtime cross-product implicito;
- mobile e LIM come superfici progettate;
- attività capaci di portare anche fuori dallo schermo.

## Modello Atlas

| Livello | Significato |
| --- | --- |
| L1 — Risorsa | Unità elementare di contenuto |
| L2 — Materiale di lezione | Risorsa contestualizzata rispetto a lezione e obiettivi |
| L3 — Attività didattica | Esperienza guidata, anche con fasi off-screen |
| L4 — Percorso | Sequenza coerente nel tempo e nella progressione |

## Stato corrente

- Arena: operativa come authority curricolare.
- Docente OS: operativo nel proprio dominio.
- Atlas R3-F0/S3-V2: attivo.
- Atlas Mockup V2: **integrato** via PR #61.
- ECO-02/P1: pilota controllato ancora soggetto a chiusura umana.
- Docente OS → Atlas automatico: **non autorizzato**.
- DOS-A1: **RUNTIME_DEFERRED**.

## Roadmap sintetica

1. Chiudere ECO-02/P1 con collaudo umano reale.
2. Completare Atlas F3 Materiali+Risorse.
3. Validare F4 Mobile+LIM.
4. Chiudere F5 Exit.
5. Consolidare la catena curricolo → materiali/attività.
6. Valutare separatamente le evoluzioni R3-P2/P3/P5/P6.
7. Qualunque R3-P4 richiede una nuova autorizzazione esplicita.

## Asset ufficiali della baseline

- **Metafora atomica istituzionale** — identità e significato dell’ecosistema.
- **Tavola tecnica** — authority, flussi, gate e modello L1–L4.
- **Dossier ufficiale** — lettura estesa di vision, governance, stato e roadmap.
- **Baseline repository** — fonte testuale versionata per sviluppo e review.

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
- [Roadmap documentale e operativa](../strategy/trama-documentation-operating-roadmap-2026-09-23.md)
- [Stato corrente](../../STATUS.md)

## Regola di mantenimento

Qualunque nuova superficie, documento o asset deve dichiarare chiaramente **cosa esiste**, **cosa è in sviluppo** e **cosa è soltanto possibile evoluzione**. La vision non deve mai essere usata per anticipare un’autorizzazione tecnica.
