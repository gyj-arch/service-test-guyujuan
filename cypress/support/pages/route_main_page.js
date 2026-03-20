import { RouteNewPage } from "./route_new_page"

class RouteMainPage {
    constructor() {
        this.newRouteButtonSelector = 'a.k-button[href*="/routes/create"]'
        this.pageTitleSelector = 'span.title'
        this.pageDescriptionSelector = 'div.support-text p'
        this.routeTableSelector = 'div.kong-ui-entities-routes-list table'
        this.routeTableRowSelector = 'div.kong-ui-entities-routes-list table tbody tr'
        this.routeActionDropdownSelector = 'button[data-testid="row-actions-dropdown-trigger"]'
        this.routeDeleteButtonSelector = 'button[data-testid="action-entity-delete"]'
        this.deleteRouteDialogSelector = 'div[aria-label="Delete a Route"][role="dialog"]'
        this.deleteConfirmInputSelector = 'input[data-testid="confirmation-input"]'
        this.deleteConfirmButtonSelector = 'button[data-testid="modal-action-button"]'
    }

    navigateToRouteMainPage() {
        cy.fixture('kongManager.json').then((server) => {
            const routeMainPageURL = `${server.protocol}://${server.host}:${server.port}/${server.workspace}/routes`;
            cy.visit(routeMainPageURL);
        });
        return this;
    }

    waitPageLoaded() {
        cy.get(this.pageTitleSelector, { timeout: 10000 }).should('be.visible');
        cy.get(this.pageDescriptionSelector, { timeout: 10000 }).should('be.visible');
        cy.get(this.newRouteButtonSelector, { timeout: 10000 }).should('be.visible');
        return this;
    }

    clickNewRoute() {
        cy.get(this.newRouteButtonSelector).click();
        return new RouteNewPage();
    }

    getRouteRowByName(routeName) {
        return cy.get(this.routeTableRowSelector)
            .filter(`[data-testid="${routeName}"]`);
    }

    shouldHaveRoute(routeName){
        cy.get(this.routeTableSelector)
            .find(`tbody tr[data-testid="${routeName}"]`)
            .should('have.length', 1);
        return this;
    }

    shouldNotHaveRoute(routeName) {
        cy.get(this.routeTableSelector)
            .find(`tbody tr[data-testid="${routeName}"]`)
            .should('not.exist');
        return this;
    }

    deleteRouteByName(routeName) {
        this.getRouteRowByName(routeName).within(() => {
            cy.get(this.routeActionDropdownSelector).click();
        });
        cy.get(this.routeDeleteButtonSelector)
            .filter(':visible')
            .should('have.length', 1) 
            .click();
        cy.get(this.deleteRouteDialogSelector).should('be.visible');
        cy.get(this.deleteConfirmInputSelector).type(routeName);
        cy.get(this.deleteConfirmButtonSelector).click();
    }
}

export { RouteMainPage };
export const routeMainPage = new RouteMainPage();