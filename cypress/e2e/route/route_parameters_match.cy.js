import { recurse } from 'cypress-recurse';

describe('Verify Route Parameters Match', () => {
    let basicConfig;
    let serverConfig;
    let adminURL;
    let serverURL;
    let serviceIds = [];
    let routeIds = [];
    let serviceConfig;

    before(() => {
        cy.fixture('kongManager.json').then((config) => {
            serverConfig = { ...config };
            adminURL = `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.adminPort}`;
            serverURL = `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.serverPort}`;
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

    it('check strip_path matching', () => {
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

    it('check methods matching', () => {
        const unique = generateRandomId();
        const uniqueServiceName = `${basicConfig.service.name}-${unique}`;
        const serviceConfig = {
            ...basicConfig.service,
            url: `http://httpbin.org/anything`,
            name: uniqueServiceName
        };
        cy.createServiceViaAPI(serviceConfig).then((res) => {
            serviceIds.push(res.body.id);
        });
        const uniquePath = `${basicConfig.route.path}-${unique}`;
        const routeMethodsConfig = {
            ...basicConfig.route,
            name: `${basicConfig.route.name}-${unique}`,
            service: uniqueServiceName,
            path: uniquePath,
            methods: ['GET', 'POST']
        }
        cy.createRouteViaAPI(routeMethodsConfig).then((res) => {
            routeIds.push(res.body.id);
            expect(res.body.methods).to.deep.equal(['GET', 'POST']);
        });

        //the route works correctly when the method is GET
        cy.shouldRouteWorksCorrectly(serverURL + uniquePath, { method: 'GET' });

        //the route works correctly when the  method is POST
        cy.shouldRouteWorksCorrectly(serverURL + uniquePath, { method: 'POST' });

        //the route does not work when the method is PUT
        cy.shouldRouteNotWorks(serverURL + uniquePath, { method: 'PUT' });
    })

    it('check hosts matching', () => {
        const unique = generateRandomId();
        const uniquePath = `${basicConfig.route.path}-${unique}`;
        const routeHostsConfig = {
            ...basicConfig.route,
            name: `${basicConfig.route.name}-${unique}`,
            service: serviceConfig.name,
            path: uniquePath,
            hosts: ['api.example.com', 'api.example.org']
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

    it('check protocols matching', () => {
        const unique = generateRandomId();
        const uniquePath = `${basicConfig.route.path}-${unique}`;
        const httpsServerURL = `https://${serverConfig.host}:${serverConfig.httpsServerPort}`;
        const routeProtocolsConfig = {
            ...basicConfig.route,
            name: `${basicConfig.route.name}-${unique}`,
            service: serviceConfig.name,
            path: uniquePath,
            protocols: ['http', 'https']
        }
        cy.createRouteViaAPI(routeProtocolsConfig).then((res) => {
            routeIds.push(res.body.id);
            expect(res.body.protocols).to.deep.equal(routeProtocolsConfig.protocols);
        });

        //the route works correctly with http protocol
        cy.shouldRouteWorksCorrectly(serverURL + uniquePath);
        //the route works correctly with https protocol
        cy.shouldRouteWorksCorrectly(httpsServerURL + uniquePath);

        //remove the http protocol and the default 426 status code is returned
        cy.updateRouteViaAPI(routeProtocolsConfig.name, { protocols: ['https'] }).then((res) => {
            expect(res.body.protocols).to.deep.equal(['https']);
            cy.shouldRouteNotWorks(serverURL + uniquePath).then(res => { expect(res.status).to.eq(426); });
        });
    })

    it('check https_redirect_status_code matching', () => {
        const unique = generateRandomId();
        const uniquePath = `${basicConfig.route.path}-${unique}`;
        const url = `${serverURL}${uniquePath}`;
        const routeConfig = {
            ...basicConfig.route,
            name: `${basicConfig.route.name}-${unique}`,
            service: serviceConfig.name,
            path: uniquePath,
            protocols: ['https']
        }
        cy.createRouteViaAPI(routeConfig).then((res) => {
            routeIds.push(res.body.id);
            expect(res.body.protocols).to.deep.equal(routeConfig.protocols);
        });

        //check the https_redirect_status_code 
        const status_codes = [426, 301, 302, 307, 308];
        cy.wrap(status_codes).each(status_code => {
            cy.updateRouteViaAPI(routeConfig.name, { https_redirect_status_code: status_code }).then((res) => {
                expect(res.body.https_redirect_status_code).to.eq(status_code);
                recurse(
                    () => cy.request({
                      url,
                      followRedirect: false,
                      failOnStatusCode: false,
                    }),
                    (response) => response.status === status_code,
                    {
                      timeout: 30000,
                      delay: 1000,
                      log: true,
                      errorMsg: `Expected status ${status_code} but not propagated in time`,
                    }
                  ).then((response) => {
                    expect(response.status).to.eq(status_code);
                    switch(status_code){
                        case 426:
                            expect(response.headers).not.to.have.property('location');
                            expect(response.headers.connection.toLowerCase()).to.include('upgrade');
                            break;
                        case 301:
                            expect(response.headers).to.have.property('location');
                            expect(response.body).to.include('301 Moved Permanently');
                            break;
                        case 302:
                            expect(response.headers).to.have.property('location');
                            expect(response.body).to.include('302 Found');
                            break;
                        case 307:
                            expect(response.headers).to.have.property('location');
                            expect(response.body).to.include('307 Temporary Redirect');
                            break;
                        case 308:
                            expect(response.headers).to.have.property('location');
                            expect(response.body).to.include('308 Permanent Redirect');
                            break;
                    }
                });
            });
        });
    })

    it('check preserve_host matching', () => {
        const unique = generateRandomId();
        const uniquePath = `${basicConfig.route.path}-${unique}`;
        const headersServcieConfig = {
            name: `${basicConfig.service.name}-${unique}`,
            url: "http://httpbin.org/headers"
        }
        cy.createServiceViaAPI(headersServcieConfig).then((res) => {
            serviceIds.push(res.body.id);
            expect(res.status).to.eq(201);
        });
        
        const myHost = "myhost.com";
        const routePreserveHostConfig = {
            ...basicConfig.route,
            name: `${basicConfig.route.name}-${unique}`,
            service: headersServcieConfig.name,
            path: uniquePath,
            preserve_host: true
        }
        cy.createRouteViaAPI(routePreserveHostConfig).then((res) => {
            routeIds.push(res.body.id);
            expect(res.body.preserve_host).to.be.true;
        });

        //the host is sent to the upstream server
        cy.shouldRouteWorksCorrectly(serverURL + uniquePath, { headers: { Host: myHost } })
        .then(res => {
            expect(res.body).to.have.property('headers');
            const upstreamHost = res.body?.headers?.Host || res.body?.headers?.host;
            expect(upstreamHost).to.eq(myHost);
        });

        //update the route to preserve_host to false
        cy.updateRouteViaAPI(routePreserveHostConfig.name, { preserve_host: false }).then((res) => {
            expect(res.body.preserve_host).to.be.false;
        });

        //the host is not sent to the upstream server
        recurse(
            () => cy.request({
              url: serverURL + uniquePath,
              followRedirect: false,
              failOnStatusCode: false,
              headers: { Host: myHost },
            }),
            (response) => (response.body?.headers?.Host || response.body?.headers?.host) !== myHost,
            {
              timeout: 30000,
              delay: 1000,
              log: true,
              errorMsg: `Expected host ${myHost} but not propagated in time`,
            }
          ).then((response) => {
            const upstreamHost = response.body?.headers?.Host || response.body?.headers?.host;
            expect(upstreamHost).to.not.eq(myHost);
        });
    })

    it('check headers matching', () => {
        const unique = generateRandomId();
        const uniquePath = `${basicConfig.route.path}-${unique}`;
        const routeHeadersConfig = {
            ...basicConfig.route,
            name: `${basicConfig.route.name}-${unique}`,
            service: serviceConfig.name,
            path: uniquePath,
            headers: { 'x-api-version': ['v1', 'v2'] }
        }
        cy.createRouteViaAPI(routeHeadersConfig).then((res) => {
            routeIds.push(res.body.id);
            expect(res.body.headers).to.have.property('x-api-version');
            expect(res.body.headers['x-api-version']).to.deep.equal(['v1', 'v2']);
        });

        //route works with matching header values
        cy.shouldRouteWorksCorrectly(serverURL + uniquePath, { headers: { 'x-api-version': 'v1' } });
        cy.shouldRouteWorksCorrectly(serverURL + uniquePath, { headers: { 'x-api-version': 'v2' } });

        //route does not work without the required header
        cy.shouldRouteNotWorks(serverURL + uniquePath);

        //route does not work with a non-matching header value
        cy.shouldRouteNotWorks(serverURL + uniquePath, { headers: { 'x-api-version': 'v3' } });

        // skip regex-based matching because it does not work
        // //update to regex-based matching (prefix with ~, no anchors)
        // cy.updateRouteViaAPI(routeHeadersConfig.name, {
        //     headers: { 'x-api-version': ['~v[0-9]+'] }
        //     //"expression": "http.headers.x-api-version ~ r#\"^v[0-9]+$\"#"
        // }).then((res) => {
        //     expect(res.body.headers['x-api-version']).to.deep.equal(['~v[0-9]+']);
        // });

        // //regex matches v followed by digits
        // cy.shouldRouteWorksCorrectly(serverURL + uniquePath, { headers: { 'x-api-version': 'v1' } });
        // cy.shouldRouteWorksCorrectly(serverURL + uniquePath, { headers: { 'x-api-version': 'v99' } });

        // //regex does not match non-numeric versions
        // cy.shouldRouteNotWorks(serverURL + uniquePath, { headers: { 'x-api-version': 'beta' } });

        //update to regex-based matching (prefix with ~*, no anchors)
        cy.updateRouteViaAPI(routeHeadersConfig.name, {
            headers: { 'x-api-version': ['~*v[0-9]+'] }
        }).then((res) => {
            expect(res.body.headers['x-api-version']).to.deep.equal(['~*v[0-9]+']);
        });

        //regex matches v followed by digits
        cy.shouldRouteWorksCorrectly(serverURL + uniquePath, { headers: { 'x-api-version': 'v1' } });
        cy.shouldRouteWorksCorrectly(serverURL + uniquePath, { headers: { 'x-api-version': 'v99' } });

        //regex does not match non-numeric versions
        cy.shouldRouteNotWorks(serverURL + uniquePath, { headers: { 'x-api-version': 'beta' } });

        //switch to a different header (x-region) with exact match
        cy.updateRouteViaAPI(routeHeadersConfig.name, {
            headers: { 'x-region': ['us-east', 'eu-west'] }
        }).then((res) => {
            expect(res.body.headers).to.have.property('x-region');
            expect(res.body.headers['x-region']).to.deep.equal(['us-east', 'eu-west']);
        });

        cy.shouldRouteWorksCorrectly(serverURL + uniquePath, { headers: { 'x-region': 'us-east' } });
        cy.shouldRouteWorksCorrectly(serverURL + uniquePath, { headers: { 'x-region': 'eu-west' } });
        cy.shouldRouteNotWorks(serverURL + uniquePath, { headers: { 'x-region': 'ap-south' } });
    })
})