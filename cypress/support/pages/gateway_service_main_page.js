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

    get pageTitleElement() {
        return cy.get(this.pageTitleSelector);
    }

    get pageDescriptionElement() {
        return cy.get(this.pageDescriptionSelector);
    }

    get newGatewayServiceButton() {
        return cy.get(this.newGatewayServiceButtonSelector)
            .contains('New gateway service');
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
        cy.get(this.deleteServiceDialogSelector).should('be.visible');
        cy.get(this.deleteConfirmInputSelector).type(serviceName);
        cy.get(this.deleteConfirmButtonSelector).click();
        return this;
    }

    waitPageLoaded() {
        this.pageTitleElement.should('be.visible');
        this.pageDescriptionElement.should('be.visible');
        this.newGatewayServiceButton.should('be.visible');
        return this;
    }

    hasServiceRows() {
        cy.get('body', { timeout: 10000 }).then(($body) => {
            return $body.find('div.kong-ui-entities-gateway-services-list table tbody tr').length > 0;
        });
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

    clickNewGatewayService() {
        this.newGatewayServiceButton.should('be.visible').click();
        return new GatewayServiceNewPage();
    }
}

export { GatewayServiceMainPage };
export const gatewayServiceMainPage = new GatewayServiceMainPage();