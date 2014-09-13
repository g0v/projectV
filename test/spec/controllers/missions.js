'use strict';

describe('Controller: MissionsCtrl', function () {

  // load the controller's module
  beforeEach(module('projectVApp'));

  var MissionsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MissionsCtrl = $controller('MissionsCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
