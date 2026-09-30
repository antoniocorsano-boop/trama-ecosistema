# CAP-DOS-ARGO-SYNC — Real Argo XLS Sample Evidence 001

**Gate:** G1 — Discovery  
**Status:** DIRECT_FILE_EVIDENCE / READ_ONLY  
**Runtime:** NOT_AUTHORIZED  
**Sample:** `Programma_2026_48591.xls`  
**SHA-256:** `6f6f83570fecc3b295586dae2a110c48acfe2dd26bedc5b411e14418d6f7925d`  
**Size:** 6144 bytes

## 1. File container and workbook format

Read-only binary inspection establishes:

- container: Microsoft Compound File Binary / CDFV2;
- workbook generation: BIFF8 (`BOF version 0x0600`);
- this is a legacy binary **.XLS**, not OOXML `.XLSX`;
- workbook contains one visible worksheet;
- worksheet name: **Dati**;
- no additional hidden worksheet was observed in the workbook directory/boundsheet metadata.

This matters because an XLSX workbook is not format-equivalent to the Argo export even when the visible cells are identical.

## 2. Worksheet schema observed

The worksheet exposes exactly six columns:

| Column | Header |
| --- | --- |
| A | `ORD. MODULO` |
| B | `MODULO` |
| C | `ORD. ARGOMENTO` |
| D | `ARGOMENTO` |
| E | `STATO SVOLGIMENTO` |
| F | `DATA SVOLGIMENTO` |

The inspected sample has three rows including the header.

### Sample data as exported

| ORD. MODULO | MODULO | ORD. ARGOMENTO | ARGOMENTO | STATO SVOLGIMENTO | DATA SVOLGIMENTO |
| --- | --- | --- | --- | --- | --- |
|  | `0TEST` |  |  |  |  |
|  |  | `.` | `arg1` | `Non svolto` |  |

The evidence demonstrates a row-oriented representation in which a module row and an argument row can occupy separate records.

## 3. Cell representation

Observed workbook records:

- 18 `LABELSST` cells;
- all populated/blank table cells in the sample are represented through the shared-string table;
- no `FORMULA` records were observed;
- no data-validation records were observed;
- no merged-cell records were observed;
- all table cells in this sample reference the same cell style index (`XF 49`).

The workbook nevertheless contains non-trivial BIFF formatting metadata (including many XF/font/format records), therefore visual simplicity does not prove that a newly reconstructed binary workbook will be import-compatible.

## 4. Mapping feasibility

For this sample, the visible mapping to the candidate canonical model is direct:

```text
ORD. MODULO
  ↔ module.order

MODULO
  ↔ module.description

ORD. ARGOMENTO
  ↔ argument.order

ARGOMENTO
  ↔ argument.description

STATO SVOLGIMENTO
  ↔ argument.performedStatus

DATA SVOLGIMENTO
  ↔ argument.performedAt
```

Important: this is a **semantic mapping**, not yet a proven import contract.

## 5. Structural interpretation candidate

A parser for this profile can tentatively classify rows as:

### Module row candidate
- `MODULO` non-empty;
- `ARGOMENTO` empty.

### Argument row candidate
- `ARGOMENTO` non-empty;
- module context inherited from the preceding module row.

This rule is supported by Sample 001 only and must remain version/profile-bound until more exports are inspected.

## 6. Key discoveries

### XLS != XLSX

The source is BIFF8 binary XLS. Any future export adapter must either:

- preserve/use the original Argo-produced XLS template safely, or
- generate a proven BIFF8-compatible workbook.

Generating ordinary XLSX and renaming it `.xls` is invalid.

### Visible schema is simple

The user-visible data surface is six columns with a clean module/argument mapping.

### Internal compatibility remains unproven

The manual explicitly discourages modifying the original Argo XLS. This sample contains workbook-level formatting records beyond the six visible columns. Therefore we must not infer that a clean-room generated XLS is accepted by didUP until a controlled round-trip proves it.

## 7. G1 implications

This sample closes two previous evidence gaps:

- [x] real didUP XLS sample inspected read-only;
- [x] initial semantic mapping feasibility demonstrated.

It does **not** close:

- [ ] format variability across different exports/classes/programs;
- [ ] import behavior for exact re-import;
- [ ] duplicate handling;
- [ ] update/merge semantics;
- [ ] acceptance of a reconstructed/generated XLS;
- [ ] failure feedback and partial-import semantics.

## 8. Next governed experiment

Preferred order:

1. obtain a second Argo export with a richer program (multiple modules/arguments, order values, performed and non-performed arguments, at least one date);
2. compare the binary/profile structure to Sample 001;
3. only then define `ARGO_PROGRAM_XLS_PROFILE_v1`;
4. perform an unmodified round-trip import in Argo if operationally safe;
5. only after that consider a minimally changed-copy experiment under explicit human control.

No file should be written back to Argo automatically.
