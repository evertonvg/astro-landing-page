import { describe, it, expect } from 'vitest';
import { shouldAutoplay } from '../../src/lib/carousel';
import { youtubeEmbedUrl } from '../../src/lib/youtube-embed';

describe('shouldAutoplay', () => {
  it.each([
    [true, 3, false, true],
    [true, 1, false, false],
    [true, 3, true, false],
    [false, 3, false, false],
  ])('enabled=%s slides=%i reducedMotion=%s -> %s', (enabled, count, reduced, expected) => {
    expect(shouldAutoplay({ enabled }, count, reduced)).toBe(expected);
  });
});

describe('youtubeEmbedUrl', () => {
  it('uses the privacy-enhanced host and loops a muted video', () => {
    const url = new URL(youtubeEmbedUrl('dQw4w9WgXcQ'));
    expect(url.host).toBe('www.youtube-nocookie.com');
    expect(url.pathname).toBe('/embed/dQw4w9WgXcQ');
    expect(url.searchParams.get('playlist')).toBe('dQw4w9WgXcQ');
    expect(url.searchParams.get('mute')).toBe('1');
    expect(url.searchParams.get('loop')).toBe('1');
  });
});
