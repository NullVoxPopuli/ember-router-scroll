/**
 * This tries to follow what the official blueprints are doing more closely
 * but in a way that abstracts the dependencies and configuration
 * out of your project.
 *
 * Handles: (G)TS + (G)JS, QUnit, Supporting Node files
 */
import { ember } from "ember-eslint";

export default [
  ...ember.recommended(import.meta.dirname),
  // your modifications here
  // see: https://eslint.org/docs/user-guide/configuring/configuration-files#how-do-overrides-work
];
