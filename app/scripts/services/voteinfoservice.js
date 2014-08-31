'use strict';

/**
 * @ngdoc service
 * @name mlymapApp.voteInfoService
 * @description
 * # voteInfoService
 * Service in the mlymapApp.
 */
angular.module('mlymapApp')
  .service('voteInfoService', function voteInfoService($q, $http) {
    var counties;
    var voteInfos = {};
    this.voteInfos = voteInfos;

    this.getCountyIds = function() {
      var deferred = $q.defer();

      if (counties) {
        deferred.resolve(counties);
      } else {
        $http.get('json/counties.json').then(function(res) {
          counties = res.data;
          deferred.resolve(res.data);
        });
      }
      return deferred.promise;
    };

    this.getAllVoteInfo = function() {
      var deferred = $q.defer();
      var count = 0;

      function postProcess(county) {
        count++;
        deferred.notify({
          'id': county,
          'content': voteInfos[county]
        });
        if (count === counties.length) {
          deferred.resolve(voteInfos);
        }
      }

      this.getCountyIds().then(function(counties) {
        //angular.forEach(counties, function(county, i) {
		  var county = 'TPE-4';
			//console.log('counties',county);
          if (voteInfos[county]) {
            postProcess(county);
          } else {
				//console.log('get2',county);
            $http.get('json/mly/8/' + county + '.json').then(function(res) {
              voteInfos[county] = res.data;
              postProcess(county);
            });
          }
        //});
      });
      return deferred.promise;
    };

    this.getWinner = function(area) {
		//console.log('area',area);
		//console.log('voteInfo',voteInfos);
      var winner = {};
      var statistic = this.voteInfos['TPE-4'];
	   //console.log('statistic',statistic);
		if (statistic != undefined){
			var overview = statistic;
			if (area.length > 0) {
			  //console.log('statistic',statistic);
			  statistic = statistic['投票狀況'];
			  angular.forEach(area, function(part) {
			//	 if (part.indexOf("undefined") ==-1){
					 //console.log('part',part);
					 statistic = statistic[part];
					 //console.log('statistic',statistic);
			//	 }
			  });
			  statistic = statistic[0];
			} else {
			  statistic = statistic['小記']['總計'];
			}
			var arr = statistic['得票數'];
			var index = arr.indexOf(Math.max.apply(this, arr));
			winner.name = overview['候選人'][index][1];
			winner.party = overview['候選人'][index][2];
			winner.ratio = (statistic['得票率'][index] * 100);
			winner.count = statistic['得票數'][index];
			return winner;
		}
    };
  });
