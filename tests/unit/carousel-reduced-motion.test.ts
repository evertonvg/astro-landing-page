// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import carousel from '../../src/lib/carousel';

describe('carousel under reduced motion', () => {
  it('removes autoplay from a first-slide video synchronously, before Embla loads', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const root = document.createElement('section');
    const video = document.createElement('video');
    video.setAttribute('autoplay', '');
    video.pause = vi.fn();
    root.append(video);

    const data = carousel({ autoplay: true, intervalMs: 7000, transition: 'fade', count: 2 });
    void data.init.call({ $root: root, $refs: {}, selected: 0 }).catch(() => {});

    expect(video.hasAttribute('autoplay')).toBe(false);
    expect(video.pause).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
