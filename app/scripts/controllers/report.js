'use strict';

/**
 * @ngdoc function
 * @name projectVApp.controller:ReportCtrl
 * @description
 * # ReportCtrl
 * Controller of the projectVApp
 */
angular.module('projectVApp')
  .controller('ReportCtrl', 
  ['$scope', '$timeout', '$modalInstance', 'Facebook', 'voteInfoService', 'data', 
  function($scope, $timeout, $modalInstance, Facebook, voteInfoService, data) {

  $scope.errortype = [
    '投開票所在地圖上標錯位置',
    '投開票所名稱有誤',
    '投開票所地址有誤',
    '投開票所的所屬里有誤',
    '此投開票所不存在',
    '其他',
  ];

  $scope.hassave = false;

  $scope.report = {
    county:data.county,
    poll:data.vsId,
    type:$scope.errortype[0],
    content: '',
  };

  $scope.save = function(){
    $scope.hassave = true;
    voteInfoService.saveReport($scope.report,function(){
      setTimeout(function(){$modalInstance.close(true);},1000);
    });
  }

  $scope.cancel = function () {
     $modalInstance.dismiss('cancel');
  };

}]);
