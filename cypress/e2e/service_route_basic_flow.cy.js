import { GatewayServiceBusiness } from "../support/services/gateway_service_business"
import { RouteBusiness } from "../support/services/route_business"

describe('Add Service and Route and then delete them', () => {
  const gatewayServiceBusiness = new GatewayServiceBusiness()
  const routeBusiness = new RouteBusiness()
  const unique = `${Date.now()}-${Math.random().toString().slice(2, 6)}`;
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
    cy.deleteRouteViaAPI(routeConfig.name);
    cy.deleteServiceViaAPI(serviceConfig.name);
  })

  it('add a gateway service', () => {
    gatewayServiceBusiness.createGatewayServiceWithFullURL(serviceConfig).getServiceId().then((id) => {
      serviceId = id;
      cy.log(`Created gateway service with ID: ${serviceId}`);
    });
  })

  it('add a route', () => {
    routeId = routeBusiness.createBasicRouteFromRouteMainPage(routeConfig).getRouteId().then((id) => {
      routeId = id;
      cy.log(`Created route with ID: ${routeId}`);
    });
  })

  it('should route works correctly', () => {
    const routeURL = `${serverURL}${routeConfig.path}`;
    cy.log(`Making request to ${routeURL} to verify the route works correctly`);
    cy.shouldRouteWorksCorrectly(routeURL);
  })

  it('delete the route', () => {
    routeBusiness.deleteRoute(routeConfig.name);
  })

  it('delete the service', () => {
    gatewayServiceBusiness.deleteGatewayService(serviceConfig.name);
  })

  it('should route not works when the route has been deleted', () => {
    const routeURL = `${serverURL}${routeConfig.path}`;
    cy.log(`Making request to ${routeURL} to verify the route has been deleted`);
    
    // Make a request to the route we just created
    cy.shouldRouteNotWorks(routeURL);
  })
})
