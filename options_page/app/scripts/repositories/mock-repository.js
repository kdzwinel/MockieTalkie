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

      //reload data after change
      chrome.storage.onChanged.addListener(function(change, storage) {
        if(storage === 'local' && change.mocks && change.mocks.newValue) {
          this._mocks = (change.mocks.newValue).map(function(rawMock){
            return new MockModel(rawMock);
          });
        }
      }.bind(this));
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
        chrome.storage.local.get('mocks', function(data) {
          this._mocks = (data.mocks).map(function(rawMock){
            return new MockModel(rawMock);
          });
          defer.resolve(this._mocks);
        }.bind(this));
      } else {
        defer.resolve(this._mocks);
      }

      return defer.promise;
    };

    MockRepository.prototype.delete = function(mock) {
      var idx = this._mocks.indexOf(mock);
      if(idx > -1) {
        this._mocks.splice(idx, 1);
      }
      chrome.storage.local.set({mocks:this._mocks});
    };

    return new MockRepository();
  });