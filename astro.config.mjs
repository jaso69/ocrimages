// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server',

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ["crypto", "fs", "path", "stream", "http", "https", "querystring", "url"],
    },
  },

  adapter: cloudflare()
});