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
  background: {
    lim: '/media/trama-gateway-bg-lim.webp',
    s: '/media/trama-gateway-bg-s.webp',
    m: '/media/trama-gateway-bg-m.webp',
    l: '/media/trama-gateway-bg-l.webp',
  },
  // Transitional test input: keeps the current implementation renderable during RED.
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

  it('keeps the responsive background visible when the prototype video fails', () => {
    render(<TramaMediaBackdrop {...responsiveProps} />);
    const video = screen.getByTestId('trama-media-video');
    fireEvent.error(video);
    expect(screen.queryByTestId('trama-media-video')).not.toBeInTheDocument();
    expect(screen.getByTestId('trama-media-poster')).toBeVisible();
  });
});
