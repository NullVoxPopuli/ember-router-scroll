import EmberObject from "@ember/object";
import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { settled } from "@ember/test-helpers";
import type RouterService from "@ember/routing/router-service";

let scrollTo: typeof window.scrollTo;
let subject: RouterService;

/**
 * `window.scrollTo` has overloads, and the service only calls the `(x, y)` one.
 */
function stubScrollTo(fn: (x: number, y: number) => void) {
  window.scrollTo = fn as typeof window.scrollTo;
}

module("router-scroll", function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    // eslint-disable-next-line @typescript-eslint/unbound-method -- restored as-is in afterEach
    scrollTo = window.scrollTo;
  });

  hooks.afterEach(function () {
    window.scrollTo = scrollTo;
  });

  function getTransitionsMock(URL?: string, isPreserveScroll?: boolean) {
    Object.defineProperty(subject, "currentURL", {
      value: URL || "Hello/World",
    });

    const transition = {
      handler: {
        controller: {
          preserveScrollPosition: isPreserveScroll || false,
        },
      },
      router: {
        currentRouteInfos: [
          {
            route: {
              controller: {
                preserveScrollPosition: isPreserveScroll || false,
              },
            },
          },
        ],
      },
    };

    return transition;
  }

  test("when the application is FastBooted", async function (assert) {
    this.owner.register(
      "service:fastboot",
      class extends EmberObject {
        isFastBoot = true;
      },
    );
    const routerScrollService = this.owner.lookup("service:router-scroll");
    routerScrollService.updateScrollPosition = () => {
      assert.step("updateScrollPosition");
    };

    subject = this.owner.lookup("service:router");
    subject.trigger("routeDidChange");

    await settled();
    assert.verifySteps([], "it should not call updateScrollPosition.");
  });

  test("when the application is not FastBooted", function (assert) {
    const done = assert.async();

    this.owner.register(
      "service:fastboot",
      class extends EmberObject {
        isFastBoot = false;
      },
    );
    const routerScrollService = this.owner.lookup("service:router-scroll");
    routerScrollService.scrollWhenIdle = false;
    routerScrollService.updateScrollPosition = () => {
      assert.step("updateScrollPosition");
      assert.verifySteps(["updateScrollPosition"], "it should call updateScrollPosition.");
      done();
    };

    subject = this.owner.lookup("service:router");
    subject.trigger("routeDidChange");
  });

  test("when the application is not FastBooted with targetElement", function (assert) {
    const done = assert.async();

    this.owner.register(
      "service:fastboot",
      class extends EmberObject {
        isFastBoot = false;
      },
    );
    const routerScrollService = this.owner.lookup("service:router-scroll");
    routerScrollService.targetElement = "#myElement";
    routerScrollService.updateScrollPosition = () => {
      assert.step("updateScrollPosition");
      assert.verifySteps(["updateScrollPosition"], "it should call updateScrollPosition.");
      done();
    };

    subject = this.owner.lookup("service:router");
    subject.trigger("routeDidChange");
  });

  test("when the application is not FastBooted with scrollWhenIdle", function (assert) {
    const done = assert.async();

    this.owner.register(
      "service:fastboot",
      class extends EmberObject {
        isFastBoot = false;
      },
    );
    const routerScrollService = this.owner.lookup("service:router-scroll");
    routerScrollService.scrollWhenIdle = true;
    routerScrollService.updateScrollPosition = () => {
      assert.step("updateScrollPosition");
      assert.verifySteps(["updateScrollPosition"], "it should call updateScrollPosition.");
      done();
    };

    subject = this.owner.lookup("service:router");
    subject.trigger("routeDidChange");
  });

  test("when the application is not FastBooted with scrollWhenAfterRender", function (assert) {
    const done = assert.async();

    this.owner.register(
      "service:fastboot",
      class extends EmberObject {
        isFastBoot = false;
      },
    );
    const routerScrollService = this.owner.lookup("service:router-scroll");
    routerScrollService.scrollWhenAfterRender = true;
    routerScrollService.updateScrollPosition = () => {
      assert.step("updateScrollPosition");
      assert.verifySteps(["updateScrollPosition"], "it should call updateScrollPosition.");
      done();
    };

    subject = this.owner.lookup("service:router");
    subject.trigger("routeDidChange");
  });

  test("Update Scroll Position: Position is preserved", async function (assert) {
    window.scrollTo = () => {
      assert.step("scrollTo");
    };

    this.owner.register(
      "service:fastboot",
      class extends EmberObject {
        isFastBoot = false;
      },
    );
    const routerScrollService = this.owner.lookup("service:router-scroll");
    Object.defineProperty(routerScrollService, "position", {
      get() {
        return { x: 0, y: 0 };
      },
    });
    routerScrollService.scrollElement = "window";

    subject = this.owner.lookup("service:router");
    subject.trigger("routeDidChange", getTransitionsMock("Hello/World", true));
    await settled();

    assert.verifySteps([], "Scroll To should not be called");
  });

  test("Update Scroll Position: Can preserve position using routerService", async function (assert) {
    window.scrollTo = () => {
      assert.step("scrollTo");
    };

    const routerScrollService = this.owner.lookup("service:router-scroll");
    routerScrollService.preserveScrollPosition = true;

    subject = this.owner.lookup("service:router");
    subject.trigger("routeDidChange", getTransitionsMock("Hello/World", true));
    await settled();

    assert.verifySteps([], "Scroll To should not be called");
  });

  test("Update Scroll Position: URL is an anchor", function (assert) {
    const done = assert.async();

    const elem = document.createElement("div");
    elem.id = "World";
    document.body.insertBefore(elem, null);
    stubScrollTo((x, y) => {
      assert.step(`scrollTo ${x} ${y}`);
      assert.verifySteps(
        [`scrollTo ${elem.offsetLeft} ${elem.offsetTop}`],
        "Scroll to called with the offsets of the anchor element",
      );
      done();
    });

    this.owner.register(
      "service:fastboot",
      class extends EmberObject {
        isFastBoot = false;
      },
    );
    const routerScrollService = this.owner.lookup("service:router-scroll");
    routerScrollService.currentURL = "#World";
    Object.defineProperty(routerScrollService, "position", {
      get() {
        return { x: 0, y: 0 };
      },
    });
    routerScrollService.scrollElement = "window";

    subject = this.owner.lookup("service:router");
    subject.trigger("routeDidChange", getTransitionsMock("Hello/#World", false));
  });

  test("Update Scroll Position: URL has nothing after an anchor", function (assert) {
    const done = assert.async();

    stubScrollTo((x, y) => {
      assert.step(`scrollTo ${x} ${y}`);
      assert.verifySteps(["scrollTo 1 2"], "Scroll to called with the service position");
      done();
    });

    this.owner.register(
      "service:fastboot",
      class extends EmberObject {
        isFastBoot = false;
      },
    );
    const routerScrollService = this.owner.lookup("service:router-scroll");
    Object.defineProperty(routerScrollService, "position", {
      value: { x: 1, y: 2 },
    });
    routerScrollService.scrollElement = "window";

    subject = this.owner.lookup("service:router");
    subject.trigger("routeDidChange", getTransitionsMock("Hello/#"));
  });

  test("Update Scroll Position: URL has nonexistent element after anchor", function (assert) {
    const done = assert.async();

    const elem = document.createElement("div");
    elem.id = "World";
    document.body.insertBefore(elem, null);
    stubScrollTo((x, y) => {
      assert.step(`scrollTo ${x} ${y}`);
      assert.verifySteps(["scrollTo 1 2"], "Scroll to called with the service position");
      done();
    });

    this.owner.register(
      "service:fastboot",
      class extends EmberObject {
        isFastBoot = false;
      },
    );
    const routerScrollService = this.owner.lookup("service:router-scroll");
    Object.defineProperty(routerScrollService, "position", {
      value: { x: 1, y: 2 },
    });
    routerScrollService.scrollElement = "window";

    subject = this.owner.lookup("service:router");
    subject.trigger("routeDidChange", getTransitionsMock("Hello/#Bar"));
  });

  test("Update Scroll Position: Scroll Position is set by service", function (assert) {
    const done = assert.async();

    stubScrollTo((x, y) => {
      assert.step(`scrollTo ${x} ${y}`);
      assert.verifySteps(["scrollTo 1 20"], "Scroll to called with the service position");
      done();
    });

    this.owner.register(
      "service:fastboot",
      class extends EmberObject {
        isFastBoot = false;
      },
    );
    const routerScrollService = this.owner.lookup("service:router-scroll");
    Object.defineProperty(routerScrollService, "position", {
      value: { x: 1, y: 20 },
    });
    routerScrollService.scrollElement = "window";

    subject = this.owner.lookup("service:router");
    subject.trigger("routeDidChange", getTransitionsMock("Hello/World"));
  });
});
