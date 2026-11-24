import { defineConfig } from 'vitest/config'

// Tests run in the app's real timezone: date bugs only show up when local
// midnight isn't UTC midnight.
process.env.TZ = 'Europe/Rome'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
