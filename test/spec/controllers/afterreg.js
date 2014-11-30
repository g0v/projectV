'use strict';

describe('Controller: AfterregCtrl', function () {

  // load the controller's module
  beforeEach(module('projectVApp'));

  var AfterregCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AfterregCtrl = $controller('AfterregCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
