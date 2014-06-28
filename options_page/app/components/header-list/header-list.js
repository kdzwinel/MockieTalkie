'use strict';

angular.module('optionsPage.components')
  .controller('headerListComponentCtrl', function ($scope, $element) {
    $scope.addHeader = function () {
      $scope.headers.push({
        name: '',
        value: ''
      });
    };

    $scope.validateAndSave = function() {
      var uniqueNames = [];

      //removes repeated headers or headers with empty names
      $scope.headers = ($scope.headers).filter(function (header) {
        var name = (header.name).trim().toLowerCase();

        if (name === "" || uniqueNames.indexOf(name) !== -1) {
          return false;
        }

        uniqueNames.push(name);
        return true;
      });

      $scope.mock.$save();
    }
  })
  .component('headerList', function () {
    return {
      scope: {
        headers: '=',
        mock: '='
      },
      controller: 'headerListComponentCtrl'
    };
  });