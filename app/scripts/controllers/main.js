'use strict';

/**
 * @ngdoc function
 * @name projectVApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the projectVApp
 */
angular.module('projectVApp')
  .controller('MainCtrl', function ($scope,  Countdown, FINALDATE, $interval, $anchorScroll) {
    $anchorScroll();
    $scope.time = Countdown.getTime(new Date(FINALDATE), new Date());

    $interval(function() {
      $scope.time = Countdown.getTime(new Date(FINALDATE), new Date());
    }, 1000);
  });
