// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://baysavevl.github.io',
  base: '/google-mindful-solution-architect/',
  output: 'static',
  integrations: [mdx()],

  vite: {
    plugins: [tailwindcss()]
  }
});