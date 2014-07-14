"use strict";

function MockStorage() {
  var _mocks = [];

  //load data immediately
  chrome.storage.local.get('mocks', function(data) {
    _mocks = (data && data.mocks) ? data.mocks : [];
  });
  //reload data after change
  chrome.storage.onChanged.addListener(function(change, storage) {
    if(storage === 'local' && change.mocks && change.mocks.newValue) {
      _mocks = change.mocks.newValue;
    }
  });

  //Unique ID generator
  //http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return (function() {
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    })();
  }

  function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }

  function getMockIndexById(id) {
    for(var i=0, l=_mocks.length; i<l; i++) {
      if(_mocks[i].id === id) {
        return i;
      }
    }

    return -1;
  }

  function findMockIndexByMethodAndUrl(mock) {
    var method = (mock.requestMethod).toLowerCase(),
      url = mock.requestURL;

    for(var i=0, l=_mocks.length; i<l; i++) {
      if((_mocks[i].requestMethod).toLowerCase() === method && _mocks[i].requestURL === url) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Looks for matching mocks
   * @param data Request metadata (requestMethod, requestURL, requestText)
   * @param callback Result (mock object or null) will be returned to this function
   */
  this.match = function(data, callback) {
    var match = null,
      method = (data.requestMethod).toLowerCase(),
      url = data.requestURL;

    for (var idx in _mocks) {
      var mock = _mocks[idx];

      if (method === (mock.requestMethod).toLowerCase()) {

        //handle wildcard '{{*}}'
        if ((mock.requestURL).indexOf('{{*}}') !== -1) {
          var regexp = new RegExp('^' + escapeRegExp(mock.requestURL).replace(/\\\{\\\{\\\*\\\}\\\}/g, '(.*)') + '$');

          if (regexp.test(url)) {
            match = mock;
            break;
          }
        } else if (mock.requestURL === url) {
          match = mock;
          break;
        }
      }
    }

    console.log('get_matching_mock', data, match);
    callback(match);
  };

  /**
   * Save is used for both saving existing and new mocks
   * @param mock All mock information
   * @param callback Function that will be called after mock data have been stored
   */
  this.save = function(mock, callback) {
    var idx;

    if(mock.id) {
      idx = getMockIndexById(mock.id);
    } else {
      //We don't want to store same mocks multiple times, lets search for exact matches (method + url)
      idx = findMockIndexByMethodAndUrl(mock);
    }

    if(idx > -1) {
      _mocks[idx] = mock;
    } else {
      mock.id = guid();
      _mocks.push(mock);
    }

    chrome.storage.local.set({mocks: _mocks}, callback);

    console.log('save_mock', mock);
  };
}