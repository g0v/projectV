'use strict';

describe('Controller: AftermapCtrl', function () {

  // load the controller's module
  beforeEach(module('projectVApp'));

  var AftermapCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AftermapCtrl = $controller('AftermapCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
