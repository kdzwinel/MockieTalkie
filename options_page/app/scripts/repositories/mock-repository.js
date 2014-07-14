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

          var mocks = this._mocks;
          var newMocks = change.mocks.newValue || [];
          var mocksToRemove = [];

          //update
          mocks.forEach(function(mock) {
            var newMock = _.find(newMocks, function(item) {
              return item.id === mock.id;
            });

            if(newMock) {
              mock.update(newMock);
            } else {
              mocksToRemove.push(mock.id);
            }
          });

          //remove
          mocks = mocks.filter(function(mock) {
            return mocksToRemove.indexOf(mock.id) === -1;
          });

          //add
          newMocks.forEach(function(newMock) {
            var mock = _.find(mocks, function(item) {
              return item.id === newMock.id;
            });

            if(!mock) {
              mocks.push(new MockModel(newMock));
            }
          });

          this._mocks = mocks;
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

        var json = JSON.stringify({
          message: 'get_all_mocks'
        });

        chrome.runtime.sendMessage(json, function (rawMocks) {
          this._mocks = rawMocks.map(function(rawMock){
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
        this._mocks[idx].$delete();
        this._mocks.splice(idx, 1);
      }
    };

    MockRepository.prototype.deleteByDomain = function(domainName) {
      this._mocks = this._mocks.filter(function(mock) {
        if(mock.getURLPart('hostname') === domainName) {
          mock.$delete();
          return false;
        } else {
          return true;
        }
      });
    };

    return new MockRepository();
  });