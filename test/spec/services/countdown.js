'use strict';

describe('Service: Countdown', function () {

  // load the service's module
  beforeEach(module('projectVApp'));

  // instantiate service
  var Countdown;
  beforeEach(inject(function (_Countdown_) {
    Countdown = _Countdown_;
  }));

  it('should do something', function () {
    expect(!!Countdown).toBe(true);
  });

});
