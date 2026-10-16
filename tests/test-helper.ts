/// <reference types="vite/client" />
import EmberRouter from "@ember/routing/router";
import Route from "@ember/routing/route";
import Controller from "@ember/controller";
import { resetOnerror, setApplication } from "@ember/test-helpers";
import * as QUnit from "qunit";
import { setup } from "qunit-dom";
import { setupEmberOnerrorValidation, start as qunitStart } from "ember-qunit";
import { setTesting } from "@embroider/macros";
import EmberApp from "@ember/application";

import RouterScrollService from "#src/services/router-scroll.ts";

import ApplicationTemplate from "./test-app/application.gts";
import NextPageTemplate from "./test-app/next-page.gts";
import TargetNextPageTemplate from "./test-app/target-next-page.gts";
import TargetTemplate from "./test-app/target.gts";

import "./styles.css";

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
    "./templates/application": ApplicationTemplate,
    "./templates/target": TargetTemplate,
    "./templates/target-next-page": TargetNextPageTemplate,
    "./templates/next-page": NextPageTemplate,
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
