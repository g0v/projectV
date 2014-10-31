'use strict';

/**
 * @ngdoc function
 * @name projectVApp.controller:MissionsCtrl
 * @description
 * # MissionsCtrl
 * Controller of the projectVApp
 */
angular.module('projectVApp')
  .controller('MissionsCtrl', function ($scope ,$modal) {
    $scope.missions = [
      { id: 'TPE-4', name: 'TPE-4', description: '童些趣錯事立報式而變受……論技麼康應居孩了定同大李本天心備，方告那下好當放一的科不復多神分發自原事慢費日華國心風出和夜大'},
      { id: 'TPQ-1', name: 'TPQ-1', description: '童些趣錯事立報式而變受……論技麼康應居孩了定同大李本天心備，方告那下好當放一的科不復多神分發自原事慢費日華國心風出和夜大' },
      { id: 'TPQ-6', name: 'TPQ-6', description: '童些趣錯事立報式而變受……論技麼康應居孩了定同大李本天心備，方告那下好當放一的科不復多神分發自原事慢費日華國心風出和夜大' }
    ];

    $scope.registerDialog = function(type) {
      var modalInstance = $modal.open({
        templateUrl:'views/register.html',
        controller: 'registerDialogController',
        size: 'md',
        resolve: {
          data: function() {
            return {
              county: 'Taiwan',
              type: type,
              nonArea: true,
              vsId: 'Taiwan',//$scope.myscope.currentVsTab.vsId,
              vsName: 'Taiwan',//$scope.myscope.currentVsTab.vsName, 
              supCount: '',//$scope.myscope.vsInfo[$scope.myscope.currentVsTab.vsId].sItemCount,
              supWeight: '',//$scope.myscope.vsInfo[$scope.myscope.currentVsTab.vsId].vweight
            };
          }   
        }   
      }); 
      modalInstance.result.then(function(result){
        console.log('send',result);
        //loadData(false);
        $scope.$emit('dataReload');
      }); 
    };  

  });
