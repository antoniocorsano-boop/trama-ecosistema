# TRAMA Post-Merge Baseline Integrity R1

**Contract ID:** TRAMA-POST-MERGE-BASELINE-INTEGRITY-01  
**Status:** PROPOSED / CI-ONLY / READ-ONLY  
**Runtime impact:** NONE  
**Trigger:** push to main

## Purpose

Provide a lightweight integrity check on the merged `main` baseline without repeating the full pull-request qualification pipeline.

## Scope

The post-merge check verifies only:

1. the canonical Project Context Snapshot remains reproducible;
2. Project Knowledge schemas remain valid;
3. Component Evidence Lane v2 still composes the Atlas R1 live evidence case correctly;
4. the workflow itself remains read-only.

## Non-goals

This workflow does not repeat:

- Governance in full;
- Control Center bundle construction;
- browser evidence capture;
- product runtime tests;
- lifecycle review;
- Human Review;
- release qualification.

## Security and governance boundary

The workflow has only `contents: read`.

It must not:

- push commits;
- create or update pull requests;
- merge;
- promote evidence;
- authorize runtime;
- mutate governed registries;
- write snapshots back to the repository.

A failure means only that the merged baseline requires investigation. It does not automatically roll back, reopen governance, or create a new decision.

## Operational model

```text
PR exact-head qualification
        |
Human Review
        |
merge
        |
push to main
        |
minimal post-merge baseline integrity
```

The post-merge lane is intentionally smaller than PR qualification. Its purpose is to detect integration-only breakage, not to re-run the entire development lifecycle.
