import { RouteDetailPage } from "./route_detail_page";  
/**
 * Page Object for the New Route creation page
 */
class RouteNewPage {
    constructor() {
        this.nameInputSelector = 'input[data-testid="route-form-name"]'
        this.serviceSelectSelector = 'input[data-testid="route-form-service-id"]'
        this.serviceSelectOptionSelector = 'div.route-form-service-dropdown-item'
        this.basicOptionRadioButtonSelector = 'input[data-testid="route-form-config-type-basic"]'
        this.advancedOptionRadioButtonSelector = 'input[data-testid="route-form-config-type-advanced"]'
        this.protocolSelectSelector = 'input[data-testid="route-form-protocols"]'
        this.protocolSelectOptionSelector = 'div[data-testid="select-item-'
        this.tagsInputSelector = 'input[data-testid="route-form-tags"]'
        this.routePathInputSelectorPrex = 'input[data-testid="route-form-paths-input-'
        this.routeHostInputSelectorPrex = 'input[data-testid="route-form-hosts-input-'
        this.AddPathButtonSelector = 'button[data-testid="add-paths"]'
        this.RemovePathButtonSelector = 'button[data-testid="remove-paths"]'
        this.methodSelectSelector = 'div[data-testid="multiselect-trigger"]'
        this.methodSelectOptionSelector = 'div.multiselect-item-container'
        this.AddHostButtonSelector = 'button[data-testid="add-hosts"]'
        this.RemoveHostButtonSelector = 'button[data-testid="remove-hosts"]'
        this.saveButtonSelector = 'button[data-testid="route-create-form-submit"]'
        this.popUpSuccessMessageSelector = 'div[class*="toaster"][class*="success"][role="alert"]'
        this.popUpSuccessMessageTextSelector = 'div.toaster.success p.toaster-message'
        this.stripPathCheckboxSelector = 'input[data-testid="route-form-strip-path"]'
    }

    fillName(name) {
        cy.get(this.nameInputSelector).clear().type(name);
        return this;
    }

    selectService(serviceName) {
        cy.get(this.serviceSelectSelector).click();
        cy.get(this.serviceSelectOptionSelector).contains(serviceName).click();
        return this;
    }

    selectBasicOption() {
        cy.get(this.basicOptionRadioButtonSelector).check();
        return this;
    }

    selectProtocol(protocol) {
        cy.get(this.protocolSelectSelector).click();
        cy.get(`${this.protocolSelectOptionSelector}${protocol.toLowerCase()}"]`).click();
        cy.get(this.nameInputSelector).type('{esc}');   
        return this;
    }
    selectAdvancedOption() {
        cy.get(this.advancedOptionRadioButtonSelector).check();
        return this;
    }
    
    fillTags(tags) {
        cy.get(this.tagsInputSelector).clear().type('{selectall}' + tags);
        return this;
    }

    fillPath(path,index="1") {
        cy.get(`${this.routePathInputSelectorPrex}${index}"]`).clear().type(path);
        return this;
    }   

    addPath() {
        cy.get(this.AddPathButtonSelector).click();
        return this;
    }

    removePath(index="1") {
        cy.get(`${this.routePathInputSelectorPrex}${index}"]`).parent().parent().next().click();
        return this;
    }

    fillHost(host,index="1") {
        cy.get(`${this.routeHostInputSelectorPrex}${index}"]`).clear().type(host);
        return this;
    }

    addHost() {
        cy.get(this.AddHostButtonSelector).click();
        return this;
    }

    removeHost(index="1") {
        cy.get(`${this.routeHostInputSelectorPrex}${index}"]`).parent().parent().next().click();
        return this;
    }

    fillStripPath(stripPath) {
        if (stripPath === 'true') {
            cy.get(this.stripPathCheckboxSelector).check();
        } else if (stripPath === 'false') {
            cy.get(this.stripPathCheckboxSelector).uncheck();
        }
        return this;
    }

    selectMethod(methods) {
        cy.get(this.methodSelectSelector).scrollIntoView().click();
        const methodsArray = Array.isArray(methods) ? methods : [methods];
        methodsArray.forEach(method => {
            cy.get(this.methodSelectOptionSelector).contains(method).scrollIntoView().click();
        });
        cy.get(this.nameInputSelector).type('{esc}');   
        return this;
    }


    save() {    
        cy.get(this.saveButtonSelector).click();
        return new RouteDetailPage();
    }

    verifyRouteCreatedSuccessNotification(routeName) {
        cy.get(this.popUpSuccessMessageSelector, { timeout: 20000 })
            .should('contain', `Route "${routeName}" successfully created!`)
            .scrollIntoView()
            .should('be.visible');
    }
}

export { RouteNewPage }    
export const routeNewPage = new RouteNewPage();