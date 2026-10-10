# TRAMA Gateway — Background Asset v3 Viewport-Sufficiency Amendment

**Status:** APPROVED CONTRACT CORRECTION  
**Date:** 2026-10-10  
**Scope:** PR #266 — `design/trama-identity-gateway-v1`  
**Supersedes:** dimension/minimum-size rules in sections 5, 13, 14 and 20 of `2026-10-10-trama-gateway-background-assets-v3-execution-spec.md`  
**Merge/deploy:** NOT AUTHORIZED

## 1. Reason for correction

The original v3 specification encoded fixed production minimums of 2560×1440, 1536×2048, 1170×2532 and 960×2700. Those values were intentionally conservative, but they became an arbitrary authoring requirement rather than a direct product-quality requirement.

The product requirement is instead that the selected source for each governed viewport can be rendered with `object-fit: cover` **without enlarging the source raster**. Repeated regeneration solely to reach an arbitrary 2×/3× pixel count is not justified when the approved source already covers the certified viewport at scale ≤ 1.

This amendment therefore replaces absolute minimum source dimensions with a deterministic viewport-sufficiency rule while preserving all other v3 quality, art-direction, provenance, UI-free and Human Review gates.

## 2. Canonical review viewports

| Role | Canonical review viewport | Target source ratio |
| --- | ---: | ---: |
| L | 1440×900 | 16:9 |
| M | 768×1024 | 3:4 |
| S | 390×844 | 390:844 |
| LIM | 320×900 | 320:900 |

The target ratio remains an art-direction constraint. L intentionally uses a 16:9 source on the 1440×900 review viewport and may therefore crop vertically under `object-fit: cover`.

## 3. Viewport-sufficiency rule

For source dimensions `sourceWidth × sourceHeight` and the governed viewport `viewportWidth × viewportHeight`, compute:

```text
coverScale = max(
  viewportWidth / sourceWidth,
  viewportHeight / sourceHeight
)
```

A production asset is dimensionally sufficient only when:

```text
coverScale <= 1
```

Therefore:

- **no source raster enlargement is allowed** at its canonical review viewport;
- downscaling is allowed;
- normal `object-fit: cover` cropping is allowed;
- resizing a smaller source upward before encoding remains forbidden;
- screenshot-derived assets remain forbidden;
- the existing ±2% source aspect-ratio tolerance remains enforced.

A future 2×/Retina source family may be introduced as a non-blocking quality enhancement after the v3 background Human Review. It is not a prerequisite for this PR.

## 4. Approved production source dimensions

The Human-approved final background generations selected for this phase are:

| Role | Approved source dimensions | `coverScale` at canonical viewport | Result |
| --- | ---: | ---: | --- |
| L | 1672×941 | ~0.956 | PASS — downscale/crop only |
| M | 1086×1448 | ~0.707 | PASS — downscale only |
| S | 853×1844 | ~0.458 | PASS — downscale only |
| LIM | 748×2103 | ~0.428 | PASS — downscale only |

The earlier L reference at 1536×864 is **reference-only**: on a 1440×900 viewport it would require approximately 4.17% source enlargement under `cover`, so it is not eligible as the production L raster.

## 5. Encoding

The four approved sources are encoded to WebP without geometric resampling or upscaling:

- `trama-gateway-bg-l.webp`
- `trama-gateway-bg-m.webp`
- `trama-gateway-bg-s.webp`
- `trama-gateway-bg-lim.webp`

Encoding target remains high-quality photographic WebP, approximately quality 88–92. Encoding may change compression representation but MUST NOT change source pixel dimensions.

## 6. Validator v3 correction

The validator MUST continue to fail for:

- missing role;
- corrupt/non-WebP data;
- provenance mismatch;
- legacy poster selection;
- source aspect ratio outside ±2%;
- non-false privacy/UI flags;
- any role whose `coverScale` is greater than 1 at its canonical viewport.

The validator MUST NOT fail solely because an asset is below the superseded fixed 2×/3× dimension table when `coverScale <= 1`.

## 7. Preserved gates

Unchanged from the parent v3 specification:

- four independent L/M/S/LIM roles;
- UI-free source images;
- no embedded `Segno vivo`;
- no video or duplicate scene during background evidence;
- provenance v3;
- deterministic `background-L/M/S/LIM.png` evidence;
- no merge or deploy;
- no return to full Gateway UI review until the background family receives Human PASS.

## 8. Completion condition

This background phase may reach Human Review when one exact head contains:

- all four canonical WebP files;
- `coverScale <= 1` for every role;
- ±2% source-ratio validation PASS;
- provenance v3 matching the real files;
- validator tests PASS;
- typecheck/unit/build PASS;
- background-only browser certification and evidence PASS.

Human Review remains the authority for sharpness, composition, family coherence and visible image quality.
