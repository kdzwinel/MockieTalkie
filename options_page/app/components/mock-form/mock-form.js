'use strict';

angular.module('optionsPage.components')
  .controller('mockFormComponentCtrl', function ($scope, $element, HTTPmethods, HTTPcodes) {
    $scope.methodsHTTP = HTTPmethods;
    $scope.responseCodesHTTP = HTTPcodes;
  })
  .component('mockForm', function () {
    return {
      scope: {
        mock: '='
      },
      controller: 'mockFormComponentCtrl'
    };
  });