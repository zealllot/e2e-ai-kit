import { defineConfig } from '@playwright/test';

/**
 * Kit's own test config. All tests here are pure-TS unit / integration
 * tests — no browser, no servers. The kit ships lints that substrates
 * later run via their own Playwright `node-checks` project; this config
 * is for testing the kit itself.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  use: {
    actionTimeout: 5_000,
  },
  projects: [
    {
      name: 'unit',
      testMatch: /tests\/unit\/.*\.spec\.ts/,
    },
    {
      name: 'integration',
      testMatch: /tests\/integration\/.*\.spec\.ts/,
    },
  ],
});
