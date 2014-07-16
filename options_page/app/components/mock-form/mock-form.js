'use strict';

angular.module('optionsPage.components')
  .controller('mockFormComponentCtrl', function ($scope, $element, HTTPmethods, HTTPcodes) {
    $scope.methodsHTTP = HTTPmethods;
    $scope.responseCodesHTTP = HTTPcodes;

    $scope.refreshEditor = function() {
      $scope.refreshEditorHelper = !$scope.refreshEditorHelper;
    };
  })
  .component('mockForm', function () {
    return {
      scope: {
        mock: '='
      },
      controller: 'mockFormComponentCtrl'
    };
  });