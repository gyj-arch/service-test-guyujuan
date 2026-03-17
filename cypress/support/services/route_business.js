import { RouteMainPage } from "../pages/route_main_page"
import { RouteDetailViewPage } from "../pages/route_detail_page"

class RouteBusiness {
  constructor() {
    this.routeMainPage = new RouteMainPage();
  }

  /**
   * @param {Object} routeConfig 
   */
  createRoute(routeConfig) {
    this.routeMainPage
      .navigateToRouteMainPage()
      .waitPageLoaded();
    const routeNewPage = this.routeMainPage.clickNewRoute();
    const routeDetailViewPage = routeNewPage
      .fillName(routeConfig.name)
      .selectService(routeConfig.service)
      .fillPath(routeConfig.path)
      .selectMethod(routeConfig.method)
      .save();
    routeNewPage.verifyRouteCreatedSuccessNotification(routeConfig.name);
    return routeDetailViewPage;
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