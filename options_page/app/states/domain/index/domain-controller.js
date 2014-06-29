'use strict';

angular.module('optionsPage')
  .config(function ($stateProvider, stateFactory) {
    $stateProvider.state('domain', stateFactory('Domain', {
      url: '/domain/{domain}',
      templateUrl: 'states/domain/index/main-view.html'
    }));
  })
  .controller('DomainCtrl', function ($scope, $stateParams, MockRepository) {
    $scope.domain = $stateParams.domain;

    MockRepository.getMocksByDomain($scope.domain).then(function (mocks) {
      $scope.mocks = mocks;
    });
  });
