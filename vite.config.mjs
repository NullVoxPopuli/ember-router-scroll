import { defineConfig } from "vite";
import { ember } from "@nullvoxpopuli/ember-vite";

/**
 * For scenario testing.
 *
 * Ember before 6.3 builds the tests through the Embroider compat build
 * (see .try.mjs), which needs packages only those scenarios install.
 */
const isCompat = Boolean(process.env.ENABLE_COMPAT_BUILD);

async function compatConfig() {
  // eslint-disable-next-line n/no-missing-import -- installed by compat scenarios only
  const { classicEmberSupport, ember, extensions } = await import("@embroider/vite");
  // eslint-disable-next-line n/no-missing-import -- installed by compat scenarios only
  const { babel } = await import("@rollup/plugin-babel");

  return {
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
  };
}

export default defineConfig(
  isCompat
    ? await compatConfig()
    : {
        plugins: [ember({ babel: { configFile: "./config/test/babel.config.mjs" } })],
      },
);
