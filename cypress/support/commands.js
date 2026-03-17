// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })


/**
 * GET TEXT COMMAND
 * @example
 * cy.get('.selector').getText().then(text => { ... })
 * cy.get('.multiple').getText().then(texts => { ... })
 */
Cypress.Commands.add('getText', { prevSubject: 'element' }, ($elements) => {
  cy.wrap($elements).scrollIntoView();
  if ($elements.length === 1) {
    //return text of single elemment
    return cy.wrap($elements).scrollIntoView().invoke('text')
            .then(text => text.trim());
  } else {
    // return array of text of multiple elements
    const textArray = Cypress._.map($elements, (el) => {
      return Cypress.$(el).text().trim(); 
    });
    return cy.wrap(textArray);
  }
})