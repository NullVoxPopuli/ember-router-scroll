export default scenarios();

function scenarios() {
  return {
    scenarios: [
      {
        name: 'ember-3.28',
        npm: {
          devDependencies: {
            'ember-source': 'npm:ember-source@3.28',
          },
        },
      },
      {
        name: 'ember-4.12',
        npm: {
          devDependencies: {
            'ember-source': 'npm:ember-source@4.12',
          },
        },
      },
      {
        name: 'ember-5.12',
        npm: {
          devDependencies: {
            'ember-source': 'npm:ember-source@5.12',
          },
        },
      },
      {
        name: 'ember-latest',
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
}
