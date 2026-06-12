import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://devenney.io',
  integrations: [sitemap(), icon()],
  markdown: {
    shikiConfig: {
      theme: 'night-owl',
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
