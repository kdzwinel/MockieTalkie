'use strict';

angular.module('optionsPage')
  .config(function ($stateProvider, stateFactory) {
    $stateProvider.state('mock', stateFactory('Mock', {
      url: '/mock/{id}',
      templateUrl: 'states/mock/index/main-view.html'
    }));
  })
  .controller('MockCtrl', function ($scope, $stateParams, MockRepository) {
    MockRepository.getMockById($stateParams.id).then(function (mock) {
      $scope.mock = mock;
    });

    $scope.getDomain = function() {
      if($scope.mock) {
        return $scope.mock.getURLPart('hostname');
      }
    };
  });
