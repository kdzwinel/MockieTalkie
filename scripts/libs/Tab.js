(function (exports) {
  "use strict";

  function injectScript(tabId, scriptURL) {
    return new Promise(function (resolve, reject) {
      chrome.tabs.executeScript(tabId, {
        file: scriptURL,
        runAt: 'document_start'
      }, function () {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(scriptURL);
        }
      });
    });
  }

  //inject list of scripts, one after another
  function injectScripts(tabId, arrayOfScripts) {
    return arrayOfScripts
      .reduce(function (promise, scriptURL) {
        return promise.then(function() {
          return injectScript(tabId, scriptURL);
        });
      }, Promise.resolve());
  }

  function Tab(id) {
    this._id = id;
    this._status = Tab.STOPPED;
    this._listeners = {
      mock: new Set(),
      stop: new Set(),
      record: new Set()
    };

    chrome.tabs.onUpdated.addListener(this._onTabUpdated.bind(this));

    this._init();
  }

  Tab.STOPPED = 'stopped';
  Tab.MOCKING = 'mocking';
  Tab.RECORDING = 'recording';

  Tab.prototype._init = function () {
    this._ready = injectScripts(this._id, ['scripts/libs/CustomEventServer.js', 'scripts/content.js'])
      .catch(function (error) {
        console.error('Injecting content scripts to a tab failed.', error);
      });
  };

  Tab.prototype._onTabUpdated = function (tabId, changeInfo) {
    if(tabId !== this._id) {
      return;
    }

    this._trigger('stop');

    if (changeInfo.status === 'complete') {
      //re-inject the script if tab was reloaded or URL changed
      this._init();

      if (this._status === Tab.RECORDING) {
        this.record();
      } else if (this._status === Tab.MOCKING) {
        this.mock();
      }
    }
  };

  Tab.prototype._trigger = function (event, data) {
    var tab = this;

    this._listeners[event].forEach(function (callback) {
      callback(tab, data);
    });
  };

  Tab.prototype.getId = function () {
    return this._id;
  };

  Tab.prototype.getStatus = function () {
    return this._status;
  };

  Tab.prototype.record = function () {
    function record() {
      this._status = Tab.RECORDING;
      chrome.tabs.executeScript(this._id, {code: 'startRecording()'});
      this._trigger('record');
    }

    return this._ready.then(record.bind(this));
  };

  Tab.prototype.mock = function () {
    function mock() {
      this._status = Tab.MOCKING;
      chrome.tabs.executeScript(this._id, {code: 'startMocking()'});
      this._trigger('mock');
    }

    return (this._ready).then(mock.bind(this));
  };

  Tab.prototype.stop = function () {
    function stop() {
      this._status = Tab.STOPPED;
      chrome.tabs.executeScript(this._id, {code: 'stop()'});
      this._trigger('stop');
    }

    return this._ready.then(stop.bind(this));
  };

  Tab.prototype.on = function (event, callback) {
    if (!this._listeners[event]) {
      throw new Error("Unknown event '" + event + "'.");
    }

    this._listeners[event].add(callback);
  };

  exports.Tab = Tab;
})(window);
