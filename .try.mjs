/**
 * Ember before 6.3 is not supported by the default (vite-only) test build,
 * so those scenarios build the tests through the Embroider compat build.
 */
const compatFiles = {
  "ember-cli-build.cjs": `const EmberApp = require("ember-cli/lib/broccoli/ember-app");
const { compatBuild } = require("@embroider/compat");

module.exports = async function (defaults) {
  const { buildOnce } = await import("@embroider/vite");
  let app = new EmberApp(defaults);

  return compatBuild(app, buildOnce);
};
`,
  "config/optional-features.json": JSON.stringify({
    "application-template-wrapper": false,
    "default-async-observers": true,
    "jquery-integration": false,
    "template-only-glimmer-components": true,
    "no-implicit-route-model": true,
  }),
  "vite.config.mjs": `import { defineConfig } from "vite";
import { classicEmberSupport, ember, extensions } from "@embroider/vite";
import { babel } from "@rollup/plugin-babel";

export default defineConfig({
  plugins: [
    classicEmberSupport(),
    ember(),
    babel({
      babelHelpers: "inline",
      extensions,
      configFile: "./config/test/babel.config.mjs",
    }),
  ],
  build: {
    rollupOptions: {
      input: { tests: "tests/index.html" },
    },
  },
});
`,
  "tests/index.html": `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Tests</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <div id="qunit"></div>
    <div id="qunit-fixture">
      <div id="ember-testing-container">
        <div id="ember-testing"></div>
      </div>
    </div>

    <script src="/testem.js" integrity="" data-embroider-ignore></script>
    <script type="module">
      import "ember-testing";
    </script>

    <script type="module">
      import { start } from "./test-helper.ts";
      import.meta.glob("./**/*.{js,ts,gjs,gts}", { eager: true });
      start();
    </script>
  </body>
</html>
`,
};

const compatDependencies = {
  "@embroider/compat": "^4.1.27",
  "@embroider/vite": "^1.7.15",
  "@ember/optional-features": "^2.2.0",
  "@rollup/plugin-babel": "^6.1.0",
  "ember-auto-import": "^2.10.0",
  "ember-cli": "^5.12.0",
};

/**
 * Every LTS from the minimum supported version (4.12) up to the latest LTS,
 * plus the latest, beta and canary channels.
 */
const ltsVersions = ["4.12", "5.4", "5.8", "5.12", "6.4", "6.8", "6.12"];

function lts(version) {
  const [major, minor] = version.split(".").map(Number);
  const needsCompat = major < 6 || (major === 6 && minor < 3);

  return {
    name: `ember-lts-${version}`,
    npm: {
      devDependencies: {
        "ember-source": `npm:ember-source@~${version}.0`,
        ...(needsCompat ? compatDependencies : {}),
      },
    },
    ...(needsCompat ? { files: compatFiles } : {}),
  };
}

function scenarios() {
  return {
    scenarios: [
      ...ltsVersions.map(lts),
      {
        name: "ember-latest",
        npm: {
          devDependencies: {
            "ember-source": "npm:ember-source@latest",
          },
        },
      },
      {
        name: "ember-beta",
        npm: {
          devDependencies: {
            "ember-source": "npm:ember-source@beta",
          },
        },
      },
      {
        name: "ember-canary",
        npm: {
          devDependencies: {
            "ember-source": "npm:ember-source@alpha",
          },
        },
      },
    ],
  };
}

export default scenarios();
