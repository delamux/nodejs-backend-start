import base from './vitest.config.base';
import { defineConfig, mergeConfig } from 'vitest/config';

export default mergeConfig(
  base,
  defineConfig({
    test: {
      include: ['src/tests/integration/**/*.test.ts'],
    },
  })
);
