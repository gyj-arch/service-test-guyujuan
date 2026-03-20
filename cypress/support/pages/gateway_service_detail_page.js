import { RouteNewPage } from "./route_new_page"

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
        this.addARouteSelector = 'button.add-route-btn'
        this.routeTabSelector = 'div[data-testid="service-routes"]'
        this.routeTableRowSelector = 'div.kong-ui-entities-routes-list table tbody tr'
        this.toolbarAddRouteSelector = 'a[data-testid="toolbar-add-route"]'
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

    clickAddARouteButton() {
        cy.get(this.addARouteSelector).contains("Add a Route").click();
        return new RouteNewPage();
    }

    clickRoutesTab(){
        cy.get(this.routeTabSelector).click();
        return this;
    }

    shouldAddARouteButtonExist() {
        cy.get(this.addARouteSelector,{ timeout: 10000 }).contains("Add a Route").should('exist');
        return this;
    }

    shouldAddARouteButtonNotExist() {
        cy.get('body').find(this.addARouteSelector).should('not.exist');
        return this;
    }

    getRouteRowByName(routeName) {
        return cy.get(this.routeTableRowSelector)
            .filter(`[data-testid="${routeName}"]`);
    }

    shouldHaveRoute(routeName){
        cy.get(this.routeTableRowSelector)
            .find(`tbody tr[data-testid="${routeName}"]`)
            .should('have.length', 1);
        return this;
    }

    clickToobarNewRouteButton(){
        cy.get(this.toolbarAddRouteSelector).click()
        return new RouteNewPage();
    }

}

export { GatewayServiceDetailPage };
export const  gatewayServiceDetailPage = new GatewayServiceDetailPage();

