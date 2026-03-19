import { RouteMainPage } from "../pages/route_main_page"
import { GatewayServiceBusiness } from "./gateway_service_business"
import { GatewayServiceMainPage } from "../pages/gateway_service_main_page"
import { GatewayServiceDetailPage } from "../pages/gateway_service_detail_page"

class RouteBusiness {
  constructor() {
    this.routeMainPage = new RouteMainPage();
    this.gatewayServiceMainPage = new GatewayServiceMainPage();
    this.gatewayServiceBusiness = new GatewayServiceBusiness();
    this.gatewayServiceDetailPage = new GatewayServiceDetailPage();
  }

  navigateToRouteMainPage() {
    this.routeMainPage
      .navigateToRouteMainPage()
      .waitPageLoaded();
    return this;
  }

  navigateToServiceMainPage() {
    this.gatewayServiceBusiness
      .navigateToGatewayServiceMainPage()
      .waitPageLoaded();
    return this;
  }

  /**
   * @param {Object} routeConfig 
   */
  createRoute(routeConfig) {
    this.navigateToRouteMainPage();
    const routeNewPage = this.routeMainPage.clickNewRoute();
    const routeDetailViewPage = routeNewPage
      .fillName(routeConfig.name)
      .selectService(routeConfig.service)
      .fillPath(routeConfig.path)
      .fillStripPath(routeConfig.stripPath)
      .selectMethod(routeConfig.method)
      .save();
    routeNewPage.verifyRouteCreatedSuccessNotification(routeConfig.name);
    return routeDetailViewPage;
  }
  
  createBasicRoute(routeConfig) {
    this.navigateToRouteMainPage();
    const newRoutePage = this.routeMainPage.clickNewRoute();
    const routeDetailPage = newRoutePage
      .fillName(routeConfig.name)
      .selectBasicOption()
      .selectService(routeConfig.service)
      .fillTags(routeConfig.tags)
      .fillPath(routeConfig.path)
      .selectMethod(routeConfig.method)
      .save();
    newRoutePage.verifyRouteCreatedSuccessNotification(routeConfig.name);
    return routeDetailPage;
  }

  createBasicRouteFromRouteMainPage(routeConfig, serviceName) {
    this.navigateToServiceMainPage();
    const newRoutePage = this.serviceDetailPage.clickNewRoute();
    const routeDetailPage = newRoutePage
      .fillName(routeConfig.name)
      .selectBasicOption()
      .selectService(routeConfig.service)
      .fillTags(routeConfig.tags)
      .fillPath(routeConfig.path)
      .selectMethod(routeConfig.method)
      .save();
    newRoutePage.verifyRouteCreatedSuccessNotification(routeConfig.name);
    return routeDetailPage;
  }
  
  createAdvancedRoute(routeConfig) {
    this.routeMainPage
      .navigateToRouteMainPage()
      .waitPageLoaded();
    const newRoutePage = this.routeMainPage.clickNewRoute();
    const routeDetailPage = newRoutePage
      .fillName(routeConfig.name)
      .selectService(routeConfig.service)
      .fillTags(routeConfig.tags)
      .selectAdvancedOption()
      .selectProtocol(routeConfig.protocol)
      .fillPath(routeConfig.path+"/v1",1)
      .addPath()
      .fillPath(routeConfig.path+"/v2",2)
      .fillHost(routeConfig.host,1)
      .addHost()
      .fillHost(routeConfig.host.replace(".com",".org"),2)
      .save();
    newRoutePage.verifyRouteCreatedSuccessNotification(routeConfig.name);
    return routeDetailPage;
  }

  shouldRoutePageHaveRoute(routeName) {
    this.navigateToRouteMainPage();
    this.routeMainPage.shouldHaveRoute(routeName);
    return this;
  }

  shouldRoutePageNotHaveRoute(routeName) {
    this.navigateToRouteMainPage();
    this.routeMainPage.shouldNotHaveRoute(routeName);
    return this;
  }

  /**
   * @param {string} routeName
   */
  deleteRoute(routeName) {
    this.routeMainPage
      .navigateToRouteMainPage()
      .waitPageLoaded()
      .deleteRouteByName(routeName);
  }
}

export { RouteBusiness };
export const routeBusiness = new RouteBusiness();