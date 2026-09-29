# TRAMA Stage E3-L0 — Human-use validation of the universal summary

**Status:** PROPOSED / HUMAN VALIDATION / READ_ONLY  
**Date:** 2026-09-29  
**Surface:** TRAMA Control Center · L0 universal summary  
**Public preview:** `/preview/l0/`  
**Authority:** none added  
**DOS-A1:** RUNTIME_DEFERRED

## Purpose

E3-L0 validates whether a person who does not know TRAMA internals can understand the universal Control Center summary.

The participant must be able to determine, without repository or DevOps vocabulary:

1. what is available now;
2. whether anything requires attention;
3. whether a decision blocks a specific activity;
4. what remains usable;
5. how fresh the information is.

## Participant mode

The participant opens:

`/preview/l0/?participant=1&state=<allowlisted>`

Allowed states:
- `normal`
- `attention`
- `decision`
- `offline`

In participant mode:
- scenario controls are hidden;
- no internal scenario code is displayed;
- a neutral “Versione di prova” notice remains visible;
- the same L0 layout and copy are used;
- no network or write capability is added.

## Moderator

The moderator uses:

`/e3/?head=<EXACT_HEAD>`

The E3 panel exposes the four L0 scenarios and locally generates receipts conforming to:

`governance/human-use/stage-e3-l0-human-use-receipt.schema.json`

## Use-case catalog

Canonical catalog:

`governance/human-use/stage-e3-l0-use-case-catalog.json`

Required cases:
- E3-L0-UC-01 NORMAL
- E3-L0-UC-02 ATTENTION
- E3-L0-UC-03 DECISION
- E3-L0-UC-04 OFFLINE

All are critical comprehension cases.

## Closure

E3-L0 cannot close when:
- any CRITICAL finding remains open;
- any required state is untested;
- no smartphone evidence exists;
- scenario controls are visible to a participant;
- a participant treats cached/offline state as freshly verified;
- a participant attributes approval authority to the Control Center.

E3-L0 PASS does not imply PASS for L1/L2/L3.

## Privacy

Receipts:
- contain no direct identifiers;
- contain no ungoverned recording;
- are generated locally in the browser;
- are bound to an exact head supplied by the governed moderator URL.

## Boundaries

E3-L0 does not authorize:
- replacement of the public Home;
- Live Overlay activation;
- telemetry;
- GitHub App;
- write/approval capability;
- automatic promotion;
- DOS-A1.
