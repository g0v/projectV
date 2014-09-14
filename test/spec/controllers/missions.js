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

  it('should have 3 missions', function() {
    expect(scope.missions.length).toBe(3);
  });
});
