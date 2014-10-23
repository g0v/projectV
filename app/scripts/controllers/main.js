'use strict';

/**
 * @ngdoc function
 * @name projectVApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the projectVApp
 */
angular.module('projectVApp')
  .controller('MainCtrl', function ($scope, Countdown, FINALDATE) {
    $scope.time = Countdown.getTime(new Date(FINALDATE), new Date());
  });
