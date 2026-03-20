import { GatewayServiceBusiness } from "../../support/services/gateway_service_business"

describe('Verify Gateway Service Creation Page Grid', () => {
    const gatewayServiceBusiness = new GatewayServiceBusiness()
    let serviceParameters;


    before(() => {
        cy.fixture('serviceParametersCheck.json')
            .then((parameters) => {
                serviceParameters = JSON.parse(JSON.stringify(parameters));
            })
    })

    beforeEach(() => {
        gatewayServiceBusiness.navigateToGatewayServiceNewPage();
    })

    after(() => {
        //clean test data if needed
    })

    it('check new gateway service Full URL parameter', () => {
        gatewayServiceBusiness.checkNewGatewayServiceParameters('fullURL', serviceParameters);
    })
})
