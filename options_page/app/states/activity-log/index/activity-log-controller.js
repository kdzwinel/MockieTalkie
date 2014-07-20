'use strict';

angular.module('optionsPage')
  .config(function ($stateProvider, stateFactory) {
    $stateProvider.state('activity-log', stateFactory('ActivityLog', {
      url: '/log',
      templateUrl: 'states/activity-log/index/main-view.html'
    }));
  })
  .controller('ActivityLogCtrl', function ($scope) {
    $scope.activities = [];

    chrome.storage.local.get('log', function (data) {
      if (data && data.log) {
        (data.log).forEach(function (log) {
          log.date = new Date(log.date);
        });

        $scope.activities = data.log;

        //since we are not using angular promises we have to manually let angular know that something has changed
        $scope.$digest();
      }
    });

    chrome.storage.onChanged.addListener(function (data, storage) {
      if (storage === 'local' && data.log && data.log.newValue) {
        (data.log.newValue).forEach(function (log) {
          log.date = new Date(log.date);
        });

        $scope.activities = data.log.newValue;
        $scope.$digest();
      }
    }.bind(this));

    $scope.getActivityCSSClass = function (activity) {
      switch (activity.type) {
        case 'created':
          return 'success';
        case 'removed':
          return 'danger';
        case 'not_found':
          return 'warning';
        case 'mocked':
          return 'info';
        default:
          return '';
      }
    };
  });
