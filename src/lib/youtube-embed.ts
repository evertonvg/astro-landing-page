import { hasConsent, openPreferences } from './consent';

export function youtubeEmbedUrl(videoId: string): string {
  return (
    `https://www.youtube-nocookie.com/embed/${videoId}` +
    `?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}` +
    '&playsinline=1&rel=0&modestbranding=1&disablekb=1'
  );
}

/**
 * Loads the YouTube iframe only while "media" consent is granted, motion is allowed, the slide
 * is the active one and the hero is not paused; otherwise the poster shows.
 */
export default (videoId: string) => {
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let sync: (() => void) | undefined;

  return {
    allowed: false,
    /** True when the poster should offer a way to grant the missing consent. */
    needsConsent: false,
    src: null as string | null,
    /** Driven by `x-effect` from the enclosing carousel / hero scope. */
    slideActive: true,
    running: true,
    setState(slideActive: boolean, running: boolean) {
      this.slideActive = slideActive;
      this.running = running;
      sync?.();
    },
    init() {
      sync = () => {
        const reduced = reducedMotion();
        const consented = hasConsent('media');
        this.allowed = consented && !reduced;
        this.needsConsent = !consented && !reduced;
        this.src =
          this.allowed && this.slideActive && this.running ? youtubeEmbedUrl(videoId) : null;
      };
      sync();
      // `hasConsent` is false until the consent library has run, so react to its first event too.
      window.addEventListener('consent:change', sync);
    },
    openPreferences,
    destroy() {
      if (sync) window.removeEventListener('consent:change', sync);
    },
  };
};
