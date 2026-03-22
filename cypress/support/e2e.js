// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import 'cypress-recurse';
import 'cypress-mochawesome-reporter/register';

// Global handler to catch uncaught exceptions from the application
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore only the specific replaceChild null pointer error to avoid test failure
  if (err.message.includes('replaceChild') && err.message.includes('null')) {
    console.log('Ignoring replaceChild null error from application code:', err.message);
    // Return false to prevent Cypress from failing the test for this specific error
    return false;
  }
  // Let all other exceptions fail the test normally (to preserve test integrity)
  return true;
});

// Define and expose to global scope
globalThis.generateRandomId = () => `${Date.now()}-${Math.random().toString().slice(2, 6)}`;
globalThis.generateUUID = () => crypto.randomUUID().replace(/-/g, '').substring(0, 8);

after(() => {
  cy.fixture('basicFlow.json').then((basicConfig) => {
    const routePrefix = basicConfig.route.name;
    const servicePrefix = basicConfig.service.name;

    cy.fixture('kongManager.json').then((server) => {
      const adminURL = server.adminURL || `${server.protocol}://${server.host}:${server.adminPort}`;
      const workspace = server.workspace || 'default';
      const baseURL = `${adminURL}/${workspace}`;
      const fetchAll = (entityPath, collected = []) => {
        return cy.request({
          method: 'GET',
          url: `${baseURL}/${entityPath}`,
          failOnStatusCode: false,
        }).then((res) => {
          if (res.status !== 200 || !res.body.data) return cy.wrap(collected);
          collected.push(...res.body.data);
          if (res.body.next) {
            return fetchAll(res.body.next.replace(/^\//, ''), collected);
          }
          return cy.wrap(collected);
        });
      };

      fetchAll('routes').then((routes) => {
        const targets = routes.filter((r) => r.name?.startsWith(routePrefix));
        cy.log(`Cleanup: found ${targets.length} route(s) matching "${routePrefix}*"`);
        targets.forEach((route) => {
          cy.request({
            method: 'DELETE',
            url: `${baseURL}/routes/${route.id}`,
            failOnStatusCode: false,
          }).then((res) => {
            cy.log(`Deleted route "${route.name}": ${res.status}`);
          });
        });
      });

      fetchAll('services').then((services) => {
        const targets = services.filter((s) => s.name?.startsWith(servicePrefix));
        cy.log(`Cleanup: found ${targets.length} service(s) matching "${servicePrefix}*"`);
        targets.forEach((service) => {
          cy.request({
            method: 'DELETE',
            url: `${baseURL}/services/${service.id}`,
            failOnStatusCode: false,
          }).then((res) => {
            cy.log(`Deleted service "${service.name}": ${res.status}`);
          });
        });
      });
    });
  });
})