'use strict';

angular.module('optionsPage')
  .config(function ($stateProvider, stateFactory) {
    $stateProvider.state('mock', stateFactory('Mock', {
      url: '/mocks/edit/{id}',
      templateUrl: 'states/mocks/edit/main-view.html'
    }));
  })
  .controller('MockCtrl', function ($scope, $state, $stateParams, MockRepository) {
    MockRepository.getMockById($stateParams.id).then(function (mock) {
      $scope.mock = mock;
    }).catch(function() {
      $state.go('error', {code: 404});
    });

    $scope.getDomain = function() {
      if($scope.mock) {
        return $scope.mock.getURLPart('hostname');
      }
    };
  });
