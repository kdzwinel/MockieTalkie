"use strict";

var attachedTabs = {};

function injectContentScripts(tabId, callback) {
  chrome.tabs.executeScript(tabId, {
    file: 'scripts/libs/CustomEventServer.js',
    runAt: 'document_end'
  }, function() {
    chrome.tabs.executeScript(tabId, {
      file: 'scripts/content.js',
      runAt: 'document_end'
    }, callback.bind(this, tabId));
  });
}

function startLearning(tabId) {
  attachedTabs[tabId] = 'learning';

  chrome.tabs.executeScript(tabId, {code: 'startLearning()'});

  chrome.browserAction.setIcon({tabId: tabId, path: {
    38: "images/icon-38-learning.png"
  }});
  chrome.browserAction.setTitle({tabId: tabId, title: "Start mocking API callas"});
}

function startMocking(tabId) {
  attachedTabs[tabId] = 'mocking';

  chrome.tabs.executeScript(tabId, {code: 'startMocking()'});

  chrome.browserAction.setIcon({tabId: tabId, path: {
    38: "images/icon-38-mocking.png"
  }});
  chrome.browserAction.setTitle({tabId: tabId, title: "Stop"});
}

function stop(tabId) {
  attachedTabs[tabId] = undefined;

  chrome.tabs.executeScript(tabId, {
    code: 'stop()'
  });

  chrome.browserAction.setIcon({tabId: tabId, path: {
    38: "images/icon-38.png"
  }});
  chrome.browserAction.setTitle({tabId: tabId, title: "Start learning API calls"});
}

function tabUpdated(tabId, changeInfo, tab) {
  if(!attachedTabs[tabId]) {
    return;
  }

  if (changeInfo.status === 'complete') {
    //re-inject the script if tab was reloaded or URL changed
    if(attachedTabs[tabId] === 'learning') {
      injectContentScripts(tab.id, startLearning);
    } else if(attachedTabs[tabId] === 'mocking') {
      injectContentScripts(tab.id, startMocking);
    }
  }
}

chrome.browserAction.onClicked.addListener(function(tab) {
  if (!attachedTabs[tab.id]) {
    injectContentScripts(tab.id, startLearning);
    chrome.tabs.onUpdated.addListener(tabUpdated);
  } else if(attachedTabs[tab.id] === 'learning'){
    startMocking(tab.id);
  } else if(attachedTabs[tab.id] === 'mocking') {
    stop(tab.id);
    chrome.tabs.onUpdated.removeListener(tabUpdated);
  }
});