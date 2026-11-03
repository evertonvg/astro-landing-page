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

  return {
    selected: 0,
    playing: canAutoplay,
    count: cfg.count,
    canAutoplay,
    async init(this: { $refs: Record<string, HTMLElement>; selected: number }) {
      const plugins: EmblaPluginType[] = [];
      if (canAutoplay) {
        const { default: Autoplay } = await import('embla-carousel-autoplay');
        autoplay = Autoplay({
          delay: cfg.intervalMs,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
          stopOnFocusIn: true,
        });
        plugins.push(autoplay);
      }
      if (cfg.transition === 'fade') {
        const { default: Fade } = await import('embla-carousel-fade');
        plugins.push(Fade());
      }
      const { default: EmblaCarousel } = await import('embla-carousel');
      embla = EmblaCarousel(this.$refs.viewport, { loop: true }, plugins);
      // The user may have paused while Embla was still loading.
      if (userPaused) autoplay?.stop();
      const sync = () => {
        if (!embla) return;
        this.selected = embla.selectedScrollSnap();
        syncVideos(embla, reducedMotion);
      };
      embla.on('select', sync);
      // Hover/focus-out make Embla restart autoplay; keep honouring an explicit pause.
      embla.on('autoplay:timerset', () => {
        if (userPaused) queueMicrotask(() => autoplay?.stop());
      });
      sync();
    },
    next() {
      embla?.scrollNext();
    },
    prev() {
      embla?.scrollPrev();
    },
    goTo(index: number) {
      embla?.scrollTo(index);
    },
    togglePlay() {
      if (!canAutoplay) return;
      userPaused = this.playing;
      this.playing = !this.playing;
      if (this.playing) autoplay?.play();
      else autoplay?.stop();
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
