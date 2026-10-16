// When building your addon for older Ember versions you need to have the required files
const compatFiles = {
  'ember-cli-build.cjs': `const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const { compatBuild } = require('@embroider/compat');
module.exports = async function (defaults) {
  const { buildOnce } = await import('@embroider/vite');
  let app = new EmberApp(defaults);
  return compatBuild(app, buildOnce);
};`,
  'config/optional-features.json': JSON.stringify({
    'application-template-wrapper': false,
    'default-async-observers': true,
    'jquery-integration': false,
    'template-only-glimmer-components': true,
    'no-implicit-route-model': true,
  }),
};

const compatDeps = {
  '@embroider/compat': '^4.0.3',
  'ember-cli': '^5.12.0',
  'ember-auto-import': '^2.10.0',
  '@ember/optional-features': '^2.2.0',
};

/**
 * Every LTS from the minimum supported version (4.12) up to the latest LTS,
 * plus the release, beta and canary channels.
 *
 * Versions before 6.3 can't use the vite build natively, so they go through
 * the Embroider compat build.
 */
const ltsVersions = ['4.12', '5.4', '5.8', '5.12', '6.4', '6.8', '6.12'];

function lts(version) {
  const [major, minor] = version.split('.').map(Number);
  const needsCompat = major < 6 || (major === 6 && minor < 3);

  return {
    name: `ember-lts-${version}`,
    npm: {
      devDependencies: {
        'ember-source': `npm:ember-source@~${version}.0`,
        ...(needsCompat ? compatDeps : {}),
      },
    },
    ...(needsCompat
      ? { env: { ENABLE_COMPAT_BUILD: true }, files: compatFiles }
      : {}),
  };
}

export default {
  scenarios: [
    ...ltsVersions.map(lts),
    {
      name: 'ember-release',
      npm: {
        devDependencies: {
          'ember-source': 'npm:ember-source@latest',
        },
      },
    },
    {
      name: 'ember-beta',
      npm: {
        devDependencies: {
          'ember-source': 'npm:ember-source@beta',
        },
      },
    },
    {
      name: 'ember-canary',
      npm: {
        devDependencies: {
          'ember-source': 'npm:ember-source@alpha',
        },
      },
    },
  ],
};
