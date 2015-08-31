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

    function getContentTypeFromHeaders(headers) {
      var type = null;

      headers && headers.forEach(function(header) {
        if((header.name).toLowerCase() === 'content-type') {
          var matches = (header.value).match('(json|html|javascript|xml)');

          if(matches && matches[1]) {
            type = matches[1];
          }
        }
      });

      return type;
    }

    MockModel.prototype.getResponseContentType = function() {
      return getContentTypeFromHeaders(this.responseHeaders);
    };

    MockModel.prototype.getRequestContentType = function() {
      return getContentTypeFromHeaders(this.requestHeaders);
    };

    MockModel.prototype.$save = function() {
      var defer = $q.defer();

      var mock = angular.copy(this);
      //Remove all properties prefixed with $
      for(var key in mock) if(key.substr(0,1) === '$') delete mock[key];

      var json = {
        message: 'save_mock',
        data: mock
      };

      chrome.runtime.sendMessage(json, function (mock) {
        this.id = mock.id;
        defer.resolve();
      }.bind(this));

      return defer.promise;
    };

    MockModel.prototype.$delete = function() {
      var defer = $q.defer();

      var json = {
        message: 'remove_mock',
        data: this.id
      };

      chrome.runtime.sendMessage(json, function () {
        defer.resolve();
      }.bind(this));

      return defer.promise;
    };

    return MockModel;
  });
