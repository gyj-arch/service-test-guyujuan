import { GatewayServiceBusiness } from "../../support/services/gateway_service_business"

describe('Create Gateway Service', () => {
    const gatewayServiceBusiness = new GatewayServiceBusiness()
    let adminURL;
    let serverURL;
    let basicConfig;
    let serverConfig;
    let serviceIds = [];

    before(() => {
        // Load fixtures once
        cy.fixture('basicFlow.json').then((config) => {
            basicConfig = config;
        })

        cy.fixture('kongManager.json')
            .then((config) => {
                serverConfig = { ...config };
                adminURL = `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.adminPort}`;
                serverURL = `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.serverPort}`;
            })
    })

    beforeEach(() => {
        gatewayServiceBusiness.navigateToGatewayServiceNewPage();
    })

    after(() => {
        serviceIds.forEach(serviceId => {
            cy.deleteServiceViaAPI(serviceId);
        });
    })

    it('create gateway service with full url', () => {
        const unique = generateRandomId();
        let serviceId;
        const serviceConfig = {
            ...basicConfig.service,
            name: `${basicConfig.service.name}-${unique}`
        }

        gatewayServiceBusiness
            .createGatewayServiceWithFullURL(serviceConfig)
            .getServiceId()
            .then((id) => {
                serviceId = id;
                serviceIds.push(serviceId);

                //verify service is created
                cy.request({
                    method: 'GET',
                    url: `${adminURL}/services/${serviceConfig.name}`,
                    failOnStatusCode: false,
                }).then((response) => {
                    expect(response.status).to.equal(200);
                    expect(response.body).to.have.property('name', serviceConfig.name);
                    expect(response.body).to.have.property('id', serviceId);
                    expect(response.body).to.have.property('enabled', true);
                });
            });

        //switch and check the status of the service
        gatewayServiceBusiness.shouldServicePageHaveService(serviceConfig.name)
                .shouldServiceIsEnabled(serviceConfig.name)
        gatewayServiceBusiness.switchServiceStatus(serviceConfig.name)
                .shouldServiceIsDisabled(serviceConfig.name)
        gatewayServiceBusiness.switchServiceStatus(serviceConfig.name)
                .shouldServiceIsEnabled(serviceConfig.name);
    })

    it('create gateway service with seperate url component', () => {
        const unique = generateRandomId();
        let serviceId;
        const serviceConfig = {
            ...basicConfig.service,
            name: `${basicConfig.service.name}-${unique}`
        }

        //create service - getServiceId() 返回 Cypress 链，需用 .then() 获取实际 ID 字符串
        gatewayServiceBusiness
            .createGatewayServiceWithEachURLComponent(serviceConfig)
            .getServiceId()
            .then((id) => {
                serviceId = id;
                serviceIds.push(serviceId);

                //verify service is created
                cy.request({
                    method: 'GET',
                    url: `${adminURL}/services/${serviceConfig.name}`,
                    failOnStatusCode: false,
                }).then((response) => {
                    expect(response.status).to.equal(200);
                    expect(response.body).to.have.property('name', serviceConfig.name);
                    expect(response.body).to.have.property('id', serviceId);
                    expect(response.body).to.have.property('enabled', true);
                });
            });
    })
})
