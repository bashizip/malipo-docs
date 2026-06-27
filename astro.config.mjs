// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://docs.malipo.dev',
  legacy: {
    collectionsBackwardsCompat: true,
  },
  integrations: [
    starlight({
      title: 'Malipo Docs',
      defaultLocale: 'en',
      locales: {
        en: { label: 'English', lang: 'en' },
        fr: { label: 'Français', lang: 'fr' },
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/malipo' },
      ],
      sidebar: [
        {
          label: 'Getting started',
          items: [
            { label: 'Quickstart', slug: 'quickstart' },
          ],
        },
      ],
    }),
  ],
});
