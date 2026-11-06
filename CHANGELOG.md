# Changelog

## [0.2.0](https://github.com/evertonvg/astro-landing-page/compare/astro-landing-page-v0.1.0...astro-landing-page-v0.2.0) (2026-11-06)


### Features

* add contact form with zod validation and lazy firebase ([dd0c0b0](https://github.com/evertonvg/astro-landing-page/commit/dd0c0b05b9946a53113724a1ca8b6c513b6f1faa))
* add content collections with zod schemas and sample content ([6fa8f63](https://github.com/evertonvg/astro-landing-page/commit/6fa8f634d4eeeffd05188cab59b4d60f36f8eb3b))
* add cookie consent with gtm consent mode v2 ([59af302](https://github.com/evertonvg/astro-landing-page/commit/59af302af92cda45d471f2a78ee1aff0fdb4d295))
* add env schema, site config, base layout and seo metadata ([fd5680e](https://github.com/evertonvg/astro-landing-page/commit/fd5680eeb285feb97b116c40ae418ad6b035d20d))
* add firestore rules, emulator setup and contact e2e tests ([436b90a](https://github.com/evertonvg/astro-landing-page/commit/436b90a700755750ce4e583bedfd9fb364e1fc8d))
* add hero with carousel and image, video and youtube backgrounds ([b51b944](https://github.com/evertonvg/astro-landing-page/commit/b51b9441828107d4b3ca268313c250ccb68abc8a))
* add landing sections with pricing toggle and faq ([b347da0](https://github.com/evertonvg/astro-landing-page/commit/b347da02eb6c1118db56af9b6f435b3c1c7f9828))
* add legal pages, 404, cookie table and og images ([efd0323](https://github.com/evertonvg/astro-landing-page/commit/efd0323d778544be2103abb6ab573f1bf27b4a0d))
* add theme tokens, alpine entrypoint, header, mobile menu and footer ([4a60f6b](https://github.com/evertonvg/astro-landing-page/commit/4a60f6b6a81111c1329e2ee50b2ffce8d88006ea))


### Bug Fixes

* **a11y:** keep carousel live region polite when only a video is playing ([3e32be1](https://github.com/evertonvg/astro-landing-page/commit/3e32be1b1d1edfd75a5167b63d6fdcf890098b02))
* **ci:** restrict deploy to same-repo push runs and main branch ([a238264](https://github.com/evertonvg/astro-landing-page/commit/a2382643d10f508a1ade1cc18baa91ec4e59db46))
* final review wave (CSP, video pause, config source, lazy zod) ([1b4494a](https://github.com/evertonvg/astro-landing-page/commit/1b4494a2c1ce512e4fa5e42ce831be2a3f441673))
* harden hero carousel loading, focus pause and keyboard navigation ([987a3a1](https://github.com/evertonvg/astro-landing-page/commit/987a3a164f7aa8e403e83e5313c57aeeb5fd13f3))
* move 404 and cookie table strings to i18n and derive category order ([1fdb938](https://github.com/evertonvg/astro-landing-page/commit/1fdb9384eaa96d6ad66e98d8a3ea720c10504b11))
* **perf:** self-host Inter via Astro Fonts API with metric-matched fallback ([3dee82e](https://github.com/evertonvg/astro-landing-page/commit/3dee82e809e28d78b573b47ea189fc6c9008fe39))
* time out hung contact submits and keep focus on retry ([4d783d0](https://github.com/evertonvg/astro-landing-page/commit/4d783d038960efbccb93f75dbf6322ad9a271d37))
