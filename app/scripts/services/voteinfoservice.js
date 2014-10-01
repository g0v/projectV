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
    var voteDataAry = {};

    var villageSumAry = {};
    //this.villageSum = villageSum;

    var countyVillageAry = {}; 
    //var villSum = null;

    var villageAreaAry = {}; 

    var countyBoundAry = {};

    //this.getAllVoteInfo = function(county) {
    //  var deferred = $q.defer();
    //  function postProcess(county) {
    //    deferred.notify({
    //      'id': county,
    //      'content': voteInfos[county]
    //    });
    //  }
    //  $http.get('json/mly/8/' + county + '.json').then(function(res) {
    //    voteInfos[county] = res.data;
    //    postProcess(county);
    //  });
    //     
    //  return deferred.promise;
    //};

    //this.getCountyBound = function(county) {
    //  var deferred = $q.defer();
    //  
    //  function postProcess(county) {
    //    deferred.resolve(countyBoundAry[county]);
    //  }

    //  if(countyBoundAry[county]){
    //    postProcess(county);
    //  }
    //  else{
    //    var query = 'json/twVote1982/' + county + '.json';
    //    $http.get(query).then(function(res) {
    //      countyBoundAry[county] = res.data;
    //      postProcess(county);
    //    });
    //  }
    //  return deferred.promise;
    //};



    this.getAllVotestatData = function(county) {
      var deferred = $q.defer();
      
      function postProcess(county) {
        deferred.resolve(voteDataAry[county]);
      }

      if(voteDataAry[county]){
        postProcess(county);
      }
      else{
        var query = 'json/votestat/' + county + '.json';
        $http.get(query).then(function(res) {
          voteDataAry[county] = res.data;
          postProcess(county);
        });
      }
      return deferred.promise;
    };


    this.getAllVillageSum = function(county){
      var deferred = $q.defer();
      function postProcess(county) {
        deferred.resolve(villageSumAry[county]);
      }
      if(villageSumAry[county]){
        postProcess(county);
      }
      else{
        $http.get('json/villageSum/' + county + '.json').then(function(res) {
          villageSumAry[county] = res.data;
          postProcess(county);
        });
      }
      return deferred.promise;
    };


    this.getCountyVillage = function(county) {
      var deferred = $q.defer();

      function postProcess(countyVillage, villageSum) {
        deferred.resolve( {
          countyVillage:countyVillage,
          villageSum:villageSum,
        });
      }

      if (countyVillageAry[county] && villageSumAry[county]) {
        postProcess(countyVillageAry[county], villageSumAry[county]);
      } 

      else {
        this.getAllVillageSum(county).then( function(villageSum){ 
          if (countyVillageAry[county]){
            postProcess(countyVillageAry[county], villageSum);
          }
          else{
            $http.get('json/twCountyVillage/' + county + '.json').then(function(res) {
              countyVillageAry[county] = res.data;
              postProcess(countyVillageAry[county] , villageSum);
            });
          }
        });
      }
      return deferred.promise;
    };


    this.getStaticVillageData = function(county){
      var deferred = $q.defer();

      this.getCountyVillage(county).then(function(countVillData) {
        var countVill = countVillData.countyVillage; 
        var villSum = countVillData.villageSum;
        villageAreaAry[county] = villageAreaAry[county] ? villageAreaAry[county] : {};
        var villageArea = villageAreaAry[county];
        //console.log('villSum',villSum);

        function postProcess(vakey, townName, villageName){
          var mvillsum = 0;
          if(villSum[townName] && villSum[townName][villageName]){
            mvillsum = villSum[townName][villageName];
          }
          deferred.notify({villageArea: villageArea[vakey], villageSum:mvillsum, townName:townName, villageName:villageName});
        } 

        angular.forEach(countVill, function(villages, townName) {
          angular.forEach(villages, function(villageName) {
            var vakey = county+'_'+townName+'_'+villageName;

            if(villageArea[vakey]){
              postProcess(vakey, townName, villageName);
            }

            //console.log(townName,villageName);        
            var query = 'json/twVillage1982/' + county + '/' + townName + '/' + villageName + '.json';

            $http.get(query).success(function(data) {
              villageArea[vakey] = data;
              postProcess(vakey, townName, villageName);
            }).error( function(err) {
              console.log(err);
            });

          });
        });
      });
      return deferred.promise;
    };

  });
