/**
 * babel-plugin-ember-template-compilation 2.x cannot find the
 * template compiler in ember-source 7.
 *
 * The default install keeps 2.x, because 3.x and later are async
 * and the ESLint babel parser in ember-eslint 0.2 runs babel synchronously.
 */
const emberSevenDependencies = {
  'babel-plugin-ember-template-compilation': '^4.0.1',
};

export default scenarios();

function scenarios() {
  return {
    scenarios: [
      // Failed to import ember-testing
      // {
      //   name: 'ember-3.28',
      //   npm: {
      //     devDependencies: {
      //       'ember-source': 'npm:ember-source@3.28',
      //     },
      //   },
      // },
      // {
      //   name: 'ember-4.12',
      //   npm: {
      //     devDependencies: {
      //       'ember-source': 'npm:ember-source@4.12',
      //     },
      //   },
      // },
      // {
      //   name: 'ember-5.12',
      //   npm: {
      //     devDependencies: {
      //       'ember-source': 'npm:ember-source@5.12',
      //     },
      //   },
      // },
      {
        name: 'ember-latest',
        npm: {
          devDependencies: {
            'ember-source': 'npm:ember-source@latest',
            ...emberSevenDependencies,
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-source': 'npm:ember-source@beta',
            ...emberSevenDependencies,
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-source': 'npm:ember-source@alpha',
            ...emberSevenDependencies,
          },
        },
      },
    ],
  };
}
