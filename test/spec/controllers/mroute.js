'use strict';

describe('Controller: MrouteCtrl', function () {

  // load the controller's module
  beforeEach(module('projectVApp'));

  var MrouteCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MrouteCtrl = $controller('MrouteCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
