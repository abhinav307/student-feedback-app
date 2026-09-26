import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    hookTimeout: 120000,
    testTimeout: 60000,
    deps: {
      inline: [/^(?!.*vitest).*$/]
    }
  }
});
