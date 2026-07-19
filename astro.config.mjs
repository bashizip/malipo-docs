// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://docs.malipo.dev',
  legacy: {
    collectionsBackwardsCompat: true,
  },
  integrations: [
    starlight({
      title: 'Malipo Docs',
      description: 'Guides d’intégration et d’exploitation pour les marchands Malipo.',
      logo: {
        src: './src/assets/logo.png',
        alt: 'Malipo',
        replacesTitle: true,
      },
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        fr: { label: 'Français', lang: 'fr' },
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/malipo-docs' },
      ],
      favicon: '/favicon.svg',
      customCss: ['./src/styles/custom.css'],
      lastUpdated: true,
      sidebar: [
        {
          label: 'Getting started',
          items: [
            { label: 'Introduction', slug: 'introduction' },
            { label: 'Quickstart', slug: 'quickstart' },
          ],
        },
        {
          label: 'Core concepts',
          items: [
            { label: 'Authentication', slug: 'authentication' },
            { label: 'Environments', slug: 'environments' },
            { label: 'Charges', slug: 'charges' },
            { label: 'Transaction status', slug: 'transaction-status' },
            { label: 'Refunds', slug: 'refunds' },
            { label: 'Balance', slug: 'balance' },
            { label: 'Pricing', slug: 'pricing' },
            { label: 'Settlements', slug: 'settlements' },
            { label: 'Payouts', slug: 'payouts' },
            { label: 'Monthly statements', slug: 'statements' },
            { label: 'Reporting', slug: 'reporting' },
            { label: 'Hosted checkout', slug: 'hosted-checkout' },
            { label: 'Idempotency', slug: 'idempotency' },
          ],
        },
        {
          label: 'Advanced',
          items: [
            { label: 'Webhooks', slug: 'webhooks' },
            { label: 'Errors', slug: 'errors' },
            { label: 'Test scenarios', slug: 'test-scenarios' },
            { label: 'Glossary', slug: 'glossary' },
          ],
        },
        {
          label: 'SDKs & Libraries',
          items: [
            { label: 'Overview', slug: 'sdks' },
            { label: 'Node.js', slug: 'sdk/node' },
            { label: 'Python', slug: 'sdk/python' },
            { label: 'PHP', slug: 'sdk/php' },
            { label: 'Java', slug: 'sdk/java' },
            { label: 'Flutter', slug: 'sdk/flutter' },
          ],
        },
        {
          label: 'Deployment',
          items: [
            { label: 'Going live', slug: 'going-live' },
          ],
        },
      ],
    }),
  ],
});
