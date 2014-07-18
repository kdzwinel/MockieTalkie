'use strict';

angular.module('optionsPage')
  .config(function ($stateProvider, stateFactory) {
    $stateProvider.state('index', stateFactory('Index', {
      url: '/',
      templateUrl: 'states/mocks/index/main-view.html'
    }));
  })
  .controller('IndexCtrl', function ($scope, $state, MockRepository) {
    MockRepository.getDomains().then(function (domains) {
      $scope.domains = domains;
    });

    $scope.manageDomainMocks = function (domain) {
      $state.go('domain', {name: domain.name});
    };

    $scope.removeDomain = function(domain) {
      var idx = $scope.domains.indexOf(domain);

      if(idx > -1) {
        ($scope.domains).splice(idx, 1);
      }

      MockRepository.deleteByDomain(domain.name);
    }
  });
