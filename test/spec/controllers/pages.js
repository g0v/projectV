'use strict';

describe('Controller: PagesCtrl', function () {

  // load the controller's module
  beforeEach(module('projectVApp'));

  var PagesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PagesCtrl = $controller('PagesCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
