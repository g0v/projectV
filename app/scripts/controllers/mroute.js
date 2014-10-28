'use strict';

/**
 * @ngdoc function
 * @name projectVApp.controller:MrouteCtrl
 * @description
 * # MrouteCtrl
 * Controller of the projectVApp
 */
angular.module('projectVApp')
  .controller('MrouteCtrl', 
    ['$scope', '$routeParams', '$location', 
    function($scope, $routeParams, $location) {

    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    //$scope.rscope = {};
    var county = $routeParams.county;

    //setTimeout(function(){
      $location.path('/mission/'+county);
    //},10);

  }]);
