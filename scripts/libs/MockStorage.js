"use strict";

function MockStorage() {
  var _mocks = [];

  //load data immediately
  chrome.storage.local.get('mocks', function(data) {
    _mocks = (data && data.mocks) ? data.mocks : [];
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

  function matchHTTPMethod(mockMethod, method) {
    return (mockMethod.toLowerCase() === method.toLowerCase());
  }

  function matchURL(mockURL, url) {
    //handle wildcard '((*))'
    if (mockURL.indexOf('((*))') !== -1) {
      var regexp = new RegExp('^' + escapeRegExp(mockURL).replace(/\\\(\\\(\\\*\\\)\\\)/g, '(.*)') + '$');

      if (regexp.test(url)) {
        return true;
      }
    } else if (mockURL === url) {
      return true;
    }

    return false;
  }

  function matchPayload(mockPayload, payload) {
    return mockPayload === payload;
  }

  /**
   * Looks for matching mocks
   * @param data Request metadata (requestMethod, requestURL, requestText)
   * @param callback Result (mock object or null) will be returned to this function
   */
  this.match = function(data, callback) {
    var match = null,
      method = (data.requestMethod).toLowerCase(),
      url = data.requestURL,
      payload = data.requestText;

    _mocks.sort(function(a, b) {
      return (a.priority || 0) > (b.priority || 0);
    });

    for (var idx in _mocks) {
      var mock = _mocks[idx];

      if (matchHTTPMethod(mock.requestMethod, method)) {
        if(matchURL(mock.requestURL, url)){
          if(!mock.matchRequestPayload || (mock.matchRequestPayload && matchPayload(mock.requestText, payload))) {
            match = mock;
            break;
          }
        }
      }
    }

    callback(match);
  };

  /**
   * Save is used for both saving existing and new mocks
   * @param mock All mock information
   * @param callback Function that will be called after mock data have been stored
   */
  this.save = function(mock, callback) {
    var idx, type;

    if(mock.id) {
      idx = getMockIndexById(mock.id);
    } else {
      //We don't want to store same mocks multiple times, lets search for exact matches (method + url)
      idx = findMockIndexByMethodAndUrl(mock);
    }

    if(idx > -1) {
      mock = _.extend(_mocks[idx], mock);
      _mocks[idx] = mock;
      type = 'update';
    } else {
      mock.id = guid();
      _mocks.push(mock);
      type = 'create';
    }

    chrome.storage.local.set({mocks: _mocks}, function() {
      callback(mock, type);
    });
  };

  this.remove = function(mockId, callback) {
    var mockIdx = getMockIndexById(mockId);

    if(mockIdx !== -1) {
      var mock = _mocks.splice(mockIdx, 1);
      chrome.storage.local.set({mocks: _mocks}, callback);

      callback(mock[0]);
      return;
    }

    callback(null);
  };

  this.getAll = function() {
    return _mocks;
  };
}