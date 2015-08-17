(function () {
  "use strict";

  var attachedTabs = {};

  function injectContentScripts(tabId, callback) {
    chrome.tabs.executeScript(tabId, {
      file: 'scripts/libs/CustomEventServer.js',
      runAt: 'document_end'
    }, function () {
      chrome.tabs.executeScript(tabId, {
        file: 'scripts/content.js',
        runAt: 'document_end'
      }, callback.bind(this, tabId));
    });
  }

  function startRecording(tabId) {
    attachedTabs[tabId] = 'recording';

    chrome.tabs.executeScript(tabId, {code: 'startRecording()'});

    chrome.browserAction.setIcon({
      tabId: tabId, path: {
        38: "images/icon-38-recording.png"
      }
    });
    chrome.browserAction.setTitle({tabId: tabId, title: "MockieTalkie - Recording"});
  }

  function startMocking(tabId) {
    attachedTabs[tabId] = 'mocking';

    chrome.tabs.executeScript(tabId, {code: 'startMocking()'});

    chrome.browserAction.setIcon({
      tabId: tabId, path: {
        38: "images/icon-38-mocking.png"
      }
    });
    chrome.browserAction.setTitle({tabId: tabId, title: "MockieTalkie - Mocking"});
  }

  function stop(tabId) {
    attachedTabs[tabId] = undefined;

    chrome.tabs.executeScript(tabId, {
      code: 'stop()'
    });

    chrome.browserAction.setIcon({
      tabId: tabId, path: {
        38: "images/icon-38.png"
      }
    });
    chrome.browserAction.setTitle({tabId: tabId, title: "MockieTalkie"});
  }

  function tabUpdated(tabId, changeInfo, tab) {
    if (!attachedTabs[tabId]) {
      return;
    }

    if (changeInfo.status === 'complete') {
      //re-inject the script if tab was reloaded or URL changed
      if (attachedTabs[tabId] === 'recording') {
        injectContentScripts(tab.id, startRecording);
      } else if (attachedTabs[tabId] === 'mocking') {
        injectContentScripts(tab.id, startMocking);
      }
    }
  }


  //MESSAGING

  var activityLog = new ActivityLog();
  var mockStorage = new MockStorage();

  chrome.runtime.onMessage.addListener(function (request, sender, response) {
    //don't respond to calls from other extensions
    if (sender.id !== chrome.runtime.id) {
      return;
    }

    request = JSON.parse(request);

    if (request.message === 'save_mock') {
      var mock = request.data;
      mockStorage.save(mock, function (mock, type) {
        if (type === 'create') {
          activityLog.mockCreated(mock);
        } else if (type === 'update') {
          activityLog.mockUpdated(mock);
        }

        response(mock);
      });
    } else if (request.message === 'get_matching_mock') {
      mockStorage.match(request.data, function (mock) {
        if (mock) {
          activityLog.requestMocked(request.data, mock);
        } else {
          activityLog.mockNotFound(request.data);
        }

        response(mock);
      });
    } else if (request.message === 'remove_mock') {
      var mockId = request.data;
      mockStorage.remove(mockId, function (mock) {
        if (mock) {
          activityLog.mockRemoved(mock);
        }

        response();
      });
    } else if (request.message === 'get_all_mocks') {
      response(mockStorage.getAll());
    }
  });

  window.changeStatus = function (status) {
    //first, we need to get current tab
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
      var tab = tabs[0];

      if (status === 'record') {
        //we may need to inject content script before enabling recoding
        if (!attachedTabs[tab.id]) {
          injectContentScripts(tab.id, startRecording);
          chrome.tabs.onUpdated.addListener(tabUpdated);
        } else {
          startRecording(tab.id);
        }
      } else if (status === 'mock') {
        //we may need to inject content script before enabling mocking
        if (!attachedTabs[tab.id]) {
          injectContentScripts(tab.id, startMocking);
          chrome.tabs.onUpdated.addListener(tabUpdated);
        } else {
          startMocking(tab.id);
        }
      } else if (status === 'stop') {
        stop(tab.id);
        chrome.tabs.onUpdated.removeListener(tabUpdated);
      }

    });
  }
})();