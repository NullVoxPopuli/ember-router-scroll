import { babel } from '@rollup/plugin-babel';
import { Addon } from '@embroider/addon-dev/rollup';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const addon = new Addon({
  srcDir: 'src',
  destDir: 'dist',
});

export default {
  output: addon.output(),

  plugins: [
    addon.publicEntrypoints(['**/*.js', 'index.js']),
    addon.appReexports(['instance-initializers/**/*.js', 'services/**/*.js']),
    addon.dependencies(),
    babel({
      extensions: ['.js', '.gjs', '.ts', '.gts'],
      babelHelpers: 'bundled',
      configFile: resolve(
        dirname(fileURLToPath(import.meta.url)),
        './babel.publish.config.cjs',
      ),
    }),
    addon.clean(),
  ],
};
