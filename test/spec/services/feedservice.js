'use strict';

describe('Service: FeedService', function () {

  // load the service's module
  beforeEach(module('projectVApp'));

  // instantiate service
  var FeedService;
  beforeEach(inject(function (_FeedService_) {
    FeedService = _FeedService_;
  }));

  it('should do something', function () {
    expect(!!FeedService).toBe(true);
  });

});
