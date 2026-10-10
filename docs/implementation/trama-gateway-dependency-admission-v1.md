# TRAMA Gateway — Dependency Admission v1

**Scope:** `apps/gateway/` only  
**Owner:** TRAMA-GOVERNANCE  
**Runtime authority:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## Principle

The public gateway is an independent React/Vite application. Dependencies are admitted only when they provide framework, accessibility, styling, deterministic composition, testing, or build value. They do not establish TRAMA's visual identity and do not grant authentication, persistence, tracking, publication, or cross-product authority.

## Admitted packages

| Package | Purpose | Source class | License | Version policy | Accessibility role | Runtime/bundle impact | Update policy | Exit path |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `react` / `react-dom` | UI runtime and DOM rendering | framework | MIT | exact `19.3.0` | semantic composition only | core runtime | reviewed upgrades | replace only through gateway framework migration |
| `@radix-ui/react-slot` | composition primitive for locally owned controls | behavior primitive | MIT | exact `1.4.0` | preserves composed element semantics | small runtime | reviewed upgrades | replace with local `asChild`-free composition if no longer needed |
| `class-variance-authority` | typed local component variants | utility | Apache-2.0 | exact `0.7.1` | none directly | small runtime | reviewed upgrades | replace with local class mapping |
| `clsx` | conditional class composition | utility | MIT | exact `2.1.1` | none directly | very small runtime | reviewed upgrades | replace with local string composition |
| `tailwind-merge` | deterministic Tailwind class conflict resolution | utility | MIT | exact `3.7.0` | none directly | small runtime | reviewed upgrades | remove if local components no longer compose utility overrides |
| `tailwindcss` / `@tailwindcss/vite` | local styling compilation | build tooling | MIT | exact `4.3.3` | supports responsive/focus implementation but proves no conformance itself | build-time plus generated CSS | reviewed upgrades | migrate generated CSS to maintained local stylesheet |
| `vite` / `@vitejs/plugin-react` | application build and development tooling | build tooling | MIT | exact `8.3.1` / `6.1.1` | none directly | build-time | reviewed upgrades | migrate build system without changing governed UI contracts |
| `typescript` and React/Node type packages | static type checking | development tooling | Apache-2.0 / MIT | exact planned versions | none directly | development only | reviewed upgrades | replace with equivalent static tooling only through explicit migration |
| `vitest`, Testing Library, `jsdom`, `@testing-library/jest-dom` | unit/component verification | test tooling | MIT | exact planned versions | verifies semantic rendering and interactions | development only | reviewed upgrades | replace with equivalent behavior-focused tests |
| `@playwright/test`, `@axe-core/playwright` | browser, responsive and automated accessibility evidence | test/evidence tooling | Apache-2.0 / MPL-2.0 | exact planned versions | browser keyboard/focus/axe evidence | CI/development only | reviewed upgrades | replace only with evidence-equivalent browser tooling |

## shadcn/ui rule

shadcn/ui is used only as an open-code composition convention. Any copied component source becomes TRAMA-owned code under `apps/gateway/src/components/ui/`, must consume TRAMA semantics, and may not import a foreign visual identity.

## Network and data boundary

- Browser runtime must not call GitHub or any authority/state API.
- No analytics, telemetry, student tracking, authentication SDK, or credential-bearing client is admitted.
- The temporary CloudFront MP4 and optional font origins are presentation resources only and receive no user or authority data from the application.
- `VITE_TRAMA_ENTRY_HREF` is a navigation destination, not an authentication implementation.

## Lock and updates

`apps/gateway/package-lock.json` is the deterministic supply-chain record. Production or development dependency changes are reviewed as gateway-scoped changes and are not bundled casually with unrelated ecosystem work.
