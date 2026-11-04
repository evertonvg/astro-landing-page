import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/rules/**/*.test.ts'],
    environment: 'node',
    // Rules tests share one emulator database.
    fileParallelism: false,
  },
});
