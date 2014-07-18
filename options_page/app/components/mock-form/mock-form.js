'use strict';

angular.module('optionsPage.components')
  .controller('mockFormComponentCtrl', function ($scope, _, HTTPmethods, HTTPcodes) {
    $scope.methodsHTTP = HTTPmethods;
    $scope.responseCodesHTTP = HTTPcodes;
    $scope.paramsEditorHidden = true;

    $scope.save = _.debounce(function() {
      $scope.mock.$save();
    }, 300);
  })
  .component('mockForm', function () {
    return {
      scope: {
        mock: '='
      },
      controller: 'mockFormComponentCtrl'
    };
  });