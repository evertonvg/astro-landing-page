// The Alpine plugins below ship without type declarations.
declare module '@alpinejs/ui' {
  import type { PluginCallback } from 'alpinejs';
  const plugin: PluginCallback;
  export default plugin;
}

declare module '@alpinejs/focus' {
  import type { PluginCallback } from 'alpinejs';
  const plugin: PluginCallback;
  export default plugin;
}

declare module '@alpinejs/collapse' {
  import type { PluginCallback } from 'alpinejs';
  const plugin: PluginCallback;
  export default plugin;
}
