'use strict';

angular.module('optionsPage')
  .config(function ($stateProvider, stateFactory) {
    $stateProvider.state('mocks_create', stateFactory('Create', {
      url: '/mocks/create',
      templateUrl: 'states/mocks/create/main-view.html'
    }));
  })
  .controller('CreateCtrl', function ($scope, MockModel, MockRepository, $state) {
    $scope.abort = function () {
      MockRepository.delete($scope.mock);
      $state.go('index');
    };

    $scope.mock = new MockModel({
      requestMethod: 'GET',
      requestURL: 'http://example.com/',
      responseHTTPCode: 200
    });
  });
