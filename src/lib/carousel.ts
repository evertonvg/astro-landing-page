import type { EmblaCarouselType, EmblaPluginType } from 'embla-carousel';
import type { AutoplayType } from 'embla-carousel-autoplay';

export interface CarouselConfig {
  autoplay: boolean;
  intervalMs: number;
  transition: 'fade' | 'slide';
  count: number;
}

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

export function shouldAutoplay(
  cfg: { enabled: boolean },
  slideCount: number,
  reducedMotion: boolean,
): boolean {
  return cfg.enabled && slideCount > 1 && !reducedMotion;
}

/** Plays only the active slide's background videos, and none under reduced motion. */
function syncVideos(embla: EmblaCarouselType, reducedMotion: boolean): void {
  const active = embla.selectedScrollSnap();
  embla.slideNodes().forEach((slide, index) => {
    slide.querySelectorAll('video').forEach((video) => {
      if (index === active && !reducedMotion) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  });
}

/** Hero carousel state; Embla is loaded on demand so it stays out of the initial bundle. */
export default (cfg: CarouselConfig) => {
  const reducedMotion = window.matchMedia(reducedMotionQuery).matches;
  const canAutoplay = shouldAutoplay({ enabled: cfg.autoplay }, cfg.count, reducedMotion);
  let embla: EmblaCarouselType | undefined;
  let autoplay: AutoplayType | undefined;
  let userPaused = false;
  let focusInside = false;
  let failed = false;
  /** Target requested before Embla finished loading; applied as the start index. */
  let pending: number | null = null;

  /** Autoplay is restarted by Embla on hover/focus-out; keep honouring pauses and focus. */
  const holdAutoplay = () => {
    if (userPaused || focusInside) queueMicrotask(() => autoplay?.stop());
  };

  return {
    selected: 0,
    playing: canAutoplay,
    count: cfg.count,
    canAutoplay,
    async init(this: { $root: HTMLElement; $refs: Record<string, HTMLElement>; selected: number }) {
      if (reducedMotion) {
        // Synchronous on purpose: stop the first slide's `autoplay` video before Embla loads.
        this.$root.querySelectorAll('video').forEach((video) => {
          video.removeAttribute('autoplay');
          video.pause();
        });
      }
      const root = this.$root;
      try {
        const [Autoplay, Fade, EmblaCarousel] = await Promise.all([
          canAutoplay ? import('embla-carousel-autoplay').then((m) => m.default) : null,
          cfg.transition === 'fade' ? import('embla-carousel-fade').then((m) => m.default) : null,
          import('embla-carousel').then((m) => m.default),
        ]);
        const plugins: EmblaPluginType[] = [];
        if (Autoplay) {
          autoplay = Autoplay({
            delay: cfg.intervalMs,
            rootNode: () => root,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
            stopOnFocusIn: true,
          });
          plugins.push(autoplay);
        }
        if (Fade) plugins.push(Fade());
        embla = EmblaCarousel(
          this.$refs.viewport,
          { loop: true, startIndex: pending ?? 0 },
          plugins,
        );
      } catch (error) {
        if (!failed) console.error('Hero carousel failed to load', error);
        failed = true;
        return;
      }
      const api = embla;
      pending = null;
      if (userPaused || focusInside) autoplay?.stop();
      const sync = () => {
        this.selected = api.selectedScrollSnap();
        syncVideos(api, reducedMotion);
      };
      api.on('select', sync);
      api.on('autoplay:timerset', holdAutoplay);
      sync();
    },
    focusChange(this: { $root: HTMLElement }, event: FocusEvent) {
      focusInside = event.type === 'focusin' || this.$root.contains(event.relatedTarget as Node);
      if (focusInside) autoplay?.stop();
      else if (!userPaused) autoplay?.play();
    },
    go(this: { selected: number }, target: number) {
      const index = ((target % cfg.count) + cfg.count) % cfg.count;
      if (embla) embla.scrollTo(index);
      else {
        pending = index;
        this.selected = index;
      }
    },
    next(this: { selected: number; go(i: number): void }) {
      this.go((pending ?? this.selected) + 1);
    },
    prev(this: { selected: number; go(i: number): void }) {
      this.go((pending ?? this.selected) - 1);
    },
    goTo(this: { go(i: number): void }, index: number) {
      this.go(index);
    },
    togglePlay() {
      if (!canAutoplay) return;
      userPaused = this.playing;
      this.playing = !this.playing;
      if (this.playing) {
        focusInside = false; // an explicit "play" overrides focus-based pausing
        autoplay?.play();
      } else autoplay?.stop();
    },
    destroy() {
      embla?.destroy();
      embla = undefined;
    },
  };
};

/** Single-slide hero: no carousel, but a background video must still respect reduced motion. */
export const heroVideo = () => ({
  init(this: { $el: HTMLElement }) {
    if (!window.matchMedia(reducedMotionQuery).matches) return;
    const video = this.$el as HTMLVideoElement;
    video.removeAttribute('autoplay');
    video.pause();
  },
});
