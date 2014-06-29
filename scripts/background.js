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

function generateMockId(data) {
  return [data.requestMethod, data.requestURL].join('_');
}

//Saving and retrieving mocks
chrome.runtime.onMessage.addListener(function(request, sender, response){
  //don't respond to calls from other extensions
  if(sender.id !== chrome.runtime.id) {
    return;
  }

  request = JSON.parse(request);

  if(request.message === 'save_mock') {
    var mock = request.data;

    mock.id = mock.id || generateMockId(mock);
    localStorage[mock.id] = JSON.stringify(mock);

    console.log('save_mock', request, JSON.parse(localStorage[mock.id]));
    response();
  } else if(request.message === 'get_mock') {
    var mockId = generateMockId(request.data);
    if(localStorage[mockId]) {
      console.log('get_mock', request, JSON.parse(localStorage[mockId]));
      response(localStorage[mockId]);
    } else {
      response(undefined);
    }
  } else if(request.message === 'get_all_mocks') {
    console.log('get_all_mocks', request);
    var mocksArray = [];

    for(var idx in localStorage) {
      mocksArray.push(JSON.parse(localStorage[idx]));
    }

    response(mocksArray);
  }
});