import Service, { service } from "@ember/service";
import { set, get } from "@ember/object";
import { typeOf } from "@ember/utils";
import { assert } from "@ember/debug";
import { getOwner } from "@ember/application";
import { scheduleOnce } from "@ember/runloop";
import { addListener, removeListener, sendEvent } from "@ember/object/events";
import type Owner from "@ember/owner";
import type EngineInstance from "@ember/engine/instance";
import type RouterService from "@ember/routing/router-service";
import { setupRouter, whenRouteIdle } from "../scheduler.ts";

export interface ScrollPosition {
  x: number;
  y: number;
}

type ScrollMap = Record<string, ScrollPosition>;

interface RouterScrollConfig {
  scrollElement?: string;
  targetElement?: string;
  scrollWhenIdle?: boolean;
  scrollWhenAfterRender?: boolean;
}

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
          preserveScrollPosition?: boolean;
        };
      };
    }[];
  };
}

interface FastBootService {
  get(key: "isFastBoot"): boolean;
}

let ATTEMPTS = 0;
const MAX_ATTEMPTS = 100; // rAF runs every 16ms ideally, so 60x a second

let callbackRequestId: number | undefined;

/**
 * By default, we start checking to see if the document height is >= the last known `y` position
 * we want to scroll to.  This is important for content heavy pages that might try to scrollTo
 * before the content has painted
 */
function tryScrollRecursively(
  fn: (x: number, y: number) => void,
  scrollHash: ScrollPosition,
  element: HTMLElement | null,
  url: string | undefined,
): void {
  let documentHeight: number;
  // read DOM outside of rAF
  if (element) {
    documentHeight = Math.max(element.scrollHeight, element.offsetHeight, element.clientHeight);
  } else {
    const { body, documentElement: html } = document;
    documentHeight = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight,
    );
  }

  callbackRequestId = window.requestAnimationFrame(() => {
    if (url && url.indexOf("#") > -1) {
      const hashElement = document.getElementById(url.split("#").pop() ?? "");
      if (hashElement) {
        scrollHash = { x: hashElement.offsetLeft, y: hashElement.offsetTop };
      }
    }
    // write DOM (scrollTo causes reflow)
    if (documentHeight >= scrollHash.y || ATTEMPTS >= MAX_ATTEMPTS) {
      ATTEMPTS = 0;
      fn.call(null, scrollHash.x, scrollHash.y);
    } else {
      ATTEMPTS++;
      tryScrollRecursively(fn, scrollHash, element, url);
    }
  });
}

// to prevent scheduleOnce calling multiple times, give it the same ref to this function
const CALLBACK = function (this: RouterScroll, transition: ScrollTransition) {
  this.updateScrollPosition(transition);
};

class RouterScroll extends Service {
  @service declare router: RouterService;

  get isFastBoot(): boolean {
    const fastboot = getOwner(this)?.lookup("service:fastboot") as FastBootService | undefined;
    return fastboot ? fastboot.get("isFastBoot") : false;
  }

  key: string | undefined;
  targetElement: string | undefined;
  scrollElement = "window";
  isFirstLoad = true;
  preserveScrollPosition = false;
  // ember-app-scheduler properties
  scrollWhenIdle = false;
  scrollWhenAfterRender = false;

  declare scrollMap: ScrollMap;

  /**
   * Set by tests to stand in for the URL of the current page.
   */
  declare currentURL?: string;

  /**
   * Defined on the prototype below, so that tests can redefine it.
   */
  declare readonly position: ScrollPosition;

  constructor(owner: Owner) {
    super(owner);

    // https://github.com/ember-app-scheduler/ember-app-scheduler/pull/773
    setupRouter(this.router);
  }

  // eslint-disable-next-line ember/classic-decorator-hooks
  init(properties: object | undefined): void {
    super.init(properties);

    this._loadConfig();
    set(this, "scrollMap", {
      default: {
        x: 0,
        y: 0,
      },
    });

    addListener(this.router, "routeWillChange", this, "_routeWillChange");
    addListener(this.router, "routeDidChange", this, "_routeDidChange");
  }

  willDestroy(): void {
    removeListener(this.router, "routeWillChange", this, "_routeWillChange");
    removeListener(this.router, "routeDidChange", this, "_routeDidChange");

    if (callbackRequestId) {
      window.cancelAnimationFrame(callbackRequestId);
    }

    super.willDestroy();
  }

  /**
   * Updates the scroll position
   * it will be a single transition
   */
  updateScrollPosition(transition: ScrollTransition): void {
    if (this.isFirstLoad) {
      this.unsetFirstLoad();
    }

    const scrollPosition = this.position;

    // If `preserveScrollPosition` was not set on the controller, attempt fallback to `preserveScrollPosition` which was set on the router service.
    const preserveScrollPosition =
      (transition.router.currentRouteInfos || []).some(
        (routeInfo) => routeInfo.route.controller.preserveScrollPosition,
      ) || this.preserveScrollPosition;

    if (!preserveScrollPosition) {
      const { scrollElement, targetElement, currentURL } = this;

      if (targetElement || "window" === scrollElement) {
        tryScrollRecursively((x, y) => window.scrollTo(x, y), scrollPosition, null, currentURL);
      } else if ("#" === scrollElement.charAt(0)) {
        const element = document.getElementById(scrollElement.substring(1));

        if (element) {
          const fn = (x: number, y: number) => {
            element.scrollLeft = x;
            element.scrollTop = y;
          };
          tryScrollRecursively(fn, scrollPosition, element, currentURL);
        }
      }
    }

    sendEvent(this, "didScroll", [transition]);
  }

  _routeWillChange(): void {
    if (this.isFastBoot) {
      return;
    }

    this.update();
  }

  _routeDidChange(transition: ScrollTransition): void {
    if (this.isFastBoot) {
      return;
    }

    const scrollWhenIdle = this.scrollWhenIdle;
    const scrollWhenAfterRender = this.scrollWhenAfterRender;

    if (!scrollWhenIdle && !scrollWhenAfterRender) {
      // out of the option, this happens on the tightest schedule
      // eslint-disable-next-line ember/no-runloop
      scheduleOnce("render", this, CALLBACK, transition);
    } else if (scrollWhenAfterRender && !scrollWhenIdle) {
      // out of the option, this happens on the second tightest schedule
      // eslint-disable-next-line ember/no-runloop
      scheduleOnce("afterRender", this, CALLBACK, transition);
    } else {
      void whenRouteIdle().then(() => {
        this.updateScrollPosition(transition);
      });
    }
  }

  unsetFirstLoad(): void {
    set(this, "isFirstLoad", false);
  }

  update(): void {
    if (this.isFastBoot || this.isFirstLoad) {
      return;
    }

    const scrollElement = this.scrollElement;
    const targetElement = this.targetElement;
    const scrollMap = this.scrollMap;
    const key = this.key;
    let x: number | undefined;
    let y: number | undefined;

    if (targetElement) {
      const element = document.querySelector<HTMLElement>(targetElement);
      if (element) {
        x = element.offsetLeft;
        y = element.offsetTop;

        // if we are looking to where to transition to next, we need to set the default to the position
        // of the targetElement on screen
        set(scrollMap, "default", {
          x,
          y,
        });
      }
    } else if ("window" === scrollElement) {
      x = window.scrollX;
      y = window.scrollY;
    } else if ("#" === scrollElement.charAt(0)) {
      const element = document.getElementById(scrollElement.substring(1));

      if (element) {
        x = element.scrollLeft;
        y = element.scrollTop;
      }
    }

    // only a `key` present after first load
    if (key && "number" === typeOf(x) && "number" === typeOf(y)) {
      set(scrollMap, key, {
        x: x as number,
        y: y as number,
      });
    }
  }

  _loadConfig(): void {
    const owner = getOwner(this) as EngineInstance | undefined;
    const config = owner?.resolveRegistration("config:environment") as
      { routerScroll?: RouterScrollConfig } | undefined;

    if (config && config.routerScroll) {
      const scrollElement = config.routerScroll.scrollElement;
      const targetElement = config.routerScroll.targetElement;

      assert(
        "You defined both scrollElement and targetElement in your config. We currently only support definining one of them",
        !(scrollElement && targetElement),
      );

      if ("string" === typeOf(scrollElement)) {
        set(this, "scrollElement", scrollElement as string);
      }

      if ("string" === typeOf(targetElement)) {
        set(this, "targetElement", targetElement);
      }

      const { scrollWhenIdle = false, scrollWhenAfterRender = false } = config.routerScroll;
      set(this, "scrollWhenIdle", scrollWhenIdle);
      set(this, "scrollWhenAfterRender", scrollWhenAfterRender);
    }
  }
}

Object.defineProperty(RouterScroll.prototype, "position", {
  configurable: true,
  get(this: RouterScroll): ScrollPosition {
    const scrollMap = this.scrollMap;
    const stateUuid = (window.history.state as { uuid?: string } | null)?.uuid;

    set(this, "key", stateUuid);
    const key = this.key || "-1";

    return get(scrollMap, key) || (scrollMap.default as ScrollPosition);
  },
});

export default RouterScroll;

declare module "@ember/service" {
  interface Registry {
    "router-scroll": RouterScroll;
  }
}
