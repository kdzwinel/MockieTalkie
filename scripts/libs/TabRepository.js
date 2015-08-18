(function (exports) {
  "use strict";

  function TabRepository() {
    this._tabs = new Map();

    chrome.tabs.onRemoved.addListener(this.remove.bind(this));
  }

  TabRepository.prototype.remove = function(tabId) {
    this._tabs.delete(tabId);
  };

  TabRepository.prototype.add = function (tab) {
    this._tabs.set(tab.getId(), tab);
  };

  TabRepository.prototype.find = function(tabId) {
    return this._tabs.get(tabId);
  };

  exports.TabRepository = TabRepository;
})(window);
