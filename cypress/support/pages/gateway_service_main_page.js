import { GatewayServiceDetailPage } from "./gateway_service_detail_page"
import { GatewayServiceNewPage } from "./gateway_service_new_page"

/**
 * Page Object for the Gateway Service Main page
 */
class GatewayServiceMainPage {
    constructor() {
        this.newGatewayServiceButtonSelector = 'a.k-button[href*="/services/create"]'
        this.pageTitleSelector = '.page-header span.title'
        this.pageDescriptionSelector = '.page-header div.support-text p'
        this.serviceTableSelector = 'div.kong-ui-entities-gateway-services-list table'
        this.serviceTableRowSelector = 'div.kong-ui-entities-gateway-services-list table tbody tr'
        this.serviceActionDropdownSelector = 'button[data-testid="row-actions-dropdown-trigger"]'
        this.serviceDeleteButtonSelector = 'button[data-testid="action-entity-delete"]'
        this.deleteServiceDialogSelector = 'div[aria-label="Delete a Gateway Service"][role="dialog"]'
        this.deleteConfirmInputSelector = 'input[data-testid="confirmation-input"]'
        this.deleteConfirmButtonSelector = 'button[data-testid="modal-action-button"]'
    }

    getServiceRowByName(serviceName) {
        return cy.get(this.serviceTableRowSelector)
            .filter(`[data-testid="${serviceName}"]`);
    }

    deleteServiceByName(serviceName) {
        this.getServiceRowByName(serviceName).within(() => {
            cy.get(this.serviceActionDropdownSelector).click();
        });
        cy.get(this.serviceDeleteButtonSelector)
            .filter(':visible')
            .should('have.length', 1)
            .click();
        cy.get(this.deleteConfirmInputSelector, { timeout: 10000 }).should('be.visible').click().type(serviceName);
        cy.get(this.deleteConfirmButtonSelector, { timeout: 10000 }).should('be.visible').click();
        return this;
    }

    waitPageLoaded() {
        cy.get(this.pageTitleSelector, { timeout: 10000 }).should('be.visible');
        cy.get(this.pageDescriptionSelector, { timeout: 10000 }).should('be.visible');
        cy.get(this.newGatewayServiceButtonSelector, { timeout: 10000 }).should('be.visible');
        return this;
    }

    shouldHaveService(serviceName){
        cy.get(this.serviceTableSelector)
            .find(`tbody tr[data-testid="${serviceName}"]`)
            .should('have.length', 1);
        return this;
    }

    shouldNotHaveService(serviceName) {
        cy.get(this.serviceTableSelector)
            .find(`tbody tr[data-testid="${serviceName}"]`)
            .should('not.exist');
        return this;
    }

    waitServicesTableLoaded() {
        cy.get('div.kong-ui-entities-gateway-services-list table tbody tr', { timeout: 20000 }).should('exist');
        return this;
    }

    navigateToGatewayServiceMainPage() {
        cy.fixture('kongManager.json').then((server) => {
            const gatewayServiceMainPageURL = `${server.protocol}://${server.host}:${server.port}/${server.workspace}/services`;
            cy.visit(gatewayServiceMainPageURL);
        })
        return this;
    }

    openServiceDetailPage(serviceName){
        this.getServiceRowByName(serviceName).click();
        return new GatewayServiceDetailPage;
    }

    clickNewGatewayService() {
        cy.get(this.newGatewayServiceButtonSelector).scrollIntoView().should('be.visible').click();
        return new GatewayServiceNewPage();
    }
}

export { GatewayServiceMainPage };
export const gatewayServiceMainPage = new GatewayServiceMainPage();