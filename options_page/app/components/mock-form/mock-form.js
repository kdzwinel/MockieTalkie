'use strict';

angular.module('optionsPage.components')
  .controller('mockFormComponentCtrl', function ($scope, $element, HTTPmethods, HTTPcodes) {
    $scope.methodsHTTP = HTTPmethods;
    $scope.responseCodesHTTP = HTTPcodes;

    $scope.refreshResponseEditor = function() {
      $scope.refreshResponseEditorHelper = !$scope.refreshResponseEditorHelper;
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