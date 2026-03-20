import { GatewayServiceDetailPage } from "./gateway_service_detail_page";
/**
 * Page Object for the New Gateway Service creation page
 */
class GatewayServiceNewPage {
    constructor() {
        this.fullURLRadioButtonSelector = 'input.radio-input[data-testid="gateway-service-url-radio"]'
        this.manualConfigurationRadioButtonSelector = 'input.radio-input[data-testid="gateway-service-protocol-radio"]'
        this.fullURLInputSelector = 'input[data-testid="gateway-service-url-input"]'
        this.errorMessageTextSelector = 'p.help-text'
        this.protocolSelectSelector = 'input[data-testid="gateway-service-protocol-select"]'
        this.protocolSelectOptionSelector = 'div.select-item-container'
        this.hostInputSelector = 'input[data-testid="gateway-service-host-input"]'
        this.pathInputSelector = 'input[data-testid="gateway-service-path-input"]'
        this.portInputSelector = 'input[data-testid="gateway-service-port-input"]'
        this.nameInputSelector = 'input[data-testid="gateway-service-name-input"]'
        this.connectionTimeoutInputSelector = 'input[data-testid="gateway-service-connect-timeout-input"]'
        this.writeTimeoutInputSelector = 'input[data-testid="gateway-service-write-timeout-input"]'
        this.readTimeoutInputSelector = 'input[data-testid="gateway-service-read-timeout-input"]'
        this.saveButtonSelector = 'button[data-testid="service-create-form-submit"]'
        this.popUpSuccessMessageSelector = 'div.toaster.success[role="alert"]'
        this.popUpSuccessMessageTextSelector = 'div.toaster.success p.toaster-message'
        this.formErrorMessageSelector = 'div[data-testid="form-error"]'
        this.cancelSaveButtonSelector = 'button[data-testid="service-create-form-cancel"]'
        this.alertMessageSelector = 'div.alert-message ul.form-error-list li'
        this.fullURLErrorMessage = "The URL must follow a valid format. Example: https://api.kong-air.com/flights"
    }

    selectFullURL() {
        cy.get(this.fullURLRadioButtonSelector).check();
        return this;
    }

    selectManualConfiguration() {
        cy.get(this.manualConfigurationRadioButtonSelector).check();
        return this;
    }

    fillFullURL(url) {
        cy.get(this.fullURLInputSelector).scrollIntoView().click().clear().type(url);
        return this;
    }

    fillName(name) {
        cy.get(this.nameInputSelector).scrollIntoView().click().clear().type(name);
        return this;
    }

    fillHost(host) {
        cy.get(this.hostInputSelector).click().type('{selectall}' + host);
        return this;
    }

    fillPath(path) {
        cy.get(this.pathInputSelector).scrollIntoView().click().clear().type(path);
        return this;
    }

    fillPort(port) {
        cy.get(this.portInputSelector).scrollIntoView().click().type('{selectall}' + port.toString());
        return this;
    }

    fillConnectionTimeout(timeout) {
        cy.get(this.connectionTimeoutInputSelector).scrollIntoView().click().type('{selectall}' + timeout.toString());
        return this;
    }

    fillWriteTimeout(timeout) {
        cy.get(this.writeTimeoutInputSelector).scrollIntoView().click().type('{selectall}' + timeout.toString());
        return this;
    }

    fillReadTimeout(timeout) {
        cy.get(this.readTimeoutInputSelector).scrollIntoView().click().type('{selectall}' + timeout.toString());
        return this;
    }

    waitPageLoaded() {
        cy.get(this.fullURLRadioButtonSelector).should('be.visible');
        return this;
    }

    verifyServiceCreatedSuccessNotification(serviceName) {
        cy.get(this.popUpSuccessMessageSelector, { timeout: 20000 })
            .scrollIntoView()
            .should('be.visible');
        cy.get(this.popUpSuccessMessageTextSelector)
            .scrollIntoView()
            .should('be.visible')
            .and('contain', `Gateway Service "${serviceName}" successfully created!`);
    }

    verifyFullURLErrorMessage() {
        cy.get(this.fullURLInputSelector)
            .parent()
            .next()
            .scrollIntoView()
            .should('be.visible')
            .and('contain', this.fullURLErrorMessage);
    }

    verifyFullURLErrorMessageNotExist() {
        cy.get(this.fullURLInputSelector)
            .parent()
            .next()
            .should('not.exist');
    }

    verifySaveButtonDisabled() {
        cy.get(this.saveButtonSelector).should('be.disabled');
    }

    verifySaveButtonEnabled() {
        cy.get(this.saveButtonSelector).should('be.enabled');
    }

    verifyAlertMessage() {
        cy.get(this.alertMessageSelector).should('be.visible');
        return this;
    }

    checkInvalidURLs(invalidURLs) {
        invalidURLs.forEach((url) => {
            cy.reload(); // Reset the form before each input
            cy.get(this.fullURLInputSelector).scrollIntoView().click().clear().type(url).then(() => {
                cy.get(this.fullURLInputSelector).parent().next().should('be.visible').and('contain', this.fullURLErrorMessage);
                cy.get(this.saveButtonSelector).should('be.disabled');
            });
        });
    }

    checkValidURLs(validURLs) {
        validURLs.forEach((url) => {
            cy.reload(); // Reset the form before each input
            cy.get(this.fullURLInputSelector).scrollIntoView().click().clear().type(url).then(() => {
                cy.get(this.fullURLInputSelector).parent().next().should('not.exist');
                cy.get(this.saveButtonSelector).should('be.enabled');
            });
        });
    }

    save() {
        cy.get(this.saveButtonSelector).click();
        return new GatewayServiceDetailPage();
    }
};

export { GatewayServiceNewPage };
export const gatewayServiceNewPage = new GatewayServiceNewPage();