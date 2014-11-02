'use strict';

describe('Controller: FaqCtrl', function () {

  // load the controller's module
  beforeEach(module('projectVApp'));

  var FaqCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    FaqCtrl = $controller('FaqCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
