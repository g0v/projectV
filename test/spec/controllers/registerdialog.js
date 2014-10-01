'use strict';

describe('Controller: RegisterdialogcontrollerCtrl', function () {

  // load the controller's module
  beforeEach(module('projectVApp'));

  var RegisterdialogcontrollerCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RegisterdialogcontrollerCtrl = $controller('RegisterdialogcontrollerCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
