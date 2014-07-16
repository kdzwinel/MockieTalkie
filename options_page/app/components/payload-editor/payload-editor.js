'use strict';

angular.module('optionsPage.components')
  .controller('payloadEditorComponentCtrl', function ($scope) {
    var responseTextEditor;
    $scope.mode = 'plain';
    $scope.lineWrap = false;

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

      _editor.on("blur", function() {
        if(typeof $scope.onBlur === 'function') {
          $scope.onBlur();
        }
      });
    };

    $scope.toggleLineWrap = function() {
      $scope.lineWrap = !$scope.lineWrap;
      responseTextEditor.setOption('lineWrapping', $scope.lineWrap);
    };

    $scope.undo = function() {
      responseTextEditor.undo();
    };

    $scope.redo = function() {
      responseTextEditor.redo();
    };

    $scope.$watch('defaultMode', function() {
      $scope.mode = $scope.defaultMode;
    });

    $scope.$watch('mode', function() {
      var settings = null;

      switch($scope.mode) {
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
        content: '=',
        defaultMode: '=',
        refresh: '=',
        onBlur: '&'
      }
    };
  });