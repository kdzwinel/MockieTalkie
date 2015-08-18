(function () {
  "use strict";

  var attachedTabs = new TabRepository();

  function changeActionButton(tabId, title, icon, color) {
    chrome.browserAction.setIcon({tabId: tabId, path: {38: icon}});
    chrome.browserAction.setTitle({tabId: tabId, title: title});
    chrome.browserAction.setBadgeBackgroundColor({tabId: tabId, color: color});
  }

  function startRecording(tab) {
    changeActionButton(tab.getId(), "MockieTalkie - Recording", "images/icon-38-recording.png", '#00A2B2');
  }

  function startMocking(tab) {
    changeActionButton(tab.getId(), "MockieTalkie - Mocking", "images/icon-38-mocking.png", '#FF7816');
  }

  function stop(tab) {
    changeActionButton(tab.getId(), "MockieTalkie", "images/icon-38.png", '#000');
  }

  function blinkBadge(tabId) {
    chrome.browserAction.setBadgeText({tabId: tabId, text: '•'});

    setTimeout(function () {
      chrome.browserAction.setBadgeText({tabId: tabId, text: ''});
    }, 300);
  }

  function getCurrentTab() {
    return new Promise(function (resolve, reject) {
      chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(tabs[0]);
        }
      });
    });
  }

  //GETTING MESSAGES FROM POPUP
  window.changeStatus = function (status) {
    getCurrentTab().then(function (tab) {
      var attachedTab = attachedTabs.find(tab.id);

      if (!attachedTab) {
        attachedTab = new Tab(tab.id);
        attachedTab.on('stop', stop);
        attachedTab.on('mock', startMocking);
        attachedTab.on('record', startRecording);

        attachedTabs.add(attachedTab);
      }

      if (status === 'record') {
        attachedTab.record();
      } else if (status === 'mock') {
        attachedTab.mock();
      } else if (status === 'stop') {
        attachedTab.stop();
      }
    });
  };

  //GETTING MESSAGES FROM CONTENT SCRIPT
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

          blinkBadge(sender.tab.id);
        } else if (type === 'update') {
          activityLog.mockUpdated(mock);
        }

        response(mock);
      });
    } else if (request.message === 'get_matching_mock') {
      mockStorage.match(request.data, function (mock) {
        if (mock) {
          activityLog.requestMocked(request.data, mock);

          blinkBadge(sender.tab.id);
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
})();
