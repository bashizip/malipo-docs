## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Patches

### Starlight 0.41.1 — sidebar locale prefix for default locale

**File:** `node_modules/@astrojs/starlight/utils/navigation.ts`
**Line:** `linkFromInternalSidebarLinkItem` (~line 144)

**Problem:** `localizedSlug` unconditionally prepends the locale (e.g. `en/quickstart`), but
default-locale content has unprefixed slugs (`quickstart`). Route lookup fails.

**Fix** — replace the slug logic at the top of the function:

```ts
// Before (broken):
const localizedSlug = locale ? (slug ? locale + '/' + slug : locale) : slug;

// After (fixed):
const defaultLocale = config.defaultLocale?.locale;
const shouldPrefix = locale && locale !== defaultLocale;
const localizedSlug = shouldPrefix ? (slug ? locale + '/' + slug : locale) : slug;
```

## Locale Configuration

English uses `root` locale to keep URLs unprefixed (`/introduction/`). French uses `fr/` prefix (`/fr/introduction/`).

```js
defaultLocale: 'root',
locales: {
    root: { label: 'English', lang: 'en' },
    fr: { label: 'Français', lang: 'fr' },
},
```

This avoids Astro's i18n system from requiring `prefixDefaultLocale: true` (which would expect `/en/introduction/`), and avoids the need for patches to `filterByLocale` and `localizedSlug`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
