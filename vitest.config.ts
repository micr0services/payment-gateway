import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  resolve: {
    alias: [
      { find: /^hono$/, replacement: resolve(__dirname, 'node_modules/hono/dist/index.js') },
      { find: /^@scalar\/hono-api-reference$/, replacement: resolve(__dirname, 'node_modules/@scalar/hono-api-reference/dist/index.js') },
    ],
    conditions: ['node'],
    mainFields: ['module', 'main'],
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.spec.ts', 'test/**/*.test.ts'],
    server: {
      deps: {
        inline: [],
        external: ['hono', '@scalar/hono-api-reference'],
      },
    },
  },
});
