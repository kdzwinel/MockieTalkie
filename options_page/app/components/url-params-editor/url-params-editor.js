'use strict';

angular.module('optionsPage.components')
  .controller('urlParamsEditorComponentCtrl', function ($scope, $document) {
    var urlParser = $document[0].createElement('a');

    function getParamsFromSearchQuery(query) {
      var args = query.substring(1).split('&');
      var argsParsed = [];

      args.forEach(function (arg) {
        if (arg.indexOf('=') === -1) {
          arg = decodeURIComponent(arg);

          argsParsed.push({
            name: arg,
            value: ''
          });
        } else {
          var nameValue = arg.split('='),
            name = nameValue[0],
            value = nameValue[1];

          argsParsed.push({
            name: decodeURIComponent(name),
            value: decodeURIComponent(value)
          });
        }
      });

      return argsParsed;
    }

    function getSearchQueryFromParams(params) {
      return '?' + params
        .filter(function (param) {
          return (param.name).length > 0;
        })
        .map(function (param) {
          if ((param.value).length === 0) {
            return encodeURIComponent(param.name);
          } else {
            return encodeURIComponent(param.name) + '=' + encodeURIComponent(param.value);
          }
        }).join('&');
    }

    $scope.params = [];

    $scope.addParam = function () {
      $scope.params.push({
        name: '',
        value: ''
      });
    };

    $scope.save = function () {
      urlParser.href = $scope.url;
      var oldSearchQuery = urlParser.search;
      var newSearchQuery = getSearchQueryFromParams($scope.params);

      if(newSearchQuery !== oldSearchQuery) {
        $scope.url = ($scope.url).replace(oldSearchQuery, newSearchQuery);

        if(typeof $scope.onChange === 'function') {
          $scope.onChange();
        }
      }
    };

    $scope.$watch('url', function () {
      urlParser.href = $scope.url;

      //only update params array if it has really changed
      //this prevents input fields from loosing focus after save()
      if(urlParser.search !== getSearchQueryFromParams($scope.params)) {
        $scope.params = getParamsFromSearchQuery(urlParser.search);
      }
    });
  })
  .component('urlParamsEditor', function () {
    return {
      scope: {
        url: '=',
        onChange: '&'
      },
      controller: 'urlParamsEditorComponentCtrl'
    };
  });