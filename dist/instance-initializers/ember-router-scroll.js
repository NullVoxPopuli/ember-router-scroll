function initialize(appInstance) {
  // Eagerly initialize service
  appInstance.lookup('service:router-scroll');
}
var emberRouterScroll = {
  initialize
};

export { emberRouterScroll as default, initialize };
//# sourceMappingURL=ember-router-scroll.js.map
