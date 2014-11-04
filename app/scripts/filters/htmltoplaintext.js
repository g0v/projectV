'use strict';

/**
 * @ngdoc filter
 * @name projectVApp.filter:htmlToPlaintext
 * @function
 * @description
 * # htmlToPlaintext
 * Filter in the projectVApp.
 */
angular.module('projectVApp')
  .filter('htmlToPlaintext', function () {
    return function (input) {
      input = input || '';
      return String(input).replace(/<[^>]+>/gm, '');
    };
  });
