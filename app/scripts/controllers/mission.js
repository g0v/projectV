'use strict';

/**
 * @ngdoc function
 * @name projectVApp.controller:MissionCtrl
 * @description
 * # MissionCtrl
 * Controller of the projectVApp
 */
angular.module('projectVApp')
  .controller('MissionCtrl', 

  ['$scope', '$route', '$routeParams','voteInfoService',
  function ($scope, $route, $routeParams, voteInfoService ) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  }]);
