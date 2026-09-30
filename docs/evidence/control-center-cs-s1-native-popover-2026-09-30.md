# CONTROL-CENTER CS-S1 — Context Help native-first trial

**Date:** 2026-09-30  
**Status:** TRIAL / EXACT-HEAD EVIDENCE PENDING  
**TRAMA baseline:** `12387e245c0387654ed4492d834472d82aba353b`  
**Runtime impact:** NONE  
**Migration:** NOT AUTHORIZED  
**Dependency adoption:** NOT AUTHORIZED  
**Human decision:** REQUIRED

## Purpose

Qualify a bounded replacement candidate for `CONTROL_CENTER.CONTEXT_HELP.FAMILY` without changing the deployed Control Center.

The live implementation remains the evidence baseline. This slice creates an isolated, machine-addressable native candidate and a repeatable browser evidence producer.

## Baseline finding

The current `control-center/index.html` contextual help is a page-local custom overlay:

- opened by hover, focus and click;
- exposed as `role="dialog"`;
- closed by a local close button or Escape;
- fixed near the bottom-right viewport edge;
- no explicit invoker-to-help relationship is present;
- focus is not deliberately moved into the help surface;
- focus-return behavior is not a component contract.

This is useful contextual information, but its interaction is non-modal. Treating it as a dialog creates obligations that the current page-local behavior does not consistently implement.

## Candidate A — native Popover API

The isolated lab is:

`experiments/control-center-cs-s1/native-popover.html`

The candidate uses:

- `popover="auto"`;
- a declarative `popovertarget` button;
- a close button using `popovertargetaction="hide"`;
- non-modal semantics;
- native light-dismiss behavior;
- native invoker/focus-order relationship;
- CSS anchor positioning when supported;
- a fixed-position fallback that does not require a runtime library.

The candidate deliberately does **not** reproduce hover-to-persist behavior. Persisted contextual help should require intentional activation; transient hover help remains a separate tooltip/hint problem.

## Candidate B — Web Awesome Popover

Web Awesome remains the external fallback candidate already admitted by TRAMA Component Strategy.

Current reference checked on 2026-09-30:

- Web Awesome `<wa-popover>` is documented as a stable helper since 3.0;
- it provides anchored interactive content, outside-click dismissal and Escape dismissal;
- Web Awesome 3.10.0 is the current documented release in the project changelog;
- self-hosted selective import is available.

This slice does not install or execute Web Awesome because:

1. the strategy requires native-first evaluation;
2. dependency adoption is not authorized;
3. executable external comparison is only justified if the native candidate exposes a material unmet requirement.

Therefore the external candidate is **DOCUMENTATION_BENCHMARK_ONLY**, not equivalent empirical evidence.

## Exact-head evidence contract

Workflow:

`.github/workflows/control-center-cs-s1.yml`

Evidence producer:

`scripts/capture_control_center_cs_s1_evidence.cjs`

The workflow:

- checks out the real PR head;
- rejects modifications under `control-center/`;
- rejects repository package/package-lock adoption inside this trial;
- revalidates the existing component evidence registry;
- installs Playwright 1.63.0 only in a temporary CI path;
- runs Chromium against the isolated lab;
- captures baseline and native-candidate screenshots at 390×844 and 1024×768;
- produces `artifacts/control-center-cs-s1/evidence.json`;
- uploads the exact-head evidence artifact.

### Candidate assertions

The native candidate must prove:

- Popover API availability in the evidence browser;
- keyboard activation;
- accessibility-tree expanded state on the invoker;
- logical keyboard order from invoker into interactive popover content;
- Escape dismissal;
- focus return to the invoker after Escape;
- outside-click light dismissal;
- no page-level horizontal overflow;
- in-viewport placement on compact and desktop viewports.

Baseline observations are recorded but expected baseline limitations do not fail the candidate trial.

## Evidence interpretation

A PASS from this workflow means only:

**the isolated native candidate satisfies the automated CS-S1 browser criteria on that exact head.**

It does not mean:

- the live Control Center has been remediated;
- `CONTROL_CENTER.CONTEXT_HELP.FAMILY` has advanced in maturity;
- Web Awesome has been rejected permanently;
- human assistive-technology review has occurred;
- a runtime migration is approved.

## Decision rule

After exact-head evidence:

- if the native candidate passes without a material product requirement gap, prepare a separate governed runtime-remediation proposal using the native pattern;
- if a material gap remains, execute the Web Awesome candidate as a second isolated trial and measure the incremental capability/runtime cost;
- in both cases, a human integration decision is required before changing `control-center/index.html`.

## External technical references

- MDN — Popover API and accessibility behavior of declarative invokers.
- MDN — `HTMLButtonElement.popoverTargetElement`.
- MDN — CSS `position-area` / anchor positioning.
- Web Awesome — Popover component documentation.
- Web Awesome — changelog, release 3.10.0.
- Playwright — release 1.63.0.

No external source is treated as product evidence; the governed evidence is produced by the repository workflow on an immutable head.
