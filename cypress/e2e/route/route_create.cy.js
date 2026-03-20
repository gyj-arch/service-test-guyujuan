import { GatewayServiceBusiness } from "../../support/services/gateway_service_business"
import { RouteBusiness } from "../../support/services/route_business"
import { recurse } from 'cypress-recurse'

describe('Create Gateway Service', () => {
    const routeBusiness = new RouteBusiness();
    let adminURL;
    let serverURL;
    let basicConfig;
    let serverConfig;
    let serviceIds = [];
    let routeNames = [];
    let shouldRouteCreated;
    let createService;

    before(() => {
        cy.fixture('basicFlow.json').then((config) => {
            basicConfig = config;
        })

        cy.fixture('kongManager.json')
            .then((config) => {
                serverConfig = { ...config };
                adminURL = `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.adminPort}`;
                serverURL = `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.serverPort}`;
        })

        createService = function(config) {
            let serviceId;
                cy.request({
                    method: 'POST',
                    url: `${adminURL}/${serverConfig.workspace}/services`, 
                    body: config,
                    failOnStatusCode: false 
                }).then((response) => {
                    if (response.status !== 201) {
                        throw new Error(`Expected status is 201 but got ${response.status}`)
                    }
                    cy.log(`Successfully created service: ${config.name} with id: ${response.body.id}`)
                    serviceId = response.body.id;
                    serviceIds.push(serviceId);
                    return cy.wrap(response);
                })    
        };

        shouldRouteCreated = (config) => {
            cy.request({
                method: 'GET',
                url: `${adminURL}/${serverConfig.workspace}/routes/${config.name}`,
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.equal(200);
                expect(response.body).to.have.property('name', config.name);
            });
        }   
    })

    beforeEach(() => {
        routeBusiness.navigateToRouteMainPage();
    })

    after(() => {
        routeNames.forEach(routeName => {
            cy.deleteRouteViaAPI(routeName);
        });

        serviceIds.forEach(serviceId => {
            cy.deleteServiceViaAPI(serviceId);
        });
    })

    it('create basic route from routes page', () => {
        const unique = generateRandomId();
        const serviceConfig = {
            ...basicConfig.service,
            name: `${basicConfig.service.name}-${unique}`
        }

        const routeConfig = {
            ...basicConfig.route,
            name: `${basicConfig.route.name}-${unique}`,
            service: serviceConfig.name,
            path: `${basicConfig.route.path}${unique}`
        }
        routeNames.push(routeConfig.name);
        //create upstream gateway servcie
        createService(serviceConfig);

        routeBusiness
            .createBasicRouteFromRouteMainPage(routeConfig);
        shouldRouteCreated(routeConfig);
        
        //the route is displayed in the route main page
        routeBusiness.shouldRoutePageHaveRoute(routeConfig.name);    

        //the route should works correctly
        cy.shouldRouteWorksCorrectly(serverURL+routeConfig.path);
    })

    it('create advanced route from routes page', () => {
        const unique = generateRandomId();
        const serviceConfig = {
            ...basicConfig.service,
            name: `${basicConfig.service.name}-${unique}`
          }
        const routeConfig = {
            ...basicConfig.route,
            name: `${basicConfig.route.name}-${unique}`,
            service: serviceConfig.name,
            path1: basicConfig.route.path1+unique,
            path2: basicConfig.route.path2+unique
        }
 
        routeNames.push(routeConfig.name);
        createService(serviceConfig);

        routeBusiness
            .createAdvancedRouteFromRouteMainPage(routeConfig)
        
        //the route is displayed in the route main page
        routeBusiness.shouldRoutePageHaveRoute(routeConfig.name); 
        
        
        //the routes should works correctly
        cy.shouldRouteWorksCorrectly(serverURL+routeConfig.path1, { headers: { Host: routeConfig.host1 } });
        cy.shouldRouteWorksCorrectly(serverURL+routeConfig.path2, { headers: { Host: routeConfig.host2 } });
    })

    it('create two routes for a service from service detail page', () => {
        const unique = generateRandomId();
        let serviceId;
        const gatewayServiceBusiness = new GatewayServiceBusiness();
        const serviceConfig = {
            ...basicConfig.service,
            name: `${basicConfig.service.name}-${unique}`
        }

        const routeConfig = {
            ...basicConfig.route,
            name: `${basicConfig.route.name}-${unique}`,
            service: serviceConfig.name,
            path: `${basicConfig.route.path}${unique}`,
        }
        routeNames.push(routeConfig.name); 
        
        //create the upstream service
        let gatewayServiceDetailPage = gatewayServiceBusiness
            .createGatewayServiceWithFullURL(serviceConfig);
        gatewayServiceDetailPage.shouldAddARouteButtonExist();
        gatewayServiceDetailPage.getServiceId()
            .then((id) => {
                serviceId = id;
                serviceIds.push(serviceId);
            })
        gatewayServiceDetailPage.clickAddARouteButton();
            
        //create the route from the created service detail page
        routeBusiness.createBasicRouteFromServiceDetailPage(routeConfig);
        //verify route is created
        shouldRouteCreated(routeConfig);
        routeBusiness.shouldRoutePageHaveRoute(routeConfig.name); 
        
        
        //add another route to the service
        const anotherUnique = generateRandomId();
        const anotherRouteConfig = {
            ...basicConfig.route,
            name: `${basicConfig.route.name}-${anotherUnique}`,
            service: serviceConfig.name,
            path: `${basicConfig.route.path}${anotherUnique}`,
        }
        routeNames.push(anotherRouteConfig.name);

        routeBusiness.navigateToServiceMainPage()
            .openServiceDetailPage(serviceConfig.name)
            .shouldAddARouteButtonNotExist()
            .clickRoutesTab()
            .clickToobarNewRouteButton();
        routeBusiness.createBasicRouteFromServiceDetailPage(anotherRouteConfig)

        //the route is displayed in the route main page
        routeBusiness.shouldRoutePageHaveRoute(anotherRouteConfig.name);


        //the routes should works correctly
        cy.shouldRouteWorksCorrectly(serverURL+routeConfig.path);
        cy.shouldRouteWorksCorrectly(serverURL+anotherRouteConfig.path);
    })
})
