import { fireEvent, render, screen } from '@testing-library/react';
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
  videoSrc: '/video.mp4',
  poster: {
    s: '/media/trama-gateway-poster-s.webp',
    m: '/media/trama-gateway-poster-m.webp',
    l: '/media/trama-gateway-poster-l.webp',
  },
} as unknown as React.ComponentProps<typeof TramaMediaBackdrop>;

describe('TramaMediaBackdrop', () => {
  beforeEach(() => setReducedMotion(false));

  it('renders the native full-bleed looping video in normal-motion mode', () => {
    render(<TramaMediaBackdrop {...responsiveProps} />);
    const video = screen.getByTestId('trama-media-video') as HTMLVideoElement;
    expect(video.autoplay).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.muted).toBe(true);
    expect(video.playsInline).toBe(true);
    expect(video).toHaveClass('absolute', 'inset-0', 'h-full', 'w-full', 'object-cover');
    expect(video).toHaveAttribute('src', '/video.mp4');
  });

  it('exposes S/M/L static sources through native responsive media', () => {
    const { container } = render(<TramaMediaBackdrop {...responsiveProps} />);
    const sources = Array.from(container.querySelectorAll('picture source'));
    expect(sources).toHaveLength(2);
    expect(sources[0]).toHaveAttribute('media', '(min-width: 1024px)');
    expect(sources[0]).toHaveAttribute('srcset', '/media/trama-gateway-poster-l.webp');
    expect(sources[1]).toHaveAttribute('media', '(min-width: 600px)');
    expect(sources[1]).toHaveAttribute('srcset', '/media/trama-gateway-poster-m.webp');
    expect(screen.getByTestId('trama-media-poster')).toHaveAttribute(
      'src',
      '/media/trama-gateway-poster-s.webp',
    );
  });

  it('uses only the responsive local poster when reduced motion is requested', () => {
    setReducedMotion(true);
    render(<TramaMediaBackdrop {...responsiveProps} />);
    expect(screen.queryByTestId('trama-media-video')).not.toBeInTheDocument();
    expect(screen.getByTestId('trama-media-poster')).toHaveAttribute(
      'src',
      '/media/trama-gateway-poster-s.webp',
    );
  });

  it('keeps the responsive poster visible when the prototype video fails', () => {
    render(<TramaMediaBackdrop {...responsiveProps} />);
    const video = screen.getByTestId('trama-media-video');
    fireEvent.error(video);
    expect(screen.queryByTestId('trama-media-video')).not.toBeInTheDocument();
    expect(screen.getByTestId('trama-media-poster')).toBeVisible();
  });
});
