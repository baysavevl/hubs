// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

const isVercel = process.env.VERCEL === '1';

// https://astro.build/config
export default defineConfig({
  site: isVercel ? 'https://your-app.vercel.app' : 'https://baysavevl.github.io',
  base: isVercel ? '/' : '/google-mindful-solution-architect/',
  output: 'static',
  adapter: vercel(),
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()]
  }
});
