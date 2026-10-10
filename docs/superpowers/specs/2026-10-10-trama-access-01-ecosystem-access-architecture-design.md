# TRAMA ACCESS-01 — Ecosystem Access Architecture

**Status:** APPROVED DESIGN — awaiting written-spec human review  
**Date:** 2026-10-10  
**Scope:** ecosystem access, professional identity, public access, learner access, governance access  
**Repository:** `antoniocorsano-boop/trama-ecosistema`  
**Baseline:** `main@72989b065a598012d0aa43fc6cb3568dcfeb4fcf`

## 1. Purpose

This specification freezes the access architecture for the whole TRAMA ecosystem so that the model does not remain only a conversational analysis or a visual diagram.

The design must cover all user-facing surfaces and all relevant cross-cutting capabilities currently in scope:

- TRAMA Gateway;
- TRAMA Access;
- Docente OS;
- Arena;
- **Curricolo Atlas**;
- Studio Atlas;
- Atlas learner/student experience;
- Materials;
- student/class/group assignment capability;
- Control Center;
- TRAMA governance and shared services where they influence access boundaries.

This specification deliberately distinguishes applications, cross-cutting resources/capabilities, public surfaces, professional surfaces, learner surfaces, governance surfaces, and non-user-facing services.

## 2. Canonical terminology

The canonical name is **Curricolo Atlas**.

`Curriculum Atlas` is non-canonical and MUST NOT be introduced in new user-facing copy, governance text, architecture documents, capability identifiers intended for display, or future product specifications.

The curriculum domain in TRAMA is the **curricolo di istituto**. Arena is its authoritative management surface; Curricolo Atlas is the navigation/consultation/intelligence surface over that authoritative curriculum.

## 3. Governing principles

### 3.1 One professional identity, independent product authorities

TRAMA SHALL provide one shared professional identity for adult/professional users.

That identity SHALL NOT make any one product the authority over the others. Docente OS, Arena, Studio Atlas, Curricolo Atlas and Control Center keep their own product responsibilities and local authorization rules.

Authentication answers **who the professional is**. Authorization answers **what that professional may do in a specific product/context**. Those concerns MUST remain separate.

### 3.2 No personal learner account by default

Atlas learner/student experiences SHALL remain usable without a personal TRAMA or Atlas account by default.

No learner login, learner email address, learner-wide server-side profile, or cross-experience behavioural tracking may be introduced merely to make product routing easier.

Where a teacher must address a class, group, or assignment, TRAMA SHALL prefer bounded assignment references, experience tickets/codes, or other privacy-preserving access mechanisms rather than exporting nominal student identity into Atlas.

### 3.3 Public, professional, learner and governance access are different planes

TRAMA SHALL distinguish at least four access planes:

1. **Public plane** — no professional identity required.
2. **Professional plane** — authenticated adult/professional identity.
3. **Learner plane** — child-safe access to Atlas experiences without a personal account by default.
4. **Governance plane** — privileged operational/governance access; may require stronger authorization and step-up authentication.

A surface may expose both a public and a privileged mode, but those modes MUST be explicitly separated.

### 3.4 No application becomes the implicit ecosystem shell

Docente OS is the teacher's operational environment, not the ecosystem identity provider.

Arena is the curricular authority, not the general professional portal.

Studio Atlas is the experience authoring environment, not the student runtime.

Control Center is observability/governance, not the normal launcher.

TRAMA Access is identity + entry/launch context, not another full dashboard.

### 3.5 Resources are not automatically applications

Materials and student/group assignment are cross-cutting capabilities/resources. They MUST NOT be promoted to standalone applications solely because multiple products consume them.

The architecture SHALL prefer shared contracts and explicit ownership over duplicated copies.

## 4. Ecosystem surface map

| Surface / capability | Nature | Primary audience | Access plane | Core authority |
| --- | --- | --- | --- | --- |
| TRAMA Gateway | public threshold | anyone | Public | none over product data |
| TRAMA Access | identity + launcher | professionals/adults | Professional | identity/entry only |
| Docente OS | teacher operating environment | teachers | Professional | teacher workspace/workflow |
| Arena | curricular authority | authorized professionals | Professional | curricolo di istituto |
| Curricolo Atlas | curriculum navigation/intelligence | public/professional per policy | Public + Professional | read/navigation over Arena authority |
| Studio Atlas | experience authoring | teachers/authors | Professional | authoring lifecycle |
| Atlas learner | learner runtime | students | Learner/Public bounded entry | experience execution, not personal identity |
| Materials | shared resource capability | professionals; indirectly learners | Cross-cutting | ownership/provenance/references |
| Assignment / class / group targeting | pedagogical addressing capability | teachers | Professional → Learner boundary | teacher-side targeting, not learner identity authority |
| Control Center public | status/evidence surface | anyone | Public | public observability only |
| Control Center privileged | governance/operations | authorized operators | Governance | governed operational actions |
| TRAMA governance | contracts/policy/authority | ecosystem | Governance | contracts, boundaries, lifecycle |
| shared services / adapters | infrastructure | applications/services | machine-to-machine | bounded service responsibility |

## 5. The two canonical product chains

TRAMA has two distinct chains that MUST NOT be collapsed.

### 5.1 Curricular chain

```text
Arena
  │ authoritative curricolo di istituto
  ▼
Curricolo Atlas
  │ navigation / consultation / intelligibility
  ▼
Docente OS / Studio Atlas / other professional contexts
```

Rules:

- Arena owns curricular mutation and approval authority.
- Curricolo Atlas does not become a second curricular authority.
- Curricolo Atlas may expose public and professional views, but writes to the canonical curriculum require an Arena-governed path.
- Docente OS and Studio Atlas may deep-link to Curricolo Atlas for context without copying the curriculum into their own authority domain.

### 5.2 Experience chain

```text
Studio Atlas
   │ author / validate / publish under governance
   ▼
Atlas learner
   │ learner experience
   ▼
Student
```

Rules:

- Studio Atlas is professional authoring.
- Atlas learner is not a professional authoring environment.
- Student access does not imply a personal TRAMA account.
- Studio Atlas preview/publication paths MUST preserve the existing separation between professional authoring identity and learner runtime identity.

## 6. Role of Docente OS

Docente OS is the canonical operational environment for the teacher.

It may orchestrate navigation into other governed surfaces, for example:

```text
Lesson / planning context
  ├── consult curriculum → Curricolo Atlas
  ├── govern curriculum → Arena (when authorized)
  ├── use/reference material → Materials
  ├── create experience → Studio Atlas
  └── open/assign experience → Atlas learner
```

This orchestration is an integration concern, not ownership transfer.

Docente OS MUST NOT become the identity provider for TRAMA merely because it already has a real authentication and workspace model.

Docente OS SHALL continue to own its local workspace membership and data authorization rules.

## 7. TRAMA Access

### 7.1 Responsibility

TRAMA Access is intentionally small.

It owns:

- professional sign-in entry;
- professional identity session establishment/federation;
- minimal institutional/professional context needed for launch decisions;
- application-level entitlements;
- routing/launch into authorized applications;
- ecosystem-level sign-out coordination where technically supported.

It does not own:

- curriculum data;
- lesson data;
- materials content;
- Studio Atlas drafts;
- learner progress/profile data;
- product-specific fine-grained permissions;
- governance decisions belonging to Control Center/TRAMA authority.

### 7.2 Minimal data model

The minimum conceptual model is:

```text
Principal
  ├── InstitutionalContext
  └── ApplicationEntitlement
```

Illustrative entitlements:

```text
DOCENTE_OS      USE
CURRICOLO_ATLAS READ
STUDIO_ATLAS    AUTHOR
ARENA           ENTER
CONTROL_CENTER  GOVERNANCE_OPERATOR
```

These entitlements allow entry to a product or mode. Fine-grained authorization remains local to the product.

### 7.3 Launcher behavior

TRAMA Access MUST NOT become a duplicate dashboard.

Its normal post-authentication surface should remain a lightweight launcher/context selector. If only one authorized destination is materially relevant, direct continuation may be used.

The launcher MUST derive available applications from governed configuration/entitlements, not from a permanent hard-coded list in the UI.

## 8. Professional identity architecture

### 8.1 Recommended architecture

TRAMA SHOULD use a dedicated ecosystem identity provider, separate from product databases.

Initial implementation may use a dedicated Supabase Auth project provided that applications integrate through standard OAuth/OIDC contracts and do not couple directly to product-specific database internals.

The identity provider MUST NOT contain Docente OS lessons, Arena curriculum data, Studio Atlas drafts, materials content, or learner records.

### 8.2 Identity versus local product identity

A stable ecosystem-level professional principal SHALL exist conceptually.

Applications may maintain their own local user/session identifiers. A local `auth.uid()` or equivalent need not be numerically identical across products.

A governed mapping/adaptation layer MAY map a TRAMA principal to a local application identity.

This prevents the ecosystem from requiring one shared product database or one shared authorization schema.

### 8.3 Provider portability

The ecosystem boundary SHOULD be based on standard identity protocols (OAuth 2.x / OpenID Connect) so the implementation can later move from one identity provider to another without rewriting product authorization models.

The provider implementation is therefore replaceable; the TRAMA identity contract is the architectural authority.

## 9. Curricolo Atlas access model

Curricolo Atlas may expose at least two modes.

### 9.1 Public mode

If the institution's curricolo is public/publishable under governance, Curricolo Atlas may permit unauthenticated consultation.

Public mode MUST NOT expose professional-only data merely because the same frontend can render both modes.

### 9.2 Professional mode

Authenticated professionals may receive richer context such as links to their planning, materials or authoring workflows.

Professional context does not grant curriculum mutation authority. Writes remain governed by Arena.

## 10. Arena access model

Arena requires professional identity for privileged curriculum management.

TRAMA Access may grant an application-level entitlement to enter Arena, but Arena owns its internal role model, for example read/edit/approve/publish capabilities.

Institutional context is especially important for Arena because curricular authority belongs to an institution/context, not merely to an individual account.

## 11. Studio Atlas access model

Studio Atlas SHALL adopt TRAMA professional identity rather than creating a competing standalone professional login system.

Studio Atlas keeps its own authoring authorization and draft ownership semantics.

Its learner preview path MUST continue to cross into Atlas through a governed learner-preview boundary, not by handing the learner the professional session.

## 12. Atlas learner/student access model

Atlas learner SHALL remain outside the professional identity plane.

Where experiences are assigned to a class/group, the teacher-side system may issue a bounded assignment reference or access code.

Illustrative boundary:

```text
Docente OS / professional context
   │ class/group selection
   ▼
Assignment
   │ experience reference + bounded token/code
   ▼
Atlas learner
```

The default handoff SHOULD NOT include a nominal class register or a learner-wide personal identifier.

Any future exception requires explicit CHILD-SAFE/privacy governance and necessity analysis.

## 13. Materials as a cross-cutting resource

Materials SHALL be modeled as a shared governed resource/capability before considering a standalone application.

The canonical material contract should be able to express at least:

- stable material identifier;
- owner/workspace or governing context;
- author/origin;
- provenance;
- discipline/domain metadata where relevant;
- curricular references;
- lesson/planning references;
- Studio Atlas / Atlas experience references where relevant;
- sharing/presentation/export mode;
- lifecycle/versioning information where required.

The same material should be referenced from multiple products rather than copied into multiple competing authorities whenever technically and legally appropriate.

## 14. Student/class/group organization

Teacher-side organization of students/classes/groups is a pedagogical capability, not proof that Atlas needs personal student accounts.

Docente OS or another authorized professional system may manage class/group structure needed for planning and assignment.

The learner boundary SHOULD receive the minimum data needed to open the experience.

Teacher-side nominal data MUST NOT silently propagate to Atlas learner merely for convenience.

## 15. Control Center

Control Center has two logically distinct access surfaces.

### 15.1 Public Control Center

May expose governed non-sensitive information such as ecosystem status, evidence, maturity, contracts or public release/state information.

This mode may remain unauthenticated.

### 15.2 Privileged Control Center

If/when Control Center can perform sensitive or irreversible operations — such as authority changes, promotion, configuration mutation, runtime actions or governed approvals — professional authentication alone is insufficient.

Privileged Control Center SHALL require a dedicated governance entitlement and SHOULD support step-up authentication/MFA for sensitive operations.

An ordinary authenticated TRAMA user MUST NOT acquire governance authority simply by being signed in.

## 16. Gateway behavior

TRAMA Gateway remains a public threshold and identity/narrative surface.

It SHALL NOT store credentials, become the IdP, or infer product authorization.

`Entra in TRAMA` and `Accedi` SHOULD eventually route to the canonical TRAMA Access entry point.

The current production requirement for an explicit `VITE_TRAMA_ENTRY_HREF` MUST remain fail-closed until a governed TRAMA Access destination exists. A temporary product URL MUST NOT be invented merely to make the button functional.

## 17. Public versus authenticated navigation

The ecosystem should support direct deep links after professional authentication without forcing a return through the launcher for every transition.

A deep link MUST NOT carry bearer tokens, raw session credentials, privileged JWTs, or sensitive personal context in the URL.

Context references should be opaque/bounded and resolved by the destination application under its own authorization rules.

## 18. Machine-to-machine services

Knowledge/evidence services, connector/runtime services, sync/import, Visual Factory, Runtime Adapter and similar infrastructure are not launcher destinations.

They require separate machine-to-machine authorization contracts and remain subordinate to their existing authority/governance boundaries.

DOS-A1 remains `RUNTIME_DEFERRED` unless separately changed by an authorized decision.

## 19. Security and privacy invariants

The architecture SHALL preserve these invariants:

- no passwords or long-lived bearer tokens passed between apps in URLs;
- no shared `localStorage` token hack across applications;
- no authorization based solely on mutable email or display metadata;
- no implicit cross-product privilege escalation;
- no learner account introduced merely to support assignments;
- no learner nominal register exported to Atlas by default;
- product data remains under product-specific authorization/RLS or equivalent controls;
- privileged Control Center operations require explicit governance authorization;
- Gateway remains non-authoritative for authentication and product permissions.

## 20. Initial user classes

The architecture must support at least these classes without conflating them:

| User class | Personal account | Typical surfaces |
| --- | --- | --- |
| Public visitor | no | Gateway, public Curricolo Atlas, public Control Center |
| Learner/student | no personal TRAMA account by default | Atlas learner |
| Teacher/professional | yes | Docente OS, Curricolo Atlas, Studio Atlas as entitled |
| Curriculum responsible/authorized professional | yes | professional surfaces + Arena roles |
| Governance/operator | yes + stronger authorization as needed | privileged Control Center |

## 21. Implementation sequence

Implementation MUST be incremental and reversible.

Recommended order:

1. freeze and approve this ACCESS-01 specification;
2. define the provider-neutral TRAMA professional identity contract;
3. establish a dedicated candidate identity provider with no product data;
4. build the minimal TRAMA Access login/launcher boundary;
5. federate Docente OS as the first pilot relying application because real authentication/workspace rules already exist there;
6. prove login, local authorization, sign-out and failure modes end-to-end;
7. federate Studio Atlas;
8. define public/professional modes for Curricolo Atlas;
9. integrate Arena with institutional context and local curricular roles;
10. formalize Control Center public versus privileged access and step-up requirements;
11. define the assignment/learner-access contract;
12. define the shared material resource contract;
13. only after a canonical TRAMA Access endpoint is certified, point Gateway `VITE_TRAMA_ENTRY_HREF` to it.

## 22. Evidence and qualification requirements

ACCESS-01 is not considered implemented merely because login screens render.

Qualification evidence must demonstrate, at minimum:

- Gateway remains usable publicly;
- professional authentication succeeds through the canonical identity boundary;
- unauthenticated professional routes fail closed or redirect safely;
- authorized launch into each pilot product works;
- product-local authorization remains effective after federation;
- logout/session expiry behavior is defined and tested;
- no credentials/tokens leak into URLs or public evidence;
- Curricolo Atlas public and professional modes do not cross-leak data;
- Arena write authority cannot be obtained from Curricolo Atlas access alone;
- Studio Atlas professional session is never handed to Atlas learner;
- learner access works without a personal account;
- assignment access does not require nominal learner export by default;
- Control Center public data is separated from privileged operations;
- privileged governance operations require explicit entitlement and stronger verification where specified;
- material references preserve provenance/ownership across consuming products;
- architecture terminology uses **Curricolo Atlas** consistently.

Evidence should be exact-head, reproducible, and tied to governed contracts rather than screenshots alone.

## 23. Non-goals of ACCESS-01

This design does not authorize:

- immediate creation of a new paid identity provider;
- immediate migration of all existing users;
- immediate organization/tenant administration UI;
- learner accounts;
- a new Materials application;
- restructuring Arena, Studio Atlas or Docente OS product ownership;
- privileged Control Center write operations;
- automatic deployment/merge;
- any change to DOS-A1 runtime status.

## 24. Canonical architecture statement

The ecosystem SHALL be governed by the following statement:

> **TRAMA provides one professional identity and one coherent entry architecture while preserving independent product authorities. Public access, professional access, learner access and governance access are distinct planes. Arena is authoritative for the curricolo di istituto; Curricolo Atlas provides its navigation/intelligence surface. Studio Atlas authors experiences; Atlas learner executes them without requiring a personal learner account by default. Docente OS orchestrates teacher work without becoming ecosystem authority. Materials and student/group assignment are cross-cutting capabilities. Control Center separates public observability from privileged governance.**

## 25. Decision record

Human design direction approved in conversation on 2026-10-10.

This file is the persistent repository evidence of that decision. Any future architecture change that materially alters identity authority, learner-account policy, Arena/Curricolo Atlas boundaries, Studio Atlas/Atlas learner boundaries, or public-versus-privileged Control Center access requires a new governed decision rather than silent drift.
