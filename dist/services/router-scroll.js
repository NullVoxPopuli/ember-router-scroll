import { setupRouter, whenRouteIdle } from "../scheduler.js";
import { addListener, removeListener, sendEvent } from "@ember/object/events";
import { scheduleOnce } from "@ember/runloop";
import { g, i } from "decorator-transforms/runtime-esm";
import Service, { service } from "@ember/service";
import { get, set } from "@ember/object";
import { typeOf } from "@ember/utils";
import { assert } from "@ember/debug";
import { getOwner } from "@ember/owner";
//#region src/services/router-scroll.ts
/**
* The parts of a router transition that this service reads.
*
* `router` is the internal router of the transition,
* which the public `Transition` type does not have.
*/
let ATTEMPTS = 0;
const MAX_ATTEMPTS = 100;
let callbackRequestId;
/**
* By default, we start checking to see if the document height is >= the last known `y` position
* we want to scroll to.  This is important for content heavy pages that might try to scrollTo
* before the content has painted
*/
function tryScrollRecursively(fn, scrollHash, element, url) {
	let documentHeight;
	if (element) documentHeight = Math.max(element.scrollHeight, element.offsetHeight, element.clientHeight);
	else {
		const { body, documentElement: html } = document;
		documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
	}
	callbackRequestId = window.requestAnimationFrame(() => {
		if (url && url.indexOf("#") > -1) {
			const hashElement = document.getElementById(url.split("#").pop() ?? "");
			if (hashElement) scrollHash = {
				x: hashElement.offsetLeft,
				y: hashElement.offsetTop
			};
		}
		if (documentHeight >= scrollHash.y || ATTEMPTS >= MAX_ATTEMPTS) {
			ATTEMPTS = 0;
			fn.call(null, scrollHash.x, scrollHash.y);
		} else {
			ATTEMPTS++;
			tryScrollRecursively(fn, scrollHash, element, url);
		}
	});
}
const CALLBACK = function(transition) {
	this.updateScrollPosition(transition);
};
var RouterScroll = class extends Service {
	static {
		g(this.prototype, "router", [service]);
	}
	#router = (i(this, "router"), void 0);
	get isFastBoot() {
		const fastboot = getOwner(this)?.lookup("service:fastboot");
		return fastboot ? fastboot.get("isFastBoot") : false;
	}
	key;
	targetElement;
	scrollElement = "window";
	isFirstLoad = true;
	preserveScrollPosition = false;
	#scrollWhenIdle = false;
	scrollWhenAfterRender = false;
	get scrollWhenIdle() {
		return this.#scrollWhenIdle;
	}
	set scrollWhenIdle(value) {
		this.#scrollWhenIdle = value;
		if (value) setupRouter(this.router);
	}
	/**
	* Set by tests to stand in for the URL of the current page.
	*/
	/**
	* Defined on the prototype below, so that tests can redefine it.
	*/
	init(properties) {
		super.init(properties);
		this._loadConfig();
		set(this, "scrollMap", { default: {
			x: 0,
			y: 0
		} });
		addListener(this.router, "routeWillChange", this, "_routeWillChange");
		addListener(this.router, "routeDidChange", this, "_routeDidChange");
	}
	willDestroy() {
		removeListener(this.router, "routeWillChange", this, "_routeWillChange");
		removeListener(this.router, "routeDidChange", this, "_routeDidChange");
		if (callbackRequestId) window.cancelAnimationFrame(callbackRequestId);
		super.willDestroy();
	}
	/**
	* Updates the scroll position
	* it will be a single transition
	*/
	updateScrollPosition(transition) {
		if (this.isFirstLoad) this.unsetFirstLoad();
		const scrollPosition = this.position;
		/**
		* Route infos go from parent to child,
		* so the most deeply nested controller that sets a boolean wins.
		* A child can set `false` to scroll when its parent preserves.
		*
		* `true` on the router service still preserves for every route.
		*/
		let preserveScrollPosition = false;
		for (const routeInfo of transition.router.currentRouteInfos || []) {
			const value = routeInfo.route.controller.preserveScrollPosition;
			if (typeof value === "boolean") preserveScrollPosition = value;
		}
		preserveScrollPosition ||= this.preserveScrollPosition;
		if (!preserveScrollPosition) {
			const { scrollElement, targetElement, currentURL } = this;
			if (targetElement || "window" === scrollElement) tryScrollRecursively((x, y) => window.scrollTo(x, y), scrollPosition, null, currentURL);
			else if ("#" === scrollElement.charAt(0)) {
				const element = document.getElementById(scrollElement.substring(1));
				if (element) {
					const fn = (x, y) => {
						element.scrollLeft = x;
						element.scrollTop = y;
					};
					tryScrollRecursively(fn, scrollPosition, element, currentURL);
				}
			}
		}
		sendEvent(this, "didScroll", [transition]);
	}
	_routeWillChange() {
		if (this.isFastBoot) return;
		this.update();
	}
	_routeDidChange(transition) {
		if (this.isFastBoot) return;
		const scrollWhenIdle = this.scrollWhenIdle;
		const scrollWhenAfterRender = this.scrollWhenAfterRender;
		if (!scrollWhenIdle && !scrollWhenAfterRender) scheduleOnce("render", this, CALLBACK, transition);
		else if (scrollWhenAfterRender && !scrollWhenIdle) scheduleOnce("afterRender", this, CALLBACK, transition);
		else whenRouteIdle().then(() => {
			this.updateScrollPosition(transition);
		});
	}
	unsetFirstLoad() {
		set(this, "isFirstLoad", false);
	}
	update() {
		if (this.isFastBoot || this.isFirstLoad) return;
		const scrollElement = this.scrollElement;
		const targetElement = this.targetElement;
		const scrollMap = this.scrollMap;
		const key = this.key;
		let x;
		let y;
		if (targetElement) {
			const element = document.querySelector(targetElement);
			if (element) {
				x = element.offsetLeft;
				y = element.offsetTop;
				set(scrollMap, "default", {
					x,
					y
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
		if (key && "number" === typeOf(x) && "number" === typeOf(y)) set(scrollMap, key, {
			x,
			y
		});
	}
	_loadConfig() {
		const config = getOwner(this)?.resolveRegistration("config:environment");
		if (config && config.routerScroll) {
			const scrollElement = config.routerScroll.scrollElement;
			const targetElement = config.routerScroll.targetElement;
			assert("You defined both scrollElement and targetElement in your config. We currently only support definining one of them", !(scrollElement && targetElement));
			if ("string" === typeOf(scrollElement)) set(this, "scrollElement", scrollElement);
			if ("string" === typeOf(targetElement)) set(this, "targetElement", targetElement);
			const { scrollWhenIdle = false, scrollWhenAfterRender = false } = config.routerScroll;
			set(this, "scrollWhenIdle", scrollWhenIdle);
			set(this, "scrollWhenAfterRender", scrollWhenAfterRender);
		}
	}
};
Object.defineProperty(RouterScroll.prototype, "position", {
	configurable: true,
	get() {
		const scrollMap = this.scrollMap;
		const stateUuid = window.history.state?.uuid;
		set(this, "key", stateUuid);
		const key = this.key || "-1";
		return get(scrollMap, key) || scrollMap.default;
	}
});
//#endregion
export { RouterScroll as default };

//# sourceMappingURL=router-scroll.js.map