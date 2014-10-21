'use strict';

describe('Service: FINALDATE', function () {

  // load the service's module
  beforeEach(module('projectVApp'));

  // instantiate service
  var FINALDATE;
  beforeEach(inject(function (_FINALDATE_) {
    FINALDATE = _FINALDATE_;
  }));

  it('should do something', function () {
    expect(!!FINALDATE).toBe(true);
  });

});
