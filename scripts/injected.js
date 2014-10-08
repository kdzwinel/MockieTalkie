/**
 * Injected script runs in the context of the website, its main responsibility is to intercept all AJAX requests.
 */
(function(){
  "use strict";

  //prevent multiple injections
  if(window.mockieTalkieInjected) {
    return;
  }
  window.mockieTalkieInjected = true;

  var requests = {};
  var ajaxServer = new MockHttpServer();
  var eventServer = new CustomEventServer();
  eventServer
    .setPrefix('mockietalkie_')
    .onMessage('request_mock', mockRequest)
    .onMessage('request_pass', passRequest)
    .onMessage('start_mocking', startMocking)
    .onMessage('start_learning', startLearning)
    .onMessage('stop', stop);
  var consoleOutput = {
    logo: '%c## Mockie Talkie ##',
    styles: 'font-weight: bold; background: -webkit-gradient(linear, 70% 0%, 0% 0%, from(#FF7816), to(#00A2B2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'
  };

  function absoluteURL(url) {
    if(!url || url.substr(0,7) === 'http://' || url.substr(0,8) === 'https://') {
      return url;
    } else {
      var absoluteURL = location.protocol + '//' + location.hostname;
      absoluteURL += location.port ? (':' + location.port) : '';
      absoluteURL += (url[0] !== '/') ? '/' : '';
      absoluteURL += url;

      return absoluteURL;
    }
  }

  function objToArray(obj) {
    var arr =[];
    for( var name in obj ) {
      if (obj.hasOwnProperty(name)){
        arr.push({
          name: name,
          value: obj[name]
        });
      }
    }

    return arr;
  }

  function log(msg, data) {
    if(data) {
      console.log(consoleOutput.logo, consoleOutput.styles, msg, data);
    } else {
      console.log(consoleOutput.logo, consoleOutput.styles, msg);
    }
  }

  //inform about AJAX call
  ajaxServer.handle = function (request) {
    request.requestId = Math.random();
    requests[request.requestId] = request;

    var clone = JSON.parse(JSON.stringify(request));
    clone.requestURL = absoluteURL(clone.requestURL);
    clone.responseURL = absoluteURL(clone.responseURL);
    clone.requestHeaders = request.requestHeaders ? objToArray(request.requestHeaders) : [];
    clone.responseHeaders = request.responseHeaders ? objToArray(request.responseHeaders) : [];

    eventServer.sendMessage('request_captured', clone);
  };

  //respond to AJAX call
  function mockRequest(data) {
    var request = requests[data.requestId];
    requests[data.requestId] = undefined;

    if(data.responseHeaders) {
      (data.responseHeaders).forEach(function(header) {
        request.setResponseHeader(header.name, header.value);
      });
    }

    request.receive(data.responseHTTPCode, data.responseText);

    console.groupCollapsed(consoleOutput.logo, consoleOutput.styles, 'Request mocked');
    console.log('%cURL: ', 'font-weight: bold',  data.requestURL);
    console.log('%cMock: ', 'font-weight: bold', data.mockEditURL);
    console.groupEnd();
  }

  function passRequest(data) {
    var request = requests[data.requestId];
    requests[data.requestId] = undefined;

    request.pass();
  }

  function startMocking() {
    log('Started mocking!');
    ajaxServer.stop();
    ajaxServer.start();
  }

  function startLearning() {
    log('Started learning!');
    ajaxServer.stop();
    ajaxServer.passthrough();
  }

  function stop() {
    log('Turned off.');
    ajaxServer.stop();
  }

  eventServer.sendMessage('injected_ready');
})();