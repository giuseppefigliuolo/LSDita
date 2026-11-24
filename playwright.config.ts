import { defineConfig } from '@playwright/test'

const PORT = 4173

/** Browser tests against the production build (`npm run test:e2e` builds first) */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}/LSDita/`,
    // System Chrome: nothing to download locally, preinstalled on GitHub runners
    browserName: 'chromium',
    channel: 'chrome',
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    timezoneId: 'Europe/Rome',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/LSDita/`,
    reuseExistingServer: !process.env.CI,
  },
})
