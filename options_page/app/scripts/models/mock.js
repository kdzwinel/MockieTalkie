'use strict';

angular.module('optionsPage')
  .factory('MockModel', function ($rootScope, BaseModel, $injector, $q) {
    var a = document.createElement('a');

    function MockModel(data) {
      data = data || {};
      data.url = '-';
      data.priority = data.priority || 0;
      BaseModel.call(this, data);
    }

    MockModel.prototype = Object.create(BaseModel.prototype);

    MockModel.prototype.update = function(data) {
      data = data || {};
      angular.extend(this, data);
    };

    MockModel.prototype.getURLParts = function() {
      a.href = this.requestURL;

      return {
        protocol: a.protocol,
        hostname: a.hostname,
        port: a.port,
        pathname: a.pathname,
        search: a.search,
        hash: a.hash
      };
    };

    MockModel.prototype.getURLPart = function(partName) {
      return (this.getURLParts())[partName];
    };

    MockModel.prototype.getResponseContentType = function() {
      var type = 'unknown';

      (this.responseHeaders).forEach(function(header) {
        if((header.name).toLowerCase() === 'content-type') {
          var matches = (header.value).match('(json|html|javascript|xml)');

          if(matches[1]) {
            type = matches[1];
          }
        }
      });

      return type;
    };

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

    MockModel.prototype.$delete = function() {
      var defer = $q.defer();

      var json = JSON.stringify({
        message: 'remove_mock',
        data: this.id
      });

      chrome.runtime.sendMessage(json, function () {
        defer.resolve();
      }.bind(this));

      return defer.promise;
    };

    return MockModel;
  });