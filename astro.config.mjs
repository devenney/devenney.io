import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://devenney.io',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'night-owl',
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
