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

  //We need to make sure that libraries load before the injected.js script
  //TODO promises
  //TODO allow libraries to load in parallel
  //TODO check for errors
  injectScript('scripts/libs/CustomEventServer.js', function () {
    injectScript('scripts/libs/MockHttpRequest.js', function () {
      injectScript('scripts/injected.js');
    })
  });

  var eventServer = new CustomEventServer();
  eventServer
    .setPrefix('mockietalkie_')
    .onMessage('request_captured', onRequestCaptured)
    .onMessage('injected_ready', onInjectedReady);

  var recording = false;
  var mocking = false;

  var injectedScriptReady = false;
  var waitingOperation = null;

  function injectScript(path, callback) {
    var s = document.createElement('script');
    s.src = chrome.extension.getURL(path);
    (document.head || document.documentElement).appendChild(s);
    s.onload = function () {
      s.parentNode.removeChild(s);

      if (callback) {
        callback();
      }
    };
  }

  function log(msg, data) {
    var mockieTalkie = '%c## Mockie Talkie ##',
      styles = 'font-weight: bold; background: -webkit-gradient(linear, 70% 0%, 0% 0%, from(#FF7816), to(#00A2B2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;';

    if(data) {
      console.log(mockieTalkie, styles, msg, data);
    } else {
      console.log(mockieTalkie, styles, msg);
    }
  }

  function onRequestCaptured(data) {
    if (recording) {
      recordRequest(data);
    } else if (mocking) {
      mockRequest(data);
    }
  }

  function onInjectedReady() {
    injectedScriptReady = true;

    if (waitingOperation) {
      waitingOperation();
      waitingOperation = null;
    }
  }

  function mockRequest(data) {
    var json = JSON.stringify({
      message: 'get_matching_mock',
      data: {
        requestMethod: data.method,
        requestURL: data.requestURL,
        requestHeaders: data.requestHeaders,
        requestText: data.requestText
      }
    });

    chrome.runtime.sendMessage(json, function (mock) {
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
    var json = JSON.stringify({
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
    });

    chrome.runtime.sendMessage(json, function () {
      //log('Learned: ', data.requestURL);
    });
  }

  window.startRecording = function () {
    if (recording) {
      return;
    }

    if (injectedScriptReady) {
      mocking = false;
      recording = true;
      eventServer.sendMessage('start_recording');
    } else {
      waitingOperation = startRecording;
    }
  };

  window.startMocking = function () {
    if (mocking) {
      return;
    }

    if (injectedScriptReady) {
      recording = false;
      mocking = true;
      eventServer.sendMessage('start_mocking');
    } else {
      waitingOperation = startMocking;
    }
  };

  window.stop = function () {
    recording = false;
    mocking = false;
    if (injectedScriptReady) {
      eventServer.sendMessage('stop');
    } else {
      waitingOperation = null;
    }
  }
})();