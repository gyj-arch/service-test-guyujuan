const { defineConfig } = require("cypress");

module.exports = defineConfig({
  //allowCypressEnv: false,

  e2e: {
    baseUrl: 'http://localhost:8002',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      require('cypress-mochawesome-reporter/plugin')(on);
      return config;
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'cypress/reports',
      reportPageTitle: 'Kong Gateway Test Report',
      reportFilename: 'kong-gateway-test-report',
      overwrite: false,
      json: true,
      html: true,
      inlineAssets: true,
      charts: true,
      timestamp: 'yyyy-mm-dd_HH-MM-ss',
      embeddedScreenshots: true,
      showHooks: 'always',
      saveJson: true  // Saves JSON data file for programmatic access
    },
    // video: true,
    // videoCompression: true,
    // videosFolder: 'cypress/videos',
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    chromeWebSecurity: false,
    allowCypressEnv: false
  },
})