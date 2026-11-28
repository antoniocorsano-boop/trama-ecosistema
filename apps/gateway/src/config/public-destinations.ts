/** Read-only navigation projection; does not promote the canonical ecosystem flow. */
export interface PublicAtlasRelease {
  readonly flowId: 'gateway_to_curricolo_atlas_public';
  readonly destinationAdmission: 'ADMITTED' | 'UNVERIFIED' | 'WITHDRAWN';
  readonly releaseEvidenceRef: string;
  readonly reachabilityEvidenceRef: string;
  readonly publicBaseUrl: string;
  readonly href: string;
}

/** Never accepts navigation parameters or user-supplied configuration. */
export function resolvePublicAtlasDestination(release: PublicAtlasRelease | null): string | null {
  if (!release || release.flowId !== 'gateway_to_curricolo_atlas_public' ||
      release.destinationAdmission !== 'ADMITTED' || !release.releaseEvidenceRef.trim() ||
      !release.reachabilityEvidenceRef.trim()) return null;
  try {
    const base = new URL(release.publicBaseUrl);
    const target = new URL(release.href);
    if (base.protocol !== 'https:' || target.protocol !== 'https:' ||
        base.username || base.password || target.username || target.password ||
        base.search || base.hash || target.search || target.hash ||
        base.href !== release.publicBaseUrl || target.href !== release.href ||
        !/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(base.pathname) ||
        target.origin !== base.origin ||
        ![base.pathname + 'curricolo', base.pathname + 'curricolo/'].includes(target.pathname)) return null;
    return target.href;
  } catch {
    return null;
  }
}

// Candidate admission: existing canonical Pages release (14 November) and human
// smartphone reachability (28 November). Neither proves a current live SHA or
// qualifies the Gateway-to-Atlas flow. No identity, state transfer or new release.
const atlasCurriculum: PublicAtlasRelease = {
  flowId: 'gateway_to_curricolo_atlas_public',
  destinationAdmission: 'ADMITTED',
  releaseEvidenceRef: 'https://github.com/antoniocorsano-boop/Curriculum-Atlas/actions/runs/43628770886',
  reachabilityEvidenceRef: 'https://github.com/antoniocorsano-boop/trama-ecosistema/issues/353#issuecomment-7238874583',
  publicBaseUrl: 'https://antoniocorsano-boop.github.io/Curriculum-Atlas/',
  href: 'https://antoniocorsano-boop.github.io/Curriculum-Atlas/curricolo/',
};

export const publicAtlasHref = resolvePublicAtlasDestination(atlasCurriculum);
