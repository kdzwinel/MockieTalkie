'use strict';

angular.module('optionsPage')
  .constant('Config', angular.deepExtend({
    viewsDir: 'views/',
    componentsDir: 'components/',
    statesDir: 'states/',
    environment: 'production', //development or production
  }, angular._localConfig || {}))
  .config(function (componentFactoryProvider) {
    componentFactoryProvider.setViewPath(function (componentSnakeName, componentName) {
      return 'components/' + componentSnakeName + '/' + componentSnakeName + '.html';
    })
  })
  .value('cgBusyTemplateName', 'views/angular-busy/default-spinner.html')
  .value('HTTPmethods', ['GET', 'PUT', 'DELETE', 'POST', 'HEAD', 'TRACE', 'CONNECT'])
  .value('HTTPcodes', [
    {value: 200, text: 'OK'},
    {value: 201, text: 'Created'},
    {value: 202, text: 'Accepted'},
    {value: 203, text: 'Non-Authoritative Information'},
    {value: 204, text: 'No Content'},
    {value: 205, text: 'Reset Content'},
    {value: 206, text: 'Partial Content'},
    {value: 300, text: 'Multiple Choices'},
    {value: 301, text: 'Moved Permanently'},
    {value: 302, text: 'Found'},
    {value: 303, text: 'See Other'},
    {value: 304, text: 'Not Modified'},
    {value: 306, text: 'Switch Proxy'},
    {value: 307, text: 'Temporary Redirect'},
    {value: 308, text: 'Resume Incomplete'},
    {value: 400, text: 'Bad Request'},
    {value: 401, text: 'Unauthorized'},
    {value: 402, text: 'Payment Required'},
    {value: 403, text: 'Forbidden'},
    {value: 404, text: 'Not Found'},
    {value: 405, text: 'Method Not Allowed'},
    {value: 406, text: 'Not Acceptable'},
    {value: 407, text: 'Proxy Authentication Required'},
    {value: 408, text: 'Request Timeout'},
    {value: 409, text: 'Conflict'},
    {value: 410, text: 'Gone'},
    {value: 411, text: 'Length Required'},
    {value: 412, text: 'Precondition Failed'},
    {value: 413, text: 'Request Entity Too Large'},
    {value: 414, text: 'Request-URI Too Long'},
    {value: 415, text: 'Unsupported Media Type'},
    {value: 416, text: 'Requested Range Not Satisfiable'},
    {value: 417, text: 'Expectation Failed'},
    {value: 500, text: 'Internal Server Error'},
    {value: 501, text: 'Not Implemented'},
    {value: 502, text: 'Bad Gateway'},
    {value: 503, text: 'Service Unavailable'},
    {value: 504, text: 'Gateway Timeout'},
    {value: 505, text: 'HTTP Version Not Supported'},
    {value: 511, text: 'Network Authentication Required'}
  ]);
