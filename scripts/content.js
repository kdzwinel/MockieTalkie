/**
 * Content script is responsible for injecting injected.js and its all dependencies and for mediation between
 * injected script and background script.
 */
(function () {
  "use strict";

  //prevent content script from being injected multiple times
  if (window.contentScriptInjected) {
    return;
  }
  window.contentScriptInjected = true;

  function injectScript(path) {
    return new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.src = chrome.extension.getURL(path);
      (document.head || document.documentElement).appendChild(s);
      s.onload = function () {
        s.parentNode.removeChild(s);
        resolve();
      };
      s.onerror = reject;
    });
  }

  //Inject all scripts into the page, make sure that libraries are injected before injected.js
  Promise.all([injectScript('scripts/libs/CustomEventServer.js'), injectScript('scripts/libs/MockHttpRequest.js')])
    .then(injectScript('scripts/injected.js'))
    .catch(function(e) {
      throw new Error('Error injecting scripts into the page.', e);
    });

  var eventServer = new CustomEventServer();
  eventServer
    .setPrefix('mockietalkie_')
    .onMessage('request_captured', onRequestCaptured);

  var scriptsInjected = new Promise(function(resolve, reject) {
    eventServer.onMessage('injected_ready', resolve);
  });

  const STOPPED = 'stopped';
  const MOCKING = 'mocking';
  const RECORDING = 'recording';

  var status = STOPPED;

  function onRequestCaptured(data) {
    if (status === RECORDING) {
      recordRequest(data);
    } else if (status === MOCKING) {
      mockRequest(data);
    }
  }

  function mockRequest(data) {
    var message = {
      message: 'get_matching_mock',
      data: {
        requestMethod: data.method,
        requestURL: data.requestURL,
        requestHeaders: data.requestHeaders,
        requestText: data.requestText
      }
    };

    chrome.runtime.sendMessage(message, function (mock) {
      if (!mock) {
        //log('Mock not found: ' + data.requestURL, data);
        eventServer.sendMessage('request_pass', {
          requestId: data.requestId
        });
      } else {
        eventServer.sendMessage('request_mock', {
          requestId: data.requestId,
          requestURL: data.requestURL,
          responseHeaders: mock.responseHeaders,
          responseHTTPCode: mock.responseHTTPCode,
          responseText: mock.responseText,
          mockEditURL: 'chrome-extension://' + chrome.runtime.id + '/options_page/dist/index.html#/mocks/edit/' + mock.id
        });
      }
    });
  }

  function recordRequest(data) {
    var message = {
      message: 'save_mock',
      data: {
        requestURL: data.requestURL,
        requestMethod: data.method,
        requestHeaders: data.requestHeaders || [],
        requestText: data.requestText,
        responseURL: data.responseURL,
        responseHTTPCode: data.status,
        responseHeaders: data.responseHeaders || [],
        responseText: data.responseText
      }
    };

    chrome.runtime.sendMessage(message, function () {});
  }

  window.startRecording = function () {
    if (status === RECORDING) {
      return;
    }

    scriptsInjected.then(function() {
      status = RECORDING;
      eventServer.sendMessage('start_recording');
    });
  };

  window.startMocking = function () {
    if (status === MOCKING) {
      return;
    }

    scriptsInjected.then(function() {
      status = MOCKING;
      eventServer.sendMessage('start_mocking');
    });
  };

  window.stop = function () {
    status = STOPPED;

    scriptsInjected.then(function() {
      eventServer.sendMessage('stop');
    });
  }
})();
