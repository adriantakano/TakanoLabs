// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.takanolabs.com',

  // SSG puro: el blog se compila a HTML estatico en dist/.
  // Cloudflare Pages sirve dist/ y ejecuta lo dinamico desde functions/ (Pages Functions).
  // No se usa adaptador SSR a proposito: cero JavaScript de framework por defecto.
  output: 'static',

  integrations: [
    sitemap(),
  ],

  build: {
    // Activos con hash en /assets para cacheo agresivo (immutable).
    assets: 'assets',
  },
});
