'use strict';

describe('Controller: MissionCtrl', function () {

  // load the controller's module
  beforeEach(module('projectVApp'));

  var MissionCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MissionCtrl = $controller('MissionCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
