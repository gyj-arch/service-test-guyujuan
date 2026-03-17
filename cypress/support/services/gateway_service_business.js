import { GatewayServiceMainPage } from "../pages/gateway_service_main_page"
import { GatewayServiceDetailPage } from "../pages/gateway_service_detail_page"

class GatewayServiceBusiness {
  constructor() {
    this.gatewayServiceMainPage = new GatewayServiceMainPage();
  }

  /**
   * @param {Object} serviceConfig）
   */
  createGatewayService(serviceConfig) {
    this.gatewayServiceMainPage
      .navigateToGatewayServiceMainPage()
      .waitPageLoaded();
    const newGatewayServicePage = this.gatewayServiceMainPage.clickNewGatewayService();
    const gatewayServiceDetailPage = newGatewayServicePage
      .fillFullURL(serviceConfig.url)
      .fillName(serviceConfig.name)
      .save()
    newGatewayServicePage.verifyServiceCreatedSuccessNotification(serviceConfig.name);
    return gatewayServiceDetailPage;
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
}

export { GatewayServiceBusiness };
export const gatewayServiceBusiness = new GatewayServiceBusiness();