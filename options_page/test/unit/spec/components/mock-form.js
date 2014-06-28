'use strict';

describe('Component: mockFormComponent', function () {

  describe('Directive: mockFormComponent', function () {
    var element, scope, $compile;

    beforeEach(function () {

      module('optionsPage');

      inject(function ($rootScope, _$compile_) {
        scope = $rootScope.$new();
        $compile = _$compile_;
      });

    });

    it('should have the component class', function () {
      element = angular.element('<mock-form-component></mock-form-component>');
      element = $compile(element)(scope);
      scope.$digest();
      expect(element).toHaveClass('mock-form-component');
    });

    it('should render text', function () {
      element = angular.element('<mock-form-component></mock-form-component>');
      element = $compile(element)(scope);
      scope.$digest();
//      expect(element.text()).toContain('MockForm');
    });

  });

  describe('Controller: mockFormComponentCtrl', function () {

    var Ctrl, scope, element;

    beforeEach(function () {

      module('optionsPage');

      inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        element = angular.element('<mock-form-component></mock-form-component>');
        Ctrl = $controller('mockFormComponentCtrl', {
          $scope: scope,
          $element: element
        });
      });
    });

    it('should render a message', function () {
//      expect(scope.text).toContain('MockForm');
    });
  });

});