'use strict';

describe('Controller: DialogCtrl', function () {

  // load the controller's module
  beforeEach(module('projectVApp'));

  var DialogCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DialogCtrl = $controller('DialogCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
