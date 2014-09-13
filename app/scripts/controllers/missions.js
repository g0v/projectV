'use strict';

/**
 * @ngdoc function
 * @name projectVApp.controller:MissionsCtrl
 * @description
 * # MissionsCtrl
 * Controller of the projectVApp
 */
angular.module('projectVApp')
  .controller('MissionsCtrl', function ($scope) {
    $scope.missions = [
      { id: 'TPE-4', name: 'TPE-4', description: '童些趣錯事立報式而變受……論技麼康應居孩了定同大李本天心備，方告那下好當放一的科不復多神分發自原事慢費日華國心風出和夜大'},
      { id: 'TPQ-1', name: 'TPQ-1', description: '童些趣錯事立報式而變受……論技麼康應居孩了定同大李本天心備，方告那下好當放一的科不復多神分發自原事慢費日華國心風出和夜大' },
      { id: 'TPQ-6', name: 'TPQ-6', description: '童些趣錯事立報式而變受……論技麼康應居孩了定同大李本天心備，方告那下好當放一的科不復多神分發自原事慢費日華國心風出和夜大' }
    ];
  });
