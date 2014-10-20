'use strict';

var MAP_BUFFER_TIME = 20;

/**
 * @ngdoc service
 * @name projectVApp.voteInfoService
 * @description
 * # voteInfoService
 * Service in the projectVApp.
 */
angular.module('projectVApp')
  .service('voteInfoService', function voteInfoService($q, $http) {
   
    Parse.initialize(
      "QDCw1Ntq4E9PmPpcuwKbO2H0B1H0y77Vj1ScO9Zx",
      "6jaJvf46pYub6Ej9IjhhIXNtZjTqRY0P4IqAJFhH"
    );

    var citizenParse = Parse.Object.extend("citizen");
    //var county = 'TPE-4';

    var citizenDataAry = {}; //dynamic

    var villageSumAry = {}; //dynamic

    var voteStatInfoAry = {}; //dynamic

    var countyVillageAry = {}; //dynamic

    var voteDataAry = {};

    var villageAreaAry = {}; 

    var countyBoundAry = {};

    var my_this = this;

    this.supplementItem = { 
      'pen':     [5,'筆'], 
      'board':   [5,'連署板'],
      'water':   [5,'水'],
      'chair':   [2,'椅子'], 
      'desk':    [1,'桌子'], 
      'umbrella':[1,'五百萬傘'], 
    };
    
    this.volCount = 5;

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

    this.getCitizenData = function(county) { //dynamic
      var deferred = $q.defer();
      
      function postProcess(county) {
        deferred.resolve(citizenDataAry[county]);
      }

      if(citizenDataAry[county]){
        postProcess(county);
      }

      else{
        var query = new Parse.Query(citizenParse);
        query.limit(1000);
        query.find({
          success: function(results) {
            citizenDataAry[county] = results;
            postProcess(county);
          }
        });
      }
      return deferred.promise;
    };


    this.getAllVillageSum = function(county){  //dynamic
      var deferred = $q.defer();
      function postProcess(county) {
        deferred.resolve(villageSumAry[county]);
      }
      if(villageSumAry[county]){
        postProcess(county);
      }
      else{
          $q.all([ my_this.getAllVotestatData(county), my_this.getCitizenData(county) , $http.get('json/villageVotestat/' + county + '.json')])
          .then(function(data){
            var voteStatData = data[0];
            var citizenData = data[1];
            var villageVotestat = data[2].data;
            var voteStatSum = {};
            var voteStatWeight = {};
            for (var i = 0; i < citizenData.length; i++) { 
              var object = citizenData[i];
              var vsid = object.get('poll');
              voteStatSum[vsid] = voteStatSum[vsid] ? voteStatSum[vsid]+1 : 1;
            }

            for(var ct in voteStatData){
              for(var i=0 ; i< voteStatData[ct].length; i++){
                voteStatWeight[voteStatData[ct][i].id] = voteStatData[ct][i].power;
              }
            } 

            for(var id in voteStatSum){
              voteStatSum[id] = (voteStatSum[id] > voteStatWeight[id]*my_this.volCount) ? 1 : voteStatSum[id] / (voteStatWeight[id]*my_this.volCount);
            }

            var villageSum = {}; 
            for(var townName in  villageVotestat){
              villageSum[townName] = {};
              for(var villageName in villageVotestat[townName]){
                var voteStatAry = villageVotestat[townName][villageName];
                var sum = 0;
                for(var i=0; i< voteStatAry.length; i++){
                  if(voteStatSum[voteStatAry[i]]){
                    sum += voteStatSum[voteStatAry[i]];
                  }
                }
                villageSum[townName][villageName] = sum/voteStatAry.length;
              }
            }
            villageSumAry[county] = villageSum;
            postProcess(county);
          }); 
      }
      return deferred.promise;
    };

    this.getAllVoteStatInfo = function(county){ //dynamic
      var deferred = $q.defer();
      function postProcess(county) {
        deferred.resolve(voteStatInfoAry[county]);
      }
      if(voteStatInfoAry[county]){
        postProcess(county);
      }
      else{
        $q.all([my_this.getCitizenData(county), my_this.getAllVotestatData(county)]).then(
          function(data){
            var citizenData = data[0];
            var votestatData = data[1];
            var voteStatInfo = {};
            for(var townName in votestatData){
              for(var i=0; i<votestatData[townName].length; i++){
                var voteStat = votestatData[townName][i];
                voteStatInfo[voteStat.id] = {
                  vlist: [],
                  //vlistTotal: 0,
                  volunteer: 0,
                  slist: [], 
                  sItemCount: {},
                  //sItemTotal: {}, 
                  sItemSum: 0,
                  sTotalSum: 0,
                  supplement: 0, 
                  vweight:voteStat.power
                };
              } 
            }
            //console.log('voteStatInfo',voteStatInfo);
            for(var i=0; i<citizenData.length; i++){
              var object = citizenData[i];
              var vsid = object.get('poll');
              //console.log('vsid',vsid);
              if(object.get('volunteer')){
                voteStatInfo[vsid].vlist.push([object.get('fid'),object.get('name')]);
              }
              var hasitem = false;
              var resource = object.get('resource');
              for(var item in my_this.supplementItem){
                if(!voteStatInfo[vsid].sItemCount[item]){
                  voteStatInfo[vsid].sItemCount[item] = 0;
                }
                if(resource[item] && parseInt(resource[item]) > 0 ){
                  voteStatInfo[vsid].sItemCount[item] += parseInt(resource[item]);
                  hasitem = true;
                }
              }
              if(hasitem){
                voteStatInfo[vsid].slist.push([object.get('fid'),object.get('name')]);
              }
            }
            for(var id in voteStatInfo){
              var factor = voteStatInfo[id].vweight*my_this.volCount;

              //voteStatInfo[id].vlistTotal = factor;
              voteStatInfo[id].volunteer = voteStatInfo[id].vlist.length > factor ? 1 : voteStatInfo[id].vlist.length/factor;

              var totalSum = 0;
              var itemSum = 0;
              for(var item in my_this.supplementItem){
                var itemTotal =  my_this.supplementItem[item][0] * voteStatInfo[id].vweight
                totalSum += itemTotal;
                if(!voteStatInfo[id].sItemCount[item]){
                  voteStatInfo[id].sItemCount[item] = 0;
                }
                itemSum += ( voteStatInfo[id].sItemCount[item] >= itemTotal ? itemTotal : voteStatInfo[id].sItemCount[item] );
              }
              //console.log('sitem total',voteStatInfo[id].sItemTotal);
              //if(itemSum >0){
              //  console.log('sitem itemSum > 0',itemSum);
              //}
              //console.log('sitem count',voteStatInfo[id].sItemCount);
              voteStatInfo[id].sItemSum = itemSum;
              voteStatInfo[id].sTotalSum = totalSum;
              voteStatInfo[id].supplement = itemSum > totalSum ? 1 : itemSum/totalSum;
            }

            voteStatInfoAry[county] = voteStatInfo;
            postProcess(county);
        });
      }
      return deferred.promise;
    };
    

    this.getCountyVillage = function(county) { //dynamic
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
      var countAll = 0;
      var countTemp = 0;
      var count = 0;

      this.getCountyVillage(county).then(function(countVillData) {
        var countVill = countVillData.countyVillage; 
        var villSum = countVillData.villageSum;
        villageAreaAry[county] = villageAreaAry[county] ? villageAreaAry[county] : {};
        var villageArea = villageAreaAry[county];
        //console.log('villSum',villSum);

        function postProcess(vakey, townName, villageName){
          countTemp += 1;
          setTimeout(function(){ 
            count +=1 ;
            var mvillsum = 0;
            if(villSum[townName] && villSum[townName][villageName]){
              mvillsum = villSum[townName][villageName];
            }
            deferred.notify({villageArea: villageArea[vakey], villageSum:mvillsum, loadingStatus:count/countAll});
            console.log('postProcess',townName,villageName);
            if(count == countAll){
              deferred.resolve( { complete:true , loadingStatus:count/countAll});
              console.log("complete");
            }
          },MAP_BUFFER_TIME*countTemp);
        } 

        angular.forEach(countVill, function(villages, townName) {
          angular.forEach(villages, function(villageName) {
            countAll += 1;
            var vakey = county+'_'+townName+'_'+villageName;

            if(villageArea[vakey]){
              postProcess(vakey, townName, villageName);
            }

            //console.log(townName,villageName);        
            else{
              var query = 'json/twVillage1982/' + county + '/' + townName + '/' + villageName + '.json';

              $http.get(query).success(function(data) {
                villageArea[vakey] = data;
                postProcess(vakey, townName, villageName);
              }).error( function(err) {
                villageArea[vakey] = {};
                postProcess(vakey, townName, villageName);
              });

            }

          });
        });
      });
      return deferred.promise;
    };
    
    this.saveCitizen = function(data, cb){
      var czparse = new citizenParse();
      czparse
        .save(data)
        .then(function(object) {
          cb()
        });
    };

    this.resetDynamics = function(county){
      if(citizenDataAry[county]){
        delete citizenDataAry[county];
      }
      if(villageSumAry[county]){
        delete villageSumAry[county];
      }
      if(voteStatInfoAry[county]){
        delete voteStatInfoAry[county];
      }
      if(countyVillageAry[county]){
        delete countyVillageAry[county];
      }
    };

  });
