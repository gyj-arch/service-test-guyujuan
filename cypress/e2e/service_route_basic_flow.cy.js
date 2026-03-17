import { GatewayServiceBusiness } from "../support/services/gateway_service_business"
import { RouteBusiness } from "../support/services/route_business"
import { recurse } from 'cypress-recurse'

describe('Add Service and Route and then delete them', () => {
  const gatewayServiceBusiness = new GatewayServiceBusiness()
  const routeBusiness = new RouteBusiness()
  const unique = `${Date.now()}`
  let serviceConfig;
  let routeConfig;
  let serverConfig;
  let serviceId;
  let routeId;
  let adminURL;
  let serverURL;

  before(() => {
    cy.fixture('basicFlow.json')
      .then((config) => {
      serviceConfig = {
        ...config.service,
        name: `${config.service.name}-${unique}`
      }
      routeConfig = {
        ...config.route,
        name: `${config.route.name}-${unique}`,
        service: serviceConfig.name,
        path: `${config.route.path}${unique}`
      };
    })

    cy.fixture('kongManager.json')
      .then((config) => {
      serverConfig = { ...config };
      adminURL = `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.adminPort}`;
      serverURL = `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.serverPort}`;
    })
  })

  after(() => {
    //clean service and route
    cy.request({
      method: 'GET',
      url: `${adminURL}/routes/${routeId}`,
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status === 200) {
        cy.log(`Route ${routeId} still exists, deleting it...`);
        cy.request({
          method: 'DELETE',
          url: `${adminURL}/routes/${routeId}`,   
          failOnStatusCode: false
        }).then((deleteResponse) => {
          expect(deleteResponse.status).to.eq(204);
          cy.log(`Route ${routeId} deleted successfully.`);
        });
      } 
    });

    cy.request({
      method: 'GET',
      url: `${adminURL}/services/${serviceId}`,
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status === 200) {
        cy.log(`Service ${serviceId} still exists, deleting it...`);
        cy.request({
          method: 'DELETE',
          url: `${adminURL}/services/${serviceId}`,
          failOnStatusCode: false
        }).then((deleteResponse) => {
          expect(deleteResponse.status).to.eq(204);
          cy.log(`Service ${serviceId} deleted successfully.`);
        });
      } 
    });
  })

  it('add a gateway service', () => {
    gatewayServiceBusiness.createGatewayService(serviceConfig).getServiceId().then((id) => {
      serviceId = id;
      cy.log(`Created gateway service with ID: ${serviceId}`);
    });
  })

  it('add a route', () => {
    routeId = routeBusiness.createRoute(routeConfig).getRouteId().then((id) => {
      routeId = id;
      cy.log(`Created route with ID: ${routeId}`);
    });
  })

  it('verify the service works correctly', () => {
    const routeURL = `${serverURL}${routeConfig.path}`;
    cy.log(`Making request to ${routeURL} to verify the route works correctly`);
    // Make a request to the route we just created
    const RETRY_TIMEOUT = 3 * 60 * 1000;
    const RETRY_INTERVAL = 5000;

    recurse(
      () => cy.request({
        method: 'GET',
        url: routeURL,
        failOnStatusCode: false
      }),
      (response) => response.status === 200,
      {
        timeout: RETRY_TIMEOUT,
        delay: RETRY_INTERVAL,
        log: true,
        limit: Infinity,
        errorMsg: `request ${routeURL} timeout！Response status is not 200 with 3 minutes retrying...`
      }
    ).then((response) => {
      expect(response.status).to.eq(200);
    });
  })

  it('delete the route', () => {
    routeBusiness.deleteRoute(routeConfig.name);
  })

  it('delete the service', () => {
    gatewayServiceBusiness.deleteGatewayService(serviceConfig.name);
  })

  it('verify the service cannot be accessed', () => {
    const routeURL = `${serverURL}${routeConfig.path}`;
    cy.log(`Making request to ${routeURL} to verify the route has been deleted`);
    // Make a request to the route we just created

    const RETRY_TIMEOUT = 3 * 60 * 1000;
    const RETRY_INTERVAL = 5000;

    recurse(
      () => cy.request({
        method: 'GET',
        url: routeURL,
        failOnStatusCode: false
      }),
      (response) => response.status === 404,
      {
        timeout: RETRY_TIMEOUT,
        delay: RETRY_INTERVAL,
        log: true,
        limit: Infinity,
        errorMsg: `request ${routeURL} timeout！Response status is not 404 with 3 minutes retrying...`
      }
    ).then((response) => {
      expect(response.status).to.eq(404);
    });
  })
})
