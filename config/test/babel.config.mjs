import { buildMacros } from "@embroider/macros/babel";

/**
 * For scenario testing.
 *
 * The compat build (Ember before 6.3, see .try.mjs) needs Embroider's compat
 * support. Among other things, it replaces the DEBUG flag that older
 * ember-source imports from @glimmer/env.
 */
const isCompat = Boolean(process.env.ENABLE_COMPAT_BUILD);

async function compatTransforms() {
  // eslint-disable-next-line n/no-missing-import -- installed by compat scenarios only
  const { babelCompatSupport, templateCompatSupport } = await import("@embroider/compat/babel");

  return {
    templateTransforms: templateCompatSupport(),
    babelPlugins: babelCompatSupport(),
  };
}

function macroTransforms() {
  const macros = buildMacros({
    configure(config) {
      if (process.env.EMBER_ENV === "test") {
        config.enableRuntimeMode();
      }
    },
  });

  return {
    templateTransforms: macros.templateMacros,
    babelPlugins: macros.babelMacros,
  };
}

const { templateTransforms, babelPlugins } = isCompat
  ? await compatTransforms()
  : macroTransforms();

export default {
  plugins: [
    [
      "@babel/plugin-transform-typescript",
      {
        allExtensions: true,
        onlyRemoveTypeImports: true,
        allowDeclareFields: true,
      },
    ],
    [
      "babel-plugin-ember-template-compilation",
      {
        transforms: [...templateTransforms],
      },
    ],
    [
      "module:decorator-transforms",
      {
        runtime: {
          import: import.meta.resolve("decorator-transforms/runtime-esm"),
        },
      },
    ],
    ...babelPlugins,
  ],

  generatorOpts: {
    compact: false,
  },
};
