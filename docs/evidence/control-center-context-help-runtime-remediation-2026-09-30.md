# CONTROL CENTER Context Help — runtime remediation R1

**Date:** 2026-09-30  
**State:** PROPOSED / HUMAN REVIEW REQUIRED  
**Runtime baseline:** `d79f140ef60171ed8efd54421a5aca4fa560e538`  
**Target:** `CONTROL_CENTER.CONTEXT_HELP.FAMILY`  
**Runtime file:** `control-center/index.html`  
**Dependency adoption:** NONE  
**Registry promotion:** NOT INCLUDED  
**DOS-A1:** `RUNTIME_DEFERRED`

## Purpose

Integrate the already-qualified native Popover candidate from CS-S1 into the deployed TRAMA Control Center without changing product authority, lifecycle, or the Component Evidence Registry.

This slice closes the gap between **candidate evidence** and **real runtime evidence**. It does not treat the isolated laboratory from PR #174 as proof that the deployed component is qualified.

## Prior governed candidate evidence

Merged TRAMA PR #174 qualified the isolated `NATIVE_POPOVER_AUTO` candidate on exact head:

`903404953465a526408939ebd31eae40f57a57a6`

Evidence:

- workflow run: `36657296405`;
- artifact ID: `11072203230`;
- artifact digest: `sha256:0dd4f602bc1cab17dfbab4ec32a42e573dfba3123004e29a362bd9a64255e1d9`;
- candidate status: PASS;
- no runtime change and no dependency adoption.

## Runtime change

The current page-local contextual-help overlay is replaced with the browser-native Popover API:

- `popover="auto"` provides the top-layer and light-dismiss model;
- the close control uses declarative `popovertarget` / `popovertargetaction="hide"`;
- contextual invokers use `showPopover({source: ...})` so keyboard order is associated with the active source;
- `aria-details` relates the active help source to its contextual detail without asserting an unrelated menu/dialog popup role;
- the incorrect `role="dialog"` is removed because the component is non-modal;
- custom Escape handling and the custom `.open` state are removed;
- persistent hover opening is removed: contextual help is exposed through focus or intentional activation;
- CSS anchor positioning is used when available, with the existing viewport placement retained as fallback;
- no product package or third-party primitive is adopted.

The underlying Control Center remains snapshot-first and read-only.

## Exact-head runtime evidence

Workflow:

`.github/workflows/control-center-context-help-runtime.yml`

Evidence producer:

`scripts/capture_control_center_context_help_runtime.cjs`

The workflow tests the **actual** `control-center/index.html` at compact and desktop viewports and requires:

- native Popover API availability in the evidence browser;
- no dialog semantic claim;
- accessible invoker-to-help relationship;
- rebinding of the native source when contextual focus moves while the popover is already open;
- keyboard order from the currently bound invoker into the popover;
- Escape dismissal and focus return to the currently bound invoker;
- outside-click light dismissal;
- no persisted hover-only help;
- in-viewport placement at 390×844 and 1024×768;
- no page-level horizontal overflow;
- zero repository runtime dependency adoption;
- Component Evidence Registry still conservative.

## Promotion rule

A PASS means only:

**the proposed deployed runtime satisfies the governed automated Context Help criteria on that immutable PR head.**

It does not authorize:

- merge;
- lifecycle promotion;
- maturity promotion;
- changes to other Control Center surfaces;
- Web Awesome adoption;
- DOS-A1 activation.

After exact-head PASS, an independent review and explicit Human Review are required before merge. Only after an integrated runtime baseline exists may a separate evidence-binding change advance `CONTROL_CENTER.CONTEXT_HELP.FAMILY` from `REGISTERED_ONLY`.
