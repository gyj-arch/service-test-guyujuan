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