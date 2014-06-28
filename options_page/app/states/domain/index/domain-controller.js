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

    $scope.shortURL = function(url) {
      var a = document.createElement('a');
      a.href = url;

      return a.pathname + a.search + a.hash;
    };

    MockRepository.getMocksByDomain($scope.domain).then(function (mocks) {
      $scope.mocks = mocks;
      console.log(mocks);
    });
  });
