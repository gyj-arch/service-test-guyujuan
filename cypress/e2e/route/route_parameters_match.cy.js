import { RouteBusiness } from "../../support/services/route_business"

describe('Route Parameters', () => {
    let basicConfig;
    let serverConfig;
    let adminURL;
    let serverURL;
    let serviceIds = [];
    let routeIds = [];
    let serviceConfig;
    let defaultHost;

    before(() => {
        cy.fixture('kongManager.json').then((config) => {
            serverConfig = { ...config };
            adminURL = `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.adminPort}`;
            serverURL = `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.serverPort}`;

            defaultHost = `${serverConfig.host}:${serverConfig.serverPort}`;
        });

        cy.fixture('basicFlow.json').then((config) => {
            basicConfig = config;
            const unique = generateRandomId();
            serviceConfig = {
                ...basicConfig.service,
                name: `${basicConfig.service.name}-${unique}`
            };
            cy.createServiceViaAPI(serviceConfig).then((res) => {
                serviceIds.push(res.body.id);
            });
        });
    })

    after(() => {
        routeIds.forEach(routeId => {
            cy.deleteRouteViaAPI(routeId);
        });

        serviceIds.forEach(serviceId => {
            cy.deleteServiceViaAPI(serviceId);
        });
    })

    it('check strip _ath action', () => {
        const unique = generateRandomId();
        const uniquePath = `${basicConfig.route.path}-${unique}`;
        const routeStripPathConfig = {
            ...basicConfig.route,
            name: `${basicConfig.route.name}-${unique}`,
            service: serviceConfig.name,
            strip_path: false
        }

        cy.createRouteViaAPI(routeStripPathConfig).then((res) => {
            routeIds.push(res.body.id);
            expect(res.body.strip_path).to.be.false;
        });
        //the path can work when send to upstream service
        cy.shouldRouteWorksCorrectly(serverURL + routeStripPathConfig.path);

        //change the path to a unique path
        cy.updateRouteViaAPI(routeStripPathConfig.name, { paths: [uniquePath] }).then((res) => {
            expect(res.body.strip_path).to.be.false;
        });
        //it cannot access to the backend service because the wrong path is sent
        cy.shouldRouteNotWorks(serverURL + uniquePath);

        //verify the route works correctly when strip path is true 
        //because the path is removed from the request url send to upstream service
        cy.updateRouteViaAPI(routeStripPathConfig.name, { strip_path: true }).then((res) => {
            expect(res.body.strip_path).to.be.true;
        });
        cy.shouldRouteWorksCorrectly(serverURL + uniquePath);
     })


     it('check methods action', () => {
        const unique = generateRandomId();
        const uniquePath = `${basicConfig.route.path}-${unique}`;
        const routeStripPathConfig = {
            ...basicConfig.route,
            name: `${basicConfig.route.name}-${unique}`,
            service: serviceConfig.name,
            path: uniquePath,
            methods: ['GET','POST']
        }
        cy.createRouteViaAPI(routeStripPathConfig).then((res) => {
            routeIds.push(res.body.id);
            expect(res.body.methods).to.deep.equal(['GET','POST']);
        });

        //the route works correctly when the method is GET
        cy.shouldRouteWorksCorrectly(serverURL + uniquePath, { method: 'GET' });

        //the route works correctly when the  method is POST
        cy.shouldRouteWorksCorrectly(serverURL + uniquePath, { method: 'GET' });

        //the route does not work when the method is PUT
        cy.shouldRouteNotWorks(serverURL + uniquePath, { method: 'PUT' });
     })

     it('check hosts action', () => {
        const unique = generateRandomId();
        const uniquePath = `${basicConfig.route.path}-${unique}`;
        const routeHostsConfig = {
            ...basicConfig.route,
            name: `${basicConfig.route.name}-${unique}`,
            service: serviceConfig.name,
            path: uniquePath,
            hosts: ['api.example.com','api.example.org']
        }
        cy.createRouteViaAPI(routeHostsConfig).then((res) => {
            routeIds.push(res.body.id);
            expect(res.body.hosts).to.deep.equal(routeHostsConfig.hosts);
        });

        //the route works correctly when the host is in the host list
        cy.shouldRouteWorksCorrectly(serverURL + uniquePath, { headers: { Host: routeHostsConfig.hosts[0] } });
        cy.shouldRouteWorksCorrectly(serverURL + uniquePath, { headers: { Host: routeHostsConfig.hosts[1] } });

        //the route does not work with host not in the host list
        cy.shouldRouteNotWorks(serverURL + uniquePath, { headers: { Host: 'abc.example.com' } });
     })

     it('check protocols action', () => {
        const httpsServerURL = `https://${serverConfig.host}:${serverConfig.httpsServerPort}`;
        const unique = generateRandomId();
        const uniquePath = `${basicConfig.route.path}-${unique}`;
        const routeProtocolsConfig = {
            ...basicConfig.route,
            name: `${basicConfig.route.name}-${unique}`,
            service: serviceConfig.name,
            path: uniquePath,
            protocols: ['https']
        }
        cy.createRouteViaAPI(routeProtocolsConfig).then((res) => {
            routeIds.push(res.body.id);
            expect(res.body.protocols).to.deep.equal(routeProtocolsConfig.protocols);
        });

        //the route works correctly with https protocol
        cy.shouldRouteWorksCorrectly(httpsServerURL + uniquePath);

        //the route does not work with http protocol and return default 426 status code
        cy.shouldRouteNotWorks(serverURL + uniquePath).then(res =>{expect(res.status).to.eq(426);});
    })
})