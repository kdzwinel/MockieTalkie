'use strict';

angular.module('optionsPage')
  .constant('Config', angular.deepExtend({
    viewsDir: 'views/',
    componentsDir: 'components/',
    statesDir: 'states/',
    environment: 'production', //development or production
  }, angular._localConfig || {}))
  .config(function (componentFactoryProvider) {
    componentFactoryProvider.setViewPath(function (componentSnakeName, componentName) {
      return 'components/' + componentSnakeName + '/' + componentSnakeName + '.html';
    })
  })
  .value('cgBusyTemplateName', 'views/angular-busy/default-spinner.html');
