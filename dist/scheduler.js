import { registerDestructor } from "@ember/destroyable";
import { addListener } from "@ember/object/events";
import { schedule } from "@ember/runloop";
import { buildWaiter } from "@ember/test-waiters";
import { tracked } from "@glimmer/tracking";
import { g, i } from "decorator-transforms/runtime-esm";
//#region src/scheduler.ts
/**
* Since ember-app-scheduler is just one file,
* and a v1 addon,
* I've copied the contents here so we don't have to deal
* with another v1 addon.
*
* If the addon is converted to v2,
* or if we, through framework feature implementation,
* no longer need this stuff here, we can migrate to those external things and delete this file.
*
*/
const APP_SCHEDULER_HAS_SETUP = "__APP_SCHEDULER_HAS_SETUP__";
let _whenRouteDidChange;
let _whenRouteIdle;
const IS_FASTBOOT = typeof window.FastBoot !== "undefined";
const waiter = buildWaiter("ember-app-scheduler-waiter");
reset();
var Scheduler = class {
	static {
		g(this.prototype, "isIdle", [tracked], function() {
			return false;
		});
	}
	#isIdle = (i(this, "isIdle"), void 0);
};
const scheduler = new Scheduler();
/**
* Initializes the top level promise that initiates the post-render work.
*
* @public
* @function beginTransition
* @return {void}
*/
function beginTransition() {
	if (_whenRouteDidChange.isResolved) {
		_whenRouteDidChange = _defer();
		_whenRouteIdle = _whenRouteDidChange.promise.then(() => {
			const scheduledWorkToken = waiter.beginAsync();
			return new Promise((resolve) => {
				schedule("afterRender", null, () => {
					requestAnimationFrame(() => {
						requestAnimationFrame(resolve);
					});
				});
			}).finally(() => {
				waiter.endAsync(scheduledWorkToken);
				mark("appSchedulerEnd");
				measure("appScheduler", "appSchedulerStart", "appSchedulerEnd");
				scheduler.isIdle = true;
			});
		});
		scheduler.isIdle = false;
	}
}
/**
* Initiates the post-render work.
*
* @public
* @function endTransition
* @return {void}
*/
function endTransition() {
	_whenRouteDidChange.resolve();
	mark("appSchedulerStart");
}
/**
* Connects the router's transition events to
* app scheduler's work.
*
* @public
* @function setupRouter
* @param {RouterService|Router} router An instance of a RouterService or an Ember Router.
* @return {void}
*/
function setupRouter(router) {
	if (IS_FASTBOOT || router[APP_SCHEDULER_HAS_SETUP]) return;
	router[APP_SCHEDULER_HAS_SETUP] = true;
	addListener(router, "routeWillChange", beginTransition);
	addListener(router, "routeDidChange", endTransition);
	registerDestructor(router, reset);
}
/**
* Resets the state of app scheduler's top-level scheduled work promise.
*
* @public
* @function reset
* @return {void}
*/
function reset() {
	_whenRouteDidChange = _defer();
	_whenRouteIdle = _whenRouteDidChange.promise.then();
	waiter.reset();
	if (!IS_FASTBOOT) _whenRouteDidChange.resolve();
}
/**
* This promise, when resolved, approximates after content is painted.
*
* @public
* @function whenRouteIdle
* @return {Promise<any>} The scheduled work promise.
*/
function whenRouteIdle() {
	return _whenRouteIdle;
}
/**
* Allows for tests to pause until the scheduled work
* promise is completed.
*
* @public
* @function routeSettled
* @return {Promise<any>} The scheduled work promise.
*/
function routeSettled() {
	return _whenRouteIdle;
}
function _defer() {
	let _isResolved = false;
	let _resolve;
	let _reject;
	return {
		promise: new Promise((resolve, reject) => {
			_resolve = () => {
				_isResolved = true;
				resolve();
			};
			_reject = reject;
		}),
		resolve: _resolve,
		reject: _reject,
		get isResolved() {
			return _isResolved;
		}
	};
}
function mark(markName) {
	try {
		performance.mark(markName);
	} catch (ex) {
		console.warn(`performance.mark could not be executed because of ${ex.message}`);
	}
}
function measure(measureName, startMark, endMark) {
	try {
		performance.measure(measureName, startMark, endMark);
	} catch (ex) {
		console.warn(`performance.mark could not be executed because of ${ex.message}`, `performance.measure could not be executed because of ${ex.message}`);
	}
}
//#endregion
export { beginTransition, scheduler as default, endTransition, reset, routeSettled, setupRouter, whenRouteIdle };

//# sourceMappingURL=scheduler.js.map