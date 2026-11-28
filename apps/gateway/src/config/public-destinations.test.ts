import { describe, expect, it } from 'vitest';
import { publicAtlasHref, resolvePublicAtlasDestination, type PublicAtlasRelease } from './public-destinations';

const admitted: PublicAtlasRelease = {
  flowId: 'gateway_to_curricolo_atlas_public', destinationAdmission: 'ADMITTED',
  releaseEvidenceRef: 'fixture:release', reachabilityEvidenceRef: 'fixture:reachability',
  publicBaseUrl: 'https://atlas.example/', href: 'https://atlas.example/curricolo',
};

describe('public Atlas destination', () => {
  it('uses the existing canonical Pages subpath, independently of flow promotion', () => {
    expect(publicAtlasHref).toBe('https://antoniocorsano-boop.github.io/Curriculum-Atlas/curricolo/');
    expect(resolvePublicAtlasDestination(null)).toBeNull();
  });
  it('allows only the admitted curricolo route', () => {
    expect(resolvePublicAtlasDestination(admitted)).toBe(admitted.href);
    expect(resolvePublicAtlasDestination({ ...admitted, href: admitted.href + '/' })).toBe(admitted.href + '/');
  });
  it('supports a canonical deployed subpath without escaping it', () => {
    const pages = { ...admitted, publicBaseUrl: 'https://atlas.example/Atlas-demo/', href: 'https://atlas.example/Atlas-demo/curricolo/' };
    expect(resolvePublicAtlasDestination(pages)).toBe(pages.href);
    for (const href of ['https://atlas.example/curricolo/', 'https://atlas.example/Other/curricolo/', 'https://atlas.example/Atlas-demo/../curricolo/', 'https://atlas.example/Atlas-demo/%63urricolo/', pages.href + '?preview=1']) {
      expect(resolvePublicAtlasDestination({ ...pages, href })).toBeNull();
    }
  });
  it.each(['UNVERIFIED', 'WITHDRAWN'] as const)('rejects admission state %s', (destinationAdmission) => {
    expect(resolvePublicAtlasDestination({ ...admitted, destinationAdmission })).toBeNull();
  });
  it.each([
    { releaseEvidenceRef: ' ' }, { reachabilityEvidenceRef: ' ' },
    { href: 'http://atlas.example/curricolo' }, { href: 'https://other.example/curricolo' },
    { href: 'https://atlas.example/percorsi/lab' }, { href: 'https://atlas.example/curricolo?preview=1' },
    { href: 'https://atlas.example/curricolo#preview' }, { href: 'https://user@atlas.example/curricolo' },
    { publicBaseUrl: 'https://atlas.example/private' }, { publicBaseUrl: 'https://atlas.example/a/../' }, { publicBaseUrl: 'https://atlas.example/?preview=1' }, { publicBaseUrl: 'https://atlas.example/%61/' }, { href: '/curricolo' },
    { href: 'javascript:alert(1)' },
  ])('fails closed on invalid or non-admitted destination %j', (change) => {
    expect(resolvePublicAtlasDestination({ ...admitted, ...change })).toBeNull();
  });
});
