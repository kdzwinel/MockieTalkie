"use strict";

/**
 * Activity log is an interface for easy logging of all mock related events.
 * @constructor
 */
function ActivityLog() {
  var _log = [];
  var _maxLength = 50;

  //load data immediately
  chrome.storage.local.get('log', function(data) {
    _log = (data && data.log) ? data.log : [];
  });

  var save = _.throttle(function() {
    chrome.storage.local.set({log:_log});
  }, 500);

  function addActivity(obj) {
    obj.date = (new Date()).toString();

    _log.unshift(obj);
    _log.length = _maxLength;

    console.log('Activity', obj);
    save();
  }

  this.requestMocked = function(request, mock) {
    addActivity({
      type: 'mocked',
      mockId: mock.id,
      requestMethod: request.requestMethod,
      requestURL: request.requestURL
    });
  };

  this.mockNotFound = function(request) {
    addActivity({
      type: 'not_found',
      requestMethod: request.requestMethod,
      requestURL: request.requestURL
    });
  };

  this.mockCreated = function(mock) {
    addActivity({
      type: 'created',
      mockId: mock.id,
      requestMethod: mock.requestMethod,
      requestURL: mock.requestURL
    });
  };

  this.mockRemoved = function(mock) {
    addActivity({
      type: 'removed',
      requestMethod: mock.requestMethod,
      requestURL: mock.requestURL
    });
  };

  this.mockUpdated = function(mock) {
    addActivity({
      type: 'updated',
      mockId: mock.id,
      requestMethod: mock.requestMethod,
      requestURL: mock.requestURL
    });
  };
}