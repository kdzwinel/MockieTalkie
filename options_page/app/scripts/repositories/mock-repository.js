'use strict';

angular.module('optionsPage')
  .factory('MockRepository', function ($injector, MockModel, $q) {
    function getDomain(url) {
      var a = document.createElement('a');
      a.href = url;
      return a.hostname;
    }

    var MockRepository = function () {
      this._mocks = null;
    };

    MockRepository.prototype.getMocksByDomain = function (domain) {
      var defer = $q.defer();

      this.getAll().then(function (mocks) {
        mocks = mocks.filter(function (mock) {
          return getDomain(mock.requestURL) === domain;
        });

        defer.resolve(mocks);
      });

      return defer.promise;
    };

    MockRepository.prototype.getDomains = function () {
      var defer = $q.defer();

      this.getAll().then(function (mocks) {
        var domainsMap = {}, domainsArr = [], domain;

        mocks.forEach(function (mock) {
          domain = getDomain(mock.requestURL);

          if (domainsMap[domain]) {
            domainsMap[domain].count++;
          } else {
            domainsMap[domain] = {
              count: 1
            };
          }
        });

        for (domain in domainsMap) {
          domainsArr.push({
            name: domain,
            count: domainsMap[domain].count
          });
        }

        defer.resolve(domainsArr);
      });

      return defer.promise;
    };

    MockRepository.prototype.getAll = function () {
      var defer = $q.defer();

      if (!this._mocks) {
        var json = JSON.stringify({
          message: 'get_all_mocks'
        });
        chrome.runtime.sendMessage(json, function (mocks) {
          mocks = mocks || [];
          this._mocks = mocks.map(function(mock) {
            return new MockModel(mock);
          });
          defer.resolve(this._mocks);
        }.bind(this));
      } else {
        defer.resolve(this._mocks);
      }

      return defer.promise;
    };

    return new MockRepository();
  });