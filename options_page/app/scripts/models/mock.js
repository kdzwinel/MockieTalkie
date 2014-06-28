'use strict';

angular.module('optionsPage')
  .factory('MockModel', function ($rootScope, BaseModel, $injector, $q) {

    function MockModel(data) {
      data = data || {};
      data.url = '-';
      BaseModel.call(this, data);
    }

    MockModel.prototype = Object.create(BaseModel.prototype);
    MockModel.prototype.$save = function() {
      var defer = $q.defer();

      var mock = angular.copy(this);
      //Remove all properties prefixed with $
      for(var key in mock) if(key.substr(0,1) === '$') delete mock[key];

      var json = JSON.stringify({
        message: 'save_mock',
        data: mock
      });
      chrome.runtime.sendMessage(json, function () {
        defer.resolve();
      }.bind(this));

      return defer.promise;
    };

    return MockModel;
  });