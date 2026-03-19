import { GatewayServiceMainPage } from "../pages/gateway_service_main_page"
import { GatewayServiceDetailPage } from "../pages/gateway_service_detail_page"
import { GatewayServiceNewPage } from "../pages/gateway_service_new_page"

class GatewayServiceBusiness {
  constructor() {
    this.gatewayServiceMainPage = new GatewayServiceMainPage();
    this.gatewayServiceDetailPage = new GatewayServiceDetailPage();
    this.gatewayServiceNewPage = new GatewayServiceNewPage();
  }

  navigateToGatewayServiceMainPage() {
    cy.fixture('kongManager.json').then((server) => {
      const gatewayServiceMainPageURL = `${server.protocol}://${server.host}:${server.port}/${server.workspace}/services`;
      cy.visit(gatewayServiceMainPageURL);
      this.gatewayServiceMainPage.waitPageLoaded();
    })
  }

  /**
   * @param {Object} serviceConfig）
   */
  createGatewayServiceWithFullURL(serviceConfig) {
    this.navigateToGatewayServiceMainPage()
    const newGatewayServicePage = this.gatewayServiceMainPage.clickNewGatewayService();
    const gatewayServiceDetailPage = newGatewayServicePage
      .fillFullURL(serviceConfig.url)
      .fillName(serviceConfig.name)
      .save()
    newGatewayServicePage.verifyServiceCreatedSuccessNotification(serviceConfig.name);
    return gatewayServiceDetailPage;
  }

  createGatewayServiceWithEachURLComponent(serviceConfig) {
    this.navigateToGatewayServiceMainPage()
    const newGatewayServicePage = this.gatewayServiceMainPage.clickNewGatewayService();
    const gatewayServiceDetailPage = newGatewayServicePage
      .selectManualConfiguration()
      //.fillProtocol(serviceConfig.protocol)
      .fillHost(serviceConfig.host)
      .fillPath(serviceConfig.path || '/')
      .fillPort(serviceConfig.port || 80)
      .fillName(serviceConfig.name)
      .save()
    newGatewayServicePage.verifyServiceCreatedSuccessNotification(serviceConfig.name);
    return gatewayServiceDetailPage;
  }


createBasicRoute(routeConfig,serviceName) {
  this.navigateToGatewayServiceMainPage()
  const newRoutePage = this.gatewayServiceMainPage.clickNewRoute();
  const routeDetailPage = newRoutePage
    .fillName(routeConfig.name)
    .selectBasicOption()
    .selectService(serviceName)
    .fillTags(routeConfig.tags)
    .fillPath(routeConfig.path)
    .fillStripPath(routeConfig.stripPath)
    .selectMethod(routeConfig.method)
    .save();
  newRoutePage.verifyRouteCreatedSuccessNotification(routeConfig.name);
  return routeDetailPage;
}

createAdvancedRoute(routeConfig,serviceName) {
  this.navigateToGatewayServiceMainPage()
  const newRoutePage = this.gatewayServiceMainPage.clickNewRoute();
  const routeDetailPage = newRoutePage
    .fillName(routeConfig.name)
    .selectAdvancedOption()
    .fillHost(routeConfig.host)
    .fillPath(routeConfig.path)
    .fillPort(routeConfig.port)
    .fillProtocol(routeConfig.protocol)
    .fillTags(routeConfig.tags)
    .save();
  newRoutePage.verifyRouteCreatedSuccessNotification(routeConfig.name);
  return routeDetailPage;
}

  /**
   * @param {string} serviceName
   */
  deleteGatewayService(serviceName) {
    this.gatewayServiceMainPage
      .navigateToGatewayServiceMainPage()
      .waitPageLoaded()
      .deleteServiceByName(serviceName);
  }

  navigateToGatewayServiceNewPage() {
    this.navigateToGatewayServiceMainPage();
    this.gatewayServiceMainPage.waitPageLoaded().clickNewGatewayService();
    return this.gatewayServiceNewPage;
  }
  /**
 * Verify all invalid and valid parameters for the new gateway service page
 * @param {Object} serviceParameters - Test parameters containing invalid and valid values
 */
  checkNewGatewayServiceParameters(parameterName, serviceParameters) {
    this.navigateToGatewayServiceNewPage();
    switch (parameterName) {
      case 'fullURL':
        this.gatewayServiceNewPage.checkInvalidURLs(serviceParameters.invalidURLs);
        this.gatewayServiceNewPage.checkValidURLs(serviceParameters.validURLs);
        break;
      // case 'port':
      //   this.gatewayServiceNewPage.checkInvalidPorts(serviceParameters.invalidPorts);
      //   break;
      default:
      //
    }
  }

  shouldServicePageHaveService(serviceName) {
    this.navigateToGatewayServiceMainPage();
    this.gatewayServiceMainPage.shouldHaveService(serviceName);
    return this;
  }

  shouldServicePageNotHaveService(serviceName) {
    this.navigateToGatewayServiceMainPage();
    this.gatewayServiceMainPage.shouldNotHaveService(serviceName);
    return this;
  }

  shouldServiceIsEnabled(serviceName) {
    this.navigateToGatewayServiceMainPage();
    this.gatewayServiceMainPage
      .getServiceRowByName(serviceName)
      .find('[data-testid="switch-control"]')
      .should('have.attr', 'aria-checked', 'true')
    return this;
  }

  shouldServiceIsDisabled(serviceName) {
    this.navigateToGatewayServiceMainPage();
    this.gatewayServiceMainPage
      .getServiceRowByName(serviceName)
      .find('[data-testid="switch-control"]')
      .should('have.attr', 'aria-checked', 'false')
    return this;
  }

  swithServiceStatus(serviceName) {
    this.gatewayServiceMainPage
      .getServiceRowByName(serviceName)
      .find('[data-testid="switch-control"]')
      .click({ force: true })
      .invoke('attr', 'aria-checked')
      .then((checkedStatus) => {
        if (checkedStatus === 'true') {
          cy.get('[data-testid^="gateway services-"][data-testid$="-toggle-prompt"]')
            .should('be.visible')
            .should('have.attr', 'aria-label', 'Disable gateway services')
            .find('button[data-testid="modal-action-button"]')
            .should('have.text', 'Yes, disable')
            .scrollIntoView()
            .click();
        } else {
          cy.get('[data-testid^="gateway services-"][data-testid$="-toggle-prompt"]')
            .should('be.visible')
            .should('have.attr', 'aria-label', 'Enable gateway services')
            .find('button[data-testid="modal-action-button"]')
            .should('have.text', 'Yes, enable')
            .scrollIntoView()
            .click();
        }
      })
    return this;
  }

  /**
   * Select manual configuration option
   */
  selectManualConfiguration() {
    this.gatewayServiceNewPage.selectManualConfiguration();
    return this.gatewayServiceNewPage;
  }
}

export { GatewayServiceBusiness };
export const gatewayServiceBusiness = new GatewayServiceBusiness();