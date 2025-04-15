import EmberApp from '@ember/application';
import Resolver from 'ember-resolver';
import EmberRouter from '@ember/routing/router';
import Route from '@ember/routing/route';
import Controller from '@ember/controller';

import RouterScrollService from '../src/services/router-scroll';

import ApplicationTemplate from './test-app/application.gjs';
import NextPageTemplate from './test-app/next-page.gjs';
import TargetNextPageTemplate from './test-app/target-next-page.gjs';
import TargetTemplate from './test-app/target.gjs';

class Router extends EmberRouter {
  location = 'none';
  rootURL = '/';
}

class TestApp extends EmberApp {
  modulePrefix = 'test-app';
  Resolver = Resolver.withModules({
    'test-app/router': { default: Router },
    'test-app/routes/index': { default: class extends Route {} },
    'test-app/routes/target-next-page': { default: class extends Route {} },
    'test-app/routes/target': { default: class extends Route {} },
    'test-app/controllers/application': {
      default: class extends Controller {
        queryParams = ['small', 'preserveScrollPosition'];
        small = false;
      },
    },
    'test-app/templates/application': { default: ApplicationTemplate },
    'test-app/templates/target': { default: TargetTemplate },
    'test-app/templates/target-next-page': { default: TargetNextPageTemplate },
    'test-app/templates/next-page': { default: NextPageTemplate },
    'test-app/services/router-scroll': { default: RouterScrollService },
    // add any custom services here
  });
}

Router.map(function () {
  this.route('next-page');
  this.route('target');
  this.route('target-next-page');
});

import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start as qunitStart, setupEmberOnerrorValidation } from 'ember-qunit';

export function start() {
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
