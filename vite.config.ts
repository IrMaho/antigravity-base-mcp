import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'node20',
    ssr: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: [
        'zod',
        'fs',
        'path',
        'http',
        'https',
        'readline',
        'events',
        'crypto',
        'stream',
        'url',
        'os',
        'child_process',
        'util',
      ],
      output: {
        format: 'esm',
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
    },
  },
});
