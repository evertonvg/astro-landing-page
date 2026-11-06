// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import carousel from '../../src/lib/carousel';

const base = { intervalMs: 7000, transition: 'fade' as const, count: 3 };

describe('carousel live region', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('silences announcements only while slides auto-advance', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    const data = carousel({ ...base, autoplay: true, hasVideo: false });
    expect(data.autoAdvancing).toBe(true);
    data.togglePlay();
    expect(data.autoAdvancing).toBe(false);
  });

  it('keeps announcements on when autoplay is off but a video slide is playing', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    const data = carousel({ ...base, autoplay: false, hasVideo: true });
    expect(data.playing).toBe(true); // video plays, pause control shown
    expect(data.autoAdvancing).toBe(false);
  });
});
