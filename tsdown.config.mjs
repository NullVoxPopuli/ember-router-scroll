import { defineConfig } from "tsdown";
import { ember } from "@nullvoxpopuli/ember-rolldown";
import { appReexports } from "@nullvoxpopuli/ember-rolldown/app-reexports";
export default defineConfig({
  entry: ["./src/**/*.{js,ts,gjs,gts}", "!./src/**/*.d.ts", "!./src/**/*-test.{js,ts,gjs,gts}"],
  plugins: [ember(), appReexports(["instance-initializers/**/*.js", "services/**/*.js"])],
  tsconfig: "./config/tsconfig.publish.json",
});
