(function (window) {
  "use strict";

  function processMessage(name, data) {
    this._callbacks[name].forEach(function(callback) {
      callback(data.detail);
    });
  }

  var CustomEventServer = function() {
    this._prefix = '';
    this._callbacks = [];
  };

  CustomEventServer.prototype.setPrefix = function(str) {
    this._prefix = str;

    return this;
  };

  CustomEventServer.prototype.sendMessage = function(name, data) {
    document.dispatchEvent(new CustomEvent(this._prefix + name, {
      detail: data
    }));
  };

  CustomEventServer.prototype.onMessage = function(name, callback) {
    name = this._prefix + name;

    if(!this._callbacks[name]) {
      this._callbacks[name] = [];
      document.addEventListener(name, processMessage.bind(this, name));
    }

    if(this._callbacks[name].indexOf(callback) === -1) {
      this._callbacks[name].push(callback);
    }

    return this;
  };

  window.CustomEventServer = CustomEventServer;
})(window);