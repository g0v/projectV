'use strict';

describe('Filter: htmlToPlaintext', function () {

  // load the filter's module
  beforeEach(module('projectVApp'));

  // initialize a new instance of the filter before each test
  var htmlToPlaintext;
  beforeEach(inject(function ($filter) {
    htmlToPlaintext = $filter('htmlToPlaintext');
  }));

  it('should return the input prefixed with "htmlToPlaintext filter:"', function () {
    var text = 'angularjs';
    expect(htmlToPlaintext(text)).toBe('htmlToPlaintext filter: ' + text);
  });

});
