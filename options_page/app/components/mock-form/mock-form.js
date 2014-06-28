'use strict';

angular.module('optionsPage.components')
  .controller('mockFormComponentCtrl', function ($scope, $element) {
  })
  .component('mockForm', function () {
    return {
      scope: {
        mock: '='
      },
      controller: 'mockFormComponentCtrl'
    };
  });