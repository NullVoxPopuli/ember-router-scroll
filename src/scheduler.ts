/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
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

import { registerDestructor } from '@ember/destroyable';
import { addListener } from '@ember/object/events';
import type RouterService from '@ember/routing/router-service';
import { schedule } from '@ember/runloop';
import { buildWaiter, type Token } from '@ember/test-waiters';
import { tracked } from '@glimmer/tracking';

interface Deferred {
  isResolved: boolean;
  promise: Promise<any>;
  resolve: Function;
  reject: Function;
}

const APP_SCHEDULER_HAS_SETUP: string = '__APP_SCHEDULER_HAS_SETUP__';

let _whenRouteDidChange: Deferred;
let _whenRouteIdle: Promise<unknown>;

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const IS_FASTBOOT = typeof (<any>window).FastBoot !== 'undefined';
const waiter = buildWaiter('ember-app-scheduler-waiter');

reset();

class Scheduler {
  @tracked isIdle = false;
}
const scheduler = new Scheduler();
export default scheduler;

/**
 * Initializes the top level promise that initiates the post-render work.
 *
 * @public
 * @function beginTransition
 * @return {void}
 */
export function beginTransition(): void {
  if (_whenRouteDidChange.isResolved) {
    _whenRouteDidChange = _defer();
    _whenRouteIdle = _whenRouteDidChange.promise.then(() => {
      const scheduledWorkToken: Token = waiter.beginAsync();

      return new Promise((resolve) => {
        // eslint-disable-next-line ember/no-runloop
        schedule('afterRender', null, () => {
          requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
          });
        });
      }).finally(() => {
        waiter.endAsync(scheduledWorkToken);
        mark('appSchedulerEnd');
        measure('appScheduler', 'appSchedulerStart', 'appSchedulerEnd');
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
export function endTransition(): void {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  _whenRouteDidChange.resolve();
  mark('appSchedulerStart');
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
export function setupRouter(router: RouterService): void {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (IS_FASTBOOT || (router as any)[APP_SCHEDULER_HAS_SETUP]) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (router as any)[APP_SCHEDULER_HAS_SETUP] = true;

  addListener(router, 'routeWillChange', beginTransition);
  addListener(router, 'routeDidChange', endTransition);

  registerDestructor(router, reset);
}

/**
 * Resets the state of app scheduler's top-level scheduled work promise.
 *
 * @public
 * @function reset
 * @return {void}
 */
export function reset(): void {
  _whenRouteDidChange = _defer();
  _whenRouteIdle = _whenRouteDidChange.promise.then();

  waiter.reset();

  if (!IS_FASTBOOT) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    _whenRouteDidChange.resolve();
  }
}

/**
 * This promise, when resolved, approximates after content is painted.
 *
 * @public
 * @function whenRouteIdle
 * @return {Promise<any>} The scheduled work promise.
 */
export function whenRouteIdle(): Promise<any> {
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
export function routeSettled(): Promise<any> {
  return _whenRouteIdle;
}

function _defer(): Deferred {
  let _isResolved = false;
  let _resolve!: () => void;
  let _reject!: () => void;

  const promise = new Promise<void>((resolve, reject) => {
    _resolve = () => {
      _isResolved = true;

      resolve();
    };
    _reject = reject;
  });

  return {
    promise,
    resolve: _resolve,
    reject: _reject,
    get isResolved() {
      return _isResolved;
    },
  };
}

function mark(markName: string): void {
  try {
    performance.mark(markName);
  } catch (ex) {
    console.warn(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      `performance.mark could not be executed because of ${ex.message}`,
    );
  }
}

function measure(
  measureName: string,
  startMark: string | undefined,
  endMark: string | undefined,
) {
  try {
    performance.measure(measureName, startMark, endMark);
  } catch (ex) {
    console.warn(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      `performance.mark could not be executed because of ${ex.message}`,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      `performance.measure could not be executed because of ${ex.message}`,
    );
  }
}
