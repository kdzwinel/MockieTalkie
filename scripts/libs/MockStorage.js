"use strict";

function MockStorage() {
  var mocks = [];

  //load data immediately
  chrome.storage.local.get('mocks', function(data) {
    mocks = data.mocks;
  });
  //reload data after change
  chrome.storage.onChanged.addListener(function(change, storage) {
    if(storage === 'local' && change.mocks && change.mocks.newValue) {
      mocks = change.mocks.newValue;
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
    return function() {
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    };
  }

  function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }

  /**
   * Looks for matching mocks
   * @param data Request metadata (requestMethod, requestURL, requestText)
   * @param callback Result (mock object or null) will be returned to this function
   */
  this.match = function(data, callback) {
    var match = null,
      method = data.requestMethod,
      url = data.requestURL;

    for (var idx in mocks) {
      var mock = mocks[idx];

      if (method.toLowerCase() === (mock.requestMethod).toLowerCase()) {

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
    mock.id = mock.id || guid();

    mocks.push(mock);
    chrome.storage.local.set({mocks: mocks}, callback);

    console.log('save_mock', mock);
  };
}