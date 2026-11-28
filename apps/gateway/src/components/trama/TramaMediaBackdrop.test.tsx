import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TramaMediaBackdrop } from './TramaMediaBackdrop';

function setReducedMotion(value: boolean) {
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
    matches: value,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
}

const responsiveProps = {
  background: {
    lim: '/media/trama-gateway-bg-lim.webp',
    s: '/media/trama-gateway-bg-s.webp',
    m: '/media/trama-gateway-bg-m.webp',
    l: '/media/trama-gateway-bg-l.webp',
  },
};

describe('TramaMediaBackdrop', () => {
  beforeEach(() => setReducedMotion(false));

  it('never overlays or fetches a prototype video in normal-motion mode', () => {
    const { container } = render(<TramaMediaBackdrop {...responsiveProps} />);
    expect(container.querySelectorAll('video')).toHaveLength(0);
    expect(screen.getByTestId('trama-media-poster')).toBeVisible();
  });

  it('exposes L/M/LIM with S fallback through one native responsive picture', () => {
    const { container } = render(<TramaMediaBackdrop {...responsiveProps} />);
    const sources = Array.from(container.querySelectorAll('picture source'));
    expect(sources).toHaveLength(3);
    expect(sources[0]).toHaveAttribute('media', '(min-width: 1024px)');
    expect(sources[0]).toHaveAttribute('srcset', '/media/trama-gateway-bg-l.webp');
    expect(sources[1]).toHaveAttribute('media', '(min-width: 600px)');
    expect(sources[1]).toHaveAttribute('srcset', '/media/trama-gateway-bg-m.webp');
    expect(sources[2]).toHaveAttribute('media', '(max-width: 359px)');
    expect(sources[2]).toHaveAttribute('srcset', '/media/trama-gateway-bg-lim.webp');

    const images = container.querySelectorAll('picture img');
    expect(images).toHaveLength(1);
    expect(screen.getByTestId('trama-media-poster')).toHaveAttribute(
      'src',
      '/media/trama-gateway-bg-s.webp',
    );
  });

  it('uses only the responsive local background when reduced motion is requested', () => {
    setReducedMotion(true);
    render(<TramaMediaBackdrop {...responsiveProps} />);
    expect(screen.queryByTestId('trama-media-video')).not.toBeInTheDocument();
    expect(screen.getByTestId('trama-media-poster')).toHaveAttribute(
      'src',
      '/media/trama-gateway-bg-s.webp',
    );
  });

  it('renders only the chosen responsive family without retaining the previous image', () => {
    const classic = { lim: '/classic-lim.webp', s: '/classic-s.webp', m: '/classic-m.webp', l: '/classic-l.webp' };
    const { container, rerender } = render(<TramaMediaBackdrop {...responsiveProps} />);
    rerender(<TramaMediaBackdrop background={classic} />);
    expect(container.querySelectorAll('picture img')).toHaveLength(1);
    expect(container.querySelectorAll('video')).toHaveLength(0);
    expect(screen.getByTestId('trama-media-poster')).toHaveAttribute('src', classic.s);
    expect(Array.from(container.querySelectorAll('picture source')).map(source => source.getAttribute('srcset'))).toEqual([classic.l, classic.m, classic.lim]);
  });
});
