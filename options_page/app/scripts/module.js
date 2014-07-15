'use strict';

var components = angular.module('optionsPage.components', []);
angular.componentFactory.moduleDecorator(components);

var app = angular.module('optionsPage', [
//  'kennethlynne.componentFactory',
//  'ngSymbiosis.utils',
  'ngSymbiosis.routeProvider',
  'ngSymbiosis.repository',
  'ngSymbiosis.model',
  'optionsPage.components',
  'ngAnimate',
//  'ajoslin.promise-tracker',
//  'cgBusy',
//  'chieffancypants.loadingBar',
  'ui.router',
  'ui.bootstrap',
  'ui.codemirror'
]);
angular.componentFactory.moduleDecorator(app);