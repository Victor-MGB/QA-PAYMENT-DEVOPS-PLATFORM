const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'tests/ui/cypress/e2e/**/*.cy.js',
    supportFile: 'tests/ui/cypress/support/e2e.js',
    screenshotsFolder: 'reports/screenshots',
    videosFolder: 'reports/videos',
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 8000,
    env: {
      apiUrl: 'http://localhost:3000/api/v1',
      authToken: 'Bearer test-token-123'
    }
  }
});
