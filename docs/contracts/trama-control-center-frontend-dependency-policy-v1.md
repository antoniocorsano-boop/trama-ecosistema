# TRAMA Control Center — Frontend Dependency Policy v1

**Contract ID:** TRAMA-CC-APP-DEPS-01  
**Status:** PROPOSED / A0 LOCK CANDIDATE  
**Scope:** `apps/control-center/` only  
**Runtime impact:** NONE until A7 public cutover

## 1. Principle

Dependencies are admitted for behavior, accessibility, specialist capability or deterministic engineering value — not for visual convenience.

The Control Center owns its information architecture, semantics, product identity and final component composition.

## 2. Package boundary

All modular frontend dependencies SHALL live under:

`apps/control-center/package.json` + deterministic `package-lock.json`.

No root-level JavaScript dependency is authorized by A0.

No global installation is required.

## 3. Core allowed classes

A1 may introduce only the minimum foundation set:

- React;
- React DOM;
- TypeScript;
- Vite;
- React Router;
- AJV;
- Vitest;
- Testing Library;
- Playwright;
- axe-core integration appropriate to tests.

Tailwind, Radix, shadcn-owned source, Lucide and PWA tooling MAY be introduced in A1 only if directly exercised by the shell or test harness; otherwise defer to the first feature that needs them.

## 4. Deferred specialist dependencies

These are architecturally allowed but NOT pre-authorized for A1 installation:

- TanStack Table;
- XYFlow / React Flow;
- Apache ECharts;
- Motion.

They require feature-local justification and lazy-loading where materially heavy.

## 5. Explicitly excluded initially

- Next.js;
- SSR frameworks;
- Redux;
- Zustand;
- microfrontend frameworks;
- runtime plugin registries;
- UI kits that impose a foreign visual identity;
- external font packages/CDNs;
- browser GitHub SDK/API clients;
- analytics/tracking SDKs.

## 6. Admission record

Every new production dependency SHALL record:

- package;
- purpose;
- source class;
- license;
- pinned/range policy;
- accessibility role;
- runtime/bundle impact;
- update policy;
- replacement/exit path;
- owner/feature.

A dependency already named in the architecture is still subject to this admission record when actually installed.

## 7. Security and network boundary

Production browser code SHALL make no authority/state request to GitHub.

Runtime third-party network requests target: **0**.

No credential-bearing browser dependency is permitted.

Lockfile changes are reviewable supply-chain changes.

## 8. Bundle rule

Heavy dependencies must be route-lazy.

Initial targets remain:

- shell JS ≤ 180 KB gzip;
- shell CSS ≤ 50 KB gzip;
- ordinary feature chunk ≤ 100 KB gzip;
- graph/chart feature chunk ≤ 250 KB gzip, lazy.

A1 establishes measurement before these targets can become hard CI gates.

## 9. Accessibility rule

A dependency that provides interaction primitives is not accepted solely because it advertises accessibility.

Qualification must include the composed TRAMA usage:

- keyboard;
- focus;
- role/state semantics;
- mobile/touch where applicable;
- axe where appropriate;
- human validation for material journeys.

## 10. shadcn/Radix rule

Radix may provide behavioral primitives.

shadcn/ui is treated as source distribution: imported component code becomes TRAMA-owned implementation and must be adapted to TRAMA tokens/PVIP.

Neither establishes the Control Center visual language.

## 11. Upgrade rule

Dependency upgrades must not be bundled casually with unrelated feature work when they alter behavior, accessibility, build output or major version.

Security-only upgrades may use the smallest safe path.

## 12. Exit rule

A dependency may be removed/replaced without changing governed domain contracts.

No governed snapshot schema or authority rule may depend on a frontend package identity.
