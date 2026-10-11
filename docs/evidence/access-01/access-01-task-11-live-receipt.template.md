# ACCESS-01 Task 11 — Live Qualification Receipt Template

State: `TEMPLATE_ONLY`

This template may be materialized only after the authorized Task 11 live qualification. It is deliberately limited to non-secret, non-personal evidence.

## Qualification identity

- Exact repository head: `<sha>`
- Provider kind: `supabase`
- Region: `eu-central-1`
- Plan: `free`
- Email delivery: `built-in`
- Provider user count: `1`
- Identity authority: `issuer+subject`
- AccessSession TTL: `28800` seconds

## Pre-mutation gates

- Human authorization: `<PASS|FAIL>`
- Exact-head TRAMA Access: `<PASS|FAIL>`
- Exact-head Governance: `<PASS|FAIL>`
- Independent Codex review, zero open P1/P2: `<PASS|FAIL>`
- Free quota confirmed without paid add-on: `<PASS|FAIL>`
- Frankfurt project placement confirmed: `<PASS|FAIL>`
- Built-in SMTP eligibility confirmed: `<PASS|FAIL>`

## Live qualification

- Provider project/store configured within approved scope: `<PASS|FAIL>`
- Exactly one provider pilot user: `<PASS|FAIL>`
- Exact provider subject bound server-side before login: `<PASS|FAIL>`
- OTP request → verify → Principal → AccessSession → launcher → logout: `<PASS|FAIL>`
- Unknown alias neutrality: `<PASS|FAIL>`
- Invalid OTP neutrality: `<PASS|FAIL>`
- Subject mismatch fail-closed: `<PASS|FAIL>`
- Provider outage/failure mapping: `<PASS|FAIL>`
- Alias revocation: `<PASS|FAIL>`
- Entitlement revocation: `<PASS|FAIL>`
- Absolute session expiry/logout: `<PASS|FAIL>`
- Alias query abort reaches live datastore: `<PASS|FAIL>`

## Live shared rate-limit proof

Record only outcomes and configured limits. Do not record alias/email/key digests.

- `OTP_REQUEST` — 5 / 15m, cross-instance concurrent boundary: `<PASS|FAIL>`
- `OTP_VERIFY` — 10 / 15m, cross-instance concurrent boundary: `<PASS|FAIL>`
- `OTP_REQUEST_GLOBAL` — 20 / 15m, cross-instance concurrent boundary: `<PASS|FAIL>`
- `OTP_VERIFY_GLOBAL` — 20 / 15m, cross-instance concurrent boundary: `<PASS|FAIL>`

## Post-live gates

- Unit tests: `<PASS|FAIL>`
- Typecheck: `<PASS|FAIL>`
- Build: `<PASS|FAIL>`
- Browser Certification: `<PASS|FAIL>`
- Phase 2 invariant validator: `<PASS|FAIL>`
- Governance: `<PASS|FAIL>`
- Fresh independent post-live Codex review: `<PASS|FAIL>`

## Privacy / secret exclusions

The materialized receipt MUST NOT contain:

- pilot email address;
- OTP value;
- provider secret/service-role key;
- access token or refresh token;
- session cookie or raw AccessSession secret;
- provider subject in clear;
- alias/key digest or other unnecessary personal/identifying data.

## Terminal boundary

A PASS receipt ends at:

`TASK_11_QUALIFIED_AWAITING_DEPLOY_DECISION`

It does **not** authorize public deploy, product federation, custom SMTP, paid resources, learner identity/data, or additional provider users.
