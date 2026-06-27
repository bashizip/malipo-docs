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

### Custom content loader — missing Starlight frontmatter defaults

**File:** `src/content.config.ts`

**Problem:** The custom `malipo-loader` stored only raw YAML fields.
Starlight expects defaulted fields (`head`, `template`, `pagefind`,
`sidebar.hidden`, `draft`). Missing `head` causes a `hasOneOf` crash.

**Fix:** Spread `frontmatter` over a defaults object inside the loader:

```ts
const defaultData = {
  title: id, description: '', head: [], template: 'doc',
  pagefind: true, draft: false, sidebar: { hidden: false },
};
store.set({ id, data: { ...defaultData, ...frontmatter }, ... });
```

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
