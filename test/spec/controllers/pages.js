'use strict';

describe('Controller: PagesCtrl', function () {

  // load the controller's module
  beforeEach(module('projectVApp'));

  var PagesCtrl,
    location,
    mockUrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    location = {
      url: function() {
        return mockUrl;
      }
    };
    PagesCtrl = $controller('PagesCtrl', {
      $scope: scope,
      $location: location
    });
  }));

  it('should get active status for current page', function() {
    mockUrl = '/test';
    expect(scope.getActive('test')).toEqual('active');
  });

  it('should get empty string if id does not match', function() {
    mockUrl = '/test';
    expect(scope.getActive('news')).toEqual('');
  });

  it('shoud have 6 pages', function() {
    expect(scope.pages.length).toBe(6);
  });

  it('shoud return #/<PAGE_ID> if page.href is not defined', function() {
    expect(scope.getHref({id: 'test'})).toEqual('#/test');
  });

  it('shoud return href if page.href exists', function() {
    expect(scope.getHref({href: 'external'})).toEqual('external');
  });

  it('should return _self if page.target is not defined', function() {
    expect(scope.getTarget({})).toEqual('_self');
  });

  it('should return target if page.target is defined', function() {
    expect(scope.getTarget({ target: '_blank'})).toEqual('_blank');
  });
});
