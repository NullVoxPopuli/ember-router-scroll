import { module, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";
import { visit, click, currentURL } from "@ember/test-helpers";
import type EngineInstance from "@ember/engine/instance";

function byId(id: string): HTMLElement {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Could not find #${id}`);
  }

  return element;
}

module("Acceptance | basic functionality", function (hooks) {
  setupApplicationTest(hooks);

  let config: { routerScroll?: Record<string, string> };
  hooks.beforeEach(function () {
    const owner = this.owner as typeof this.owner & Pick<EngineInstance, "resolveRegistration">;
    config = (owner.resolveRegistration("config:environment") as typeof config | undefined) || {};

    byId("ember-testing-container").scrollTop = 0;
  });

  hooks.afterEach(function () {
    config["routerScroll"] = {};
  });

  test("The application should work when loading a page and clicking a link", async function (assert) {
    config["routerScroll"] = {
      scrollElement: "#ember-testing-container",
    };

    await visit("/");

    // testing specific
    const container = byId("ember-testing-container");
    assert.strictEqual(container.scrollTop, 0, "starts at the top of the page");

    byId("monster").scrollIntoView(false);
    assert.ok(container.scrollTop > 0, "has scrolled a smidge");

    await click('a[href="/next-page"]');
    assert.strictEqual(currentURL(), "/next-page");
  });

  test("The application should work when loading a page and clicking a link to target an element to scroll to", async function (assert) {
    config["routerScroll"] = {
      scrollElement: "#target-main",
    };

    await visit("/target");

    // testing specific
    const container = byId("ember-testing-container");
    assert.strictEqual(container.scrollTop, 0);

    byId("monster").scrollIntoView(false);
    assert.ok(container.scrollTop > 0);

    await click('a[href="/target-next-page"]');
    assert.strictEqual(currentURL(), "/target-next-page");
  });

  test("The application should work when just changing query params", async function (assert) {
    config["routerScroll"] = {
      scrollElement: "#ember-testing-container",
    };

    await visit("/");

    const container = byId("ember-testing-container");
    assert.strictEqual(container.scrollTop, 0);

    byId("monster").scrollIntoView(false);
    assert.ok(container.scrollTop > 0);

    await click("#change-size");
    assert.ok(container.scrollTop > 0);
  });
});
