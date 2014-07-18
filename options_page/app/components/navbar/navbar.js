'use strict';

angular.module('optionsPage.components')
  .controller('navbarComponentCtrl', function ($scope) {
    $scope.inMocks = true;

    $scope.$on('$stateChangeSuccess', function(event, toState) {
      var controllers = ['IndexCtrl', 'MockCtrl', 'DomainCtrl'];
      $scope.inMocks = (controllers.indexOf(toState.controller) !== -1);
    });

  })
  .component('navbar', function () {
    return {
      controller: 'navbarComponentCtrl'
    };
  });
