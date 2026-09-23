# ADR — Atlas Frontend Stack v1

**Stato:** PROPOSED  
**Data:** 22 settembre 2026  
**Scopo:** scegliere uno stack maturo per S3-V2 e successive superfici Atlas.

## Decisione proposta

### Framework
**Next.js + React + TypeScript**

Motivi:
- routing maturo;
- rendering ibrido;
- code splitting;
- accessibilità compatibile con componenti standard;
- ecosistema molto ampio;
- adatto a pagine pubbliche e superfici interattive.

### Styling
**Tailwind CSS**

Uso:
- utility layer;
- token CSS custom properties;
- nessun colore semantico hard-coded nei componenti;
- layout responsive.

### Component foundation
**shadcn/ui + Radix Primitives**

Uso:
- componenti copiati e governati nel codice Atlas;
- primitive accessibili;
- Dialog, Dropdown, Tabs, Tooltip, Popover, Sheet, Accordion, Select;
- niente dipendenza concettuale da tema shadcn predefinito.

### Data/table
**TanStack Table**

Uso:
- catalogo risorse;
- viste tabellari;
- sorting/filtering;
- headless rendering.

### Graph / relational canvas
**React Flow / XYFlow**

Uso:
- Esplora;
- nodi e connessioni;
- minimap/zoom;
- layout custom;
- visualizzazione non autorevole;
- sempre affiancata da EquivalentOutline accessibile.

### Icons
**Lucide**

Uso:
- set coerente;
- icone sempre accompagnate da label/accessible name quando necessario.

## Regola delle dipendenze

Per dipendenze strategiche UI, preferire:
1. progetto maturo;
2. manutenzione attiva;
3. adozione ampia;
4. licenza compatibile;
5. API accessibile/headless;
6. nessuna dipendenza su servizi proprietari runtime;
7. lockfile e version pinning.

La popolarità GitHub è un segnale, non un criterio sufficiente.

## Struttura proposta

```
apps/atlas/
  app/
  components/
    atlas/
    ui/
  features/
    curriculum/
    explore/
    resources/
    pathways/
    search/
  lib/
    arena/
    atlas/
    accessibility/
  styles/
  tests/

packages/
  atlas-design-tokens/
  atlas-domain-types/
```

## Rendering

- Server Components per contenuti pubblici e pagine editoriali quando utile;
- Client Components soltanto per interazione;
- canvas relazionale isolato come client island;
- caricamento progressivo;
- URL state per filtri/nodo quando possibile.

## Dati

S3-V2 può usare fixture governate o read model statico.

Non deve introdurre:
- backend autorevole;
- duplicazione della fonte Arena;
- account;
- dati personali.

## Test

- unit/component test;
- accessibility test automatizzati;
- browser/E2E;
- snapshot solo come supporto;
- visual regression;
- keyboard journey;
- mobile viewport;
- LIM viewport.

## Sicurezza

- CSP compatibile con deployment;
- niente script terzi non necessari;
- niente analytics nella foundation;
- dipendenze con audit automatico;
- nessun secret nel client.
