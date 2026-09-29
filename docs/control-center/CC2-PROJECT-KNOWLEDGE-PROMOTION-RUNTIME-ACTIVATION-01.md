# CC2 — Project Knowledge Promotion Runtime Activation v1

Status: CANDIDATE / EXECUTABLE WORKFLOW PRESENT / LIVE WRITE NOT YET AUTHORIZED

## Objective

Activate the already-qualified RepositoryObservation promotion path without collapsing the separation between observation, planning and mutation.

The runtime sequence is:

\`\`\`text
human workflow_dispatch
  -> anonymous collector (credential-isolated)
  -> local receipt + RepositoryObservation
  -> deterministic planner (credential-isolated)
  -> final Promotion Write Bundle (credential-isolated)
  -> governed write actor (write token exposed only here)
  -> deterministic branch
  -> Draft PR
  -> human review
  -> human merge decision
\`\`\`

No artifact upload or other remote intermediate handoff is used.

## Invocation identity and single use

The workflow is \`workflow_dispatch\` only.

Admission requires:
- branch \`main\`;
- \`run_attempt == 1\`;
- explicit input \`AUTHORIZE_PROMOTION_WRITE_ONE_SHOT\`;
- exact checkout at \`github.sha\`;
- no persisted checkout credential.

A rerun is rejected. A new dispatch is a new human issuance event.

## Credential separation

The job permission envelope is:
- \`contents: write\`;
- \`pull-requests: write\`.

This permission exists only because the final write actor must create a branch, update the three governed files and create a Draft PR.

The collector and planner steps run using \`env -i\`, receiving only \`PATH\` and \`HOME\`. They do not receive \`GITHUB_TOKEN\`, \`GH_TOKEN\`, Actions runtime variables, proxy variables, or the final write credential.

Only the final write-actor step receives \`github.token\`.

This does not reactivate the previously excluded GitHub App/PAT model for the public collector. The public observation remains anonymous. The write credential belongs to a distinct, separately governed mutation phase and is scoped by the workflow permissions to the TRAMA repository workflow context.

## Evidence handoff

The collector writes only local ephemeral files under \`.trama-promotion/\`:
- \`repository-observation.json\`;
- \`collector-summary.json\`.

The planner consumes them locally and, if the candidate is promotable, creates:
- \`write-bundle.json\`.

No \`upload-artifact\`, cache, release, issue comment, external store, or cross-workflow transport is permitted.

All handoff files and local claim markers are deleted in the final always-run cleanup step.

## State coherence

The Promotion KnowledgeEvent is constructed before final snapshot binding.

The final candidate \`ProjectContextSnapshot\` MUST contain the exact same PROMOTION event that will be written to \`status/project-knowledge-events.json\`.

The snapshot digest in the PromotionProposal is recomputed on that final state.

This prevents a promotion PR from carrying an event log and snapshot that disagree.

## Timestamp semantics

\`recordedAt\` / \`recordedBy\` mean when and by which governed invocation the promotion record was prepared.

They do not assert that the promotion has already happened.

The promotion becomes governed current state only when the Draft PR containing the event is merged by a human decision.

## No-op behavior

If the planner returns:
- \`NO_OP_ALREADY_PROMOTED\`;
- \`NO_OP_SEMANTIC_EQUIVALENT\`;
- \`OLDER_THAN_CURRENT\`;
- another non-promotable state;

no write bundle is emitted and the write step performs no mutation.

## Write boundary

The write actor remains limited to:
- one deterministic branch bound to proposalId + baseExactSha;
- \`control-center/data/repository-observation.json\`;
- \`control-center/data/project-context-snapshot.json\`;
- \`status/project-knowledge-events.json\`;
- one Draft PR to main.

It cannot merge, approve, comment, delete, force-push or mutate Arena, Atlas or Docente OS.

## Failure and recovery

If collection or planning fails, no write actor runs.

If main moves before the write actor begins, the actor fails before mutation.

If main moves after branch writes but before PR creation, PR creation fails closed. The base-bound branch is not force-reset or deleted. A fresh human dispatch on the new baseline produces a distinct branch identity.

A workflow rerun is forbidden. Recovery always requires a fresh dispatch.

## Activation boundary

Merging this activation tranche makes the workflow available but does not execute it.

The first real promotion requires a fresh explicit human authorization on the integrated main exact SHA and a single workflow dispatch.
