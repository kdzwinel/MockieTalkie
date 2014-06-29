'use strict';

angular.module('optionsPage.components')
  .controller('mockFormComponentCtrl', function ($scope, $element) {
    $scope.methodsHTTP = ['GET', 'PUT', 'DELETE', 'POST', 'HEAD', 'TRACE', 'CONNECT'];
  })
  .component('mockForm', function () {
    return {
      scope: {
        mock: '='
      },
      controller: 'mockFormComponentCtrl'
    };
  });