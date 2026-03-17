class GatewayServiceDetailPage {
    constructor() {
        this.titleSelector = 'header span.title';
        this.serviceIdSelector = 'div[data-testid="id-property-value"]'
        this.serviceNameSelector = 'div[data-testid="name-plain-text"]'
        this.enabledSelector = 'div[data-testid="enabled-badge-status"]'
        this.protocolSelector = 'div[data-testid="protocol-plain-text"]'
        this.pathSelector = 'div[data-testid="path-property-value"]'
        this.hostSelector = 'div[data-testid="host-plain-text"]'
        this.portSelector = 'div[data-testid="port-plain-text"]'
    }

    getServiceId() {
        return cy.get(this.serviceIdSelector, { timeout: 10000 })
                .scrollIntoView()
                .find('.copy-text.monospace')
                .getText()
    }

    getServiceName() {
        return cy.get(this.serviceNameSelector).scrollIntoView().getText();
    }

    getEnabled() {
        return cy.get(this.enabledSelector).scrollIntoView().getText();
    }

    getHost() {
        return cy.get(this.hostSelector).scrollIntoView().getText();
    }

    getProtocol() {
        return cy.get(this.protocolSelector).scrollIntoView().getText();
    }

    getPort() {
        return cy.get(this.portSelector).scrollIntoView().getText();
    }

    getPath() {
        return cy.get(this.pathSelector).scrollIntoView().getText();
    }


}

export { GatewayServiceDetailPage };
export const  gatewayServiceDetailPage = new GatewayServiceDetailPage();

