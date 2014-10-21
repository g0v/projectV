'use strict';

/**
 * @ngdoc function
 * @name projectVApp.controller:DialogCtrl
 * @description
 * # DialogCtrl
 * Controller of the projectVApp
 */
angular.module('projectVApp')
  .controller('DialogCtrl',
    ['$scope', 'data', 
    function($scope, data) {


    $scope.discope = {}

    $scope.discope.title = data.title;
    $scope.discope.content = data.content;

    $scope.discope.close = function(){
       $modalInstance.dismiss('cancel');
    }

  }]);
