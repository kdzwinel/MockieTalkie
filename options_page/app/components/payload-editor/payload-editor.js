'use strict';

angular.module('optionsPage.components')
  .controller('payloadEditorComponentCtrl', function ($scope) {
    var responseTextEditor;
    $scope.editorMode = 'plain';

    $scope.codemirrorLoaded = function (_editor) {
      responseTextEditor = _editor;

      responseTextEditor.setOption('lineNumbers', true);
      responseTextEditor.setOption('extraKeys', {
        "F11": function(cm) {
          cm.setOption("fullScreen", !cm.getOption("fullScreen"));
        },
        "Esc": function(cm) {
          if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
        }
      });


      if($scope.mock) {
        //set editor mode when both mock and editor
        $scope.editorMode = $scope.mock.getResponseContentType();
      }

      _editor.on("blur", function() {
        if($scope.mock) {
          $scope.mock.$save();
        }
      });
    };

    $scope.$watch('mock', function() {
      //set editor mode when mock loads
      $scope.editorMode = $scope.mock.getResponseContentType();
    });

    $scope.$watch('editorMode', function() {
      var settings = null;

      switch($scope.editorMode) {
        case 'json' : settings = {name: "javascript", json: true}; break;
        case 'javascript' : settings = 'javascript'; break;
        case 'xml' : settings = 'xml'; break;
        case 'html' : settings = 'htmlmixed'; break;
      }

      responseTextEditor.setOption('mode', settings);
    });

    $scope.editorFullScreen = function() {
      if(responseTextEditor) {
        responseTextEditor.setOption("fullScreen", !responseTextEditor.getOption("fullScreen"));
      }
    };
  })
  .component('payloadEditor', function () {
    return {
      controller: 'payloadEditorComponentCtrl',
      scope: {
        mock: '=',
        refresh: '='
      }
    };
  });