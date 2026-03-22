import { recurse } from 'cypress-recurse';

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
 * Verify route created success notification is visible
 * Finds the toaster that contains the specific route name message among multiple toasters
 * @param {string} routeName - Route name to match in the success message
 * @example
 * cy.shouldRouteCreatedSuccessNotification('my-route')
 */
Cypress.Commands.add('shouldRouteCreatedSuccessNotification', (routeName) => {
  const selector = 'div[class*="toaster"][class*="success"][role="alert"]';
  cy.contains(selector, `Route "${routeName}" successfully created!`, { timeout: 20000 })
    .scrollIntoView()
    .should('be.visible');
});

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

/**
 * Create a Gateway Service via Kong Admin API
 * @param {Object} serviceConfig - Service config: name, and url or (protocol + host + path + port)
 * @returns {Cypress.Chainable} Returns the response; use .then((res) => res.body.id) to get serviceId
 * @example
 * cy.createServiceViaAPI({ name: 'my-service', url: 'http://httpbin.org' })
 */
Cypress.Commands.add('createServiceViaAPI', (serviceConfig) => {
  const body = { ...serviceConfig };
  return cy.fixture('kongManager.json').then((server) => {
    const base = server.adminURL || `${server.protocol}://${server.host}:${server.adminPort}`;
    const url = `${base.replace(/\/$/, '')}/${server.workspace || 'default'}/services`;
    return cy.request({
      method: 'POST',
      url: url,
      body: body,
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status !== 201) {
        throw new Error(`Create service failed: expected 201, got ${response.status}. Body: ${JSON.stringify(response.body)}`);
      }
      cy.log(`Created service: ${serviceConfig.name} (id: ${response.body.id})`);
      return cy.wrap(response);
    });
  });
});


/**
 * Delete a Gateway Service via Kong Admin API
 * @param {string} serviceName - Service Name or ID to delete
 * @returns {Cypress.Chainable} Returns the response (204 on success)
 * @example
 * cy.deleteServiceViaAPI(serviceId)
 */
Cypress.Commands.add('deleteServiceViaAPI', (serviceName) => {
  return cy.fixture('kongManager.json').then((server) => {
    const base = `${server.protocol}://${server.host}:${server.adminPort}`;
    const url = `${base.replace(/\/$/, '')}/${server.workspace || 'default'}/services/${serviceName}`;
    return cy.request({
      method: 'DELETE',
      url: url,
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status !== 204) {
        cy.log(`Delete service: expected 204, got ${response.status}`);
      } else {
        cy.log(`Deleted service successfully`);
      }
      return cy.wrap(response);
    });
  });
});

/**
 * Delete a Route via Kong Admin API
 * @param {string} routeName - Route name or ID to delete
 * @returns {Cypress.Chainable} Returns the response (204 on success)
 * @example
 * cy.deleteRouteViaAPI(routeName)
 */
Cypress.Commands.add('deleteRouteViaAPI', (routeName) => {
  return cy.fixture('kongManager.json').then((server) => {
    const base = `${server.protocol}://${server.host}:${server.adminPort}`;
    const url = `${base.replace(/\/$/, '')}/${server.workspace || 'default'}/routes/${routeName}`;
    return cy.request({
      method: 'DELETE',
      url: url,
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status !== 204) {
        cy.log(`Delete route: expected 204, got ${response.status}`);
      } else {
        cy.log(`Deleted route successfully`);
      }
      return cy.wrap(response);
    });
  });
});

/**
 * Create a Route via Kong Admin API
 * @param {Object} routeConfig - Route config: name, service (service UUID), paths (or path), hosts (or host), methods (or method), strip_path
 * @returns {Cypress.Chainable} Returns the response; use .then((res) => res.body.id) to get routeId
 * @example
 * cy.createServiceViaAPI(serviceConfig).then((res) => {
 *   cy.createRouteViaAPI({ name: 'my-route', service: res.body.id, paths: ['/httpbin'] });
 * })
 */
Cypress.Commands.add('createRouteViaAPI', (routeConfig) => {
  if (!routeConfig?.name || !routeConfig?.service) {
    throw new Error('createRouteViaAPI requires routeConfig with name and service (service UUID).');
  }
  const body = {
    name: routeConfig.name,
    service: { name: routeConfig.service },
    paths: routeConfig.paths || (routeConfig.path ? [routeConfig.path] : []),
    strip_path: routeConfig.strip_path === true || routeConfig.strip_path === 'true' ? true : false,
    protocols: routeConfig.protocols || (routeConfig.protocol ? routeConfig.protocol.split(',').map(p => p.trim()) : []),
  };
  if (routeConfig.hosts?.length || routeConfig.host) {
    body.hosts = routeConfig.hosts || [routeConfig.host];
  }
  if (routeConfig.methods?.length || routeConfig.method) {
    body.methods = Array.isArray(routeConfig.methods)
      ? routeConfig.methods
      : (routeConfig.method ? routeConfig.method.split(',').map(m => m.trim()) : []);
  }
  if (routeConfig.preserve_host !== undefined) {
    body.preserve_host = routeConfig.preserve_host === true || routeConfig.preserve_host === 'true';
  }
  if (routeConfig.path_handling) {
    body.path_handling = routeConfig.path_handling;
  }
  if (routeConfig.headers && typeof routeConfig.headers === 'object') {
    body.headers = routeConfig.headers;
  }
  return cy.fixture('kongManager.json').then((server) => {
    const base = `${server.protocol}://${server.host}:${server.adminPort}`;
    const url = `${base.replace(/\/$/, '')}/${server.workspace || 'default'}/routes`;
    return cy.request({
      method: 'POST',
      url: url,
      body: body,
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status !== 201) {
        throw new Error(`Create route failed: expected 201, got ${response.status}. Body: ${JSON.stringify(response.body)}`);
      }
      cy.log(`Created route: ${routeConfig.name} (id: ${response.body.id})`);
      return cy.wrap(response);
    });
  });
});

/**
 * Update a Route via Kong Admin API (PATCH)
 * @param {string} routeId - Route UUID to update
 * @param {Object} routeUpdates - Fields to update: paths, hosts, methods, strip_path, name, etc.
 * @returns {Cypress.Chainable} Returns the response; use .then((res) => res.body) to get updated route
 * @example
 * cy.updateRouteViaAPI(routeId, { paths: ['/new-path'], strip_path: true })
 * cy.updateRouteViaAPI(routeId, { hosts: ['api.example.org'], methods: ['GET', 'POST'] })
 */
Cypress.Commands.add('updateRouteViaAPI', (routeId, routeUpdates) => {
  if (!routeId || !routeUpdates || Object.keys(routeUpdates).length === 0) {
    throw new Error('updateRouteViaAPI requires routeId and routeUpdates object with at least one field.');
  }
  return cy.fixture('kongManager.json').then((server) => {
    const base = `${server.protocol}://${server.host}:${server.adminPort}`;
    const url = `${base}/${server.workspace || 'default'}/routes/${routeId}`;
    return cy.request({
      method: 'PATCH',
      url: url,
      body: routeUpdates,
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status !== 200) {
        throw new Error(`Update route failed: expected 200, got ${response.status}. Body: ${JSON.stringify(response.body)}`);
      }
      cy.log(`Updated route ${routeId}: ${JSON.stringify(routeUpdates)}`);
      return cy.wrap(response);
    });
  });
});

/**
 * Delete a Route via Kong Admin API
 * @param {string} routeURL - visit url to mathch the route
 * @param {Object} headers - headers to send with the request
 * @returns {Cypress.Chainable} Returns the response (200 on success)
 * @example
 * cy.shouldRouteWorksCorrectly('http://httpbin.org/get',{Host: 'httpbin.org'})
 */
Cypress.Commands.add('shouldRouteWorksCorrectly', (routeURL, options = {}) => {
  cy.log(`Making request to ${routeURL} to verify the route works correctly`);
  // Make a request to the route we just created
  const RETRY_TIMEOUT = 3 * 60 * 1000;
  const RETRY_INTERVAL = 5000;
  const method = options.method?.toUpperCase() || 'GET';
  const headers = options.headers || {};
  recurse(
    () => cy.request({
      method: method.toUpperCase(),
      url: routeURL,
      failOnStatusCode: false,
      headers: { ...headers }
    }),
    (response) => response.status === 200,
    {
      timeout: RETRY_TIMEOUT,
      delay: RETRY_INTERVAL,
      log: true,
      limit: Infinity,
      errorMsg: `request ${routeURL} timeout! Response status is not 200 with 3 minutes retrying...`
    }
  ).then((response) => {
    expect(response.status).to.eq(200);
    return cy.wrap(response);
  });
});

/**
 * Verify that a route does NOT work (request returns non-200, e.g. 404 when route is deleted)
 * @param {string} routeURL - URL to request (e.g. http://localhost:8000/path)
 * @param {Object} headers - Headers to send with the request (e.g. { Host: 'api.example.com' })
 * @returns {Cypress.Chainable} Asserts and returns the response; use .then((res) => res.body) to get body
 * @example
 * cy.shouldRouteNotWorks('http://localhost:8000/httpbin').then((res) => { ... })
 * cy.shouldRouteNotWorks('http://localhost:8000/api', { Host: 'api.example.com' })
 */
Cypress.Commands.add('shouldRouteNotWorks', (routeURL, options = {}) => {
  cy.log(`Making request to ${routeURL} to verify the route does NOT work`);
  const RETRY_TIMEOUT = 3 * 60 * 1000;
  const RETRY_INTERVAL = 5000;
  const method = options.method?.toUpperCase() || 'GET';
  const headers = options.headers || {};
  recurse(
    () => cy.request({
      method: method,
      url: routeURL,
      failOnStatusCode: false,
      https_redirect_status_code: options.https_redirect_status_code || 426,
      headers: { ...headers }
    }),
    (response) => [404, 426].includes(response.status) || (response.status >= 500 && response.status < 600),
    {
      timeout: RETRY_TIMEOUT,
      delay: RETRY_INTERVAL,
      log: true,
      limit: Infinity,
      errorMsg: `request ${routeURL} timeout! Response status is still 200 after 3 minutes retrying...`
    }
  ).then((response) => {
    const ok = [404, 426].includes(response.status) || (response.status >= 500 && response.status < 600);
    expect(ok, `expected status 404, 426 or 5xx, got ${response.status}`).to.be.true;
    return cy.wrap(response);
  });
});
