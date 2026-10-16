import { defineConfig } from "vite";
import { ember } from "@nullvoxpopuli/ember-vite";

export default defineConfig({
  plugins: [ember({ babel: { configFile: "./config/test/babel.config.js" } })],
});
