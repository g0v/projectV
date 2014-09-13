'use strict';

/**
 * @ngdoc function
 * @name projectVApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the projectVApp
 */
angular.module('projectVApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
