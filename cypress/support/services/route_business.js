import { RouteMainPage } from "../pages/route_main_page"
import { GatewayServiceBusiness } from "./gateway_service_business"
import { GatewayServiceDetailPage } from "../pages/gateway_service_detail_page"
import { RouteNewPage } from "../pages/route_new_page"
import { RouteDetailPage } from "../pages/route_detail_page"

class RouteBusiness {
  constructor() {
    this.routeMainPage = new RouteMainPage();
    this.gatewayServiceBusiness = new GatewayServiceBusiness();
    this.routeDetailPage = new RouteDetailPage();
    this.routeNewPage = new RouteNewPage();
  }

  navigateToRouteMainPage() {
    this.routeMainPage
      .navigateToRouteMainPage()
      .waitPageLoaded();
    return this;
  }

  navigateToServiceMainPage() {
    return this.gatewayServiceBusiness
      .navigateToGatewayServiceMainPage()
      .waitPageLoaded();
  }

  createBasicRouteFromRouteMainPage(routeConfig, serviceName) {
    const routeMainPage = this.navigateToRouteMainPage();;
    const routeNewPage = this.routeMainPage.clickNewRoute();
    const routeDetailPage = routeNewPage
      .fillName(routeConfig.name)
      .selectBasicOption()
      .selectService(routeConfig.service)
      .fillTags(routeConfig.tags)
      .fillPath(routeConfig.path)
      .selectMethod(routeConfig.method)
      .save();
    routeNewPage.verifyRouteCreatedSuccessNotification(routeConfig.name);
    return routeDetailPage;
  }
  
  createAdvancedRouteFromRouteMainPage(routeConfig) {
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
      .fillPath(routeConfig.path1,1)
      .addPath()
      .fillPath(routeConfig.path2,2)
      .fillHost(routeConfig.host1,1)
      .addHost()
      .fillHost(routeConfig.host2,2)
      .save();
    newRoutePage.verifyRouteCreatedSuccessNotification(routeConfig.name);
    return routeDetailPage;
  }

  createBasicRouteFromServiceDetailPage(routeConfig) {
    const newRoutePage = new RouteNewPage();
    const routeDetailPage = newRoutePage
      .fillName(routeConfig.name)
      .selectBasicOption()
      .fillTags(routeConfig.tags)
      .fillPath(routeConfig.path)
      .selectMethod(routeConfig.method)
      .save();
    newRoutePage.verifyRouteCreatedSuccessNotification(routeConfig.name);
    return new GatewayServiceDetailPage();
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