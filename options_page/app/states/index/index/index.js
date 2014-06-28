'use strict';

angular.module('optionsPage')
  .config(function ($stateProvider, stateFactory) {
    $stateProvider.state('index', stateFactory('Index', {
      url: '/'
    }));
  })
  .controller('IndexCtrl', function ($scope, $state, MockRepository) {
    MockRepository.getDomains().then(function (domains) {
      $scope.domains = domains;
    });

    $scope.manageDomainMocks = function (domain) {
      $state.go('domain', {domain: domain.name});
    };
  });
