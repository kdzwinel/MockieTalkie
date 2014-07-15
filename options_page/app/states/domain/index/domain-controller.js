'use strict';

angular.module('optionsPage')
  .config(function ($stateProvider, stateFactory) {
    $stateProvider.state('domain', stateFactory('Domain', {
      url: '/domain/{name}',
      templateUrl: 'states/domain/index/main-view.html'
    }));
  })
  .controller('DomainCtrl', function ($scope, $stateParams, MockRepository) {
    $scope.domain = $stateParams.name;

    MockRepository.getMocksByDomain($scope.domain).then(function (mocks) {
      $scope.mocks = mocks;
    });

    $scope.removeMock = function(mock) {
      var idx = $scope.mocks.indexOf(mock);
      $scope.mocks.splice(idx,1);
      MockRepository.delete(mock);
    };
  });
