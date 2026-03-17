import { GatewayServiceDetailPage } from "./gateway_service_detail_page";  
/**
 * Page Object for the New Gateway Service creation page
 */
class GatewayServiceNewPage {
    constructor() {
        this.fullURLRadioButtonSelector = 'input.radio-input[data-testid="gateway-service-url-radio"]'
        this.manualConfigurationRadioButtonSelector = 'input.radio-input[data-testid="gateway-service-protocol-radio"]'
        this.fullURLInputSelector = 'input[data-testid="gateway-service-url-input"]'
        this.protocolSelectSelector = 'input[data-testid="gateway-service-protocol-select"]'
        this.protocolSelectOptionSelector = 'div.select-item-container'
        this.hostInputSelector = 'input[data-testid="gateway-service-host-input"]'
        this.pathInputSelector = 'input[data-testid="gateway-service-path-input"]'
        this.portInputSelector = 'input[data-testid="gateway-service-port-input"]'
        this.nameInputSelector = 'input[data-testid="gateway-service-name-input"]'
        this.saveButtonSelector = 'button[data-testid="service-create-form-submit"]'
        this.popUpSuccessMessageSelector = 'div.toaster.success[role="alert"]'
        this.popUpSuccessMessageTextSelector = 'div.toaster.success p.toaster-message'
        this.formErrorMessageSelector = 'div[data-testid="form-error"]'
        this.cancelSaveButtonSelector = 'button[data-testid="service-create-form-cancel"]'
    }

    get fullURLOption() {
        return cy.get(this.fullURLRadioButtonSelector);
    }
    
    get fullURLInput() {
        return cy.get(this.fullURLInputSelector);
    }

    get nameInput() {
        return cy.get(this.nameInputSelector);
    }

    get addTagsToggle() {
        //
    }

    get tagsInput() {
        return cy.get(this.tagsInputSelector);
    }

    get saveButton() {
        return cy.get(this.saveButtonSelector);
    }

    selectFullURL() {
        this.fullURLOption.check();
        return this;
    }

    /**
     * @param {string} url - The target service URL (e.g., "https://api.example.com/service")
     */
    fillFullURL(url) {
        this.fullURLInput.clear().type(url);
        return this;
    }

    fillName(name) {
        this.nameInput.clear().type(name);
        return this;
    }

    /**
     *@param {string[]} [tags=[]] - Optional array of tags (e.g., ["test", "v1"])
     */
    fillTags(tags = []) {
        this.addTagsToggle.click();
        this.tagsInput.clear().type(tags.join(','));
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

    save() {
        this.saveButton.click();
        return new GatewayServiceDetailPage();
    }
};

export { GatewayServiceNewPage };
export const gatewayServiceNewPage = new GatewayServiceNewPage();