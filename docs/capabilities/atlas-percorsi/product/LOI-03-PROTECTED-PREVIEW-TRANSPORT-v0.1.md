# LOI-03 — Protected preview transport

The real MEDIA-01 pilot archive is 3,912,528 bytes; expanded resources are 4,182,613 bytes before JSON/base64 expansion. A conventional buffered response can exceed Vercel's documented 4.5 MB response threshold. Preserve original bytes and the existing verified JSON contract by streaming only successful, fully validated intake results. Both GitHub and ZIP importers use the shared transport. Error responses remain bounded JSON. No new permissions, data store, or public access.

Scope: an engineering candidate only. Vercel's request limit remains unchanged; larger ZIP uploads require a different transport or hosting design. Verify actual protected preview access, provider eligibility/plan and limits before deploying. No production deployment, student runtime, personal data, or paid services authorized. Local streaming tests do not constitute a deployed Vercel certification.

References: https://vercel.com/docs/functions/limitations ; https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions
