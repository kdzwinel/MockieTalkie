'use strict';

angular.module('optionsPage')
  .factory('MockRepository', function ($injector, MockModel, $q, _) {
    var a = document.createElement('a');

    function getDomain(url) {
      a.href = url;
      return a.hostname;
    }

    var MockRepository = function () {
      this._mocks = null;

      //reload data after change
      chrome.storage.onChanged.addListener(function(change, storage) {
        if(storage === 'local' && change.mocks && change.mocks.newValue) {
          console.log('_mocks update');
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

    MockRepository.prototype._getMockIndexById = function(id) {
      for(var i=0, l=(this._mocks).length; i<l; i++) {
        if((this._mocks)[i].id === id) {
          return i;
        }
      }

      return -1;
    };

    MockRepository.prototype.getMockById = function(id) {
      var defer = $q.defer();

      this.getAll().then(function (mocks) {
        var mock = _.find(mocks, function(mock) {
          return mock.id === id;
        });

        if(mock) {
          defer.resolve(mock);
        } else {
          defer.reject();
        }
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
      var idx = this._getMockIndexById(mock.id);
      if(idx > -1) {
        this._mocks.splice(idx, 1);
      }
      chrome.storage.local.set({mocks: (this._mocks)});
    };

    MockRepository.prototype.deleteByDomain = function(domainName) {
      this._mocks = this._mocks.filter(function(mock) {
        return !(mock.getURLPart('hostname') === domainName);
      });

      chrome.storage.local.set({mocks: (this._mocks)});
    };

    return new MockRepository();
  });