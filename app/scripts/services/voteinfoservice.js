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

    this.getWinner = function(area,county) {
      var winner = {};
      var statistic = this.voteInfos[county];
      var scount = [];
      var stotal = 0;
      if (statistic !== undefined) {
         var overview = statistic;
         statistic = statistic['投票狀況'];
         angular.forEach(area, function(part) {
            statistic = statistic[part];
         });
         for(var i=0; i< overview['候選人'].length;i++){
            scount.push(0);
         }
         angular.forEach(statistic, function(val1){
            angular.forEach(val1['得票數'], function(val2,idx2){
              scount[idx2] += val2;
            });
            stotal += val1['選舉人數'];
         });
         var index = scount.indexOf(Math.max.apply(this, scount));
         winner.name = overview['候選人'][index][1];
         winner.party = overview['候選人'][index][2];
         winner.ratio = (scount[index]/stotal) * 100;
         winner.count = scount[index];
         return winner;
      }
    };

  });
