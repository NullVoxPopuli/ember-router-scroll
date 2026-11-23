import EmberRouter from "@ember/routing/router";
import Route from "@ember/routing/route";
import Controller from "@ember/controller";
import { resetOnerror, setApplication } from "@ember/test-helpers";
import * as QUnit from "qunit";
import { setup } from "qunit-dom";
import { setupEmberOnerrorValidation, start as qunitStart } from "ember-qunit";
import { dependencySatisfies, macroCondition, setTesting } from "@embroider/macros";
import RouteTemplate from "ember-route-template";
import EmberApp from "ember-strict-application-resolver";

import RouterScrollService from "#src/services/router-scroll.ts";

import ApplicationTemplate from "./test-app/application.gts";
import NextPageTemplate from "./test-app/next-page.gts";
import TargetNextPageTemplate from "./test-app/target-next-page.gts";
import TargetTemplate from "./test-app/target.gts";

import "./styles.css";

// Ember 6.3+ accepts a component as a route template. Older versions need it
// wrapped in a template factory. (Ember 7.5 removed the legacy factory
// fallback that the wrapper produces, so only use it where required.)
const routeTemplate = macroCondition(dependencySatisfies("ember-source", ">=6.3.0"))
  ? <T>(component: T) => component
  : RouteTemplate;

class Router extends EmberRouter {
  location = "none";
  rootURL = "/";
}

Router.map(function () {
  this.route("next-page");
  this.route("target");
  this.route("target-next-page");
});

class ApplicationController extends Controller {
  queryParams = ["small", "preserveScrollPosition"];
  small = false;
}

class TestApp extends EmberApp {
  modules = {
    "./router": Router,
    "./routes/index": class extends Route {},
    "./routes/target-next-page": class extends Route {},
    "./routes/target": class extends Route {},
    "./controllers/application": ApplicationController,
    "./templates/application": routeTemplate(ApplicationTemplate),
    "./templates/target": routeTemplate(TargetTemplate),
    "./templates/target-next-page": routeTemplate(TargetNextPageTemplate),
    "./templates/next-page": routeTemplate(NextPageTemplate),
    "./services/router-scroll": RouterScrollService,
  };
}

export function start() {
  setTesting(true);
  setApplication(
    TestApp.create({
      autoboot: false,
      rootElement: "#ember-testing",
    }),
  );
  setup(QUnit.assert);
  setupEmberOnerrorValidation();

  QUnit.testDone(resetOnerror);

  qunitStart();
}
