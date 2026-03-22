describe('Multiple Services and Routes', () => {
    let serverConfig;
    let serverURL;
    let serviceIds = [];
    let routes = [];
    let serviceConfig;
    let routeConfig;

    before(() => {
        cy.fixture('kongManager.json').then((config) => {
            serverConfig = { ...config };
            serverURL = `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.serverPort}`;
        });

        cy.fixture('basicFlow.json').then((config) => {
            serviceConfig = {
                ...config.service,
            };
            routeConfig = {
                ...config.route,
            };
        });
    })

    after(() => {
        routes.forEach(route => {
            cy.deleteRouteViaAPI(route.id).then((res) => {
                expect(res.status).to.eq(204);
            });
        });

        serviceIds.forEach(serviceId => {
            cy.deleteServiceViaAPI(serviceId).then((res) => {
                expect(res.status).to.eq(204);
            });
        });
    })

    it('create 20 services, each service has a route', () => {
        for (let i = 0; i < 20; i++) {
            const unique = generateRandomId();
            const service_config = {
                ...serviceConfig,
                name: `${serviceConfig.name}-${i}-${unique}`
            };
            cy.createServiceViaAPI(service_config).then((res) => {
                expect(res.status).to.eq(201);
                serviceIds.push(res.body.id);
            });
            const path = `${routeConfig.path}-${i}-${unique}`;
            const route_config = {
                ...routeConfig,
                name: `${routeConfig.name}-${i}-${unique}`,
                service: service_config.name,
                path: path
            };
            cy.createRouteViaAPI(route_config).then((res) => {
                expect(res.status).to.eq(201);
                routes.push({ id: res.body.id, path: path });
            });
            cy.shouldRouteWorksCorrectly(serverURL + path);
        }
    })

    it('should all routes work correctly', () => {
        routes.forEach(route => {
            cy.shouldRouteWorksCorrectly(serverURL + route.path);
        });
    })

    it('delete 5 routes, verify deleted routes stop working and remaining routes still work', () => {
        const deleteCount = 5;
        const deletedRoutes = routes.splice(0, deleteCount);

        deletedRoutes.forEach(route => {
            cy.deleteRouteViaAPI(route.id).then((res) => {
                expect(res.status).to.eq(204);
            });
        });

        deletedRoutes.forEach(route => {
            cy.shouldRouteNotWorks(serverURL + route.path);
        });

        routes.forEach(route => {
            cy.shouldRouteWorksCorrectly(serverURL + route.path);
        });
    })
})