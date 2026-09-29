# CC2 — RepositoryObservation Promotion Write Actor v1

Status: CANDIDATE / QUALIFICATION ONLY / RUNTIME NOT ACTIVATED

## Purpose

Implement PR-C from the governed RepositoryObservation promotion architecture.

The actor is deliberately separate from the collector and planner. It consumes only a validated Promotion Write Bundle and may mutate only the TRAMA governance repository.

## Closed capability set

Target repository:
- antoniocorsano-boop/trama-ecosistema

Base:
- main
- exact SHA required and rechecked immediately before mutation

Allowed mutations:
1. create one deterministic branch under project-knowledge/promotion/;
2. create or update exactly:
   - control-center/data/repository-observation.json
   - control-center/data/project-context-snapshot.json
   - status/project-knowledge-events.json
3. create one draft pull request from that branch to main.

Forbidden:
- merge;
- approval/review submission;
- issue/PR comments;
- release/tag creation;
- deletion;
- force push;
- mutation of Arena, Atlas or Docente OS;
- writes outside the three allowlisted paths;
- use of collector credentials/context;
- auto-promotion without a READY_FOR_HUMAN_REVIEW proposal.

## Exact-head and idempotency

The actor verifies that current main equals bundle.baseExactSha before any mutation and rechecks main immediately before PR creation. If main moves during the write sequence, PR creation is denied and a fresh bundle/base-bound branch is required.

The branch name is deterministic from proposalId + baseExactSha. This prevents an interrupted attempt on an obsolete baseline from being reused for a later baseline. If it exists:
- only the three allowlisted paths may differ from the bound base;
- unexpected changed paths fail closed;
- already-correct file content is left untouched;
- missing/expected allowlisted content may be completed;
- an existing single open PR is returned rather than duplicated;
- multiple matching PRs fail closed.

There is no force reset or destructive recovery.

## Event integration

The dedicated RepositoryObservationPromotionEvent is preserved inside a standard Project Knowledge KnowledgeEvent wrapper of type PROMOTION. This keeps status/project-knowledge-events.json compatible with the existing Second Brain corpus while preserving the complete promotion event and provenance.

## Network boundary

The executable path uses only:
- HTTPS api.github.com;
- fixed target repository;
- GET, POST and PUT;
- proxy inheritance disabled;
- redirects denied.

The token is runtime-only and is never serialized into evidence or output.

## Activation boundary

This PR does not add a workflow_dispatch or any other live trigger.

Merging the actor qualifies code capability only. A later activation tranche must separately define:
- runtime authorization;
- exact actor SHA;
- token permission envelope limited to contents:write and pull-requests:write for TRAMA only;
- single-use invocation semantics;
- input bundle provenance/transport;
- post-run evidence and failure recovery.

Human review remains mandatory before merge of every promotion PR.
