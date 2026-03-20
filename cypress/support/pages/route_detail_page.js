import { RouteNewPage } from "./route_new_page"

class RouteDetailPage {
    constructor() {
        this.routeIdSelector = 'div[data-testid="id-copy-uuid"]'
        this.routeIdValueClass = '.copy-text.monospace'
        this.routeConfigurationTabSelector = 'div[data-testid="config-card-details-basic-props"]'
        this.nameValueSelector = 'div[data-testid="name-property-value"]'
        this.serviceValueSelector = 'div[data-testid="service-property-value"]'
        this.protocolsValueSelector = 'div[data-testid^="protocols-badge-tag-"]'
        this.protocolTextClass = 'div[class="badge-content-wrapper"]'
        this.pathsValueSelector = 'div[data-testid^="paths-copy-uuid-"]'
        this.pathTextClass = 'div[class="copy-text"]'
        this.methodsValueSelector = 'div[data-testid^="methods-badge-method-"]'
        this.methodTextClass = 'div[class="badge-content-wrapper"]'
   }

    getRouteId() {
        return cy.get(this.routeIdSelector, { timeout: 10000 })
                .find(this.routeIdValueClass)
                .getText();
    }

    getName() {
        return cy.get(this.nameValueSelector).getText();
    }

    getMethods() {
        return cy.get(this.methodsValueSelector)
    }
    
    getGatewayService() {
        return cy.get(this.serviceValueSelector).getText();
    }

    getProtocols() {
        return cy.get(this.protocolsValueSelector)
                .find(this.protocolTextClass)
                .getText();
    }

    getPaths() {
        return cy.get(this.pathsValueSelector).find(this.pathTextClass).getText();
    }
    
    getMethods() {
        return cy.get(this.methodsValueSelector)
                .find(this.methodTextClass)
                .getText();
    }

    verifyName(routeName) {
        this.getName().should('eq', routeName)
    }

    verifyGatewayService(serviceName) {
        this.getGatewayService().should('eq', serviceName)
    }

    verifyProtocols(expectedProtocols) {
        expectedProtocols.forEach(protocol => {
            this.getProtocols().should('contain', protocol)
        });
    }

    verifyPaths(expectedPaths) {
        expectedPaths.forEach(path => {
            this.getPaths().should('contain', path)
        });
    }

    verifyMethods(expectedMethods) {
        expectedMethods.forEach(method => {
            this.getMethods().should('contain', method)
        });
    }

    verifyRouteDetails(route) {
        this.verifyName(route.name)
        this.verifyGatewayService(route.service.name)
        const routeProtocolsArray = Array.isArray(route.protocol) ? route.protocol : [route.protocol]
        this.verifyProtocols(routeProtocolsArray)
        const routePathsArray = Array.isArray(route.path) ? route.path : [route.path]
        this.verifyPaths(routePathsArray)
        const methodsArray = Array.isArray(route.method) ? route.method : [route.method]
        this.verifyMethods(methodsArray)
    }
}

export { RouteDetailPage };
export const routeDetailPage = new RouteDetailPage();    