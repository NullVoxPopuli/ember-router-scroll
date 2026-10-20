/**
 * Every LTS from the minimum supported version (4.12) up to the latest LTS,
 * plus the latest, beta and canary channels.
 */
const ltsVersions = ["4.12", "5.4", "5.8", "5.12", "6.4", "6.8", "6.12"];

function lts(version) {
  return {
    name: `ember-lts-${version}`,
    npm: {
      devDependencies: {
        "ember-source": `npm:ember-source@~${version}.0`,
      },
    },
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
