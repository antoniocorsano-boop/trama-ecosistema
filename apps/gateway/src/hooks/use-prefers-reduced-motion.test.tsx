import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePrefersReducedMotion } from './use-prefers-reduced-motion';

type Listener = (event: MediaQueryListEvent) => void;
let listeners: Listener[] = [];
let matches = false;

function installMatchMedia() {
  listeners = [];
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: Listener) => listeners.push(listener),
    removeEventListener: (_type: string, listener: Listener) => {
      listeners = listeners.filter((item) => item !== listener);
    },
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
}

describe('usePrefersReducedMotion', () => {
  beforeEach(() => {
    matches = false;
    installMatchMedia();
  });

  it('reflects the initial reduced-motion preference', () => {
    matches = true;
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it('reacts to preference changes and cleans up through the media-query listener contract', () => {
    const { result, unmount } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
    act(() => {
      matches = true;
      listeners.forEach((listener) => listener({ matches: true } as MediaQueryListEvent));
    });
    expect(result.current).toBe(true);
    unmount();
    expect(listeners).toHaveLength(0);
  });
});
