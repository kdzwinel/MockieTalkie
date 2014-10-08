'use strict';

angular.module('optionsPage.components')
  .controller('headersEditorComponentCtrl', function ($scope) {
    $scope.addHeader = function () {
      $scope.headers = $scope.headers || [];

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

      if(typeof $scope.onChange === 'function') {
        $scope.onChange();
      }
    }
  })
  .component('headersEditor', function () {
    return {
      scope: {
        headers: '=',
        onChange: '&'
      },
      controller: 'headersEditorComponentCtrl'
    };
  });