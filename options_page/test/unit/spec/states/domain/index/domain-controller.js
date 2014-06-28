'use strict';

describe('Controller(/domain): DomainCtrl', function () {

  var DomainCtrl, scope;

  beforeEach(function () {

    module('optionsPage');

    inject(function ($controller, $rootScope) {
      scope = $rootScope.$new();
      DomainCtrl = $controller('DomainCtrl', {
        $scope: scope
      });
    });
  });

  it('should attach init data to scope', function () {
    expect(scope.foo).toEqual('bar');
  });
});