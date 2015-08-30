/**
 * Injected script runs in the context of the website, its main responsibility is to intercept all AJAX requests.
 */
(function () {
  "use strict";

  //prevent multiple injections
  if (window.mockieTalkieInjected) {
    return;
  }
  window.mockieTalkieInjected = true;

  /**
   * Helpers
   */

  var consoleOutput = {
    logo: '%c## Mockie Talkie ##',
    styles: 'font-weight: bold; background: -webkit-gradient(linear, 70% 0%, 0% 0%, from(#FF7816), to(#00A2B2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'
  };

  //http://davidwalsh.name/get-absolute-url
  var getAbsoluteUrl = (function() {
    var a;

    return function(url) {
      if(!a) a = document.createElement('a');
      a.href = url;

      return a.href;
    };
  })();

  function objToArray(obj) {
    return Object.keys(obj).map(function (key) {
      return {
        key: key,
        value: obj[key]
      }
    });
  }

  function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  //http://stackoverflow.com/a/105074/1143495
  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }

  function log(msg, data) {
    if (data) {
      console.log(consoleOutput.logo, consoleOutput.styles, msg, data);
    } else {
      console.log(consoleOutput.logo, consoleOutput.styles, msg);
    }
  }

  /**
   * Main logic
   */

  var requests = new Map();
  var ajaxServer = new MockHttpServer();
  var eventServer = new CustomEventServer();

  eventServer
    .setPrefix('mockietalkie_')
    .onMessage('request_mock', mockRequest)
    .onMessage('request_pass', passRequest)
    .onMessage('start_mocking', startMocking)
    .onMessage('start_recording', startRecording)
    .onMessage('stop', stop);

  //inform about AJAX call
  ajaxServer.handle = function (request) {
    request.requestId = guid();
    requests.set(request.requestId, request);

    var clone = cloneObject(request);
    clone.requestURL = clone.requestURL ? getAbsoluteUrl(clone.requestURL) : null;
    clone.responseURL = clone.responseURL ? getAbsoluteUrl(clone.responseURL) : null;
    clone.requestHeaders = request.requestHeaders ? objToArray(request.requestHeaders) : [];
    clone.responseHeaders = request.responseHeaders ? objToArray(request.responseHeaders) : [];

    eventServer.sendMessage('request_captured', clone);
  };

  //respond to AJAX call
  function mockRequest(data) {
    var request = requests.get(data.requestId);
    requests.delete(data.requestId);

    if (data.responseHeaders) {
      (data.responseHeaders).forEach(function (header) {
        request.setResponseHeader(header.name, header.value);
      });
    }

    request.receive(data.responseHTTPCode, data.responseText);

    console.groupCollapsed(consoleOutput.logo, consoleOutput.styles, 'Request mocked');
    console.log('%cURL: ', 'font-weight: bold', data.requestURL);
    console.log('%cMock: ', 'font-weight: bold', data.mockEditURL);
    console.groupEnd();
  }

  function passRequest(data) {
    var request = requests.get(data.requestId);
    requests.delete(data.requestId);

    request.pass();
  }

  function startMocking() {
    log('Started mocking!');
    ajaxServer.stop();
    ajaxServer.start();
  }

  function startRecording() {
    log('Started recording!');
    ajaxServer.stop();
    ajaxServer.passthrough();
  }

  function stop() {
    log('Turned off.');
    ajaxServer.stop();
  }

  eventServer.sendMessage('injected_ready');
})();
