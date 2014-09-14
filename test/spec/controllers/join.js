'use strict';

describe('Controller: JoinCtrl', function () {

  // load the controller's module
  beforeEach(module('projectVApp'));

  var JoinCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    JoinCtrl = $controller('JoinCtrl', {
      $scope: scope
    });
  }));
});
