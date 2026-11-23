import RouterService from "@ember/routing/router-service";
//#region src/scheduler.d.ts
declare class Scheduler {
  isIdle: boolean;
}
declare const scheduler: Scheduler;
/**
 * Initializes the top level promise that initiates the post-render work.
 *
 * @public
 * @function beginTransition
 * @return {void}
 */
declare function beginTransition(): void;
/**
 * Initiates the post-render work.
 *
 * @public
 * @function endTransition
 * @return {void}
 */
declare function endTransition(): void;
/**
 * Connects the router's transition events to
 * app scheduler's work.
 *
 * @public
 * @function setupRouter
 * @param {RouterService|Router} router An instance of a RouterService or an Ember Router.
 * @return {void}
 */
declare function setupRouter(router: RouterService): void;
/**
 * Resets the state of app scheduler's top-level scheduled work promise.
 *
 * @public
 * @function reset
 * @return {void}
 */
declare function reset(): void;
/**
 * This promise, when resolved, approximates after content is painted.
 *
 * @public
 * @function whenRouteIdle
 * @return {Promise<any>} The scheduled work promise.
 */
declare function whenRouteIdle(): Promise<any>;
/**
 * Allows for tests to pause until the scheduled work
 * promise is completed.
 *
 * @public
 * @function routeSettled
 * @return {Promise<any>} The scheduled work promise.
 */
declare function routeSettled(): Promise<any>;
//#endregion
export { beginTransition, scheduler as default, endTransition, reset, routeSettled, setupRouter, whenRouteIdle };
//# sourceMappingURL=scheduler.d.ts.map