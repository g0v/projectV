'use strict';

/**
 * @ngdoc service
 * @name projectVApp.voteInfoService
 * @description
 * # voteInfoService
 * Service in the projectVApp.
 */
angular.module('projectVApp')
  .service('voteInfoService', function voteInfoService($q, $http) {

    //var county = 'TPE-4';
    var voteInfos = {};
    this.voteInfos = voteInfos;

    var villageSum = null
    this.villageSum = villageSum;

    this.getAllVoteInfo = function(county) {
      var deferred = $q.defer();
      function postProcess(county) {
        deferred.notify({
          'id': county,
          'content': voteInfos[county]
        });
      }
      if (voteInfos[county]) {
        postProcess(county);
      } else {
        $http.get('json/mly/8/' + county + '.json').then(function(res) {
          voteInfos[county] = res.data;
          postProcess(county);
        });
      }
      return deferred.promise;
    };

    this.getAllVillageSum = function(county){
      var deferred = $q.defer();
      function postProcess(county) {
        deferred.notify({
          'id': county,
          'content': villageSum,
        });
      }
      if (villageSum) {
        postProcess(county);
      } else {
        $http.get('json/villageSum/' + county + '.json').then(function(res) {
          villageSum = res.data;
          postProcess(county);
        });
      }
      return deferred.promise;
    };

  });
