import Service from "@ember/service";
import Owner from "@ember/owner";
import RouterService from "@ember/routing/router-service";
//#region src/services/router-scroll.d.ts
interface ScrollPosition {
  x: number;
  y: number;
}
type ScrollMap = Record<string, ScrollPosition>;
/**
 * The parts of a router transition that this service reads.
 *
 * `router` is the internal router of the transition,
 * which the public `Transition` type does not have.
 */
interface ScrollTransition {
  router: {
    currentRouteInfos?: {
      route: {
        controller: {
          preserveScrollPosition?: unknown;
        };
      };
    }[];
  };
}
declare class RouterScroll extends Service {
  router: RouterService;
  get isFastBoot(): boolean;
  key: string | undefined;
  targetElement: string | undefined;
  scrollElement: string;
  isFirstLoad: boolean;
  preserveScrollPosition: boolean;
  scrollWhenIdle: boolean;
  scrollWhenAfterRender: boolean;
  scrollMap: ScrollMap;
  /**
   * Set by tests to stand in for the URL of the current page.
   */
  currentURL?: string;
  /**
   * Defined on the prototype below, so that tests can redefine it.
   */
  readonly position: ScrollPosition;
  constructor(owner: Owner);
  init(properties: object | undefined): void;
  willDestroy(): void;
  /**
   * Updates the scroll position
   * it will be a single transition
   */
  updateScrollPosition(transition: ScrollTransition): void;
  _routeWillChange(): void;
  _routeDidChange(transition: ScrollTransition): void;
  unsetFirstLoad(): void;
  update(): void;
  _loadConfig(): void;
}
declare module "@ember/service" {
  interface Registry {
    "router-scroll": RouterScroll;
  }
}
//#endregion
export { ScrollPosition, RouterScroll as default };
//# sourceMappingURL=router-scroll.d.ts.map