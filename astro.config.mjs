import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://sportseospecialist.nl',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !page.includes('/bedankt/') })],
});
