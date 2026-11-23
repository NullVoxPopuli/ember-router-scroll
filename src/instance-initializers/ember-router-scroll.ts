import type ApplicationInstance from "@ember/application/instance";

export function initialize(appInstance: ApplicationInstance): void {
  // Eagerly initialize service
  appInstance.lookup("service:router-scroll");
}

const instanceInitializer: { initialize: typeof initialize } = { initialize };

export default instanceInitializer;
