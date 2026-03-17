import { RouteDetailViewPage } from "./route_detail_page";  
/**
 * Page Object for the New Route creation page
 */
class RouteNewPage {
    constructor() {
        this.nameInputSelector = 'input[data-testid="route-form-name"]'
        this.serviceSelectSelector = 'input[data-testid="route-form-service-id"]'
        this.serviceSelectOptionSelector = 'div.route-form-service-dropdown-item'
        this.tagsInputSelector = 'input[data-testid="route-form-tags"]'
        this.routePathInputSelector = 'input[data-testid="route-form-paths-input-1"]'
        this.methodSelectSelector = 'div[data-testid="multiselect-trigger"]'
        this.methodSelectOptionSelector = 'div.multiselect-item-container'
        this.saveButtonSelector = 'button[data-testid="route-create-form-submit"]'
        this.popUpSuccessMessageSelector = 'div[class*="toaster"][class*="success"][role="alert"]'
        this.popUpSuccessMessageTextSelector = 'div.toaster.success p.toaster-message'
    }

    get nameInput() {
        return cy.get(this.nameInputSelector);
    }

    get serviceSelect() {
        return cy.get(this.serviceSelectSelector);
    }

    get serviceSelectOption() {
        return cy.get(this.serviceSelectOptionSelector);
    }

    get tagsInput() {
        return cy.get(this.tagsInputSelector);
    }   

    get saveButton() {
        return cy.get(this.saveButtonSelector);
    }

    fillName(name) {
        this.nameInput.clear().type(name);
        return this;
    }

    selectService(serviceName) {
        this.serviceSelect.click();
        this.serviceSelectOption.contains(serviceName).click();
        return this;
    }

    fillTags(tags) {
        this.tagsInput.clear().type(tags);
        return this;
    }

    fillPath(path) {
        cy.get(this.routePathInputSelector).clear().type(path);
        return this;
    }   

    selectMethod(methods) {
        cy.get(this.methodSelectSelector).click();
        const methodsArray = Array.isArray(methods) ? methods : [methods];
        methodsArray.forEach(method => {
            cy.get(this.methodSelectOptionSelector).contains(method).click();
        });
        cy.get(this.nameInputSelector).type('{esc}');   
        return this;
    }

    fillHost(host) {
        cy.get(this.routePathInputSelector).clear().type(host);
        return this;
    } 

    save() {    
        this.saveButton.click();
        return new RouteDetailViewPage();
    }

    verifyRouteCreatedSuccessNotification(routeName) {
        cy.get(this.popUpSuccessMessageSelector, { timeout: 20000 })
            .scrollIntoView()
            .should('be.visible');
        cy.get(this.popUpSuccessMessageTextSelector)
            .scrollIntoView()
            .should('be.visible')
            .and('contain', `Route "${routeName}" successfully created!`);
    }
}

export { RouteNewPage }    
export const routeNewPage = new RouteNewPage();