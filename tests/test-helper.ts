import EmberApp from 'ember-strict-application-resolver';
import EmberRouter from '@ember/routing/router';
import Route from '@ember/routing/route';
import Controller from '@ember/controller';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start as qunitStart, setupEmberOnerrorValidation } from 'ember-qunit';
import { setTesting } from '@embroider/macros';
import RouteTemplate from 'ember-route-template';

import RouterScrollService from '../src/services/router-scroll.js';

import ApplicationTemplate from './test-app/application.gts';
import NextPageTemplate from './test-app/next-page.gts';
import TargetNextPageTemplate from './test-app/target-next-page.gts';
import TargetTemplate from './test-app/target.gts';

class Router extends EmberRouter {
  location = 'none';
  rootURL = '/';
}

class TestApp extends EmberApp {
  modules = {
    './router': Router,
    './routes/index': class extends Route {},
    './routes/target-next-page': class extends Route {},
    './routes/target': class extends Route {},
    './controllers/application': class extends Controller {
      queryParams = ['small', 'preserveScrollPosition'];
      small = false;
    },
    './templates/application': RouteTemplate(ApplicationTemplate),
    './templates/target': RouteTemplate(TargetTemplate),
    './templates/target-next-page': RouteTemplate(TargetNextPageTemplate),
    './templates/next-page': RouteTemplate(NextPageTemplate),
    './services/router-scroll': RouterScrollService,
  };
}

Router.map(function () {
  this.route('next-page');
  this.route('target');
  this.route('target-next-page');
});

export function start() {
  setTesting(true);
  setApplication(
    TestApp.create({
      autoboot: false,
      rootElement: '#ember-testing',
    }),
  );
  setup(QUnit.assert);
  setupEmberOnerrorValidation();
  qunitStart();
}
