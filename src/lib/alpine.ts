import type { Alpine } from 'alpinejs';
import collapse from '@alpinejs/collapse';
import focus from '@alpinejs/focus';
import ui from '@alpinejs/ui';
import carousel, { heroVideo } from './carousel';
import youtubeEmbed from './youtube-embed';
import mobileMenu from './mobile-menu';
import pricing from './pricing';

// Alpine entrypoint: register plugins, then `Alpine.data()` components.
export default (Alpine: Alpine) => {
  // `focus` must be registered before `ui`: x-dialog relies on x-trap.
  Alpine.plugin(focus);
  Alpine.plugin(ui);
  Alpine.plugin(collapse);

  Alpine.data('mobileMenu', mobileMenu);
  Alpine.data('pricing', pricing);
  Alpine.data('carousel', carousel);
  Alpine.data('heroVideo', heroVideo);
  Alpine.data('youtubeEmbed', youtubeEmbed);
};
