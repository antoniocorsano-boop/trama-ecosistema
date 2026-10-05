# Studio Atlas — Creator Roles & Authority v0.1

**Status:** PROPOSED_AUTHORITY_MODEL / HUMAN_REVIEW_REQUIRED  
**Runtime:** NOT_AUTHORIZED  
**Date:** 2026-10-04

## 1. Principle

Identity, role and authority are distinct.

A logged-in professional may hold several roles, but the system MUST NOT collapse:

- being the creator;
- reviewing quality;
- authorising publication;
- owning curriculum authority.

## 2. Professional identity boundary

Studio Atlas requires an authenticated professional subject.

Initial adapter:

**Docente OS professional identity/session**

Future compatible adapters MAY include:

- ecosystem-wide professional identity;
- standalone Studio Atlas identity federation;
- institution-managed professional SSO.

The authoring contract MUST NOT depend on Docente OS class-workspace identifiers as identity.

Public learners remain outside this professional identity boundary.

## 3. Roles

### Creator

May:

- create pathway seed;
- edit authoring package;
- develop story/world/scenes;
- request production;
- request learner preview;
- respond to review findings;
- submit a publication candidate.

Cannot by role alone:

- approve own mandatory independent review where separation is required;
- alter Arena authority;
- force Atlas publication;
- purchase compute;
- bypass blockers.

### Curator / Reviewer

May:

- review story/world/experience;
- record qualitative findings;
- approve/reject a review gate within assigned scope;
- request revision;
- verify age dignity, product quality and evidence.

Does not gain:

- curriculum authority;
- publication authority by default;
- edit ownership of the creator's professional source context.

### Publication Authority

May:

- accept/reject an exact publication candidate according to governance;
- require additional review;
- initiate governed Atlas handoff.

Does not gain:

- authority to rewrite Arena curriculum;
- ability to publish a different digest than the reviewed one;
- permission to bypass licensing/accessibility/privacy blockers.

### Curriculum Authority

Arena/system-human process remains authoritative for curriculum version, applicability and approval state.

This is not a Studio Atlas user role that can be locally granted.

### System Automation

May:

- validate schemas;
- generate candidates;
- run checks;
- orchestrate compute;
- materialise repository evidence;
- build previews;
- propose findings.

May not:

- approve qualitative gates;
- grant publication authority;
- alter curriculum authority;
- purchase compute beyond explicit policy;
- silently downgrade quality.

## 4. Permission matrix

| Action | Creator | Reviewer | Publication authority | Automation |
|---|---:|---:|---:|---:|
| Create seed | YES | optional | NO | assist only |
| Edit story/world/scenes | YES | comment/request revision | NO by default | assist |
| Request visual production | YES | optional | NO | execute under policy |
| Human Story Review | may submit | YES | optional | NO |
| Experience Quality Review | may submit | YES | optional | evidence only |
| Human Use Review | participate | YES | optional | evidence only |
| Submit candidate | YES | NO | NO | validate only |
| Accept publication candidate | NO | advisory | YES | NO |
| Set Arena authority | NO | NO | NO | NO |
| Publish arbitrary unreviewed digest | NO | NO | NO | NO |
| Purchase compute | NO by default | NO | NO | NO |

## 5. Same person, multiple roles

Pilot deployments may have one human holding Creator, Reviewer and Publication Authority roles.

The system MUST still:

- record the role used for each consequential decision;
- bind every decision to an exact package digest;
- preserve review sequence;
- prevent automation from impersonating a human role.

Where independent review becomes a governance requirement, the system must enforce different professional subjects.

## 6. Creator ownership vs ecosystem authority

The creator owns professional intent and draft decisions.

The creator does not own:

- Arena curriculum truth;
- Atlas public publication state;
- TRAMA cross-product contracts.

This avoids the false equation:

`I created it → therefore it is approved/published`.

## 7. Reviewer UX

Review should be task-focused.

A reviewer should receive:

- what changed;
- what must be judged;
- learner preview;
- relevant evidence;
- unresolved blockers.

They should not need to inspect the repository unless opening technical detail.

## 8. Publication UX

Publication Authority sees:

- exact candidate title/version;
- package digest;
- review decisions;
- blocking/non-blocking findings;
- rights/accessibility/privacy state;
- learner preview;
- proposed Atlas destination.

Primary actions:

- **Approva il candidato**
- **Richiedi modifiche**
- **Rifiuta**

Approval means acceptance for governed Atlas handoff, not curriculum approval.

## 9. Public attribution

Professional creator/reviewer identity is private operational metadata by default.

If creator attribution is desirable publicly, it requires:

- explicit product decision;
- explicit consent/base;
- separate public display field.

Do not expose account identity automatically.

## 10. Standalone-product compatibility

If Studio Atlas becomes a standalone application:

- roles remain unchanged;
- authority boundaries remain unchanged;
- package contract remains unchanged;
- professional identity adapter changes only at the authentication boundary.

This is a hard portability requirement.
