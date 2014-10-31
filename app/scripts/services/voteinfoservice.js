'use strict';

//var MAP_BUFFER_TIME = 10;
var USE_CITIZEN_DB = true;

var MY_HTTP_DELAY = 200;

/**
 * @ngdoc service
 * @name projectVApp.voteInfoService
 * @description
 * # voteInfoService
 * Service in the projectVApp.
 */
angular.module('projectVApp')
  .service('voteInfoService', function voteInfoService($q, $http) {
    this.MAP_BUFFER_TIME = 10;
   
    Parse.initialize(
      "QDCw1Ntq4E9PmPpcuwKbO2H0B1H0y77Vj1ScO9Zx",
      "6jaJvf46pYub6Ej9IjhhIXNtZjTqRY0P4IqAJFhH"
    );

    var citizenParse = Parse.Object.extend("citizen");
  
    var pollParse = Parse.Object.extend("poll");

    var volunteerParse = Parse.Object.extend("volunteer");


    var supplementParse = Parse.Object.extend("resource");
    //var county = 'TPE-4';

    var citizenDataAry = {}; //dynamic

    var villageSumAry = {}; //dynamic

    var voteStatInfoAry = {}; //dynamic

    var countyVillageAry = {}; //dynamic

    var voteDataAry = {};

    var villageAreaAry = {}; 

    var villageVotestatAry = {};

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

     
    var votestatHttp = 0;
    var twCountyVillageHttp = 0;
    var villageVotestatHttp = 0;
    var villageSumHttp = 0;

    this.getAllVoteStatData = function(county) {
      var deferred = $q.defer();
      votestatHttp += 1;
      console.log('votestatHttp',votestatHttp); 
      function postProcess(county) {
        votestatHttp = 0;
        deferred.resolve(voteDataAry[county]);
      }
      setTimeout(function(){
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
      },MY_HTTP_DELAY*votestatHttp);
      return deferred.promise;
    };

    this.getAllVillageVotestatData = function(county) {
      var deferred = $q.defer();
      villageVotestatHttp += 1;
      console.log('villageVotestatHttp',villageVotestatHttp); 
      
      function postProcess(county) {
       // console.log('villageVotestat',villageVotestatAry[county]);
        villageVotestatHttp = 0;
        deferred.resolve(villageVotestatAry[county]);
      }

      setTimeout(function(){
        if(villageVotestatAry[county]){
          postProcess(county);
        }
        else{
          var query = 'json/villageVotestat/' + county + '.json';
          $http.get(query).then(function(res) {
            villageVotestatAry[county] = res.data;
            postProcess(county);
          });
        }
      },MY_HTTP_DELAY*villageVotestatHttp);

      return deferred.promise;
    };


    this.getCountyVillage = function(county) { //dynamic
      var deferred = $q.defer();
      twCountyVillageHttp += 1;
      console.log('twCountyVillageHttp',twCountyVillageHttp); 
      function postProcess(countyVillage, villageSum) {
        twCountyVillageHttp = 0;
        deferred.resolve( {
          countyVillage:countyVillage,
          villageSum:villageSum,
        });
      }

      setTimeout(function(){
        if (countyVillageAry[county] && villageSumAry[county]) {
          postProcess(countyVillageAry[county], villageSumAry[county]);
        } 

        else {
          my_this.getAllVillageSum(county).then( function(villageSum){ 
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
      },MY_HTTP_DELAY*twCountyVillageHttp);

      return deferred.promise;
    };


    this.getParsedQuery = function(query,key,val,limit){
      if(!limit){
        limit = 1000
      }
      //else{
      //  //console.log('limit',limit);
      //}
      var deferred = $q.defer();
      query.descending("createdAt");
      query.equalTo(key, val);
      query.limit(limit);
      query.find({
        success: function(results) {
          deferred.resolve(results);
        },
        error: function(object, error) {
          console.log('error',object,error);
        }
      });
      return deferred.promise;
    };

    this.getCitizenData = function(county) { //dynamic
      var deferred = $q.defer();
      function postProcess(county) {
        deferred.resolve(citizenDataAry[county]);
      }
      function convertObject(obj_in, type){
        if(USE_CITIZEN_DB){
          return {
            'county': obj_in.get('county'),
            'poll': obj_in.get('poll'),
            'resource': obj_in.get('resource'),
            'volunteer': obj_in.get('volunteer'),
          }; 
        }
        else{
          var obj_out = { 
            'email': obj_in.get('email'),
            'fid': obj_in.get('fid'),
            'mobile': obj_in.get('mobile'),
            'name': obj_in.get('name'),
            'poll': obj_in.get('poll'),
            'county': obj_in.get('county')
          };
          if(type == 'volunteer'){
            obj_out['resource'] = {};
            for(var item in my_this.supplementItem){
              obj_out['resource'][item] = 0;
            }
            obj_out['volunteer'] = true;
          }
          else if(type == 'supplement'){
            obj_out['resource'] = obj_in.get('resource'); 
            obj_out['volunteer'] = false;
          }
          return obj_out;
        }
      }
      if(citizenDataAry[county]){
        postProcess(county);
      }
      else{
        if(USE_CITIZEN_DB){
          var query = new Parse.Query(pollParse);
          my_this.getParsedQuery(query,"county",county).then(function(citizenData){
            var results = [];
            for (var i = 0; i < citizenData.length; i++) { 
              results.push( convertObject(citizenData[i]));
            } 
            citizenDataAry[county] = results;
            postProcess(county);
          });
          //var query = new Parse.Query(citizenParse);
          //my_this.getParsedQuery(query,"county",county).then(function(citizenData){
          //    var results = [];
          //    for (var i = 0; i < citizenData.length; i++) { 
          //      results.push( convertObject(citizenData[i]));
          //    } 
          //    citizenDataAry[county] = results;
          //    postProcess(county);
          //});
        }
        else{
          var volQuery = new Parse.Query(volunteerParse);
          var supQuery = new Parse.Query(supplementParse);
          $q.all([my_this.getParsedQuery(volQuery,"county",county), my_this.getParsedQuery(supQuery,"county",county)]).then(function(data){
            //console.log('query_data',data[0],data[1]);
            var volunteerData = data[0];
            var supplementData = data[1];
            var results = [];
            for (var i = 0; i < volunteerData.length; i++) { 
              results.push( convertObject(volunteerData[i],'volunteer'));
            } 
            for (var i = 0; i < supplementData.length; i++) { 
              results.push( convertObject(supplementData[i],'supplement'));
            } 
            citizenDataAry[county] = results;
            postProcess(county);
          });
        }
      }
      return deferred.promise;
    };


    this.getTopkCitizen = function(county,k){
      var deferred = $q.defer();
      function sortByKey(array, key) {
          return array.sort(function(a, b) {
              var x = a[key]; var y = b[key];
              return ((x < y) ? -1 : ((x > y) ? 1 : 0));
          }).reverse();
      }
      var volQuery = new Parse.Query(volunteerParse);
      var supQuery = new Parse.Query(supplementParse);
      $q.all([my_this.getParsedQuery(volQuery,"county",county,k), my_this.getParsedQuery(supQuery,"county",county,k)]).then(function(data){
        var dataAll = [];
        //console.log('data',data);
        for(var i=0; i<data[0].length; i++){
          var objTemp = data[0][i];
          dataAll.push({fid: objTemp.get('fid'), createdAt:objTemp['createdAt'].getTime(), name: objTemp.get('name'), type:'志工'});
        }
        for(var i=0; i<data[1].length; i++){
          var objTemp = data[1][i];
          dataAll.push({fid: objTemp.get('fid'), createdAt:objTemp['createdAt'].getTime(), name: objTemp.get('name'), type:'物資'});
        }
        deferred.resolve(dataAll.slice(0,k));
      });
      
      return deferred.promise;
    }

    this.getAllVillageSum = function(county){  //dynamic
      var deferred = $q.defer();
      villageSumHttp += 1;
      console.log('villageSumHttp',villageSumHttp); 

      function postProcess(county) {
        villageSumHttp = 0;
        deferred.resolve(villageSumAry[county]);
      }
      
      setTimeout(function(){
        if(villageSumAry[county]){
          postProcess(county); }

        else{
            //$q.all([ my_this.getAllVoteStatData(county), my_this.getCitizenData(county) , $http.get('json/villageVotestat/' + county + '.json')])
            $q.all([ my_this.getAllVoteStatData(county), my_this.getCitizenData(county) , my_this.getAllVillageVotestatData(county)])
            .then(function(data){
              //console.log('calculate village sum');
              var voteStatData = data[0];
              var citizenData = data[1];
              var villageVotestatData = data[2];
              var voteStatSum = {};
              var voteStatWeight = {};

              for(var ct in voteStatData){
                for(var i=0 ; i< voteStatData[ct].length; i++){
                  voteStatWeight[voteStatData[ct][i].id] = voteStatData[ct][i].power;
                }
              } 

              if(USE_CITIZEN_DB){
                for (var i = 0; i < citizenData.length; i++) { 
                  var object = citizenData[i];
                  var vsid = object['poll'];
                  voteStatSum[vsid] = 0;
                  console.log('object volunteer',object['volunteer']);
                  console.log('votestatWeight',voteStatWeight[vsid]*my_this.volCount);
                  var vsum = (object['volunteer'] > voteStatWeight[vsid]*my_this.volCount) ? 1 : object['volunteer']/(voteStatWeight[vsid]*my_this.volCount);
                  var ssum = 0;
                  var slength = 0;
                  for(var item in my_this.supplementItem){
                    var itemNum =  object['resource'][item] ? object['resource'][item] : 0;
                    ssum += (itemNum > voteStatWeight[vsid]*my_this.supplementItem[item][0]) ? 1 : itemNum / (voteStatWeight[vsid]*my_this.supplementItem[item][0]);
                    slength += 1;
                  }
                  console.log('vsid',vsum,ssum,slength);
                  voteStatSum[vsid] = ( vsum + (ssum / slength) ) / 2;
                  //var object = citizenData[i];
                  //var vsid = object['poll'];
                  //voteStatSum[vsid] = voteStatSum[vsid] ? voteStatSum[vsid]+1 : 1;
                }
                console.log('voteStatSum',voteStatSum);
              }
              else{
                for (var i = 0; i < citizenData.length; i++) { 
                  var object = citizenData[i];
                  var vsid = object['poll'];
                  voteStatSum[vsid] = voteStatSum[vsid] ? voteStatSum[vsid]+1 : 1;
                }
                for(var id in voteStatSum){
                  voteStatSum[id] = (voteStatSum[id] > voteStatWeight[id]*my_this.volCount) ? 1 : voteStatSum[id] / (voteStatWeight[id]*my_this.volCount);
                }
              }


              var villageSum = {}; 
              for(var townName in  villageVotestatData){
                villageSum[townName] = {};
                for(var villageName in villageVotestatData[townName]){
                  var voteStatAry = villageVotestatData[townName][villageName];
                  var sum = 0;
                  for(var i=0; i< voteStatAry.length; i++){
                    if(voteStatSum[voteStatAry[i]]){
                      sum += voteStatSum[voteStatAry[i]];
                    }
                  }
                  villageSum[townName][villageName] = voteStatAry.length == 0 ? 1 : sum/voteStatAry.length;
                }
              }
              villageSumAry[county] = villageSum;
              console.log('villageSum',villageSum);
              postProcess(county);
            }); 
        }
      },MY_HTTP_DELAY*3*villageSumHttp);

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
        $q.all([my_this.getCitizenData(county), my_this.getAllVoteStatData(county)]).then(
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
                  vCount:0,
                  volunteer: 0,
                  slist: [], 
                  sItemCount: {},
                  //sItemTotal: {}, 
                  sItemSum: 0,
                  sTotalSum: 0,
                  supplement: 0, 
                  address:voteStat.address,
                  vweight:voteStat.power
                };
              } 
            }


            if(USE_CITIZEN_DB){ //TODO
              for(var i=0; i<citizenData.length; i++){
                  //voteStatInfo[id]
                var object = citizenData[i];
                var vsid = object['poll'];
                var resource = object['resource'];
                voteStatInfo[vsid].vCount = object['volunteer'];

                for(var item in my_this.supplementItem){
                  if(!voteStatInfo[vsid].sItemCount[item]){
                    voteStatInfo[vsid].sItemCount[item] = 0;
                  }
                  if(resource[item] && parseInt(resource[item]) > 0 ){
                    voteStatInfo[vsid].sItemCount[item] = parseInt(resource[item]);
                    hasitem = true;
                  }
                }
              }

              for(var id in voteStatInfo){
                var factor = voteStatInfo[id].vweight*my_this.volCount;

                voteStatInfo[id].volunteer = voteStatInfo[id].vCount > factor ? 1 : voteStatInfo[id].vCount/factor;

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
                voteStatInfo[id].sItemSum = itemSum;
                voteStatInfo[id].sTotalSum = totalSum;
                voteStatInfo[id].supplement = itemSum > totalSum ? 1 : itemSum/totalSum;
              }
            }
            else{
              //console.log('voteStatInfo',voteStatInfo);
              for(var i=0; i<citizenData.length; i++){
                var object = citizenData[i];
                var vsid = object['poll'];
                //console.log('vsid',vsid);
                if(voteStatInfo[vsid]){
                  if(object['volunteer']){
                    voteStatInfo[vsid].vlist.push([object['fid'],object['name']]);
                  }
                  var hasitem = false;
                  var resource = object['resource'];
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
                    voteStatInfo[vsid].slist.push([object['fid'],object['name']]);
                  }
                }
              }
              for(var id in voteStatInfo){
                var factor = voteStatInfo[id].vweight*my_this.volCount;
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

                voteStatInfo[id].sItemSum = itemSum;
                voteStatInfo[id].sTotalSum = totalSum;
                voteStatInfo[id].supplement = itemSum > totalSum ? 1 : itemSum/totalSum;
              }
            }

            voteStatInfoAry[county] = voteStatInfo;
            postProcess(county);
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
            deferred.notify({villageArea: villageArea[vakey], villageSum:mvillsum, loadingStatus:count/countAll, county:county});
            //console.log('postProcess',townName,villageName);
            if(count == countAll){
              deferred.resolve( { complete:true , loadingStatus:count/countAll, county:county});
              //console.log("complete");
            }
          },my_this.MAP_BUFFER_TIME*countTemp);
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
              var query = 'json/twVillage2010/' + county + '/' + townName + '/' + villageName + '.json';

              $http.get(query).success(function(data) {
                villageArea[vakey] = data;
                postProcess(vakey, townName, villageName);
              }).error( function(err) {
                villageArea[vakey] = {};
                console.log('loading failed',townName,villageName);        
                postProcess(vakey, townName, villageName);
              });

            }

          });
        });
      });
      return deferred.promise;
    };
    
    this.saveCitizen = function(data, cb){
      console.log('data',JSON.stringify(data));
      if(USE_CITIZEN_DB){
        var czparse = new citizenParse();
        czparse
          .save(data)
          .then(function(object) {
            cb()
          });
      }
      else{
        if(data.volunteer){
          delete data.volunteer;
          delete data.resource;
          var mparse = new volunteerParse();
          mparse.save(data)
            .then(function(object) {
              cb()
            });
        }
        else{
          delete data.volunteer;
          var mparse = new supplementParse();
          mparse.save(data)
            .then(function(object) {
              cb()
            });
        }
      }
    };

    this.queryCitizen = function(fid,type){
      var deferred = $q.defer();
      if(USE_CITIZEN_DB){
        deferred.resolve(false);
      }
      else{
        var query = null;
        if(type == 'volunteer'){ 
          query = new Parse.Query(volunteerParse);
        }
        else if(type == 'supplement'){
          query = new Parse.Query(supplementParse);
        }
        my_this.getParsedQuery(query,"fid",fid).then(function(result){
          if(result.length > 0){
            deferred.resolve(true);
          }
          else{
            deferred.resolve(false);
          }
        });
      }
      return deferred.promise;
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
