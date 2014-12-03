'use strict';

/**
 * @ngdoc function
 * @name projectVApp.controller:MissionsCtrl
 * @description
 * # MissionsCtrl
 * Controller of the projectVApp
 */
angular.module('projectVApp')
  .controller('MissionsCtrl', function ($scope, Countdown, $modal, FINALDATE_DISTRICTS) {
    $scope.missions = [
      { id: 'TPE-4', name: 'TPE-4',
        finalDate: Countdown.getTime(new Date(FINALDATE_DISTRICTS.TPE4), new Date())
      },
      { id: 'TPQ-1', name: 'TPQ-1',
        finalDate: Countdown.getTime(new Date(FINALDATE_DISTRICTS.TPQ1), new Date())
      },
      { id: 'TPQ-6', name: 'TPQ-6',
        finalDate: Countdown.getTime(new Date(FINALDATE_DISTRICTS.TPQ6), new Date())
      }
    ];

    var modalInstance;

    $scope.registerDialog = function(type) {
      if(true){
        modalInstance = $modal.open({
          templateUrl:'views/closereg.html',
          controller: 'registerCloseController',
          size: 'md',
          resolve: {
            data: function() {
              return {
                county: 'Taiwan',
                type: type,
              };
            }
          }
        });
      }
      else{
        modalInstance = $modal.open({
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
        modalInstance.result.then(function(){
          //console.log('send',result);
          //loadData(false);
          //$scope.$emit('dataReload');
        });
      }
    };

  });
