'use strict';

describe('Component: headerListComponent', function () {

  describe('Directive: headerListComponent', function () {
    var element, scope, $compile;

    beforeEach(function () {

      module('optionsPage');

      inject(function ($rootScope, _$compile_) {
        scope = $rootScope.$new();
        $compile = _$compile_;
      });

    });

    it('should have the component class', function () {
      element = angular.element('<header-list-component></header-list-component>');
      element = $compile(element)(scope);
      scope.$digest();
      expect(element).toHaveClass('header-list-component');
    });

    it('should render text', function () {
      element = angular.element('<header-list-component></header-list-component>');
      element = $compile(element)(scope);
      scope.$digest();
      expect(element.text()).toContain('headerList');
    });

  });

  describe('Controller: headerListComponentCtrl', function () {

    var Ctrl, scope, element;

    beforeEach(function () {

      module('optionsPage');

      inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        element = angular.element('<header-list-component></header-list-component>');
        Ctrl = $controller('headerListComponentCtrl', {
          $scope: scope,
          $element: element
        });
      });
    });

    it('should render a message', function () {
      expect(scope.text).toContain('headerList');
    });
  });

});